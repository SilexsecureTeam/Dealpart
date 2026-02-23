// hooks/useHomepage.ts
import { useQueries } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApiClient';
import { Product, Category } from '@/types';

// ---------- Helper to normalize product ----------
export function normalizeProduct(product: any): Product {
  const price = product.sale_price || product.price || product.sales_price_inc_tax || 0;
  const numericPrice = typeof price === 'string' ? parseFloat(price) || 0 : price;
  
  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    sales_price_inc_tax: product.sales_price_inc_tax || numericPrice,
    created_at: product.created_at || new Date().toISOString(),
    updated_at: product.updated_at || new Date().toISOString(),
    price: numericPrice,
    sale_price: product.sale_price || null,
    image: product.image || product.images?.[0] || '/offer.jpg',
    rating: product.rating || 5,
    stock_status: product.stock_status || 'in_stock',
    stock_quantity: product.stock_quantity,
    is_featured: product.is_featured || false,
    is_hot: product.is_hot || false,
    short_description: product.short_description || product.description?.slice(0, 80) || '',
  };
}

// ---------- Fallback Data ----------
export const fallbackProducts: Product[] = [
  {
    id: 1,
    name: "Apex 550W Monocrystalline Panel",
    description: "High-efficiency solar panel",
    sales_price_inc_tax: 29.99,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    price: 29.99,
    image: "/offer.jpg",
    rating: 5,
    stock_status: "in_stock",
  },
  // ... other fallback products
];

export const fallbackNewArrivals: Product[] = [
  {
    id: 101,
    name: "Apex 550W Monocrystalline Panel",
    description: "High-efficiency solar panel",
    sales_price_inc_tax: 29.99,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    price: 29.99,
    image: "/solarpanel.png",
    rating: 5,
    stock_status: "in_stock",
    short_description: "High-efficiency solar panel",
    is_featured: true,
    is_hot: false,
  },
  // ... other fallback new arrivals
];

export const fallbackCategories: Category[] = [
  { id: 1, name: "PV Solar Panels", image: "/solarpanel.png", description: "", slug: "", created_at: "", updated_at: "" },
  { id: 2, name: "Inverters", image: "/solarpanel.png", description: "", slug: "", created_at: "", updated_at: "" },
  { id: 3, name: "Batteries", image: "/solarpanel.png", description: "", slug: "", created_at: "", updated_at: "" },
  { id: 4, name: "Charge Controllers", image: "/solarpanel.png", description: "", slug: "", created_at: "", updated_at: "" },
  { id: 5, name: "Stabilizers", image: "/solarpanel.png", description: "", slug: "", created_at: "", updated_at: "" },
  { id: 6, name: "Accessories", image: "/solarpanel.png", description: "", slug: "", created_at: "", updated_at: "" },
];

// ---------- Homepage Data Hook ----------
export const useHomepageData = () => {
  const results = useQueries({
    queries: [
      {
        queryKey: ['customer', 'products', 'featured'],
        queryFn: async () => {
          const response = await customerApi.products.list(new URLSearchParams({ limit: '20' }));
          const allProducts = response.data || response.products || response || [];
          return allProducts.map(normalizeProduct);
        },
        staleTime: 5 * 60 * 1000,
        retry: 1,
      },
      {
        queryKey: ['customer', 'categories', 'homepage'],
        queryFn: async () => {
          try {
            // ✅ FIXED: Fetch categories directly from API
            const response = await fetch('https://admin.bezalelsolar.com/api/categories');
            const data = await response.json();
            
            console.log('Categories API response:', data);
            
            // Handle different response formats
            let categories = [];
            if (Array.isArray(data)) {
              categories = data;
            } else if (data?.data && Array.isArray(data.data)) {
              categories = data.data;
            } else if (data?.categories && Array.isArray(data.categories)) {
              categories = data.categories;
            }
            
            // Normalize categories
            return categories.slice(0, 6).map((cat: any) => ({
              id: cat.id,
              name: cat.name,
              image: cat.image || '/solarpanel.png',
              description: cat.description || '',
              slug: cat.slug || '',
              created_at: cat.created_at || '',
              updated_at: cat.updated_at || '',
            }));
          } catch (error) {
            console.error('Failed to fetch categories:', error);
            return fallbackCategories;
          }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
      },
    ],
  });

  const [productsQuery, categoriesQuery] = results;

  // Extract data with fallbacks
  const allProducts = productsQuery.data ?? [];
  const featuredProducts = allProducts.slice(0, 4);
  const newArrivals = allProducts.slice(4, 8);

  const categories = categoriesQuery.data ?? fallbackCategories;

  // Combined loading state
  const isLoading = productsQuery.isLoading || categoriesQuery.isLoading;
  const isError = productsQuery.isError || categoriesQuery.isError;
  const refetch = () => {
    productsQuery.refetch();
    categoriesQuery.refetch();
  };

  return {
    featuredProducts,
    newArrivals,
    categories,
    isLoading,
    isError,
    refetch,
  };
};