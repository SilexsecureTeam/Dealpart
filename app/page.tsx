"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronRight, Heart, Star, Loader2 } from "lucide-react";
import { customerApi } from "@/lib/customerApiClient";
import { addToCart } from "@/lib/cart";

function toNumberPrice(price: string | number) {
  if (typeof price === "number") return price;
  const cleaned = price.replace(/[^\d.]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

// ---------- Types ----------
interface Product {
  id: number;
  name: string;
  price: number;
  sale_price?: number | null;
  image: string;
  rating?: number;
  stock_status?: "in_stock" | "low_stock" | "out_of_stock";
  stock_quantity?: number;
  is_featured?: boolean;
  is_hot?: boolean;
  short_description?: string;
}

interface Category {
  id: number;
  name: string;
  image: string | null;
}

// ---------- Type‑Safe Fallback Data ----------
const fallbackFeatured: Product[] = [
  {
    id: 1,
    name: "Apex 550W Monocrystalline Panel",
    price: 29.99,
    image: "/offer.jpg",
    rating: 5,
    stock_status: "in_stock",
  },
  {
    id: 2,
    name: "Lithium LiFePO4 Battery 12V / 100Ah",
    price: 40.99,
    image: "/offer.jpg",
    rating: 5,
    stock_status: "low_stock",
  },
  {
    id: 3,
    name: "Solar Motion Sensor Light (24W)",
    price: 119.99,
    image: "/offer.jpg",
    rating: 5,
    stock_status: "in_stock",
  },
  {
    id: 4,
    name: "MPPT Charge Controller 60A",
    price: 119.99,
    image: "/offer.jpg",
    rating: 5,
    stock_status: "in_stock",
  },
];

const fallbackNewArrivals: Product[] = [
  {
    id: 101,
    name: "Apex 550W Monocrystalline Panel",
    price: 29.99,
    image: "/solarpanel.png",
    rating: 5,
    stock_status: "in_stock",
    short_description: "High-efficiency solar panel",
    is_featured: true,
    is_hot: false,
  },
  {
    id: 102,
    name: "Lithium LiFePO4 Battery 12V / 100Ah",
    price: 40.99,
    image: "/solarpanel.png",
    rating: 5,
    stock_status: "in_stock",
    short_description: "Safe, long-life lithium technology",
    is_hot: true,
    is_featured: false,
  },
  {
    id: 103,
    name: "Solar Motion Sensor Light (24W)",
    price: 119.99,
    image: "/solarpanel.png",
    rating: 5,
    stock_status: "in_stock",
    short_description: "Smart motion-activated lighting",
    is_hot: true,
    is_featured: false,
  },
  {
    id: 104,
    name: "MPPT Charge Controller 60A",
    price: 119.99,
    image: "/solarpanel.png",
    rating: 5,
    stock_status: "in_stock",
    short_description: "Maximum power point tracking",
    is_hot: true,
    is_featured: false,
  },
];

const fallbackCategories: Category[] = [
  { id: 1, name: "PV Solar Panels", image: "/solarpanel.png" },
  { id: 2, name: "Inverters", image: "/solarpanel.png" },
  { id: 3, name: "Batteries", image: "/solarpanel.png" },
  { id: 4, name: "Charge Controllers", image: "/solarpanel.png" },
  { id: 5, name: "Stabilizers", image: "/solarpanel.png" },
  { id: 6, name: "Accessories", image: "/solarpanel.png" },
];

// ---------- Main Component ----------
export default function LandingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [adding, setAdding] = useState<Record<number, boolean>>({});
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------- Fetch Data ----------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.allSettled([
          customerApi.products.list(new URLSearchParams({ limit: "20" })),
          customerApi.products.list(new URLSearchParams({ category: "all" })),
        ]);

        if (productsData.status === "fulfilled") {
          const allProducts = productsData.value.data || productsData.value.products || [];
          setFeaturedProducts(allProducts.slice(0, 4));
          setNewArrivals(allProducts.slice(4, 8));
        } else {
          setFeaturedProducts(fallbackFeatured);
          setNewArrivals(fallbackNewArrivals);
        }

        if (categoriesData.status === "fulfilled") {
          const cats = categoriesData.value.data || categoriesData.value.categories || [];
          setCategories(cats.slice(0, 6));
        } else {
          setCategories(fallbackCategories);
        }
      } catch (error) {
        console.error("Failed to fetch landing page data:", error);
        setFeaturedProducts(fallbackFeatured);
        setNewArrivals(fallbackNewArrivals);
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ---------- Add to Cart Handler ----------
  async function handleAddToCart(id: number, price: number) {
    try {
      setAdding((prev) => ({ ...prev, [id]: true }));
      await addToCart(id, 1, price);
      alert("Added to cart ✅");
    } catch (e: any) {
      if (e?.message === "LOGIN_REQUIRED" || e?.message === "SESSION_EXPIRED") {
        router.push(`/login?next=${encodeURIComponent(pathname || "/")}`);
        return;
      }
      alert(e?.message || "Failed to add to cart");
    } finally {
      setAdding((prev) => ({ ...prev, [id]: false }));
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-[#4EA674]" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* ---------- Hero Section ---------- */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <Image
          src="/homebg.png"
          alt="Energy Independence"
          fill
          priority
          className="object-cover scale-105 brightness-[0.92]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#023337cc] via-[#02333788] to-transparent" />
        <div className="relative z-10 container mx-auto px-5 sm:px-8 text-center text-white">
          <h1 className="text-4xl sm:text-2xl md:text-4xl lg:text-7xl font-black mb-6 leading-tight">
            Energy Independence Starts Here
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-10 max-w-3xl text-white mx-auto">
            Spring Sale: Free Shipping on orders over ₦500,000.
          </p>
          <button className="bg-[#4EA674] hover:bg-[#3D8B59] text-white font-bold px-10 py-5 rounded-full text-lg shadow-xl hover:shadow-2xl transition hover:scale-105">
            Shop Now
          </button>
        </div>
      </section>

      {/* ---------- Category Highlights ---------- */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Solar Panels (first category) */}
            <div className="relative rounded-xl overflow-hidden shadow-2xl group h-[500px] lg:h-[600px]">
              <Image
                src={categories[0]?.image || "/offer.jpg"}
                alt={categories[0]?.name || "Solar Panels"}
                fill
                className="object-cover group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#023337]/90 via-[#023337]/50 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-black mb-3">
                  {categories[0]?.name || "Solar Panels"}
                </h3>
                <p className="text-base md:text-lg text-white mb-6">High-efficiency solar panels</p>
                <button className="px-8 py-3 bg-white text-[#023337] font-bold rounded-full hover:bg-gray-100 transition">
                  Shop Now
                </button>
              </div>
            </div>

            <div className="grid grid-rows-2 gap-6 lg:gap-8">
              {/* Inverters (second category) */}
              <div className="relative rounded-xl overflow-hidden shadow-xl group">
                <Image
                  src={categories[1]?.image || "/offer.jpg"}
                  alt={categories[1]?.name || "Inverters"}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#023337]/90 via-[#023337]/50 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white">
                  <h3 className="text-3xl md:text-4xl font-black mb-3">
                    {categories[1]?.name || "Inverters"}
                  </h3>
                  <button className="px-6 py-3 bg-white text-[#023337] font-bold rounded-full hover:bg-gray-100 transition">
                    Shop Now
                  </button>
                </div>
              </div>

              {/* Charge Controllers & Batteries (third & fourth categories) */}
              <div className="grid grid-cols-2 gap-6">
                {categories.slice(2, 4).map((cat) => (
                  <div
                    key={cat.id}
                    className="relative rounded-xl overflow-hidden shadow-xl group aspect-square"
                  >
                    <Image
                      src={cat.image || "/offer.jpg"}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#023337]/90 via-[#023337]/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                      <h3 className="text-2xl md:text-3xl font-black mb-2">{cat.name}</h3>
                      <button className="px-4 py-2 bg-white text-[#023337] font-bold rounded-full hover:bg-gray-100 transition text-sm">
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

      {/* ---------- Best Offers ---------- */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#023337]">
              The Best Offers
            </h2>
            <button className="px-5 sm:px-6 py-2 border border-[#4EA674] text-[#4EA674] rounded-full text-sm sm:text-base hover:bg-[#4EA674] hover:text-white transition">
              View All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7 lg:gap-8">
            {featuredProducts.map((p) => {
              const priceVal = p.sale_price || p.price;
              const stockText =
                p.stock_status === "low_stock"
                  ? "Only 4 left"
                  : p.stock_status === "in_stock"
                  ? "In stock"
                  : "Out of stock";
              return (
                <div
                  key={p.id}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={p.image || "/offer.jpg"}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                    <button className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow">
                      <Heart className="w-5 h-5 text-[#023337]" />
                    </button>
                  </div>
                  <div className="p-4 md:p-5">
                    <h3 className="font-bold text-base md:text-lg line-clamp-2 mb-2">{p.name}</h3>
                    <div className="flex mb-2">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < (p.rating || 5)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                    </div>
                    <p
                      className={`text-sm font-bold mb-3 ${
                        p.stock_status === "low_stock" ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {stockText}
                    </p>
                    <p className="text-xl md:text-2xl font-black text-[#4EA674] mb-4">
                      ₦{priceVal.toLocaleString()}
                    </p>
                    <div className="flex gap-3">
                      <button className="flex-1 border-2 border-[#4EA674] text-[#4EA674] py-2.5 rounded-full text-sm hover:bg-[#4EA674] hover:text-white transition">
                        Details
                      </button>
                      <button
                        onClick={() => handleAddToCart(p.id, priceVal)}
                        disabled={adding[p.id]}
                        className="flex-1 bg-[#4EA674] text-white py-2.5 rounded-full text-sm hover:bg-[#3D8B59] transition disabled:opacity-60"
                      >
                        {adding[p.id] ? "Adding..." : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Explore Categories ---------- */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#023337] mb-8 md:mb-12">
            Explore Categories
          </h2>
          <div className="relative">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
              {categories.slice(0, 6).map((cat) => (
                <div key={cat.id} className="group cursor-pointer">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
                    <Image
                      src={cat.image || "/solarpanel.png"}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <p className="absolute bottom-4 left-4 right-4 text-white font-bold text-sm md:text-base text-center">
                      {cat.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/categories"
              className="absolute top-1/2 right-0 -translate-y-1/2 z-10 w-10 h-10 bg-white/70 backdrop-blur rounded-full flex items-center justify-center hover:bg-white shadow transition"
            >
              <ChevronRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- New Arrivals ---------- */}
      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-black text-[#023337]">New Arrivals</h2>
            <button className="px-5 py-2 border border-[#4EA674] text-[#4EA674] rounded-full text-sm md:text-base hover:bg-[#4EA674] hover:text-white transition">
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
            {newArrivals.map((p) => {
              const priceVal = p.sale_price || p.price;
              const stockText =
                p.stock_status === "low_stock"
                  ? "Only 4 left"
                  : p.stock_status === "in_stock"
                  ? "In stock"
                  : "Out of stock";
              return (
                <div
                  key={p.id}
                  className={`rounded-xl shadow-md hover:shadow-xl transition hover:-translate-y-1 overflow-hidden flex flex-col ${
                    p.is_featured ? "bg-gradient-to-br from-[#EAF8E7] to-[#21C45D]" : "bg-white"
                  }`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={p.image || "/offer.jpg"}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                    {p.is_hot && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Hot
                      </span>
                    )}
                    <button className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white">
                      <Heart className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>

                  <div className="p-4 sm:p-5">
                    <h3 className="font-bold text-base sm:text-lg lg:text-xl mb-1 line-clamp-2">
                      {p.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {p.short_description || "High-quality solar product"}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < (p.rating || 5)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          p.stock_status === "low_stock" ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {stockText}
                      </span>
                    </div>

                    <p className="text-xl sm:text-2xl font-black text-[#4EA674] mb-4">
                      ₦{priceVal.toLocaleString()}
                    </p>

                    <div className="flex gap-3">
                      <button className="flex-1 border-2 border-[#4EA674] text-[#4EA674] py-2 rounded-full text-sm hover:bg-[#4EA674] hover:text-white transition">
                        View Details
                      </button>
                      <button
                        onClick={() => handleAddToCart(p.id, priceVal)}
                        disabled={adding[p.id]}
                        className="flex-1 bg-[#4EA674] text-white py-2 rounded-full text-sm hover:bg-[#3D8B59] transition disabled:opacity-60"
                      >
                        {adding[p.id] ? "..." : "Add to cart"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Rilsopower Stabilizers ---------- */}
      <section className="py-12 md:py-16 lg:py-20 xl:py-24 bg-gradient-to-b from-[#EAF8E7] to-[#56e68a] overflow-hidden">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
          <div className="relative mb-12">
            <div className="max-w-3xl lg:max-w-4xl mx-auto">
              <Image
                src="/solarpanel.png"
                alt="Rilsopower"
                width={800}
                height={800}
                className="object-contain drop-shadow-2xl mx-auto"
                priority
              />
            </div>
            <div className="mt-8 text-center lg:absolute lg:top-10 lg:right-10 lg:mt-0 lg:text-right lg:max-w-md">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
                Rilsopower Stabilizers
              </h2>
              <p className="text-lg md:text-xl text-gray-700 mb-6">
                Best automatic voltage regulators
              </p>
              <button className="px-8 md:px-12 py-4 bg-[#023337] text-[#21C45D] font-bold rounded-full hover:bg-[#3D8B59] transition text-lg">
                Shop Now
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-xl transition"
              >
                <div className="relative aspect-square mb-3 bg-gray-50 rounded-lg overflow-hidden">
                  <Image src="/solarpanel.png" alt="AE Dunamis" fill className="object-contain p-4" />
                </div>
                <h4 className="font-bold text-sm mb-1">AE Dunamis</h4>
                <div className="flex justify-center mb-1">
                  {Array(5)
                    .fill(0)
                    .map((_, s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-yellow-400" />
                    ))}
                </div>
                <p className="text-xs text-green-600 font-bold mb-1">In stock</p>
                <p className="text-sm md:text-base font-black text-[#4EA674]">₦40.99</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Inverter Batteries + 3 Types ---------- */}
      <section className="py-12 md:py-16 lg:py-20 xl:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-6 gap-6 lg:gap-8 xl:gap-10">
            {/* Left - Large promo banner */}
            <div className="lg:col-span-3 xl:col-span-4 relative rounded-2xl overflow-hidden shadow-2xl min-h-[400px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-[560px] xl:min-h-[620px] group order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0D4A4A]/95 via-[#062828]/90 to-black/80" />
              <div className="absolute left-4 sm:left-8 md:left-12 lg:left-16 top-1/2 -translate-y-1/2 w-3/5 sm:w-2/3 md:w-3/5 lg:w-1/2 xl:w-5/12">
                <div className="relative transform -rotate-12 scale-105 sm:scale-110 md:scale-115 lg:scale-120 xl:scale-125">
                  <Image
                    src="/solarpanel.png"
                    alt="Inverter Batteries"
                    width={900}
                    height={900}
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-end pr-6 sm:pr-10 md:pr-16 lg:pr-20 xl:pr-24">
                <div className="text-right max-w-md lg:max-w-lg xl:max-w-2xl">
                  <h2 className="text-4xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-black italic text-white mb-4 md:mb-6 drop-shadow-2xl leading-tight">
                    Inverter Batteries
                  </h2>
                  <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-medium drop-shadow-lg">
                    Power When You Need It Most: Inverter Batteries for Your Solar System
                  </p>
                </div>
              </div>
            </div>

            {/* Right - Featured product card */}
            <div className="lg:col-span-2 xl:col-span-2 bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col order-1 lg:order-2">
              <div className="relative h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96">
                <Image src="/offer.jpg" alt="AFRICELL (10KWH)HY Wall Mounted" fill className="object-cover" />
                <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-1 rounded-full text-xs sm:text-sm font-bold uppercase shadow-md">
                  Hot
                </div>
                <button className="absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                </button>
              </div>

              <div className="p-5 sm:p-6 lg:p-7 flex flex-col flex-grow">
                <h3 className="text-xl sm:text-2xl lg:text-2.5xl font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
                  AFRICELL (10KWH) HY Wall Mounted
                </h3>
                <p className="text-sm sm:text-base text-gray-500 uppercase tracking-wide mb-4">
                  LITHIUM BATTERY
                </p>
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-3 text-sm sm:text-base text-gray-600 font-medium">
                    In stock
                  </span>
                </div>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#4EA674] mb-6">
                  ₦1,700,000.00
                </p>

                <div className="mt-auto flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 border-2 border-[#4EA674] text-[#4EA674] py-3 rounded-full font-semibold hover:bg-[#4EA674] hover:text-white transition text-sm sm:text-base">
                    View Details
                  </button>
                  <button
                    onClick={() => handleAddToCart(9999, 1700000)}
                    disabled={adding[9999]}
                    className="flex-1 bg-[#023337] text-white py-3 rounded-full font-bold hover:bg-[#034449] transition disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {adding[9999] ? "Adding..." : "Add to Cart"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Three battery types */}
          <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Dry Cell",
                gradient: "from-[#7D0707] via-[#B00707] to-[#CA0808]",
                textColor: "text-red-700",
              },
              {
                name: "Gel",
                gradient: "from-[#ECCB0F] via-[#E6C000] to-[#FBBD23]",
                textColor: "text-yellow-700",
              },
              {
                name: "Tubular",
                gradient: "from-[#000000] to-[#023337]",
                textColor: "text-green-800",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="relative rounded-xl overflow-hidden h-80 md:h-96 group shadow-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${t.gradient}`} />
                <div className="absolute inset-0 flex items-center justify-end pr-10 md:pr-16">
                  <div className="relative w-1/2 md:w-2/5 h-5/6">
                    <Image
                      src="/solarpanel.png"
                      alt={`${t.name} Batteries`}
                      fill
                      className="object-contain object-right group-hover:scale-105 transition duration-700"
                    />
                  </div>
                </div>
                <div className="relative z-10 h-full flex items-center pl-10 md:pl-16">
                  <div className="text-left max-w-[55%]">
                    <h3 className="text-3xl md:text-4xl font-black text-white mb-4 drop-shadow-lg">
                      {t.name}
                    </h3>
                    <p className="text-lg md:text-xl text-white/90 mb-6">{t.name} Batteries</p>
                    <button
                      className={`px-6 py-4 bg-white ${t.textColor} font-bold rounded-full hover:bg-gray-100 transition text-lg`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}