// src/components/PublicHeader.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronDown,
  MapPin,
  Search,
  User,
  Heart,
  ShoppingCart,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

export default function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* TOP BAR */}
      <div className="bg-white py-3 border-b shadow-sm">
        <div className="container mx-auto px-4 flex flex-wrap items-center justify-between gap-4 md:gap-6">
          {/* Left */}
          <div className="flex items-center gap-5 md:gap-8 flex-wrap">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="DEALPORT"
                width={140}
                height={50}
                className="object-contain"
              />
            </Link>

            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#4EA674]">
              <Image src="/ng.png" alt="Nigeria" width={20} height={14} className="rounded" />
              EN
              <ChevronDown className="w-4 h-4" />
            </button>

            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#4EA674]">
              <MapPin className="w-4 h-4" />
              Deliver to Your address
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden md:block relative w-64 lg:w-80">
              <input
                type="text"
                placeholder="What you're looking for"
                className="w-full px-4 py-2.5 pl-10 pr-4 rounded-full bg-[#EAF8E7] text-gray-700 placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            </div>

            <Link href="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
              <User className="w-6 h-6 text-gray-700" />
            </Link>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Heart className="w-6 h-6 text-gray-700" />
            </button>
            <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              <span className="font-bold text-sm text-gray-700">₦0.00</span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE SEARCH */}
      <div className="md:hidden bg-white py-3 border-t">
        <div className="container mx-auto px-4">
          <div className="relative">
            <input
              type="text"
              placeholder="What you're looking for"
              className="w-full px-5 py-3 pl-12 rounded-full bg-[#EAF8E7] text-gray-700 placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
          </div>
        </div>
      </div>

      {/* SECONDARY NAV */}
      <nav className="bg-white py-3 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center md:justify-between gap-6 text-sm font-medium text-gray-700">
            <div className="flex flex-wrap gap-6">
              <Link href="/shop" className="hover:text-[#4EA674]">Shop</Link>
              <Link href="/promotions" className="hover:text-[#4EA674]">Promotions</Link>
              <Link href="/checkout" className="hover:text-[#4EA674]">Checkout</Link>
              <Link href="/brands" className="hover:text-[#4EA674]">Brands</Link>
            </div>

            <div className="flex flex-wrap gap-6">
              <Link href="/" className="text-[#4EA674] border-b-2 border-[#4EA674]">
                Home
              </Link>
              <Link href="/about" className="hover:text-[#4EA674]">About Us</Link>
              <Link href="/contact" className="hover:text-[#4EA674]">Contact Us</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* CATEGORY BAR */}
      <div className="bg-white py-3 border-b">
        <div className="container mx-auto px-4">
          <nav className="flex flex-wrap justify-center md:justify-start gap-5 md:gap-8 text-xs md:text-sm font-medium text-gray-700 uppercase tracking-wide">
            <Link href="/pv-solar-panels" className="hover:text-[#4EA674]">
              PV SOLAR PANELS
            </Link>
            <Link href="/inverters" className="hover:text-[#4EA674]">INVERTERS</Link>
            <Link href="/batteries" className="hover:text-[#4EA674]">BATTERIES</Link>
            <Link href="/charge-controllers" className="hover:text-[#4EA674]">
              CHARGE CONTROLLERS
            </Link>
            <Link href="/solar-water-pumps" className="hover:text-[#4EA674]">
              SOLAR WATER PUMPS
            </Link>
            <Link href="/solar-packages" className="hover:text-[#4EA674]">
              SOLAR PACKAGES
            </Link>
            <Link href="/accessories" className="hover:text-[#4EA674]">ACCESSORIES</Link>
            <Link href="/categories" className="text-[#4EA674] hover:underline flex items-center gap-1">
              See more
              <ChevronRight className="w-4 h-4" />
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}