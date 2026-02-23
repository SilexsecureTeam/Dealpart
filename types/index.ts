// types/index.ts

// ---------- User Types ----------
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  email_verified_at: string | null;
  role: 'user' | 'admin' | 'accountant' | 'manager';
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  google_id: string | null;
  avatar: string | null;
  avatar_url: string | null;
  first_name: string | null;
  last_name: string | null;
  dob: string | null;
  location: string | null;
  bio: string | null;
}

// ---------- Category Types ----------
export interface Category {
  id: number;
  name: string;
  description: string;
  slug: string;
  image: string;
  created_at: string;
  updated_at: string;
  products?: Product[];
}

export interface Subcategory {
  id: number;
  category_id: number;
  name: string;
  description: string;
  image: string;
  created_at: string;
  updated_at: string;
}

// ---------- Product Types ----------
export interface Product {
  id: number;
  name: string;
  description: string;
  sales_price_inc_tax: string | number;
    sale_price_inc_tax?: number | string;
  images?: string[];
  colours?: string[];
  customize?: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  subcategory?: Subcategory;
  brand?: Brand;
  tags?: Tag[];
  current_stock?: number;
  total_stock?: number;
  cost_price?: number;
  measure?: string;
  unit_of_sale?: string;
  orders?: number; 
  price?: number;
  sale_price?: number | null;
  rating?: number;
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  stock_quantity?: number;
  is_featured?: boolean;
  is_hot?: boolean;
  short_description?: string;
  image?: string; 
  slug?: string;
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  description?: string;
  email: string;
  phone: string;
  contact_number2?: string;
  address: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  website?: string;
  contact_person: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  staff_role: string;
  staff_address: string;
  additional_information?: string;
  photo?: string;
  age: number;
  salary: number;
  working_hours_start: string;
  working_hours_end: string;
  created_at: string;
  updated_at: string;
}

// ---------- Cart Types ----------
export interface CartItem {
  id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  price: number;
  color?: string;
  customizations?: any[];
}

export interface Cart {
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  delivery_fee: number;
  discount: number;
}

// ---------- Order Types (Customer) ----------
export interface CustomerOrder {
  id: number;
  user_id: number;
  session_id: string | null;
  order_reference: string;
  subtotal: number;
  delivery_fee: string;
  total: number;
  coupon_code: string | null;
  discount_amount: number;
  tax_rate: string;
  tax_amount: number;
  shipping_address: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: string;
  created_at: string;
  updated_at: string;
  items: CustomerOrderItem[];
}

export interface CustomerOrderItem {
  id: number;
  order_id: number;
  product_id: number;
  customization_id: number | null;
  color: string | null;
  quantity: number;
  price: string;
  created_at: string;
  updated_at: string;
  product: {
    id: number;
    name: string;
    images?: Array<{ id: number; path: string }>;
    image_urls?: Array<{ id: number; path: string; url: string }>;
  };
  customization: any | null;
}

// ---------- Order Types (Admin) ----------
export interface Order {
  id: string;
  user_id: number;
  user?: User;
  items: OrderItem[];
  shipping_address: string;
  delivery_fee: number;
  tax_rate: number;
  tax_amount: number;
  discount?: number;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'delivered';
  payment_status: 'paid' | 'unpaid' | 'refunded';
  payment_reference?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  price: number;
  color?: string;
  customizations?: any[];
}

export interface OrderListItem {
  id: string | number;
  order_id: string;
  order_reference: string;
  product_name: string;
  product_image?: string;
  date: string;
  price: number;
  customer_name?: string;
  customer_email?: string;
  payment_status: 'Paid' | 'Unpaid' | 'Pending' | 'Refunded';
  order_status: 'Delivered' | 'Shipped' | 'Pending' | 'Canceled' | 'Processing';
  customer?: {
    name: string;
    email: string;
    phone?: string;
  };
  items?: Array<{
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
  }>;
  total?: number;
  subtotal?: number;
  tax?: number;
  delivery_fee?: number;
  discount?: number;
  shipping_address?: string;
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface OrderStats {
  totalOrders: number;
  totalOrdersChange: string;
  newOrders: number;
  newOrdersChange: string;
  completedOrders: number;
  completedPercent: string;
  canceledOrders: number;
  canceledChange: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Canceled' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Unpaid' | 'Pending';

// ---------- Checkout Types ----------
export interface CheckoutPayload {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  delivery_fee: number;
  coupon_code?: string | null;
  tax_rate: number;
}

// In types/index.ts
export interface CheckoutResponse {
  message: string;
  order: {
    id: number;
    user_id: number;
    session_id: string | null;
    order_reference: string;  // ✅ This is what
    subtotal: number;
    delivery_fee: string;
    total: number;
    coupon_code: string | null;
    discount_amount: number;
    tax_rate: string;
    tax_amount: number;
    shipping_address: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    status: string;
    created_at: string;
    updated_at: string;
    items: Array<{
      id: number;
      order_id: number;
      product_id: number;
      customization_id: null;
      color: string;
      quantity: number;
      price: string;
      created_at: string;
      updated_at: string;
      product: any;
    }>;
  };
  authorization_url?: string; 
}

export interface VerifyPaymentResponse {
  status: boolean;
  message: string;
  order?: CustomerOrder;
}

// ---------- Coupon Types ----------
export interface Coupon {
  id: number;
  promotion_name: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  start_date: string;
  expires_at: string;
  usage_limit: number;
  used_count?: number;
  is_active: boolean;
  product_ids?: number[];
  created_at: string;
  updated_at: string;
}

// ---------- Wishlist Types ----------
export interface WishlistItem {
  id: number;
  product_id: number;
  product: Product;
  created_at: string;
}

export interface WishlistResponse {
  data?: WishlistItem[];
  wishlist?: WishlistItem[];
}

// ---------- Customer Types (Admin) ----------
export type CustomerStatus = 'Active' | 'Inactive' | 'VIP';

export interface AdminCustomer {
  id: string;
  user_id?: number;
  name: string;
  email: string;
  phone: string;
  orders_count: number;
  total_spent: number;
  status: CustomerStatus;
  created_at: string;
  updated_at: string;
}

export interface CustomerStats {
  totalCustomers: number;
  newCustomers: number;
  visitors: number;
  activeCustomers: number;
  repeatCustomers: number;
  shopVisitors: number;
  conversionRate: number;
  totalCustomersChange: string;
  newCustomersChange: string;
  visitorsChange: string;
}

export interface CustomersResponse {
  customers: AdminCustomer[];
  total: number;
  page: number;
  limit: number;
}

export interface CustomerOverview {
  weeklyData: { day: string; visitors: number }[];
  stats: CustomerStats;
}

export interface CustomerDetails extends AdminCustomer {
  avatar?: string | null;
  address?: string;
  registration?: string;
  lastPurchase?: string;
  totalOrders?: number;
  completedOrders?: number;
  canceledOrders?: number;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
}

// ---------- Transaction Types ----------
export interface Transaction {
  id: string;
  customer: string;
  date: string;
  status: 'Paid' | 'Pending' | 'Canceled';
  amount: number;
}

export interface AdminTransaction {
  id: string;
  customer_id: string;
  customer_name: string;
  date: string;
  total: number;
  payment_method: string;
  status: 'Complete' | 'Pending' | 'Canceled';
}

export interface AdminTransactionsResponse {
  transactions: AdminTransaction[];
  total: number;
  page: number;
  limit: number;
}

export interface TransactionStats {
  totalRevenue: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  totalRevenueChange: string;
  completedChange: string;
  pendingPercent: string;
  failedPercent: string;
}

// ---------- CMS Types ----------
export interface HeroSlide {
  id: number;
  title: string;
  image: string;
  link_url: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface TrustedOrganization {
  id: number;
  heading: string;
  logos: string[];
  logo_names: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: number;
  name: string;
  position: string;
  photo: string;
  bio: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AboutUs {
  id: number;
  heading: string;
  content: string;
  founder_name: string;
  founder_title: string;
  founder_image: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ---------- Delivery & Tax Types ----------
export interface DeliveryFee {
  id: number;
  state_name: string;
  lga_name: string;
  places: string;
  fee: number;
  created_at: string;
  updated_at: string;
}

export interface Tax {
  id: number;
  percentage: number;
  is_active: boolean;
  name?: string;
  created_at: string;
  updated_at: string;
}

// ---------- API Response Types ----------
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  token?: string;
  expires_at?: string;
  success?: boolean;
  avatar_url?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

