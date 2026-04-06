"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { getMe } from "@/lib/api";

export interface User {
  username: string;
  email: string;
  role: "viewer" | "streamer";
  id?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  logout: () => {},
  setUser: () => {},
  setToken: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokenState, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Always sync localStorage when token changes
  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem("authToken", newToken);
    } else {
      localStorage.removeItem("authToken");
    }
  };

  useEffect(() => {
    const restoreAuthState = async () => {
      try {
        const storedToken = localStorage.getItem("authToken");

        if (!storedToken) {
          // No token at all — skip the /me call entirely
          setLoading(false);
          return;
        }

        const response = await getMe();
        // Set both together so socket context sees them at the same time
        setUser(response.user);
        setTokenState(storedToken); // use setTokenState to avoid re-writing localStorage
      } catch {
        // Token expired or invalid
        setUser(null);
        setToken(null); // clears localStorage too
      } finally {
        setLoading(false);
      }
    };

    restoreAuthState();
  }, []);

  const logout = () => {
    setUser(null);
    setToken(null); // ← use setToken not setTokenState so localStorage is cleared
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token: tokenState,
        loading,
        isAuthenticated: !!user,
        logout,
        setUser,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};