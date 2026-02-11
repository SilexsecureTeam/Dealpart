'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Eye,
  Package,
  Truck,
  ShieldCheck,
  Clock,
  ChevronRight,
  Star,
  Globe,
  Heart,
  Loader2,
} from 'lucide-react';
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
  reviews_count?: number;
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  category_id?: number;
  category_name?: string;
  description?: string;
  features?: string[];
  watchers?: number;
  deliveryOptions?: Array<{
    icon: string;
    title: string;
    description: string;
    time: string;
    cost: string;
  }>;
  warranty?: string;
}

interface RelatedProduct {
  id: number;
  name: string;
  price: number;
  rating: number;
  image: string;
  slug: string;
}

// ---------- Fallback product (when API fails) ----------
const fallbackProduct: Product = {
  id: 123,
  name: 'Felicity IVEM6048 - 6kVA Hybrid Inverter (48V)',
  slug: 'felicity-ivem6048-6kva-hybrid-inverter-48v',
  price: 635000,
  image: '/solarpanel.png',
  rating: 4.5,
  reviews_count: 128,
  stock_status: 'in_stock',
  category_id: 2,
  category_name: 'Inverters',
  description:
    'The Felicity FLA48300 is a high-capacity 48V 300Ah lithium battery designed for residential and commercial energy storage applications. Engineered for efficiency, safety, and long lifespan, it delivers stable power supply and seamless integration with solar systems and hybrid inverters.',
  features: [
    'Pure sine wave 6kVA output - safe for all electronics.',
    'Built-in MPPT solar charge controller (up to 120A).',
    'Supports lithium, GEL, and AGM batteries.',
    'Wide 90-280V AC input for grid flexibility.',
    'LCD screen with real-time monitoring and settings.',
    'Auto-restart, overload, surge, and short-circuit protection.',
  ],
  watchers: 12,
  deliveryOptions: [
    {
      icon: 'pickup',
      title: 'Pick up from the store',
      description: 'Walk in to our store to pick up your package',
      time: '',
      cost: 'Free',
    },
    {
      icon: 'courier',
      title: 'Courier delivery',
      description: 'Our courier will deliver to the specified address (within Abuja)',
      time: '2-5 Hours',
      cost: 'Free',
    },
    {
      icon: 'courier',
      title: '',
      description: 'Our courier will deliver to the specified address (within Abuja)',
      time: '1-5 Days',
      cost: 'Free',
    },
  ],
};

// ---------- Main Component ----------
export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap params
  const [resolvedParams, setResolvedParams] = useState<{ slug: string } | null>(null);
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const router = useRouter();
  const pathname = usePathname();

  // ---------- State ----------
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  // ---------- Fetch Product by Slug ----------
  useEffect(() => {
    if (!resolvedParams?.slug) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch all products (or we could have a search endpoint)
        const data = await customerApi.products.list();
        const allProducts = data.data || data.products || [];

        // 2. Find product with matching slug
        let found = allProducts.find(
          (p: any) =>
            p.slug === resolvedParams.slug ||
            createSlug(p.name) === resolvedParams.slug
        );

        if (!found) {
          // If not found, use fallback
          setProduct(fallbackProduct);
          // Try to fetch related from same category (if available)
          if (fallbackProduct.category_id) {
            fetchRelated(fallbackProduct.category_id);
          }
          setLoading(false);
          return;
        }

        // 3. Fetch full product details by ID
        const detail = await customerApi.products.detail(found.id);
        const productDetail = detail.data || detail;

        // Normalize product data
        const normalized: Product = {
          id: productDetail.id,
          name: productDetail.name,
          slug: productDetail.slug || createSlug(productDetail.name),
          price: productDetail.sale_price || productDetail.price,
          image: productDetail.image || '/solarpanel.png',
          rating: productDetail.rating || 4.5,
          reviews_count: productDetail.reviews_count || 0,
          stock_status: productDetail.stock_status || 'in_stock',
          category_id: productDetail.category_id,
          category_name: productDetail.category?.name,
          description:
            productDetail.description || fallbackProduct.description,
          features: productDetail.features || fallbackProduct.features,
          watchers: productDetail.watchers || Math.floor(Math.random() * 20) + 5,
          deliveryOptions: productDetail.deliveryOptions || fallbackProduct.deliveryOptions,
        };

        setProduct(normalized);

        // 4. Fetch related products from same category
        if (normalized.category_id) {
          fetchRelated(normalized.category_id, normalized.id);
        }
      } catch (err: any) {
        console.error('Failed to fetch product:', err);
        setError(err?.message || 'Failed to load product');
        setProduct(fallbackProduct);
      } finally {
        setLoading(false);
      }
    };

    const fetchRelated = async (categoryId: number, currentProductId?: number) => {
      try {
        const params = new URLSearchParams({
          category_id: categoryId.toString(),
          limit: '4',
        });
        const data = await customerApi.products.list(params);
        let products = data.data || data.products || [];

        // Filter out current product
        if (currentProductId) {
          products = products.filter((p: any) => p.id !== currentProductId);
        }

        // Take first 4
        products = products.slice(0, 4).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.sale_price || p.price,
          rating: p.rating || 4.5,
          image: p.image || '/offer.jpg',
          slug: p.slug || createSlug(p.name),
        }));

        setRelatedProducts(products);
      } catch (err) {
        console.error('Failed to fetch related products:', err);
        // Fallback static related
        setRelatedProducts([
          {
            id: 201,
            name: 'AE Dunamis 5KVA',
            price: 450000,
            rating: 4.8,
            image: '/offer.jpg',
            slug: 'ae-dunamis-5kva',
          },
          {
            id: 202,
            name: 'Power Guard 7.5KVA',
            price: 520000,
            rating: 4.6,
            image: '/offer.jpg',
            slug: 'power-guard-7-5kva',
          },
          {
            id: 203,
            name: 'Voltage Pro 10KVA',
            price: 680000,
            rating: 4.7,
            image: '/offer.jpg',
            slug: 'voltage-pro-10kva',
          },
          {
            id: 204,
            name: 'StableMax 8KVA',
            price: 590000,
            rating: 4.5,
            image: '/offer.jpg',
            slug: 'stablemax-8kva',
          },
        ]);
      }
    };

    fetchProduct();
  }, [resolvedParams]);

  // ---------- Add to Cart Handler ----------
  async function handleAddToCart() {
    if (!product) return;
    try {
      setAdding(true);
      await addToCart(product.id, quantity, product.price);
      alert('Added to cart ✅');
    } catch (e: any) {
      if (e?.message === 'LOGIN_REQUIRED' || e?.message === 'SESSION_EXPIRED') {
        router.push(`/login?next=${encodeURIComponent(pathname || `/products/${resolvedParams?.slug}`)}`);
        return;
      }
      alert(e?.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  }

  // ---------- Quantity Controls ----------
  const increaseQty = () => setQuantity((q) => q + 1);
  const decreaseQty = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  // ---------- Loading State ----------
  if (loading || !resolvedParams) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#4EA674]" />
      </div>
    );
  }

  // ---------- Error State ----------
  if (error && !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/shop" className="px-6 py-3 bg-[#4EA674] text-white rounded-lg">
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Use product (either fetched or fallback)
  const p = product!;

  return (
    <div className="min-h-screen bg-white">
      {/* ---------- Breadcrumb ---------- */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
            <Link href="/" className="hover:text-[#4EA674]">Home</Link>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <Link href="/shop" className="hover:text-[#4EA674]">Shop</Link>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            {p.category_name && (
              <>
                <Link href={`/category/${p.category_name.toLowerCase()}`} className="hover:text-[#4EA674]">
                  {p.category_name}
                </Link>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </>
            )}
            <span className="text-gray-800 truncate max-w-xs">{p.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* ---------- LEFT COLUMN - Images ---------- */}
          <div className="space-y-6">
            <div className="relative bg-gray-50 rounded-lg overflow-hidden group cursor-pointer border">
              <div className="relative aspect-square">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-contain p-8"
                  priority
                />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-gray-600 text-sm">
                  <span className="text-lg">⤢</span>
                  <span>Click to enlarge</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 border-2 border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-[#4EA674]"
                >
                  <Image src={p.image} alt={`View ${i}`} fill className="object-cover p-2" />
                </div>
              ))}
            </div>
          </div>

          {/* ---------- RIGHT COLUMN - Info ---------- */}
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {p.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(p.rating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({p.reviews_count || 0} reviews)
              </span>
            </div>

            {/* Features */}
            <ul className="space-y-2 border-b pb-6">
              {(p.features || []).map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-black mt-1">•</span>
                  <span className="text-black text-sm cursor-pointer">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* Price */}
            <div className="text-4xl font-bold text-green-600 border-b pb-6">
              ₦{p.price.toLocaleString()}.00
            </div>

            {/* Quantity + Buttons */}
            <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center border-2 border-gray-300 rounded w-full sm:w-auto">
                <button
                  onClick={decreaseQty}
                  className="px-4 py-3 hover:bg-gray-100 text-gray-600 font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  min="1"
                  className="w-16 text-center border-x-2 border-gray-300 py-3 focus:outline-none font-semibold"
                />
                <button
                  onClick={increaseQty}
                  className="px-4 py-3 hover:bg-gray-100 text-gray-600 font-bold"
                >
                  +
                </button>
              </div>

              {/* Buttons - side by side */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="
                    flex-1 bg-[#4EA674] text-white py-3 px-6 rounded font-semibold 
                    hover:bg-[#3D8B59] transition shadow-sm disabled:opacity-60
                  "
                >
                  {adding ? 'Adding...' : 'Add to Cart'}
                </button>

                <button
                  className="
                    flex-1 bg-black text-white py-3 px-6 rounded font-semibold 
                    hover:bg-gray-800 transition shadow-sm
                  "
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* People Watching */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-700" />
              <span className="font-semibold text-green-800">{p.watchers || 12}</span>
              <span className="text-green-800 text-sm">People watching this product now!</span>
            </div>

            {/* Delivery Options */}
            <div className="border border-gray-200 rounded-lg divide-y">
              {(p.deliveryOptions || []).map((option, i) => (
                <div key={i} className="p-4 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {option.icon === 'pickup' && <Package className="w-5 h-5 mt-1 flex-shrink-0" />}
                    {option.icon === 'courier' && <Truck className="w-5 h-5 mt-1 flex-shrink-0" />}
                    <div>
                      {option.title && (
                        <h4 className="font-semibold text-gray-800 text-sm">{option.title}</h4>
                      )}
                      <p className="text-xs text-gray-600">{option.description}</p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    {option.time && <p className="text-xs text-gray-600">{option.time}</p>}
                    <p className="font-semibold text-gray-800 text-sm">{option.cost}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Warranty & Return */}
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-semibold text-sm">Warranty Policy</span>
              </div>
              <Link href="#" className="text-blue-600 hover:underline text-xs">
                More details
              </Link>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-semibold text-sm">Delivery & Return Policy</span>
              </div>
              <Link href="#" className="text-blue-600 hover:underline text-xs">
                More details
              </Link>
            </div>
          </div>
        </div>

        {/* ---------- Description & Specification ---------- */}
        <div className="max-w-7xl mx-auto mt-12 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            {/* Description */}
            <div className="bg-gray-100 rounded-xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Description
              </h2>
              <p className="text-base sm:text-lg text-gray-900 leading-relaxed">
                {p.description || fallbackProduct.description}
              </p>
            </div>

            {/* Specification */}
            <div className="bg-gray-100 rounded-xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Specification
              </h2>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Overview</h3>
              </div>

              <div className="space-y-5 text-base sm:text-lg">
                <div className="flex justify-between items-center border-b border-gray-300 pb-3">
                  <span className="font-medium text-gray-800">Brand</span>
                  <span className="text-gray-900">Felicity</span>
                </div>

                <div className="flex justify-between items-center border-b border-gray-300 pb-3">
                  <span className="font-medium text-gray-800">Rating</span>
                  <span className="text-gray-900">18V 15kW 300Ah</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Customer Reviews ---------- */}
        <div className="max-w-7xl mx-auto mt-16 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-5 sm:px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Customer Reviews</h2>
          </div>

          <div className="grid md:grid-cols-2">
            {/* LEFT: Rating Summary */}
            <div className="p-5 sm:p-6 lg:p-8 border-b md:border-b-0 md:border-r border-gray-200">
              <div className="flex justify-center sm:justify-start gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <p className="text-center sm:text-left text-sm text-gray-600 mb-6 sm:mb-8">
                {p.reviews_count || 5} reviews
              </p>

              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, s) => (
                        <Star
                          key={s}
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${
                            s < star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${(star / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Review Form */}
            <div className="p-5 sm:p-6 lg:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-5">
                Be the first to review "
                <span className="font-bold">{p.name}</span>"
              </h3>

              <p className="text-sm text-gray-600 mb-5 sm:mb-6">
                Your email address will not be published. Required fields are marked{' '}
                <span className="text-red-600">*</span>
              </p>

              {/* Rating fields */}
              <div className="space-y-6 mb-8">
                {[
                  'Your rating *',
                  'Value for money :',
                  'Durability :',
                  'Customer Support :',
                ].map((label, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <label className="text-sm font-medium text-gray-700 sm:w-48">{label}</label>
                    <div className="flex gap-1 cursor-pointer">
                      {[...Array(5)].map((_, s) => (
                        <Star
                          key={s}
                          className="w-7 h-7 sm:w-8 sm:h-8 text-gray-300 hover:text-yellow-400 transition-colors"
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {/* Review textarea */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your review * :
                  </label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name * :
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email * :
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Checkbox */}
              <div className="flex items-start gap-3 mb-6">
                <input
                  type="checkbox"
                  className="mt-1.5 w-4 h-4 text-green-600 rounded border-gray-300"
                />
                <label className="text-sm text-gray-600 leading-relaxed">
                  Save my name, email, and website in this browser for the next time I comment.
                </label>
              </div>

              <p className="text-sm text-gray-600 mb-6 sm:mb-8">
                You have to be logged in to be able to add photos to your review.
              </p>

              <button className="w-full sm:w-auto bg-green-600 text-white px-10 py-3.5 rounded-lg font-medium hover:bg-green-700 transition">
                Submit
              </button>
            </div>
          </div>

          {/* Bottom Reviews Area */}
          <div className="border-t border-gray-200 p-5 sm:p-6 lg:p-8 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Reviews</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                  <span>Only with images</span>
                </label>
                <select className="text-sm border border-gray-300 rounded px-3 py-1.5 bg-white">
                  <option>Newest</option>
                  <option>Oldest</option>
                  <option>Highest rated</option>
                </select>
              </div>
            </div>
            <div className="text-center py-12 text-gray-600 text-base">
              There is no reviews yet.
            </div>
          </div>
        </div>

        {/* ---------- Related Products ---------- */}
        {relatedProducts.length > 0 && (
          <div className="max-w-7xl mx-auto mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">Related Products</h2>
            <div className="overflow-x-auto pb-4 scrollbar-thin">
              <div className="flex gap-4 min-w-max">
                {relatedProducts.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow transition flex-shrink-0 w-[240px]"
                  >
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-t-xl"
                      />
                      <button className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                        <Heart className="w-4 h-4 text-gray-500 hover:text-red-500" />
                      </button>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        {item.name}
                      </h3>
                      <div className="flex gap-0.5 mb-1">
                        {[...Array(5)].map((_, s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s < Math.floor(item.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-green-600 mb-1">In stock</p>
                      <p className="text-base font-bold text-[#4EA674]">
                        ₦{item.price.toLocaleString()}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Link
                          href={`/products/${item.slug}`}
                          className="flex-1 border border-[#4EA674] text-[#4EA674] text-xs py-1.5 rounded hover:bg-[#4EA674] hover:text-white transition text-center"
                        >
                          View Details
                        </Link>
                        <button className="flex-1 bg-[#4EA674] text-white text-xs py-1.5 rounded hover:bg-[#3D8B59] transition">
                          Add to cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------- Recently Viewed / Similar Products (Static) ---------- */}
        <div className="max-w-7xl mx-auto mt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6">
            Recently Viewed
          </h2>
          <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="flex gap-4 sm:gap-5 min-w-max">
              {[
                {
                  name: 'Solar Panel 250W',
                  price: 85000,
                  rating: 4.9,
                  image: '/solarpanel.png',
                },
                {
                  name: 'Solar Panel 300W',
                  price: 95000,
                  rating: 4.7,
                  image: '/solarpanel.png',
                },
                {
                  name: 'Solar Panel 350W',
                  price: 105000,
                  rating: 4.8,
                  image: '/solarpanel.png',
                },
                {
                  name: 'Solar Panel 400W',
                  price: 115000,
                  rating: 4.6,
                  image: '/solarpanel.png',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="
                    bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-sm 
                    hover:shadow-md transition-all duration-300 flex-shrink-0
                    w-[220px] sm:w-[240px] lg:w-[260px]
                    h-[110px] sm:h-[130px]
                    p-3 sm:p-4 flex items-center gap-3 sm:gap-4
                  "
                >
                  <div className="relative w-16 sm:w-20 h-16 sm:h-20 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-2 sm:p-3"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 line-clamp-1">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-0.5 mb-1">
                      {[...Array(5)].map((_, s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                            s < Math.floor(item.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-green-600 mb-0.5">
                      In stock
                    </p>
                    <p className="text-sm sm:text-base font-bold text-[#4EA674]">
                      ₦{item.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}