"use client"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserSignUpSchema } from '@/lib/validator'
import { IUserSignUp } from '@/types'
import { registerUser } from '@/lib/actions/user.actions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GoogleSignInForm from '../sign-in/google-signin-form'
import { Input } from '@/components/ui/input'

export default function SignUpForm() {
  const router = useRouter()
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const form = useForm<IUserSignUp>({
    resolver: zodResolver(UserSignUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      whatsapp: '',
    },
  })
  const { register, handleSubmit, formState: { errors, isSubmitting } } = form

  const onSubmit = async (data: IUserSignUp) => {
    setError(null)
    setSuccess(null)
    const res = await registerUser(data)
    if (res.success) {
      setSuccess('Account created successfully!')
      setTimeout(() => {
        router.push('/sign-in')
      }, 1500)
    } else {
      setError(res.message || 'Registration failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-[500px] mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create Account</h2>
      {success && <div className="text-green-600 font-bold">{success}</div>}
      {error && <div className="text-red-600 font-bold">{error}</div>}
      <div>
        <label className="block mb-1 font-medium">Name</label>
        <Input {...register('name')} />
        {errors.name && <span className="text-red-500 text-sm">{errors.name.message as string}</span>}
      </div>
      <div>
        <label className="block mb-1 font-medium">Email</label>
        <Input {...register('email')} />
        {errors.email && <span className="text-red-500 text-sm">{errors.email.message as string}</span>}
      </div>
      <div>
        <label className="block mb-1 font-medium">WhatsApp</label>
        <Input {...register('whatsapp')} />
        {errors.whatsapp && <span className="text-red-500 text-sm">{errors.whatsapp.message as string}</span>}
      </div>
      <div>
        <label className="block mb-1 font-medium">Password</label>
        <Input type="password" {...register('password')} />
        {errors.password && <span className="text-red-500 text-sm">{errors.password.message as string}</span>}
      </div>
      <div>
        <label className="block mb-1 font-medium">Confirm Password</label>
        <Input type="password" {...register('confirmPassword')} />
        {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword.message as string}</span>}
      </div>
      <button type="submit" disabled={isSubmitting} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded mt-2">
        {isSubmitting ? 'Creating...' : 'Create Account'}
      </button>
      <GoogleSignInForm />
    </form>
  )
}
