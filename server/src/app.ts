import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import { createStreamRouter } from "./routes/streamRoutes";
import { Server as SocketIOServer } from "socket.io";

const app = express();

const corsOrigin = process.env.CLIENT_URL || "http://localhost:3000";
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

// io gets injected after server is created — store a setter
let _io: SocketIOServer;
export const setIO = (io: SocketIOServer) => {
  _io = io;
  app.use("/api/streams", createStreamRouter(_io));
};

export default app;