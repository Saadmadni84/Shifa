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
    import('@/pages/AllPages').then(module => ({ default: module[name] }))
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
  'LandingPage':                LandingPage,
  'LoginPage':                  LoginPage,
  'RegisterPage':               RegisterPage,
  'NotFoundPage':               NotFoundPage,

  // Patient portal
  'portal/PatientPortalPage':   PatientPortalPage,
  'portal/PatientChatPage':     PatientChatPage,

  // Doctor portal
  'doctor/DashboardPage':       DashboardPage,
  'doctor/NewVisitPage':        NewVisitPage,
  'doctor/VisitDetailPage':     VisitDetailPage,
  'doctor/PatientsPage':        PatientsPage,
  'doctor/PatientDetailPage':   PatientDetailPage,
  'doctor/ProfilePage':         ProfilePage,
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
    'LandingPage':              () => import('@/pages/AllPages'),
    'LoginPage':                () => import('@/pages/AllPages'),
    'RegisterPage':             () => import('@/pages/AllPages'),
    'NotFoundPage':             () => import('@/pages/AllPages'),
    'portal/PatientPortalPage': () => import('@/pages/AllPages'),
    'portal/PatientChatPage':   () => import('@/pages/AllPages'),
    'doctor/DashboardPage':     () => import('@/pages/AllPages'),
    'doctor/NewVisitPage':      () => import('@/pages/AllPages'),
    'doctor/VisitDetailPage':   () => import('@/pages/AllPages'),
    'doctor/PatientsPage':      () => import('@/pages/AllPages'),
    'doctor/PatientDetailPage': () => import('@/pages/AllPages'),
    'doctor/ProfilePage':       () => import('@/pages/AllPages'),
  }
  preloaders[pageKey]?.()
}

export default ROUTE_COMPONENTS
