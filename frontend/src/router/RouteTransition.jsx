/**
 * RouteTransition.jsx — Page-level fade transition
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps the route content in a lightweight CSS fade so navigating between
 * pages feels smooth without a jarring instant swap.
 *
 * Uses CSS transitions only (no framer-motion dependency) so it works
 * even while framer-motion is loading.
 *
 * The key prop (location.pathname) triggers React to unmount/remount the
 * child wrapper on each navigation, restarting the CSS animation.
 *
 * Patient portal pages use a softer, slower fade (300ms → 500ms) since
 * patients are often on slower connections.
 */

import { useRef, useEffect, useCallback } from 'react'
import { useLocation }                    from 'react-router-dom'

const TRANSITION_MS    = 200   // doctor portal — fast
const PORTAL_TRANS_MS  = 300   // patient portal — a bit slower

export default function RouteTransition({ children }) {
  const { pathname } = useLocation()
  const ref          = useRef(null)
  const isPortal     = pathname.startsWith('/portal/')
  const duration     = isPortal ? PORTAL_TRANS_MS : TRANSITION_MS

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Reset then trigger animation
    el.style.opacity   = '0'
    el.style.transform = 'translateY(4px)'

    const raf = requestAnimationFrame(() => {
      el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`
      el.style.opacity    = '1'
      el.style.transform  = 'translateY(0)'
    })

    return () => cancelAnimationFrame(raf)
  }, [pathname, duration])

  return (
    <div
      ref={ref}
      style={{ opacity: 0, transform: 'translateY(4px)', willChange: 'opacity, transform' }}
    >
      {children}
    </div>
  )
}
