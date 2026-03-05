/**
 * useOTP.js — Shifa Patient OTP Authentication Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Indian patients don't use passwords — they authenticate with OTP via:
 *   • WhatsApp (primary — Shifa already has the patient's WhatsApp)
 *   • SMS fallback (Twilio)
 *
 * This hook manages:
 *   • Phone number entry + formatting (Indian +91 numbers)
 *   • OTP request
 *   • OTP verification
 *   • Resend cooldown countdown (60 s)
 *   • Auto-submit when 6th digit is entered
 *   • Max attempts guard (5 attempts → locked 10 min)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { authApi } from '@/api/auth'
import toast from 'react-hot-toast'

const OTP_LENGTH = 6
const RESEND_COOLDOWN = 60    // seconds
const MAX_ATTEMPTS = 5

// ─── Format Indian phone numbers ──────────────────────────────────────────────
function formatIndianPhone(raw) {
    const digits = raw.replace(/\D/g, '')
    if (digits.startsWith('91') && digits.length === 12) return `+${digits}`
    if (digits.startsWith('0')) return `+91${digits.slice(1)}`
    if (digits.length === 10) return `+91${digits}`
    return `+${digits}`
}

function isValidIndianPhone(phone) {
    const digits = phone.replace(/\D/g, '')
    // 10-digit number starting with 6-9 (Indian mobile)
    return /^[6-9]\d{9}$/.test(digits.slice(-10))
}

export function useOTP() {
    const [step, setStep] = useState('PHONE')   // 'PHONE' | 'OTP' | 'LOCKED'
    const [phone, setPhone] = useState('')
    const [formattedPhone, setFormatted] = useState('')
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
    const [isRequesting, setIsRequesting] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [error, setError] = useState(null)
    const [cooldown, setCooldown] = useState(0)
    const [attempts, setAttempts] = useState(0)
    const [channel, setChannel] = useState('WHATSAPP')  // 'WHATSAPP' | 'SMS'

    const cooldownRef = useRef(null)
    const inputRefs = useRef([])   // refs for each digit input — focus management

    // ─── Phone formatting ─────────────────────────────────────────────────────
    const handlePhoneChange = useCallback((raw) => {
        const cleaned = raw.replace(/[^\d+\s-]/g, '')
        setPhone(cleaned)
        setFormatted(formatIndianPhone(cleaned))
        setError(null)
    }, [])

    const isPhoneValid = isValidIndianPhone(phone)

    // ─── Cooldown timer ───────────────────────────────────────────────────────
    useEffect(() => {
        if (cooldown <= 0) {
            clearInterval(cooldownRef.current)
            return
        }
        cooldownRef.current = setInterval(() => {
            setCooldown(c => {
                if (c <= 1) { clearInterval(cooldownRef.current); return 0 }
                return c - 1
            })
        }, 1_000)
        return () => clearInterval(cooldownRef.current)
    }, [cooldown])

    // ─── Request OTP ──────────────────────────────────────────────────────────
    const requestOTP = useCallback(async (preferredChannel = channel) => {
        if (!isPhoneValid) {
            setError('Please enter a valid 10-digit Indian mobile number.')
            return
        }
        if (cooldown > 0) {
            toast.error(`Please wait ${cooldown} seconds before requesting again.`)
            return
        }

        setIsRequesting(true)
        setError(null)

        try {
            await authApi.requestPatientOTP(formattedPhone, preferredChannel)
            setStep('OTP')
            setCooldown(RESEND_COOLDOWN)
            setChannel(preferredChannel)
            toast.success(
                preferredChannel === 'WHATSAPP'
                    ? `OTP sent to your WhatsApp (${formattedPhone})`
                    : `OTP sent via SMS to ${formattedPhone}`
            )
        } catch (err) {
            const msg = err.message || 'Could not send OTP. Try again.'
            setError(msg)
            toast.error(msg)
        } finally {
            setIsRequesting(false)
        }
    }, [isPhoneValid, cooldown, formattedPhone, channel])

    // ─── OTP digit input ──────────────────────────────────────────────────────
    const handleOtpChange = useCallback((index, value) => {
        const digit = value.replace(/\D/g, '').slice(-1)
        const newOtp = [...otp]
        newOtp[index] = digit
        setOtp(newOtp)
        setError(null)

        // Auto-focus next
        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }, [otp])

    const handleOtpKeyDown = useCallback((index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }, [otp])

    // ─── Paste handler (user pastes full 6-digit OTP) ─────────────────────────
    const handleOtpPaste = useCallback((e) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
        if (pasted.length === OTP_LENGTH) {
            setOtp(pasted.split(''))
        }
    }, [])

    // ─── Verify OTP ───────────────────────────────────────────────────────────
    const otpCode = otp.join('')

    const verifyOTP = useCallback(async () => {
        if (otpCode.length !== OTP_LENGTH) return
        if (attempts >= MAX_ATTEMPTS) {
            setStep('LOCKED')
            return
        }

        setIsVerifying(true)
        setError(null)

        try {
            const { data } = await authApi.verifyPatientOTP(formattedPhone, otpCode)
            // Success — parent (useAuth) will handle token storage + redirect
            return data
        } catch (err) {
            const newAttempts = attempts + 1
            setAttempts(newAttempts)

            if (newAttempts >= MAX_ATTEMPTS) {
                setStep('LOCKED')
                setError('Too many failed attempts. Please try again after 10 minutes.')
            } else {
                const msg = err.message || 'Invalid OTP. Please try again.'
                setError(msg)
                // Shake effect: clear OTP so user re-enters
                setOtp(Array(OTP_LENGTH).fill(''))
                inputRefs.current[0]?.focus()
            }
            throw err
        } finally {
            setIsVerifying(false)
        }
    }, [otpCode, formattedPhone, attempts])

    // Auto-submit when all 6 digits entered
    useEffect(() => {
        if (otpCode.length === OTP_LENGTH && !isVerifying) {
            verifyOTP()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otpCode])

    // ─── Reset ────────────────────────────────────────────────────────────────
    const reset = useCallback(() => {
        setStep('PHONE')
        setPhone('')
        setFormatted('')
        setOtp(Array(OTP_LENGTH).fill(''))
        setError(null)
        setCooldown(0)
        setAttempts(0)
    }, [])

    return {
        // State
        step,
        phone,
        formattedPhone,
        otp,
        otpCode,
        channel,
        isPhoneValid,
        isRequesting,
        isVerifying,
        error,
        cooldown,
        attemptsLeft: MAX_ATTEMPTS - attempts,
        inputRefs,      // assign inputRefs.current[i] to each digit <input>

        // Actions
        handlePhoneChange,
        handleOtpChange,
        handleOtpKeyDown,
        handleOtpPaste,
        requestOTP,
        verifyOTP,
        setChannel,
        reset,
    }
}
