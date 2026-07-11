import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { complaintAPI } from "../services/api.js";
import { Complaint } from "../types.js";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  PlusCircle, 
  ChevronRight, 
  ShieldAlert, 
  Activity,
  HeartHandshake
} from "lucide-react";
import { motion } from "motion/react";

export default function UserDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await complaintAPI.getAll();
        setComplaints(res.data);
      } catch (err: any) {
        setError("Could not retrieve complaints. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  // Compute local KPI statistics
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === "PENDING").length;
  const inProgressCount = complaints.filter((c) => c.status === "IN_PROGRESS" || c.status === "ASSIGNED").length;
  const resolvedCount = complaints.filter((c) => c.status === "RESOLVED").length;

  const kpis = [
    { label: "Total Complaints", value: totalCount, icon: FileText, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { label: "Pending Audit", value: pendingCount, icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { label: "In Active Pipeline", value: inProgressCount, icon: Activity, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    { label: "Resolved cases", value: resolvedCount, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-100" }
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border border-amber-200/50";
      case "ASSIGNED":
        return "bg-blue-50 text-blue-700 border border-blue-200/50";
      case "IN_PROGRESS":
        return "bg-indigo-50 text-indigo-700 border border-indigo-200/50";
      case "RESOLVED":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200/50";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" id="dashboard_loading">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4" id="user_dashboard_page">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Customer Dashboard</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Submit new service issues, monitor progress, and review support cases.</p>
        </div>
        <Link
          to="/create-complaint"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 font-semibold text-[11px] text-white transition shadow shadow-blue-500/10 flex-shrink-0 self-start sm:self-auto"
          id="btn_dashboard_new_complaint"
        >
          <PlusCircle className="w-3.5 h-3.5" /> Create Complaint
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className={`bg-white rounded-md border p-3 flex items-center justify-between shadow-xs ${kpi.color}`}>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-85">{kpi.label}</span>
                <h3 className="text-xl font-bold mt-0.5 text-slate-900">{kpi.value}</h3>
              </div>
              <div className="p-1.5 rounded bg-white/60">
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-2.5 bg-red-50 border border-red-100 text-red-800 rounded-md text-[11px] flex gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Recent complaints table */}
      <div className="bg-white rounded-md border border-slate-200/60 shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-200/60 flex justify-between items-center bg-slate-50/40">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Recent Complaints</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">The last active service tickets raised under your account.</p>
          </div>
          <Link 
            to="/complaint-history" 
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-0.5 transition"
          >
            All History <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {complaints.length === 0 ? (
          <div className="p-8 text-center text-slate-400 max-w-sm mx-auto" id="dashboard_empty_state">
            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-300 mx-auto mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">No complaints found</h4>
            <p className="text-[11px] text-slate-400 mt-1 mb-4 leading-relaxed">
              You haven't filed any service tickets yet. If you have an active issue, raise a ticket now.
            </p>
            <Link
              to="/create-complaint"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-[11px] font-semibold transition"
            >
              Raise My First Ticket
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 text-[9px] uppercase font-bold tracking-wider border-b border-slate-200/60">
                  <th className="py-2 px-4">Ticket ID</th>
                  <th className="py-2 px-4">Title / Category</th>
                  <th className="py-2 px-4">Submitted Date</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Specialist Agent</th>
                  <th className="py-2 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {complaints.slice(0, 5).map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-slate-50/40 transition">
                    <td className="py-2 px-4 font-mono text-[10px] text-slate-400">
                      #{complaint._id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-2 px-4">
                      <div className="font-bold text-slate-900 truncate max-w-xs">{complaint.title}</div>
                      <div className="text-[9px] text-slate-400 font-medium">{complaint.category}</div>
                    </td>
                    <td className="py-2 px-4 text-slate-500">
                      {new Date(complaint.createdAt).toLocaleDateString("default", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getStatusStyle(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-slate-500">
                      {complaint.agentName ? (
                        <span className="font-medium text-slate-700 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          {complaint.agentName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/complaints/${complaint._id}`}
                          className="px-2 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded text-slate-700 font-bold text-[10px] transition inline-flex items-center gap-0.5"
                        >
                          Details <ChevronRight className="w-3 h-3" />
                        </Link>
                        {complaint.status === "RESOLVED" && !complaint.feedback && (
                          <Link
                            to={`/feedback/${complaint._id}`}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold text-[10px] rounded border border-emerald-100 transition inline-flex items-center gap-0.5"
                          >
                            <HeartHandshake className="w-3 h-3" /> Rate Support
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
