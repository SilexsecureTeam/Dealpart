'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2, X, MapPin, Tag } from 'lucide-react';

// ---------- React Query Hooks ----------
import { useCart } from '@/hooks/useCart';
import { useCheckout, useApplyCoupon } from '@/hooks/useCheckout';

// ---------- Helpers ----------
const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

export default function CheckoutPage() {
  const router = useRouter();

  // ---------- Cart Data ----------
  const { data: items = [], isLoading: cartLoading } = useCart();

  // ---------- Local State ----------
  const [shippingAddress, setShippingAddress] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [deliveryFee] = useState(0); // You can make this dynamic based on location
  const [taxRate] = useState(0.075); // 7.5%

  // ---------- Calculate Totals ----------
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryFee + tax - discount;

  // ---------- Mutations ----------
  const checkoutMutation = useCheckout();
  const couponMutation = useApplyCoupon();

  // ---------- Apply Coupon Handler ----------
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const result = await couponMutation.mutateAsync(couponCode);
      // Assuming API returns { discount: number }
      setAppliedCoupon({ code: couponCode, discount: result.discount || 0 });
      setCouponCode('');
      alert('Coupon applied successfully!');
    } catch (error) {
      alert('Invalid coupon code');
    }
  };

  // ---------- Place Order Handler ----------
  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      alert('Please enter your shipping address');
      return;
    }

    checkoutMutation.mutate({
      shipping_address: shippingAddress,
      delivery_fee: deliveryFee,
      coupon_code: appliedCoupon?.code,
      tax_rate: taxRate,
    });
  };

  // ---------- Redirect if cart is empty ----------
  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      router.push('/cart');
    }
  }, [cartLoading, items, router]);

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-[#EAF8E7]/50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#4EA674]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAF8E7]/50">
      <div className="container mx-auto px-4 py-6 md:py-10">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-[#4EA674]">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/cart" className="hover:text-[#4EA674]">Cart</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#4EA674] font-medium">Checkout</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ---------- Left: Shipping Form ---------- */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#4EA674]" />
                Shipping Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    placeholder="Street address, city, state"
                  />
                </div>

                {/* You can add more fields like city, state, etc. */}
              </div>
            </div>
          </div>

          {/* ---------- Right: Order Summary ---------- */}
          <div className="lg:w-96">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Cart Items Preview */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <Image
                        src={item.image || '/offer.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    disabled={couponMutation.isPending || !!appliedCoupon}
                  />
                  {!appliedCoupon ? (
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponMutation.isPending || !couponCode.trim()}
                      className="px-4 py-2 bg-[#4EA674] text-white rounded-lg font-medium hover:bg-[#3D8B59] transition disabled:opacity-50"
                    >
                      {couponMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => setAppliedCoupon(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    Coupon applied: {appliedCoupon.code} – ₦{appliedCoupon.discount.toLocaleString()} off
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">
                    {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Discount</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Tax (7.5%)</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(tax)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-black text-[#4EA674]">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={checkoutMutation.isPending || !shippingAddress.trim()}
                className="w-full py-4 bg-[#4EA674] text-white rounded-xl font-bold hover:bg-[#3D8B59] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkoutMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Place Order'
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing your order, you agree to our{' '}
                <Link href="/terms" className="text-[#4EA674] hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[#4EA674] hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}