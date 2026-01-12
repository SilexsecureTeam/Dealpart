'use client';

import { useState } from "react";
import Image from "next/image";
import { Search, Bell, Settings, MoreVertical, Truck } from "lucide-react";

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
  const itemsPerPage = 10;

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
  
    <>
      {/* Top Header Bar - Exactly like in the screenshot */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Management</h1>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search data, users, or reports"
              className="pl-12 pr-6 py-3.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm w-72 lg:w-96 focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            />
          </div>

          {/* Icons */}
          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Profile */}
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600">
            <Image
              src="/man.png"
              alt="Admin"
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 lg:p-8">
        {/* Page Title + Actions */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order List</h2>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#3D8B59] transition-colors">
              + Add Order
            </button>
            <button className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              More Action
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Total Orders</h3>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-bold text-[#4EA674]">1,240</p>
              <p className="text-lg font-bold text-[#4EA674] flex items-center gap-1 pb-1">↑ 14.4%</p>
            </div>
            <p className="text-sm text-[#7C7C7C] mt-3">Last 7 days</p>
          </div>

          {/* New Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">New Orders</h3>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-bold text-[#4EA674]">240</p>
              <p className="text-lg font-bold text-[#4EA674] flex items-center gap-1 pb-1">↑ 20%</p>
            </div>
            <p className="text-sm text-[#7C7C7C] mt-3">Last 7 days</p>
          </div>

          {/* Completed Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Completed Orders</h3>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-bold text-gray-900 dark:text-white">960</p>
              <p className="text-lg font-bold text-[#4EA674] flex items-center gap-1 pb-1">85%</p>
            </div>
            <p className="text-sm text-[#7C7C7C] mt-3">Last 7 days</p>
          </div>

          {/* Canceled Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Canceled Orders</h3>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-bold text-[#F43443]">87</p>
              <p className="text-lg font-bold text-[#F43443] flex items-center gap-1 pb-1">↓ 5%</p>
            </div>
            <p className="text-sm text-[#7C7C7C] mt-3">Last 7 days</p>
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
                placeholder="Search order report"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/20"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead className="bg-[#EAF8E7]">
                <tr className="text-left text-[#4EA674] font-medium">
                  <th className="px-6 py-4 rounded-l-xl">No.</th>
                  <th className="px-6 py-4">Order Id</th>
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
                      <td className="px-6 py-5 text-gray-900 dark:text-white font-medium">{rowNumber}</td>
                      <td className="px-6 py-5 font-medium text-gray-900 dark:text-white">#{order.id}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <Image
                            src="/solarpanel.png"
                            alt={order.product}
                            width={40}
                            height={40}
                            className="rounded-lg object-cover flex-shrink-0"
                          />
                          <span className="text-gray-900 dark:text-white">{order.product}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-gray-600 dark:text-gray-300">{order.date}</td>
                      <td className="px-6 py-5 text-gray-900 dark:text-white font-medium">{order.price}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${order.payment === "Paid" ? "bg-[#4EA674]" : "bg-[#F43443]"}`} />
                          <span className={`font-medium ${order.payment === "Paid" ? "text-[#4EA674]" : "text-[#F43443]"}`}>
                            {order.payment}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                          order.status === "Delivered" || order.status === "Shipped"
                            ? "bg-[#EAF8E7] text-[#4EA674]"
                            : order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          <Truck className={`w-5 h-5 ${
                            order.status === "Delivered" || order.status === "Shipped"
                              ? "text-[#4EA674]"
                              : order.status === "Pending"
                              ? "text-yellow-700"
                              : "text-red-700"
                          }`} />
                          {order.status}
                        </span>
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