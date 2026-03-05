/**
 * PatientPortalPage.jsx — Patient's Visit Summary Portal
 * Route: /portal/:token
 * Auth: NONE — public page, token embedded in WhatsApp link
 *
 * This is what the PATIENT sees when they tap the WhatsApp link.
 * It must work perfectly on mobile, in any Indian language,
 * for patients with limited digital literacy.
 *
 * Layout (mobile-first, simple):
 *   ┌──────────────────────────────────────────────────┐
 *   │  Shifa logo + doctor name / clinic               │
 *   │  Visit date + patient name                       │
 *   │  Language switcher (12 Indian languages)         │
 *   │  ────────────────────────────────────────────    │
 *   │  Diagnosis card (large, clear)                   │
 *   │  Patient-friendly summary (in native language)   │
 *   │  Medicine schedule (name, dose, time, food)      │
 *   │  Red flag alerts (when to go to hospital)        │
 *   │  Diet advice                                     │
 *   │  Follow-up reminder                              │
 *   │  ────────────────────────────────────────────    │
 *   │  Chat button → /portal/:token/chat               │
 *   └──────────────────────────────────────────────────┘
 *
 * Data:
 *   GET /api/v1/public/visits/:token   (publicApi.getPortalVisit)
 *   GET /api/v1/public/visits/:token?lang=hi  (language switch)
 *
 * Error states:
 *   404 → token not found
 *   410 → token expired (>30 days old)
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MessageCircle, Globe, Heart, Phone,
  AlertTriangle, ChevronDown, RefreshCw
} from 'lucide-react'

import PatientLayout      from '@/components/layout/PatientLayout'
import DiagnosisCard      from '@/components/patient/DiagnosisCard'
import MedicineSchedule   from '@/components/patient/MedicineSchedule'
import RedFlagAlerts      from '@/components/patient/RedFlagAlerts'
import DietAdvice         from '@/components/patient/DietAdvice'
import FollowUpReminder   from '@/components/patient/FollowUpReminder'
import VisitHeader        from '@/components/patient/VisitHeader'
import { Spinner }        from '@/components/ui/Spinner'

import { getPortalVisit, getPortalVisitInLanguage } from '@/api/public'

// ─── Language options ─────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en', name: 'English',    native: 'English'   },
  { code: 'hi', name: 'Hindi',      native: 'हिंदी'      },
  { code: 'ta', name: 'Tamil',      native: 'தமிழ்'      },
  { code: 'te', name: 'Telugu',     native: 'తెలుగు'     },
  { code: 'bn', name: 'Bengali',    native: 'বাংলা'      },
  { code: 'mr', name: 'Marathi',    native: 'मराठी'      },
  { code: 'gu', name: 'Gujarati',   native: 'ગુજરાતી'    },
  { code: 'kn', name: 'Kannada',    native: 'ಕನ್ನಡ'      },
  { code: 'ml', name: 'Malayalam',  native: 'മലയാളം'     },
  { code: 'pa', name: 'Punjabi',    native: 'ਪੰਜਾਬੀ'     },
  { code: 'ur', name: 'Urdu',       native: 'اردو'       },
  { code: 'or', name: 'Odia',       native: 'ଓଡ଼ିଆ'      },
]

// ─── Language switcher ────────────────────────────────────────────────────────
function LanguageSwitcher({ current, available, onChange }) {
  const [open, setOpen] = useState(false)
  const currentLang = LANGUAGES.find(l => l.code === current) ?? LANGUAGES[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-emerald-300 transition-colors shadow-sm"
      >
        <Globe size={14} className="text-emerald-500" />
        {currentLang.native}
        <ChevronDown size={12} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden min-w-[180px]">
            <div className="p-2 grid grid-cols-2 gap-1">
              {LANGUAGES.filter(l => !available || available.includes(l.code) || l.code === 'en').map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { onChange(lang.code); setOpen(false) }}
                  className={`text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                    lang.code === current
                      ? 'bg-emerald-500 text-white font-semibold'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {lang.native}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Expired / Not found states ───────────────────────────────────────────────
function ErrorScreen({ type }) {
  const isExpired = type === 'expired'
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 text-3xl ${
        isExpired ? 'bg-amber-100' : 'bg-red-100'
      }`}>
        {isExpired ? '⏰' : '❌'}
      </div>
      <h1 className="text-xl font-extrabold text-gray-900 mb-2">
        {isExpired ? 'Summary link expired' : 'Link not found'}
      </h1>
      <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-6">
        {isExpired
          ? 'This visit summary link has expired (30 days). Please contact your doctor for a new link.'
          : 'This link is invalid or has been removed. Please check the WhatsApp message again.'}
      </p>
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Heart size={14} className="text-emerald-500" />
        Powered by Shifa
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PatientPortalPage() {
  const { token }   = useParams()
  const navigate    = useNavigate()

  const [visitData, setVisitData]     = useState(null)
  const [loading, setLoading]         = useState(true)
  const [langLoading, setLangLoading] = useState(false)
  const [error, setError]             = useState(null) // 'not_found' | 'expired' | 'error'
  const [activeLang, setActiveLang]   = useState(null)

  // ── Load visit on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return
    setLoading(true)
    getPortalVisit(token)
      .then((data) => {
        setVisitData(data)
        setActiveLang(data?.patient?.preferredLanguage ?? 'en')
        setLoading(false)
      })
      .catch((err) => {
        if (err.status === 404) setError('not_found')
        else if (err.status === 410) setError('expired')
        else setError('error')
        setLoading(false)
      })
  }, [token])

  // ── Language switch ──────────────────────────────────────────────────────
  const handleLanguageChange = async (langCode) => {
    if (langCode === activeLang) return
    setLangLoading(true)
    try {
      const data = await getPortalVisitInLanguage(token, langCode)
      setVisitData(data)
      setActiveLang(langCode)
    } catch {
      // Fallback to current
    } finally {
      setLangLoading(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Heart size={22} className="text-white" fill="white" />
        </div>
        <Spinner size="lg" />
        <p className="text-sm text-gray-500">Loading your visit summary…</p>
      </div>
    )
  }

  // ── Error states ─────────────────────────────────────────────────────────
  if (error === 'not_found' || error === 'expired') {
    return <ErrorScreen type={error} />
  }

  if (error || !visitData) {
    return <ErrorScreen type="error" />
  }

  const { doctor, patient, aiSummary, visitDate, followUpDate, availableLanguages } = visitData

  // ── Determine text direction ──────────────────────────────────────────────
  const isRTL = activeLang === 'ur'

  return (
    <PatientLayout>
      <div
        className="min-h-screen bg-gradient-to-b from-emerald-50/60 to-white pb-24"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* ── Top bar ───────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Heart size={13} className="text-white" fill="white" />
            </div>
            <span className="font-extrabold text-gray-900 text-sm">Shifa</span>
          </div>
          <LanguageSwitcher
            current={activeLang}
            available={availableLanguages}
            onChange={handleLanguageChange}
          />
        </div>

        {langLoading && (
          <div className="fixed inset-0 z-40 bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}

        <div className="max-w-xl mx-auto px-4 pt-5 space-y-4">
          {/* ── Visit header ────────────────────────────────────────────── */}
          <VisitHeader
            doctorName={doctor?.name}
            doctorSpecialization={doctor?.specialization}
            clinicName={doctor?.clinicName}
            patientName={patient?.firstName}
            visitDate={visitDate}
            language={activeLang}
          />

          {/* ── Diagnosis ────────────────────────────────────────────────── */}
          {aiSummary?.diagnosis && (
            <DiagnosisCard
              diagnosis={aiSummary.diagnosis}
              language={activeLang}
            />
          )}

          {/* ── Plain language summary ──────────────────────────────────── */}
          {aiSummary?.patientFriendlyText && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📋</span>
                <h2 className="font-extrabold text-gray-900 text-base">
                  {activeLang === 'hi' ? 'आपकी स्वास्थ्य जानकारी' : 'Your Visit Summary'}
                </h2>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {aiSummary.patientFriendlyText}
              </p>
            </div>
          )}

          {/* ── Medicines ──────────────────────────────────────────────────── */}
          {aiSummary?.medicines?.length > 0 && (
            <MedicineSchedule
              medicines={aiSummary.medicines}
              language={activeLang}
            />
          )}

          {/* ── Red flags ──────────────────────────────────────────────────── */}
          {aiSummary?.redFlags?.length > 0 && (
            <RedFlagAlerts
              alerts={aiSummary.redFlags}
              language={activeLang}
            />
          )}

          {/* ── Diet advice ────────────────────────────────────────────────── */}
          {aiSummary?.dietAdvice && (
            <DietAdvice
              advice={aiSummary.dietAdvice}
              language={activeLang}
            />
          )}

          {/* ── Follow-up ──────────────────────────────────────────────────── */}
          {followUpDate && (
            <FollowUpReminder
              followUpDate={followUpDate}
              doctorName={doctor?.name}
              doctorPhone={doctor?.phone}
              language={activeLang}
            />
          )}

          {/* ── Doctor contact ─────────────────────────────────────────────── */}
          {doctor?.phone && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-sm">Contact Dr. {doctor.name?.split(' ').pop()}</div>
                <div className="text-xs text-gray-500">{doctor.phone}</div>
              </div>
              <a
                href={`tel:${doctor.phone}`}
                className="text-xs font-bold text-emerald-600 hover:underline flex-shrink-0"
              >
                Call
              </a>
            </div>
          )}
        </div>

        {/* ── Sticky bottom: Chat CTA ──────────────────────────────────────── */}
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100">
          <div className="max-w-xl mx-auto">
            <button
              onClick={() => navigate(`/portal/${token}/chat`)}
              className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl text-base"
            >
              <MessageCircle size={20} />
              {activeLang === 'hi' ? 'सवाल पूछें' :
               activeLang === 'ta' ? 'கேள்விகள் கேளுங்கள்' :
               activeLang === 'te' ? 'ప్రశ్నలు అడగండి' :
               activeLang === 'bn' ? 'প্রশ্ন করুন' :
               'Ask a question about your visit'}
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">
              AI-powered · Powered by Shifa
            </p>
          </div>
        </div>
      </div>
    </PatientLayout>
  )
}