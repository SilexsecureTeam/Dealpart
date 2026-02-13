// hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

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

// ---------- Query ----------
export const useProfile = () => {
  return useQuery({
    queryKey: ['admin', 'profile'],
    queryFn: async () => {
      const response = await api.profile.get() as ProfileResponse;
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ---------- Mutations ----------
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => 
      api.profile.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'profile'] });
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => api.profile.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'profile'] });
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (payload: UpdatePasswordPayload) => 
      api.profile.updatePassword(payload),
  });
};