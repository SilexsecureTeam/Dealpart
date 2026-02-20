// hooks/useWishlist.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApiClient';
import { WishlistItem } from '@/types';

const normalizeWishlistData = (response: any): WishlistItem[] => {
  if (Array.isArray(response)) return response;
  if (response?.data && Array.isArray(response.data)) return response.data;
  if (response?.wishlist && Array.isArray(response.wishlist)) return response.wishlist;
  if (response?.items && Array.isArray(response.items)) return response.items;
  if (response && typeof response === 'object') {
    const values = Object.values(response);
    if (values.length > 0 && values.every(v => typeof v === 'object' && v !== null)) {
      return values as WishlistItem[];
    }
  }
  console.warn('Unexpected wishlist response structure:', response);
  return [];
};

export const useWishlist = () => {
  return useQuery({
    queryKey: ['customer', 'wishlist'],
    queryFn: async () => {
      try {
        const response = await customerApi.wishlist.list();
        console.log('Raw wishlist response:', response);
        const normalized = normalizeWishlistData(response);
        console.log('Normalized wishlist:', normalized);
        return normalized;
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        throw error;
      }
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId: number) => {
      console.log('Adding product to wishlist:', productId);
      const response = await customerApi.wishlist.add(productId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['customer', 'wishlist'],
        refetchType: 'all' 
      });
    },
    onError: (error) => {
      console.error('Add to wishlist error:', error);
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (wishlistItemId: number) => {
      console.log('Removing wishlist item with ID:', wishlistItemId);
      const response = await customerApi.wishlist.remove(wishlistItemId);
      return response;
    },
    onMutate: async (wishlistItemId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['customer', 'wishlist'] });
      
      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData(['customer', 'wishlist']);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['customer', 'wishlist'], (old: any) => {
        if (!old) return old;
        return old.filter((item: WishlistItem) => item.id !== wishlistItemId);
      });
      
      return { previousWishlist };
    },
    onSuccess: (data, variables) => {
      console.log('Successfully removed item:', variables);
      // No need to invalidate here since we already did optimistic update
    },
    onError: (error, variables, context) => {
      console.error('Remove from wishlist error:', error, 'for item:', variables);
      
      // Rollback on error
      if (context?.previousWishlist) {
        queryClient.setQueryData(['customer', 'wishlist'], context.previousWishlist);
      }
      
      // Still invalidate to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ['customer', 'wishlist'],
        refetchType: 'all' 
      });
    },
  });
};

export const useIsInWishlist = (productId: number) => {
  const { data: wishlist = [] } = useWishlist();
  const exists = wishlist.some((item) => {
    if (item.product_id === productId) return true;
    if (item.product && (item.product as any).id === productId) return true;
    return false;
  });
  return exists;
};