import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  User, Calendar, Upload, Mic, MessageCircle, ArrowRight, Plus,
  Heart, FileText, Activity, ChevronRight, CheckCircle2, Link,
  FlaskConical, X, Circle, ChevronLeft, Loader2, Paperclip, Trash2,
  AlertCircle
} from 'lucide-react'
import { useAuthStore } from '@/store'
import { getPatientProfile } from '@/api/patients'
import { createPatientVisit, uploadVisitDocumentByPatient, getMyVisits } from '@/api/patientVisits'
import { validateFile } from '@/api/documents'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'profile', label: 'Health Profile', icon: User },
  { id: 'vitals', label: 'Vitals', icon: Heart },
  { id: 'labresults', label: 'Lab Results', icon: FlaskConical },
  { id: 'connected', label: 'Connected Services', icon: Link },
  { id: 'documents', label: 'Documents', icon: FileText },
]

const DOC_TYPES = [
  { value: 'PRESCRIPTION', label: 'Prescription' },
  { value: 'LAB_REPORT', label: 'Lab Report' },
  { value: 'SCAN', label: 'Scan / Imaging' },
  { value: 'DISCHARGE_SUMMARY', label: 'Discharge Summary' },
  { value: 'OTHER', label: 'Other' },
]

const VISIT_TYPES = ['General', 'Follow-up', 'Emergency', 'Specialist', 'Lab Review']

const AUDIO_TYPES = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/webm']
const DOC_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

// ─── Months helper ──────────────────────────────────────────────────────────
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

function formatVisitForCard(v) {
  const date = v.visitDate ? new Date(v.visitDate) : new Date()
  return {
    id: v.visitId,
    visitDate: v.visitDate,
    month: MONTHS[date.getMonth()],
    day: date.getDate().toString(),
    doctorName: v.doctorName || 'Unknown Doctor',
    specialization: v.visitType || 'General',
    visitType: v.visitType || 'General',
    diagnosis: v.chiefComplaint || '—',
    summary: v.chiefComplaint || '',
    hospitalName: v.hospitalName || '',
    documentCount: v.documentCount || 0,
    status: v.status,
  }
}

// ════════════════════════════════════════════════════════════════════════════
export default function MyHealth() {
  const { user, logout } = useAuthStore()

  const [profile, setProfile] = useState(null)
  const [visits, setVisits] = useState([])
  const [visitsLoading, setVisitsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [activePage, setActivePage] = useState('home')
  const [vitalsRange, setVitalsRange] = useState('30d')
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [showChat, setShowChat] = useState(true)

  // ── Load profile ─────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true
    getPatientProfile()
      .then(data => { if (mounted && data) setProfile(data) })
      .catch(err => console.warn('Could not load patient profile:', err))
    return () => { mounted = false }
  }, [])

  // ── Load real visits ──────────────────────────────────────────────────────
  const loadVisits = useCallback(async () => {
    setVisitsLoading(true)
    try {
      const data = await getMyVisits()
      setVisits(data.map(formatVisitForCard))
    } catch (err) {
      console.warn('Could not load visits:', err)
    } finally {
      setVisitsLoading(false)
    }
  }, [])

  useEffect(() => { loadVisits() }, [loadVisits])

  const displayName = profile?.fullName || profile?.firstName
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
    : user?.displayName || 'Patient'
  const displayGenderAge = [
    profile?.gender || null,
    profile?.age ? `${profile.age} y.o.` : null
  ].filter(Boolean).join(', ') || ''

  const sendChatMessage = (text) => {
    const question = text || chatInput.trim()
    if (!question) return
    setChatMessages(prev => [...prev, { role: 'user', content: question }])
    setChatInput('')
    setIsChatLoading(true)
    setTimeout(() => {
      let answer = ''
      const q = question.toLowerCase()
      if (visits.length === 0) {
        answer = "You don't have any visits yet. Upload documents or record a visit to get started."
      } else if (q.includes('diagnosis')) {
        answer = `Your last reason for visit was: ${visits[0].diagnosis}`
      } else if (q.includes('medicine') || q.includes('medication')) {
        answer = `Please check your latest visit documents for medication details.`
      } else if (q.includes('overview') || q.includes('health record')) {
        answer = `You have ${visits.length} visit(s) recorded. Your most recent visit was on ${visits[0].visitDate}.`
      } else {
        answer = "Everything looks stable based on your latest visit. Follow your doctor's advice and reach out if symptoms worsen."
      }
      setChatMessages(prev => [...prev, { role: 'assistant', content: answer }])
      setIsChatLoading(false)
    }, 900)
  }

  const getSuggestedQuestions = () => activePage === 'myhealth'
    ? ["Give me an overview of my health record", "What are the key things in my medical history?", "Are there any concerning trends in my health data?"]
    : ["What does my diagnosis mean in simple terms?", "Explain my medication and side effects", "What should I watch out for at home?"]

  // ─── Visit Card ──────────────────────────────────────────────────────────
  const VisitCard = ({ visit }) => (
    <div className="border border-gray-200 rounded-xl bg-white hover:shadow-sm transition-all cursor-pointer">
      <div className="flex items-stretch">
        <div className="flex-shrink-0 p-4 flex items-start">
          <div className="bg-indigo-600 text-white w-10 h-10 rounded-lg flex flex-col items-center justify-center">
            <div className="text-[8px] font-bold tracking-wider uppercase leading-none">{visit.month}</div>
            <div className="text-sm font-bold leading-tight">{visit.day}</div>
          </div>
        </div>
        <div className="flex-1 py-3 pr-3 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">{visit.visitType}</span>
            {visit.documentCount > 0 && (
              <span className="text-[10px] text-blue-500 flex items-center gap-0.5">
                <Paperclip size={9} /> {visit.documentCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0">
              {visit.doctorName.split(' ').pop()?.[0] || 'D'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-gray-900 truncate">{visit.doctorName}</div>
              {visit.hospitalName && (
                <div className="text-[10px] text-blue-500 truncate">{visit.hospitalName}</div>
              )}
            </div>
          </div>
          {visit.diagnosis && visit.diagnosis !== '—' && (
            <div className="text-[10px] text-gray-500 mt-1.5 leading-relaxed truncate">{visit.diagnosis}</div>
          )}
        </div>
        <div className="flex items-center pr-3">
          <ChevronRight size={14} className="text-gray-300" />
        </div>
      </div>
    </div>
  )

  // ─── Chat Panel ──────────────────────────────────────────────────────────
  const ChatPanel = () => (
    <div
      className="bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden"
      style={{ height: 'calc(100vh - 72px)' }}
    >
      <div className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-500" />
          <div>
            <div className="text-xs font-semibold text-gray-900">Shifa AI</div>
            <div className="text-[10px] text-gray-400">Ask anything about your visit</div>
          </div>
        </div>
        <button onClick={() => setShowChat(false)} className="text-gray-300 hover:text-gray-500">
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 size={24} className="text-emerald-500" />
            </div>
            <div className="text-sm font-semibold text-gray-800">Your visit assistant</div>
            {activePage === 'myhealth' && (
              <span className="mt-1 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Patient Record</span>
            )}
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
              {activePage === 'home'
                ? "I have the full context of your visit. Ask me anything about your diagnosis, medications, or next steps."
                : "Ask me anything about your health."}
            </p>
          </div>
        ) : (
          chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-50 border border-gray-200 text-gray-700'
              }`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isChatLoading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 bg-gray-50 border rounded-2xl text-[11px] text-gray-400">Thinking...</div>
          </div>
        )}
      </div>
      {chatMessages.length === 0 && (
        <div className="px-4 pb-3 space-y-1.5 flex-shrink-0">
          {getSuggestedQuestions().map((q, i) => (
            <button
              key={i}
              onClick={() => sendChatMessage(q)}
              className="w-full text-left text-[11px] border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 text-gray-600 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}
      <div className="p-3 border-t bg-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
            placeholder="Ask about your visit..."
            className="flex-1 text-[11px] border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:border-emerald-400 min-w-0"
          />
          <button
            onClick={() => sendChatMessage()}
            className="px-3 py-1.5 bg-emerald-500 text-white text-[11px] rounded-full font-medium hover:bg-emerald-600 transition-colors flex-shrink-0"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )

  // ─── HOME PAGE ──────────────────────────────────────────────────────────
  const HomePage = () => (
    <div className="space-y-3">
      {/* Profile Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100 flex-shrink-0">
          <img src="https://i.pravatar.cc/48?img=12" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900">{displayName}</div>
          {displayGenderAge && <div className="text-[11px] text-gray-500 mt-0.5">{displayGenderAge}</div>}
          <div className="text-[11px] text-gray-500 truncate">
            {profile?.email || profile?.phoneNumber || user?.email || user?.phoneNumber || ''}
          </div>
        </div>
        <ChevronRight size={15} className="text-gray-300 flex-shrink-0" />
      </div>

      {/* Visit History */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-900">Visit History</h2>
          <button
            onClick={() => sendChatMessage("What does my diagnosis mean?")}
            className="flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700"
          >
            <CheckCircle2 size={11} /> Ask
          </button>
        </div>

        {visitsLoading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 flex items-center justify-center">
            <Loader2 size={18} className="animate-spin text-gray-300 mr-2" />
            <span className="text-[11px] text-gray-400">Loading visits…</span>
          </div>
        ) : visits.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Calendar size={18} className="text-gray-400" />
            </div>
            <div className="text-xs font-medium text-gray-700">No visits yet</div>
            <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Upload your documents or record a voice consultation from a doctor visit to see them here.
            </p>
            <button
              onClick={() => setActivePage('recordvisit')}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <Upload size={12} /> Upload Your First Visit
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {visits.map((v, i) => <VisitCard key={v.id || i} visit={v} />)}
          </div>
        )}
      </div>

      {/* Record New Visit */}
      <button
        onClick={() => setActivePage('recordvisit')}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors"
      >
        <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></span>
        Upload New Visit
      </button>

      {/* Health Record & Reference */}
      <div className="grid grid-cols-2 gap-3">
        <div
          onClick={() => setActivePage('myhealth')}
          className="bg-white border border-gray-200 rounded-xl p-3.5 cursor-pointer hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
              <FileText size={14} className="text-emerald-600" />
            </div>
            <button
              onClick={e => { e.stopPropagation(); sendChatMessage("Give me an overview of my health record") }}
              className="flex items-center gap-0.5 text-[10px] text-emerald-600"
            >
              <CheckCircle2 size={10} /> Ask
            </button>
          </div>
          <div className="text-xs font-semibold text-emerald-700">Health Record</div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            {visits.length > 0 ? `${visits.length} entries` : '0 entries'}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 cursor-pointer hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
              <Activity size={14} className="text-purple-600" />
            </div>
            <button className="flex items-center gap-0.5 text-[10px] text-emerald-600">
              <CheckCircle2 size={10} /> Ask
            </button>
          </div>
          <div className="text-xs font-semibold text-purple-700">Reference</div>
          <div className="text-[10px] text-gray-400 mt-0.5">0 references</div>
        </div>
      </div>

      <div className="pt-4 pb-2 text-center text-[10px] text-gray-300 space-y-0.5">
        <p>All clinical scenarios and patient data displayed are entirely fictional, created for demonstration purposes only.</p>
        <p>Built for Shifa Health Platform</p>
      </div>
    </div>
  )

  // ─── MY HEALTH PAGE ──────────────────────────────────────────────────────
  const MyHealthPage = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold text-gray-900">My Health</h1>
        <button
          onClick={() => setActivePage('home')}
          className="text-[11px] text-blue-600 flex items-center gap-1 hover:underline"
        >
          ← Back to Profile
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-1.5 text-[11px] rounded-full border whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Icon size={11} /> {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button className="text-[11px] text-blue-600 hover:underline">Edit Profile</button>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-gray-900 mb-3">Personal Information</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Full Name', value: displayName },
                { label: 'Date of Birth', value: profile?.dateOfBirth || 'Not set' },
                { label: 'Gender', value: profile?.gender || 'Not set' },
                { label: 'Phone', value: profile?.phoneNumber || user?.phoneNumber || 'Not set' },
                { label: 'Email', value: profile?.email || user?.email || 'Not set' },
                { label: 'MRN', value: profile?.id ? `MRN-${profile.id.substring(0, 6).toUpperCase()}` : 'MRN-001' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="text-[9px] text-gray-400 uppercase tracking-wide">{item.label}</div>
                  <div className="text-[11px] text-gray-800 mt-0.5 font-medium truncate">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-900">Biometrics</h3>
              <button onClick={() => sendChatMessage("Tell me about my biometrics")} className="flex items-center gap-0.5 text-[10px] text-emerald-600">
                <CheckCircle2 size={10} /> Ask
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Height (cm)', value: '—' },
                { label: 'Weight (kg)', value: '—' },
                { label: 'BMI', value: '—', green: true },
              ].map((v, i) => (
                <div key={i}>
                  <div className={`text-lg font-bold ${v.green ? 'text-emerald-600' : 'text-gray-800'}`}>{v.value}</div>
                  <div className="text-[9px] text-gray-400 mt-0.5">{v.label}</div>
                </div>
              ))}
            </div>
            <div className="text-[11px] text-gray-500 mt-3">
              Blood Type: <span className="font-medium text-gray-700">{profile?.bloodGroup || 'Not set'}</span>
            </div>
          </div>
          {[
            { title: 'Diagnoses', msg: 'What are my diagnoses?', content: profile?.chronicConditions?.length > 0 ? profile.chronicConditions.join(', ') : null },
            { title: 'Allergies', msg: 'What are my allergies?', content: profile?.allergies?.length > 0 ? profile.allergies.join(', ') : null },
            { title: 'Current Medications', msg: 'What medications am I on?', content: profile?.currentMedicinesText || null },
          ].map((section, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-900">{section.title}</h3>
                <button onClick={() => sendChatMessage(section.msg)} className="flex items-center gap-0.5 text-[10px] text-emerald-600">
                  <CheckCircle2 size={10} /> Ask
                </button>
              </div>
              <div className={`text-[11px] ${section.content ? 'text-gray-800 font-medium' : 'text-gray-400 text-center'} py-2`}>
                {section.content || `No ${section.title.toLowerCase()} recorded yet.`}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'vitals' && (
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white text-[10px]">⌚</span>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-900">Connect a Device</div>
                  <div className="text-[10px] text-gray-400">Sync your wearable to see vitals</div>
                </div>
              </div>
              <button className="flex items-center gap-0.5 text-[10px] text-emerald-600">
                <CheckCircle2 size={10} /> Ask
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {['Resting HR','PVC Events (7d)','Steps Today','Avg HRV (ms)','Avg Sleep (h)','Avg SpO₂'].map((label, i) => (
                <div key={i} className="py-2 border border-gray-100 rounded-lg">
                  <div className="text-base font-bold text-gray-700">—</div>
                  <div className="text-[9px] text-gray-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 py-2 border border-emerald-200 text-emerald-600 rounded-lg text-[11px] font-medium hover:bg-emerald-50 transition-colors">
              Connect Wearable Device
            </button>
          </div>
          <div className="flex gap-2">
            {['7d', '30d', '90d', '1y'].map(r => (
              <button key={r} onClick={() => setVitalsRange(r)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                  vitalsRange === r ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}>
                {r}
              </button>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <div className="text-[11px] text-gray-400">No vitals data available yet.</div>
          </div>
        </div>
      )}

      {activeTab === 'labresults' && (
        <div className="space-y-3">
          <div
            className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-300 transition-colors"
            onClick={() => { setActivePage('recordvisit') }}
          >
            <Upload size={20} className="mx-auto text-gray-300 mb-2" />
            <div className="text-[11px] text-gray-500">
              Drag &amp; drop lab results here, or{' '}
              <span className="text-blue-500 hover:underline">browse files</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-1">PDF, JPG, PNG, HEIC — max 10 MB per file</div>
          </div>
          <div className="text-[11px] text-gray-400 text-center py-8">No lab results available yet.</div>
        </div>
      )}

      {activeTab === 'connected' && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-gray-900 mb-3">Connected Devices &amp; Apps</h3>
          <div className="space-y-0">
            {[
              { name: 'Apple Health', desc: 'Sync health data from iPhone', icon: '🍎' },
              { name: 'Google Fit', desc: 'Sync from Android devices', icon: '🏃' },
              { name: 'Fitbit', desc: 'Connect your Fitbit device', icon: '⌚' },
              { name: 'Garmin', desc: 'Sync Garmin wearables', icon: '🔵' },
            ].map((svc, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{svc.icon}</span>
                  <div>
                    <div className="text-[11px] font-medium text-gray-900">{svc.name}</div>
                    <div className="text-[10px] text-gray-400">{svc.desc}</div>
                  </div>
                </div>
                <button className="text-[10px] border border-emerald-200 text-emerald-600 px-2.5 py-1 rounded-full hover:bg-emerald-50 transition-colors">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-3">
          <div
            className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-300 transition-colors"
            onClick={() => setActivePage('recordvisit')}
          >
            <Upload size={20} className="mx-auto text-gray-300 mb-2" />
            <div className="text-[11px] text-gray-500">
              Drag files here or <span className="text-blue-500 hover:underline">browse</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-1">PDF, JPG, PNG, WebP, HEIC up to 10 MB</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-900">Medical Documents</h3>
              <span className="text-[10px] text-gray-400">
                {visits.reduce((sum, v) => sum + (v.documentCount || 0), 0)} files
              </span>
            </div>
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                <FileText size={14} className="text-gray-300" />
              </div>
              <div className="text-[11px] font-medium text-gray-500">No documents yet</div>
              <div className="text-[10px] text-gray-400 mt-0.5">
                Upload your medical records, lab results, or imaging reports
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-2 pb-2 text-center text-[10px] text-gray-300 space-y-0.5">
        <p>All clinical scenarios and patient data displayed are entirely fictional.</p>
        <p>Built for Shifa Health Platform</p>
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════════
  // ─── UPLOAD VISIT PAGE (4-step wizard) ──────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════
  const UploadVisitPage = () => {
    const [step, setStep] = useState(1) // 1=Info, 2=Documents, 3=Audio, 4=Review

    // Step 1 — visit info
    const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0])
    const [hospitalName, setHospitalName] = useState('')
    const [doctorName, setDoctorName] = useState('')
    const [chiefComplaint, setChiefComplaint] = useState('')
    const [visitType, setVisitType] = useState('General')
    const [notes, setNotes] = useState('')

    // Step 2 — documents
    const [docFiles, setDocFiles] = useState([]) // [{file, docType, id}]
    const docInputRef = useRef(null)

    // Step 3 — audio
    const [audioFile, setAudioFile] = useState(null)
    const audioInputRef = useRef(null)

    // Submission state
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)

    const STEPS = ['Visit Info', 'Documents', 'Audio', 'Review & Submit']

    // ── Step 2 helpers ───────────────────────────────────────────────────
    const handleDocFilePick = (e) => {
      const picked = Array.from(e.target.files || [])
      picked.forEach(f => {
        const err = validateFile(f, DOC_FILE_TYPES, 10 * 1024 * 1024)
        if (err) { toast.error(`${f.name}: ${err}`); return }
        setDocFiles(prev => [...prev, { file: f, docType: 'OTHER', id: Math.random().toString(36).slice(2) }])
      })
      e.target.value = ''
    }

    const handleDocDrop = (e) => {
      e.preventDefault()
      const dropped = Array.from(e.dataTransfer.files || [])
      dropped.forEach(f => {
        const err = validateFile(f, DOC_FILE_TYPES, 10 * 1024 * 1024)
        if (err) { toast.error(`${f.name}: ${err}`); return }
        setDocFiles(prev => [...prev, { file: f, docType: 'OTHER', id: Math.random().toString(36).slice(2) }])
      })
    }

    const removeDoc = (id) => setDocFiles(prev => prev.filter(d => d.id !== id))

    const updateDocType = (id, docType) =>
      setDocFiles(prev => prev.map(d => d.id === id ? { ...d, docType } : d))

    // ── Step 3 helpers ───────────────────────────────────────────────────
    const handleAudioPick = (e) => {
      const f = e.target.files?.[0]
      if (!f) return
      if (!AUDIO_TYPES.includes(f.type)) {
        toast.error('Please upload an audio file (MP3, WAV, M4A, OGG, WebM)')
        return
      }
      if (f.size > 50 * 1024 * 1024) {
        toast.error('Audio file must be under 50 MB')
        return
      }
      setAudioFile(f)
      e.target.value = ''
    }

    const handleAudioDrop = (e) => {
      e.preventDefault()
      const f = e.dataTransfer.files?.[0]
      if (!f) return
      if (!AUDIO_TYPES.includes(f.type)) { toast.error('Please upload an audio file'); return }
      if (f.size > 50 * 1024 * 1024) { toast.error('Audio file must be under 50 MB'); return }
      setAudioFile(f)
    }

    // ── Submit ─────────────────────────────────────────────────────────
    const handleSubmit = async () => {
      setSubmitting(true)
      setSubmitError(null)
      try {
        // 1. Create visit
        const created = await createPatientVisit({
          visitDate,
          hospitalName: hospitalName.trim() || undefined,
          doctorName: doctorName.trim() || undefined,
          chiefComplaint: chiefComplaint.trim() || undefined,
          notes: notes.trim() || undefined,
          visitType,
        })
        const visitId = created.visitId

        // 2. Upload documents
        for (const { file, docType } of docFiles) {
          try {
            await uploadVisitDocumentByPatient(visitId, file, docType)
          } catch (e) {
            console.warn('Document upload failed:', file.name, e)
            toast.error(`Failed to upload ${file.name}`)
          }
        }

        // 3. Upload audio
        if (audioFile) {
          try {
            await uploadVisitDocumentByPatient(visitId, audioFile, 'OTHER')
          } catch (e) {
            console.warn('Audio upload failed:', audioFile.name, e)
            toast.error('Audio upload failed — visit was still saved')
          }
        }

        toast.success('Visit uploaded successfully!')
        await loadVisits()
        setActivePage('home')
      } catch (err) {
        console.error('Submit failed:', err)
        const msg = err?.response?.data?.message || err?.message || 'Upload failed. Please try again.'
        setSubmitError(msg)
        toast.error(msg)
      } finally {
        setSubmitting(false)
      }
    }

    const canProceedStep1 = !!visitDate
    const totalFiles = docFiles.length + (audioFile ? 1 : 0)

    // ── Step progress bar ────────────────────────────────────────────────
    const StepBar = () => (
      <div className="flex items-center gap-1 mb-6">
        {STEPS.map((label, i) => {
          const num = i + 1
          const done = step > num
          const active = step === num
          return (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  done ? 'bg-emerald-500 text-white' : active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {done ? '✓' : num}
                </div>
                <div className={`text-[9px] mt-0.5 whitespace-nowrap ${active ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>
                  {label}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mb-3.5 transition-all ${step > num ? 'bg-emerald-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    )

    return (
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : setActivePage('home')}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
          >
            <ChevronLeft size={13} className="text-gray-500" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Upload Medical Visit</h2>
            <p className="text-[10px] text-gray-400">Step {step} of {STEPS.length}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <StepBar />

          {/* ── STEP 1: Visit Info ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                  Visit Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="visit-date"
                  type="date"
                  value={visitDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={e => setVisitDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[11px] text-gray-700 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">Visit Type</label>
                <select
                  id="visit-type"
                  value={visitType}
                  onChange={e => setVisitType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[11px] text-gray-700 focus:outline-none focus:border-emerald-400 bg-white"
                >
                  {VISIT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">Hospital / Clinic Name</label>
                <input
                  id="hospital-name"
                  type="text"
                  value={hospitalName}
                  onChange={e => setHospitalName(e.target.value)}
                  placeholder="e.g. City General Hospital"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[11px] text-gray-700 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">Doctor Name</label>
                <input
                  id="doctor-name"
                  type="text"
                  value={doctorName}
                  onChange={e => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Priya Sharma"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[11px] text-gray-700 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">Chief Complaint / Reason for Visit</label>
                <textarea
                  id="chief-complaint"
                  value={chiefComplaint}
                  onChange={e => setChiefComplaint(e.target.value)}
                  placeholder="Describe the main reason for this visit…"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[11px] text-gray-700 focus:outline-none focus:border-emerald-400 resize-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">Additional Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  id="visit-notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any other notes about this visit…"
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[11px] text-gray-700 focus:outline-none focus:border-emerald-400 resize-none"
                />
              </div>
              <button
                id="btn-step1-next"
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                Next: Add Documents <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* ── STEP 2: Documents ── */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Upload prescriptions, lab reports, imaging scans, discharge summaries, or any other relevant medical document.
              </p>

              {/* Drop zone */}
              <div
                id="doc-drop-zone"
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all"
                onDragOver={e => e.preventDefault()}
                onDrop={handleDocDrop}
                onClick={() => docInputRef.current?.click()}
              >
                <Upload size={22} className="mx-auto text-gray-300 mb-2" />
                <div className="text-[11px] text-gray-500">
                  Drag & drop files here, or <span className="text-emerald-600 font-medium">browse</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-1">PDF, JPG, PNG, WebP — max 10 MB per file</div>
              </div>
              <input
                ref={docInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleDocFilePick}
              />

              {/* File list */}
              {docFiles.length > 0 && (
                <div className="space-y-2">
                  {docFiles.map(({ file, docType, id }) => (
                    <div key={id} className="flex items-center gap-2 p-2.5 border border-gray-100 rounded-lg bg-gray-50">
                      <FileText size={14} className="text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-medium text-gray-800 truncate">{file.name}</div>
                        <div className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(1)} KB</div>
                      </div>
                      <select
                        value={docType}
                        onChange={e => updateDocType(id, e.target.value)}
                        className="text-[10px] border border-gray-200 rounded px-1.5 py-0.5 bg-white text-gray-600 focus:outline-none flex-shrink-0"
                      >
                        {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <button onClick={() => removeDoc(id)} className="text-gray-300 hover:text-red-400 flex-shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  id="btn-step2-skip"
                  onClick={() => setStep(3)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors"
                >
                  Skip for now
                </button>
                <button
                  id="btn-step2-next"
                  onClick={() => setStep(3)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  {docFiles.length > 0 ? `Continue with ${docFiles.length} file${docFiles.length > 1 ? 's' : ''}` : 'Next'} <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Audio Recording ── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Upload an audio recording of your doctor consultation. This is optional — AI transcription will be available in a future update.
              </p>

              {/* Consent notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                <div className="text-[11px] font-semibold text-amber-700 mb-1 flex items-center gap-1.5">
                  <AlertCircle size={12} /> Both parties must consent
                </div>
                <div className="text-[11px] text-amber-600 leading-relaxed">
                  By uploading this recording, you confirm that both the healthcare provider and you have agreed to record this consultation.
                </div>
              </div>

              {audioFile ? (
                <div className="flex items-center gap-2 p-3 border border-gray-100 rounded-lg bg-gray-50">
                  <Mic size={16} className="text-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-gray-800 truncate">{audioFile.name}</div>
                    <div className="text-[10px] text-gray-400">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                  </div>
                  <button onClick={() => setAudioFile(null)} className="text-gray-300 hover:text-red-400">
                    <Trash2 size={13} />
                  </button>
                </div>
              ) : (
                <div
                  id="audio-drop-zone"
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all"
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleAudioDrop}
                  onClick={() => audioInputRef.current?.click()}
                >
                  <Mic size={22} className="mx-auto text-gray-300 mb-2" />
                  <div className="text-[11px] text-gray-500">
                    Drag & drop audio here, or <span className="text-emerald-600 font-medium">browse</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">MP3, WAV, M4A, OGG, WebM — max 50 MB</div>
                </div>
              )}
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleAudioPick}
              />

              <div className="flex gap-2">
                <button
                  id="btn-step3-skip"
                  onClick={() => setStep(4)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors"
                >
                  Skip Audio
                </button>
                <button
                  id="btn-step3-next"
                  onClick={() => setStep(4)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  Review &amp; Submit <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Review & Submit ── */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-900">Review your submission</h3>

              {/* Visit summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                {[
                  { label: 'Visit Date', value: visitDate },
                  { label: 'Visit Type', value: visitType },
                  { label: 'Hospital', value: hospitalName || '—' },
                  { label: 'Doctor', value: doctorName || '—' },
                  { label: 'Chief Complaint', value: chiefComplaint || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide flex-shrink-0">{label}</span>
                    <span className="text-[11px] text-gray-800 font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>

              {/* Files summary */}
              <div className="flex gap-3">
                <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-emerald-700">{docFiles.length}</div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">Document{docFiles.length !== 1 ? 's' : ''}</div>
                </div>
                <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-blue-700">{audioFile ? 1 : 0}</div>
                  <div className="text-[10px] text-blue-600 mt-0.5">Audio Recording</div>
                </div>
              </div>

              {/* Error */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-[11px] text-red-600">{submitError}</div>
                </div>
              )}

              {/* Submit button */}
              <button
                id="btn-submit-visit"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Loader2 size={14} className="animate-spin" /> Uploading…</>
                ) : (
                  <><CheckCircle2 size={14} /> Upload Visit</>
                )}
              </button>

              <button
                onClick={() => setStep(3)}
                disabled={submitting}
                className="w-full text-[11px] text-gray-400 hover:text-gray-600 text-center py-1"
              >
                ← Go back and edit
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b sticky top-0 z-50 h-12">
        <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <span className="font-bold text-sm tracking-tight">Shifa</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                Patient Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[11px] font-medium">
            <button
              onClick={() => setActivePage('home')}
              className={activePage === 'home' ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-900'}
            >
              Profile
            </button>
            <button
              onClick={() => setActivePage('myhealth')}
              className={activePage === 'myhealth' ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-900'}
            >
              My Health
            </button>
            <button className="text-gray-500 hover:text-gray-900">Reference</button>
            <button
              onClick={() => setActivePage('recordvisit')}
              className={`flex items-center gap-1.5 ${activePage === 'recordvisit' ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              Upload Visit
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200">
                <img src="https://i.pravatar.cc/24" alt="" />
              </div>
              <span className="text-[11px] font-medium text-gray-700">{displayName}</span>
              <ChevronRight size={11} className="text-gray-400 rotate-90" />
            </div>
            <button onClick={logout} className="text-[11px] text-red-500 hover:text-red-600">Logout</button>
          </div>
        </div>
      </nav>

      {/* Main layout */}
      <div className="max-w-[1400px] mx-auto flex gap-0 h-[calc(100vh-48px)]">
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activePage === 'home' && <HomePage />}
          {activePage === 'myhealth' && <MyHealthPage />}
          {activePage === 'recordvisit' && <UploadVisitPage />}
        </div>

        <div className="w-[340px] flex-shrink-0 border-l border-gray-200 p-4 bg-gray-50 overflow-hidden">
          {showChat ? (
            <ChatPanel />
          ) : (
            <button
              onClick={() => setShowChat(true)}
              className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:shadow-sm transition-all"
            >
              <CheckCircle2 size={16} className="text-emerald-500" />
              <div className="text-left">
                <div className="text-[11px] font-semibold">Shifa AI</div>
                <div className="text-[10px] text-gray-400">Click to open assistant</div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}