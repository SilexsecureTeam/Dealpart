import { Endpoints } from './endpoints';
import { CheckoutPayload, CheckoutResponse, VerifyPaymentResponse } from '@/types';

// ---------- Customer Auth Helpers ----------
const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('customerToken') : null);
const setToken = (token: string) => {
  if (typeof window !== 'undefined') localStorage.setItem('customerToken', token);
};
const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerUser');
  }
};

const authFetch = (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: HeadersInit = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  return fetch(url, { ...options, headers });
};

interface RegisterData {
  name: string;
  username?: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

interface ProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: File;
}

export const customerApi = {
  auth: {
    login: async (login: string, password: string) => {
      const form = new FormData();
      form.append('login', login);
      form.append('password', password);

      const res = await fetch(Endpoints.customer.login, {
        method: 'POST',
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || json?.error || 'Login failed');

      const token = json.token || json.data?.token || json.access_token;
      if (!token) throw new Error('No token received');
      setToken(token);

      if (json.user || json.data?.user) {
        localStorage.setItem('customerUser', JSON.stringify(json.user || json.data.user));
      }
      return json;
    },

    register: async (data: RegisterData) => {
      const form = new FormData();
      form.append('name', data.name);
      if (data.username) form.append('username', data.username);
      form.append('email', data.email);
      form.append('phone', data.phone);
      form.append('password', data.password);
      form.append('password_confirmation', data.password_confirmation);

      const res = await fetch(Endpoints.customer.register, {
        method: 'POST',
        body: form,
      });
      const json = await res.json();

      if (!res.ok) {
        let errorMessage = json?.message || 'Registration failed';
        if (json?.errors && typeof json.errors === 'object') {
          const values = Object.values(json.errors);
          if (values.length > 0 && Array.isArray(values[0])) {
            errorMessage = values[0][0] || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }
      return json;
    },

    verifyCode: async (code: string, userId?: string) => {
      const form = new FormData();
      form.append('code', code);
      if (userId) form.append('user_id', userId);

      const url = userId
        ? `${Endpoints.customer.verifyCode}?user_id=${encodeURIComponent(userId)}`
        : Endpoints.customer.verifyCode;

      const res = await fetch(url, {
        method: 'POST',
        body: form,
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json?.message || json?.error || 'Verification failed');

      const token = json.token || json.data?.token || json.access_token;
      if (token) setToken(token);
      return json;
    },

    logout: () => {
      removeToken();
    },
  },

  brands: {
    list: () => {
      const url = 'https://admin.bezalelsolar.com/api/brand';
      console.log('Fetching customer brands from:', url);
      return fetch(url, {
        headers: {
          'Accept': 'application/json',
        }
      }).then(res => {
        console.log('Response status:', res.status);
        return res.json();
      });
    },
  },

  profile: {
    get: () => authFetch(Endpoints.customer.profile).then((res) => res.json()),

    update: (data: ProfileUpdateData) => {
      if (data.avatar) {
        const form = new FormData();
        if (data.name) form.append('name', data.name);
        if (data.email) form.append('email', data.email);
        if (data.phone) form.append('phone', data.phone);
        form.append('avatar', data.avatar);
        form.append('_method', 'PATCH');
        return authFetch(Endpoints.customer.updateProfile, {
          method: 'POST',
          body: form,
        }).then((res) => res.json());
      } else {
        return authFetch(Endpoints.customer.updateProfile, {
          method: 'PATCH',
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            phone: data.phone,
          }),
        }).then((res) => res.json());
      }
    },
  },

  products: {
    list: (params?: URLSearchParams) =>
      fetch(`${Endpoints.customer.products}${params ? `?${params}` : ''}`, {
        headers: { Accept: 'application/json' },
      }).then((res) => res.json()),

    detail: (id: number) =>
      fetch(Endpoints.customer.productDetail(id), {
        headers: { Accept: 'application/json' },
      }).then((res) => res.json()),
  },

  cart: {
    get: () => authFetch(Endpoints.customer.cart).then((res) => res.json()),
    
    add: async (product_id: number, quantity: number, price: number) => {
      const token = getToken();
      if (!token) throw new Error('LOGIN_REQUIRED');
      
      try {
        const res = await authFetch(Endpoints.customer.cartAdd, {
          method: 'POST',
          body: JSON.stringify({ product_id, quantity, price }),
        });
        
        if (!res.ok) {
          if (res.status === 500) {
            throw new Error('SERVER_ERROR');
          }
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData?.message || `Failed to add to cart (${res.status})`);
        }
        
        const json = await res.json();
        return json;
      } catch (error) {
        console.error('Cart add error:', error);
        throw error; 
      }
    },
    
    update: (id: number, quantity: number) =>
      authFetch(Endpoints.customer.cartUpdate(id), {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      }).then((res) => res.json()),
    
    remove: (id: number) =>
      authFetch(Endpoints.customer.cartRemove(id), {
        method: 'DELETE',
      }).then((res) => res.json()),
  },

  checkout: {
    create: (data: CheckoutPayload): Promise<CheckoutResponse> =>
      authFetch(Endpoints.customer.checkout, {
        method: 'POST',
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    
    verify: (reference: string): Promise<VerifyPaymentResponse> =>
      authFetch(`${Endpoints.customer.verifyPayment}/${reference}`, {
        method: 'GET',
      }).then((res) => res.json()),
  },

  coupons: {
    apply: (code: string) =>
      authFetch(`${Endpoints.customer.coupons}/apply`, {
        method: 'POST',
        body: JSON.stringify({ code }),
      }).then((res) => res.json()),
  },

 // In customerApiClient.ts - wishlist section
wishlist: {
  list: async (params?: URLSearchParams) => {
    try {
      const url = params
        ? `${Endpoints.customer.wishlist}?${params}`
        : Endpoints.customer.wishlist;
      console.log('Fetching wishlist from:', url);
      const res = await authFetch(url);
      
      if (!res.ok) {
        console.error('Wishlist fetch failed:', res.status);
        const errorText = await res.text();
        console.error('Error response:', errorText);
        return { data: [] };
      }
      
      const data = await res.json();
      console.log('Wishlist fetch response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return { data: [] };
    }
  },
  
  add: async (productId: number) => {
    try {
      console.log('Adding product to wishlist:', productId);
      const res = await authFetch(Endpoints.customer.wishlist, {
        method: 'POST',
        body: JSON.stringify({ product_id: productId }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Add to wishlist error response:', errorText);
        try {
          const error = JSON.parse(errorText);
          throw new Error(error?.message || 'Failed to add to wishlist');
        } catch {
          throw new Error('Failed to add to wishlist');
        }
      }
      
      const data = await res.json();
      console.log('Add to wishlist response:', data);
      return data;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },
  
  remove: async (id: number) => {
    try {
      console.log('API: Removing wishlist item with ID:', id);
      console.log('API: Endpoint:', Endpoints.customer.wishlistItem(id));
      
      const res = await authFetch(Endpoints.customer.wishlistItem(id), {
        method: 'DELETE',
      });
      
      console.log('API: Remove response status:', res.status);
      
      // Try to get response body for debugging
      const responseText = await res.text();
      console.log('API: Remove response body:', responseText);
      
      if (res.status === 404) {
        console.error('Wishlist item not found with ID:', id);
        console.error('Error response:', responseText);
        
        // Try to parse the error message
        let errorMessage = 'Wishlist item not found';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData?.message || errorMessage;
        } catch {
          // Use default message
        }
        
        throw new Error(errorMessage);
      }
      
      if (!res.ok) {
        throw new Error(`Failed to remove from wishlist (${res.status})`);
      }
      
      // If successful, try to parse response or return success
      if (res.status === 204) {
        return { success: true, id };
      }
      
      try {
        const data = JSON.parse(responseText);
        return data;
      } catch {
        return { success: true, id };
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },
},
} as const;