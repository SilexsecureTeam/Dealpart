// hooks/useCoupons.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api'; // Changed from apiClient to api

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
      const response = await api.get('/coupons');
      console.log('Coupons API response:', response);
      
      const data = response.data || response;
      
      // Handle different response shapes
      if (Array.isArray(data)) {
        return data as Coupon[];
      }
      if (data?.data && Array.isArray(data.data)) {
        return data.data as Coupon[];
      }
      if (data?.coupons && Array.isArray(data.coupons)) {
        return data.coupons as Coupon[];
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
      const response = await api.get(`/coupons/${id}`);
      console.log('Single coupon response:', response);
      
      const data = response.data || response;
      
      if (data?.coupon) {
        return data.coupon as Coupon;
      }
      if (data?.data) {
        return data.data as Coupon;
      }
      return data as Coupon;
    },
    enabled: !!id,
  });
};

// ---------- Create a new coupon ----------
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post('/coupons', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Create coupon response:', response);
      return response.data;
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
      // Add _method field for Laravel-style PATCH
      data.append('_method', 'PATCH');
      const response = await api.post(`/coupons/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Update coupon response:', response);
      return response.data;
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
      const response = await api.delete(`/coupons/${id}`);
      console.log('Delete coupon response:', response);
      return response.data;
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
      const response = await api.patch(`/coupons/${id}`, { is_active });
      console.log('Toggle status response:', response);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
  });
};