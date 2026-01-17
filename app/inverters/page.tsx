// app/inverters/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Heart, Star } from 'lucide-react';

export default function InvertersPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Two Big Banner Cards - exact match to your screenshot */}
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
                <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 max-w-md drop-shadow-lg">
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
                <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 max-w-md drop-shadow-lg">
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

      {/* Hybrid Inverters Product Grid */}
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
            {/* Card 1 */}
            <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="relative pt-[75%]">
                <Image src="/offer.jpg" alt="Felicity IVEM6048" fill className="object-cover" />
                <button className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow">
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base line-clamp-2 mb-1">
                  Felicity IVEM6048 - 6kVA
                </h3>
                <p className="text-[#4EA674] text-[10px] sm:text-xs mb-1.5 line-clamp-1">
                  Inverters, Hybrid Inverters
                </p>
                <div className="flex items-center gap-0.5 mb-1.5 sm:mb-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-green-600 text-[10px] sm:text-xs font-medium mb-1.5 sm:mb-2">
                  In stock
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#4EA674] mb-3 sm:mb-4">
                  ₦29.99
                </p>
               <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto items-center sm:items-stretch">
  <Link
    href="/products//felicity-ivem6048-6kva-hybrid-inverter-48v"
    className="text-[#4EA674] text-xs sm:text-sm font-medium hover:underline text-center sm:text-left w-full sm:w-auto py-2 sm:py-0"
  >
    View Details
  </Link>
 <button className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-[#4EA674] text-white rounded-full text-xs sm:text-sm font-medium hover:bg-[#3e8c5f] transition shadow-sm">
    Add to cart
  </button>
</div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="relative pt-[75%]">
                <Image src="/offer.jpg" alt="Lithium Battery" fill className="object-cover" />
                <button className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow">
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base line-clamp-2 mb-1">
                  Lithium LiFePO4 Battery 12 / 100Ah
                </h3>
                <p className="text-[#4EA674] text-[10px] sm:text-xs mb-1.5 line-clamp-1">
                  Inverters, Hybrid Inverters
                </p>
                <div className="flex items-center gap-0.5 mb-1.5 sm:mb-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-red-600 text-[10px] sm:text-xs font-medium mb-1.5 sm:mb-2">
                  4 units left
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#4EA674] mb-3 sm:mb-4">
                  ₦40.99
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto items-center sm:items-stretch">
  <Link
    href="/products/felicity-ivem"
    className="text-[#4EA674] text-xs sm:text-sm font-medium hover:underline text-center sm:text-left w-full sm:w-auto py-2 sm:py-0"
  >
    View Details
  </Link>
  <button className="flex-1 bg-[#4EA674] text-white py-2.5 sm:py-2 px-5 sm:px-6 rounded-full text-xs sm:text-sm font-medium hover:bg-[#3e8c5f] transition shadow-sm">
    Add to cart
  </button>
</div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="relative pt-[75%]">
                <Image src="/offer.jpg" alt="Solar Motion Sensor Light" fill className="object-cover" />
                <button className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow">
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base line-clamp-2 mb-1">
                  Solar Motion Sensor Light (24z)
                </h3>
                <p className="text-[#4EA674] text-[10px] sm:text-xs mb-1.5 line-clamp-1">
                  Inverters, Hybrid Inverters
                </p>
                <div className="flex items-center gap-0.5 mb-1.5 sm:mb-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-green-600 text-[10px] sm:text-xs font-medium mb-1.5 sm:mb-2">
                  In stock
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#4EA674] mb-3 sm:mb-4">
                  ₦119.99
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto items-center sm:items-stretch">
  <Link
    href="/products/felicity-ivem"
    className="text-[#4EA674] text-xs sm:text-sm font-medium hover:underline text-center sm:text-left w-full sm:w-auto py-2 sm:py-0"
  >
    View Details
  </Link>
  <button className="flex-1 bg-[#4EA674] text-white py-2.5 sm:py-2 px-5 sm:px-6 rounded-full text-xs sm:text-sm font-medium hover:bg-[#3e8c5f] transition shadow-sm">
    Add to cart
  </button>
</div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="relative pt-[75%]">
                <Image src="/offer.jpg" alt="MPPT Charge Controller" fill className="object-cover" />
                <button className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow">
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base line-clamp-2 mb-1">
                  MPPT Charge Controller 60A
                </h3>
                <p className="text-[#4EA674] text-[10px] sm:text-xs mb-1.5 line-clamp-1">
                  Inverters, Hybrid Inverters
                </p>
                <div className="flex items-center gap-0.5 mb-1.5 sm:mb-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-green-600 text-[10px] sm:text-xs font-medium mb-1.5 sm:mb-2">
                  In stock
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#4EA674] mb-3 sm:mb-4">
                  ₦119.99
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto items-center sm:items-stretch">
  <Link
    href="/products/felicity-ivem"
    className="text-[#4EA674] text-xs sm:text-sm font-medium hover:underline text-center sm:text-left w-full sm:w-auto py-2 sm:py-0"
  >
    View Details
  </Link>
  <button className="flex-1 bg-[#4EA674] text-white py-2.5 sm:py-2 px-5 sm:px-6 rounded-full text-xs sm:text-sm font-medium hover:bg-[#3e8c5f] transition shadow-sm">
    Add to cart
  </button>
</div>
              </div>
            </div>
          </div>
        </div>
      </section>
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
            {/* Standard Card 1 */}
            <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="relative pt-[75%]">
                <Image src="/offer.jpg" alt="Lithium Battery" fill className="object-cover" />
                <button className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow">
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base line-clamp-2 mb-1">
                  Lithium LiFePO4 Battery 12 / 100Ah
                </h3>
                <p className="text-[#4EA674] text-[10px] sm:text-xs mb-1.5 line-clamp-1">
                  Inverters, Standard Inverters
                </p>
                <div className="flex items-center gap-0.5 mb-1.5 sm:mb-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-red-600 text-[10px] sm:text-xs font-medium mb-1.5 sm:mb-2">
                  4 units left
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#4EA674] mb-3 sm:mb-4">
                  ₦40.99
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto items-center sm:items-stretch">
  <Link
    href="/products/felicity-ivem"
    className="text-[#4EA674] text-xs sm:text-sm font-medium hover:underline text-center sm:text-left w-full sm:w-auto py-2 sm:py-0"
  >
    View Details
  </Link>
  <button className="flex-1 bg-[#4EA674] text-white py-2.5 sm:py-2 px-5 sm:px-6 rounded-full text-xs sm:text-sm font-medium hover:bg-[#3e8c5f] transition shadow-sm">
    Add to cart
  </button>
</div>
              </div>
            </div>

            {/* Standard Card 2 */}
            <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="relative pt-[75%]">
                <Image src="/offer.jpg" alt="Lithium Battery" fill className="object-cover" />
                <button className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow">
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base line-clamp-2 mb-1">
                  Lithium LiFePO4 Battery 12 / 100Ah
                </h3>
                <p className="text-[#4EA674] text-[10px] sm:text-xs mb-1.5 line-clamp-1">
                  Inverters, Standard Inverters
                </p>
                <div className="flex items-center gap-0.5 mb-1.5 sm:mb-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-red-600 text-[10px] sm:text-xs font-medium mb-1.5 sm:mb-2">
                  4 units left
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#4EA674] mb-3 sm:mb-4">
                  ₦40.99
                </p>
               <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto items-center sm:items-stretch">
  <Link
    href="/products/felicity-ivem"
    className="text-[#4EA674] text-xs sm:text-sm font-medium hover:underline text-center sm:text-left w-full sm:w-auto py-2 sm:py-0"
  >
    View Details
  </Link>
  <button className="flex-1 bg-[#4EA674] text-white py-2.5 sm:py-2 px-5 sm:px-6 rounded-full text-xs sm:text-sm font-medium hover:bg-[#3e8c5f] transition shadow-sm">
    Add to cart
  </button>
</div>
              </div>
            </div>
 {/* Card 3 */}
            <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="relative pt-[75%]">
                <Image src="/offer.jpg" alt="Solar Motion Sensor Light" fill className="object-cover" />
                <button className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow">
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base line-clamp-2 mb-1">
                  Solar Motion Sensor Light (24z)
                </h3>
                <p className="text-[#4EA674] text-[10px] sm:text-xs mb-1.5 line-clamp-1">
                  Inverters, Hybrid Inverters
                </p>
                <div className="flex items-center gap-0.5 mb-1.5 sm:mb-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-green-600 text-[10px] sm:text-xs font-medium mb-1.5 sm:mb-2">
                  In stock
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#4EA674] mb-3 sm:mb-4">
                  ₦119.99
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto items-center sm:items-stretch">
  <Link
    href="/products/felicity-ivem"
    className="text-[#4EA674] text-xs sm:text-sm font-medium hover:underline text-center sm:text-left w-full sm:w-auto py-2 sm:py-0"
  >
    View Details
  </Link>
  <button className="flex-1 bg-[#4EA674] text-white py-2.5 sm:py-2 px-5 sm:px-6 rounded-full text-xs sm:text-sm font-medium hover:bg-[#3e8c5f] transition shadow-sm">
    Add to cart
  </button>
</div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="relative pt-[75%]">
                <Image src="/offer.jpg" alt="MPPT Charge Controller" fill className="object-cover" />
                <button className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow">
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base line-clamp-2 mb-1">
                  MPPT Charge Controller 60A
                </h3>
                <p className="text-[#4EA674] text-[10px] sm:text-xs mb-1.5 line-clamp-1">
                  Inverters, Hybrid Inverters
                </p>
                <div className="flex items-center gap-0.5 mb-1.5 sm:mb-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-green-600 text-[10px] sm:text-xs font-medium mb-1.5 sm:mb-2">
                  In stock
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#4EA674] mb-3 sm:mb-4">
                  ₦119.99
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto items-center sm:items-stretch">
  <Link
    href="/products/felicity-ivem"
    className="text-[#4EA674] text-xs sm:text-sm font-medium hover:underline text-center sm:text-left w-full sm:w-auto py-2 sm:py-0"
  >
    View Details
  </Link>
  <button className="flex-1 bg-[#4EA674] text-white py-2.5 sm:py-2 px-5 sm:px-6 rounded-full text-xs sm:text-sm font-medium hover:bg-[#3e8c5f] transition shadow-sm">
    Add to cart
  </button>
</div>
</div>
</div>

          </div>
        </div>
      </section>
    </div>
  );
}