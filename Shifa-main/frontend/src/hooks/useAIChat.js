/**
 * useAIChat.js — Shifa Patient AI Chat Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Powers the patient follow-up Q&A panel.
 *
 * Features:
 *   • Sends message to /public/visits/{token}/ask
 *   • Streams the AI response token-by-token via SSE (EventSource)
 *   • Maintains full local message history (no persistence required)
 *   • Handles reconnection on dropped SSE connections
 *   • Auto-scrolls chat to bottom on each new token
 *   • Context: visitToken (public, no auth) OR visitId (doctor, with auth)
 *
 * The backend assembles full context: visit notes + patient profile + AI memory.
 * This hook is stateless from the server's perspective — client manages history.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { publicApi } from '@/api/public'
import { visitsApi } from '@/api/visits'
import { tokenStore } from '@/api/client'

const STREAM_TIMEOUT_MS = 45_000   // 45 s max for one AI response

// ─── Message shape ────────────────────────────────────────────────────────────
// { id, role: 'user'|'assistant', content, timestamp, isStreaming, error }

export function useAIChat({ visitToken, visitId, language = 'en' } = {}) {
  const [messages,      setMessages]      = useState([])
  const [input,         setInput]         = useState('')
  const [isStreaming,   setIsStreaming]    = useState(false)
  const [streamError,   setStreamError]   = useState(null)
  const [isConnected,   setIsConnected]   = useState(true)

  const esRef           = useRef(null)      // EventSource handle
  const scrollTargetRef = useRef(null)      // bottom sentinel ref — assign in component
  const timeoutRef      = useRef(null)

  // ─── Scroll to bottom helper ──────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    scrollTargetRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // ─── Cleanup SSE on unmount ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      esRef.current?.close()
      clearTimeout(timeoutRef.current)
    }
  }, [])

  // ─── Append a token to the last assistant message ─────────────────────────
  const appendToken = useCallback((token) => {
    setMessages(prev => {
      const updated = [...prev]
      const last    = updated[updated.length - 1]
      if (last?.role === 'assistant' && last?.isStreaming) {
        updated[updated.length - 1] = { ...last, content: last.content + token }
      }
      return updated
    })
    scrollToBottom()
  }, [scrollToBottom])

  // ─── Mark last assistant message as done ──────────────────────────────────
  const finalizeStream = useCallback((error = null) => {
    setMessages(prev => {
      const updated = [...prev]
      const last    = updated[updated.length - 1]
      if (last?.role === 'assistant') {
        updated[updated.length - 1] = {
          ...last,
          isStreaming: false,
          error,
        }
      }
      return updated
    })
    setIsStreaming(false)
    clearTimeout(timeoutRef.current)
  }, [])

  // ─── Open SSE stream ──────────────────────────────────────────────────────
  const openStream = useCallback((streamUrl) => {
    esRef.current?.close()

    const headers = {}
    const token   = tokenStore.getAccess()
    if (token) headers.Authorization = `Bearer ${token}`

    // EventSource doesn't support custom headers natively.
    // The backend must accept the token as a query param for public portal,
    // or use cookie auth for doctor portal.
    const es = new EventSource(streamUrl, { withCredentials: true })
    esRef.current = es

    // Safety timeout — if stream hangs
    timeoutRef.current = setTimeout(() => {
      es.close()
      finalizeStream('Response timed out. Please try again.')
      setStreamError('AI response timed out.')
    }, STREAM_TIMEOUT_MS)

    es.onopen = () => setIsConnected(true)

    es.addEventListener('token', (evt) => {
      try {
        const { text } = JSON.parse(evt.data)
        appendToken(text)
      } catch {
        appendToken(evt.data)
      }
    })

    es.addEventListener('done', () => {
      es.close()
      finalizeStream()
      clearTimeout(timeoutRef.current)
    })

    es.addEventListener('error_event', (evt) => {
      let msg = 'AI could not answer this question.'
      try { msg = JSON.parse(evt.data).message ?? msg } catch { /* ignore */ }
      es.close()
      finalizeStream(msg)
      setStreamError(msg)
    })

    es.onerror = () => {
      setIsConnected(false)
      es.close()
      finalizeStream('Connection lost. Please try again.')
    }
  }, [appendToken, finalizeStream])

  // ─── Send message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const trimmed = text?.trim() ?? input.trim()
    if (!trimmed || isStreaming) return

    setStreamError(null)

    // 1. Append user message
    const userMsg = {
      id:        `user-${Date.now()}`,
      role:      'user',
      content:   trimmed,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    scrollToBottom()

    // 2. Append empty streaming assistant message
    const assistantMsg = {
      id:          `ai-${Date.now()}`,
      role:        'assistant',
      content:     '',
      timestamp:   new Date().toISOString(),
      isStreaming: true,
      error:       null,
    }
    setMessages(prev => [...prev, assistantMsg])
    setIsStreaming(true)

    // 3. POST the message — backend returns a streamId or directly streams
    try {
      let streamUrl

      if (visitToken) {
        // Patient portal (public, no auth)
        const res = await publicApi.askQuestion(visitToken, {
          question: trimmed,
          language,
          history:  buildHistory(messages),
        })
        streamUrl = res.data?.data?.streamUrl
      } else if (visitId) {
        // Doctor portal (auth required)
        const res = await visitsApi.chat(visitId, {
          message: trimmed,
          history: buildHistory(messages),
        })
        streamUrl = res.data?.data?.streamUrl
      } else {
        throw new Error('No visitToken or visitId provided to useAIChat.')
      }

      if (streamUrl) {
        openStream(streamUrl)
      } else {
        // Fallback: non-streaming response (backend may send full content in POST response)
        finalizeStream()
      }
    } catch (err) {
      finalizeStream(err.message)
      setStreamError(err.message)
    }
  }, [input, isStreaming, visitToken, visitId, language, messages, scrollToBottom, openStream, finalizeStream])

  // ─── Build condensed history for context ─────────────────────────────────
  function buildHistory(msgs) {
    return msgs
      .filter(m => !m.isStreaming && !m.error)
      .slice(-10)   // last 10 exchanges max
      .map(m => ({ role: m.role, content: m.content }))
  }

  // ─── Clear chat ───────────────────────────────────────────────────────────
  const clearChat = useCallback(() => {
    esRef.current?.close()
    clearTimeout(timeoutRef.current)
    setMessages([])
    setStreamError(null)
    setIsStreaming(false)
  }, [])

  return {
    messages,
    input,
    isStreaming,
    isConnected,
    streamError,
    scrollTargetRef,   // assign to <div ref={scrollTargetRef} /> at bottom of chat

    setInput,
    sendMessage,
    clearChat,
  }
}
