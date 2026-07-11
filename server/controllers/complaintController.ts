import { Response } from "express";
import { db } from "../db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

// Utility to "populate" user/agent details in complaints
const populateComplaint = async (complaint: any) => {
  if (!complaint) return null;
  
  const creator = await db.users.findById(complaint.userId);
  const agent = complaint.agentId ? await db.users.findById(complaint.agentId) : null;
  const feedbackList = await db.feedbacks.find({ complaintId: complaint._id });
  const feedback = feedbackList.length > 0 ? feedbackList[0] : null;

  return {
    ...complaint,
    userName: creator?.name || "Unknown User",
    userEmail: creator?.email || "",
    agentName: agent?.name || "Unassigned",
    agentEmail: agent?.email || "",
    feedback: feedback || null,
  };
};

export const createComplaint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  const { title, description, category, attachmentUrl } = req.body;

  if (!title || !description || !category) {
    res.status(400).json({ message: "Title, description, and category are required" });
    return;
  }

  try {
    const newComplaint = await db.complaints.create({
      title,
      description,
      category,
      attachmentUrl: attachmentUrl || "",
      status: "PENDING",
      userId: req.user.id,
      agentId: "",
      resolutionNotes: "",
    });

    const populated = await populateComplaint(newComplaint);
    res.status(201).json({
      message: "Complaint registered successfully",
      complaint: populated,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error registering complaint", error: error.message });
  }
};

export const getComplaints = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  const { status, category, search, sort } = req.query;

  try {
    let query: any = {};

    // Role filtering
    if (req.user.role === "USER") {
      query.userId = req.user.id;
    } else if (req.user.role === "AGENT") {
      // Agents see complaints assigned to them, or they can see all to claim (or admins assign them)
      // Let's filter by agentId = agent's ID
      query.agentId = req.user.id;
    }
    // Admin sees all

    // Status filtering
    if (status && status !== "ALL") {
      query.status = status;
    }

    // Category filtering
    if (category && category !== "ALL") {
      query.category = category;
    }

    let complaints = await db.complaints.find(query);

    // Manual client-side filtering for search & sort to support JSON fallback and mongoose seamlessly
    if (search) {
      const searchStr = String(search).toLowerCase();
      complaints = complaints.filter(
        (c) =>
          c.title.toLowerCase().includes(searchStr) ||
          c.description.toLowerCase().includes(searchStr) ||
          c.category.toLowerCase().includes(searchStr) ||
          (c._id && c._id.includes(searchStr))
      );
    }

    // Populate Creator and Agent
    const populatedComplaints = await Promise.all(
      complaints.map((c) => populateComplaint(c))
    );

    // Sorting
    if (sort === "oldest") {
      populatedComplaints.sort(
        (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else {
      // Default: newest first
      populatedComplaints.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    res.json(populatedComplaints);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching complaints", error: error.message });
  }
};

export const getComplaintById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  const { id } = req.params;

  try {
    const complaint = await db.complaints.findById(id);
    if (!complaint) {
      res.status(404).json({ message: "Complaint not found" });
      return;
    }

    // Authorization checks:
    // USER can only see their own complaint
    // AGENT can only see complaints assigned to them (or admins see all)
    if (req.user.role === "USER" && complaint.userId !== req.user.id) {
      res.status(403).json({ message: "Not authorized to view this complaint" });
      return;
    }
    if (req.user.role === "AGENT" && complaint.agentId !== req.user.id) {
      res.status(403).json({ message: "Not authorized to view this complaint" });
      return;
    }

    const populated = await populateComplaint(complaint);
    res.json(populated);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching complaint details", error: error.message });
  }
};

export const updateComplaint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  const { id } = req.params;
  const { title, description, category, attachmentUrl } = req.body;

  try {
    const complaint = await db.complaints.findById(id);
    if (!complaint) {
      res.status(404).json({ message: "Complaint not found" });
      return;
    }

    // Only creator or admin can update details
    if (req.user.role === "USER" && complaint.userId !== req.user.id) {
      res.status(403).json({ message: "Not authorized to edit this complaint" });
      return;
    }

    // Cannot edit resolved complaints unless admin
    if (complaint.status === "RESOLVED" && req.user.role !== "ADMIN") {
      res.status(400).json({ message: "Cannot edit a resolved complaint" });
      return;
    }

    const updates: any = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (category) updates.category = category;
    if (attachmentUrl !== undefined) updates.attachmentUrl = attachmentUrl;

    const updated = await db.complaints.findByIdAndUpdate(id, updates);
    const populated = await populateComplaint(updated);

    res.json({
      message: "Complaint updated successfully",
      complaint: populated,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating complaint", error: error.message });
  }
};

export const deleteComplaint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  const { id } = req.params;

  try {
    const complaint = await db.complaints.findById(id);
    if (!complaint) {
      res.status(404).json({ message: "Complaint not found" });
      return;
    }

    // Only Admin can delete any, or User can delete their own PENDING complaint
    if (req.user.role === "USER") {
      if (complaint.userId !== req.user.id) {
        res.status(403).json({ message: "Not authorized to delete this complaint" });
        return;
      }
      if (complaint.status !== "PENDING") {
        res.status(400).json({ message: "Can only delete complaints in PENDING status" });
        return;
      }
    }

    await db.complaints.findByIdAndDelete(id);
    res.json({ message: "Complaint deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting complaint", error: error.message });
  }
};

export const updateComplaintStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  const { id } = req.params;
  const { status, resolutionNotes } = req.body;

  if (!status) {
    res.status(400).json({ message: "Status is required" });
    return;
  }

  const validStatuses = ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ message: "Invalid status value" });
    return;
  }

  try {
    const complaint = await db.complaints.findById(id);
    if (!complaint) {
      res.status(404).json({ message: "Complaint not found" });
      return;
    }

    // Authorization checks:
    // User can set PENDING or close, but usually Agent and Admin update status.
    // Let's allow Agent assigned to it OR Admin to update status.
    if (req.user.role === "AGENT" && complaint.agentId !== req.user.id) {
      res.status(403).json({ message: "Not authorized to update status for this complaint" });
      return;
    }

    const updates: any = { status };
    if (resolutionNotes !== undefined) {
      updates.resolutionNotes = resolutionNotes;
    }

    const updated = await db.complaints.findByIdAndUpdate(id, updates);
    const populated = await populateComplaint(updated);

    res.json({
      message: `Complaint status updated to ${status}`,
      complaint: populated,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
};
