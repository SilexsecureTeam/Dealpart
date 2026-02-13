export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.bezalelsolar.com';

export const AdminEndpoints = {
  login: `${API_BASE}/api/admin/login`,
  verifyOtp: `${API_BASE}/api/admin/verify-otp`,
  register: `${API_BASE}/api/register`,
  staff: `${API_BASE}/api/staff`,
  staffMember: (id: number | string) => `${API_BASE}/api/staff/${id}`,
  categories: `${API_BASE}/api/categories`,
  categoryDetail: (id: number | string) => `${API_BASE}/api/categories/${id}`,
  products: `${API_BASE}/api/products`,
  productDetail: (id: number | string) => `${API_BASE}/api/products/${id}`,
  orders: `${API_BASE}/api/orders`,
  orderDetail: (id: number | string) => `${API_BASE}/api/orders/${id}`,
  orderStats: `${API_BASE}/api/orders/stats`,
  dashboardSummary: `${API_BASE}/api/admin/dashboard/summary`,
  dashboardWeeklySales: `${API_BASE}/api/admin/dashboard/weekly-sales`,
  dashboardWeeklyStats: `${API_BASE}/api/admin/dashboard/weekly-stats`,
  dashboardLiveUsers: `${API_BASE}/api/admin/dashboard/live-users`,
  dashboardCountrySales: `${API_BASE}/api/admin/dashboard/sales-by-country`,
  profile: `${API_BASE}/api/admin/profile`,
  profileAvatar: `${API_BASE}/api/admin/profile/avatar`,
  profilePassword: `${API_BASE}/api/admin/profile/password`,
  importInventory: `${API_BASE}/api/importInventory`,
  transactions: `${API_BASE}/api/admin/transactions`,
  transactionStats: `${API_BASE}/api/transactions/stats`,
  transactionDetail: (id: number | string) => `${API_BASE}/api/transactions/${id}`,
users: `${API_BASE}/api/admin/users`,
userDetail: (id: number | string) => `${API_BASE}/api/admin/users/${id}`,

} as const;

export const CustomerEndpoints = {
  login: `${API_BASE}/api/login`,
  register: `${API_BASE}/api/register`,
  verifyCode: `${API_BASE}/api/verify-code`,
  profile: `${API_BASE}/api/profile`,
  updateProfile: `${API_BASE}/api/profile`,
  products: `${API_BASE}/api/products`,
  productDetail: (id: number | string) => `${API_BASE}/api/products/${id}`,
  cart: `${API_BASE}/api/cart`,
  cartAdd: `${API_BASE}/api/cart/add`,
  cartUpdate: (id: number | string) => `${API_BASE}/api/cart/${id}`,
  cartRemove: (id: number | string) => `${API_BASE}/api/cart/${id}`,
  checkout: `${API_BASE}/api/checkout`,
verifyPayment: `${API_BASE}/api/verify-payment`,
coupons: `${API_BASE}/api/coupons`,
wishlist: `${API_BASE}/api/wishlist`,
wishlistItem: (id: number | string) => `${API_BASE}/api/wishlist/${id}`,
} as const;



export const Endpoints = {
  admin: AdminEndpoints,
  customer: CustomerEndpoints,
} as const;