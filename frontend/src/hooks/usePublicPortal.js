/**
 * usePublicPortal.js — Shifa Patient Public Portal Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * The patient receives a WhatsApp link like:
 *   https://shifa.app/portal/abc123xyz
 *
 * `abc123xyz` is a time-limited portal token (no login needed).
 * This hook loads the visit summary using that token.
 *
 * Provides:
 *   • Visit data (diagnosis, medicines, schedule, diet, red flags)
 *   • Summary in the patient's preferred language
 *   • Feedback submission (patient → doctor)
 *   • Medicine acknowledgement (patient marks they've understood)
 *   • Token validation state (valid / expired / not-found)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { publicApi } from '@/api/public'
import toast from 'react-hot-toast'

// ─── Portal token states ──────────────────────────────────────────────────────
export const TOKEN_STATE = {
    LOADING: 'LOADING',
    VALID: 'VALID',
    EXPIRED: 'EXPIRED',
    NOT_FOUND: 'NOT_FOUND',
    ERROR: 'ERROR',
}

export function usePublicPortal(portalToken) {
    const qc = useQueryClient()

    // ─── Load visit via public token ──────────────────────────────────────────
    const {
        data,
        isLoading,
        isError,
        error,
        dataUpdatedAt,
    } = useQuery({
        queryKey: ['portal', portalToken],
        queryFn: () => publicApi.getVisitByToken(portalToken).then(r => r.data),
        enabled: !!portalToken,
        staleTime: 5 * 60_000,   // 5 min — patient doesn't need fresh data constantly
        retry: (failCount, err) => {
            // Don't retry on 404 (invalid token) or 410 (expired)
            if ([404, 410, 403].includes(err?.status)) return false
            return failCount < 2
        },
    })

    // ─── Derived portal state ─────────────────────────────────────────────────
    let tokenState = TOKEN_STATE.LOADING
    if (isLoading) {
        tokenState = TOKEN_STATE.LOADING
    } else if (isError) {
        const status = error?.status
        if (status === 404) tokenState = TOKEN_STATE.NOT_FOUND
        else if (status === 410 || status === 403) tokenState = TOKEN_STATE.EXPIRED
        else tokenState = TOKEN_STATE.ERROR
    } else if (data) {
        tokenState = TOKEN_STATE.VALID
    }

    const visit = data?.data ?? null
    const summary = visit?.aiSummary ?? null
    const patient = visit?.patient ?? null
    const language = visit?.language ?? 'en'

    // ─── Submit patient feedback ──────────────────────────────────────────────
    const { mutateAsync: submitFeedback, isPending: isSubmittingFeedback } = useMutation({
        mutationFn: (feedbackPayload) =>
            publicApi.submitFeedback(portalToken, feedbackPayload),
        onSuccess: () => {
            toast.success('Your message has been sent to your doctor! 🙏')
            qc.invalidateQueries({ queryKey: ['portal', portalToken] })
        },
        onError: (err) => toast.error(`Could not send message: ${err.message}`),
    })

    // ─── Acknowledge medicines (mark patient has read) ────────────────────────
    const { mutateAsync: acknowledgeMedicines, isPending: isAcknowledging } = useMutation({
        mutationFn: () => publicApi.acknowledgeMedicines(portalToken),
        onSuccess: () => {
            qc.setQueryData(['portal', portalToken], (old) => {
                if (!old) return old
                return {
                    ...old,
                    data: { ...old.data, medicinesAcknowledgedAt: new Date().toISOString() },
                }
            })
            toast.success('Great! Remember to take your medicines on time. 💊')
        },
        onError: () => {/* soft fail — not critical */ },
    })

    // ─── Request reminder setup ───────────────────────────────────────────────
    const { mutateAsync: requestReminders, isPending: isRequestingReminders } = useMutation({
        mutationFn: (preferences) => publicApi.requestReminders(portalToken, preferences),
        onSuccess: () => toast.success('Reminders will be sent to your WhatsApp! ✅'),
        onError: (err) => toast.error(`Reminder setup failed: ${err.message}`),
    })

    return {
        // Token state
        tokenState,
        isValid: tokenState === TOKEN_STATE.VALID,
        isExpired: tokenState === TOKEN_STATE.EXPIRED,
        isNotFound: tokenState === TOKEN_STATE.NOT_FOUND,
        isLoading,
        isError,

        // Data
        visit,
        summary,
        patient,
        language,
        lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,

        // Actions
        submitFeedback,
        isSubmittingFeedback,

        acknowledgeMedicines,
        isAcknowledging,

        requestReminders,
        isRequestingReminders,
    }
}
