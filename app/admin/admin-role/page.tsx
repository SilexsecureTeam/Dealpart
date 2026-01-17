'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Bell,Calendar, EyeOff, Eye, LinkIcon, Upload, MoreVertical, MessageSquare, Edit2, Trash2, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export default function AdminRolePage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "Wade",
    lastName: "Warren",
    email: "wade.warren@example.com",
    phone: "(406) 555-0120",
    dob: "1999-01-12",
    location: "2972 Westheimer Rd. Santa Ana, Illinois 85486",
    password: "********",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Updated Header - consistent across all admin pages */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Admin Role</h1>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile search toggle */}
          <button 
            className="p-2 md:hidden hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Toggle search"
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Desktop search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search data, users, or reports"
              className="pl-12 pr-6 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm w-64 lg:w-96 focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
            />
          </div>

          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Dark mode toggle */}
          {!mounted ? (
            <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-700" />
          ) : (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
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

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600">
            <Image src="/man.png" alt="Admin" width={40} height={40} className="object-cover w-full h-full" />
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
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
              autoFocus
            />
          </div>
        </div>
      )}

      <main className="p-6 lg:p-8 bg-gray-50 dark:bg-gray-950">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Admin Role</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About & Profile */}
          <div className="lg:col-span-1 space-y-8">
            {/* About Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">About section</h3>
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-700">
                    <Image src="/man.png" alt="Wade Warren" width={128} height={128} className="object-cover w-full h-full" />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md">
                    <Edit2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Wade Warren</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">wade.warren@example.com</p>

                <div className="mt-4 flex flex-col items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <p>Linked with Social media</p>
                  <div className="flex items-center gap-6">
                    <a href="#" className="hover:opacity-80 transition">
                      <Image src="/google.png" alt="Google" width={32} height={32} />
                    </a>
                    <a href="#" className="hover:opacity-80 transition">
                      <Image src="/facebook.png" alt="Facebook" width={32} height={32} />
                    </a>
                    <a href="#" className="hover:opacity-80 transition">
                      <Image src="/twitter.png" alt="Twitter" width={32} height={32} />
                    </a>
                    <a href="#" className="hover:opacity-80 transition">
                      <Image src="/instagram.png" alt="Instagram" width={32} height={32} />
                    </a>
                    <a href="#" className="hover:opacity-80 transition">
                      <Image src="/linkedin.png" alt="LinkedIn" width={32} height={32} />
                    </a>
                  </div>
                </div>

                <button className="mt-6 px-6 py-2.5 bg-[#4EA674]/10 text-[#4EA674] rounded-full text-sm font-medium hover:bg-[#4EA674]/20 transition flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  + Social media
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Change Password</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-[#4EA674] mt-2 cursor-pointer hover:underline">
                    Forgot Current Password? Click here
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Re-enter Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Enter password"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Update */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile Update</h3>
                <button className="px-4 py-2 border border-[#4EA674] text-[#4EA674] rounded-full text-sm font-medium hover:bg-[#4EA674] hover:text-white transition">
                  Edit
                </button>
              </div>

              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-700">
                    <Image src="/man.png" alt="Profile" width={96} height={96} className="object-cover w-full h-full" />
                  </div>
                  <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1.5">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button className="px-6 py-2.5 bg-[#4EA674] text-white rounded-full text-sm font-medium hover:bg-[#3D8B59] transition">
                    Upload New
                  </button>
                  <button className="px-6 py-2.5 border border-red-500 text-red-500 rounded-full text-sm font-medium hover:bg-red-500 hover:text-white transition">
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    />
                    <select className="px-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                      <option>🇺🇸</option>
                      <option>🇳🇬</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Credit Card</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <div className="w-8 h-5 bg-red-500 rounded" />
                      <div className="w-8 h-5 bg-yellow-400 rounded" />
                    </div>
                    <input
                      type="text"
                      placeholder="843-4359-4444"
                      className="w-full pl-20 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                    />
                    <select className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent text-sm text-gray-500">
                      <option>Visa</option>
                      <option>Mastercard</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Biography</label>
                  <textarea
                    placeholder="Enter a biography about you"
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EA674]/30"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button className="px-8 py-3.5 bg-[#4EA674] text-white rounded-full text-sm font-medium hover:bg-[#3D8B59] transition-colors">
                  Save Change
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}