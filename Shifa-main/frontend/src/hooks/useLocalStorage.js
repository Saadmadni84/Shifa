/**
 * useLocalStorage.js — Typed, Reactive localStorage Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Drop-in replacement for useState that persists to localStorage.
 * Features:
 *   • JSON serialisation / deserialisation
 *   • TypeScript-friendly (JSDoc typed)
 *   • Cross-tab sync via StorageEvent listener
 *   • Safe defaults when key doesn't exist or JSON is corrupt
 *   • Optional expiry (TTL in ms)
 *
 * Usage:
 *   const [lang, setLang] = useLocalStorage('shifa_lang', 'hi')
 *   const [draft, setDraft, clearDraft] = useLocalStorage('draft', {}, { ttl: 300_000 })
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback, useEffect } from 'react'

/**
 * @template T
 * @param {string} key
 * @param {T} defaultValue
 * @param {{ ttl?: number }} [options]
 * @returns {[T, (val: T | ((prev: T) => T)) => void, () => void]}
 */
export function useLocalStorage(key, defaultValue, options = {}) {
    const { ttl } = options

    // ─── Read initial value ───────────────────────────────────────────────────
    const readStorage = useCallback(() => {
        try {
            const raw = localStorage.getItem(key)
            if (raw === null) return defaultValue

            const parsed = JSON.parse(raw)

            // TTL check
            if (ttl && parsed?.__expires && Date.now() > parsed.__expires) {
                localStorage.removeItem(key)
                return defaultValue
            }

            return ttl ? parsed.__value : parsed
        } catch {
            return defaultValue
        }
    }, [key, defaultValue, ttl])

    const [storedValue, setStoredValue] = useState(readStorage)

    // ─── Write ────────────────────────────────────────────────────────────────
    const setValue = useCallback((valueOrUpdater) => {
        setStoredValue(prev => {
            const next = typeof valueOrUpdater === 'function'
                ? valueOrUpdater(prev)
                : valueOrUpdater

            try {
                const toStore = ttl
                    ? { __value: next, __expires: Date.now() + ttl }
                    : next
                localStorage.setItem(key, JSON.stringify(toStore))
            } catch {
                // Storage quota exceeded — silently ignore
            }

            return next
        })
    }, [key, ttl])

    // ─── Clear ────────────────────────────────────────────────────────────────
    const clearValue = useCallback(() => {
        localStorage.removeItem(key)
        setStoredValue(defaultValue)
    }, [key, defaultValue])

    // ─── Cross-tab sync ───────────────────────────────────────────────────────
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key !== key) return
            setStoredValue(readStorage())
        }
        window.addEventListener('storage', onStorage)
        return () => window.removeEventListener('storage', onStorage)
    }, [key, readStorage])

    return [storedValue, setValue, clearValue]
}
