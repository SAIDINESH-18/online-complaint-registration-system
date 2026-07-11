import React from "react";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  LifeBuoy, 
  MessageSquare, 
  TrendingUp, 
  Users 
} from "lucide-react";
import { motion } from "motion/react";

export default function Home() {
  const stats = [
    { label: "Resolved Complaints", value: "98.4%", icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50" },
    { label: "Avg. Resolution Time", value: "< 24 Hours", icon: Clock, color: "text-blue-600 bg-blue-50" },
    { label: "Satisfied Users", value: "15,000+", icon: Users, color: "text-indigo-600 bg-indigo-50" },
    { label: "Support Efficiency", value: "99.2%", icon: TrendingUp, color: "text-violet-600 bg-violet-50" }
  ];

  const features = [
    {
      title: "Quick Registration",
      desc: "Register a secure user profile in seconds. Your private data is safely hashed and protected.",
      icon: Users
    },
    {
      title: "Instant Ticket Creation",
      desc: "Describe your issue, select a category, upload attachments, and submit instantly. No endless holding lines.",
      icon: FileText
    },
    {
      title: "Real-time Tracking & Updates",
      desc: "Watch your ticket move seamlessly from Pending to Assigned, In-Progress, and Resolved. Get detailed logs.",
      icon: Clock
    },
    {
      title: "Agent Communication",
      desc: "Engage with expert agents assigned to your specific case. Review their personalized resolution notes.",
      icon: MessageSquare
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans" id="home_container">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white py-20 px-6 sm:px-12">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="md:w-1/2 text-left"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-blue-200 border border-white/20 mb-6">
              <LifeBuoy className="w-3.5 h-3.5 animate-spin" /> Official Customer Care Portal
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-6">
              Online Complaint <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">
                Registration & Management
              </span>
            </h1>
            <p className="text-lg text-slate-200 mb-8 max-w-lg">
              A transparent, fast, and secure portal designed to voice your issues, allocate designated specialist agents, and track resolutions in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-medium text-white transition shadow-lg shadow-blue-900/30 group"
                id="btn_hero_register"
              >
                Register a Complaint <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/15 font-medium text-white transition border border-white/20"
                id="btn_hero_login"
              >
                Agent & Admin Login
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-8"
          >
            {/* Visual Complaint Progress Mock */}
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="font-mono text-xs text-blue-300">TICKET #8952-B</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  IN_PROGRESS
                </span>
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">Billing mismatch on billing cycle June 2026</h4>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  My account was debited twice. I tried to reach out to local branches but they requested to raise a support portal ticket here.
                </p>
              </div>
              
              {/* Process Bar */}
              <div className="relative pt-6">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-2">
                  <span>SUBMITTED</span>
                  <span>ASSIGNED</span>
                  <span>RESOLVING</span>
                  <span>CLOSED</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-blue-400 rounded-full"></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 -translate-y-4"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 -translate-y-4"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 -translate-y-4"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-white/30 -translate-y-4"></span>
                </div>
              </div>

              {/* Agent Box */}
              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10 mt-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-200 font-bold text-xs">
                  SA
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-white">Alex Johnson (Designated Specialist)</h5>
                  <p className="text-[10px] text-slate-400">Verifying the transaction logs from the payment gateway...</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="max-w-7xl mx-auto py-12 px-6 sm:px-12 -mt-10 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white rounded-xl shadow-md border border-slate-100 p-6 flex items-center gap-4 hover:shadow-lg transition">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-xs font-medium text-slate-500">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Walkthrough */}
      <div className="max-w-7xl mx-auto py-16 px-6 sm:px-12 text-center" id="features_section">
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
            A Complete Complaint Management Lifecycle
          </h2>
          <p className="text-slate-600">
            Say goodbye to physical queues and complex email threads. Raise tickets securely, and monitor our specialists as they bring your issue to resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm text-left hover:border-blue-200 transition">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-5 font-bold">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feat.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Call to action */}
      <div className="bg-slate-900 text-white py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Have an issue that needs urgent attention?</h2>
          <p className="text-slate-400 mb-8 text-sm max-w-lg mx-auto">
            Our platform guarantees response allocation within hours. Create your profile, log your ticket, and let our agents help you.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/register" 
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 font-medium transition text-sm"
              id="btn_footer_get_started"
            >
              Get Started Now
            </Link>
            <Link 
              to="/about" 
              className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 font-medium transition text-sm border border-slate-700"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
