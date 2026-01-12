'use client';

import { useState } from "react";
import Image from "next/image";
import { Search, Bell, Settings, MoreVertical } from "lucide-react";

type FilterType = "all" | "completed" | "pending" | "canceled";

const allTransactions = Array.from({ length: 240 }, (_, i) => ({
  id: "CUST001",
  name: ["John Doe", "Jane Smith", "Emily Davis"][i % 3],
  date: "01-01-2025",
  total: "2,904",
  method: ["CC", "PayPal", "Bank"][i % 3],
  status: ["Complete", "Pending", "Canceled"][i % 3] as "Complete" | "Pending" | "Canceled",
}));

export default function TransactionPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const filteredTransactions = allTransactions.filter((tx) => {
    if (filter === "completed") return tx.status === "Complete";
    if (filter === "pending") return tx.status === "Pending";
    if (filter === "canceled") return tx.status === "Canceled";
    return true;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getCount = (type: FilterType): number => {
    if (type === "all") return allTransactions.length;
    if (type === "completed") return allTransactions.filter(t => t.status === "Complete").length;
    if (type === "pending") return allTransactions.filter(t => t.status === "Pending").length;
    if (type === "canceled") return allTransactions.filter(t => t.status === "Canceled").length;
    return 0;
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction</h1>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search data, users, or reports"
              className="pl-12 pr-6 py-3.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm w-72 lg:w-96 focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            />
          </div>
          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600">
            <Image src="/man.png" alt="Admin" width={40} height={40} className="object-cover w-full h-full" />
          </div>
        </div>
      </header>

      <main className="p-6 lg:p-8">
        {/* Top Stats + Payment Method Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          {/* Left + Middle - 4 stats cards (2 + 2) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Row 1 - Total Revenue + Completed Transactions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Revenue</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last 7 days</p>
                </div>
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex flex-wrap items-baseline gap-3">
                <p className="text-4xl font-bold text-[#4EA674]">₦105,045</p>
                <p className="text-lg font-bold text-[#4EA674] flex items-center gap-1">
                  ↑ 14.4%
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Completed Transactions</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last 7 days</p>
                </div>
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex flex-wrap items-baseline gap-3">
                <p className="text-4xl font-bold text-[#4EA674]">3,150</p>
                <p className="text-lg font-bold text-[#4EA674] flex items-center gap-1">
                  ↑ 20%
                </p>
              </div>
            </div>

            {/* Row 2 - Pending + Failed */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Transactions</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last 7 days</p>
                </div>
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex flex-wrap items-baseline gap-3">
                <p className="text-4xl font-bold text-[#4EA674]">150</p>
                <p className="text-lg font-bold text-[#4EA674] flex items-center gap-1">
                  85%
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed Transactions</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last 7 days</p>
                </div>
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex flex-wrap items-baseline gap-3">
                <p className="text-4xl font-bold text-[#F43443]">75</p>
                <p className="text-lg font-bold text-[#F43443] flex items-center gap-1">
                  15%
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Payment Method Card */}
<div className="lg:col-span-4">
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm h-full flex flex-col">
    <div className="flex justify-between items-start mb-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payment Method</h3>
      <MoreVertical className="w-5 h-5 text-gray-400" />
    </div>

    <div className="flex flex-col sm:flex-row gap-6 flex-1">
      {/* Left: Card Image */}
      <div className="relative w-full sm:w-64 h-40 sm:h-52 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
        <Image
          src="/atm.png"
          alt="Financi Card"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right: Card Information */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Status: <span className="text-[#4EA674] font-semibold">Active</span></p>
          </div>

          <div className="space-y-2 text-sm">
            <p><span className="text-gray-600 dark:text-gray-300">Transactions:</span> 1,250</p>
            <p><span className="text-gray-600 dark:text-gray-300">Revenue:</span> ₦500,000</p>
          </div>

          {/* Card details */}
          <div className="mt-4">
            <p className="text-xl font-mono tracking-wider text-gray-900 dark:text-white mb-1">
              •••• •••• •••• 2345
            </p>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Card Holder Name</p>
                <p className="font-medium text-gray-900 dark:text-white">Noman Manzoor</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Expiry Date</p>
                <p className="font-medium text-gray-900 dark:text-white">02/30</p>
              </div>
            </div>
          </div>
        </div>

        {/* View Transactions link */}
        <button className="mt-4 self-start text-[#4EA674] hover:underline text-sm font-medium">
          View Transactions
        </button>
      </div>
    </div>

    {/* Action Buttons - bottom, left & right aligned */}
    <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <button className="flex-1 px-5 py-3 bg-[#4EA674] text-white rounded-xl text-sm font-medium hover:bg-[#3D8B59] transition flex items-center justify-center gap-2">
        <span>+</span> Add Card
      </button>
      <button className="flex-1 px-5 py-3 border border-[#F43443] text-[#F43443] rounded-xl text-sm font-medium hover:bg-[#F43443] hover:text-white transition">
        Deactivate
      </button>
    </div>
  </div>
</div>
        </div>
        
        {/* Table Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => { setFilter("all"); setPage(1); }}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  filter === "all" ? "bg-[#C1E6BA] text-[#4EA674]" : "text-[#7C7C7C] hover:bg-[#EAF8E7]"
                }`}
              >
                All order ({getCount("all")})
              </button>
              <button
                onClick={() => { setFilter("completed"); setPage(1); }}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  filter === "completed" ? "bg-[#C1E6BA] text-[#4EA674]" : "text-[#7C7C7C] hover:bg-[#EAF8E7]"
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => { setFilter("pending"); setPage(1); }}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  filter === "pending" ? "bg-[#C1E6BA] text-[#4EA674]" : "text-[#7C7C7C] hover:bg-[#EAF8E7]"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => { setFilter("canceled"); setPage(1); }}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  filter === "canceled" ? "bg-[#C1E6BA] text-[#4EA674]" : "text-[#7C7C7C] hover:bg-[#EAF8E7]"
                }`}
              >
                Canceled
              </button>
            </div>

            <div className="relative w-full lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search payment history"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/20"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead className="bg-[#EAF8E7]">
                <tr className="text-left text-[#4EA674] font-medium">
                  <th className="px-6 py-4 rounded-l-xl">Customer Id</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginatedTransactions.map((tx, i) => {
                  const rowNumber = (page - 1) * itemsPerPage + i + 1;
                  return (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-5 font-medium text-gray-900 dark:text-white">#{tx.id}</td>
                      <td className="px-6 py-5 text-gray-900 dark:text-white">{tx.name}</td>
                      <td className="px-6 py-5 text-gray-600 dark:text-gray-300">{tx.date}</td>
                      <td className="px-6 py-5 text-gray-900 dark:text-white font-medium">₦{tx.total}</td>
                      <td className="px-6 py-5 text-gray-900 dark:text-white">{tx.method}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                          tx.status === "Complete" ? "bg-[#EAF8E7] text-[#4EA674]" :
                          tx.status === "Pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            tx.status === "Complete" ? "bg-[#4EA674]" :
                            tx.status === "Pending" ? "bg-yellow-700" :
                            "bg-red-700"
                          }`} />
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <button className="text-[#4EA674] hover:underline text-sm font-medium">
                          View Details
                        </button>
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
    </>
  );
}