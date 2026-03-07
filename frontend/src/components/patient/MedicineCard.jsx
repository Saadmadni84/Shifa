import React from 'react'

export function MedicineCard({ med }) {
  if (!med) return null
  
  return (
    <div className="bg-white rounded-3xl p-5 border border-indigo-100 shadow-sm flex flex-col gap-3 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
      
      <div>
        <h3 className="text-lg font-bold text-gray-900 leading-tight">{med.name}</h3>
        <p className="text-sm font-semibold text-indigo-600 mt-0.5">{med.dose}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">How often</div>
          <div className="font-semibold text-gray-800">{med.frequency}</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">When to take</div>
          <div className="font-semibold text-gray-800">{med.timing}</div>
        </div>
      </div>

      {med.duration && (
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-semibold mr-1">Duration:</span> {med.duration}
        </div>
      )}

      {med.purpose && (
        <p className="text-sm text-gray-600 leading-relaxed bg-indigo-50 rounded-xl p-3 border border-indigo-100 mt-1">
          <span className="font-semibold text-indigo-900 mr-1">Purpose:</span> 
          {med.purpose}
        </p>
      )}

      {med.warning && (
        <div className="flex items-start text-xs text-red-700 bg-red-50 p-3 rounded-xl border border-red-100 mt-1">
          <svg className="w-4 h-4 mr-1.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium">{med.warning}</span>
        </div>
      )}
    </div>
  )
}
