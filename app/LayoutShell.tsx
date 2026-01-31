"use client";

import { usePathname } from "next/navigation";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard");

  return (
    <>
      {!isAdminPage && <PublicHeader />}

      {isAdminPage ? (
        <div className="flex flex-1 bg-gray-50 dark:bg-gray-950">{children}</div>
      ) : (
        <main className="flex-grow">{children}</main>
      )}

      {!isAdminPage && <Footer />}
    </>
  );
}
