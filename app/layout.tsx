import TopHeader from '@/components/shared/header/header1'
import Header from '@/components/shared/header'
import Footer from '@/components/shared/footer'

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
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  )
}