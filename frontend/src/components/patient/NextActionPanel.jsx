import React, { useState } from 'react'

export function NextActionPanel({ items }) {
  const [checkedItems, setCheckedItems] = useState({})

  const toggleCheck = (id) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (!items || items.length === 0) return null

  const completedCount = Object.values(checkedItems).filter(Boolean).length
  const progressPercent = Math.round((completedCount / items.length) * 100)

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-emerald-200 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 text-white">
        <h2 className="text-lg font-bold">Your Action Plan</h2>
        <p className="text-emerald-100 text-sm mt-0.5">Things you need to do</p>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs font-semibold mb-1 opacity-90">
            <span>Progress</span>
            <span>{completedCount} of {items.length} done</span>
          </div>
          <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-2 space-y-1">
        {items.map((item, index) => {
          const isChecked = !!checkedItems[item.id]
          return (
            <button
              key={item.id || index}
              onClick={() => toggleCheck(item.id)}
              className={`w-full flex items-start gap-4 p-4 rounded-2xl text-left transition-all group hover:bg-emerald-50 ${isChecked ? 'opacity-60' : ''}`}
            >
              <div 
                className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isChecked 
                    ? 'border-emerald-500 bg-emerald-500' 
                    : 'border-gray-300 bg-white group-hover:border-emerald-400'
                }`}
              >
                {isChecked && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-base leading-snug transition-all ${isChecked ? 'text-gray-400 line-through' : 'text-gray-800 font-medium'}`}>
                {item.text}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
