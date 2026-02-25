// hooks/useCustomerPromotions.ts
import { useQuery } from '@tanstack/react-query';

export interface Promotion {
  id: number;
  title: string;
  description: string | null;
  type: 'flash_sale' | 'seasonal' | 'coupon' | 'bundle' | 'free_shipping';
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  discount_value: number;
  coupon_code: string | null;
  start_date: string;
  end_date: string;
  image: string | null;
  banner_image: string | null;
  is_active: boolean;
  applies_to: 'all' | 'categories' | 'products' | 'brands';
  applicable_ids: number[] | null;
  created_at: string;
  updated_at: string;
}

// Define coupon type from API
interface Coupon {
  id: number;
  code: string;
  promotion_name?: string;
  description?: string;
  type?: string;
  value?: string | number;
  discount_type?: string;
  discount_value?: string | number;
  start_date?: string;
  expires_at?: string;
  end_date?: string;
  is_active?: boolean;
  usage_limit?: number;
  used_count?: number;
  created_at?: string;
  updated_at?: string;
}

// Map coupon data to promotion format
const mapCouponToPromotion = (coupon: Coupon): Promotion => {
  const now = new Date();
  const startDate = coupon.start_date || new Date().toISOString();
  const endDate = coupon.expires_at || coupon.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  
  return {
    id: coupon.id,
    title: coupon.promotion_name || 'Special Offer',
    description: coupon.description || `Save with code ${coupon.code}`,
    type: coupon.type === 'percent' ? 'flash_sale' : 'coupon',
    discount_type: coupon.type === 'percent' ? 'percentage' : 'fixed',
    discount_value: Number(coupon.value || coupon.discount_value || 0),
    coupon_code: coupon.code,
    start_date: startDate,
    end_date: endDate,
    image: null,
    banner_image: null,
    is_active: coupon.is_active !== false && now <= new Date(endDate),
    applies_to: 'all',
    applicable_ids: null,
    created_at: coupon.created_at || new Date().toISOString(),
    updated_at: coupon.updated_at || new Date().toISOString(),
  };
};

// Fetch coupons and format as promotions
export const useCustomerPromotions = () => {
  return useQuery({
    queryKey: ['customer', 'promotions'],
    queryFn: async () => {
      try {
        // Use the coupons endpoint that actually exists
        const response = await fetch('https://admin.bezalelsolar.com/api/coupons', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Coupons response:', data);
        
        // Handle different response formats
        let coupons: Coupon[] = [];
        if (data?.coupons && Array.isArray(data.coupons)) {
          coupons = data.coupons;
        } else if (data?.data && Array.isArray(data.data)) {
          coupons = data.data;
        } else if (Array.isArray(data)) {
          coupons = data;
        }
        
        // Convert coupons to promotion format and filter active ones
        return coupons
          .map(mapCouponToPromotion)
          .filter((promo: Promotion) => promo.is_active);
          
      } catch (error) {
        console.error('Failed to fetch promotions:', error);
        return []; // Return empty array on error
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Fetch a single promotion by ID (using coupon ID)
export const useCustomerPromotion = (id: string) => {
  return useQuery({
    queryKey: ['customer', 'promotions', id],
    queryFn: async () => {
      const response = await fetch(`https://admin.bezalelsolar.com/api/coupons/${id}`, {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const coupon = (data?.coupon || data?.data || data) as Coupon;
      return mapCouponToPromotion(coupon);
    },
    enabled: !!id,
  });
};