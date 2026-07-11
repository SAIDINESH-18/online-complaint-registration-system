import { Response } from "express";
import { db } from "../db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

export const createFeedback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  const { complaintId, rating, comments } = req.body;

  if (!complaintId || !rating || comments === undefined) {
    res.status(400).json({ message: "Complaint ID, rating, and comments are required" });
    return;
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    res.status(400).json({ message: "Rating must be a number between 1 and 5" });
    return;
  }

  try {
    const complaint = await db.complaints.findById(complaintId);
    if (!complaint) {
      res.status(404).json({ message: "Complaint not found" });
      return;
    }

    // Only creator of complaint can submit feedback
    if (complaint.userId !== req.user.id) {
      res.status(403).json({ message: "Only the author of the complaint can submit feedback" });
      return;
    }

    // Complaint must be RESOLVED to accept feedback
    if (complaint.status !== "RESOLVED") {
      res.status(400).json({ message: "Feedback can only be submitted for resolved complaints" });
      return;
    }

    // Check if feedback already exists
    const existingFeedback = await db.feedbacks.find({ complaintId });
    if (existingFeedback.length > 0) {
      res.status(400).json({ message: "Feedback has already been submitted for this complaint" });
      return;
    }

    const newFeedback = await db.feedbacks.create({
      complaintId,
      userId: req.user.id,
      rating: numRating,
      comments,
    });

    res.status(201).json({
      message: "Feedback submitted successfully!",
      feedback: newFeedback,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error submitting feedback", error: error.message });
  }
};

export const getFeedbacks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const feedbacks = await db.feedbacks.find();
    
    // Populate with user names & complaint titles
    const populated = await Promise.all(
      feedbacks.map(async (fb) => {
        const user = await db.users.findById(fb.userId);
        const complaint = await db.complaints.findById(fb.complaintId);
        return {
          ...fb,
          userName: user?.name || "Anonymous",
          complaintTitle: complaint?.title || "Deleted Complaint",
        };
      })
    );

    res.json(populated);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching feedbacks", error: error.message });
  }
};
