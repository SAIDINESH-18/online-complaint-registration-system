export type UserRole = "USER" | "AGENT" | "ADMIN";

export type ComplaintStatus = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  attachmentUrl?: string;
  status: ComplaintStatus;
  userId: string;
  agentId?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Populated fields
  userName?: string;
  userEmail?: string;
  agentName?: string;
  agentEmail?: string;
  feedback?: Feedback | null;
}

export interface Feedback {
  _id: string;
  complaintId: string;
  userId: string;
  rating: number;
  comments: string;
  createdAt: string;
  
  // Populated fields
  userName?: string;
  complaintTitle?: string;
}

export interface AgentMetrics {
  id: string;
  name: string;
  email: string;
  phone?: string;
  assignedCount: number;
  resolvedCount: number;
  inProgressCount: number;
  averageRating: number;
}

export interface DashboardMetrics {
  metrics: {
    totalUsers: number;
    totalAgents: number;
    totalComplaints: number;
    statusBreakdown: {
      pending: number;
      assigned: number;
      inProgress: number;
      resolved: number;
    };
    averageRating: number;
    totalFeedbackCount: number;
  };
  categoryData: { name: string; value: number }[];
  timelineData: { date: string; count: number }[];
}
