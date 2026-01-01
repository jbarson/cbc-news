import type { Metadata } from 'next'
import SkipToContent from './components/SkipToContent'
import './globals.css'

export const metadata: Metadata = {
  title: 'CBC News Top Stories',
  description: 'Latest top stories from CBC News',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SkipToContent />
        {children}
      </body>
    </html>
  )
}

