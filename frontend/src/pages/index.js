/**
 * src/pages/index.js — Pages barrel export
 *
 * NOTE: In App.jsx, pages are lazy-loaded individually for code-splitting.
 * This barrel is useful for non-lazy imports (e.g. tests, Storybook).
 */

// ── Public ────────────────────────────────────────────────────────────────────
export { default as LandingPage }   from './LandingPage'
export { default as LoginPage }     from './LoginPage'
export { default as RegisterPage }  from './RegisterPage'
export { default as NotFoundPage }  from './NotFoundPage'

// ── Patient Portal (token-based, no auth) ─────────────────────────────────────
export { default as PatientPortalPage } from './portal/PatientPortalPage'
export { default as PatientChatPage }   from './portal/PatientChatPage'

// ── Patient Dashboard (authenticated PATIENT) ───────────────────────────────
export { default as MyHealthPage }      from './patient/MyHealth'

// ── Doctor Portal (requires DOCTOR role) ──────────────────────────────────────
export { default as DashboardPage }     from './doctor/DashboardPage'
export { default as NewVisitPage }      from './doctor/NewVisitPage'
export { default as VisitDetailPage }   from './doctor/VisitDetailPage'
export { default as PatientsPage }      from './doctor/PatientsPage'
export { default as PatientDetailPage } from './doctor/PatientDetailPage'
export { default as ProfilePage }       from './doctor/ProfilePage'
