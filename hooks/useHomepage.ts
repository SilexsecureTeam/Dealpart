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
  {
    id: 2,
    name: "Lithium LiFePO4 Battery 12V / 100Ah",
    description: "Safe lithium battery",
    sales_price_inc_tax: 40.99,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    price: 40.99,
    image: "/offer.jpg",
    rating: 5,
    stock_status: "low_stock",
  },
  {
    id: 3,
    name: "Solar Motion Sensor Light (24W)",
    description: "Smart motion-activated lighting",
    sales_price_inc_tax: 119.99,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    price: 119.99,
    image: "/offer.jpg",
    rating: 5,
    stock_status: "in_stock",
  },
  {
    id: 4,
    name: "MPPT Charge Controller 60A",
    description: "Maximum power point tracking",
    sales_price_inc_tax: 119.99,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    price: 119.99,
    image: "/offer.jpg",
    rating: 5,
    stock_status: "in_stock",
  },
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
  {
    id: 102,
    name: "Lithium LiFePO4 Battery 12V / 100Ah",
    description: "Safe, long-life lithium technology",
    sales_price_inc_tax: 40.99,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    price: 40.99,
    image: "/solarpanel.png",
    rating: 5,
    stock_status: "in_stock",
    short_description: "Safe, long-life lithium technology",
    is_hot: true,
    is_featured: false,
  },
  {
    id: 103,
    name: "Solar Motion Sensor Light (24W)",
    description: "Smart motion-activated lighting",
    sales_price_inc_tax: 119.99,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    price: 119.99,
    image: "/solarpanel.png",
    rating: 5,
    stock_status: "in_stock",
    short_description: "Smart motion-activated lighting",
    is_hot: true,
    is_featured: false,
  },
  {
    id: 104,
    name: "MPPT Charge Controller 60A",
    description: "Maximum power point tracking",
    sales_price_inc_tax: 119.99,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    price: 119.99,
    image: "/solarpanel.png",
    rating: 5,
    stock_status: "in_stock",
    short_description: "Maximum power point tracking",
    is_hot: true,
    is_featured: false,
  },
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
          const response = await customerApi.products.list(new URLSearchParams({ category: 'all' }));
          const allProducts = response.data || response.products || response || [];
          // Extract unique categories from products
          const cats = allProducts
            .map((p: any) => p.category)
            .filter(Boolean)
            .filter((v: any, i: number, a: any[]) => a.findIndex((t) => t.id === v.id) === i);
          return cats.slice(0, 6).map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            image: cat.image || '/solarpanel.png',
            description: cat.description || '',
            slug: cat.slug || '',
            created_at: cat.created_at || '',
            updated_at: cat.updated_at || '',
          }));
        },
        staleTime: 10 * 60 * 1000,
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