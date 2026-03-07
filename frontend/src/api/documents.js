import apiClient, { uploadFile } from './client'

export async function uploadVisitDocument(visitId, file, options = {}, onProgress) {
  const form = new FormData()
  form.append('visitId', visitId)
  form.append('file', file)
  form.append('patientId', options.patientId ?? '')

  const { data } = await uploadFile('/documents/upload', form, onProgress)
  return data
}

export async function uploadPatientDocument(patientId, file, options = {}, onProgress) {
  const form = new FormData()
  form.append('patientId', patientId)
  form.append('file', file)

  const { data } = await uploadFile('/documents/upload', form, onProgress)
  return data
}

export async function getVisitDocuments(visitId) {
  const { data } = await apiClient.get(`/documents/visit/${visitId}`)
  return data
}

export async function getPatientDocuments(patientId, { documentType } = {}) {
  const { data } = await apiClient.get(`/documents/patient/${patientId}`, {
    params: { documentType },
  })
  return data
}

export async function getDocumentDownloadUrl(documentId) {
  const { data } = await apiClient.get(`/documents/${documentId}/url`)
  return data
}

export async function openDocument(documentId) {
  const { url } = await getDocumentDownloadUrl(documentId)
  window.open(url, '_blank', 'noopener,noreferrer')
}

export async function downloadDocument(documentId, filename) {
  const { url } = await getDocumentDownloadUrl(documentId)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
}

export async function deleteDocument(documentId) {
  await apiClient.delete(`/documents/${documentId}`)
}

export async function triggerOCR(documentId) {
  const { data } = await apiClient.post(`/documents/${documentId}/ocr`)
  return data
}

export async function getOCRResult(documentId) {
  const { data } = await apiClient.get(`/documents/${documentId}/ocr`)
  return data
}

export async function pollOCRResult(documentId, maxWaitMs = 60_000) {
  const INTERVAL = 2_000
  const deadline = Date.now() + maxWaitMs

  while (Date.now() < deadline) {
    await sleep(INTERVAL)
    const result = await getOCRResult(documentId)
    if (result?.text || result?.rawText) return result
  }
  throw new Error('OCR processing timed out.')
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function validateFile(
  file,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  maxBytes = 10 * 1024 * 1024
) {
  if (!file) return 'No file selected.'
  if (!allowedTypes.includes(file.type)) {
    return `File type not allowed. Please upload: ${allowedTypes.join(', ')}`
  }
  if (file.size > maxBytes) {
    const mb = (maxBytes / 1024 / 1024).toFixed(0)
    return `File too large. Maximum size is ${mb} MB.`
  }
  return null
}
