import apiClient from './client'

export async function registerPatient(payload) {
	const { data } = await apiClient.post('/patients', payload)
	return data
}

export async function getPatient(patientId) {
	const { data } = await apiClient.get(`/patients/${patientId}`)
	return data
}

export async function updatePatient(patientId, updates) {
	const { data } = await apiClient.put(`/patients/${patientId}`, updates)
	return data
}

export async function deletePatient(patientId) {
	await apiClient.delete(`/patients/${patientId}`)
}

export async function searchPatients(params = {}) {
	const query =
		typeof params === 'string'
			? params
			: params.query ?? params.q ?? params.phone ?? params.abha ?? ''

	const { data } = await apiClient.get('/patients/search', {
		params: {
			query,
			page: typeof params === 'string' ? 0 : params.page ?? 0,
			size: typeof params === 'string' ? 20 : params.size ?? 20,
		},
	})
	return normalisePage(data)
}

export async function getDoctorPatients({ page = 0, size = 20, signal } = {}) {
	const { data } = await apiClient.get('/doctors/me/patients', {
		params: { page, size },
		signal,
	})
	return normalisePage(data)
}

export async function getPatientVisits(patientId, { page = 0, size = 10 } = {}) {
	const { data } = await apiClient.get(`/patients/${patientId}/visits`, {
		params: { page, size },
	})
	return data
}

export async function getPatientConditions(patientId) {
	const { data } = await apiClient.get(`/patients/${patientId}/conditions`)
	return data
}

export async function getPatientHealthRecord(patientId) {
	const { data } = await apiClient.get(`/patients/${patientId}/health-record`)
	return data
}

export async function getPatientVitalsHistory(patientId, { from, to } = {}) {
	const { data } = await apiClient.get(`/patients/${patientId}/vitals`, {
		params: { from, to },
	})
	return data
}

export async function exportPatientData(patientId) {
	const { data } = await apiClient.get(`/patients/${patientId}/export`, {
		responseType: 'blob',
	})
	const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
	const link = document.createElement('a')
	link.href = url
	link.download = `shifa-patient-data-${patientId}.json`
	link.click()
	URL.revokeObjectURL(url)
}

export async function requestPatientErasure(patientId, reason) {
	const { data } = await apiClient.post(`/patients/${patientId}/erase`, { reason })
	return data
}

export async function recordConsent(patientId, payload) {
	const { data } = await apiClient.post(`/patients/${patientId}/consents`, payload)
	return data
}

export async function getPatientConsents(patientId) {
	const { data } = await apiClient.get(`/patients/${patientId}/consents`)
	return data
}

export const patientsApi = {
	registerPatient,
	getPatient,
	updatePatient,
	deletePatient,
	searchPatients,
	getDoctorPatients,
	getPatientVisits,
	getPatientConditions,
	getPatientHealthRecord,
	getPatientVitalsHistory,
	exportPatientData,
	requestPatientErasure,
	recordConsent,
	getPatientConsents,
	// Aliases for hook compatibility
	list: searchPatients,
	create: registerPatient,
	update: updatePatient,
	get: getPatient,
	getVisitHistory: getPatientVisits,
}

function normalisePage(data) {
	if (!data) return { content: [], pageable: { pageNumber: 0 }, totalPages: 0, totalElements: 0 }
	return {
		...data,
		pageable: { pageNumber: data.pageNumber ?? data.pageable?.pageNumber ?? 0 },
	}
}


