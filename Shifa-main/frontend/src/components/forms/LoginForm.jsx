import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { loginDoctor } from '@/api'
import Input from '../ui/Input'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

export default function LoginForm({ onSuccess }) {
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm()

  const submit = async (data) => {
    setLoading(true)
    try {
      const res = await loginDoctor(data)
      toast.success('Welcome back, Doctor!')
      onSuccess?.(res)
    } catch (err) {
      if (err.isShifaError && err.status === 401) {
        setError('email', { message: 'Invalid email or password' })
        setError('password', { message: 'Invalid email or password' })
      } else {
        toast.error(err.message ?? 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      <Input
        label="Email"
        type="email"
        id="login-email"
        required
        placeholder="you@example.com"
        leftIcon={<Mail size={15} />}
        error={errors.email?.message}
        {...register('email', {
          required: 'Email is required',
          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
        })}
      />

      <Input
        label="Password"
        type={showPw ? 'text' : 'password'}
        id="login-password"
        required
        placeholder="Your password"
        leftIcon={<Lock size={15} />}
        rightIcon={
          <button type="button" onClick={() => setShowPw((o) => !o)} className="p-0.5">
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        }
        error={errors.password?.message}
        {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
      />

      <Button type="submit" loading={loading} fullWidth size="lg">
        Sign In
      </Button>
    </form>
  )
}
