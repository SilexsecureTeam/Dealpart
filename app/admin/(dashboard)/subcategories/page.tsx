'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { 
  useSubcategories, 
  useCreateSubcategory, 
  useUpdateSubcategory,
  useDeleteSubcategory,
  type Subcategory 
} from '@/hooks/useSubcategories';
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
  ChevronRight,
} from 'lucide-react';

// Helper to resolve avatar URL (copy from your categories page)
const resolveAvatar = (pathOrUrl: string | null | undefined): string => {
  if (!pathOrUrl) return '/man.png';
  const raw = String(pathOrUrl).trim();
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const filename = raw.split('/').pop() || raw;
  return `https://admin.bezalelsolar.com/storage/avatars/${filename}`;
};

// Helper to resolve image URL
const resolveImageUrl = (pathOrUrl: string | null | undefined, fallback = '/solarpanel.png'): string => {
  if (!pathOrUrl || String(pathOrUrl).trim() === '') return fallback;
  const raw = String(pathOrUrl).trim();
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('data:')) return raw;
  const base = (process.env.NEXT_PUBLIC_API_URL || 'https://admin.bezalelsolar.com/api').replace('/api', '');
  if (raw.startsWith('storage/') || raw.startsWith('uploads/')) return `${base}/${raw}`;
  if (raw.startsWith('avatars/')) return `${base}/storage/${raw}`;
  return `${base}/storage/${raw}`;
};

// Subcategory Card Component
const SubcategoryCard = ({ subcategory, categories, onEdit, onDelete }: any) => {
  const [showActions, setShowActions] = useState(false);
  const imageUrl = resolveImageUrl(subcategory.image);
  const parentCategory = categories.find((c: any) => c.id === subcategory.category_id);

  return (
    <div className="relative group">
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 w-full transition-all">
        <Image
          src={imageUrl}
          alt={subcategory.name}
          width={48}
          height={48}
          className="rounded-lg object-cover flex-shrink-0"
          unoptimized
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
            {subcategory.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {parentCategory?.name || 'Uncategorized'}
          </p>
        </div>
      </div>
      
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
            <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20">
              <button
                onClick={() => {
                  onEdit(subcategory);
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(subcategory);
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

// Subcategory Modal
const SubcategoryModal = ({ isOpen, onClose, onSubmit, initialData, categories, title, isPending }: any) => {
  const [name, setName] = useState(initialData?.name || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setCategoryId(initialData?.category_id || '');
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
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Subcategory name is required');
      return;
    }
    if (!categoryId) {
      setError('Please select a parent category');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('category_id', categoryId);
    if (description.trim()) formData.append('description', description.trim());
    if (image) formData.append('image', image);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save subcategory');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subcategory Image
          </label>
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 text-center cursor-pointer hover:border-[#4EA674] transition"
            onClick={() => document.getElementById('subcategory-image')?.click()}
          >
            {imagePreview ? (
              <div className="relative w-full h-32">
                <Image
                  src={imagePreview.startsWith('data:') ? imagePreview : resolveImageUrl(imagePreview)}
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
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="py-6">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload image</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
              </div>
            )}
            <input id="subcategory-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>
        </div>

        {/* Parent Category */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Parent Category *
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
          >
            <option value="">Select a category</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Subcategory Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subcategory Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Lithium Batteries"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            autoFocus
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Subcategory description..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>}

        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl bg-[#4EA674] text-white hover:bg-[#3D8B59] disabled:opacity-50 flex items-center gap-2 min-w-[100px] justify-center"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : initialData ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Delete Modal (same as categories page)
const DeleteModal = ({ isOpen, onClose, onConfirm, itemName, isPending }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Delete Subcategory</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete "{itemName}"? This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-6 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 flex items-center gap-2">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SubcategoriesPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Hooks
  const { data: categories = [] } = useCategories();
  const {
    data: subcategories = [],
    isLoading,
    refetch,
  } = useSubcategories();

  const createSubcategory = useCreateSubcategory();
  const updateSubcategory = useUpdateSubcategory();
  const deleteSubcategory = useDeleteSubcategory();

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);

  // Filter subcategories
  const filteredSubcategories = subcategories.filter((s: Subcategory) =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Avatar URL
  const avatarUrl = user?.avatar_url || user?.avatar 
    ? resolveAvatar(user.avatar_url || user.avatar) 
    : '/man.png';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleCreate = async (formData: FormData) => {
    try {
      await createSubcategory.mutateAsync(formData);
      setMessage({ type: 'success', text: 'Subcategory created successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to create subcategory' });
      throw error;
    }
  };

  const handleUpdate = async (formData: FormData) => {
    if (!selectedSubcategory) return;
    try {
      await updateSubcategory.mutateAsync({ id: selectedSubcategory.id, data: formData });
      setMessage({ type: 'success', text: 'Subcategory updated successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to update subcategory' });
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!selectedSubcategory) return;
    try {
      await deleteSubcategory.mutateAsync(selectedSubcategory.id);
      setMessage({ type: 'success', text: 'Subcategory deleted successfully' });
      setShowDeleteModal(false);
      setSelectedSubcategory(null);
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to delete subcategory' });
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
      {/* Header (same as categories page) */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between shadow-sm lg:pl-72">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            ←
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Subcategories
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subcategories..."
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
          >
            <Sun className={`h-5 w-5 text-yellow-500 transition-all duration-300 ${
              theme === 'dark' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
            }`} />
            <Moon className={`absolute inset-0 m-auto h-5 w-5 text-blue-400 transition-all duration-300 ${
              theme === 'dark' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`} />
          </button>

          {/* Admin Avatar */}
          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600 hidden sm:block">
            <img src={avatarUrl} alt="Admin" className="object-cover w-full h-full" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-gray-50 dark:bg-gray-950 lg:pl-72">
        {/* Toast Message */}
        {message && (
          <div className={`mb-6 rounded-xl px-4 py-3 text-sm border flex justify-between items-center ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300'
              : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300'
          }`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header with Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Subcategories</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your product subcategories
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedSubcategory(null);
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#3D8B59] transition-colors self-start"
          >
            <PlusSquare className="w-4 h-4" /> Add Subcategory
          </button>
        </div>

        {/* Subcategories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
            ))
          ) : filteredSubcategories.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No subcategories match your search' : 'No subcategories yet. Create your first one!'}
            </div>
          ) : (
            filteredSubcategories.map((sub: Subcategory) => (
              <SubcategoryCard
                key={sub.id}
                subcategory={sub}
                categories={categories}
                onEdit={() => {
                  setSelectedSubcategory(sub);
                  setShowEditModal(true);
                }}
                onDelete={() => {
                  setSelectedSubcategory(sub);
                  setShowDeleteModal(true);
                }}
              />
            ))
          )}
        </div>
      </main>

      {/* Modals */}
      <SubcategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        categories={categories}
        title="Create Subcategory"
        isPending={createSubcategory.isPending}
      />

      <SubcategoryModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedSubcategory(null);
        }}
        onSubmit={handleUpdate}
        initialData={selectedSubcategory}
        categories={categories}
        title="Edit Subcategory"
        isPending={updateSubcategory.isPending}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedSubcategory(null);
        }}
        onConfirm={handleDelete}
        itemName={selectedSubcategory?.name || ''}
        isPending={deleteSubcategory.isPending}
      />
    </div>
  );
}