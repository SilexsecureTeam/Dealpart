// hooks/useSubcategories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Category } from './useCategories';

export interface Subcategory {
  id: number;
  name: string;
  category_id: number;
  description?: string;
  image?: string | null;
  created_at?: string;
  updated_at?: string;
  category?: Category;
}

// Fetch all subcategories
export const useSubcategories = (categoryId?: number) => {
  return useQuery({
    queryKey: ['subcategories', categoryId],
    queryFn: async () => {
      const params = categoryId ? new URLSearchParams({ category_id: categoryId.toString() }) : undefined;
      const response = await api.subcategories?.list?.(params) || await api.get('/subcategories', { params });
      
      const data = response.data;
      
      // Handle different response formats
      if (Array.isArray(data)) return data;
      if (data?.data && Array.isArray(data.data)) return data.data;
      if (data?.subcategories && Array.isArray(data.subcategories)) return data.subcategories;
      
      return [];
    },
  });
};

// Fetch single subcategory
export const useSubcategory = (id: number) => {
  return useQuery({
    queryKey: ['subcategory', id],
    queryFn: async () => {
      const response = await api.get(`/subcategories/${id}`);
      const data = response.data;
      return data.data || data;
    },
    enabled: !!id,
  });
};

// Create subcategory
export const useCreateSubcategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/subcategories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
  });
};

// Update subcategory
export const useUpdateSubcategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      // For FormData with files, we need to append _method
      data.append('_method', 'PATCH');
      
      const response = await api.post(`/subcategories/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['subcategory', variables.id] });
    },
  });
};

// Delete subcategory
export const useDeleteSubcategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/subcategories/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
  });
};