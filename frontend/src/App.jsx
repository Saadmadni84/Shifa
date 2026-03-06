/**
 * App.jsx — Shifa Root Component
 * -------------------------------------------------------------------------
 * Responsibilities:
 *   1. Define ALL application routes (doctor + patient + public)
 *   2. Lazy-load every page (code-split by route)
 *   3. Apply global session-expiry redirect
 *   4. Apply language / theme hydration from persisted stores
 *   5. Render page-level loading fallback (Suspense)
 *
 * Route map:
 *   PUBLIC (no auth)
 *     /                         ? LandingPage
 *     /login                    ? LoginPage
 *     /register                 ? RegisterPage
 *     /portal/:token            ? PatientPortalPage   ? WhatsApp link target
 *     /portal/:token/chat       ? PatientChatPage
 *
 *   DOCTOR (role = DOCTOR)
 *     /doctor/dashboard         ? DashboardPage
 *     /doctor/visits/new        ? NewVisitPage
 *     /doctor/visits/:id        ? VisitDetailPage
 *     /doctor/patients          ? PatientsPage
 *     /doctor/patients/:id      ? PatientDetailPage
 *     /doctor/profile           ? ProfilePage
 *
 *   FALLBACK
 *     *                         ? NotFoundPage
 * -------------------------------------------------------------------------
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppRouter from '@/router'

import { useLanguageStore, useUiStore } from '@/store'

// --- App Component --------------------------------------------------------
export default function App() {
  const navigate      = useNavigate()
  const { uiLanguage, setUiLanguage } = useLanguageStore()
  const { theme }     = useUiStore()

  // -- 1. Hydrate theme on mount ------------------------------------------
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // -- 2. Hydrate language / font direction on mount ---------------------
  useEffect(() => {
    // This re-runs the DOM side-effects (data-language, data-script, dir)
    // that were set in the store's onRehydrateStorage — safe to call twice.
    setUiLanguage(uiLanguage)
  }, []) // eslint-disable-line

  // -- 3. Listen for global session expiry ? redirect to /login ----------
  useEffect(() => {
    const handleExpiry = () => {
      navigate('/login', { replace: true, state: { sessionExpired: true } })
    }
    window.addEventListener('shifa:session-expired', handleExpiry)
    return () => window.removeEventListener('shifa:session-expired', handleExpiry)
  }, [navigate])

  return <AppRouter />
}
