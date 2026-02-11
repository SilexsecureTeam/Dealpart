'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  MoreVertical,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from 'next-themes';

// ---------- TYPES ----------
type AdminUser = {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  role: string | null;
  avatar: string | null;
  expires_at: string | null;
};

type SummaryStats = {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  canceledOrders: number;
  previousTotalSales: number;
  previousTotalOrders: number;
  salesGrowth: number;
  ordersGrowth: number;
  pendingGrowth: number;
  canceledGrowth: number;
};

type WeeklyStat = {
  customers: number;
  totalProducts: number;
  stockProducts: number;
  outOfStock: number;
  revenue: number;
};

type Transaction = {
  id: string;
  customer: string;
  date: string;
  status: 'Paid' | 'Pending' | 'Canceled';
  amount: number;
};

type Product = {
  id: number;
  name: string;
  image: string;
  orders?: number;
  status?: 'Stock' | 'Stock out';
  price: number;
  itemCode?: string;
};

type Category = {
  id: number;
  name: string;
  image: string;
};

type CountrySales = {
  country: string;
  flag: string;
  sales: number;
  change: number;
  width: number;
};

// ---------- MOCK API FUNCTIONS (temporary) ----------
const mockFetchSummary = (): Promise<SummaryStats> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalSales: 350000,
        totalOrders: 10700,
        pendingOrders: 509,
        canceledOrders: 94,
        previousTotalSales: 235000,
        previousTotalOrders: 7600,
        salesGrowth: 10.4,
        ordersGrowth: 14.4,
        pendingGrowth: 8.2,
        canceledGrowth: -14.4,
      });
    }, 800);
  });
};

const mockFetchWeeklyStats = (): Promise<WeeklyStat> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        customers: 52000,
        totalProducts: 3500,
        stockProducts: 2500,
        outOfStock: 500,
        revenue: 250000,
      });
    }, 600);
  });
};

const mockFetchWeeklySales = (): Promise<{ day: string; sales: number }[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { day: 'Sun', sales: 12000 },
        { day: 'Mon', sales: 19000 },
        { day: 'Tue', sales: 25000 },
        { day: 'Wed', sales: 22000 },
        { day: 'Thu', sales: 14000 },
        { day: 'Fri', sales: 18000 },
        { day: 'Sat', sales: 21000 },
      ]);
    }, 700);
  });
};

const mockFetchTransactions = (): Promise<Transaction[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: '6545', customer: 'John Doe', date: '01 Oct | 11:29 am', status: 'Paid', amount: 64 },
        { id: '5412', customer: 'Jane Smith', date: '01 Oct | 11:29 am', status: 'Pending', amount: 557 },
        { id: '6622', customer: 'Bob Johnson', date: '01 Oct | 11:29 am', status: 'Paid', amount: 156 },
        { id: '6462', customer: 'Alice Brown', date: '01 Oct | 11:29 am', status: 'Paid', amount: 265 },
        { id: '7011', customer: 'Charlie White', date: '01 Oct | 11:29 am', status: 'Paid', amount: 265 },
      ]);
    }, 900);
  });
};

const mockFetchBestSelling = (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'Monocrystalle Panel', image: '/solarpanel.png', orders: 104, status: 'Stock', price: 999.0 },
        { id: 2, name: 'Monocrystalle Panel', image: '/solarpanel.png', orders: 56, status: 'Stock out', price: 999.0 },
        { id: 3, name: 'Monocrystalle Panel', image: '/solarpanel.png', orders: 266, status: 'Stock', price: 999.0 },
        { id: 4, name: 'Monocrystalle Panel', image: '/solarpanel.png', orders: 506, status: 'Stock', price: 999.0 },
      ]);
    }, 700);
  });
};

const mockFetchTopProducts = (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'Monocrystalle Panel', image: '/solarpanel.png', itemCode: '#FXZ-4567', price: 999.0 },
        { id: 2, name: 'Monocrystalle Panel', image: '/solarpanel.png', itemCode: '#FXZ-4567', price: 724.0 },
        { id: 3, name: 'Monocrystalle Panel', image: '/solarpanel.png', itemCode: '#FXZ-4567', price: 345.0 },
        { id: 4, name: 'Monocrystalle Panel', image: '/solarpanel.png', itemCode: '#FXZ-4567', price: 800.0 },
      ]);
    }, 650);
  });
};

const mockFetchCategories = (): Promise<Category[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'Pv Solar panels', image: '/solarpanel.png' },
        { id: 2, name: 'Inverters', image: '/solarpanel.png' },
        { id: 3, name: 'Batteries', image: '/solarpanel.png' },
        { id: 4, name: 'Charge Controllers', image: '/solarpanel.png' },
      ]);
    }, 500);
  });
};

const mockFetchLiveUsers = (): Promise<{ total: number; perMinute: number; activity: number[] }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        total: 21500,
        perMinute: 12.4,
        activity: [30, 35, 32, 40, 25, 28, 30, 22, 35, 38, 45, 42, 50, 48, 45, 40, 42, 48, 52, 50],
      });
    }, 550);
  });
};

const mockFetchCountrySales = (): Promise<CountrySales[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { country: 'US', flag: 'us', sales: 30000, change: 25.8, width: 100 },
        { country: 'Brazil', flag: 'br', sales: 30000, change: -15.8, width: 85 },
        { country: 'Australia', flag: 'au', sales: 25000, change: 35.8, width: 70 },
      ]);
    }, 600);
  });
};

// ---------- HELPERS ----------
const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
const formatCompact = (num: number) => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// ---------- LOADING SKELETONS (OUTSIDE component) ----------
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm animate-pulse">
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-6" />
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
  </div>
);

const SkeletonTableRow = () => (
  <tr className="animate-pulse">
    <td className="py-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-6" /></td>
    <td className="py-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" /></td>
    <td className="py-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" /></td>
    <td className="py-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>
    <td className="py-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 ml-auto" /></td>
  </tr>
);

// ---------- MAIN COMPONENT ----------
export default function AdminDashboard() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // ---------- STATE ----------
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [transactionFilter, setTransactionFilter] = useState<string>('All');
  const [bestSellingFilter, setBestSellingFilter] = useState<string>('All');

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingWeeklyStats, setLoadingWeeklyStats] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingBestSelling, setLoadingBestSelling] = useState(true);
  const [loadingTopProducts, setLoadingTopProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingLiveUsers, setLoadingLiveUsers] = useState(true);
  const [loadingCountrySales, setLoadingCountrySales] = useState(true);

  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat | null>(null);
  const [weeklySales, setWeeklySales] = useState<{ day: string; sales: number }[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bestSelling, setBestSelling] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [liveUsers, setLiveUsers] = useState<{ total: number; perMinute: number; activity: number[] } | null>(null);
  const [countrySales, setCountrySales] = useState<CountrySales[]>([]);

  // ---------- FILTERED DATA ----------
  const filteredTransactions = transactions.filter((t) =>
    transactionFilter === 'All' ? true : t.status === transactionFilter
  );
  const filteredBestSelling = bestSelling.filter((p) =>
    bestSellingFilter === 'All' ? true : p.status === bestSellingFilter
  );

  // ---------- AUTH CHECK & LOAD ADMIN ----------
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    const user = localStorage.getItem('adminUser');
    if (user) {
      try {
        setAdmin(JSON.parse(user));
      } catch {
        // fallback
      }
    }
  }, [router]);

  // ---------- FETCH ALL DATA (temporary mock) ----------
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [
          summaryData,
          weeklyStatsData,
          weeklySalesData,
          transactionsData,
          bestSellingData,
          topProductsData,
          categoriesData,
          liveUsersData,
          countrySalesData,
        ] = await Promise.all([
          mockFetchSummary(),
          mockFetchWeeklyStats(),
          mockFetchWeeklySales(),
          mockFetchTransactions(),
          mockFetchBestSelling(),
          mockFetchTopProducts(),
          mockFetchCategories(),
          mockFetchLiveUsers(),
          mockFetchCountrySales(),
        ]);

        setSummary(summaryData);
        setWeeklyStats(weeklyStatsData);
        setWeeklySales(weeklySalesData);
        setTransactions(transactionsData);
        setBestSelling(bestSellingData);
        setTopProducts(topProductsData);
        setCategories(categoriesData.slice(0, 3));
        setLiveUsers(liveUsersData);
        setCountrySales(countrySalesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoadingSummary(false);
        setLoadingWeeklyStats(false);
        setLoadingChart(false);
        setLoadingTransactions(false);
        setLoadingBestSelling(false);
        setLoadingTopProducts(false);
        setLoadingCategories(false);
        setLoadingLiveUsers(false);
        setLoadingCountrySales(false);
      }
    };

    if (mounted) fetchAll();
  }, [mounted]);

  // ---------- HANDLERS ----------
  const handleDetailsClick = (path: string) => router.push(`/admin/${path}`);
  const handleAddCategory = () => router.push('/admin/categories');
  const handleAddToCart = (productId: number) => alert(`Add product ${productId} to cart (coming soon)`);
  const handleSeeMoreCategories = () => router.push('/admin/categories');
  const handleSeeMoreProducts = () => router.push('/admin/product/add');
  const handleViewInsight = () => router.push('/admin/analytics');

  // ---------- RENDER ----------
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4EA674]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* ---------- Header ---------- */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search data, users, or reports"
              className="pl-12 pr-6 py-3.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm w-72 lg:w-96 focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            />
          </div>
          <button className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle dark mode"
          >
            <Sun
              className={`h-5 w-5 text-yellow-500 transition-all duration-300 ${
                theme === 'dark' ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
              }`}
            />
            <Moon
              className={`absolute inset-0 m-auto h-5 w-5 text-blue-400 transition-all duration-300 ${
                theme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'
              }`}
            />
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {admin?.name || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {admin?.email || 'admin@example.com'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600">
              <Image
                src={admin?.avatar || '/man.png'}
                alt="Admin"
                width={40}
                height={40}
                className="object-cover w-full h-full"
                unoptimized
              />
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Main content ---------- */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-gray-50 dark:bg-gray-950">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loadingSummary ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              {/* Total Sales */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">Total Sales</h3>
                    <p className="text-sm text-[#7C7C7C] dark:text-gray-400 mt-1">Last 7 days</p>
                  </div>
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </div>
                <div className="mb-6">
                  <div className="flex items-end gap-4">
                    <p className="text-4xl font-bold text-[#4EA674]">
                      {formatCompact(summary?.totalSales || 0)}
                    </p>
                    <p className={`text-lg font-bold flex items-center gap-1 pb-1 ${
                      (summary?.salesGrowth || 0) >= 0 ? 'text-[#4EA674]' : 'text-[#F43443]'
                    }`}>
                      {(summary?.salesGrowth || 0) >= 0 ? '↑' : '↓'} {Math.abs(summary?.salesGrowth || 0)}%
                    </p>
                  </div>
                  <p className="text-sm text-[#7C7C7C] dark:text-gray-400 mt-2">
                    Previous 7days ({formatCurrency(summary?.previousTotalSales || 0)})
                  </p>
                </div>
                <button
                  onClick={() => handleDetailsClick('sales')}
                  className="w-full py-3 border border-[#4EA674] text-[#4EA674] rounded-full text-sm font-bold hover:bg-[#4EA674] hover:text-white transition-all"
                >
                  Details
                </button>
              </div>

              {/* Total Orders */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">Total Orders</h3>
                    <p className="text-sm text-[#7C7C7C] dark:text-gray-400 mt-1">Last 7 days</p>
                  </div>
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </div>
                <div className="mb-6">
                  <div className="flex items-end gap-4">
                    <p className="text-4xl font-bold text-[#4EA674]">
                      {formatCompact(summary?.totalOrders || 0)}
                    </p>
                    <p className={`text-lg font-bold flex items-center gap-1 pb-1 ${
                      (summary?.ordersGrowth || 0) >= 0 ? 'text-[#4EA674]' : 'text-[#F43443]'
                    }`}>
                      {(summary?.ordersGrowth || 0) >= 0 ? '↑' : '↓'} {Math.abs(summary?.ordersGrowth || 0)}%
                    </p>
                  </div>
                  <p className="text-sm text-[#7C7C7C] dark:text-gray-400 mt-2">
                    Previous 7days ({formatCompact(summary?.previousTotalOrders || 0)})
                  </p>
                </div>
                <button
                  onClick={() => handleDetailsClick('orders')}
                  className="w-full py-3 border border-[#4EA674] text-[#4EA674] rounded-full text-sm font-bold hover:bg-[#4EA674] hover:text-white transition-all"
                >
                  Details
                </button>
              </div>

              {/* Pending & Canceled */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">Pending & Canceled</h3>
                    <p className="text-sm text-[#7C7C7C] dark:text-gray-400 mt-1">Last 7 days</p>
                  </div>
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Pending</p>
                    <div className="flex items-baseline gap-3">
                      <p className="text-4xl font-bold text-[#4EA674]">{summary?.pendingOrders || 0}</p>
                      <p className="text-lg font-medium text-[#4EA674]">user {summary?.pendingGrowth || 0}%</p>
                    </div>
                  </div>
                  <div className="border-l border-gray-200 dark:border-gray-700 pl-8">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Canceled</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-bold text-[#F43443]">{summary?.canceledOrders || 0}</p>
                      <p className={`text-lg font-bold flex items-center gap-1 ${
                        (summary?.canceledGrowth || 0) <= 0 ? 'text-[#F43443]' : 'text-[#4EA674]'
                      }`}>
                        {(summary?.canceledGrowth || 0) <= 0 ? '↓' : '↑'} {Math.abs(summary?.canceledGrowth || 0)}%
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDetailsClick('orders?status=pending,canceled')}
                  className="w-full py-3 border border-[#4EA674] text-[#4EA674] rounded-full text-sm font-bold hover:bg-[#4EA674] hover:text-white transition-all"
                >
                  Details
                </button>
              </div>
            </>
          )}
        </div>

        {/* Weekly Report + Live Users */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weekly Report */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h3 className="text-xl font-bold">Report for this week</h3>
              <div className="flex items-center gap-2">
                <button className="px-5 py-2.5 bg-[#C1E6BA] text-[#4EA674] rounded-full text-sm font-bold">
                  This week
                </button>
                <button className="px-5 py-2.5 bg-[#EAF8E7] text-[#7C7C7C] rounded-full text-sm font-medium hover:bg-[#C1E6BA] hover:text-[#4EA674] transition-colors">
                  Last week
                </button>
                <MoreVertical className="w-5 h-5 text-gray-400 ml-1" />
              </div>
            </div>

            {loadingWeeklyStats ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 mb-10 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 mb-10 text-center">
                <div>
                  <p className="text-3xl font-bold text-[#4EA674]">
                    {formatCompact(weeklyStats?.customers || 0)}
                  </p>
                  <p className="text-sm text-[#7C7C7C] dark:text-gray-400 mt-1">Customers</p>
                  <div className="h-1 bg-[#4EA674] rounded-full mt-2 w-16 mx-auto" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatCompact(weeklyStats?.totalProducts || 0)}
                  </p>
                  <p className="text-sm text-[#7C7C7C] dark:text-gray-400 mt-1">Total Products</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatCompact(weeklyStats?.stockProducts || 0)}
                  </p>
                  <p className="text-sm text-[#7C7C7C] dark:text-gray-400 mt-1">Stock Products</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatCompact(weeklyStats?.outOfStock || 0)}
                  </p>
                  <p className="text-sm text-[#7C7C7C] dark:text-gray-400 mt-1">Out of Stock</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatCompact(weeklyStats?.revenue || 0)}
                  </p>
                  <p className="text-sm text-[#7C7C7C] dark:text-gray-400 mt-1">Revenue</p>
                </div>
              </div>
            )}

            {loadingChart ? (
              <div className="w-full h-80 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-xl" />
            ) : (
              <div style={{ width: '100%', height: 320, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklySales} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C1E6BA" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#C1E6BA" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: '#7C7C7C', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fill: '#7C7C7C', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#EAF8E7',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      }}
                      labelStyle={{ color: '#4EA674', fontWeight: 'bold' }}
                      formatter={(value) => [`${(Number(value) / 1000).toFixed(1)}k`, 'Sales']}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#4EA674"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorFill)"
                      dot={{ fill: '#4EA674', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Live Users + Sales by Country */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            {loadingLiveUsers ? (
              <div className="animate-pulse space-y-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                <div className="flex items-end gap-1 h-24 mt-4">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t-md h-12" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="mb-10">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Users in last 30 minutes</p>
                  <p className="text-4xl font-bold mb-6">{formatCompact(liveUsers?.total || 0)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Users per minute</p>
                  <div className="flex items-end gap-1 h-24">
                    {liveUsers?.activity.map((h, i) => (
                      <div key={i} className="flex-1 bg-[#4EA674] rounded-t-md" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 my-8" />
              </>
            )}

            {loadingCountrySales ? (
              <div className="animate-pulse space-y-4 mt-8">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative overflow-hidden -mx-6 -mb-6 px-6 pb-6 rounded-b-2xl bg-gray-50 dark:bg-gray-900/30">
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-bold">Sales by Country</h4>
                    <span className="text-sm text-[#7C7C7C]">Sales</span>
                  </div>
                  {countrySales.map((c) => (
                    <div key={c.country} className="flex items-center gap-4 mb-5 last:mb-0">
                      <img
                        src={`https://flagcdn.com/w80/${c.flag}.png`}
                        alt={c.country}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-semibold">{c.country}</span>
                          <span className="text-[#7C7C7C]">{formatCompact(c.sales)}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#646FF2] to-[#8B75F6] rounded-full"
                            style={{ width: `${c.width}%` }}
                          />
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${c.change >= 0 ? 'text-[#4EA674]' : 'text-[#F43443]'}`}>
                        {c.change >= 0 ? '↑' : '↓'} {Math.abs(c.change)}%
                      </span>
                    </div>
                  ))}
                  <button
                    onClick={handleViewInsight}
                    className="w-full mt-8 py-3.5 border border-[#4EA674] text-[#4EA674] rounded-full text-sm font-bold hover:bg-[#4EA674] hover:text-white transition-colors"
                  >
                    View Insight
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Transaction + Best Selling */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Transaction */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">Transaction</h3>
                <div className="relative">
                  <select
                    value={transactionFilter}
                    onChange={(e) => setTransactionFilter(e.target.value)}
                    className="px-5 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium appearance-none cursor-pointer pr-10 focus:outline-none focus:ring-2 focus:ring-[#4EA674]/50"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.8rem center',
                      backgroundSize: '1.2rem',
                    }}
                  >
                    <option value="All" className="text-gray-900 bg-white dark:bg-gray-800 dark:text-white">All</option>
                    <option value="Paid" className="text-gray-900 bg-white dark:bg-gray-800 dark:text-white">Paid</option>
                    <option value="Pending" className="text-gray-900 bg-white dark:bg-gray-800 dark:text-white">Pending</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-6 font-medium">No</th>
                      <th className="pb-6 font-medium">Id Customer</th>
                      <th className="pb-6 font-medium">Order Date</th>
                      <th className="pb-6 font-medium">Status</th>
                      <th className="pb-6 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {loadingTransactions ? (
                      [...Array(5)].map((_, i) => <SkeletonTableRow key={i} />)
                    ) : filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-gray-500 dark:text-gray-400">
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((t, i) => (
                        <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="py-6 text-gray-600 dark:text-gray-300">{i + 1}.</td>
                          <td className="py-6 font-semibold">#{t.id}</td>
                          <td className="py-6 text-gray-600 dark:text-gray-300">{t.date}</td>
                          <td className="py-6">
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-3 h-3 rounded-full ${
                                  t.status === 'Paid' ? 'bg-[#4EA674]' : t.status === 'Pending' ? 'bg-[#F0D411]' : 'bg-[#F43443]'
                                }`}
                              />
                              <span
                                className={`font-medium text-base ${
                                  t.status === 'Paid' ? 'text-[#4EA674]' : t.status === 'Pending' ? 'text-[#F0D411]' : 'text-[#F43443]'
                                }`}
                              >
                                {t.status}
                              </span>
                            </div>
                          </td>
                          <td className="py-6 text-right font-bold text-base">
                            {formatCurrency(t.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => handleDetailsClick('orders')}
                  className="w-full py-3.5 border border-[#4EA674] text-[#4EA674] rounded-full text-sm font-bold hover:bg-gradient-to-r hover:from-[#646FF2] hover:to-[#8B75F6] hover:text-white transition-all"
                >
                  Details
                </button>
              </div>
            </div>

            {/* Best Selling Product */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Best selling product</h3>
                <div className="relative">
                  <select
                    value={bestSellingFilter}
                    onChange={(e) => setBestSellingFilter(e.target.value)}
                    className="px-5 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium appearance-none cursor-pointer pr-10 focus:outline-none focus:ring-2 focus:ring-[#4EA674]/50"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.8rem center',
                      backgroundSize: '1.2rem',
                    }}
                  >
                    <option value="All" className="text-gray-900 bg-white dark:bg-gray-800 dark:text-white">All</option>
                    <option value="Stock" className="text-gray-900 bg-white dark:bg-gray-800 dark:text-white">Stock</option>
                    <option value="Stock out" className="text-gray-900 bg-white dark:bg-gray-800 dark:text-white">Stock out</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead className="border-b border-gray-200 dark:border-gray-700">
                    <tr className="text-left text-gray-500 dark:text-gray-400">
                      <th className="pb-5 font-medium">PRODUCT</th>
                      <th className="pb-5 font-medium">TOTAL ORDER</th>
                      <th className="pb-5 font-medium">STATUS</th>
                      <th className="pb-5 font-medium text-right">PRICE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {loadingBestSelling ? (
                      [...Array(4)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="py-6 flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                          </td>
                          <td className="py-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" /></td>
                          <td className="py-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" /></td>
                          <td className="py-6 text-right"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 ml-auto" /></td>
                        </tr>
                      ))
                    ) : filteredBestSelling.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-gray-500 dark:text-gray-400">
                          No products found
                        </td>
                      </tr>
                    ) : (
                      filteredBestSelling.map((p, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="py-6 flex items-center gap-4">
                            <Image
                              src={p.image}
                              alt={p.name}
                              width={48}
                              height={48}
                              className="rounded-lg object-cover flex-shrink-0"
                              unoptimized
                            />
                            <span className="font-medium">{p.name}</span>
                          </td>
                          <td className="py-6 text-gray-700 dark:text-gray-300">{p.orders}</td>
                          <td className="py-6">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                                p.status === 'Stock'
                                  ? 'bg-[#EAF8E7] text-[#4EA674]'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              }`}
                            >
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${
                                  p.status === 'Stock' ? 'bg-[#4EA674]' : 'bg-red-600'
                                }`}
                              />
                              {p.status === 'Stock' ? 'Stock' : 'Stock out'}
                            </span>
                          </td>
                          <td className="py-6 text-right font-bold">{formatCurrency(p.price)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => handleDetailsClick('products?sort=bestselling')}
                  className="w-full py-3.5 border border-[#4EA674] text-[#4EA674] rounded-full text-sm font-bold hover:bg-[#4EA674] hover:text-white transition-all"
                >
                  Details
                </button>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {/* Top Products */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Top Products</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select className="pl-10 pr-8 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent appearance-none">
                    <option>All product</option>
                  </select>
                </div>
              </div>

              <div className="space-y-5">
                {loadingTopProducts ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                      </div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                    </div>
                  ))
                ) : (
                  topProducts.map((p, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Image
                        src={p.image}
                        alt={p.name}
                        width={64}
                        height={64}
                        className="rounded-lg object-cover flex-shrink-0"
                        unoptimized
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{p.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Item: {p.itemCode}</p>
                      </div>
                      <p className="font-bold text-[#4EA674] text-lg">{formatCurrency(p.price)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add New Category */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Add New Category</h3>
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 border border-[#4EA674] text-[#4EA674] rounded-full text-sm font-medium hover:bg-[#4EA674] hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New
                </button>
              </div>

              <div className="mb-8">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Categories</p>
                <div className="space-y-3">
                  {loadingCategories ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl animate-pulse">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                        </div>
                        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    ))
                  ) : (
                    categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => router.push(`/admin/categories/${cat.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <Image
                            src={cat.image}
                            alt={cat.name}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover"
                            unoptimized
                          />
                          <span className="font-medium">{cat.name}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={handleSeeMoreCategories}
                  className="text-[#4EA674] text-sm font-medium mt-4 block mx-auto hover:underline"
                >
                  See more
                </button>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Product</p>
                <div className="space-y-4">
                  {loadingTopProducts ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl animate-pulse">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                          <div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                          </div>
                        </div>
                        <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      </div>
                    ))
                  ) : (
                    topProducts.slice(0, 3).map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Image
                            src={p.image}
                            alt={p.name}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover"
                            unoptimized
                          />
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-sm text-[#4EA674] font-bold">{formatCurrency(p.price)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddToCart(p.id)}
                          className="px-5 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#3D8B59] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={handleSeeMoreProducts}
                  className="text-[#4EA674] text-sm font-medium mt-4 block mx-auto hover:underline"
                >
                  See more
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}