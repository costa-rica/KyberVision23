import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { StoreProvider } from '@/store/provider'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const _inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const _geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Kyber Vision Database Manager',
  description:
    'Manage and explore your Kyber Vision volleyball analytics database.',
}

export const viewport: Viewport = {
  themeColor: '#3d3a42',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${_inter.variable} ${_geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <StoreProvider>
            {children}
          </StoreProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
