// hooks/useCoupons.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

export interface Coupon {
  id: number;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  discount_value: number;
  minimum_order_amount: number | null;
  maximum_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_user_limit: number | null;
  applies_to: 'all' | 'categories' | 'products' | 'brands';
  applicable_ids: number[] | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// ---------- Fetch all coupons ----------
export const useCoupons = () => {
  return useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: async () => {
      const response = await api.coupons.list();
      console.log('Coupons API response:', response);
      
      // Handle different response shapes
      if (Array.isArray(response)) {
        return response as Coupon[];
      }
      if (response?.data && Array.isArray(response.data)) {
        return response.data as Coupon[];
      }
      if (response?.coupons && Array.isArray(response.coupons)) {
        return response.coupons as Coupon[];
      }
      return [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ---------- Get single coupon ----------
export const useCoupon = (id: number) => {
  return useQuery({
    queryKey: ['admin', 'coupons', id],
    queryFn: async () => {
      const response = await api.coupons.get(id);
      console.log('Single coupon response:', response);
      
      if (response?.coupon) {
        return response.coupon as Coupon;
      }
      if (response?.data) {
        return response.data as Coupon;
      }
      return response as Coupon;
    },
    enabled: !!id,
  });
};

// ---------- Create a new coupon ----------
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.coupons.create(data);
      console.log('Create coupon response:', response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });
};

// ---------- Update a coupon ----------
export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await api.coupons.update(id, data);
      console.log('Update coupon response:', response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });
};

// ---------- Delete a coupon ----------
export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.coupons.delete(id);
      console.log('Delete coupon response:', response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });
};

// ---------- Toggle coupon status ----------
export const useToggleCouponStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      const response = await api.coupons.toggleStatus(id, is_active);
      console.log('Toggle status response:', response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });
};