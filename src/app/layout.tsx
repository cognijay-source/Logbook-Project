import type { Metadata } from 'next'
import './globals.css'
import { QueryProvider } from '@/components/query-provider'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'CrossCheck — The Pilot Operating System',
  description: 'See the system clearly. Build mastery deliberately.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}
