"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { customerApi } from "@/lib/customerApiClient";

export default function RegisterPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); // store user_id from registration

  function update(k: string, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function submitStep1() {
    setMsg(null);
    if (form.password !== form.password_confirmation)
      return setMsg("Passwords do not match");

    setLoading(true);
    try {
      // ✅ Use customerApi.auth.register()
      const response = await customerApi.auth.register(form);
      
      // Extract user_id from response – adjust path based on your API
      const userId = response.user?.id || response.data?.user?.id || response.data?.id;
      if (userId) {
        setUserId(String(userId));
      }

      setStep(2);
      setMsg("Verification code sent to email");
    } catch (e: any) {
      setMsg(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function submitStep2() {
    setLoading(true);
    try {
      // ✅ Use customerApi.auth.verifyCode() with user_id
      await customerApi.auth.verifyCode(code, userId || undefined);
      router.push(next);
    } catch (e: any) {
      setMsg(e.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-xl font-bold text-center mb-4">Register</h2>

        {msg && <p className="text-sm mb-3 text-red-600">{msg}</p>}

        {step === 1 && (
          <>
            <input
              className="w-full border p-2 mb-2"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
            <input
              className="w-full border p-2 mb-2"
              placeholder="Email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            <input
              className="w-full border p-2 mb-2"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
            <input
              type="password"
              className="w-full border p-2 mb-2"
              placeholder="Password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
            <input
              type="password"
              className="w-full border p-2 mb-4"
              placeholder="Confirm password"
              value={form.password_confirmation}
              onChange={(e) => update("password_confirmation", e.target.value)}
            />

            <button
              onClick={submitStep1}
              disabled={loading}
              className="w-full bg-[#4EA674] text-white py-2 rounded"
            >
              {loading ? "Please wait..." : "Continue"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              className="w-full border p-2 mb-4"
              placeholder="Verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              onClick={submitStep2}
              disabled={loading}
              className="w-full bg-[#023337] text-white py-2 rounded"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </>
        )}

        <p className="text-sm text-center mt-4">
          Already registered?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-[#4EA674] font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}