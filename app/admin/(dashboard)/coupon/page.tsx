// app/admin/(dashboard)/coupon/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
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
  Edit2,
  Trash2,
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

// Define types
type DiscountType = 'percentage' | 'fixed' | 'free_shipping';
type AppliesToType = 'all' | 'categories' | 'products' | 'brands';

// ---------- Format Currency ----------
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// ---------- Format Date ----------
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'No expiry';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// ---------- Check if coupon is expired ----------
const isCouponExpired = (endDate: string | null) => {
  if (!endDate) return false;
  return new Date(endDate) < new Date();
};

// ---------- Discount Type Badge ----------
const DiscountTypeBadge = ({ type }: { type: DiscountType }) => {
  const getIcon = () => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-3 h-3" />;
      case 'fixed':
        return <DollarSign className="w-3 h-3" />;
      case 'free_shipping':
        return <Truck className="w-3 h-3" />;
      default:
        return <Tag className="w-3 h-3" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'percentage':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'fixed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'free_shipping':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'percentage':
        return 'Percentage';
      case 'fixed':
        return 'Fixed Amount';
      case 'free_shipping':
        return 'Free Shipping';
      default:
        return type;
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getColor()}`}>
      {getIcon()}
      {getLabel()}
    </span>
  );
};

// ---------- Status Badge ----------
const StatusBadge = ({ isActive, isExpired }: { isActive: boolean; isExpired: boolean }) => {
  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
        <Clock className="w-3 h-3" />
        Expired
      </span>
    );
  }
  
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
        <CheckCircle className="w-3 h-3" />
        Active
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
      <EyeOff className="w-3 h-3" />
      Inactive
    </span>
  );
};

// ---------- Coupon Card Component ----------
interface CouponCardProps {
  coupon: Coupon;
  onEdit: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
  onToggleStatus: (coupon: Coupon) => void;
}

const CouponCard = ({ coupon, onEdit, onDelete, onToggleStatus }: CouponCardProps) => {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);
  const expired = isCouponExpired(coupon.end_date);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDiscountDisplay = () => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% OFF`;
    } else if (coupon.discount_type === 'fixed') {
      return formatCurrency(coupon.discount_value) + ' OFF';
    } else {
      return 'Free Shipping';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border ${expired ? 'border-gray-200 dark:border-gray-700 opacity-60' : 'border-gray-200 dark:border-gray-700'} hover:shadow-md transition-all relative group`}>
      <div className="p-5">
        {/* Header with Code and Actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#4EA674]" />
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white font-mono">
                {coupon.code}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Copy code"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            
            {showActions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20">
                  <button
                    onClick={() => {
                      onEdit(coupon);
                      setShowActions(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onToggleStatus(coupon);
                      setShowActions(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {coupon.is_active ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Activate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      onDelete(coupon);
                      setShowActions(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                  >
                    <Trash className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Discount Value */}
        <div className="mb-3">
          <span className="text-2xl font-bold text-[#4EA674]">
            {getDiscountDisplay()}
          </span>
        </div>

        {/* Description */}
        {coupon.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {coupon.description}
          </p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          {coupon.minimum_order_amount && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">Min. Order:</span>
              <span className="ml-1 text-gray-900 dark:text-white font-medium">
                {formatCurrency(coupon.minimum_order_amount)}
              </span>
            </div>
          )}
          {coupon.maximum_discount_amount && coupon.discount_type === 'percentage' && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">Max Discount:</span>
              <span className="ml-1 text-gray-900 dark:text-white font-medium">
                {formatCurrency(coupon.maximum_discount_amount)}
              </span>
            </div>
          )}
        </div>

        {/* Usage Info */}
        <div className="flex items-center gap-3 mb-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>Used {coupon.usage_count} times</span>
          </div>
          {coupon.usage_limit && (
            <div className="flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" />
              <span>Limit: {coupon.usage_limit}</span>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2 mb-3 text-xs">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">
            {coupon.start_date ? `From ${formatDate(coupon.start_date)}` : 'No start date'}
          </span>
          <span className="text-gray-400">→</span>
          <span className="text-gray-600 dark:text-gray-400">
            {coupon.end_date ? formatDate(coupon.end_date) : 'No expiry'}
          </span>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <DiscountTypeBadge type={coupon.discount_type as DiscountType} />
          <StatusBadge isActive={coupon.is_active} isExpired={expired} />
          {!coupon.is_public && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
              Private
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- Coupon Modal Component ----------
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
  const [discountType, setDiscountType] = useState<DiscountType>(
    (initialData?.discount_type as DiscountType) || 'percentage'
  );
  const [discountValue, setDiscountValue] = useState(initialData?.discount_value?.toString() || '');
  const [minimumOrder, setMinimumOrder] = useState(initialData?.minimum_order_amount?.toString() || '');
  const [maximumDiscount, setMaximumDiscount] = useState(initialData?.maximum_discount_amount?.toString() || '');
  const [usageLimit, setUsageLimit] = useState(initialData?.usage_limit?.toString() || '');
  const [perUserLimit, setPerUserLimit] = useState(initialData?.per_user_limit?.toString() || '');
  const [startDate, setStartDate] = useState(initialData?.start_date?.split('T')[0] || '');
  const [endDate, setEndDate] = useState(initialData?.end_date?.split('T')[0] || '');
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? true);
  const [appliesTo, setAppliesTo] = useState<AppliesToType>(
    (initialData?.applies_to as AppliesToType) || 'all'
  );
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      setCode(initialData?.code || '');
      setDescription(initialData?.description || '');
      setDiscountType((initialData?.discount_type as DiscountType) || 'percentage');
      setDiscountValue(initialData?.discount_value?.toString() || '');
      setMinimumOrder(initialData?.minimum_order_amount?.toString() || '');
      setMaximumDiscount(initialData?.maximum_discount_amount?.toString() || '');
      setUsageLimit(initialData?.usage_limit?.toString() || '');
      setPerUserLimit(initialData?.per_user_limit?.toString() || '');
      setStartDate(initialData?.start_date?.split('T')[0] || '');
      setEndDate(initialData?.end_date?.split('T')[0] || '');
      setIsActive(initialData?.is_active ?? true);
      setIsPublic(initialData?.is_public ?? true);
      setAppliesTo((initialData?.applies_to as AppliesToType) || 'all');
      setError(null);
    }
  }, [isOpen, initialData]);

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('Coupon code is required');
      return;
    }

    if (discountType !== 'free_shipping' && !discountValue) {
      setError('Discount value is required');
      return;
    }

    const formData = new FormData();
    formData.append('code', code.trim().toUpperCase());
    
    if (description.trim()) {
      formData.append('description', description.trim());
    }
    
    formData.append('discount_type', discountType);
    
    if (discountType !== 'free_shipping' && discountValue) {
      formData.append('discount_value', discountValue);
    }
    
    if (minimumOrder) {
      formData.append('minimum_order_amount', minimumOrder);
    }
    
    if (maximumDiscount && discountType === 'percentage') {
      formData.append('maximum_discount_amount', maximumDiscount);
    }
    
    if (usageLimit) {
      formData.append('usage_limit', usageLimit);
    }
    
    if (perUserLimit) {
      formData.append('per_user_limit', perUserLimit);
    }
    
    if (startDate) {
      formData.append('start_date', startDate);
    }
    
    if (endDate) {
      formData.append('end_date', endDate);
    }
    
    formData.append('is_active', String(isActive));
    formData.append('is_public', String(isPublic));
    formData.append('applies_to', appliesTo);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save coupon');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-gray-900 pb-2 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Coupon Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Coupon Code *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SUMMER2024"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 font-mono uppercase"
                disabled={isPending}
              />
              <button
                type="button"
                onClick={generateRandomCode}
                className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Generate
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Coupon description..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 resize-none"
              disabled={isPending}
            />
          </div>

          {/* Discount Type and Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Discount Type *
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                disabled={isPending}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₦)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>

            {discountType !== 'free_shipping' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {discountType === 'percentage' ? 'Discount % *' : 'Discount Amount (₦) *'}
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'percentage' ? 'e.g. 20' : 'e.g. 5000'}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                  disabled={isPending}
                  min="0"
                  step={discountType === 'percentage' ? '1' : '100'}
                />
              </div>
            )}
          </div>

          {/* Minimum and Maximum */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Order (₦)
              </label>
              <input
                type="number"
                value={minimumOrder}
                onChange={(e) => setMinimumOrder(e.target.value)}
                placeholder="Optional"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                disabled={isPending}
                min="0"
                step="100"
              />
            </div>

            {discountType === 'percentage' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Discount (₦)
                </label>
                <input
                  type="number"
                  value={maximumDiscount}
                  onChange={(e) => setMaximumDiscount(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                  disabled={isPending}
                  min="0"
                  step="100"
                />
              </div>
            )}
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Usage Limit
              </label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Unlimited"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                disabled={isPending}
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Per User Limit
              </label>
              <input
                type="number"
                value={perUserLimit}
                onChange={(e) => setPerUserLimit(e.target.value)}
                placeholder="Unlimited"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                disabled={isPending}
                min="1"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                disabled={isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Applies To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Applies To
            </label>
            <select
              value={appliesTo}
              onChange={(e) => setAppliesTo(e.target.value as AppliesToType)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
              disabled={isPending}
            >
              <option value="all">All Products</option>
              <option value="categories">Specific Categories</option>
              <option value="products">Specific Products</option>
              <option value="brands">Specific Brands</option>
            </select>
          </div>

          {/* Status Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#4EA674] focus:ring-[#4EA674]"
                disabled={isPending}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#4EA674] focus:ring-[#4EA674]"
                disabled={isPending}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Public (visible to all customers)</span>
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 sticky bottom-0 bg-white dark:bg-gray-900 pt-2 border-t border-gray-200 dark:border-gray-700">
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
            className="px-6 py-2.5 rounded-xl bg-[#4EA674] text-white hover:bg-[#3D8B59] disabled:opacity-50 flex items-center gap-2 min-w-[100px] justify-center"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              initialData ? 'Update' : 'Create'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Delete Confirmation Modal ----------
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  couponCode: string;
  isPending: boolean;
}

const DeleteModal = ({ isOpen, onClose, onConfirm, couponCode, isPending }: DeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Delete Coupon</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete coupon "{couponCode}"? This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
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

// ---------- Main Page ----------
export default function CouponsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // React Query
  const {
    data: coupons = [],
    isLoading: couponsLoading,
    error: couponsError,
  } = useCoupons();

  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();
  const toggleStatus = useToggleCouponStatus();

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  // Toast Message
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter coupons
  const filteredCoupons = coupons.filter((coupon) => {
    // Search filter
    const matchesSearch = 
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (coupon.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // Type filter
    if (filterType === 'all') return true;
    if (filterType === 'active') return coupon.is_active && !isCouponExpired(coupon.end_date);
    if (filterType === 'inactive') return !coupon.is_active;
    if (filterType === 'expired') return isCouponExpired(coupon.end_date);
    if (filterType === 'percentage') return coupon.discount_type === 'percentage';
    if (filterType === 'fixed') return coupon.discount_type === 'fixed';
    if (filterType === 'free_shipping') return coupon.discount_type === 'free_shipping';
    
    return true;
  });

  // Auto-dismiss Toast
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handlers
  const handleCreateCoupon = async (formData: FormData) => {
    try {
      const result = await createCoupon.mutateAsync(formData);
      setMessage({ type: 'success', text: result?.message || 'Coupon created successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to create coupon' });
      throw error;
    }
  };

  const handleUpdateCoupon = async (formData: FormData) => {
    if (!selectedCoupon) return;
    try {
      const result = await updateCoupon.mutateAsync({ 
        id: selectedCoupon.id, 
        data: formData 
      });
      setMessage({ type: 'success', text: result?.message || 'Coupon updated successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to update coupon' });
      throw error;
    }
  };

  const handleDeleteCoupon = async () => {
    if (!selectedCoupon) return;
    try {
      const result = await deleteCoupon.mutateAsync(selectedCoupon.id);
      setMessage({ type: 'success', text: result?.message || 'Coupon deleted successfully' });
      setShowDeleteModal(false);
      setSelectedCoupon(null);
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to delete coupon' });
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const result = await toggleStatus.mutateAsync({ 
        id: coupon.id, 
        is_active: !coupon.is_active 
      });
      setMessage({ type: 'success', text: result?.message || `Coupon ${coupon.is_active ? 'deactivated' : 'activated'} successfully` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to toggle coupon status' });
    }
  };

  // Loading States
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4EA674]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between shadow-sm lg:pl-72">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Coupon Codes
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coupons..."
              className="pl-12 pr-6 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm w-64 lg:w-96 focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            />
          </div>

          {/* Notification Bell */}
          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative"
            aria-label="Toggle dark mode"
          >
            <Sun
              className={`h-5 w-5 text-yellow-500 transition-all duration-300 ${
                theme === 'dark' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
              }`}
            />
            <Moon
              className={`absolute inset-0 m-auto h-5 w-5 text-blue-400 transition-all duration-300 ${
                theme === 'dark' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
            />
          </button>

          {/* Admin Avatar */}
          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600 hidden sm:block">
            <Image
              src="/man.png"
              alt="Admin"
              width={36}
              height={36}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-gray-50 dark:bg-gray-950 lg:pl-72">
        {/* Toast Message */}
        {message && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm border flex justify-between items-center ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300'
                : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300'
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {couponsError && (
          <div className="mb-6 rounded-xl px-4 py-3 text-sm border bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
            Failed to load coupons. Please refresh the page.
          </div>
        )}

        {/* Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Coupons</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedCoupon(null);
                setShowCreateModal(true);
              }}
              className="px-4 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#3D8B59] transition-colors"
            >
              <PlusSquare className="w-4 h-4" /> Add Coupon
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filterType === 'all'
                ? 'bg-[#4EA674] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('active')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filterType === 'active'
                ? 'bg-[#4EA674] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterType('inactive')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filterType === 'inactive'
                ? 'bg-[#4EA674] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Inactive
          </button>
          <button
            onClick={() => setFilterType('expired')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filterType === 'expired'
                ? 'bg-[#4EA674] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Expired
          </button>
          <button
            onClick={() => setFilterType('percentage')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filterType === 'percentage'
                ? 'bg-[#4EA674] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Percentage
          </button>
          <button
            onClick={() => setFilterType('fixed')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filterType === 'fixed'
                ? 'bg-[#4EA674] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Fixed Amount
          </button>
          <button
            onClick={() => setFilterType('free_shipping')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filterType === 'free_shipping'
                ? 'bg-[#4EA674] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Free Shipping
          </button>
        </div>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!couponsLoading &&
            filteredCoupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onEdit={() => {
                  setSelectedCoupon(coupon);
                  setShowEditModal(true);
                }}
                onDelete={() => {
                  setSelectedCoupon(coupon);
                  setShowDeleteModal(true);
                }}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          
          {couponsLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 animate-pulse"
              >
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            ))}
          
          {!couponsLoading && filteredCoupons.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              {searchQuery || filterType !== 'all' 
                ? 'No coupons match your filters' 
                : 'No coupons yet. Create your first coupon!'}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <CouponModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCoupon}
        title="Create Coupon"
        isPending={createCoupon.isPending}
      />

      <CouponModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCoupon(null);
        }}
        onSubmit={handleUpdateCoupon}
        initialData={selectedCoupon}
        title="Edit Coupon"
        isPending={updateCoupon.isPending}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCoupon(null);
        }}
        onConfirm={handleDeleteCoupon}
        couponCode={selectedCoupon?.code || ''}
        isPending={deleteCoupon.isPending}
      />
    </div>
  );
}