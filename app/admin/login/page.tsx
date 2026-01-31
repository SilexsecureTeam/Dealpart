"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1);
  const router = useRouter();

  async function sendOtp() {
    if (!email) return alert("Enter email");

    const res = await fetch("https://admin.bezalelsolar.com/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) return alert(data.message || "Login failed");

    alert("OTP sent to email");
    setStep(2);
  }

  async function verifyOtp() {
    if (!otp) return alert("Enter OTP");

    const res = await fetch("https://admin.bezalelsolar.com/api/admin/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });

    const data = await res.json();

    if (!res.ok) return alert(data.message || "OTP failed");

    // SAVE TOKEN
    localStorage.setItem("adminToken", data.token);

    // REDIRECT
    router.push("/admin/dashboard");
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
            />
            <input type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />

            <button
              onClick={sendOtp}
              className="w-full bg-[#4EA674] text-white p-2 rounded"
            >
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />
            <button
              onClick={verifyOtp}
              className="w-full bg-[#4EA674] text-white p-2 rounded"
            >
              Verify OTP
            </button>
          </>
        )}
      </div>
    </div>
  );
}
