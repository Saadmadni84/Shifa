/**
 * useDoctorDashboard.js — Doctor Dashboard Aggregation Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches and aggregates everything the Doctor Dashboard needs in one hook:
 *   • Today's stats (visits, pending AI, sent to patients, unread messages)
 *   • Recent visits list (last 10, with AI status + WhatsApp status)
 *   • Quick patient search
 *   • Unread notification badge
 *   • Auto-refresh every 30 s while tab is active (pauses on blur)
 *
 * Consumed by: DoctorDashboard page, Navbar badge.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { doctorsApi } from '@/api/doctors'
import { visitsApi } from '@/api/visits'
import { useDebounce } from '@/hooks/useDebounce'

const REFRESH_INTERVAL_MS = 30_000

export function useDoctorDashboard() {
    const qc = useQueryClient()
    const [search, setSearch] = useState('')
    const [selectedDate, setSelectedDate] = useState(null)   // null = today
    const debouncedSearch = useDebounce(search, 350)
    const isTabVisible = useRef(true)

    // ─── Pause auto-refresh when tab is hidden ────────────────────────────────
    useEffect(() => {
        const onVisible = () => { isTabVisible.current = document.visibilityState === 'visible' }
        document.addEventListener('visibilitychange', onVisible)
        return () => document.removeEventListener('visibilitychange', onVisible)
    }, [])

    // ─── Dashboard stats ──────────────────────────────────────────────────────
    const {
        data: statsData,
        isLoading: statsLoading,
        dataUpdatedAt,
    } = useQuery({
        queryKey: ['doctor-stats'],
        queryFn: () => doctorsApi.getStats().then(r => r.data),
        staleTime: 25_000,
        refetchInterval: (query) =>
            isTabVisible.current && !query.state.error ? REFRESH_INTERVAL_MS : false,
    })

    const stats = statsData?.data ?? {
        todayVisits: 0,
        pendingAI: 0,
        sentToPatients: 0,
        unreadMessages: 0,
        totalPatients: 0,
        thisWeekVisits: 0,
    }

    // ─── Recent visits ────────────────────────────────────────────────────────
    const {
        data: visitsData,
        isLoading: visitsLoading,
    } = useQuery({
        queryKey: ['recent-visits', debouncedSearch, selectedDate],
        queryFn: () => visitsApi.list({
            q: debouncedSearch,
            date: selectedDate ?? undefined,
            page: 0,
            size: 15,
        }).then(r => r.data),
        staleTime: 20_000,
        refetchInterval: (query) =>
            isTabVisible.current && !query.state.error ? REFRESH_INTERVAL_MS : false,
    })

    const recentVisits = visitsData?.data?.visits ?? []
    const totalVisits = visitsData?.data?.pagination?.totalElements ?? 0

    // ─── Manual refresh ───────────────────────────────────────────────────────
    const refresh = useCallback(() => {
        qc.invalidateQueries({ queryKey: ['doctor-stats'] })
        qc.invalidateQueries({ queryKey: ['recent-visits'] })
        qc.invalidateQueries({ queryKey: ['doctor-notifications'] })
    }, [qc])

    // ─── Filter helpers ───────────────────────────────────────────────────────
    const clearFilters = useCallback(() => {
        setSearch('')
        setSelectedDate(null)
    }, [])

    const hasActiveFilters = !!search || !!selectedDate

    return {
        // Stats
        stats,
        statsLoading,
        lastRefreshed: dataUpdatedAt ? new Date(dataUpdatedAt) : null,

        // Visits
        recentVisits,
        totalVisits,
        visitsLoading,

        // Filters
        search,
        selectedDate,
        hasActiveFilters,
        setSearch,
        setSelectedDate,
        clearFilters,

        // Actions
        refresh,
    }
}
