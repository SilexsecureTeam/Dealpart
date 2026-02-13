// hooks/useTransactionStats.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { TransactionStats } from '@/types';

export const useTransactionStats = () => {
  return useQuery({
    queryKey: ['admin', 'transactions', 'stats'],
    queryFn: async () => {
      const response = await api.transactions.stats();
      // Handle different API response shapes
      return (response.data || response) as TransactionStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};