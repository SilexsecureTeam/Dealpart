// hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { Product, Transaction } from '@/types';
import { useProducts } from './useProducts';

// ---------- Response Types ----------
export interface SummaryStats {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  canceledOrders: number;
  previousTotalSales: number;
  previousTotalOrders: number;
  salesGrowth: number;
  ordersGrowth: number;
  pendingGrowth: number;
  canceledGrowth: number;
}

export interface WeeklyStats {
  customers: number;
  totalProducts: number;
  stockProducts: number;
  outOfStock: number;
  revenue: number;
}

export interface WeeklySales {
  day: string;
  sales: number;
}

export interface LiveUsers {
  total: number;
  perMinute: number;
  activity: number[];
}

export interface CountrySales {
  country: string;
  flag: string;
  sales: number;
  change: number;
  width: number;
}

// ---------- Dashboard Summary ----------
export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'summary'],
    queryFn: async () => {
      try {
        const response = await api.dashboard.summary();
        return (response.data || response) as SummaryStats;
      } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// ---------- Dashboard Weekly Stats ----------
export const useDashboardWeeklyStats = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'weeklyStats'],
    queryFn: async () => {
      try {
        const response = await api.dashboard.weeklyStats();
        return (response.data || response) as WeeklyStats;
      } catch (error) {
        console.error('Error fetching weekly stats:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

// ---------- Dashboard Weekly Sales (Chart) ----------
export const useDashboardWeeklySales = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'weeklySales'],
    queryFn: async () => {
      try {
        const response = await api.dashboard.weeklySales();
        // Expecting an array of { day, sales }
        const data = Array.isArray(response) ? response : (response.data || []);
        return data as WeeklySales[];
      } catch (error) {
        console.error('Error fetching weekly sales:', error);
        // Return default empty array so chart doesn't break
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

// ---------- Live Users ----------
export const useDashboardLiveUsers = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'liveUsers'],
    queryFn: async () => {
      try {
        const response = await api.dashboard.liveUsers();
        return (response.data || response) as LiveUsers;
      } catch (error) {
        console.error('Error fetching live users:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};

// ---------- Sales by Country ----------
export const useDashboardCountrySales = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'countrySales'],
    queryFn: async () => {
      try {
        const response = await api.dashboard.countrySales();
        const data = Array.isArray(response) ? response : (response.data || []);
        return data as CountrySales[];
      } catch (error) {
        console.error('Error fetching country sales:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

// ---------- Admin Transactions ----------
export const useAdminTransactions = () => {
  return useQuery({
    queryKey: ['admin', 'transactions'],
    queryFn: async () => {
      try {
        const response = await api.transactions.list();
        const list = Array.isArray(response) ? response : (response?.data || []);
        return list as Transaction[];
      } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

// ---------- Best Selling Products (Client‑side sorted) ----------
export const useBestSellingProducts = (limit = 4) => {
  // Fetch first page with high per_page to get enough products
  const query = useProducts(1, 50);
  
  // Sort by orders (descending) client-side
  const sortedData = query.data?.data
    ?.filter(p => p.orders !== undefined)
    ?.sort((a, b) => (b.orders ?? 0) - (a.orders ?? 0))
    ?.slice(0, limit) ?? [];
  
  return {
    ...query,
    data: {
      ...query.data,
      data: sortedData,
    },
  };
};

// ---------- Top Products (Client‑side sorted) ----------
export const useTopProducts = (limit = 4) => {
  // Fetch first page with high per_page to get enough products
  const query = useProducts(1, 50);
  
  // Define what "top" means – by price descending (or change this logic as needed)
  const sortedData = query.data?.data
    ?.sort((a, b) => Number(b.sales_price_inc_tax) - Number(a.sales_price_inc_tax))
    ?.slice(0, limit) ?? [];
  
  return {
    ...query,
    data: {
      ...query.data,
      data: sortedData,
    },
  };
};