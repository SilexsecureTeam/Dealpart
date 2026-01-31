"use client";

import type { ReactNode } from "react";
import AdminSidebar from "@/components/Adminsidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col lg:flex-row">
      <AdminSidebar />

      <div className="flex-1 flex flex-col lg:ml-64">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
