import apiClient from './client'

export async function getNotifications({ unreadOnly = false, page = 0, size = 20 } = {}) {
  const { data } = await apiClient.get('/notifications', {
    params: { unreadOnly, page, size },
  })
  return data
}

export async function markNotificationRead(notificationId) {
  const { data } = await apiClient.patch(`/notifications/${notificationId}/read`)
  return data
}

export async function markAllNotificationsRead() {
  const { data } = await apiClient.post('/notifications/mark-all-read')
  return data
}

export async function deleteNotification(notificationId) {
  await apiClient.delete(`/notifications/${notificationId}`)
}

export async function getUnreadCount() {
  const { data } = await apiClient.get('/notifications/unread-count')
  return data
}

export async function getWhatsAppStatus(visitId) {
  const { data } = await apiClient.get(`/visits/${visitId}/whatsapp-status`)
  return data
}

export async function retryWhatsAppSend(visitId) {
  const { data } = await apiClient.post(`/visits/${visitId}/whatsapp-retry`)
  return data
}

export async function createReminder(patientId, reminder) {
  const { data } = await apiClient.post(`/patients/${patientId}/reminders`, reminder)
  return data
}

export async function createMedicineReminders(visitId, options = {}) {
  const { data } = await apiClient.post(`/visits/${visitId}/reminders`, options)
  return data
}

export async function getPatientReminders(patientId, { status } = {}) {
  const { data } = await apiClient.get(`/patients/${patientId}/reminders`, {
    params: { status },
  })
  return data
}

export async function cancelReminder(reminderId) {
  await apiClient.delete(`/reminders/${reminderId}`)
}
