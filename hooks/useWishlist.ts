// hooks/useWishlist.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApiClient';
import { WishlistItem } from '@/types';

// ---------- Fetch wishlist ----------
export const useWishlist = () => {
  return useQuery({
    queryKey: ['customer', 'wishlist'],
    queryFn: async () => {
      const response = await customerApi.wishlist.list();
      const data = response.data || response.wishlist || response || [];
      return data as WishlistItem[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// ---------- Add to wishlist ----------
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) => customerApi.wishlist.add(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'wishlist'] });
    },
  });
};

// ---------- Remove from wishlist ----------
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (wishlistItemId: number) => customerApi.wishlist.remove(wishlistItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'wishlist'] });
    },
  });
};

// ---------- Check if product is in wishlist (client-side) ----------
export const useIsInWishlist = (productId: number) => {
  const { data: wishlist = [] } = useWishlist();
  return wishlist.some((item) => item.product_id === productId);
};