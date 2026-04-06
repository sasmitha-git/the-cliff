import mongoose from "mongoose";
import { title } from "node:process";

const streamSchema = new mongoose.Schema({

    streamId: {
        type: String,
        required: true,
        unique: true
    },
    streamer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    title: String,
    description: String,
    viewers: {
        type: Number,
        default: 0
    },
    isLive: {
        type: Boolean,
        default: false
    },
    liveKitToken: String,
    
    // ── Session Recovery ────────────────────────────────────────────────────
    // "active" = currently streaming, "disconnected" = connection lost (30s grace period), "ended" = finished
    status: {
        type: String,
        enum: ["active", "disconnected", "ended"],
        default: "ended"
    },
    disconnectedAt: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
});

export const Stream = mongoose.model("Stream", streamSchema);