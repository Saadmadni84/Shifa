import apiClient, { uploadFile } from './client'

/**
 * Create a new patient-uploaded visit (no doctor required).
 * POST /api/patient/visits/upload
 */
export async function createPatientVisit(payload) {
  const body = {
    visitDate: payload.visitDate || new Date().toISOString().slice(0, 10),
    hospitalName: payload.hospitalName || null,
    doctorName: payload.doctorName || null,
    chiefComplaint: payload.chiefComplaint || null,
    notes: payload.notes || null,
    visitType: payload.visitType || 'General',
  }
  const { data } = await apiClient.post('/patient/visits/upload', body)
  return data
}

/**
 * Upload a document (PDF, image) or audio recording to an existing visit.
 * POST /api/patient/visits/:visitId/documents
 */
export async function uploadVisitDocumentByPatient(visitId, file, documentType = 'OTHER', onProgress) {
  const form = new FormData()
  form.append('file', file)
  form.append('documentType', documentType)
  const { data } = await uploadFile(`/patient/visits/${visitId}/documents`, form, onProgress)
  return data
}

/**
 * Fetch all visits belonging to the logged-in patient.
 * GET /api/patient/visits
 */
export async function getMyVisits() {
  const { data } = await apiClient.get('/patient/visits')
  return Array.isArray(data) ? data : []
}

export const patientVisitsApi = {
  createPatientVisit,
  uploadVisitDocumentByPatient,
  getMyVisits,
}
