import { Stream } from "../models/stream";

// In-memory store of recovery timeouts: streamId -> timeout ID
const recoveryTimeouts = new Map<string, NodeJS.Timeout>();

const RECOVERY_GRACE_PERIOD = 30 * 1000; // 30 seconds

/**
 * Mark a stream as disconnected and start the recovery grace period
 * If streamer doesn't reconnect within 30 seconds, stream ends automatically
 */
export const startRecoveryPeriod = async (streamId: string) => {
  try {
    // Clear any existing timeout for this stream
    if (recoveryTimeouts.has(streamId)) {
      clearTimeout(recoveryTimeouts.get(streamId)!);
    }

    // Mark stream as disconnected
    await Stream.findOneAndUpdate(
      { streamId },
      {
        status: "disconnected",
        disconnectedAt: new Date(),
        isLive: false
      }
    );

    // Set a timeout to auto-end the stream after grace period
    const timeout = setTimeout(async () => {
      try {
        await Stream.findOneAndUpdate(
          { streamId },
          {
            status: "ended",
            disconnectedAt: null,
            isLive: false
          }
        );
        recoveryTimeouts.delete(streamId);
        console.log(`[Recovery] Auto-ended stream ${streamId} after grace period`);
      } catch (err) {
        console.error("[Recovery] Error auto-ending stream:", err);
      }
    }, RECOVERY_GRACE_PERIOD);

    recoveryTimeouts.set(streamId, timeout);
    console.log(`[Recovery] Started 30s grace period for ${streamId}`);
  } catch (err) {
    console.error("[Recovery] Error starting recovery period:", err);
  }
};

/**
 * Check if a stream can be resumed (within grace period)
 */
export const canResumeStream = async (streamId: string): Promise<boolean> => {
  try {
    const stream = await Stream.findOne({ streamId });
    if (!stream || stream.status !== "disconnected") return false;

    const disconnectedTime = stream.disconnectedAt?.getTime() ?? 0;
    const now = Date.now();
    const elapsed = now - disconnectedTime;

    return elapsed < RECOVERY_GRACE_PERIOD;
  } catch (err) {
    console.error("[Recovery] Error checking if stream can resume:", err);
    return false;
  }
};

/**
 * Resume a disconnected stream
 */
export const resumeStream = async (streamId: string) => {
  try {
    // Clear the recovery timeout since streamer reconnected
    if (recoveryTimeouts.has(streamId)) {
      clearTimeout(recoveryTimeouts.get(streamId)!);
      recoveryTimeouts.delete(streamId);
    }

    // Mark stream as active again
    await Stream.findOneAndUpdate(
      { streamId },
      {
        status: "active",
        disconnectedAt: null,
        isLive: true
      }
    );

    console.log(`[Recovery] Resumed stream ${streamId}`);
  } catch (err) {
    console.error("[Recovery] Error resuming stream:", err);
  }
};

/**
 * Permanently end a stream (cancel recovery)
 */
export const permanentlyEndStream = async (streamId: string) => {
  try {
    // Clear the recovery timeout
    if (recoveryTimeouts.has(streamId)) {
      clearTimeout(recoveryTimeouts.get(streamId)!);
      recoveryTimeouts.delete(streamId);
    }

    // Mark as ended
    await Stream.findOneAndUpdate(
      { streamId },
      {
        status: "ended",
        disconnectedAt: null,
        isLive: false
      }
    );

    console.log(`[Recovery] Permanently ended stream ${streamId}`);
  } catch (err) {
    console.error("[Recovery] Error ending stream:", err);
  }
};
