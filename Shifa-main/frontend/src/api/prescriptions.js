import apiClient from './client'

export async function getPrescription(visitId) {
  const { data } = await apiClient.get(`/visits/${visitId}/prescription`)
  return data
}

export async function updatePrescription(visitId, updates) {
  const { data } = await apiClient.put(`/visits/${visitId}/prescription`, updates)
  return data
}

export async function addMedication(visitId, medication) {
  const { data } = await apiClient.post(
    `/visits/${visitId}/prescription/medications`,
    medication
  )
  return data
}

export async function updateMedication(visitId, medicationId, updates) {
  const { data } = await apiClient.put(
    `/visits/${visitId}/prescription/medications/${medicationId}`,
    updates
  )
  return data
}

export async function removeMedication(visitId, medicationId) {
  await apiClient.delete(`/visits/${visitId}/prescription/medications/${medicationId}`)
}

export async function reorderMedications(visitId, orderedIds) {
  const { data } = await apiClient.post(`/visits/${visitId}/prescription/reorder`, {
    orderedIds,
  })
  return data
}

export async function searchDrugs(query) {
  if (query.length < 2) return []
  const { data } = await apiClient.get('/medications/search', {
    params: { q: query },
  })
  return data
}

export async function getPatientMedicationHistory(patientId) {
  const { data } = await apiClient.get(`/patients/${patientId}/medications`)
  return data
}
