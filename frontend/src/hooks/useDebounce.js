/**
 * useDebounce.js — Generic Debounce Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns a debounced version of `value` that only updates after
 * `delay` ms of inactivity.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchInput, 350)
 *   // Use debouncedSearch as the query key — API calls fire only when typing stops
 *
 * Also exports useDebouncedCallback for debouncing functions (e.g. save handlers).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef } from 'react'

// ─── Value debounce ───────────────────────────────────────────────────────────
export function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => clearTimeout(timer)
    }, [value, delay])

    return debouncedValue
}

// ─── Function debounce ────────────────────────────────────────────────────────
// Returns a stable debounced callback.
// Cleanup fires automatically when the component unmounts.
export function useDebouncedCallback(callback, delay = 300, deps = []) {
    const timerRef = useRef(null)

    const debounced = useCallback((...args) => {
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
            callback(...args)
        }, delay)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [delay, ...deps])

    // Cancel on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [])

    return debounced
}
