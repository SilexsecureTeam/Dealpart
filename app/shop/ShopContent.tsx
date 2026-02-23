'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Heart, Star, ChevronRight, ChevronDown, Loader2, X } from 'lucide-react';
import { addToCart } from '@/lib/cart';
import { useCustomerProducts, createSlug, type CustomerProduct } from '@/hooks/useCustomerProducts';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';

// Copy ALL your helper functions and logic here
const getSafeImageUrl = (image: string | null | undefined): string | null => {
  if (!image || typeof image !== 'string' || image.trim() === '') return null;
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  const cleanImage = image.startsWith('/') ? image.substring(1) : image;
  return `https://admin.bezalelsolar.com/storage/products/${cleanImage}`;
};

const getSafeBrand = (brand: any): string => {
  if (!brand || typeof brand !== 'string') return 'Other';
  return brand.trim() || 'Other';
};

const getBrandOptions = (products: CustomerProduct[]): string[] => {
  const brands = products
    .map(p => p.brand)
    .filter((brand): brand is string => brand != null && typeof brand === 'string' && brand.trim() !== '')
    .map(brand => brand.trim());
  return ['All Brands', ...Array.from(new Set(brands))];
};

export default function ShopContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  // Copy ALL your component logic from the original ShopPage
  const { data: products = [], isLoading, error, refetch } = useCustomerProducts();
  const { data: wishlist = [] } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const [adding, setAdding] = useState<Record<number, boolean>>({});
  const [priceMax, setPriceMax] = useState(1000000);
  const [brand, setBrand] = useState('All Brands');
  const [applyFilter, setApplyFilter] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Filter products by search query
  const filteredBySearch = useMemo(() => {
    if (!searchQuery) return products;
    return products.filter((p: CustomerProduct) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  useEffect(() => {
    if (filteredBySearch.length > 0) {
      const max = Math.max(...filteredBySearch.map(p => p.price || 0));
      setPriceMax(max);
    }
  }, [filteredBySearch]);

  const brandOptions = useMemo(() => getBrandOptions(filteredBySearch), [filteredBySearch]);

  const displayProducts = useMemo(() => {
    let result = [...filteredBySearch];
    
    if (applyFilter) {
      result = result.filter((p) => (p.price || 0) <= priceMax);
      if (brand !== 'All Brands') {
        result = result.filter((p) => getSafeBrand(p.brand) === brand);
      }
    }

    switch (sortBy) {
      case 'price-low-high':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high-low':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'popularity':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default: break;
    }

    return result;
  }, [filteredBySearch, priceMax, brand, sortBy, applyFilter]);

  const handleImageError = (productId: number) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const handleWishlistToggle = async (productId: number) => {
    try {
      const item = wishlist.find((item) => item.product_id === productId);
      if (item) {
        await removeFromWishlist.mutateAsync(item.id);
      } else {
        await addToWishlist.mutateAsync(productId);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    }
  };

  async function handleAddToCart(product: CustomerProduct) {
    try {
      setAdding((prev) => ({ ...prev, [product.id]: true }));
      const color = (product as any).color || (product as any).colour || 'default';
      await addToCart(product.id, 1, product.price || 0, color);
      alert('Added to cart ✅');
    } catch (e: any) {
      if (e?.message === 'LOGIN_REQUIRED' || e?.message === 'SESSION_EXPIRED') {
        router.push(`/login?next=${encodeURIComponent(pathname || '/shop')}`);
        return;
      }
      alert(e?.message || 'Failed to add to cart');
    } finally {
      setAdding((prev) => ({ ...prev, [product.id]: false }));
    }
  }

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
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error instanceof Error ? error.message : 'Failed to load products'}</p>
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

  // Copy the rest of your JSX from the original ShopPage
  return (
    <div className="min-h-screen bg-[#EAF8E7]/50">
      <div className="container mx-auto px-4 py-6 md:py-10">
        <div className="text-sm text-gray-600 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-[#4EA674]">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/shop" className="hover:text-[#4EA674]">Shop</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#4EA674] font-medium">All Products</span>
          {searchQuery && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-600">Search: "{searchQuery}"</span>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-80 bg-white rounded-xl p-6 shadow-sm h-fit lg:sticky lg:top-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Filter By Price</h2>
            <div className="mb-8">
              <label className="block text-sm text-gray-600 mb-2">Price (max)</label>
              <input
                type="range"
                min="0"
                max={filteredBySearch.length > 0 ? Math.max(...filteredBySearch.map(p => p.price || 0)) : 1000000}
                step="10000"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4EA674]"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>₦0</span>
                <span>₦{priceMax.toLocaleString()}</span>
              </div>
              <button
                onClick={() => setApplyFilter(true)}
                className="w-full mt-4 py-2.5 bg-[#4EA674] text-white rounded-lg font-medium hover:bg-[#3e8c5f] transition"
              >
                Apply Filter
              </button>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-4">Filter By Brands</h2>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674] text-gray-700"
            >
              {brandOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </aside>

          <main className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                <span>Showing {displayProducts.length} / {filteredBySearch.length}</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#4EA674]"
                  >
                    <option value="default">Default sorting</option>
                    <option value="price-low-high">Price: low to high</option>
                    <option value="price-high-low">Price: high to low</option>
                    <option value="popularity">Popularity</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {displayProducts.length === 0 ? (
              <div className="text-center py-20 text-gray-600 bg-white rounded-xl">
                {searchQuery ? (
                  <div>
                    <p className="text-lg mb-2">No products found for "{searchQuery}"</p>
                    <p className="text-sm text-gray-500">Try checking your spelling or using different keywords</p>
                    <Link
                      href="/shop"
                      className="inline-block mt-4 px-6 py-2 bg-[#4EA674] text-white rounded-lg text-sm font-medium hover:bg-[#3D8B59] transition"
                    >
                      Clear Search
                    </Link>
                  </div>
                ) : (
                  'No products match your filters. Try adjusting price or brand.'
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {displayProducts.map((product) => {
                  const isInWishlist = wishlist.some((item) => item.product_id === product.id);
                  const safeImageUrl = getSafeImageUrl(product.image);
                  const hasImageError = imageErrors[product.id];
                  
                  return (
                    <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                      <div className="relative pt-[75%] bg-gray-100">
                        {safeImageUrl && !hasImageError ? (
                          <Image 
                            src={safeImageUrl} 
                            alt={product.name || 'Product'} 
                            fill 
                            className="object-cover"
                            onError={() => handleImageError(product.id)}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-bold text-[#4EA674]/30">
                              {product.name ? product.name.charAt(0).toUpperCase() : 'P'}
                            </span>
                          </div>
                        )}
                        
                        <button
                          onClick={() => handleWishlistToggle(product.id)}
                          disabled={addToWishlist.isPending || removeFromWishlist.isPending}
                          className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition z-10"
                        >
                          <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">{product.name || 'Unnamed Product'}</h3>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs font-medium mb-2 ${
                          product.stock_status === 'in_stock'
                            ? 'text-green-600'
                            : product.stock_status === 'low_stock'
                            ? 'text-orange-600'
                            : 'text-red-600'
                        }`}>
                          {product.stock_status === 'in_stock'
                            ? 'In stock'
                            : product.stock_status === 'low_stock'
                            ? 'Low stock'
                            : 'Out of stock'}
                        </p>
                        <p className="text-xl font-bold text-[#4EA674] mb-4">₦{(product.price || 0).toLocaleString()}</p>
                        <div className="flex gap-3">
                          <Link
                            href={`/products/${product.slug || (product.name ? createSlug(product.name) : 'product')}`}
                            className="flex-1 text-center py-2 border border-[#4EA674] text-[#4EA674] rounded-full text-sm font-medium hover:bg-[#4EA674]/10 transition"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={adding[product.id] || product.stock_status === 'out_of_stock'}
                            className="flex-1 bg-[#4EA674] text-white py-2 rounded-full text-sm font-medium hover:bg-[#3e8c5f] transition disabled:opacity-60"
                          >
                            {adding[product.id] ? 'Adding...' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}