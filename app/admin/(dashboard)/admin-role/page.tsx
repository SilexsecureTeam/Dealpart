"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
} from "lucide-react";
import { useTheme } from "next-themes";
import { api } from "@/lib/apiClient";

type Msg = { type: "success" | "error"; text: string } | null;

type ProfileData = {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  avatar_url?: string | null;
  first_name: string | null;
  last_name: string | null;
  dob: string | null;
  location: string | null;
  bio: string | null;
  role?: string | null;
};

type ProfileResponse = {
  message?: string;
  success?: boolean;
  status?: boolean;
  data: ProfileData;
};

export default function AdminRolePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [profileMsg, setProfileMsg] = useState<Msg>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);

  // ✅ Avatar state (uses proxy for protected images)
  const [avatarUrl, setAvatarUrl] = useState<string>("/man.png");

  // ✅ Profile form state
  const [formData, setFormData] = useState({
    firstName: "Wade",
    lastName: "Warren",
    email: "wade.warren@example.com",
    phone: "(406) 555-0120",
    dob: "1999-01-12",
    location: "2972 Westheimer Rd. Santa Ana, Illinois 85486",
    password: "********",
    confirmPassword: "",
    bio: "",
    creditCard: "843-4359-4444",
  });

  // ✅ Password change form state
  const [pwd, setPwd] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<Msg>(null);

  // ---------- Helper: split full name ----------
  function splitName(fullName: string) {
    const parts = fullName.trim().split(" ").filter(Boolean);
    return { first: parts[0] || "", last: parts.slice(1).join(" ") || "" };
  }

  // ---------- Helper: resolve avatar URL (same logic) ----------
  function resolveAvatar(pathOrUrl: string | null | undefined) {
    if (!pathOrUrl || String(pathOrUrl).trim() === "") return null;
    const raw = String(pathOrUrl).trim();
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    let clean = raw.startsWith("/") ? raw.slice(1) : raw;
    if (clean.startsWith("avatars/")) clean = `storage/${clean}`;
    return `${process.env.NEXT_PUBLIC_API_URL || "https://admin.bezalelsolar.com"}/${clean}`;
  }

  // ---------- Helper: proxy image URL (unchanged) ----------
  function proxiedImageUrl(realUrl: string) {
    const token = localStorage.getItem("adminToken") || "";
    return `/api/proxy-image?url=${encodeURIComponent(realUrl)}&token=${encodeURIComponent(
      token
    )}&t=${Date.now()}`;
  }

  // ---------- Helper: copy to clipboard ----------
  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setProfileMsg({ type: "success", text: "Copied!" });
      setTimeout(() => setProfileMsg(null), 1200);
    } catch {
      setProfileMsg({ type: "error", text: "Copy failed." });
      setTimeout(() => setProfileMsg(null), 1200);
    }
  }

  // ---------- Load avatar from localStorage (proxy) ----------
  function loadAvatarFromStorage() {
    const savedSrc = localStorage.getItem("adminAvatarSrc");
    if (!savedSrc) return;
    setAvatarUrl(proxiedImageUrl(savedSrc));
  }

  // ---------- Fetch profile via apiClient ----------
  async function fetchProfile() {
    setProfileMsg(null);
    setProfileLoading(true);

    try {
      const json = (await api.profile.get()) as ProfileResponse;

      const u = json.data;

      // Update form
      const fullName = u?.name || "";
      const { first, last } = splitName(fullName);

      setFormData((prev) => ({
        ...prev,
        firstName: u?.first_name ?? first ?? prev.firstName,
        lastName: u?.last_name ?? last ?? prev.lastName,
        email: u?.email ?? prev.email,
        phone: u?.phone ?? prev.phone,
        dob: u?.dob ?? prev.dob,
        location: u?.location ?? prev.location,
        bio: u?.bio ?? prev.bio ?? "",
        password: "********",
      }));

      // Avatar from API
      const fromApi = u?.avatar_url || u?.avatar || null;
      const realUrl = resolveAvatar(fromApi);

      if (realUrl) {
        localStorage.setItem("adminAvatarSrc", realUrl);
        setAvatarUrl(proxiedImageUrl(realUrl));
      } else {
        setAvatarUrl("/man.png");
        localStorage.removeItem("adminAvatarSrc");
      }

      localStorage.setItem("adminUser", JSON.stringify(u));
    } catch (e: any) {
      setProfileMsg({
        type: "error",
        text: e?.message || "Network error loading profile.",
      });
    } finally {
      setProfileLoading(false);
    }
  }

  // ---------- Save profile via apiClient ----------
  async function handleSaveProfile() {
    setProfileMsg(null);
    setProfileSaving(true);

    try {
      const json = await api.profile.update({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        dob: formData.dob || null,
        location: formData.location || null,
        bio: formData.bio || null,
      });

      setProfileMsg({
        type: "success",
        text: json?.message || "Profile updated successfully.",
      });

      setTimeout(() => fetchProfile(), 600);
    } catch (e: any) {
      setProfileMsg({
        type: "error",
        text: e?.message || "Network error updating profile.",
      });
    } finally {
      setProfileSaving(false);
    }
  }

  // ---------- Upload avatar via apiClient ----------
  async function uploadAvatar(file: File) {
    setProfileMsg(null);
    setAvatarUploading(true);

    // Preview immediately
    const preview = URL.createObjectURL(file);
    setAvatarUrl(preview);

    try {
      const json = await api.profile.uploadAvatar(file);

      const possibleAvatar =
        json?.avatar_url ||
        json?.user?.avatar_url ||
        json?.user?.avatar ||
        json?.data?.avatar_url ||
        json?.data?.avatar ||
        json?.avatar ||
        null;

      if (possibleAvatar) {
        const realUrl = resolveAvatar(String(possibleAvatar));
        if (realUrl) {
          localStorage.setItem("adminAvatarSrc", realUrl);
          setAvatarUrl(proxiedImageUrl(realUrl));
        } else {
          setAvatarUrl("/man.png");
        }
      } else {
        await fetchProfile();
      }

      setProfileMsg({
        type: "success",
        text: json?.message || "Avatar uploaded successfully.",
      });
    } catch (e: any) {
      setProfileMsg({
        type: "error",
        text: e?.message || "Network error uploading avatar.",
      });
      loadAvatarFromStorage();
    } finally {
      setAvatarUploading(false);
    }
  }

  // ---------- Delete avatar (frontend only – same as before) ----------
  function deleteAvatarFrontendOnly() {
    setAvatarUrl("/man.png");
    localStorage.removeItem("adminAvatarSrc");
    setProfileMsg({ type: "success", text: "Avatar removed (frontend only)." });
    setTimeout(() => setProfileMsg(null), 1200);
  }

  // ---------- Update password via apiClient ----------
  async function handleUpdatePassword() {
    setPwdMsg(null);
    setPwdLoading(true);

    try {
      if (!pwd.current_password || !pwd.password || !pwd.password_confirmation) {
        setPwdMsg({ type: "error", text: "Please fill all password fields." });
        return;
      }
      if (pwd.password !== pwd.password_confirmation) {
        setPwdMsg({ type: "error", text: "New password and confirmation do not match." });
        return;
      }

      const json = await api.profile.updatePassword(pwd);

      setPwdMsg({ type: "success", text: json?.message || "Password updated successfully." });
      setPwd({ current_password: "", password: "", password_confirmation: "" });
    } catch (e: any) {
      setPwdMsg({ type: "error", text: e?.message || "Network error. Please try again." });
    } finally {
      setPwdLoading(false);
    }
  }

  // ---------- Initial load ----------
  useEffect(() => {
    setMounted(true);
    loadAvatarFromStorage();
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fullName = `${formData.firstName} ${formData.lastName}`.trim();

  const AvatarImg = ({ className }: { className: string }) => (
    <img
      src={avatarUrl}
      alt="Admin"
      className={className}
      onError={() => setAvatarUrl("/man.png")}
    />
  );

  // ---------- Render (EXACT original JSX) ----------
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
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
              type="button"
            >
              <Sun
                className={`h-5 w-5 text-yellow-500 transition-all duration-300 ${
                  theme === "dark" ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
                }`}
              />
              <Moon
                className={`absolute inset-0 m-auto h-5 w-5 text-blue-400 transition-all duration-300 ${
                  theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
                }`}
              />
            </button>
          )}

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600 flex-shrink-0">
            <AvatarImg className="object-cover w-full h-full" />
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
        {(profileLoading || profileSaving || avatarUploading) && (
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            {profileLoading && "Loading profile..."}
            {profileSaving && "Saving profile..."}
            {avatarUploading && "Uploading avatar..."}
          </p>
        )}

        {profileMsg && (
          <div
            className={`mb-6 text-sm p-3 rounded-lg ${
              profileMsg.type === "success"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200"
            }`}
          >
            {profileMsg.text}
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadAvatar(f);
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
                    src={avatarUrl}
                    alt="Profile"
                    className="object-cover w-full h-full"
                    onError={() => setAvatarUrl("/man.png")}
                  />
                </div>

                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                  {fullName || "Admin"}
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
                      pwdMsg.type === "success"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200"
                    }`}
                  >
                    {pwdMsg.text}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleUpdatePassword}
                  disabled={pwdLoading}
                  className="w-full mt-2 px-8 py-3.5 bg-[#4EA674] text-white rounded-xl text-sm font-medium hover:bg-[#3D8B59] transition-colors disabled:opacity-50"
                >
                  {pwdLoading ? "Saving..." : "Save Change"}
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
                  onClick={fetchProfile}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 text-gray-800 dark:text-gray-100"
                >
                  <Edit2 className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-8">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-700">
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="object-cover w-full h-full"
                      onError={() => setAvatarUrl("/man.png")}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={avatarUploading}
                    className="px-6 py-2.5 bg-[#4EA674] text-white rounded-xl text-sm font-medium hover:bg-[#3D8B59] transition disabled:opacity-50"
                  >
                    {avatarUploading ? "Uploading..." : "Upload New"}
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
                      value={formData.password}
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
                  disabled={profileSaving}
                  className="px-8 py-3.5 bg-[#4EA674] text-white rounded-xl text-sm font-medium hover:bg-[#3D8B59] transition-colors disabled:opacity-50"
                >
                  {profileSaving ? "Saving..." : "Save Change"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}