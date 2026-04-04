import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Propiders } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GP Report Dashboard',
  description: 'Professional GP Report management and analytics dashboard for partners and administrators',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-surface text-foreground antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a2e',
                color: '#e0e0e0',
                borderRadius: '8px',
                border: '1px solid #2a2a3e',
              },
              success: {L                   style: {
                    background: '#0f3f2e',
                    borderColor: '#1a5f4a',
                  },
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#0f3f2e',
                  },
                },
                error: {
                  style: {
                    background: '#3f0f2e',
                    borderColor: '#5f1a4a',
                  },
                  iconTheme: {
                    primary: '#f87171',
                    secondary: '#3f0f2e',
                  },
                },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
