import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { OTPVerifyForm } from '@/components'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { requestPatientOTP } from '@/api'
import { Smartphone, Stethoscope } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store'

export default function PatientLoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [step, setStep] = useState(1) // 1: phone, 2: otp
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleRequestOTP = async (e) => {
    e.preventDefault()
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number')
      return
    }
    
    setLoading(true)
    try {
      await requestPatientOTP(phoneNumber)
      toast.success('OTP sent to your WhatsApp/SMS')
      setStep(2)
    } catch (err) {
      // For demo mode, if backend is down, we can skip or show error
      toast.error(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = (res) => {
    // Usually auth returns { user, token }
    setAuth(res.user, res.token)
    // Send patient to their dashboard or summary
    navigate('/patient/my-health')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4 hover:bg-emerald-600 transition-colors">
            <Stethoscope size={24} className="text-white" />
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Patient Area</h2>
          <p className="text-gray-500 text-sm mt-1">
            {step === 1 ? 'Log in with your phone number' : 'Enter the code sent to your phone'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <Input
              label="Phone Number"
              type="tel"
              required
              placeholder="10-digit mobile number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              leftIcon={<Smartphone size={15} />}
            />
            <Button type="submit" loading={loading} fullWidth size="lg">
              Get OTP
            </Button>
          </form>
        ) : (
          <OTPVerifyForm phoneNumber={phoneNumber} onSuccess={handleSuccess} />
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          Are you a Doctor?{' '}
          <Link to="/login" className="text-emerald-600 font-semibold hover:underline">
            Doctor Login
          </Link>
        </div>
      </div>
    </div>
  )
}
