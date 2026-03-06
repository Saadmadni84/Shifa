/**
 * useNavigation.js — Sidebar navigation hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns grouped navigation items for the current user's role.
 * Each item has an isActive flag based on the current URL.
 *
 * Usage (in DoctorLayout sidebar):
 *   const { mainItems, accountItems, isActive } = useNavigation()
 *
 * Nav groups for DOCTOR layout:
 *   main    → Dashboard, New Visit, Patients
 *   account → Profile & Settings
 *
 * The hook also:
 *   • Preloads the hovered route's chunk (onMouseEnter)
 *   • Returns a navigate() helper that DoctorLayout's nav uses
 *
 * Icon map: lucide-react icon names → actual components (tree-shaken)
 */

import { useMemo, useCallback }             from 'react'
import { useLocation, useNavigate }         from 'react-router-dom'
import {
  LayoutDashboard, FilePlus, Users, Settings,
  Heart, LogOut, Bell, ChevronRight,
}                                           from 'lucide-react'
import { getNavGroup }                      from './routes'
import { preloadRoute }                     from './lazyComponents'
import { useAuthStore }                     from '@/store'

const ICON_MAP = {
  LayoutDashboard,
  FilePlus,
  Users,
  Settings,
  Heart,
  LogOut,
  Bell,
  ChevronRight,
}

function getIcon(name) {
  return ICON_MAP[name] ?? null
}

function buildNavItem(route, pathname) {
  const isActive = pathname.startsWith(route.path.replace('/*', ''))
  return {
    ...route,
    Icon:     getIcon(route.navIcon),
    isActive,
    href:     route.path,
  }
}

export function useNavigation(layout = 'doctor') {
  const { pathname }  = useLocation()
  const navigate      = useNavigate()
  const { user }      = useAuthStore()

  const mainItems = useMemo(
    () => getNavGroup(layout, 'main').map(r => buildNavItem(r, pathname)),
    [layout, pathname]
  )

  const accountItems = useMemo(
    () => getNavGroup(layout, 'account').map(r => buildNavItem(r, pathname)),
    [layout, pathname]
  )

  const handleNavClick = useCallback((href) => {
    navigate(href)
  }, [navigate])

  const handleNavHover = useCallback((pageKey) => {
    preloadRoute(pageKey)
  }, [])

  return {
    mainItems,
    accountItems,
    user,
    handleNavClick,
    handleNavHover,
    currentPath: pathname,
  }
}

export default useNavigation
