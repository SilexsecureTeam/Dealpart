import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
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
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(filter !== 'all' && { status: filter }),
          ...(search && { search }),
        });
        
        const response = await api.get(`/admin/transactions?${params.toString()}`);
        const data = response.data || response;
        
        return {
          transactions: (data.transactions || data.data || []) as AdminTransaction[],
          total: data.total || data.pagination?.total || 0,
        };
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Transactions endpoint not available, using empty data');
        }
        return {
          transactions: [],
          total: 0,
        };
      }
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};