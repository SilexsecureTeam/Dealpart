// hooks/useOrders.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { OrderListItem, OrdersResponse } from '@/types'; // ✅ use OrderListItem

type FilterType = 'all' | 'completed' | 'pending' | 'canceled';

export const useOrders = (
  page: number,
  limit: number,
  filter: FilterType,
  search: string
) => {
  return useQuery({
    queryKey: ['admin', 'orders', page, limit, filter, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filter !== 'all' && { status: filter }),
        ...(search && { search }),
      });
      
      const response = await api.orders.list(params);
      
      // Handle different API response shapes
      const data = response.data || response;
      
      return {
        orders: (data.orders || []) as OrderListItem[], // ✅ use OrderListItem
        total: data.total || 0,
      };
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};