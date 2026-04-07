# The Cliff

A live streaming platform I built to learn how real-time video and WebSocket-based chat actually work together. Streamers can go live, viewers can watch and chat, and if the connection drops there's a 30-second recovery window before the stream officially ends.

---

## 📱 Screenshots

![screenshot 1](docs/screenshots/1.png)
![screenshot 2](docs/screenshots/2.png)
![screenshot 3](docs/screenshots/3.png)
![screenshot 4](docs/screenshots/4.png)
![screenshot 5](docs/screenshots/5.png)
![screenshot 6](docs/screenshots/7.png)

---

## What it does

- Streamers sign up, hit "Go Live", and broadcast directly from their browser — no OBS needed
- Viewers get a shareable link and can watch with live chat alongside
- If a streamer's internet blips, a recovery modal gives them 30 seconds to reconnect without killing the stream for viewers
- Chat is in-memory only (no database writes per message) with the last 15 messages replayed to anyone who joins mid-stream
- Role-based auth — "streamer" accounts can publish, "viewer" accounts can only subscribe

---

## Tech Stack

| Layer | What I used |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS v4 |
| Backend | Express 5, TypeScript, ts-node-dev |
| Real-time video | LiveKit (WebRTC) + livekit-server-sdk 2.15 |
| Real-time chat | Socket.IO 4.8 |
| Database | MongoDB via Mongoose 9.3 |
| Auth | JWT (httpOnly cookies) + bcrypt |
| State | TanStack Query v5 |
| Containerization | Docker, Docker Compose |

---

## Architecture

```
Docker Compose Network
 ┌──────────────────────────────────┐
 │  Browser (Next.js Container)     │
 │    │                             │
 │    ├── LiveKit WebRTC ───────────┼──► LiveKit Cloud
 │    │                             │
 │    ├── REST / Socket.IO ─────────┼──► Express Container
 │    │                             │         │
 │    └─────────────────────────────┼──► MongoDB Container
 └──────────────────────────────────┘
```

When a stream starts, the backend mints a LiveKit access token and hands it to the client. The client connects directly to LiveKit for video — the Express server never touches the media itself. Chat goes through Socket.IO rooms keyed by `streamId`.

---

## 🚀 Quick Start (Docker — Recommended)

The fastest way to get the entire ecosystem (Frontend, Backend, and Database) running locally.

### 1. Clone the repo

```bash
git clone https://github.com/sasmitha-git/the-cliff.git
cd the-cliff
```

### 2. Configure environment variables

**Server** — create `server/.env`:

```env
MONGO_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/stream-app
PORT=5000
JWT_SECRET=some-long-random-string-at-least-32-chars
LIVEKIT_URL=https://your-project.livekit.cloud
LIVEKIT_API_KEY=APIxxxxxxxxxx
LIVEKIT_API_SECRET=your-secret
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

**Frontend** — create `.env.local` in the root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 3. Spin up with Docker

```bash
docker-compose up --build
```

The app will be available at **http://localhost:3000**.

---

## 🔧 Manual Setup (Without Docker)

### 1. Install dependencies

```bash
git clone https://github.com/sasmitha-git/the-cliff.git
cd the-cliff

# Backend
cd server && npm install

# Frontend (back to root)
cd .. && npm install
```

### 2. Set up environment variables

Same `.env` files as the Docker section above.

### 3. Run both servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
npm run dev
```

---

## The Session Recovery Feature

This was the most interesting thing to build. The problem: WebRTC connections drop for all kinds of reasons (WiFi glitch, laptop lid closes, etc). Without recovery, the stream just dies and viewers see an offline screen.

The fix: when the streamer's connection drops, instead of immediately ending the stream I mark it as `disconnected` and start a 30-second server-side timer. Viewers see a "temporarily disconnected" notice. The streamer gets a modal with a countdown. If they hit reconnect within the window, they get a fresh LiveKit token for the same room and the stream continues. If the timer runs out, the stream ends automatically.

The recovery timeouts live in a `Map<string, NodeJS.Timeout>` in the recovery service. It's in-memory, so a server restart would lose them — good enough for a side project, but something to fix before production.

---
