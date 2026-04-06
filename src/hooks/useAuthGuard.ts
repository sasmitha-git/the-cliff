"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api";

export const useAuthGuard = (requiredRole?: "viewer" | "streamer") => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getMe();

        if (requiredRole && data.user.role !== requiredRole) {
          router.push("/home");
        }

      } catch (err) {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router, requiredRole]);
};