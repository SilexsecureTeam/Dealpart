// hooks/useBrands.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

export interface Brand {
  id: number;
  name: string;
  description: string | null;
  logo: string | null;
  logo_url: string | null;
  website: string | null;
  is_active: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
}

// ---------- Fetch all brands ----------
export const useBrands = () => {
  return useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: async () => {
      const response = await api.brands.list();
      console.log('Brands API response:', response); // Debug log
      
      // Handle different response shapes
      if (Array.isArray(response)) {
        return response as Brand[];
      }
      if (response?.data && Array.isArray(response.data)) {
        return response.data as Brand[];
      }
      // If response has a 'brands' property that's an array
      if (response?.brands && Array.isArray(response.brands)) {
        return response.brands as Brand[];
      }
      // If it's a single brand object wrapped in a response
      if (response?.brand && typeof response.brand === 'object') {
        return [response.brand] as Brand[];
      }
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ---------- Create a new brand ----------
export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.brands.create(formData);
      console.log('Create brand response:', response); // Debug log
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] });
    },
  });
};

// ---------- Update a brand ----------
export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await api.brands.update(id, data);
      console.log('Update brand response:', response); // Debug log
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] });
    },
  });
};

// ---------- Delete a brand ----------
export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.brands.delete(id);
      console.log('Delete brand response:', response); // Debug log
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] });
    },
  });
};

// ---------- Get single brand ----------
export const useBrand = (id: number) => {
  return useQuery({
    queryKey: ['admin', 'brands', id],
    queryFn: async () => {
      const response = await api.brands.get(id);
      console.log('Single brand response:', response); // Debug log
      
      // Handle different response shapes
      if (response?.brand) {
        return response.brand as Brand;
      }
      if (response?.data) {
        return response.data as Brand;
      }
      return response as Brand;
    },
    enabled: !!id,
  });
};