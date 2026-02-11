'use client';

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Search,
  Bell,
  MoreVertical,
  Sun,
  ChevronLeft,
  ChevronRight,
  Moon,
  Plus,
  Loader2,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { api } from "@/lib/apiClient";

type FilterType = "all" | "completed" | "pending" | "canceled";

interface Transaction {
  id: string;
  customer_id: string;
  customer_name: string;
  date: string;
  total: number;
  payment_method: string;
  status: "Complete" | "Pending" | "Canceled";
}

interface TransactionStats {
  totalRevenue: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  totalRevenueChange: string;
  completedChange: string;
  pendingPercent: string;
  failedPercent: string;
}

// ---------- Custom Hooks ----------
const useTransactionStats = () => {
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.transactions.stats();
      setStats(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load transaction statistics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

const useTransactions = (page: number, limit: number, filter: FilterType, search: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(filter !== "all" && { status: filter }),
          ...(debouncedSearch && { search: debouncedSearch }),
        });
        const data = await api.transactions.list(params);
        setTransactions(data.transactions || []);
        setTotal(data.total || 0);
      } catch (err: any) {
        setError(err?.message || "Failed to load transactions");
        setTransactions([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [page, limit, filter, debouncedSearch]);

  return { transactions, total, loading, error };
};

// ---------- Helpers ----------
const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

// ---------- Loading Skeletons ----------
const StatCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
      <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
    <div className="flex items-baseline gap-3">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
    </div>
  </div>
);

const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-4 sm:px-6 py-5"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
    <td className="px-4 sm:px-6 py-5"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
    <td className="px-4 sm:px-6 py-5"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
    <td className="px-4 sm:px-6 py-5"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
    <td className="px-4 sm:px-6 py-5"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
    <td className="px-4 sm:px-6 py-5"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div></td>
    <td className="px-4 sm:px-6 py-5"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
  </tr>
);

// ---------- Main Page ----------
export default function TransactionPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // UI State
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  // Toast message
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Data
  const { stats, loading: statsLoading, error: statsError } = useTransactionStats();
  const {
    transactions,
    total,
    loading: transactionsLoading,
    error: transactionsError,
  } = useTransactions(page, itemsPerPage, filter, searchQuery);

  const totalPages = Math.ceil(total / itemsPerPage);

  // Clear message after 5s
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Show errors in toast
  useEffect(() => {
    if (statsError) setMessage({ type: "error", text: statsError });
  }, [statsError]);

  useEffect(() => {
    if (transactionsError) setMessage({ type: "error", text: transactionsError });
  }, [transactionsError]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset page when filter or search changes
  useEffect(() => {
    setPage(1);
  }, [filter, searchQuery]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4EA674]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* ---------- Header (exact original) ---------- */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Transaction</h1>

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
              placeholder="Search data, users, or reports"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm w-64 lg:w-96 focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            />
          </div>

          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

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
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
              autoFocus
            />
          </div>
        </div>
      )}

      <main className="p-6 lg:p-8 bg-gray-50 dark:bg-gray-950">
        {/* Toast Message */}
        {message && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm border flex justify-between items-center ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300"
                : "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300"
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats + Payment Method Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          {/* Stats Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {statsLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                {/* Total Revenue */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Revenue</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last 7 days</p>
                    </div>
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <p className="text-4xl font-bold text-[#4EA674]">
                      {stats ? formatCurrency(stats.totalRevenue) : '₦105,045'}
                    </p>
                    <p className="text-lg font-bold text-[#4EA674] flex items-center gap-1">
                      {stats?.totalRevenueChange || '↑ 14.4%'}
                    </p>
                  </div>
                </div>

                {/* Completed Transactions */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Completed Transactions</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last 7 days</p>
                    </div>
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <p className="text-4xl font-bold text-[#4EA674]">
                      {stats?.completedCount?.toLocaleString() || '3,150'}
                    </p>
                    <p className="text-lg font-bold text-[#4EA674] flex items-center gap-1">
                      {stats?.completedChange || '↑ 20%'}
                    </p>
                  </div>
                </div>

                {/* Pending Transactions */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Transactions</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last 7 days</p>
                    </div>
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <p className="text-4xl font-bold text-[#4EA674]">
                      {stats?.pendingCount?.toLocaleString() || '150'}
                    </p>
                    <p className="text-lg font-bold text-[#4EA674] flex items-center gap-1">
                      {stats?.pendingPercent || '85%'}
                    </p>
                  </div>
                </div>

                {/* Failed Transactions */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed Transactions</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last 7 days</p>
                    </div>
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <p className="text-4xl font-bold text-[#F43443]">
                      {stats?.failedCount?.toLocaleString() || '75'}
                    </p>
                    <p className="text-lg font-bold text-[#F43443] flex items-center gap-1">
                      {stats?.failedPercent || '15%'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Payment Method Card – STATIC (same as original) */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm h-full flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payment Method</h3>
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex flex-col sm:flex-row gap-6 flex-1">
                <div className="relative w-full sm:w-64 h-40 sm:h-52 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                  <Image
                    src="/atm.png"
                    alt="Financi Card"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Status: <span className="text-[#4EA674] font-semibold">Active</span>
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600 dark:text-gray-300">Transactions:</span> 1,250</p>
                      <p><span className="text-gray-600 dark:text-gray-300">Revenue:</span> ₦500,000</p>
                    </div>
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
                  <button className="mt-4 self-start text-[#4EA674] hover:underline text-sm font-medium">
                    View Transactions
                  </button>
                </div>
              </div>
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Top Filter + Search Bar */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto">
                <button
                  onClick={() => { setFilter("all"); setPage(1); }}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    filter === "all" ? "bg-[#EAF8E7] text-[#4EA674] shadow-sm" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  All order ({total})
                </button>
                <button
                  onClick={() => { setFilter("completed"); setPage(1); }}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    filter === "completed" ? "bg-[#EAF8E7] text-[#4EA674] shadow-sm" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => { setFilter("pending"); setPage(1); }}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    filter === "pending" ? "bg-[#EAF8E7] text-[#4EA674] shadow-sm" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => { setFilter("canceled"); setPage(1); }}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    filter === "canceled" ? "bg-[#EAF8E7] text-[#4EA674] shadow-sm" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  Canceled
                </button>
              </div>

              {/* Right side: Search + Icons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                {/* Search input */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search payment history"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/20"
                  />
                </div>

                {/* Action icons */}
                <div className="flex items-center justify-end sm:justify-center gap-2 sm:gap-3">
                  <button className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                    <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </button>
                  <button className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                    <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead className="bg-[#EAF8E7]">
                <tr className="text-left text-[#4EA674] font-medium">
                  <th className="px-4 sm:px-6 py-4 rounded-l-xl">Customer Id</th>
                  <th className="px-4 sm:px-6 py-4">Name</th>
                  <th className="px-4 sm:px-6 py-4">Date</th>
                  <th className="px-4 sm:px-6 py-4">Total</th>
                  <th className="px-4 sm:px-6 py-4">Method</th>
                  <th className="px-4 sm:px-6 py-4">Status</th>
                  <th className="px-4 sm:px-6 py-4 rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {transactionsLoading ? (
                  Array.from({ length: itemsPerPage }).map((_, i) => <TableRowSkeleton key={i} />)
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-600 dark:text-gray-400">
                      {searchQuery || filter !== "all"
                        ? "No transactions match your criteria"
                        : "No transactions yet"}
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx, i) => {
                    const rowNumber = (page - 1) * itemsPerPage + i + 1;
                    return (
                      <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 sm:px-6 py-5 font-medium text-gray-900 dark:text-white">#{tx.customer_id}</td>
                        <td className="px-4 sm:px-6 py-5 text-gray-900 dark:text-white">{tx.customer_name}</td>
                        <td className="px-4 sm:px-6 py-5 text-gray-600 dark:text-gray-300">{tx.date}</td>
                        <td className="px-4 sm:px-6 py-5 text-gray-900 dark:text-white font-medium">{formatCurrency(tx.total)}</td>
                        <td className="px-4 sm:px-6 py-5 text-gray-900 dark:text-white">{tx.payment_method}</td>
                        <td className="px-4 sm:px-6 py-5">
                          <span className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${
                            tx.status === "Complete" ? "bg-[#EAF8E7] text-[#4EA674]" :
                            tx.status === "Pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}>
                            <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                              tx.status === "Complete" ? "bg-[#4EA674]" :
                              tx.status === "Pending" ? "bg-yellow-700" :
                              "bg-red-700"
                            }`} />
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-5">
                          <button className="text-[#4EA674] hover:underline text-xs sm:text-sm font-medium">
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 sm:mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1 || transactionsLoading}
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
                      disabled={transactionsLoading}
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
                disabled={page === totalPages || transactionsLoading}
                className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}