'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
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
  MoreVertical,
  Pencil,
  Trash,
  Tag,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// ---------- Types ----------
interface Tag {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
  product_count?: number;
  created_at?: string;
}

// ---------- Helper to resolve avatar URL ----------
const resolveAvatar = (pathOrUrl: string | null | undefined): string => {
  if (!pathOrUrl) return '/man.png';
  const raw = String(pathOrUrl).trim();
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const filename = raw.split('/').pop() || raw;
  return `https://admin.bezalelsolar.com/storage/avatars/${filename}`;
};

// ---------- Tag Card Component ----------
interface TagCardProps {
  tag: Tag;
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
}

const TagCard = ({ tag, onEdit, onDelete }: TagCardProps) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="relative group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 p-5 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#EAF8E7] dark:bg-[#2A4A2F] flex items-center justify-center">
            <Tag className="w-6 h-6 text-[#4EA674]" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{tag.name}</h3>
            {tag.product_count !== undefined && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {tag.product_count} products
              </p>
            )}
          </div>
        </div>

        {/* Status Indicator */}
        {tag.is_active !== undefined && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            tag.is_active 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            {tag.is_active ? 'Active' : 'Inactive'}
          </span>
        )}
      </div>

      {tag.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
          {tag.description}
        </p>
      )}
      
      {/* Actions Menu */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  onEdit(tag);
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(tag);
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

// ---------- Tag Modal Component ----------
interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; is_active?: boolean }) => Promise<void>;
  initialData?: Tag | null;
  title: string;
  isPending: boolean;
}

const TagModal = ({ isOpen, onClose, onSubmit, initialData, title, isPending }: TagModalProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setIsActive(initialData?.is_active ?? true);
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Tag name is required');
      return;
    }

    try {
      await onSubmit({ 
        name: name.trim(), 
        description: description.trim() || undefined,
        is_active: isActive 
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save tag');
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

        {/* Tag Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tag Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. best-offer, new-arrival"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            disabled={isPending}
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-1">
            Slug will be auto-generated from name
          </p>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this tag for?"
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 resize-none"
            disabled={isPending}
          />
        </div>

        {/* Active Status */}
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-[#4EA674] rounded border-gray-300 focus:ring-[#4EA674]"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active (visible on website)
            </span>
          </label>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>}

        <div className="flex items-center justify-end gap-3">
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
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : initialData ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Delete Modal ----------
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tagName: string;
  isPending: boolean;
}

const DeleteModal = ({ isOpen, onClose, onConfirm, tagName, isPending }: DeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Delete Tag</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete "{tagName}"? This action cannot be undone.
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
export default function TagsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  // Fetch tags
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await api.get('/tags');
      const data = response.data;
      
      if (Array.isArray(data)) return data;
      if (data?.data && Array.isArray(data.data)) return data.data;
      if (data?.tags && Array.isArray(data.tags)) return data.tags;
      
      return [];
    },
  });

  // Create tag mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; is_active?: boolean }) => {
      const response = await api.post('/tags', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setMessage({ type: 'success', text: 'Tag created successfully' });
    },
    onError: (error: any) => {
      setMessage({ type: 'error', text: error?.message || 'Failed to create tag' });
    },
  });

  // Update tag mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; description?: string; is_active?: boolean } }) => {
      const response = await api.patch(`/tags/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setMessage({ type: 'success', text: 'Tag updated successfully' });
    },
    onError: (error: any) => {
      setMessage({ type: 'error', text: error?.message || 'Failed to update tag' });
    },
  });

  // Delete tag mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/tags/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setMessage({ type: 'success', text: 'Tag deleted successfully' });
      setShowDeleteModal(false);
      setSelectedTag(null);
    },
    onError: (error: any) => {
      setMessage({ type: 'error', text: error?.message || 'Failed to delete tag' });
    },
  });

  // Filter tags
  const filteredTags = tags.filter((tag: Tag) =>
    tag.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get avatar URL
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
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
          Tags
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tags..."
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
            <img src={avatarUrl} alt="Admin" className="object-cover w-full h-full" onError={handleImageError} />
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Tags</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create and manage tags for products (e.g., Best Offers, New Arrivals, Sale)
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedTag(null);
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#3D8B59] transition-colors self-start"
          >
            <PlusSquare className="w-4 h-4" /> Create Tag
          </button>
        </div>

        {/* Tags Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
            <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tags found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery ? 'No tags match your search' : 'Create your first tag to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-[#4EA674] text-white rounded-lg font-medium hover:bg-[#3D8B59] transition inline-flex items-center gap-2"
              >
                <PlusSquare className="w-5 h-5" /> Create Your First Tag
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTags.map((tag: Tag) => (
              <TagCard
                key={tag.id}
                tag={tag}
                onEdit={() => {
                  setSelectedTag(tag);
                  setShowEditModal(true);
                }}
                onDelete={() => {
                  setSelectedTag(tag);
                  setShowDeleteModal(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Suggested Tags */}
        {!searchQuery && filteredTags.length === 0 && (
          <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Suggested Tags for Your Store</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {['Best Offer', 'New Arrival', 'Sale', 'Featured', 'Limited Edition', 'Clearance', 'Pre-order', 'Staff Pick'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setSelectedTag(null);
                    setShowCreateModal(true);
                    
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-[#4EA674] hover:text-white transition text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <TagModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data);
        }}
        title="Create Tag"
        isPending={createMutation.isPending}
      />

      <TagModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTag(null);
        }}
        onSubmit={async (data) => {
          if (selectedTag) {
            await updateMutation.mutateAsync({ id: selectedTag.id, data });
          }
        }}
        initialData={selectedTag}
        title="Edit Tag"
        isPending={updateMutation.isPending}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTag(null);
        }}
        onConfirm={() => {
          if (selectedTag) {
            deleteMutation.mutateAsync(selectedTag.id);
          }
        }}
        tagName={selectedTag?.name || ''}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}