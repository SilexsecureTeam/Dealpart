// app/products/[slug]/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart, ChevronRight, Truck, ShieldCheck, Package } from 'lucide-react';

// Mock product data (replace with real fetch later using params.slug)
const getProduct = (slug: string) => {
  // Match the slug from your shop page
  if (slug === 'felicity-ivem6048-6kva-hybrid-inverter-48v') {
    return {
      name: 'Felicity IVEM6048 - 6kVA Hybrid Inverter (48V)',
      price: 635000,
      oldPrice: 720000,
      image: '/solarpanel.png',
      description: 'High-performance hybrid inverter with pure sine wave output, built-in MPPT solar charge controller, and smart battery management for reliable solar power.',
      features: [
        'Pure sine wave output for sensitive electronics',
        'Built-in MPPT solar charge controller',
        'High efficiency up to 98%',
        'Smart battery management system',
        'Remote monitoring via mobile app',
        'Overload, short circuit and over-temperature protection',
      ],
      rating: 4.8,
      reviews: 128,
      watchers: 12,
      stock: 'In Stock',
      warranty: '2 Years',
      delivery: 'Nationwide delivery in Nigeria (2-5 working days)',
      pickup: 'Available for pickup in Lagos',
      payment: 'Bank Transfer, POS, Cash on Delivery',
      returnPolicy: '7 Days Return (conditions apply)',
    };
  }
  return null;
};

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <h1 className="text-3xl md:text-4xl font-bold text-red-600">Product Not Found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 text-sm text-gray-600 flex items-center gap-2">
          <Link href="/" className="hover:text-[#4EA674]">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/inverters" className="hover:text-[#4EA674]">Inverters</Link>
          <ChevronRight className="w-4 h-4" />
        <Link href="/inverters" className="hover:text-[#090a0a]">Hybrid Inverters</Link>
          <ChevronRight className='w-4 h-4' />
          <span className="text-[#4EA674] font-medium">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left - Image Gallery */}
          <div className="space-y-6">
            {/* Main Image with Click to Enlarge */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-50 shadow-xl group cursor-zoom-in">
              <div className="relative aspect-[4/3]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-8 transition-transform duration-300 group-hover:scale-110"
                  priority
                />

                {/* Click to enlarge overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white text-3xl mb-2">↔</span>
                  <span className="text-white text-sm font-medium bg-black/60 px-4 py-2 rounded-full">
                    Click to enlarge
                  </span>
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3 md:gap-4">
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-[#4EA674] cursor-pointer shadow-sm">
                <Image src={product.image} alt="Main view" fill className="object-cover" />
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-[#4EA674] transition-colors">
                <Image src={product.image} alt="Side view 1" fill className="object-cover" />
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-[#4EA674] transition-colors">
                <Image src={product.image} alt="Side view 2" fill className="object-cover" />
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-[#4EA674] transition-colors">
                <Image src={product.image} alt="Side view 3" fill className="object-cover" />
              </div>
            </div>
          </div>

          {/* Right - Product Details */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-800 mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Rating + Watchers */}
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">({product.reviews} reviews)</span>
                </div>
                <div className="text-gray-700 font-medium">
                  {product.watchers} people watching
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-5xl font-black text-[#4EA674]">
                  ₦{product.price.toLocaleString()}
                </span>
                {product.oldPrice && (
                  <span className="text-2xl text-gray-500 line-through">
                    ₦{product.oldPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Stock */}
              <div className="inline-block px-5 py-2 bg-green-100 text-green-700 rounded-full text-base font-medium mb-6">
                {product.stock}
              </div>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-700 leading-relaxed">
              {product.description}
            </p>

            {/* Features */}
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Key Features</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 text-base">
                {product.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
              <button className="flex-1 flex items-center justify-center gap-3 bg-[#4EA674] text-white py-4 rounded-full font-bold hover:bg-[#3e8c5f] transition text-lg shadow-md">
                <ShoppingCart className="w-6 h-6" />
                Add to Cart
              </button>
              <button className="flex-1 border-2 border-[#4EA674] text-[#4EA674] py-4 rounded-full font-bold hover:bg-[#4EA674]/10 transition text-lg">
                Buy Now
              </button>
            </div>

            {/* Delivery & Policy Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-gray-200">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Truck className="w-6 h-6 text-[#4EA674] mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Delivery</h4>
                    <p className="text-gray-600">{product.delivery}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Package className="w-6 h-6 text-[#4EA674] mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Pickup</h4>
                    <p className="text-gray-600">{product.pickup}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-[#4EA674] mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Warranty</h4>
                    <p className="text-gray-600">{product.warranty}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-[#4EA674] mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Return Policy</h4>
                    <p className="text-gray-600">{product.returnPolicy}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}