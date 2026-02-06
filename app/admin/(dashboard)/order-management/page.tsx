'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Search, 
  Bell, 
  MoreVertical, 
  Truck, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon,
  SlidersHorizontal,     // ≡ filter
  ArrowDownToLine,       // ↓ export
  MoreHorizontal         // ... more
} from "lucide-react";
import { useTheme } from "next-themes";

type FilterType = "all" | "completed" | "pending" | "canceled";

const allOrders = Array.from({ length: 240 }, (_, i) => ({
  id: "ORD0001",
  product: "Monocrystalle Panel",
  date: "01-01-2025",
  price: ["49.99", "14.99", "39.99", "79.99"][i % 4],
  payment: i % 3 === 0 ? "Unpaid" : "Paid",
  status: ["Delivered", "Pending", "Shipped", "Cancelled"][i % 4] as "Delivered" | "Pending" | "Shipped" | "Cancelled",
}));

export default function OrderManagementPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const itemsPerPage = 10;

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredOrders = allOrders.filter((order) => {
    if (filter === "completed") return order.status === "Delivered" || order.status === "Shipped";
    if (filter === "pending") return order.status === "Pending";
    if (filter === "canceled") return order.status === "Cancelled";
    return true;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getCount = (type: FilterType): number => {
    if (type === "all") return allOrders.length;
    if (type === "completed") return allOrders.filter(o => o.status === "Delivered" || o.status === "Shipped").length;
    if (type === "pending") return allOrders.filter(o => o.status === "Pending").length;
    if (type === "canceled") return allOrders.filter(o => o.status === "Cancelled").length;
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Order Management</h1>

        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            className="p-2 md:hidden hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Toggle search"
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              className="pl-12 pr-6 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm w-64 lg:w-96 focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            />
          </div>

          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {!mounted ? (
            <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-700" />
          ) : (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              <Sun
                className={`h-5 w-5 text-yellow-500 transition-all duration-300 ${
                  theme === "dark" ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
                }`}
              />
              <Moon
                className={`absolute inset-0 m-auto h-5 w-5 text-blue-400 transition-all duration-300 ${
                  theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
                }`}
              />
            </button>
          )}

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600">
            <Image src="/man.png" alt="Admin" width={40} height={40} className="object-cover w-full h-full" />
          </div>
        </div>
      </header>

      {showSearch && (
        <div className="md:hidden px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
              autoFocus
            />
          </div>
        </div>
      )}

      <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-gray-50 dark:bg-gray-950">
        {/* Order List title + actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Order List</h2>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#3D8B59] transition-colors">
              + Add Order
            </button>
            <button className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              More
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            { title: "Total Orders", value: "1,240", change: "↑ 14.4%", color: "#4EA674" },
            { title: "New Orders", value: "240", change: "↑ 20%", color: "#4EA674" },
            { title: "Completed", value: "960", change: "85%", color: "#4EA674" },
            { title: "Canceled", value: "87", change: "↓ 5%", color: "#F43443" },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex justify-between items-start mb-2 sm:mb-4">
                <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{stat.title}</h3>
                <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>
              <div className="flex items-end gap-2">
                <p className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className={`text-sm sm:text-lg font-bold ${stat.color === "#4EA674" ? "text-[#4EA674]" : "text-[#F43443]"}`}>
                  {stat.change}
                </p>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Last 7 days</p>
            </div>
          ))}
        </div>

        {/* Main content card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          {/* Top bar - EXACT arrangement as requested */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            {/* Search input - LEFT */}
            <div className="relative w-full sm:max-w-md lg:max-w-lg flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search order report"
                className="w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
              />
            </div>

            {/* Action icons - RIGHT */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              <button className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                <SlidersHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              <button className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                <ArrowDownToLine className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              <button className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
            {["all", "completed", "pending", "canceled"].map((type) => (
              <button
                key={type}
                onClick={() => { setFilter(type as FilterType); setPage(1); }}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  filter === type
                    ? "bg-[#C1E6BA] text-[#4EA674]"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {type === "all" ? `All (${getCount("all")})` : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#EAF8E7] dark:bg-gray-800/50">
                <tr className="text-left text-[#4EA674] font-medium">
                  <th className="px-6 py-4 rounded-l-xl">No.</th>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginatedOrders.map((order, i) => {
                  const rowNumber = (page - 1) * itemsPerPage + i + 1;
                  return (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-5 font-medium text-gray-900 dark:text-white">{rowNumber}</td>
                      <td className="px-6 py-5 font-medium text-gray-900 dark:text-white">#{order.id}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Image src="/solarpanel.png" alt={order.product} width={40} height={40} className="rounded-lg" />
                          <span className="text-gray-900 dark:text-white">{order.product}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-gray-600 dark:text-gray-300">{order.date}</td>
                      <td className="px-6 py-5 font-medium text-gray-900 dark:text-white">${order.price}</td>
                      <td className="px-6 py-5">
                        <span className={`font-medium ${order.payment === "Paid" ? "text-[#4EA674]" : "text-[#F43443]"}`}>
                          {order.payment}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                          order.status === "Delivered" || order.status === "Shipped"
                            ? "bg-[#7aeb60] text-[#05130b]"
                            : order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                        }`}>
                          <Truck className="w-4 h-4" />
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {paginatedOrders.map((order, i) => {
              const rowNumber = (page - 1) * itemsPerPage + i + 1;
              return (
                <div
                  key={i}
                  className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <Image src="/solarpanel.png" alt={order.product} width={48} height={48} className="rounded-lg" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">#{order.id}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{order.product}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "Delivered" || order.status === "Shipped"
                        ? "bg-[#EAF8E7] text-[#4EA674]"
                        : order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">{order.date}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Price</p>
                      <p className="font-medium text-gray-900 dark:text-white">${order.price}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Payment</p>
                      <p className={`font-medium ${order.payment === "Paid" ? "text-[#4EA674]" : "text-[#F43443]"}`}>
                        {order.payment}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 sm:mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 7 && page > 4) {
                  if (i === 0) pageNum = 1;
                  else if (i === 1) return <span key="dots1" className="px-2 py-1 text-gray-400">...</span>;
                  else if (i === 5) return <span key="dots2" className="px-2 py-1 text-gray-400">...</span>;
                  else if (i === 6) pageNum = totalPages;
                  else pageNum = page - 3 + i;
                }
                if (pageNum > totalPages || pageNum < 1) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium min-w-[36px] ${
                      page === pageNum
                        ? "bg-[#C1E6BA] text-[#4EA674]"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}