import React, { useState } from "react";
import {
  FiArrowRight,
  FiCheckCircle,
  FiFileText,
  FiLock,
  FiMail,
  FiPhone,
  FiPlus,
  FiUser,
} from "react-icons/fi";
import {
  MdLightbulbOutline,
  MdOutlineSupportAgent,
  MdOutlineVerifiedUser,
} from "react-icons/md";

import { API_BASE_URL } from "@shared/services/apiClient";

const HelpForm = ({ className = "" }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    concern: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");

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

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/help`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phoneNumber: formData.phone.trim(),
          concern: formData.concern.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "Unable to submit your help request.",
        );
      }

      console.log("Help Request Submitted:", data);

      setReferenceId(data?.referenceId || "");
      setIsSubmitted(true);

      setFormData({
        name: "",
        email: "",
        phone: "",
        concern: "",
      });
    } catch (error) {
      console.error("Help Request Error:", error);

      alert(
        error?.message ||
          "Something went wrong while submitting your request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewRequest = () => {
    setIsSubmitted(false);
    setReferenceId("");
  };

  return (
    <section className={`w-full ${className}`}>
      <div className="w-full sm:py-10 lg:py-10">
        <div
          className="
            w-full
            grid
            grid-cols-1
            lg:grid-cols-[0.9fr_1.1fr]
            gap-8
            lg:gap-10
            xl:gap-14
            items-start
          "
        >
          {/* =====================================================
              LEFT SIDE — SUPPORT INFORMATION
          ====================================================== */}
          <div className="w-full min-w-0">
            {/* Icon */}
            <div
              className="
                inline-flex
                items-center
                justify-center
                w-10
                h-10
                rounded-xl
                bg-amber-50
                border
                border-amber-100
                mb-4
              "
              aria-hidden="true"
            >
              <MdOutlineSupportAgent className="text-lg text-amber-500" />
            </div>

            {/* Label */}
            <p
              className="
                mb-2
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-amber-500
              "
            >
              Legal Support
            </p>

            {/* Heading */}
            <h2
              className="
                text-2xl
                sm:text-3xl
                lg:text-4xl
                font-extrabold
                text-slate-900
                tracking-tight
                leading-[1.1]
              "
            >
              Still have questions?
            </h2>

            {/* Description */}
            <p
              className="
                mt-3
                max-w-xl
                text-sm
                sm:text-base
                text-slate-500
                leading-6
              "
            >
              Can't find what you're looking for? Tell us about your legal
              concern and we'll help you find the right path forward.
            </p>

            {/* Support Message */}
            <div
              className="
                mt-4
                max-w-xl
                rounded-xl
                border
                border-slate-100
                bg-slate-50/70
                px-4
                py-3
              "
            >
              <div className="flex items-start gap-3">
                <MdLightbulbOutline
                  className="
                    mt-0.5
                    shrink-0
                    text-lg
                    text-amber-500
                  "
                  aria-hidden="true"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Not sure where to start?
                  </p>

                  <p className="mt-0.5 text-xs sm:text-sm leading-5 text-slate-500">
                    Share a few details about your situation and we'll help you
                    understand the next step.
                  </p>
                </div>
              </div>
            </div>

            {/* Support Points */}
            <div className="mt-5 space-y-4">
              <SupportPoint
                icon="lock"
                iconBg="bg-emerald-50"
                iconBorder="border-emerald-100"
                iconColor="text-emerald-500"
                title="Confidential & Secure"
                description="Your information is kept private and handled securely."
              />

              <SupportPoint
                icon="support_agent"
                iconBg="bg-amber-50"
                iconBorder="border-amber-100"
                iconColor="text-amber-500"
                title="Get the Right Guidance"
                description="Share your concern and we'll help you find the right legal path."
              />

              <SupportPoint
                icon="verified_user"
                iconBg="bg-blue-50"
                iconBorder="border-blue-100"
                iconColor="text-blue-500"
                title="Trusted Assistance"
                description="Connect with trusted advocates and useful legal resources."
              />
            </div>

            {/* Bottom Note */}
            <div
              className="
                mt-5
                flex
                items-center
                gap-2
                text-xs
                sm:text-sm
                text-slate-400
              "
            >
              <span
                className="
                  h-2
                  w-2
                  shrink-0
                  rounded-full
                  bg-emerald-500
                  shadow-[0_0_7px_2px_rgba(16,185,129,0.25)]
                "
                aria-hidden="true"
              />

              We're here to help you take the next step.
            </div>
          </div>

          {/* =====================================================
              RIGHT SIDE — FORM
          ====================================================== */}
          <div
            className="
              w-full
              min-w-0
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-[0_8px_30px_rgba(15,23,42,0.06)]
              overflow-hidden
            "
          >
            {/* Accent */}
            <div
              className="
                h-1
                bg-gradient-to-r
                from-amber-400
                via-amber-500
                to-orange-400
              "
              aria-hidden="true"
            />

            <div className="p-5 sm:p-6 lg:p-7">
              {isSubmitted ? (
                <SuccessState
                  onNewRequest={handleNewRequest}
                  referenceId={referenceId}
                />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Form Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div
                      className="
                        w-10
                        h-10
                        shrink-0
                        rounded-xl
                        bg-amber-50
                        border
                        border-amber-100
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <MdOutlineSupportAgent className="text-lg text-amber-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-600">
                        Legal Support
                      </p>

                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                        How can we help you?
                      </h3>
                    </div>
                  </div>

                  {/* Trust Items */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                    <TrustItem icon="lock" text="Confidential" />
                    <TrustItem icon="verified_user" text="Secure" />
                    <TrustItem
                      icon="support_agent"
                      text="Expert Assistance"
                    />
                  </div>

                  {/* Name + Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      label="Full Name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      icon="person"
                      required
                    />

                    <FormField
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      icon="phone"
                      required
                    />
                  </div>

                  {/* Email */}
                  <FormField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    icon="mail"
                    required
                  />

                  {/* Concern */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="concern"
                      className="flex items-center justify-between gap-3 px-0.5"
                    >
                      <span className="text-sm font-bold text-slate-700">
                        Describe your legal concern
                      </span>

                      <span className="hidden sm:block text-[11px] font-medium text-slate-400">
                        Be as specific as possible
                      </span>
                    </label>

                    <div className="relative">
                      <FiFileText
                        className="
                          absolute
                          left-3.5
                          top-3.5
                          text-[18px]
                          text-slate-400
                          pointer-events-none
                        "
                        aria-hidden="true"
                      />

                      <textarea
                        id="concern"
                        name="concern"
                        required
                        value={formData.concern}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Briefly explain your legal issue, situation or question..."
                        className="
                          w-full
                          min-h-[100px]
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50/70
                          px-10
                          py-3
                          text-sm
                          font-medium
                          text-slate-700
                          placeholder:text-slate-400
                          outline-none
                          resize-none
                          transition-all
                          duration-200
                          focus:border-amber-400
                          focus:bg-white
                          focus:ring-4
                          focus:ring-amber-50
                        "
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`
                      group
                      w-full
                      h-12
                      px-5
                      flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      text-sm
                      font-bold
                      text-white
                      bg-slate-900
                      shadow-md
                      transition-all
                      duration-300
                      ${
                        isSubmitting
                          ? "opacity-80 cursor-wait"
                          : "hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg"
                      }
                    `}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <span>Get Legal Help</span>

                        <FiArrowRight className="text-lg transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}
                  </button>

                  {/* Privacy */}
                  <div className="flex items-center justify-center gap-1.5 pt-0.5">
                    <FiLock
                      className="shrink-0 text-[14px] text-emerald-500"
                      aria-hidden="true"
                    />

                    <p className="text-[11px] sm:text-xs text-slate-400 text-center">
                      Your information is kept confidential and used only to
                      assist with your legal enquiry.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ============================================================
   ICON
============================================================ */

const AppIcon = ({ name, className = "" }) => {
  switch (name) {
    case "lock":
      return <FiLock className={className} aria-hidden="true" />;

    case "support_agent":
      return (
        <MdOutlineSupportAgent
          className={className}
          aria-hidden="true"
        />
      );

    case "verified_user":
      return (
        <MdOutlineVerifiedUser
          className={className}
          aria-hidden="true"
        />
      );

    case "person":
      return <FiUser className={className} aria-hidden="true" />;

    case "phone":
      return <FiPhone className={className} aria-hidden="true" />;

    case "mail":
      return <FiMail className={className} aria-hidden="true" />;

    default:
      return null;
  }
};

/* ============================================================
   SUPPORT POINT
============================================================ */

const SupportPoint = ({
  icon,
  iconBg,
  iconBorder,
  iconColor,
  title,
  description,
}) => {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          border
          ${iconBg}
          ${iconBorder}
        `}
        aria-hidden="true"
      >
        <AppIcon
          name={icon}
          className={`text-base ${iconColor}`}
        />
      </div>

      <div className="pt-0.5 min-w-0">
        <h3 className="text-sm font-bold text-slate-800">
          {title}
        </h3>

        <p className="mt-0.5 text-xs sm:text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
};

/* ============================================================
   FORM FIELD
============================================================ */

const FormField = ({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  icon,
  required = false,
}) => {
  return (
    <div className="space-y-1.5 min-w-0">
      <label
        htmlFor={name}
        className="block px-0.5 text-sm font-bold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <AppIcon
          name={icon}
          className="
            absolute
            left-3.5
            top-1/2
            -translate-y-1/2
            text-[18px]
            text-slate-400
            pointer-events-none
          "
        />

        <input
          type={type}
          id={name}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="
            w-full
            h-11
            rounded-xl
            border
            border-slate-200
            bg-slate-50/70
            px-10
            text-sm
            font-medium
            text-slate-700
            placeholder:text-slate-400
            outline-none
            transition-all
            duration-200
            focus:border-amber-400
            focus:bg-white
            focus:ring-4
            focus:ring-amber-50
          "
        />
      </div>
    </div>
  );
};

/* ============================================================
   TRUST ITEM
============================================================ */

const TrustItem = ({ icon, text }) => {
  return (
    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
      <AppIcon
        name={icon}
        className="shrink-0 text-[15px] text-emerald-500"
      />

      {text}
    </div>
  );
};

/* ============================================================
   SUCCESS STATE
============================================================ */

const SuccessState = ({ onNewRequest, referenceId }) => {
  return (
    <div className="py-8 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
        <FiCheckCircle
          className="text-3xl text-emerald-500"
          aria-hidden="true"
        />
      </div>

      <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-600 mb-3">
        Request Submitted
      </span>

      <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900">
        We've received your request
      </h4>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        Thank you for reaching out. Our team will review your concern and help
        connect you with the appropriate legal professional.
      </p>

      {referenceId && (
        <div className="mt-4 w-full max-w-md rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Reference ID
          </p>

          <p className="mt-1 text-sm font-extrabold text-slate-900">
            {referenceId}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            Keep this reference ID to check the status of your request.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onNewRequest}
        className="
          mt-5
          inline-flex
          items-center
          gap-2
          rounded-xl
          border
          border-slate-200
          bg-white
          px-5
          py-2.5
          text-sm
          font-bold
          text-slate-700
          shadow-sm
          transition-all
          hover:border-amber-300
          hover:bg-amber-50
          hover:text-amber-700
        "
      >
        <FiPlus className="text-base" aria-hidden="true" />
        Submit another request
      </button>
    </div>
  );
};

export default HelpForm;