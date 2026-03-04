export default function DietAdvice({ dietaryAdvice = [], activityRestrictions = [], specialInstructions }) {
  const has = dietaryAdvice.length || activityRestrictions.length || specialInstructions
  if (!has)
    return (
      <div className="px-4 py-10 text-center text-gray-400 text-sm">
        <span className="text-3xl block mb-2">🥗</span>
        No specific dietary advice for this visit.
      </div>
    )
  return (
    <div className="px-4 py-2 space-y-3">
      {dietaryAdvice.length > 0 && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🥗</span>
            <p className="font-bold text-green-800">What to Eat & Drink</p>
          </div>
          <ul className="space-y-2.5">
            {dietaryAdvice.map((d, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-green-500 font-bold mt-0.5 shrink-0">✓</span>
                <p className="text-sm text-green-800 leading-relaxed">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {activityRestrictions.length > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🏃</span>
            <p className="font-bold text-orange-800">Activity Advice</p>
          </div>
          <ul className="space-y-2.5">
            {activityRestrictions.map((a, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-orange-400 font-bold mt-0.5 shrink-0">—</span>
                <p className="text-sm text-orange-800 leading-relaxed">{a}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {specialInstructions && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💡</span>
            <p className="font-bold text-blue-800">Special Instructions</p>
          </div>
          <p className="text-sm text-blue-800 leading-relaxed">{specialInstructions}</p>
        </div>
      )}
    </div>
  )
}
