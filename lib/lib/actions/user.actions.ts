import { signIn } from 'next-auth/react'

export const SignInWithGoogle = async () => {
  'use server'
  await signIn('google')
} 