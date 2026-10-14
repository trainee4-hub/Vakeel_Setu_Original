import React from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  LogIn,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AccountExistsPage = ({
  type = "user",
}) => {
  const navigate = useNavigate();

  const isAdvocate =
    type === "advocate";

  const title = isAdvocate
    ? "Advocate Account Already Exists"
    : "Account Already Exists";

  const description = isAdvocate
    ? "An advocate account is already registered with these details. Please sign in to continue to your Advocate dashboard."
    : "An account is already registered with these details. Please sign in to continue to your account.";

  const loginPath = isAdvocate
    ? "/login"
    : "/login";

  const signupPath = isAdvocate
    ? "/advocate-signup"
    : "/signup";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8fafc] px-4 py-10">
      {/* BACKGROUND */}

      <div className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-amber-100/40 blur-3xl" />

      <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-slate-200/50 blur-3xl" />

      <div className="relative w-full max-w-[520px]">
        <div className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.10)]">
          {/* TOP */}

          <div className="relative overflow-hidden bg-slate-950 px-6 py-7 text-white sm:px-8">
            <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-amber-500/15 blur-3xl" />

            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950">
                {isAdvocate ? (
                  <BriefcaseBusiness
                    size={22}
                  />
                ) : (
                  <UserRound
                    size={22}
                  />
                )}
              </div>

              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-400">
                Advocate Connect
              </p>

              <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-[28px]">
                {title}
              </h1>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
                {description}
              </p>
            </div>
          </div>

          {/* BODY */}

          <div className="p-6 sm:p-8">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                  <CheckCircle2
                    size={18}
                  />
                </div>

                <div>
                  <p className="text-sm font-extrabold text-emerald-900">
                    Your account is safe
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-700">
                    You do not need to create another account. Sign in using your registered email or phone number.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    loginPath,
                    {
                      replace: true,
                    },
                  )
                }
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-extrabold text-white outline-none transition hover:bg-slate-800 focus:outline-none focus-visible:outline-none"
              >
                <LogIn size={17} />

                {isAdvocate
                  ? "Login as Advocate"
                  : "Login to Your Account"}

                <ArrowRight
                  size={16}
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/")
                }
                className="inline-flex min-h-[46px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 outline-none transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus-visible:outline-none"
              >
                Back to Home
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-xs text-slate-400">
              <ShieldCheck
                size={14}
                className="text-amber-500"
              />

              Secure account access
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AccountExistsPage;