import { Endpoints } from './endpoints';
import { CheckoutPayload, CheckoutResponse, VerifyPaymentResponse, CustomerOrder } from '@/types';

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
  
  const cartSession = typeof window !== 'undefined' ? localStorage.getItem('cartSessionId') : null;
  if (cartSession) {
    headers['X-Cart-Session'] = cartSession;
  }
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
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
      
      const cartSession = localStorage.getItem('cartSessionId');
      if (cartSession) {
        try {
          await fetch(Endpoints.customer.cartMerge, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Cart-Session': cartSession,
              'Accept': 'application/json',
            },
          });
          localStorage.removeItem('cartSessionId');
        } catch (error) {
          console.error('Failed to merge cart:', error);
        }
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
      return fetch(url, {
        headers: { 'Accept': 'application/json' }
      }).then(res => res.json());
    },
  },

  locations: {
    getStates: async () => {
      const token = getToken();
      const res = await fetch('https://admin.bezalelsolar.com/api/state', {
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      return res.json();
    },
    
    getLocations: async () => {
      const token = getToken();
      const res = await fetch('https://admin.bezalelsolar.com/api/locations', {
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      return res.json();
    },
  },

  delivery: {
    calculateFee: async (state_name: string, lga_name: string) => {
      const token = getToken();
      const formData = new FormData();
      formData.append('state_name', state_name);
      formData.append('lga_name', lga_name);
      
      const res = await fetch('https://admin.bezalelsolar.com/api/delivery-fee', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error('Failed to calculate delivery fee');
      }
      
      return res.json();
    },
  },

  taxes: {
    getActive: async () => {
      const token = getToken();
      const res = await fetch('https://admin.bezalelsolar.com/api/taxes', {
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch taxes');
      }
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        return data.find(tax => tax.is_active === 1 || tax.is_active === true);
      }
      
      return data;
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
    get: async () => {
      try {
        const res = await authFetch(Endpoints.customer.cart);
        if (!res.ok) return { data: [] };
        return await res.json();
      } catch {
        return { data: [] };
      }
    },
    
    add: async (product_id: number, quantity: number, price: number, color: string) => {
      try {
        const token = getToken();
        
        const requestBody = { 
          product_id: product_id.toString(),
          quantity: quantity.toString(),
          price: price.toString(),
          color: color 
        };
        
        if (!token) {
          let cartSession = localStorage.getItem('cartSessionId');
          if (!cartSession) {
            cartSession = crypto.randomUUID?.() || `guest_${Date.now()}`;
            localStorage.setItem('cartSessionId', cartSession);
          }
          
          const res = await fetch(Endpoints.customer.cartAdd, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-Cart-Session': cartSession,
            },
            body: JSON.stringify(requestBody),
          });
          
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData?.message || `Failed to add to cart (${res.status})`);
          }
          
          return await res.json();
        }
        
        const res = await authFetch(Endpoints.customer.cartAdd, {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });
        
        if (!res.ok) {
          if (res.status === 422) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData?.message || 'Validation failed');
          }
          throw new Error(`Failed to add to cart (${res.status})`);
        }
        
        return await res.json();
      } catch (error) {
        console.error('Cart add error:', error);
        throw error; 
      }
    },

    update: async (itemId: number, quantity: number) => {
      try {
        const res = await authFetch(Endpoints.customer.cartUpdate(itemId), {
          method: 'PATCH',
          body: JSON.stringify({ quantity: quantity.toString() }),
        });
        
        if (res.status === 404) {
          console.log(`Cart item ${itemId} not found for update`); // Changed to log
          throw new Error('CART_ITEM_NOT_FOUND');
        }
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData?.message || 'Failed to update cart');
        }
        
        return await res.json();
      } catch (error) {
        console.error('Cart update error:', error);
        throw error;
      }
    },
    
    remove: async (itemId: number) => {
      try {
        const res = await authFetch(Endpoints.customer.cartRemove(itemId), {
          method: 'DELETE',
        });
        
        if (res.status === 404) {
          console.log(`Cart item ${itemId} already removed`); // Changed to log
          return { success: true, id: itemId, alreadyRemoved: true };
        }
        
        if (!res.ok) {
          throw new Error('Failed to remove from cart');
        }
        
        if (res.status === 204) return { success: true, id: itemId };
        return await res.json();
      } catch (error) {
        console.error('Cart remove error:', error);
        throw error;
      }
    },
    
    merge: async () => {
      const cartSession = localStorage.getItem('cartSessionId');
      if (!cartSession) return;
      
      try {
        await authFetch(Endpoints.customer.cartMerge, { method: 'POST' });
        localStorage.removeItem('cartSessionId');
      } catch (error) {
        console.error('Failed to merge cart:', error);
      }
    },
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

  orders: {
    list: async (page: number = 1, limit: number = 10) => {
      try {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
        const res = await authFetch(`${Endpoints.customer.orders}?${params.toString()}`);
        
        if (!res.ok) return { data: [], meta: { total: 0, current_page: page, last_page: 1 } };
        return await res.json();
      } catch {
        return { data: [], meta: { total: 0, current_page: page, last_page: 1 } };
      }
    },
    
    getByReference: async (reference: string): Promise<CustomerOrder> => {
      try {
        const res = await authFetch(Endpoints.customer.orderDetail(reference));
        
        if (!res.ok) {
          if (res.status === 404) throw new Error('Order not found');
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData?.message || 'Failed to fetch order');
        }
        
        const data = await res.json();
        return data.order || data;
      } catch (error) {
        console.error(`Error fetching order ${reference}:`, error);
        throw error;
      }
    },
    
    track: async (reference: string) => {
      try {
        const res = await authFetch(`${Endpoints.customer.orderDetail(reference)}/track`);
        if (!res.ok) throw new Error('Failed to track order');
        return await res.json();
      } catch (error) {
        console.error('Error tracking order:', error);
        throw error;
      }
    },
    
    cancel: async (reference: string) => {
      try {
        const res = await authFetch(Endpoints.customer.orderDetail(reference), {
          method: 'POST',
          body: JSON.stringify({ action: 'cancel' }),
        });
        
        if (!res.ok) throw new Error('Failed to cancel order');
        return await res.json();
      } catch (error) {
        console.error('Error cancelling order:', error);
        throw error;
      }
    },
  },

  wishlist: {
    list: async (params?: URLSearchParams) => {
      try {
        const url = params ? `${Endpoints.customer.wishlist}?${params}` : Endpoints.customer.wishlist;
        const res = await authFetch(url);
        
        if (!res.ok) return { data: [] };
        return await res.json();
      } catch {
        return { data: [] };
      }
    },
    
    add: async (productId: number) => {
      try {
        const res = await authFetch(Endpoints.customer.wishlist, {
          method: 'POST',
          body: JSON.stringify({ product_id: productId }),
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          try {
            const error = JSON.parse(errorText);
            throw new Error(error?.message || 'Failed to add to wishlist');
          } catch {
            throw new Error('Failed to add to wishlist');
          }
        }
        
        return await res.json();
      } catch (error) {
        console.error('Error adding to wishlist:', error);
        throw error;
      }
    },
    
  remove: async (id: number) => {
  try {
    const res = await authFetch(Endpoints.customer.wishlistItem(id), {
      method: 'DELETE',
    });
    
    if (res.status === 404) {
      console.log(`Wishlist item ${id} already removed`); 
      return { success: true, id, alreadyRemoved: true };
    }
    
    if (!res.ok) {
      throw new Error(`Failed to remove from wishlist (${res.status})`);
    }
    
    if (res.status === 204) return { success: true, id };
    
    const responseText = await res.text();
    try {
      return responseText ? JSON.parse(responseText) : { success: true, id };
    } catch {
      return { success: true, id };
    }
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    if (error instanceof Error && error.message.includes('404')) {
      return { success: true, id, alreadyRemoved: true };
    }
    throw error;
  }
},
  },
} as const;