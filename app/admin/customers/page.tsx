'use client';

import { useState } from "react";
import Image from "next/image";
import { Search, Bell, Settings, MoreVertical, MessageSquare, Trash2 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const weeklyData = [
  { day: "Sun", visitors: 20000 },
  { day: "Mon", visitors: 22000 },
  { day: "Tue", visitors: 30000 },
  { day: "Wed", visitors: 28000 },
  { day: "Thu", visitors: 25409 },
  { day: "Fri", visitors: 24000 },
  { day: "Sat", visitors: 26000 },
];

const customers = [
  { id: "CUST001", name: "John Doe", phone: "+1234567890", orders: 25, spend: "3,450.00", status: "Active" },
  { id: "CUST001", name: "John Doe", phone: "+1234567890", orders: 25, spend: "3,450.00", status: "Active" },
  { id: "CUST001", name: "John Doe", phone: "+1234567890", orders: 25, spend: "3,450.00", status: "Active" },
  { id: "CUST001", name: "John Doe", phone: "+1234567890", orders: 25, spend: "3,450.00", status: "Active" },
  { id: "CUST001", name: "Jane Smith", phone: "+1234567890", orders: 5, spend: "250.00", status: "Inactive" },
  { id: "CUST001", name: "Emily Davis", phone: "+1234567890", orders: 30, spend: "4,600.00", status: "VIP" },
  { id: "CUST001", name: "Jane Smith", phone: "+1234567890", orders: 5, spend: "250.00", status: "Inactive" },
  { id: "CUST001", name: "John Doe", phone: "+1234567890", orders: 25, spend: "3,450.00", status: "Active" },
  { id: "CUST001", name: "Emily Davis", phone: "+1234567890", orders: 30, spend: "4,600.00", status: "VIP" },
  { id: "CUST001", name: "Jane Smith", phone: "+1234567890", orders: 5, spend: "250.00", status: "Inactive" },
];

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const paginatedCustomers = customers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
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
   {/* Stats & Overview Section */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
  {/* LEFT COLUMN - 3 stacked small stats cards */}
  <div className="lg:col-span-4 space-y-5">
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
        <p className="text-3xl lg:text-4xl font-bold text-[#4EA674]">11,040</p>
        <p className="text-base font-bold text-[#4EA674] flex items-center gap-1">
          ↑ 14.4%
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
        <p className="text-3xl lg:text-4xl font-bold text-[#4EA674]">2,370</p>
        <p className="text-base font-bold text-[#4EA674] flex items-center gap-1">
          ↑ 20%
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
        <p className="text-3xl lg:text-4xl font-bold text-[#4EA674]">250k</p>
        <p className="text-base font-bold text-[#4EA674] flex items-center gap-1">
          ↑ 20%
        </p>
      </div>
    </div>
  </div>

  {/* RIGHT COLUMN - Wider Customer Overview + Chart */}
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

    {/* Small stats row */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8 text-center">
      <div>
        <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">25k</p>
        <p className="text-xs lg:text-sm text-[#7C7C7C] mt-1">Active Customers</p>
      </div>
      <div>
        <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">5.6k</p>
        <p className="text-xs lg:text-sm text-[#7C7C7C] mt-1">Repeat Customers</p>
      </div>
      <div>
        <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">250k</p>
        <p className="text-xs lg:text-sm text-[#7C7C7C] mt-1">Shop Visitor</p>
      </div>
      <div>
        <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">5.5%</p>
        <p className="text-xs lg:text-sm text-[#7C7C7C] mt-1">Conversion Rate</p>
      </div>
    </div>

    {/* Area Chart */}
    <div className="h-64 sm:h-72 lg:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={weeklyData}>
          <defs>
            <linearGradient id="visitorFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C1E6BA" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#C1E6BA" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "#7C7C7C", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#7C7C7C", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
          <Tooltip
  contentStyle={{ backgroundColor: "#EAF8E7", border: "none", borderRadius: "12px", padding: "10px 14px" }}
  labelStyle={{ color: "#4EA674", fontWeight: "bold" }}
  formatter={(value) => [
    value != null ? `${(Number(value) / 1000).toFixed(1)}k` : "0k",
    "Visitors"
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

        {/* Customers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="overflow-x-auto">
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
                {paginatedCustomers.map((customer, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-5 font-medium text-gray-900 dark:text-white">#{customer.id}</td>
                    <td className="px-6 py-5 text-gray-900 dark:text-white">{customer.name}</td>
                    <td className="px-6 py-5 text-gray-600 dark:text-gray-300">{customer.phone}</td>
                    <td className="px-6 py-5 text-gray-900 dark:text-white">{customer.orders}</td>
                    <td className="px-6 py-5 text-gray-900 dark:text-white font-medium">{customer.spend}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                        customer.status === "Active" ? "bg-[#EAF8E7] text-[#4EA674]" :
                        customer.status === "VIP" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          customer.status === "Active" ? "bg-[#4EA674]" :
                          customer.status === "VIP" ? "bg-yellow-700" :
                          "bg-red-700"
                        }`} />
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <button className="text-gray-500 hover:text-[#4EA674] transition">
                          <MessageSquare className="w-5 h-5" />
                        </button>
                        <button className="text-gray-500 hover:text-[#F43443] transition">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-8">
            <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              ← Previous
            </button>

            <div className="flex items-center gap-2">
              <button className="px-4 py-2.5 bg-[#C1E6BA] text-[#4EA674] rounded-lg text-sm font-medium">1</button>
              <button className="px-4 py-2.5 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition">2</button>
              <button className="px-4 py-2.5 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition">3</button>
              <button className="px-4 py-2.5 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition">4</button>
              <button className="px-4 py-2.5 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition">5</button>
              <span className="text-gray-500 dark:text-gray-400 text-sm">...</span>
              <button className="px-4 py-2.5 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition">24</button>
            </div>

            <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              Next →
            </button>
          </div>
        </div>
      </main>
    </>
  );
}