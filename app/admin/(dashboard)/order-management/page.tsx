'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  MoreVertical,
  Truck,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  SlidersHorizontal,
  ArrowDownToLine,
  MoreHorizontal,
  Loader2,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';

// ---------- React Query Hooks ----------
import { useOrderStats } from '@/hooks/useOrderStats';
import { useOrders } from '@/hooks/useOrders';
import { OrderListItem, OrderStats } from '@/types';

// ---------- Types ----------
type FilterType = 'all' | 'completed' | 'pending' | 'canceled';

// ---------- Helpers ----------
const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

// ---------- Loading Skeletons ----------
const StatCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm animate-pulse">
    <div className="flex justify-between items-start mb-2 sm:mb-4">
      <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 sm:w-28"></div>
      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
    <div className="flex items-end gap-2">
      <div className="h-7 sm:h-9 bg-gray-200 dark:bg-gray-700 rounded w-16 sm:w-20"></div>
      <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded w-14 sm:w-16"></div>
    </div>
    <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 sm:w-24 mt-1"></div>
  </div>
);

const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-5"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-6"></div></td>
    <td className="px-6 py-5"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
    <td className="px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </div>
    </td>
    <td className="px-6 py-5"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
    <td className="px-6 py-5"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
    <td className="px-6 py-5"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
    <td className="px-6 py-5"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div></td>
  </tr>
);

const MobileCardSkeleton = () => (
  <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
      </div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-1"></div><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></div>
      <div><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-1"></div><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></div>
      <div><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-1"></div><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></div>
    </div>
  </div>
);

// ---------- Main Page ----------
export default function OrderManagementPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // ---------- Local State ----------
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const itemsPerPage = 10;

  // ---------- Debounce Search ----------
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ---------- Reset page when filter or search changes ----------
  useEffect(() => {
    setPage(1);
  }, [filter, debouncedSearch]);

  // ---------- React Query ----------
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useOrderStats();

  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useOrders(page, itemsPerPage, filter, debouncedSearch);

const orders = (ordersData?.orders || []) as OrderListItem[];
  const total = ordersData?.total || 0;
  const totalPages = Math.ceil(total / itemsPerPage);

  // ---------- Error Handling ----------
  useEffect(() => {
    if (statsError) {
      setMessage({ type: 'error', text: 'Failed to load order statistics' });
    }
  }, [statsError]);

  useEffect(() => {
    if (ordersError) {
      setMessage({ type: 'error', text: 'Failed to load orders' });
    }
  }, [ordersError]);

  // ---------- Auto-dismiss Toast ----------
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ---------- Mount ----------
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4EA674]" />
      </div>
    );
  }

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
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle dark mode"
          >
            <Sun
              className={`h-5 w-5 text-yellow-500 transition-all duration-300 ${
                theme === 'dark' ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
              }`}
            />
            <Moon
              className={`absolute inset-0 m-auto h-5 w-5 text-blue-400 transition-all duration-300 ${
                theme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'
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
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
              autoFocus
            />
          </div>
        </div>
      )}

      <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-gray-50 dark:bg-gray-950">
        {/* Toast Message */}
        {message && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm border flex justify-between items-center ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300'
                : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300'
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Order List title + actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Order List</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/order/add')}
              className="px-5 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#3D8B59] transition-colors"
            >
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
          {statsLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">Total Orders</h3>
                  <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    {stats?.totalOrders?.toLocaleString() ?? '1,240'}
                  </p>
                  <p className="text-sm sm:text-lg font-bold text-[#4EA674]">
                    {stats?.totalOrdersChange ?? '↑ 14.4%'}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Last 7 days</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">New Orders</h3>
                  <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    {stats?.newOrders?.toLocaleString() ?? '240'}
                  </p>
                  <p className="text-sm sm:text-lg font-bold text-[#4EA674]">
                    {stats?.newOrdersChange ?? '↑ 20%'}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Last 7 days</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">Completed</h3>
                  <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    {stats?.completedOrders?.toLocaleString() ?? '960'}
                  </p>
                  <p className="text-sm sm:text-lg font-bold text-[#4EA674]">
                    {stats?.completedPercent ?? '85%'}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Last 7 days</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">Canceled</h3>
                  <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    {stats?.canceledOrders?.toLocaleString() ?? '87'}
                  </p>
                  <p className="text-sm sm:text-lg font-bold text-[#F43443]">
                    {stats?.canceledChange ?? '↓ 5%'}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Last 7 days</p>
              </div>
            </>
          )}
        </div>

        {/* Main content card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          {/* Top bar - Search + Icons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:max-w-md lg:max-w-lg flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search order report"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
              />
            </div>

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
            {(['all', 'completed', 'pending', 'canceled'] as FilterType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  filter === type
                    ? 'bg-[#C1E6BA] text-[#4EA674]'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {type === 'all' ? `All (${total})` : type.charAt(0).toUpperCase() + type.slice(1)}
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
                {ordersLoading ? (
                  Array.from({ length: itemsPerPage }).map((_, i) => <TableRowSkeleton key={i} />)
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-600 dark:text-gray-400">
                      {searchQuery || filter !== 'all'
                        ? 'No orders match your criteria'
                        : 'No orders yet'}
                    </td>
                  </tr>
                ) : (
                  orders.map((order, i) => {
                    const rowNumber = (page - 1) * itemsPerPage + i + 1;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-5 font-medium text-gray-900 dark:text-white">{rowNumber}</td>
                        <td className="px-6 py-5 font-medium text-gray-900 dark:text-white">#{order.order_id}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <Image
                              src={order.product_image || '/solarpanel.png'}
                              alt={order.product_name}
                              width={40}
                              height={40}
                              className="rounded-lg object-cover"
                              unoptimized
                            />
                            <span className="text-gray-900 dark:text-white line-clamp-1">{order.product_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-gray-600 dark:text-gray-300">{order.date}</td>
                        <td className="px-6 py-5 font-medium text-gray-900 dark:text-white">
                          {formatCurrency(order.price)}
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`font-medium ${
                              order.payment_status === 'Paid' ? 'text-[#4EA674]' : 'text-[#F43443]'
                            }`}
                          >
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                              order.order_status === 'Delivered' || order.order_status === 'Shipped'
                                ? 'bg-[#7aeb60] text-[#05130b]'
                                : order.order_status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                            }`}
                          >
                            <Truck className="w-4 h-4" />
                            {order.order_status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {ordersLoading ? (
              Array.from({ length: 3 }).map((_, i) => <MobileCardSkeleton key={i} />)
            ) : orders.length === 0 ? (
              <div className="py-8 text-center text-gray-600 dark:text-gray-400">
                {searchQuery || filter !== 'all' ? 'No orders match your criteria' : 'No orders yet'}
              </div>
            ) : (
              orders.map((order, i) => (
                <div
                  key={order.id}
                  className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={order.product_image || '/solarpanel.png'}
                        alt={order.product_name}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover"
                        unoptimized
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">#{order.order_id}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{order.product_name}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.order_status === 'Delivered' || order.order_status === 'Shipped'
                          ? 'bg-[#EAF8E7] text-[#4EA674]'
                          : order.order_status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                      }`}
                    >
                      {order.order_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">{order.date}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Price</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(order.price)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Payment</p>
                      <p
                        className={`font-medium ${
                          order.payment_status === 'Paid' ? 'text-[#4EA674]' : 'text-[#F43443]'
                        }`}
                      >
                        {order.payment_status}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 sm:mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || ordersLoading}
                className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      disabled={ordersLoading}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium min-w-[36px] ${
                        page === pageNum
                          ? 'bg-[#C1E6BA] text-[#4EA674]'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || ordersLoading}
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