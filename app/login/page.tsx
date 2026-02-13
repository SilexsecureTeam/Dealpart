'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLogin } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [next, setNext] = useState('/');
  
  // Read 'next' parameter from URL safely
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNext(params.get('next') || '/');
  }, []);

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!login || !password) {
      setMsg('Enter email/phone and password');
      return;
    }

    try {
      await loginMutation.mutateAsync({ login, password });
      router.push(next);
    } catch (e: any) {
      setMsg(e.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-xl font-bold text-center mb-4">Login</h2>
        {msg && <p className="text-red-600 text-sm mb-3">{msg}</p>}
        
        <form onSubmit={handleSubmit}>
          <input
            className="w-full border p-2 rounded mb-3"
            placeholder="Email or phone"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            disabled={loginMutation.isPending}
          />
          <input
            type="password"
            className="w-full border p-2 rounded mb-4"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loginMutation.isPending}
          />
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-[#4EA674] text-white py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          New user?{' '}
          <Link
            href={`/register?next=${encodeURIComponent(next)}`}
            className="text-[#4EA674] font-semibold hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}