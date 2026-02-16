'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { 
  useCategories, 
  useCreateCategory, 
  useUpdateCategory,
  useDeleteCategory,
  type Category 
} from '@/hooks/useCategories';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { Product } from '@/types';
import {
  Search,
  Bell,
  Sun,
  Moon,
  PlusSquare,
  Edit2,
  Trash2,
  Loader2,
  X,
  Upload,
  MoreVertical,
  Pencil,
  Trash,
} from 'lucide-react';

// ---------- Reusable Components ----------
interface CategoryCardProps {
  category: Category;
  onClick: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoryCard = ({ category, onClick, onEdit, onDelete }: CategoryCardProps) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 w-full transition-all"
      >
        <Image
          src={category.image || '/solarpanel.png'}
          alt={category.name}
          width={48}
          height={48}
          className="rounded-lg object-cover flex-shrink-0"
          unoptimized
        />
        <span className="text-sm font-medium text-gray-900 dark:text-white text-left line-clamp-2 flex-1">
          {category.name}
        </span>
      </button>
      
      {/* Actions Menu */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        
        {showActions && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowActions(false)}
            />
            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20">
              <button
                onClick={() => {
                  onEdit(category);
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(category);
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
              >
                <Trash className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface ProductTableRowProps {
  product: Product;
  index: number;
  onEdit: (product: Product) => void;
  onDelete: (id: number, name: string) => void;
}

const ProductTableRow = ({ product, index, onEdit, onDelete }: ProductTableRowProps) => (
  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
    <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">{index}</td>
    <td className="px-4 py-4">
      <div className="flex items-center gap-3">
        <Image
          src={product.images?.[0] || '/solarpanel.png'}
          alt={product.name}
          width={40}
          height={40}
          className="rounded-lg object-cover"
          unoptimized
        />
        <span className="text-gray-900 dark:text-white line-clamp-1">{product.name}</span>
      </div>
    </td>
    <td className="px-4 py-4 text-gray-600 dark:text-gray-300 hidden sm:table-cell">
      {product.created_at ? new Date(product.created_at).toLocaleDateString('en-GB') : '—'}
    </td>
    <td className="px-4 py-4 text-gray-900 dark:text-white hidden md:table-cell">
      {product.current_stock ?? 0}
    </td>
    <td className="px-4 py-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onEdit(product)}
          className="text-gray-500 hover:text-[#4EA674] transition p-1"
          aria-label="Edit product"
        >
          <Edit2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(product.id, product.name)}
          className="text-gray-500 hover:text-red-500 transition p-1"
          aria-label="Delete product"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </td>
  </tr>
);

// ---------- Category Modal Component ----------
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Category | null;
  title: string;
  isPending: boolean;
}

const CategoryModal = ({ isOpen, onClose, onSubmit, initialData, title, isPending }: CategoryModalProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setImagePreview(initialData?.image || null);
      setImage(null);
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    
    if (description.trim()) {
      formData.append('description', description.trim());
    }
    
    if (image) {
      formData.append('image', image);
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save category');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category Image
          </label>
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 text-center cursor-pointer hover:border-[#4EA674] transition"
            onClick={() => document.getElementById('category-image')?.click()}
          >
            {imagePreview ? (
              <div className="relative w-full h-32">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover rounded-lg"
                  unoptimized
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImage(null);
                    setImagePreview(initialData?.image || null);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="py-6">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
              </div>
            )}
            <input
              id="category-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Category Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Inverters"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            disabled={isPending}
            autoFocus
          />
        </div>

        {/* Category Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Category description..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 resize-none"
            disabled={isPending}
          />
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl bg-[#4EA674] text-white hover:bg-[#3D8B59] disabled:opacity-50 flex items-center gap-2 min-w-[100px] justify-center"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              initialData ? 'Update' : 'Create'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Delete Confirmation Modal ----------
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  categoryName: string;
  isPending: boolean;
}

const DeleteModal = ({ isOpen, onClose, onConfirm, categoryName, isPending }: DeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Delete Category</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete "{categoryName}"? This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Main Page ----------
export default function CategoriesPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // React Query
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useProducts(1, 999);

  const deleteProduct = useDeleteProduct();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Toast Message
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Derived Data
  const allProducts = productsData?.data || [];
  const filteredProducts = allProducts.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // Auto-dismiss Toast
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handlers
  const handleCreateCategory = async (formData: FormData) => {
    try {
      await createCategory.mutateAsync(formData);
      setMessage({ type: 'success', text: 'Category created successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to create category' });
      throw error;
    }
  };

  const handleUpdateCategory = async (formData: FormData) => {
    if (!selectedCategory) return;
    try {
      await updateCategory.mutateAsync({ 
        id: selectedCategory.id, 
        data: formData 
      });
      setMessage({ type: 'success', text: 'Category updated successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to update category' });
      throw error;
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    try {
      await deleteCategory.mutateAsync(selectedCategory.id);
      setMessage({ type: 'success', text: 'Category deleted successfully' });
      setShowDeleteModal(false);
      setSelectedCategory(null);
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to delete category' });
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteProduct.mutateAsync(id);
      setMessage({ type: 'success', text: 'Product deleted successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete product' });
    }
  };

  // Loading States
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4EA674]" />
      </div>
    );
  }

  const isLoading = categoriesLoading || productsLoading;
  const hasError = categoriesError || productsError;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between shadow-sm lg:pl-72">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Categories
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop Search */}
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

          {/* Notification Bell */}
          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Theme Toggle */}
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

          {/* Admin Avatar */}
          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600 hidden sm:block">
            <Image
              src="/man.png"
              alt="Admin"
              width={36}
              height={36}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-gray-50 dark:bg-gray-950 lg:pl-72">
        {/* Toast Message */}
        {message && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm border flex justify-between items-center ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300'
                : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300'
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {hasError && (
          <div className="mb-6 rounded-xl px-4 py-3 text-sm border bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
            Failed to load data. Please refresh the page.
          </div>
        )}

        {/* Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Discover</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/product/add')}
              className="px-4 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#3D8B59] transition-colors"
            >
              <PlusSquare className="w-4 h-4" /> Add Product
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mb-10 sm:mb-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {/* Create Category Card */}
            <button
              onClick={() => {
                setSelectedCategory(null);
                setShowCreateModal(true);
              }}
              disabled={createCategory.isPending}
              className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border-2 border-dashed border-[#4EA674] transition-all disabled:opacity-50"
            >
              <div className="w-16 h-16 rounded-lg bg-[#EAF8E7] dark:bg-[#2A4A2F] flex items-center justify-center">
                {createCategory.isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[#4EA674]" />
                ) : (
                  <PlusSquare className="w-6 h-6 text-[#4EA674]" />
                )}
              </div>
              <span className="text-sm font-semibold text-[#4EA674] text-center">
                Create Category
              </span>
            </button>

            {/* Category Cards */}
            {!categoriesLoading &&
              categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  onClick={() => router.push(`/admin/categories/${cat.id}`)}
                  onEdit={() => {
                    setSelectedCategory(cat);
                    setShowEditModal(true);
                  }}
                  onDelete={() => {
                    setSelectedCategory(cat);
                    setShowDeleteModal(true);
                  }}
                />
              ))}
            {categoriesLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse"
                >
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                </div>
              ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your product"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-[#EAF8E7] dark:bg-[#2A4A2F]">
                <tr className="text-left text-[#4EA674] font-medium">
                  <th className="px-4 py-4 rounded-l-xl">No.</th>
                  <th className="px-4 py-4">Product</th>
                  <th className="px-4 py-4 hidden sm:table-cell">Created Date</th>
                  <th className="px-4 py-4 hidden md:table-cell">Stock</th>
                  <th className="px-4 py-4 rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-600 dark:text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#4EA674]" />
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-600 dark:text-gray-400">
                      {searchQuery ? 'No products match your search' : 'No products yet.'}
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product, i) => (
                    <ProductTableRow
                      key={product.id}
                      product={product}
                      index={(page - 1) * itemsPerPage + i + 1}
                      onEdit={() => router.push(`/admin/product/edit/${product.id}`)}
                      onDelete={handleDeleteProduct}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 sm:mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
              >
                ← Previous
              </button>

              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium min-w-[36px] ${
                        page === pageNum
                          ? 'bg-[#C1E6BA] text-[#4EA674]'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <CategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCategory}
        title="Create Category"
        isPending={createCategory.isPending}
      />

      <CategoryModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleUpdateCategory}
        initialData={selectedCategory}
        title="Edit Category"
        isPending={updateCategory.isPending}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleDeleteCategory}
        categoryName={selectedCategory?.name || ''}
        isPending={deleteCategory.isPending}
      />
    </div>
  );
}