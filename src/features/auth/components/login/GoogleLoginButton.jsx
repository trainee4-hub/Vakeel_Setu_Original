import React from "react";
import { FcGoogle } from "react-icons/fc";

const GoogleLoginButton = ({
  loading,
  disabled,
  onClick,
  role,
}) => {
  return (
    <>
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />

        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          or continue with
        </span>

        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-[13px] font-bold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            Connecting to Google...
          </>
        ) : (
          <>
            <FcGoogle className="h-[18px] w-[18px] shrink-0" />
            Continue with Google
          </>
        )}
      </button>

      <p className="mt-2 text-center text-[10px] leading-4 text-slate-400">
        Sign in using the Google account linked to your{" "}
        {role === "advocate" ? "advocate" : "user"} account.
      </p>
    </>
  );
};

export default GoogleLoginButton;