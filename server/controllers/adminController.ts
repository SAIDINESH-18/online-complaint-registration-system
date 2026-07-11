import { Response } from "express";
import { db } from "../db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

export const assignAgent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { complaintId, agentId } = req.body;

  if (!complaintId || !agentId) {
    res.status(400).json({ message: "Complaint ID and Agent ID are required" });
    return;
  }

  try {
    const complaint = await db.complaints.findById(complaintId);
    if (!complaint) {
      res.status(404).json({ message: "Complaint not found" });
      return;
    }

    const agent = await db.users.findById(agentId);
    if (!agent || agent.role !== "AGENT") {
      res.status(400).json({ message: "Invalid agent selected" });
      return;
    }

    // Assign agent and update status to ASSIGNED if it was PENDING
    const newStatus = complaint.status === "PENDING" ? "ASSIGNED" : complaint.status;

    const updated = await db.complaints.findByIdAndUpdate(complaintId, {
      agentId,
      status: newStatus,
    });

    res.json({
      message: `Complaint assigned to ${agent.name} successfully`,
      complaint: {
        ...updated,
        agentName: agent.name,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error assigning agent", error: error.message });
  }
};

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const allUsers = await db.users.find();
    const allComplaints = await db.complaints.find();
    const allFeedbacks = await db.feedbacks.find();

    const totalUsers = allUsers.filter((u) => u.role === "USER").length;
    const totalAgents = allUsers.filter((u) => u.role === "AGENT").length;
    const totalComplaints = allComplaints.length;

    // Status counts
    const pending = allComplaints.filter((c) => c.status === "PENDING").length;
    const assigned = allComplaints.filter((c) => c.status === "ASSIGNED").length;
    const inProgress = allComplaints.filter((c) => c.status === "IN_PROGRESS").length;
    const resolved = allComplaints.filter((c) => c.status === "RESOLVED").length;

    // Category distribution
    const categories: Record<string, number> = {};
    allComplaints.forEach((c) => {
      categories[c.category] = (categories[c.category] || 0) + 1;
    });

    const categoryData = Object.keys(categories).map((name) => ({
      name,
      value: categories[name],
    }));

    // Feedback rating calculation
    const totalRatings = allFeedbacks.reduce((acc, f) => acc + f.rating, 0);
    const averageRating = allFeedbacks.length > 0 ? Number((totalRatings / allFeedbacks.length).toFixed(1)) : 0;

    // Build timeline of registered complaints (by month/day for simple visualization)
    const timelineMap: Record<string, number> = {};
    allComplaints.forEach((c) => {
      const date = new Date(c.createdAt);
      // Format as "Mon YYYY" or "MM-DD" depending on scale. Let's do Month names:
      const monthStr = date.toLocaleString("default", { month: "short", year: "2-digit" });
      timelineMap[monthStr] = (timelineMap[monthStr] || 0) + 1;
    });

    const timelineData = Object.keys(timelineMap).map((date) => ({
      date,
      count: timelineMap[date],
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.json({
      metrics: {
        totalUsers,
        totalAgents,
        totalComplaints,
        statusBreakdown: {
          pending,
          assigned,
          inProgress,
          resolved,
        },
        averageRating,
        totalFeedbackCount: allFeedbacks.length,
      },
      categoryData,
      timelineData,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching dashboard statistics", error: error.message });
  }
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await db.users.find();
    // Exclude password hashes
    const sanitized = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      createdAt: u.createdAt,
    }));
    res.json(sanitized);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !["USER", "AGENT", "ADMIN"].includes(role.toUpperCase())) {
    res.status(400).json({ message: "Invalid role selected" });
    return;
  }

  try {
    const user = await db.users.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const updated = await db.users.findByIdAndUpdate(id, { role: role.toUpperCase() });
    res.json({
      message: `User role updated to ${role.toUpperCase()}`,
      user: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating user role", error: error.message });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await db.users.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Prevent deleting oneself
    if (user._id === req.user?.id) {
      res.status(400).json({ message: "Cannot delete your own admin account" });
      return;
    }

    await db.users.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};

export const getAgentMetrics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await db.users.find({ role: "AGENT" });
    const complaints = await db.complaints.find();
    const feedbacks = await db.feedbacks.find();

    const metrics = await Promise.all(
      users.map(async (agent) => {
        const assigned = complaints.filter((c) => c.agentId === agent._id);
        const resolved = assigned.filter((c) => c.status === "RESOLVED");
        const inProgress = assigned.filter((c) => c.status === "IN_PROGRESS");

        // Calculate ratings for this agent's resolved complaints
        let agentRatingsTotal = 0;
        let agentFeedbacksCount = 0;

        assigned.forEach((comp) => {
          const compFeedbacks = feedbacks.filter((f) => f.complaintId === comp._id);
          compFeedbacks.forEach((f) => {
            agentRatingsTotal += f.rating;
            agentFeedbacksCount++;
          });
        });

        const avgRating = agentFeedbacksCount > 0 ? Number((agentRatingsTotal / agentFeedbacksCount).toFixed(1)) : 0;

        return {
          id: agent._id,
          name: agent.name,
          email: agent.email,
          phone: agent.phone,
          assignedCount: assigned.length,
          resolvedCount: resolved.length,
          inProgressCount: inProgress.length,
          averageRating: avgRating,
        };
      })
    );

    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching agent metrics", error: error.message });
  }
};
