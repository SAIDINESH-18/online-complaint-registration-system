import { Router } from "express";
import { register, login, getProfile, updateProfile } from "./controllers/authController.js";
import { createComplaint, getComplaints, getComplaintById, updateComplaint, deleteComplaint, updateComplaintStatus } from "./controllers/complaintController.js";
import { createFeedback, getFeedbacks } from "./controllers/feedbackController.js";
import { assignAgent, getDashboardStats, getAllUsers, updateUserRole, deleteUser, getAgentMetrics } from "./controllers/adminController.js";
import { authenticateToken, requireRole } from "./middleware/auth.js";

const router = Router();

// ==========================================
// AUTH ROUTES
// ==========================================
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/profile", authenticateToken as any, getProfile as any);
router.put("/auth/profile", authenticateToken as any, updateProfile as any);

// ==========================================
// COMPLAINTS ROUTES
// ==========================================
router.post("/complaints", authenticateToken as any, createComplaint as any);
router.get("/complaints", authenticateToken as any, getComplaints as any);
router.get("/complaints/:id", authenticateToken as any, getComplaintById as any);
router.put("/complaints/:id", authenticateToken as any, updateComplaint as any);
router.delete("/complaints/:id", authenticateToken as any, deleteComplaint as any);
router.put("/complaints/:id/status", authenticateToken as any, updateComplaintStatus as any);

// ==========================================
// FEEDBACK ROUTES
// ==========================================
router.post("/feedback", authenticateToken as any, createFeedback as any);
router.get("/feedback", authenticateToken as any, requireRole(["ADMIN"]) as any, getFeedbacks as any);

// ==========================================
// ADMIN ROUTES
// ==========================================
router.put("/admin/assign-agent", authenticateToken as any, requireRole(["ADMIN"]) as any, assignAgent as any);
router.get("/admin/dashboard", authenticateToken as any, requireRole(["ADMIN"]) as any, getDashboardStats as any);
router.get("/admin/users", authenticateToken as any, requireRole(["ADMIN"]) as any, getAllUsers as any);
router.put("/admin/users/:id/role", authenticateToken as any, requireRole(["ADMIN"]) as any, updateUserRole as any);
router.delete("/admin/users/:id", authenticateToken as any, requireRole(["ADMIN"]) as any, deleteUser as any);
router.get("/admin/agents", authenticateToken as any, requireRole(["ADMIN"]) as any, getAgentMetrics as any);

export default router;
