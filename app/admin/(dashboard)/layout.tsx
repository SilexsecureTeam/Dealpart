"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AdminSidebar from "@/components/Adminsidebar";
import DynamicTitle from "@/components/DynamicTitle";
import { ProfileProvider } from "@/components/ProfileProvider";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#4EA674] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied for non-admin users
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You don't have permission to access the admin area.
          </p>
          <Link 
            href="/" 
            className="inline-block px-6 py-3 bg-[#4EA674] text-white rounded-lg hover:bg-[#3D8B59] transition"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Don't render anything if not logged in (will redirect)
  if (!user) {
    return null;
  }

  // Render admin layout for authorized users
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col lg:flex-row">
      <DynamicTitle />
      <AdminSidebar />

      <div className="flex-1 flex flex-col lg:ml-64">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <ProfileProvider>
            {children}
          </ProfileProvider>
        </main>
      </div>
    </div>
  );
}