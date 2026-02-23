import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mimi Invest — DSE & UTT Investment Tracker',
  description: 'Track your DSE stocks, UTT funds, loans, goals and net worth. The smart investment companion for Tanzanian investors.',
  keywords: ['DSE', 'UTT', 'investments', 'Tanzania', 'stocks', 'funds', 'portfolio tracker'],
  openGraph: {
    title: 'Mimi Invest',
    description: 'Your smart investment companion for DSE & UTT markets',
    url: 'https://invest.sakuragroup.co.tz',
    siteName: 'Mimi Invest',
    type: 'website',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ff1a66',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mimi Invest" />
      </head>
      <body>{children}</body>
    </html>
  )
}
