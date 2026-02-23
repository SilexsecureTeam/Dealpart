// hooks/useInventory.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export interface InventoryItem {
  id: number;
  name: string;
  barcode?: string;
  brand?: string;
  supplier?: string;
  order_code?: string;
  category_name?: string;
  current_stock: number;
  total_stock: number;
  on_order?: number;
  cost_price: number;
  sales_price: number;
  total_cost?: number;
  total_value?: number;
  margin?: number;
  margin_percentage?: number;
  measure?: string;
  unit_of_sale?: string;
  created_at?: string;
  updated_at?: string;
}

// Get all inventory items
export const useInventory = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.search) searchParams.append('search', params.search);
      
      const url = `/stockInventory${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response.data;
    },
  });
};

// Get single inventory item
export const useInventoryItem = (id: number) => {
  return useQuery({
    queryKey: ['inventory', id],
    queryFn: async () => {
      const response = await api.get(`/stockInventory/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create inventory item
export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post('/stockInventory', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Inventory item created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create inventory item');
    },
  });
};

// Update inventory item
export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      data.append('_method', 'PATCH');
      const response = await api.post(`/stockInventory/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', variables.id] });
      toast.success('Inventory item updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update inventory item');
    },
  });
};

// Delete inventory item
export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/stockInventory/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Inventory item deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete inventory item');
    },
  });
};

// Import inventory via CSV
export const useImportInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/importInventory', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Inventory imported successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to import inventory');
    },
  });
};

// Get low stock alerts
export const useLowStockInventory = (threshold: number = 10) => {
  return useQuery({
    queryKey: ['inventory', 'low-stock', threshold],
    queryFn: async () => {
      const response = await api.get(`/stockInventory?current_stock<${threshold}`);
      return response.data;
    },
  });
};