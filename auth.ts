// auth.ts
import NextAuth, { DefaultSession, type AuthOptions, type Session } from 'next-auth'
import { getServerSession } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import client from './lib/db/client'
import User from './lib/db/models/user.model'
import { connectToDatabase } from './lib/db'
import { Adapter } from 'next-auth/adapters'

// ✅ توسعة Session و Token
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }
  interface User {
    id: string
    role: string
  }
  interface JWT {
    id: string
    role: string
  }
}

const fullAuthConfig: AuthOptions = {
  adapter: MongoDBAdapter(client) as Adapter,
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
          role: user.role,
        }
      },
    }),
  ],
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
    newUser: '/sign-up',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id =
          (user as any).id ||
          (user as any)._id?.toString() ||
          (user as any).sub ||
          token.sub || ''
    
        token.role = (user as any).role || token.role || 'user'
        token.name = user.name || token.name
        token.email = user.email || token.email
      }

      return token
    },
    async session({ session, token }) {
      session.user.id = (token.id as string) || (token.sub as string) || ''
      session.user.role = token.role as string
      session.user.name = token.name as string
      session.user.email = token.email as string
      return session
    }
    
  },
}

// ✅ استخراج الوظائف
const authResult = NextAuth(fullAuthConfig)

export const GET = authResult.handlers?.GET
export const POST = authResult.handlers?.POST
export const authHandler = authResult.auth
export const signIn = authResult.signIn
export const signOut = authResult.signOut

// ✅ function للاستعمال في Server Components
export const auth = (): Promise<Session | null> => getServerSession(fullAuthConfig)
