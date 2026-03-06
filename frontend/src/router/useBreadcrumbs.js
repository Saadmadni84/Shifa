/**
 * useBreadcrumbs.js — Reactive breadcrumb trail hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns an ordered array of breadcrumb objects for the current URL.
 *
 * Usage (in PageHeader or layout):
 *   const crumbs = useBreadcrumbs()
 *   // → [{ label: 'Dashboard', href: '/doctor/dashboard' }, { label: 'Patients', href: '/doctor/patients' }, { label: 'Ramesh Kumar', href: null }]
 *
 * Dynamic segments:
 *   Routes like /doctor/patients/:id have breadcrumb: ':patientName'
 *   This hook resolves that dynamically using the patient data passed via
 *   location.state.breadcrumbLabel OR by reading from the React Query cache.
 *
 * The last crumb is never a link (current page).
 */

import { useMemo }              from 'react'
import { useLocation, matchPath } from 'react-router-dom'
import { useQueryClient }       from '@tanstack/react-query'
import { ALL_ROUTES, getAncestorChain } from './routes'

function matchRoute(pathname) {
  for (const route of ALL_ROUTES) {
    const m = matchPath({ path: route.path, end: true }, pathname)
    if (m) return { route, params: m.params }
  }
  return null
}

function resolveLabel(rawLabel, params, queryClient, state) {
  if (!rawLabel.startsWith(':')) return rawLabel

  // Dynamic label passed via location.state (fastest)
  if (state?.breadcrumbLabel) return state.breadcrumbLabel

  const field = rawLabel.slice(1) // e.g. 'patientName'

  // Try React Query cache for patient / visit names
  if (field === 'patientName' && params.id) {
    const cached = queryClient.getQueryData(['patient', params.id])
    const p = cached?.data
    if (p) return `${p.firstName} ${p.lastName}`
  }

  if (field === 'visitLabel' && params.id) {
    const cached = queryClient.getQueryData(['visit', params.id])
    const v = cached?.data
    if (v) return v.patient ? `${v.patient.firstName}'s visit` : 'Visit'
  }

  return 'Detail'
}

export function useBreadcrumbs() {
  const { pathname, state } = useLocation()
  const queryClient         = useQueryClient()

  return useMemo(() => {
    const match = matchRoute(pathname)
    if (!match) return []

    const { route, params } = match
    const chain = getAncestorChain(route.id)

    return chain.map((r, i) => {
      const isLast = i === chain.length - 1

      // Resolve path with actual params
      let href = r.path
      Object.entries(params).forEach(([k, v]) => {
        href = href.replace(`:${k}`, v)
      })

      const label = resolveLabel(r.breadcrumb || r.label, params, queryClient, isLast ? state : null)

      return {
        id:    r.id,
        label,
        href:  isLast ? null : href,  // last crumb has no link
        icon:  r.navIcon ?? null,
      }
    })
  }, [pathname, state, queryClient])
}

export default useBreadcrumbs
