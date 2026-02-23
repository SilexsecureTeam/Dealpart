// hooks/useCustomerProducts.ts
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApiClient';

// ---------- Types ----------
export interface CustomerProduct {
  id: number;
  name: string;
  slug?: string;
  price: number;
  sale_price?: number | null;
  image: string;
  rating?: number;
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  brand?: string;
  category?: string;
}

export interface ProductsResponse {
  data?: CustomerProduct[];
  products?: CustomerProduct[];
  total?: number;
}

// Add params type
export interface CustomerProductsParams {
  search?: string;
  category?: string;
  brand?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
}

// ---------- Helper: create slug from product name ----------
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

// ---------- Fetch all products (customer/public) with optional params ----------
export const useCustomerProducts = (params?: CustomerProductsParams) => {
  return useQuery({
    queryKey: ['customer', 'products', params], // Include params in queryKey for caching
    queryFn: async () => {
      // Build query string from params
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.brand) queryParams.append('brand', params.brand);
      if (params?.min_price) queryParams.append('min_price', params.min_price.toString());
      if (params?.max_price) queryParams.append('max_price', params.max_price.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await customerApi.products.list(queryParams);
      
      // ✅ Handle BOTH array response AND object response
      let rawProducts: any[] = [];
      
      if (Array.isArray(response)) {
        // Direct array of products
        rawProducts = response;
      } else if (response?.data && Array.isArray(response.data)) {
        // Paginated: { data: [...] }
        rawProducts = response.data;
      } else if (response?.products && Array.isArray(response.products)) {
        // { products: [...] }
        rawProducts = response.products;
      } else {
        // Fallback to empty array
        rawProducts = [];
      }
      
      // Normalize product data
      const normalized: CustomerProduct[] = rawProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug || createSlug(p.name),
        price: p.sale_price || p.price || p.sales_price_inc_tax || 0,
        sale_price: p.sale_price || null,
        image: p.image || p.images?.[0] || '/offer.jpg',
        rating: p.rating || 4.5,
        stock_status: p.stock_status || 'in_stock',
        brand: p.brand || p.brand_name || 'Generic',
        category: p.category?.name || p.category_name,
      }));

      return normalized;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};