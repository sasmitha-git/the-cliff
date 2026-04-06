import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { connectDB } from "./config/db";
import app, { setIO } from "./app";
import { handleSocketConnection } from "./socket/socketHandler";
import { Stream } from "./models/stream";

connectDB().then(async () => {
  await Stream.updateMany({ isLive: true }, { isLive: false });
  console.log("Stale streams cleaned up");
});

const server = createServer(app);

const corsOrigin = process.env.CLIENT_URL || "http://localhost:3000";
const port = process.env.PORT || 5000;

const io = new SocketIOServer(server, {
  cors: { origin: corsOrigin, credentials: true },
});

setIO(io); // ← inject io into routes
handleSocketConnection(io);

server.listen(port, () => console.log(`Server running on port ${port}`));