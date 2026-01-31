'use client';
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart, Star, User,  Search, ShoppingCart, ChevronDown, MapPin } from "lucide-react";

export default function LandingPage() {
 return (
    <main className="min-h-screen bg-white">
    
      <section className="relative min-h-[70vh] w-full overflow-hidden">
  {/* Background image with subtle zoom animation */}
  <div className="absolute inset-0 animate-slow-zoom">
    <Image
      src="/homebg.png"
      alt="Energy Independence"
      fill
      priority
      className="object-cover scale-105 brightness-[0.92]"
    />
  </div>

  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-[#023337cc] via-[#02333788] to-transparent" />

  {/* Content */}
  <div className="relative z-10 container mx-auto h-[70vh] min-h-[500px] flex flex-col justify-center items-center text-center px-5 sm:px-8 md:px-12">
    
    <button
      onClick={() => console.log("Prev")}
      className="absolute left-3 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 
        w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 
        bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center 
        shadow-lg hover:bg-white transition-all duration-300"
    >
      <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-secondary group-hover:text-primary" />
    </button>

    <button
      onClick={() => console.log("Next")}
      className="absolute right-3 sm:right-6 md:right-10 top-1/2 -translate-y-1/2 
        w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 
        bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center 
        shadow-lg hover:bg-white transition-all duration-300"
    >
      <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-secondary group-hover:text-primary" />
    </button>

    {/* Text content with responsive sizing + animations */}
    <h1
      className="
        text-3xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl
        font-black text-white mb-4 sm:mb-6 md:mb-8
        leading-tight tracking-tight
        animate-fade-in-down
      "
    >
      Energy Independence Starts Here
    </h1>

    <p
      className="
        text-base sm:text-sm md:text-xl lg:text-2xl xl:text-3xl
        text-white/95 font-medium mb-8 md:mb-10 lg:mb-12
        max-w-3xl mx-auto
        animate-fade-in-up animation-delay-300
      "
    >
      Spring Sale: Free Shipping on orders over ₦500,000.
    </p>

    <button
      className="
        bg-accent-light hover:bg-accent
        text-secondary font-bold
        px-8 sm:px-10 md:px-12 py-4 sm:py-5
        rounded-full text-base sm:text-lg md:text-xl
        shadow-lg hover:shadow-xl
        transition-all duration-300 transform hover:scale-105
        animate-fade-in-up animation-delay-500
      "
    >
      Shop Now
    </button>
  </div>
</section>

    <section className="py-16 md:py-20 bg-white">
  <div className="container mx-auto px-4 md:px-6 lg:px-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      
      {/* Large Left Card - Solar Panels */}
      <div className="relative rounded-xl overflow-hidden shadow-2xl group h-[500px] lg:h-[600px]">
        <Image
          src="/offer.jpg"
          alt="Solar Panels"
          fill
          className="object-cover group-hover:scale-105 transition duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#023337]/90 via-[#023337]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-black mb-3 drop-shadow-lg">
            Solar Panels
          </h3>
          <p className="text-base md:text-lg mb-6 drop-shadow-md opacity-90">
            This is a brief Category description
          </p>
          <button className="px-8 py-3 bg-white text-[#023337] font-bold rounded-full hover:bg-gray-100 transition shadow-lg">
            Shop Now
          </button>
        </div>
      </div>

      {/* Right Side - Stacked Cards */}
      <div className="grid grid-rows-2 gap-6 lg:gap-8">
        
        {/* Top Right Card - Inverters (Full Width) */}
        <div className="relative rounded-xl overflow-hidden shadow-xl group">
          <Image
            src="/offer.jpg"
            alt="Inverters"
            fill
            className="object-cover group-hover:scale-105 transition duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#023337]/90 via-[#023337]/50 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white">
            <h4 className="text-3xl md:text-4xl font-black mb-2 drop-shadow-lg">
              Inverters
            </h4>
            <p className="text-sm md:text-base mb-4 drop-shadow-md opacity-90">
              This is a brief Category description
            </p>
            <button className="px-6 py-2.5 bg-white text-[#023337] font-bold rounded-full hover:bg-gray-100 transition shadow-md text-sm md:text-base">
              Shop Now
            </button>
          </div>
        </div>

        {/* Bottom Right - Two Equal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Charge Controllers */}
          <div className="relative rounded-xl overflow-hidden shadow-xl group">
            <Image
              src="/offer.jpg"
              alt="Charge Controllers"
              fill
              className="object-cover group-hover:scale-105 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#023337]/90 via-[#023337]/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h4 className="text-2xl md:text-3xl font-black mb-2 drop-shadow-lg">
                Charge Controllers
              </h4>
              <p className="text-xs md:text-sm mb-3 drop-shadow-md opacity-90">
                This is a brief Category description
              </p>
              <button className="px-5 py-2 bg-white text-[#023337] font-bold rounded-full hover:bg-gray-100 transition shadow-md text-sm">
                Shop Now
              </button>
            </div>
          </div>

          {/* Batteries */}
          <div className="relative rounded-xl overflow-hidden shadow-xl group">
            <Image
              src="/offer.jpg"
              alt="Batteries"
              fill
              className="object-cover group-hover:scale-105 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#023337]/90 via-[#023337]/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h4 className="text-2xl md:text-3xl font-black mb-2 drop-shadow-lg">
                Batteries
              </h4>
              <p className="text-xs md:text-sm mb-3 drop-shadow-md opacity-90">
                This is a brief Category description
              </p>
              <button className="px-5 py-2 bg-white text-[#023337] font-bold rounded-xl hover:bg-gray-100 transition shadow-md text-sm">
                Shop Now
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</section>


{/* TOP OFFERS */}
<section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    {/* Title + View All */}
    <div className="flex items-center justify-between mb-8 md:mb-12">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-secondary">
        The Best Offers
      </h2>
      <button className="px-5 sm:px-6 py-2 border border-[#4EA674] text-[#4EA674] rounded-full text-sm sm:text-base font-medium hover:bg-[#4EA674] hover:text-white transition">
        View All 
      </button>
    </div>

    {(() => {
      const products = [
        {
          id: 1,
          name: "Apex $50W Monocrystalline Panel",
          teaser: "Upgrade your energy storage with high-efficiency Apex panels...",
          price: "₦29.99",
          rating: 5,
          stock: "In stock",
          image: "/offer.jpg", 
        },
        {
          id: 2,
          name: "Lithium LiFePO4 Battery 12V / 100Ah",
          teaser: "Upgrade your energy storage with safe, long-life lithium technology...",
          price: "₦40.99",
          rating: 5,
          stock: "Only 4 units left",
          image: "/offer.jpg",
        },
        {
          id: 3,
          name: "Solar Motion Sensor Light (24z)",
          teaser: "Upgrade your energy storage with smart, energy-saving motion lighting...",
          price: "₦119.99",
          rating: 5,
          stock: "In stock",
          image: "/offer.jpg",
        },
        {
          id: 4,
          name: "MPPT Charge Controller 60A",
          teaser: "Upgrade your energy storage with maximum power point tracking efficiency...",
          price: "₦119.99",
          rating: 5,
          stock: "In stock",
          image: "/offer.jpg",
        },
      ];

      return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7 lg:gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-48 sm:h-56 md:h-64 lg:h-72">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <button className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition">
                  <Heart className="w-5 h-5 text-secondary" />
                </button>
              </div>

              <div className="p-4 sm:p-5 lg:p-6">
                <h3 className="font-bold text-base sm:text-lg lg:text-xl mb-1 line-clamp-2 text-secondary">
                  {product.name}
                </h3>

                {/* Ttext  */}
                <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                  {product.teaser}
                </p>

                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${i < product.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>

                <p className={`text-sm font-bold mb-3 ${product.stock.includes("left") ? "text-red-600" : "text-green-600"}`}>
                  {product.stock}
                </p>

                <p className="text-xl sm:text-2xl lg:text-2.5xl font-black text-primary mb-5">
                  {product.price}
                </p>

                <div className="flex gap-2 sm:gap-3">
                  <button className="flex-1 border-2 border-[#4EA674] text-[#4EA674] py-2.5 sm:py-3 rounded-full font-medium text-sm sm:text-base hover:bg-[#4EA674] hover:text-white transition">
                    View Details
                  </button>
                  <button className="flex-1 bg-[#4EA674] text-white py-2.5 sm:py-3 rounded-full font-medium text-sm sm:text-base hover:bg-[#3D8B59] transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    })()}
  </div>
</section>

{/* EXPLORE CATEGORIES */}
<section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-secondary mb-8 md:mb-12">
      Explore Categories
    </h2>

    <div className="relative">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
        {["PV Solar Panels", "Inverters", "Batteries", "Charge Controllers", "Stabilizers", "Accessories"].map((cat) => (
          <div key={cat} className="group cursor-pointer">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
              <Image
                src="/solarpanel.png"
                alt={cat}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent/10" />
              <p className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-white font-bold text-sm sm:text-base lg:text-lg text-center">
                {cat}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/categories"
        className="absolute top-1/2 -translate-y-1/2 right-0 sm:right-[-8px] md:right-[-16px] lg:right-[-24px] z-10
          w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center
          hover:bg-white hover:text-gray-900 transition-all duration-300 hover:scale-110 shadow-sm"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </Link>
    </div>
  </div>
</section>
{/* NEW ARRIVALS */}
<section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between mb-8 md:mb-12">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-secondary">
        New Arrivals
      </h2>
      <button className="px-5 sm:px-6 py-2 border border-[#4EA674] text-[#4EA674] rounded-full text-sm sm:text-base font-medium hover:bg-[#4EA674] hover:text-white transition">
        View All 
      </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
      {(() => {
        const products = [
          {
            id: 1,
            isFeatured: true,
            name: "Apex $50W Monocrystalline Panel",
            description: "High-efficiency, Durable.",
            price: "₦29.99",
            rating: 5,
            stock: "In stock", 
            image: "/solarpanel.png", 
            hot: false,
          },
          {
            id: 2,
            name: "Lithium LiFePO4 Battery 12V / 100Ah",
            description: "Upgrade your energy storage with safe, long-cycle lithium technology for reliable power backup.",
            price: "₦40.99",
            rating: 5,
            stock: "In stock",
            image: "/offer.jpg",
            hot: true,
          },
          {
            id: 3,
            name: "Solar Motion Sensor Light (24z)",
            description: "Upgrade your energy storage with smart motion-activated LED lighting for security and efficiency.",
            price: "₦119.99",
            rating: 5,
            stock: "In stock",
            image: "/offer.jpg",
            hot: true,
          },
          {
            id: 4,
            name: "MPPT Charge Controller 60A",
            description: "Upgrade your energy storage with advanced MPPT tracking for maximum solar power conversion.",
            price: "₦119.99",
            rating: 5,
            stock: "In stock",
            image: "/offer.jpg",
            hot: true,
          },
        ];

        return products.map((product) => {
          if (product.isFeatured) {
            return (
              <div
                key={product.id}
                className="bg-gradient-to-br from-[#EAF8E7] to-[#21C45D] rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden"
              >
                <div className="p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col flex-grow">
                  <h3 className="font-bold text-lg sm:text-xl md:text-2xl text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-4 line-clamp-3">
                    {product.description}
                  </p>
                  <div className="mt-auto relative aspect-[4/3] sm:aspect-[3/2] md:aspect-square">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-4 sm:p-6 md:p-8"
                    />
                  </div>
                </div>
                <button className="m-4 sm:m-5 bg-white text-[#4EA674] py-3 rounded-full font-bold hover:bg-[#3D8B59] hover:text-white transition text-sm sm:text-base">
                  Shop Now
                </button>
              </div>
            );
          }

          // Regular cards
          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-3 sm:p-4">
                {product.hot && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-bold uppercase">
                    Hot
                  </span>
                )}
                <button className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </button>
              </div>

              <div className="relative aspect-[4/3] sm:aspect-[3/2] md:aspect-square">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-4 sm:p-6 md:p-8"
                />
              </div>

              <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-grow">
                <h3 className="font-bold text-base sm:text-lg md:text-xl text-gray-900 mb-1.5 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 line-clamp-3">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${s < product.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-green-600">{product.stock}</span>
                </div>
                <p className="text-xl sm:text-2xl md:text-2.5xl font-black text-[#4EA674] mb-4">
                  {product.price}
                </p>

                <div className="flex gap-2">
                  <button className="flex-1 border-2 border-[#4EA674] text-[#4EA674] py-2.5 rounded-full text-sm sm:text-base font-bold hover:bg-[#4EA674] hover:text-white transition">
                    View Details
                  </button>
                  <button className="flex-1 bg-[#4EA674] text-white py-2.5 rounded-full text-sm sm:text-base font-bold hover:bg-[#3D8B59] transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        });
      })()}
    </div>
  </div>
</section>

<section className="py-12 md:py-16 lg:py-20 xl:py-24 bg-gradient-to-b from-[#EAF8E7] to-[#56e68a] overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Main Content Container */}
        <div className="relative mb-8 md:mb-12 lg:mb-16">
          {/* Solar Panel Image */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
              <Image
                src="/solarpanel.png"
                alt="Rilsopower Stabilizers Solar Panel"
                width={800}
                height={800}
                className="object-contain drop-shadow-2xl mx-auto"
                priority
              />
            </div>
          </div>

          {/* Text Overlay - Responsive positioning */}
          <div className="mt-6 text-center lg:absolute lg:top-8 lg:right-4 xl:top-12 xl:right-12 2xl:top-16 2xl:right-16 lg:z-10 lg:max-w-md xl:max-w-lg lg:text-right">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-3 md:mb-4 drop-shadow-lg">
              Rilsopower Stabilizers
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 font-medium mb-4 md:mb-6 lg:mb-8">
              Hurry and get the best of automatic voltage regulators
            </p>
            <button className="px-6 sm:px-8 md:px-10 lg:px-12 py-3 sm:py-4 md:py-5 bg-[#023337] text-[#21C45D] font-bold text-base sm:text-lg md:text-xl rounded-full hover:bg-[#3D8B59] transition shadow-lg transform hover:scale-105">
              Shop Now
            </button>
          </div>
        </div>

        {/* 6 Product Cards - Fully Responsive */}
        <div className="mt-8 md:mt-12 lg:mt-16">
          {/* Mobile: 1 column, SM: 2 columns, MD: 3 columns, LG: 4 columns, XL: 6 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-5 lg:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex sm:flex-col md:flex-row xl:flex-col items-center p-3 gap-3"
              >
                {/* Image */}
                <div className="relative w-20 h-20 sm:w-full sm:h-32 md:w-20 md:h-20 xl:w-full xl:h-32 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                  <Image
                    src="/solarpanel.png"
                    alt="AE Dunamis"
                    fill
                    className="object-contain p-2"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 sm:w-full text-left sm:text-center md:text-left xl:text-center">
                  <h4 className="font-bold text-xs sm:text-sm text-gray-900 mb-1 line-clamp-2">
                    AE Dunamis
                  </h4>

                  {/* Rating */}
                  <div className="flex items-center gap-0.5 mb-1 sm:justify-center md:justify-start xl:justify-center">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-[10px] sm:text-xs text-green-600 font-bold mb-1">
                    In stock
                  </p>

                  <p className="text-sm sm:text-base font-black text-[#4EA674]">
                    ₦40.99
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
      
      
{/* ===  INVERTER BATTERIES PROMO + 3 BATTERY CARDS === */}
{/* ================================================ */}

<div className="container mx-auto px-4 py-12 md:py-16 lg:py-20 xl:py-24">
  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 xl:gap-10">
    
    {/* LEFT - Wide Inverter Batteries Banner – spans 3 or 4 columns on lg+ */}
    <div className="lg:col-span-3 xl:col-span-4 relative rounded-xl lg:rounded-xl xl:rounded-2xl overflow-hidden h-80 sm:h-96 md:h-[420px] lg:h-[500px] xl:h-[560px] group shadow-2xl order-2 lg:order-1">
      
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D4A4A]/95 via-[#062828]/90 to-[#000000]" />

      {/* Solar Panel Image - positioned left and tilted  */}
      <div className="absolute left-0 sm:left-4 md:left-8 lg:left-12 top-1/2 -translate-y-1/2 w-4/5 sm:w-3/5 md:w-1/2 lg:w-5/12 xl:w-2/5">
        <div className="relative transform -rotate-12 scale-105 sm:scale-110 md:scale-115 lg:scale-120">
          <Image
            src="/solarpanel.png"
            alt="Inverter Batteries Solar Panel"
            width={800}
            height={800}
            priority
            className="object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Text content - right-aligned, takes advantage of wider space */}
      <div className="absolute inset-0 flex items-center justify-end pr-6 sm:pr-10 md:pr-12 lg:pr-16 xl:pr-20">
        <div className="text-right max-w-md lg:max-w-lg xl:max-w-xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black italic text-white mb-4 md:mb-6 drop-shadow-2xl">
            Inverter Batteries
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl text-white/90 font-medium leading-relaxed drop-shadow-lg">
            Power When You Need It Most: Inverter Batteries for Your Solar System
          </p>
        </div>
      </div>
    </div>

    {/* RIGHT - Narrow Product Card  */}
    <div className="lg:col-span-2 xl:col-span-1 bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col order-1 lg:order-2 max-w-md lg:max-w-none mx-auto lg:mx-0">
      {/* Top image */}
      <div className="relative h-48 md:h-56 lg:h-64 xl:h-72">
        <Image
          src="/offer.jpg"
          alt="AFRICELL (10KWH)HY Wall Mounted"
          fill
          className="object-cover"
        />

        {/* Hot badge - top left */}
        <div className="absolute top-4 left-4 bg-red-600 text-white px-5 py-1.5 rounded-full text-sm font-bold uppercase shadow-md">
          Hot
        </div>

        {/* Heart icon - top right */}
        <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition">
          <Heart className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6 flex flex-col flex-grow">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 leading-tight">
          AFRICELL (10KWH)HY Wall Mounted
        </h3>
        
        <p className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          LITHIUM BATTERY
        </p>

        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (  // made 5 stars for full rating look
            <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="ml-3 text-sm sm:text-base text-gray-600 font-medium">In stock</span>
        </div>

        <p className="text-2xl sm:text-3xl font-bold text-[#4EA674] mb-6">
          ₦1,700,000.00
        </p>

        <div className="mt-auto flex items-center gap-4 sm:gap-6">
          <button className="flex-1 text-[#4EA674] font-semibold text-base rounded-full sm:text-md hover:bg-[#034449]">
            View Details
          </button>
          <button className="flex-1 bg-[#023337] text-white py-3 rounded-full font-bold hover:bg-[#034449] transition text-sm sm:text-base shadow-md">
            Add to cart
          </button>
        </div>
      </div>
    </div>
  </div>

{/* BOTTOM - 3 Full-width Battery Type Cards */}
<div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
  {/* Dry Cell */}
  <div className="relative rounded-xl overflow-hidden h-96 group shadow-2xl bg-red-600">
    {/* Solid red background */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#7D0707] via-[#B00707] to-[#CA0808]" />

    {/* Image on RIGHT */}
    <div className="absolute inset-0 flex items-center justify-end pr-10 md:pr-16">
      <div className="relative w-1/2 sm:w-5/12 md:w-2/5 lg:w-1/3 h-4/5 sm:h-5/6">
        <Image
          src="/solarpanel.png" 
          alt="Dry Cell Batteries"
          fill
          className="object-contain object-right group-hover:scale-105 transition-transform duration-700"
        />
      </div>
    </div>

    {/* Text + Button on LEFT */}
    <div className="relative z-10 h-full flex items-center pl-10 md:pl-16">
      <div className="text-left max-w-[55%]">
        <h3 className="text-3xl md:text-4xl font-black text-white mb-4 drop-shadow-lg">
          Dry Cell
        </h3>
        <p className="text-xl md:text-xl text-white/90 font-medium mb-8">
          Dry Cell Batteries
        </p>
        <button className="px-5 py-5 bg-white text-red-700 font-bold rounded-full hover:bg-gray-100 transition text-lg">
          View Details
        </button>
      </div>
    </div>
  </div>

  {/* Gel */}
  <div className="relative rounded-3xl overflow-hidden h-96 group shadow-2xl bg-yellow-500">
    <div className="absolute inset-0 bg-gradient-to-r from-[#ECCB0F] via-[#E6C000] to-[#FBBD23]" />

    <div className="absolute inset-0 flex items-center justify-end pr-10 md:pr-16">
      <div className="relative w-1/2 sm:w-5/12 md:w-2/5 lg:w-1/3 h-4/5 sm:h-5/6">
        <Image
          src="/solarpanel.png"
          alt="Gel Batteries"
          fill
          className="object-contain object-right group-hover:scale-105 transition-transform duration-700"
        />
      </div>
    </div>

    <div className="relative z-10 h-full flex items-center pl-10 md:pl-16">
      <div className="text-left max-w-[55%]">
        <h3 className="text-3xl md:text-4xl font-black text-white mb-4 drop-shadow-lg">
          Gel
        </h3>
        <p className="text-xl md:text-2xl text-white/90 font-medium mb-8">
          Gel Batteries
        </p>
        <button className="px-5 py-5 bg-white text-yellow-700 font-bold rounded-full hover:bg-gray-100 transition text-lg">
          View Details
        </button>
      </div>
    </div>
  </div>

  {/* Tubular */}
  <div className="relative rounded-2xl overflow-hidden h-96 group shadow-2xl bg-green-800">
    <div className="absolute inset-0 bg-gradient-to-r from-[#000000]  to-[#023337]" />

    <div className="absolute inset-0 flex items-center justify-end pr-10 md:pr-16">
      <div className="relative w-1/2 sm:w-5/12 md:w-2/5 lg:w-1/3 h-4/5 sm:h-5/6">
        <Image
          src="/solarpanel.png"
          alt="Tubular Batteries"
          fill
          className="object-contain object-right group-hover:scale-105 transition-transform duration-700"
        />
      </div>
    </div>

    <div className="relative z-10 h-full flex items-center pl-10 md:pl-16">
      <div className="text-left max-w-[55%]">
        <h3 className="text-4xl md:text-3xl font-black text-white mb-4 drop-shadow-lg">
          Tubular
        </h3>
        <p className="text-xl md:text-2xl text-white/90 font-medium mb-8">
          Tubular Batteries
        </p>
        <button className="px-5 py-5 bg-white text-green-800 font-bold rounded-full hover:bg-gray-100 transition text-lg">
          View Details
        </button>
      </div>
    </div>
  </div>
</div>
</div>
    </main>
  );
}