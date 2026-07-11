import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { complaintAPI, feedbackAPI } from "../services/api.js";
import { Complaint } from "../types.js";
import { 
  ArrowLeft, 
  Star, 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  HeartHandshake,
  User
} from "lucide-react";
import { motion } from "motion/react";

export default function FeedbackPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Inputs
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comments, setComments] = useState("");

  useEffect(() => {
    const fetchComplaint = async () => {
      if (!id) return;
      try {
        const res = await complaintAPI.getById(id);
        setComplaint(res.data);
        if (res.data.status !== "RESOLVED") {
          setError("Feedback reviews can only be submitted for resolved complaints.");
        }
      } catch (err: any) {
        setError("Could not retrieve complaint record details.");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setError(null);
    setActionLoading(true);
    try {
      await feedbackAPI.submit({
        complaintId: id,
        rating,
        comments,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/user-dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit feedback. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="max-w-md mx-auto text-center p-5 bg-white border border-slate-200/60 rounded-md shadow-xs space-y-3">
        <ShieldAlert className="w-8 h-8 text-red-500 mx-auto" />
        <h3 className="text-xs font-bold text-slate-800">Review Error</h3>
        <p className="text-[11px] text-slate-400">{error}</p>
        <Link to="/user-dashboard" className="inline-block px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-[11px] font-semibold transition">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4" id="feedback_page_container">
      <div className="flex items-center gap-2">
        <Link to="/user-dashboard" className="p-1 rounded-md hover:bg-slate-100 text-slate-500 transition">
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Support Satisfaction Review</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">Rate your assigned agent and provide supportive feedback notes.</p>
        </div>
      </div>

      <div className="bg-white rounded-md border border-slate-200/60 shadow-xs p-4 sm:p-5">
        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-4 space-y-3"
            id="feedback_success_banner"
          >
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Feedback Submitted Successfully!</h3>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Thank you for evaluating our Support Specialists. Your score has been logged in our system metrics. Redirecting you to your dashboard...
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" id="feedback_page_form">
            {complaint && (
              <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200/60 space-y-1">
                <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">
                  TICKET #{complaint._id.substring(0, 8).toUpperCase()}
                </span>
                <h4 className="text-xs font-bold text-slate-800 leading-snug">{complaint.title}</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium pt-1 mt-1 border-t border-slate-200/50">
                  <User className="w-3 h-3" /> Assigned Specialist:{" "}
                  <span className="font-bold text-slate-700">{complaint.agentName || "Unassigned"}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-2 bg-red-50 border border-red-100 text-red-800 text-[11px] rounded-md flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">How would you rate the agent's service? *</label>
              <div className="flex gap-1.5 items-center">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-0.5 focus:outline-none transition-transform active:scale-90"
                    >
                      <Star 
                        className={`w-6 h-6 ${
                          s <= (hoverRating || rating) 
                            ? "text-amber-400 fill-amber-400 scale-105" 
                            : "text-slate-200"
                        } transition-all`} 
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[11px] font-bold text-slate-400 ml-1.5">({rating}/5 Rating)</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Comments & Review *</label>
              <textarea
                required
                rows={3}
                placeholder="Share your satisfaction review or areas of support improvement..."
                className="block w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                id="feedback_comments_input"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white font-bold text-[11px] rounded-md shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
              id="btn_feedback_page_submit"
            >
              <Send className="w-3 h-3" /> Submit Satisfaction Score
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
