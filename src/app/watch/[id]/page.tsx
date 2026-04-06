"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LiveKitRoom,
  useParticipants,
  useTracks,
  VideoTrack,
  AudioTrack,
  isTrackReference,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useParams } from "next/navigation";
import "@livekit/components-styles";
import { getStreamById } from "@/lib/api";
import { ErrorBoundary, StreamErrorFallback } from "@/components/ErrorBoundary";
import Chat from "@/components/chat/Chat";
import React from "react";



// ─── Live viewer count badge ──────────────────────────────────────────────────
function ViewerCount() {
  const participants = useParticipants();
  // exclude the streamer (host) — count only non-publishing participants
  const viewers = participants.filter((p) => !p.isLocal && !p.isSpeaking);
  return (
    <span style={styles.viewerBadge}>
      <span style={styles.liveDot} />
      {participants.length} watching
    </span>
  );
}

// ─── Main video area — renders the streamer's camera track ───────────────────
function StreamVideo() {
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: true }
  );

  // Pick the first remote camera track that is a real (non-placeholder) TrackReference
  const streamerTrack = tracks.find(
    (t) => !t.participant.isLocal && isTrackReference(t)
  );

  if (!streamerTrack || !isTrackReference(streamerTrack) || !streamerTrack.publication.isSubscribed) {
    return (
      <div style={styles.offlinePlaceholder}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
        <p style={{ color: "#555", marginTop: 16, fontFamily: "'DM Sans', sans-serif" }}>
          Stream is offline or loading…
        </p>
      </div>
    );
  }

  return (
    <div style={styles.videoWrapper}>
      <VideoTrack
        trackRef={streamerTrack}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {/* Overlay gradient for bottom controls */}
      <div style={styles.videoGradient} />
      {/* LIVE badge */}
      <div style={styles.liveBadgeContainer}>
        <span style={styles.liveBadge}>● LIVE</span>
        <ErrorBoundary fallback={<></>}>
          <ViewerCount />
        </ErrorBoundary>
      </div>
    </div>
  );
}

// ─── Subscribe to streamer's audio silently ───────────────────────────────────
function StreamAudio() {
  const tracks = useTracks(
    [{ source: Track.Source.Microphone, withPlaceholder: false }],
    { onlySubscribed: true }
  );
  const streamerAudio = tracks.find(
    (t) => !t.participant.isLocal && isTrackReference(t)
  );
  if (!streamerAudio || !isTrackReference(streamerAudio)) return null;
  return <AudioTrack trackRef={streamerAudio} />;
}

// ─── Chat sidebar ─────────────────────────────────────────────────
function ChatSidebar({ streamId }: { streamId: string }) {
  return (
    <aside style={styles.sidebar}>
      <Chat streamId={streamId} />
    </aside>
  );
}

// ─── Inner room content (needs room context) ──────────────────────────────────
function RoomContent({ streamData }: { streamData: any }) {
  return (
    <div style={styles.layout}>
      <main style={styles.mainVideo}>
        <ErrorBoundary fallback={<StreamErrorFallback />}>
          <StreamVideo />
        </ErrorBoundary>
        <ErrorBoundary fallback={<></>}>
          <StreamAudio />
        </ErrorBoundary>
      </main>
      <ChatSidebar streamId={streamData?.streamId} />
    </div>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────
export default function WatchPage() {
  const { id } = useParams();
  const [token, setToken] = useState<string | null>(null);
  const streamId = Array.isArray(id) ? id[0] : id;

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ["stream", streamId],
    queryFn: () => {
      if (!streamId) throw new Error("Stream ID is required");
      return getStreamById(streamId);
    },
    enabled: !!streamId
  });

  const streamData = data?.stream;
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Unknown error") : null;

  // Set token once data is available
  useEffect(() => {
    if (data?.token && !token) {
      setToken(data.token);
    }
  }, [data?.token, token]);


  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-cliff-bg flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-cliff-border border-t-cliff-accent animate-spin" />
        <p className="text-cliff-faint text-sm font-dm">Connecting to stream…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-cliff-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="h-screen w-screen bg-cliff-bg flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-cliff-border border-t-cliff-accent animate-spin" />
        <p className="text-cliff-faint text-sm font-dm">Loading stream…</p>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        connect={true}
        video={false}
        audio={false}
        data-lk-theme="default"
        onDisconnected={() => setToken(null)}
      >
        <ErrorBoundary fallback={<StreamErrorFallback />}>
          <RoomContent streamData={streamData} />
        </ErrorBoundary>
      </LiveKitRoom>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  root: {
    height: "100vh",
    width: "100vw",
    background: "#0e0e10",
    overflow: "hidden",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  layout: {
    display: "flex",
    height: "100vh",
    width: "100%",
  },
  mainVideo: {
    flex: 1,
    position: "relative",
    background: "#000",
    overflow: "hidden",
  },
  videoWrapper: {
    position: "absolute",
    inset: 0,
  },
  videoGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "80px",
    background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
    pointerEvents: "none",
  },
  liveBadgeContainer: {
    position: "absolute",
    top: 14,
    left: 14,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  liveBadge: {
    background: "#e03131",
    color: "#fff",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    padding: "3px 8px",
    borderRadius: "3px",
    fontFamily: "'DM Sans', sans-serif",
  },
  viewerBadge: {
    background: "rgba(0,0,0,0.55)",
    color: "#eee",
    fontSize: "12px",
    padding: "3px 8px",
    borderRadius: "3px",
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontFamily: "'DM Sans', sans-serif",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#69db7c",
    display: "inline-block",
  },
  offlinePlaceholder: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#111",
  },
  sidebar: {
    width: "320px",
    minWidth: "300px",
    height: "100vh",
    background: "#18181b",
    borderLeft: "1px solid #2a2a2e",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "16px",
    borderBottom: "1px solid #2a2a2e",
  },
  streamerAvatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #9146ff, #6441a4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: 18,
    flexShrink: 0,
  },
  streamerName: {
    margin: 0,
    color: "#efeff1",
    fontWeight: 700,
    fontSize: 14,
  },
  streamTitle: {
    margin: 0,
    color: "#adadb8",
    fontSize: 12,
    marginTop: 2,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "200px",
  },
  followBtn: {
    margin: "12px 16px",
    padding: "9px 0",
    background: "#9146ff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    width: "calc(100% - 32px)",
    fontFamily: "'DM Sans', sans-serif",
  },
  divider: {
    height: 1,
    background: "#2a2a2e",
    margin: "0 0 8px",
  },
  chatMessages: {
    flex: 1,
    overflowY: "auto",
    padding: "0 12px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  chatMsg: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
  chatInputRow: {
    display: "flex",
    gap: 6,
    padding: "12px",
    borderTop: "1px solid #2a2a2e",
  },
  chatInput: {
    flex: 1,
    background: "#2a2a2e",
    border: "1px solid #3a3a3e",
    borderRadius: "4px",
    padding: "8px 10px",
    color: "#efeff1",
    fontSize: 13,
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
  },
  chatSendBtn: {
    background: "#9146ff",
    border: "none",
    borderRadius: "4px",
    color: "#fff",
    padding: "0 12px",
    cursor: "pointer",
    fontSize: 14,
  },
  loadingScreen: {
    height: "100vh",
    background: "#0e0e10",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid #2a2a2e",
    borderTopColor: "#9146ff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};