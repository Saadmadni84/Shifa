/**
 * PatientChatPage.jsx — Patient AI Follow-up Chat
 * Route: /portal/:token/chat
 * Auth: NONE — token-based public access
 *
 * This is where the PATIENT asks follow-up questions about their visit.
 * The AI responds using the visit's context, in the patient's language.
 *
 * Design principles:
 *   - WhatsApp-like chat bubbles (familiar to Indian users)
 *   - Input at the bottom
 *   - AI typing indicator
 *   - Suggested questions (chips) at the start
 *   - Works on 4G mobile
 *   - Supports all 12 Indian languages
 *
 * Data:
 *   GET  /api/v1/public/visits/:token        → load visit context + patient name
 *   POST /api/v1/public/visits/:token/ask    → send message, get AI reply
 *
 * Message types:
 *   user      — patient's question (right-aligned, green)
 *   assistant — AI answer (left-aligned, white)
 *   system    — context messages (centered, gray)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Heart, Mic, MicOff, RotateCcw } from 'lucide-react'
import Spinner from '@/components/ui/Spinner'
import { getPortalVisit, askFollowUpQuestion } from '@/api/public'

// ─── Suggested questions per language ────────────────────────────────────────
const SUGGESTED_QUESTIONS = {
  en: [
    'How should I take my medicines?',
    'What can I eat and drink?',
    'When should I go to hospital urgently?',
    'What are the side effects of my medicines?',
    'Can I exercise or go to work?',
  ],
  hi: [
    'मुझे दवाइयाँ कैसे लेनी चाहिए?',
    'मैं क्या खा और पी सकता हूँ?',
    'मुझे तुरंत अस्पताल कब जाना चाहिए?',
    'दवाइयों के क्या दुष्प्रभाव हैं?',
    'क्या मैं व्यायाम कर सकता हूँ?',
  ],
  ta: [
    'எனது மருந்துகளை எவ்வாறு எடுக்க வேண்டும்?',
    'என்ன சாப்பிடலாம் மற்றும் குடிக்கலாம்?',
    'எப்போது உடனடியாக மருத்துவமனை செல்ல வேண்டும்?',
  ],
  te: [
    'నా మందులు ఎలా తీసుకోవాలి?',
    'నేను ఏమి తినవచ్చు మరియు తాగవచ్చు?',
    'ఎప్పుడు అత్యవసరంగా ఆసుపత్రికి వెళ్ళాలి?',
  ],
  bn: [
    'আমার ওষুধ কিভাবে নিতে হবে?',
    'আমি কি খেতে এবং পান করতে পারি?',
    'কখন জরুরীভাবে হাসপাতালে যাবো?',
  ],
}

function getSuggestions(lang) {
  return SUGGESTED_QUESTIONS[lang] ?? SUGGESTED_QUESTIONS.en
}

// ─── Chat bubble ──────────────────────────────────────────────────────────────
function ChatBubble({ message }) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      {!isUser && (
        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1">
          <Heart size={14} className="text-white" fill="white" />
        </div>
      )}
      <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser
          ? 'bg-emerald-500 text-white rounded-br-sm'
          : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-sm'
          }`}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className="text-xs text-gray-400 mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit'
          })}
        </span>
      </div>
    </div>
  )
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex justify-start mb-2">
      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
        <Heart size={14} className="text-white" fill="white" />
      </div>
      <div className="bg-white rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PatientChatPage() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [visitData, setVisitData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(true)

  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const lang = visitData?.patient?.preferredLanguage ?? 'en'

  // ── Load visit metadata ──────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return
    getPortalVisit(token)
      .then((data) => {
        setVisitData(data)
        // Welcome system message
        const patientName = data?.patient?.firstName ?? ''
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: getWelcomeMessage(data?.patient?.preferredLanguage, patientName),
          timestamp: new Date().toISOString(),
        }])
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [token])

  // ── Auto-scroll to bottom ────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = useCallback(async (text) => {
    const question = (text ?? inputText).trim()
    if (!question || sending) return

    setInputText('')
    setShowSuggestions(false)
    setSending(true)

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    try {
      const response = await askFollowUpQuestion(token, question)
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toISOString(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: lang === 'hi'
          ? 'माफ़ करें, कुछ गलत हुआ। कृपया दोबारा कोशिश करें।'
          : 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toISOString(),
      }])
    } finally {
      setIsTyping(false)
      setSending(false)
      inputRef.current?.focus()
    }
  }, [inputText, sending, token, lang])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="text-3xl mb-3">❌</div>
        <h2 className="font-bold text-gray-900 mb-2">Couldn't load chat</h2>
        <p className="text-gray-500 text-sm mb-4">This link may be invalid or expired.</p>
        <button onClick={() => navigate(`/portal/${token}`)} className="text-emerald-600 font-semibold text-sm hover:underline">
          ← Back to summary
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-emerald-600 text-white px-4 py-3 flex items-center gap-3 safe-top">
        <button
          onClick={() => navigate(`/portal/${token}`)}
          className="p-1.5 hover:bg-emerald-500 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
          <Heart size={16} className="text-white" fill="white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm">Shifa Health Assistant</div>
          <div className="text-emerald-200 text-xs">
            {lang === 'hi' ? 'आपके डॉक्टर की तरफ से' : `About your visit with Dr. ${visitData?.doctor?.name?.split(' ').pop() ?? ''}`}
          </div>
        </div>
      </div>

      {/* ── Messages ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map(msg => <ChatBubble key={msg.id} message={msg} />)}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* ── Suggested questions ────────────────────────────────────────── */}
      {showSuggestions && messages.length <= 1 && (
        <div className="flex-shrink-0 px-4 pb-3">
          <p className="text-xs text-gray-400 mb-2">
            {lang === 'hi' ? 'अक्सर पूछे जाने वाले सवाल:' : 'Suggested questions:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {getSuggestions(lang).map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="text-xs bg-white border border-emerald-200 text-emerald-700 font-medium px-3 py-1.5 rounded-full hover:bg-emerald-50 transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input bar ──────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3 safe-bottom">
        <div className="flex items-end gap-2 max-w-xl mx-auto">
          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 flex items-end">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value)
                // Auto-resize
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                lang === 'hi' ? 'अपना सवाल टाइप करें…' :
                  lang === 'ta' ? 'உங்கள் கேள்வியை தட்டச்சு செய்யுங்கள்…' :
                    lang === 'te' ? 'మీ ప్రశ్నను టైప్ చేయండి…' :
                      lang === 'bn' ? 'আপনার প্রশ্ন লিখুন…' :
                        'Type your question…'
              }
              className="flex-1 bg-transparent text-gray-800 text-sm placeholder-gray-400 outline-none resize-none leading-relaxed"
              style={{ maxHeight: '120px' }}
              disabled={sending}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || sending}
            className="w-11 h-11 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 text-white rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-sm disabled:shadow-none"
          >
            {sending
              ? <Spinner size="sm" className="text-white" />
              : <Send size={18} />
            }
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-1.5">
          AI assistant · For emergencies call 108
        </p>
      </div>
    </div>
  )
}

// ─── Welcome message by language ─────────────────────────────────────────────
function getWelcomeMessage(lang, patientName) {
  const name = patientName ? `, ${patientName}` : ''
  const msgs = {
    hi: `नमस्ते${name}! 🙏\n\nमैं शिफा AI हूँ। आप अपनी आज की डॉक्टर विज़िट के बारे में कोई भी सवाल पूछ सकते हैं — जैसे दवाइयाँ कैसे लें, क्या खाएं, या कब डॉक्टर को दोबारा दिखाएं।\n\nकोई भी सवाल पूछें हिंदी में! 😊`,
    ta: `வணக்கம்${name}! 🙏\n\nநான் Shifa AI. இன்றைய உங்கள் மருத்துவர் வருகையைப் பற்றி எந்த கேள்வியையும் கேளுங்கள்.`,
    te: `నమస్కారం${name}! 🙏\n\nనేను Shifa AI. మీ నేటి డాక్టర్ సందర్శన గురించి ఏదైనా అడగవచ్చు.`,
    bn: `নমস্কার${name}! 🙏\n\nআমি Shifa AI। আজকের ডাক্তার ভিজিট সম্পর্কে যেকোনো প্রশ্ন করুন।`,
    en: `Hello${name}! 👋\n\nI'm the Shifa AI health assistant. Ask me anything about your visit today — medicines, diet, when to follow up, or any concerns you have.\n\nI'll answer in simple language. What would you like to know?`,
  }
  return msgs[lang] ?? msgs.en
}