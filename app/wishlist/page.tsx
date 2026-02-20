'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Trash2, ChevronRight, Loader2 } from 'lucide-react';
import { useWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { addToCart } from '@/lib/cart';

export default function WishlistPage() {
  const router = useRouter();
  const [adding, setAdding] = useState<Record<number, boolean>>({});
  const [removing, setRemoving] = useState<Record<number, boolean>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: wishlist = [], isLoading, error, refetch } = useWishlist();
  const removeMutation = useRemoveFromWishlist();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleAddToCart = async (productId: number, price: number) => {
    try {
      setAdding((prev) => ({ ...prev, [productId]: true }));
      await addToCart(productId, 1, price);
      setMessage({ type: 'success', text: 'Added to cart successfully!' });
    } catch (e: any) {
      console.error('Add to cart error:', e);
      if (e?.message === 'LOGIN_REQUIRED' || e?.message === 'SESSION_EXPIRED') {
        router.push(`/login?next=${encodeURIComponent('/wishlist')}`);
        return;
      }
      setMessage({ type: 'error', text: e?.message || 'Failed to add to cart' });
    } finally {
      setAdding((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemove = async (wishlistItemId: number, productName: string) => {
    if (!confirm(`Remove "${productName}" from wishlist?`)) return;
    
    try {
      setRemoving((prev) => ({ ...prev, [wishlistItemId]: true }));
      
      console.log('Attempting to remove wishlist item with ID:', wishlistItemId);
      
      await removeMutation.mutateAsync(wishlistItemId);
      
      // Don't show success message if the item was already removed
      setMessage({ type: 'success', text: 'Item removed from wishlist' });
    } catch (error: any) {
      console.error('Remove from wishlist error:', error);
      
      // If the item wasn't found, it might have been already removed
      if (error?.message?.includes('not found')) {
        setMessage({ type: 'success', text: 'Item removed from wishlist' });
        // Refetch to update the UI
        await refetch();
      } else {
        setMessage({ type: 'error', text: error?.message || 'Failed to remove item' });
      }
    } finally {
      setRemoving((prev) => ({ ...prev, [wishlistItemId]: false }));
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
          className="px-6 py-3 bg-[#4EA674] text-white rounded-lg hover:bg-[#3D8B59] transition"
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
              className="inline-block px-6 py-3 bg-[#4EA674] text-white rounded-lg font-medium hover:bg-[#3D8B59] transition"
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
      {message && (
        <div className="fixed top-4 right-4 z-50 max-w-sm animate-slideIn">
          <div className={`rounded-lg shadow-lg px-4 py-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        </div>
      )}

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
              slug: ''
            };
            
            const price = product.price ?? 0;
            const isRemoving = removing[item.id];
            const isAdding = adding[product.id];

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition ${
                  isRemoving ? 'opacity-50 pointer-events-none' : ''
                }`}
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
                    disabled={isRemoving}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition disabled:opacity-50"
                  >
                    {isRemoving ? (
                      <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-500" />
                    )}
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-green-600 font-medium mb-2">In stock</p>
                  <p className="text-lg font-bold text-[#4EA674] mb-3">
                    ₦{price.toLocaleString()}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href={`/products/${product.slug || product.id}`}
                      className="flex-1 border border-[#4EA674] text-[#4EA674] py-2 rounded-full text-sm font-medium hover:bg-[#4EA674]/10 transition text-center"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product.id, price)}
                      disabled={isAdding}
                      className="flex-1 bg-[#4EA674] text-white py-2 rounded-full text-sm font-medium hover:bg-[#3D8B59] transition disabled:opacity-60"
                    >
                      {isAdding ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}