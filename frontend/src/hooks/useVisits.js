import { useQuery } from '@tanstack/react-query'
import { getDoctorVisits, searchVisits } from '@/api/visits'

export function useVisits(params = {}) {
    const { page = 0, limit = 20, status, sort, q } = params

    const {
        data,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ['visits', page, limit, status, sort, q],
        queryFn: ({ signal }) => {
            if (q) {
                return searchVisits(q, { page, size: limit }).then(r => r.data)
            }
            return getDoctorVisits({ page, size: limit, status, signal }).then(r => r.data)
        },
        staleTime: 30_000,
    })

    const visits = data?.content ?? data ?? []
    const totalPages = data?.totalPages ?? 0
    const totalElements = data?.totalElements ?? 0

    return {
        visits,
        totalPages,
        totalElements,
        isLoading,
        isError,
        error,
        refetch
    }
}
