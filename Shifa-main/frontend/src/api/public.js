import axios from 'axios'
import { normaliseError } from './client'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const publicClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Platform': 'patient-portal',
  },
})

publicClient.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(normaliseError(err))
)

export async function getPortalVisit(token) {
  const { data } = await publicClient.get(`/public/visits/${token}`)
  return data
}

export async function getPortalVisitInLanguage(token, languageCode) {
  const { data } = await publicClient.get(`/public/visits/${token}`, {
    params: { lang: languageCode },
  })
  return data
}

export async function getPortalMedications(token) {
  const { data } = await publicClient.get(`/public/visits/${token}/medicines`)
  return data
}

export async function getPortalVitals(token) {
  const { data } = await publicClient.get(`/public/visits/${token}/vitals`)
  return data
}

export async function askFollowUpQuestion(token, question) {
  const { data } = await publicClient.post(`/public/visits/${token}/ask`, {
    question,
  })
  return data
}

export async function getSupportedLanguages() {
  const { data } = await publicClient.get('/public/languages')
  return data
}

export async function validatePortalToken(token) {
  try {
    const { data } = await publicClient.get(`/public/visits/${token}/validate`)
    return data
  } catch (err) {
    if (err.status === 404 || err.status === 410) {
      return { valid: false, expiresAt: null }
    }
    throw err
  }
}
