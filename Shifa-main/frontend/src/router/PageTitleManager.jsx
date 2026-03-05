/**
 * PageTitleManager.jsx — Updates <title> on every route change
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads meta.title from routes.js for the current path.
 * Falls back to 'Shifa' if no match found.
 *
 * For dynamic routes like /doctor/patients/:id it uses the patient name
 * from the Zustand store (set by PatientDetailPage on load).
 *
 * Also sets <meta name="description"> for portal pages.
 *
 * Renderless component — returns null.
 */

import { useEffect }  from 'react'
import { useLocation, matchPath } from 'react-router-dom'
import { ALL_ROUTES } from './routes'

function resolveTitle(pathname) {
  // Try to match current pathname against every route pattern
  for (const route of ALL_ROUTES) {
    const match = matchPath({ path: route.path, end: true }, pathname)
    if (match && route.meta?.title) {
      return route.meta.title
    }
  }
  return 'Shifa — AI Health Companion'
}

function resolveDescription(pathname) {
  for (const route of ALL_ROUTES) {
    const match = matchPath({ path: route.path, end: true }, pathname)
    if (match && route.meta?.description) return route.meta.description
  }
  return null
}

export default function PageTitleManager() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Set page title
    const title = resolveTitle(pathname)
    document.title = title

    // Set description
    const desc = resolveDescription(pathname)
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    if (desc) metaDesc.content = desc

    // noIndex pages (portal token URLs)
    const route = ALL_ROUTES.find(r => matchPath({ path: r.path, end: true }, pathname))
    let noIndexMeta = document.querySelector('meta[name="robots"]')
    if (route?.meta?.noIndex) {
      if (!noIndexMeta) {
        noIndexMeta = document.createElement('meta')
        noIndexMeta.name = 'robots'
        document.head.appendChild(noIndexMeta)
      }
      noIndexMeta.content = 'noindex, nofollow'
    } else if (noIndexMeta) {
      noIndexMeta.content = 'index, follow'
    }
  }, [pathname])

  return null
}
