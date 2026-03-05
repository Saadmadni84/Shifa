/**
 * useDoctorStats.js — Hook for fetching doctor dashboard statistics
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches stats for the doctor's dashboard including:
 *   • Total patients
 *   • Today's visits
 *   • Pending AI processing
 *   • WhatsApp messages sent
 *
 * Consumed by: DoctorDashboard page
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/api/doctors'

export function useDoctorStats() {
  const {
    data: statsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['doctor-stats'],
    queryFn: () => getDashboardStats(),
    staleTime: 30_000, // 30 seconds
  })

  const stats = statsData?.data ?? {
    totalPatients: 0,
    todayVisits: 0,
    pendingAI: 0,
    sentToPatients: 0,
    unreadMessages: 0,
    thisWeekVisits: 0,
  }

  return {
    stats,
    isLoading,
    refetch,
  }
}