'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Clock, 
  ChevronRight,
  Home,
  Mail,
  Phone,
  MapPin,
  Printer,
  Loader2,
  AlertCircle
} from 'lucide-react';

// ---------- Hooks ----------
import { useCustomerOrder } from '@/hooks/useCustomerOrder'; 

// ---------- Helpers ----------
const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₦${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getSafeImageUrl = (image: string | null | undefined): string | null => {
  if (!image || typeof image !== 'string' || image.trim() === '') return null;
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  const cleanImage = image.startsWith('/') ? image.substring(1) : image;
  return `https://admin.bezalelsolar.com/storage/products/${cleanImage}`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'shipped':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
    case 'canceled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function OrderConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const orderReference = params.reference as string;
  
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Use the customer order hook
  const { data: order, isLoading, error } = useCustomerOrder(orderReference);

   console.log('🔍 Page Debug:');
  console.log('  - orderReference from URL:', orderReference);
  console.log('  - isLoading:', isLoading);
  console.log('  - error:', error);
  console.log('  - order:', order);
  console.log('  - order?.order_reference:', order?.order_reference);

  const handleImageError = (itemId: number) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleTrackOrder = () => {
    // Use order_reference from the order object
    router.push(`/account/orders/${order?.order_reference || orderReference}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EAF8E7] to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-[#4EA674] mx-auto mb-4" />
          <p className="text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EAF8E7] to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find your order. Please check the order reference or contact support.
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-3 bg-[#4EA674] text-white rounded-lg font-medium hover:bg-[#3D8B59] transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Calculate estimated delivery (3-5 business days from order date)
  const orderDate = new Date(order.created_at);
  const estimatedDelivery = new Date(orderDate);
  estimatedDelivery.setDate(orderDate.getDate() + 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF8E7] to-white">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-8 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-[#4EA674] flex items-center gap-1">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/cart" className="hover:text-[#4EA674]">Cart</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/checkout" className="hover:text-[#4EA674]">Checkout</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#4EA674] font-medium">Order Confirmation</span>
        </div>

        {/* Success Message */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Thank You for Your Order!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your order has been confirmed and will be processed shortly. 
            You'll receive a confirmation email at {order.customer_email}.
          </p>
        </div>

        {/* Order Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <Package className="w-8 h-8 text-[#4EA674] mb-3" />
            <p className="text-sm text-gray-600 mb-1">Order Status</p>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <Clock className="w-8 h-8 text-[#4EA674] mb-3" />
            <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
            <p className="text-lg font-bold text-gray-900">
              {estimatedDelivery.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-xs text-gray-500 mt-1">3-5 business days</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <Truck className="w-8 h-8 text-[#4EA674] mb-3" />
            <p className="text-sm text-gray-600 mb-1">Shipping Method</p>
            <p className="text-lg font-bold text-gray-900">
              {parseFloat(order.delivery_fee) === 0 ? 'Free Shipping' : 'Standard Shipping'}
            </p>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          {/* Order Header */}
          <div className="border-b border-gray-200 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Reference</p>
                {/* FIXED: Use order.order_reference instead of order.reference */}
                <p className="text-xl font-bold text-gray-900">{order.order_reference}</p>
                <p className="text-sm text-gray-500 mt-1">Placed on {formatDate(order.created_at)}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button
                  onClick={handleTrackOrder}
                  className="px-6 py-2 bg-[#4EA674] text-white rounded-lg font-medium hover:bg-[#3D8B59] transition"
                >
                  Track Order
                </button>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => {
                // Get the image URL from the product data
                const imageUrl = item.product?.image_urls?.[0]?.url || 
                                (item.product?.images?.[0]?.path ? 
                                  `https://admin.bezalelsolar.com/storage/${item.product.images[0].path}` : 
                                  null);
                
                const safeImageUrl = getSafeImageUrl(imageUrl);
                const hasImageError = imageErrors[item.id];
                const showFallback = !safeImageUrl || hasImageError;

                return (
                  <div key={item.id} className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      {!showFallback ? (
                        <Image
                          src={safeImageUrl!}
                          alt={item.product?.name || 'Product'}
                          fill
                          className="object-cover rounded-lg"
                          onError={() => handleImageError(item.id)}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-400">
                            {item.product?.name?.charAt(0) || 'P'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.product?.name || 'Product'}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Quantity: {item.quantity}
                          {item.color && <span> • Color: {item.color}</span>}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-[#4EA674] mt-2 sm:mt-0">
                        {formatCurrency(parseFloat(item.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 p-6 md:p-8">
            <div className="max-w-sm ml-auto">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">
                    {parseFloat(order.delivery_fee) === 0 ? 'Free' : formatCurrency(order.delivery_fee)}
                  </span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Discount {order.coupon_code && `(${order.coupon_code})`}</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(order.discount_amount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({order.tax_rate}%)</span>
                  <span className="font-medium text-gray-900">{formatCurrency(order.tax_amount)}</span>
                </div>
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-black text-2xl text-[#4EA674]">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#4EA674]" />
              Shipping Address
            </h3>
            <div className="space-y-2 text-gray-600">
              <p className="font-medium text-gray-900">{order.customer_name}</p>
              <p>{order.shipping_address}</p>
              <div className="flex items-center gap-2 pt-2">
                <Phone className="w-4 h-4" />
                <p>{order.customer_phone}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <p>{order.customer_email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Payment Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {order.status === 'pending' ? 'Awaiting Payment' : 'Paid'}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <p className="text-sm text-gray-500">
                  {order.status === 'pending' 
                    ? 'Please complete your payment to process your order.' 
                    : 'Your payment has been processed successfully. A receipt has been sent to your email.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="px-8 py-4 bg-[#4EA674] text-white rounded-xl font-medium hover:bg-[#3D8B59] transition text-center"
          >
            Continue Shopping
          </Link>
          <Link
            href="/account/orders"
            className="px-8 py-4 border-2 border-[#4EA674] text-[#4EA674] rounded-xl font-medium hover:bg-[#4EA674]/10 transition text-center"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
}