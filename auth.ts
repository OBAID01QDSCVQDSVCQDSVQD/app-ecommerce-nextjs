import { type AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { Adapter } from 'next-auth/adapters'


import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import clientPromise from '@/lib/db/client'
import bcrypt from 'bcryptjs'
import User from '@/lib/db/models/user.model'
import { connectToDatabase } from '@/lib/db'

export const authConfig: AuthOptions = {
  secret: process.env.AUTH_SECRET, // 👈 ضروري جدا

  adapter: MongoDBAdapter(clientPromise) as Adapter,

  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        await connectToDatabase()
        if (!credentials) return null

        const user = await User.findOne({ email: credentials.email })
        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role || 'user',
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || (user as any)._id?.toString()
        token.role = user.role || 'user'
      }
      return token
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
        },
      }
    },
  },

  
}