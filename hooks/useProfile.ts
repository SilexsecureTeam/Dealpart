// hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';

// ---------- Types ----------
export interface ProfileData {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  avatar_url?: string | null;
  first_name: string | null;
  last_name: string | null;
  dob: string | null;
  location: string | null;
  bio: string | null;
  role?: string | null;
}

export interface ProfileResponse {
  message?: string;
  success?: boolean;
  status?: boolean;
  data: ProfileData;
}

export interface UpdateProfilePayload {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  dob?: string | null;
  location?: string | null;
  bio?: string | null;
}

export interface UpdatePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface UploadAvatarResponse {
  success?: boolean;
  avatar_url?: string;
  message?: string;
  data?: { avatar_url?: string; avatar?: string };
  user?: { avatar_url?: string; avatar?: string };
}

// Helper to convert null to undefined
const sanitizeProfileData = (data: ProfileData): Partial<User> => {
  return {
    id: data.id,
    name: data.name ?? undefined,
    email: data.email ?? undefined,
    phone: data.phone ?? undefined,
    avatar: data.avatar ?? undefined,
    avatar_url: data.avatar_url ?? undefined,
    first_name: data.first_name ?? undefined,
    last_name: data.last_name ?? undefined,
    dob: data.dob ?? undefined,
    location: data.location ?? undefined,
    bio: data.bio ?? undefined,
    role: data.role as any,
  } as Partial<User>;
};

// Helper to resolve avatar URL
const resolveAvatar = (pathOrUrl: string | null | undefined): string | null => {
  if (!pathOrUrl || String(pathOrUrl).trim() === '') return null;
  
  const raw = String(pathOrUrl).trim();
  
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  
  const base = (process.env.NEXT_PUBLIC_API_URL || 'https://admin.bezalelsolar.com/api').replace('/api', '');
  
  if (raw.startsWith('avatars/')) {
    return `${base}/storage/${raw}`;
  }
  
  if (!raw.includes('/')) {
    return `${base}/storage/avatars/${raw}`;
  }
  
  return `${base}/storage/${raw}`;
};

// ---------- Query ----------
export const useProfile = () => {
  const { updateUser } = useAuth();
  
  return useQuery({
    queryKey: ['admin', 'profile'],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/profile');
        const profileData = response.data as ProfileResponse;
        if (profileData?.data) {
          updateUser(sanitizeProfileData(profileData.data));
        }
        return profileData.data;
      } catch (error) {
        console.error('Failed to fetch admin profile, trying /profile:', error);
        
        try {
          const response = await api.get('/profile');
          const profileData = response.data as ProfileResponse;
          if (profileData?.data) {
            updateUser(sanitizeProfileData(profileData.data));
          }
          return profileData.data;
        } catch (fallbackError) {
          console.error('Failed to fetch profile from both endpoints:', fallbackError);
          throw fallbackError;
        }
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

// ---------- Mutations ----------
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();
  
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => 
      api.patch('/admin/profile', payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'profile'] });
      const data = response.data as ProfileResponse;
      if (data?.data) {
        updateUser(sanitizeProfileData(data.data));
      }
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await api.post('/admin/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'profile'] });
      
      const data = response as UploadAvatarResponse;
      
      const avatarUrl = 
        data?.avatar_url ||
        data?.data?.avatar_url ||
        data?.data?.avatar ||
        data?.user?.avatar_url ||
        data?.user?.avatar;
      
      if (avatarUrl) {
        updateUser({ 
          avatar: avatarUrl, 
          avatar_url: avatarUrl 
        });
      }
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (payload: UpdatePasswordPayload) => {
      const response = await api.post('/admin/profile/password', payload);
      return response.data;
    },
  });
};