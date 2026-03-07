import apiClient, { tokenStore } from './client'

export async function loginDoctor(credentials) {
  const { data } = await apiClient.post('/auth/login', credentials)
  const normalized = normalizeAuth(data)
  _storeAuth(normalized)
  return normalized
}

export async function registerDoctor(payload) {
  const firstName = payload.firstName?.trim() || 'Doctor'
  const body = {
    ...payload,
    clinicName: payload.clinicName?.trim() || `${firstName} Clinic`,
    clinicAddress: payload.clinicAddress?.trim() || '',
    preferredLanguage: payload.preferredLanguage || 'en',
    phoneNumber: normaliseIndianPhone(payload.phoneNumber),
  }
  const { data } = await apiClient.post('/auth/register', body)
  const normalized = normalizeAuth(data)
  _storeAuth(normalized)
  return normalized
}

export async function registerPatientAccount(payload) {
  const body = {
    ...payload,
    preferredLanguage: payload.preferredLanguage || 'hi',
    phoneNumber: normaliseIndianPhone(payload.phoneNumber),
  }
  const { data } = await apiClient.post('/auth/register/patient', body)
  return normalizeAuth(data)
}

export async function requestPatientOTP(phoneNumber) {
  const { data } = await apiClient.post('/auth/patient/otp/request', {
    phoneNumber: normaliseIndianPhone(phoneNumber),
  })
  return data
}

export async function verifyPatientOTP({ phoneNumber, otp }) {
  const { data } = await apiClient.post('/auth/patient/otp/verify', {
    phoneNumber: normaliseIndianPhone(phoneNumber),
    otp,
  })
  const normalized = normalizeAuth(data)
  _storeAuth(normalized)
  return normalized
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
  const normalized = normalizeAuth(data)
  tokenStore.setAccess(normalized.accessToken)
  if (normalized.refreshToken) tokenStore.setRefresh(normalized.refreshToken)
  return normalized
}

export async function getCurrentUser() {
  const { data } = await apiClient.get('/auth/me')
  const user = {
    id: data.userId,
    email: data.username,
    role: data.role,
    displayName: data.displayName,
  }
  tokenStore.setUser(user)
  return user
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

function normalizeAuth(data = {}) {
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: {
      id: data.userId,
      email: data.email,
      phoneNumber: data.phoneNumber,
      role: data.role,
      displayName: data.displayName,
      preferredLanguage: data.preferredLanguage,
      specialization: data.specialization,
      clinicName: data.clinicName,
      registrationNumber: data.registrationNumber,
      abhaId: data.abhaId,
    },
  }
}

function normaliseIndianPhone(phone) {
  if (!phone) return phone
  const digits = String(phone).replace(/\D+/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length === 10) return digits
  return digits
}
