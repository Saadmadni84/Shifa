/**
 * usePatients.js — Shifa Patient Management Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides:
 *   • Paginated patient list with server-side search + debounce
 *   • Single patient fetch by ID
 *   • Create / update patient
 *   • Visit history per patient
 *   • Optimistic UI on create (patient appears instantly, rolls back on error)
 *
 * Consumed by: Doctor Dashboard, Patient Search, New Visit flow.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback } from 'react'
import {
    useQuery,
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query'
import { useDebounce } from '@/hooks/useDebounce'
import { patientsApi } from '@/api/patients'
import toast from 'react-hot-toast'

// ─── Patient List (paginated, searchable) ─────────────────────────────────────
export function usePatients({ pageSize = 20, language = '' } = {}) {
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 350)
    const qc = useQueryClient()

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
    } = useInfiniteQuery({
        queryKey: ['patients', debouncedSearch, language],
        queryFn: ({ pageParam = 0 }) =>
            debouncedSearch?.trim()
                ? patientsApi.searchPatients({ query: debouncedSearch, page: pageParam, size: pageSize })
                : patientsApi.getDoctorPatients({ page: pageParam, size: pageSize }),
        getNextPageParam: (lastPage) => {
            const page = lastPage?.pageable?.pageNumber ?? 0
            const totalPages = lastPage?.totalPages ?? 0
            return page + 1 < totalPages ? page + 1 : undefined
        },
        staleTime: 30_000,
        retry: 1,
    })

    // Flatten pages into a single array for easy rendering
    const allPatients = data?.pages.flatMap(p => p?.content ?? []) ?? []
    const patients = language
        ? allPatients.filter((p) => (p.preferredLanguage ?? '').toLowerCase() === language.toLowerCase())
        : allPatients
    const total = data?.pages[0]?.totalElements ?? 0

    // ─── Create patient ───────────────────────────────────────────────────────
    const { mutateAsync: createPatient, isPending: isCreating } = useMutation({
        mutationFn: (payload) => patientsApi.create(payload),

        // Optimistic: insert placeholder immediately
        onMutate: async (payload) => {
            await qc.cancelQueries({ queryKey: ['patients'] })
            const snapshot = qc.getQueriesData({ queryKey: ['patients'] })

            qc.setQueriesData({ queryKey: ['patients'] }, (old) => {
                if (!old) return old
                const optimistic = {
                    id: `temp-${Date.now()}`,
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    phoneNumber: payload.phoneNumber,
                    preferredLanguage: payload.preferredLanguage,
                    _optimistic: true,
                }
                return {
                    ...old,
                    pages: old.pages.map((pg, i) =>
                        i === 0
                            ? { ...pg, content: [optimistic, ...(pg.content ?? [])] }
                            : pg
                    ),
                }
            })

            return { snapshot }
        },

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['patients'] })
            toast.success('Patient added successfully.')
        },

        onError: (err, _vars, ctx) => {
            // Roll back optimistic insert
            if (ctx?.snapshot) {
                ctx.snapshot.forEach(([key, val]) => qc.setQueryData(key, val))
            }
            toast.error(`Failed to add patient: ${err.message}`)
        },
    })

    // ─── Update patient ───────────────────────────────────────────────────────
    const { mutateAsync: updatePatient, isPending: isUpdating } = useMutation({
        mutationFn: ({ id, ...rest }) => patientsApi.update(id, rest),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: ['patient', vars.id] })
            qc.invalidateQueries({ queryKey: ['patients'] })
            toast.success('Patient updated.')
        },
        onError: (err) => toast.error(err.message),
    })

    const handleSearch = useCallback((val) => setSearch(val), [])

    return {
        patients,
        total,
        search,
        isLoading,
        isError,
        error,
        isFetchingNextPage,
        hasNextPage,

        // Actions
        fetchNextPage,
        handleSearch,
        createPatient,
        isCreating,
        updatePatient,
        isUpdating,
    }
}

// ─── Single Patient ───────────────────────────────────────────────────────────
export function usePatient(patientId) {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['patient', patientId],
        queryFn: () => patientsApi.get(patientId).then(r => r.data),
        enabled: !!patientId,
        staleTime: 60_000,
    })

    return {
        patient: data?.data ?? null,
        isLoading,
        isError,
        error,
    }
}

// ─── Patient Visit History ────────────────────────────────────────────────────
export function usePatientVisits(patientId) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['patient-visits', patientId],
        queryFn: () => patientsApi.getVisitHistory(patientId).then(r => r.data),
        enabled: !!patientId,
        staleTime: 30_000,
    })

    return {
        visits: data?.data ?? [],
        isLoading,
        isError,
    }
}
