// hooks/useCustomerBrands.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Brand {
  id: number;
  name: string;
  description: string | null;
  logo: string | null;
  logo_url: string | null;
  website: string | null;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCustomerBrands = () => {
  return useQuery({
    queryKey: ['customer', 'brands'],
    queryFn: async () => {
      const response = await fetch('https://admin.bezalelsolar.com/api/brand');
      const data = await response.json();
      
      console.log('Customer brands response:', data);
      
      if (data?.brands && Array.isArray(data.brands)) {
        return data.brands as Brand[];
      }
      
      return [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch single brand by slug or ID
export const useCustomerBrand = (slug: string) => {
  return useQuery({
    queryKey: ['customer', 'brands', slug],
    queryFn: async () => {
      const response = await fetch(`https://admin.bezalelsolar.com/api/brand/${slug}`);
      const data = await response.json();
      
      console.log('Customer brand detail:', data);
      
      if (data?.brand) {
        return data.brand as Brand;
      }
      return data as Brand;
    },
    enabled: !!slug,
  });
};