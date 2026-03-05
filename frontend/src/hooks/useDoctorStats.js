import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/api/doctors'

export function useDoctorStats() {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['doctor-stats'],
        queryFn: ({ signal }) => getDashboardStats(signal),
        staleTime: 60_000,
    })

    const stats = data?.data ?? {
        todayVisits: 0,
        pendingAI: 0,
        sentToPatients: 0,
        unreadMessages: 0,
        totalPatients: 0,
        thisWeekVisits: 0,
    }

    return { stats, isLoading, isError, refetch }
}
