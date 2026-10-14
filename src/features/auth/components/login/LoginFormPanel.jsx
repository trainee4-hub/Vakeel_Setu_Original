import React, { useState } from "react";

import {
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiEdit3,
  FiLock,
  FiMail,
  FiPhone,
} from "react-icons/fi";
import { FaBalanceScale } from "react-icons/fa";

import OtpInput from "../signup/OtpInput";

import GoogleLoginButton from "./GoogleLoginButton";
import AdvocateForgotPasswordModal from "./AdvocateForgotPasswordModal";

const LoginFormPanel = ({
  role,
  identifier,
  loginType,
  advocateLoginMethod,
  password,
  otp,
  otpSent,
  countdown,
  isLoading,
  googleLoading,
  authStatus,

  isAdvocatePhone,
  isAdvocateEmail,

  onRoleChange,
  onAdvocateMethodChange,
  onIdentifierChange,
  onPasswordChange,
  onClearStatus,
  onSendOtp,
  onOtpChange,
  onEditIdentifier,
  onResendOtp,
  onSubmit,
  onGoogleLogin,
  onCreateAccount,
  onBackHome,
  onPasswordResetSuccess,
  formatCountdown,
}) => {
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const handleForgotPasswordClose = () => {
    setForgotPasswordOpen(false);
  };

  const handleForgotPasswordSuccess = (result) => {
    setForgotPasswordOpen(false);

    onPasswordResetSuccess?.(result);
  };

  const IdentifierIcon = isAdvocatePhone
    ? FiPhone
    : isAdvocateEmail
      ? FiMail
      : loginType === "phone"
        ? FiPhone
        : FiMail;

  return (
    <main
  className="notranslate flex min-w-0 flex-1 flex-col bg-white"
  translate="no"
>
      <div className="flex w-full flex-1 items-center justify-center px-5 py-10 sm:px-8 sm:py-12 lg:px-10 xl:px-14">
        <div className="login-fade mx-auto w-full max-w-[400px]">
          {/* MOBILE LOGO */}
          <div className="mb-8 flex justify-center lg:hidden">
            <div className="flex items-center gap-2">
              <FaBalanceScale className="text-[20px] text-amber-500" />

              <span className="text-lg font-bold text-slate-900">
                Vakeel
                <span className="text-amber-500"> Setu</span>
              </span>
            </div>
          </div>

          {/* HEADING */}
          <div className="mb-7">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

              <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-amber-600">
                Welcome back
              </span>
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Sign in to your account
            </h2>

            <p className="mt-1.5 text-[13px] leading-5 text-slate-500">
              {role === "advocate"
                ? "Access your advocate account securely."
                : "Sign in with your phone number or email address."}
            </p>
          </div>

          {/* ROLE */}
          <div className="mb-5 flex rounded-2xl border border-slate-200 bg-slate-100 p-1">
            {[
              ["citizen", "User"],
              ["advocate", "Advocate"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onRoleChange(value)}
                className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all ${
                  role === value
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ADVOCATE METHOD */}
          {role === "advocate" && (
            <div className="mb-6">
              <p className="mb-2 px-1 text-[12px] font-semibold text-slate-600">
                Login using
              </p>

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => onAdvocateMethodChange("phone")}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
                    advocateLoginMethod === "phone"
                      ? "bg-white text-amber-600 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  <FiPhone className="text-[16px]" />
                  Phone OTP
                </button>

                <button
                  type="button"
                  onClick={() => onAdvocateMethodChange("email")}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
                    advocateLoginMethod === "email"
                      ? "bg-white text-amber-600 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  <FiMail className="text-[16px]" />
                  Email & Password
                </button>
              </div>
            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={onSubmit}
            className="space-y-5 [&_input]:outline-none [&_input]:focus:outline-none [&_input]:focus-visible:outline-none [&_input]:focus:ring-0 [&_button]:outline-none [&_button]:focus:outline-none [&_button]:focus-visible:outline-none [&_button]:focus-visible:ring-0"
          >
            <div>
              <label className="mb-2 block px-1 text-[13px] font-semibold text-slate-700">
                {isAdvocatePhone
                  ? "Phone Number"
                  : isAdvocateEmail
                    ? "Email Address"
                    : "Phone Number / Email"}
              </label>

              <div className="group flex min-h-[50px] items-center gap-2.5 rounded-xl border border-transparent bg-slate-50/80 px-3.5 transition focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/20">
                <IdentifierIcon className="shrink-0 text-[19px] text-slate-400 transition-colors group-focus-within:text-amber-500" />

                <input
                  autoComplete={isAdvocateEmail ? "email" : "tel"}
                  className="min-w-0 flex-1 border-0 bg-transparent py-3 text-[13px] font-medium text-slate-800 shadow-none !outline-none placeholder:text-slate-400 focus:border-0 focus:!outline-none focus:!ring-0 focus:!shadow-none focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!shadow-none"
                  placeholder={
                    isAdvocatePhone
                      ? "Enter your mobile number"
                      : isAdvocateEmail
                        ? "Enter your email address"
                        : "Phone number or email"
                  }
                  type={isAdvocateEmail ? "email" : "tel"}
                  value={identifier}
                  onChange={onIdentifierChange}
                  disabled={isLoading}
                />

                {(role === "citizen" || isAdvocatePhone) && !otpSent && (
                  <button
                    type="button"
                    onClick={onSendOtp}
                    disabled={isLoading || !identifier.trim()}
                    className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? "Sending..." : "Get OTP"}
                  </button>
                )}
              </div>
            </div>

            {/* ADVOCATE PASSWORD */}
            {isAdvocateEmail && (
              <div className="login-fade">
                <div className="mb-2 flex items-center justify-between gap-3 px-1">
                  <label className="text-[13px] font-semibold text-slate-700">
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-[11px] font-bold text-amber-600 transition hover:text-amber-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="flex min-h-[50px] items-center gap-2.5 rounded-xl border border-transparent bg-slate-50/80 px-3.5 transition focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/20">
                  <FiLock className="shrink-0 text-[19px] text-slate-400" />

                  <input
                    autoComplete="current-password"
                    type="password"
                    value={password}
                    onChange={(event) => {
                      onPasswordChange(event.target.value);
                      onClearStatus();
                    }}
                    disabled={isLoading}
                    placeholder="Enter your password"
                    className="min-w-0 flex-1 border-0 bg-transparent py-3 text-[13px] font-medium text-slate-800 shadow-none !outline-none placeholder:text-slate-400 focus:border-0 focus:!outline-none focus:!ring-0 focus:!shadow-none focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!shadow-none"
                  />
                </div>
              </div>
            )}

            {/* OTP */}
            {otpSent && !isAdvocateEmail && (
              <div className="login-fade mt-4 w-full">
                <div className="w-full rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <label className="text-sm font-bold text-slate-700">
                      Enter OTP
                    </label>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-600">
                        <FiCheck className="text-[14px]" />
                        Sent
                      </span>

                      <button
                        type="button"
                        onClick={onEditIdentifier}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-500 hover:bg-slate-100 hover:text-amber-600"
                      >
                        <FiEdit3 className="text-[14px]" />
                        Edit
                      </button>
                    </div>
                  </div>

                  <OtpInput
                    value={otp}
                    onChange={onOtpChange}
                    length={6}
                    error={authStatus.type === "error"}
                    disabled={isLoading}
                    autoFocus
                  />

                  <div className="mt-3 flex items-start justify-between gap-3 px-1">
                    <span className="text-[11px] leading-4 text-slate-400">
                      {loginType === "email"
                        ? "OTP sent to your email"
                        : "OTP sent to your mobile number"}
                    </span>

                    <button
                      type="button"
                      onClick={onResendOtp}
                      disabled={countdown > 0 || isLoading}
                      className="shrink-0 text-[11px] font-bold text-amber-600 disabled:text-slate-400"
                    >
                      {countdown > 0
                        ? `Resend in ${formatCountdown(countdown)}`
                        : "Resend OTP"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STATUS */}
            {authStatus.message && (
              <div
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-medium ${
                  authStatus.type === "error"
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-emerald-200 bg-emerald-50 text-emerald-600"
                }`}
              >
                {authStatus.type === "error" ? (
                  <FiCheckCircle className="hidden" />
                ) : (
                  <FiCheckCircle className="shrink-0 text-sm" />
                )}

                {authStatus.type === "error" && (
                  <span
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-bold"
                    aria-hidden="true"
                  >
                    !
                  </span>
                )}

                {authStatus.message}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={
                isLoading ||
                (isAdvocatePhone && (!otpSent || otp.length !== 6)) ||
                (isAdvocateEmail && (!identifier.trim() || !password)) ||
                (role === "citizen" && (!otpSent || otp.length !== 6))
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-[13px] font-bold text-white shadow-sm shadow-amber-500/20 transition hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <>
                  {isAdvocateEmail ? "Login" : "Verify & Login"}

                  <FiArrowRight className="text-[17px]" />
                </>
              )}
            </button>
          </form>

          <GoogleLoginButton
            role={role}
            loading={googleLoading}
            disabled={isLoading}
            onClick={onGoogleLogin}
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="w-full border-t border-slate-100 bg-slate-50/60 px-5 py-6 sm:px-8 lg:px-10 xl:px-14">
        <div className="mx-auto w-full max-w-[400px] text-center">
          <p className="text-sm text-slate-500">
            New to Vakeel Setu?{" "}
            <button
              type="button"
              onClick={onCreateAccount}
              className="font-bold text-amber-600 hover:text-amber-700 hover:underline"
            >
              Create Account
            </button>
          </p>

          <button
            type="button"
            onClick={onBackHome}
            className="mt-3 text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            Back to Home
          </button>
        </div>
      </div>

      <AdvocateForgotPasswordModal
        open={forgotPasswordOpen}
        onClose={handleForgotPasswordClose}
        onSuccess={handleForgotPasswordSuccess}
      />
    </main>
  );
};

export default LoginFormPanel;