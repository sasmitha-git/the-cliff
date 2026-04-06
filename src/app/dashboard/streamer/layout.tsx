"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function StreamerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthGuard("streamer");

  return <>{children}</>;
}