'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronRight, Heart, Star, Loader2 } from 'lucide-react';
import { addToCart } from '@/lib/cart';
import { useCategoryProducts, fallbackHybridProducts, fallbackStandardProducts } from '@/hooks/useCategoryProducts';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { Product } from '@/types';

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

export default function InvertersPage() {
  const router = useRouter();
  const pathname = usePathname();

  const { data: hybridProducts = [], isLoading: hybridLoading, error: hybridError } = useCategoryProducts('hybrid-inverters', 4);
  const { data: standardProducts = [], isLoading: standardLoading, error: standardError } = useCategoryProducts('standard-inverters', 4);

  const { data: wishlist = [] } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const [adding, setAdding] = useState<Record<number, boolean>>({});

  const loading = hybridLoading || standardLoading;
  const error = hybridError || standardError;

  async function handleAddToCart(id: number, price: number) {
    try {
      setAdding((prev) => ({ ...prev, [id]: true }));
      await addToCart(id, 1, price);
      alert('Added to cart ✅');
    } catch (e: any) {
      if (e?.message === 'LOGIN_REQUIRED' || e?.message === 'SESSION_EXPIRED') {
        router.push(`/login?next=${encodeURIComponent(pathname || '/inverters')}`);
        return;
      }
      alert(e?.message || 'Failed to add to cart');
    } finally {
      setAdding((prev) => ({ ...prev, [id]: false }));
    }
  }

  const handleWishlistToggle = async (productId: number) => {
    const item = wishlist.find((item) => item.product_id === productId);
    if (item) {
      await removeFromWishlist.mutateAsync(item.id);
    } else {
      await addToWishlist.mutateAsync(productId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#4EA674]" />
      </div>
    );
  }

  if (error && hybridProducts.length === 0 && standardProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{(error as Error).message || 'Failed to load products'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[#4EA674] text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  const displayHybrid = hybridProducts.length > 0 ? hybridProducts : fallbackHybridProducts;
  const displayStandard = standardProducts.length > 0 ? standardProducts : fallbackStandardProducts;

  const renderProductCard = (product: Product) => {
    const price = product.price ?? 0;
    const isInWishlist = wishlist.some((item) => item.product_id === product.id);
    const stockText =
      product.stock_status === 'low_stock'
        ? '4 units left'
        : product.stock_status === 'in_stock'
        ? 'In stock'
        : 'Out of stock';
    const stockColor =
      product.stock_status === 'low_stock'
        ? 'text-red-600'
        : product.stock_status === 'in_stock'
        ? 'text-green-600'
        : 'text-gray-500';
    const categoryName = product.category?.name || 'Inverters';
    const productSlug = (product as any).slug || createSlug(product.name);

    return (
      <div
        key={product.id}
        className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
      >
        <div className="relative pt-[75%]">
          <Image
            src={product.image || '/offer.jpg'}
            alt={product.name}
            fill
            className="object-cover"
          />
          <button
            onClick={() => handleWishlistToggle(product.id)}
            disabled={addToWishlist.isPending || removeFromWishlist.isPending}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition"
          >
            <Heart
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>
        </div>
        <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow">
          <h3 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base line-clamp-2 mb-1">{product.name}</h3>
          <p className="text-[#4EA674] text-[10px] sm:text-xs mb-1.5 line-clamp-1">{categoryName}</p>
          <div className="flex items-center gap-0.5 mb-1.5 sm:mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                  i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className={`${stockColor} text-[10px] sm:text-xs font-medium mb-1.5 sm:mb-2`}>{stockText}</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#4EA674] mb-3 sm:mb-4">
            ₦{price.toLocaleString()}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto items-center sm:items-stretch">
            <Link
              href={`/products/${productSlug}`}
              className="text-[#4EA674] text-xs sm:text-sm font-medium hover:underline text-center sm:text-left w-full sm:w-auto py-2 sm:py-0"
            >
              View Details
            </Link>
            <button
              onClick={() => handleAddToCart(product.id, price)}
              disabled={adding[product.id]}
              className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-[#4EA674] text-white rounded-full text-xs sm:text-sm font-medium hover:bg-[#3e8c5f] transition shadow-sm disabled:opacity-60"
            >
              {adding[product.id] ? 'Adding...' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Banner sections (unchanged) */}
      <section className="py-8 md:py-12 lg:py-16">
        {/* ... */}
      </section>

      <section className="py-10 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-12 gap-3 sm:gap-0">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-800">Hybrid Inverters</h2>
            <Link
              href="/shop?category=hybrid-inverters"
              className="inline-flex items-center px-5 py-2 sm:px-6 sm:py-2.5 border border-[#4EA674] text-[#4EA674] font-medium text-sm sm:text-base rounded-full hover:bg-[#4EA674]/10 transition whitespace-nowrap"
            >
              View all <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {displayHybrid.map((product) => renderProductCard(product))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-12 gap-3 sm:gap-0">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-800">Standard Inverters</h2>
            <Link
              href="/shop?category=standard-inverters"
              className="inline-flex items-center px-5 py-2 sm:px-6 sm:py-2.5 border border-[#4EA674] text-[#4EA674] font-medium text-sm sm:text-base rounded-full hover:bg-[#4EA674]/10 transition whitespace-nowrap"
            >
              View all <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {displayStandard.map((product) => renderProductCard(product))}
          </div>
        </div>
      </section>
    </div>
  );
}