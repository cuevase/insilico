import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SITE_NAME } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  title: `${SITE_NAME} — Experiments in Intelligence`,
  description:
    'An independent lab by Emiliano Cuevas exploring intelligence and behavior through neuroscience, EEG, simulations, and artificial agent societies.',
  icons: { icon: '/icon.svg' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}<Analytics /></body>
    </html>
  )
}
