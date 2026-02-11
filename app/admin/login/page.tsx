"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminUser = {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  role: string | null;
  avatar: string | null;
  expires_at: string | null;
};

type LoginResponse = {
  message: string;
  data: AdminUser;
};

type VerifyResponse = {
  message: string;
  token: string;
  user: AdminUser;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  async function loginAndSendOtp() {
    if (!email.trim()) return alert("Enter email");
    if (!password.trim()) return alert("Enter password");

    setLoading(true);
    try {
      // ✅ Use FormData instead of JSON
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const res = await fetch("https://admin.bezalelsolar.com/api/admin/login", {
        method: "POST",
        // ❌ Remove Content-Type header - browser will set it with boundary
        headers: {
          Accept: "application/json",
          // "Content-Type": "application/json", // REMOVE THIS
        },
        body: formData, // ✅ Send FormData
      });

      const data: LoginResponse = await res.json();

      if (!res.ok) {
        return alert(data?.message || "Login failed");
      }

      setAdmin(data.data);
      alert(data.message || "OTP sent to your registered email address.");
      setStep(2);
    } catch (e) {
      alert("Network error. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (!otp.trim()) return alert("Enter OTP");
    if (!admin?.id) return alert("Missing admin id. Please login again.");

    setLoading(true);
    try {
      // ✅ Use FormData for OTP verification as well
      const formData = new FormData();
      formData.append("user_id", String(admin.id)); // Based on your docs: Query param is user_id
      formData.append("otp", otp); // Based on your docs: field is "otp" not "code"
      
      // Your docs show user_id as query param, but also form-data
      // Let's try with query param if this doesn't work
      const url = new URL("https://admin.bezalelsolar.com/api/admin/verify-otp");
      url.searchParams.append("user_id", String(admin.id));

      const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Accept: "application/json",
          // ❌ No Content-Type header for FormData
        },
        body: formData,
      });

      const data: VerifyResponse = await res.json();

      if (!res.ok) {
        return alert(data?.message || "OTP verification failed");
      }

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.user));
      router.push("/admin/dashboard");
    } catch (e) {
      alert("Network error. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    setStep(1);
    setOtp("");
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-xl font-bold text-center text-[#4EA674] mb-4">
          Admin Login
        </h2>

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              autoComplete="email"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              autoComplete="current-password"
            />

            <button
              onClick={loginAndSendOtp}
              disabled={loading}
              className="w-full bg-[#4EA674] text-white p-2 rounded disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              OTP sent to <span className="font-medium">{email}</span>
              {admin?.expires_at ? (
                <>
                  <br />
                  <span className="text-xs">
                    OTP expires at: {String(admin.expires_at)}
                  </span>
                </>
              ) : null}
            </p>

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              inputMode="numeric"
            />

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-[#4EA674] text-white p-2 rounded disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              onClick={goBack}
              disabled={loading}
              className="w-full mt-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 p-2 rounded disabled:opacity-60"
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}