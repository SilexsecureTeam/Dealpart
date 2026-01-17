'use client'

import './globals.css'
import { Lato } from 'next/font/google'
import { usePathname } from 'next/navigation'
import { ThemeProvider } from '@/components/ThemeProvider' // your theme wrapper

import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lato.className} antialiased bg-white text-secondary min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
         disableTransitionOnChange 
        >
          {/* Public header + footer only on non-admin pages */}
          {!isAdminPage && <PublicHeader />}

          {/* Admin pages: just render children (admin/layout.tsx handles sidebar) */}
          {isAdminPage ? (
            <div className="flex flex-1 bg-gray-50 dark:bg-gray-950">
              {children}
            </div>
          ) : (
            <main className="flex-grow">
              {children}
            </main>
          )}

          {/* Footer only on public pages */}
          {!isAdminPage && <Footer />}
        </ThemeProvider>
      </body>
    </html>
  )
}