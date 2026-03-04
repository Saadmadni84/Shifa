/**
 * useAuth.js — Shifa Authentication Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Central auth hook. Reads from Zustand authStore, exposes:
 *   • user / isAuthenticated / role helpers (isDoctor, isPatient, isAdmin)
 *   • login / logout / register / requestOTP / verifyOTP actions
 *   • loading / error state per action
 *   • redirectAfterLogin helper (preserves intended destination)
 *
 * Consumed by: ProtectedRoute, Navbar, all page-level components.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth'
import toast from 'react-hot-toast'

export function useAuth() {
    const navigate = useNavigate()
    const location = useLocation()
    const store = useAuthStore()

    // ─── Derived state ────────────────────────────────────────────────────────
    const isDoctor = store.user?.role === 'DOCTOR'
    const isPatient = store.user?.role === 'PATIENT'
    const isAdmin = store.user?.role === 'ADMIN'

    // ─── Login (doctor — email + password → JWT) ──────────────────────────────
    const login = useCallback(async (email, password) => {
        store.setLoading('login', true)
        store.setError('login', null)
        try {
            const { data } = await authApi.login(email, password)
            store.setTokens(data.accessToken, data.refreshToken)
            store.setUser(data.user)

            // Go to where the user was trying to go, or default dashboard
            const from = location.state?.from?.pathname
            if (from) {
                navigate(from, { replace: true })
            } else {
                navigate(isDoctor || data.user.role === 'DOCTOR' ? '/doctor/dashboard' : '/portal', {
                    replace: true,
                })
            }
            toast.success(`नमस्ते, Dr. ${data.user.firstName}! 👋`)
        } catch (err) {
            const msg = err.message || 'Login failed. Please check your credentials.'
            store.setError('login', msg)
            toast.error(msg)
            throw err
        } finally {
            store.setLoading('login', false)
        }
    }, [store, navigate, location, isDoctor])

    // ─── Register (doctor self-registration) ─────────────────────────────────
    const register = useCallback(async (payload) => {
        store.setLoading('register', true)
        store.setError('register', null)
        try {
            const { data } = await authApi.register(payload)
            store.setTokens(data.accessToken, data.refreshToken)
            store.setUser(data.user)
            navigate('/doctor/dashboard', { replace: true })
            toast.success('Account created! Welcome to Shifa.')
        } catch (err) {
            const msg = err.message || 'Registration failed.'
            store.setError('register', msg)
            toast.error(msg)
            throw err
        } finally {
            store.setLoading('register', false)
        }
    }, [store, navigate])

    // ─── Patient OTP Flow ─────────────────────────────────────────────────────
    const requestOTP = useCallback(async (phoneNumber) => {
        store.setLoading('otp', true)
        store.setError('otp', null)
        try {
            await authApi.requestPatientOTP(phoneNumber)
            store.setPendingPhone(phoneNumber)
            toast.success(`OTP sent to ${phoneNumber}`)
        } catch (err) {
            const msg = err.message || 'Could not send OTP. Try again.'
            store.setError('otp', msg)
            toast.error(msg)
            throw err
        } finally {
            store.setLoading('otp', false)
        }
    }, [store])

    const verifyOTP = useCallback(async (phoneNumber, otp) => {
        store.setLoading('otp', true)
        store.setError('otp', null)
        try {
            const { data } = await authApi.verifyPatientOTP(phoneNumber, otp)
            store.setTokens(data.accessToken, data.refreshToken)
            store.setUser(data.user)
            // Patient always lands on their visit portal
            navigate('/portal', { replace: true })
            toast.success('Verified! Welcome back.')
        } catch (err) {
            const msg = err.message || 'Invalid OTP. Please try again.'
            store.setError('otp', msg)
            toast.error(msg)
            throw err
        } finally {
            store.setLoading('otp', false)
        }
    }, [store, navigate])

    // ─── Logout ───────────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        try {
            await authApi.logout()
        } catch {
            // best-effort — always clear local state regardless
        } finally {
            store.clearAuth()
            navigate('/login', { replace: true })
            toast.success('You have been logged out.')
        }
    }, [store, navigate])

    return {
        // State
        user: store.user,
        isAuthenticated: store.isAuthenticated,
        isDoctor,
        isPatient,
        isAdmin,
        pendingPhone: store.pendingPhone,

        // Loading per-action
        loginLoading: store.loading.login,
        registerLoading: store.loading.register,
        otpLoading: store.loading.otp,

        // Error per-action
        loginError: store.error.login,
        registerError: store.error.register,
        otpError: store.error.otp,

        // Actions
        login,
        register,
        requestOTP,
        verifyOTP,
        logout,
    }
}
