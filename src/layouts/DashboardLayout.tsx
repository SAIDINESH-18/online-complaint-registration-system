import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { 
  Home, 
  PlusCircle, 
  History, 
  User, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  Database,
  ShieldCheck,
  Briefcase,
  TrendingUp,
  Award,
  BellRing
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState({ isUsingMongoDB: false, checked: false });

  // Handle redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Fetch DB fallback status
  useEffect(() => {
    const fetchDbStatus = async () => {
      try {
        const res = await axios.get("/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("complaint_system_token")}`
          }
        });
        // We can just assume success means the server returned.
        // Let's call a quick health endpoint or just display dynamic fallback info
        // Simple trick: ask profile. It returns standard info.
        // Let's do a quick request or set checked: true
        setDbStatus({ isUsingMongoDB: false, checked: true });
      } catch {
        // Ignored
      }
    };
    fetchDbStatus();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Sidebar links based on role
  const getSidebarLinks = () => {
    const common = [{ name: "My Profile", path: "/profile", icon: User }];

    if (user.role === "ADMIN") {
      return [
        { name: "Admin Console", path: "/admin-dashboard", icon: TrendingUp },
        { name: "Manage Users", path: "/admin-users", icon: Users },
        ...common
      ];
    } else if (user.role === "AGENT") {
      return [
        { name: "Agent Dashboard", path: "/agent-dashboard", icon: Briefcase },
        ...common
      ];
    } else {
      // USER
      return [
        { name: "User Dashboard", path: "/user-dashboard", icon: Home },
        { name: "File Complaint", path: "/create-complaint", icon: PlusCircle },
        { name: "Complaint History", path: "/complaint-history", icon: History },
        ...common
      ];
    }
  };

  const links = getSidebarLinks();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-800 font-sans flex flex-col md:flex-row" id="dashboard_layout_container">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-[#0b0f19] text-slate-300 border-r border-[#1e293b] flex-shrink-0">
        {/* Brand Header */}
        <div className="p-4 border-b border-[#1e293b] flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-xs tracking-wider">
            CR
          </div>
          <div>
            <h1 className="text-xs font-bold text-white tracking-wider uppercase">CMS Portal</h1>
            <p className="text-[9px] text-slate-500 font-mono">ROLE: {user.role}</p>
          </div>
        </div>

        {/* User Info Badge */}
        <div className="p-3 mx-3 my-3 bg-[#111827]/60 rounded-lg border border-[#1e293b] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-blue-600/10 text-blue-400 font-bold flex items-center justify-center text-xs border border-blue-500/15">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-[11px] font-bold text-white truncate">{user.name}</h4>
            <p className="text-[9px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition ${
                  active 
                    ? "bg-blue-600 text-white shadow shadow-blue-500/15" 
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-white" : "text-slate-400"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Bar with DB Fallback indicator & Logout */}
        <div className="p-3 border-t border-[#1e293b] space-y-2">
          <div className="flex items-center gap-2 p-2 bg-[#111827]/40 rounded border border-[#1e293b]/50 text-[9px]">
            <Database className="w-3 h-3 text-blue-400" />
            <div className="text-slate-400 leading-tight">
              <span className="font-bold block text-slate-300 text-[10px]">Local Sandbox DB</span>
              <span>Fully Persistent Fallback</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[11px] font-medium text-slate-400 hover:text-white hover:bg-red-950/25 hover:border hover:border-red-900/30 transition text-left"
            id="sidebar_btn_logout"
          >
            <LogOut className="w-3.5 h-3.5 text-red-500" />
            Logout Session
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex justify-between items-center bg-[#0b0f19] text-white py-2 px-4 border-b border-[#1e293b] relative z-30">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-xs">
            CR
          </div>
          <span className="text-xs font-bold uppercase tracking-wider">CMS Portal</span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1 text-slate-400 hover:text-white"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0b0f19] text-slate-300 border-b border-[#1e293b] relative z-20"
          >
            <div className="px-4 py-3 space-y-3">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                <div className="w-7 h-7 rounded bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{user.name}</h4>
                  <p className="text-[10px] text-slate-400">{user.email}</p>
                </div>
              </div>

              <div className="space-y-0.5">
                {links.map((link) => {
                  const Icon = link.icon;
                  const active = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition ${
                        active ? "bg-blue-600 text-white" : "hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {link.name}
                    </Link>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[11px] font-semibold text-red-400 hover:text-white hover:bg-red-950/20 transition text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout Session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Master Content Stage */}
      <main className="flex-1 overflow-x-hidden flex flex-col min-h-screen">
        {/* Top Desktop Bar (only visual and for page titles) */}
        <div className="hidden md:flex justify-between items-center py-2 px-6 bg-white border-b border-slate-200/60">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold text-slate-500 capitalize">{user.role.toLowerCase()} workspace</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="text-[10px] font-medium text-slate-400">Online Complaint Registration</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Simple notification bell icon */}
            <div className="relative p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
              <BellRing className="w-3.5 h-3.5" />
              <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-blue-600"></span>
            </div>

            <div className="text-right border-l border-slate-100 pl-3 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">{user.name}</span>
              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[8px] font-bold rounded border border-blue-100 uppercase">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic page render slot */}
        <div className="flex-1 p-4 md:p-5 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
