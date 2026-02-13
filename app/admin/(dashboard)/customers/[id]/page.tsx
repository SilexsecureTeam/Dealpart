'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

// ---------- React Query Hooks ----------
import { 
  useAdminCustomerDetails, 
  useAdminCustomerOrders, 
  useDeleteCustomerOrder 
} from '@/hooks/useAdminCustomers';
import { CustomerDetails, CustomerOrder } from '@/types';

// ---------- Helpers ----------
const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
const formatDate = (dateString: string) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-GB');
};

// ---------- Main Component ----------
export default function CustomerDetailsPage() {
  const params = useParams();
  const customerId = params.id as string;

  // ---------- Local State ----------
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [orderPage, setOrderPage] = useState(1);
  const ordersPerPage = 5;

  // ---------- React Query ----------
  const {
    data: customer,
    isLoading: customerLoading,
    error: customerError,
  } = useAdminCustomerDetails(customerId);

  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useAdminCustomerOrders(customerId);

  const deleteOrder = useDeleteCustomerOrder();

  // ---------- Error Handling ----------
  useEffect(() => {
    if (customerError) setMessage({ type: 'error', text: 'Failed to load customer details' });
  }, [customerError]);

  useEffect(() => {
    if (ordersError) setMessage({ type: 'error', text: 'Failed to load orders' });
  }, [ordersError]);

  // ---------- Auto-dismiss Toast ----------
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ---------- Delete Order Handler ----------
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`Delete order #${orderId}? This cannot be undone.`)) return;

    try {
      await deleteOrder.mutateAsync(orderId, {
        onSuccess: () => {
          refetchOrders();
          setMessage({ type: 'success', text: `Order #${orderId} deleted successfully` });
        },
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to delete order' });
    }
  };

  // ---------- Pagination ----------
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const paginatedOrders = orders.slice(
    (orderPage - 1) * ordersPerPage,
    orderPage * ordersPerPage
  );

  // ---------- Loading State ----------
  if (customerLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#4EA674]" />
      </div>
    );
  }

  if (!customer && !customerLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center text-red-600">
        Customer not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Customer Details</h1>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search data, users, or reports"
              className="pl-12 pr-6 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm w-64 lg:w-96 focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            />
          </div>

          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600">
            <Image src="/man.png" alt="Admin" width={40} height={40} className="object-cover w-full h-full" />
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950">
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

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Customer Details</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-700">
                  <Image
                    src={customer?.avatar || '/man.png'}
                    alt={customer?.name || 'Customer'}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{customer?.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{customer?.email}</p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                      customer?.status === 'Active'
                        ? 'bg-[#EAF8E7] text-[#4EA674]'
                        : customer?.status === 'VIP'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {customer?.status || 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Customer Info</p>
                  <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>{customer?.phone || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-900 dark:text-white mt-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>{customer?.address || '—'}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Social Media</p>
                  <div className="flex items-center gap-4">
                    {customer?.facebook && (
                      <a href={customer.facebook} target="_blank" rel="noopener noreferrer">
                        <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition">
                          <Facebook className="w-5 h-5" />
                        </button>
                      </a>
                    )}
                    {customer?.twitter && (
                      <a href={customer.twitter} target="_blank" rel="noopener noreferrer">
                        <button className="p-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition">
                          <Twitter className="w-5 h-5" />
                        </button>
                      </a>
                    )}
                    {customer?.instagram && (
                      <a href={customer.instagram} target="_blank" rel="noopener noreferrer">
                        <button className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition">
                          <Instagram className="w-5 h-5" />
                        </button>
                      </a>
                    )}
                    {customer?.linkedin && (
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
                    Registration: {customer?.registration || formatDate(customer?.created_at || '')}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white mt-2">
                    Last purchase: {customer?.lastPurchase || '—'}
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Order overview</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg py-3">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {customer?.totalOrders ?? orders.length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total order</p>
                    </div>
                    <div className="bg-[#EAF8E7] rounded-lg py-3">
                      <p className="text-2xl font-bold text-[#4EA674]">
                        {customer?.completedOrders ?? orders.filter((o: CustomerOrder) => o.status === 'Completed').length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg py-3">
                      <p className="text-2xl font-bold text-[#F43443]">
                        {customer?.canceledOrders ?? orders.filter((o: CustomerOrder) => o.status === 'Cancelled').length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Canceled</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order History Table */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Order History</h3>

              {ordersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#4EA674]" />
                </div>
              ) : orders.length === 0 ? (
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
                        {paginatedOrders.map((order: CustomerOrder) => (
                          <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <td className="px-6 py-5 font-medium text-gray-900 dark:text-white">#{order.id}</td>
                            <td className="px-6 py-5 text-gray-600 dark:text-gray-300">{formatDate(order.date)}</td>
                            <td className="px-6 py-5 text-gray-900 dark:text-white font-medium">
                              {formatCurrency(order.total)}
                            </td>
                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium ${
                                  order.status === 'Completed'
                                    ? 'bg-[#EAF8E7] text-[#4EA674]'
                                    : order.status === 'Pending'
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}
                              >
                                <span
                                  className={`w-2.5 h-2.5 rounded-full ${
                                    order.status === 'Completed'
                                      ? 'bg-[#4EA674]'
                                      : order.status === 'Pending'
                                      ? 'bg-yellow-600'
                                      : 'bg-red-600'
                                  }`}
                                />
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <button className="text-gray-500 hover:text-[#4EA674] transition">
                                  <MessageSquare className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  disabled={deleteOrder.isPending}
                                  className="text-gray-500 hover:text-red-500 transition disabled:opacity-50"
                                >
                                  {deleteOrder.isPending ? (
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 sm:mt-8">
                      <button
                        onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                        disabled={orderPage === 1}
                        className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </button>

                      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                          let pageNum = i + 1;
                          if (totalPages > 3 && orderPage > 2) {
                            if (i === 0) pageNum = orderPage - 1;
                            else if (i === 1) pageNum = orderPage;
                            else pageNum = orderPage + 1;
                          }
                          if (pageNum > totalPages || pageNum < 1) return null;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setOrderPage(pageNum)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium min-w-[36px] ${
                                orderPage === pageNum
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
                        onClick={() => setOrderPage(p => Math.min(totalPages, p + 1))}
                        disabled={orderPage === totalPages}
                        className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}