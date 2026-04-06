import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;

    next();

  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};


// Role Check: Specific for Streamer-only routes
export const isStreamer = (req: any, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "streamer") {
    next();
  } else {
        return res.status(403).json({ message: "Access denied: Streamers only" });
  }
};

export const optionalAuth = (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (token) {
      req.user = jwt.verify(token, process.env.JWT_SECRET!);
    }
  } catch {
    // invalid token — treat as guest, don't block
  }
  next();
};