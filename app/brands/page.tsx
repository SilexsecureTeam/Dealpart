'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Loader2, ChevronRight } from 'lucide-react';

interface Brand {
  id: number;
  name: string;
  description?: string | null;
  logo?: string | null;
  logo_url?: string | null;
  slug?: string;
  product_count?: number;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Using the same endpoint as admin (adds auth token temporarily)
        const token = localStorage.getItem('adminToken');
        const response = await fetch('https://admin.bezalelsolar.com/api/brand', {
          headers: {
            'Accept': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load brands: ${response.status}`);
        }

        const data = await response.json();
        
        // Handle response format
        let brandsData: Brand[] = [];
        if (data?.brands && Array.isArray(data.brands)) {
          brandsData = data.brands;
        } else if (data?.data && Array.isArray(data.data)) {
          brandsData = data.data;
        } else if (Array.isArray(data)) {
          brandsData = data;
        }

        // The brands endpoint likely only returns active brands anyway
        setBrands(brandsData);
        setFilteredBrands(brandsData);
        
      } catch (err: any) {
        console.error('Error fetching brands:', err);
        setError(err.message || 'Failed to load brands');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Handle search
  useEffect(() => {
    const filtered = brands.filter(brand => 
      brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBrands(filtered);
  }, [searchQuery, brands]);

  // Get logo URL
  const getLogoUrl = (brand: Brand): string | null => {
    return brand.logo_url || brand.logo || null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4EA674]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load brands</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#4EA674] text-white rounded-lg hover:bg-[#3D8B59]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4EA674] to-[#2A6B4A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Brands</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Discover products from top brands in the solar industry
          </p>
          
          {/* Search Bar */}
          <div className="mt-6 relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brands..."
              className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredBrands.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No brands found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredBrands.map((brand) => {
              const logoUrl = getLogoUrl(brand);
              
              return (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug || brand.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 p-6 transition-all hover:border-[#4EA674]">
                    {/* Logo */}
                    <div className="aspect-square rounded-full bg-gray-100 overflow-hidden mb-4 flex items-center justify-center">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={brand.name}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const letter = document.createElement('span');
                              letter.className = 'text-4xl font-bold text-[#4EA674]/30';
                              letter.textContent = brand.name.charAt(0);
                              parent.appendChild(letter);
                            }
                          }}
                        />
                      ) : (
                        <span className="text-4xl font-bold text-[#4EA674]/30">
                          {brand.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* Brand Name */}
                    <h3 className="font-medium text-gray-900 text-center group-hover:text-[#4EA674] transition">
                      {brand.name}
                    </h3>

                    {/* Product Count (if available) */}
                    {brand.product_count !== undefined && (
                      <p className="text-xs text-gray-500 text-center mt-1">
                        {brand.product_count} products
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}