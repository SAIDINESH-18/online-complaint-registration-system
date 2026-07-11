import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminAPI, complaintAPI } from "../services/api.js";
import { DashboardMetrics, Complaint } from "../types.js";
import { 
  BarChart3, 
  Users, 
  UserCheck, 
  FileText, 
  Star, 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  Clock,
  ChevronRight,
  RefreshCw,
  PieChart as PieIcon
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const statsRes = await adminAPI.getDashboardStats();
      setMetrics(statsRes.data);

      const complaintsRes = await complaintAPI.getAll();
      setRecentComplaints(complaintsRes.data);
    } catch (err: any) {
      setError("Failed to load dashboard metrics. Connect your database or reload.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" id="admin_loading">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Fallback stats structure in case database results are thin
  const stats = metrics?.metrics || {
    totalUsers: 0,
    totalAgents: 0,
    totalComplaints: 0,
    statusBreakdown: { pending: 0, assigned: 0, inProgress: 0, resolved: 0 },
    averageRating: 0.0,
    totalFeedbackCount: 0
  };

  const statCards = [
    { label: "Platform Users", value: stats.totalUsers, icon: Users, color: "bg-blue-50 text-blue-700 border-blue-100" },
    { label: "Support Agents", value: stats.totalAgents, icon: UserCheck, color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
    { label: "Total Complaints", value: stats.totalComplaints, icon: FileText, color: "bg-slate-50 text-slate-700 border-slate-100" },
    { 
      label: "Customer Rating", 
      value: stats.averageRating > 0 ? `${stats.averageRating} / 5` : "5.0 / 5", 
      icon: Star, 
      color: "bg-amber-50 text-amber-700 border-amber-100" 
    }
  ];

  // Colors for Recharts Pie Chart
  const COLORS = ["#f59e0b", "#3b82f6", "#6366f1", "#10b981"]; // PENDING, ASSIGNED, IN_PROGRESS, RESOLVED
  const pieData = [
    { name: "Pending", value: stats.statusBreakdown.pending || 0 },
    { name: "Assigned", value: stats.statusBreakdown.assigned || 0 },
    { name: "In Progress", value: stats.statusBreakdown.inProgress || 0 },
    { name: "Resolved", value: stats.statusBreakdown.resolved || 0 },
  ].filter(d => d.value > 0);

  // In case pieData is empty (for first load/no complaints), add fallback placeholders
  const displayPieData = pieData.length > 0 ? pieData : [
    { name: "No Active Tickets", value: 1 }
  ];

  // Trend data mapping
  const timelineData = metrics?.timelineData || [];

  const getStatusStyle = (complaintStatus: string) => {
    switch (complaintStatus) {
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

  return (
    <div className="space-y-4" id="admin_dashboard_container">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Platform Administration</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Global audit portal. Monitor metrics, assign specialist agents, and evaluate ratings.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin-users"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white border border-slate-200 font-semibold text-[11px] text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition"
          >
            <Users className="w-3.5 h-3.5 text-slate-500" /> Manage Roles
          </Link>
          <button 
            onClick={fetchAdminData}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-[11px] font-semibold shadow shadow-blue-500/10 transition cursor-pointer"
            id="admin_btn_reload"
          >
            <RefreshCw className="w-3 h-3" /> Reload Stats
          </button>
        </div>
      </div>

      {/* KPI stats bar */}
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

      {/* Analytics Charts split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2/3: Monthly complaints trend (Area chart) */}
        <div className="lg:col-span-2 bg-white rounded-md border border-slate-200/60 shadow-xs p-3.5 space-y-3">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <BarChart3 className="text-blue-600 w-4 h-4" /> Monthly Complaint Registration Volume
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {timelineData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[11px] text-slate-400">
                  No historical timeline logs found. Raise some complaints first to compile trends.
                </div>
              ) : (
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: "9px", fill: "#94a3b8" }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: "9px", fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ fontSize: "10px", borderRadius: "6px", border: "1px solid #e2e8f0" }} />
                  <Area type="monotone" dataKey="count" name="Raised Complaints" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1/3: Status breakdown (Pie Chart) */}
        <div className="bg-white rounded-md border border-slate-200/60 shadow-xs p-3.5 space-y-3 flex flex-col justify-between">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <PieIcon className="text-indigo-600 w-4 h-4" /> Complaint Status Breakdown
          </h3>
          <div className="h-40 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={54}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {displayPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieData.length > 0 ? COLORS[index % COLORS.length] : "#e2e8f0"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: "9px", borderRadius: "6px" }} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend Center stats overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
              <span className="text-xl font-bold text-slate-800">{stats.totalComplaints}</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active Tickets</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[9px] pt-2 border-t border-slate-100 font-semibold text-slate-500">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Pending ({stats.statusBreakdown.pending})</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>Assigned ({stats.statusBreakdown.assigned})</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              <span>Resolving ({stats.statusBreakdown.inProgress})</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Resolved ({stats.statusBreakdown.resolved})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global complaints log listing */}
      <div className="bg-white rounded-md border border-slate-200/60 shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-200/60 flex justify-between items-center bg-slate-50/40">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Global Ticket Master-Log</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Verify progress and assign specialist agents on pending tickets.</p>
          </div>
          <Link 
            to="/complaint-history" 
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-0.5 transition"
          >
            Audit Archive <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <FileText className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <p className="text-xs">No customer complaints have been raised on the platform yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 text-[9px] uppercase font-bold tracking-wider border-b border-slate-200/60">
                  <th className="py-2 px-4">Ticket ID</th>
                  <th className="py-2 px-4">Customer</th>
                  <th className="py-2 px-4">Title / Category</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Assigned Specialist</th>
                  <th className="py-2 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {recentComplaints.slice(0, 10).map((comp) => (
                  <tr key={comp._id} className="hover:bg-slate-50/40 transition">
                    <td className="py-2 px-4 font-mono text-[10px] text-slate-400">
                      #{comp._id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-2 px-4">
                      <div className="font-semibold text-slate-800">{comp.userName}</div>
                      <div className="text-[9px] text-slate-400 font-mono">{comp.userEmail}</div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="font-bold text-slate-900 truncate max-w-xs">{comp.title}</div>
                      <div className="text-[9px] text-slate-400 font-medium">{comp.category}</div>
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getStatusStyle(comp.status)}`}>
                        {comp.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-slate-500">
                      {comp.agentName ? (
                        <span className="font-medium text-slate-700 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          {comp.agentName}
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[9px] font-bold border border-amber-100">
                          Pending Allocation
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-right">
                      <Link
                        to={`/complaints/${comp._id}`}
                        className="px-2 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded text-slate-700 font-bold text-[10px] transition inline-flex items-center gap-0.5"
                      >
                        Details <ChevronRight className="w-3 h-3" />
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
