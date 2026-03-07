import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { User, Mail, Lock, Phone, HeartHandshake } from 'lucide-react'
import { registerPatientAccount } from '@/api'
import Input from '../ui/Input'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

export default function PatientRegisterForm({ onSuccess }) {
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm()

  const password = watch('password')

  const submit = async (data) => {
    setLoading(true)
    try {
      await registerPatientAccount(data)
      toast.success('Patient account created successfully')
      onSuccess?.(data.firstName)
    } catch (err) {
      if (err.isShifaError && err.fieldErrors) {
        Object.entries(err.fieldErrors).forEach(([f, m]) => setError(f, { message: m }))
      } else {
        toast.error(err.message ?? 'Patient registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First Name"
          required
          placeholder="Aarav"
          leftIcon={<User size={14} />}
          error={errors.firstName?.message}
          {...register('firstName', { required: 'Required', minLength: { value: 2, message: 'Too short' } })}
        />
        <Input
          label="Last Name"
          required
          placeholder="Verma"
          error={errors.lastName?.message}
          {...register('lastName', { required: 'Required', minLength: { value: 2, message: 'Too short' } })}
        />
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        leftIcon={<Mail size={14} />}
        error={errors.email?.message}
        {...register('email', {
          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
        })}
      />

      <Input
        label="Phone Number"
        type="tel"
        required
        placeholder="+91 98765 43210"
        leftIcon={<Phone size={14} />}
        helper="Indian mobile number"
        error={errors.phoneNumber?.message}
        {...register('phoneNumber', { required: 'Required', pattern: { value: /^\+?[6-9]\d{9}$/, message: 'Invalid Indian phone number' } })}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Password"
          type="password"
          required
          placeholder="Strong password"
          leftIcon={<Lock size={14} />}
          helper="Use uppercase, lowercase, number and special char"
          error={errors.password?.message}
          {...register('password', {
            required: 'Required',
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
              message: 'Use uppercase, lowercase, number, special char (min 8)',
            },
          })}
        />
        <Input
          label="Confirm Password"
          type="password"
          required
          placeholder="Repeat password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Required',
            validate: (v) => v === password || 'Passwords do not match',
          })}
        />
      </div>

      <Button type="submit" loading={loading} fullWidth size="lg" leftIcon={<HeartHandshake size={16} />}>
        Create Patient Account
      </Button>
    </form>
  )
}
