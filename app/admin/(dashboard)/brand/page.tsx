'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
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
  Loader2,
  X,
  Upload,
  MoreVertical,
  Pencil,
  Trash,
  Globe,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.bezalelsolar.com';

const resolveAvatar = (pathOrUrl: string | null | undefined): string => {
  if (!pathOrUrl) return '/man.png';
  const raw = String(pathOrUrl).trim();
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const filename = raw.split('/').pop() || raw;
  return `${API_BASE_URL}/storage/avatars/${filename}`;
};

const resolveBrandLogo = (pathOrUrl: string | null | undefined): string => {
  if (!pathOrUrl) return '/solarpanel.png';
  
  let raw = String(pathOrUrl).trim();
  
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    if (raw.includes('/storage/https://')) {
      const parts = raw.split('/storage/');
      raw = parts[parts.length - 1];
      if (!raw.startsWith('http')) {
        return `${API_BASE_URL}/storage/${raw}`;
      }
    }
    return raw;
  }
  
  const filename = raw.split('/').pop() || raw;
  return `${API_BASE_URL}/storage/brands/${filename}`;
};

type MessageType = {
  type: 'success' | 'error';
  text: string;
} | null;

export default function BrandsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const { data: brands = [], isLoading, error, refetch } = useBrands();
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [message, setMessage] = useState<MessageType>(null);

  const avatarUrl = (user && (user as any).avatar_url) || user?.avatar 
    ? resolveAvatar((user as any).avatar_url || user.avatar) 
    : '/man.png';

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src === '/man.png') return;
    img.src = '/man.png';
  };

  const filteredBrands = brands.filter((brand: Brand) =>
    brand.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => setMounted(true), []);

  const handleCreateBrand = async (formData: FormData) => {
    try {
      await createBrand.mutateAsync(formData);
      await refetch();
      setMessage({ type: 'success', text: 'Brand created successfully' });
      setShowCreateModal(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create brand' });
    }
  };

  const handleUpdateBrand = async (formData: FormData) => {
    if (!selectedBrand) return;
    try {
      await updateBrand.mutateAsync({ id: selectedBrand.id, data: formData });
      await refetch();
      setMessage({ type: 'success', text: 'Brand updated successfully' });
      setShowEditModal(false);
      setSelectedBrand(null);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update brand' });
    }
  };

  const handleDeleteBrand = async () => {
    if (!selectedBrand) return;
    try {
      await deleteBrand.mutateAsync(selectedBrand.id);
      await refetch();
      setMessage({ type: 'success', text: 'Brand deleted successfully' });
      setShowDeleteModal(false);
      setSelectedBrand(null);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete brand' });
    }
  };

  if (!mounted) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm lg:pl-72">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Brands</h1>

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
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm w-64 lg:w-96 focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            />
          </div>

          {showSearch && (
            <div className="absolute left-0 right-0 top-16 px-4 md:hidden z-50">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
            className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Sun className={`h-5 w-5 text-yellow-500 transition-all duration-300 ${
              theme === 'dark' ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
            }`} />
            <Moon className={`absolute inset-0 m-auto h-5 w-5 text-blue-400 transition-all duration-300 ${
              theme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'
            }`} />
          </button>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600">
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
          {message && (
            <div className={`mb-6 rounded-xl px-4 py-3 text-sm border flex justify-between items-center ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300'
                : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300'
            }`}>
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)} className="p-1"><X className="w-4 h-4" /></button>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl px-4 py-3 text-sm border bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
              Failed to load brands. Please refresh the page.
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Brands</h2>
            <button
              onClick={() => { setSelectedBrand(null); setShowCreateModal(true); }}
              className="px-4 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#3D8B59] transition-colors w-full sm:w-auto justify-center"
            >
              <PlusSquare className="w-4 h-4" /> Add Brand
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {!isLoading && filteredBrands.map((brand: Brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                onEdit={() => { setSelectedBrand(brand); setShowEditModal(true); }}
                onDelete={() => { setSelectedBrand(brand); setShowDeleteModal(true); }}
              />
            ))}
            
            {isLoading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            
            {!isLoading && filteredBrands.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No brands match your search' : 'No brands yet. Create your first brand!'}
              </div>
            )}
          </div>
        </div>
      </main>

      <BrandModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateBrand}
        title="Create Brand"
        isPending={createBrand.isPending}
      />

      <BrandModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedBrand(null); }}
        onSubmit={handleUpdateBrand}
        initialData={selectedBrand}
        title="Edit Brand"
        isPending={updateBrand.isPending}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedBrand(null); }}
        onConfirm={handleDeleteBrand}
        itemName={selectedBrand?.name || ''}
        isPending={deleteBrand.isPending}
      />
    </div>
  );
}

const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-[#4EA674]" />
  </div>
);

interface BrandCardProps {
  brand: Brand;
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
}

const BrandCard = ({ brand, onEdit, onDelete }: BrandCardProps) => {
  const [showActions, setShowActions] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(resolveBrandLogo(brand.logo_url || brand.logo));

  useEffect(() => {
    setImgSrc(resolveBrandLogo(brand.logo_url || brand.logo));
  }, [brand.logo_url, brand.logo]);

  return (
    <div className="relative group">
      <button className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 w-full">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <Image 
            src={imgSrc} 
            alt={brand.name} 
            width={80} 
            height={80} 
            className="object-cover" 
            unoptimized
            onError={() => setImgSrc('/solarpanel.png')}
          />
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-white text-center line-clamp-2">{brand.name}</span>
        {brand.description && (
          <span className="text-xs text-gray-500 dark:text-gray-400 text-center line-clamp-2">{brand.description}</span>
        )}
        {brand.website && (
          <div className="flex items-center gap-1 text-xs text-blue-500">
            <Globe className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{brand.website}</span>
          </div>
        )}
      </button>
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
        <button onClick={() => setShowActions(!showActions)} className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-100">
          <MoreVertical className="w-4 h-4" />
        </button>
        
        {showActions && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl border z-20">
              <button onClick={() => { onEdit(brand); setShowActions(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100">
                <Pencil className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => { onDelete(brand); setShowActions(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg">
                <Trash className="w-4 h-4" /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
  </div>
);

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
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setWebsite(initialData?.website || '');
      if (initialData?.logo_url || initialData?.logo) {
        setLogoPreview(resolveBrandLogo(initialData.logo_url || initialData.logo));
      } else {
        setLogoPreview(null);
      }
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
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
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
    if (description) formData.append('description', description);
    if (website) formData.append('website', website);
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
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Brand Logo</label>
          <div className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-[#4EA674]" onClick={() => document.getElementById('brand-logo')?.click()}>
            {logoPreview ? (
              <div className="relative w-32 h-32 mx-auto">
                <Image 
                  src={logoPreview} 
                  alt="Preview" 
                  fill 
                  className="object-cover rounded-full" 
                  unoptimized
                  onError={(e) => {
                    e.currentTarget.src = '/solarpanel.png';
                  }}
                />
                <button onClick={(e) => { e.stopPropagation(); setLogo(null); setLogoPreview(null); }} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="py-6">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to upload (PNG, JPG up to 5MB)</p>
              </div>
            )}
            <input id="brand-logo" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Brand name *"
            className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800"
            disabled={isPending}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={2}
            className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800"
            disabled={isPending}
          />
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="Website URL"
            className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800"
            disabled={isPending}
          />
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} disabled={isPending} className="px-5 py-2.5 rounded-xl border">Cancel</button>
          <button onClick={handleSubmit} disabled={isPending} className="px-6 py-2.5 rounded-xl bg-[#4EA674] text-white min-w-[100px] flex items-center justify-center">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (initialData ? 'Update' : 'Create')}
          </button>
        </div>
      </div>
    </div>
  );
};

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  itemName: string;
  isPending: boolean;
}

const DeleteModal = ({ isOpen, onClose, onConfirm, itemName, isPending }: DeleteModalProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
        <h3 className="text-lg font-bold mb-4">Delete Brand</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete "{itemName}"?</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={isPending} className="px-5 py-2.5 rounded-xl border">Cancel</button>
          <button onClick={onConfirm} disabled={isPending} className="px-6 py-2.5 rounded-xl bg-red-500 text-white">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};