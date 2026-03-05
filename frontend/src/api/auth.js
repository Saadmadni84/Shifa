import apiClient, { tokenStore } from './client'

export async function loginDoctor(credentials) {
  const { data } = await apiClient.post('/auth/login', credentials)
  _storeAuth(data)
  return data
}

export async function registerDoctor(payload) {
  const { data } = await apiClient.post('/auth/register', payload)
  _storeAuth(data)
  return data
}

export async function requestPatientOTP(phoneNumber) {
  const { data } = await apiClient.post('/auth/patient/otp/request', {
    phoneNumber,
  })
  return data
}

export async function verifyPatientOTP({ phoneNumber, otp }) {
  const { data } = await apiClient.post('/auth/patient/otp/verify', {
    phoneNumber,
    otp,
  })
  _storeAuth(data)
  return data
}

export async function logout() {
  try {
    await apiClient.post('/auth/logout')
  } finally {
    tokenStore.clearAll()
  }
}

export async function refreshAccessToken() {
  const refreshToken = tokenStore.getRefresh()
  const { data } = await apiClient.post('/auth/refresh', { refreshToken })
  tokenStore.setAccess(data.accessToken)
  if (data.refreshToken) tokenStore.setRefresh(data.refreshToken)
  return data
}

export async function getCurrentUser() {
  const { data } = await apiClient.get('/auth/me')
  tokenStore.setUser(data)
  return data
}

export function isLoggedIn() {
  return Boolean(tokenStore.getAccess())
}

export function getCachedUser() {
  return tokenStore.getUser()
}

function _storeAuth({ accessToken, refreshToken, user }) {
  if (accessToken) tokenStore.setAccess(accessToken)
  if (refreshToken) tokenStore.setRefresh(refreshToken)
  if (user) tokenStore.setUser(user)
}
