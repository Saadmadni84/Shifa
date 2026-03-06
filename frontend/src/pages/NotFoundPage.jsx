/**
 * NotFoundPage.jsx — 404
 * Route: *
 */

import { useNavigate } from 'react-router-dom'
import { Heart, Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
        <Heart size={28} className="text-emerald-500" />
      </div>
      <h1 className="text-6xl font-extrabold text-gray-900 mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-700 mb-3">Page not found</h2>
      <p className="text-gray-500 text-sm max-w-xs mb-8 leading-relaxed">
        The page you're looking for doesn't exist or may have moved. If this was a patient portal link, it may have expired.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={16} /> Go back
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors"
        >
          <Home size={16} /> Home
        </button>
      </div>
    </div>
  )
}
