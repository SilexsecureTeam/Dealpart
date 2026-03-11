// app/orders/page.tsx
'use client';

import { useState, useEffect } from 'react'; // Add useEffect import
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Clock, 
  ChevronRight,
  Home,
  Search,
  Loader2,
  AlertCircle,
  Eye,
  Calendar,
  CreditCard
} from 'lucide-react';

import { useCustomerOrders } from '@/hooks/useCustomerOrder';
import { useAuth } from '@/contexts/AuthContext'; // Check if this path is correct

const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₦${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'processing': return 'bg-blue-100 text-blue-800';
    case 'confirmed': return 'bg-green-100 text-green-800';
    case 'shipped': return 'bg-purple-100 text-purple-800';
    case 'delivered': return 'bg-green-100 text-green-800';
    case 'cancelled':
    case 'canceled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data, isLoading, error } = useCustomerOrders(currentPage, 10);

  console.log('Orders page data:', data);
  console.log('Current user:', user);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/orders');
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EAF8E7] to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-[#4EA674] mx-auto mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EAF8E7] to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Orders</h2>
          <p className="text-gray-600 mb-6">
            There was an error loading your orders. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#4EA674] text-white rounded-lg font-medium hover:bg-[#3D8B59] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const orders = data?.orders || [];
  const totalOrders = data?.total || 0;
  const lastPage = data?.lastPage || 1;

  // Filter orders by search term
  const filteredOrders = searchTerm
    ? orders.filter(order => 
        order.order_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : orders;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF8E7] to-white">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-8 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-[#4EA674] flex items-center gap-1">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#4EA674] font-medium">My Orders</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">
              Welcome back, {user?.name}! You have placed {totalOrders} {totalOrders === 1 ? 'order' : 'orders'} in total
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 focus:border-[#4EA674]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Orders Found</h2>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? "No orders match your search. Try a different term."
                : "You haven't placed any orders yet."}
            </p>
            {!searchTerm && (
              <Link
                href="/shop"
                className="inline-block px-6 py-3 bg-[#4EA674] text-white rounded-lg font-medium hover:bg-[#3D8B59] transition"
              >
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#EAF8E7] rounded-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-[#4EA674]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Order Reference</p>
                          <p className="font-bold text-gray-900">{order.order_reference}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <Link
                          href={`/order-confirmation/${order.order_reference}`}
                          className="px-4 py-2 bg-[#4EA674] text-white rounded-lg text-sm font-medium hover:bg-[#3D8B59] transition flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Calendar className="w-4 h-4 text-[#4EA674]" />
                        <span className="text-sm">{formatDate(order.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Package className="w-4 h-4 text-[#4EA674]" />
                        <span className="text-sm">{order.items?.length || 0} items</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <CreditCard className="w-4 h-4 text-[#4EA674]" />
                        <span className="text-sm font-bold text-[#4EA674]">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-700 mb-3">Order Items:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center gap-3 text-sm text-gray-600">
                              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                {item.product?.name ? (
                                  <span className="text-xs font-bold text-gray-500">
                                    {item.product.name.charAt(0)}
                                  </span>
                                ) : (
                                  <Package className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                              <span className="truncate flex-1">{item.product?.name || 'Product'}</span>
                              <span className="font-medium">x{item.quantity}</span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="text-sm text-gray-500 flex items-center">
                              +{order.items.length - 3} more items
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                    let pageNum = i + 1;
                    if (lastPage > 5) {
                      if (currentPage > 3) {
                        pageNum = currentPage - 3 + i;
                      }
                      if (pageNum > lastPage) return null;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg transition ${
                          currentPage === pageNum
                            ? 'bg-[#4EA674] text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(lastPage, p + 1))}
                  disabled={currentPage === lastPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}