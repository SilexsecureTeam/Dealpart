// hooks/useCart.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApiClient'; // This stays as is
import { getCart, calcCartSummary, emitCartUpdated } from '@/lib/cart';

// ---------- Types ----------
export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock_status?: string;
}

export interface CartSummary {
  count: number;
  total: number;
}

// ---------- Helper to normalize cart items ----------
function normalizeCartItems(items: any[]): CartItem[] {
  return items.map((item: any) => ({
    id: item.id,
    product_id: item.product_id || item.product?.id,
    name: item.product?.name || item.name || 'Product',
    image: item.product?.image || item.product?.images?.[0] || item.image || '/offer.jpg',
    price: item.price || item.product?.price || 0,
    quantity: item.quantity || 1,
    stock_status: item.product?.stock_status || 'in_stock',
  }));
}

export const useCart = () => {
  return useQuery({
    queryKey: ['customer', 'cart'],
    queryFn: async () => {
      const response = await customerApi.cart.get();
      // Handle different response structures
      const cartData = response.data || response;
      const items = Array.isArray(cartData) ? cartData : cartData.items || [];
      return normalizeCartItems(items);
    },
    staleTime: 0,
    retry: 1,
  });
};
// ---------- Update cart item quantity ----------
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      customerApi.cart.update(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'cart'] });
      emitCartUpdated(); // optional global event
    },
  });
};

// ---------- Remove cart item ----------
export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number) => customerApi.cart.remove(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'cart'] });
      emitCartUpdated();
    },
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ product_id, quantity, price, color }: { 
      product_id: number; 
      quantity: number; 
      price: number;
      color?: string; 
    }) => customerApi.cart.add(product_id, quantity, price, color || 'default'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'cart'] });
      emitCartUpdated();
    },
  });
};
// ---------- Utility: calculate cart summary ----------
export const useCartSummary = (items: CartItem[] = []) => {
  const { count, total } = calcCartSummary(items);
  return { count, total };
};