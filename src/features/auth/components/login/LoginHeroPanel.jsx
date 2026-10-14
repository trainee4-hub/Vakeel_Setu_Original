import React from "react";

import {
  FaBalanceScale,
  FaGavel,
  FaLock,
  FaShieldAlt,
} from "react-icons/fa";

import { RiLockPasswordLine } from "react-icons/ri";

const LoginHeroPanel = () => {
  const features = [
    {
      icon: RiLockPasswordLine,
      text: "Secure authentication",
    },
    {
      icon: FaShieldAlt,
      text: "OTP-verified access",
    },
    {
      icon: FaGavel,
      text: "Trusted legal platform",
    },
  ];

  return (
    <aside className="relative hidden shrink-0 flex-col overflow-hidden bg-slate-950 text-white lg:flex lg:w-[400px] xl:w-[460px]">
      {/* Background Effects */}

      <div className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full bg-amber-500/[0.10] blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-500/[0.05] blur-3xl" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,.8) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Background Gavel */}

      <FaGavel
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -right-10 select-none text-[280px] leading-none text-white/[0.025]"
      />

      {/* HEADER */}

      <div className="relative z-10 flex items-center justify-between border-b border-white/[0.06] px-8 py-7 xl:px-10">
        <div className="inline-flex items-center gap-2.5">
          <div className="login-logo-mark flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-amber-400">
            <FaBalanceScale className="text-[20px]" />
          </div>

          <span className="text-base font-bold tracking-tight">
            Vakeel
            <span className="text-amber-400"> Setu</span>
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          <FaLock className="text-[11px] text-amber-400" />

          Secure Login
        </span>
      </div>

      {/* BODY */}

      <div className="relative z-10 flex flex-1 flex-col justify-center px-8 py-10 xl:px-10">
        <div className="max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/[0.07] px-3 py-1.5">
            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />

            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">
              Legal consultations, simplified
            </span>
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight xl:text-[46px]">
            Welcome
            <br />

            <span className="text-amber-400">
              back.
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-[14px] leading-7 text-slate-400 xl:text-[15px]">
            Sign in to continue your consultations,
            bookings, saved advocates and legal
            activity securely.
          </p>

          {/* Features */}

          <div className="mt-9 max-w-lg rounded-2xl border border-white/[0.07] bg-white/[0.02] p-1.5">
            {features.map(
              ({ icon: Icon, text }, index) => (
                <div
                  key={text}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-3 ${
                    index !== features.length - 1
                      ? "border-b border-white/[0.05]"
                      : ""
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
                    <Icon className="text-[17px]" />
                  </div>

                  <span className="text-[13px] font-medium text-slate-300">
                    {text}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}

      <div className="relative z-10 flex items-center justify-between border-t border-white/[0.06] px-8 py-6 xl:px-10">
        <p className="text-[10px] text-slate-600">
          © {new Date().getFullYear()} Vakeel Setu.
          All rights reserved.
        </p>

        <FaBalanceScale className="text-[15px] text-slate-700" />
      </div>
    </aside>
  );
};

export default LoginHeroPanel;