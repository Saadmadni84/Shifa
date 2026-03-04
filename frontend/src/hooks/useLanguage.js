/**
 * useLanguage.js — Shifa Indian Language Management Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Shifa is India-first. This hook manages:
 *   • Current language selection (Hindi, Tamil, Telugu, Bengali, Kannada, etc.)
 *   • Language persistence across sessions (localStorage + backend user profile)
 *   • i18next language switching
 *   • Available languages list from backend /api/v1/languages
 *   • Language metadata (script direction, native name, flag emoji)
 *
 * Consumed by: LanguageSwitcher, SendToPatientForm, AISummaryReview.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { patientsApi } from '@/api/patients'
import toast from 'react-hot-toast'

// ─── Hardcoded fallback — matches the 10 languages in backend LANGUAGE enum ──
export const INDIAN_LANGUAGES = [
    { code: 'en', name: 'English', native: 'English', flag: '🇮🇳', rtl: false },
    { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳', rtl: false },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', rtl: false },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', rtl: false },
    { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳', rtl: false },
    { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳', rtl: false },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳', rtl: false },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', rtl: false },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳', rtl: false },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳', rtl: false },
    { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇮🇳', rtl: true },
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳', rtl: false },
]

const STORAGE_KEY = 'shifa_preferred_language'

export function useLanguage() {
    const { i18n } = useTranslation()
    const { user } = useAuth()

    // ─── Backend languages (may include additional metadata) ─────────────────
    const { data: serverLanguages } = useQuery({
        queryKey: ['languages'],
        queryFn: () => patientsApi.getLanguages?.().then(r => r.data?.data) ?? Promise.resolve(null),
        staleTime: Infinity,   // languages never change in a session
        retry: false,
    })

    const languages = serverLanguages ?? INDIAN_LANGUAGES

    // ─── Current language (from i18next, falling back to stored preference) ───
    const currentCode = i18n.language?.split('-')[0] ?? 'en'
    const current = languages.find(l => l.code === currentCode) ?? languages[0]

    // ─── Change language ──────────────────────────────────────────────────────
    const changeLanguage = useCallback(async (code) => {
        // 1. Update i18next
        await i18n.changeLanguage(code)

        // 2. Persist locally
        localStorage.setItem(STORAGE_KEY, code)

        // 3. Update backend profile if user is logged in (best-effort)
        if (user?.id) {
            try {
                await patientsApi.updateLanguagePreference?.(code)
            } catch {
                // non-critical — don't surface error to user
            }
        }

        // 4. RTL: update document direction
        const lang = languages.find(l => l.code === code)
        document.documentElement.dir = lang?.rtl ? 'rtl' : 'ltr'
        document.documentElement.lang = code

        toast.success(`Language changed to ${lang?.native ?? code}`)
    }, [i18n, user, languages])

    // ─── Helpers ─────────────────────────────────────────────────────────────
    const getLanguageName = useCallback((code) =>
        languages.find(l => l.code === code)?.name ?? code, [languages])

    const getNativeName = useCallback((code) =>
        languages.find(l => l.code === code)?.native ?? code, [languages])

    const isRTL = current?.rtl ?? false

    return {
        languages,
        current,
        currentCode,
        isRTL,

        changeLanguage,
        getLanguageName,
        getNativeName,
    }
}
