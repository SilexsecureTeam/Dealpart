// hooks/useRelatedProducts.ts
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '@/lib/customerApiClient';

export interface RelatedProduct {
  id: number;
  name: string;
  price: number;
  rating: number;
  image: string;
  slug: string;
}

// Helper: create slug
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

// Fallback related products
const fallbackRelated: RelatedProduct[] = [
  {
    id: 201,
    name: 'AE Dunamis 5KVA',
    price: 450000,
    rating: 4.8,
    image: '/offer.jpg',
    slug: 'ae-dunamis-5kva',
  },
  {
    id: 202,
    name: 'Power Guard 7.5KVA',
    price: 520000,
    rating: 4.6,
    image: '/offer.jpg',
    slug: 'power-guard-7-5kva',
  },
  {
    id: 203,
    name: 'Voltage Pro 10KVA',
    price: 680000,
    rating: 4.7,
    image: '/offer.jpg',
    slug: 'voltage-pro-10kva',
  },
  {
    id: 204,
    name: 'StableMax 8KVA',
    price: 590000,
    rating: 4.5,
    image: '/offer.jpg',
    slug: 'stablemax-8kva',
  },
];

export const useRelatedProducts = (categoryId: number | undefined, currentProductId?: number) => {
  return useQuery({
    queryKey: ['customer', 'products', 'related', categoryId, currentProductId],
    queryFn: async () => {
      if (!categoryId) return fallbackRelated;

      const params = new URLSearchParams({
        category_id: categoryId.toString(),
        limit: '4',
      });
      const response = await customerApi.products.list(params);
      let products = response.data || response.products || [];

      // Filter out current product
      if (currentProductId) {
        products = products.filter((p: any) => p.id !== currentProductId);
      }

      // Take first 4 and normalize
      const normalized = products.slice(0, 4).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.sale_price || p.price || 0,
        rating: p.rating || 4.5,
        image: p.image || '/offer.jpg',
        slug: p.slug || createSlug(p.name),
      }));

      return normalized.length > 0 ? normalized : fallbackRelated;
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};