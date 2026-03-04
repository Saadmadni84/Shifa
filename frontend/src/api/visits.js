import apiClient, { makeCancellable } from './client'

export async function createVisit(payload) {
	const { data } = await apiClient.post('/visits', payload)
	return data
}

export async function getVisit(visitId, signal) {
	const { data } = await apiClient.get(`/visits/${visitId}`, { signal })
	return data
}

export async function updateVisit(visitId, updates) {
	const { data } = await apiClient.put(`/visits/${visitId}`, updates)
	return data
}

export async function deleteVisit(visitId) {
	await apiClient.delete(`/visits/${visitId}`)
}

export async function processVisitWithAI(visitId) {
	const { data } = await apiClient.post(`/visits/${visitId}/process`)
	return data
}

export async function pollVisitUntilReady(visitId, onStatusChange, maxWaitMs = 180_000) {
	const INTERVAL = 2_500
	const deadline = Date.now() + maxWaitMs
	const { signal, cancel } = makeCancellable()

	const TERMINAL_STATUSES = new Set([
		'REVIEWED',
		'NOTES_TAKEN',
		'SENT_TO_PATIENT',
		'COMPLETED',
	])

	try {
		while (Date.now() < deadline) {
			await sleep(INTERVAL)
			const visit = await getVisit(visitId, signal)
			onStatusChange?.(visit.status)

			if (TERMINAL_STATUSES.has(visit.status)) {
				if (visit.status === 'NOTES_TAKEN') {
					throw new Error('AI processing failed. Please try again.')
				}
				return visit
			}
		}
		throw new Error('AI processing timed out after 3 minutes.')
	} finally {
		cancel()
	}
}

export async function getVisitAISummary(visitId) {
	const { data } = await apiClient.get(`/visits/${visitId}/summary`)
	return data
}

export async function sendVisitToPatient(visitId) {
	const { data } = await apiClient.post(`/visits/${visitId}/send`)
	return data
}

export async function generateSummaryInLanguage(visitId, languageCode) {
	const { data } = await apiClient.post(`/visits/${visitId}/translate`, { languageCode })
	return data
}

export async function updateVisitStatus(visitId, status) {
	const { data } = await apiClient.patch(`/visits/${visitId}/status`, { status })
	return data
}

export async function recordVitals(visitId, vitals) {
	const { data } = await apiClient.post(`/visits/${visitId}/vitals`, vitals)
	return data
}

export async function getVitals(visitId) {
	const { data } = await apiClient.get(`/visits/${visitId}/vitals`)
	return data
}

export async function getDoctorVisits({ page = 0, size = 20, status, signal } = {}) {
	const { data } = await apiClient.get('/visits', {
		params: { page, size, status },
		signal,
	})
	return data
}

export async function searchVisits(query, { page = 0, size = 10 } = {}) {
	const { data } = await apiClient.get('/visits/search', {
		params: { q: query, page, size },
	})
	return data
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
