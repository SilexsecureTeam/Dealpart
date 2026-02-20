// lib/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.bezalelsolar.com/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    // Try both token keys for compatibility
    const token = typeof window !== 'undefined' 
      ? (localStorage.getItem('adminToken') || localStorage.getItem('token'))
      : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - API might be slow or down');
    }
    if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
      console.error('Network error - Cannot reach API server');
    }
    
    // Handle 401 unauthorized - redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Organized API endpoints (for backward compatibility with old code)
export const api = {
  // Raw client methods
  get: <T = any>(url: string, config?: AxiosRequestConfig) => 
    apiClient.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
    apiClient.delete<T>(url, config),

  // Orders endpoints
  orders: {
    list: (params?: URLSearchParams) => 
      apiClient.get(`/admin/orders${params ? `?${params.toString()}` : ''}`),
    detail: (id: string | number) => 
      apiClient.get(`/admin/orders/${id}`),
    updateStatus: (id: string | number, status: string) => 
      apiClient.patch(`/admin/orders/status/${id}`, { order_status: status }),
  },

  // Products endpoints
  products: {
    list: (params?: URLSearchParams) => 
      apiClient.get(`/products${params ? `?${params.toString()}` : ''}`),
    detail: (id: string | number) => 
      apiClient.get(`/products/${id}`),
    create: (data: FormData) => 
      apiClient.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    update: (id: string | number, data: FormData) => {
      data.append('_method', 'PATCH');
      return apiClient.post(`/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    delete: (id: string | number) => 
      apiClient.delete(`/products/${id}`),
  },

  // Categories endpoints
  categories: {
    list: (params?: URLSearchParams) => 
      apiClient.get(`/categories${params ? `?${params.toString()}` : ''}`),
    detail: (id: string | number) => 
      apiClient.get(`/categories/${id}`),
    create: (data: FormData | { name: string }) => 
      apiClient.post('/categories', data, 
        data instanceof FormData 
          ? { headers: { 'Content-Type': 'multipart/form-data' } } 
          : {}
      ),
    update: (id: string | number, data: FormData) => {
      data.append('_method', 'PATCH');
      return apiClient.post(`/categories/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    delete: (id: string | number) => 
      apiClient.delete(`/categories/${id}`),
  },

  // Brands endpoints
  brands: {
    list: (params?: URLSearchParams) => 
      apiClient.get(`/brand${params ? `?${params.toString()}` : ''}`),
    detail: (id: string | number) => 
      apiClient.get(`/brand/${id}`),
    create: (data: FormData) => 
      apiClient.post('/brand', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    update: (id: string | number, data: FormData) => {
      data.append('_method', 'PATCH');
      return apiClient.post(`/brand/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    delete: (id: string | number) => 
      apiClient.delete(`/brand/${id}`),
  },

  // Coupons endpoints
  coupons: {
    list: (params?: URLSearchParams) => 
      apiClient.get(`/coupons${params ? `?${params.toString()}` : ''}`),
    detail: (id: string | number) => 
      apiClient.get(`/coupons/${id}`),
    create: (data: FormData) => 
      apiClient.post('/coupons', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    update: (id: string | number, data: FormData) => {
      data.append('_method', 'PATCH');
      return apiClient.post(`/coupons/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    delete: (id: string | number) => 
      apiClient.delete(`/coupons/${id}`),
    toggleStatus: (id: string | number, is_active: boolean) => 
      apiClient.patch(`/coupons/${id}`, { is_active }),
  },

  // Admin users endpoints
  admin: {
    users: {
      list: (params?: URLSearchParams) => 
        apiClient.get(`/admin/users${params ? `?${params.toString()}` : ''}`),
      detail: (id: string | number) => 
        apiClient.get(`/admin/users/${id}`),
      create: (data: any) => 
        apiClient.post('/admin/users', data),
      update: (id: string | number, data: any) => 
        apiClient.patch(`/admin/users/${id}`, data),
      delete: (id: string | number) => 
        apiClient.delete(`/admin/users/${id}`),
    },
  },

  // Transactions endpoints
  transactions: {
    list: (params?: URLSearchParams) => 
      apiClient.get(`/admin/transactions${params ? `?${params.toString()}` : ''}`),
    detail: (id: string | number) => 
      apiClient.get(`/admin/transactions/${id}`),
    stats: () => 
      apiClient.get('/admin/transactions/stats'),
  },

  // Profile endpoints
  profile: {
    get: () => apiClient.get('/profile'),
    update: (data: any) => apiClient.patch('/profile', data),
    uploadAvatar: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return apiClient.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    updatePassword: (data: any) => apiClient.post('/profile/password', data),
  },
};

// Default export for backward compatibility
export default api;