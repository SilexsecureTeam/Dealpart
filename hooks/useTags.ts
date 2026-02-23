// hooks/useTags.ts
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Tag {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
  product_count?: number;
}

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await api.get('/tags');
      const data = response.data;
      
      if (Array.isArray(data)) return data;
      if (data?.data && Array.isArray(data.data)) return data.data;
      if (data?.tags && Array.isArray(data.tags)) return data.tags;
      
      return [];
    },
  });
};

export const useTag = (id: number) => {
  return useQuery({
    queryKey: ['tag', id],
    queryFn: async () => {
      const response = await api.get(`/tags/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};