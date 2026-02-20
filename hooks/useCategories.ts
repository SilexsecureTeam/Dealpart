// hooks/useCategories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api'; // Changed from apiClient to api

export interface Category {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
  tag_id: number | null;
}

// ---------- Fetch all categories ----------
export const useCategories = () => {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      const data = response.data || response;
      // Handle different response shapes
      const list = Array.isArray(data) ? data : data?.data || [];
      return list as Category[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ---------- Create a new category ----------
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: string | FormData) => {
      if (typeof data === 'string') {
        // Simple case - just name as string
        const response = await api.post('/categories', { name: data });
        return response.data;
      } else {
        // FormData case - includes image and description
        const response = await api.post('/categories', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });
};

// ---------- Update a category ----------
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      // Add _method field for Laravel-style PATCH
      data.append('_method', 'PATCH');
      const response = await api.post(`/categories/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });
};

// ---------- Delete a category ----------
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/categories/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });
};