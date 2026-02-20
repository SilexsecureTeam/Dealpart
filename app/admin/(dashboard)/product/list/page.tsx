'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';

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

export default function AdminProductListPage() {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
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
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const products = data?.data || [];
  const { current_page, last_page } = data || {};

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4EA674]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Products</h2>
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
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          {searchQuery ? 'No products match your search' : 'No products yet. Create your first product!'}
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={`product-${product.id}-${product.updated_at || Date.now()}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            #{product.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product.images && product.images.length > 0 ? (
                              <Image
                                src={resolveImageUrl(product.images[0])}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="rounded-md object-cover h-10 w-10"
                                unoptimized
                              />
                            ) : (
                              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-md" />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            ₦{Number(product.sales_price_inc_tax || 0).toLocaleString()}
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

              {last_page && last_page > 1 && (
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