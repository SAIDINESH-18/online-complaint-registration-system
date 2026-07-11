import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  HelpCircle
} from "lucide-react";
import { motion } from "motion/react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  const contactDetails = [
    {
      title: "Support Desk Email",
      value: "support@complaints.com",
      desc: "For general queries, billing clarification, or feedback audits.",
      icon: Mail,
      color: "bg-blue-50 text-blue-700"
    },
    {
      title: "Emergency Telephone",
      value: "+1 (555) 019-9922",
      desc: "Available Monday - Friday, 9:00 AM - 6:00 PM EST.",
      icon: Phone,
      color: "bg-indigo-50 text-indigo-700"
    },
    {
      title: "Corporate Headquarters",
      value: "Level 14, Tech Plaza, New York, NY 10001",
      desc: "Physical corporate offices (strictly by appointment only).",
      icon: MapPin,
      color: "bg-slate-100 text-slate-700"
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans" id="contact_page">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-14 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Contact Support</h1>
          <p className="text-blue-100 max-w-lg mx-auto text-sm">
            Need urgent assistance or have questions before signing up? Get in touch with our helpdesk administrators.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-16 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Side Details Column */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Connect With Us</h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Our support team averages a response rate of under 12 hours for all contact inquiries. For active customer issues, please register and file a ticket directly.
            </p>

            <div className="space-y-4">
              {contactDetails.map((detail, idx) => {
                const Icon = detail.icon;
                return (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex gap-4">
                    <div className={`p-3 rounded-xl flex-shrink-0 self-start ${detail.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500">{detail.title}</h4>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{detail.value}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{detail.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <MessageSquare className="text-blue-600 w-5 h-5" /> Send a Quick Message
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Fill out this contact form, and our system administrators will route it to the appropriate supervisor.
              </p>

              {submitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-8 rounded-xl text-center space-y-4"
                  id="contact_success_card"
                >
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold">Message Sent Successfully!</h4>
                  <p className="text-xs max-w-md mx-auto">
                    Thank you for reaching out. An inquiry record has been registered in our database, and a support officer will respond via email shortly.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" id="contact_form">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Full Name *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="John Doe"
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        id="contact_input_name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Email Address *</label>
                      <input 
                        type="email" 
                        required
                        placeholder="johndoe@email.com"
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        id="contact_input_email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Subject</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Account Registration Issue"
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      id="contact_input_subject"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Your Message *</label>
                    <textarea 
                      required
                      rows={5}
                      placeholder="Please write your message or question here in detail..."
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      id="contact_input_message"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition flex items-center justify-center gap-2 shadow hover:shadow-md disabled:bg-blue-400"
                    id="contact_btn_submit"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
