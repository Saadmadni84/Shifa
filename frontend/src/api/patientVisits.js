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
 * Upload an audio recording to an existing visit.
 * POST /api/patient/visits/:visitId/audio
 */
export async function uploadVisitAudioByPatient(visitId, file, onProgress) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await uploadFile(`/patient/visits/${visitId}/audio`, form, onProgress)
  return data
}

/**
 * Create visit first, then optionally upload one document and/or one audio file.
 */
export async function submitPatientVisit({ visit, documentFile, audioFile, documentType = 'OTHER', onProgress }) {
  const created = await createPatientVisit(visit)
  const visitId = created?.visitId

  if (documentFile && visitId) {
    await uploadVisitDocumentByPatient(visitId, documentFile, documentType, onProgress)
  }

  if (audioFile && visitId) {
    await uploadVisitAudioByPatient(visitId, audioFile, onProgress)
  }

  return created
}

/**
 * Fetch all visits belonging to the logged-in patient.
 * GET /api/patient/visits
 */
export async function getMyVisits() {
  const { data } = await apiClient.get('/patient/visits')
  return Array.isArray(data) ? data : []
}

/**
 * Send a chat message from authenticated patient to Shifa AI RAG service
 * POST /api/patient/chat
 */
export async function sendPatientChat({ question, sessionId }) {
  const { data } = await apiClient.post('/patient/chat', { question, sessionId })
  return data
}

export const patientVisitsApi = {
  createPatientVisit,
  uploadVisitDocumentByPatient,
  uploadVisitAudioByPatient,
  submitPatientVisit,
  getMyVisits,
  sendPatientChat,
}
