/**
 * useRoutePreloader.js — Prefetch route chunks on idle
 * ─────────────────────────────────────────────────────────────────────────────
 * After the app loads and the user is idle, preloads the most likely next
 * pages so navigation feels instant.
 *
 * Strategy:
 *   1. Immediately preload: login page (many WhatsApp link → login flows)
 *   2. After 2s idle:       dashboard + patients (most visited doctor pages)
 *   3. On hover:            individual page chunk (via preloadRoute)
 *
 * Uses requestIdleCallback when available, falls back to setTimeout.
 *
 * Usage:
 *   // In App.jsx or main.jsx — call once
 *   useRoutePreloader()
 */

import { useEffect } from 'react'
import { preloadRoute } from './lazyComponents'

function idle(cb, delay = 2000) {
  if ('requestIdleCallback' in window) {
    const id = requestIdleCallback(cb, { timeout: delay + 1000 })
    return () => cancelIdleCallback(id)
  }
  const id = setTimeout(cb, delay)
  return () => clearTimeout(id)
}

export function useRoutePreloader() {
  useEffect(() => {
    // Phase 1: Immediate (login is on the critical path for WhatsApp flows)
    preloadRoute('LoginPage')

    // Phase 2: Idle — doctor dashboard is the post-login destination
    const cancel = idle(() => {
      preloadRoute('doctor/DashboardPage')
      preloadRoute('doctor/PatientsPage')
      preloadRoute('portal/PatientPortalPage')
    }, 2000)

    return cancel
  }, []) // run once on mount
}

export default useRoutePreloader
