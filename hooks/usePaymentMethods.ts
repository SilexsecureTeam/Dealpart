// hooks/usePaymentMethods.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export interface PaymentMethod {
  id: number;
  type: 'card' | 'bank_transfer' | 'pay_on_delivery';
  last4?: string;
  brand?: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
  is_active: boolean;
  transactions_count?: number;
  total_revenue?: number;
  created_at?: string;
}

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const response = await api.get('/payment-methods');
      const data = response.data;
      
      if (Array.isArray(data)) return data;
      if (data?.data && Array.isArray(data.data)) return data.data;
      if (data?.methods && Array.isArray(data.methods)) return data.methods;
      
      return [];
    },
  });
};

export const usePaymentMethodStats = () => {
  return useQuery({
    queryKey: ['payment-method-stats'],
    queryFn: async () => {
      const response = await api.get('/payment-methods/stats');
      return response.data;
    },
  });
};

export const useSetDefaultPaymentMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/payment-methods/${id}/default`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('Default payment method updated');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update default payment method');
    },
  });
};

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/payment-methods/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('Payment method removed');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to remove payment method');
    },
  });
};