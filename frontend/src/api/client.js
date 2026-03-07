/**
 * client.js — Shifa API Client
 * ─────────────────────────────────────────────────────────────────────
 * Central Axios instance with:
 *   • JWT auto-attach on every request
 *   • Silent token refresh on 401 (queues ALL concurrent 401 requests)
 *   • Structured ShifaError normalisation — same shape everywhere
 *   • Dev-only request/response logging (stripped in production build)
 *   • Auto-retry on network failures (3× exponential back-off: 1s, 2s, 4s)
 *   • File upload helper with real-time progress callback
 *   • AbortController-based request cancellation
 * ─────────────────────────────────────────────────────────────────────
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const TIMEOUT_MS = 30_000
const MAX_RETRY = 3
const RETRY_BASE = 1_000

export const tokenStore = {
  getAccess: () => localStorage.getItem('shifa_token'),
  setAccess: (token) => localStorage.setItem('shifa_token', token),
  getRefresh: () => localStorage.getItem('shifa_refresh_token'),
  setRefresh: (token) => localStorage.setItem('shifa_refresh_token', token),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem('shifa_user') || 'null')
    } catch {
      return null
    }
  },
  setUser: (user) => localStorage.setItem('shifa_user', JSON.stringify(user)),
  clearAll: () => {
    ['shifa_token', 'shifa_refresh_token', 'shifa_user'].forEach((key) =>
      localStorage.removeItem(key)
    )
  },
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-App-Version': import.meta.env.VITE_APP_VERSION || '1.0.0',
    'X-Platform': 'web',
  },
})

let isRefreshing = false
let refreshSubscribers = []

function enqueueWaiter(resolve, reject) {
  refreshSubscribers.push({ resolve, reject })
}

function flushQueue(newToken) {
  refreshSubscribers.forEach(({ resolve }) => resolve(newToken))
  refreshSubscribers = []
}

function failQueue(err) {
  refreshSubscribers.forEach(({ reject }) => reject(err))
  refreshSubscribers = []
}

async function doRefresh() {
  const refreshToken = tokenStore.getRefresh()
  if (!refreshToken) throw new Error('NO_REFRESH_TOKEN')
  const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
  tokenStore.setAccess(data.accessToken)
  if (data.refreshToken) tokenStore.setRefresh(data.refreshToken)
  return data.accessToken
}

apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStore.getAccess()
    if (token) config.headers.Authorization = `Bearer ${token}`

    if (import.meta.env.DEV) {
      console.debug(
        `%c[API] → ${config.method?.toUpperCase()} ${config.url}`,
        'color:#10b981;font-weight:bold',
        config.data ?? config.params ?? ''
      )
    }

    config._meta = { t0: Date.now() }
    return config
  },
  (error) => Promise.reject(normaliseError(error))
)

apiClient.interceptors.response.use(
  (res) => {
    if (import.meta.env.DEV) {
      const ms = Date.now() - (res.config._meta?.t0 ?? 0)
      console.debug(
        `%c[API] ← ${res.status} ${res.config.url} (${ms}ms)`,
        'color:#6366f1'
      )
    }
    return res
  },
  async (error) => {
    const original = error.config
    const reqUrl = original?.url || ''
    const isAuthEndpoint =
      reqUrl.includes('/auth/login') ||
      reqUrl.includes('/auth/register') ||
      reqUrl.includes('/auth/register/patient') ||
      reqUrl.includes('/auth/patient/otp/') ||
      reqUrl.includes('/auth/refresh')

    if (!error.response && original) {
      original._retry = (original._retry ?? 0) + 1
      if (original._retry <= MAX_RETRY) {
        await sleep(RETRY_BASE * Math.pow(2, original._retry - 1))
        return apiClient(original)
      }
    }

    if (
      error.response?.status === 401 &&
      original &&
      !original._refreshed &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          enqueueWaiter(
            (tok) => {
              original.headers.Authorization = `Bearer ${tok}`
              resolve(apiClient(original))
            },
            (err) => reject(normaliseError(err))
          )
        )
      }

      original._refreshed = true
      isRefreshing = true

      const refreshToken = tokenStore.getRefresh()
      if (!refreshToken) {
        return Promise.reject(normaliseError(error))
      }

      try {
        const tok = await doRefresh()
        flushQueue(tok)
        original.headers.Authorization = `Bearer ${tok}`
        return apiClient(original)
      } catch (e) {
        failQueue(e)
        tokenStore.clearAll()
        window.dispatchEvent(new CustomEvent('shifa:session-expired'))
        return Promise.reject(normaliseError(e))
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(normaliseError(error))
  }
)

export function normaliseError(error) {
  if (error?.isShifaError) return error

  const res = error?.response
  const status = res?.status ?? 0
  const body = res?.data
  const fieldErrors = body?.fieldErrors ?? body?.validationErrors ?? body?.errors ?? {}

  const message = (() => {
    if (!res) return 'Network error — please check your connection.'
    if (body?.message) return body.message
    return (
      {
        400: 'Invalid request — please check your input.',
        401: 'Session expired — please log in again.',
        403: "You don't have permission for this action.",
        404: 'Not found.',
        409: 'This record already exists.',
        413: 'File too large. Max 10 MB.',
        422: 'Please fix the errors below.',
        429: 'Too many requests — slow down and try again.',
        500: 'Server error. Please try again later.',
        503: 'Service unavailable. Try again shortly.',
      }[status] ?? `Unexpected error (HTTP ${status}).`
    )
  })()

  const norm = {
    isShifaError: true,
    message,
    code: body?.code ?? `HTTP_${status}`,
    status,
    fieldErrors,
    raw: error,
  }
  if (import.meta.env.DEV) console.error('[ShifaError]', norm)
  return norm
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function makeCancellable() {
  const ctrl = new AbortController()
  return { signal: ctrl.signal, cancel: (r = 'Cancelled') => ctrl.abort(r) }
}

export async function uploadFile(url, formData, onProgress) {
  return apiClient.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: ({ loaded, total }) =>
      total && onProgress?.(Math.round((loaded * 100) / total)),
  })
}

export default apiClient
