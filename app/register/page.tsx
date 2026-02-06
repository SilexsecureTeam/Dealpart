"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { registerStep1, registerStep2Verify } from "@/lib/userAuth";

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

  function update(k: string, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function submitStep1() {
    setMsg(null);
    if (form.password !== form.password_confirmation)
      return setMsg("Passwords do not match");

    setLoading(true);
    try {
      await registerStep1(form);
      setStep(2);
      setMsg("Verification code sent to email");
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitStep2() {
    setLoading(true);
    try {
      await registerStep2Verify({ email: form.email, code });
      router.push(next);
    } catch (e: any) {
      setMsg(e.message);
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
            <input className="w-full border p-2 mb-2" placeholder="Full name" onChange={(e) => update("name", e.target.value)} />
            <input className="w-full border p-2 mb-2" placeholder="Email" onChange={(e) => update("email", e.target.value)} />
            <input className="w-full border p-2 mb-2" placeholder="Phone" onChange={(e) => update("phone", e.target.value)} />
            <input type="password" className="w-full border p-2 mb-2" placeholder="Password" onChange={(e) => update("password", e.target.value)} />
            <input type="password" className="w-full border p-2 mb-4" placeholder="Confirm password" onChange={(e) => update("password_confirmation", e.target.value)} />

            <button onClick={submitStep1} className="w-full bg-[#4EA674] text-white py-2 rounded">
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input className="w-full border p-2 mb-4" placeholder="Verification code" onChange={(e) => setCode(e.target.value)} />
            <button onClick={submitStep2} className="w-full bg-[#023337] text-white py-2 rounded">
              Verify & Continue
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