// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Product, PaginatedResponse } from '@/types';

// ---------- Types ----------
export interface CreateProductPayload {
  name: string;
  description: string;
  sales_price_inc_tax: string | number;
  sale_price?: string | number;
  category_id?: string | number;
  stock_quantity?: string | number;
  images: File[];
  colours?: string[];
  customize?: boolean;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  // All fields are optional except maybe id
}

// ---------- Queries ----------
export const useProducts = (page = 1, perPage = 10) => {
  return useQuery({
    queryKey: ['products', page, perPage],
    queryFn: async () => {
      const data = await api.get<PaginatedResponse<Product>>(
        `/products?page=${page}&per_page=${perPage}`
      );
      return data;
    },
  });
};

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const data = await api.get<{ data: Product }>(`/products/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

// ---------- Mutations ----------
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateProductPayload) => {
      const formData = new FormData();

      // Required fields
      formData.append('name', payload.name);
      formData.append('description', payload.description);
      formData.append('sales_price_inc_tax', String(payload.sales_price_inc_tax));

      // Optional fields
      if (payload.sale_price) {
        formData.append('sale_price', String(payload.sale_price));
      }
      if (payload.category_id) {
        formData.append('category_id', String(payload.category_id));
      }
      if (payload.stock_quantity) {
        formData.append('stock_quantity', String(payload.stock_quantity));
      }
      if (payload.customize !== undefined) {
        formData.append('customize', payload.customize ? '1' : '0');
      }

      // Images – send as images[0], images[1], etc.
      payload.images.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });

      // Colours – send as colours[0], colours[1], etc.
      if (payload.colours && payload.colours.length > 0) {
        payload.colours.forEach((colour, index) => {
          formData.append(`colours[${index}]`, colour);
        });
      }

      return api.post<Product>('/products', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateProductPayload) => {
      const formData = new FormData();

      // Append only the fields that are present
      if (payload.name) formData.append('name', payload.name);
      if (payload.description) formData.append('description', payload.description);
      if (payload.sales_price_inc_tax) {
        formData.append('sales_price_inc_tax', String(payload.sales_price_inc_tax));
      }
      if (payload.sale_price) formData.append('sale_price', String(payload.sale_price));
      if (payload.category_id) formData.append('category_id', String(payload.category_id));
      if (payload.stock_quantity) formData.append('stock_quantity', String(payload.stock_quantity));
      if (payload.customize !== undefined) {
        formData.append('customize', payload.customize ? '1' : '0');
      }
      
      // Images – replace all (or you might want to handle separately)
      if (payload.images && payload.images.length > 0) {
        payload.images.forEach((file, index) => {
          formData.append(`images[${index}]`, file);
        });
      }

      // Colours
      if (payload.colours && payload.colours.length > 0) {
        payload.colours.forEach((colour, index) => {
          formData.append(`colours[${index}]`, colour);
        });
      }

      // Important: Add _method field for Laravel
      formData.append('_method', 'PATCH');

      return api.post<Product>(`/products/${id}`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) => api.delete(`/products/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};