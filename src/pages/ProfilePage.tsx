import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import { 
  User, 
  Phone, 
  Mail, 
  Lock, 
  ShieldAlert, 
  ShieldCheck, 
  Save, 
  Shield 
} from "lucide-react";
import { motion } from "motion/react";

export default function ProfilePage() {
  const { user, updateUserProfile, error, clearError } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);
    setSuccess(null);
    clearError();

    if (!name) {
      setCustomError("Full Name is a required field.");
      return;
    }

    if (password) {
      if (password.length < 6) {
        setCustomError("New Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setCustomError("New Password inputs do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      await updateUserProfile({
        name,
        phone,
        password: password || undefined,
      });
      setSuccess("Profile updated successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto space-y-4" id="profile_page_container">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">Personal Profile Settings</h1>
        <p className="text-[11px] text-slate-500 mt-0.5">Manage your personal details, contact coordinates, and password credentials.</p>
      </div>

      <div className="bg-white rounded-md border border-slate-200/60 shadow-xs p-4 sm:p-5 space-y-4">
        {/* Status messages */}
        {success && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] rounded-md flex items-center gap-1.5" id="profile_success_banner">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
        {(error || customError) && (
          <div className="p-2.5 bg-red-50 border border-red-100 text-red-800 text-[11px] rounded-md flex items-center gap-1.5" id="profile_error_banner">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
            <span>{customError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" id="profile_settings_form">
          {/* Account info header */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-sm select-none">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">{user.name}</h3>
              <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">
                <Shield className="w-3 h-3 text-blue-500" /> {user.role} Account Profile
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-3.5 w-3.5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="block w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  id="profile_input_name"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <input
                  type="text"
                  placeholder="+1 (555) 0123"
                  className="block w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  id="profile_input_phone"
                />
              </div>
            </div>
          </div>

          {/* Email (Readonly) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Email Address (Primary Account Identity - Non-modifiable)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-300">
                <Mail className="h-3.5 w-3.5" />
              </div>
              <input
                type="email"
                disabled
                className="block w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-100 rounded-md bg-slate-50 text-slate-400 cursor-not-allowed font-medium font-mono"
                value={user.email}
              />
            </div>
          </div>

          {/* Change Password Block */}
          <div className="border-t border-slate-100 pt-3.5 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Change Password (Optional)</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              If you wish to change your system access password, fill out the fields below. Otherwise, leave them completely blank.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    className="block w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    id="profile_input_password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="block w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    id="profile_input_confirm_password"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="border-t border-slate-100 pt-3.5 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] rounded-md shadow-xs transition flex items-center gap-1 cursor-pointer"
              id="profile_btn_save"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Save Profile Details
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
