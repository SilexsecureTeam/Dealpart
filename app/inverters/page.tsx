'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronRight, Heart, Star, Loader2 } from 'lucide-react';
import { customerApi } from '@/lib/customerApiClient';
import { addToCart } from '@/lib/cart';

// ---------- Helper: create slug from product name ----------
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

// ---------- Types ----------
interface Product {
  id: number;
  name: string;
  slug?: string;
  price: number;
  sale_price?: number | null;
  image: string;
  rating?: number;
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  category?: string;
  categories?: Array<{ id: number; name: string; slug: string }>;
}

// ---------- Mock/Fallback Products (type‑safe) ----------
const fallbackHybridProducts: Product[] = [
  {
    id: 1,
    name: 'Felicity IVEM6048 - 6kVA Hybrid Inverter',
    slug: 'felicity-ivem6048-6kva-hybrid-inverter-48v',
    price: 635000,
    image: '/offer.jpg',
    rating: 4.8,
    stock_status: 'in_stock',
    category: 'Hybrid Inverters',
  },
  {
    id: 2,
    name: 'Growatt 5kW Hybrid Inverter',
    slug: 'growatt-5kw-hybrid-inverter',
    price: 580000,
    image: '/offer.jpg',
    rating: 4.9,
    stock_status: 'in_stock',
    category: 'Hybrid Inverters',
  },
  {
    id: 3,
    name: 'Deye 8kW Hybrid Inverter',
    slug: 'deye-8kw-hybrid-inverter',
    price: 720000,
    image: '/offer.jpg',
    rating: 4.7,
    stock_status: 'low_stock',
    category: 'Hybrid Inverters',
  },
  {
    id: 4,
    name: 'Sunsynk 5.5kW Hybrid Inverter',
    slug: 'sunsynk-5-5kw-hybrid-inverter',
    price: 610000,
    image: '/offer.jpg',
    rating: 4.6,
    stock_status: 'in_stock',
    category: 'Hybrid Inverters',
  },
];

const fallbackStandardProducts: Product[] = [
  {
    id: 101,
    name: 'Felicity 3.5kW Standard Inverter',
    slug: 'felicity-3-5kw-standard-inverter',
    price: 295000,
    image: '/offer.jpg',
    rating: 4.5,
    stock_status: 'in_stock',
    category: 'Standard Inverters',
  },
  {
    id: 102,
    name: 'Luminous 5kW Off-Grid Inverter',
    slug: 'luminous-5kw-off-grid-inverter',
    price: 320000,
    image: '/offer.jpg',
    rating: 4.4,
    stock_status: 'low_stock',
    category: 'Standard Inverters',
  },
  {
    id: 103,
    name: 'SMA 4kW Off-Grid Inverter',
    slug: 'sma-4kw-off-grid-inverter',
    price: 410000,
    image: '/offer.jpg',
    rating: 4.6,
    stock_status: 'in_stock',
    category: 'Standard Inverters',
  },
  {
    id: 104,
    name: 'Victron 5kW Off-Grid Inverter',
    slug: 'victron-5kw-off-grid-inverter',
    price: 550000,
    image: '/offer.jpg',
    rating: 4.8,
    stock_status: 'out_of_stock',
    category: 'Standard Inverters',
  },
];

export default function InvertersPage() {
  const router = useRouter();
  const pathname = usePathname();

  // ---------- State ----------
  const [hybridProducts, setHybridProducts] = useState<Product[]>([]);
  const [standardProducts, setStandardProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<Record<number, boolean>>({});

  // ---------- Fetch Products by Category ----------
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch hybrid inverters – adjust category_id/slug to match your backend
        const hybridParams = new URLSearchParams({
          category: 'hybrid-inverters', // or use category_id
          limit: '4',
        });
        const standardParams = new URLSearchParams({
          category: 'standard-inverters',
          limit: '4',
        });

        // Fetch both in parallel
        const [hybridRes, standardRes] = await Promise.allSettled([
          customerApi.products.list(hybridParams),
          customerApi.products.list(standardParams),
        ]);

        // Process hybrid products
        if (hybridRes.status === 'fulfilled') {
          const data = hybridRes.value.data || hybridRes.value.products || [];
          const mapped = data.slice(0, 4).map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug || createSlug(p.name),
            price: p.sale_price || p.price,
            image: p.image || '/offer.jpg',
            rating: p.rating || 4.5,
            stock_status: p.stock_status || 'in_stock',
            category: 'Hybrid Inverters',
          }));
          setHybridProducts(mapped);
        } else {
          setHybridProducts(fallbackHybridProducts);
        }

        // Process standard products
        if (standardRes.status === 'fulfilled') {
          const data = standardRes.value.data || standardRes.value.products || [];
          const mapped = data.slice(0, 4).map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug || createSlug(p.name),
            price: p.sale_price || p.price,
            image: p.image || '/offer.jpg',
            rating: p.rating || 4.5,
            stock_status: p.stock_status || 'in_stock',
            category: 'Standard Inverters',
          }));
          setStandardProducts(mapped);
        } else {
          setStandardProducts(fallbackStandardProducts);
        }
      } catch (err: any) {
        console.error('Failed to fetch inverter products:', err);
        setError(err?.message || 'Failed to load products');
        setHybridProducts(fallbackHybridProducts);
        setStandardProducts(fallbackStandardProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ---------- Add to Cart Handler ----------
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

  // ---------- Loading State ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#4EA674]" />
      </div>
    );
  }

  // ---------- Error State ----------
  if (error && hybridProducts.length === 0 && standardProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[#4EA674] text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ---------- Render Product Card ----------
  const renderProductCard = (product: Product) => {
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

    return (
      <div
        key={product.id}
        className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
      >
        <div className="relative pt-[75%]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
          <button className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow">
          <h3 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base line-clamp-2 mb-1">
            {product.name}
          </h3>
          <p className="text-[#4EA674] text-[10px] sm:text-xs mb-1.5 line-clamp-1">
            {product.category || 'Inverters'}
          </p>
          <div className="flex items-center gap-0.5 mb-1.5 sm:mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                  i < Math.floor(product.rating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className={`${stockColor} text-[10px] sm:text-xs font-medium mb-1.5 sm:mb-2`}>
            {stockText}
          </p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#4EA674] mb-3 sm:mb-4">
            ₦{product.price.toLocaleString()}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto items-center sm:items-stretch">
            <Link
              href={`/products/${product.slug || createSlug(product.name)}`}
              className="text-[#4EA674] text-xs sm:text-sm font-medium hover:underline text-center sm:text-left w-full sm:w-auto py-2 sm:py-0"
            >
              View Details
            </Link>
            <button
              onClick={() => handleAddToCart(product.id, product.price)}
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

  // Use products (fetched or fallback)
  const displayHybrid = hybridProducts.length > 0 ? hybridProducts : fallbackHybridProducts;
  const displayStandard = standardProducts.length > 0 ? standardProducts : fallbackStandardProducts;

  return (
    <div className="min-h-screen bg-white">
      {/* ---------- Two Big Banner Cards (static) ---------- */}
      <section className="py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Hybrid Inverters Card */}
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden h-[400px] sm:h-[480px] md:h-[520px] lg:h-[580px] group shadow-2xl">
              <Image
                src="/offer.jpg"
                alt="Solar Hybrid Inverters"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10 lg:p-12 text-white">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black mb-3 md:mb-4 drop-shadow-xl leading-tight">
                  Solar Hybrid Inverters
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-white mb-6 md:mb-8 max-w-md drop-shadow-lg">
                  This is a brief Category description
                </p>
                <Link
                  href="/shop?type=hybrid"
                  className="inline-block px-8 md:px-10 py-4 md:py-5 bg-[#EAF8E7] text-[#4EA674] font-bold rounded-full hover:bg-white hover:text-[#3D8B59] transition shadow-lg text-base md:text-lg"
                >
                  Shop Now
                </Link>
              </div>
            </div>

            {/* Standard Inverters Card */}
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden h-[400px] sm:h-[480px] md:h-[520px] lg:h-[580px] group shadow-2xl">
              <Image
                src="/offer.jpg"
                alt="Solar Standard Inverters"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10 lg:p-12 text-white">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black mb-3 md:mb-4 drop-shadow-xl leading-tight">
                  Solar Standard Inverters
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-white mb-6 md:mb-8 max-w-md drop-shadow-lg">
                  This is a brief Category description
                </p>
                <Link
                  href="/shop?type=standard"
                  className="inline-block px-8 md:px-10 py-4 md:py-5 bg-[#EAF8E7] text-[#4EA674] font-bold rounded-full hover:bg-white hover:text-[#3D8B59] transition shadow-lg text-base md:text-lg"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Hybrid Inverters Product Grid ---------- */}
      <section className="py-10 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-12 gap-3 sm:gap-0">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-800">
              Hybrid Inverters
            </h2>
            <Link
              href="/shop?category=hybrid-inverters"
              className="inline-flex items-center px-5 py-2 sm:px-6 sm:py-2.5 border border-[#4EA674] text-[#4EA674] font-medium text-sm sm:text-base rounded-full hover:bg-[#4EA674]/10 transition whitespace-nowrap"
            >
              View all
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {displayHybrid.map((product) => renderProductCard(product))}
          </div>
        </div>
      </section>

      {/* ---------- Standard Inverters Product Grid ---------- */}
      <section className="py-10 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-12 gap-3 sm:gap-0">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-800">
              Standard Inverters
            </h2>
            <Link
              href="/shop?category=standard-inverters"
              className="inline-flex items-center px-5 py-2 sm:px-6 sm:py-2.5 border border-[#4EA674] text-[#4EA674] font-medium text-sm sm:text-base rounded-full hover:bg-[#4EA674]/10 transition whitespace-nowrap"
            >
              View all
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
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