'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Trash2, Plus, Minus, ShoppingBag, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart, useUpdateCartItem, useRemoveCartItem, useCartSummary } from '@/hooks/useCart';

const getSafeImageUrl = (image: string | null | undefined): string | null => {
  if (!image || typeof image !== 'string' || image.trim() === '') return null;
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  const cleanImage = image.startsWith('/') ? image.substring(1) : image;
  return `https://admin.bezalelsolar.com/storage/products/${cleanImage}`;
};

export default function CartPage() {
  const router = useRouter();

  const {
    data: items = [],
    isLoading,
    error,
    refetch,
  } = useCart();

  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveCartItem();

  const [updatingItems, setUpdatingItems] = useState<Record<number, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const { count, total } = useCartSummary(items);

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));
    
    try {
      await updateMutation.mutateAsync({ itemId, quantity: newQuantity });
      await refetch();
      toast.success('Cart updated successfully');
    } catch (error: any) {
      console.error('Failed to update quantity:', error);
      
      if (error?.message === 'CART_ITEM_NOT_FOUND' || error?.message?.includes('404')) {
        toast.error('This item is no longer available');
        await refetch(); // Refresh to get correct items
      } else {
        toast.error('Failed to update cart');
      }
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    // Replace confirm with toast confirmation
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-gray-900">Remove this item from cart?</p>
        <p className="text-sm text-gray-500">This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setUpdatingItems((prev) => ({ ...prev, [itemId]: true }));
              
              try {
                await removeMutation.mutateAsync(itemId);
                await refetch();
                toast.success('Item removed from cart');
              } catch (error: any) {
                console.error('Failed to remove item:', error);
                
                if (error?.message === 'CART_ITEM_NOT_FOUND' || error?.message?.includes('404')) {
                  toast.error('Item already removed');
                  await refetch(); // Refresh to get correct items
                } else {
                  toast.error('Failed to remove item');
                }
              } finally {
                setUpdatingItems((prev) => ({ ...prev, [itemId]: false }));
              }
            }}
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Yes, Remove
          </button>
        </div>
      </div>
    ), {
      duration: 8000,
      position: 'top-center',
    });
  };

  const handleImageError = (itemId: number) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EAF8E7]/50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#4EA674]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#EAF8E7]/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load cart</h2>
          <p className="text-gray-600 mb-6">{error instanceof Error ? error.message : 'Please try again'}</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-[#4EA674] text-white rounded-lg font-medium hover:bg-[#3D8B59] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {items.map((item) => {
                const isUpdating = updatingItems[item.id] || updateMutation.isPending || removeMutation.isPending;
                const safeImageUrl = getSafeImageUrl(item.image);
                const hasImageError = imageErrors[item.id];
                const showFallback = !safeImageUrl || hasImageError;
                
                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-4 p-4 border-b border-gray-100 last:border-0"
                  >
                    <div className="relative w-full sm:w-24 h-24 flex-shrink-0">
                      {!showFallback ? (
                        <Image
                          src={safeImageUrl!}
                          alt={item.name || 'Product'}
                          fill
                          className="object-cover rounded-lg"
                          onError={() => handleImageError(item.id)}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-400">
                            {item.name?.charAt(0).toUpperCase() || 'P'}
                          </span>
                        </div>
                      )}
                    </div>

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

                      <div className="text-right sm:text-left">
                        <p className="text-lg font-bold text-[#4EA674]">
                          ₦{item.price.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-start gap-4">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={isUpdating || item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center text-sm font-medium">
                            {isUpdating ? (
                              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={isUpdating}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isUpdating}
                          className="p-2 text-gray-400 hover:text-red-600 transition disabled:opacity-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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