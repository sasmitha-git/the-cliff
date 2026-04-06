"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

export const AgeGateWrapper = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname === "/") {
      setLoading(false);
      return;
    }
    const verified = localStorage.getItem("age_verified");
    if (!verified) {
      router.push("/");
    } else {
      setIsVerified(true);
    }
    setLoading(false);
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cliff-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cliff-border border-t-cliff-accent animate-spin" />
      </div>
    );
  }

  if (pathname !== "/" && !isVerified) return null;

  return <>{children}</>;
};