// src/lib/api.ts
import {
  SignupRequest,
  SigninRequest,
  SignupResponse,
  AuthResponse,
} from "@/types/auth";
import { Stream, StartStreamRequest, StartStreamResponse } from "@/types/stream";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const signupUser = async (data: SignupRequest): Promise<SignupResponse> => {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Error: ${res.status} - ${res.statusText}`);
  }

  const json = await res.json();
  return json;
};

export const signinUser = async (data: SigninRequest): Promise<AuthResponse> => {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Error: ${res.status} - ${res.statusText}`);
  }

  const json = await res.json();
  return json;
};

export const getMe = async (): Promise<{ user: import("@/types/auth").User }> => {
  const res = await fetch(`${API}/auth/me`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Error: ${res.status} - ${res.statusText}`);
  }

  const json = await res.json();
  return json;
};

export const logoutUser = async (): Promise<{ message: string }> => {
  const res = await fetch(`${API}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Error: ${res.status} - ${res.statusText}`);
  }

  const json = await res.json();
  return json;
};

// ──── Stream Endpoints ─────────────────────────────────────────────────────

export const startStream = async (data: StartStreamRequest): Promise<StartStreamResponse> => {
  const res = await fetch(`${API}/streams/start`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Error: ${res.status} - ${res.statusText}`);
  }

  const json = await res.json();
  return json;
};

export const getStreams = async (): Promise<Stream[]> => {
  const res = await fetch(`${API}/streams`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Error: ${res.status} - ${res.statusText}`);
  }

  const json = await res.json();
  return json.streams ?? [];
};

export const getStreamById = async (id: string): Promise<{ token: string; stream: Stream }> => {
  const res = await fetch(`${API}/streams/${id}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Failed to fetch stream");
  }

  return json;
};



export const endStream = async (): Promise<{ message: string }> => {
  const res = await fetch(`${API}/streams/end`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to end stream");
  return json;
};

export const resumeStream = async (): Promise<{ stream: Stream; token: string; message: string }> => {
  const res = await fetch(`${API}/streams/resume`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to resume stream");
  return json;
};

export const endStreamPermanently = async (): Promise<{ message: string }> => {
  const res = await fetch(`${API}/streams/end-permanently`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to end stream");
  return json;
};