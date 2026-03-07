import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { User, Mail, Lock, Phone, Stethoscope, Hash, Building2, MapPin } from 'lucide-react'
import { registerDoctor } from '@/api'
import Input, { Select } from '../ui/Input'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

const SPECIALIZATIONS = [
  'General Physician',
  'Cardiologist',
  'Diabetologist',
  'Dermatologist',
  'ENT Specialist',
  'Gastroenterologist',
  'General Surgeon',
  'Gynaecologist',
  'Nephrologist',
  'Neurologist',
  'Oncologist',
  'Ophthalmologist',
  'Orthopaedic Surgeon',
  'Paediatrician',
  'Psychiatrist',
  'Pulmonologist',
  'Radiologist',
  'Rheumatologist',
  'Urologist',
]

export default function DoctorRegisterForm({ onSuccess }) {
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
      const res = await registerDoctor(data)
      toast.success('Account created! Welcome to Shifa.')
      onSuccess?.(res)
    } catch (err) {
      if (err.isShifaError && err.fieldErrors) {
        Object.entries(err.fieldErrors).forEach(([f, m]) => setError(f, { message: m }))
      } else {
        toast.error(err.message ?? 'Registration failed')
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
          placeholder="Priya"
          leftIcon={<User size={14} />}
          error={errors.firstName?.message}
          {...register('firstName', { required: 'Required', minLength: { value: 2, message: 'Too short' } })}
        />
        <Input
          label="Last Name"
          required
          placeholder="Sharma"
          error={errors.lastName?.message}
          {...register('lastName', { required: 'Required', minLength: { value: 2, message: 'Too short' } })}
        />
      </div>

      <Input
        label="Email"
        type="email"
        required
        placeholder="doctor@hospital.com"
        leftIcon={<Mail size={14} />}
        error={errors.email?.message}
        {...register('email', { required: 'Required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
      />

      <Input
        label="Phone Number"
        type="tel"
        required
        placeholder="+91 98765 43210"
        leftIcon={<Phone size={14} />}
        helper="Indian mobile number with country code"
        error={errors.phoneNumber?.message}
        {...register('phoneNumber', { required: 'Required', pattern: { value: /^\+?[6-9]\d{9}$/, message: 'Invalid Indian phone number' } })}
      />

      <Select label="Specialization" required error={errors.specialization?.message} {...register('specialization', { required: 'Select your specialization' })}>
        <option value="">Select specialization</option>
        {SPECIALIZATIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>

      <Input
        label="MCI Registration Number"
        required
        placeholder="MCI-12345"
        leftIcon={<Hash size={14} />}
        helper="Medical Council of India registration number"
        error={errors.registrationNumber?.message}
        {...register('registrationNumber', { required: 'MCI number is required', minLength: { value: 5, message: 'Too short' } })}
      />

      <Input
        label="Clinic Name"
        placeholder="Shifa Care Clinic"
        leftIcon={<Building2 size={14} />}
        helper="Optional. If empty, a default clinic name is used."
        error={errors.clinicName?.message}
        {...register('clinicName')}
      />

      <Input
        label="Clinic Address"
        placeholder="Area, City"
        leftIcon={<MapPin size={14} />}
        error={errors.clinicAddress?.message}
        {...register('clinicAddress')}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Password"
          type="password"
          required
          placeholder="At least 8 chars with A-z, 0-9, symbol"
          leftIcon={<Lock size={14} />}
          helper="Must include uppercase, lowercase, number and special character"
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
          {...register('confirmPassword', { required: 'Required', validate: (v) => v === password || 'Passwords do not match' })}
        />
      </div>

      <Button type="submit" loading={loading} fullWidth size="lg" leftIcon={<Stethoscope size={16} />}>
        Create Doctor Account
      </Button>
    </form>
  )
}
