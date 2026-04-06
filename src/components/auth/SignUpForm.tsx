"use client";

import { useState } from "react";
import { signupUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
  role: "viewer" | "streamer";
};

export default function SignUpForm({ role }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signupUser({ ...form, role });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const isStreamer = role === "streamer";

  return (
    <div className="min-h-screen bg-cliff-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-3xl font-black font-syne text-cliff-text tracking-tight">
            The Cliff
          </span>
          <p className="text-cliff-subtle text-sm mt-1">
            {isStreamer ? "Create a streamer account" : "Create a viewer account"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-cliff-surface border border-cliff-border rounded-xl p-8 flex flex-col gap-5"
        >
          {/* Role badge */}
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                isStreamer
                  ? "text-cliff-accent border-cliff-accent/40 bg-cliff-accent/10"
                  : "text-cliff-green border-cliff-green/40 bg-cliff-green/10"
              }`}
            >
              {isStreamer ? "📡 Streamer" : "👁 Viewer"}
            </span>
          </div>

          {[
            { name: "username", label: "Username", type: "text",     placeholder: "coolstreamer" },
            { name: "email",    label: "Email",    type: "email",    placeholder: "you@example.com" },
            { name: "password", label: "Password", type: "password", placeholder: "Min. 8 characters" },
          ].map((field) => (
            <div key={field.name} className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-cliff-faint">
                {field.label}
              </label>
              <input
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                required
                className="bg-cliff-bg border border-cliff-border rounded-lg px-4 py-2.5 text-sm text-cliff-text placeholder:text-cliff-faint outline-none focus:border-cliff-accent transition-colors"
              />
            </div>
          ))}

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
            {loading ? "Creating account…" : "Create Account"}
          </button>

          <p className="text-center text-cliff-faint text-xs">
            Already have an account?{" "}
            <Link href="/login" className="text-cliff-accent hover:underline">
              Sign in
            </Link>
          </p>
        </form>

        {/* Switch role */}
        <p className="text-center text-cliff-faint text-xs mt-4">
          {isStreamer ? (
            <>
              Just watching?{" "}
              <Link href="/register" className="text-cliff-subtle hover:text-cliff-text transition-colors">
                Register as viewer →
              </Link>
            </>
          ) : (
            <>
              Want to stream?{" "}
              <Link href="/register-model" className="text-cliff-subtle hover:text-cliff-text transition-colors">
                Become a streamer →
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}