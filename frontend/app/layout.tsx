import { Toaster } from 'sonner'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SidebarProvider } from '@/components/ui/sidebar'
import './globals.css'
import { LogPanel } from '@/components/LogPanel'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Danh bạ điện tử',
  description: 'Generated by Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>
          {children}
          {/* <LogPanel /> */}
        </SidebarProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
