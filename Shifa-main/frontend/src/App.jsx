
/**
 * App.jsx — Shifa Root Component
 * ─────────────────────────────────────────────────────────────────────────
 * Responsibilities:
 *   1. Define ALL application routes (doctor + patient + public)
 *   2. Lazy-load every page (code-split by route)
 *   3. Apply global session-expiry redirect
 *   4. Apply language / theme hydration from persisted stores
 *   5. Render page-level loading fallback (Suspense)
 *
 * Route map:
 *   PUBLIC (no auth)
 *     /                         → LandingPage
 *     /login                    → LoginPage
 *     /register                 → RegisterPage
 *     /portal/:token            → PatientPortalPage   ← WhatsApp link target
 *     /portal/:token/chat       → PatientChatPage
 *
 *   DOCTOR (role = DOCTOR)
 *     /doctor/dashboard         → DashboardPage
 *     /doctor/visits/new        → NewVisitPage
 *     /doctor/visits/:id        → VisitDetailPage
 *     /doctor/patients          → PatientsPage
 *     /doctor/patients/:id      → PatientDetailPage
 *     /doctor/profile           → ProfilePage
 *
 *   FALLBACK
 *     *                         → NotFoundPage
 * ─────────────────────────────────────────────────────────────────────────
 */

import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'

import { ProtectedRoute }  from '@/components/common/ProtectedRoute'
import { PageLoader }      from '@/components/ui/Spinner'
import { useAuthStore, useLanguageStore, useUiStore } from '@/store'


// ─── Lazy Page Imports ────────────────────────────────────────────────────
// Each route is a separate chunk — only loads when navigated to.

// Public
const LandingPage      = lazy(() => import('@/pages/LandingPage'))
const LoginPage        = lazy(() => import('@/pages/LoginPage'))
const RegisterPage     = lazy(() => import('@/pages/RegisterPage'))

// Patient portal — publicly accessible via WhatsApp token link
const PatientPortalPage = lazy(() => import('@/pages/portal/PatientPortalPage'))
const PatientChatPage   = lazy(() => import('@/pages/portal/PatientChatPage'))

// Doctor portal — requires DOCTOR role
const DashboardPage     = lazy(() => import('@/pages/doctor/DashboardPage'))
const NewVisitPage      = lazy(() => import('@/pages/doctor/NewVisitPage'))
const VisitDetailPage   = lazy(() => import('@/pages/doctor/VisitDetailPage'))
const PatientsPage      = lazy(() => import('@/pages/doctor/PatientsPage'))
const PatientDetailPage = lazy(() => import('@/pages/doctor/PatientDetailPage'))
const ProfilePage       = lazy(() => import('@/pages/doctor/ProfilePage'))

// 404
const NotFoundPage      = lazy(() => import('@/pages/NotFoundPage'))


// ─── Suspense Fallback ────────────────────────────────────────────────────
/**
 * Shown while a lazy page chunk is loading.
 * Uses the same full-screen spinner as the app splash.
 */
function PageFallback() {
  return (
    <div className="min-h-screen-safe flex items-center justify-center bg-[var(--color-bg)]">
      <PageLoader />
    </div>
  )
}


// ─── App Component ────────────────────────────────────────────────────────
export default function App() {
  const navigate      = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { uiLanguage, setUiLanguage } = useLanguageStore()
  const { theme }     = useUiStore()

  // ── 1. Hydrate theme on mount ──────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // ── 2. Hydrate language / font direction on mount ─────────────────────
  useEffect(() => {
    // This re-runs the DOM side-effects (data-language, data-script, dir)
    // that were set in the store's onRehydrateStorage — safe to call twice.
    setUiLanguage(uiLanguage)
  }, []) // eslint-disable-line

  // ── 3. Listen for global session expiry → redirect to /login ──────────
  useEffect(() => {
    const handleExpiry = () => {
      navigate('/login', { replace: true, state: { sessionExpired: true } })
    }
    window.addEventListener('shifa:session-expired', handleExpiry)
    return () => window.removeEventListener('shifa:session-expired', handleExpiry)
  }, [navigate])

  // ── 4. Smart home redirect ─────────────────────────────────────────────
  // If logged-in user lands on '/', bounce them to their dashboard.
  // (LandingPage handles this too, but belt-and-suspenders.)
  const HomeRedirect = () => {
    if (!isAuthenticated()) return <LandingPage />
    if (user?.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />
    return <Navigate to="/login" replace />
  }

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>

        {/* ── Public routes ──────────────────────────────────────────── */}
        <Route path="/"         element={<HomeRedirect />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Patient portal — public, token-based, NO auth required ─── */}
        {/*
          Patients get a WhatsApp message like:
          "Your visit summary is ready 👉 https://shifa.health/portal/abc123"
          They tap the link and see their summary — no login, no app download.
        */}
        <Route path="/portal/:token"       element={<PatientPortalPage />} />
        <Route path="/portal/:token/chat"  element={<PatientChatPage />} />

        {/* ── Doctor routes — requires DOCTOR role ──────────────────── */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute requiredRole="DOCTOR">
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/visits/new"
          element={
            <ProtectedRoute requiredRole="DOCTOR">
              <NewVisitPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/visits/:id"
          element={
            <ProtectedRoute requiredRole="DOCTOR">
              <VisitDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients"
          element={
            <ProtectedRoute requiredRole="DOCTOR">
              <PatientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients/:id"
          element={
            <ProtectedRoute requiredRole="DOCTOR">
              <PatientDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/profile"
          element={
            <ProtectedRoute requiredRole="DOCTOR">
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* ── Convenience redirects ─────────────────────────────────── */}
        {/* /doctor → /doctor/dashboard */}
        <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />

        {/* ── 404 ──────────────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Suspense>
  )
}
