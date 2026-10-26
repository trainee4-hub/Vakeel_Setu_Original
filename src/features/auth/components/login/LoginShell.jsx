import React from "react";

const LoginShell = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <style>{`
        @keyframes loginFade {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-fade {
          animation: loginFade .28s ease-out;
        }

        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-6px);
          }
        }

        .login-logo-mark {
          animation: gentleFloat 5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .login-fade,
          .login-logo-mark {
            animation: none;
          }
        }
      `}</style>

      {/*
        Navbar fixed hai.

        Desktop:
        ~84px Navbar
        + 32px desired gap
        = 116px

        Mobile navbar slightly smaller ho sakta hai,
        isliye responsive values use ki hain.
      */}

      <div className="pb-10 pt-[104px] sm:pt-[108px] lg:pt-[112px]">
        <div className="mx-auto w-full max-w-[1360px] px-4 sm:px-6">
          {/* LOGIN CARD */}

          <div className="relative flex w-full flex-col overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_32px_80px_-24px_rgba(15,23,42,0.18)] lg:min-h-[720px] lg:flex-row lg:items-stretch">
            {/* TOP GOLD ACCENT */}

            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400" />

            {children}
          </div>

          {/* BOTTOM LABEL */}

          <p className="mt-5 text-center text-[10px] uppercase tracking-[0.2em] text-slate-400">
            <span className="notranslate" translate="no">Vakeel Setu</span> • Secure Encrypted Access
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginShell;