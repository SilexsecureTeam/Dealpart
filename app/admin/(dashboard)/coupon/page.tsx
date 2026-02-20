// app/admin/(dashboard)/coupon/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext'; // Add this
import { 
  useCoupons, 
  useCreateCoupon, 
  useUpdateCoupon,
  useDeleteCoupon,
  useToggleCouponStatus,
  type Coupon 
} from '@/hooks/useCoupons';
import {
  Search,
  Bell,
  Sun,
  Moon,
  PlusSquare,
  Loader2,
  X,
  MoreVertical,
  Pencil,
  Trash,
  Tag,
  Calendar,
  Users,
  ShoppingBag,
  Percent,
  DollarSign,
  Truck,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  Clock,
} from 'lucide-react';

// Type Definitions
type DiscountType = 'percentage' | 'fixed' | 'free_shipping';
type AppliesToType = 'all' | 'categories' | 'products' | 'brands';
type MessageType = { type: 'success' | 'error'; text: string } | null;

// Helper Functions
const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

const formatDate = (date: string | null) => 
  date ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No expiry';

const isExpired = (endDate: string | null) => endDate ? new Date(endDate) < new Date() : false;

// Helper to resolve avatar URL
const resolveAvatar = (pathOrUrl: string | null | undefined): string => {
  if (!pathOrUrl) return '/man.png';
  
  const raw = String(pathOrUrl).trim();
  
  // If it's already a full URL, return as is
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  
  // Extract just the filename
  const filename = raw.split('/').pop() || raw;
  
  // Return the correct storage path
  return `https://admin.bezalelsolar.com/storage/avatars/${filename}`;
};

// Main Page Component
export default function CouponsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth(); // Add this
  const [mounted, setMounted] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // React Query
  const { data: coupons = [], isLoading, error } = useCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();
  const toggleStatus = useToggleCouponStatus();

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [message, setMessage] = useState<MessageType>(null);

  // Get avatar URL
  const avatarUrl = user?.avatar_url || user?.avatar 
    ? resolveAvatar(user.avatar_url || user.avatar) 
    : '/man.png';

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src === '/man.png') return;
    img.src = '/man.png';
  };

  // Filter coupons based on search and filter type
  const filteredCoupons = coupons.filter((c: Coupon) => {
    const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (filterType === 'all') return true;
    if (filterType === 'active') return c.is_active && !isExpired(c.end_date);
    if (filterType === 'inactive') return !c.is_active;
    if (filterType === 'expired') return isExpired(c.end_date);
    if (filterType === 'percentage') return c.discount_type === 'percentage';
    if (filterType === 'fixed') return c.discount_type === 'fixed';
    if (filterType === 'free_shipping') return c.discount_type === 'free_shipping';
    return true;
  });

  // Auto-dismiss toast
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Mount
  useEffect(() => setMounted(true), []);

  if (!mounted) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Coupon Code</h1>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            className="p-2 md:hidden hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Toggle search"
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm w-64 lg:w-96 focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            />
          </div>

          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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

          {/* Dynamic Avatar */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600">
            <img
              src={avatarUrl}
              alt="Admin"
              className="object-cover w-full h-full"
              onError={handleImageError}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-gray-50 dark:bg-gray-950 lg:pl-72">
        {message && <Toast message={message} onClose={() => setMessage(null)} />}
        {error && <ErrorBanner />}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Coupons</h2>
          <button
            onClick={() => { setSelectedCoupon(null); setShowCreateModal(true); }}
            className="px-4 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#3D8B59]"
          >
            <PlusSquare className="w-4 h-4" /> Add Coupon
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'active', 'inactive', 'expired', 'percentage', 'fixed', 'free_shipping'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition ${
                filterType === f
                  ? 'bg-[#4EA674] text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!isLoading && filteredCoupons.map((coupon: Coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              onEdit={() => { setSelectedCoupon(coupon); setShowEditModal(true); }}
              onDelete={() => { setSelectedCoupon(coupon); setShowDeleteModal(true); }}
              onToggleStatus={async () => {
                await toggleStatus.mutateAsync({ id: coupon.id, is_active: !coupon.is_active });
                setMessage({ type: 'success', text: `Coupon ${coupon.is_active ? 'deactivated' : 'activated'} successfully` });
              }}
            />
          ))}
          
          {isLoading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          
          {!isLoading && filteredCoupons.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              {searchQuery || filterType !== 'all' ? 'No coupons match your filters' : 'No coupons yet.'}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <CouponModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (data: FormData) => {
          await createCoupon.mutateAsync(data);
          setMessage({ type: 'success', text: 'Coupon created successfully' });
        }}
        title="Create Coupon"
        isPending={createCoupon.isPending}
      />

      <CouponModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedCoupon(null); }}
        onSubmit={async (data: FormData) => {
          if (!selectedCoupon) return;
          await updateCoupon.mutateAsync({ id: selectedCoupon.id, data });
          setMessage({ type: 'success', text: 'Coupon updated successfully' });
        }}
        initialData={selectedCoupon}
        title="Edit Coupon"
        isPending={updateCoupon.isPending}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedCoupon(null); }}
        onConfirm={async () => {
          if (!selectedCoupon) return;
          await deleteCoupon.mutateAsync(selectedCoupon.id);
          setMessage({ type: 'success', text: 'Coupon deleted successfully' });
          setShowDeleteModal(false);
          setSelectedCoupon(null);
        }}
        itemName={selectedCoupon?.code || ''}
        isPending={deleteCoupon.isPending}
      />
    </div>
  );
}

// Helper Components with proper typing

// Loading Screen
const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-[#4EA674]" />
  </div>
);

// Toast Component
interface ToastProps {
  message: { type: 'success' | 'error'; text: string };
  onClose: () => void;
}

const Toast = ({ message, onClose }: ToastProps) => (
  <div className={`mb-6 rounded-xl px-4 py-3 text-sm border flex justify-between items-center ${
    message.type === 'success'
      ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300'
      : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300'
  }`}>
    <span>{message.text}</span>
    <button onClick={onClose} className="p-1"><X className="w-4 h-4" /></button>
  </div>
);

// Error Banner
const ErrorBanner = () => (
  <div className="mb-6 rounded-xl px-4 py-3 text-sm border bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
    Failed to load coupons. Please refresh the page.
  </div>
);

// Coupon Card Component
interface CouponCardProps {
  coupon: Coupon;
  onEdit: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
  onToggleStatus: () => Promise<void>;
}

const CouponCard = ({ coupon, onEdit, onDelete, onToggleStatus }: CouponCardProps) => {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);
  const expired = isExpired(coupon.end_date);

  const getDiscountDisplay = () => {
    if (coupon.discount_type === 'percentage') return `${coupon.discount_value}% OFF`;
    if (coupon.discount_type === 'fixed') return formatCurrency(coupon.discount_value) + ' OFF';
    return 'Free Shipping';
  };

  const getTypeIcon = () => {
    switch (coupon.discount_type) {
      case 'percentage': return <Percent className="w-3 h-3" />;
      case 'fixed': return <DollarSign className="w-3 h-3" />;
      case 'free_shipping': return <Truck className="w-3 h-3" />;
      default: return <Tag className="w-3 h-3" />;
    }
  };

  const getTypeColor = () => {
    switch (coupon.discount_type) {
      case 'percentage': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'fixed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'free_shipping': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border ${expired ? 'opacity-60' : ''} hover:shadow-md relative group`}>
      <div className="p-5">
        <div className="flex justify-between mb-3">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#4EA674]" />
            <span className="text-lg font-bold font-mono">{coupon.code}</span>
            <button onClick={() => { navigator.clipboard.writeText(coupon.code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
              {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
            </button>
          </div>
          
          <div className="relative">
            <button onClick={() => setShowActions(!showActions)} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="w-4 h-4" />
            </button>
            {showActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border z-20">
                  <button onClick={() => { onEdit(coupon); setShowActions(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100">
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => { onToggleStatus(); setShowActions(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100">
                    {coupon.is_active ? <><EyeOff className="w-4 h-4" /> Deactivate</> : <><Eye className="w-4 h-4" /> Activate</>}
                  </button>
                  <button onClick={() => { onDelete(coupon); setShowActions(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg">
                    <Trash className="w-4 h-4" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <span className="text-2xl font-bold text-[#4EA674] block mb-3">{getDiscountDisplay()}</span>
        {coupon.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{coupon.description}</p>}

        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          {coupon.minimum_order_amount && <div>Min: {formatCurrency(coupon.minimum_order_amount)}</div>}
          {coupon.maximum_discount_amount && coupon.discount_type === 'percentage' && 
            <div>Max: {formatCurrency(coupon.maximum_discount_amount)}</div>}
        </div>

        <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
          <div className="flex items-center gap-1"><Users className="w-3 h-3" /> Used {coupon.usage_count}</div>
          {coupon.usage_limit && <div className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> Limit {coupon.usage_limit}</div>}
        </div>

        <div className="flex items-center gap-2 mb-3 text-xs">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span>{formatDate(coupon.start_date)} → {formatDate(coupon.end_date)}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor()}`}>
            {getTypeIcon()} {coupon.discount_type}
          </span>
          {expired ? (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100"><Clock className="w-3 h-3" /> Expired</span>
          ) : coupon.is_active ? (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle className="w-3 h-3" /> Active</span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><EyeOff className="w-3 h-3" /> Inactive</span>
          )}
          {!coupon.is_public && <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Private</span>}
        </div>
      </div>
    </div>
  );
};

// Skeleton Card for Loading
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-5 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
    <div className="h-8 bg-gray-200 rounded w-1/2 mb-3" />
    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
    <div className="flex gap-2"><div className="h-6 w-16 bg-gray-200 rounded" /><div className="h-6 w-16 bg-gray-200 rounded" /></div>
  </div>
);

// Coupon Modal Component
interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Coupon | null;
  title: string;
  isPending: boolean;
}

const CouponModal = ({ isOpen, onClose, onSubmit, initialData, title, isPending }: CouponModalProps) => {
  const [code, setCode] = useState(initialData?.code || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [discountType, setDiscountType] = useState<DiscountType>(initialData?.discount_type as DiscountType || 'percentage');
  const [discountValue, setDiscountValue] = useState(initialData?.discount_value?.toString() || '');
  const [minimumOrder, setMinimumOrder] = useState(initialData?.minimum_order_amount?.toString() || '');
  const [maximumDiscount, setMaximumDiscount] = useState(initialData?.maximum_discount_amount?.toString() || '');
  const [usageLimit, setUsageLimit] = useState(initialData?.usage_limit?.toString() || '');
  const [perUserLimit, setPerUserLimit] = useState(initialData?.per_user_limit?.toString() || '');
  const [startDate, setStartDate] = useState(initialData?.start_date?.split('T')[0] || '');
  const [endDate, setEndDate] = useState(initialData?.end_date?.split('T')[0] || '');
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? true);
  const [appliesTo, setAppliesTo] = useState<AppliesToType>(initialData?.applies_to as AppliesToType || 'all');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCode(initialData?.code || '');
      setDescription(initialData?.description || '');
      setDiscountType(initialData?.discount_type as DiscountType || 'percentage');
      setDiscountValue(initialData?.discount_value?.toString() || '');
      setMinimumOrder(initialData?.minimum_order_amount?.toString() || '');
      setMaximumDiscount(initialData?.maximum_discount_amount?.toString() || '');
      setUsageLimit(initialData?.usage_limit?.toString() || '');
      setPerUserLimit(initialData?.per_user_limit?.toString() || '');
      setStartDate(initialData?.start_date?.split('T')[0] || '');
      setEndDate(initialData?.end_date?.split('T')[0] || '');
      setIsActive(initialData?.is_active ?? true);
      setIsPublic(initialData?.is_public ?? true);
      setAppliesTo(initialData?.applies_to as AppliesToType || 'all');
      setError('');
    }
  }, [isOpen, initialData]);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    setCode(Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''));
  };

  const handleSubmit = async () => {
    if (!code.trim()) { setError('Code required'); return; }
    if (discountType !== 'free_shipping' && !discountValue) { setError('Discount value required'); return; }
    
    const formData = new FormData();
    formData.append('code', code.toUpperCase());
    if (description) formData.append('description', description);
    formData.append('discount_type', discountType);
    if (discountType !== 'free_shipping' && discountValue) formData.append('discount_value', discountValue);
    if (minimumOrder) formData.append('minimum_order_amount', minimumOrder);
    if (maximumDiscount && discountType === 'percentage') formData.append('maximum_discount_amount', maximumDiscount);
    if (usageLimit) formData.append('usage_limit', usageLimit);
    if (perUserLimit) formData.append('per_user_limit', perUserLimit);
    if (startDate) formData.append('start_date', startDate);
    if (endDate) formData.append('end_date', endDate);
    formData.append('is_active', String(isActive));
    formData.append('is_public', String(isPublic));
    formData.append('applies_to', appliesTo);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between mb-4 sticky top-0 bg-white dark:bg-gray-900 pb-2 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          {/* Code Input */}
          <div className="flex gap-2">
            <input 
              value={code} 
              onChange={(e) => setCode(e.target.value.toUpperCase())} 
              placeholder="Coupon code *" 
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono" 
              disabled={isPending} 
            />
            <button 
              onClick={generateCode} 
              className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Generate
            </button>
          </div>

          {/* Description */}
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Description" 
            rows={2} 
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" 
            disabled={isPending} 
          />

          {/* Discount Type and Value */}
          <div className="grid grid-cols-2 gap-4">
            <select 
              value={discountType} 
              onChange={(e) => setDiscountType(e.target.value as DiscountType)} 
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₦)</option>
              <option value="free_shipping">Free Shipping</option>
            </select>
            {discountType !== 'free_shipping' && (
              <input 
                type="number" 
                value={discountValue} 
                onChange={(e) => setDiscountValue(e.target.value)} 
                placeholder={discountType === 'percentage' ? 'Discount %' : 'Amount'} 
                className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" 
              />
            )}
          </div>

          {/* Minimum and Maximum */}
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="number" 
              value={minimumOrder} 
              onChange={(e) => setMinimumOrder(e.target.value)} 
              placeholder="Min Order (₦)" 
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" 
            />
            {discountType === 'percentage' && (
              <input 
                type="number" 
                value={maximumDiscount} 
                onChange={(e) => setMaximumDiscount(e.target.value)} 
                placeholder="Max Discount (₦)" 
                className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" 
              />
            )}
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="number" 
              value={usageLimit} 
              onChange={(e) => setUsageLimit(e.target.value)} 
              placeholder="Total Usage Limit" 
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" 
            />
            <input 
              type="number" 
              value={perUserLimit} 
              onChange={(e) => setPerUserLimit(e.target.value)} 
              placeholder="Per User Limit" 
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" 
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" 
            />
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" 
            />
          </div>

          {/* Applies To */}
          <select 
            value={appliesTo} 
            onChange={(e) => setAppliesTo(e.target.value as AppliesToType)} 
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <option value="all">All Products</option>
            <option value="categories">Specific Categories</option>
            <option value="products">Specific Products</option>
            <option value="brands">Specific Brands</option>
          </select>

          {/* Status Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input 
                type="checkbox" 
                checked={isActive} 
                onChange={(e) => setIsActive(e.target.checked)} 
                className="rounded border-gray-300 text-[#4EA674]" 
              /> Active
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input 
                type="checkbox" 
                checked={isPublic} 
                onChange={(e) => setIsPublic(e.target.checked)} 
                className="rounded border-gray-300 text-[#4EA674]" 
              /> Public
            </label>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={onClose} 
            disabled={isPending} 
            className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isPending} 
            className="px-6 py-2.5 rounded-xl bg-[#4EA674] text-white hover:bg-[#3D8B59] disabled:opacity-50 min-w-[100px] flex items-center justify-center"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (initialData ? 'Update' : 'Create')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Delete Modal Component
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  itemName: string;
  isPending: boolean;
}

const DeleteModal = ({ isOpen, onClose, onConfirm, itemName, isPending }: DeleteModalProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Delete Coupon</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete coupon "{itemName}"?</p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={isPending} 
            className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isPending} 
            className="px-6 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};