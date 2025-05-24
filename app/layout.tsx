import TopHeader from '@/components/shared/header/header1'
import Header from '@/components/shared/header'
import Footer from '@/components/shared/footer'
import '@/app/globals.css'

import ClientProviders from '@/components/shared/client-providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <TopHeader />
        <Header />
       
        
        {children}
          
        <Footer />
      </body>
    </html>
  )
}