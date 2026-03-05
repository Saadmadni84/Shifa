import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { User, Phone, Calendar, Heart } from 'lucide-react'
import { registerPatient } from '@/api'
import Input, { Select } from '../ui/Input'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

const LANGUAGES = [
  { code: 'HI', label: 'Hindi' },
  { code: 'EN', label: 'English' },
  { code: 'TA', label: 'Tamil' },
  { code: 'TE', label: 'Telugu' },
  { code: 'BN', label: 'Bengali' },
  { code: 'MR', label: 'Marathi' },
  { code: 'GU', label: 'Gujarati' },
  { code: 'KN', label: 'Kannada' },
  { code: 'ML', label: 'Malayalam' },
]

export default function PatientQuickAddForm({ onSuccess }) {
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: { preferredLanguage: 'HI' },
  })

  const submit = async (data) => {
    setLoading(true)
    try {
      const patient = await registerPatient(data)
      toast.success(`${patient.firstName} added successfully!`)
      onSuccess?.(patient)
    } catch (err) {
      if (err.isShifaError && err.fieldErrors) {
        Object.entries(err.fieldErrors).forEach(([f, m]) => setError(f, { message: m }))
      } else {
        toast.error(err.message ?? 'Failed to add patient')
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
          placeholder="Arjun"
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
        label="Phone Number"
        type="tel"
        required
        placeholder="+91 98765 43210"
        leftIcon={<Phone size={14} />}
        helper="WhatsApp summary will be sent to this number"
        error={errors.phoneNumber?.message}
        {...register('phoneNumber', { required: 'Required', pattern: { value: /^\+?[6-9]\d{9}$/, message: 'Invalid Indian phone number' } })}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Age"
          type="number"
          placeholder="45"
          leftIcon={<Calendar size={14} />}
          error={errors.age?.message}
          {...register('age', { min: { value: 0, message: 'Invalid' }, max: { value: 120, message: 'Invalid' } })}
        />
        <Select label="Preferred Language" error={errors.preferredLanguage?.message} {...register('preferredLanguage')}>
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </Select>
      </div>

      <Input label="Chronic Conditions (optional)" placeholder="e.g. Diabetes, Hypertension" leftIcon={<Heart size={14} />} helper="Comma-separated" {...register('chronicConditionsRaw')} />

      <Button type="submit" loading={loading} fullWidth leftIcon={<User size={15} />}>
        Add Patient
      </Button>
    </form>
  )
}
