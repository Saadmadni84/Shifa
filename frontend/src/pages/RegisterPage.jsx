/**
 * RegisterPage.jsx — Registration (Doctor or Patient)
 * Route: /register
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, User, Building2, Stethoscope } from 'lucide-react'
import DoctorRegisterForm from '@/components/forms/DoctorRegisterForm'
import PatientRegisterForm from '@/components/forms/PatientRegisterForm'

const STEPS = [
  { id: 1, label: 'Your Details', icon: User },
  { id: 2, label: 'Clinic Info', icon: Building2 },
  { id: 3, label: 'Done!', icon: CheckCircle },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState(null)          // null | 'doctor' | 'patient'
  const [step, setStep] = useState(1)
  const [registeredName, setRegisteredName] = useState('')

  const handleSuccess = (payload) => {
    const resolvedName = typeof payload === 'string'
      ? payload
      : payload?.user?.displayName || payload?.displayName || ''
    setRegisteredName(resolvedName)
    setStep(3)
  }

  // ── Role picker ────────────────────────────────────────────────────────
  if (!role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M4 14L11 21L24 7" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-3xl font-bold text-gray-900 tracking-tight">
            shifa<span className="text-emerald-500">.ai</span>
          </span>
        </div>
        <p className="text-gray-400 text-sm mb-10">Create your free account</p>

        <div className="w-full max-w-sm space-y-4">

          {/* Doctor card */}
          <button
            onClick={() => setRole('doctor')}
            className="w-full bg-white border-2 border-gray-200 hover:border-emerald-400 hover:shadow-md rounded-2xl p-5 text-left transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-200 transition-colors">
                <Stethoscope size={24} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-base">Sign up as Doctor</p>
                <p className="text-sm text-gray-500 mt-0.5">Create visits, AI summaries & send to patients</p>
              </div>
              <ArrowRight size={18} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
            </div>
          </button>

          {/* Patient card */}
          <button
            onClick={() => setRole('patient')}
            className="w-full bg-white border-2 border-gray-200 hover:border-emerald-400 hover:shadow-md rounded-2xl p-5 text-left transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-200 transition-colors">
                <User size={24} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-base">Sign up as Patient</p>
                <p className="text-sm text-gray-500 mt-0.5">View your visit summaries & follow-up</p>
              </div>
              <ArrowRight size={18} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
            </div>
          </button>

          <p className="text-center text-sm text-gray-500 pt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    )
  }

  // ── Patient sign-up (demo only — real auth goes via OTP link from doctor) ──
  if (role === 'patient') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4">
        <div className="flex items-center gap-2 mb-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M4 14L11 21L24 7" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-3xl font-bold text-gray-900 tracking-tight">
            shifa<span className="text-emerald-500">.ai</span>
          </span>
        </div>
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-7 mt-6 shadow-sm">
          {step < 3 ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Create Patient Account</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6 text-center">
                Register your account to access your records and follow-up updates.
              </p>
              <PatientRegisterForm onSuccess={handleSuccess} />
              <button
                onClick={() => {
                  setRole(null)
                  setStep(1)
                }}
                className="w-full mt-3 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                ← Go back
              </button>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={30} className="text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome{registeredName ? `, ${registeredName}` : ''}!</h2>
              <p className="text-sm text-gray-500 mb-6">
                Your patient account is ready. Continue to sign in.
              </p>
              <button
                onClick={() => navigate('/login', { replace: true })}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
              >
                Go to Sign in
              </button>
            </div>
          )}

          <p className="mt-4 text-sm text-gray-500 text-center">
            Are you a doctor?{' '}
            <button
              onClick={() => {
                setRole('doctor')
                setStep(1)
              }}
              className="text-emerald-600 font-semibold hover:underline"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    )
  }

  // ── Doctor multi-step registration ─────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50 px-4 py-12">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M4 14L11 21L24 7" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-2xl font-bold text-gray-900 tracking-tight">
          shifa<span className="text-emerald-500">.ai</span>
        </span>
      </div>

      {/* Step pills */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step > s.id  ? 'bg-emerald-500 text-white' :
              step === s.id ? 'bg-emerald-500 text-white' :
                              'bg-gray-200 text-gray-500'
            }`}>
              {step > s.id ? '✓' : s.id}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-10 h-0.5 mx-1 ${step > s.id ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="w-full max-w-sm">
        {step < 3 ? (
          <>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
              {step === 1 ? 'Create your account' : 'Tell us about your clinic'}
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              {step === 1
                ? 'Start your free Shifa account — register as a doctor.'
                : 'This helps us personalise the experience for your patients.'}
            </p>
            <DoctorRegisterForm
              step={step}
              onStepChange={setStep}
              onSuccess={handleSuccess}
            />
          </>
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={36} className="text-emerald-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
              Welcome to Shifa{registeredName ? `, Dr. ${registeredName}` : ''}! 🎉
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Your account is ready. Start by creating your first patient visit.
            </p>
            <button
              onClick={() => navigate('/doctor/dashboard', { replace: true })}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm"
            >
              Go to my dashboard
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step < 3 && (
          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 font-semibold hover:underline">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  )
}

