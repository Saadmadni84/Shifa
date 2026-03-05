/**
 * useWebSocket.js — Shifa WebSocket Hook (Spring STOMP)
 * ─────────────────────────────────────────────────────────────────────────────
 * Connects to the Spring Boot WebSocket endpoint (/ws) using SockJS + STOMP.
 * Used for real-time updates:
 *   • AI processing status changes (PROCESSING → COMPLETED)
 *   • WhatsApp delivery confirmations
 *   • Patient portal read receipts
 *   • Doctor dashboard live stats updates
 *
 * Features:
 *   • Auto-reconnect with exponential back-off (1s, 2s, 4s, 8s, max 30s)
 *   • Topic subscription management (subscribe/unsubscribe dynamically)
 *   • Heartbeat (25s/25s per STOMP spec)
 *   • JWT auth header on connect
 *   • Falls back gracefully when WS is unavailable (just no live updates)
 *
 * Usage:
 *   const { subscribe, isConnected } = useWebSocket()
 *   useEffect(() => {
 *     const unsub = subscribe(`/topic/visits/${visitId}`, (msg) => {
 *       // msg is the parsed JSON payload
 *       qc.invalidateQueries({ queryKey: ['visit', visitId] })
 *     })
 *     return unsub
 *   }, [visitId])
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { tokenStore } from '@/api/client'

const WS_URL = import.meta.env.VITE_WS_URL || '/ws'
const HEARTBEAT_MS = 25_000
const MAX_BACKOFF_MS = 30_000

let stompClient = null   // singleton — shared across hook instances in same app

export function useWebSocket() {
    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const backoffRef = useRef(1_000)
    const subscriptionsRef = useRef(new Map())   // topic → STOMP subscription
    const pendingSubsRef = useRef(new Map())   // topic → callback (queued pre-connect)
    const reconnectTimer = useRef(null)
    const mountedRef = useRef(true)

    // ─── Connect ──────────────────────────────────────────────────────────────
    const connect = useCallback(async () => {
        if (isConnecting || isConnected) return

        // Dynamic import — SockJS/STOMP are large; only load when needed
        const [{ default: SockJS }, { Client }] = await Promise.all([
            import('sockjs-client'),
            import('@stomp/stompjs'),
        ])

        setIsConnecting(true)

        const client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            connectHeaders: { Authorization: `Bearer ${tokenStore.getAccess() ?? ''}` },
            heartbeatIncoming: HEARTBEAT_MS,
            heartbeatOutgoing: HEARTBEAT_MS,
            reconnectDelay: 0,   // we handle reconnect manually

            onConnect: () => {
                if (!mountedRef.current) return
                stompClient = client
                backoffRef.current = 1_000
                setIsConnected(true)
                setIsConnecting(false)

                // Re-subscribe all pending / existing topics
                pendingSubsRef.current.forEach((callback, topic) => {
                    const sub = client.subscribe(topic, (frame) => {
                        try { callback(JSON.parse(frame.body)) } catch { callback(frame.body) }
                    })
                    subscriptionsRef.current.set(topic, sub)
                })
                pendingSubsRef.current.clear()
            },

            onDisconnect: () => {
                if (!mountedRef.current) return
                setIsConnected(false)
                scheduleReconnect()
            },

            onStompError: (frame) => {
                console.warn('[Shifa WS] STOMP error:', frame.headers?.message)
                setIsConnecting(false)
                scheduleReconnect()
            },
        })

        client.activate()
    }, [isConnected, isConnecting])

    // ─── Reconnect with back-off ──────────────────────────────────────────────
    const scheduleReconnect = useCallback(() => {
        clearTimeout(reconnectTimer.current)
        const delay = Math.min(backoffRef.current, MAX_BACKOFF_MS)
        backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS)

        reconnectTimer.current = setTimeout(() => {
            if (mountedRef.current) connect()
        }, delay)
    }, [connect])

    // ─── Subscribe to a topic ─────────────────────────────────────────────────
    const subscribe = useCallback((topic, callback) => {
        if (stompClient?.connected) {
            const sub = stompClient.subscribe(topic, (frame) => {
                try { callback(JSON.parse(frame.body)) } catch { callback(frame.body) }
            })
            subscriptionsRef.current.set(topic, sub)
        } else {
            // Queue until connected
            pendingSubsRef.current.set(topic, callback)
        }

        // Return unsubscribe function
        return () => {
            const sub = subscriptionsRef.current.get(topic)
            sub?.unsubscribe()
            subscriptionsRef.current.delete(topic)
            pendingSubsRef.current.delete(topic)
        }
    }, [])

    // ─── Send a message to a destination ─────────────────────────────────────
    const send = useCallback((destination, body) => {
        if (stompClient?.connected) {
            stompClient.publish({
                destination,
                body: JSON.stringify(body),
            })
        }
    }, [])

    // ─── Lifecycle ────────────────────────────────────────────────────────────
    useEffect(() => {
        mountedRef.current = true
        connect()

        return () => {
            mountedRef.current = false
            clearTimeout(reconnectTimer.current)
            // Don't disconnect — other hook instances may still be active.
            // The singleton stompClient persists for the app lifetime.
        }
    }, [connect])

    return {
        isConnected,
        isConnecting,
        subscribe,
        send,
    }
}
