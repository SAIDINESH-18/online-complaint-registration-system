import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { 
  Lock, 
  Mail, 
  ShieldAlert, 
  ChevronRight, 
  UserCheck, 
  UserPlus, 
  Eye, 
  EyeOff 
} from "lucide-react";
import { motion } from "motion/react";

export default function Login() {
  const { login, isAuthenticated, user, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && user) {
      redirectUser(user.role);
    }
    return () => {
      clearError();
    };
  }, [isAuthenticated, user]);

  const redirectUser = (role: string) => {
    if (role === "ADMIN") {
      navigate("/admin-dashboard");
    } else if (role === "AGENT") {
      navigate("/agent-dashboard");
    } else {
      navigate("/user-dashboard");
    }
  };

  const handlePresetLogin = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword("admin123");
    setCustomError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);

    if (!email || !password) {
      setCustomError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      redirectUser(loggedInUser.role);
    } catch (err: any) {
      // Error is handled by AuthContext and will trigger the context error state
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans flex flex-col justify-center py-12 px-6 lg:px-8" id="login_page">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-2xl font-extrabold text-slate-900 tracking-tight">
          Welcome Back
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-500">
          Sign in to access your dashboard and manage complaints.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md border border-slate-100 rounded-2xl space-y-6">
          {/* Display Errors */}
          {(error || customError) && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-100 text-red-800 text-xs flex items-start gap-2.5" id="login_error_banner">
              <ShieldAlert className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span>{customError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" id="login_form">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="login_input_email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-10 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="login_input_password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow shadow-blue-500/10"
              id="login_btn_submit"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  Sign In <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Demo Accounts */}
          <div className="border-t border-slate-100 pt-6">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-3">
              <UserCheck className="w-4 h-4 text-blue-600" /> Fast-Track Demo Login
            </h4>
            <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
              Click any profile below to prefill standard accounts configured in our sandbox. No typing needed:
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => handlePresetLogin("user@complaints.com")}
                className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 transition flex items-center justify-between group"
              >
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Jane Doe (User Role)</h5>
                  <p className="text-[10px] text-slate-400">File complaints, track status, submit reviews</p>
                </div>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full group-hover:bg-blue-100">
                  Select
                </span>
              </button>

              <button
                type="button"
                onClick={() => handlePresetLogin("agent@complaints.com")}
                className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition flex items-center justify-between group"
              >
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Alex Johnson (Agent Role)</h5>
                  <p className="text-[10px] text-slate-400">Resolve tickets, add notes, check stats</p>
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full group-hover:bg-indigo-100">
                  Select
                </span>
              </button>

              <button
                type="button"
                onClick={() => handlePresetLogin("admin@complaints.com")}
                className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/20 transition flex items-center justify-between group"
              >
                <div>
                  <h5 className="text-xs font-bold text-slate-800">System Administrator (Admin Role)</h5>
                  <p className="text-[10px] text-slate-400">Assign agents, manage users, see system metrics</p>
                </div>
                <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full group-hover:bg-purple-100">
                  Select
                </span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 flex items-center justify-center gap-1 mt-1.5">
              <UserPlus className="w-3.5 h-3.5" /> Register a Customer Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
