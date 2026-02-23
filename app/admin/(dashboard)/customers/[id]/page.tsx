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
  Sun,
  Moon,
  ArrowLeft,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// ---------- Types ----------
interface CustomerDetails {
  id: number;
  user_id?: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string | null;
  address?: string;
  status?: 'Active' | 'VIP' | 'Inactive';
  totalOrders?: number;
  completedOrders?: number;
  canceledOrders?: number;
  totalSpent?: number;
  registration?: string;
  lastPurchase?: string;
  created_at?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
}

interface CustomerOrder {
  id: string;
  date: string;
  total: number;
  status: 'Completed' | 'Pending' | 'Cancelled';
}

// ---------- Helpers ----------
const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
const formatDate = (dateString: string) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-GB');
};

// Helper to resolve avatar URL
const resolveAvatar = (pathOrUrl: string | null | undefined): string => {
  if (!pathOrUrl) return '/man.png';
  const raw = String(pathOrUrl).trim();
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const filename = raw.split('/').pop() || raw;
  return `https://admin.bezalelsolar.com/storage/avatars/${filename}`;
};

// ---------- Main Component ----------
export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const { theme, setTheme } = useTheme(); 
  const { user } = useAuth(); 
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  // ---------- Local State ----------
  const [orderPage, setOrderPage] = useState(1);
  const ordersPerPage = 5;

  // Get avatar URL
  const avatarUrl = user?.avatar_url || user?.avatar 
    ? resolveAvatar(user.avatar_url || user.avatar) 
    : '/man.png';

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src === '/man.png') return;
    img.src = '/man.png';
  };

  // ---------- Fetch Customer Details ----------
  const {
    data: customer,
    isLoading: customerLoading,
    error: customerError,
    refetch: refetchCustomer,
  } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      // Try multiple possible endpoints
      const endpoints = [
        `/admin/users/${customerId}`,
        `/users/${customerId}`,
        `/customers/${customerId}`,
        `/admin/customers/${customerId}`,
        `/api/admin/users/${customerId}`,
      ];
      
      let lastError = null;
      
      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          if (response.data) {
            // Handle different response structures
            const customerData = response.data.data || response.data;
            console.log('Customer data found at:', endpoint, customerData);
            return customerData;
          }
        } catch (e) {
          lastError = e;
          // Continue to next endpoint
        }
      }
      
      throw new Error('Customer not found');
    },
    retry: 1,
  });

  // ---------- Fetch Customer Orders ----------
  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['customer-orders', customerId],
    queryFn: async () => {
      // Try multiple possible endpoints for orders
      const endpoints = [
        `/admin/users/${customerId}/orders`,
        `/users/${customerId}/orders`,
        `/customers/${customerId}/orders`,
        `/admin/orders?user_id=${customerId}`,
        `/api/orders?customer_id=${customerId}`,
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          if (response.data) {
            // Handle different response structures
            let ordersData = response.data.data || response.data;
            if (Array.isArray(ordersData)) {
              return ordersData;
            }
            if (ordersData.orders && Array.isArray(ordersData.orders)) {
              return ordersData.orders;
            }
          }
        } catch (e) {
          // Continue to next endpoint
        }
      }
      
      return []; // Return empty array if no orders found
    },
    enabled: !!customer, // Only fetch orders if customer exists
  });

  // ---------- Delete Order Mutation ----------
  const deleteOrder = useMutation({
    mutationFn: async (orderId: string) => {
      // Try multiple possible delete endpoints
      const endpoints = [
        `/admin/orders/${orderId}`,
        `/orders/${orderId}`,
        `/api/orders/${orderId}`,
      ];
      
      let lastError = null;
      
      for (const endpoint of endpoints) {
        try {
          const response = await api.delete(endpoint);
          return response.data;
        } catch (e) {
          lastError = e;
        }
      }
      
      throw lastError || new Error('Failed to delete order');
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['customer-orders', customerId] });
      toast.success(`Order #${orderId} deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete order');
    },
  });

  // ---------- Mount ----------
  useEffect(() => {
    setMounted(true);
  }, []);

  // ---------- Error Handling ----------
  useEffect(() => {
    if (customerError) {
      toast.error('Failed to load customer details');
    }
  }, [customerError]);

  useEffect(() => {
    if (ordersError) {
      toast.error('Failed to load orders');
    }
  }, [ordersError]);

  // ---------- Pagination ----------
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const paginatedOrders = orders.slice(
    (orderPage - 1) * ordersPerPage,
    orderPage * ordersPerPage
  );

  // Reset page when orders change
  useEffect(() => {
    setOrderPage(1);
  }, [orders.length]);

  // ---------- Loading State ----------
  if (!mounted || customerLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#4EA674]" />
      </div>
    );
  }

  if (!customer && !customerLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Customer Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The customer you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button
            onClick={() => router.push('/admin/customers')}
            className="px-6 py-3 bg-[#4EA674] text-white rounded-lg font-medium hover:bg-[#3D8B59] transition"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Customer Details</h1>
        </div>

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

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-blue-400" />
            )}
          </button>

          {/* Dynamic Avatar */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600">
            <img
              src={avatarUrl}
              alt="Admin"
              className="object-cover w-full h-full"
              onError={handleImageError}
            />
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950">
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-700">
                  <Image
                    src={resolveAvatar(customer?.avatar)}
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
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
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
                                  onClick={() => deleteOrder.mutate(order.id)}
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
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum = i + 1;
                          if (totalPages > 5 && orderPage > 3) {
                            if (i === 0) pageNum = 1;
                            else if (i === 1) return <span key="dots1" className="px-2 py-1 text-gray-400">...</span>;
                            else if (i === 3) return <span key="dots2" className="px-2 py-1 text-gray-400">...</span>;
                            else if (i === 4) pageNum = totalPages;
                            else pageNum = orderPage - 1 + (i - 1);
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