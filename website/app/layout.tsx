import type { Metadata } from 'next'
import { Courier_Prime } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SITE_NAME } from '@/lib/site'
import './globals.css'

const courierPrime = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-courier-prime',
  display: 'swap',
})

export const metadata: Metadata = {
  title: `${SITE_NAME} — In-Silico Neuroscience Experiments`,
  description: 'A collection of in-silico neuroscience experiments using TRIBE v2, a multimodal brain encoding model from Meta Research. Built by Emiliano Cuevas.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={courierPrime.variable}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
