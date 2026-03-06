import { lazy } from 'react'

export const ROUTE_COMPONENTS = {
  'LandingPage': lazy(() => import('@/pages/LandingPage')),
  'LoginPage': lazy(() => import('@/pages/LoginPage')),
  'RegisterPage': lazy(() => import('@/pages/RegisterPage')),
  'NotFoundPage': lazy(() => import('@/pages/NotFoundPage')),

  'portal/PatientPortalPage': lazy(() => import('@/pages/portal/PatientPortalPage')),
  'portal/PatientChatPage': lazy(() => import('@/pages/portal/PatientChatPage')),

  'doctor/DashboardPage': lazy(() => import('@/pages/doctor/DashboardPage')),
  'doctor/NewVisitPage': lazy(() => import('@/pages/doctor/NewVisitPage')),
  'doctor/VisitDetailPage': lazy(() => import('@/pages/doctor/VisitDetailPage')),
  'doctor/PatientsPage': lazy(() => import('@/pages/doctor/PatientsPage')),
  'doctor/PatientDetailPage': lazy(() => import('@/pages/doctor/PatientDetailPage')),
  'doctor/ProfilePage': lazy(() => import('@/pages/doctor/ProfilePage')),
}

export function preloadRoute(pageKey) {
  const preloaders = {
    'LandingPage': () => import('@/pages/LandingPage'),
    'LoginPage': () => import('@/pages/LoginPage'),
    'RegisterPage': () => import('@/pages/RegisterPage'),
    'NotFoundPage': () => import('@/pages/NotFoundPage'),
    'portal/PatientPortalPage': () => import('@/pages/portal/PatientPortalPage'),
    'portal/PatientChatPage': () => import('@/pages/portal/PatientChatPage'),
    'doctor/DashboardPage': () => import('@/pages/doctor/DashboardPage'),
    'doctor/NewVisitPage': () => import('@/pages/doctor/NewVisitPage'),
    'doctor/VisitDetailPage': () => import('@/pages/doctor/VisitDetailPage'),
    'doctor/PatientsPage': () => import('@/pages/doctor/PatientsPage'),
    'doctor/PatientDetailPage': () => import('@/pages/doctor/PatientDetailPage'),
    'doctor/ProfilePage': () => import('@/pages/doctor/ProfilePage'),
  }
  preloaders[pageKey]?.()
}

export default ROUTE_COMPONENTS
