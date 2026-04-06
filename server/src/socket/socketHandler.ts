import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

// In-memory store: streamId -> last N messages (no DB needed)
const RECENT_MESSAGE_LIMIT = 50;
const recentMessages = new Map<string, ChatMessageData[]>();

interface ChatMessageData {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

function addToRecent(streamId: string, msg: ChatMessageData) {
  const msgs = recentMessages.get(streamId) ?? [];
  msgs.push(msg);
  // Keep only last N messages in memory — no DB writes needed
  if (msgs.length > RECENT_MESSAGE_LIMIT) msgs.shift();
  recentMessages.set(streamId, msgs);
}

function getRecent(streamId: string): ChatMessageData[] {
  // Only return last 15 messages to new joiners — just enough context
  const msgs = recentMessages.get(streamId) ?? [];
  return msgs.slice(-15);
}

// Sanitize: strip HTML tags, trim whitespace
function sanitize(text: string): string {
  return text
    .replace(/[<>]/g, "")   // strip angle brackets (XSS prevention)
    .trim()
    .slice(0, 500);          // hard cap
}

export const handleSocketConnection = (io: SocketIOServer) => {
  io.on("connection", (socket: AuthenticatedSocket) => {

    // ── Authenticate on connect ──────────────────────────────────────────────
    const token = socket.handshake.auth?.token;

    if (!token) {
      socket.emit("unauthenticated");
      return; // Don't let unauthenticated sockets proceed at all
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        username: string;
        role: string;
      };
      socket.userId = decoded.id;
      socket.username = decoded.username;
      socket.emit("authenticated");
    } catch {
      socket.emit("unauthenticated");
      socket.disconnect(true); // Boot invalid tokens immediately
      return;
    }

    // ── Join a stream room ───────────────────────────────────────────────────
    socket.on("join-stream", (streamId: string) => {
      if (!streamId || typeof streamId !== "string") return;

      socket.join(streamId);

      // Send the last few messages from memory — no DB query
      const history = getRecent(streamId);
      socket.emit("chat-history", history);
    });

    // ── Leave a stream room ──────────────────────────────────────────────────
    socket.on("leave-stream", (streamId: string) => {
      socket.leave(streamId);
    });

    // ── Handle incoming chat message ─────────────────────────────────────────
    socket.on("send-message", (data: { streamId: string; message: string }) => {
      if (!socket.userId || !socket.username) return;
      if (!data?.streamId || !data?.message) return;

      const clean = sanitize(data.message);
      if (!clean) return; // Empty after sanitize

      const msg: ChatMessageData = {
        id: `${Date.now()}-${socket.userId}`,
        username: socket.username,
        message: clean,
        timestamp: Date.now(),
      };

      // Store in memory only — no DB write
      addToRecent(data.streamId, msg);

      // Broadcast to everyone in the room (including sender)
      io.to(data.streamId).emit("new-message", msg);
    });

    socket.on("disconnect", () => {
      // Nothing to clean up — memory is shared across connections
    });
  });

  // ── Clean up memory when a stream ends ──────────────────────────────────
  // Call this from your stream end route: cleanStreamRoom(streamId)
  return {
    cleanStreamRoom: (streamId: string) => {
      recentMessages.delete(streamId);
    },
  };
};