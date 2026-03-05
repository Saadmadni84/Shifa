import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getMyProfile, updateMyProfile, uploadProfilePhoto } from '@/api/doctors'

export function useDoctor() {
    const queryClient = useQueryClient()

    // ─── Fetch Profile ──────────────────────────────────────────────────────────
    const {
        data,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ['doctor-profile'],
        queryFn: () => getMyProfile().then(res => res.data),
        staleTime: 5 * 60 * 1000 // 5 minutes
    })

    const doctor = data || null

    // ─── Update Profile ─────────────────────────────────────────────────────────
    const { mutateAsync: updateProfileMutate, isPending: isUpdating } = useMutation({
        mutationFn: (updates) => updateMyProfile(updates),
        onSuccess: (res) => {
            queryClient.setQueryData(['doctor-profile'], res.data)
            // Invalidating to ensure fresh data and related caches (like Dashboard Stats) are updated if necessary
            queryClient.invalidateQueries({ queryKey: ['doctor-profile'] })
        },
        onError: (err) => {
            console.error('Failed to update doctor profile:', err)
            toast.error(err.response?.data?.message || 'Failed to update profile')
        }
    })

    // ─── Upload Photo ───────────────────────────────────────────────────────────
    const { mutateAsync: uploadPhotoMutate, isPending: isUploading } = useMutation({
        mutationFn: (file) => uploadProfilePhoto(file),
        onSuccess: (res) => {
            queryClient.setQueryData(['doctor-profile'], res.data)
            toast.success('Profile photo updated')
        },
        onError: (err) => {
            console.error('Failed to upload photo:', err)
            toast.error(err.response?.data?.message || 'Failed to upload photo')
        }
    })

    return {
        // State
        doctor,
        isLoading,
        isError,
        error,

        // Actions
        refetch,
        updateProfile: updateProfileMutate,
        uploadPhoto: uploadPhotoMutate,

        // Loading states
        isUpdating,
        isUploading
    }
}
