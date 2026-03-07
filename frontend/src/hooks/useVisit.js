/**
 * useVisit.js — Shifa Visit Lifecycle Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages everything about a single visit:
 *   • Fetching visit data + AI summary
 *   • Polling for AI processing status (until COMPLETED or FAILED)
 *   • Sending the summary to the patient via WhatsApp
 *   • Re-triggering AI processing
 *   • Updating visit notes
 *
 * Usage (Doctor side):
 *   const { visit, summary, status, isPolling, sendToPatient } = useVisit(visitId)
 *
 * Built on top of TanStack Query for cache/refetch control.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useCallback, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { visitsApi } from '@/api/visits'
import toast from 'react-hot-toast'

// ── Polling intervals ─────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 3_000   // 3 s while AI is processing
const POLL_MAX_ATTEMPTS = 60      // 3 min max wait (60 × 3 s)

// ── Terminal AI statuses — polling stops when reached ─────────────────────────
const TERMINAL_STATUSES = new Set(['COMPLETE', 'FAILED', 'CANCELLED', 'NOT_STARTED'])

export function useVisit(visitId) {
    const qc = useQueryClient()
    const pollCountRef = useRef(0)
    const pollEnabledRef = useRef(true)

    // ─── Core visit query ─────────────────────────────────────────────────────
    const {
        data: visitData,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['visit', visitId],
        queryFn: () => visitsApi.getVisit(visitId),
        enabled: !!visitId,
        staleTime: 10_000,   // 10 s — don't refetch if data is fresh
        gcTime: 5 * 60_000,
        retry: 2,
        onError: (err) => toast.error(`Failed to load visit: ${err.message}`),
    })

    const visit = visitData ?? null
    const summary = visitData?.aiSummary ?? null
    const status = visitData?.aiSummaryStatus ?? null

    // ─── AI processing poll ──────────────────────────────────────────────────
    // React Query's `refetchInterval` is the right primitive here.
    // We stop polling once AI is done or we've hit the max attempt ceiling.
    const isPolling = !TERMINAL_STATUSES.has(status) && status != null

    useEffect(() => {
        if (!isPolling || !visitId) return
        pollEnabledRef.current = true
        pollCountRef.current = 0

        const id = setInterval(async () => {
            if (!pollEnabledRef.current) return
            pollCountRef.current += 1

            if (pollCountRef.current > POLL_MAX_ATTEMPTS) {
                clearInterval(id)
                toast.error('AI processing is taking longer than expected. Refresh later.')
                return
            }

            const fresh = await qc.fetchQuery({
                queryKey: ['visit', visitId],
                queryFn: () => visitsApi.getVisit(visitId),
                staleTime: 0,
            })

            if (TERMINAL_STATUSES.has(fresh?.aiSummaryStatus)) {
                clearInterval(id)
                pollEnabledRef.current = false

                if (fresh?.aiSummaryStatus === 'COMPLETE') {
                    toast.success('✅ AI summary is ready!')
                } else if (fresh?.aiSummaryStatus === 'FAILED') {
                    toast.error('AI processing failed. You can re-try below.')
                }
            }
        }, POLL_INTERVAL_MS)

        return () => {
            clearInterval(id)
            pollEnabledRef.current = false
        }
    }, [isPolling, visitId, qc])

    // ─── Re-trigger AI processing ────────────────────────────────────────────
    const { mutateAsync: reprocessVisit, isPending: isReprocessing } = useMutation({
        mutationFn: () => visitsApi.processVisit(visitId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['visit', visitId] })
            toast.success('AI re-processing started.')
        },
        onError: (err) => toast.error(`Reprocess failed: ${err.message}`),
    })

    // ─── Send to patient via WhatsApp ────────────────────────────────────────
    const { mutateAsync: sendToPatient, isPending: isSending } = useMutation({
        mutationFn: (opts) => visitsApi.sendToPatient(visitId, opts),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['visit', visitId] })
            toast.success('✅ Sent to patient via WhatsApp!')
        },
        onError: (err) => toast.error(`WhatsApp send failed: ${err.message}`),
    })

    // ─── Update visit notes ──────────────────────────────────────────────────
    const { mutateAsync: updateNotes, isPending: isUpdating } = useMutation({
        mutationFn: (payload) => visitsApi.updateVisit(visitId, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['visit', visitId] })
            toast.success('Notes saved.')
        },
        onError: (err) => toast.error(`Save failed: ${err.message}`),
    })

    // ─── Update status (DRAFT → REVIEWED → SENT) ─────────────────────────────
    const { mutateAsync: updateStatus, isPending: isChangingStatus } = useMutation({
        mutationFn: (newStatus) => visitsApi.updateVisitStatus(visitId, newStatus),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['visit', visitId] }),
        onError: (err) => toast.error(err.message),
    })

    const { mutateAsync: deleteVisit, isPending: isDeleting } = useMutation({
        mutationFn: () => visitsApi.deleteVisit(visitId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['doctor-visits'] })
            toast.success('Visit deleted.')
        },
        onError: (err) => toast.error(`Delete failed: ${err.message}`),
    })

    const refresh = useCallback(() => refetch(), [refetch])

    return {
        // Data
        visit,
        summary,
        status,

        // Loading flags
        isLoading,
        isPolling,
        isReprocessing,
        isSending,
        isUpdating,
        isChangingStatus,
        isDeleting,

        // Errors
        isError,
        error,

        // Actions
        sendToPatient,
        refetch,
        retriggerAI: reprocessVisit,
        updateVisit: updateNotes,
        updateStatus,
        deleteVisit,
        refresh,
    }
}
