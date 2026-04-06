"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import {
  LiveKitRoom,
  useTracks,
  VideoTrack,
  useLocalParticipant,
  useParticipants,
  isTrackReference,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { startStream, endStream, resumeStream, endStreamPermanently } from "@/lib/api";
import { validateStreamTitle } from "@/lib/validation";
import Chat from "@/components/chat/Chat";

// ─── Error Boundary ───────────────────────────────────────────────────────────
class StreamErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) { console.warn("[StreamErrorBoundary]", error.message); }
  render() {
    if (this.state.hasError)
      return <div className="text-cliff-faint text-center p-4 text-sm">Video unavailable</div>;
    return this.props.children;
  }
}

// ─── Local camera preview ─────────────────────────────────────────────────────
function LocalCameraPreview() {
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
  const localTrack = tracks.find((t) => t.participant.isLocal && isTrackReference(t));

  if (!localTrack || !isTrackReference(localTrack) || !localTrack.publication.track) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-cliff-muted">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5">
          <path d="M15 10l4.553-2.275A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          <line x1="3" y1="3" x2="21" y2="21" />
        </svg>
        <p className="text-cliff-faint text-sm mt-3 font-dm">Camera is off</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <VideoTrack trackRef={localTrack} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <span className="absolute top-3 right-3 bg-black/60 text-cliff-subtle text-[10px] font-bold tracking-widest px-2 py-1 rounded">
        PREVIEW
      </span>
    </div>
  );
}

// ─── Viewer count ─────────────────────────────────────────────────────────────
function ViewerCount() {
  const participants = useParticipants();
  const count = participants.filter((p) => !p.isLocal).length;
  return (
    <span className="flex items-center gap-1.5 bg-black/30 text-cliff-subtle text-xs px-3 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-cliff-green inline-block animate-pulse" />
      {count} viewer{count !== 1 ? "s" : ""}
    </span>
  );
}

// ─── Controls ─────────────────────────────────────────────────────────────────
function StreamControls({ onEnd }: { onEnd: () => void }) {
  const { localParticipant } = useLocalParticipant();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const toggleMic = () => { localParticipant.setMicrophoneEnabled(!micOn); setMicOn((v) => !v); };
  const toggleCam = () => { localParticipant.setCameraEnabled(!camOn); setCamOn((v) => !v); };

  return (
    <div className="bg-cliff-surface border-t border-cliff-border flex items-center gap-3 px-4 h-16">
      <button
        onClick={toggleMic}
        title={micOn ? "Mute" : "Unmute"}
        className={`w-10 h-10 rounded-lg flex items-center justify-center text-base transition-colors ${micOn ? "bg-cliff-muted hover:bg-cliff-border" : "bg-cliff-live"
          }`}
      >
        {micOn ? "🎙️" : "🔇"}
      </button>
      <button
        onClick={toggleCam}
        title={camOn ? "Camera off" : "Camera on"}
        className={`w-10 h-10 rounded-lg flex items-center justify-center text-base transition-colors ${camOn ? "bg-cliff-muted hover:bg-cliff-border" : "bg-cliff-live"
          }`}
      >
        {camOn ? "📷" : "🚫"}
      </button>

      <StreamErrorBoundary>
        <ViewerCount />
      </StreamErrorBoundary>

      <button
        onClick={onEnd}
        className="ml-auto bg-cliff-live hover:opacity-90 text-white text-xs font-bold px-4 py-2 rounded-lg transition-opacity"
      >
        ■ End Stream
      </button>
    </div>
  );
}

// ─── Live layout ──────────────────────────────────────────────────────────────
function LiveRoomLayout({ title, streamId, onEnd }: { title: string; streamId: string | null; onEnd: () => void }) {
  return (
    <div className="h-screen bg-cliff-bg grid font-dm" style={{ gridTemplateColumns: "1fr 320px", gridTemplateRows: "56px 1fr 64px auto" }}>
      {/* Top bar */}
      <header className="col-span-2 bg-cliff-surface border-b border-cliff-border flex items-center px-5 gap-3">
        <span className="bg-cliff-live text-white text-[11px] font-bold tracking-widest px-2 py-1 rounded">
          ● LIVE
        </span>
        <span className="text-cliff-text text-sm font-semibold truncate">{title}</span>
      </header>

      {/* Camera */}
      <div className="relative overflow-hidden bg-black">
        <StreamErrorBoundary>
          <LocalCameraPreview />
        </StreamErrorBoundary>
      </div>

      {/* Chat */}
      <div className="bg-cliff-surface border-l border-cliff-border p-4">
        {streamId && <Chat streamId={streamId} />}
      </div>

      {/* Controls */}
      <div className="col-span-2">
        <StreamErrorBoundary>
          <StreamControls onEnd={onEnd} />
        </StreamErrorBoundary>
      </div>

      {/* Tips */}
      <div className="col-span-2 bg-cliff-surface border-t border-cliff-border px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-cliff-faint mb-2">Stream Tips</p>
        {[
          "💡 Good lighting improves viewer retention.",
          "🎙️ Use a headset to reduce echo.",
          "📶 Ethernet > Wi-Fi for stable streams.",
        ].map((tip) => (
          <p key={tip} className="text-cliff-faint text-xs mb-1">{tip}</p>
        ))}
      </div>
    </div>
  );
}

// ─── Setup form ───────────────────────────────────────────────────────────────
function SetupForm({ username, onGoLive }: { username: string; onGoLive: (title: string, token: string, streamId: string) => void }) {
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");

  const { mutate, isPending, error } = useMutation({
    mutationFn: (title: string) => startStream({ title }),
    onSuccess: (data) => {
      onGoLive(title, data.token, data.stream.streamId);
    },
    onError: (err) => {
      console.error("Stream start error:", err);
    },
  });

  const handleStartStream = () => {
    setTitleError("");
    const validation = validateStreamTitle(title);
    if (!validation.valid) {
      setTitleError(validation.error || "Invalid title");
      return;
    }
    mutate(title);
  };

  return (
    <div className="min-h-screen bg-cliff-bg flex items-center justify-center px-4 font-dm">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl bg-cliff-muted border border-cliff-border flex items-center justify-center text-3xl mb-6">
          📡
        </div>

        <h1 className="font-syne font-black text-3xl text-cliff-text tracking-tight mb-1">Go Live</h1>
        <p className="text-cliff-subtle text-sm mb-8">Welcome back, {username}</p>

        <div className="bg-cliff-surface border border-cliff-border rounded-xl p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-cliff-faint">
              Stream Title
            </label>
            <input
              type="text"
              placeholder="What are you streaming today?"
              value={title}
              maxLength={80}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && !isPending && handleStartStream()}
              className="bg-cliff-bg border border-cliff-border rounded-lg px-4 py-2.5 text-sm text-cliff-text placeholder:text-cliff-faint outline-none focus:border-cliff-accent transition-colors"
            />
          </div>

          {titleError && (
            <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {titleError}
            </p>
          )}

          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error instanceof Error ? error.message : "Failed to start stream"}
            </p>
          )}

          <button
            onClick={handleStartStream}
            disabled={isPending || !title.trim()}
            className="w-full bg-cliff-accent text-cliff-bg font-bold text-sm py-2.5 rounded-lg transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-cliff-bg/30 border-t-cliff-bg animate-spin" />
                Starting…
              </>
            ) : (
              "● Go Live"
            )}
          </button>

          <div className="border-t border-cliff-border pt-4 flex flex-col gap-1.5">
            {["🎥 Camera & microphone required", "🔒 Stream is private until shared"].map((hint) => (
              <p key={hint} className="text-cliff-faint text-xs">{hint}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Recovery Modal ───────────────────────────────────────────────────────────
function RecoveryModal({
  show,
  timeLeft,
  isResuming,
  onReconnect,
  onEnd
}: {
  show: boolean;
  timeLeft: number;
  isResuming: boolean;
  onReconnect: () => void;
  onEnd: () => void;
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-cliff-surface border border-cliff-border rounded-lg p-6 max-w-sm mx-4">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-bold text-cliff-text mb-2">Connection Lost</h2>
          <p className="text-cliff-subtle text-sm mb-4">
            Your stream was disconnected. You have {timeLeft} seconds to reconnect.
          </p>
          <div className="text-2xl font-bold text-cliff-live">{timeLeft}s</div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onReconnect}
            disabled={isResuming}
            className="flex-1 bg-cliff-accent hover:opacity-90 disabled:opacity-50 text-cliff-bg font-bold py-2 rounded-lg transition-opacity flex items-center justify-center gap-2"
          >
            {isResuming ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-cliff-bg/30 border-t-cliff-bg animate-spin" />
                Reconnecting...
              </>
            ) : (
              "🔄 Reconnect"
            )}
          </button>
          <button
            onClick={onEnd}
            disabled={isResuming}
            className="flex-1 bg-cliff-muted hover:bg-cliff-border disabled:opacity-50 text-cliff-text font-bold py-2 rounded-lg transition-colors"
          >
            End Stream
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
function StreamerDashboardContent() {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [streamId, setStreamId] = useState<string | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryTimeLeft, setRecoveryTimeLeft] = useState(30);
  const [isRecovering, setIsRecovering] = useState(false);

  // Countdown timer for recovery window
  useEffect(() => {
    if (!showRecoveryModal) return;

    const interval = setInterval(() => {
      setRecoveryTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto-end stream after recovery window expires
          handlePermanentEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showRecoveryModal]);

  const handleGoLive = (streamTitle: string, streamToken: string, id: string) => {
    setTitle(streamTitle);
    setToken(streamToken);
    setStreamId(id);
    setShowRecoveryModal(false);
    setRecoveryTimeLeft(30);
  };

  const { mutate: endStreamMutation } = useMutation({
    mutationFn: endStream,
    onSuccess: () => {
      setShowRecoveryModal(true);
      setRecoveryTimeLeft(30);
    },
    onError: () => {
      setShowRecoveryModal(true);
      setRecoveryTimeLeft(30);
    },
  });

  const { mutate: resumeStreamMutation } = useMutation({
    mutationFn: resumeStream,
    onSuccess: (data) => {
      setToken(data.token);
      setStreamId(data.stream.streamId);
      setTitle(data.stream.title);
      setShowRecoveryModal(false);
      setIsRecovering(false);
    },
    onError: () => {
      setIsRecovering(false);
    },
  });

  const { mutate: endPermanentlyMutation } = useMutation({
    mutationFn: endStreamPermanently,
    onSuccess: () => {
      setToken(null);
      setTitle("");
      setStreamId(null);
      setShowRecoveryModal(false);
      setRecoveryTimeLeft(30);
    },
    onError: () => {
      setToken(null);
      setTitle("");
      setStreamId(null);
      setShowRecoveryModal(false);
      setRecoveryTimeLeft(30);
    },
  });

  const handleDisconnect = () => {
    // Stream was disconnected — trigger recovery flow
    endStreamMutation();
  };

  const handleReconnect = () => {
    setIsRecovering(true);
    resumeStreamMutation();
  };

  const handlePermanentEnd = () => {
    endPermanentlyMutation();
  };

  const handleEnd = () => {
    endStreamMutation();
  };

  if (!token) {
    return <SetupForm username={user?.username ?? "Streamer"} onGoLive={handleGoLive} />;
  }

  return (
    <>
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        connect={true}
        onDisconnected={handleDisconnect}
        data-lk-theme="default"
        style={{ height: "100vh" }}
      >
        <StreamErrorBoundary>
          <LiveRoomLayout title={title} streamId={streamId} onEnd={handleEnd} />
        </StreamErrorBoundary>
      </LiveKitRoom>

      <RecoveryModal
        show={showRecoveryModal}
        timeLeft={recoveryTimeLeft}
        isResuming={isRecovering}
        onReconnect={handleReconnect}
        onEnd={handlePermanentEnd}
      />
    </>
  );
}

// ─── Original Shell ────────────────────────────────────────────────────────────


export default function StreamerDashboard() {
  return (
    <ProtectedRoute requiredRole="streamer">
      <StreamerDashboardContent />
    </ProtectedRoute>
  );
}