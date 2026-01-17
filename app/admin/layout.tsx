'use client' // ← Make sure layout is client if not already

import AdminSidebar from "@/components/Adminsidebar"
import { ModeToggle } from "@/components/ModeToggle"
import DynamicTitle from "@/components/DynamicTittle" // ← Add this import

// ... your other imports (Bell, Search, etc.)

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col lg:flex-row">
      <AdminSidebar />

      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Your top header with search, bell, settings, toggle, avatar */}
        <header className="bg-white dark:bg-gray-800 border-b ...">
          {/* ... existing header content ... */}
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <DynamicTitle /> {/* ← Add here — invisible but updates title */}
          {children}
        </main>
      </div>
    </div>
  )
}