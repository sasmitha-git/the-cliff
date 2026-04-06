import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authLimiter } from "../middleware/rateLimiter";
import { User } from "../models/user";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/me", authMiddleware, (req: any, res) => {
  res.json({ user: req.user });
});

router.post("/register", authLimiter, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // ✅ Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Validate email format (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // ✅ Validate password length (minimum 8 characters)
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    // ✅ Validate username length
    if (username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters" });
    }

    // ✅ Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Validate role
    const allowedRoles = ["viewer", "streamer"];
    const userRole = allowedRoles.includes(role) ? role : "viewer";

    // ✅ Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: userRole,
    });

    await user.save();

    res.status(201).json({ message: "User created" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({
      id: user._id,
      role: user.role,
      username: user.username,
      email: user.email
    },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {

      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days

    });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token // Return token for socket authentication
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  // Clear httpOnly cookie
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

export default router;