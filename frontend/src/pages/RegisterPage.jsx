/**
 * RegisterPage.jsx — Doctor Registration
 * Route: /register
 *
 * Features:
 *   - Multi-step form: Personal → Clinic → Done
 *   - Step 1: name, email, password, phone
 *   - Step 2: clinic name, specialization, city, preferred language
 *   - Step 3: success screen with next-steps
 *   - OTP verification for phone (optional step)
 *   - Redirects to /doctor/dashboard on success
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Heart, ArrowLeft, ArrowRight, CheckCircle, User, Building2, Stethoscope } from 'lucide-react'
import DoctorRegisterForm from '@/components/forms/DoctorRegisterForm'

const STEPS = [
  { id: 1, label: 'Your Details', icon: User },
  { id: 2, label: 'Clinic Info', icon: Building2 },
  { id: 3, label: 'Done!', icon: CheckCircle },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep]           = useState(1)
  const [registeredName, setRegisteredName] = useState('')

  const handleSuccess = (name) => {
    setRegisteredName(name)
    setStep(3)
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-teal-50 via-white to-emerald-50">

      {/* ── Left panel ──────────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-gray-900 p-12 text-white">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Heart size={18} className="text-white" fill="white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">Shifa</span>
        </div>

        <div>
          <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-6">
            <Stethoscope size={26} className="text-emerald-400" />
          </div>
          <h2 className="text-3xl font-extrabold leading-tight mb-4">
            Join thousands of doctors helping patients understand their care.
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Free to start. No credit card. Set up in under 2 minutes.
          </p>
        </div>

        {/* Progress indicator on left panel */}
        <div className="space-y-4">
          {STEPS.map((s) => {
            const Icon = s.icon
            const done    = step > s.id
            const current = step === s.id
            return (
              <div key={s.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  done    ? 'bg-emerald-500 border-emerald-500'  :
                  current ? 'border-emerald-400 bg-emerald-400/10' :
                            'border-gray-700 bg-gray-800'
                }`}>
                  {done
                    ? <CheckCircle size={14} className="text-white" />
                    : <Icon size={14} className={current ? 'text-emerald-400' : 'text-gray-600'} />
                  }
                </div>
                <span className={`text-sm font-medium ${
                  current ? 'text-white' : done ? 'text-emerald-400' : 'text-gray-600'
                }`}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Heart size={16} className="text-white" fill="white" />
          </div>
          <span className="text-xl font-extrabold text-gray-900">Shifa</span>
        </div>

        {/* Mobile step pills */}
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step > s.id  ? 'bg-emerald-500 text-white' :
                step === s.id ? 'bg-emerald-500 text-white' :
                                'bg-gray-200 text-gray-500'
              }`}>
                {step > s.id ? '✓' : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${step > s.id ? 'bg-emerald-500' : 'bg-gray-200'}`} />
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
            /* ── Success screen ─────────────────────────────────────────── */
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={36} className="text-emerald-500" />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
                Welcome to Shifa{registeredName ? `, Dr. ${registeredName}` : ''}! 🎉
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Your account is ready. Start by creating your first patient visit — Shifa will handle the rest.
              </p>
              {[
                '✅ Create a patient visit',
                '✅ AI processes your notes',
                '✅ Patient gets WhatsApp summary',
              ].map((item) => (
                <div key={item} className="text-left text-sm text-gray-600 mb-2 flex items-center gap-2">
                  <span>{item}</span>
                </div>
              ))}
              <button
                onClick={() => navigate('/doctor/dashboard', { replace: true })}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md"
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
    </div>
  )
}
