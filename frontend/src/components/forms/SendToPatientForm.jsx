import { useState } from 'react'
import { MessageCircle, Globe, Send } from 'lucide-react'
import { sendVisitToPatient, generateSummaryInLanguage } from '@/api'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import Button from '../ui/Button'
import { LANGUAGES } from '../ui/LanguageSwitcher'
import toast from 'react-hot-toast'

export default function SendToPatientForm({ visit, onSent }) {
  const [lang, setLang] = useState(visit.patient?.preferredLanguage ?? 'hi')
  const [loading, setLoading] = useState(false)
  const [translating, setTranslating] = useState(false)

  const patientLang = LANGUAGES.find((l) => l.code === lang)
  const patientPhone = visit.patient?.phoneNumber

  const handleTranslate = async () => {
    setTranslating(true)
    try {
      await generateSummaryInLanguage(visit.id, lang)
      toast.success(`Summary translated to ${patientLang?.name}`)
    } catch {
      toast.error('Translation failed')
    } finally {
      setTranslating(false)
    }
  }

  const handleSend = async () => {
    setLoading(true)
    try {
      await sendVisitToPatient(visit.id, { language: lang })
      toast.success(`✅ Summary sent to ${patientPhone} via WhatsApp!`)
      onSent?.()
    } catch (err) {
      toast.error(err.message ?? 'Failed to send')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
        <MessageCircle size={20} className="text-green-500 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {visit.patient?.firstName} {visit.patient?.lastName}
          </p>
          <p className="text-xs text-gray-500">{patientPhone}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Globe size={15} className="text-emerald-500" /> Send Language
          </label>
          <LanguageSwitcher current={lang} available={['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa']} onChange={setLang} size="sm" />
        </div>
        {lang !== 'en' && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2.5">
            <p className="text-xs text-blue-700">
              Summary will be sent in <strong>{patientLang?.native}</strong>
            </p>
            <Button variant="outline" size="xs" onClick={handleTranslate} loading={translating}>
              Preview
            </Button>
          </div>
        )}
      </div>

      <div className="bg-[#f0f8f1] border border-green-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-green-600 text-base">📱</span>
          <p className="text-xs font-semibold text-green-700">WhatsApp Preview</p>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">Patient will receive a WhatsApp message with:</p>
        <ul className="mt-2 space-y-1">
          {['Full visit summary in their language', 'Medication schedule with timing', 'Red flag warning signs', 'Follow-up date', 'A link to their patient portal'].map((item, i) => (
            <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
              <span className="text-green-500 font-bold shrink-0">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <Button variant="whatsapp" fullWidth size="lg" loading={loading} leftIcon={<Send size={16} />} onClick={handleSend}>
        Send via WhatsApp
      </Button>

      <p className="text-center text-xs text-gray-400">Message delivered via Meta WhatsApp Business API</p>
    </div>
  )
}
