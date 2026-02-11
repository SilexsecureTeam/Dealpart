'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { customerApi } from '@/lib/customerApiClient';
import { getCart, calcCartSummary, addToCart, emitCartUpdated } from '@/lib/cart';

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock_status?: string;
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Record<number, boolean>>({});

  // ---------- Load Cart ----------
  const loadCart = async () => {
    setLoading(true);
    try {
      const cartItems = await getCart();
      setItems(cartItems);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // ---------- Update Quantity ----------
  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdating((prev) => ({ ...prev, [itemId]: true }));
    try {
      await customerApi.cart.update(itemId, newQuantity);
      await loadCart(); // refresh
      emitCartUpdated();
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setUpdating((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // ---------- Remove Item ----------
  const handleRemoveItem = async (itemId: number) => {
    if (!confirm('Remove this item from cart?')) return;
    setUpdating((prev) => ({ ...prev, [itemId]: true }));
    try {
      await customerApi.cart.remove(itemId);
      await loadCart();
      emitCartUpdated();
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setUpdating((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // ---------- Calculate Summary ----------
  const { count, total } = calcCartSummary(items);

  // ---------- Loading State ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#EAF8E7]/50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#4EA674]" />
      </div>
    );
  }

  // ---------- Empty Cart ----------
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#EAF8E7]/50">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-lg mx-auto text-center bg-white rounded-2xl p-12 shadow-sm">
            <div className="w-24 h-24 bg-[#EAF8E7] rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-[#4EA674]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              href="/shop"
              className="inline-block px-8 py-4 bg-[#4EA674] text-white rounded-full font-medium hover:bg-[#3D8B59] transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAF8E7]/50">
      <div className="container mx-auto px-4 py-6 md:py-10">
        {/* ---------- Breadcrumb ---------- */}
        <div className="text-sm text-gray-600 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-[#4EA674]">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#4EA674] font-medium">Shopping Cart</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          Shopping Cart ({count} {count === 1 ? 'item' : 'items'})
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ---------- Cart Items ---------- */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-4 p-4 border-b border-gray-100 last:border-0"
                >
                  {/* Product Image */}
                  <div className="relative w-full sm:w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.image || '/offer.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Link
                        href={`/products/${item.product_id}`}
                        className="font-medium text-gray-900 hover:text-[#4EA674] transition line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.stock_status === 'in_stock' ? 'In stock' : 'Limited stock'}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right sm:text-left">
                      <p className="text-lg font-bold text-[#4EA674]">
                        ₦{item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={updating[item.id] || item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center text-sm font-medium">
                          {updating[item.id] ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={updating[item.id]}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={updating[item.id]}
                        className="p-2 text-gray-400 hover:text-red-600 transition disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <Link
                href="/shop"
                className="text-[#4EA674] hover:underline text-sm font-medium flex items-center gap-1"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* ---------- Order Summary ---------- */}
          <div className="lg:w-96">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({count} items)</span>
                  <span className="font-medium text-gray-900">
                    ₦{total.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-black text-[#4EA674]">
                      ₦{total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full py-4 bg-[#4EA674] text-white rounded-xl font-bold hover:bg-[#3D8B59] transition"
              >
                Proceed to Checkout
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Taxes and shipping calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}