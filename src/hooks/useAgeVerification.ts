"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAgeVerification() {
  const router = useRouter();

  useEffect(() => {
    const verified = localStorage.getItem("age_verified");

    if (verified) {
      router.push("/home");
    }
  }, [router]);

  const verifyAge = () => {
    localStorage.setItem("age_verified", "true");
    router.push("/home");
  };

  return { verifyAge };
}