import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { complaintAPI } from "../services/api.js";
import { 
  ArrowLeft, 
  UploadCloud, 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  PlusCircle,
  FileImage
} from "lucide-react";
import { motion } from "motion/react";

export default function CreateComplaint() {
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Billing & Transactions");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const categories = [
    "Billing & Transactions",
    "Technical Support",
    "Hardware Defect",
    "Service Outage",
    "General Enquiry"
  ];

  // Process selected files and convert to Base64
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image attachments (PNG, JPG, JPEG) are supported.");
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Maximum supported size is 5MB.");
      return;
    }

    setError(null);
    setAttachmentName(file.name);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setAttachment(reader.result as string);
    };
    reader.onerror = () => {
      setError("Error processing file attachment.");
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentName(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !description || !category) {
      setError("Please complete all required fields.");
      return;
    }

    setLoading(true);
    try {
      await complaintAPI.create({
        title,
        category,
        description,
        attachmentUrl: attachment || "",
      });
      navigate("/user-dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to register complaint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto" id="create_complaint_page">
      {/* Back Header navigation */}
      <div className="flex items-center gap-2">
        <Link 
          to="/user-dashboard" 
          className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
        <div>
          <h1 className="text-md font-bold text-slate-900">File a Service Complaint</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">Fill out details about your issue and upload relevant proof.</p>
        </div>
      </div>

      <div className="bg-white rounded-md border border-slate-200/60 shadow-xs p-4 sm:p-5">
        {error && (
          <div className="p-2 bg-red-50 border border-red-100 text-red-800 rounded-md text-[11px] flex gap-1.5 mb-4" id="complaint_error_banner">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" id="complaint_creation_form">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Complaint Title *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Erroneous payment debit on transaction #7842"
              className="block w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              id="input_complaint_title"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Problem Category *</label>
            <select
              className="block w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              id="select_complaint_category"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Detailed Description *</label>
            <p className="text-[10px] text-slate-400 mb-1">
              Explain your issue in detail. Include dates, transaction IDs, or previous support interactions.
            </p>
            <textarea 
              required
              rows={4}
              placeholder="Provide a step-by-step summary of the problem..."
              className="block w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              id="textarea_complaint_desc"
            />
          </div>

          {/* Drag & Drop File Upload */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Visual Evidence / Screenshot (Optional)</label>
            
            {!attachment ? (
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-md p-4 text-center transition cursor-pointer flex flex-col items-center justify-center ${
                  dragActive 
                    ? "border-blue-500 bg-blue-50/20" 
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/10"
                }`}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input 
                  type="file" 
                  id="file-input"
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <UploadCloud className="w-6 h-6 text-slate-400 mb-1.5" />
                <p className="text-[11px] font-bold text-slate-700">Drag & drop your screenshot, or browse</p>
                <p className="text-[9px] text-slate-400 mt-0.5">PNG, JPG, JPEG up to 5MB are supported.</p>
              </div>
            ) : (
              <div className="p-2 bg-slate-50 rounded-md border border-slate-200/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 overflow-hidden">
                    <img src={attachment} alt="Upload Thumbnail" className="w-full h-full object-cover" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-bold text-slate-800 truncate">{attachmentName}</p>
                    <p className="text-[9px] text-slate-400 font-medium">Successfully attached</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={removeAttachment}
                  className="p-1 rounded-md bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Submits */}
          <div className="border-t border-slate-100 pt-3.5 flex items-center justify-end gap-2">
            <Link 
              to="/user-dashboard"
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700 transition"
            >
              Cancel
            </Link>
            <button 
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-semibold text-[11px] rounded-md shadow-xs transition inline-flex items-center gap-1 cursor-pointer"
              id="btn_complaint_submit"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" /> Raise Complaint
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
