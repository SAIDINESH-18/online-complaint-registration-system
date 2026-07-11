import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api.js";
import { useAuth } from "../context/AuthContext.js";
import { User, AgentMetrics } from "../types.js";
import { 
  Users, 
  Trash2, 
  ShieldAlert, 
  Check, 
  Star, 
  ShieldCheck, 
  UserCog, 
  Briefcase,
  RefreshCw,
  Mail,
  Phone
} from "lucide-react";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<any[]>([]);
  const [agents, setAgents] = useState<AgentMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const usersRes = await adminAPI.getUsers();
      setUsers(usersRes.data);

      const agentsRes = await adminAPI.getAgents();
      setAgents(agentsRes.data);
    } catch (err: any) {
      setError("Failed to fetch user database records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    setError(null);
    setSuccess(null);
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setSuccess("User role updated successfully.");
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update user role.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      setError("You cannot delete your own active administrator account.");
      return;
    }

    if (!window.confirm("Are you sure you want to permanently delete this user? All their registered complaints may lose references.")) {
      return;
    }

    setActionLoading(userId);
    setError(null);
    setSuccess(null);
    try {
      await adminAPI.deleteUser(userId);
      setSuccess("User deleted successfully.");
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-4" id="admin_users_page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Identity & Workload Console</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Manage user authorization privileges, configure agents, and monitor performance scorecards.</p>
        </div>
        <button 
          onClick={fetchData} 
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 rounded-md text-[11px] font-semibold transition cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" /> Reload Database
        </button>
      </div>

      {/* Dynamic message logs */}
      {success && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] rounded-md flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-2.5 bg-red-50 border border-red-100 text-red-800 text-[11px] rounded-md flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid Split */}
      <div className="space-y-4">
        {/* Section 1: User master list */}
        <div className="bg-white rounded-md border border-slate-200/60 shadow-xs overflow-hidden">
          <div className="p-3 border-b border-slate-200/60 bg-slate-50/40">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <UserCog className="text-blue-600 w-4 h-4" /> User Directory & Privilege Controls
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Modify individual roles (USER, AGENT, ADMIN) or delete inactive accounts.</p>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center items-center">
              <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : users.length === 0 ? (
            <p className="p-10 text-center text-slate-400 text-xs">No registered users in the directory database.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-500 text-[9px] uppercase font-bold tracking-wider border-b border-slate-200/60">
                    <th className="py-2 px-4">Name / Details</th>
                    <th className="py-2 px-4">Email / Phone</th>
                    <th className="py-2 px-4">Joined Date</th>
                    <th className="py-2 px-4">Current Role</th>
                    <th className="py-2 px-4">Change Role Privilege</th>
                    <th className="py-2 px-4 text-right">Delete Account</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {users.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/40 transition">
                      <td className="py-2 px-4">
                        <div className="font-bold text-slate-800">{item.name}</div>
                        <div className="text-[9px] text-slate-400 font-mono">ID: #{item.id.substring(0, 8).toUpperCase()}</div>
                      </td>
                      <td className="py-2 px-4 space-y-0.5 text-slate-600">
                        <div className="flex items-center gap-1 font-medium">
                          <Mail className="w-3 h-3 text-slate-400" /> {item.email}
                        </div>
                        {item.phone && (
                          <div className="flex items-center gap-1 text-[9px] text-slate-400">
                            <Phone className="w-2.5 h-2.5 text-slate-300" /> {item.phone}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-4 text-slate-400 font-medium">
                        {new Date(item.createdAt).toLocaleDateString("default", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          item.role === "ADMIN" 
                            ? "bg-purple-50 text-purple-700 border border-purple-200/50" 
                            : item.role === "AGENT" 
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200/50" 
                            : "bg-blue-50 text-blue-700 border border-blue-200/50"
                        }`}>
                          {item.role}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <select
                          disabled={actionLoading === item.id || item.id === currentUser?.id}
                          className="px-1.5 py-1 border border-slate-200 rounded-md text-[11px] font-semibold bg-white disabled:bg-slate-50"
                          value={item.role}
                          onChange={(e) => handleRoleChange(item.id, e.target.value)}
                        >
                          <option value="USER">Customer (USER)</option>
                          <option value="AGENT">Support Specialist (AGENT)</option>
                          <option value="ADMIN">System Admin (ADMIN)</option>
                        </select>
                      </td>
                      <td className="py-2 px-4 text-right">
                        <button
                          disabled={actionLoading === item.id || item.id === currentUser?.id}
                          onClick={() => handleDeleteUser(item.id)}
                          className="p-1 rounded-md border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-slate-400 transition cursor-pointer"
                          id={`btn_delete_user_${item.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: Agent Workload & Rating metrics */}
        <div className="bg-white rounded-md border border-slate-200/60 shadow-xs overflow-hidden">
          <div className="p-3 border-b border-slate-200/60 bg-slate-50/40">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Briefcase className="text-indigo-600 w-4 h-4" /> Support Specialist Performance Scorecard
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Real-time stats tracking agent workloads, resolved complaints, and client ratings.</p>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center items-center">
              <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : agents.length === 0 ? (
            <p className="p-10 text-center text-slate-400 text-xs">No active Support Specialist Agents configured in the database.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-500 text-[9px] uppercase font-bold tracking-wider border-b border-slate-200/60">
                    <th className="py-2 px-4">Specialist Name</th>
                    <th className="py-2 px-4">Email / Phone</th>
                    <th className="py-2 px-4 text-center">Allocated Complaints</th>
                    <th className="py-2 px-4 text-center">In Progress</th>
                    <th className="py-2 px-4 text-center">Resolved Closed</th>
                    <th className="py-2 px-4 text-right">Average Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {agents.map((ag) => (
                    <tr key={ag.id} className="hover:bg-slate-50/40 transition">
                      <td className="py-2 px-4 font-bold text-slate-800">{ag.name}</td>
                      <td className="py-2 px-4 text-slate-600 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" /> {ag.email}
                        </div>
                        {ag.phone && (
                          <div className="flex items-center gap-1 text-[9px] text-slate-400">
                            <Phone className="w-2.5 h-2.5 text-slate-300" /> {ag.phone}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-4 text-center font-bold text-blue-600">{ag.assignedCount}</td>
                      <td className="py-2 px-4 text-center font-bold text-indigo-600">{ag.inProgressCount}</td>
                      <td className="py-2 px-4 text-center font-bold text-emerald-600">{ag.resolvedCount}</td>
                      <td className="py-2 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{ag.averageRating > 0 ? ag.averageRating : "5.0"}</span>
                          <span className="text-slate-400 text-[9px] font-medium">/ 5</span>
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
    </div>
  );
}
