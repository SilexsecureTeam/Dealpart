// hooks/useCheckout.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { customerApi } from '@/lib/customerApiClient';
import { CheckoutPayload, CheckoutResponse, VerifyPaymentResponse } from '@/types';

export const useCheckout = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: CheckoutPayload) => 
      customerApi.checkout.create(payload),
    onSuccess: (data: CheckoutResponse) => {
      // If Paystack authorization URL is returned, redirect to payment
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        
        const orderReference = data.order?.order_reference;
        if (orderReference) {
          router.push(`/order-confirmation/${orderReference}`);
        } else {
          console.error('No order reference found in response:', data);
          router.push('/orders');
        }
      }
    },
    onError: (error) => {
      console.error('Checkout failed:', error);
    },
  });
};

// ---------- Verify Payment ----------
export const useVerifyPayment = (reference: string) => {
  return useMutation({
    mutationFn: () => customerApi.checkout.verify(reference),
  });
};

// ---------- Apply Coupon ----------
export const useApplyCoupon = () => {
  return useMutation({
    mutationFn: (code: string) => customerApi.coupons.apply(code),
  });
};

export const useStates = () => {
  return useQuery({
    queryKey: ['states'],
    queryFn: async () => {
      const token = localStorage.getItem('customerToken');
      const response = await fetch('https://admin.bezalelsolar.com/api/state', {
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      return response.json();
    },
  });
};

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const token = localStorage.getItem('customerToken');
      const response = await fetch('https://admin.bezalelsolar.com/api/locations', {
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      return response.json();
    },
  });
};

export const useCalculateDelivery = () => {
  return useMutation({
    mutationFn: async ({ state_name, lga_name, places, fee }: { 
      state_name: string; 
      lga_name: string;
      places: string;
      fee: number;
    }) => {
      const token = localStorage.getItem('customerToken');
      const response = await fetch('https://admin.bezalelsolar.com/api/delivery-fee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ 
          state_name, 
          lga_name,
          places,
          fee
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Failed to calculate delivery fee');
      }
      
      return response.json();
    },
  });
};

// ✅ CORRECT: Get Tax Rate
export const useTaxRate = () => {
  return useQuery({
    queryKey: ['taxRate'],
    queryFn: async () => {
      const token = localStorage.getItem('customerToken');
      const response = await fetch('https://admin.bezalelsolar.com/api/taxes', {
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tax rate');
      }
      
      const data = await response.json();
      
      // Handle response format
      if (Array.isArray(data)) {
        const activeTax = data.find(tax => tax.is_active === 1 || tax.is_active === true);
        return activeTax || { percentage: 7.5 };
      }
      
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};