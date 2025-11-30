import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import ToastProvider from '@/components/ToastProvider'
import Footer from '@/components/Footer'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: 'FloodCare',
  description: 'Application to store data of isolated people from floods',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <ToastProvider />
        {children}
        <Footer />
      </body>
    </html>
  )
}

