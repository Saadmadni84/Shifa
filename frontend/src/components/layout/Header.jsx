import React from 'react'
import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/demo" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <div className="flex items-baseline">
          <span className="text-xl font-bold text-gray-900 tracking-tight">shifa</span>
          <span className="text-xl font-bold text-emerald-500 tracking-tight">.health</span>
        </div>
      </Link>
      
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          DEMO MODE
        </div>
      </div>
    </header>
  )
}
