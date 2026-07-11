/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.js";

// Public Pages
import Home from "./pages/Home.js";
import About from "./pages/About.js";
import Contact from "./pages/Contact.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";

// Private Dashboard Layout
import DashboardLayout from "./layouts/DashboardLayout.js";

// Private Pages
import UserDashboard from "./pages/UserDashboard.js";
import CreateComplaint from "./pages/CreateComplaint.js";
import ComplaintDetails from "./pages/ComplaintDetails.js";
import ComplaintHistory from "./pages/ComplaintHistory.js";
import FeedbackPage from "./pages/FeedbackPage.js";
import AgentDashboard from "./pages/AgentDashboard.js";
import AdminDashboard from "./pages/AdminDashboard.js";
import AdminUsers from "./pages/AdminUsers.js";
import ProfilePage from "./pages/ProfilePage.js";

import { LifeBuoy, User as UserIcon, LogOut, CheckCircle } from "lucide-react";

// ----------------------------------------------------
// PUBLIC HEADER & FOOTER LAYOUT WRAPPER
// ----------------------------------------------------
function PublicLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact Support", path: "/contact" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans" id="public_layout_container">
      {/* Public Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-sm">
              CR
            </div>
            <div>
              <span className="text-sm font-extrabold text-slate-900 tracking-wider uppercase">CMS PORTAL</span>
              <span className="text-[9px] font-bold text-blue-600 block leading-none font-mono">SECURE AGENT ALLOCATOR</span>
            </div>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-500">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`hover:text-blue-600 transition ${active ? "text-blue-600" : ""}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Authentication Actions */}
          <div className="flex items-center gap-3.5">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={
                    user.role === "ADMIN" 
                      ? "/admin-dashboard" 
                      : user.role === "AGENT" 
                      ? "/agent-dashboard" 
                      : "/user-dashboard"
                  }
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white rounded-lg transition shadow-sm"
                  id="navbar_btn_dashboard"
                >
                  Enter Workspace
                </Link>
                <button
                  onClick={logout}
                  className="p-2 border border-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-xs font-bold text-slate-600 hover:text-blue-600 transition"
                  id="navbar_btn_login"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition"
                  id="navbar_btn_register"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Public Route Slot */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Public Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 px-6 sm:px-8 text-center text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-[10px]">
              CR
            </div>
            <span className="text-slate-200 font-bold tracking-wide">CMS Portal</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            &copy; {new Date().getFullYear()} Online Complaint Registration and Management System. All Rights Reserved.
          </p>
          <div className="flex gap-4 font-bold text-[11px] text-slate-400">
            <Link to="/about" className="hover:text-white transition">About Lifecycle</Link>
            <span>&bull;</span>
            <Link to="/contact" className="hover:text-white transition">Get Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Route Protector to enforce specific roles
function RoleProtectedRoute({ 
  allowedRoles, 
  children 
}: { 
  allowedRoles: ("USER" | "AGENT" | "ADMIN")[]; 
  children: React.ReactNode 
}) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to correct dashboard based on role
    if (user.role === "ADMIN") return <Navigate to="/admin-dashboard" replace />;
    if (user.role === "AGENT") return <Navigate to="/agent-dashboard" replace />;
    return <Navigate to="/user-dashboard" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ==========================================
              PUBLIC ROUTES (Header + Footer styled)
             ========================================== */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />

          {/* ==========================================
              USER ROLE PROTECTED ROUTES
             ========================================== */}
          <Route 
            path="/user-dashboard" 
            element={
              <RoleProtectedRoute allowedRoles={["USER"]}>
                <UserDashboard />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/create-complaint" 
            element={
              <RoleProtectedRoute allowedRoles={["USER"]}>
                <CreateComplaint />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/feedback/:id" 
            element={
              <RoleProtectedRoute allowedRoles={["USER"]}>
                <FeedbackPage />
              </RoleProtectedRoute>
            } 
          />

          {/* ==========================================
              AGENT ROLE PROTECTED ROUTES
             ========================================== */}
          <Route 
            path="/agent-dashboard" 
            element={
              <RoleProtectedRoute allowedRoles={["AGENT"]}>
                <AgentDashboard />
              </RoleProtectedRoute>
            } 
          />

          {/* ==========================================
              ADMIN ROLE PROTECTED ROUTES
             ========================================== */}
          <Route 
            path="/admin-dashboard" 
            element={
              <RoleProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/admin-users" 
            element={
              <RoleProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminUsers />
              </RoleProtectedRoute>
            } 
          />

          {/* ==========================================
              SHARED/COMMON PROTECTED ROUTES
             ========================================== */}
          <Route 
            path="/complaints/:id" 
            element={
              <RoleProtectedRoute allowedRoles={["USER", "AGENT", "ADMIN"]}>
                <ComplaintDetails />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/complaint-history" 
            element={
              <RoleProtectedRoute allowedRoles={["USER", "AGENT", "ADMIN"]}>
                <ComplaintHistory />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <RoleProtectedRoute allowedRoles={["USER", "AGENT", "ADMIN"]}>
                <ProfilePage />
              </RoleProtectedRoute>
            } 
          />

          {/* Fallback Catch */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
