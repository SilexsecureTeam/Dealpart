// hooks/useCategoryProducts.ts
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApiClient';
import { Product, Category } from '@/types';

// ---------- Helper: create slug ----------
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

// ---------- Helper: create category object ----------
function createCategory(name: string, slug: string): Category {
  return {
    id: 0, // temporary, will be overwritten by real data if available
    name,
    description: '',
    slug,
    image: '',
    created_at: '',
    updated_at: '',
  };
}

// ---------- Fallback products for Hybrid Inverters ----------
export const fallbackHybridProducts: Product[] = [
  {
    id: 1,
    name: 'Felicity IVEM6048 - 6kVA Hybrid Inverter',
    price: 635000,
    sales_price_inc_tax: 635000,
    image: '/offer.jpg',
    rating: 4.8,
    stock_status: 'in_stock',
    category: createCategory('Hybrid Inverters', 'hybrid-inverters'),
    created_at: '',
    updated_at: '',
    description: '',
  },
  {
    id: 2,
    name: 'Growatt 5kW Hybrid Inverter',
    price: 580000,
    sales_price_inc_tax: 580000,
    image: '/offer.jpg',
    rating: 4.9,
    stock_status: 'in_stock',
    category: createCategory('Hybrid Inverters', 'hybrid-inverters'),
    created_at: '',
    updated_at: '',
    description: '',
  },
  {
    id: 3,
    name: 'Deye 8kW Hybrid Inverter',
    price: 720000,
    sales_price_inc_tax: 720000,
    image: '/offer.jpg',
    rating: 4.7,
    stock_status: 'low_stock',
    category: createCategory('Hybrid Inverters', 'hybrid-inverters'),
    created_at: '',
    updated_at: '',
    description: '',
  },
  {
    id: 4,
    name: 'Sunsynk 5.5kW Hybrid Inverter',
    price: 610000,
    sales_price_inc_tax: 610000,
    image: '/offer.jpg',
    rating: 4.6,
    stock_status: 'in_stock',
    category: createCategory('Hybrid Inverters', 'hybrid-inverters'),
    created_at: '',
    updated_at: '',
    description: '',
  },
];

// ---------- Fallback products for Standard Inverters ----------
export const fallbackStandardProducts: Product[] = [
  {
    id: 101,
    name: 'Felicity 3.5kW Standard Inverter',
    price: 295000,
    sales_price_inc_tax: 295000,
    image: '/offer.jpg',
    rating: 4.5,
    stock_status: 'in_stock',
    category: createCategory('Standard Inverters', 'standard-inverters'),
    created_at: '',
    updated_at: '',
    description: '',
  },
  {
    id: 102,
    name: 'Luminous 5kW Off-Grid Inverter',
    price: 320000,
    sales_price_inc_tax: 320000,
    image: '/offer.jpg',
    rating: 4.4,
    stock_status: 'low_stock',
    category: createCategory('Standard Inverters', 'standard-inverters'),
    created_at: '',
    updated_at: '',
    description: '',
  },
  {
    id: 103,
    name: 'SMA 4kW Off-Grid Inverter',
    price: 410000,
    sales_price_inc_tax: 410000,
    image: '/offer.jpg',
    rating: 4.6,
    stock_status: 'in_stock',
    category: createCategory('Standard Inverters', 'standard-inverters'),
    created_at: '',
    updated_at: '',
    description: '',
  },
  {
    id: 104,
    name: 'Victron 5kW Off-Grid Inverter',
    price: 550000,
    sales_price_inc_tax: 550000,
    image: '/offer.jpg',
    rating: 4.8,
    stock_status: 'out_of_stock',
    category: createCategory('Standard Inverters', 'standard-inverters'),
    created_at: '',
    updated_at: '',
    description: '',
  },
];

// ---------- Hook to fetch products by category slug ----------
export const useCategoryProducts = (categorySlug: string, limit = 4) => {
  return useQuery({
    queryKey: ['customer', 'products', 'category', categorySlug, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        category: categorySlug,
        limit: limit.toString(),
      });
      const response = await customerApi.products.list(params);
      const raw = response.data || response.products || response || [];

      // Normalize to Product type
      const products: Product[] = raw.slice(0, limit).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        sales_price_inc_tax: p.sale_price || p.price || 0,
        price: p.sale_price || p.price || 0,
        image: p.image || '/offer.jpg',
        rating: p.rating || 4.5,
        stock_status: p.stock_status || 'in_stock',
        category: p.category ? {
          id: p.category.id || 0,
          name: p.category.name || categorySlug,
          description: p.category.description || '',
          slug: p.category.slug || categorySlug,
          image: p.category.image || '',
          created_at: p.category.created_at || '',
          updated_at: p.category.updated_at || '',
        } : createCategory(categorySlug, categorySlug),
        created_at: p.created_at || '',
        updated_at: p.updated_at || '',
        slug: p.slug || createSlug(p.name),
      }));

      return products;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};