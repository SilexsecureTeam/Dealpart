'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from 'next-themes';

const weeklyData = [
  { day: 'Sun', sales: 12000 },
  { day: 'Mon', sales: 19000 },
  { day: 'Tue', sales: 25000 },
  { day: 'Wed', sales: 22000 },
  { day: 'Thu', sales: 14000 },
  { day: 'Fri', sales: 18000 },
  { day: 'Sat', sales: 21000 },
];

const transactions = [
  { id: '6545', date: '01 Oct | 11:29 am', status: 'Paid', amount: '₦64' },
  { id: '5412', date: '01 Oct | 11:29 am', status: 'Pending', amount: '₦557' },
  { id: '6622', date: '01 Oct | 11:29 am', status: 'Paid', amount: '₦156' },
  { id: '6462', date: '01 Oct | 11:29 am', status: 'Paid', amount: '₦265' },
  { id: '6462', date: '01 Oct | 11:29 am', status: 'Paid', amount: '₦265' },
];

const bestSelling = [
  { name: 'Monocrystalle Panel', orders: 104, status: 'Stock', price: '₦999.00' },
  { name: 'Monocrystalle Panel', orders: 56, status: 'Stock out', price: '₦999.00' },
  { name: 'Monocrystalle Panel', orders: 266, status: 'Stock', price: '₦999.00' },
  { name: 'Monocrystalle Panel', orders: 506, status: 'Stock', price: '₦999.00' },
];

const topProducts = [
  { name: 'Monocrystalle Panel', item: '#FXZ-4567', price: '₦999.00' },
  { name: 'Monocrystalle Panel', item: '#FXZ-4567', price: '₦724.00' },
  { name: 'Monocrystalle Panel', item: '#FXZ-4567', price: '₦345.00' },
  { name: 'Monocrystalle Panel', item: '#FXZ-4567', price: '₦800.00' },
];

export default function AdminDashboard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Header - full width, starts right after sidebar (handled by layout) */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search data, users, or reports"
              className="pl-12 pr-6 py-3.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm w-72 lg:w-96 focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            />
          </div>
          <button className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Bell */}
          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Dark mode toggle */}
          {!mounted ? (
            <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-700" />
          ) : (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
          )}

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600">
            <Image src="/man.png" alt="Admin" width={40} height={40} className="object-cover w-full h-full" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-gray-50 dark:bg-gray-950">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Sales */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">Total Sales</h3>
                <p className="text-sm text-[#7C7C7C] dark:text-gray-400 mt-1">Last 7 days</p>
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="mb-6">
              <div className="flex items-end gap-4">
                <p className="text-4xl font-bold text-[#4EA674]">₦350K</p>
                <p className="text-lg font-bold text-[#4EA674] flex items-center gap-1 pb-1">↑ 10.4%</p>
              </div>
              <p className="text-sm text-[#7C7C7C] dark:text-gray-400 mt-2">Previous 7days ($235)</p>
            </div>
            <button className="w-full py-3 border border-[#4EA674] text-[#4EA674] rounded-full text-sm font-bold hover:bg-[#4EA674] hover:text-white transition-all">
              Details
            </button>
          </div>

          {/* Total Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">Total Orders</h3>
                <p className="text-sm text-[#7C7C7C] dark:text-gray-400 mt-1">Last 7 days</p>
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="mb-6">
              <div className="flex items-end gap-4">
                <p className="text-4xl font-bold text-[#4EA674]">10.7K</p>
                <p className="text-lg font-bold text-[#4EA674] flex items-center gap-1 pb-1">↑ 14.4%</p>
              </div>
              <p className="text-sm text-[#7C7C7C] dark:text-gray-400 mt-2">Previous 7days (7.6k)</p>
            </div>
            <button className="w-full py-3 border border-[#4EA674] text-[#4EA674] rounded-full text-sm font-bold hover:bg-[#4EA674] hover:text-white transition-all">
              Details
            </button>
          </div>

          {/* Pending & Canceled */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">Pending & Canceled</h3>
                <p className="text-sm text-[#7C7C7C] dark:text-gray-400 mt-1">Last 7 days</p>
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Pending</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-4xl font-bold text-[#4EA674]">509</p>
                  <p className="text-lg font-medium text-[#4EA674]">user 204</p>
                </div>
              </div>
              <div className="border-l border-gray-200 dark:border-gray-700 pl-8">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Canceled</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-[#F43443]">94</p>
                  <p className="text-lg font-bold text-[#F43443] flex items-center gap-1">↓ 14.4%</p>
                </div>
              </div>
            </div>
            <button className="w-full py-3 border border-[#4EA674] text-[#4EA674] rounded-full text-sm font-bold  hover:bg-[#4EA674] hover:text-white transition-all">
              Details
            </button>
          </div>
        </div>

        {/* Weekly Report + Live Users */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weekly Report */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h3 className="text-xl font-bold">Report for this week</h3>
              <div className="flex items-center gap-2">
                <button className="px-5 py-2.5 bg-[#C1E6BA] text-[#4EA674] rounded-full text-sm font-bold">
                  This week
                </button>
                <button className="px-5 py-2.5 bg-[#EAF8E7] text-[#7C7C7C] rounded-full text-sm font-medium hover:bg-[#C1E6BA] hover:text-[#4EA674] transition-colors">
                  Last week
                </button>
                <MoreVertical className="w-5 h-5 text-gray-400 ml-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 mb-10 text-center">
              {[
                { value: '52K', label: 'Customers', highlighted: true },
                { value: '3.5k', label: 'Total Products' },
                { value: '2.5k', label: 'Stock Products' },
                { value: '0.5k', label: 'Out of Stock' },
                { value: '250K', label: 'Revenue' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className={`text-3xl font-bold ${stat.highlighted ? 'text-[#4EA674]' : 'text-gray-900 dark:text-white'}`}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-[#7C7C7C] dark:text-gray-400 mt-1">{stat.label}</p>
                  {stat.highlighted && <div className="h-1 bg-[#4EA674] rounded-full mt-2 w-16 mx-auto" />}
                </div>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C1E6BA" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#C1E6BA" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#7C7C7C', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#7C7C7C', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#EAF8E7', border: 'none', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  labelStyle={{ color: '#4EA674', fontWeight: 'bold' }}
                  formatter={(value) => [`${(Number(value) / 1000).toFixed(1)}k`, 'Sales']}
                />
                <Area type="monotone" dataKey="sales" stroke="#4EA674" strokeWidth={3} fillOpacity={1} fill="url(#colorFill)" dot={{ fill: '#4EA674', r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Live Users + Sales by Country */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="mb-10">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Users in last 30 minutes</p>
              <p className="text-4xl font-bold mb-6">21.5K</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Users per minute</p>
              <div className="flex items-end gap-1 h-24">
                {[30, 35, 32, 40, 25, 28, 30, 22, 35, 38, 45, 42, 50, 48, 45, 40, 42, 48, 52, 50].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#4EA674] rounded-t-md" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 my-8" />

            <div className="relative overflow-hidden -mx-6 -mb-6 px-6 pb-6 rounded-b-2xl bg-gray-50 dark:bg-gray-900/30">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-bold">Sales by Country</h4>
                  <span className="text-sm text-[#7C7C7C]">Sales</span>
                </div>
                {[
                  { flag: 'us', country: 'US', sales: '30K', width: '100%', change: '+25.8%', up: true },
                  { flag: 'br', country: 'Brazil', sales: '30K', width: '85%', change: '15.8%', up: false },
                  { flag: 'au', country: 'Australia', sales: '25K', width: '70%', change: '+35.8%', up: true },
                ].map((c) => (
                  <div key={c.country} className="flex items-center gap-4 mb-5 last:mb-0">
                    <img src={`https://flagcdn.com/w80/${c.flag}.png`} alt={c.country} className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700" />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-semibold">{c.country}</span>
                        <span className="text-[#7C7C7C]">{c.sales}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#646FF2] to-[#8B75F6] rounded-full" style={{ width: c.width }} />
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${c.up ? 'text-[#4EA674]' : 'text-[#F43443]'}`}>
                      {c.up ? '↑' : '↓'} {c.change}
                    </span>
                  </div>
                ))}
                <button className="w-full mt-8 py-3.5 border border-[#4EA674] text-[#4EA674] rounded-full text-sm font-bold hover:bg-[#4EA674] hover:text-white transition-colors">
                  View Insight
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Transaction + Best Selling */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Transaction */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">Transaction</h3>
                <button className="px-5 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#3D8B59] transition-colors">
                  Filter
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-6 font-medium">No</th>
                      <th className="pb-6 font-medium">Id Customer</th>
                      <th className="pb-6 font-medium">Order Date</th>
                      <th className="pb-6 font-medium">Status</th>
                      <th className="pb-6 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {transactions.map((t, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="py-6 text-gray-600 dark:text-gray-300">{i + 1}.</td>
                        <td className="py-6 font-semibold">#{t.id}</td>
                        <td className="py-6 text-gray-600 dark:text-gray-300">{t.date}</td>
                        <td className="py-6">
                          <div className="flex items-center gap-3">
                            <span className={`w-3 h-3 rounded-full ${t.status === 'Paid' ? 'bg-[#4EA674]' : 'bg-[#F0D411]'}`} />
                            <span className={`font-medium text-base ${t.status === 'Paid' ? 'text-[#4EA674]' : 'text-[#F0D411]'}`}>{t.status}</span>
                          </div>
                        </td>
                        <td className="py-6 text-right font-bold text-base">{t.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8">
                <button className="w-full py-3.5 border border-[#4EA674] text-[#4EA674] rounded-full text-sm font-bold hover:bg-gradient-to-r hover:from-[#646FF2] hover:to-[#8B75F6] hover:text-white transition-all">
                  Details
                </button>
              </div>
            </div>

            {/* Best Selling Product */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Best selling product</h3>
                <button className="px-5 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#3D8B59] transition-colors">
                  Filter
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead className="border-b border-gray-200 dark:border-gray-700">
                    <tr className="text-left text-gray-500 dark:text-gray-400">
                      <th className="pb-5 font-medium">PRODUCT</th>
                      <th className="pb-5 font-medium">TOTAL ORDER</th>
                      <th className="pb-5 font-medium">STATUS</th>
                      <th className="pb-5 font-medium text-right">PRICE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {bestSelling.map((p, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="py-6 flex items-center gap-4">
                          <Image
                            src="/solarpanel.png"
                            alt={p.name}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover flex-shrink-0"
                            unoptimized
                          />
                          <span className="font-medium">{p.name}</span>
                        </td>
                        <td className="py-6 text-gray-700 dark:text-gray-300">{p.orders}</td>
                        <td className="py-6">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                            p.status === 'Stock' ? 'bg-[#EAF8E7] text-[#4EA674]' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${p.status === 'Stock' ? 'bg-[#4EA674]' : 'bg-red-600'}`} />
                            {p.status === 'Stock' ? 'Stock' : 'Stock out'}
                          </span>
                        </td>
                        <td className="py-6 text-right font-bold">{p.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8">
                <button className="w-full py-3.5 border border-[#4EA674] text-[#4EA674] rounded-full text-sm font-bold hover:bg-[#4EA674] hover:text-white transition-all">
                  Details
                </button>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {/* Top Products */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Top Products</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select className="pl-10 pr-8 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent appearance-none">
                    <option>All product</option>
                  </select>
                </div>
              </div>

              <div className="space-y-5">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Image
                      src="/solarpanel.png"
                      alt={p.name}
                      width={64}
                      height={64}
                      className="rounded-lg object-cover flex-shrink-0"
                      unoptimized
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{p.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Item: {p.item}</p>
                    </div>
                    <p className="font-bold text-[#4EA674] text-lg">{p.price}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Product */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Add New Product</h3>
                <button className="px-4 py-2 border border-[#4EA674] text-[#4EA674] rounded-full text-sm font-medium  hover:bg-[#4EA674] hover:text-white transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New
                </button>
              </div>

              <div className="mb-8">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Categories</p>
                <div className="space-y-3">
                  {['Pv Solar panels', 'Inverters', 'Batteries'].map((cat) => (
                    <div
                      key={cat}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <Image src="/solarpanel.png" alt={cat} width={48} height={48} className="rounded-lg object-cover" unoptimized />
                        <span className="font-medium">{cat}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
                <button className="text-[#4EA674] text-sm font-medium mt-4 block mx-auto hover:underline">
                  See more
                </button>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Product</p>
                <div className="space-y-4">
                  {['₦39.99', '₦19.99', '₦34.99'].map((price, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Image src="/solarpanel.png" alt="Monocrystalle Panel" width={48} height={48} className="rounded-lg object-cover" unoptimized />
                        <div>
                          <p className="font-medium">Monocrystalle Panel</p>
                          <p className="text-sm text-[#4EA674] font-bold">{price}</p>
                        </div>
                      </div>
                      <button className="px-5 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#3D8B59] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add
                      </button>
                    </div>
                  ))}
                </div>
                <button className="text-[#4EA674] text-sm font-medium mt-4 block mx-auto hover:underline">
                  See more
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

  );
}