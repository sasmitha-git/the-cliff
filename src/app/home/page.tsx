"use client";

import { useSocket } from "@/context/SocketContext";
import { useQueryClient ,useQuery} from "@tanstack/react-query";
import { getStreams } from "@/lib/api";
import StreamCard from "../../components/stream/StreamCard";
import { useEffect, useState } from "react";

export default function Home() {

  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const { data: streams = [], isLoading, error } = useQuery({
    queryKey: ["streams"],
    queryFn: getStreams,
  });

  useEffect(() => {
    if (!socket) return;

    const onStreamStarted = () => {
      queryClient.invalidateQueries({ queryKey: ["streams"] });
    };

    const onStreamEnded = () => {
      queryClient.invalidateQueries({ queryKey: ["streams"] });
    };

    socket.on("stream-started", onStreamStarted);
    socket.on("stream-ended", onStreamEnded);

    return () => {
      socket.off("stream-started", onStreamStarted);
      socket.off("stream-ended", onStreamEnded);
    };
  }, [socket, queryClient]);



  const [activeCategory, setActiveCategory] = useState("offline");

  // Split streams into live and featured (for demo, we'll simulate featured)
  const liveStreams = streams.filter(stream => stream.isLive);
  const offlineStreams = streams.filter(stream => !stream.isLive);
  const featuredStreams = streams.slice(0, 8); // Top 8 as featured

  const categories = [
    { id: "offline", label: "Offline Streams", count: offlineStreams.length },
    { id: "live", label: "Live Now", count: liveStreams.length },
    { id: "featured", label: "Featured", count: featuredStreams.length },
    { id: "gaming", label: "Gaming", count: Math.floor(streams.length * 0.6) },
    { id: "music", label: "Music", count: Math.floor(streams.length * 0.3) },
    { id: "chat", label: "Just Chatting", count: Math.floor(streams.length * 0.4) },
  ];

  const getFilteredStreams = () => {
    switch (activeCategory) {
      case "live":
        return liveStreams;
      case "featured":
        return featuredStreams;
      case "offline":
        return offlineStreams;
      default:
        return offlineStreams; 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cliff-bg via-cliff-bg to-cliff-muted/20">
      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              {/* Categories */}
              <div className="bg-cliff-surface/60 backdrop-blur-xl border border-cliff-border/50 rounded-2xl p-6 mb-6">
                <h3 className="font-syne font-bold text-cliff-text mb-4 text-lg">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-dm ${activeCategory === category.id
                        ? "bg-cliff-accent/20 text-cliff-accent border border-cliff-accent/30"
                        : "text-cliff-subtle hover:text-cliff-text hover:bg-white/5"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{category.label}</span>
                        <span className="text-xs bg-cliff-muted px-2 py-1 rounded-full">
                          {category.count}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-gradient-to-br from-cliff-accent/10 to-cliff-live/10 backdrop-blur-xl border border-cliff-border/50 rounded-2xl p-6">
                <h3 className="font-syne font-bold text-cliff-text mb-4 text-lg">Platform Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-cliff-subtle text-sm">Active Streams</span>
                    <span className="font-bold text-cliff-text">{liveStreams.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cliff-subtle text-sm">Total Viewers</span>
                    <span className="font-bold text-cliff-text">
                      {streams.reduce((acc, stream) => acc + (stream.viewersCount || 0), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cliff-subtle text-sm">Categories</span>
                    <span className="font-bold text-cliff-text">{categories.length - 1}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Live Now Section */}
            {liveStreams.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-cliff-live animate-pulse" />
                  <h2 className="font-syne font-bold text-2xl text-cliff-text">Live Now</h2>
                  <span className="text-cliff-subtle text-sm font-dm">({liveStreams.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {liveStreams.slice(0, 8).map((stream) => (
                    <StreamCard
                      key={stream._id}
                      id={stream.streamId}
                      title={stream.title}
                      streamerName={stream.streamer?.username || "Unknown"}
                      viewerCount={stream.viewersCount || 0}
                      isLive={stream.isLive}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Featured Streamers Section */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-cliff-accent" />
                <h2 className="font-syne font-bold text-2xl text-cliff-text">Featured Streamers</h2>
                <span className="text-cliff-subtle text-sm font-dm">({featuredStreams.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredStreams.map((stream) => (
                  <StreamCard
                    key={stream._id}
                    id={stream.streamId}
                    title={stream.title}
                    streamerName={stream.streamer?.username || "Unknown"}
                    viewerCount={stream.viewersCount || 0}
                    isLive={stream.isLive}
                  />
                ))}
              </div>
            </section>

            {/* All Streams Section */}
            {getFilteredStreams().length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-cliff-muted" />
                  <h2 className="font-syne font-bold text-2xl text-cliff-text">
                    {activeCategory === "offline" ? "Offline Streams" :
                      activeCategory === "live" ? "All Live Streams" :
                        activeCategory === "featured" ? "All Featured" :
                          categories.find(c => c.id === activeCategory)?.label || "Streams"}
                  </h2>
                  <span className="text-cliff-subtle text-sm font-dm">({getFilteredStreams().length})</span>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-cliff-border border-t-cliff-accent animate-spin" />
                      <p className="text-cliff-subtle text-sm font-dm">Finding active streams...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="bg-red-400/10 backdrop-blur-xl border border-red-400/30 text-red-400 p-6 rounded-2xl text-sm text-center">
                    {error instanceof Error ? error.message : "Failed to load streams"}
                  </div>
                ) : getFilteredStreams().length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-cliff-surface/60 backdrop-blur-xl border border-cliff-border/50 rounded-2xl p-8 max-w-md mx-auto">
                      <div className="w-16 h-16 rounded-full bg-cliff-muted flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📺</span>
                      </div>
                      <p className="text-cliff-subtle font-dm text-sm">No streams found in this category.</p>
                      <p className="text-cliff-faint text-xs mt-2">Try selecting a different category or check back later.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {getFilteredStreams().map((stream) => (
                      <StreamCard
                        key={stream._id}
                        id={stream.streamId}
                        title={stream.title}
                        streamerName={stream.streamer?.username || "Unknown"}
                        viewerCount={stream.viewersCount || 0}
                        isLive={stream.isLive}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}