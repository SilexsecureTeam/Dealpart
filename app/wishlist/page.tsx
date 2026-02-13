'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Trash2, ShoppingBag, ChevronRight, Loader2 } from 'lucide-react';
import { useWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { addToCart } from '@/lib/cart';

export default function WishlistPage() {
  const router = useRouter();
  const [adding, setAdding] = useState<Record<number, boolean>>({});

  const { data: wishlist = [], isLoading, error, refetch } = useWishlist();
  const removeMutation = useRemoveFromWishlist();

  // ---------- Add to Cart from Wishlist ----------
  const handleAddToCart = async (productId: number, price: number) => {
    try {
      setAdding((prev) => ({ ...prev, [productId]: true }));
      await addToCart(productId, 1, price);
      alert('Added to cart ✅');
    } catch (e: any) {
      alert(e?.message || 'Failed to add to cart');
    } finally {
      setAdding((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // ---------- Remove from Wishlist ----------
  const handleRemove = async (id: number, productName: string) => {
    if (!confirm(`Remove "${productName}" from wishlist?`)) return;
    try {
      await removeMutation.mutateAsync(id);
    } catch (error) {
      alert('Failed to remove item');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#4EA674]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{(error as Error).message}</p>
        <button
          onClick={() => refetch()}
          className="px-6 py-3 bg-[#4EA674] text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h1>
            <p className="text-gray-600 mb-6">Save your favorite items here.</p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 bg-[#4EA674] text-white rounded-lg font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#4EA674]">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-800 font-medium">Wishlist</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Wishlist ({wishlist.length})</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => {
            const product = item.product || {
              id: item.product_id,
              name: 'Product',
              price: 0,
              image: '/offer.jpg',
            };
            // ✅ Safe price – fallback to 0 if undefined
            const price = product.price ?? 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
              >
                <div className="relative pt-[75%]">
                  <Image
                    src={product.image || '/offer.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => handleRemove(item.id, product.name)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">In stock</p>
                  <p className="text-lg font-bold text-[#4EA674] mb-3">
                    ₦{price.toLocaleString()}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href={`/products/${product.slug || product.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex-1 border border-[#4EA674] text-[#4EA674] py-2 rounded-full text-sm font-medium hover:bg-[#4EA674]/10 transition text-center"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product.id, price)}
                      disabled={adding[product.id]}
                      className="flex-1 bg-[#4EA674] text-white py-2 rounded-full text-sm font-medium hover:bg-[#3D8B59] transition disabled:opacity-60"
                    >
                      {adding[product.id] ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}