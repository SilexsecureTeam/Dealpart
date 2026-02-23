'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Loader2, ChevronRight, Camera } from 'lucide-react';

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
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
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
    // Try multiple possible paths
    if (brand.logo_url) return brand.logo_url;
    if (brand.logo) {
      // If logo is just a filename, construct the full URL
      if (!brand.logo.startsWith('http')) {
        return `https://admin.bezalelsolar.com/storage/logos/${brand.logo}`;
      }
      return brand.logo;
    }
    return null;
  };

  const handleImageError = (brandId: number) => {
    setImageErrors(prev => ({ ...prev, [brandId]: true }));
  };

  // Generate random pastel color based on brand name
  const getBrandColor = (name: string) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-yellow-100 text-yellow-600',
      'bg-red-100 text-red-600',
      'bg-indigo-100 text-indigo-600',
      'bg-pink-100 text-pink-600',
      'bg-orange-100 text-orange-600',
      'bg-teal-100 text-teal-600',
      'bg-cyan-100 text-cyan-600',
    ];
    
    // Use the sum of character codes to pick a consistent color
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#4EA674] mx-auto mb-4" />
          <p className="text-gray-600">Loading brands...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load brands</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-[#4EA674] text-white rounded-lg hover:bg-[#3D8B59] transition-colors font-medium"
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
      <div className="bg-gradient-to-r from-[#c0f5b4] to-[#2a6b4a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Our Brands</h1>
              <p className="text-lg opacity-90 max-w-2xl">
                Discover products from top brands in the solar industry
              </p>
            </div>
            
            {/* Brand Count */}
            <div className="mt-4 md:mt-0 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 inline-flex items-center gap-2">
              <span className="text-2xl font-bold">{filteredBrands.length}</span>
              <span className="text-sm opacity-90">Total Brands</span>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-8 relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brands..."
              className="w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredBrands.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">No brands found</p>
            <p className="text-gray-400">Try adjusting your search term</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 text-[#4EA674] hover:text-[#3D8B59] font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results count */}
            <p className="text-sm text-gray-500 mb-6">
              Showing {filteredBrands.length} {filteredBrands.length === 1 ? 'brand' : 'brands'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {filteredBrands.map((brand) => {
                const logoUrl = getLogoUrl(brand);
                const hasImageError = imageErrors[brand.id];
                const brandColor = getBrandColor(brand.name);
                
                return (
                  <Link
                    key={brand.id}
                    href={`/brands/${brand.slug || brand.id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 p-6 transition-all hover:border-[#4EA674] hover:-translate-y-1">
                      {/* Logo Container */}
                      <div className="aspect-square rounded-xl bg-gray-50 overflow-hidden mb-4 flex items-center justify-center border border-gray-100">
                        {logoUrl && !hasImageError ? (
                          <img
                            src={logoUrl}
                            alt={brand.name}
                            className="object-contain w-full h-full p-4"
                            onError={() => handleImageError(brand.id)}
                          />
                        ) : (
                          <div className={`w-full h-full ${brandColor} flex items-center justify-center`}>
                            <span className="text-3xl md:text-4xl font-bold">
                              {brand.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Brand Info */}
                      <div className="text-center">
                        <h3 className="font-semibold text-gray-900 group-hover:text-[#4EA674] transition line-clamp-1">
                          {brand.name}
                        </h3>

                        {/* Product Count */}
                        {brand.product_count !== undefined && brand.product_count > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {brand.product_count} {brand.product_count === 1 ? 'product' : 'products'}
                          </p>
                        )}

                        {/* View Products Link */}
                        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-[#4EA674] font-medium inline-flex items-center gap-1">
                            View Products <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}