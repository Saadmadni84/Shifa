import apiClient, { makeCancellable } from './client'

export async function createVisit(payload) {
	const visitTypeMap = {
		'Office Visit': 'IN_PERSON',
		'Follow-up': 'IN_PERSON',
		Telemedicine: 'TELEMEDICINE',
		Emergency: 'IN_PERSON',
		Procedure: 'IN_PERSON',
		'Lab Review': 'IN_PERSON',
	}

	const body = {
		patientId: payload.patientId,
		visitDate: payload.visitDate || new Date().toISOString().slice(0, 10),
		visitType: visitTypeMap[payload.visitType] || payload.visitType || 'IN_PERSON',
		chiefComplaint: payload.chiefComplaint || payload.doctorNotes || '',
		rawNotes: payload.rawNotes || payload.doctorNotes || '',
		followUpDate: payload.followUpDate || undefined,
	}

	const { data } = await apiClient.post('/visits', body)
	return data
}

export async function getVisit(visitId, signal) {
	const { data } = await apiClient.get(`/visits/${visitId}`, { signal })
	return data
}

export async function updateVisit(visitId, updates) {
	const { data } = await apiClient.put(`/visits/${visitId}/notes`, updates)
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
	const visit = await getVisit(visitId)
	return visit?.aiSummary ?? null
}

export async function sendVisitToPatient(visitId) {
	const { data } = await apiClient.post(`/visits/${visitId}/send`)
	return data
}

export async function generateSummaryInLanguage(visitId, languageCode) {
	const visit = await getVisit(visitId)
	return visit?.aiSummary?.patientFriendlyText ?? ''
}

export async function updateVisitStatus(visitId, status) {
	if (status === 'REVIEWED') {
		return getVisit(visitId)
	}
	if (status === 'SENT_TO_PATIENT') {
		return sendVisitToPatient(visitId)
	}
	return getVisit(visitId)
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
	return normalisePage(data)
}

export async function searchVisits(query, { page = 0, size = 10 } = {}) {
	const data = await getDoctorVisits({ page, size })
	const q = (query || '').toLowerCase()
	return (data.content || []).filter((v) => {
		const patient = `${v.patient?.fullName || ''}`.toLowerCase()
		const diagnosis = `${v.diagnosis || ''}`.toLowerCase()
		return patient.includes(q) || diagnosis.includes(q)
	})
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const visitsApi = {
	getVisit,
	createVisit,
	updateVisit,
	deleteVisit,
	processVisit: processVisitWithAI,
	sendToPatient: sendVisitToPatient,
	updateVisitStatus,
	getVisitAISummary,
	generateSummaryInLanguage,
	pollVisitUntilReady,
	recordVitals,
	getVitals,
	getDoctorVisits,
	searchVisits,
}

function normalisePage(data) {
	if (!data) return { content: [], pageable: { pageNumber: 0 }, totalPages: 0, totalElements: 0 }
	return {
		...data,
		pageable: { pageNumber: data.pageNumber ?? data.pageable?.pageNumber ?? 0 },
	}
}

