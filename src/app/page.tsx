"use client";

import { useQuery } from "@tanstack/react-query";
import { getStreams } from "../lib/api";
import { useAgeVerification } from "../hooks/useAgeVerification";

export default function AgeGate() {
  const { verifyAge } = useAgeVerification();
  const { data: streams = [] } = useQuery({
    queryKey: ["streams"],
    queryFn: getStreams,
  });

  const liveStreams = streams.filter(stream => stream.isLive);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cliff-bg via-cliff-bg to-cliff-muted/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cliff-accent/10 via-transparent to-cliff-live/10" />
        <div className="relative max-w-screen-2xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="font-syne font-black text-5xl md:text-6xl text-cliff-text tracking-tight mb-4">
              Discover Live Streams
            </h1>
            <p className="text-cliff-subtle text-lg md:text-xl max-w-2xl mx-auto font-dm">
              Join thousands of viewers watching amazing content creators in real-time
            </p>
            <div className="mt-8 flex items-center justify-center gap-4 text-sm font-dm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cliff-live animate-pulse" />
                <span className="text-cliff-text">{liveStreams.length} Live Now</span>
              </div>
              <div className="w-px h-4 bg-cliff-border" />
              <span className="text-cliff-subtle">{streams.length} Total Streams</span>
            </div>
          </div>
        </div>
      </div>

      {/* Age Verification Card */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="bg-cliff-surface/80 backdrop-blur-xl border border-cliff-border/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <h2 className="text-2xl font-syne text-cliff-text mb-4 text-center font-bold">
            Welcome to The Cliff
          </h2>
          <p className="text-cliff-subtle mb-6 text-center font-dm">
            You must be 18+ to access this site.
          </p>
          <button
            onClick={verifyAge}
            className="w-full bg-gradient-to-r from-cliff-accent to-cliff-live text-cliff-bg font-bold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-cliff-accent/25 hover:scale-105 font-dm"
          >
            I am 18 or older
          </button>
        </div>
      </div>
    </div>
  );
}