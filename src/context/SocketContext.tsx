"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";

interface SocketContextType {
  socket: Socket | null;
  isAuthenticated: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isAuthenticated: false,
});




export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user, token,loading } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  useEffect(() => {

    if (loading) return; // Don't do anything until we know auth status

    // Tear down any existing socket first
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsAuthenticated(false);
    }

    if (!user || !token) return;

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000",  {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket); // Set immediately so consumers can attach listeners

    newSocket.on("authenticated", () => setIsAuthenticated(true));
    newSocket.on("unauthenticated", () => setIsAuthenticated(false));

    // On reconnect, re-authenticate status is reset — server will re-emit
    newSocket.on("disconnect", () => setIsAuthenticated(false));
    newSocket.on("connect", () => {
      // Server will re-emit "authenticated" after reconnect since auth is in handshake
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsAuthenticated(false);
    };
  }, [user?.id, token, loading]); // Only re-run when user identity or token changes

  return (
    <SocketContext.Provider value={{ socket, isAuthenticated }}>
      {children}
    </SocketContext.Provider>
  );
};