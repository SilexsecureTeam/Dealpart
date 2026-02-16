'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { 
  useBrands, 
  useCreateBrand, 
  useUpdateBrand,
  useDeleteBrand,
  type Brand 
} from '@/hooks/useBrands';
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
  Globe,
} from 'lucide-react';

// ---------- Reusable Components ----------
interface BrandCardProps {
  brand: Brand;
  onClick: () => void;
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
}

const BrandCard = ({ brand, onClick, onEdit, onDelete }: BrandCardProps) => {
  const [showActions, setShowActions] = useState(false);

  // Get the correct logo URL
  const logoUrl = brand.logo_url || brand.logo || '/solarpanel.png';

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 w-full transition-all"
      >
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
          <Image
            src={logoUrl}
            alt={brand.name}
            width={80}
            height={80}
            className="object-cover w-full h-full"
            unoptimized
          />
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-white text-center line-clamp-2">
          {brand.name}
        </span>
        {brand.description && (
          <span className="text-xs text-gray-500 dark:text-gray-400 text-center line-clamp-2">
            {brand.description}
          </span>
        )}
        {brand.website && (
          <div className="flex items-center gap-1 text-xs text-blue-500">
            <Globe className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{brand.website}</span>
          </div>
        )}
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
                  onEdit(brand);
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(brand);
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

// ---------- Brand Modal Component ----------
interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Brand | null;
  title: string;
  isPending: boolean;
}

const BrandModal = ({ isOpen, onClose, onSubmit, initialData, title, isPending }: BrandModalProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [website, setWebsite] = useState(initialData?.website || '');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo_url || initialData?.logo || null);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setWebsite(initialData?.website || '');
      setLogoPreview(initialData?.logo_url || initialData?.logo || null);
      setLogo(null);
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Logo size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Brand name is required');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    
    if (description.trim()) {
      formData.append('description', description.trim());
    }
    
    if (website.trim()) {
      formData.append('website', website.trim());
    }
    
    if (logo) {
      formData.append('logo', logo);
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save brand');
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

        {/* Logo Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Brand Logo
          </label>
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 text-center cursor-pointer hover:border-[#4EA674] transition"
            onClick={() => document.getElementById('brand-logo')?.click()}
          >
            {logoPreview ? (
              <div className="relative w-full h-32 flex justify-center">
                <div className="relative w-32 h-32">
                  <Image
                    src={logoPreview}
                    alt="Preview"
                    fill
                    className="object-cover rounded-full"
                    unoptimized
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLogo(null);
                      setLogoPreview(initialData?.logo_url || initialData?.logo || null);
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
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
              id="brand-logo"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Brand Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Brand Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mercedes"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            disabled={isPending}
            autoFocus
          />
        </div>

        {/* Brand Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brand description..."
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 resize-none"
            disabled={isPending}
          />
        </div>

        {/* Website */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Website
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
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
  brandName: string;
  isPending: boolean;
}

const DeleteModal = ({ isOpen, onClose, onConfirm, brandName, isPending }: DeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Delete Brand</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete "{brandName}"? This action cannot be undone.
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
export default function BrandsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // React Query
  const {
    data: brands = [],
    isLoading: brandsLoading,
    error: brandsError,
    refetch: refetchBrands,
  } = useBrands();

  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();

  // UI State
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  // Toast Message
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter brands based on search
  const filteredBrands = brands.filter((brand) =>
    brand.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
  const handleCreateBrand = async (formData: FormData) => {
    try {
      const result = await createBrand.mutateAsync(formData);
      console.log('Create result:', result);
      setMessage({ type: 'success', text: result?.message || 'Brand created successfully' });
    } catch (error: any) {
      console.error('Create error:', error);
      setMessage({ type: 'error', text: error?.message || 'Failed to create brand' });
      throw error;
    }
  };

  const handleUpdateBrand = async (formData: FormData) => {
    if (!selectedBrand) return;
    try {
      const result = await updateBrand.mutateAsync({ 
        id: selectedBrand.id, 
        data: formData 
      });
      console.log('Update result:', result);
      setMessage({ type: 'success', text: result?.message || 'Brand updated successfully' });
    } catch (error: any) {
      console.error('Update error:', error);
      setMessage({ type: 'error', text: error?.message || 'Failed to update brand' });
      throw error;
    }
  };

  const handleDeleteBrand = async () => {
    if (!selectedBrand) return;
    try {
      const result = await deleteBrand.mutateAsync(selectedBrand.id);
      console.log('Delete result:', result);
      setMessage({ type: 'success', text: result?.message || 'Brand deleted successfully' });
      setShowDeleteModal(false);
      setSelectedBrand(null);
    } catch (error: any) {
      console.error('Delete error:', error);
      setMessage({ type: 'error', text: error?.message || 'Failed to delete brand' });
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between shadow-sm lg:pl-72">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Brands
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brands..."
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
        {brandsError && (
          <div className="mb-6 rounded-xl px-4 py-3 text-sm border bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
            Failed to load brands. Please refresh the page.
          </div>
        )}

        {/* Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Brands</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedBrand(null);
                setShowCreateModal(true);
              }}
              className="px-4 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#3D8B59] transition-colors"
            >
              <PlusSquare className="w-4 h-4" /> Add Brand
            </button>
          </div>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {/* Brand Cards */}
          {!brandsLoading &&
            filteredBrands.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                onClick={() => router.push(`/admin/brands/${brand.id}`)}
                onEdit={() => {
                  setSelectedBrand(brand);
                  setShowEditModal(true);
                }}
                onDelete={() => {
                  setSelectedBrand(brand);
                  setShowDeleteModal(true);
                }}
              />
            ))}
          
          {brandsLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse"
              >
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
            ))}
          
          {!brandsLoading && filteredBrands.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No brands match your search' : 'No brands yet. Create your first brand!'}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <BrandModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateBrand}
        title="Create Brand"
        isPending={createBrand.isPending}
      />

      <BrandModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedBrand(null);
        }}
        onSubmit={handleUpdateBrand}
        initialData={selectedBrand}
        title="Edit Brand"
        isPending={updateBrand.isPending}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedBrand(null);
        }}
        onConfirm={handleDeleteBrand}
        brandName={selectedBrand?.name || ''}
        isPending={deleteBrand.isPending}
      />
    </div>
  );
}