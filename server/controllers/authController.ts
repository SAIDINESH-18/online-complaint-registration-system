import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

const JWT_SECRET = process.env.JWT_SECRET || "complaint_system_super_secret_key_123";

export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: "Name, email, and password are required" });
    return;
  }

  try {
    // Check if email already exists
    const existingUser = await db.users.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User with this email already exists" });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user. Allow role choice during development/testing or standard fallback.
    // Ensure only valid roles can be set
    const userRole = role && ["USER", "AGENT", "ADMIN"].includes(role.toUpperCase()) 
      ? role.toUpperCase() 
      : "USER";

    const newUser = await db.users.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: userRole,
      phone: phone || "",
      createdAt: new Date().toISOString(),
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  try {
    const user = await db.users.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  try {
    const user = await db.users.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  const { name, phone, password } = req.body;

  try {
    const updates: any = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.passwordHash = await bcrypt.hash(password, salt);
    }

    const updatedUser = await db.users.findByIdAndUpdate(req.user.id, updates);
    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error updating profile", error: error.message });
  }
};
