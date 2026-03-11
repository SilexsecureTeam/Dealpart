'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';
import { LoginResponse, VerifyOtpResponse, VerifyCodeResponse } from '../types/auth';
import { useRouter, usePathname } from 'next/navigation';

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
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Admin roles based on your User type
  const adminRoles = ['admin', 'accountant', 'manager'];

  // Detect if we're on admin side based on URL path
  useEffect(() => {
    const adminRoutes = ['/admin', '/dashboard', '/products', '/categories', '/orders', '/staff'];
    const isAdminRoute = adminRoutes.some(route => pathname?.startsWith(route));
    setIsAdmin(isAdminRoute);
  }, [pathname]);

  // Sync token across ALL storage keys (admin, user, customer)
  const syncToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('adminToken', newToken);
      localStorage.setItem('token', newToken);
      localStorage.setItem('customerToken', newToken); 
    } else {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      localStorage.removeItem('customerToken'); 
    }
    setToken(newToken);
  };

  // Sync user across ALL storage keys (admin, user, customer)
  const syncUser = (newUser: User | null) => {
    if (newUser) {
      localStorage.setItem('adminUser', JSON.stringify(newUser));
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('customerUser', JSON.stringify(newUser)); 
      
  
      setIsAdmin(adminRoles.includes(newUser.role));
    } else {
      localStorage.removeItem('adminUser');
      localStorage.removeItem('user');
      localStorage.removeItem('customerUser'); 
      setIsAdmin(false);
    }
    setUser(newUser);
  };

  
  useEffect(() => {
    // Check all possible token storage keys
    const storedToken = localStorage.getItem('adminToken') || 
                        localStorage.getItem('token') || 
                        localStorage.getItem('customerToken'); 
    
    // Check all possible user storage keys
    const storedUser = localStorage.getItem('adminUser') || 
                       localStorage.getItem('user') || 
                       localStorage.getItem('customerUser'); 
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        
        // Set isAdmin based on user role
        setIsAdmin(adminRoles.includes(parsedUser.role));
        
        // Ensure all storage locations have the data
        if (!localStorage.getItem('adminToken') && adminRoles.includes(parsedUser.role)) {
          localStorage.setItem('adminToken', storedToken);
          localStorage.setItem('adminUser', storedUser);
        }
        if (!localStorage.getItem('token')) {
          localStorage.setItem('token', storedToken);
          localStorage.setItem('user', storedUser);
        }
        if (!localStorage.getItem('customerToken') && parsedUser.role === 'user') {
          localStorage.setItem('customerToken', storedToken); // ✅ ADD THIS
          localStorage.setItem('customerUser', storedUser); // ✅ ADD THIS
        }
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        localStorage.removeItem('customerToken'); // ✅ ADD THIS
        localStorage.removeItem('adminUser');
        localStorage.removeItem('user');
        localStorage.removeItem('customerUser'); // ✅ ADD THIS
      }
    }
    setIsLoading(false);
  }, []);

  // Refresh user profile from API - NOW WORKS FOR BOTH ROLES
  const refreshUser = async () => {
    const currentToken = token || localStorage.getItem('adminToken') || 
                        localStorage.getItem('token') || 
                        localStorage.getItem('customerToken'); // ✅ ADD THIS
    if (!currentToken) return;
    
    try {
      let response;
      
      // Determine which endpoint to use based on role or URL
      const isAdminUser = (user && adminRoles.includes(user.role)) || isAdmin;
      
      if (isAdminUser) {
        // Admin endpoints from your Postman
        try {
          response = await api.get('/admin/profile');
        } catch (error: any) {
          if (error.response?.status === 404) {
            // Try alternative admin endpoint
            response = await api.get('/profile');
          } else {
            throw error;
          }
        }
      } else {
        // User endpoints from your Postman
        try {
          response = await api.get('/user');
        } catch (error: any) {
          if (error.response?.status === 404) {
            // Try alternative user endpoint
            response = await api.get('/profile');
          } else {
            throw error;
          }
        }
      }
      
      const profileData = response.data;
      
      // Handle different response structures
      if (profileData?.data) {
        syncUser(profileData.data);
      } else if (profileData?.user) {
        syncUser(profileData.user);
      } else if (profileData) {
        // If response is directly the user object
        syncUser(profileData);
      }
    } catch (error: any) {
      // If 404, the endpoint doesn't exist - just use stored user
      if (error.response?.status === 404) {
        console.log('Profile endpoint not available - using stored user data');
        return;
      }
      
      // If unauthorized, logout
      if (error.response?.status === 401) {
        console.error('Session expired');
        logout();
      } else {
        console.error('Failed to refresh user:', error);
      }
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
    // Use different endpoints based on isAdmin flag
    const endpoint = isAdmin ? '/admin/login' : '/login';
    const response = await api.post<LoginResponse>(endpoint, { email, password });
    
    const { token, user } = response.data;
    
    syncToken(token);
    syncUser(user);
    
    // Redirect based on role
    if (adminRoles.includes(user.role)) {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  const verifyOtp = async (userId: number, otp: string) => {
    // This is only for admin
    const response = await api.post<VerifyOtpResponse>('/admin/verify-otp', {
      user_id: userId,
      otp,
    });
    const { token, user } = response.data;
    
    syncToken(token);
    syncUser(user);
    router.push('/admin');
  };

  const verifyEmailCode = async (code: string) => {
    // This is for users
    const response = await api.post<VerifyCodeResponse>('/verify-code', { code });
    const { token, user } = response.data;
    
    syncToken(token);
    syncUser(user);
    router.push('/');
  };

  const logout = () => {
    syncToken(null);
    syncUser(null);
    
    // Also clear customer-specific keys just to be safe
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerUser');
    
    // Redirect based on where we are
    if (isAdmin) {
      router.push('/admin/login');
    } else {
      router.push('/login');
    }
  };

  // Set up periodic refresh based on role
  useEffect(() => {
    if (token && user) {
      // Try to refresh once on mount
      refreshUser();
      
      // Optional: refresh every 15 minutes
      const interval = setInterval(() => {
        refreshUser();
      }, 15 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [token, user?.role]); // Re-run when role changes

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
        isAdmin,
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