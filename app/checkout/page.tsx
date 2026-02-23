'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, Loader2,  X,  MapPin, Tag, Truck,  Shield,  CreditCard,Package,Home, Phone,Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

// ---------- React Query Hooks ----------
import { useCart } from '@/hooks/useCart';
import { useCheckout, useApplyCoupon, useLocations, useCalculateDelivery, useTaxRate } from '@/hooks/useCheckout';

const getSafeImageUrl = (image: string | null | undefined): string | null => {
  if (!image || typeof image !== 'string' || image.trim() === '') return null;
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  const cleanImage = image.startsWith('/') ? image.substring(1) : image;
  return `https://admin.bezalelsolar.com/storage/products/${cleanImage}`;
};
const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

const TrustBadges = () => (
  <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-200">
    <div className="text-center">
      <Truck className="w-5 h-5 text-[#4EA674] mx-auto mb-2" />
      <p className="text-xs text-gray-600">Free Shipping</p>
    </div>
    <div className="text-center">
      <Shield className="w-5 h-5 text-[#4EA674] mx-auto mb-2" />
      <p className="text-xs text-gray-600">Secure Payment</p>
    </div>
    <div className="text-center">
      <Package className="w-5 h-5 text-[#4EA674] mx-auto mb-2" />
      <p className="text-xs text-gray-600">Easy Returns</p>
    </div>
  </div>
);

export default function CheckoutPage() {
  const router = useRouter();

  // ---------- API Hooks ----------
  const { data: items = [], isLoading: cartLoading } = useCart();
  const { data: locations } = useLocations();
  const { data: taxData } = useTaxRate();
  const deliveryMutation = useCalculateDelivery();
  const checkoutMutation = useCheckout();
  const couponMutation = useApplyCoupon();

  // ---------- Form State ----------
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    lga: '',
    place: '',
    postalCode: '',
    deliveryInstructions: ''
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [taxRate, setTaxRate] = useState(0.075);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [selectedPayment, setSelectedPayment] = useState('card');

  // Debug locations data
  useEffect(() => {
    if (locations) {
      console.log(' Locations data:', locations);
    }
  }, [locations]);

  // ---------- Load Tax Rate from API ----------
  useEffect(() => {
    if (taxData?.percentage) {
      setTaxRate(taxData.percentage / 100);
    }
  }, [taxData]);

  // ---------- Calculate Delivery Fee when location changes ----------
  useEffect(() => {
    const fetchDeliveryFee = async () => {
      if (formData.state && formData.lga && formData.place) {
        try {
          const result = await deliveryMutation.mutateAsync({
            state_name: formData.state,
            lga_name: formData.lga,
            places: formData.place,  
            fee: 0
          });
          
          // API returns data wrapped in a data object
          setDeliveryFee(Number(result.data?.fee) || 0);
        } catch (error) {
          console.error('Failed to fetch delivery fee:', error);
          setDeliveryFee(0);
        }
      }
    };
    
    fetchDeliveryFee();
  }, [formData.state, formData.lga, formData.place]);

  // ---------- Calculate Totals ----------
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryFee + tax - discount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageError = (itemId: number) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const result = await couponMutation.mutateAsync(couponCode);
      setAppliedCoupon({ code: couponCode, discount: result.discount || 0 });
      setCouponCode('');
    } catch (error) {
      toast.error('Invalid coupon code');
    }
  };

  const handlePlaceOrder = async () => {
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'lga', 'place'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]?.trim());
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const fullAddress = `${formData.address}, ${formData.city}, ${formData.state}, ${formData.lga}, ${formData.place}${formData.postalCode ? ', ' + formData.postalCode : ''}`;

    const payload = {
      customer_name: formData.fullName,
      customer_email: formData.email,
      customer_phone: formData.phone,
      shipping_address: fullAddress,
      delivery_fee: deliveryFee,
      coupon_code: appliedCoupon?.code || null,
      tax_rate: taxRate * 100 // API expects percentage
    };

    checkoutMutation.mutate(payload);
  };

  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      router.push('/cart');
    }
  }, [cartLoading, items, router]);

  useEffect(() => {
    if (checkoutMutation.isSuccess && checkoutMutation.data?.order?.order_reference) {
      router.push(`/order-confirmation/${checkoutMutation.data.order.order_reference}`);
    }
  }, [checkoutMutation.isSuccess, checkoutMutation.data, router]);

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EAF8E7] to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-[#4EA674] mx-auto mb-4" />
          <p className="text-gray-600">Loading your checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF8E7] to-white">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-8 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-[#4EA674] flex items-center gap-1">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/cart" className="hover:text-[#4EA674]">Cart</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#4EA674] font-medium">Checkout</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Complete Your Order</h1>
          <p className="text-gray-600">You're just a few steps away from completing your purchase</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-10 max-w-2xl">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#4EA674] rounded-full flex items-center justify-center text-white font-bold">1</div>
            <span className="ml-2 font-medium text-gray-900">Cart</span>
          </div>
          <div className="flex-1 h-0.5 bg-[#4EA674] mx-4"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#4EA674] rounded-full flex items-center justify-center text-white font-bold">2</div>
            <span className="ml-2 font-medium text-gray-900">Checkout</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">3</div>
            <span className="ml-2 text-gray-500">Confirmation</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ---------- Left Column: Forms ---------- */}
          <div className="flex-1 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-[#EAF8E7] rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-[#4EA674]" />
                </div>
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 focus:border-[#4EA674] transition"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 focus:border-[#4EA674] transition"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 focus:border-[#4EA674] transition"
                    placeholder="+234 800 000 0000"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-[#EAF8E7] rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#4EA674]" />
                </div>
                Shipping Address
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 focus:border-[#4EA674] transition"
                    placeholder="123 Main Street"
                  />
                </div>
                
                {/* State and LGA Dropdowns */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 focus:border-[#4EA674] transition"
                    >
                      <option value="">Select State</option>
                      {locations?.states && Array.isArray(locations.states) ? (
                        locations.states.map((stateItem: any, index: number) => {
                          const stateName = stateItem?.state_name || '';
                          return stateName ? (
                            <option key={`state-${index}-${stateName}`} value={stateName}>
                              {stateName}
                            </option>
                          ) : null;
                        })
                      ) : null}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LGA <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="lga"
                      value={formData.lga}
                      onChange={handleInputChange}
                      disabled={!formData.state}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 focus:border-[#4EA674] transition disabled:opacity-50"
                    >
                      <option value="">Select LGA</option>
                      {formData.state && locations?.states && Array.isArray(locations.states) ? (
                        (() => {
                          const selectedState = locations.states.find(
                            (s: any) => s?.state_name === formData.state
                          );
                          const lgas = selectedState?.lgas || [];
                          return lgas.map((lgaItem: any, index: number) => {
                            const lgaName = lgaItem?.lga_name || '';
                            return lgaName ? (
                              <option key={`lga-${index}-${lgaName}`} value={lgaName}>
                                {lgaName}
                              </option>
                            ) : null;
                          });
                        })()
                      ) : null}
                    </select>
                  </div>
                </div>

                {/* Places Dropdown */}
                {formData.lga && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Location/Place <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="place"
                      value={formData.place}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 focus:border-[#4EA674] transition"
                    >
                      <option value="">Select Place</option>
                      {(() => {
                        const selectedState = locations?.states?.find(
                          (s: any) => s?.state_name === formData.state
                        );
                        const selectedLGA = selectedState?.lgas?.find(
                          (l: any) => l?.lga_name === formData.lga
                        );
                        const places = selectedLGA?.places || [];
                        
                        return places.map((place: string, index: number) => (
                          <option key={`place-${index}-${place}`} value={place}>
                            {place}
                          </option>
                        ));
                      })()}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 focus:border-[#4EA674] transition"
                      placeholder="Lagos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 focus:border-[#4EA674] transition"
                      placeholder="100001"
                    />
                  </div>
                </div>

                {/* Delivery Fee Display */}
                {deliveryFee > 0 && (
                  <div className="bg-[#EAF8E7] p-3 rounded-xl flex items-center justify-between">
                    <span className="text-sm text-gray-700">Delivery Fee:</span>
                    <span className="font-bold text-[#4EA674]">{formatCurrency(deliveryFee)}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    name="deliveryInstructions"
                    value={formData.deliveryInstructions}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 focus:border-[#4EA674] transition"
                    placeholder="Gate code, landmark, etc."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-[#EAF8E7] rounded-full flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-[#4EA674]" />
                </div>
                Payment Method
              </h2>
              <div className="space-y-3">
                {['card', 'bank_transfer', 'pay_on_delivery'].map((method) => (
                  <label
                    key={method}
                    className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition ${
                      selectedPayment === method
                        ? 'border-[#4EA674] bg-[#EAF8E7]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value={method}
                        checked={selectedPayment === method}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="w-4 h-4 text-[#4EA674] focus:ring-[#4EA674]"
                      />
                      <span className="font-medium text-gray-900">
                        {method === 'card' && 'Credit / Debit Card'}
                        {method === 'bank_transfer' && 'Bank Transfer'}
                        {method === 'pay_on_delivery' && 'Pay on Delivery'}
                      </span>
                    </div>
                    {method === 'pay_on_delivery' && (
                      <span className="text-xs text-gray-500">+ ₦1,000 fee</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ---------- Right Column: Order Summary ---------- */}
          <div className="lg:w-96">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Your Order</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                {items.map((item) => {
                  const safeImageUrl = getSafeImageUrl(item.image);
                  const hasImageError = imageErrors[item.id];
                  const showFallback = !safeImageUrl || hasImageError;
                  
                  return (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        {!showFallback ? (
                          <Image
                            src={safeImageUrl!}
                            alt={item.name || 'Product'}
                            fill
                            className="object-cover rounded-lg"
                            onError={() => handleImageError(item.id)}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-xl font-bold text-gray-400">
                              {item.name?.charAt(0).toUpperCase() || 'P'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-2">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-bold text-[#4EA674]">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Have a coupon?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    disabled={couponMutation.isPending || !!appliedCoupon}
                  />
                  {!appliedCoupon ? (
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponMutation.isPending || !couponCode.trim()}
                      className="px-6 py-3 bg-[#4EA674] text-white rounded-xl font-medium hover:bg-[#3D8B59] transition disabled:opacity-50"
                    >
                      {couponMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => setAppliedCoupon(null)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    Coupon applied: -{formatCurrency(appliedCoupon.discount)}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">
                    {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Discount</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({(taxRate * 100).toFixed(1)}%)</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(tax)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-black text-2xl text-[#4EA674]">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={checkoutMutation.isPending || !formData.state || !formData.lga || !formData.place}
                className="w-full py-4 bg-[#4EA674] text-white rounded-xl font-bold text-lg hover:bg-[#3D8B59] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {checkoutMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Place Order'
                )}
              </button>

              <TrustBadges />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}