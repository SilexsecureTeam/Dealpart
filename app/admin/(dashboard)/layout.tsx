"use client";

import type { ReactNode } from "react";
import AdminSidebar from "@/components/Adminsidebar";
import DynamicTitle from "@/components/DynamicTitle";
import { ProfileProvider } from "@/components/ProfileProvider"; // Add this

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col lg:flex-row">
      <DynamicTitle />
      <AdminSidebar />

      <div className="flex-1 flex flex-col lg:ml-64">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <ProfileProvider> {/* Wrap children with ProfileProvider */}
            {children}
          </ProfileProvider>
        </main>
      </div>
    </div>
  );
}