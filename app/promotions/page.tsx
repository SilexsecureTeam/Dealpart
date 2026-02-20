// app/promotions/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCustomerPromotions } from '@/hooks/useCustomerPromotions';
import PromotionBanner from '@/components/PromotionBanner';
import { 
  ChevronRight, 
  Gift, 
  Percent, 
  Truck, 
  Clock,
  Tag,
  ShoppingBag,
  Award,
  Sparkles,
  Loader2
} from 'lucide-react';

// Helper functions
const getDaysLeft = (endDate: string) => {
  const days = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return 'Expired';
  if (days === 0) return 'Ending today!';
  return `${days} days left`;
};

const isPromoActive = (startDate: string, endDate: string) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  return now >= start && now <= end;
};

const getPromoIcon = (type: string) => {
  switch(type) {
    case 'flash_sale': return Clock;
    case 'coupon': return Tag;
    case 'bundle': return Award;
    case 'free_shipping': return Truck;
    default: return Gift;
  }
};

const getDiscountDisplay = (promo: any) => {
  if (promo.discount_type === 'percentage') {
    return `${promo.discount_value}% OFF`;
  } else if (promo.discount_type === 'fixed') {
    return `₦${promo.discount_value?.toLocaleString()} OFF`;
  } else {
    return 'FREE SHIPPING';
  }
};

export default function PromotionsPage() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch real promotions from API
  const { data: promotions = [], isLoading, error } = useCustomerPromotions();

  // Filter promotions
  const filteredPromos = promotions.filter((promo: any) => {
    // Only show active promotions
    if (!isPromoActive(promo.start_date, promo.end_date)) return false;
    
    // Apply type filter
    if (filter !== 'all' && promo.type !== filter) return false;
    
    // Apply search filter
    if (searchQuery) {
      return promo.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             promo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             promo.coupon_code?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4EA674]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Failed to load promotions</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#4EA674] text-white rounded-lg hover:bg-[#3D8B59]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Banner only appears here */}
      <PromotionBanner />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#4EA674] to-[#2A6B4A] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Special Offers & Promotions
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mb-6">
              Don't miss out on our best deals! Save big on solar products with our exclusive offers.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search promotions or coupon codes..."
                className="w-full px-6 py-3 pl-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filter Tabs - Based on actual promotion types */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  filter === 'all'
                    ? 'bg-[#4EA674] text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                All Offers ({promotions.length})
              </button>
              
              {/* Only show filter tabs for promotion types that exist in your data */}
              {Array.from(new Set(promotions.map((p: any) => p.type))).map((type: any) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition ${
                    filter === type
                      ? 'bg-[#4EA674] text-white'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredPromos.length} active promotions
            </div>
          </div>
        </div>

        {/* Promotions Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPromos.map((promo: any) => {
              const Icon = getPromoIcon(promo.type);
              const daysLeft = getDaysLeft(promo.end_date);
              const isActive = isPromoActive(promo.start_date, promo.end_date);
              
              if (!isActive) return null; // Skip expired promotions

              return (
                <div
                  key={promo.id}
                  className="group bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300"
                >
                  {/* Optional Banner Image */}
                  {promo.banner_image && (
                    <div className="relative h-32 w-full">
                      <Image
                        src={promo.banner_image}
                        alt={promo.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    {/* Icon and Type */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-[#EAF8E7] dark:bg-[#2A4A2F] text-[#4EA674]">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-medium px-3 py-1 bg-[#EAF8E7] dark:bg-[#2A4A2F] text-[#4EA674] rounded-full">
                        {getDiscountDisplay(promo)}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#4EA674] transition">
                      {promo.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {promo.description}
                    </p>

                    {/* Coupon Code - If it exists */}
                    {promo.coupon_code && (
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Promo Code</span>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#4EA674] text-lg">{promo.coupon_code}</span>
                          <button 
                            onClick={() => navigator.clipboard.writeText(promo.coupon_code)}
                            className="text-xs px-3 py-1 bg-[#4EA674] text-white rounded-lg hover:bg-[#3D8B59] transition"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Validity Period */}
                    <div className="mb-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>Valid until {new Date(promo.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Tag className="w-4 h-4" />
                        <span>Applies to: {promo.applies_to}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-2 text-sm font-medium text-[#4EA674]">
                        <Clock className="w-4 h-4" />
                        <span>{daysLeft}</span>
                      </div>
                      <Link
                        href={`/shop?promo=${promo.coupon_code || promo.id}`}
                        className="flex items-center gap-1 text-[#4EA674] font-medium hover:gap-2 transition-all"
                      >
                        Shop Now
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredPromos.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto bg-[#EAF8E7] dark:bg-[#2A4A2F] rounded-full flex items-center justify-center mb-4">
                <Gift className="w-10 h-10 text-[#4EA674]" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No active promotions
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? `No results for "${searchQuery}"` : 'Check back later for new offers!'}
              </p>
            </div>
          )}
        </div>

        {/* Newsletter Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-r from-[#4EA674] to-[#2A6B4A] rounded-3xl p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Never Miss a Deal!</h2>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter and get the latest promotions delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button 
                type="submit"
                className="px-6 py-3 bg-white text-[#4EA674] rounded-xl font-semibold hover:bg-gray-100 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}