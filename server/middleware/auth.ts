import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db.js";

const JWT_SECRET = process.env.JWT_SECRET || "complaint_system_super_secret_key_123";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "USER" | "AGENT" | "ADMIN";
    name: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Authentication token missing" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: "USER" | "AGENT" | "ADMIN";
      name: string;
    };

    // Verify user still exists
    const user = await db.users.findById(decoded.id);
    if (!user) {
      res.status(401).json({ message: "User no longer exists or session is invalid" });
      return;
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (error) {
    res.status(403).json({ message: "Token is invalid or expired" });
    return;
  }
};

export const requireRole = (roles: ("USER" | "AGENT" | "ADMIN")[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Access denied. Insufficient permissions." });
      return;
    }

    next();
  };
};
