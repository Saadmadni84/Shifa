/**
 * LandingPage.jsx — Shifa Public Marketing Page
 * Route: /
 *
 * Purpose: First impression for doctors discovering Shifa.
 *   - Hero with tagline + CTA
 *   - Indian language marquee
 *   - Features grid
 *   - How it works steps
 *   - Testimonials
 *   - Final CTA + footer
 */

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import {
  Heart, MessageCircle, Languages, Smartphone,
  ChevronRight, Star, Shield, Zap, CheckCircle,
  ArrowRight, FileText
} from 'lucide-react'

const LANGUAGE_MARQUEE = [
  { name: 'हिंदी', label: 'Hindi' },
  { name: 'தமிழ்', label: 'Tamil' },
  { name: 'తెలుగు', label: 'Telugu' },
  { name: 'বাংলা', label: 'Bengali' },
  { name: 'मराठी', label: 'Marathi' },
  { name: 'ગુજરાતી', label: 'Gujarati' },
  { name: 'ಕನ್ನಡ', label: 'Kannada' },
  { name: 'മലയാളം', label: 'Malayalam' },
  { name: 'ਪੰਜਾਬੀ', label: 'Punjabi' },
  { name: 'اردو', label: 'Urdu' },
  { name: 'ଓଡ଼ିଆ', label: 'Odia' },
  { name: 'অসমীয়া', label: 'Assamese' },
]

const FEATURES = [
  {
    icon: FileText, color: 'emerald',
    title: 'Instant AI Summary',
    desc: 'Doctor jots notes → Shifa converts them into a clear, structured summary in seconds using Claude AI.',
  },
  {
    icon: Languages, color: 'blue',
    title: '12+ Indian Languages',
    desc: 'Summaries delivered in the patient\'s native tongue — Hindi, Tamil, Bengali, Marathi and more.',
  },
  {
    icon: MessageCircle, color: 'green',
    title: 'WhatsApp Delivery',
    desc: 'No app install needed. Patient gets a WhatsApp message with a tap-to-open summary link.',
  },
  {
    icon: Smartphone, color: 'purple',
    title: 'Patient AI Chat',
    desc: 'Patients ask follow-up questions in their language. AI answers using their visit context.',
  },
  {
    icon: Shield, color: 'orange',
    title: 'Secure & Private',
    desc: 'Token-based patient access. Data encrypted at rest and in transit. DPDP Act compliant.',
  },
  {
    icon: Zap, color: 'yellow',
    title: 'Blazing Fast',
    desc: 'Under 10 seconds from doctor submission to patient WhatsApp delivery.',
  },
]

const STEPS = [
  { num: '01', icon: FileText, title: 'Doctor enters visit notes', desc: 'Type or dictate the diagnosis, medications, and advice after the consultation.' },
  { num: '02', icon: Zap, title: 'AI processes instantly', desc: 'Claude AI extracts key info and generates a plain-language patient summary.' },
  { num: '03', icon: MessageCircle, title: 'Delivered via WhatsApp', desc: 'Patient receives a rich WhatsApp message in their preferred Indian language.' },
  { num: '04', icon: Heart, title: 'Patient chats & understands', desc: 'They tap the link, read their summary, and ask follow-up questions in their language.' },
]

const TESTIMONIALS = [
  {
    text: 'मेरे मरीज़ अब दवाइयाँ सही तरीके से लेते हैं। शिफा ने हिंदी में सब कुछ समझा दिया।',
    author: 'Dr. Priya Sharma', role: 'General Physician, Jaipur', rating: 5,
  },
  {
    text: 'My patients in rural Tamil Nadu can now read their prescriptions clearly. Game changer.',
    author: 'Dr. Karthik Subramanian', role: 'Family Medicine, Coimbatore', rating: 5,
  },
  {
    text: 'Patients used to call me 10 times after a visit. Now Shifa answers their basic questions automatically.',
    author: 'Dr. Anjali Mehta', role: 'Pediatrician, Pune', rating: 5,
  },
]

const COLOR_MAP = {
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  blue:    'bg-blue-50 text-blue-600 border-blue-100',
  green:   'bg-green-50 text-green-600 border-green-100',
  purple:  'bg-purple-50 text-purple-600 border-purple-100',
  orange:  'bg-orange-50 text-orange-600 border-orange-100',
  yellow:  'bg-yellow-50 text-yellow-600 border-yellow-100',
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (isAuthenticated?.()) {
      navigate(user?.role === 'DOCTOR' ? '/doctor/dashboard' : '/login', { replace: true })
    }
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Heart size={16} className="text-white" fill="white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Shifa<span className="text-emerald-500">.</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-emerald-600 transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:block text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors px-3 py-2"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        className="relative pt-28 pb-20 px-4 sm:px-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)' }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-100 rounded-full opacity-40 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-100 rounded-full opacity-30 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-full px-4 py-1.5 text-xs font-semibold text-emerald-700 mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Built for Bharat · AI-Powered · WhatsApp-First
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
            Your patients leave your clinic{' '}
            <span className="text-emerald-500">confident</span>
            {' '}— not confused.
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-4 leading-relaxed">
            Shifa converts your visit notes into simple summaries and delivers them to patients
            in their own Indian language — via <strong className="text-green-600">WhatsApp</strong>.
          </p>
          <p className="text-base text-gray-500 max-w-xl mx-auto mb-10">No app download for patients. Just tap and understand.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            <button
              onClick={() => navigate('/register')}
              className="group flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Start for free — no credit card
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-white text-gray-700 font-semibold text-base px-8 py-4 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all shadow-sm"
            >
              Sign in
            </button>
          </div>
          <p className="text-xs text-gray-400 flex items-center justify-center gap-4 flex-wrap">
            <span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-500" /> Free for solo doctors</span>
            <span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-500" /> DPDP Act compliant</span>
            <span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-500" /> Works on any phone</span>
          </p>
        </div>

        {/* Language marquee */}
        <div className="relative mt-14 max-w-5xl mx-auto overflow-hidden">
          <div className="flex gap-3 animate-marquee">
            {[...LANGUAGE_MARQUEE, ...LANGUAGE_MARQUEE].map((lang, i) => (
              <div key={i} className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-sm flex-shrink-0">
                <span className="text-lg font-bold text-gray-800">{lang.name}</span>
                <span className="text-xs text-gray-400">{lang.label}</span>
              </div>
            ))}
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#f0fdf4] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#f0f9ff] to-transparent pointer-events-none" />
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────── */}
      <section className="bg-emerald-600 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-white">
          {[
            { num: '12+', label: 'Indian Languages' },
            { num: '<10s', label: 'Delivery time' },
            { num: '100%', label: 'WhatsApp native' },
            { num: '24/7', label: 'Patient AI chat' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold mb-1">{s.num}</div>
              <div className="text-emerald-200 text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-4">Everything a busy doctor needs</h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">From note entry to patient understanding — Shifa handles the entire post-visit communication chain.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${COLOR_MAP[f.color]}`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-base">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">How it works</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-4">4 steps. Under 30 seconds.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.num} className="flex gap-5 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-md">
                    <Icon size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">{step.num}</div>
                    <h3 className="font-bold text-gray-900 mb-1.5 text-base">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 bg-emerald-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-4">Doctors across India love Shifa</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.author} className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm">
                <div className="flex mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <div className="font-bold text-gray-900 text-sm">{t.author}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 bg-gray-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Heart size={28} className="text-white" fill="white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready to help your patients truly understand their care?
          </h2>
          <p className="text-gray-400 text-base mb-8 leading-relaxed">
            Join hundreds of doctors making healthcare accessible for every Indian patient, in every language, on every phone.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="group inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg px-10 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Create your free account
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-gray-500 text-sm mt-4">No credit card. No setup fee. Ready in 2 minutes.</p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-gray-500 text-sm py-8 px-4 text-center border-t border-gray-800">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Heart size={12} className="text-white" fill="white" />
          </div>
          <span className="font-bold text-white">Shifa</span>
        </div>
        <p className="text-xs">Built with love for India · AI by Claude · DPDP Act Compliant</p>
        <p className="text-xs mt-1 text-gray-600">© {new Date().getFullYear()} Shifa Health Technologies</p>
      </footer>

      <style>{`
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .animate-marquee { animation: marquee 25s linear infinite; white-space: nowrap; display: flex; }
      `}</style>
    </div>
  )
}
