// src/components/Adminsidebar.tsx
'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Tag,
  Layers,
  Receipt,
  Star,
  PlusCircle,
  Image as ImageIcon,
  List,
  MessageSquare,
  UserCog,
  Shield,
  ChevronRight,
  Store,
  Menu,
  X,
} from "lucide-react";

const mainMenu = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Package, label: "Order Management", path: "/admin/order-management" },
  { icon: Users, label: "Customers", path: "/admin/customers" },
  { icon: Tag, label: "Coupon Code", path: "/admin/coupons" },
  { icon: Layers, label: "Categories", path: "/admin/categories" },
  { icon: Receipt, label: "Transaction", path: "/admin/transaction" },
  { icon: Star, label: "Brand", path: "/admin/brands" },
];

const productMenu = [
  { icon: PlusCircle, label: "Add Products", path: "/admin/product/add" },
  { icon: ImageIcon, label: "Product Media", path: "/admin/product/media" },
  { icon: List, label: "Product List", path: "/admin/product" },
  { icon: MessageSquare, label: "Product Reviews", path: "/admin/product/reviews" },
];

const adminMenu = [
  { icon: UserCog, label: "Admin role", path: "/admin/admin-role" },
  { icon: Shield, label: "Control Authority", path: "/admin/authority" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-8 py-7 border-b border-gray-200 dark:border-gray-700">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="DEALPORT"
            width={140}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>
      </div>

      {/* Navigation - takes remaining space */}
      <nav className="flex-1 px-4 py-6 overflow-hidden">
        {/* Main menu */}
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
          Main menu
        </p>
        <ul className="space-y-1 mb-8">
          {mainMenu.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-full transition-all ${
                    active
                      ? "bg-[#4EA674] text-white shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Product */}
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
          Product
        </p>
        <ul className="space-y-1 mb-8">
          {productMenu.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-full transition-all ${
                    active
                      ? "bg-[#4EA674] text-white shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Admin */}
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
          Admin
        </p>
        <ul className="space-y-1">
          {adminMenu.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-full transition-all ${
                    active
                      ? "bg-[#4EA674] text-white shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section - fixed at bottom */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 pt-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600">
              <Image
                src="/man.png"
                alt="Admin"
                width={44}
                height={44}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">Dealport</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-28">
                Mark@thedesigner...
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        <Link
          href="/shop"
          className="flex items-center justify-between px-5 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        >
          <div className="flex items-center gap-3">
            <Store className="w-5 h-5" />
            <span>Your Shop</span>
          </div>
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <div className={`lg:hidden fixed inset-0 z-50 ${mobileOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-black/50" onClick={toggleMobile} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <Image src="/logo.png" alt="DEALPORT" width={120} height={34} className="h-9 w-auto" />
            <button onClick={toggleMobile} className="p-2">
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>
    </>
  );
}