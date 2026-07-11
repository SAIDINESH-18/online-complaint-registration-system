import React from "react";
import { Link } from "react-router-dom";
import { 
  FileText, 
  UserCheck, 
  Activity, 
  CheckCircle, 
  HelpCircle, 
  ArrowRight,
  ShieldCheck,
  Award
} from "lucide-react";

export default function About() {
  const workflow = [
    {
      step: "01",
      title: "Complaint Registration",
      desc: "Users file a ticket, select an appropriate category (e.g. Billing, Technical Support, General Enquiry, Service Outage), add a detailed description, and upload visual evidence/files.",
      icon: FileText,
      color: "border-blue-100 bg-blue-50/50 text-blue-700"
    },
    {
      step: "02",
      title: "Specialist Assignment",
      desc: "Our Administrators audit the incoming queue and match your complaint to a Support Specialist Agent based on your selected category and active workloads.",
      icon: UserCheck,
      color: "border-amber-100 bg-amber-50/50 text-amber-700"
    },
    {
      step: "03",
      title: "Resolution Pipeline",
      desc: "The assigned agent investigates the ticket, sets status to IN_PROGRESS, performs action logs, and provides dynamic update summaries detailing the resolution.",
      icon: Activity,
      color: "border-purple-100 bg-purple-50/50 text-purple-700"
    },
    {
      step: "04",
      title: "Closure & Feedback Audit",
      desc: "Once marked as RESOLVED, users examine the agent's resolution notes, submit satisfaction feedback, and provide a 1-5 star rating to ensure high quality support.",
      icon: CheckCircle,
      color: "border-emerald-100 bg-emerald-50/50 text-emerald-700"
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans" id="about_page">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-14 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">About Our Platform</h1>
          <p className="text-blue-100 max-w-lg mx-auto text-sm">
            Bridging the gap between customers and service providers through state-of-the-art tracking, transparency, and accountability.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-16 px-6">
        {/* Mission statement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="text-blue-600 w-6 h-6" /> Our Core Mission
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm mb-4">
              Our Online Complaint Registration and Management System is designed to provide immediate resolution vectors for modern organizations. We understand that delay in customer support translates into lost trust.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm mb-6">
              By introducing custom role management (User, Agent, Admin), automated audits, and satisfaction feedbacks, we provide a unified standard that tracks performance, speeds up response times, and enforces accountability.
            </p>
            <div className="flex gap-4">
              <div className="bg-white px-4 py-3 rounded-xl border border-slate-100 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-800">100% Encrypted Data</span>
              </div>
              <div className="bg-white px-4 py-3 rounded-xl border border-slate-100 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-semibold text-slate-800">Real-time Dashboard</span>
              </div>
            </div>
          </div>
          <div className="bg-slate-100 p-8 rounded-2xl border border-slate-200/50 relative">
            <HelpCircle className="w-12 h-12 text-blue-200 absolute top-4 right-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-3">Why choose our system?</h3>
            <ul className="space-y-3.5 text-slate-600 text-xs">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                <span><strong>Role Isolation:</strong> Separate interfaces for customers, customer care agents, and global admins.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                <span><strong>Attachment Uploads:</strong> Supporting image captures of invoices or technical errors directly in-app.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                <span><strong>Audit Metrics:</strong> In-depth charts showing response times, status breakdowns, and agent workloads.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                <span><strong>Feedback Loop:</strong> Direct feedback logging with comment indices and agent ratings.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Workflow steps */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-12">The Complaint Lifecycle</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflow.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative flex flex-col justify-between">
                  <div>
                    <span className="text-4xl font-extrabold text-slate-100 absolute top-4 right-6 select-none font-mono">
                      {item.step}
                    </span>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-6 ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action segment */}
        <div className="bg-blue-600 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 mt-12">
          <div className="text-left md:max-w-xl">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">Ready to raise your service ticket?</h3>
            <p className="text-blue-100 text-xs">
              File your issue with complete peace of mind. We maintain a zero-tolerance policy for delayed client concerns. Raise your request now and monitor your progress.
            </p>
          </div>
          <Link 
            to="/register" 
            className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3.5 bg-white text-blue-700 hover:bg-blue-50 font-semibold rounded-xl transition shadow"
            id="about_btn_register"
          >
            Create My Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
