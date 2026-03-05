/**
 * useVisits.js — Hook for fetching visits
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches a list of visits for the current doctor with filtering and pagination.
 *
 * Consumed by: Doctor Dashboard page
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useQuery } from '@tanstack/react-query'
import { getDoctorVisits } from '@/api/visits'

export function useVisits({ limit = 10, sort = 'createdAt,desc' } = {}) {
  const {
    data: visitsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['doctor-visits', limit, sort],
    queryFn: () =>
      getDoctorVisits({
        page: 0,
        size: limit,
      }),
    staleTime: 30_000, // 30 seconds
  })

  const visits = visitsData?.content ?? []
  const totalVisits = visitsData?.totalElements ?? 0

  return {
    visits,
    totalVisits,
    isLoading,
    isError,
    error,
    refetch,
  }
}
