/**
 * routes.js — Shifa Master Route Definitions
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for EVERY route in the app.
 * Consumed by:
 *   • AppRouter.jsx     — builds the <Routes> tree
 *   • useNavigation.js  — builds sidebar nav items
 *   • useBreadcrumbs.js — resolves breadcrumb trails
 *   • ProtectedRoute    — checks requiredRole
 *
 * Route object shape:
 * {
 *   id          : string    — unique key (used for active-link detection)
 *   path        : string    — React Router path pattern
 *   label       : string    — human-readable name (i18n key or plain text)
 *   page        : string    — lazy import path relative to src/pages/
 *   layout      : 'doctor' | 'patient' | 'public' | 'none'
 *   auth        : boolean   — requires authentication?
 *   role        : string[]  — required roles (empty = any authenticated user)
 *   nav         : boolean   — show in sidebar nav?
 *   navIcon     : string    — lucide-react icon name for sidebar
 *   navGroup    : string    — sidebar section: 'main' | 'patients' | 'account'
 *   navOrder    : number    — sort order in sidebar group
 *   breadcrumb  : string    — breadcrumb label (can be dynamic e.g. ':patientName')
 *   parent      : string    — parent route id for breadcrumb hierarchy
 *   exact       : boolean   — exact path match (default true)
 *   preload     : boolean   — preload chunk on hover (high-traffic pages)
 *   meta        : object    — arbitrary metadata (page title, description)
 * }
 */

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────
export const PUBLIC_ROUTES = [
  {
    id:         'landing',
    path:       '/',
    label:      'Home',
    page:       'LandingPage',
    layout:     'public',
    auth:       false,
    role:       [],
    nav:        false,
    breadcrumb: 'Home',
    preload:    false,
    meta: {
      title:       'Shifa — AI Health Companion for Indian Patients',
      description: 'Doctor visit summaries in your own language, delivered via WhatsApp.',
    },
  },
  {
    id:         'login',
    path:       '/login',
    label:      'Sign In',
    page:       'LoginPage',
    layout:     'public',
    auth:       false,
    role:       [],
    nav:        false,
    breadcrumb: 'Sign In',
    preload:    true,   // users arrive from WhatsApp links, then hit login
    meta: { title: 'Sign In — Shifa' },
  },
  {
    id:         'register',
    path:       '/register',
    label:      'Register',
    page:       'RegisterPage',
    layout:     'public',
    auth:       false,
    role:       [],
    nav:        false,
    breadcrumb: 'Register',
    preload:    false,
    meta: { title: 'Create your account — Shifa' },
  },
]

// ─── PATIENT PORTAL ROUTES (no auth, WhatsApp token) ─────────────────────────
export const PORTAL_ROUTES = [
  {
    id:         'portal-summary',
    path:       '/portal/:token',
    label:      'Visit Summary',
    page:       'portal/PatientPortalPage',
    layout:     'patient',
    auth:       false,
    role:       [],
    nav:        false,
    breadcrumb: 'Visit Summary',
    preload:    true,   // WhatsApp link → this page
    meta: {
      title:       'Your Visit Summary — Shifa',
      description: 'View your doctor visit summary in your language.',
      noIndex:     true,  // token URLs should not be indexed
    },
  },
  {
    id:         'portal-chat',
    path:       '/portal/:token/chat',
    label:      'Ask a Question',
    page:       'portal/PatientChatPage',
    layout:     'patient',
    auth:       false,
    role:       [],
    nav:        false,
    breadcrumb: 'Ask a Question',
    parent:     'portal-summary',
    preload:    false,
    meta: {
      title:   'Chat with Shifa AI — Shifa',
      noIndex: true,
    },
  },
]

// ─── DOCTOR PORTAL ROUTES (requires DOCTOR role) ──────────────────────────────
export const DOCTOR_ROUTES = [
  {
    id:         'doctor-dashboard',
    path:       '/doctor/dashboard',
    label:      'Dashboard',
    page:       'doctor/DashboardPage',
    layout:     'doctor',
    auth:       true,
    role:       ['DOCTOR'],
    nav:        true,
    navIcon:    'LayoutDashboard',
    navGroup:   'main',
    navOrder:   1,
    breadcrumb: 'Dashboard',
    preload:    true,
    meta: { title: 'Dashboard — Shifa' },
  },
  {
    id:         'doctor-new-visit',
    path:       '/doctor/visits/new',
    label:      'New Visit',
    page:       'doctor/NewVisitPage',
    layout:     'doctor',
    auth:       true,
    role:       ['DOCTOR'],
    nav:        true,
    navIcon:    'FilePlus',
    navGroup:   'main',
    navOrder:   2,
    breadcrumb: 'New Visit',
    parent:     'doctor-dashboard',
    preload:    false,
    meta: { title: 'New Visit — Shifa' },
  },
  {
    id:         'doctor-visit-detail',
    path:       '/doctor/visits/:id',
    label:      'Visit Detail',
    page:       'doctor/VisitDetailPage',
    layout:     'doctor',
    auth:       true,
    role:       ['DOCTOR'],
    nav:        false,     // not in sidebar — accessed via card clicks
    breadcrumb: 'Visit',
    parent:     'doctor-dashboard',
    preload:    false,
    meta: { title: 'Visit — Shifa' },
  },
  {
    id:         'doctor-patients',
    path:       '/doctor/patients',
    label:      'Patients',
    page:       'doctor/PatientsPage',
    layout:     'doctor',
    auth:       true,
    role:       ['DOCTOR'],
    nav:        true,
    navIcon:    'Users',
    navGroup:   'main',
    navOrder:   3,
    breadcrumb: 'Patients',
    preload:    true,
    meta: { title: 'Patients — Shifa' },
  },
  {
    id:         'doctor-patient-detail',
    path:       '/doctor/patients/:id',
    label:      'Patient',
    page:       'doctor/PatientDetailPage',
    layout:     'doctor',
    auth:       true,
    role:       ['DOCTOR'],
    nav:        false,
    breadcrumb: ':patientName',   // resolved dynamically in useBreadcrumbs
    parent:     'doctor-patients',
    preload:    false,
    meta: { title: 'Patient — Shifa' },
  },
  {
    id:         'doctor-profile',
    path:       '/doctor/profile',
    label:      'Profile & Settings',
    page:       'doctor/ProfilePage',
    layout:     'doctor',
    auth:       true,
    role:       ['DOCTOR'],
    nav:        true,
    navIcon:    'Settings',
    navGroup:   'account',
    navOrder:   1,
    breadcrumb: 'Profile',
    preload:    false,
    meta: { title: 'Profile — Shifa' },
  },
]

// ─── REDIRECT ROUTES ──────────────────────────────────────────────────────────
export const REDIRECT_ROUTES = [
  { from: '/doctor',  to: '/doctor/dashboard' },
  { from: '/portal',  to: '/patient/my-health' },
  { from: '/app',     to: '/doctor/dashboard' },
  { from: '/home',    to: '/' },
]

// ─── ALL ROUTES (flat array for lookup) ───────────────────────────────────────
export const ALL_ROUTES = [
  ...PUBLIC_ROUTES,
  ...PORTAL_ROUTES,
  ...DOCTOR_ROUTES,
]

// ─── Route lookup helpers ─────────────────────────────────────────────────────

/** Find a route definition by its id */
export function getRouteById(id) {
  return ALL_ROUTES.find(r => r.id === id) ?? null
}

/** Find a route definition by its path pattern */
export function getRouteByPath(path) {
  return ALL_ROUTES.find(r => r.path === path) ?? null
}

/**
 * Get all sidebar nav routes for a given layout type.
 * Returns routes sorted by navOrder within each navGroup.
 */
export function getNavRoutes(layout = 'doctor') {
  return ALL_ROUTES
    .filter(r => r.layout === layout && r.nav)
    .sort((a, b) => (a.navOrder ?? 99) - (b.navOrder ?? 99))
}

/**
 * Get all routes in a nav group
 */
export function getNavGroup(layout, group) {
  return getNavRoutes(layout).filter(r => r.navGroup === group)
}

/**
 * Build the ancestor chain for a route (for breadcrumbs).
 * Returns array from root → current: [ 'doctor-dashboard', 'doctor-patients', 'doctor-patient-detail' ]
 */
export function getAncestorChain(routeId) {
  const chain = []
  let current = getRouteById(routeId)
  while (current) {
    chain.unshift(current)
    current = current.parent ? getRouteById(current.parent) : null
  }
  return chain
}

export default ALL_ROUTES
