/**
 * useVoiceInput.js — Shifa Voice / Dictation Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Powers the doctor note dictation feature.
 * Two modes:
 *   1. Browser SpeechRecognition API (zero latency, no network for short phrases)
 *   2. MediaRecorder → upload blob → backend Whisper API (accurate, long-form)
 *
 * Auto-selects: tries native SpeechRecognition first (en-IN locale),
 * falls back to Whisper upload if unavailable or if recording > 10 s.
 *
 * The hook appends recognised text to the `transcript` string.
 * Parent binds `transcript` to the notes textarea.
 *
 * Usage:
 *   const { transcript, isListening, startListening, stopListening, clearTranscript } = useVoiceInput()
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { visitsApi } from '@/api/visits'
import toast from 'react-hot-toast'

const WHISPER_THRESHOLD_S = 10     // switch to Whisper after this many seconds
const MAX_RECORDING_S = 300    // 5 min hard cap
const MIME_PREFERENCE = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4']

function getSupportedMime() {
    return MIME_PREFERENCE.find(m => MediaRecorder.isTypeSupported(m)) ?? ''
}

export function useVoiceInput({ onTranscript, language = 'hi-IN' } = {}) {
    const [isListening, setIsListening] = useState(false)
    const [isTranscribing, setIsTranscribing] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [error, setError] = useState(null)
    const [duration, setDuration] = useState(0)   // seconds recording

    const recognitionRef = useRef(null)
    const mediaRecRef = useRef(null)
    const chunksRef = useRef([])
    const timerRef = useRef(null)
    const streamRef = useRef(null)

    // ─── Browser SpeechRecognition availability ───────────────────────────────
    const SpeechRecognition =
        typeof window !== 'undefined' &&
        (window.SpeechRecognition || window.webkitSpeechRecognition)

    const useNativeSR = !!SpeechRecognition

    // ─── Append to transcript ─────────────────────────────────────────────────
    const append = useCallback((text) => {
        const trimmed = text.trim()
        if (!trimmed) return
        setTranscript(prev => {
            const updated = prev ? `${prev} ${trimmed}` : trimmed
            onTranscript?.(updated)
            return updated
        })
    }, [onTranscript])

    // ═══════════════════════════════════════════════════════════════════════════
    // PATH A: Native SpeechRecognition
    // ═══════════════════════════════════════════════════════════════════════════
    const startNativeSR = useCallback(() => {
        const SR = new SpeechRecognition()
        SR.lang = language      // 'hi-IN', 'ta-IN', 'en-IN', etc.
        SR.interimResults = true
        SR.continuous = true
        SR.maxAlternatives = 1

        let interimText = ''

        SR.onstart = () => setIsListening(true)

        SR.onresult = (e) => {
            let final = ''
            interimText = ''
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const result = e.results[i]
                if (result.isFinal) {
                    final += result[0].transcript
                } else {
                    interimText += result[0].transcript
                }
            }
            if (final) append(final)
        }

        SR.onerror = (e) => {
            const msg = e.error === 'not-allowed'
                ? 'Microphone access denied. Please allow microphone permission.'
                : `Voice recognition error: ${e.error}`
            setError(msg)
            toast.error(msg)
            setIsListening(false)
        }

        SR.onend = () => {
            // Restart if we're still supposed to be listening (auto-restart on pause)
            if (isListening) {
                try { SR.start() } catch { /* already started */ }
            }
        }

        recognitionRef.current = SR
        SR.start()
    }, [SpeechRecognition, language, append, isListening])

    const stopNativeSR = useCallback(() => {
        recognitionRef.current?.stop()
        recognitionRef.current = null
        setIsListening(false)
    }, [])

    // ═══════════════════════════════════════════════════════════════════════════
    // PATH B: MediaRecorder → Whisper (fallback / long-form)
    // ═══════════════════════════════════════════════════════════════════════════
    const startWhisperRecording = useCallback(async () => {
        setError(null)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16_000,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            })
            streamRef.current = stream

            const mimeType = getSupportedMime()
            const mr = new MediaRecorder(stream, { mimeType })
            mediaRecRef.current = mr
            chunksRef.current = []

            mr.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }

            mr.start(1_000)   // collect chunks every 1 s
            setIsListening(true)

            // Timer
            let secs = 0
            timerRef.current = setInterval(() => {
                secs += 1
                setDuration(secs)
                if (secs >= MAX_RECORDING_S) stopWhisperRecording()
            }, 1_000)

        } catch (err) {
            const msg = err.name === 'NotAllowedError'
                ? 'Microphone permission denied.'
                : `Could not start recording: ${err.message}`
            setError(msg)
            toast.error(msg)
        }
    }, []) // stopWhisperRecording added below

    const stopWhisperRecording = useCallback(async () => {
        clearInterval(timerRef.current)
        setDuration(0)
        setIsListening(false)

        const mr = mediaRecRef.current
        if (!mr || mr.state === 'inactive') return

        return new Promise((resolve) => {
            mr.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' })
                chunksRef.current = []

                // Stop microphone track
                streamRef.current?.getTracks().forEach(t => t.stop())
                streamRef.current = null

                if (blob.size === 0) return resolve()

                setIsTranscribing(true)
                try {
                    const formData = new FormData()
                    formData.append('audio', blob, 'recording.webm')
                    formData.append('language', language.split('-')[0])

                    const { data } = await visitsApi.transcribeAudio(formData)
                    const text = data?.data?.transcript ?? ''
                    if (text) append(text)
                } catch (err) {
                    toast.error(`Transcription failed: ${err.message}`)
                } finally {
                    setIsTranscribing(false)
                    resolve()
                }
            }
            mr.stop()
        })
    }, [language, append])

    // ─── Public API ───────────────────────────────────────────────────────────
    const startListening = useCallback(() => {
        if (isListening) return
        setError(null)
        if (useNativeSR) {
            startNativeSR()
        } else {
            startWhisperRecording()
        }
    }, [isListening, useNativeSR, startNativeSR, startWhisperRecording])

    const stopListening = useCallback(() => {
        if (useNativeSR) {
            stopNativeSR()
        } else {
            stopWhisperRecording()
        }
    }, [useNativeSR, stopNativeSR, stopWhisperRecording])

    const clearTranscript = useCallback(() => {
        setTranscript('')
        onTranscript?.('')
    }, [onTranscript])

    // ─── Cleanup ──────────────────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            recognitionRef.current?.stop()
            mediaRecRef.current?.state !== 'inactive' && mediaRecRef.current?.stop()
            streamRef.current?.getTracks().forEach(t => t.stop())
            clearInterval(timerRef.current)
        }
    }, [])

    return {
        transcript,
        isListening,
        isTranscribing,
        duration,        // seconds — show in UI timer
        error,
        isWhisperMode: !useNativeSR,

        startListening,
        stopListening,
        clearTranscript,
    }
}
