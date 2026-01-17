'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function ModeToggle() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  // Only run once on mount (client-side)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent render on server / during hydration
  if (!mounted) {
    return (
      // Optional: placeholder with same size to avoid layout shift
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full p-2" />
      // or just → return null
    )
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="inline-flex items-center justify-center rounded-full p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#4EA674]"
    >
      <Sun 
        className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" 
      />
      <Moon 
        className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" 
      />
    </button>
  )
}