// hooks/useOrderStats.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { OrderStats } from '@/types';

export const useOrderStats = () => {
  return useQuery({
    queryKey: ['admin', 'orders', 'stats'],
    queryFn: async () => {
      const response = await api.orders.stats();
      // Handle different API response shapes
      return (response.data || response) as OrderStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};