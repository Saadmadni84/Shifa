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
  const profile = await getMyProfile()
  return {
    ...profile,
    profilePhotoUrl: URL.createObjectURL(file),
  }
}

export async function getDashboardStats(signal) {
  const { data } = await apiClient.get('/doctors/me/stats', { signal })
  return data
}

export async function getVisitTrend(days = 30) {
  const stats = await getDashboardStats()
  const visits = stats?.monthVisits ?? 0
  return {
    days,
    points: [{ day: 1, visits }],
  }
}

export async function getMyPatients({ page = 0, size = 20, q, signal } = {}) {
  const { data } = await apiClient.get('/doctors/me/patients', {
    params: { page, size, search: q },
    signal,
  })
  return data
}

export async function searchDoctors({ q, specialization, page = 0, size = 20 } = {}) {
  const me = await getMyProfile()
  return {
    content: me ? [me] : [],
    pageNumber: page,
    pageSize: size,
    totalElements: me ? 1 : 0,
    totalPages: me ? 1 : 0,
    first: true,
    last: true,
  }
}

export async function getDoctorById(doctorId) {
  return getMyProfile()
}
