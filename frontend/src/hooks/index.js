/**
 * hooks/index.js — Shifa Hooks Barrel Export
 * ─────────────────────────────────────────────────────────────────────────────
 * Import any hook from '@/hooks' without knowing the file name.
 *
 * Example:
 *   import { useAuth, useVisit, useAIChat } from '@/hooks'
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Auth & User
export { useAuth } from './useAuth'
export { useOTP } from './useOTP'

// Data hooks (TanStack Query-backed)
export { useVisit } from './useVisit'
export { usePatients, usePatient, usePatientVisits } from './usePatients'
export { useDoctorDashboard } from './useDoctorDashboard'
export { useDoctorStats } from './useDoctorStats'
export { usePublicPortal, TOKEN_STATE } from './usePublicPortal'

// Feature hooks
export { useAIChat } from './useAIChat'
export { useVoiceInput } from './useVoiceInput'
export { useFileUpload } from './useFileUpload'
export { useNewVisit, STEPS, TOTAL_STEPS } from './useNewVisit'
export { useDoctorNotifications, useReminders } from './useNotifications'

// i18n
export { useLanguage, INDIAN_LANGUAGES } from './useLanguage'

// Infrastructure
export { useWebSocket } from './useWebSocket'
export { useLocalStorage } from './useLocalStorage'
export { useDebounce, useDebouncedCallback } from './useDebounce'
