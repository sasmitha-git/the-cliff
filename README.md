# 🎬 The Cliff - Live Streaming Platform

A full-stack real-time live streaming application built with modern web technologies. Stream, chat, and discover live content with enterprise-grade infrastructure.

## ✨ Features

### 🎥 Core Streaming
- **Live Broadcasting** - Real-time video streaming using LiveKit SFU (Selective Forwarding Unit)
- **Session Recovery** - Automatic 30-second recovery window if streamer accidentally disconnects
- **Role-Based Access** - Separate streamer and viewer interfaces
- **Live Status** - Real-time updates showing active streams

### 💬 Interactive Chat
- **Socket.io Chat** - Real-time messaging during streams
- **Message History** - Last 15 messages persist in memory
- **XSS Protection** - HTML sanitization on all chat messages
- **User Identity** - Messages tagged with username and timestamp

### 🔐 Security & Authentication
- **JWT + Secure Cookies** - httpOnly cookies prevent XSS token theft
- **Password Hashing** - Bcrypt with 10 rounds
- **Rate Limiting** - 5 auth attempts per 15 minutes
- **Protected Routes** - Role-based access control (viewer/streamer)

### 📊 Dashboard & Discovery
- **Streamer Dashboard** - Go live, manage streams, view analytics
- **Live Discovery** - Browse active streams with real-time updates
- **Featured Streamers** - Categorized stream discovery
- **Viewer Count** - Real-time participant tracking

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                    │
│          ┌──────────────────────────────────┐           │
│          │  React 19 + TypeScript (Strict)   │           │
│          │  TailwindCSS + shadcn/ui          │           │
│          │  Socket.io Client + LiveKit       │           │
│          └──────────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘
                         ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────┐
│                Backend (Express.js)                     │
│          ┌──────────────────────────────────┐           │
│          │  Express 5 + TypeScript (Strict) │           │
│          │  Socket.io Server                │           │
│          │  LiveKit Server SDK              │           │
│          └──────────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────┐
│                    MongoDB Atlas                        │
│              Mongoose ODM + Validation                  │
└─────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────┐
│                  LiveKit Infrastructure                 │
│          SFU-based video distribution network           │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 16.2 with TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **State**: React Context + TanStack React Query
- **Real-time**: Socket.io Client
- **Video**: LiveKit Components & Client SDK
- **Form Validation**: Custom validation with regex

### **Backend**
- **Runtime**: Node.js + Express.js 5
- **Language**: TypeScript (strict mode)
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io Server
- **Authentication**: JWT + bcrypt
- **Video**: LiveKit Server SDK

### **Infrastructure**
- **Video Distribution**: LiveKit (SFU model)
- **Database**: MongoDB Atlas
- **Deployment**: Ready for Vercel (frontend) + Railway/Render (backend)

## 📋 Project Structure

```
the-cliff/
├── src/                          # Frontend code
│   ├── app/                      # Next.js app router
│   │   ├── (auth)/              # Auth pages (login, register)
│   │   ├── dashboard/           # Streamer dashboard
│   │   ├── home/                # Stream discovery
│   │   └── watch/               # Stream viewer
│   ├── components/              # Reusable React components
│   │   ├── auth/                # Auth components
│   │   ├── chat/                # Chat component
│   │   └── stream/              # Stream components
│   ├── context/                 # React Context (Auth, Socket)
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utilities (API, validation)
│   └── types/                   # TypeScript interfaces
│
├── server/                       # Backend code
│   ├── src/
│   │   ├── app.ts              # Express setup
│   │   ├── server.ts           # Server entry point
│   │   ├── config/             # Configuration (DB)
│   │   ├── controllers/        # Business logic (prep)
│   │   ├── middleware/         # Auth, rate limiting
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API endpoints
│   │   ├── services/           # Services (recovery logic)
│   │   ├── socket/             # Socket.io handlers
│   │   └── types/              # TypeScript types
│   └── package.json
│
├── package.json                 # Frontend dependencies
└── tsconfig.json               # Frontend TypeScript config
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+
- **npm** or **yarn**
- **MongoDB Atlas** account (free tier works)
- **LiveKit** account (live demo instance available)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/the-cliff.git
cd the-cliff
```

2. **Setup Frontend**
```bash
# Install frontend dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Edit .env.local with your credentials
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
# NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-instance.com
# NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

3. **Setup Backend**
```bash
cd server

# Install backend dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials
# MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/stream-app
# JWT_SECRET=your-secure-random-string
# LIVEKIT_API_KEY=your-livekit-key
# LIVEKIT_API_SECRET=your-livekit-secret
# LIVEKIT_URL=https://your-livekit-instance.com
# CLIENT_URL=http://localhost:3000
# PORT=5000
```

### Running Locally

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# App running on http://localhost:3000
```

3. Open http://localhost:3000 in your browser

## 🔑 Environment Variables

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-instance.com
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Backend (`server/.env`)
```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
JWT_SECRET=your-secure-jwt-secret-key
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
LIVEKIT_URL=https://your-livekit-instance.com
CLIENT_URL=http://localhost:3000
NODE_ENV=development
PORT=5000
```

## 📡 API Reference

### Authentication Endpoints

**POST /api/auth/register**
- Create new user account
- Body: `{ username, email, password, role: "viewer" | "streamer" }`

**POST /api/auth/login**
- Authenticate user
- Body: `{ email, password }`
- Returns: JWT token in secure cookie

**POST /api/auth/logout**
- Clear authentication
- Returns: Success message

**GET /api/auth/me**
- Get current user data
- Protected: Requires authentication

### Stream Endpoints

**GET /api/streams**
- Get all streams with optional filters
- Query: `?role=streamer` or `?isLive=true`

**GET /api/streams/:id**
- Get specific stream details
- Returns: Stream data + LiveKit viewer token

**POST /api/streams/start**
- Start a new stream (streamer only)
- Protected: Requires streamer role
- Body: `{ title }`
- Returns: Stream info + LiveKit token

**POST /api/streams/end**
- End stream (starts 30-second recovery period)
- Protected: Requires streamer role

**POST /api/streams/resume**
- Reconnect to stream during recovery window
- Protected: Requires streamer role

**POST /api/streams/end-permanently**
- Permanently end stream (cancels recovery)
- Protected: Requires streamer role

### Socket.io Events

**Client → Server**
- `join-stream` - Join stream chat
- `leave-stream` - Leave chat room
- `send-message` - Send chat message

**Server → Client**
- `authenticated` - Connection established
- `chat-history` - Previous 15 messages
- `new-message` - New chat message
- `stream-disconnected` - Stream connection lost
- `stream-resumed` - Stream reconnected

## 🎯 Key Features Explained

### Session Recovery 🔄
When a streamer accidentally disconnects or refreshes:
1. Recovery modal appears with 30-second countdown
2. Streamer can click "Reconnect" to resume
3. Same LiveKit room ID = viewers see seamless recovery
4. After 30s → stream auto-ends if not resumed
5. Viewers get real-time notifications

### Secure Authentication 🔐
- JWT tokens in httpOnly cookies (XSS safe)
- Bcrypt password hashing (10 rounds)
- Rate limiting on auth endpoints
- Session-based authentication

### Real-time Updates 📡
- Socket.io for instant chat & stream status
- Mongoose schema validation
- MongoDB change streams ready
- Optimistic UI updates

## 📸 Screenshots

```
Home Page          Streamer Dashboard       Watch Page
┌──────────────┐   ┌──────────────┐       ┌──────────────┐
│ Featured     │   │ Go Live      │       │ Live Video   │
│ Streamers    │   │ Stream Setup │       │ Chat Sidebar │
│              │   │ Controls     │       │              │
│ Live Now     │   │ Stream Title │       │ Viewers: 12  │
│ All Streams  │   │ Camera/Mic   │       │              │
└──────────────┘   └──────────────┘       └──────────────┘
```

## 🔒 Security Checklist

- ✅ TypeScript strict mode enabled
- ✅ Password hashing (bcrypt 10 rounds)
- ✅ JWT + httpOnly cookies
- ✅ Rate limiting on auth
- ✅ XSS protection (HTML sanitization)
- ✅ CORS configured
- ✅ Environment variables secured
- ✅ `.gitignore` prevents credential commits
- ⏳ Ready for: Helmet.js, CSRF tokens, request validation

## 🧪 Testing

Unit tests and integration tests coming soon.

```bash
npm run test       # Run tests
npm run test:cov   # Coverage report
```

## 📦 Deployment

### Frontend (Vercel)
```bash
# Connect GitHub repo to Vercel
# Auto-deploys on push to main
```

### Backend (Railway/Render)
```bash
# Connect GitHub repo to Railway
# Set environment variables
# Deploy from root or /server
```

### LiveKit
- Use hosted cloud instance or self-host
- Update `NEXT_PUBLIC_LIVEKIT_URL` in production

## 📚 Documentation

- [LiveKit Docs](https://docs.livekit.io)
- [Socket.io Docs](https://socket.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

Built as a full-stack streaming platform for learning and portfolio purposes.

---

**Built with ❤️ using Next.js, Express.js, and LiveKit**

### Key Achievements
- ✨ Session recovery for resilient streaming
- 🔐 Enterprise-grade authentication
- 📡 Real-time chat and updates
- 🎥 Live video streaming integration
- 📝 Strict TypeScript throughout
