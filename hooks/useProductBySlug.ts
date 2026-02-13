// hooks/useProductBySlug.ts
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApiClient';

// ---------- Helper: create slug from product name ----------
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

// ---------- Types ----------
export interface ProductDetail {
  id: number;
  name: string;
  slug?: string;
  price: number;
  sale_price?: number | null;
  image: string;
  rating?: number;
  reviews_count?: number;
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  category_id?: number;
  category_name?: string;
  description?: string;
  features?: string[];
  watchers?: number;
  deliveryOptions?: Array<{
    icon: string;
    title: string;
    description: string;
    time: string;
    cost: string;
  }>;
  warranty?: string;
}

// ---------- Fallback product (when API fails) ----------
export const fallbackProductDetail: ProductDetail = {
  id: 123,
  name: 'Felicity IVEM6048 - 6kVA Hybrid Inverter (48V)',
  slug: 'felicity-ivem6048-6kva-hybrid-inverter-48v',
  price: 635000,
  image: '/solarpanel.png',
  rating: 4.5,
  reviews_count: 128,
  stock_status: 'in_stock',
  category_id: 2,
  category_name: 'Inverters',
  description:
    'The Felicity FLA48300 is a high-capacity 48V 300Ah lithium battery designed for residential and commercial energy storage applications. Engineered for efficiency, safety, and long lifespan, it delivers stable power supply and seamless integration with solar systems and hybrid inverters.',
  features: [
    'Pure sine wave 6kVA output - safe for all electronics.',
    'Built-in MPPT solar charge controller (up to 120A).',
    'Supports lithium, GEL, and AGM batteries.',
    'Wide 90-280V AC input for grid flexibility.',
    'LCD screen with real-time monitoring and settings.',
    'Auto-restart, overload, surge, and short-circuit protection.',
  ],
  watchers: 12,
  deliveryOptions: [
    {
      icon: 'pickup',
      title: 'Pick up from the store',
      description: 'Walk in to our store to pick up your package',
      time: '',
      cost: 'Free',
    },
    {
      icon: 'courier',
      title: 'Courier delivery',
      description: 'Our courier will deliver to the specified address (within Abuja)',
      time: '2-5 Hours',
      cost: 'Free',
    },
    {
      icon: 'courier',
      title: '',
      description: 'Our courier will deliver to the specified address (within Abuja)',
      time: '1-5 Days',
      cost: 'Free',
    },
  ],
};

// ---------- Hook ----------
export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['customer', 'product', slug],
    queryFn: async () => {
      // 1. Fetch all products (or we could have a search endpoint)
      const response = await customerApi.products.list();
      const allProducts = response.data || response.products || response || [];

      // 2. Find product with matching slug
      let found = allProducts.find(
        (p: any) =>
          p.slug === slug ||
          createSlug(p.name) === slug
      );

      if (!found) {
        // If not found, use fallback
        return fallbackProductDetail;
      }

      // 3. Fetch full product details by ID
      const detail = await customerApi.products.detail(found.id);
      const productDetail = detail.data || detail;

      // Normalize product data
      const normalized: ProductDetail = {
        id: productDetail.id,
        name: productDetail.name,
        slug: productDetail.slug || createSlug(productDetail.name),
        price: productDetail.sale_price || productDetail.price || 0,
        image: productDetail.image || '/solarpanel.png',
        rating: productDetail.rating || 4.5,
        reviews_count: productDetail.reviews_count || 0,
        stock_status: productDetail.stock_status || 'in_stock',
        category_id: productDetail.category_id,
        category_name: productDetail.category?.name,
        description:
          productDetail.description || fallbackProductDetail.description,
        features: productDetail.features || fallbackProductDetail.features,
        watchers: productDetail.watchers || Math.floor(Math.random() * 20) + 5,
        deliveryOptions: productDetail.deliveryOptions || fallbackProductDetail.deliveryOptions,
      };

      return normalized;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};