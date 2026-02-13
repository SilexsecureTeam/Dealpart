// lib/api-client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { ApiResponse } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.bezalelsolar.com/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Request interceptor – attach Bearer token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor – unwrap data, handle errors
    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError<ApiResponse<unknown>>) => {
        return Promise.reject(error.response?.data || error.message);
      }
    );
  }

  // Generic GET
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get(url, config);
  }

  // POST – automatically uses FormData if needed
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const isFormData = data instanceof FormData || this.containsFile(data);
    const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined;
    return this.client.post(url, data, { ...config, headers });
  }

  // PATCH – uses POST + _method field as your API requires
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const patchData = { ...data, _method: 'PATCH' };
    return this.post(url, patchData, config);
  }

  // DELETE
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(url, config);
  }

  // Helper to detect if an object contains a File or Blob
  private containsFile(obj: any): boolean {
    if (!obj) return false;
    if (obj instanceof File || obj instanceof Blob) return true;
    if (Array.isArray(obj)) return obj.some((item) => this.containsFile(item));
    if (typeof obj === 'object') {
      return Object.values(obj).some((value) => this.containsFile(value));
    }
    return false;
  }
}

export const api = new ApiClient();