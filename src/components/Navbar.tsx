"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutUser } from "@/lib/api";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      logout();
      localStorage.removeItem("age_verified");
      router.push("/");
    }
  };

  if (!mounted) return null;

  return (
    <nav className="sticky top-0 z-50 bg-cliff-surface/80 backdrop-blur-xl border-b border-cliff-border/50 shadow-lg shadow-black/10">
      <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          href="/"
          className="font-syne font-black text-2xl text-cliff-text tracking-tight hover:text-cliff-accent transition-all duration-200 hover:scale-105"
        >
          <span className="bg-gradient-to-r from-cliff-text to-cliff-accent bg-clip-text text-transparent">
            The Cliff
          </span>
        </Link>

        {/* Nav links — center */}
        {isAuthenticated && (
          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/home"
              className="relative text-cliff-subtle hover:text-cliff-text text-sm px-4 py-2 rounded-xl hover:bg-white/5 transition-all duration-200 font-medium"
            >
              <span className="relative z-10">Live Streams</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cliff-accent/0 to-cliff-accent/0 hover:from-cliff-accent/10 hover:to-cliff-live/10 rounded-xl transition-all duration-200" />
            </Link>
            {user?.role === "streamer" && (
              <Link
                href="/dashboard/streamer"
                className="relative text-cliff-subtle hover:text-cliff-text text-sm px-4 py-2 rounded-xl hover:bg-white/5 transition-all duration-200 font-medium"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cliff-live animate-pulse" />
                  Go Live
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cliff-accent/0 to-cliff-accent/0 hover:from-cliff-accent/10 hover:to-cliff-live/10 rounded-xl transition-all duration-200" />
              </Link>
            )}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              {/* User pill */}
              <div className="hidden sm:flex items-center gap-3 bg-cliff-surface/60 backdrop-blur-sm border border-cliff-border/50 rounded-full px-4 py-2 hover:bg-cliff-surface/80 transition-all duration-200">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md"
                  style={{
                    background: `linear-gradient(135deg, hsl(${(user.username?.charCodeAt(0) ?? 0) * 37 % 360},60%,45%), hsl(${((user.username?.charCodeAt(0) ?? 0) * 37 % 360 + 50) % 360},55%,35%))`,
                  }}
                >
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <span className="text-cliff-text text-sm font-medium">{user.username}</span>
                {user.role === "streamer" && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cliff-accent bg-cliff-accent/10 px-2 py-1 rounded-full">
                    Live
                  </span>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="text-xs font-bold text-cliff-faint hover:text-red-400 transition-all duration-200 px-4 py-2 rounded-xl hover:bg-red-400/10 border border-transparent hover:border-red-400/20"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-cliff-subtle hover:text-cliff-text text-sm transition-all duration-200 px-4 py-2 rounded-xl hover:bg-white/5 font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-cliff-accent to-cliff-live text-cliff-bg text-xs font-bold px-6 py-2 rounded-xl hover:shadow-lg hover:shadow-cliff-accent/25 transition-all duration-200 hover:scale-105"
              >
                Join free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}