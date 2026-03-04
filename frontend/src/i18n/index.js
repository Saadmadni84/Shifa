/**
 * i18n/index.js — Shifa i18next Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * India-first i18n setup supporting 12 languages:
 *   English, Hindi, Tamil, Telugu, Bengali, Marathi,
 *   Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu
 *
 * Strategy:
 *   • English bundled at build time (no flash of untranslated content)
 *   • All other languages lazy-loaded via dynamic import (reduces initial bundle)
 *   • Language persisted to localStorage key 'shifa_lang'
 *   • Auto-detected from browser / OS language on first visit
 *   • RTL support for Urdu (sets document.dir on change)
 *   • Namespace: 'translation' (single namespace — app is focused)
 *
 * Usage in components:
 *   const { t } = useTranslation()
 *   t('nav.dashboard')       → "डैशबोर्ड" (if lang = hi)
 *   t('visit.medicines', { count: 3 }) → plural-aware
 * ─────────────────────────────────────────────────────────────────────────────
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// ── English bundled (always available, zero latency) ──────────────────────────
import en from './locales/en.json'

// ── RTL languages ─────────────────────────────────────────────────────────────
const RTL_LANGS = new Set(['ur'])

// ── Lazy loader for all other languages ──────────────────────────────────────
const lazyLoaders = {
    hi: () => import('./locales/hi.json'),
    ta: () => import('./locales/ta.json'),
    te: () => import('./locales/te.json'),
    bn: () => import('./locales/bn.json'),
    mr: () => import('./locales/mr.json'),
    gu: () => import('./locales/gu.json'),
    kn: () => import('./locales/kn.json'),
    ml: () => import('./locales/ml.json'),
    pa: () => import('./locales/pa.json'),
    or: () => import('./locales/or.json'),
    ur: () => import('./locales/ur.json'),
}

// ── Language metadata (used by LanguageSwitcher UI) ──────────────────────────
export const LANGUAGES = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧', rtl: false },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', rtl: false },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', rtl: false },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', rtl: false },
    { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳', rtl: false },
    { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳', rtl: false },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳', rtl: false },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', rtl: false },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳', rtl: false },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳', rtl: false },
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳', rtl: false },
    { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇵🇰', rtl: true },
]

// ── Custom language detector — checks localStorage then navigator ─────────────
const detectorOptions = {
    order: ['localStorage', 'navigator', 'htmlTag'],
    lookupLocalStorage: 'shifa_lang',
    caches: ['localStorage'],
    excludeCacheFor: ['cimode'],
    htmlTag: document.documentElement,
}

// ── i18next init ──────────────────────────────────────────────────────────────
i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
        },
        fallbackLng: 'en',
        supportedLngs: LANGUAGES.map(l => l.code),
        nonExplicitSupportedLngs: true,   // 'hi-IN' → 'hi'
        load: 'languageOnly',  // strip region codes
        interpolation: {
            escapeValue: false,             // React already escapes
        },
        detection: detectorOptions,
        react: {
            useSuspense: false,             // avoid Suspense boundary requirement
        },
    })

// ── Lazy-load non-English languages on demand ─────────────────────────────────
i18n.on('languageChanged', async (lang) => {
    const base = lang.split('-')[0]

    // Apply RTL
    document.documentElement.dir = RTL_LANGS.has(base) ? 'rtl' : 'ltr'
    document.documentElement.lang = base

    // Load if not already bundled
    if (base !== 'en' && !i18n.hasResourceBundle(base, 'translation')) {
        const loader = lazyLoaders[base]
        if (loader) {
            try {
                const module = await loader()
                i18n.addResourceBundle(base, 'translation', module.default ?? module, true, true)
                // Force re-render by triggering a fake change back and forth
                await i18n.reloadResources(base)
            } catch (err) {
                console.warn(`[i18n] Failed to load language "${base}":`, err)
                // Graceful fallback to English already handled by fallbackLng
            }
        }
    }
})

export default i18n
