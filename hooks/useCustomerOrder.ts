// hooks/useCustomerOrder.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApiClient';
import type { CustomerOrder, CustomerOrderItem } from '@/types';

// Re-export types for convenience
export type { CustomerOrder, CustomerOrderItem };

// Hook to fetch a single order by reference (for customer)
export const useCustomerOrder = (orderReference: string) => {
  return useQuery({
    queryKey: ['customer', 'order', orderReference],
    queryFn: async () => {
      if (!orderReference) {
        throw new Error('Order reference is required');
      }
      
      try {
        // Using the customerApi.orders.getByReference method
        const order = await customerApi.orders.getByReference(orderReference);
        
        if (!order) {
          throw new Error('Order not found');
        }
        
        console.log('Raw customer order fetched:', order);
        
        // Ensure the order has a reference field (map from order_reference if needed)
        const processedOrder = {
          ...order,
          // If the API returns order_reference but your component expects reference
          reference: order.order_reference || order.reference || orderReference,
        };
        
        console.log('Processed order:', processedOrder);
        return processedOrder as CustomerOrder;
      } catch (error) {
        console.error(`Error fetching order ${orderReference}:`, error);
        throw error;
      }
    },
    enabled: !!orderReference,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Hook to fetch customer's order history
export const useCustomerOrders = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['customer', 'orders', page, limit],
    queryFn: async () => {
      try {
        // Using the customerApi.orders.list method
        const response = await customerApi.orders.list(page, limit);
        
        console.log('Raw customer orders response:', response);
        
        const orders = response?.data || [];
        
        // Process each order to ensure reference field exists
        const processedOrders = orders.map((order: any) => ({
          ...order,
          reference: order.order_reference || order.reference || order.id,
        }));
        
        console.log('Processed orders:', processedOrders);
        
        return {
          orders: processedOrders,
          total: response?.meta?.total || 0,
          currentPage: response?.meta?.current_page || page,
          lastPage: response?.meta?.last_page || 1,
        };
      } catch (error) {
        console.error('Error fetching customer orders:', error);
        // Return empty result on error instead of throwing
        return {
          orders: [],
          total: 0,
          currentPage: page,
          lastPage: 1,
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};

// Optional: Hook to track order
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
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['customer', 'order', orderReference] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'orders'] });
    },
  });
};