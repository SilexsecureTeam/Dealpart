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
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Shield,
  Users,
  Key,
  CheckCircle,
  XCircle,
  MoreVertical,
  Save,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// ---------- Types ----------
interface Role {
  id: number;
  name: string;
  description?: string;
  permissions_count?: number;
  users_count?: number;
  created_at?: string;
}

interface Permission {
  id: number;
  name: string;
  group: string;
  description?: string;
}

interface RoleWithPermissions extends Role {
  permissions: number[];
}

// ---------- Helper to resolve avatar URL ----------
const resolveAvatar = (pathOrUrl: string | null | undefined): string => {
  if (!pathOrUrl) return '/man.png';
  const raw = String(pathOrUrl).trim();
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const filename = raw.split('/').pop() || raw;
  return `https://admin.bezalelsolar.com/storage/avatars/${filename}`;
};

// ---------- Role Card Component ----------
interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onManagePermissions: (role: Role) => void;
}

const RoleCard = ({ role, onEdit, onDelete, onManagePermissions }: RoleCardProps) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="relative group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 p-5 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#EAF8E7] dark:bg-[#2A4A2F] flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#4EA674]" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{role.name}</h3>
            {role.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{role.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4 inline mr-1" />
            {role.users_count || 0} users
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            <Key className="w-4 h-4 inline mr-1" />
            {role.permissions_count || 0} permissions
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onManagePermissions(role)}
          className="flex-1 px-3 py-1.5 text-sm bg-[#4EA674] text-white rounded-lg hover:bg-[#3D8B59] transition"
        >
          Manage Permissions
        </button>
      </div>
      
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
            <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20">
              <button
                onClick={() => {
                  onEdit(role);
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
              >
                <Edit className="w-4 h-4" />
                Edit Role
              </button>
              <button
                onClick={() => {
                  onDelete(role);
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ---------- Role Modal Component ----------
interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string }) => Promise<void>;
  initialData?: Role | null;
  title: string;
  isPending: boolean;
}

const RoleModal = ({ isOpen, onClose, onSubmit, initialData, title, isPending }: RoleModalProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Role name is required');
      return;
    }

    try {
      await onSubmit({ 
        name: name.trim(), 
        description: description.trim() || undefined 
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save role');
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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Role Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Admin, Manager, Accountant"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            disabled={isPending}
            autoFocus
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What can this role do?"
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 resize-none"
            disabled={isPending}
          />
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

// ---------- Permissions Manager Component ----------
interface PermissionsManagerProps {
  role: Role | null;
  onClose: () => void;
}

const PermissionsManager = ({ role, onClose }: PermissionsManagerProps) => {
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});

  // Fetch permissions
  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await api.get('/permissions');
      const data = response.data;
      
      let perms = [];
      if (Array.isArray(data)) perms = data;
      else if (data?.data && Array.isArray(data.data)) perms = data.data;
      else perms = [];
      
      // Group by permission group
      const grouped: Record<string, Permission[]> = {};
      perms.forEach((p: Permission) => {
        const group = p.group || 'Other';
        if (!grouped[group]) grouped[group] = [];
        grouped[group].push(p);
      });
      
      setGroupedPermissions(grouped);
      return perms;
    },
  });

  // Fetch role permissions
  const { data: rolePermissions, isLoading: rolePermsLoading } = useQuery({
    queryKey: ['role-permissions', role?.id],
    queryFn: async () => {
      if (!role?.id) return [];
      const response = await api.get(`/roles/${role.id}/permissions`);
      const data = response.data;
      
      let perms = [];
      if (Array.isArray(data)) perms = data;
      else if (data?.permissions && Array.isArray(data.permissions)) perms = data.permissions;
      
      setSelectedPermissions(perms.map((p: any) => p.id || p));
      return perms;
    },
    enabled: !!role?.id,
  });

  // Update permissions mutation
  const updatePermissions = useMutation({
    mutationFn: async () => {
      if (!role?.id) return;
      const response = await api.post(`/roles/${role.id}/permissions`, {
        permissions: selectedPermissions,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(`Permissions updated for ${role?.name}`);
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update permissions');
    },
  });

  const togglePermission = (permId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(id => id !== permId)
        : [...prev, permId]
    );
  };

  const selectAllInGroup = (groupPerms: Permission[]) => {
    const groupIds = groupPerms.map(p => p.id);
    const allSelected = groupIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !groupIds.includes(id)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...groupIds])]);
    }
  };

  if (!role) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white dark:bg-gray-900 pt-2 pb-4 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Permissions for {role.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Select what this role can access
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {isLoading || rolePermsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#4EA674]" />
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([group, perms]) => (
              <div key={group} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900 dark:text-white">{group}</h4>
                  <button
                    onClick={() => selectAllInGroup(perms)}
                    className="text-sm text-[#4EA674] hover:underline"
                  >
                    {perms.every(p => selectedPermissions.includes(p.id)) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {perms.map((perm) => (
                    <label
                      key={perm.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                        selectedPermissions.includes(perm.id)
                          ? 'bg-[#EAF8E7] border-[#4EA674] dark:bg-[#2A4A2F]'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="w-4 h-4 text-[#4EA674] rounded border-gray-300 focus:ring-[#4EA674]"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {perm.name}
                        </p>
                        {perm.description && (
                          <p className="text-xs text-gray-500">{perm.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-8 sticky bottom-0 bg-white dark:bg-gray-900 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => updatePermissions.mutate()}
            disabled={updatePermissions.isPending}
            className="px-6 py-2.5 bg-[#4EA674] text-white rounded-xl hover:bg-[#3D8B59] disabled:opacity-50 flex items-center gap-2"
          >
            {updatePermissions.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Permissions
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
  roleName: string;
  isPending: boolean;
}

const DeleteModal = ({ isOpen, onClose, onConfirm, roleName, isPending }: DeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Delete Role</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete "{roleName}"? This action cannot be undone.
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
export default function ControlAuthorityPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPermissionsManager, setShowPermissionsManager] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Fetch roles
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await api.get('/roles');
      const data = response.data;
      
      if (Array.isArray(data)) return data;
      if (data?.data && Array.isArray(data.data)) return data.data;
      if (data?.roles && Array.isArray(data.roles)) return data.roles;
      
      return [];
    },
  });

  // Create role mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await api.post('/roles', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create role');
    },
  });

  // Update role mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; description?: string } }) => {
      const response = await api.patch(`/roles/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update role');
    },
  });

  // Delete role mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/roles/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully');
      setShowDeleteModal(false);
      setSelectedRole(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete role');
    },
  });

  // Filter roles
  const filteredRoles = roles.filter((role: Role) =>
    role.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Avatar URL
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
          Control Authority
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
              placeholder="Search roles..."
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
                  placeholder="Search roles..."
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
            <img src={avatarUrl} alt="Admin" className="object-cover w-full h-full" onError={handleImageError} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-gray-50 dark:bg-gray-950 lg:pl-72">
        {/* Header with Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage user roles and what they can access
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedRole(null);
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#3D8B59] transition-colors self-start"
          >
            <Plus className="w-4 h-4" /> Create Role
          </button>
        </div>

        {/* Roles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No roles found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery ? 'No roles match your search' : 'Create your first role to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-[#4EA674] text-white rounded-lg font-medium hover:bg-[#3D8B59] transition inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Create Your First Role
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map((role: Role) => (
              <RoleCard
                key={role.id}
                role={role}
                onEdit={() => {
                  setSelectedRole(role);
                  setShowEditModal(true);
                }}
                onDelete={() => {
                  setSelectedRole(role);
                  setShowDeleteModal(true);
                }}
                onManagePermissions={() => {
                  setSelectedRole(role);
                  setShowPermissionsManager(true);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <RoleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data);
        }}
        title="Create Role"
        isPending={createMutation.isPending}
      />

      <RoleModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRole(null);
        }}
        onSubmit={async (data) => {
          if (selectedRole) {
            await updateMutation.mutateAsync({ id: selectedRole.id, data });
          }
        }}
        initialData={selectedRole}
        title="Edit Role"
        isPending={updateMutation.isPending}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedRole(null);
        }}
        onConfirm={() => {
          if (selectedRole) {
            deleteMutation.mutateAsync(selectedRole.id);
          }
        }}
        roleName={selectedRole?.name || ''}
        isPending={deleteMutation.isPending}
      />

      <PermissionsManager
        role={selectedRole}
        onClose={() => {
          setShowPermissionsManager(false);
          setSelectedRole(null);
        }}
      />
    </div>
  );
}