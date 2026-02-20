'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api'; // Changed from api-client to api
import { User } from '@/types';
import { LoginResponse, VerifyOtpResponse, VerifyCodeResponse } from '../types/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, isAdmin?: boolean) => Promise<void>;
  verifyOtp: (userId: number, otp: string) => Promise<void>;
  verifyEmailCode: (code: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Sync token across both storage keys
  const syncToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('adminToken', newToken);
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
    }
    setToken(newToken);
  };

  // Sync user across both storage keys
  const syncUser = (newUser: User | null) => {
    if (newUser) {
      localStorage.setItem('adminUser', JSON.stringify(newUser));
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('adminUser');
      localStorage.removeItem('user');
    }
    setUser(newUser);
  };

  // Load token and user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const storedUser = localStorage.getItem('adminUser') || localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        if (!localStorage.getItem('adminToken')) {
          localStorage.setItem('adminToken', storedToken);
        }
        if (!localStorage.getItem('adminUser')) {
          localStorage.setItem('adminUser', storedUser);
        }
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Refresh user profile from API
  const refreshUser = async () => {
    try {
      const response = await api.get('/profile');
      const profileData = response.data;
      if (profileData?.data) {
        syncUser(profileData.data);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  // Update user with partial data
  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser };
      syncUser(newUser);
    }
  };

  const login = async (email: string, password: string, isAdmin = false) => {
    const endpoint = isAdmin ? '/admin/login' : '/login';
    const response = await api.post<LoginResponse>(endpoint, { email, password });
    
    const { token, user } = response.data;
    
    syncToken(token);
    syncUser(user);
  };

  const verifyOtp = async (userId: number, otp: string) => {
    const response = await api.post<VerifyOtpResponse>('/admin/verify-otp', {
      user_id: userId,
      otp,
    });
    const { token, user } = response.data;
    
    syncToken(token);
    syncUser(user);
  };

  const verifyEmailCode = async (code: string) => {
    const response = await api.post<VerifyCodeResponse>('/verify-code', { code });
    const { token, user } = response.data;
    
    syncToken(token);
    syncUser(user);
  };

  const logout = () => {
    syncToken(null);
    syncUser(null);
    router.push('/admin/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        verifyOtp,
        verifyEmailCode,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};