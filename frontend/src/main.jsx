/**
 * main.jsx — Shifa React Entry Point
 * ─────────────────────────────────────────────────────────────────────────
 * Responsibilities:
 *   1. Mount React into #root
 *   2. Wrap app with all providers (Router, QueryClient, ErrorBoundary)
 *   3. Configure TanStack Query global defaults
 *   4. Attach global event listeners (session expiry)
 *   5. Register Service Worker (PWA)
 *   6. Dispatch 'shifa:app-ready' to remove the HTML splash screen
 * ─────────────────────────────────────────────────────────────────────────
 */

import React, { StrictMode } from 'react'
import ReactDOM               from 'react-dom/client'
import { BrowserRouter }      from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools }  from '@tanstack/react-query-devtools'
import { Toaster }             from 'react-hot-toast'

import App                           from './App'
import { ErrorBoundary }             from '@/components/common/ErrorBoundary'
import { attachSessionExpiryListener } from '@/store'

import './index.css'


// ─── TanStack Query Client ────────────────────────────────────────────────
/**
 * Global defaults chosen for a medical app:
 *   - staleTime  5 min  → patient/visit data doesn't change every second
 *   - retry      2      → fail fast on genuine errors (no 3× delays)
 *   - refetchOnWindowFocus false → doctor focuses tab → no unwanted fetches mid-flow
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            5 * 60 * 1000,  // 5 minutes
      gcTime:               10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry:                2,
      retryDelay:           (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      refetchOnWindowFocus: false,
      refetchOnReconnect:   true,
    },
    mutations: {
      retry: 0,  // never auto-retry mutations — user should decide
    },
  },
})


// ─── Toast Config ─────────────────────────────────────────────────────────
const TOAST_CONFIG = {
  position:     'top-right',
  duration:     4000,
  style: {
    fontFamily:   "'Plus Jakarta Sans', system-ui, sans-serif",
    fontSize:     '0.875rem',
    borderRadius: '12px',
    padding:      '12px 16px',
    boxShadow:    '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)',
    maxWidth:     '380px',
  },
  success: {
    iconTheme:  { primary: '#10b981', secondary: '#ffffff' },
    style:      { border: '1px solid #d1fae5', background: '#f0fdf4', color: '#064e3b' },
  },
  error: {
    duration:   6000,
    iconTheme:  { primary: '#ef4444', secondary: '#ffffff' },
    style:      { border: '1px solid #fecaca', background: '#fef2f2', color: '#7f1d1d' },
  },
  loading: {
    iconTheme:  { primary: '#6366f1', secondary: '#ffffff' },
    style:      { border: '1px solid #e0e7ff', background: '#eef2ff', color: '#1e1b4b' },
  },
}


// ─── Global Bootstrap ─────────────────────────────────────────────────────

// 1. Attach session-expiry listener so any 401 → store.logout() → redirect to /login
attachSessionExpiryListener()

// 2. Register PWA service worker (production only)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.info('[SW] Registered:', reg.scope)
      })
      .catch((err) => {
        console.warn('[SW] Registration failed:', err)
      })
  })
}


// ─── Root Render ─────────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>

          {/* ── App ─────────────────────────────── */}
          <App />

          {/* ── Global Toast Notifications ───────── */}
          <Toaster toastOptions={TOAST_CONFIG} />

          {/* ── React Query DevTools (dev only) ──── */}
          {import.meta.env.DEV && (
            <ReactQueryDevtools
              initialIsOpen={false}
              buttonPosition="bottom-left"
            />
          )}

        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)

// 3. Tell index.html to remove the HTML splash screen
//    Slight delay ensures React has painted at least one frame
requestAnimationFrame(() => {
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('shifa:app-ready'))
  }, 100)
})
