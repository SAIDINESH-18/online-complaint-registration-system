import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { complaintAPI, adminAPI, feedbackAPI } from "../services/api.js";
import { Complaint, User } from "../types.js";
import { 
  ArrowLeft, 
  Calendar, 
  User as UserIcon, 
  FileText, 
  Clock, 
  Activity, 
  CheckCircle2, 
  ShieldAlert, 
  HeartHandshake, 
  Star, 
  Check, 
  RefreshCw,
  Send,
  MessageSquare
} from "lucide-react";
import { motion } from "motion/react";

export default function ComplaintDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Agent response inputs
  const [resolutionNotes, setResolutionNotes] = useState("");

  // Feedback inputs
  const [rating, setRating] = useState(5);
  const [ratingHover, setRatingHover] = useState<number | null>(null);
  const [feedbackComments, setFeedbackComments] = useState("");

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setError(null);
      const res = await complaintAPI.getById(id);
      setComplaint(res.data);
      if (res.data.resolutionNotes) {
        setResolutionNotes(res.data.resolutionNotes);
      }

      // If user is Admin, fetch active support agents for the dropdown
      if (user?.role === "ADMIN") {
        const usersRes = await adminAPI.getUsers();
        const activeAgents = usersRes.data.filter((u: any) => u.role === "AGENT");
        setAgents(activeAgents);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to retrieve complaint details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, user]);

  const handleAssignAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedAgentId) return;

    setActionLoading(true);
    setSuccessMsg(null);
    try {
      await adminAPI.assignAgent({ complaintId: id, agentId: selectedAgentId });
      setSuccessMsg("Support specialist assigned successfully.");
      await fetchDetails();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to assign agent.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: "IN_PROGRESS" | "RESOLVED") => {
    if (!id) return;
    
    if (newStatus === "RESOLVED" && !resolutionNotes.trim()) {
      setError("Please write resolution notes before marking as resolved.");
      return;
    }

    setActionLoading(true);
    setSuccessMsg(null);
    setError(null);
    try {
      await complaintAPI.updateStatus(id, {
        status: newStatus,
        resolutionNotes: newStatus === "RESOLVED" ? resolutionNotes : undefined,
      });
      setSuccessMsg(`Ticket status updated to ${newStatus}`);
      await fetchDetails();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update ticket status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await feedbackAPI.submit({
        complaintId: id,
        rating,
        comments: feedbackComments,
      });
      setSuccessMsg("Thank you! Your feedback review has been submitted.");
      await fetchDetails();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit feedback review.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStepStatusClass = (step: string) => {
    if (!complaint) return "border-slate-200 text-slate-400 bg-white";
    const status = complaint.status;

    const stages = ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];
    const currentIdx = stages.indexOf(status);
    const stepIdx = stages.indexOf(step);

    if (currentIdx >= stepIdx) {
      if (step === "RESOLVED") return "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/10";
      return "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10";
    }
    return "border-slate-200 text-slate-400 bg-slate-100";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" id="details_loading">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center p-12 bg-white rounded-xl border border-slate-100 max-w-md mx-auto shadow-sm">
        <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h4 className="text-sm font-bold text-slate-800">Complaint Not Found</h4>
        <p className="text-xs text-slate-400 mt-1 mb-5">The requested complaint record does not exist or you lack permission to view it.</p>
        <Link to="/login" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-500 transition">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Get correct back route based on user role
  const getBackRoute = () => {
    if (user?.role === "ADMIN") return "/admin-dashboard";
    if (user?.role === "AGENT") return "/agent-dashboard";
    return "/user-dashboard";
  };

  return (
    <div className="space-y-4" id="complaint_details_page">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Link 
            to={getBackRoute()} 
            className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                TICKET #{complaint._id.substring(0, 8).toUpperCase()}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-[10px] font-bold text-slate-500">{complaint.category}</span>
            </div>
            <h1 className="text-sm font-bold text-slate-900 leading-snug mt-0.5">{complaint.title}</h1>
          </div>
        </div>

        <div className="flex gap-2">
          {user?.role === "USER" && complaint.status === "PENDING" && (
            <button
              onClick={async () => {
                if (window.confirm("Are you sure you want to delete this pending complaint?")) {
                  try {
                    await complaintAPI.delete(complaint._id);
                    navigate("/user-dashboard");
                  } catch (err: any) {
                    setError("Failed to delete complaint.");
                  }
                }
              }}
              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 text-[11px] font-semibold rounded-md border border-red-100 transition shadow-xs cursor-pointer"
              id="btn_delete_complaint"
            >
              Delete Ticket
            </button>
          )}
          <button 
            onClick={fetchDetails} 
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md bg-white border border-slate-200 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress timeline bar */}
      <div className="bg-white p-3.5 rounded-md border border-slate-200/60 shadow-xs">
        <h3 className="text-[10px] font-bold text-slate-500 mb-3.5 uppercase tracking-wider">Ticket Tracking Timeline</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          {/* Timeline background lines (only on desktop screen size) */}
          <div className="hidden sm:block absolute top-3.5 left-[12%] right-[12%] h-0.5 bg-slate-100 -z-0"></div>

          {/* Step 1: PENDING */}
          <div className="flex sm:flex-col items-center gap-2.5 sm:text-center relative z-10">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold border-2 text-[10px] flex-shrink-0 ${getStepStatusClass("PENDING").replace("w-10 h-10", "w-7 h-7")}`}>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-800">Submitted</h4>
              <p className="text-[9px] text-slate-400">Complaint registered</p>
            </div>
          </div>

          {/* Step 2: ASSIGNED */}
          <div className="flex sm:flex-col items-center gap-2.5 sm:text-center relative z-10">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold border-2 text-[10px] flex-shrink-0 ${getStepStatusClass("ASSIGNED").replace("w-10 h-10", "w-7 h-7")}`}>
              <UserIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-800">Agent Allocated</h4>
              <p className="text-[9px] text-slate-400">Assigned to support</p>
            </div>
          </div>

          {/* Step 3: IN_PROGRESS */}
          <div className="flex sm:flex-col items-center gap-2.5 sm:text-center relative z-10">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold border-2 text-[10px] flex-shrink-0 ${getStepStatusClass("IN_PROGRESS").replace("w-10 h-10", "w-7 h-7")}`}>
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-800">In Investigation</h4>
              <p className="text-[9px] text-slate-400">Under live review</p>
            </div>
          </div>

          {/* Step 4: RESOLVED */}
          <div className="flex sm:flex-col items-center gap-2.5 sm:text-center relative z-10">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold border-2 text-[10px] flex-shrink-0 ${getStepStatusClass("RESOLVED").replace("w-10 h-10", "w-7 h-7")}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-800">Resolved</h4>
              <p className="text-[9px] text-slate-400 font-medium">Issue settled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Notifications */}
      {successMsg && (
        <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] rounded-md flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-2 bg-red-50 border border-red-100 text-red-800 text-[11px] rounded-md flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main body split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2/3: Details of Complaint */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-md border border-slate-200/60 shadow-xs p-4 sm:p-5 space-y-4">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="text-blue-600 w-4 h-4" /> Core Complaint Details
              </h3>
              <span className="text-[9px] font-medium text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Raised on{" "}
                {new Date(complaint.createdAt).toLocaleDateString("default", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Detailed Description</h4>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                {complaint.description}
              </p>
            </div>

            {/* Attachment preview if exists */}
            {complaint.attachmentUrl && (
              <div className="space-y-1.5 pt-3.5 border-t border-slate-100">
                <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Attached Visual Evidence</h4>
                <div className="max-w-sm rounded-md overflow-hidden border border-slate-200/60 bg-slate-50">
                  <img 
                    src={complaint.attachmentUrl} 
                    alt="Complaint Attachment Evidence" 
                    className="w-full h-auto object-contain max-h-72"
                    referrerPolicy="no-referrer"
                  />
                  <div className="p-2 bg-white border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Attached Evidence screenshot</span>
                    <a 
                      href={complaint.attachmentUrl} 
                      download="attachment_evidence.png" 
                      className="font-bold text-blue-600 hover:underline"
                    >
                      Download File
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resolution Notes section */}
          {complaint.status === "RESOLVED" && (
            <div className="bg-emerald-50/20 rounded-md border border-emerald-100 p-4 space-y-2.5">
              <h3 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="text-emerald-600 w-4 h-4" /> Support Resolution Notes
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                {complaint.resolutionNotes || "This ticket was closed by support. No additional comments were provided."}
              </p>
              <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-[9px] text-emerald-600 font-bold">
                <span>Closed by assigned specialist</span>
                <span>Resolved: {new Date(complaint.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {/* User Feedback Panel (Interactive if resolved, otherwise displays previous review) */}
          {complaint.status === "RESOLVED" && (
            <div className="bg-white rounded-md border border-slate-200/60 shadow-xs p-4 sm:p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <HeartHandshake className="text-rose-500 w-4 h-4" /> User Satisfaction Audit
              </h3>

              {complaint.feedback ? (
                <div className="bg-slate-50 rounded p-3 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-1">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          className={`w-3.5 h-3.5 ${
                            s <= (complaint.feedback?.rating || 0) 
                              ? "text-amber-500 fill-amber-500" 
                              : "text-slate-200"
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">({complaint.feedback.rating}/5 rating)</span>
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed font-medium">
                    "{complaint.feedback.comments || "No comments left."}"
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium">
                    Feedback submitted by author on {new Date(complaint.feedback.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ) : user?.role === "USER" ? (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3" id="feedback_submission_form">
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Please take a moment to review the resolution and rate the support quality. Your feedback is crucial to monitoring agent performance.
                  </p>

                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold text-slate-700">Service Rating *</label>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                           key={star}
                           type="button"
                           className="p-0.5 focus:outline-none transition-transform active:scale-95"
                           onClick={() => setRating(star)}
                           onMouseEnter={() => setRatingHover(star)}
                           onMouseLeave={() => setRatingHover(null)}
                         >
                          <Star 
                             className={`w-5 h-5 ${
                               star <= (ratingHover || rating) 
                                 ? "text-amber-400 fill-amber-400 scale-105" 
                                 : "text-slate-200"
                             } transition-all`} 
                           />
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">({rating} Stars Selected)</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Comments & Review *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Was your issue resolved? Detail your experience..."
                      className="block w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                      value={feedbackComments}
                      onChange={(e) => setFeedbackComments(e.target.value)}
                      id="feedback_textarea_comments"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white font-semibold text-[11px] rounded-md shadow transition inline-flex items-center gap-1 cursor-pointer"
                    id="btn_feedback_submit"
                  >
                    <Send className="w-3 h-3" /> Submit Review
                  </button>
                </form>
              ) : (
                <p className="text-xs text-slate-400 italic">No satisfaction feedback has been submitted by the customer yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Right 1/3: Sidebar metadata column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Metadata information card */}
          <div className="bg-white rounded-md border border-slate-200/60 shadow-xs p-3.5 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-slate-100">
              Ticket Information
            </h4>
            
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="block text-slate-400 text-[9px] uppercase font-bold tracking-wider">Raised By</span>
                <span className="font-bold text-slate-800 block mt-0.5">{complaint.userName}</span>
                <span className="text-slate-400 font-mono text-[9px]">{complaint.userEmail}</span>
              </div>

              <div>
                <span className="block text-slate-400 text-[9px] uppercase font-bold tracking-wider">Status Badge</span>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getStepStatusClass(complaint.status).includes("emerald") ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                  {complaint.status}
                </span>
              </div>

              <div>
                <span className="block text-slate-400 text-[9px] uppercase font-bold tracking-wider">Assigned Agent Specialist</span>
                <span className="font-bold text-slate-800 block mt-0.5">{complaint.agentName || "Unassigned"}</span>
                {complaint.agentEmail && (
                  <span className="text-slate-400 font-mono text-[9px]">{complaint.agentEmail}</span>
                )}
              </div>
            </div>
          </div>

          {/* Admin Assignment Tool Hub */}
          {user?.role === "ADMIN" && (
            <div className="bg-white rounded-md border border-slate-200/60 shadow-xs p-3.5 space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-slate-100 flex items-center gap-1.5">
                <UserIcon className="text-blue-600 w-3.5 h-3.5" /> Admin Allocation Console
              </h4>

              <form onSubmit={handleAssignAgent} className="space-y-2.5">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Select Agent Specialist
                  </label>
                  <select
                    className="block w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    value={selectedAgentId || complaint.agentId || ""}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    id="admin_select_agent"
                  >
                    <option value="">-- Choose Support Agent --</option>
                    {agents.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name} ({ag.email})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading || !selectedAgentId}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold text-[11px] rounded-md transition text-center cursor-pointer"
                  id="admin_btn_assign"
                >
                  {actionLoading ? "Processing..." : "Allocate Specialist"}
                </button>
              </form>
            </div>
          )}

          {/* Agent Control Tool Hub */}
          {user?.role === "AGENT" && complaint.agentId === user.id && (
            <div className="bg-white rounded-md border border-slate-200/60 shadow-xs p-3.5 space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-slate-100 flex items-center gap-1.5">
                <Activity className="text-indigo-600 w-3.5 h-3.5" /> Agent Action Console
              </h4>

              <div className="space-y-3">
                {complaint.status === "ASSIGNED" && (
                  <button
                    onClick={() => handleUpdateStatus("IN_PROGRESS")}
                    disabled={actionLoading}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-md shadow-xs transition cursor-pointer"
                    id="agent_btn_start_investigation"
                  >
                    Start Ticket Investigation
                  </button>
                )}

                {(complaint.status === "ASSIGNED" || complaint.status === "IN_PROGRESS") && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      Provide Resolution Summary
                    </span>
                    <textarea
                      rows={3}
                      placeholder="State actions taken to resolve customer request. Output visible to customer."
                      className="block w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      id="agent_textarea_resolution"
                    />

                    <button
                      onClick={() => handleUpdateStatus("RESOLVED")}
                      disabled={actionLoading || !resolutionNotes.trim()}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-100 disabled:text-slate-400 text-white text-[11px] font-bold rounded-md shadow-xs transition cursor-pointer"
                      id="agent_btn_mark_resolved"
                    >
                      Resolve & Close Ticket
                    </button>
                  </div>
                )}

                {complaint.status === "RESOLVED" && (
                  <p className="text-xs text-slate-400 italic text-center">Ticket is closed.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
