/**
 * useNotifications.js — Shifa Notifications & Reminder Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages:
 *   • Fetching scheduled reminders for a patient / visit
 *   • Creating / deleting reminders (medicine, follow-up, lab test)
 *   • WhatsApp delivery status per notification
 *   • Doctor unread notification badge count
 *   • Real-time updates via WebSocket (when available) with polling fallback
 *
 * Consumed by: DoctorDashboard (badge), PatientPortal (reminder list),
 *              MedicineSchedule (add reminder CTA).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useCallback, useEffect, useRef } from 'react'
import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query'
import { notificationsApi } from '@/api/notifications'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

const POLL_INTERVAL_MS = 30_000   // 30 s — notification status polling

// ─── Doctor notifications (badge + feed) ──────────────────────────────────────
export function useDoctorNotifications() {
    const { user, isDoctor } = useAuth()
    const qc = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ['doctor-notifications'],
        queryFn: () => notificationsApi.getDoctorNotifications().then(r => r.data),
        enabled: !!user && isDoctor,
        refetchInterval: POLL_INTERVAL_MS,
        staleTime: 15_000,
    })

    const notifications = data?.data ?? []
    const unreadCount = notifications.filter(n => !n.readAt).length

    // ─── Mark as read ────────────────────────────────────────────────────────
    const { mutate: markRead } = useMutation({
        mutationFn: (notifId) => notificationsApi.markRead(notifId),
        onMutate: async (notifId) => {
            // Optimistic
            await qc.cancelQueries({ queryKey: ['doctor-notifications'] })
            qc.setQueryData(['doctor-notifications'], (old) => {
                if (!old) return old
                return {
                    ...old,
                    data: old.data.map(n =>
                        n.id === notifId ? { ...n, readAt: new Date().toISOString() } : n
                    ),
                }
            })
        },
        onError: () => {
            qc.invalidateQueries({ queryKey: ['doctor-notifications'] })
        },
    })

    // ─── Mark all as read ────────────────────────────────────────────────────
    const { mutate: markAllRead } = useMutation({
        mutationFn: () => notificationsApi.markAllRead(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['doctor-notifications'] }),
    })

    return {
        notifications,
        unreadCount,
        isLoading,
        markRead,
        markAllRead,
    }
}

// ─── Patient / Visit reminders ─────────────────────────────────────────────────
export function useReminders({ visitId, patientId } = {}) {
    const qc = useQueryClient()

    const queryKey = visitId
        ? ['reminders', 'visit', visitId]
        : ['reminders', 'patient', patientId]

    const { data, isLoading, isError } = useQuery({
        queryKey,
        queryFn: () => {
            if (visitId) return notificationsApi.getVisitReminders(visitId).then(r => r.data)
            if (patientId) return notificationsApi.getPatientReminders(patientId).then(r => r.data)
            return Promise.resolve({ data: [] })
        },
        enabled: !!(visitId || patientId),
        staleTime: 60_000,
        refetchInterval: POLL_INTERVAL_MS,
    })

    const reminders = data?.data ?? []

    // ─── Create reminder ─────────────────────────────────────────────────────
    const { mutateAsync: createReminder, isPending: isCreating } = useMutation({
        mutationFn: (payload) => notificationsApi.createReminder({
            visitId,
            patientId,
            ...payload,
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey })
            toast.success('⏰ Reminder scheduled!')
        },
        onError: (err) => toast.error(`Could not schedule reminder: ${err.message}`),
    })

    // ─── Cancel / delete reminder ────────────────────────────────────────────
    const { mutateAsync: cancelReminder, isPending: isCancelling } = useMutation({
        mutationFn: (reminderId) => notificationsApi.cancelReminder(reminderId),
        onMutate: async (reminderId) => {
            // Optimistic removal
            await qc.cancelQueries({ queryKey })
            qc.setQueryData(queryKey, (old) => ({
                ...old,
                data: (old?.data ?? []).filter(r => r.id !== reminderId),
            }))
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey })
            toast.success('Reminder cancelled.')
        },
        onError: () => {
            qc.invalidateQueries({ queryKey })
            toast.error('Could not cancel reminder.')
        },
    })

    // ─── WhatsApp delivery status poll ───────────────────────────────────────
    // If any reminder is in PENDING/SENDING state, poll more aggressively
    const hasPendingDelivery = reminders.some(r => ['PENDING', 'SENDING'].includes(r.status))
    const wsStatusRef = useRef(null)

    useEffect(() => {
        if (!hasPendingDelivery) return
        const id = setInterval(
            () => qc.invalidateQueries({ queryKey }),
            8_000
        )
        wsStatusRef.current = id
        return () => clearInterval(id)
    }, [hasPendingDelivery, qc, queryKey])

    // ─── Summary counts ───────────────────────────────────────────────────────
    const sent = reminders.filter(r => r.status === 'SENT').length
    const pending = reminders.filter(r => r.status === 'PENDING').length
    const failed = reminders.filter(r => r.status === 'FAILED').length

    return {
        reminders,
        isLoading,
        isError,
        isCreating,
        isCancelling,

        // Counts
        sentCount: sent,
        pendingCount: pending,
        failedCount: failed,

        // Actions
        createReminder,
        cancelReminder,
    }
}
