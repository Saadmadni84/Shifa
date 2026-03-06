/**
 * router/index.js — Barrel export
 *
 * Import any router utility with:
 *   import { useBreadcrumbs, useNavigation, ROUTE_COMPONENTS } from '@/router'
 */

export { default as AppRouter }                from './AppRouter'
export { default as ProtectedRoute, GuestOnlyRoute } from './ProtectedRoute'
export { default as ScrollRestoration }        from './ScrollRestoration'
export { default as PageTitleManager }         from './PageTitleManager'
export { default as RouteTransition }          from './RouteTransition'
export { default as UnauthorizedPage }         from './UnauthorizedPage'

export { useBreadcrumbs }                      from './useBreadcrumbs'
export { useNavigation }                       from './useNavigation'
export { useRoutePreloader }                   from './useRoutePreloader'

export { ROUTE_COMPONENTS, preloadRoute }      from './lazyComponents'
export {
  ALL_ROUTES, PUBLIC_ROUTES, PORTAL_ROUTES, DOCTOR_ROUTES,
  REDIRECT_ROUTES,
  getRouteById, getRouteByPath,
  getNavRoutes, getNavGroup,
  getAncestorChain,
}                                              from './routes'
