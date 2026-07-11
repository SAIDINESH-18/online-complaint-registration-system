import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  ShieldAlert, 
  UserPlus, 
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { motion } from "motion/react";

export default function Register() {
  const { register, isAuthenticated, user, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"USER" | "AGENT" | "ADMIN">("USER");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  useEffect(() => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);

    // Form Validations
    if (!name || !email || !password) {
      setCustomError("Please fill out all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setCustomError("Passwords do not match. Please check and try again.");
      return;
    }

    if (password.length < 6) {
      setCustomError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const registeredUser = await register({
        name,
        email,
        password,
        phone,
        role,
      });
      redirectUser(registeredUser.role);
    } catch (err: any) {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans flex flex-col justify-center py-12 px-6 lg:px-8" id="register_page">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-2xl font-extrabold text-slate-900 tracking-tight">
          Create Your Account
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-500">
          Register to submit and track service complaints instantly.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md border border-slate-100 rounded-2xl space-y-5">
          {/* Validation Errors */}
          {(error || customError) && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-100 text-red-800 text-xs flex items-start gap-2.5" id="register_error_banner">
              <ShieldAlert className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span>{customError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" id="register_form">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Full Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  id="register_input_name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Email Address *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="jane@company.com"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="register_input_email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    placeholder="+1 (555) 0123"
                    className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    id="register_input_phone"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Account Role *</label>
                <select
                  className="block w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  id="register_select_role"
                >
                  <option value="USER">Customer (USER)</option>
                  <option value="AGENT">Support Agent (AGENT)</option>
                  <option value="ADMIN">System Administrator (ADMIN)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Password *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min 6 chars"
                    className="block w-full pl-9 pr-10 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    id="register_input_password"
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

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Confirm Password *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    id="register_input_confirm_password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow"
              id="register_btn_submit"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  Create Account <UserPlus className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
