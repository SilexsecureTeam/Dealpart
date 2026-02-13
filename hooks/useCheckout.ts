// hooks/useCheckout.ts
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { customerApi } from '@/lib/customerApiClient';
import { CheckoutPayload, CheckoutResponse, VerifyPaymentResponse } from '@/types';

// ---------- Place Order ----------
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
        // Fallback – redirect to order confirmation
        router.push(`/order-confirmation/${data.order_id}`);
      }
    },
  });
};

// ---------- Verify Payment ----------
export const useVerifyPayment = (reference: string) => {
  return useMutation({
    mutationFn: () => customerApi.checkout.verify(reference),
    onSuccess: (data: VerifyPaymentResponse) => {
      // Handle successful payment – you can redirect to success page
    },
  });
};

// ---------- Apply Coupon ----------
export const useApplyCoupon = () => {
  return useMutation({
    mutationFn: (code: string) => customerApi.coupons.apply(code),
  });
};