import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Global Pay Cheque',
  description: 'Showcase your skills with real stories',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
