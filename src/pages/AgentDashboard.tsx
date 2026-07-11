import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { complaintAPI, adminAPI } from "../services/api.js";
import { Complaint, AgentMetrics } from "../types.js";
import { useAuth } from "../context/AuthContext.js";
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  Star, 
  Activity, 
  ChevronRight, 
  ShieldAlert,
  RefreshCw
} from "lucide-react";

export default function AgentDashboard() {
  const { user } = useAuth();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics | null>(null);

  const fetchAgentData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get assigned complaints
      const complaintsRes = await complaintAPI.getAll();
      setComplaints(complaintsRes.data);

      // If user is logged in, grab all agent metrics to find this agent's dynamic stats
      const metricsRes = await adminAPI.getAgents();
      const currentAgentMetrics = metricsRes.data.find((a: any) => a.id === user?.id);
      if (currentAgentMetrics) {
        setAgentMetrics(currentAgentMetrics);
      }
    } catch (err: any) {
      setError("Failed to retrieve assigned complaints list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentData();
  }, [user]);

  // Fallback metrics in case Admin endpoint isn't fully set up or for sandbox reliability
  const totalAssigned = complaints.length;
  const activeCount = complaints.filter((c) => c.status === "ASSIGNED" || c.status === "IN_PROGRESS").length;
  const resolvedCount = complaints.filter((c) => c.status === "RESOLVED").length;

  // Render status style
  const getStatusStyle = (status: string) => {
    switch (status) {
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

  const statCards = [
    { label: "Assigned Queue", value: totalAssigned, icon: Briefcase, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { label: "Active Investigations", value: activeCount, icon: Activity, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    { label: "Resolved Work", value: resolvedCount, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { 
      label: "Customer Rating", 
      value: agentMetrics ? `${agentMetrics.averageRating} / 5` : "5.0 / 5", 
      icon: Star, 
      color: "text-amber-600 bg-amber-50 border-amber-100" 
    }
  ];

  return (
    <div className="space-y-4" id="agent_dashboard_container">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Agent Work Console</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Manage tickets assigned to you, update logs, and coordinate resolutions.</p>
        </div>
        <button 
          onClick={fetchAgentData}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 rounded-md text-[11px] font-semibold transition cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" /> Refresh Queue
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`bg-white rounded-md border p-3 flex items-center justify-between shadow-xs ${card.color}`}>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-85">{card.label}</span>
                <h3 className="text-xl font-bold mt-0.5 text-slate-900">{card.value}</h3>
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

      {/* Assigned Tickets Board */}
      <div className="bg-white rounded-md border border-slate-200/60 shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-200/60 bg-slate-50/40">
          <h3 className="text-xs font-bold text-slate-900">Your Ticket Work-List</h3>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Review, investigate, and provide resolution updates for the following concerns.</p>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-10 text-center text-slate-400 max-w-sm mx-auto">
            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-300 mx-auto mb-3">
              <Briefcase className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">No tickets assigned</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              You currently have no service tickets allocated to your queue. Nice work!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 text-[9px] uppercase font-bold tracking-wider border-b border-slate-200/60">
                  <th className="py-2 px-4">Ticket ID</th>
                  <th className="py-2 px-4">Title / Category</th>
                  <th className="py-2 px-4">Customer Details</th>
                  <th className="py-2 px-4">Date Allocated</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {complaints.map((comp) => (
                  <tr key={comp._id} className="hover:bg-slate-50/40 transition">
                    <td className="py-2 px-4 font-mono text-[10px] text-slate-400">
                      #{comp._id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-2 px-4">
                      <div className="font-bold text-slate-900 truncate max-w-xs">{comp.title}</div>
                      <div className="text-[9px] text-slate-400 font-medium">{comp.category}</div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="font-semibold text-slate-700">{comp.userName}</div>
                      <div className="text-[9px] text-slate-400 font-mono">{comp.userEmail}</div>
                    </td>
                    <td className="py-2 px-4 text-slate-500">
                      {new Date(comp.updatedAt).toLocaleDateString("default", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getStatusStyle(comp.status)}`}>
                        {comp.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-right">
                      <Link
                        to={`/complaints/${comp._id}`}
                        className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded font-bold text-[10px] border border-blue-100 transition inline-flex items-center gap-0.5"
                      >
                        Investigate <ChevronRight className="w-3 h-3" />
                      </Link>
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
