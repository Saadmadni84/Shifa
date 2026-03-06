/**
 * ScrollRestoration.jsx — Restores scroll position on navigation
 * ─────────────────────────────────────────────────────────────────────────────
 * Behaviour:
 *   • Forward navigation (new URL) → scroll to top
 *   • Browser back/forward         → restore saved scroll position
 *   • Hash navigation (#section)   → scroll to element
 *   • Modal open/close             → no scroll change (location state: noScroll)
 *
 * Works by saving scroll Y per-key in a Map. React Router's location.key
 * is unique per history entry, so back/forward restores correctly.
 *
 * This is a renderless component — returns null, only uses effects.
 */

import { useEffect, useRef } from 'react'
import { useLocation }       from 'react-router-dom'

// In-memory map:  location.key → scrollY
const scrollPositions = new Map()

export default function ScrollRestoration() {
  const location = useLocation()
  const prevKey  = useRef(null)

  useEffect(() => {
    // 1. Save current scroll position for the key we're leaving
    if (prevKey.current) {
      scrollPositions.set(prevKey.current, window.scrollY)
    }

    // 2. Skip scroll change if the page asked for it (modal open/close)
    if (location.state?.noScroll) {
      prevKey.current = location.key
      return
    }

    // 3. Hash navigation → scroll to the element
    if (location.hash) {
      const el = document.querySelector(location.hash)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
        prevKey.current = location.key
        return
      }
    }

    // 4. Back/forward navigation → restore saved position
    if (scrollPositions.has(location.key)) {
      const savedY = scrollPositions.get(location.key)
      // Use rAF so the page content has rendered before we scroll
      requestAnimationFrame(() => {
        window.scrollTo({ top: savedY, behavior: 'instant' })
      })
      prevKey.current = location.key
      return
    }

    // 5. New forward navigation → scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' })
    prevKey.current = location.key
  }, [location.key, location.hash, location.pathname])

  return null
}
