// app/promotions/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  Gift, 
  Percent, 
  Tag, 
  Clock, 
  Copy, 
  CheckCircle,
  Loader2,
  ChevronRight 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Coupon {
  id: number;
  code: string;
  promotion_name?: string;
  description?: string;
  type?: string;
  value?: number | string;
  discount_type?: string;
  discount_value?: number | string;
  expires_at?: string;
  end_date?: string;
  is_active?: boolean;
}

const formatDiscount = (coupon: Coupon) => {
  const type = coupon.type || coupon.discount_type;
  const value = coupon.value || coupon.discount_value;
  
  if (type === 'percent' || type === 'percentage') {
    return `${value}% OFF`;
  } else if (type === 'fixed') {
    return `₦${Number(value).toLocaleString()} OFF`;
  }
  return 'Special Offer';
};

const getDaysLeft = (dateString?: string) => {
  if (!dateString) return 'No expiry';
  const days = Math.ceil((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return 'Expired';
  if (days === 0) return 'Ends today!';
  return `${days} days left`;
};

export default function PromotionsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: coupons = [], isLoading, error } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const res = await fetch('https://admin.bezalelsolar.com/api/coupons');
      const data = await res.json();
      
      // Handle different response formats
      if (Array.isArray(data)) return data as Coupon[];
      if (data?.data && Array.isArray(data.data)) return data.data as Coupon[];
      if (data?.coupons && Array.isArray(data.coupons)) return data.coupons as Coupon[];
      
      return [];
    },
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Coupon code copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4EA674]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load promotions</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#4EA674] text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4EA674] to-[#2A6B4A] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Special Offers & Coupons</h1>
          <p className="text-lg opacity-90">Save big on your next purchase with these exclusive coupon codes!</p>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {coupons.length === 0 ? (
          <div className="text-center py-16">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No active coupons</h3>
            <p className="text-gray-500">Check back later for new offers!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <div 
                key={coupon.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-6 border border-gray-100"
              >
                {/* Discount Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-[#EAF8E7] text-[#4EA674] px-4 py-2 rounded-lg font-bold">
                    {formatDiscount(coupon)}
                  </div>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {getDaysLeft(coupon.expires_at || coupon.end_date)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold mb-2">
                  {coupon.promotion_name || 'Special Discount'}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 text-sm mb-4">
                  {coupon.description || `Use code ${coupon.code} to save on your purchase`}
                </p>

                {/* Coupon Code */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-xs text-gray-500 mb-2">Coupon Code</div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-lg text-[#4EA674]">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleCopyCode(coupon.code)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition"
                    >
                      {copiedCode === coupon.code ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Shop Now Link */}
                <Link
                  href={`/shop?coupon=${coupon.code}`}
                  className="flex items-center justify-between text-[#4EA674] font-medium hover:gap-2 transition-all"
                >
                  <span>Shop Now</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}