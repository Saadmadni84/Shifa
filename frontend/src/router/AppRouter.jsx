/**
 * AppRouter.jsx — Shifa React Router v6 Tree
 * ─────────────────────────────────────────────────────────────────────────────
 * Builds the full <Routes> tree from the route definitions in routes.js.
 * All pages are lazy-loaded. Scroll is restored on every navigation.
 * Page <title> is updated on every route change.
 * Session expiry events redirect to /login with a state flag.
 *
 * Layout hierarchy:
 *   BrowserRouter (main.jsx)
 *     └─ AppRouter
 *          ├─ ScrollRestoration
 *          ├─ PageTitleManager
 *          ├─ SessionExpiryGuard
 *          └─ Routes
 *               ├─ /                     PublicLayout → LandingPage
 *               ├─ /login                PublicLayout → LoginPage
 *               ├─ /register             PublicLayout → RegisterPage
 *               ├─ /portal/:token        PatientLayout → PatientPortalPage
 *               ├─ /portal/:token/chat   PatientLayout → PatientChatPage
 *               ├─ /doctor               DoctorLayout (nested)
 *               │    ├─ dashboard        DashboardPage
 *               │    ├─ visits/new       NewVisitPage
 *               │    ├─ visits/:id       VisitDetailPage
 *               │    ├─ patients         PatientsPage
 *               │    ├─ patients/:id     PatientDetailPage
 *               │    └─ profile          ProfilePage
 *               ├─ /doctor →redirect→ /doctor/dashboard
 *               └─ *                     NotFoundPage
 */

import { Suspense, lazy, useEffect, memo }  from 'react'
import {
  Routes, Route, Navigate,
  useLocation, useNavigate,
}                                           from 'react-router-dom'
import { useAuthStore, useLanguageStore, useUiStore } from '@/store'
import { ALL_ROUTES, REDIRECT_ROUTES }      from './routes'
import { ROUTE_COMPONENTS }                 from './lazyComponents'
import ProtectedRoute                       from './ProtectedRoute'
import ScrollRestoration                    from './ScrollRestoration'
import PageTitleManager                     from './PageTitleManager'
import RouteTransition                      from './RouteTransition'
import DoctorLayout                         from '@/components/layout/DoctorLayout'
import PatientLayout                        from '@/components/layout/PatientLayout'
import { PageLoader }                       from '@/components/ui/Spinner'

// ─── Page-level loading fallback ──────────────────────────────────────────────
function PageFallback() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--color-bg)]">
      <PageLoader />
    </div>
  )
}

// ─── Nested doctor routes ─────────────────────────────────────────────────────
// All doctor pages share DoctorLayout (sidebar + topbar).
// Using a nested Route with element=<DoctorLayout /> so layout is not re-mounted
// on every navigation within the doctor section.
function DoctorRoutes() {
  return (
    <ProtectedRoute requiredRole="DOCTOR">
      <DoctorLayout>
        <Routes>
          <Route path="dashboard"      element={<ROUTE_COMPONENTS['doctor/DashboardPage'] />} />
          <Route path="visits/new"     element={<ROUTE_COMPONENTS['doctor/NewVisitPage'] />} />
          <Route path="visits/:id"     element={<ROUTE_COMPONENTS['doctor/VisitDetailPage'] />} />
          <Route path="patients"       element={<ROUTE_COMPONENTS['doctor/PatientsPage'] />} />
          <Route path="patients/:id"   element={<ROUTE_COMPONENTS['doctor/PatientDetailPage'] />} />
          <Route path="profile"        element={<ROUTE_COMPONENTS['doctor/ProfilePage'] />} />
          {/* /doctor with no sub-path → dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          {/* Any unknown /doctor/... path → 404 */}
          <Route path="*" element={<ROUTE_COMPONENTS['NotFoundPage'] />} />
        </Routes>
      </DoctorLayout>
    </ProtectedRoute>
  )
}

// ─── Smart home redirect ───────────────────────────────────────────────────────
// If a logged-in doctor navigates to '/', redirect to dashboard.
function SmartHome() {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated()) return <ROUTE_COMPONENTS['LandingPage'] />
  if (user?.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />
  return <ROUTE_COMPONENTS['LandingPage'] />
}

// ─── AppRouter ────────────────────────────────────────────────────────────────
export default function AppRouter() {
  return (
    <Suspense fallback={<PageFallback />}>
      {/* Cross-cutting concerns that need location access */}
      <ScrollRestoration />
      <PageTitleManager />

      <RouteTransition>
        <Routes>

          {/* ── Redirect shortcuts ──────────────────────────────────────── */}
          {REDIRECT_ROUTES.map(r => (
            <Route key={r.from} path={r.from} element={<Navigate to={r.to} replace />} />
          ))}

          {/* ── Public ─────────────────────────────────────────────────── */}
          <Route path="/"         element={<SmartHome />} />
          <Route path="/login"    element={<ROUTE_COMPONENTS['LoginPage'] />} />
          <Route path="/register" element={<ROUTE_COMPONENTS['RegisterPage'] />} />

          {/* ── Patient portal — no auth, WhatsApp token ──────────────── */}
          <Route path="/portal/:token" element={
            <PatientLayout>
              <ROUTE_COMPONENTS['portal/PatientPortalPage'] />
            </PatientLayout>
          } />
          <Route path="/portal/:token/chat" element={
            <PatientLayout>
              <ROUTE_COMPONENTS['portal/PatientChatPage'] />
            </PatientLayout>
          } />

          {/* ── Doctor portal — nested, shared DoctorLayout ───────────── */}
          <Route path="/doctor/*" element={<DoctorRoutes />} />

          {/* ── 404 ──────────────────────────────────────────────────── */}
          <Route path="*" element={<ROUTE_COMPONENTS['NotFoundPage'] />} />

        </Routes>
      </RouteTransition>
    </Suspense>
  )
}
