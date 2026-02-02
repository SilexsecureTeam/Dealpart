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

type Msg = { type: "success" | "error"; text: string } | null;

type ProfileResponse = {
  success: boolean;
  data: {
    id: number;
    name: string | null;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    first_name: string | null;
    last_name: string | null;
    dob: string | null;
    location: string | null;
    bio: string | null;
    role?: string | null;
  };
};

export default function AdminRolePage() {
  // ===== API CONFIG (confirmed working) =====
  const BASE_URL = "https://admin.bezalelsolar.com";
  const PROFILE_URL = `${BASE_URL}/api/admin/profile`;
  const UPDATE_PROFILE_URL = `${BASE_URL}/api/admin/profile`;
  const UPDATE_PASSWORD_URL = `${BASE_URL}/api/admin/profile/password`;
  const UPLOAD_AVATAR_URL = `${BASE_URL}/api/admin/profile/avatar`;

  // ===== THEME =====
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // ===== UI STATE =====
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // ===== MESSAGES/LOADERS =====
  const [profileMsg, setProfileMsg] = useState<Msg>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // ===== AVATAR =====
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("/man.png");

  // ===== PROFILE FORM DATA =====
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
  });

  // ===== PASSWORD CHANGE =====
  const [pwd, setPwd] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<Msg>(null);

  // ===== helpers =====
  function getTokenOrThrow() {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Admin session missing. Please login again.");
    return token;
  }

  function resolveAvatar(url: string | null) {
    console.log("Resolving avatar URL:", url);
  if (!url || url.trim() === "") return "/man.png";
  
  if (!url.startsWith("https://")) return "/man.png";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const clean = url.startsWith("/") ? url.slice(1) : url;

  if (clean.startsWith("storage/")) return `${BASE_URL}/${clean}`;

  return `${BASE_URL}/storage/${clean}`;
}


  function splitName(fullName: string) {
    const parts = fullName.trim().split(" ").filter(Boolean);
    return { first: parts[0] || "", last: parts.slice(1).join(" ") || "" };
  }

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

  // ===== API: GET PROFILE =====
  async function fetchProfile() {
    setProfileMsg(null);
    setProfileLoading(true);
    try {
      const token = getTokenOrThrow();
      const res = await fetch(PROFILE_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const json = (await res.json().catch(() => ({}))) as Partial<ProfileResponse>;

      if (!res.ok) {
        setProfileMsg({ type: "error", text: (json as any)?.message || "Failed to load profile." });
        return;
      }

      const u = (json as ProfileResponse).data;

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
if (u?.avatar && u.avatar.trim() !== "") {
  console.log("Setting avatar from profile data:", u.avatar);
  const newUrl = resolveAvatar(u.avatar);
  setAvatarUrl(newUrl);
  localStorage.setItem("adminAvatarUrl", newUrl);
}


      localStorage.setItem("adminUser", JSON.stringify(u));
    } catch (e: any) {
      setProfileMsg({ type: "error", text: e?.message || "Network error loading profile." });
    } finally {
      setProfileLoading(false);
    }
  }

  // ===== API: PATCH PROFILE UPDATE =====
  async function handleSaveProfile() {
    setProfileMsg(null);
    setProfileSaving(true);
    try {
      const token = getTokenOrThrow();

      const res = await fetch(UPDATE_PROFILE_URL, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          dob: formData.dob || null,
          location: formData.location || null,
          bio: formData.bio || null,
        }),
      });

      const json = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        const firstError =
          json?.errors &&
          Object.values(json.errors)?.[0] &&
          (Object.values(json.errors)[0] as any)?.[0];

        setProfileMsg({ type: "error", text: firstError || json?.message || "Profile update failed." });
        return;
      }

     setProfileMsg({ type: "success", text: json?.message || "Avatar uploaded successfully." });
setTimeout(() => {
  fetchProfile();
}, 800);

    } catch (e: any) {
      setProfileMsg({ type: "error", text: e?.message || "Network error updating profile." });
    } finally {
      setProfileSaving(false);
    }
  }

  // ===== API: UPLOAD AVATAR =====
  async function uploadAvatar(file: File) {
    setProfileMsg(null);
    setAvatarUploading(true);

    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);

    try {
      const token = getTokenOrThrow();
      const fd = new FormData();
      fd.append("avatar", file);

      const res = await fetch(UPLOAD_AVATAR_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: fd,
      });

      const json = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        const firstError =
          json?.errors &&
          Object.values(json.errors)?.[0] &&
          (Object.values(json.errors)[0] as any)?.[0];

        const lastSaved = localStorage.getItem("adminAvatarUrl");
        setAvatarUrl(lastSaved || "/man.png");

        setProfileMsg({ type: "error", text: firstError || json?.message || "Avatar upload failed." });
        return;
      }

      console.log("Upload response:", json);
      localStorage.setItem("adminAvatarUrl", previewUrl);

     const possibleAvatar =
  json?.avatar_url || json?.data?.avatar || json?.avatar || json?.data?.url || json?.url || null;

if (possibleAvatar) {
  console.log("Resolved avatar URL from upload response:", possibleAvatar);
  const serverUrl = resolveAvatar(String(possibleAvatar));
  setAvatarUrl(serverUrl);
  localStorage.setItem("adminAvatarUrl", serverUrl);
}


      setProfileMsg({ type: "success", text: json?.message || "Avatar uploaded successfully." });
      await fetchProfile();
    } catch (e: any) {
      const lastSaved = localStorage.getItem("adminAvatarUrl");
      setAvatarUrl(lastSaved || "/man.png");
      setProfileMsg({ type: "error", text: e?.message || "Network error uploading avatar." });
    } finally {
      setAvatarUploading(false);
    }
  }

  function deleteAvatarFrontendOnly() {
    setAvatarUrl("/man.png");
    localStorage.removeItem("adminAvatarUrl");
    setProfileMsg({ type: "success", text: "Avatar removed (frontend only)." });
    setTimeout(() => setProfileMsg(null), 1200);
  }

  // ===== API: UPDATE PASSWORD =====
  async function handleUpdatePassword() {
    setPwdMsg(null);
    setPwdLoading(true);
    try {
      const token = getTokenOrThrow();

      if (!pwd.current_password || !pwd.password || !pwd.password_confirmation) {
        setPwdMsg({ type: "error", text: "Please fill all password fields." });
        return;
      }
      if (pwd.password !== pwd.password_confirmation) {
        setPwdMsg({ type: "error", text: "New password and confirmation do not match." });
        return;
      }

      const res = await fetch(UPDATE_PASSWORD_URL, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(pwd),
      });

      const json = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        const firstError =
          json?.errors &&
          Object.values(json.errors)?.[0] &&
          (Object.values(json.errors)[0] as any)?.[0];
        setPwdMsg({
          type: "error",
          text: firstError || json?.message || "Password update failed.",
        });
        return;
      }

      setPwdMsg({ type: "success", text: json?.message || "Password updated successfully." });
      setPwd({ current_password: "", password: "", password_confirmation: "" });
    } catch (e: any) {
      setPwdMsg({ type: "error", text: e?.message || "Network error. Please try again." });
    } finally {
      setPwdLoading(false);
    }
  }

  // ===== INIT =====
  useEffect(() => {
    setMounted(true);
    const savedAvatar = localStorage.getItem("adminAvatarUrl");
    if (savedAvatar) setAvatarUrl(savedAvatar);
    fetchProfile();
  }, []);

  const fullName = `${formData.firstName} ${formData.lastName}`.trim();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Admin role
        </h1>

        {/* ✅ added flex-wrap + min-w-0 to stop overflow on small screens */}
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
            <Image
              src={avatarUrl}
              alt="Admin"
              width={40}
              height={40}
              unoptimized
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </header>

      {/* Mobile search dropdown */}
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

      {/* ✅ added overflow-x-hidden to prevent tiny horizontal scroll on mobile */}
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
                  <Image
                    src={avatarUrl}
                    alt="Profile"
                    width={112}
                    height={112}
                    unoptimized
                    className="object-cover w-full h-full"
                  />
                </div>

                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                  {fullName || "Admin"}
                </h4>

                {/* ✅ added min-w-0 + break/truncate support */}
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
                      type="password"
                      placeholder="Enter password"
                      value={pwd.password}
                      onChange={(e) => setPwd((p) => ({ ...p, password: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Eye className="w-5 h-5" />
                    </div>
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
                  Edit
                </button>
              </div>

              {/* ✅ allow wrap on small screens */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-8">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-700">
                    <Image
                      src={avatarUrl}
                      alt="Profile"
                      width={56}
                      height={56}
                      unoptimized
                      className="object-cover w-full h-full"
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
                    name="firstName"
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
                    name="lastName"
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
                      name="password"
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
                      name="phone"
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
                    name="email"
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
                      name="dob"
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
                    name="location"
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
                      defaultValue="843-4359-4444"
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
                      name="bio"
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
