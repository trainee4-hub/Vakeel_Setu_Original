import React, { useState } from "react";

import {
  FiArrowRight,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiPhone,
  FiRefreshCw,
  FiShield,
  FiX,
} from "react-icons/fi";

import OtpInput from "../signup/OtpInput";

import {
  advocateForgotPassword,
  advocateResendResetOtp,
  advocateResetPassword,
  advocateVerifyResetOtp,
} from "../../services/advocatePasswordApi";

const initialStatus = {
  type: "",
  message: "",
};

const AdvocateForgotPasswordModal = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState("request");
  const [method, setMethod] = useState("email");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(initialStatus);

  if (!open) {
    return null;
  }

  const cleanIdentifier = identifier.trim();
  const isEmail = method === "email";

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const normalizePhone = (value) =>
    value
      .replace(/\D/g, "")
      .replace(/^91(?=\d{10}$)/, "")
      .slice(0, 10);

  const buildIdentityPayload = () => {
    if (isEmail) {
      return {
        email: cleanIdentifier.toLowerCase(),
      };
    }

    return {
      phone: normalizePhone(cleanIdentifier),
    };
  };

  const validateIdentity = () => {
    if (!cleanIdentifier) {
      setStatus({
        type: "error",
        message: isEmail
          ? "Please enter your registered email address."
          : "Please enter your registered mobile number.",
      });

      return false;
    }

    if (isEmail && !isValidEmail(cleanIdentifier)) {
      setStatus({
        type: "error",
        message: "Please enter a valid email address.",
      });

      return false;
    }

    if (
      !isEmail &&
      !/^[6-9]\d{9}$/.test(normalizePhone(cleanIdentifier))
    ) {
      setStatus({
        type: "error",
        message:
          "Please enter a valid 10-digit Indian mobile number.",
      });

      return false;
    }

    return true;
  };

  const resetFlow = () => {
    setStep("request");
    setMethod("email");
    setIdentifier("");
    setOtp("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setLoading(false);
    setStatus(initialStatus);
  };

  const handleClose = () => {
    resetFlow();
    onClose?.();
  };

  /* ============================================================
     STEP 1 — REQUEST OTP
  ============================================================ */

  const handleRequestOtp = async (event) => {
    event.preventDefault();

    if (!validateIdentity()) {
      return;
    }

    setLoading(true);
    setStatus(initialStatus);

    try {
      const data = await advocateForgotPassword(
        buildIdentityPayload(),
      );

      setStatus({
        type: "success",
        message:
          data?.message ||
          "If an advocate account exists with the provided details, an OTP has been sent.",
      });

      setOtp("");
      setStep("verify");
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error?.message ||
          "Unable to request password reset OTP.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     RESEND OTP
  ============================================================ */

  const handleResendOtp = async () => {
    if (loading || !validateIdentity()) {
      return;
    }

    setLoading(true);
    setOtp("");
    setStatus(initialStatus);

    try {
      const data = await advocateResendResetOtp(
        buildIdentityPayload(),
      );

      setStatus({
        type: "success",
        message: data?.message || "A new OTP has been sent.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error?.message || "Unable to resend OTP.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     STEP 2 — VERIFY OTP
  ============================================================ */

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      setStatus({
        type: "error",
        message: "Please enter the 6-digit OTP.",
      });

      return;
    }

    setLoading(true);
    setStatus(initialStatus);

    try {
      const data = await advocateVerifyResetOtp({
        ...buildIdentityPayload(),
        otp,
      });

      if (!data?.resetToken) {
        throw new Error(
          "Password reset token was not returned. Please request a new OTP.",
        );
      }

      setResetToken(data.resetToken);

      setStatus({
        type: "success",
        message:
          data?.message || "OTP verified successfully.",
      });

      setStep("reset");
    } catch (error) {
      setStatus({
        type: "error",
        message: error?.message || "Unable to verify OTP.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     STEP 3 — RESET PASSWORD
  ============================================================ */

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!resetToken) {
      setStatus({
        type: "error",
        message:
          "Password reset session has expired. Please request a new OTP.",
      });

      return;
    }

    if (!newPassword) {
      setStatus({
        type: "error",
        message: "Please enter your new password.",
      });

      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({
        type: "error",
        message:
          "New password and confirm password do not match.",
      });

      return;
    }

    setLoading(true);
    setStatus(initialStatus);

    try {
      const data = await advocateResetPassword({
        resetToken,
        newPassword,
        confirmPassword,
      });

      setStatus({
        type: "success",
        message:
          data?.message ||
          "Password reset successfully. You can now login with your new password.",
      });

      setStep("success");
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error?.message || "Unable to reset password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToLogin = () => {
    const value = isEmail
      ? cleanIdentifier.toLowerCase()
      : normalizePhone(cleanIdentifier);

    onSuccess?.({
      method,
      value,
    });

    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
      onMouseDown={handleClose}
    >
      <div
        className="relative w-full max-w-[480px] overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-2xl"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* TOP */}

        <div className="relative overflow-hidden bg-slate-950 px-6 py-6 text-white">
          <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />

          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleClose();
            }}
            aria-label="Close forgot password"
            className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <FiX
              className="pointer-events-none text-[18px]"
              aria-hidden="true"
            />
          </button>

          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-slate-950">
              <FiRefreshCw
                className="text-[21px]"
                aria-hidden="true"
              />
            </div>

            <h2 className="mt-4 text-xl font-black">
              {step === "request" && "Forgot Password"}
              {step === "verify" && "Verify OTP"}
              {step === "reset" && "Create New Password"}
              {step === "success" && "Password Updated"}
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              {step === "request" &&
                "Recover your advocate account using your registered email or mobile number."}

              {step === "verify" &&
                "Enter the secure 6-digit OTP sent to your registered account."}

              {step === "reset" &&
                "Choose a new password for your advocate account."}

              {step === "success" &&
                "Your password has been changed successfully."}
            </p>
          </div>
        </div>

        {/* BODY */}

        <div className="p-6">
          {/* ========================================================
              REQUEST
          ======================================================== */}

          {step === "request" && (
            <form
              onSubmit={handleRequestOtp}
              className="space-y-5"
            >
              <div>
                <p className="mb-2 text-xs font-bold text-slate-600">
                  Recover using
                </p>

                <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMethod("email");
                      setIdentifier("");
                      setStatus(initialStatus);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
                      method === "email"
                        ? "bg-white text-amber-600 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    <FiMail
                      className="text-[16px]"
                      aria-hidden="true"
                    />
                    Email
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMethod("phone");
                      setIdentifier("");
                      setStatus(initialStatus);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
                      method === "phone"
                        ? "bg-white text-amber-600 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    <FiPhone
                      className="text-[16px]"
                      aria-hidden="true"
                    />
                    Mobile
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700">
                  {isEmail
                    ? "Registered Email Address"
                    : "Registered Mobile Number"}
                </label>

                <div className="flex min-h-[50px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/10">
                  {isEmail ? (
                    <FiMail
                      className="shrink-0 text-[18px] text-slate-400"
                      aria-hidden="true"
                    />
                  ) : (
                    <FiPhone
                      className="shrink-0 text-[18px] text-slate-400"
                      aria-hidden="true"
                    />
                  )}

                  <input
                    type={isEmail ? "email" : "tel"}
                    inputMode={isEmail ? "email" : "numeric"}
                    value={identifier}
                    onChange={(event) => {
                      const value = isEmail
                        ? event.target.value
                        : event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);

                      setIdentifier(value);
                      setStatus(initialStatus);
                    }}
                    placeholder={
                      isEmail
                        ? "advocate@example.com"
                        : "9876543210"
                    }
                    className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex gap-2">
                  <FiShield
                    className="mt-0.5 shrink-0 text-[17px] text-amber-600"
                    aria-hidden="true"
                  />

                  <p className="text-[11px] leading-5 text-slate-500">
                    For security, the same success response may be
                    shown even if no matching advocate account
                    exists. OTPs expire after 10 minutes.
                  </p>
                </div>
              </div>

              <StatusBox status={status} />

              <button
                type="submit"
                disabled={loading || !identifier.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Spinner />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send Reset OTP
                    <FiArrowRight
                      className="text-[17px]"
                      aria-hidden="true"
                    />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================
              VERIFY
          ======================================================== */}

          {step === "verify" && (
            <form
              onSubmit={handleVerifyOtp}
              className="space-y-5"
            >
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  OTP sent to
                </p>

                <p className="mt-1 break-all text-sm font-bold text-slate-900">
                  {isEmail
                    ? cleanIdentifier.toLowerCase()
                    : normalizePhone(cleanIdentifier)}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setStep("request");
                    setOtp("");
                    setStatus(initialStatus);
                  }}
                  className="mt-2 text-[11px] font-bold text-amber-600 hover:text-amber-700"
                >
                  Change {isEmail ? "email" : "mobile number"}
                </button>
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-slate-700">
                  Enter 6-digit OTP
                </label>

                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  length={6}
                  error={status.type === "error"}
                  disabled={loading}
                  autoFocus
                />

                <div className="mt-3 flex items-center justify-between gap-4">
                  <p className="text-[10px] leading-4 text-slate-400">
                    OTP expires in 10 minutes. Maximum 5
                    verification attempts.
                  </p>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleResendOtp}
                    className="shrink-0 text-[11px] font-bold text-amber-600 hover:text-amber-700 disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>

              <StatusBox status={status} />

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-amber-500 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Spinner />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP
                    <FiCheckCircle
                      className="text-[17px]"
                      aria-hidden="true"
                    />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================
              RESET PASSWORD
          ======================================================== */}

          {step === "reset" && (
            <form
              onSubmit={handleResetPassword}
              className="space-y-5"
            >
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                <div className="flex gap-2 text-emerald-700">
                  <FiCheckCircle
                    className="mt-0.5 shrink-0 text-[18px]"
                    aria-hidden="true"
                  />

                  <div>
                    <p className="text-xs font-bold">
                      Identity verified
                    </p>

                    <p className="mt-0.5 text-[10px] text-emerald-600">
                      Your reset token is valid for 15 minutes and
                      can only be used once.
                    </p>
                  </div>
                </div>
              </div>

              <PasswordField
                label="New Password"
                value={newPassword}
                onChange={(value) => {
                  setNewPassword(value);
                  setStatus(initialStatus);
                }}
                show={showPassword}
                onToggle={() =>
                  setShowPassword((previous) => !previous)
                }
              />

              <PasswordField
                label="Confirm Password"
                value={confirmPassword}
                onChange={(value) => {
                  setConfirmPassword(value);
                  setStatus(initialStatus);
                }}
                show={showPassword}
                onToggle={() =>
                  setShowPassword((previous) => !previous)
                }
              />

              <StatusBox status={status} />

              <button
                type="submit"
                disabled={
                  loading || !newPassword || !confirmPassword
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Spinner />
                    Updating...
                  </>
                ) : (
                  <>
                    Reset Password
                    <FiRefreshCw
                      className="text-[17px]"
                      aria-hidden="true"
                    />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================
              SUCCESS
          ======================================================== */}

          {step === "success" && (
            <div className="py-3 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <FiCheckCircle
                  className="text-3xl"
                  aria-hidden="true"
                />
              </div>

              <h3 className="mt-5 text-xl font-black text-slate-900">
                Password reset successful
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                You can now sign in to your Advocate account using
                your new password.
              </p>

              <StatusBox status={status} />

              <button
                type="button"
                onClick={handleContinueToLogin}
                className="mt-6 w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-amber-500 hover:text-slate-950"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PasswordField = ({
  label,
  value,
  onChange,
  show,
  onToggle,
}) => (
  <div>
    <label className="mb-2 block text-xs font-bold text-slate-700">
      {label}
    </label>

    <div className="flex min-h-[50px] items-center rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-amber-500 focus-within:bg-white">
      <FiLock
        className="mr-3 shrink-0 text-[18px] text-slate-400"
        aria-hidden="true"
      />

      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="new-password"
        className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm font-medium text-slate-900 outline-none"
      />

      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? "Hide password" : "Show password"}
        className="ml-2 flex items-center justify-center text-slate-400 transition hover:text-slate-700"
      >
        {show ? (
          <FiEyeOff
            className="text-[18px]"
            aria-hidden="true"
          />
        ) : (
          <FiEye
            className="text-[18px]"
            aria-hidden="true"
          />
        )}
      </button>
    </div>
  </div>
);

const StatusBox = ({ status }) => {
  if (!status?.message) {
    return null;
  }

  return (
    <div
      className={`mt-4 flex items-start gap-2 rounded-xl border px-3.5 py-3 text-xs font-medium ${
        status.type === "error"
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {status.type === "error" ? (
        <span
          className="mt-[1px] flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full border border-current text-[11px] font-bold leading-none"
          aria-hidden="true"
        >
          !
        </span>
      ) : (
        <FiCheckCircle
          className="mt-[1px] shrink-0 text-[17px]"
          aria-hidden="true"
        />
      )}

      <span className="leading-5">{status.message}</span>
    </div>
  );
};

const Spinner = () => (
  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
);

export default AdvocateForgotPasswordModal;