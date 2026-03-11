import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApiClient';
import type { CustomerOrder, CustomerOrderItem } from '@/types';

export type { CustomerOrder, CustomerOrderItem };

interface OrdersResponse {
  orders: CustomerOrder[];
  total: number;
  currentPage: number;
  lastPage: number;
}

interface MetaData {
  total?: number;
  current_page?: number;
  last_page?: number;
}

export const useCustomerOrder = (orderReference: string) => {
  return useQuery({
    queryKey: ['customer', 'order', orderReference],
    queryFn: async () => {
      if (!orderReference) {
        throw new Error('Order reference is required');
      }
      
      try {
        const order = await customerApi.orders.getByReference(orderReference);
        
        if (!order) {
          throw new Error('Order not found');
        }
        
        const processedOrder = {
          ...order,
          reference: order.order_reference || order.reference || orderReference,
          order_reference: order.order_reference || order.reference || orderReference,
        };
        
        return processedOrder as CustomerOrder;
      } catch (error) {
        console.error(`Error fetching order ${orderReference}:`, error);
        throw error;
      }
    },
    enabled: !!orderReference,
    staleTime: 0,
    retry: 2,
    retryDelay: 1000,
  });
};

export const useCustomerOrders = (page: number = 1, limit: number = 10) => {
  return useQuery<OrdersResponse>({
    queryKey: ['customer', 'orders', page, limit],
    queryFn: async () => {
      try {
        const response = await customerApi.orders.list(page, limit);
        
        let orders: CustomerOrder[] = [];
        let meta: MetaData = {};
        
        if (response && typeof response === 'object') {
          if ('orders' in response && Array.isArray(response.orders)) {
            orders = response.orders;
            meta = response.meta || {};
          } else if ('data' in response && Array.isArray(response.data)) {
            orders = response.data;
            meta = response.meta || {};
          } else if (Array.isArray(response)) {
            orders = response;
          }
        }
        
        const processedOrders = orders.map((order: any) => ({
          ...order,
          reference: order.order_reference || order.reference || order.id,
          order_reference: order.order_reference || order.reference || order.id,
        }));
        
        return {
          orders: processedOrders,
          total: meta.total || processedOrders.length || 0,
          currentPage: meta.current_page || page,
          lastPage: meta.last_page || 1,
        };
      } catch (error) {
        console.error('Error fetching customer orders:', error);
        return {
          orders: [],
          total: 0,
          currentPage: page,
          lastPage: 1,
        };
      }
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

export const useTrackOrder = (orderReference: string) => {
  return useQuery({
    queryKey: ['customer', 'track', orderReference],
    queryFn: async () => {
      if (!orderReference) {
        throw new Error('Order reference is required');
      }
      
      try {
        const trackingInfo = await customerApi.orders.track(orderReference);
        return trackingInfo;
      } catch (error) {
        console.error(`Error tracking order ${orderReference}:`, error);
        throw error;
      }
    },
    enabled: !!orderReference,
    staleTime: 1 * 60 * 1000,
    retry: 2,
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderReference: string) => {
      const result = await customerApi.orders.cancel(orderReference);
      return result;
    },
    onSuccess: (data, orderReference) => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'order', orderReference] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'orders'] });
    },
  });
};