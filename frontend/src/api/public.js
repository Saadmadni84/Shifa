import axios from 'axios'
import { normaliseError } from './client'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

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
  const { data } = await publicClient.get(`/portal/${token}`)
  return {
    ...data,
    summaries: {
      [String(data.preferredLanguage || 'EN').toUpperCase()]: data.summaryText || '',
    },
  }
}

export async function getPortalVisitInLanguage(token, languageCode) {
  const { data } = await publicClient.get(`/portal/${token}/summary`, {
    params: { lang: languageCode },
  })
  return data
}

export async function getPortalMedications(token) {
  const visit = await getPortalVisit(token)
  return visit.medications || []
}

export async function getPortalVitals(token) {
  return null
}

export async function askFollowUpQuestion(token, question) {
  const payload = typeof question === 'string' ? { question } : question
  const { data } = await publicClient.post(`/chat/${token}`, payload)
  return data
}

export async function getSupportedLanguages() {
  const { data } = await publicClient.get('/languages')
  return data
}

export async function validatePortalToken(token) {
  try {
    const data = await getPortalVisit(token)
    return { valid: Boolean(data?.portalAccessValid), expiresAt: null }
  } catch (err) {
    if (err.status === 404 || err.status === 410) {
      return { valid: false, expiresAt: null }
    }
    throw err
  }
}
