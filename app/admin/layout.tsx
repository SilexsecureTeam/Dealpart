import AdminSidebar from "@/components/Adminsidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-64 flex-1 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}