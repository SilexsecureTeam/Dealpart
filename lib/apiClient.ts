import { Endpoints } from './endpoints';

const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
const setToken = (token: string) => { if (typeof window !== 'undefined') localStorage.setItem('adminToken', token); };
const removeToken = () => { if (typeof window !== 'undefined') localStorage.removeItem('adminToken'); };

const authFetch = (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: HeadersInit = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  return fetch(url, { ...options, headers });
};

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const form = new FormData(); form.append('email', email); form.append('password', password);
      const res = await fetch(Endpoints.admin.login, { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Login failed');
      if (json.token) setToken(json.token);
      return json;
    },
    verifyOtp: async (userId: number, email: string, otp: string) => {
      const form = new FormData(); form.append('user_id', String(userId)); form.append('otp', otp);
      const url = new URL(Endpoints.admin.verifyOtp); url.searchParams.append('user_id', String(userId));
      const res = await fetch(url.toString(), { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'OTP verification failed');
      if (json.token) setToken(json.token);
      return json;
    },
    logout: () => removeToken(),
  },

  categories: {
    list: () => authFetch(Endpoints.admin.categories).then(res => res.json()),
    create: (name: string) => {
      const form = new FormData(); form.append('name', name);
      return authFetch(Endpoints.admin.categories, { method: 'POST', body: form }).then(res => res.json());
    },
    update: (id: number, name: string) => {
      const form = new FormData(); form.append('name', name); form.append('_method', 'PATCH');
      return authFetch(Endpoints.admin.categoryDetail(id), { method: 'POST', body: form }).then(res => res.json());
    },
    delete: (id: number) => authFetch(Endpoints.admin.categoryDetail(id), { method: 'DELETE' }).then(res => res.json()),
  },

  products: {
    list: () => authFetch(Endpoints.admin.products).then(res => res.json()),
    create: (formData: FormData) => authFetch(Endpoints.admin.products, { method: 'POST', body: formData }).then(res => res.json()),
    update: (id: number, formData: FormData) => {
      formData.append('_method', 'PUT');
      return authFetch(Endpoints.admin.productDetail(id), { method: 'POST', body: formData }).then(res => res.json());
    },
    delete: (id: number) => authFetch(Endpoints.admin.productDetail(id), { method: 'DELETE' }).then(res => res.json()),
  },

  orders: {
    list: (params?: URLSearchParams) => authFetch(`${Endpoints.admin.orders}${params ? `?${params}` : ''}`).then(res => res.json()),
    stats: () => authFetch(Endpoints.admin.orderStats).then(res => res.json()),
    detail: (id: number) => authFetch(Endpoints.admin.orderDetail(id)).then(res => res.json()),
  },

  dashboard: {
    summary: () => authFetch(Endpoints.admin.dashboardSummary).then(res => res.json()),
    weeklySales: () => authFetch(Endpoints.admin.dashboardWeeklySales).then(res => res.json()),
    weeklyStats: () => authFetch(Endpoints.admin.dashboardWeeklyStats).then(res => res.json()),
    liveUsers: () => authFetch(Endpoints.admin.dashboardLiveUsers).then(res => res.json()),
    countrySales: () => authFetch(Endpoints.admin.dashboardCountrySales).then(res => res.json()),
  },

  profile: {
    get: () => authFetch(Endpoints.admin.profile).then(res => res.json()),
    update: (data: any) => authFetch(Endpoints.admin.profile, { method: 'PATCH', body: JSON.stringify(data) }).then(res => res.json()),
    uploadAvatar: (file: File) => {
      const form = new FormData(); form.append('avatar', file);
      return authFetch(Endpoints.admin.profileAvatar, { method: 'POST', body: form }).then(res => res.json());
    },
    updatePassword: (data: any) => authFetch(Endpoints.admin.profilePassword, { method: 'PATCH', body: JSON.stringify(data) }).then(res => res.json()),
  },

  staff: {
    list: () => authFetch(Endpoints.admin.staff).then(res => res.json()),
    create: (formData: FormData) => authFetch(Endpoints.admin.staff, { method: 'POST', body: formData }).then(res => res.json()),
    update: (id: number, formData: FormData) => {
      formData.append('_method', 'PUT');
      return authFetch(Endpoints.admin.staffMember(id), { method: 'POST', body: formData }).then(res => res.json());
    },
    delete: (id: number) => authFetch(Endpoints.admin.staffMember(id), { method: 'DELETE' }).then(res => res.json()),
  },


transactions: {
  list: (params?: URLSearchParams) =>
    authFetch(`${Endpoints.admin.transactions}${params ? `?${params}` : ''}`).then(res => res.json()),
  stats: () => authFetch(Endpoints.admin.transactionStats).then(res => res.json()),
  detail: (id: number) =>
    authFetch(Endpoints.admin.transactionDetail(id)).then(res => res.json()),
},

  inventory: {
    import: (file: File) => {
      const form = new FormData(); form.append('file', file);
      return authFetch(Endpoints.admin.importInventory, { method: 'POST', body: form }).then(res => res.json());
    },
  },
} as const;