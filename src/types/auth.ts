export interface User {
  username: string;
  email: string;
  role: "viewer" | "streamer";
  id?: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  role: "viewer" | "streamer";
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SignupResponse {
  message: string;
}
