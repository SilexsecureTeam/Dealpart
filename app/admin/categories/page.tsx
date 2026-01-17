'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Bell, Settings, MoreVertical, MessageSquare, Edit2, Trash2, Sun, Moon, SlidersHorizontal,
  PlusSquare,MoreHorizontal } from "lucide-react";
import { useTheme } from "next-themes";


const weeklyData = [
  { day: "Sun", visitors: 20000 },
  { day: "Mon", visitors: 22000 },
  { day: "Tue", visitors: 30000 },
  { day: "Wed", visitors: 28000 },
  { day: "Thu", visitors: 25409 },
  { day: "Fri", visitors: 24000 },
  { day: "Sat", visitors: 26000 },
];

const categories = [
  "PV Solar Panels",
  "Batteries",
  "Solar Water Pumps",
  "Solar Packages",
  "Inverters",
  "Charge Controllers",
  "Stabilizers",
  "Accessories",
];

const products = Array.from({ length: 145 }, (_, i) => ({
  id: i + 1,
  name: "Monocrystalle Panel",
  createdDate: "01-01-2025",
  orders: Math.floor(Math.random() * 50) + 10,
}));

export default function CategoriesPage() {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Updated Header - consistent with other pages */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile search toggle */}
          <button 
            className="p-2 md:hidden hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Toggle search"
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Desktop search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="pl-12 pr-6 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm w-64 lg:w-96 focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            />
          </div>

          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Dark mode toggle - hydration safe */}
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

      {/* Mobile search dropdown */}
      {showSearch && (
        <div className="md:hidden px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
              autoFocus
            />
          </div>
        </div>
      )}

      <main className="p-6 lg:p-8 bg-gray-50 dark:bg-gray-950">
        {/* Title + Actions */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Discover</h2>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#3D8B59] transition-colors">
              + Add Product
            </button>
            <button className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              More Action
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-12">
          {categories.map((cat, i) => (
            <button
              key={i}
              className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <Image
                src="/solarpanel.png"
                alt={cat}
                width={48}
                height={48}
                className="rounded-lg object-cover"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white text-center">{cat}</span>
            </button>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  filter === "all" ? "bg-[#C1E6BA] text-[#4EA674]" : "text-[#7C7C7C] hover:bg-[#EAF8E7]"
                }`}
              >
                All Product (145)
              </button>
              <button className="px-4 py-2.5 text-[#7C7C7C] rounded-full text-sm font-medium hover:bg-[#EAF8E7] transition">
                Featured Products
              </button>
              <button className="px-4 py-2.5 text-[#7C7C7C] rounded-full text-sm font-medium hover:bg-[#EAF8E7] transition">
                On Sale
              </button>
              <button className="px-4 py-2.5 text-[#7C7C7C] rounded-full text-sm font-medium hover:bg-[#EAF8E7] transition">
                Out of Stock
              </button>
            </div>

           {/* Right side: Search + Exact Icons */}
<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
  {/* Search input */}
  <div className="relative flex-1 min-w-[240px]">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
    <input
      type="text"
      placeholder="Search your product"
      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/20"
    />
  </div>

  {/* Action icons - exact match to screenshot */}
  <div className="flex items-center justify-end sm:justify-center gap-2 sm:gap-3">
    {/* Search icon button */}
    <button className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
      <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
    </button>

    {/* Filter/Sort icon (SlidersHorizontal) */}
    <button className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
      <SlidersHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
    </button>

    {/* Add icon (PlusSquare) */}
    <button className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
      <PlusSquare className="w-5 h-5 text-gray-600 dark:text-gray-300" />
    </button>

    {/* More actions (MoreHorizontal - three dots) */}
    <button className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
      <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
    </button>
  </div>
</div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-[#EAF8E7]">
                <tr className="text-left text-[#4EA674] font-medium">
                  <th className="px-6 py-4 rounded-l-xl">No.</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4 rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginatedProducts.map((product, i) => {
                  const rowNumber = (page - 1) * itemsPerPage + i + 1;
                  return (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-5 text-gray-900 dark:text-white font-medium">{rowNumber}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <Image
                            src="/solarpanel.png"
                            alt={product.name}
                            width={40}
                            height={40}
                            className="rounded-lg object-cover flex-shrink-0"
                          />
                          <span className="text-gray-900 dark:text-white">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-gray-600 dark:text-gray-300">{product.createdDate}</td>
                      <td className="px-6 py-5 text-gray-900 dark:text-white">{product.orders}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <button className="text-gray-500 hover:text-[#4EA674] transition">
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button className="text-gray-500 hover:text-[#F43443] transition">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(1)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  page === 1 ? "bg-[#C1E6BA] text-[#4EA674]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                1
              </button>

              {page > 4 && <span className="text-gray-500 dark:text-gray-400 text-sm">...</span>}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((num) => num > 1 && num < totalPages && Math.abs(num - page) <= 2)
                .map((num) => (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                      page === num ? "bg-[#C1E6BA] text-[#4EA674]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {num}
                  </button>
                ))}

              {page < totalPages - 3 && totalPages > 6 && <span className="text-gray-500 dark:text-gray-400 text-sm">...</span>}

              {totalPages > 1 && (
                <button
                  onClick={() => setPage(totalPages)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    page === totalPages ? "bg-[#C1E6BA] text-[#4EA674]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {totalPages}
                </button>
              )}
            </div>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}