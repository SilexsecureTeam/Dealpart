"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/lib/userAuth";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    setMsg(null);
    if (!login || !password) return setMsg("Enter email/phone and password");

    setLoading(true);
    try {
      await loginUser(login, password);
      router.push(next);
    } catch (e: any) {
      setMsg(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-xl font-bold text-center mb-4">Login</h2>

        {msg && <p className="text-red-600 text-sm mb-3">{msg}</p>}

        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Email or phone"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-2 rounded mb-4"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={onLogin}
          disabled={loading}
          className="w-full bg-[#4EA674] text-white py-2 rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-center mt-4">
          New user?{" "}
          <Link href={`/register?next=${encodeURIComponent(next)}`} className="text-[#4EA674] font-semibold">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}