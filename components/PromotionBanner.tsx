// components/PromotionBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Gift, Percent, Truck, Clock } from 'lucide-react';

const promotions = [
  {
    id: 1,
    icon: Gift,
    text: 'Get 20% off on all solar panels!',
    code: 'SOLAR20',
    link: '/shop/solar-panels',
    bg: 'from-[#4EA674] to-[#2A6B4A]', // Your brand green colors
  },
  {
    id: 2,
    icon: Truck,
    text: 'Free shipping on orders over ₦100,000',
    code: 'FREESHIP',
    link: '/shop',
    bg: 'from-[#4EA674] to-[#3D8B59]', // Slight variation of your green
  },
  {
    id: 3,
    icon: Clock,
    text: 'Flash sale: 24 hours only!',
    code: 'FLASH50',
    link: '/shop/flash-sale',
    bg: 'from-[#2A6B4A] to-[#1E4F36]', // Darker green for flash sale
  },
];

export default function PromotionBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentPromo, setCurrentPromo] = useState(0);

  // Rotate promotions every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promotions.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  const promo = promotions[currentPromo];
  const Icon = promo.icon;

  return (
    <div className={`bg-gradient-to-r ${promo.bg} text-white relative z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm md:text-base">
            <Icon className="w-5 h-5 animate-pulse" />
            <span className="font-semibold hidden sm:inline">🔥 LIMITED OFFER:</span>
            <span className="font-medium">{promo.text}</span>
            <span className="hidden md:inline bg-white/20 px-3 py-1 rounded-lg font-mono text-sm">
              {promo.code}
            </span>
            <Link 
              href={promo.link} 
              className="underline underline-offset-2 hover:no-underline text-sm font-medium whitespace-nowrap"
            >
              Shop Now →
            </Link>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close promotion"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}