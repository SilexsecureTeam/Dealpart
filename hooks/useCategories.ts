// hooks/useCategories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

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
      const response = await api.categories.list();
      // Handle different response shapes
      const list = Array.isArray(response) ? response : response?.data || [];
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
        return api.categories.create(data);
      }
      // Use the new method that supports full FormData
      return api.categories.createWithDetails(data);
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
      // Use the new method that supports full FormData
      return api.categories.updateWithDetails(id, data);
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
      return api.categories.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });
};