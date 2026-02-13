'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Bell,
  MoreVertical,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Loader2,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ---------- React Query Hooks ----------
import { 
  useAdminCustomers, 
  useCustomerStats, 
  useDeleteCustomer 
} from '@/hooks/useAdminCustomers';
import { AdminCustomer, CustomerStats } from '@/types';

// ---------- Chart Data (static) ----------
const weeklyData = [
  { day: 'Sun', visitors: 20000 },
  { day: 'Mon', visitors: 22000 },
  { day: 'Tue', visitors: 30000 },
  { day: 'Wed', visitors: 28000 },
  { day: 'Thu', visitors: 25409 },
  { day: 'Fri', visitors: 24000 },
  { day: 'Sat', visitors: 26000 },
];

// ---------- Helpers ----------
const formatCurrency = (amount: number | undefined | null) => {
  if (amount === undefined || amount === null) return '$0';
  return `$${amount.toLocaleString()}`;
};

// ---------- Loading Skeletons ----------
const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-5"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>
    <td className="px-6 py-5"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" /></td>
    <td className="px-6 py-5"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" /></td>
    <td className="px-6 py-5"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" /></td>
    <td className="px-6 py-5"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>
    <td className="px-6 py-5"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24" /></td>
    <td className="px-6 py-5"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>
  </tr>
);

const MobileCardSkeleton = () => (
  <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
      </div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
    </div>
  </div>
);

// ---------- Main Component ----------
export default function CustomersPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
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

  // ---------- Reset page when search changes ----------
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // ---------- React Query ----------
  const {
    data: customersData,
    isLoading: customersLoading,
    error: customersError,
    refetch: refetchCustomers,
  } = useAdminCustomers(page, itemsPerPage, debouncedSearch);

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useCustomerStats();

  const deleteCustomer = useDeleteCustomer();

  const customers = customersData?.customers || [];
  const total = customersData?.total || 0;
  const totalPages = Math.ceil(total / itemsPerPage);

  // ---------- Error Handling ----------
  useEffect(() => {
    if (customersError) setMessage({ type: 'error', text: 'Failed to load customers' });
  }, [customersError]);

  useEffect(() => {
    if (statsError) setMessage({ type: 'error', text: 'Failed to load customer statistics' });
  }, [statsError]);

  // ---------- Auto-dismiss Toast ----------
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ---------- Delete Handler ----------
  const handleDelete = async (userId: number, customerName: string) => {
    if (!confirm(`Are you sure you want to delete ${customerName}?`)) return;
    try {
      await deleteCustomer.mutateAsync(userId);
      setMessage({ type: 'success', text: 'Customer deleted successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to delete customer' });
    }
  };

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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>

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
              placeholder="Search customers..."
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

      {/* Mobile search */}
      {showSearch && (
        <div className="md:hidden px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
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

        {/* Stats & Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          <div className="lg:col-span-4 space-y-5">
            {statsLoading ? (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              </>
            ) : (
              <>
                {/* Total Customers */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Total Customers</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Last 7 days</p>
                    </div>
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <p className="text-3xl lg:text-4xl font-bold text-[#4EA674]">
                      {stats?.totalCustomers?.toLocaleString() ?? '11,040'}
                    </p>
                    <p className="text-base font-bold text-[#4EA674] flex items-center gap-1">
                      {stats?.totalCustomersChange ?? '↑ 14.4%'}
                    </p>
                  </div>
                </div>

                {/* New Customers */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">New Customers</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Last 7 days</p>
                    </div>
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <p className="text-3xl lg:text-4xl font-bold text-[#4EA674]">
                      {stats?.newCustomers?.toLocaleString() ?? '2,370'}
                    </p>
                    <p className="text-base font-bold text-[#4EA674] flex items-center gap-1">
                      {stats?.newCustomersChange ?? '↑ 20%'}
                    </p>
                  </div>
                </div>

                {/* Visitor */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Visitor</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Last 7 days</p>
                    </div>
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <p className="text-3xl lg:text-4xl font-bold text-[#4EA674]">
                      {stats?.visitors?.toLocaleString() ?? '250k'}
                    </p>
                    <p className="text-base font-bold text-[#4EA674] flex items-center gap-1">
                      {stats?.visitorsChange ?? '↑ 20%'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Customer Overview Chart */}
          <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Customer Overview</h3>
              <div className="flex items-center gap-2">
                <button className="px-4 py-1.5 bg-[#C1E6BA] text-[#4EA674] rounded-full text-sm font-medium">
                  This week
                </button>
                <button className="px-4 py-1.5 text-[#7C7C7C] rounded-full text-sm font-medium hover:bg-[#EAF8E7] transition">
                  Last week
                </button>
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8 text-center">
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.activeCustomers?.toLocaleString() ?? '25k'}
                </p>
                <p className="text-xs lg:text-sm text-[#7C7C7C] mt-1">Active Customers</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.repeatCustomers?.toLocaleString() ?? '5.6k'}
                </p>
                <p className="text-xs lg:text-sm text-[#7C7C7C] mt-1">Repeat Customers</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.shopVisitors?.toLocaleString() ?? '250k'}
                </p>
                <p className="text-xs lg:text-sm text-[#7C7C7C] mt-1">Shop Visitor</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.conversionRate?.toFixed(1) ?? '5.5'}%
                </p>
                <p className="text-xs lg:text-sm text-[#7C7C7C] mt-1">Conversion Rate</p>
              </div>
            </div>

            {/* Chart */}
            <div style={{ width: '100%', height: 320, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="visitorFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C1E6BA" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#C1E6BA" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#7C7C7C', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: '#7C7C7C', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#EAF8E7',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '10px 14px',
                    }}
                    labelStyle={{ color: '#4EA674', fontWeight: 'bold' }}
                    formatter={(value) => [
                      value != null ? `${(Number(value) / 1000).toFixed(1)}k` : '0k',
                      'Visitors',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#4EA674"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#visitorFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Customers List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead className="bg-[#EAF8E7]">
                <tr className="text-left text-[#4EA674] font-medium">
                  <th className="px-6 py-4 rounded-l-xl">Customer Id</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Order Count</th>
                  <th className="px-6 py-4">Total Spend</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {customersLoading ? (
                  Array.from({ length: itemsPerPage }).map((_, i) => <TableRowSkeleton key={i} />)
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-600 dark:text-gray-400">
                      {searchQuery ? 'No customers match your search' : 'No customers yet'}
                    </td>
                  </tr>
                ) : (
                  customers.map((customer: AdminCustomer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-5 font-medium text-gray-900 dark:text-white">
                        <Link href={`/admin/customers/${customer.user_id || customer.id}`} className="hover:text-[#4EA674]">
                          #{customer.id}
                        </Link>
                      </td>
                      <td className="px-6 py-5 text-gray-900 dark:text-white">
                        <Link href={`/admin/customers/${customer.user_id || customer.id}`} className="hover:text-[#4EA674]">
                          {customer.name}
                        </Link>
                      </td>
                      <td className="px-6 py-5 text-gray-600 dark:text-gray-300">{customer.phone}</td>
                      <td className="px-6 py-5 text-gray-900 dark:text-white">{customer.orders_count}</td>
                      <td className="px-6 py-5 text-gray-900 dark:text-white font-medium">
                        {formatCurrency(customer.total_spent)}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                            customer.status === 'Active'
                              ? 'bg-[#EAF8E7] text-[#4EA674]'
                              : customer.status === 'VIP'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              customer.status === 'Active'
                                ? 'bg-[#4EA674]'
                                : customer.status === 'VIP'
                                ? 'bg-yellow-700'
                                : 'bg-red-700'
                            }`}
                          />
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {/* Open message/compose */}}
                            className="text-gray-500 hover:text-[#4EA674] transition"
                          >
                            <MessageSquare className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.user_id || Number(customer.id), customer.name)}
                            disabled={deleteCustomer.isPending}
                            className="text-gray-500 hover:text-[#F43443] transition disabled:opacity-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {customersLoading ? (
              Array.from({ length: 3 }).map((_, i) => <MobileCardSkeleton key={i} />)
            ) : customers.length === 0 ? (
              <div className="py-8 text-center text-gray-600 dark:text-gray-400">
                {searchQuery ? 'No customers match your search' : 'No customers yet'}
              </div>
            ) : (
              customers.map((customer: AdminCustomer) => (
                <div
                  key={customer.id}
                  className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Link href={`/admin/customers/${customer.user_id || customer.id}`} className="hover:text-[#4EA674]">
                        <p className="font-medium text-gray-900 dark:text-white">#{customer.id}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{customer.name}</p>
                      </Link>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        customer.status === 'Active'
                          ? 'bg-[#EAF8E7] text-[#4EA674]'
                          : customer.status === 'VIP'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {customer.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{customer.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Orders</p>
                      <p className="font-medium text-gray-900 dark:text-white">{customer.orders_count}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Spend</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(customer.total_spent)}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button className="text-gray-500 hover:text-[#4EA674] transition">
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer.user_id || Number(customer.id), customer.name)}
                      disabled={deleteCustomer.isPending}
                      className="text-gray-500 hover:text-[#F43443] transition disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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
                disabled={page === 1 || customersLoading}
                className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 7) {
                    if (page <= 4) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      if (i === 0) pageNum = 1;
                      else if (i === 1) return <span key="dots-left" className="px-2 py-1 text-gray-400">...</span>;
                      else if (i === 5) return <span key="dots-right" className="px-2 py-1 text-gray-400">...</span>;
                      else if (i === 6) pageNum = totalPages;
                      else pageNum = page - 3 + i;
                    }
                  }
                  if (pageNum > totalPages || pageNum < 1) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      disabled={customersLoading}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium min-w-[36px] ${
                        page === pageNum
                          ? 'bg-[#C1E6BA] text-[#4EA674] font-bold'
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
                disabled={page === totalPages || customersLoading}
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