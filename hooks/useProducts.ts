// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
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
  brand_id?: string | number;
  tags?: string[];
  sku?: string;
  barcode?: string;
  cost_price?: string | number;
  is_active?: boolean;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  id?: number;
}

export interface ProductsFilter {
  page?: number;
  limit?: number;
  per_page?: number;
  search?: string;
  category_id?: number | string;
  brand_id?: number | string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  is_active?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// ---------- Helper: Append to FormData ----------
function appendToFormData(formData: FormData, key: string, value: any) {
  if (value !== undefined && value !== null && value !== '') {
    formData.append(key, String(value));
  }
}

// ---------- Query Keys ----------
export const productsQueryKeys = {
  all: ['products'] as const,
  lists: () => [...productsQueryKeys.all, 'list'] as const,
  list: (filters?: ProductsFilter) => {
    if (!filters) return [...productsQueryKeys.lists(), 'all'] as const;
    return [...productsQueryKeys.lists(), filters] as const;
  },
  details: () => [...productsQueryKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...productsQueryKeys.details(), id] as const,
};

// ---------- Queries ----------
export const useProducts = (filter?: ProductsFilter) => {
  const page = filter?.page || 1;
  const limit = filter?.limit || filter?.per_page || 10;
  
  const queryKey = productsQueryKeys.list(filter);
  console.log('useProducts queryKey:', JSON.stringify(queryKey));
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      console.log('Fetching products with filter:', filter);
      const params = new URLSearchParams();
      
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (filter?.search) params.append('search', filter.search);
      if (filter?.category_id) params.append('category_id', String(filter.category_id));
      if (filter?.brand_id) params.append('brand_id', String(filter.brand_id));
      if (filter?.min_price) params.append('min_price', String(filter.min_price));
      if (filter?.max_price) params.append('max_price', String(filter.max_price));
      if (filter?.in_stock !== undefined) params.append('in_stock', filter.in_stock ? '1' : '0');
      if (filter?.is_active !== undefined) params.append('is_active', filter.is_active ? '1' : '0');
      if (filter?.sort_by) params.append('sort_by', filter.sort_by);
      if (filter?.sort_order) params.append('sort_order', filter.sort_order);
      
      const response = await api.get<PaginatedResponse<Product>>(`/products?${params.toString()}`);
      console.log('Products fetched:', response.data);
      return response.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useProduct = (id: number | string) => {
  return useQuery({
    queryKey: productsQueryKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<{ data: Product }>(`/products/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProductsByCategory = (categoryId: number | string, limit = 10) => {
  return useQuery({
    queryKey: [...productsQueryKeys.all, 'category', categoryId],
    queryFn: async () => {
      const params = new URLSearchParams({
        category_id: String(categoryId),
        limit: String(limit),
      });
      const response = await api.get<{ data: Product[] }>(`/products?${params.toString()}`);
      return response.data.data;
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProductsByBrand = (brandId: number | string, limit = 10) => {
  return useQuery({
    queryKey: [...productsQueryKeys.all, 'brand', brandId],
    queryFn: async () => {
      const params = new URLSearchParams({
        brand_id: String(brandId),
        limit: String(limit),
      });
      const response = await api.get<{ data: Product[] }>(`/products?${params.toString()}`);
      return response.data.data;
    },
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeaturedProducts = (limit = 4) => {
  return useQuery({
    queryKey: [...productsQueryKeys.all, 'featured'],
    queryFn: async () => {
      const params = new URLSearchParams({
        featured: '1',
        limit: String(limit),
      });
      const response = await api.get<{ data: Product[] }>(`/products?${params.toString()}`);
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

// ---------- Mutations ----------
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: CreateProductPayload) => {
      console.log('Creating product with payload:', payload);
      const formData = new FormData();

      appendToFormData(formData, 'name', payload.name);
      appendToFormData(formData, 'description', payload.description);
      appendToFormData(formData, 'sales_price_inc_tax', payload.sales_price_inc_tax);

      if (payload.sale_price) {
        appendToFormData(formData, 'sale_price', payload.sale_price);
      }
      if (payload.category_id) {
        appendToFormData(formData, 'category_id', payload.category_id);
      }
      if (payload.brand_id) {
        appendToFormData(formData, 'brand_id', payload.brand_id);
      }
      if (payload.stock_quantity) {
        appendToFormData(formData, 'stock_quantity', payload.stock_quantity);
      }
      if (payload.sku) {
        appendToFormData(formData, 'sku', payload.sku);
      }
      if (payload.barcode) {
        appendToFormData(formData, 'barcode', payload.barcode);
      }
      if (payload.cost_price) {
        appendToFormData(formData, 'cost_price', payload.cost_price);
      }
      if (payload.customize !== undefined) {
        appendToFormData(formData, 'customize', payload.customize ? '1' : '0');
      }
      if (payload.is_active !== undefined) {
        appendToFormData(formData, 'is_active', payload.is_active ? '1' : '0');
      }

      if (payload.images && payload.images.length > 0) {
        payload.images.forEach((file, index) => {
          formData.append(`images[${index}]`, file);
        });
      }

      if (payload.colours && payload.colours.length > 0) {
        payload.colours.forEach((colour, index) => {
          appendToFormData(formData, `colours[${index}]`, colour);
        });
      }

      if (payload.tags && payload.tags.length > 0) {
        payload.tags.forEach((tag, index) => {
          appendToFormData(formData, `tags[${index}]`, tag);
        });
      }

      const response = await api.post<Product>('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('Product created:', response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log('Product created successfully, invalidating queries...');
      // Invalidate ALL product queries
      queryClient.invalidateQueries({ queryKey: ['products'] });
      console.log('Queries invalidated');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number | string; payload: UpdateProductPayload }) => {
      const formData = new FormData();

      if (payload.name) appendToFormData(formData, 'name', payload.name);
      if (payload.description) appendToFormData(formData, 'description', payload.description);
      if (payload.sales_price_inc_tax) {
        appendToFormData(formData, 'sales_price_inc_tax', payload.sales_price_inc_tax);
      }
      if (payload.sale_price) appendToFormData(formData, 'sale_price', payload.sale_price);
      if (payload.category_id) appendToFormData(formData, 'category_id', payload.category_id);
      if (payload.brand_id) appendToFormData(formData, 'brand_id', payload.brand_id);
      if (payload.stock_quantity) appendToFormData(formData, 'stock_quantity', payload.stock_quantity);
      if (payload.sku) appendToFormData(formData, 'sku', payload.sku);
      if (payload.barcode) appendToFormData(formData, 'barcode', payload.barcode);
      if (payload.cost_price) appendToFormData(formData, 'cost_price', payload.cost_price);
      if (payload.customize !== undefined) {
        appendToFormData(formData, 'customize', payload.customize ? '1' : '0');
      }
      if (payload.is_active !== undefined) {
        appendToFormData(formData, 'is_active', payload.is_active ? '1' : '0');
      }
      
      if (payload.images && payload.images.length > 0) {
        payload.images.forEach((file, index) => {
          formData.append(`images[${index}]`, file);
        });
      }

      if (payload.colours && payload.colours.length > 0) {
        payload.colours.forEach((colour, index) => {
          appendToFormData(formData, `colours[${index}]`, colour);
        });
      }

      if (payload.tags && payload.tags.length > 0) {
        payload.tags.forEach((tag, index) => {
          appendToFormData(formData, `tags[${index}]`, tag);
        });
      }

      appendToFormData(formData, '_method', 'PATCH');

      const response = await api.post<Product>(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.detail(variables.id) });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId: number | string) => api.delete(`/products/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useBulkDeleteProducts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productIds: (number | string)[]) => 
      api.post('/products/bulk-delete', { ids: productIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useToggleProductStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, is_active }: { id: number | string; is_active: boolean }) =>
      api.patch(`/products/${id}`, { is_active }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.detail(variables.id) });
    },
  });
};

export const useDuplicateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number | string) => api.post(`/products/${id}/duplicate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};