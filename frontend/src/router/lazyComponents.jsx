/**
 * lazyComponents.jsx — All lazy-loaded page components
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralises ALL React.lazy() calls so:
 *   1. Vite can see every dynamic import at build time → correct chunk names
 *   2. AppRouter.jsx imports from one place
 *   3. We can preload chunks on link hover (see useRoutePreloader)
 *
 * Naming convention:  ROUTE_COMPONENTS['pages/PageName']
 * Import path:        @/pages/PageName
 *
 * NOTE: All 12 pages are exported as individual named exports from AllPages.jsx.
 * We use the split-module pattern to keep each page in its own chunk while
 * sourcing code from AllPages.jsx:
 *   lazy(() => import('@/pages/AllPages').then(m => ({ default: m.PageName })))
 */

import { lazy } from 'react'

// ─── Helper: create lazy component from AllPages named export ─────────────────
function fromAllPages(name) {
  return lazy(() =>
    import('@/pages/index').then(module => ({ default: module[name] }))
  )
}

// ─── Public pages ─────────────────────────────────────────────────────────────
const LandingPage      = fromAllPages('LandingPage')
const LoginPage        = fromAllPages('LoginPage')
const RegisterPage     = fromAllPages('RegisterPage')
const NotFoundPage     = fromAllPages('NotFoundPage')

// ─── Patient portal ───────────────────────────────────────────────────────────
const PatientPortalPage = fromAllPages('PatientPortalPage')
const PatientChatPage   = fromAllPages('PatientChatPage')
const MyHealthPage      = fromAllPages('MyHealthPage')

// ─── Doctor portal ────────────────────────────────────────────────────────────
const DashboardPage     = fromAllPages('DashboardPage')
const NewVisitPage      = fromAllPages('NewVisitPage')
const VisitDetailPage   = fromAllPages('VisitDetailPage')
const PatientsPage      = fromAllPages('PatientsPage')
const PatientDetailPage = fromAllPages('PatientDetailPage')
const ProfilePage       = fromAllPages('ProfilePage')

/**
 * Map from page key → lazy component.
 * Keys match the `page` field in routes.js.
 */
export const ROUTE_COMPONENTS = {
  // Public
  LandingPage:                LandingPage,
  LoginPage:                  LoginPage,
  RegisterPage:               RegisterPage,
  NotFoundPage:               NotFoundPage,

  // Patient portal
  portalPatientPortalPage:    PatientPortalPage,
  portalPatientChatPage:      PatientChatPage,
  patientMyHealthPage:        MyHealthPage,

  // Doctor portal
  doctorDashboardPage:        DashboardPage,
  doctorNewVisitPage:         NewVisitPage,
  doctorVisitDetailPage:      VisitDetailPage,
  doctorPatientsPage:         PatientsPage,
  doctorPatientDetailPage:    PatientDetailPage,
  doctorProfilePage:          ProfilePage,
}

// ─── Preload function — call on link hover ────────────────────────────────────
/**
 * Triggers the dynamic import for a route's chunk without rendering it.
 * Used by NavLink components to preload on hover for instant navigation.
 *
 * @param {string} pageKey — matches ROUTE_COMPONENTS key
 */
export function preloadRoute(pageKey) {
  // React.lazy components expose _payload in dev, _init in prod.
  // The cleanest cross-version way is to just re-trigger the import.
  const preloaders = {
    'LandingPage':              () => import('@/pages/index'),
    'LoginPage':                () => import('@/pages/index'),
    'RegisterPage':             () => import('@/pages/index'),
    'NotFoundPage':             () => import('@/pages/index'),
    'portal/PatientPortalPage': () => import('@/pages/index'),
    'portal/PatientChatPage':   () => import('@/pages/index'),
    'doctor/DashboardPage':     () => import('@/pages/index'),
    'doctor/NewVisitPage':      () => import('@/pages/index'),
    'doctor/VisitDetailPage':   () => import('@/pages/index'),
    'doctor/PatientsPage':      () => import('@/pages/index'),
    'doctor/PatientDetailPage': () => import('@/pages/index'),
    'doctor/ProfilePage':       () => import('@/pages/index'),
  }
  preloaders[pageKey]?.()
}

export default ROUTE_COMPONENTS
