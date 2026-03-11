// hooks/useWishlist.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApiClient';
import { WishlistItem } from '@/types';
import { useEffect } from 'react';

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
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['customer', 'wishlist'],
    queryFn: async () => {
      try {
        console.log('🔄 Fetching fresh wishlist from server...');
        const response = await customerApi.wishlist.list();
        console.log('📦 Raw wishlist response:', response);
        const normalized = normalizeWishlistData(response);
        console.log('✅ Normalized wishlist:', normalized);
        return normalized;
      } catch (error) {
        console.error('❌ Error fetching wishlist:', error);
        throw error;
      }
    },
    staleTime: 0, // Always stale
    gcTime: 0, // No cache
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });

  // Force refetch when hook is used
  useEffect(() => {
    queryClient.invalidateQueries({ 
      queryKey: ['customer', 'wishlist'],
      refetchType: 'all' 
    });
  }, [queryClient]);

  return query;
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId: number) => {
      console.log('➕ Adding product to wishlist:', productId);
      const response = await customerApi.wishlist.add(productId);
      return response;
    },
    onSuccess: () => {
      console.log('✅ Add successful, invalidating cache...');
      queryClient.invalidateQueries({ 
        queryKey: ['customer', 'wishlist'],
        refetchType: 'all' 
      });
    },
    onError: (error) => {
      console.error('❌ Add to wishlist error:', error);
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (wishlistItemId: number) => {
      console.log('🗑️ Removing wishlist item with ID:', wishlistItemId);
      try {
        const response = await customerApi.wishlist.remove(wishlistItemId);
        return response;
      } catch (error: any) {
        // If item not found (404), consider it already removed - DON'T rethrow
        if (error?.message?.includes('not found') || error?.message?.includes('404')) {
          console.log('⚠️ Item already removed from wishlist (404) - treating as success');
          return { success: true, id: wishlistItemId, alreadyRemoved: true };
        }
        // Only rethrow non-404 errors
        throw error;
      }
    },
    onMutate: async (wishlistItemId) => {
      console.log('🔄 Optimistic update for removal:', wishlistItemId);
      
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
      console.log('✅ Successfully removed item:', variables, data);
      
      // Force a fresh fetch to ensure server sync
      setTimeout(() => {
        queryClient.invalidateQueries({ 
          queryKey: ['customer', 'wishlist'],
          refetchType: 'all' 
        });
      }, 100);
    },
    onError: (error, variables, context) => {
      // Check if it's a 404 error (already handled in mutationFn, but just in case)
      if (error?.message?.includes('not found') || error?.message?.includes('404')) {
        console.log(`⚠️ Item ${variables} already removed (handled in onError)`);
        // Still refresh to be safe
        queryClient.invalidateQueries({ 
          queryKey: ['customer', 'wishlist'],
          refetchType: 'all' 
        });
        return;
      }
      
      // This will now only run for non-404 errors
      console.error('❌ Remove from wishlist error:', error, 'for item:', variables);
      
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