"use client";

import { useState } from "react";
import { signinUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signinUser(form);
      setUser(res.user);
      setToken(res.token || null);
      // Store token in localStorage for persistence
      if (res.token) {
        localStorage.setItem('authToken', res.token);
      }
      router.push(res.user.role === "streamer" ? "/dashboard/streamer" : "/home");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cliff-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-3xl font-black font-syne text-cliff-text tracking-tight">
            The Cliff
          </span>
          <p className="text-cliff-subtle text-sm mt-1">Sign in to continue</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-cliff-surface border border-cliff-border rounded-xl p-8 flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-cliff-faint">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="bg-cliff-bg border border-cliff-border rounded-lg px-4 py-2.5 text-sm text-cliff-text placeholder:text-cliff-faint outline-none focus:border-cliff-accent transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-cliff-faint">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="bg-cliff-bg border border-cliff-border rounded-lg px-4 py-2.5 text-sm text-cliff-text placeholder:text-cliff-faint outline-none focus:border-cliff-accent transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cliff-accent text-cliff-bg font-bold text-sm py-2.5 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 mt-1"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <p className="text-center text-cliff-faint text-xs">
            No account?{" "}
            <Link href="/register" className="text-cliff-accent hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}