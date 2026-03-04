import apiClient from './client'

export async function getMyProfile() {
  const { data } = await apiClient.get('/doctors/me')
  return data
}

export async function updateMyProfile(updates) {
  const { data } = await apiClient.put('/doctors/me', updates)
  return data
}

export async function uploadProfilePhoto(file) {
  const form = new FormData()
  form.append('photo', file)
  const { data } = await apiClient.post('/doctors/me/photo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function getDashboardStats(signal) {
  const { data } = await apiClient.get('/doctors/me/stats', { signal })
  return data
}

export async function getVisitTrend(days = 30) {
  const { data } = await apiClient.get('/doctors/me/stats/trend', {
    params: { days },
  })
  return data
}

export async function getMyPatients({ page = 0, size = 20, q, signal } = {}) {
  const { data } = await apiClient.get('/doctors/me/patients', {
    params: { page, size, q },
    signal,
  })
  return data
}

export async function searchDoctors({ q, specialization, page = 0, size = 20 } = {}) {
  const { data } = await apiClient.get('/doctors', {
    params: { q, specialization, page, size },
  })
  return data
}

export async function getDoctorById(doctorId) {
  const { data } = await apiClient.get(`/doctors/${doctorId}`)
  return data
}
