"use client";

import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/context/SocketContext";

interface Message {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

export default function Chat({ streamId }: { streamId: string }) {
  const { socket, isAuthenticated } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasJoined = useRef(false);

  // ── Join room & bind listeners ─────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    // Prevent joining twice if effect re-runs with same socket
    if (!hasJoined.current) {
      socket.emit("join-stream", streamId);
      hasJoined.current = true;
    }

    const onHistory = (history: Message[]) => setMessages(history);
    const onMessage = (msg: Message) =>
      setMessages((prev) => [...prev, msg]);

    socket.on("chat-history", onHistory);
    socket.on("new-message", onMessage);

    return () => {
      socket.off("chat-history", onHistory);
      socket.off("new-message", onMessage);
      socket.emit("leave-stream", streamId);
      hasJoined.current = false;
    };
  }, [socket, isAuthenticated, streamId]);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send ───────────────────────────────────────────────────────────────────
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !isAuthenticated) return;
    socket.emit("send-message", { streamId, message: input });
    setInput("");
  };

  // ── Status label ───────────────────────────────────────────────────────────
  const statusLabel = !socket
    ? "No connection"
    : !socket.connected
    ? "Connecting…"
    : !isAuthenticated
    ? "Authenticating…"
    : "Live";

  const canChat = !!socket?.connected && isAuthenticated;

  return (
    <div className="flex flex-col h-full bg-[#18181b] text-white font-dm select-none">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#2a2a2e] flex items-center justify-between">
        <span className="text-sm font-semibold text-[#efeff1]">Stream Chat</span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            canChat
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-gray-700 text-gray-400"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-[#3a3a3e]">
        {messages.length === 0 && (
          <p className="text-[#6b6b6f] text-xs text-center mt-8">
            Be the first to chat!
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="text-[13px] leading-snug break-words">
            <span className="font-semibold text-[#9146ff]">{msg.username}</span>
            <span className="text-[#adadb8]">: </span>
            <span className="text-[#efeff1]">{msg.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={send}
        className="p-3 border-t border-[#2a2a2e] flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={canChat ? "Send a message…" : statusLabel}
          maxLength={500}
          disabled={!canChat}
          className="flex-1 bg-[#2a2a2e] text-[#efeff1] placeholder:text-[#6b6b6f] text-sm px-3 py-2 rounded border border-[#3a3a3e] focus:outline-none focus:border-[#9146ff] disabled:opacity-50 transition-colors"
        />
        <button
          type="submit"
          disabled={!canChat || !input.trim()}
          className="bg-[#9146ff] hover:bg-[#7d2ff7] disabled:bg-[#3a3a3e] disabled:cursor-not-allowed text-white text-sm font-semibold px-3 py-2 rounded transition-colors"
        >
          Chat
        </button>
      </form>
    </div>
  );
}