/**
 * useDoctor.js — Hook for fetching and updating doctor profile
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches and updates the current doctor's profile information.
 *
 * Consumed by: Doctor Profile page
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyProfile, updateMyProfile, uploadProfilePhoto } from '@/api/doctors'

export function useDoctor() {
  const qc = useQueryClient()

  const {
    data: doctorData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['doctor-profile'],
    queryFn: () => getMyProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const updateMutation = useMutation({
    mutationFn: (updates) => updateMyProfile(updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctor-profile'] })
    },
  })

  const uploadPhotoMutation = useMutation({
    mutationFn: (file) => uploadProfilePhoto(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctor-profile'] })
    },
  })

  const doctor = doctorData?.data ?? null

  return {
    doctor,
    isLoading,
    error,
    updateDoctor: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    uploadPhoto: uploadPhotoMutation.mutate,
    isUploadingPhoto: uploadPhotoMutation.isPending,
    uploadPhotoError: uploadPhotoMutation.error,
  }
}
