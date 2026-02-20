'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Search,
  Bell,
  Calendar,
  EyeOff,
  Eye,
  Edit2,
  Sun,
  Moon,
  Share2,
  Copy,
  Pencil,
  Sparkles,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { 
  useProfile, 
  useUpdateProfile, 
  useUploadAvatar, 
  useUpdatePassword,
} from '@/hooks/useProfile';

// Helper to resolve avatar URL (same as in sidebar)
const resolveAvatar = (pathOrUrl: string | null | undefined): string | null => {
  if (!pathOrUrl || String(pathOrUrl).trim() === '') return null;
  
  const raw = String(pathOrUrl).trim();
  
  // If it's already a full URL, return as is
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  
  // The base URL for storage (remove /api from the API URL)
  const base = (process.env.NEXT_PUBLIC_API_URL || 'https://admin.bezalelsolar.com/api').replace('/api', '');
  
  // If it starts with 'avatars/' 
  if (raw.startsWith('avatars/')) {
    return `${base}/storage/${raw}`;
  }
  
  // If it's just a filename (no slashes)
  if (!raw.includes('/')) {
    return `${base}/storage/avatars/${raw}`;
  }
  
  // For any other path
  return `${base}/storage/${raw}`;
};

export default function AdminRolePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // ---------- React Query ----------
  const { 
    data: profile, 
    isLoading: profileLoading, 
    error: profileError,
    refetch: refetchProfile 
  } = useProfile();

  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const updatePassword = useUpdatePassword();

  // ---------- Local UI states ----------
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ---------- Avatar ----------
  const fileRef = useRef<HTMLInputElement>(null);
  const [displayUrl, setDisplayUrl] = useState<string>('/man.png');

  // ---------- Form state ----------
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    location: '',
    bio: '',
    creditCard: '843-4359-4444',
  });

  // ---------- Password form ----------
  const [pwd, setPwd] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  // ---------- Helper: split full name ----------
  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(' ').filter(Boolean);
    return { first: parts[0] || '', last: parts.slice(1).join(' ') || '' };
  };

  // ---------- Get avatar URL with cache busting ----------
  const getAvatarWithCacheBust = (url: string | null): string => {
    if (!url) return '/man.png';
    return `${url}?t=${Date.now()}`;
  };

  // ---------- Load avatar when profile changes ----------
  useEffect(() => {
    if (profile) {
      const fromApi = profile.avatar_url || profile.avatar || null;
      const real = resolveAvatar(fromApi);
      setDisplayUrl(getAvatarWithCacheBust(real));
      
      // Update form data
      const fullName = profile.name || '';
      const { first, last } = splitName(fullName);
      setFormData({
        firstName: profile.first_name ?? first,
        lastName: profile.last_name ?? last,
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        dob: profile.dob ?? '',
        location: profile.location ?? '',
        bio: profile.bio ?? '',
        creditCard: formData.creditCard,
      });
    }
  }, [profile]);

  // ---------- Image error handler ----------
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src === '/man.png') return;
    img.src = '/man.png';
  };

  // ---------- Copy to clipboard ----------
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setProfileMsg({ type: 'success', text: 'Copied!' });
      setTimeout(() => setProfileMsg(null), 1200);
    } catch {
      setProfileMsg({ type: 'error', text: 'Copy failed.' });
      setTimeout(() => setProfileMsg(null), 1200);
    }
  };

  // ---------- Save profile ----------
  const handleSaveProfile = async () => {
    setProfileMsg(null);
    try {
      await updateProfile.mutateAsync({
        first_name: formData.firstName || null,
        last_name: formData.lastName || null,
        phone: formData.phone || null,
        dob: formData.dob || null,
        location: formData.location || null,
        bio: formData.bio || null,
      });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (e: any) {
      setProfileMsg({
        type: 'error',
        text: e?.message || 'Failed to update profile.',
      });
    }
  };

  // ---------- Upload avatar ----------
  const handleUploadAvatar = async (file: File) => {
    setProfileMsg(null);
    
    // Show preview immediately
    const preview = URL.createObjectURL(file);
    setDisplayUrl(preview);

    try {
      await uploadAvatar.mutateAsync(file);
      
      // Clean up preview
      URL.revokeObjectURL(preview);
      
      // Refetch profile to get updated data
      await refetchProfile();
      
      setProfileMsg({ type: 'success', text: 'Avatar uploaded successfully.' });
    } catch (e: any) {
      // Clean up preview on error
      URL.revokeObjectURL(preview);
      
      setProfileMsg({
        type: 'error',
        text: e?.message || 'Failed to upload avatar.',
      });
      
      // Revert to current avatar on error
      if (profile) {
        const fromApi = profile.avatar_url || profile.avatar || null;
        const real = resolveAvatar(fromApi);
        setDisplayUrl(getAvatarWithCacheBust(real));
      } else {
        setDisplayUrl('/man.png');
      }
    }
  };

  // ---------- Delete avatar (frontend only) ----------
  const deleteAvatarFrontendOnly = () => {
    localStorage.removeItem('adminAvatarSrc');
    setDisplayUrl('/man.png');
    setProfileMsg({ type: 'success', text: 'Avatar removed (frontend only).' });
    setTimeout(() => setProfileMsg(null), 1200);
  };

  // ---------- Update password ----------

const handleUpdatePassword = async () => {
  setPwdMsg(null);

  if (!pwd.current_password || !pwd.password || !pwd.password_confirmation) {
    setPwdMsg({ type: 'error', text: 'Please fill all password fields.' });
    return;
  }
  if (pwd.password !== pwd.password_confirmation) {
    setPwdMsg({ type: 'error', text: 'New password and confirmation do not match.' });
    return;
  }

  try {
    const response = await updatePassword.mutateAsync(pwd);
    const message = response?.data?.message || response?.message || 'Password updated successfully.';
    setPwdMsg({ type: 'success', text: message });
    setPwd({ current_password: '', password: '', password_confirmation: '' });
  } catch (e: any) {
    setPwdMsg({
      type: 'error',
      text: e?.response?.data?.message || e?.message || 'Failed to update password.',
    });
  }
};

  // ---------- Mount ----------
  useEffect(() => {
    setMounted(true);
  }, []);

  const fullName = `${formData.firstName} ${formData.lastName}`.trim();

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Admin role
        </h1>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4 min-w-0">
          <button
            className="p-2 md:hidden hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Toggle search"
            type="button"
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search data, users, or reports"
              className="pl-12 pr-6 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm w-64 lg:w-96 focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
            />
          </div>

          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl" type="button">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {!mounted ? (
            <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-700" />
          ) : (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
              type="button"
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
          )}

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600 flex-shrink-0">
            <img
              src={displayUrl}
              alt="Admin"
              className="object-cover w-full h-full"
              onError={handleImageError}
            />
          </div>
        </div>
      </header>

      {showSearch && (
        <div className="md:hidden px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search data, users, or reports"
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
              autoFocus
            />
          </div>
        </div>
      )}

      <main className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 overflow-x-hidden">
        {(profileLoading || updateProfile.isPending || uploadAvatar.isPending) && (
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            {profileLoading && 'Loading profile...'}
            {updateProfile.isPending && 'Saving profile...'}
            {uploadAvatar.isPending && 'Uploading avatar...'}
          </p>
        )}

        {profileError && (
          <div className="mb-6 text-sm p-3 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200">
            Failed to load profile. Please refresh.
          </div>
        )}

        {profileMsg && (
          <div
            className={`mb-6 text-sm p-3 rounded-lg ${
              profileMsg.type === 'success'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200'
            }`}
          >
            {profileMsg.text}
          </div>
        )}

        {/* File input */}
        <input
          key={uploadAvatar.isPending ? 'uploading' : 'ready'}
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUploadAvatar(f);
          }}
        />

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">About section</h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-1 space-y-6 sm:space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Profile</h4>
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-300">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="hover:text-gray-700 dark:hover:text-gray-100 transition"
                    title="Edit avatar"
                    disabled={uploadAvatar.isPending}
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${fullName} - ${formData.email}`)}
                    className="hover:text-gray-700 dark:hover:text-gray-100 transition"
                    title="Share / Copy"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-28 h-28 rounded-full overflow-hidden mb-4 ring-4 ring-gray-100 dark:ring-gray-700">
                  <img
                    src={displayUrl}
                    alt="Profile"
                    className="object-cover w-full h-full"
                    onError={handleImageError}
                  />
                </div>

                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                  {fullName || 'Admin'}
                </h4>

                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 min-w-0">
                  <span className="truncate max-w-[220px] sm:max-w-none">{formData.email}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(formData.email)}
                    className="text-[#4EA674] hover:opacity-80 flex-shrink-0"
                    title="Copy email"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-6 text-sm text-gray-600 dark:text-gray-300">
                  Linked with Social media
                </div>

                <div className="mt-3 flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
                  <Image src="/google.png" alt="Google" width={28} height={28} unoptimized />
                  <Image src="/facebook.png" alt="Facebook" width={28} height={28} unoptimized />
                  <Image src="/twitter.png" alt="X" width={28} height={28} unoptimized />
                </div>

                <button
                  type="button"
                  className="mt-6 px-5 py-2 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
                >
                  <span className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    +
                  </span>
                  Social media
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h3>
                <button type="button" className="text-sm text-[#4EA674] hover:underline flex items-center gap-1">
                  Need help <span className="text-gray-500 dark:text-gray-300">ⓘ</span>
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={pwd.current_password}
                      onChange={(e) => setPwd((p) => ({ ...p, current_password: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-[#4EA674] mt-2 cursor-pointer hover:underline">
                    Forgot Current Password? Click here
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={pwd.password}
                      onChange={(e) => setPwd((p) => ({ ...p, password: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Re-enter Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={pwd.password_confirmation}
                      onChange={(e) => setPwd((p) => ({ ...p, password_confirmation: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {pwdMsg && (
                  <div
                    className={`text-sm p-3 rounded-lg ${
                      pwdMsg.type === 'success'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200'
                    }`}
                  >
                    {pwdMsg.text}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleUpdatePassword}
                  disabled={updatePassword.isPending}
                  className="w-full mt-2 px-8 py-3.5 bg-[#4EA674] text-white rounded-xl text-sm font-medium hover:bg-[#3D8B59] transition-colors disabled:opacity-50"
                >
                  {updatePassword.isPending ? 'Saving...' : 'Save Change'}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Profile Update</h3>
                <button
                  type="button"
                  onClick={() => refetchProfile()}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 text-gray-800 dark:text-gray-100"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-8">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-700">
                    <img
                      src={displayUrl}
                      alt="Profile"
                      className="object-cover w-full h-full"
                      onError={handleImageError}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadAvatar.isPending}
                    className="px-6 py-2.5 bg-[#4EA674] text-white rounded-xl text-sm font-medium hover:bg-[#3D8B59] transition disabled:opacity-50"
                  >
                    {uploadAvatar.isPending ? 'Uploading...' : 'Upload New'}
                  </button>
                  <button
                    type="button"
                    onClick={deleteAvatarFrontendOnly}
                    className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-800 dark:text-gray-100"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value="********"
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                      className="flex-1 min-w-0 px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    />
                    <select className="px-3 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-xl">
                      <option>🇺🇸</option>
                      <option>🇳🇬</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-200 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData((p) => ({ ...p, dob: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Credit Card
                  </label>
                  <div className="relative min-w-0">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <div className="w-4 h-5 bg-red-500 rounded" />
                      <div className="w-4 h-5 bg-yellow-400 rounded" />
                    </div>
                    <input
                      type="text"
                      value={formData.creditCard}
                      onChange={(e) => setFormData((p) => ({ ...p, creditCard: e.target.value }))}
                      className="w-full pl-20 pr-10 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    />
                    <select className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent text-sm text-gray-600 dark:text-gray-200">
                      <option>Visa</option>
                      <option>Mastercard</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Biography
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
                      placeholder="Enter a biography about you"
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    />
                    <div className="absolute right-3 bottom-3 flex items-center gap-3 text-gray-500 dark:text-gray-300">
                      <button type="button" className="hover:text-gray-700 dark:hover:text-gray-100 transition" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button type="button" className="hover:text-gray-700 dark:hover:text-gray-100 transition" title="Enhance">
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending}
                  className="px-8 py-3.5 bg-[#4EA674] text-white rounded-xl text-sm font-medium hover:bg-[#3D8B59] transition-colors disabled:opacity-50"
                >
                  {updateProfile.isPending ? 'Saving...' : 'Save Change'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}