'use client';

import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  MapPin,
  Search,
  User,
  Heart,
  ShoppingCart,
  ChevronRight,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from '@tanstack/react-query';
import { customerApi } from "@/lib/customerApiClient";
import { getCart, calcCartSummary, onCartUpdated } from "@/lib/cart";
import { useAuth } from "@/contexts/AuthContext";

export default function PublicHeader() {
  const { user, logout: authLogout, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [addressMenuOpen, setAddressMenuOpen] = useState(false);
  const addressMenuRef = useRef<HTMLDivElement | null>(null);

  // cart UI
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  // wishlist count
  const [wishlistCount, setWishlistCount] = useState(0);

  // selected address
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  // search
  const [searchQuery, setSearchQuery] = useState('');

  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const nextParam = encodeURIComponent(pathname || "/");

  // Load saved address from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedAddress');
      if (saved) {
        try {
          setSelectedAddress(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse saved address:', e);
        }
      }
    }
  }, []);

  // Mock addresses - replace with actual user.addresses when API provides it
  const savedAddresses = [
    {
      id: 1,
      label: 'Home',
      address: '123 Main Street',
      city: 'Lagos',
      lga: 'Ikeja',
      state: 'Lagos',
      full: '123 Main Street, Ikeja, Lagos'
    },
    {
      id: 2,
      label: 'Office',
      address: '45 Marina Road',
      city: 'Lagos',
      lga: 'Lagos Island',
      state: 'Lagos',
      full: '45 Marina Road, Lagos Island, Lagos'
    }
  ];

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery('');
      }
    }
  };

  // Format display address
  const getDisplayAddress = () => {
    if (!user) return "Deliver to Your address";
    if (selectedAddress) {
      const parts = [];
      if (selectedAddress.city) parts.push(selectedAddress.city);
      if (selectedAddress.lga) parts.push(selectedAddress.lga);
      if (selectedAddress.state) parts.push(selectedAddress.state);
      if (parts.length > 0) return `Deliver to ${parts.join(', ')}`;
      if (selectedAddress.address) {
        const short = selectedAddress.address.length > 30 
          ? selectedAddress.address.substring(0, 30) + '...' 
          : selectedAddress.address;
        return `Deliver to ${short}`;
      }
    }
    return "Deliver to Your address";
  };

  // Handle address selection
  const handleSelectAddress = (address: any) => {
    setSelectedAddress(address);
    localStorage.setItem('selectedAddress', JSON.stringify(address));
    setAddressMenuOpen(false);
  };

  // --- cart refresh ---
  const refreshCart = useCallback(async () => {
    try {
      const items = await getCart();
      const { count, total } = calcCartSummary(items);
      setCartCount(count);
      setCartTotal(total);
    } catch (err) {
      console.error("Failed to refresh cart:", err);
      setCartCount(0);
      setCartTotal(0);
    }
  }, []);

  // --- wishlist refresh ---
  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlistCount(0);
      return;
    }
    
    try {
      const response = await customerApi.wishlist.list();
      if (Array.isArray(response)) {
        setWishlistCount(response.length);
      } else if (response?.data && Array.isArray(response.data)) {
        setWishlistCount(response.data.length);
      } else if (response?.wishlist && Array.isArray(response.wishlist)) {
        setWishlistCount(response.wishlist.length);
      } else if (response?.items && Array.isArray(response.items)) {
        setWishlistCount(response.items.length);
      } else {
        setWishlistCount(0);
      }
    } catch (err) {
      console.error("Failed to refresh wishlist:", err);
      setWishlistCount(0);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
    if (user) refreshWishlist();
    
    const off = onCartUpdated(() => refreshCart());
    
    // Refresh wishlist every 30 seconds if logged in
    const interval = setInterval(() => {
      if (user) refreshWishlist();
    }, 30000);
    
    return () => {
      off();
      clearInterval(interval);
    };
  }, [user, refreshCart, refreshWishlist]);

  // Listen for wishlist changes via React Query - FIXED with queueMicrotask
  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      // Check if the event is related to wishlist query
      if (event.query.queryKey?.[0] === 'customer' && event.query.queryKey?.[1] === 'wishlist') {
        // Use queueMicrotask to defer state update until after render
        queueMicrotask(() => {
          if (isMounted) {
            refreshWishlist();
          }
        });
      }
    });
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [queryClient, refreshWishlist]);

  // close user menu when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // close address menu when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!addressMenuRef.current) return;
      if (!addressMenuRef.current.contains(e.target as Node)) setAddressMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Refresh user profile when component mounts (optional)
  useEffect(() => {
    if (user) {
      refreshUser(); // Get latest user data
    }
  }, [user, refreshUser]);

  // --- logout ---
  function logout() {
    customerApi.auth.logout();
    authLogout(); // Call auth context logout
    setUserMenuOpen(false);
    router.push(`/login?next=${encodeURIComponent("/")}`);
  }

  // Get display name
  const displayName = user?.name || 
    (user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 
    user?.email?.split('@')[0] || 'Account');

  return (
    <>
      {/* TOP BAR */}
      <div className="bg-white py-3 border-b shadow-sm">
        <div className="container mx-auto px-4 flex flex-wrap items-center justify-between gap-4 md:gap-6">
          {/* Left section */}
          <div className="flex items-center gap-5 md:gap-8 flex-wrap">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="DEALPORT"
                width={140}
                height={50}
                className="object-contain w-auto h-auto"
                priority
                loading="eager"
              />
            </Link>

            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#4EA674]">
              <Image 
                src="/ng.png" 
                alt="Nigeria" 
                width={20} 
                height={14} 
                className="w-auto h-auto"
              />
              EN
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Address dropdown */}
            <div className="relative" ref={addressMenuRef}>
              <button
                onClick={() => user && setAddressMenuOpen(!addressMenuOpen)}
                className={`flex items-center gap-2 text-sm ${
                  user ? 'text-gray-700 hover:text-[#4EA674]' : 'text-gray-400 cursor-default'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span className="truncate max-w-[200px]">
                  {user ? getDisplayAddress() : 'Deliver to Your address'}
                </span>
                {user && <ChevronDown className="w-4 h-4" />}
              </button>

              {addressMenuOpen && user && (
                <div className="absolute left-0 mt-2 w-72 bg-white border rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="p-3 border-b bg-gray-50">
                    <p className="text-xs font-medium text-gray-500">YOUR ADDRESSES</p>
                  </div>
                  
                  {savedAddresses.length > 0 ? (
                    <>
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr)}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b last:border-0 ${
                            selectedAddress?.id === addr.id ? 'bg-[#EAF8E7]' : ''
                          }`}
                        >
                          <p className="font-medium flex items-center gap-2">
                            {addr.label}
                            {selectedAddress?.id === addr.id && (
                              <span className="text-xs text-[#4EA674]">✓ Selected</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {addr.full}
                          </p>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-3">No saved addresses yet</p>
                      <Link
                        href="/account/addresses/add"
                        className="inline-block px-4 py-2 bg-[#4EA674] text-white rounded-lg text-sm font-medium hover:bg-[#3D8B59]"
                        onClick={() => setAddressMenuOpen(false)}
                      >
                        + Add New Address
                      </Link>
                    </div>
                  )}

                  <div className="border-t p-2 bg-gray-50">
                    <Link
                      href="/account/addresses"
                      className="flex items-center justify-between text-sm text-[#4EA674] hover:underline px-2 py-1"
                      onClick={() => setAddressMenuOpen(false)}
                    >
                      Manage Addresses
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:block relative w-64 lg:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What you're looking for"
                className="w-full px-4 py-2.5 pl-10 pr-4 rounded-full bg-[#EAF8E7] text-gray-700 placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
              />
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-500 hover:text-[#4EA674]" />
              </button>
            </form>

            {/* User icon: login or dropdown */}
            {!user ? (
              <Link
                href={`/login?next=${nextParam}`}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="Login"
              >
                <User className="w-6 h-6 text-gray-700" />
              </Link>
            ) : (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen((s) => !s)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full"
                  title="Account"
                >
                  <User className="w-6 h-6 text-gray-700" />
                  <span className="text-sm font-medium hidden sm:inline">{displayName}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg overflow-hidden z-50">
                    <Link
                      href="/account"
                      className="block px-4 py-3 text-sm hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-3 text-sm hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    <Link
                      href="/wishlist"
                      className="block px-4 py-3 text-sm hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Wishlist
                    </Link>
                    <Link
                      href="/account/addresses"
                      className="block px-4 py-3 text-sm hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Addresses
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist link */}
            <Link
              href="/wishlist"
              className="p-2 hover:bg-gray-100 rounded-full relative"
              title="Wishlist"
            >
              <Heart className="w-6 h-6 text-gray-700" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 text-[10px] font-bold text-white bg-[#4EA674] rounded-full px-1.5 py-0.5">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart link */}
            <Link
              href="/cart"
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full"
              title="Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 text-[10px] font-bold text-white bg-[#4EA674] rounded-full px-1.5 py-0.5">
                    {cartCount}
                  </span>
                )}
              </div>

              <span className="font-bold text-sm text-gray-700">
                ₦{Number(cartTotal || 0).toLocaleString()}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* MOBILE SEARCH */}
      <div className="md:hidden bg-white py-3 border-t">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What you're looking for"
              className="w-full px-5 py-3 pl-12 rounded-full bg-[#EAF8E7] text-gray-700 placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            />
            <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search className="w-6 h-6 text-gray-500 hover:text-[#4EA674]" />
            </button>
          </form>
        </div>
      </div>

      {/* SECONDARY NAV */}
      <nav className="bg-white py-3 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center md:justify-between gap-6 text-sm font-medium text-gray-700">
            <div className="flex flex-wrap gap-6">
              <Link href="/shop" className="hover:text-[#4EA674]">
                Shop
              </Link>
              <Link href="/promotions" className="hover:text-[#4EA674]">
                Promotions
              </Link>
              <Link href="/checkout" className="hover:text-[#4EA674]">
                Checkout
              </Link>
              <Link href="/brands" className="hover:text-[#4EA674]">
                Brands
              </Link>
              <Link href="/blogss" className="hover:text-[#4EA674]">
                Blogs
              </Link>
            </div>

            <div className="flex flex-wrap gap-6">
              <Link href="/" className="text-[#4EA674] border-b-2 border-[#4EA674]">
                Home
              </Link>
              <Link href="/about" className="hover:text-[#4EA674]">
                About Us
              </Link>
              <Link href="/contact" className="hover:text-[#4EA674]">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* CATEGORY BAR */}
      <div className="bg-white py-3 border-b">
        <div className="container mx-auto px-4">
          <nav className="flex flex-wrap justify-center md:justify-start gap-5 md:gap-8 text-xs md:text-sm font-medium text-gray-700 uppercase tracking-wide">
            <Link href="/pv-solar-panels" className="hover:text-[#4EA674]">
              PV SOLAR PANELS
            </Link>
            <Link href="/inverters" className="hover:text-[#4EA674]">
              INVERTERS
            </Link>
            <Link href="/batteries" className="hover:text-[#4EA674]">
              BATTERIES
            </Link>
            <Link href="/charge-controllers" className="hover:text-[#4EA674]">
              CHARGE CONTROLLERS
            </Link>
            <Link href="/solar-water-pumps" className="hover:text-[#4EA674]">
              SOLAR WATER PUMPS
            </Link>
            <Link href="/solar-packages" className="hover:text-[#4EA674]">
              SOLAR PACKAGES
            </Link>
            <Link href="/accessories" className="hover:text-[#4EA674]">
              ACCESSORIES
            </Link>
            <Link href="/categories" className="text-[#4EA674] hover:underline flex items-center gap-1">
              See more
              <ChevronRight className="w-4 h-4" />
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}