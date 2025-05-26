'use client'
import TopHeader from '@/components/shared/header/header1'
import Header from '@/components/shared/header'
import Footer from '@/components/shared/footer'
import '@/app/globals.css'
import { SessionProvider } from "next-auth/react"
import { signIn } from 'next-auth/react'

import ClientProviders from '@/components/shared/client-providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
        <TopHeader />
        <Header />
       
        
        {children}
          
        <Footer />
        </SessionProvider>
      </body>
    </html>
  )
}