'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Pencil,
  Trash2,
  Loader2,
  PlusSquare,
  X,
  Check,
  Download,
  RefreshCw
} from 'lucide-react';
import { Product } from '@/types';
import toast from 'react-hot-toast';

const resolveAvatar = (pathOrUrl: string | null | undefined): string => {
  if (!pathOrUrl) return '/man.png';
  const raw = String(pathOrUrl).trim();
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const filename = raw.split('/').pop() || raw;
  return `https://admin.bezalelsolar.com/storage/avatars/${filename}`;
};

const resolveImageUrl = (pathOrUrl: string | null | undefined, fallback = '/solarpanel.png'): string => {
  if (!pathOrUrl || String(pathOrUrl).trim() === '') return fallback;
  const raw = String(pathOrUrl).trim();
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const base = (process.env.NEXT_PUBLIC_API_URL || 'https://admin.bezalelsolar.com/api').replace('/api', '');
  if (raw.startsWith('storage/') || raw.startsWith('uploads/')) {
    return `${base}/${raw}`;
  }
  return `${base}/storage/${raw}`;
};

// Helper to safely get image URL from product
const getProductImageUrl = (product: any): string | null => {
  // Check for image_urls array (from your API)
  if (product.image_urls && Array.isArray(product.image_urls) && product.image_urls.length > 0) {
    const imgData = product.image_urls[0];
    if (imgData && typeof imgData === 'object') {
      // Check for url property
      if (imgData.url && typeof imgData.url === 'string') {
        return imgData.url;
      }
      // Check for path property
      if (imgData.path && typeof imgData.path === 'string') {
        return resolveImageUrl(imgData.path);
      }
    }
  }
  
  // Check for images array (string paths)
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const img = product.images[0];
    if (typeof img === 'string') {
      return resolveImageUrl(img);
    }
    // Handle object in images array
    if (img && typeof img === 'object') {
      const imgObj = img as any;
      if (imgObj.path && typeof imgObj.path === 'string') {
        return resolveImageUrl(imgObj.path);
      }
    }
  }
  
  // Check for direct image property
  if (product.image && typeof product.image === 'string') {
    return resolveImageUrl(product.image);
  }
  
  return null;
};

// Polling Status Component
const PollingStatus = () => {
  return (
    <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
      <RefreshCw className="w-4 h-4 animate-spin" />
      <span className="text-sm">Auto-refresh every 30s</span>
    </div>
  );
};

// Bulk Actions Bar Component
const BulkActionsBar = ({ 
  selectedCount, 
  onClearSelection, 
  onBulkDelete,
  onBulkStatusUpdate,
  onExport,
  isDeleting 
}: any) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-full shadow-2xl border border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {selectedCount} selected
        </span>
        
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
        
        <button
          onClick={onClearSelection}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
        
        <button
          onClick={() => onBulkStatusUpdate('published')}
          className="text-sm text-green-600 hover:text-green-700"
          title="Publish selected"
        >
          <Check className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onBulkStatusUpdate('draft')}
          className="text-sm text-yellow-600 hover:text-yellow-700"
          title="Move to draft"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
        
        <button
          onClick={() => onExport('csv')}
          className="text-sm text-blue-600 hover:text-blue-700"
          title="Export"
        >
          <Download className="w-4 h-4" />
        </button>
        
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
        
        <button
          onClick={onBulkDelete}
          disabled={isDeleting}
          className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
          title="Delete selected"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default function AdminProductListPage() {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Use ref to track if this is the first render
  const isFirstRender = useRef(true);
  
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const { data, isLoading, error, refetch } = useProducts({ 
    page, 
    limit: 10,
    search: searchQuery || undefined 
  });
  
  const deleteMutation = useDeleteProduct();

  // Handle different API response formats
  let products: any[] = [];
  let current_page = 1;
  let last_page = 1;

  if (data) {
    console.log('API Response:', data);
    
    if (Array.isArray(data)) {
      // Direct array response (like your Postman)
      products = data;
      current_page = page;
      last_page = 1;
    } 
    else if (data && typeof data === 'object') {
      // Check for data property (paginated response)
      if ('data' in data && Array.isArray(data.data)) {
        products = data.data;
        current_page = data.current_page || page;
        last_page = data.last_page || 1;
      }
      // Check for products property
      else if ('products' in data && Array.isArray(data.products)) {
        products = data.products;
        current_page = data.current_page || page;
        last_page = data.last_page || 1;
      }
      // If it's an object but not array, try to get values
      else {
        const values = Object.values(data);
        if (values.length > 0 && values.every(v => typeof v === 'object' && v !== null)) {
          products = values;
          current_page = page;
          last_page = 1;
        }
      }
    }
  }

  // FIXED: Handle select all with proper dependencies and conditions
  useEffect(() => {
    // Skip on first render to prevent infinite loop
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only run if we have products and selectAll is true
    if (selectAll && products.length > 0) {
      const allProductIds = products.map(p => p.id);
      // Only update if the selected products are different from all product IDs
      setSelectedProducts(prev => {
        // Check if the arrays are the same (order doesn't matter)
        const areEqual = 
          prev.length === allProductIds.length && 
          prev.every(id => allProductIds.includes(id));
        
        return areEqual ? prev : allProductIds;
      });
    } else if (!selectAll && selectedProducts.length > 0) {
      // Only clear if there are selected products
      setSelectedProducts([]);
    }
  }, [selectAll, products, selectedProducts.length]);

  // Polling for updates (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }, 30000);
    
    return () => clearInterval(interval);
  }, [queryClient]);

  // FIXED: Handle individual selection without causing loops
  const handleSelectProduct = useCallback((productId: number) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
    // Update selectAll state based on new selection
    setSelectAll(false); // Temporarily set to false, will be recalculated if needed
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectAll(prev => !prev);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedProducts([]);
    setSelectAll(false);
  }, []);

  // Debug log (remove in production)
  useEffect(() => {
    if (data) {
      console.log('API Response:', data);
      console.log('Processed products:', products);
    }
  }, [data, products]);

  const avatarUrl = user?.avatar_url || user?.avatar 
    ? resolveAvatar(user.avatar_url || user.avatar) 
    : '/man.png';

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src === '/man.png') return;
    img.src = '/man.png';
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onFocus = () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    };
    
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [queryClient]);

  // Refetch when search query changes
  useEffect(() => {
    refetch();
  }, [searchQuery, refetch]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteMutation.mutateAsync(id);
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Failed to delete product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        // Delete products one by one
        await Promise.all(selectedProducts.map(id => deleteMutation.mutateAsync(id)));
        queryClient.invalidateQueries({ queryKey: ['products'] });
        handleClearSelection();
        toast.success(`${selectedProducts.length} products deleted successfully`);
      } catch (error) {
        console.error('Failed to delete products:', error);
        toast.error('Failed to delete products');
      }
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedProducts.length === 0) return;
    
    try {
      const response = await fetch('/api/products/bulk-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedProducts, status })
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        handleClearSelection();
        toast.success(`Products updated to ${status}`);
      } else {
        toast.error('Failed to update product status');
      }
    } catch (error) {
      console.error('Failed to update product status:', error);
      toast.error('Failed to update product status');
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      toast.loading('Preparing export...', { id: 'export' });
      
      const response = await fetch(`/api/products/export?format=${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ids: selectedProducts.length > 0 ? selectedProducts : undefined,
          search: searchQuery
        })
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Export completed successfully', { id: 'export' });
      
      if (selectedProducts.length > 0) {
        handleClearSelection();
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed', { id: 'export' });
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4EA674]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Polling Status Indicator */}
      <PollingStatus />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedProducts.length}
        onClearSelection={handleClearSelection}
        onBulkDelete={handleBulkDelete}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onExport={handleExport}
        isDeleting={deleteMutation.isPending}
      />

      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between shadow-sm lg:pl-72">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Products
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            className="p-2 md:hidden hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-12 pr-6 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm w-64 lg:w-96 focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            />
          </div>

          {showSearch && (
            <div className="absolute left-0 right-0 top-16 px-4 md:hidden z-50">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                  autoFocus
                />
              </div>
            </div>
          )}

          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative"
            aria-label="Toggle dark mode"
          >
            <Sun
              className={`h-5 w-5 text-yellow-500 transition-all duration-300 ${
                theme === 'dark' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
              }`}
            />
            <Moon
              className={`absolute inset-0 m-auto h-5 w-5 text-blue-400 transition-all duration-300 ${
                theme === 'dark' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
            />
          </button>

          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600 hidden sm:block">
            <img
              src={avatarUrl}
              alt="Admin"
              className="object-cover w-full h-full"
              onError={handleImageError}
            />
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 lg:pl-72">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Products</h2>
              {selectedProducts.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedProducts.length} selected
                </span>
              )}
            </div>
            <button
              onClick={() => router.push('/admin/product/add')}
              className="px-4 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#3D8B59] transition-colors w-full sm:w-auto justify-center"
            >
              <PlusSquare className="w-4 h-4" /> Add New Product
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[#4EA674]" />
              <span className="ml-2 text-gray-500 dark:text-gray-400">Loading products...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-red-500 bg-red-50 dark:bg-red-900/30 px-4 py-2 rounded-lg">
                Error loading products. Please try again.
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-[#EAF8E7] dark:bg-[#2A4A2F]">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-[#4EA674] focus:ring-[#4EA674]"
                        />
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[#4EA674] uppercase tracking-wider rounded-l-xl">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[#4EA674] uppercase tracking-wider">
                        Image
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[#4EA674] uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[#4EA674] uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[#4EA674] uppercase tracking-wider">
                        Stock
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[#4EA674] uppercase tracking-wider rounded-r-xl">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          {searchQuery ? 'No products match your search' : 'No products yet. Create your first product!'}
                        </td>
                      </tr>
                    ) : (
                      products.map((product: any) => (
                        <tr key={`product-${product.id}-${product.updated_at || Date.now()}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product.id)}
                              onChange={() => handleSelectProduct(product.id)}
                              className="rounded border-gray-300 text-[#4EA674] focus:ring-[#4EA674]"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            #{product.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {(() => {
                              const imageUrl = getProductImageUrl(product);
                              return imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={product.name}
                                  width={40}
                                  height={40}
                                  className="rounded-md object-cover h-10 w-10"
                                  unoptimized
                                />
                              ) : (
                                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                                  <span className="text-xs text-gray-500">No img</span>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            ₦{Number(
                              product.sale_price_inc_tax || 
                              product.sales_price_inc_tax || 
                              0
                            ).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {product.current_stock ?? 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => router.push(`/admin/product/edit/${product.id}`)}
                              className="text-[#4EA674] hover:text-[#3D8B59] mr-4 transition-colors"
                              aria-label="Edit product"
                            >
                              <Pencil className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                              disabled={deleteMutation.isPending && deleteMutation.variables === product.id}
                              aria-label="Delete product"
                            >
                              {deleteMutation.isPending && deleteMutation.variables === product.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Trash2 className="w-5 h-5" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {last_page > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, last_page))}
                      disabled={page === last_page}
                      className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Page <span className="font-medium">{current_page}</span> of{' '}
                        <span className="font-medium">{last_page}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => setPage((p) => Math.max(p - 1, 1))}
                          disabled={page === 1}
                          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600">
                          {current_page}
                        </span>
                        <button
                          onClick={() => setPage((p) => Math.min(p + 1, last_page))}
                          disabled={page === last_page}
                          className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}