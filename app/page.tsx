"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Heart, Star, Loader2 } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { useHomepageData } from "@/hooks/useHomepage";
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from "@/hooks/useWishlist";
import { Product, Category } from '@/types';
import styles from './HeroSection.module.css';

const resolveImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath || String(imagePath).trim() === '') return '/solarpanel.png';
  const raw = String(imagePath).trim();
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('/')) return raw;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bezalelsolar.com';
  return `${baseUrl}/storage/products/${raw}`;
};

function SafeImage({ src, alt, className = '', fill = false, width, height, priority = false }: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  const [imgSrc, setImgSrc] = useState<string>('/solarpanel.png');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const resolved = resolveImageUrl(src);
    setImgSrc(resolved);
    setIsLoading(true);
  }, [src]);

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''}`}>
      {isLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />}
      <Image
        src={imgSrc}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => {
          setImgSrc('/solarpanel.png');
          setIsLoading(false);
        }}
        priority={priority}
        unoptimized
      />
    </div>
  );
}
function toNumberPrice(price: string | number) {
  if (typeof price === "number") return price;
  const cleaned = price.replace(/[^\d.]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

export default function LandingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [adding, setAdding] = useState<Record<number, boolean>>({});
  const [cartError, setCartError] = useState<string | null>(null);

  const {
    featuredProducts,
    newArrivals,
    categories,
    isLoading,
    isError,
    refetch,
  } = useHomepageData();

  const { data: wishlist = [], isLoading: wishlistLoading } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  useEffect(() => {
    if (cartError) {
      const timer = setTimeout(() => setCartError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [cartError]);

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

  async function handleAddToCart(id: number, price: number) {
    try {
      setAdding((prev) => ({ ...prev, [id]: true }));
      setCartError(null);
      await addToCart(id, 1, price);
    } catch (e: any) {
      console.error('Add to cart error:', e);
      if (e?.message === "LOGIN_REQUIRED" || e?.message === "SESSION_EXPIRED") {
        router.push(`/login?next=${encodeURIComponent(pathname || "/")}`);
        return;
      }
      setCartError(e?.message || "Failed to add to cart");
    } finally {
      setAdding((prev) => ({ ...prev, [id]: false }));
    }
  }

  const handleShopNow = () => router.push('/shop');
  const handleCategoryShop = (categoryName: string) => {
    const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
    router.push(`/shop?category=${slug}`);
  };

  if (isLoading || wishlistLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-[#4EA674]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load content</h2>
          <p className="text-gray-600 mb-6">Please try again</p>
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

  return (
    <main className="min-h-screen bg-white">
      {cartError && (
        <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          {cartError}
        </div>
      )}

      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <Image
          src="/homebg.png"
          alt="Energy Independence"
          fill
          priority
          className="object-cover scale-105 brightness-[0.92]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#023337cc] via-[#02333788] to-transparent" />
        
        <button className="absolute left-4 md:left-8 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition">
          <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-white" />
        </button>
        
        <button className="absolute right-4 md:right-8 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition">
          <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-white" />
        </button>

        <div className="relative z-10 container mx-auto px-5 sm:px-8 text-left text-white">
          <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight ${styles.animateSlideUp}`}>
            Energy Independence Starts Here
          </h1>
          <p className={`text-lg sm:text-xl md:text-2xl lg:text-3xl mb-10 max-w-3xl text-white ${styles.animateSlideUp} ${styles.animationDelay200}`}>
            Spring Sale: Free Shipping on orders over ₦500,000.
          </p>
          <div className={`${styles.animateSlideUp} ${styles.animationDelay400}`}>
            <button 
              onClick={handleShopNow}
              className="bg-[#4EA674] hover:bg-[#3D8B59] text-white font-bold px-10 py-5 rounded-full text-lg shadow-xl hover:shadow-2xl transition hover:scale-105"
            >
              Shop Now
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="relative rounded-xl overflow-hidden shadow-2xl group h-[500px] lg:h-[600px]">
              <SafeImage
                src={categories[0]?.image}
                alt={categories[0]?.name || "offer"}
                fill
                className="object-cover group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#023337]/90 via-[#023337]/50 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-black mb-3">
                  {categories[0]?.name || "Solar Panels"}
                </h3>
                <p className="text-base md:text-lg text-white mb-6">High-efficiency solar panels</p>
                <button 
                  onClick={() => handleCategoryShop(categories[0]?.name || "Solar Panels")}
                  className="px-8 py-3 bg-white text-[#023337] font-bold rounded-full hover:bg-gray-100 transition"
                >
                  Shop Now
                </button>
              </div>
            </div>

            <div className="grid grid-rows-2 gap-6 lg:gap-8">
              <div className="relative rounded-xl overflow-hidden shadow-xl group">
                <SafeImage
                  src={categories[1]?.image}
                  alt={categories[1]?.name || "Inverters"}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#023337]/90 via-[#023337]/50 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white">
                  <h3 className="text-3xl md:text-4xl font-black mb-3">
                    {categories[1]?.name || "Inverters"}
                  </h3>
                  <button 
                    onClick={() => handleCategoryShop(categories[1]?.name || "Inverters")}
                    className="px-6 py-3 bg-white text-[#023337] font-bold rounded-full hover:bg-gray-100 transition"
                  >
                    Shop Now
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {categories.slice(2, 4).map((cat: Category) => (
                  <div
                    key={cat.id}
                    className="relative rounded-xl overflow-hidden shadow-xl group aspect-square"
                  >
                    <SafeImage
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#023337]/90 via-[#023337]/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                      <h3 className="text-2xl md:text-3xl font-black mb-2">{cat.name}</h3>
                      <button 
                        onClick={() => handleCategoryShop(cat.name)}
                        className="px-4 py-2 bg-white text-[#023337] font-bold rounded-full hover:bg-gray-100 transition text-sm"
                      >
                        Shop Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#023337]">
              The Best Offers
            </h2>
            <button 
              onClick={() => router.push('/shop')}
              className="px-5 sm:px-6 py-2 border border-[#4EA674] text-[#4EA674] rounded-full text-sm sm:text-base hover:bg-[#4EA674] hover:text-white transition"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7 lg:gap-8">
            {featuredProducts.map((p: Product) => {
              const priceVal = p.sale_price ?? p.price ?? 0;
              const isInWishlist = wishlist.some((item) => item.product_id === p.id);
              const stockText =
                p.stock_status === "low_stock" ? "Only 4 left" :
                p.stock_status === "in_stock" ? "In stock" : "Out of stock";
              return (
                <div key={p.id} className="group bg-white rounded-xl shadow-md hover:shadow-xl transition hover:-translate-y-1">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <SafeImage src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition duration-500" />
                    <button 
                      onClick={() => handleWishlistToggle(p.id)}
                      disabled={addToWishlist.isPending || removeFromWishlist.isPending}
                      className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition"
                    >
                      <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-[#023337]'}`} />
                    </button>
                  </div>
                  <div className="p-4 md:p-5">
                    <h3 className="font-bold text-base md:text-lg line-clamp-2 mb-2">{p.name}</h3>
                    <div className="flex mb-2">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < (p.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                      ))}
                    </div>
                    <p className={`text-sm font-bold mb-3 ${p.stock_status === "low_stock" ? "text-red-600" : "text-green-600"}`}>
                      {stockText}
                    </p>
                    <p className="text-xl md:text-2xl font-black text-[#4EA674] mb-4">₦{priceVal.toLocaleString()}</p>
                    <div className="flex gap-3">
                      <button onClick={() => router.push(`/products/${p.id}`)} className="flex-1 border-2 border-[#4EA674] text-[#4EA674] py-2.5 rounded-full text-sm hover:bg-[#4EA674] hover:text-white transition">Details</button>
                      <button onClick={() => handleAddToCart(p.id, priceVal)} disabled={adding[p.id]} className="flex-1 bg-[#4EA674] text-white py-2.5 rounded-full text-sm hover:bg-[#3D8B59] transition disabled:opacity-60">{adding[p.id] ? "Adding..." : "Add to Cart"}</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#023337] mb-8 md:mb-12">Explore Categories</h2>
          <div className="relative">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
              {categories.slice(0, 6).map((cat: Category) => (
                <div key={cat.id} className="group cursor-pointer" onClick={() => handleCategoryShop(cat.name)}>
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
                    <SafeImage src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-110 transition duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <p className="absolute bottom-4 left-4 right-4 text-white font-bold text-sm md:text-base text-center">{cat.name}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/categories" className="absolute top-1/2 right-0 -translate-y-1/2 z-10 w-10 h-10 bg-white/70 backdrop-blur rounded-full flex items-center justify-center hover:bg-white shadow transition">
              <ChevronRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-black text-[#023337]">New Arrivals</h2>
            <button onClick={() => router.push('/shop?sort=newest')} className="px-5 py-2 border border-[#4EA674] text-[#4EA674] rounded-full text-sm md:text-base hover:bg-[#4EA674] hover:text-white transition">View All</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
            {newArrivals.map((p: Product) => {
              const priceVal = p.sale_price ?? p.price ?? 0;
              const isInWishlist = wishlist.some((item) => item.product_id === p.id);
              const stockText = p.stock_status === "low_stock" ? "Only 4 left" : p.stock_status === "in_stock" ? "In stock" : "Out of stock";
              return (
                <div key={p.id} className={`rounded-xl shadow-md hover:shadow-xl transition hover:-translate-y-1 overflow-hidden flex flex-col ${p.is_featured ? "bg-gradient-to-br from-[#EAF8E7] to-[#21C45D]" : "bg-white"}`}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <SafeImage src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition duration-500" />
                    {p.is_hot && <span className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">Hot</span>}
                    <button onClick={() => handleWishlistToggle(p.id)} disabled={addToWishlist.isPending || removeFromWishlist.isPending} className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition">
                      <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                    </button>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="font-bold text-base sm:text-lg lg:text-xl mb-1 line-clamp-2">{p.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{p.short_description || "High-quality solar product"}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < (p.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                      <span className={`text-sm font-bold ${p.stock_status === "low_stock" ? "text-red-600" : "text-green-600"}`}>{stockText}</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-[#4EA674] mb-4">₦{priceVal.toLocaleString()}</p>
                    <div className="flex gap-3">
                      <button onClick={() => router.push(`/products/${p.id}`)} className="flex-1 border-2 border-[#4EA674] text-[#4EA674] py-2 rounded-full text-sm hover:bg-[#4EA674] hover:text-white transition">View Details</button>
                      <button onClick={() => handleAddToCart(p.id, priceVal)} disabled={adding[p.id]} className="flex-1 bg-[#4EA674] text-white py-2 rounded-full text-sm hover:bg-[#3D8B59] transition disabled:opacity-60">{adding[p.id] ? "..." : "Add to cart"}</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-[#EAF8E7] to-[#56e68a] overflow-hidden">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          <div className="relative flex flex-col lg:flex-row items-center justify-between mb-12 lg:mb-16">
            <div className="w-full lg:w-1/2 mb-8 lg:mb-0">
              <div className="relative max-w-2xl mx-auto lg:mx-0">
                <SafeImage src="/solarpanel.png" alt="Rilsopower Stabilizers" width={600} height={400} className="object-contain drop-shadow-2xl" priority />
              </div>
            </div>
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">Rilsopower Stabilizers</h2>
              <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-lg mx-auto lg:mx-0">Hurry and get the best of automatic voltage regulators</p>
              <button onClick={() => router.push('/shop?category=stabilizers')} className="px-10 py-4 bg-[#023337] text-white font-bold rounded-lg hover:bg-[#034449] transition text-lg inline-flex items-center gap-2">Shop Now <span className="text-xl">→</span></button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition">
                <div className="relative aspect-square mb-3 bg-gray-50 rounded-lg overflow-hidden">
                  <SafeImage src="/solarpanel.png" alt="AE Dunamis" fill className="object-contain p-4" />
                </div>
                <h4 className="font-bold text-sm md:text-base mb-2">AE Dunamis</h4>
                <div className="flex justify-center gap-0.5 mb-2">
                  {[...Array(4)].map((_, i) => (<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />))}
                  <Star className="w-4 h-4 text-gray-300" />
                </div>
                <p className="text-xs text-green-600 font-medium mb-2">In stock</p>
                <p className="text-base md:text-lg font-bold text-[#4EA674]">₦{idx === 1 ? "40.00" : idx === 4 ? "39.99" : "40.99"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 lg:py-20 xl:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-6 gap-6 lg:gap-8 xl:gap-10">
            <div className="lg:col-span-3 xl:col-span-4 relative rounded-2xl overflow-hidden shadow-2xl min-h-[400px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-[560px] xl:min-h-[620px] group order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0D4A4A]/95 via-[#062828]/90 to-black/80" />
              <div className="absolute left-4 sm:left-8 md:left-12 lg:left-12 top-1/2 -translate-y-1/2 w-3/5 sm:w-2/3 md:w-3/5 lg:w-1/2 xl:w-5/12">
                <div className="relative transform -rotate-12 scale-105 sm:scale-110 md:scale-115 lg:scale-120 xl:scale-125">
                  <SafeImage src="/solarpanel.png" alt="Inverter Batteries" fill={false} width={500} height={500} className="object-contain drop-shadow-2xl" priority />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-end pr-6 sm:pr-10 md:pr-16 lg:pr-20 xl:pr-24">
                <div className="text-right max-w-md lg:max-w-lg xl:max-w-2xl">
                  <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black italic text-white mb-4 md:mb-6 drop-shadow-2xl leading-tight">Inverter Batteries</h2>
                  <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-medium drop-shadow-lg">Power When You Need It Most: Inverter Batteries for Your Solar System</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 xl:col-span-2 bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col order-1 lg:order-2">
              <div className="relative h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96">
                <SafeImage src="/offer.jpg" alt="AFRICELL (10KWH)HY Wall Mounted" fill className="object-cover" />
                <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-1 rounded-full text-xs sm:text-sm font-bold uppercase shadow-md">Hot</div>
                <button className="absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                </button>
              </div>
              <div className="p-5 sm:p-6 lg:p-7 flex flex-col flex-grow">
                <h3 className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-1 leading-tight">AFRICELL (10KWH)HY</h3>
                <p className="text-lg sm:text-xl font-medium text-gray-800 mb-2">Wall Mounted</p>
                <p className="text-sm sm:text-base text-gray-500 uppercase tracking-wide mb-4">LITHIUM BATTERY</p>
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                  <div className="flex gap-1">{[...Array(5)].map((_, i) => (<Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />))}</div>
                  <span className="text-sm sm:text-base text-gray-600 font-medium">In stock</span>
                </div>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#4EA674] mb-6">₦1,700,000.00</p>
                <div className="mt-auto flex flex-col sm:flex-row gap-4">
                  <button onClick={() => router.push(`/products/9999`)} className="flex-1 border-2 border-[#4EA674] text-[#4EA674] py-3 rounded-lg font-semibold hover:bg-[#4EA674] hover:text-white transition text-sm sm:text-base">View Details</button>
                  <button onClick={() => handleAddToCart(9999, 1700000)} disabled={adding[9999]} className="flex-1 bg-[#4EA674] text-white py-3 rounded-lg font-bold hover:bg-[#3D8B59] transition disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base">{adding[9999] ? "Adding..." : "Add to cart"}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="relative rounded-2xl overflow-hidden h-80 md:h-96 group shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[#7D0707] via-[#B00707] to-[#CA0808]" />
          <div className="absolute inset-0 flex items-center justify-end pr-8 md:pr-12">
            <div className="relative w-1/2 md:w-2/5 h-5/6 transform hover:scale-105 transition duration-700">
              <SafeImage src="/solarpanel.png" alt="Dry Cell Battery" fill className="object-contain object-right" />
            </div>
          </div>
          <div className="relative z-10 h-full flex items-center pl-8 md:pl-12">
            <div className="text-left">
              <h3 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-lg">Dry Cell</h3>
              <p className="text-lg md:text-xl text-white/90 mb-6">Dry Cell Batteries</p>
              <button className="px-8 py-3 bg-white text-[#7D0707] font-bold rounded-lg hover:bg-gray-100 transition text-base">View Details</button>
            </div>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden h-80 md:h-96 group shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[#ECCB0F] via-[#E6C000] to-[#FBBD23]" />
          <div className="absolute inset-0 flex items-center justify-end pr-8 md:pr-12">
            <div className="relative w-1/2 md:w-2/5 h-5/6 transform hover:scale-105 transition duration-700">
              <SafeImage src="/solarpanel.png" alt="Gel Battery" fill className="object-contain object-right" />
            </div>
          </div>
          <div className="relative z-10 h-full flex items-center pl-8 md:pl-12">
            <div className="text-left">
              <h3 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-lg">Gel</h3>
              <p className="text-lg md:text-xl text-white/90 mb-6">Gel Batteries</p>
              <button className="px-8 py-3 bg-white text-[#B8860B] font-bold rounded-lg hover:bg-gray-100 transition text-base">View Details</button>
            </div>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden h-80 md:h-96 group shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[#000000] to-[#023337]" />
          <div className="absolute inset-0 flex items-center justify-end pr-8 md:pr-12">
            <div className="relative w-1/2 md:w-2/5 h-5/6 transform hover:scale-105 transition duration-700">
              <SafeImage src="/solarpanel.png" alt="Tubular Battery" fill className="object-contain object-right" />
            </div>
          </div>
          <div className="relative z-10 h-full flex items-center pl-8 md:pl-12">
            <div className="text-left">
              <h3 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-lg">Tubular</h3>
              <p className="text-lg md:text-xl text-white/90 mb-6">Tubular Batteries</p>
              <button className="px-8 py-3 bg-white text-[#023337] font-bold rounded-lg hover:bg-gray-100 transition text-base">View Details</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}