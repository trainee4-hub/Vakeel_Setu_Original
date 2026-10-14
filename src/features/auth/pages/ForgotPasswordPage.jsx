import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@app/layouts/Navbar";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    identifier: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================
  // STEP 1 - SEND OTP
  // =========================
  const handleSendOtp = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.identifier.trim()) {
      setError("Please enter your email or phone number.");
      return;
    }

    try {
      setLoading(true);

      /*
       * TODO:
       * Connect your actual forgot-password API here.
       *
       * Example structure:
       *
       * const response = await fetch(
       *   `${API_BASE_URL}/auth/forgot-password`,
       *   {
       *     method: "POST",
       *     headers: {
       *       "Content-Type": "application/json",
       *     },
       *     body: JSON.stringify({
       *       identifier: formData.identifier,
       *     }),
       *   }
       * );
       *
       * const data = await response.json();
       *
       * if (!response.ok) {
       *   throw new Error(data.message);
       * }
       */

      await new Promise((resolve) => setTimeout(resolve, 800));

      setSuccess("OTP sent successfully.");
      setStep(2);
    } catch (err) {
      console.error("Forgot password error:", err);

      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // STEP 2 - VERIFY OTP
  // =========================
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    if (formData.otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      /*
       * TODO:
       * Connect your actual OTP verification API here.
       */

      await new Promise((resolve) => setTimeout(resolve, 800));

      setSuccess("OTP verified successfully.");
      setStep(3);
    } catch (err) {
      console.error("OTP verification error:", err);

      setError(
        err.message || "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // STEP 3 - RESET PASSWORD
  // =========================
  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.newPassword) {
      setError("Please enter your new password.");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (!formData.confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      /*
       * TODO:
       * Connect your actual reset-password API here.
       */

      await new Promise((resolve) => setTimeout(resolve, 800));

      setSuccess("Password reset successfully.");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1200);
    } catch (err) {
      console.error("Password reset error:", err);

      setError(
        err.message || "Unable to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GO BACK
  // =========================
  const handleBack = () => {
    setError("");
    setSuccess("");

    if (step === 1) {
      navigate("/login");
      return;
    }

    setStep((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =========================
          NAVBAR
      ========================= */}
      <Navbar />

      {/* =========================
          PAGE CONTENT
      ========================= */}
      <main className="min-h-screen flex items-center justify-center px-4 pt-2 pb-6">

        <div className="w-full max-w-md">

          {/* =========================
              HEADER
          ========================= */}
          <div className="text-center mb-5">

            {/* Icon */}
            <div className="flex justify-center mb-3">

              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">

                <span className="material-symbols-outlined text-amber-600 text-2xl">
                  lock_reset
                </span>

              </div>

            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-slate-900">

              {step === 1 && "Forgot Password?"}

              {step === 2 && "Verify OTP"}

              {step === 3 && "Create New Password"}

            </h1>

            {/* Description */}
            <p className="mt-2 text-sm text-slate-500 leading-6">

              {step === 1 &&
                "Enter your registered email or phone number to reset your password."}

              {step === 2 &&
                "Enter the verification code sent to your registered contact."}

              {step === 3 &&
                "Create a new secure password for your VakeelSetu account."}

            </p>

          </div>

          {/* =========================
              CARD
          ========================= */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8">

            {/* =========================
                STEP INDICATOR
            ========================= */}
            <div className="flex items-start justify-center mb-7">

              {/* STEP 1 */}
              <div className="flex flex-col items-center">

                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition ${
                    step >= 1
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {step > 1 ? (
                    <span className="material-symbols-outlined text-lg">
                      check
                    </span>
                  ) : (
                    "1"
                  )}
                </div>

                <span
                  className={`mt-1.5 text-[11px] font-semibold ${
                    step >= 1
                      ? "text-amber-600"
                      : "text-slate-400"
                  }`}
                >
                  Account
                </span>

              </div>

              {/* CONNECTOR */}
              <div
                className={`w-14 sm:w-20 h-px mx-2 mt-[18px] ${
                  step > 1
                    ? "bg-amber-500"
                    : "bg-slate-200"
                }`}
              />

              {/* STEP 2 */}
              <div className="flex flex-col items-center">

                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition ${
                    step >= 2
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {step > 2 ? (
                    <span className="material-symbols-outlined text-lg">
                      check
                    </span>
                  ) : (
                    "2"
                  )}
                </div>

                <span
                  className={`mt-1.5 text-[11px] font-semibold ${
                    step >= 2
                      ? "text-amber-600"
                      : "text-slate-400"
                  }`}
                >
                  Verify
                </span>

              </div>

              {/* CONNECTOR */}
              <div
                className={`w-14 sm:w-20 h-px mx-2 mt-[18px] ${
                  step > 2
                    ? "bg-amber-500"
                    : "bg-slate-200"
                }`}
              />

              {/* STEP 3 */}
              <div className="flex flex-col items-center">

                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition ${
                    step >= 3
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  3
                </div>

                <span
                  className={`mt-1.5 text-[11px] font-semibold ${
                    step >= 3
                      ? "text-amber-600"
                      : "text-slate-400"
                  }`}
                >
                  Password
                </span>

              </div>

            </div>

            {/* =========================
                ERROR
            ========================= */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* =========================
                SUCCESS
            ========================= */}
            {success && (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                {success}
              </div>
            )}

            {/* =========================
                STEP 1
            ========================= */}
            {step === 1 && (
              <form onSubmit={handleSendOtp}>

                <div className="mb-5">

                  <label
                    htmlFor="identifier"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Email or Phone Number
                  </label>

                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    value={formData.identifier}
                    onChange={handleChange}
                    placeholder="Enter your email or phone number"
                    autoComplete="username"
                    className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    We'll send a verification code to your
                    registered contact.
                  </p>

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Continue

                      <span className="material-symbols-outlined text-lg">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>

              </form>
            )}

            {/* =========================
                STEP 2
            ========================= */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp}>

                <div className="mb-5">

                  <label
                    htmlFor="otp"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Verification Code
                  </label>

                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={formData.otp}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);

                      setFormData((prev) => ({
                        ...prev,
                        otp: value,
                      }));

                      setError("");
                      setSuccess("");
                    }}
                    placeholder="Enter 6-digit OTP"
                    className="w-full h-14 rounded-xl border border-slate-200 px-4 text-center text-xl font-bold tracking-[0.4em] text-slate-900 placeholder:text-slate-300 placeholder:tracking-normal outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition"
                  />

                  <p className="mt-2 text-xs text-slate-400 text-center">
                    Enter the 6-digit code sent to your registered
                    email or phone.
                  </p>

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify OTP

                      <span className="material-symbols-outlined text-lg">
                        verified
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError("");
                    setSuccess("");
                  }}
                  className="w-full mt-4 text-sm font-semibold text-slate-500 hover:text-amber-600 transition"
                >
                  Change email or phone number
                </button>

              </form>
            )}

            {/* =========================
                STEP 3
            ========================= */}
            {step === 3 && (
              <form onSubmit={handleResetPassword}>

                {/* NEW PASSWORD */}
                <div className="mb-4">

                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    New Password
                  </label>

                  <div className="relative">

                    <input
                      id="newPassword"
                      name="newPassword"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      className="w-full h-12 rounded-xl border border-slate-200 px-4 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword
                          ? "visibility_off"
                          : "visibility"}
                      </span>
                    </button>

                  </div>

                </div>

                {/* CONFIRM PASSWORD */}
                <div className="mb-4">

                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your new password"
                      autoComplete="new-password"
                      className="w-full h-12 rounded-xl border border-slate-200 px-4 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) => !prev
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showConfirmPassword
                          ? "visibility_off"
                          : "visibility"}
                      </span>
                    </button>

                  </div>

                </div>

                {/* PASSWORD REQUIREMENTS */}
                <div className="mb-5 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">

                  <p className="text-xs font-semibold text-slate-600 mb-2">
                    Password requirements
                  </p>

                  <div className="grid grid-cols-2 gap-y-2">

                    <span className="text-xs text-slate-500">
                      • At least 8 characters
                    </span>

                    <span className="text-xs text-slate-500">
                      • Letters & numbers
                    </span>

                    <span className="text-xs text-slate-500">
                      • Avoid common passwords
                    </span>

                    <span className="text-xs text-slate-500">
                      • Keep it secure
                    </span>

                  </div>

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      Reset Password

                      <span className="material-symbols-outlined text-lg">
                        lock_reset
                      </span>
                    </>
                  )}
                </button>

              </form>
            )}

            {/* =========================
                FOOTER
            ========================= */}
            <div className="text-center mt-7 pt-6 border-t border-slate-100">

              <p className="text-sm text-slate-500">
                Remember your password?
              </p>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-1 text-sm font-bold text-amber-600 hover:text-amber-700 transition"
              >
                Back to Login
              </button>

            </div>

          </div>

          {/* =========================
              SECURITY NOTE
          ========================= */}
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400">

            <span className="material-symbols-outlined text-sm">
              verified_user
            </span>

            Your account recovery is secure

          </div>

        </div>

      </main>

    </div>
  );
};

export default ForgotPasswordPage;