import { Navigate } from "react-router-dom";

import { useAuth } from "../../auth";
import {
  useAdvocateProfileSync,
  AdvocateDashboardSkeleton,
} from "../index";
import { isAdvocateProfileComplete } from "@/utils/advocateProfile";



function ProfileSyncError({ message, onRetry }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-slate-50">
          <span className="material-symbols-outlined text-3xl text-slate-400">
            wifi_off
          </span>
        </div>

        <h2 className="mb-2 text-xl font-bold text-slate-950">
          Couldn't load your profile
        </h2>

        <p className="mb-6 text-sm text-slate-500">
          {message || "Please check your connection and try again."}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-amber-600"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export default function AdvocateGuard({
  children,
  require: requirement = "complete",
}) {
  const { user } = useAuth();

  const {
    status,
    error,
    refresh,
  } = useAdvocateProfileSync();

  if (status === "loading") {
      return <AdvocateDashboardSkeleton />;
  }

  if (status === "error") {
    return (
      <ProfileSyncError
        message={error?.message}
        onRetry={refresh}
      />
    );
  }

  const complete = isAdvocateProfileComplete(user);

  if (requirement === "complete" && !complete) {
    return <Navigate to="/advocate/complete-profile" replace />;
  }

  if (requirement === "incomplete" && complete) {
    return <Navigate to="/advocate/dashboard" replace />;
  }

  return children;
}