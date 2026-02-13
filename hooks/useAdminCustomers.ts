// hooks/useAdminCustomers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { 
  AdminCustomer, 
  CustomerDetails, 
  CustomerStats, 
  CustomersResponse, 
  CustomerOrder 
} from '@/types';

// ---------- Fetch paginated customers (LIST PAGE) ----------
export const useAdminCustomers = (page: number, limit: number, search?: string) => {
  return useQuery({
    queryKey: ['admin', 'customers', page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });
      
      const response = await api.admin.users.list(params);
      const data = response.data || response;
      
      return {
        customers: (data.users || data.customers || data.data || []) as AdminCustomer[],
        total: data.total || data.pagination?.total || 0,
        page: data.page || data.pagination?.page || page,
        limit: data.limit || data.pagination?.limit || limit,
      } as CustomersResponse;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

// ---------- Fetch customer stats (LIST PAGE) ----------
export const useCustomerStats = () => {
  return useQuery({
    queryKey: ['admin', 'customers', 'stats'],
    queryFn: async () => {
      // Replace with real endpoint if available
      return {
        totalCustomers: 11040,
        newCustomers: 2370,
        visitors: 250000,
        activeCustomers: 25000,
        repeatCustomers: 5600,
        shopVisitors: 250000,
        conversionRate: 5.5,
        totalCustomersChange: '↑ 14.4%',
        newCustomersChange: '↑ 20%',
        visitorsChange: '↑ 20%',
      } as CustomerStats;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ---------- Delete a customer (LIST PAGE) ----------
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => api.admin.users.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
    },
  });
};

// ---------- Fetch single customer details (DETAIL PAGE) ----------
export const useAdminCustomerDetails = (id: string | number) => {
  return useQuery({
    queryKey: ['admin', 'customers', id],
    queryFn: async () => {
      const response = await api.admin.users.detail(id);
      const data = response.data || response;
      return (data.user || data.customer || data) as CustomerDetails;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

// ---------- Fetch customer orders (DETAIL PAGE) ----------
export const useAdminCustomerOrders = (customerId: string | number) => {
  return useQuery({
    queryKey: ['admin', 'customers', customerId, 'orders'],
    queryFn: async () => {
      const params = new URLSearchParams({
        customer_id: String(customerId),
        limit: '100',
      });
      const response = await api.orders.list(params);
      const data = response.data || response;
      return (data.orders || data.data || []) as CustomerOrder[];
    },
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

// ---------- Delete a customer order (DETAIL PAGE) ----------
export const useDeleteCustomerOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => api.orders.delete(orderId),
    onSuccess: (_, orderId) => {
      // Invalidate all customer orders queries
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'customers'], 
        predicate: (query) => query.queryKey.includes('orders') 
      });
    },
  });
};

// ---------- Update customer role / status ----------
export const useUpdateCustomerRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      api.admin.users.update(userId, { role }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers', variables.userId] });
    },
  });
};