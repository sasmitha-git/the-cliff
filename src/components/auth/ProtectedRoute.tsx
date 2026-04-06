"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "viewer" | "streamer";
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    if (requiredRole && user?.role !== requiredRole) { router.push("/"); return; }
  }, [isAuthenticated, loading, user, requiredRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cliff-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cliff-border border-t-cliff-accent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (requiredRole && user?.role !== requiredRole) return null;

  return <>{children}</>;
};