'use client';

import { useParams } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Settings,
  MoreVertical,
  Phone,
  MessageSquare,
  Trash2,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Loader2,
} from "lucide-react";

const BASE_URL = "https://admin.bezalelsolar.com"; // ← change if needed

export default function CustomerDetailsPage() {
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch customer + orders
  useEffect(() => {
    if (!customerId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Get customer details
        const custRes = await fetch(`${BASE_URL}/api/customers/${customerId}`, {
          headers: {
            Accept: "application/json",
            // Authorization: `Bearer ${token}` ← add if needed
          },
        });

        if (!custRes.ok) throw new Error("Failed to load customer");

        const custData = await custRes.json();
        setCustomer(custData);

        // 2. Get orders for this customer (adjust endpoint as needed)
        const ordersRes = await fetch(`${BASE_URL}/api/orders?customer_id=${customerId}`, {
          headers: { Accept: "application/json" },
        });

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(Array.isArray(ordersData) ? ordersData : ordersData?.data ?? []);
        }
      } catch (err: any) {
        setMessage({ type: "error", text: err.message || "Could not load customer data" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId]);

  // Delete order
  const handleDeleteOrder = async (orderId: string, index: number) => {
    if (!confirm(`Delete order #${orderId}? This cannot be undone.`)) return;

    setDeletingId(orderId);
    try {
      const res = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || "Failed to delete order");
      }

      // Remove from UI
      setOrders((prev) => prev.filter((_, i) => i !== index));
      setMessage({ type: "success", text: `Order #${orderId} deleted successfully` });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Could not delete order" });
    } finally {
      setDeletingId(null);
    }
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#4EA674]" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Customer not found
      </div>
    );
  }

  return (
    <>
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
        {message && (
          <div
            className={`mb-6 rounded-xl px-5 py-4 text-sm border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Customer Details</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-700">
                  <Image
                    src={customer.avatar || "/man.png"}
                    alt={customer.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{customer.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Customer Info</p>
                  <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>{customer.phone || "—"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-900 dark:text-white mt-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>{customer.address || "—"}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Social Media</p>
                  <div className="flex items-center gap-4">
                    {customer.facebook && (
                      <a href={customer.facebook} target="_blank" rel="noopener noreferrer">
                        <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition">
                          <Facebook className="w-5 h-5" />
                        </button>
                      </a>
                    )}
                    {customer.twitter && (
                      <a href={customer.twitter} target="_blank" rel="noopener noreferrer">
                        <button className="p-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition">
                          <Twitter className="w-5 h-5" />
                        </button>
                      </a>
                    )}
                    {customer.instagram && (
                      <a href={customer.instagram} target="_blank" rel="noopener noreferrer">
                        <button className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition">
                          <Instagram className="w-5 h-5" />
                        </button>
                      </a>
                    )}
                    {customer.linkedin && (
                      <a href={customer.linkedin} target="_blank" rel="noopener noreferrer">
                        <button className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition">
                          <Linkedin className="w-5 h-5" />
                        </button>
                      </a>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Activity</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    Registration: {customer.registration || "—"}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white mt-2">
                    Last purchase: {customer.lastPurchase || "—"}
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Order overview</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg py-3">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{customer.totalOrders || 0}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total order</p>
                    </div>
                    <div className="bg-[#EAF8E7] rounded-lg py-3">
                      <p className="text-2xl font-bold text-[#4EA674]">{customer.completedOrders || 0}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg py-3">
                      <p className="text-2xl font-bold text-[#F43443]">{customer.canceledOrders || 0}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Canceled</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order History Table */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Order History</h3>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No orders found for this customer
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#EAF8E7]">
                        <tr className="text-left text-[#4EA674] font-medium">
                          <th className="px-6 py-4 rounded-l-xl">Order ID</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Total</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 rounded-r-xl">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {orders.map((order: any, index: number) => (
                          <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <td className="px-6 py-5 font-medium text-gray-900 dark:text-white">#{order.id}</td>
                            <td className="px-6 py-5 text-gray-600 dark:text-gray-300">
                              {order.date || new Date().toLocaleDateString()}
                            </td>
                            <td className="px-6 py-5 text-gray-900 dark:text-white font-medium">
                              ₦{Number(order.total || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium ${
                                  order.status === "Completed"
                                    ? "bg-[#EAF8E7] text-[#4EA674]"
                                    : order.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                }`}
                              >
                                <span
                                  className={`w-2.5 h-2.5 rounded-full ${
                                    order.status === "Completed"
                                      ? "bg-[#4EA674]"
                                      : order.status === "Pending"
                                      ? "bg-yellow-600"
                                      : "bg-red-600"
                                  }`}
                                />
                                {order.status || "Unknown"}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <button className="text-gray-500 hover:text-[#4EA674] transition">
                                  <MessageSquare className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(order.id, index)}
                                  disabled={deletingId === order.id}
                                  className="text-gray-500 hover:text-red-500 transition disabled:opacity-50"
                                >
                                  {deletingId === order.id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-5 h-5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination placeholder – add real logic later if needed */}
                  <div className="flex items-center justify-between mt-8">
                    <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
                      ← Previous
                    </button>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2.5 bg-[#C1E6BA] text-[#4EA674] rounded-lg text-sm font-medium">1</button>
                      <button className="px-4 py-2.5 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition">2</button>
                      <button className="px-4 py-2.5 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition">3</button>
                    </div>
                    <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      Next →
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}