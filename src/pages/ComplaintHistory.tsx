import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { complaintAPI } from "../services/api.js";
import { Complaint } from "../types.js";
import { 
  Search, 
  Filter, 
  ChevronRight, 
  ShieldAlert, 
  Calendar, 
  FileText,
  UserCheck,
  RefreshCw,
  HeartHandshake
} from "lucide-react";

export default function ComplaintHistory() {
  const { user } = useAuth();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [sort, setSort] = useState("newest");

  const categories = [
    "ALL",
    "Billing & Transactions",
    "Technical Support",
    "Hardware Defect",
    "Service Outage",
    "General Enquiry"
  ];

  const statuses = ["ALL", "PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await complaintAPI.getAll({
        status,
        category,
        search,
        sort,
      });
      setComplaints(res.data);
    } catch (err: any) {
      setError("Failed to load complaints. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch when filters change
  useEffect(() => {
    fetchComplaints();
  }, [status, category, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints();
  };

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
    <div className="space-y-4" id="complaint_history_page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Complaint Archive</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Search, filter, and inspect historic service tickets.</p>
        </div>
        <button 
          onClick={fetchComplaints} 
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 rounded-md text-[11px] font-semibold transition cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" /> Refresh Queue
        </button>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white rounded-md border border-slate-200/60 shadow-xs p-3 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input 
              type="text" 
              placeholder="Search by ticket title, description, category, or ID..."
              className="block w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="input_history_search"
            />
          </div>
          <button 
            type="submit"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
            id="btn_history_search"
          >
            Query
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          {/* Filter Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              className="px-1.5 py-1 border border-slate-200 rounded-md text-[11px] font-semibold bg-white"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              id="select_history_status"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Category */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Category:</span>
            <select
              className="px-1.5 py-1 border border-slate-200 rounded-md text-[11px] font-semibold bg-white"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              id="select_history_category"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-slate-400 font-medium">Sort By:</span>
            <select
              className="px-1.5 py-1 border border-slate-200 rounded-md text-[11px] font-semibold bg-white"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              id="select_history_sort"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error / Loading */}
      {error && (
        <div className="p-2.5 bg-red-50 border border-red-100 text-red-800 rounded-md text-[11px] flex gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table Results */}
      <div className="bg-white rounded-md border border-slate-200/60 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-10 text-center text-slate-400 max-w-xs mx-auto">
            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-md flex items-center justify-center text-slate-300 mx-auto mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-[11px] font-bold text-slate-800">No records found</h4>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              No complaint tickets match the active filter criteria. Try adjusting the query, category, or status tags.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 text-[9px] uppercase font-bold tracking-wider border-b border-slate-200/60">
                  <th className="py-2 px-4">Ticket ID</th>
                  <th className="py-2 px-4">Title / Category</th>
                  <th className="py-2 px-4">Customer</th>
                  <th className="py-2 px-4">Date Logged</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Specialist Agent</th>
                  <th className="py-2 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {complaints.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-slate-50/40 transition">
                    <td className="py-2 px-4 font-mono text-[10px] text-slate-400">
                      #{complaint._id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-2 px-4">
                      <div className="font-bold text-slate-900 truncate max-w-xs">{complaint.title}</div>
                      <div className="text-[9px] text-slate-400 font-medium">{complaint.category}</div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="font-semibold text-slate-700">{complaint.userName}</div>
                      <div className="text-[9px] text-slate-400 font-mono">{complaint.userEmail}</div>
                    </td>
                    <td className="py-2 px-4 text-slate-500 font-medium">
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
