import { Info } from 'lucide-react'

export default function DiagnosisCard({ diagnosis, diagnosisDetails, icdCode, doctorInstructions }) {
  return (
    <div className="mx-4 bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center">
          <Info size={12} className="text-blue-600" />
        </div>
        <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">What the Doctor Found</p>
      </div>
      <p className="font-bold text-blue-900 text-base leading-snug">{diagnosis}</p>
      {diagnosisDetails && <p className="text-sm text-blue-700 leading-relaxed">{diagnosisDetails}</p>}
      {doctorInstructions && (
        <div className="bg-blue-100/60 rounded-xl p-3">
          <p className="text-xs font-semibold text-blue-700 mb-1">Doctor&apos;s Note:</p>
          <p className="text-sm text-blue-800 leading-relaxed">{doctorInstructions}</p>
        </div>
      )}
      {icdCode && <p className="text-[10px] text-blue-400 font-mono">ICD-10: {icdCode}</p>}
    </div>
  )
}
