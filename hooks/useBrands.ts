// hooks/useBrands.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api'; // Changed from apiClient to api

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
      const response = await api.get('/brand');
      console.log('Brands API response:', response); // Debug log
      
      const data = response.data || response;
      
      // Handle different response shapes
      if (Array.isArray(data)) {
        return data as Brand[];
      }
      if (data?.data && Array.isArray(data.data)) {
        return data.data as Brand[];
      }
      // If response has a 'brands' property that's an array
      if (data?.brands && Array.isArray(data.brands)) {
        return data.brands as Brand[];
      }
      // If it's a single brand object wrapped in a response
      if (data?.brand && typeof data.brand === 'object') {
        return [data.brand] as Brand[];
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
      const response = await api.post('/brand', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Create brand response:', response); // Debug log
      return response.data;
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
      // Note: Using POST with _method=PATCH as per your API pattern
      data.append('_method', 'PATCH');
      const response = await api.post(`/brand/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Update brand response:', response); // Debug log
      return response.data;
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
      const response = await api.delete(`/brand/${id}`);
      console.log('Delete brand response:', response); // Debug log
      return response.data;
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
      const response = await api.get(`/brand/${id}`);
      console.log('Single brand response:', response); // Debug log
      
      const data = response.data || response;
      
      // Handle different response shapes
      if (data?.brand) {
        return data.brand as Brand;
      }
      if (data?.data) {
        return data.data as Brand;
      }
      return data as Brand;
    },
    enabled: !!id,
  });
};