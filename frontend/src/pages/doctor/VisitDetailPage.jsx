/**
 * VisitDetailPage.jsx — Visit Detail + AI Summary Review
 * Route: /doctor/visits/:id
 * Layout: DoctorLayout
 *
 * This is the most complex doctor page. Shows:
 *   ┌─────────────────────────────────────────────────────┐
 *   │  Visit header (patient, date, status)               │
 *   │  ── AI Processing status (if still processing) ──   │
 *   │  Tabs: Summary | SOAP Notes | Attachments | Chat    │
 *   │                                                      │
 *   │  Summary tab:                                        │
 *   │    - AISummaryReview (edit before sending)           │
 *   │    - QuickSummary card                               │
 *   │    - NextActionsChecklist                            │
 *   │    - MedicineSchedule                                │
 *   │    - RedFlagAlerts                                   │
 *   │    - LanguageBanner (current language)               │
 *   │    - SendToPatientForm (WhatsApp send control)       │
 *   │                                                      │
 *   │  SOAP Notes tab:                                     │
 *   │    - SOAPSection (Subjective/Objective/Assessment/Plan)
 *   │    - MedicalTermHighlight                            │
 *   │                                                      │
 *   │  Attachments tab:                                    │
 *   │    - AttachmentCard list + upload                    │
 *   │                                                      │
 *   │  Chat tab:                                           │
 *   │    - ChatPanel (doctor reads patient's questions)    │
 *   └─────────────────────────────────────────────────────┘
 *
 * Data:
 *   GET /api/v1/visits/:id          (useVisit hook — polls if AI pending)
 *   POST /api/v1/visits/:id/send    (send to patient via WhatsApp)
 *   POST /api/v1/visits/:id/process (re-trigger AI)
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { RefreshCw, Send, ChevronLeft, MoreVertical, Trash2, Edit3 } from 'lucide-react'

import DoctorLayout from '@/components/layout/DoctorLayout'
import PageHeader from '@/components/common/PageHeader'
import Tabs from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import Modal, { ConfirmModal } from '@/components/ui/Modal'

// Visit-specific components
import AIProcessingStatus from '@/components/visit/AIProcessingStatus'
import AISummaryReview from '@/components/doctor/AISummaryReview'
import QuickSummary from '@/components/visit/QuickSummary'
import SOAPSection from '@/components/visit/SOAPSection'
import NextActionsChecklist from '@/components/visit/NextActionsChecklist'
import ChatPanel from '@/components/visit/ChatPanel'
import AttachmentCard from '@/components/visit/AttachmentCard'
import ScribeRecorder from '@/components/visit/ScribeRecorder'
import LanguageBanner from '@/components/visit/LanguageBanner'

// Patient-facing components used in doctor preview
import MedicineSchedule from '@/components/patient/MedicineSchedule'
import RedFlagAlerts from '@/components/patient/RedFlagAlerts'
import DiagnosisCard from '@/components/patient/DiagnosisCard'

import SendToPatientForm from '@/components/forms/SendToPatientForm'
import { AIStatusBadge } from '@/components/doctor/AIStatusBadge'
import { WhatsAppStatusBadge } from '@/components/doctor/WhatsAppStatusBadge'
import Avatar from '@/components/ui/Avatar'

import { useVisit } from '@/hooks/useVisit'

// ─── Tab config ──────────────────────────────────────────────────────────────
const VISIT_TABS = [
  { id: 'summary', label: 'AI Summary' },
  { id: 'soap', label: 'SOAP Notes' },
  { id: 'attachments', label: 'Attachments' },
  { id: 'chat', label: 'Patient Chat' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function VisitDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const justCreated = location.state?.justCreated

  const [activeTab, setActiveTab] = useState('summary')
  const [showSend, setShowSend] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const {
    visit,
    isLoading,
    isError,
    refetch,
    updateVisit,
    retriggerAI,
    deleteVisit,
    sendToPatient,
    isSending,
  } = useVisit(id)

  // Auto-open send modal when AI finishes (if this was just created)
  useEffect(() => {
    if (justCreated && visit?.aiStatus === 'COMPLETED' && !visit?.whatsappSentAt) {
      // Small delay so user sees the completed state first
      const t = setTimeout(() => setShowSend(true), 1500)
      return () => clearTimeout(t)
    }
  }, [visit?.aiStatus, justCreated])

  if (isLoading) {
    return (
      <DoctorLayout>
        <div className="p-6 space-y-4">
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-48" />
        </div>
      </DoctorLayout>
    )
  }

  if (isError || !visit) {
    return (
      <DoctorLayout>
        <EmptyState
          icon="⚠️"
          title="Visit not found"
          description="This visit may have been deleted or you don't have permission to view it."
          action={<Button onClick={() => navigate('/doctor/dashboard')}>Go to Dashboard</Button>}
          className="m-6"
        />
      </DoctorLayout>
    )
  }

  const isProcessing = visit.aiStatus === 'PENDING' || visit.aiStatus === 'PROCESSING'
  const hasAI = visit.aiStatus === 'COMPLETED' && visit.aiSummary

  return (
    <DoctorLayout>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <PageHeader
        backHref="/doctor/dashboard"
        title={
          <div className="flex items-center gap-3">
            <Avatar name={`${visit.patient?.firstName} ${visit.patient?.lastName}`} size="sm" />
            <div>
              <div className="text-lg font-extrabold text-gray-900 leading-tight">
                {visit.patient?.firstName} {visit.patient?.lastName}
              </div>
              <div className="text-xs text-gray-400 font-normal">
                {new Date(visit.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </div>
            </div>
          </div>
        }
        action={
          <div className="flex items-center gap-2">
            <AIStatusBadge status={visit.aiStatus} />
            <WhatsAppStatusBadge sentAt={visit.whatsappSentAt} />
            <Button size="sm" variant="secondary" onClick={refetch} aria-label="Refresh">
              <RefreshCw size={14} />
            </Button>
            {hasAI && !visit.whatsappSentAt && (
              <Button size="sm" onClick={() => setShowSend(true)}>
                <Send size={14} className="mr-1.5" />
                Send to Patient
              </Button>
            )}
          </div>
        }
      />

      {/* ── AI Processing banner ─────────────────────────────────────────── */}
      {isProcessing && (
        <div className="mx-4 sm:mx-6 mt-4">
          <AIProcessingStatus
            status={visit.aiStatus}
            onRetrigger={retriggerAI}
          />
        </div>
      )}

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 mt-4">
        <Tabs
          tabs={VISIT_TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
          badgeCount={{ chat: visit.unreadChatMessages ?? 0 }}
        />
      </div>

      <div className="p-4 sm:p-6 max-w-3xl">

        {/* ══ Summary tab ════════════════════════════════════════════════ */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            {!hasAI && !isProcessing && (
              <EmptyState
                icon="🤖"
                title="AI summary not yet generated"
                description="Click below to trigger AI processing of this visit."
                action={<Button onClick={retriggerAI}>Generate AI Summary</Button>}
              />
            )}

            {hasAI && (
              <>
                <LanguageBanner language={visit.patient?.preferredLanguage} />
                <DiagnosisCard diagnosis={visit.aiSummary?.diagnosis} />
                <QuickSummary summary={visit.aiSummary?.patientFriendlyText} />
                <MedicineSchedule medicines={visit.aiSummary?.medicines ?? []} />
                <NextActionsChecklist actions={visit.aiSummary?.nextActions ?? []} />
                <RedFlagAlerts alerts={visit.aiSummary?.redFlags ?? []} />
                <AISummaryReview
                  visit={visit}
                  onSave={(edits) => updateVisit(id, edits)}
                />
                {/* Send status */}
                {visit.whatsappSentAt ? (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-800">
                    <span className="text-xl">✅</span>
                    <div>
                      <div className="font-bold">Sent to patient via WhatsApp</div>
                      <div className="text-green-600 text-xs">
                        {new Date(visit.whatsappSentAt).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="ml-auto"
                      onClick={() => setShowSend(true)}
                    >
                      Resend
                    </Button>
                  </div>
                ) : (
                  <Button
                    fullWidth
                    onClick={() => setShowSend(true)}
                    className="py-3"
                    disabled={isSending}
                  >
                    <Send size={16} className="mr-2" />
                    Send Summary to Patient via WhatsApp
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {/* ══ SOAP Notes tab ═════════════════════════════════════════════ */}
        {activeTab === 'soap' && (
          <div className="space-y-4">
            <SOAPSection visit={visit} onUpdate={(data) => updateVisit(id, data)} />
            <ScribeRecorder visitId={id} onTranscriptReady={(t) => updateVisit(id, { rawNotes: t })} />
          </div>
        )}

        {/* ══ Attachments tab ════════════════════════════════════════════ */}
        {activeTab === 'attachments' && (
          <div className="space-y-3">
            {(visit.attachments ?? []).length === 0 ? (
              <EmptyState
                icon="📎"
                title="No attachments"
                description="Upload a prescription image or PDF to store with this visit."
              />
            ) : (
              visit.attachments.map((att) => (
                <AttachmentCard key={att.id} attachment={att} />
              ))
            )}
            {/* Upload zone */}
            <AttachmentCard visitId={id} uploadMode />
          </div>
        )}

        {/* ══ Chat tab ═══════════════════════════════════════════════════ */}
        {activeTab === 'chat' && (
          <ChatPanel visitId={id} readOnly />
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <Modal
        open={showSend}
        onClose={() => setShowSend(false)}
        title="Send to Patient via WhatsApp"
        size="md"
      >
        <SendToPatientForm
          visit={visit}
          onSend={(opts) => sendToPatient(id, opts).then(() => setShowSend(false))}
          onCancel={() => setShowSend(false)}
          isSending={isSending}
        />
      </Modal>

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteVisit(id).then(() => navigate('/doctor/dashboard'))}
        title="Delete Visit"
        description="This will permanently delete this visit and all AI summaries. This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </DoctorLayout>
  )
}
