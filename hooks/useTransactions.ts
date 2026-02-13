// hooks/useTransactions.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { AdminTransaction, AdminTransactionsResponse } from '@/types';

type FilterType = 'all' | 'completed' | 'pending' | 'canceled';

export const useTransactions = (
  page: number,
  limit: number,
  filter: FilterType,
  search: string
) => {
  return useQuery({
    queryKey: ['admin', 'transactions', page, limit, filter, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filter !== 'all' && { status: filter }),
        ...(search && { search }),
      });
      
      const response = await api.transactions.list(params);
      const data = response.data || response;
      
      return {
        transactions: (data.transactions || []) as AdminTransaction[],
        total: data.total || 0,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};