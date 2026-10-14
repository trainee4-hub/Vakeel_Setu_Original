import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Settings,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserRoundCog,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { useAuth, OtpInput } from "../../auth";
import {
  requestAdvocateDeletionOtp,
  verifyAdvocateDeletionOtp,
} from "../index";

/* =========================================================================
   HELPERS
============================================================================ */

const cleanText = (value) => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "—";
  }

  return String(value).trim();
};

const maskPhone = (phone) => {
  const digits = String(
    phone || "",
  ).replace(/\D/g, "");

  if (digits.length < 4) {
    return "your registered mobile number";
  }

  return `******${digits.slice(-4)}`;
};

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "long",
      timeStyle: "short",
    },
  ).format(date);
};

/* =========================================================================
   COMMON UI
============================================================================ */

function Card({
  title,
  description,
  children,
  danger = false,
}) {
  return (
    <section
      className={[
        "rounded-3xl border bg-white p-5 shadow-sm sm:p-6",
        danger
          ? "border-red-200"
          : "border-slate-200",
      ].join(" ")}
    >
      <div
        className={[
          "border-b pb-4",
          danger
            ? "border-red-100"
            : "border-slate-100",
        ].join(" ")}
      >
        <h2
          className={[
            "text-lg font-bold",
            danger
              ? "text-red-700"
              : "text-slate-950",
          ].join(" ")}
        >
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>

      <div className="pt-4">
        {children}
      </div>
    </section>
  );
}

function InfoRow({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <span className="max-w-[60%] break-words text-right text-sm font-semibold text-slate-800">
        {value || "—"}
      </span>
    </div>
  );
}

function SettingTab({
  active,
  Icon,
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold",
        "outline-none transition-all",
        "focus:outline-none focus:ring-2 focus:ring-amber-500/20",
        active
          ? "bg-slate-950 text-white"
          : "bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800",
      ].join(" ")}
    >
      <Icon
        size={16}
        className={
          active
            ? "text-amber-400"
            : "text-slate-400"
        }
      />

      {label}
    </button>
  );
}

/* =========================================================================
   DELETE ACCOUNT MODAL
============================================================================ */

function DeleteAccountModal({
  open,
  advocate,
  onClose,
}) {
  const navigate = useNavigate();

  const [
    modalStep,
    setModalStep,
  ] = useState("impact");

  const [
    hideConfirmation,
    setHideConfirmation,
  ] = useState(false);

  const [
    permanentConfirmation,
    setPermanentConfirmation,
  ] = useState(false);

  const [
    deleteText,
    setDeleteText,
  ] = useState("");

  const [
    otp,
    setOtp,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    scheduledDeletionAt,
    setScheduledDeletionAt,
  ] = useState("");

  /* =======================================================================
     RESET
  ======================================================================= */

  useEffect(() => {
    if (!open) return;

    setModalStep("impact");
    setHideConfirmation(false);
    setPermanentConfirmation(false);
    setDeleteText("");
    setOtp("");
    setLoading(false);
    setError("");
    setMessage("");
    setScheduledDeletionAt("");
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const canContinue =
    hideConfirmation &&
    permanentConfirmation;

  const canSendOtp =
    deleteText.trim() === "DELETE";

  /* =======================================================================
     REQUEST OTP

     POST /api/advocate/delete-account/request-otp
  ======================================================================= */

  const handleRequestOtp =
    async () => {
      if (
        loading ||
        !canSendOtp
      ) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await requestAdvocateDeletionOtp();

        setMessage(
          response?.message ||
            "OTP has been sent to your registered phone number.",
        );

        setOtp("");
        setModalStep("otp");
      } catch (requestError) {
        setError(
          requestError?.message ||
            "We couldn't send the verification OTP. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

  /* =======================================================================
     VERIFY OTP

     POST /api/advocate/delete-account/verify-otp
  ======================================================================= */

  const handleVerifyOtp =
    async () => {
      if (loading) return;

      const cleanOtp =
        String(otp || "").trim();

      if (
        !/^\d{6}$/.test(
          cleanOtp,
        )
      ) {
        setError(
          "Please enter the 6-digit verification OTP.",
        );
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await verifyAdvocateDeletionOtp({
            otp: cleanOtp,
          });

        setMessage(
          response?.message ||
            "Your account deletion request has been submitted for admin review.",
        );

        setScheduledDeletionAt(
          response?.scheduledDeletionAt ||
            "",
        );

        setModalStep("success");
      } catch (verifyError) {
        setError(
          verifyError?.message ||
            "The OTP could not be verified. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

  const handleReturnToLogin =
    () => {
      /*
       * Backend clears auth_token after successful
       * deletion OTP verification.
       *
       * Full navigation reload ensures stale React/Redux
       * authentication state is also discarded.
       */
    //   window.location.replace(
    //     "/login/advocate?accountDeletion=pending",
    //   );
      window.location.replace(
        "/login",
      );
    };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 px-4 py-5 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* ===============================================================
            MODAL HEADER
        =============================================================== */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={18} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-950">
                Delete Advocate Account
              </p>

              <p className="text-xs text-slate-400">
                Protected account action
              </p>
            </div>
          </div>

          {modalStep !==
            "success" && (
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* ===============================================================
            STEP 1
        =============================================================== */}

        {modalStep ===
          "impact" && (
          <div className="p-5">
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
              <div className="flex gap-3">
                <AlertTriangle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <p className="text-sm font-bold text-red-800">
                    Review before continuing
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-700">
                    Verifying the deletion
                    request immediately places
                    your account into its
                    30-day deletion period.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200">
              <div className="flex gap-3 p-3.5">
                <EyeOff
                  size={17}
                  className="mt-0.5 shrink-0 text-slate-400"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Profile hidden
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    Your advocate profile will
                    stop appearing in public
                    lawyer searches and
                    discovery.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3.5">
                <UserRoundCog
                  size={17}
                  className="mt-0.5 shrink-0 text-slate-400"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Professional activity restricted
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    New bookings,
                    connections and team
                    requests will no longer
                    be available.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3.5">
                <Clock3
                  size={17}
                  className="mt-0.5 shrink-0 text-slate-400"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    30-day recovery period
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    Logging in within 30 days
                    automatically cancels the
                    deletion request.
                  </p>
                </div>
              </div>
            </div>

            {/* ===========================================================
                CONFIRMATIONS
            =========================================================== */}

            <div className="mt-4 space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3">
                <input
                  type="checkbox"
                  checked={
                    hideConfirmation
                  }
                  onChange={(event) =>
                    setHideConfirmation(
                      event.target
                        .checked,
                    )
                  }
                  className="mt-0.5 size-4 accent-amber-500"
                />

                <span className="text-xs leading-5 text-slate-600">
                  I understand that my
                  advocate profile will be
                  hidden after deletion OTP
                  verification.
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3">
                <input
                  type="checkbox"
                  checked={
                    permanentConfirmation
                  }
                  onChange={(event) =>
                    setPermanentConfirmation(
                      event.target
                        .checked,
                    )
                  }
                  className="mt-0.5 size-4 accent-amber-500"
                />

                <span className="text-xs leading-5 text-slate-600">
                  I understand that the
                  account can be permanently
                  deleted after the 30-day
                  grace period.
                </span>
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!canContinue}
                onClick={() => {
                  setError("");
                  setModalStep(
                    "confirm",
                  );
                }}
                className="flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
                <ChevronRight
                  size={16}
                />
              </button>
            </div>
          </div>
        )}

        {/* ===============================================================
            STEP 2 — TYPE DELETE
        =============================================================== */}

        {modalStep ===
          "confirm" && (
          <div className="p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-600">
              Final confirmation
            </p>

            <h3 className="mt-1 text-xl font-bold text-slate-950">
              Confirm deletion request
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Type{" "}
              <span className="font-bold text-slate-900">
                DELETE
              </span>{" "}
              below to unlock OTP
              verification.
            </p>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Confirmation
              </label>

              <input
                type="text"
                value={deleteText}
                onChange={(event) => {
                  setDeleteText(
                    event.target.value
                      .toUpperCase(),
                  );
                  setError("");
                }}
                placeholder="DELETE"
                autoComplete="off"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50/70
                  px-4
                  py-3
                  text-sm
                  font-bold
                  tracking-wider
                  text-slate-900
                  outline-none
                  transition-all
                  focus:border-red-400
                  focus:bg-white
                  focus:ring-2
                  focus:ring-red-100
                "
              />

              <p className="mt-2 text-xs text-slate-400">
                Verification OTP will be
                sent to{" "}
                <span className="font-semibold text-slate-600">
                  {maskPhone(
                    advocate?.phone,
                  )}
                </span>
                .
              </p>
            </div>

            {error && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="mt-5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setModalStep(
                    "impact",
                  );
                }}
                disabled={loading}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                Back
              </button>

              <button
                type="button"
                disabled={
                  !canSendOtp ||
                  loading
                }
                onClick={
                  handleRequestOtp
                }
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Smartphone
                      size={16}
                    />
                    Send OTP
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ===============================================================
            STEP 3 — OTP
        =============================================================== */}

        {modalStep === "otp" && (
          <div className="p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <KeyRound size={20} />
            </div>

            <h3 className="mt-3 text-xl font-bold text-slate-950">
              Verify deletion OTP
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Enter the 6-digit OTP sent to{" "}
              <span className="font-semibold text-slate-700">
                {maskPhone(
                  advocate?.phone,
                )}
              </span>
              .
            </p>

            {message && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
                {message}
              </div>
            )}

            {error && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="mt-4">
              <OtpInput
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  setError("");
                }}
                length={6}
                error={Boolean(error)}
                disabled={loading}
              />
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-400">
              The current deletion API does
              not provide a separate resend
              endpoint.
            </p>

            <div className="mt-5 flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setError("");
                  setOtp("");
                  setModalStep(
                    "confirm",
                  );
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                Back
              </button>

              <button
                type="button"
                disabled={
                  loading ||
                  otp.length !== 6
                }
                onClick={
                  handleVerifyOtp
                }
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Trash2
                      size={16}
                    />
                    Verify & Delete
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ===============================================================
            SUCCESS
        =============================================================== */}

        {modalStep ===
          "success" && (
          <div className="p-5 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2
                size={26}
              />
            </div>

            <h3 className="mt-4 text-xl font-bold text-slate-950">
              Deletion request submitted
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {message}
            </p>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
              <div className="flex gap-3">
                <Clock3
                  size={18}
                  className="mt-0.5 shrink-0 text-amber-600"
                />

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    30-day recovery window
                  </p>

                  {scheduledDeletionAt && (
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      Scheduled deletion:
                      {" "}
                      <span className="font-semibold">
                        {formatDate(
                          scheduledDeletionAt,
                        )}
                      </span>
                    </p>
                  )}

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Log in again within
                    30 days if you want to
                    automatically cancel
                    this deletion request.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={
                handleReturnToLogin
              }
              className="mt-5 w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   MAIN PAGE
============================================================================ */

export default function AdvocateAccountSettings() {
  const { user } = useAuth();

  const [
    activeTab,
    setActiveTab,
  ] = useState("security");

  const [
    deleteModalOpen,
    setDeleteModalOpen,
  ] = useState(false);

  const accountStatus =
    useMemo(
      () =>
        cleanText(
          user?.accountStatus ||
            user?.status,
        ),
      [
        user?.accountStatus,
        user?.status,
      ],
    );

  const approvalStatus =
    useMemo(
      () =>
        cleanText(
          user?.approvalStatus,
        ),
      [user?.approvalStatus],
    );

  return (
    <div className="min-h-screen bg-[#f6f8fb] pb-16">
      <meta
        name="robots"
        content="noindex,nofollow"
      />

      <div className="w-full px-4 py-5 sm:px-5 lg:px-6 xl:px-8">
        {/* ===============================================================
            HEADER
        =============================================================== */}

        <header className="mb-5">
          <div className="flex items-center gap-2">
            <Settings
              size={16}
              className="text-amber-500"
            />

            <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600">
              Account Settings
            </p>
          </div>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Manage your account
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Review your security, privacy
            and account management settings.
          </p>
        </header>

        {/* ===============================================================
            SETTINGS TABS
        =============================================================== */}

        <div className="mb-5 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <SettingTab
            active={
              activeTab === "security"
            }
            Icon={LockKeyhole}
            label="Login & Security"
            onClick={() =>
              setActiveTab(
                "security",
              )
            }
          />

          <SettingTab
            active={
              activeTab === "privacy"
            }
            Icon={ShieldCheck}
            label="Privacy"
            onClick={() =>
              setActiveTab(
                "privacy",
              )
            }
          />

          <SettingTab
            active={
              activeTab === "account"
            }
            Icon={UserRoundCog}
            label="Account"
            onClick={() =>
              setActiveTab(
                "account",
              )
            }
          />
        </div>

        {/* ===============================================================
            LOGIN & SECURITY
        =============================================================== */}

        {activeTab ===
          "security" && (
          <Card
            title="Login & Security"
            description="Verified details linked with your advocate account."
          >
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-5 py-1">
              <InfoRow
                label="Email"
                value={cleanText(
                  user?.email,
                )}
              />

              <InfoRow
                label="Phone"
                value={cleanText(
                  user?.phone,
                )}
              />

              <InfoRow
                label="Account Type"
                value="Advocate"
              />
            </div>

            <div className="mt-4 flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <div>
                <p className="text-sm font-bold text-emerald-800">
                  Secure advocate account
                </p>

                <p className="mt-1 text-xs leading-5 text-emerald-700">
                  Sensitive account actions
                  require an authenticated
                  session and additional
                  verification.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* ===============================================================
            PRIVACY
        =============================================================== */}

        {activeTab ===
          "privacy" && (
          <Card
            title="Privacy"
            description="Information about your public professional account visibility."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <EyeOff
                  size={18}
                  className="text-slate-400"
                />

                <p className="mt-2 text-sm font-bold text-slate-800">
                  Public profile
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Your visibility depends
                  on account status,
                  approval status and
                  deletion status.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <ShieldCheck
                  size={18}
                  className="text-slate-400"
                />

                <p className="mt-2 text-sm font-bold text-slate-800">
                  Account protection
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Sensitive account changes
                  are tied to your
                  authenticated advocate
                  identity.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* ===============================================================
            ACCOUNT
        =============================================================== */}

       {activeTab === "account" && (
  <div className="grid min-h-[calc(100vh-230px)] grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
    {/* =========================================================
        LEFT COLUMN
    ========================================================= */}

    <div className="min-w-0 space-y-5">
      {/* =======================================================
          ACCOUNT INFORMATION
      ======================================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03),0_8px_24px_rgba(15,23,42,0.035)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-amber-400">
                <UserRoundCog size={17} />
              </div>

              <div>
                <h2 className="text-[16px] font-bold text-slate-950">
                  Account Information
                </h2>

                <p className="mt-0.5 text-[12px] text-slate-500">
                  Your advocate account and approval information.
                </p>
              </div>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
              {accountStatus}
            </span>
          </div>
        </div>

        {/* DETAILS */}

        <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="px-5 py-5 lg:px-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
              Advocate Name
            </p>

            <p className="mt-2 text-[15px] font-bold text-slate-900">
              {cleanText(
                user?.fullName ||
                  user?.name,
              )}
            </p>

            <p className="mt-1 truncate text-[12px] text-slate-500">
              {cleanText(user?.email)}
            </p>
          </div>

          <div className="px-5 py-5 lg:px-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
              Approval Status
            </p>

            <div className="mt-2 flex items-center gap-2">
              <CheckCircle2
                size={17}
                className={
                  approvalStatus === "APPROVED"
                    ? "text-emerald-500"
                    : "text-amber-500"
                }
              />

              <span className="text-[15px] font-bold text-slate-900">
                {approvalStatus}
              </span>
            </div>

            <p className="mt-1 text-[12px] text-slate-500">
              Admin verification status
            </p>
          </div>
        </div>

        {/* ACCOUNT META */}

        <div className="grid grid-cols-1 border-t border-slate-100 bg-slate-50/50 sm:grid-cols-3">
          <div className="border-b border-slate-100 px-5 py-4 sm:border-b-0 sm:border-r lg:px-6">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Account Type
            </p>

            <p className="mt-1 text-[13px] font-semibold text-slate-700">
              Advocate
            </p>
          </div>

          <div className="border-b border-slate-100 px-5 py-4 sm:border-b-0 sm:border-r lg:px-6">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Mobile
            </p>

            <p className="mt-1 text-[13px] font-semibold text-slate-700">
              {cleanText(user?.phone)}
            </p>
          </div>

          <div className="px-5 py-4 lg:px-6">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Profile
            </p>

            <p className="mt-1 text-[13px] font-semibold text-slate-700">
              Professional Account
            </p>
          </div>
        </div>
      </section>

      {/* =======================================================
          DANGER ZONE
      ======================================================= */}

      <section className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-[0_8px_28px_rgba(239,68,68,0.04)]">
        <div className="border-b border-red-100 bg-gradient-to-r from-red-50/80 to-white px-5 py-4 lg:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <AlertTriangle size={16} />
            </div>

            <div>
              <h2 className="text-[15px] font-bold text-red-700">
                Danger Zone
              </h2>

              <p className="mt-0.5 text-[11px] text-slate-500">
                Sensitive and destructive account actions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <Trash2
                size={16}
                className="shrink-0 text-red-500"
              />

              <p className="text-[14px] font-bold text-slate-900">
                Delete Advocate Account
              </p>
            </div>

            <p className="mt-2 text-[12px] leading-5 text-slate-500">
              Request account deletion using OTP verification. Once verified,
              your profile will immediately be hidden and a 30-day recovery
              period will begin.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="
              inline-flex
              min-h-[42px]
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-red-200
              bg-white
              px-4
              text-[12px]
              font-bold
              text-red-600
              outline-none
              transition-all
              duration-200
              hover:border-red-300
              hover:bg-red-50
              hover:shadow-sm
              focus:outline-none
              focus:ring-2
              focus:ring-red-100
            "
          >
            Manage Deletion
            <ChevronRight size={15} />
          </button>
        </div>
      </section>
    </div>

    {/* =========================================================
        RIGHT COLUMN
    ========================================================= */}

    <aside className="space-y-5">
      {/* ACCOUNT HEALTH */}

      <section className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_12px_35px_rgba(15,23,42,0.12)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950">
          <ShieldCheck size={19} />
        </div>

        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-400">
          Account Health
        </p>

        <h3 className="mt-1 text-[17px] font-bold">
          Your account is active
        </h3>

        <p className="mt-2 text-[12px] leading-5 text-slate-400">
          Your advocate account is currently available according to your
          account and approval status.
        </p>

        <div className="mt-5 space-y-2.5">
          <div className="flex items-center justify-between rounded-xl bg-white/[0.05] px-3 py-2.5">
            <span className="text-[11px] text-slate-400">
              Account
            </span>

            <span className="text-[11px] font-bold text-emerald-400">
              {accountStatus}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-white/[0.05] px-3 py-2.5">
            <span className="text-[11px] text-slate-400">
              Approval
            </span>

            <span className="text-[11px] font-bold text-amber-400">
              {approvalStatus}
            </span>
          </div>
        </div>
      </section>

      {/* DELETION INFO */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Clock3
            size={17}
            className="text-amber-500"
          />

          <h3 className="text-[14px] font-bold text-slate-900">
            Account deletion process
          </h3>
        </div>

        <div className="mt-4 space-y-4">
          {[
            {
              number: "01",
              title: "Request OTP",
              text: "OTP is sent to your registered mobile number.",
            },
            {
              number: "02",
              title: "Verify OTP",
              text: "Your deletion request becomes active.",
            },
            {
              number: "03",
              title: "30-day period",
              text: "Login during this period to cancel deletion.",
            },
            {
              number: "04",
              title: "Permanent deletion",
              text: "After expiry, the account may be permanently removed.",
            },
          ].map((item) => (
            <div
              key={item.number}
              className="flex gap-3"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[10px] font-extrabold text-amber-600">
                {item.number}
              </div>

              <div>
                <p className="text-[12px] font-bold text-slate-800">
                  {item.title}
                </p>

                <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SUPPORT NOTE */}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex gap-2.5">
          <LockKeyhole
            size={16}
            className="mt-0.5 shrink-0 text-slate-400"
          />

          <p className="text-[11px] leading-5 text-slate-500">
            Account deletion cannot be completed only by clicking a button.
            Registered-mobile OTP verification is required before the
            deletion period begins.
          </p>
        </div>
      </div>
    </aside>
  </div>
)}
      </div>

      {/* ===============================================================
          DELETE MODAL
      =============================================================== */}

      <DeleteAccountModal
        open={deleteModalOpen}
        advocate={user}
        onClose={() =>
          setDeleteModalOpen(
            false,
          )
        }
      />
    </div>
  );
}