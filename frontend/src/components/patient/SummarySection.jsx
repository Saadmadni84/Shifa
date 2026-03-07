import React, { useState } from 'react'

export function SummarySection({ title, content, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (!content) return null

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left bg-gray-50/50 hover:bg-gray-50 transition-colors"
      >
        <span className="font-bold text-gray-900">{title}</span>
        <svg 
          className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div 
        className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="p-5 border-t border-gray-100 text-gray-700 text-sm leading-relaxed bg-white">
          {Array.isArray(content) ? (
            <ul className="list-disc pl-5 space-y-1">
              {content.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          ) : (
            <p className="whitespace-pre-wrap">{content}</p>
          )}
        </div>
      </div>
    </div>
  )
}
