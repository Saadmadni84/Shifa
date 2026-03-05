/**
 * LoginPage.jsx — Doctor Sign In
 * Route: /login
 *
 * Features:
 *   - Email + password form
 *   - Session-expired banner (from navigate state)
 *   - Error display
 *   - Link to register
 *   - Redirects to /doctor/dashboard on success
 */

import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Heart, Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react'
import { useAuthStore } from '@/store'
import { LoginForm } from '@/components/forms/LoginForm'

export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { isAuthenticated, user } = useAuthStore()
  const sessionExpired = location.state?.sessionExpired

  // Redirect already-logged-in users
  useEffect(() => {
    if (isAuthenticated?.()) {
      navigate(user?.role === 'DOCTOR' ? '/doctor/dashboard' : '/', { replace: true })
    }
  }, [])

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* ── Left illustration panel (desktop) ───────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-emerald-600 p-12 text-white">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Heart size={18} className="text-white" fill="white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">Shifa</span>
        </div>

        <div>
          <h2 className="text-4xl font-extrabold leading-tight mb-6">
            Turn your visit notes into patient understanding.
          </h2>
          <p className="text-emerald-200 text-base leading-relaxed mb-8">
            Shifa delivers AI summaries of your visit to patients in their own language — via WhatsApp, in seconds.
          </p>
          {/* Mini feature list */}
          {[
            'AI summaries in 12+ Indian languages',
            'Delivered via WhatsApp — no patient app needed',
            '24/7 patient follow-up chat',
            'Secure & DPDP Act compliant',
          ].map((f) => (
            <div key={f} className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-emerald-100 text-sm">{f}</span>
            </div>
          ))}
        </div>

        <p className="text-emerald-300 text-xs">
          © {new Date().getFullYear()} Shifa Health Technologies
        </p>
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

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-6">Sign in to your doctor dashboard</p>

          {/* Session expired banner */}
          {sessionExpired && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
              <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
              <p className="text-amber-700 text-sm">Your session expired. Please sign in again.</p>
            </div>
          )}

          <LoginForm
            onSuccess={(role) => {
              navigate(role === 'DOCTOR' ? '/doctor/dashboard' : '/', { replace: true })
            }}
          />

          <p className="text-center text-sm text-gray-500 mt-6">
            New to Shifa?{' '}
            <Link to="/register" className="text-emerald-600 font-semibold hover:underline">
              Register as a doctor
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
