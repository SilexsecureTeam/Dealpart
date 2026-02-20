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

// Fetch active promotions for customers
export const useCustomerPromotions = () => {
  return useQuery({
    queryKey: ['customer', 'promotions'],
    queryFn: async () => {
      // You'll need to create this endpoint on your backend
      const response = await fetch('https://admin.bezalelsolar.com/api/customer/promotions', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Promotions response:', data);
      
      // Handle different response formats
      if (data?.promotions && Array.isArray(data.promotions)) {
        return data.promotions as Promotion[];
      }
      if (data?.data && Array.isArray(data.data)) {
        return data.data as Promotion[];
      }
      if (Array.isArray(data)) {
        return data as Promotion[];
      }
      
      return [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Fetch a single promotion by ID
export const useCustomerPromotion = (id: string) => {
  return useQuery({
    queryKey: ['customer', 'promotions', id],
    queryFn: async () => {
      const response = await fetch(`https://admin.bezalelsolar.com/api/customer/promotions/${id}`, {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data?.promotion || data?.data || data;
    },
    enabled: !!id,
  });
};