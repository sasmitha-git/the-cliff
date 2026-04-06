import express from "express";
import { AccessToken } from "livekit-server-sdk";
import { randomUUID } from "crypto"
import { Server as SocketIOServer } from "socket.io";
import { authMiddleware, isStreamer, optionalAuth } from "../middleware/authMiddleware";
import { Stream } from "../models/stream";
import { startRecoveryPeriod, canResumeStream, resumeStream, permanentlyEndStream } from "../services/recoveryService";


export const createStreamRouter = (io: SocketIOServer) => {

  const router = express.Router();

  // ── Get all live streams ─────────────────────────────────────────────────────
  router.get("/", async (_req, res) => {
    try {
      const streams = await Stream.find({})
        .populate("streamer", "username")
        .sort({ isLive: -1, createdAt: -1 });
      res.json({ streams });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });

  // ── Get a single stream by streamId (viewer joins) ───────────────────────────
  router.get("/:id", optionalAuth, async (req: any, res) => {
    try {
      const stream = await Stream.findOne({ streamId: req.params.id })
        .populate("streamer", "username");

      if (!stream) return res.status(404).json({ message: "Stream not found" });

      // Logged in user gets their identity, guest gets a random one
      const identity = req.user?.id ?? `guest-${randomUUID()}`;
      const displayName = req.user?.username ?? "Guest";

      const at = new AccessToken(
        process.env.LIVEKIT_API_KEY!,
        process.env.LIVEKIT_API_SECRET!,
        { identity, name: displayName }
      );
      at.addGrant({ roomJoin: true, room: stream.streamId, canPublish: false, canSubscribe: true });

      res.json({ stream, token: await at.toJwt() });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });

  // ── Start a stream (streamer only) ───────────────────────────────────────────
  router.post("/start", authMiddleware, isStreamer, async (req: any, res) => {
    try {
      const { title } = req.body;
      if (!title?.trim()) return res.status(400).json({ message: "Title is required" });

      const streamId = randomUUID(); // New LiveKit room ID for this session

      const at = new AccessToken(
        process.env.LIVEKIT_API_KEY!,
        process.env.LIVEKIT_API_SECRET!,
        { identity: req.user.id, name: req.user.username }
      );
      at.addGrant({ roomJoin: true, room: streamId, canPublish: true, canSubscribe: true });

      // THE FIX: Update their existing "Channel" or create one if it's their first time streaming
      const stream = await Stream.findOneAndUpdate(
        { streamer: req.user.id }, // Find by user ID
        {
          streamId: streamId,      // Update to the new LiveKit Room ID
          title: title.trim(),     // Update to the new title
          isLive: true             // Set status to live
        },
        { returnDocument: 'after', upsert: true } // Return the updated doc, create if missing
      ).populate("streamer", "username");

      io.emit("new-stream", {
        streamId: stream.streamId,
        title: stream.title,
        streamerName: req.user.username,
      });

      res.json({ stream, token: await at.toJwt() });
    } catch (error) {
      console.error("Error starting stream:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ── End a stream (with 30s recovery grace period) ─────────────────────────────
  router.post("/end", authMiddleware, isStreamer, async (req: any, res) => {
    try {
      // THE FIX: Find their stream and mark as disconnected (not permanently ended)
      const stream = await Stream.findOne({ streamer: req.user.id });

      if (!stream) {
        return res.status(404).json({ message: "Stream not found" });
      }

      // Start the 30-second recovery grace period
      await startRecoveryPeriod(stream.streamId);

      // Notify viewers that stream is temporarily unavailable
      io.emit("stream-disconnected", {
        streamId: stream.streamId,
        message: "Stream temporarily disconnected. Streamer may reconnect..."
      });

      res.json({ message: "Stream disconnected. You have 30 seconds to reconnect." });
    } catch (err) {
      console.error("Error ending stream:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ── Resume a disconnected stream (within 30s window) ────────────────────────
  router.post("/resume", authMiddleware, isStreamer, async (req: any, res) => {
    try {
      const stream = await Stream.findOne({ streamer: req.user.id });

      if (!stream) {
        return res.status(404).json({ message: "Stream not found" });
      }

      // Check if stream can be resumed (still within grace period)
      const canResume = await canResumeStream(stream.streamId);

      if (!canResume) {
        return res.status(400).json({
          message: "Recovery window expired. Please start a new stream."
        });
      }

      // Generate new token for the same streamId
      const at = new AccessToken(
        process.env.LIVEKIT_API_KEY!,
        process.env.LIVEKIT_API_SECRET!,
        { identity: req.user.id, name: req.user.username }
      );
      at.addGrant({
        roomJoin: true,
        room: stream.streamId,
        canPublish: true,
        canSubscribe: true
      });

      // Mark stream as active again
      await resumeStream(stream.streamId);

      // Notify viewers that stream is back
      io.emit("stream-resumed", {
        streamId: stream.streamId,
        title: stream.title
      });

      res.json({
        stream,
        token: await at.toJwt(),
        message: "Stream resumed!"
      });
    } catch (err) {
      console.error("Error resuming stream:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ── Permanently end stream (cancel recovery) ────────────────────────────────
  router.post("/end-permanently", authMiddleware, isStreamer, async (req: any, res) => {
    try {
      const stream = await Stream.findOne({ streamer: req.user.id });

      if (!stream) {
        return res.status(404).json({ message: "Stream not found" });
      }

      // Permanently end the stream (cancel recovery)
      await permanentlyEndStream(stream.streamId);

      io.emit("stream-ended", {
        streamId: stream.streamId,
        message: "Stream has ended"
      });

      res.json({ message: "Stream ended permanently" });
    } catch (err) {
      console.error("Error ending stream permanently:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  return router;

}



