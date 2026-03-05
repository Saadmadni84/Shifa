/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║               SHIFA — Complete Store (store/index.js)                   ║
 * ║         All 8 Zustand stores combined into one file                     ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  1. authStore         — JWT, OTP flow, session expiry                   ║
 * ║  2. patientStore      — Patient search, selection, history              ║
 * ║  3. visitStore        — Full visit lifecycle + AI polling               ║
 * ║  4. summaryStore      — AI summary + patient portal + chat              ║
 * ║  5. languageStore     — 10 Indian languages + Noto fonts                ║
 * ║  6. notificationStore — Bell, WhatsApp status, reminders               ║
 * ║  7. doctorStore       — Profile, dashboard stats, avatar               ║
 * ║  8. uiStore           — Sidebar, toasts, modals, theme                 ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  Usage (import from anywhere in the app):                               ║
 * ║    import { useAuthStore, useVisitStore, VISIT_STATUS } from '@/store'  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

// ─── API imports ──────────────────────────────────────────────────────────
import { loginDoctor, registerDoctor, requestPatientOTP, verifyPatientOTP, logout as apiLogout, getCurrentUser } from '@/api/auth'
import { tokenStore } from '@/api/client'
import { getPatient, searchPatients, getDoctorPatients, getPatientVisits, registerPatient, updatePatient, getPatientConditions } from '@/api/patients'
import { createVisit, getVisit, updateVisit, deleteVisit, processVisitWithAI, pollVisitUntilReady, getVisitAISummary, sendVisitToPatient, generateSummaryInLanguage, updateVisitStatus, recordVitals, getVitals, getDoctorVisits, searchVisits } from '@/api/visits'
import { getPortalVisit, getPortalVisitInLanguage, getPortalMedications, askFollowUpQuestion, getSupportedLanguages } from '@/api/public'
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification, getUnreadCount, getWhatsAppStatus, retryWhatsAppSend, createReminder, createMedicineReminders, getPatientReminders, cancelReminder } from '@/api/notifications'
import { getMyProfile, updateMyProfile, uploadProfilePhoto, getDashboardStats, getVisitTrend } from '@/api/doctors'


// ════════════════════════════════════════════════════════════════════════════
//  SECTION 1 — AUTH STORE
//  Manages: JWT tokens, OTP flow, session expiry, role helpers
// ════════════════════════════════════════════════════════════════════════════

const OTP_COUNTDOWN_SECONDS = 60

export const useAuthStore = create(
    devtools(
        persist(
            (set, get) => ({
                // ── State ──────────────────────────────────────────────────────
                user: null,       // { id, firstName, lastName, email, role, avatarUrl, language }
                token: null,       // access token (mirror of localStorage for reactivity)
                refreshToken: null,
                isLoading: false,
                error: null,

                // OTP flow
                otpPhone: null,       // phone number we sent OTP to
                otpStep: 'idle',     // 'idle' | 'sent' | 'verifying' | 'done'
                otpCountdown: 0,          // seconds remaining before resend allowed
                _otpTimer: null,       // internal interval ref (not serialised)

                // ── Computed helpers ───────────────────────────────────────────
                isAuthenticated: () => !!get().token && !!get().user,
                isDoctor: () => get().user?.role === 'DOCTOR',
                isPatient: () => get().user?.role === 'PATIENT',
                isAdmin: () => get().user?.role === 'ADMIN',
                userFullName: () => {
                    const u = get().user
                    return u ? `${u.firstName} ${u.lastName}`.trim() : ''
                },

                // ── Actions ────────────────────────────────────────────────────

                /** Doctor login (email + password) */
                loginWithEmail: async (credentials) => {
                    set({ isLoading: true, error: null })
                    try {
                        const data = await loginDoctor(credentials)
                        set({ user: data.user, token: data.accessToken, refreshToken: data.refreshToken, isLoading: false, error: null })
                        return data
                    } catch (err) {
                        set({ isLoading: false, error: err.message })
                        throw err
                    }
                },

                /** Doctor registration */
                register: async (payload) => {
                    set({ isLoading: true, error: null })
                    try {
                        const data = await registerDoctor(payload)
                        set({ user: data.user, token: data.accessToken, refreshToken: data.refreshToken, isLoading: false })
                        return data
                    } catch (err) {
                        set({ isLoading: false, error: err.message })
                        throw err
                    }
                },

                /** Patient OTP login — step 1: send OTP to WhatsApp/SMS */
                requestOtp: async (phone) => {
                    set({ isLoading: true, error: null, otpPhone: phone })
                    try {
                        await requestPatientOTP(phone)
                        get()._startOtpCountdown()
                        set({ isLoading: false, otpStep: 'sent' })
                    } catch (err) {
                        set({ isLoading: false, error: err.message, otpStep: 'idle' })
                        throw err
                    }
                },

                /** Patient OTP login — step 2: verify 6-digit code */
                verifyOtp: async (otp) => {
                    const phone = get().otpPhone
                    if (!phone) throw new Error('No phone number found. Please restart.')
                    set({ isLoading: true, otpStep: 'verifying', error: null })
                    try {
                        const data = await verifyPatientOTP({ phone, otp })
                        set({ user: data.user, token: data.accessToken, refreshToken: data.refreshToken, isLoading: false, otpStep: 'done' })
                        get()._clearOtpTimer()
                        return data
                    } catch (err) {
                        set({ isLoading: false, otpStep: 'sent', error: err.message })
                        throw err
                    }
                },

                /** Logout — clear all auth state + localStorage tokens */
                logout: async () => {
                    try { await apiLogout() } catch (_) { /* fire and forget */ }
                    get()._clearOtpTimer()
                    tokenStore.clearAll()
                    set({ user: null, token: null, refreshToken: null, otpPhone: null, otpStep: 'idle', otpCountdown: 0, error: null })
                },

                /** Re-fetch user from /auth/me (e.g. after profile update) */
                refreshUser: async () => {
                    try {
                        const user = await getCurrentUser()
                        set({ user })
                    } catch (_) { /* silent */ }
                },

                /** Called by client.js after silent token refresh */
                setToken: (accessToken) => set({ token: accessToken }),

                /** Quick sync set */
                setAuth: (user, token) => set({ user, token }),

                /** Called when 'shifa:session-expired' fires */
                handleSessionExpiry: () => {
                    get()._clearOtpTimer()
                    tokenStore.clearAll()
                    set({ user: null, token: null, refreshToken: null, error: 'Your session expired. Please log in again.' })
                },

                clearError: () => set({ error: null }),

                // ── Private helpers ────────────────────────────────────────────
                _startOtpCountdown: () => {
                    get()._clearOtpTimer()
                    set({ otpCountdown: OTP_COUNTDOWN_SECONDS })
                    const timer = setInterval(() => {
                        const current = get().otpCountdown
                        if (current <= 1) {
                            get()._clearOtpTimer()
                            set({ otpCountdown: 0 })
                        } else {
                            set({ otpCountdown: current - 1 })
                        }
                    }, 1000)
                    set({ _otpTimer: timer })
                },

                _clearOtpTimer: () => {
                    const timer = get()._otpTimer
                    if (timer) { clearInterval(timer); set({ _otpTimer: null }) }
                },
            }),
            {
                name: 'shifa-auth',
                partialize: (state) => ({ user: state.user, token: state.token, refreshToken: state.refreshToken }),
                onRehydrateStorage: () => (state) => {
                    if (state?.token) tokenStore.setAccess(state.token)
                    if (state?.refreshToken) tokenStore.setRefresh(state.refreshToken)
                    if (state?.user) tokenStore.setUser(state.user)
                },
            }
        ),
        { name: 'AuthStore' }
    )
)

/** Call once in main.jsx to wire up global session-expiry event */
export function attachSessionExpiryListener() {
    window.addEventListener('shifa:session-expired', () => {
        useAuthStore.getState().handleSessionExpiry()
    })
}


// ════════════════════════════════════════════════════════════════════════════
//  SECTION 2 — PATIENT STORE
//  Manages: selected patient, search, paginated list, visit history cache
// ════════════════════════════════════════════════════════════════════════════

export const usePatientStore = create(
    devtools(
        (set, get) => ({
            // ── State ────────────────────────────────────────────────────────
            selectedPatient: null,
            patients: [],
            patientsMeta: { page: 0, totalPages: 0, totalElements: 0 },
            patientsLoading: false,
            searchQuery: '',
            searchResults: [],
            searchLoading: false,
            patientDetail: null,
            patientDetailLoading: false,
            visitHistory: {},   // { [patientId]: Visit[] }
            visitHistoryLoading: false,
            conditionsCache: {},   // { [patientId]: string[] }
            quickAddOpen: false,
            quickAddLoading: false,
            error: null,

            // ── Computed ─────────────────────────────────────────────────────
            hasSelectedPatient: () => !!get().selectedPatient,
            getPatientById: (id) => get().patients.find(p => p.id === id) || get().patientDetail,

            // ── Actions ──────────────────────────────────────────────────────

            /** Set active patient context; fetches full details if needed */
            selectPatient: async (patientOrId) => {
                const isObj = typeof patientOrId === 'object'
                const id = isObj ? patientOrId.id : patientOrId
                if (isObj) set({ selectedPatient: patientOrId })
                if (!isObj || !patientOrId.phone) {
                    try {
                        const patient = await getPatient(id)
                        set({ selectedPatient: patient })
                    } catch (err) { set({ error: err.message }) }
                }
            },

            clearSelectedPatient: () => set({ selectedPatient: null }),

            /** Fuzzy search across name, phone, ABHA — debounce in component */
            search: async (query) => {
                set({ searchQuery: query, searchLoading: true })
                if (!query.trim()) { set({ searchResults: [], searchLoading: false }); return }
                try {
                    const results = await searchPatients(query)
                    set({ searchResults: results, searchLoading: false })
                } catch (err) { set({ searchLoading: false, error: err.message }) }
            },

            clearSearch: () => set({ searchQuery: '', searchResults: [] }),

            /** Paginated list for doctor dashboard */
            loadPatients: async (params = {}) => {
                set({ patientsLoading: true, error: null })
                try {
                    const data = await getDoctorPatients({ page: 0, size: 20, sort: 'createdAt,desc', ...params })
                    set({
                        patients: data.content,
                        patientsMeta: { page: data.pageable.pageNumber, totalPages: data.totalPages, totalElements: data.totalElements },
                        patientsLoading: false,
                    })
                } catch (err) { set({ patientsLoading: false, error: err.message }) }
            },

            /** Full profile for detail page */
            loadPatientDetail: async (patientId) => {
                set({ patientDetailLoading: true, error: null })
                try {
                    const patient = await getPatient(patientId)
                    set({ patientDetail: patient, patientDetailLoading: false })
                } catch (err) { set({ patientDetailLoading: false, error: err.message }) }
            },

            /** Load + cache visit history for a patient */
            loadVisitHistory: async (patientId, force = false) => {
                if (get().visitHistory[patientId] && !force) return
                set({ visitHistoryLoading: true })
                try {
                    const visits = await getPatientVisits(patientId)
                    set(state => ({ visitHistory: { ...state.visitHistory, [patientId]: visits }, visitHistoryLoading: false }))
                } catch (err) { set({ visitHistoryLoading: false, error: err.message }) }
            },

            /** Load + cache chronic conditions */
            loadConditions: async (patientId) => {
                if (get().conditionsCache[patientId]) return
                try {
                    const conditions = await getPatientConditions(patientId)
                    set(state => ({ conditionsCache: { ...state.conditionsCache, [patientId]: conditions } }))
                } catch (_) { /* non-critical */ }
            },

            /** Create new patient inline from NewVisitForm, auto-selects on success */
            quickAddPatient: async (payload) => {
                set({ quickAddLoading: true, error: null })
                try {
                    const patient = await registerPatient(payload)
                    set(state => ({ patients: [patient, ...state.patients], selectedPatient: patient, quickAddOpen: false, quickAddLoading: false }))
                    return patient
                } catch (err) { set({ quickAddLoading: false, error: err.message }); throw err }
            },

            /** After profile edit, keep store in sync */
            updatePatientInStore: async (patientId, updates) => {
                try {
                    const updated = await updatePatient(patientId, updates)
                    set(state => ({
                        patients: state.patients.map(p => p.id === patientId ? updated : p),
                        selectedPatient: state.selectedPatient?.id === patientId ? updated : state.selectedPatient,
                        patientDetail: state.patientDetail?.id === patientId ? updated : state.patientDetail,
                    }))
                    return updated
                } catch (err) { set({ error: err.message }); throw err }
            },

            openQuickAdd: () => set({ quickAddOpen: true }),
            closeQuickAdd: () => set({ quickAddOpen: false, error: null }),
            clearError: () => set({ error: null }),
        }),
        { name: 'PatientStore' }
    )
)


// ════════════════════════════════════════════════════════════════════════════
//  SECTION 3 — VISIT STORE
//  Manages: visit lifecycle, AI processing + polling, vitals, send-to-patient
// ════════════════════════════════════════════════════════════════════════════

/** Visit status enum — mirrors backend VisitStatus enum */
export const VISIT_STATUS = {
    DRAFT: 'DRAFT',
    NOTES_TAKEN: 'NOTES_TAKEN',
    AI_PROCESSING: 'AI_PROCESSING',
    REVIEWED: 'REVIEWED',
    SENT_TO_PATIENT: 'SENT_TO_PATIENT',
    COMPLETED: 'COMPLETED',
}

export const useVisitStore = create(
    devtools(
        (set, get) => ({
            // ── State ────────────────────────────────────────────────────────
            activeVisit: null,
            aiSummary: null,
            aiStatus: 'idle',   // 'idle' | 'processing' | 'ready' | 'error'
            aiProgress: null,     // live status message e.g. "Analysing notes..."
            aiError: null,
            visits: [],
            visitsMeta: { page: 0, totalPages: 0, totalElements: 0 },
            visitsLoading: false,
            visitSearchQuery: '',
            visitSearchResults: [],
            sendLoading: false,
            sendSuccess: false,
            sendError: null,
            vitalsCache: {},       // { [visitId]: VitalsPayload }
            isCreating: false,
            isUpdating: false,
            error: null,

            // ── Computed ─────────────────────────────────────────────────────
            isAiReady: () => get().aiStatus === 'ready',
            isAiProcessing: () => get().aiStatus === 'processing',
            canSendToPatient: () => get().activeVisit?.status === VISIT_STATUS.REVIEWED,

            // ── Actions ──────────────────────────────────────────────────────

            /**
             * Step 1 of visit flow — creates record then auto-kicks off AI processing.
             * @param {{ patientId, chiefComplaint, soapNotes, vitals, language }} payload
             */
            createNewVisit: async (payload) => {
                set({ isCreating: true, error: null, aiStatus: 'idle', aiSummary: null })
                try {
                    const visit = await createVisit(payload)
                    set({ activeVisit: visit, isCreating: false })
                    await get().startAiProcessing(visit.id)
                    return visit
                } catch (err) { set({ isCreating: false, error: err.message }); throw err }
            },

            /**
             * Trigger AI + poll until complete.
             * Updates aiStatus/aiProgress reactively for the live progress indicator.
             */
            startAiProcessing: async (visitId) => {
                set({ aiStatus: 'processing', aiError: null })
                try {
                    await processVisitWithAI(visitId)
                    const completedVisit = await pollVisitUntilReady(visitId, (msg) => set({ aiProgress: msg }))
                    const summary = await getVisitAISummary(visitId)
                    set({ activeVisit: completedVisit, aiSummary: summary, aiStatus: 'ready', aiProgress: null })
                    return summary
                } catch (err) { set({ aiStatus: 'error', aiError: err.message, aiProgress: null }); throw err }
            },

            /** Fetch a single visit by ID; also loads summary if AI is already done */
            loadVisit: async (visitId) => {
                set({ isUpdating: true, error: null })
                try {
                    const visit = await getVisit(visitId)
                    set({ activeVisit: visit, isUpdating: false })
                    const notDone = [VISIT_STATUS.DRAFT, VISIT_STATUS.NOTES_TAKEN, VISIT_STATUS.AI_PROCESSING]
                    if (!notDone.includes(visit.status)) {
                        try { const summary = await getVisitAISummary(visitId); set({ aiSummary: summary, aiStatus: 'ready' }) }
                        catch (_) { /* summary may not exist yet */ }
                    }
                    return visit
                } catch (err) { set({ isUpdating: false, error: err.message }); throw err }
            },

            /**
             * Doctor approves AI summary + picks patient language.
             * Generates translated version, sets status to REVIEWED.
             */
            approveAndTranslate: async (visitId, language) => {
                set({ isUpdating: true, error: null })
                try {
                    const translated = await generateSummaryInLanguage(visitId, language)
                    await updateVisitStatus(visitId, VISIT_STATUS.REVIEWED)
                    const updated = await getVisit(visitId)
                    set({ activeVisit: updated, aiSummary: { ...get().aiSummary, translatedSummary: translated }, isUpdating: false })
                    return translated
                } catch (err) { set({ isUpdating: false, error: err.message }); throw err }
            },

            /** Final step — WhatsApp delivery */
            sendToPatient: async (visitId, options) => {
                set({ sendLoading: true, sendSuccess: false, sendError: null })
                try {
                    const result = await sendVisitToPatient(visitId, options)
                    const updated = await getVisit(visitId)
                    set({ activeVisit: updated, sendLoading: false, sendSuccess: true })
                    get()._updateVisitInList(updated)
                    return result
                } catch (err) { set({ sendLoading: false, sendError: err.message }); throw err }
            },

            /** Record vitals for a visit */
            saveVitals: async (visitId, vitals) => {
                try {
                    const saved = await recordVitals(visitId, vitals)
                    set(state => ({
                        vitalsCache: { ...state.vitalsCache, [visitId]: saved },
                        activeVisit: state.activeVisit?.id === visitId ? { ...state.activeVisit, vitals: saved } : state.activeVisit,
                    }))
                    return saved
                } catch (err) { set({ error: err.message }); throw err }
            },

            /** Fetch vitals for a visit (with cache) */
            loadVitals: async (visitId, force = false) => {
                if (get().vitalsCache[visitId] && !force) return get().vitalsCache[visitId]
                try {
                    const vitals = await getVitals(visitId)
                    set(state => ({ vitalsCache: { ...state.vitalsCache, [visitId]: vitals } }))
                    return vitals
                } catch (_) { return null }
            },

            /** Paginated list for doctor dashboard */
            loadVisits: async (params = {}) => {
                set({ visitsLoading: true, error: null })
                try {
                    const data = await getDoctorVisits({ page: 0, size: 20, sort: 'visitDate,desc', ...params })
                    set({
                        visits: data.content,
                        visitsMeta: { page: data.pageable.pageNumber, totalPages: data.totalPages, totalElements: data.totalElements },
                        visitsLoading: false,
                    })
                } catch (err) { set({ visitsLoading: false, error: err.message }) }
            },

            /** Search visits by patient name / diagnosis */
            searchVisitsList: async (query) => {
                set({ visitSearchQuery: query })
                if (!query.trim()) { set({ visitSearchResults: [] }); return }
                try { const results = await searchVisits(query); set({ visitSearchResults: results }) }
                catch (_) { /* non-blocking */ }
            },

            /** Remove visit + clear if it's the active visit */
            deleteVisitById: async (visitId) => {
                try {
                    await deleteVisit(visitId)
                    set(state => ({
                        visits: state.visits.filter(v => v.id !== visitId),
                        activeVisit: state.activeVisit?.id === visitId ? null : state.activeVisit,
                    }))
                } catch (err) { set({ error: err.message }); throw err }
            },

            clearActiveVisit: () => set({ activeVisit: null, aiSummary: null, aiStatus: 'idle', aiProgress: null, aiError: null, sendSuccess: false, sendError: null }),
            clearError: () => set({ error: null }),
            clearSendState: () => set({ sendSuccess: false, sendError: null }),

            // ── Private ───────────────────────────────────────────────────────
            _updateVisitInList: (updated) => {
                set(state => ({ visits: state.visits.map(v => v.id === updated.id ? updated : v) }))
            },
        }),
        { name: 'VisitStore' }
    )
)


// ════════════════════════════════════════════════════════════════════════════
//  SECTION 4 — SUMMARY STORE
//  Manages: AI summary (doctor view), patient portal, follow-up chat, reminders
// ════════════════════════════════════════════════════════════════════════════

export const useSummaryStore = create(
    devtools(
        (set, get) => ({
            // ── State ────────────────────────────────────────────────────────

            // Doctor view: structured AI summary
            summary: null,
            /*
              Shape: {
                visitId, diagnosis, diagnosisSimple,
                medications: [{ name, genericName, dosage, frequency, timing, durationDays, instructions, critical }],
                vitals: { bp, heartRate, weight, spo2, sugar, temperature },
                instructions: string[],   ← lifestyle / food / rest
                redFlags: string[],       ← when to rush to hospital
                followUpDate, followUpReason, dietAdvice,
                language, generatedAt,
              }
            */

            // Patient portal (accessed via public share token)
            portalVisit: null,
            portalMedications: [],
            portalToken: null,
            portalLanguage: 'EN',
            portalLoading: false,
            portalError: null,

            // Supported languages list
            supportedLanguages: [],
            languagesLoading: false,

            // Follow-up Q&A chat
            chatMessages: [],   // [{ id, role: 'user'|'assistant', text, timestamp }]
            chatLoading: false,
            chatError: null,

            // Medication reminders
            reminders: [],
            remindersLoading: false,
            remindersSaved: false,

            summaryLoading: false,
            translationLoading: false,
            error: null,

            // ── Computed ─────────────────────────────────────────────────────
            hasSummary: () => !!get().summary,
            medicationCount: () => get().summary?.medications?.length ?? 0,
            hasRedFlags: () => (get().summary?.redFlags?.length ?? 0) > 0,
            currentPortalSummary: () => get().portalVisit?.summaries?.[get().portalLanguage] ?? null,

            // ── Doctor Actions ────────────────────────────────────────────────

            /** Fetch AI summary for a visit (doctor view) */
            loadSummary: async (visitId) => {
                set({ summaryLoading: true, error: null })
                try {
                    const summary = await getVisitAISummary(visitId)
                    set({ summary, summaryLoading: false })
                    return summary
                } catch (err) { set({ summaryLoading: false, error: err.message }); throw err }
            },

            /** Generate summary in a new language before sending to patient */
            translateSummary: async (visitId, targetLanguage) => {
                set({ translationLoading: true, error: null })
                try {
                    const translated = await generateSummaryInLanguage(visitId, targetLanguage)
                    set(state => ({ summary: { ...state.summary, translatedSummary: translated, language: targetLanguage }, translationLoading: false }))
                    return translated
                } catch (err) { set({ translationLoading: false, error: err.message }); throw err }
            },

            /** Doctor edits AI output before approving */
            updateSummaryField: (field, value) => {
                set(state => ({ summary: state.summary ? { ...state.summary, [field]: value } : null }))
            },

            /** Doctor edits one medication in the summary */
            updateMedication: (index, updates) => {
                set(state => {
                    if (!state.summary?.medications) return {}
                    const medications = [...state.summary.medications]
                    medications[index] = { ...medications[index], ...updates }
                    return { summary: { ...state.summary, medications } }
                })
            },

            // ── Patient Portal Actions ────────────────────────────────────────

            /**
             * Load visit via public share token — no auth required.
             * Called when patient opens the WhatsApp link.
             */
            loadPortalVisit: async (token, lang = 'EN') => {
                set({ portalLoading: true, portalError: null, portalToken: token })
                try {
                    const [visit, medications] = await Promise.all([getPortalVisit(token), getPortalMedications(token)])
                    set({ portalVisit: visit, portalMedications: medications, portalLanguage: lang, portalLoading: false })
                    return visit
                } catch (err) { set({ portalLoading: false, portalError: err.message }); throw err }
            },

            /**
             * Patient taps language button on portal.
             * Uses cached translation if available, else fetches from API.
             */
            switchPortalLanguage: async (lang) => {
                const current = get().portalVisit
                const token = get().portalToken
                if (current?.summaries?.[lang]) { set({ portalLanguage: lang }); return }
                set({ translationLoading: true })
                try {
                    const translated = await getPortalVisitInLanguage(token, lang)
                    set(state => ({
                        portalVisit: { ...state.portalVisit, summaries: { ...(state.portalVisit?.summaries ?? {}), [lang]: translated } },
                        portalLanguage: lang,
                        translationLoading: false,
                    }))
                } catch (err) { set({ translationLoading: false, error: err.message }) }
            },

            /** Fetch all 10 Indian languages — cached after first call */
            loadSupportedLanguages: async () => {
                if (get().supportedLanguages.length) return
                set({ languagesLoading: true })
                try {
                    const langs = await getSupportedLanguages()
                    set({ supportedLanguages: langs, languagesLoading: false })
                } catch (_) { set({ languagesLoading: false }) }
            },

            // ── Follow-Up Chat ────────────────────────────────────────────────

            /** Patient asks a follow-up question — Claude answers in their language */
            askQuestion: async (question) => {
                const token = get().portalToken
                if (!token) return
                const userMsg = { id: crypto.randomUUID(), role: 'user', text: question, timestamp: new Date().toISOString() }
                set(state => ({ chatMessages: [...state.chatMessages, userMsg], chatLoading: true, chatError: null }))
                try {
                    const answer = await askFollowUpQuestion(token, {
                        question,
                        language: get().portalLanguage,
                        conversationHistory: get().chatMessages.slice(-6).map(m => ({ role: m.role, content: m.text })),
                    })
                    const assistantMsg = { id: crypto.randomUUID(), role: 'assistant', text: answer.answer, timestamp: new Date().toISOString() }
                    set(state => ({ chatMessages: [...state.chatMessages, assistantMsg], chatLoading: false }))
                    return answer
                } catch (err) { set({ chatLoading: false, chatError: err.message }); throw err }
            },

            clearChat: () => set({ chatMessages: [], chatError: null }),

            // ── Medication Reminders ─────────────────────────────────────────

            /** Patient sets up medicine reminders from the portal */
            saveReminders: async (patientId, reminders) => {
                set({ remindersLoading: true, remindersSaved: false })
                try {
                    const saved = await createMedicineReminders(patientId, reminders)
                    set({ reminders: saved, remindersLoading: false, remindersSaved: true })
                    return saved
                } catch (err) { set({ remindersLoading: false, error: err.message }); throw err }
            },

            clearSummary: () => set({ summary: null, summaryLoading: false, translationLoading: false, error: null }),
            clearPortal: () => set({ portalVisit: null, portalMedications: [], portalToken: null, portalLanguage: 'EN', chatMessages: [], remindersSaved: false }),
            clearError: () => set({ error: null, chatError: null }),
        }),
        { name: 'SummaryStore' }
    )
)


// ════════════════════════════════════════════════════════════════════════════
//  SECTION 5 — LANGUAGE STORE
//  Manages: UI language, patient summary language, 10 Indian languages + fonts
// ════════════════════════════════════════════════════════════════════════════

/** All 10 supported Indian languages with full metadata */
export const SUPPORTED_LANGUAGES = [
    { code: 'EN', name: 'English', native: 'English', script: 'latin', rtl: false, fontFamily: null, flagEmoji: '🇮🇳' },
    { code: 'HI', name: 'Hindi', native: 'हिन्दी', script: 'devanagari', rtl: false, fontFamily: "'Noto Sans Devanagari', sans-serif", flagEmoji: '🇮🇳' },
    { code: 'TA', name: 'Tamil', native: 'தமிழ்', script: 'tamil', rtl: false, fontFamily: "'Noto Sans Tamil', sans-serif", flagEmoji: '🇮🇳' },
    { code: 'TE', name: 'Telugu', native: 'తెలుగు', script: 'telugu', rtl: false, fontFamily: "'Noto Sans Telugu', sans-serif", flagEmoji: '🇮🇳' },
    { code: 'BN', name: 'Bengali', native: 'বাংলা', script: 'bengali', rtl: false, fontFamily: "'Noto Sans Bengali', sans-serif", flagEmoji: '🇮🇳' },
    { code: 'MR', name: 'Marathi', native: 'मराठी', script: 'devanagari', rtl: false, fontFamily: "'Noto Sans Devanagari', sans-serif", flagEmoji: '🇮🇳' },
    { code: 'GU', name: 'Gujarati', native: 'ગુજરાતી', script: 'gujarati', rtl: false, fontFamily: "'Noto Sans Gujarati', sans-serif", flagEmoji: '🇮🇳' },
    { code: 'KN', name: 'Kannada', native: 'ಕನ್ನಡ', script: 'kannada', rtl: false, fontFamily: "'Noto Sans Kannada', sans-serif", flagEmoji: '🇮🇳' },
    { code: 'ML', name: 'Malayalam', native: 'മലയാളം', script: 'malayalam', rtl: false, fontFamily: "'Noto Sans Malayalam', sans-serif", flagEmoji: '🇮🇳' },
    { code: 'PA', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', script: 'gurmukhi', rtl: false, fontFamily: "'Noto Sans Gurmukhi', sans-serif", flagEmoji: '🇮🇳' },
]

/** Quick lookup: 'HI' → { code, name, native, ... } */
export const LANGUAGE_MAP = Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, l]))

export const useLanguageStore = create(
    devtools(
        persist(
            (set, get) => ({
                // ── State ──────────────────────────────────────────────────────
                uiLanguage: 'EN',
                defaultPatientLanguage: 'HI',

                // ── Computed ───────────────────────────────────────────────────
                uiLanguageDetails: () => LANGUAGE_MAP[get().uiLanguage] ?? LANGUAGE_MAP['EN'],
                patientLanguageDetails: () => LANGUAGE_MAP[get().defaultPatientLanguage] ?? LANGUAGE_MAP['HI'],
                isRtl: () => LANGUAGE_MAP[get().uiLanguage]?.rtl ?? false,
                allLanguages: () => SUPPORTED_LANGUAGES,
                getLanguage: (code) => LANGUAGE_MAP[code] ?? LANGUAGE_MAP['EN'],
                getDisplayName: (code, format = 'native') => {
                    const lang = LANGUAGE_MAP[code]
                    if (!lang) return code
                    return format === 'native' ? lang.native : lang.name
                },

                // ── Actions ────────────────────────────────────────────────────

                /** Switch doctor dashboard language + apply font + direction to <html> */
                setUiLanguage: (code) => {
                    const lang = LANGUAGE_MAP[code]
                    if (!lang) return
                    set({ uiLanguage: code })
                    document.documentElement.setAttribute('data-language', code)
                    document.documentElement.setAttribute('data-script', lang.script)
                    document.documentElement.dir = lang.rtl ? 'rtl' : 'ltr'
                    if (lang.fontFamily) get()._loadNotoFont(lang.script)
                },

                /** Doctor's preferred patient summary language — persisted */
                setDefaultPatientLanguage: (code) => {
                    if (LANGUAGE_MAP[code]) set({ defaultPatientLanguage: code })
                },

                /** Auto-detect language from browser settings */
                detectFromBrowser: () => {
                    const browserLang = (navigator.language || 'en').split('-')[0].toUpperCase()
                    const map = { EN: 'EN', HI: 'HI', TA: 'TA', TE: 'TE', BN: 'BN', MR: 'MR', GU: 'GU', KN: 'KN', ML: 'ML', PA: 'PA' }
                    return map[browserLang] ?? 'EN'
                },

                // ── Private ────────────────────────────────────────────────────

                /** Dynamically inject Google Noto Sans font — loads once per script */
                _loadNotoFont: (script) => {
                    const fontMap = {
                        devanagari: 'Noto+Sans+Devanagari:wght@400;500;700',
                        tamil: 'Noto+Sans+Tamil:wght@400;500;700',
                        telugu: 'Noto+Sans+Telugu:wght@400;500;700',
                        bengali: 'Noto+Sans+Bengali:wght@400;500;700',
                        gujarati: 'Noto+Sans+Gujarati:wght@400;500;700',
                        kannada: 'Noto+Sans+Kannada:wght@400;500;700',
                        malayalam: 'Noto+Sans+Malayalam:wght@400;500;700',
                        gurmukhi: 'Noto+Sans+Gurmukhi:wght@400;500;700',
                    }
                    const fontQuery = fontMap[script]
                    if (!fontQuery) return
                    const id = `noto-font-${script}`
                    if (document.getElementById(id)) return
                    const link = document.createElement('link')
                    link.id = id
                    link.rel = 'stylesheet'
                    link.href = `https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap`
                    document.head.appendChild(link)
                },
            }),
            {
                name: 'shifa-language',
                partialize: (state) => ({ uiLanguage: state.uiLanguage, defaultPatientLanguage: state.defaultPatientLanguage }),
                onRehydrateStorage: () => (state) => {
                    if (state?.uiLanguage) {
                        const lang = LANGUAGE_MAP[state.uiLanguage]
                        if (lang) {
                            document.documentElement.setAttribute('data-language', state.uiLanguage)
                            document.documentElement.setAttribute('data-script', lang.script)
                            document.documentElement.dir = lang.rtl ? 'rtl' : 'ltr'
                        }
                    }
                },
            }
        ),
        { name: 'LanguageStore' }
    )
)


// ════════════════════════════════════════════════════════════════════════════
//  SECTION 6 — NOTIFICATION STORE
//  Manages: notification bell, WhatsApp delivery status + polling, reminders
// ════════════════════════════════════════════════════════════════════════════

/** WhatsApp delivery status enum — mirrors backend WhatsAppStatus enum */
export const WHATSAPP_STATUS = {
    NOT_SENT: 'NOT_SENT',
    QUEUED: 'QUEUED',
    SENT: 'SENT',
    DELIVERED: 'DELIVERED',
    READ: 'READ',
    FAILED: 'FAILED',
}

export const useNotificationStore = create(
    devtools(
        (set, get) => ({
            // ── State ────────────────────────────────────────────────────────
            notifications: [],
            unreadCount: 0,
            notifLoading: false,
            whatsappStatuses: {},   // { [visitId]: { status, sentAt, deliveredAt, readAt, errorMessage } }
            whatsappPolling: {},   // { [visitId]: intervalId }
            reminders: [],
            remindersLoading: false,
            error: null,

            // ── Computed ─────────────────────────────────────────────────────
            hasUnread: () => get().unreadCount > 0,
            getWhatsAppStatusFor: (visitId) => get().whatsappStatuses[visitId] ?? null,
            isDelivered: (visitId) => {
                const s = get().whatsappStatuses[visitId]?.status
                return s === WHATSAPP_STATUS.DELIVERED || s === WHATSAPP_STATUS.READ
            },
            isFailed: (visitId) => get().whatsappStatuses[visitId]?.status === WHATSAPP_STATUS.FAILED,

            // ── Actions ──────────────────────────────────────────────────────

            /** Fetch notification list + unread count for logged-in doctor */
            loadNotifications: async () => {
                set({ notifLoading: true })
                try {
                    const [notifications, unreadCount] = await Promise.all([getNotifications(), getUnreadCount()])
                    set({ notifications, unreadCount, notifLoading: false })
                } catch (err) { set({ notifLoading: false, error: err.message }) }
            },

            /** Mark single notification as read — optimistic update */
            markRead: async (notifId) => {
                set(state => ({
                    notifications: state.notifications.map(n => n.id === notifId ? { ...n, read: true } : n),
                    unreadCount: Math.max(0, state.unreadCount - 1),
                }))
                try { await markNotificationRead(notifId) }
                catch (_) { get().loadNotifications() }   // revert on failure
            },

            /** Mark all notifications as read */
            markAllRead: async () => {
                set(state => ({ notifications: state.notifications.map(n => ({ ...n, read: true })), unreadCount: 0 }))
                try { await markAllNotificationsRead() } catch (_) { /* best-effort */ }
            },

            /** Delete a notification — optimistic update */
            dismiss: async (notifId) => {
                set(state => ({ notifications: state.notifications.filter(n => n.id !== notifId) }))
                try { await deleteNotification(notifId) } catch (_) { /* best-effort */ }
            },

            decrementUnread: () => set(state => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
            addNotification: (notification) => set(state => ({
                notifications: [notification, ...state.notifications],
                unreadCount: state.unreadCount + (notification.read ? 0 : 1),
            })),

            // ── WhatsApp Status ──────────────────────────────────────────────

            /** Check delivery status for a specific visit */
            loadWhatsAppStatus: async (visitId) => {
                try {
                    const status = await getWhatsAppStatus(visitId)
                    set(state => ({ whatsappStatuses: { ...state.whatsappStatuses, [visitId]: status } }))
                    return status
                } catch (_) { return null }
            },

            /** Poll delivery status every 10s; auto-stops at terminal states */
            startPollingWhatsApp: (visitId) => {
                if (get().whatsappPolling[visitId]) return
                const intervalId = setInterval(async () => {
                    const status = await get().loadWhatsAppStatus(visitId)
                    const terminal = [WHATSAPP_STATUS.DELIVERED, WHATSAPP_STATUS.READ, WHATSAPP_STATUS.FAILED]
                    if (status && terminal.includes(status.status)) get().stopPollingWhatsApp(visitId)
                }, 10_000)
                set(state => ({ whatsappPolling: { ...state.whatsappPolling, [visitId]: intervalId } }))
            },

            /** Stop polling for a specific visit */
            stopPollingWhatsApp: (visitId) => {
                const intervalId = get().whatsappPolling[visitId]
                if (intervalId) {
                    clearInterval(intervalId)
                    set(state => { const next = { ...state.whatsappPolling }; delete next[visitId]; return { whatsappPolling: next } })
                }
            },

            /** Manually retry a failed WhatsApp send */
            retryWhatsApp: async (visitId) => {
                try {
                    await retryWhatsAppSend(visitId)
                    set(state => ({ whatsappStatuses: { ...state.whatsappStatuses, [visitId]: { ...(state.whatsappStatuses[visitId] ?? {}), status: WHATSAPP_STATUS.QUEUED } } }))
                    get().startPollingWhatsApp(visitId)
                } catch (err) { set({ error: err.message }); throw err }
            },

            // ── Reminders ────────────────────────────────────────────────────

            loadReminders: async (patientId) => {
                set({ remindersLoading: true })
                try { const reminders = await getPatientReminders(patientId); set({ reminders, remindersLoading: false }) }
                catch (err) { set({ remindersLoading: false, error: err.message }) }
            },

            addReminder: async (payload) => {
                try { const reminder = await createReminder(payload); set(state => ({ reminders: [...state.reminders, reminder] })); return reminder }
                catch (err) { set({ error: err.message }); throw err }
            },

            addMedicineReminders: async (patientId, items) => {
                try { const reminders = await createMedicineReminders(patientId, items); set(state => ({ reminders: [...state.reminders, ...reminders] })); return reminders }
                catch (err) { set({ error: err.message }); throw err }
            },

            removeReminder: async (reminderId) => {
                set(state => ({ reminders: state.reminders.filter(r => r.id !== reminderId) }))
                try { await cancelReminder(reminderId) } catch (_) { get().loadReminders() }
            },

            /** Clear all active polls — call on logout */
            clearAllPolls: () => { Object.values(get().whatsappPolling).forEach(clearInterval); set({ whatsappPolling: {} }) },
            clearError: () => set({ error: null }),
        }),
        { name: 'NotificationStore' }
    )
)


// ════════════════════════════════════════════════════════════════════════════
//  SECTION 7 — DOCTOR STORE
//  Manages: doctor profile, dashboard stats, visit trend chart, avatar upload
// ════════════════════════════════════════════════════════════════════════════

export const useDoctorStore = create(
    devtools(
        persist(
            (set, get) => ({
                // ── State ──────────────────────────────────────────────────────
                profile: null,
                /*
                  { id, firstName, lastName, email, phone,
                    specialisation, registrationNumber,
                    clinicName, clinicAddress,
                    avatarUrl, bio, preferredLanguage, createdAt }
                */
                stats: null,
                /*
                  { todayVisits, totalPatients, totalVisits,
                    whatsappSentThisMonth, pendingReviews,
                    avgVisitsPerDay, patientRetentionRate }
                */
                trendData: [],   // [{ date: '2025-01-01', visits: 5, newPatients: 2 }]
                profileLoading: false,
                statsLoading: false,
                uploadLoading: false,
                error: null,

                // ── Computed ───────────────────────────────────────────────────
                doctorFullName: () => { const p = get().profile; return p ? `Dr. ${p.firstName} ${p.lastName}`.trim() : 'Doctor' },
                hasPendingReviews: () => (get().stats?.pendingReviews ?? 0) > 0,

                // ── Actions ────────────────────────────────────────────────────

                loadProfile: async () => {
                    set({ profileLoading: true, error: null })
                    try { const profile = await getMyProfile(); set({ profile, profileLoading: false }); return profile }
                    catch (err) { set({ profileLoading: false, error: err.message }) }
                },

                saveProfile: async (updates) => {
                    set({ profileLoading: true, error: null })
                    try { const profile = await updateMyProfile(updates); set({ profile, profileLoading: false }); return profile }
                    catch (err) { set({ profileLoading: false, error: err.message }); throw err }
                },

                uploadAvatar: async (file, onProgress) => {
                    set({ uploadLoading: true, error: null })
                    try {
                        const { avatarUrl } = await uploadProfilePhoto(file, onProgress)
                        set(state => ({ profile: state.profile ? { ...state.profile, avatarUrl } : null, uploadLoading: false }))
                        return avatarUrl
                    } catch (err) { set({ uploadLoading: false, error: err.message }); throw err }
                },

                loadDashboardStats: async () => {
                    set({ statsLoading: true })
                    try { const stats = await getDashboardStats(); set({ stats, statsLoading: false }) }
                    catch (err) { set({ statsLoading: false, error: err.message }) }
                },

                loadVisitTrend: async (days = 30) => {
                    try { const trendData = await getVisitTrend(days); set({ trendData }) }
                    catch (_) { /* non-critical chart data */ }
                },

                clearError: () => set({ error: null }),
            }),
            {
                name: 'shifa-doctor',
                partialize: (state) => ({ profile: state.profile }),
            }
        ),
        { name: 'DoctorStore' }
    )
)


// ════════════════════════════════════════════════════════════════════════════
//  SECTION 8 — UI STORE
//  Manages: sidebar, toast queue, active modal, page loading, theme
// ════════════════════════════════════════════════════════════════════════════

/** Toast severity levels */
export const TOAST_TYPE = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning',
}

export const useUiStore = create(
    devtools(
        persist(
            (set, get) => ({
                // ── State ──────────────────────────────────────────────────────
                sidebarOpen: true,     // desktop: expanded by default
                theme: 'light',  // 'light' | 'dark'
                toasts: [],       // [{ id, type, message, duration }]
                activeModal: null,     // e.g. 'quickAddPatient' | 'sendToPatient'
                modalProps: {},
                pageLoading: false,

                // ── Sidebar ────────────────────────────────────────────────────
                toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
                openSidebar: () => set({ sidebarOpen: true }),
                closeSidebar: () => set({ sidebarOpen: false }),

                // ── Theme ──────────────────────────────────────────────────────
                toggleTheme: () => set(s => {
                    const next = s.theme === 'light' ? 'dark' : 'light'
                    document.documentElement.setAttribute('data-theme', next)
                    return { theme: next }
                }),

                setPageLoading: (v) => set({ pageLoading: v }),

                // ── Toasts ─────────────────────────────────────────────────────

                /** Add a toast to the queue; auto-dismisses after duration ms */
                toast: (message, type = TOAST_TYPE.INFO, duration = 4000) => {
                    const id = crypto.randomUUID()
                    set(state => ({ toasts: [...state.toasts, { id, type, message, duration }] }))
                    setTimeout(() => get().dismissToast(id), duration)
                    return id
                },

                toastSuccess: (msg, duration) => get().toast(msg, TOAST_TYPE.SUCCESS, duration),
                toastError: (msg, duration) => get().toast(msg, TOAST_TYPE.ERROR, duration ?? 6000),
                toastInfo: (msg, duration) => get().toast(msg, TOAST_TYPE.INFO, duration),
                toastWarning: (msg, duration) => get().toast(msg, TOAST_TYPE.WARNING, duration),
                dismissToast: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
                clearAllToasts: () => set({ toasts: [] }),

                // ── Modals ─────────────────────────────────────────────────────

                /** Open a named modal with optional data props */
                openModal: (key, props = {}) => set({ activeModal: key, modalProps: props }),
                closeModal: () => set({ activeModal: null, modalProps: {} }),
                isModalOpen: (key) => get().activeModal === key,
            }),
            {
                name: 'shifa-ui',
                partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
                onRehydrateStorage: () => (state) => {
                    if (state?.theme) document.documentElement.setAttribute('data-theme', state.theme)
                },
            }
        ),
        { name: 'UiStore' }
    )
)
