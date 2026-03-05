import { useRef, useState, useEffect } from 'react'
import { verifyPatientOTP, requestPatientOTP } from '@/api'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

export default function OTPVerifyForm({ phoneNumber, onSuccess }) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const refs = useRef([])

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setCanResend(true)
          clearInterval(t)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const handleChange = (i, v) => {
    const clean = v.replace(/\D/, '')
    const next = [...digits]
    next[i] = clean
    setDigits(next)
    setError('')
    if (clean && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (paste.length === 6) {
      setDigits(paste.split(''))
      refs.current[5]?.focus()
    }
  }

  const verify = async () => {
    const otp = digits.join('')
    if (otp.length !== 6) {
      setError('Enter all 6 digits')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await verifyPatientOTP({ phoneNumber, otp })
      toast.success('Verified!')
      onSuccess?.(res)
    } catch (err) {
      setError(err.message ?? 'Invalid OTP. Please try again.')
      setDigits(['', '', '', '', '', ''])
      refs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    setCanResend(false)
    setCountdown(60)
    try {
      await requestPatientOTP({ phoneNumber })
      toast.success('New OTP sent!')
      setCountdown(60)
      const t = setInterval(() =>
        setCountdown((c) => {
          if (c <= 1) {
            setCanResend(true)
            clearInterval(t)
            return 0
          }
          return c - 1
        }), 1000)
    } catch {
      toast.error('Failed to resend OTP')
      setCanResend(true)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={[
              'w-12 h-14 text-center text-xl font-bold rounded-xl border-2',
              'focus:outline-none transition-all duration-150',
              error ? 'border-red-300 bg-red-50 text-red-700' : d ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-gray-300 bg-white text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100',
            ].join(' ')}
          />
        ))}
      </div>

      {error && <p className="text-center text-sm text-red-600">{error}</p>}

      <Button onClick={verify} loading={loading} fullWidth size="lg">
        Verify OTP
      </Button>

      <p className="text-center text-sm text-gray-500">
        {canResend ? (
          <button onClick={resend} className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
            Resend OTP
          </button>
        ) : (
          <>
            Resend OTP in <span className="font-semibold text-gray-700">{countdown}s</span>
          </>
        )}
      </p>
    </div>
  )
}
