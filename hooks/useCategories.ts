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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ---------- Create a new category ----------
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.categories.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });
};