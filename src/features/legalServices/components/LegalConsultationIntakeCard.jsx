import React, { useState } from "react";
import {
  FiCheckCircle,
  FiFileText,
  FiLock,
  FiMail,
  FiPhone,
  FiSend,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { MdOutlineVerified } from "react-icons/md";

import { API_BASE_URL } from "@shared/services/apiClient";

const LegalConsultationIntakeCard = ({
  defaultCategory = "",
  defaultServiceTitle = "",
  compact = false,
  className = "",
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    concern: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setErrorMessage("Please enter your name, phone number, and email address.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const fullConcern = defaultServiceTitle || defaultCategory
        ? `[Service: ${defaultServiceTitle || defaultCategory}]\n${formData.concern.trim()}`
        : formData.concern.trim();

      const response = await fetch(`${API_BASE_URL}/help`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phoneNumber: formData.phone.trim(),
          concern: fullConcern,
        }),
      });

      const data = await response.json();

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "Unable to submit your consultation request.");
      }

      setReferenceId(data?.referenceId || `VS-${Math.floor(100000 + Math.random() * 900000)}`);
      setIsSubmitted(true);
      setFormData({
        name: "",
        phone: "",
        email: "",
        concern: "",
      });
    } catch (err) {
      console.error("Legal Consultation Request Error:", err);
      setErrorMessage(
        err?.message || "Failed to submit request. Please try again or check your connection."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setReferenceId("");
    setErrorMessage("");
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#10192e] via-[#0b1222] to-[#070b16] p-6 sm:p-7 shadow-2xl shadow-slate-950/80 backdrop-blur-2xl transition-all duration-300 hover:border-amber-400/50 ${className}`}
    >
      {/* Golden top accent bar with subtle ambient glow */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600 shadow-md shadow-amber-400/30" />

      {/* Modern Ambient Radial Glows */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-blue-600/10 blur-3xl" />

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          {/* Header */}
          <div className="border-b border-slate-800/90 pb-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-400/10 border border-amber-400/40 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 shadow-xs mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>⚡ Quick Legal Consultation</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
              Talk to an Expert Advocate
            </h3>
            <p className="text-xs text-slate-300/90 mt-1 font-medium leading-relaxed">
              Fill in your details — an enrolled advocate connects within 15 minutes.
            </p>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name <span className="text-amber-400">*</span>
              </label>
              <div className="relative group">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-400 transition-colors text-sm" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="w-full rounded-xl border border-slate-700/80 bg-[#070d1a]/90 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm font-semibold text-white placeholder-slate-500 shadow-inner focus:border-amber-400 focus:bg-[#0a1326] focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Phone Number <span className="text-amber-400">*</span>
              </label>
              <div className="relative group">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-400 transition-colors text-sm" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                  className="w-full rounded-xl border border-slate-700/80 bg-[#070d1a]/90 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm font-semibold text-white placeholder-slate-500 shadow-inner focus:border-amber-400 focus:bg-[#0a1326] focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Email Address <span className="text-amber-400">*</span>
            </label>
            <div className="relative group">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-400 transition-colors text-sm" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-slate-700/80 bg-[#070d1a]/90 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm font-semibold text-white placeholder-slate-500 shadow-inner focus:border-amber-400 focus:bg-[#0a1326] focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
              />
            </div>
          </div>

          {/* Concern */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Describe your legal concern <span className="text-amber-400">*</span>
            </label>
            <div className="relative group">
              <FiFileText className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-amber-400 transition-colors text-sm pointer-events-none" />
              <textarea
                name="concern"
                rows={compact ? 2 : 3}
                value={formData.concern}
                onChange={handleChange}
                required
                placeholder="Briefly explain your legal issue, situation or question..."
                className="w-full rounded-xl border border-slate-700/80 bg-[#070d1a]/90 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm font-medium text-white placeholder-slate-500 shadow-inner focus:border-amber-400 focus:bg-[#0a1326] focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all resize-none"
              />
            </div>
          </div>

          {errorMessage && (
            <p className="rounded-xl bg-rose-500/15 border border-rose-500/40 p-2.5 text-xs font-semibold text-rose-300">
              {errorMessage}
            </p>
          )}

          {/* Modern Highlighted Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 py-3.5 px-4 text-sm font-black text-slate-950 shadow-xl shadow-amber-500/25 transition-all duration-300 hover:brightness-110 hover:shadow-amber-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            <FiSend className="text-base transition-transform group-hover:translate-x-0.5" />
            <span>
              {isSubmitting ? "Connecting with Advocate..." : "Book Advocate Consultation Now"}
            </span>
          </button>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-1.5 text-[11px] font-medium text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <FiLock className="text-amber-400 text-xs" />
              <span>100% Confidential</span>
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span className="flex items-center gap-1.5 text-slate-300">
              <MdOutlineVerified className="text-amber-400 text-sm" />
              <span>Advocate-Client Privilege</span>
            </span>
          </div>
        </form>
      ) : (
        /* Success Screen */
        <div className="relative z-10 py-6 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 shadow-lg shadow-emerald-500/20">
            <FiCheckCircle className="text-2xl" />
          </div>

          <span className="inline-block rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-0.5 text-xs font-bold text-emerald-300">
            Consultation Requested
          </span>

          <h3 className="text-xl sm:text-2xl font-black text-white">
            Advocate Assigned!
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            Thank you, <strong className="text-white">{formData.name}</strong>. An advocate specializing in{" "}
            <strong className="text-amber-400">{defaultServiceTitle || "this matter"}</strong> will connect with you within 15 minutes.
          </p>

          <div className="mx-auto max-w-xs rounded-xl border border-slate-700/80 bg-[#070d1a] p-3 text-xs text-slate-400 shadow-inner">
            <span>Reference ID: </span>
            <strong className="text-amber-400 font-mono text-sm">{referenceId}</strong>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="mt-2 rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition"
          >
            Submit Another Query
          </button>
        </div>
      )}
    </div>
  );
};

export default LegalConsultationIntakeCard;
