export { default as apiClient } from './client'
export { normaliseError, makeCancellable, uploadFile, tokenStore } from './client'

export {
  loginDoctor,
  registerDoctor,
  requestPatientOTP,
  verifyPatientOTP,
  logout,
  refreshAccessToken,
  getCurrentUser,
  isLoggedIn,
  getCachedUser,
} from './auth'

export {
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
} from './patients'

export {
  createVisit,
  getVisit,
  updateVisit,
  deleteVisit,
  processVisitWithAI,
  pollVisitUntilReady,
  getVisitAISummary,
  sendVisitToPatient,
  generateSummaryInLanguage,
  updateVisitStatus,
  recordVitals,
  getVitals,
  getDoctorVisits,
  searchVisits,
} from './visits'

export {
  getPrescription,
  updatePrescription,
  addMedication,
  updateMedication,
  removeMedication,
  reorderMedications,
  searchDrugs,
  getPatientMedicationHistory,
} from './prescriptions'

export {
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  getDashboardStats,
  getVisitTrend,
  getMyPatients,
  searchDoctors,
  getDoctorById,
} from './doctors'

export {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getUnreadCount,
  getWhatsAppStatus,
  retryWhatsAppSend,
  createReminder,
  createMedicineReminders,
  getPatientReminders,
  cancelReminder,
} from './notifications'

export {
  uploadVisitDocument,
  uploadPatientDocument,
  getVisitDocuments,
  getPatientDocuments,
  getDocumentDownloadUrl,
  openDocument,
  downloadDocument,
  deleteDocument,
  triggerOCR,
  getOCRResult,
  pollOCRResult,
  validateFile,
} from './documents'

export {
  getPortalVisit,
  getPortalVisitInLanguage,
  getPortalMedications,
  getPortalVitals,
  askFollowUpQuestion,
  getSupportedLanguages,
  validatePortalToken,
} from './public'
