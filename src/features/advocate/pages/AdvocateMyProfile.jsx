import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertCircle,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Edit3,
  Eye,
  Gavel,
  Globe2,
  IndianRupee,
  Languages,
  MapPin,
  Phone,
  RefreshCw,
  Scale,
  ShieldCheck,
  Star,
  Trophy,
  UserRound,
  Clock3,
  Video,
} from "lucide-react";

import {
  advocateProfileApi,
  getAdvocateVerificationStatus,
} from "../index";

/* =========================================================================
   HELPERS
============================================================================ */

const cleanText = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
};

const getName = (advocate) =>
  cleanText(
    advocate?.fullName,
  ) ||
  cleanText(
    advocate?.name,
  ) ||
  "Advocate";

const getInitials = (
  name,
) => {
  const parts = cleanText(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "AD";
  }

  return parts
    .map(
      (part) => part[0],
    )
    .join("")
    .toUpperCase();
};

const getList = (value) =>
  Array.isArray(value)
    ? value
      .map(cleanText)
      .filter(Boolean)
    : [];

const formatMoney = (
  value,
) => {
  const number =
    Number(value);

  if (
    !Number.isFinite(
      number,
    )
  ) {
    return "₹0";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    },
  ).format(number);
};

const getLocation = (
  advocate,
) =>
  [
    advocate?.city,
    advocate?.state,
    advocate?.country,
  ]
    .map(cleanText)
    .filter(Boolean)
    .join(", ") ||
  "Location not added";

/* =========================================================================
   SKELETON
============================================================================ */

const Skeleton = ({
  className = "",
}) => (
  <div
    className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`}
  />
);

const ProfileSkeleton =
  () => (
    <main className="w-full max-w-none px-4 pb-16 pt-5 sm:px-5 sm:pt-6 lg:px-6 xl:px-8">
      <div className="w-full space-y-5 sm:space-y-6">
        <div className="rounded-[26px] border border-slate-200 bg-white p-6">
          <div className="flex gap-5">
            <Skeleton className="h-24 w-24 shrink-0 rounded-[24px]" />

            <div className="flex-1">
              <Skeleton className="h-7 w-64 max-w-full" />
              <Skeleton className="mt-3 h-4 w-80 max-w-full" />
              <Skeleton className="mt-3 h-4 w-52 max-w-full" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({
            length: 4,
          }).map(
            (_, index) => (
              <Skeleton
                key={index}
                className="h-28 rounded-[22px]"
              />
            ),
          )}
        </div>

        <div className="grid gap-5 xl:grid-cols-12">
          <Skeleton className="h-[520px] rounded-[26px] xl:col-span-8" />
          <Skeleton className="h-[520px] rounded-[26px] xl:col-span-4" />
        </div>
      </div>
    </main>
  );

/* =========================================================================
   STAT
============================================================================ */

const ProfileStat = ({
  Icon,
  label,
  value,
  tone,
}) => {
  const tones = {
    amber:
      "border-amber-100 bg-amber-50/60 text-amber-600",

    blue:
      "border-blue-100 bg-blue-50/60 text-blue-600",

    emerald:
      "border-emerald-100 bg-emerald-50/60 text-emerald-600",

    violet:
      "border-violet-100 bg-violet-50/60 text-violet-600",
  };

  return (
    <motion.article
      whileHover={{
        y: -3,
      }}
      className={`rounded-[22px] border p-4 ${tones[tone] ||
        tones.amber
        }`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
        <Icon size={18} />
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-extrabold tracking-tight text-slate-950">
        {value}
      </p>
    </motion.article>
  );
};

/* =========================================================================
   MAIN
============================================================================ */

export default function AdvocateMyProfile() {
  const navigate =
    useNavigate();


  const [
    advocate,
    setAdvocate,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    verificationStatus,
    setVerificationStatus,
  ] = useState(null);

  const [
    verificationLoading,
    setVerificationLoading,
  ] = useState(true);

  const [
    verificationError,
    setVerificationError,
  ] = useState("");

  const [
    previewMessage,
    setPreviewMessage,
  ] = useState("");

  const [
  showPreviewApprovalPopup,
  setShowPreviewApprovalPopup,
] = useState(false);

  const fetchVerificationStatus =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (!silent) {
          setVerificationLoading(
            true,
          );
        }

        setVerificationError("");

        try {
          const response =
            await getAdvocateVerificationStatus();

          if (!response?.success) {
            throw new Error(
              response?.message ||
              "Unable to load verification status.",
            );
          }

          setVerificationStatus(
            response,
          );

          return response;
        } catch (requestError) {
          if (
            requestError?.status ===
            401
          ) {
            navigate(
              "/login",
              {
                replace: true,
              },
            );

            return null;
          }

          setVerificationError(
            requestError?.message ||
            "Unable to load verification status.",
          );

          return null;
        } finally {
          setVerificationLoading(
            false,
          );
        }
      },
      [navigate],
    );

  useEffect(() => {
    fetchVerificationStatus();
  }, [fetchVerificationStatus]);



  const fetchProfile =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (silent) {
          setRefreshing(
            true,
          );
        } else {
          setLoading(true);
        }

        setError("");

        try {
          const response =
            await advocateProfileApi.getProfile();

          if (
            !response?.success ||
            !response?.advocate
          ) {
            throw new Error(
              "Unable to load Advocate profile.",
            );
          }

          setAdvocate(
            response.advocate,
          );
        } catch (
        requestError
        ) {
          if (
            requestError?.status ===
            401
          ) {
            navigate(
              "/login",
              {
                replace: true,
              },
            );

            return;
          }

          if (
            requestError?.status ===
            403
          ) {
            setError(
              "This page is available only to Advocate accounts.",
            );

            return;
          }

          setError(
            requestError?.message ||
            "Unable to load Advocate profile.",
          );
        } finally {
          setLoading(false);
          setRefreshing(
            false,
          );
        }
      },
      [navigate],
    );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const practiceAreas =
    useMemo(
      () =>
        getList(
          advocate?.practiceAreas,
        ),
      [advocate],
    );

  const courts = useMemo(
    () =>
      getList(
        advocate?.courtPractice,
      ),
    [advocate],
  );

  const languages =
    useMemo(
      () =>
        getList(
          advocate?.languagesSpoken,
        ),
      [advocate],
    );

  if (loading) {
    return (
      <ProfileSkeleton />
    );
  }

  if (
    !advocate &&
    error
  ) {
    return (
      <main className="w-full max-w-none px-4 py-10 sm:px-5 lg:px-6 xl:px-8">
        <section className="rounded-[26px] border border-red-200 bg-white p-6 shadow-sm">
          <AlertCircle
            size={24}
            className="text-red-500"
          />

          <h1 className="mt-4 text-lg font-extrabold text-slate-950">
            Unable to load profile
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              fetchProfile()
            }
            className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white"
          >
            Retry
          </button>
        </section>
      </main>
    );
  }

  const name =
    getName(advocate);

  const photo =
    advocate?.profilePhotoUrl ||
    "";

  const experience =
    Number(
      advocate?.experienceYears,
    ) || 0;

  const casesHandled =
    Number(
      advocate?.casesHandled,
    ) || 0;

  const advocateId =
    advocate?.id ||
    advocate?._id ||
    null;


  /*
   * Admin verification status comes ONLY from:
   * GET /advocate/profile/verification-status
   */
  const approvalStatus =
    String(
      verificationStatus?.status ||
      "",
    )
      .trim()
      .toUpperCase();

  const isAdminApproved =
    approvalStatus ===
    "APPROVED";

  const isProfilePending =
    approvalStatus ===
    "PENDING";

  const isProfileRejected =
    approvalStatus ===
    "REJECTED";



  /*
   * BLOCKED is an account/profile availability state,
   * not one of the verification-status endpoint states.
   */
  const accountStatus =
    String(
      advocate?.accountStatus ||
      advocate?.status ||
      "",
    )
      .trim()
      .toUpperCase();

  const isProfileBlocked =
    accountStatus ===
    "BLOCKED";


 const handlePreviewProfile = () => {
  setPreviewMessage("");

  if (
    isAdminApproved &&
    !isProfileBlocked &&
    advocateId
  ) {
    navigate(
      `/find-lawyer/${encodeURIComponent(
        advocateId,
      )}`,
    );

    return;
  }

  setShowPreviewApprovalPopup(true);
};


  const approvalMessage = (() => {
    if (isProfileBlocked) {
      return {
        title: "Profile blocked",
        message:
          "Your profile is currently blocked. Please contact support for more information.",
        wrapper:
          "border-red-200 bg-red-50",
        titleClass:
          "text-red-700",
        messageClass:
          "text-red-600",
      };
    }

    if (verificationLoading) {
      return {
        title:
          "Checking approval status",
        message:
          "Please wait while we check your profile verification status.",
        wrapper:
          "border-slate-200 bg-slate-50",
        titleClass:
          "text-slate-700",
        messageClass:
          "text-slate-500",
      };
    }

    if (isProfileRejected) {
      return {
        title:
          "Profile not approved",
        message:
          verificationStatus
            ?.rejectionReason ||
          verificationStatus
            ?.message ||
          "Your profile was rejected by the Admin.",
        wrapper:
          "border-red-200 bg-red-50",
        titleClass:
          "text-red-700",
        messageClass:
          "text-red-600",
      };
    }

    if (isProfilePending) {
      return {
        title:
          "Profile approval pending",
        message:
          verificationStatus
            ?.message ||
          "Your profile is pending Admin approval.",
        wrapper:
          "border-amber-200 bg-amber-50",
        titleClass:
          "text-amber-800",
        messageClass:
          "text-amber-700",
      };
    }

    if (isAdminApproved) {
      return {
        title:
          "Profile approved",
        message:
          verificationStatus
            ?.message ||
          "Your profile has been approved.",
        wrapper:
          "border-emerald-200 bg-emerald-50",
        titleClass:
          "text-emerald-700",
        messageClass:
          "text-emerald-600",
      };
    }

    return null;
  })();

  // const approvalMessage = (() => {
  //   if (isProfileRejected) {
  //     return {
  //       title:
  //         "Profile not approved",
  //       message:
  //         "Your profile was not approved by the admin. Please review your details and update your profile.",
  //       wrapper:
  //         "border-red-200 bg-red-50",
  //       titleClass:
  //         "text-red-700",
  //       messageClass:
  //         "text-red-600",
  //     };
  //   }

  //   if (isProfileBlocked) {
  //     return {
  //       title:
  //         "Profile unavailable",
  //       message:
  //         "Your profile is currently blocked. Please contact support for more information.",
  //       wrapper:
  //         "border-red-200 bg-red-50",
  //       titleClass:
  //         "text-red-700",
  //       messageClass:
  //         "text-red-600",
  //     };
  //   }

  //   return {
  //     title:
  //       "Profile approval pending",
  //     message:
  //       "Your public profile will be available after it is reviewed and approved by the admin.",
  //     wrapper:
  //       "border-amber-200 bg-amber-50",
  //     titleClass:
  //       "text-amber-800",
  //     messageClass:
  //       "text-amber-700",
  //   };
  // })();

  return (
    <>
      <main className="w-full max-w-none px-4 pb-16 pt-5 sm:px-5 sm:pt-6 lg:px-6 xl:px-8">
        <div className="w-full space-y-5 sm:space-y-6">
          {/* =====================================================
            HEADER
        ===================================================== */}

          <motion.section
            initial={{
              opacity: 0,
              y: 14,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="relative overflow-hidden rounded-[26px] border border-slate-200/70 bg-white p-5 shadow-[0_14px_45px_rgba(15,23,42,0.05)] sm:p-6"
          >
            <div className="pointer-events-none absolute right-0 top-0 h-full w-[420px] bg-gradient-to-l from-amber-50/90 to-transparent" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                {photo ? (
                  <img
                    src={photo}
                    alt={name}
                    className="h-24 w-24 shrink-0 rounded-[24px] object-cover ring-4 ring-slate-100"
                  />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[24px] border border-amber-200 bg-amber-50 text-xl font-extrabold text-amber-700">
                    {getInitials(
                      name,
                    )}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[25px] font-extrabold tracking-[-0.035em] text-slate-950 sm:text-[30px]">
                      {name}
                    </h1>

                    {isAdminApproved &&
                      !isProfileBlocked && (
                        <BadgeCheck
                          size={21}
                          className="text-emerald-500"
                        />
                      )}

                  </div>

                  <p className="mt-1.5 text-sm font-semibold text-amber-700">
                    {cleanText(
                      advocate?.bestPracticeArea,
                    ) ||
                      "Professional Advocate"}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin
                        size={13}
                      />

                      {getLocation(
                        advocate,
                      )}
                    </span>

                    {advocate?.barCouncilId && (
                      <span className="inline-flex items-center gap-1.5">
                        <Scale
                          size={13}
                        />

                        {
                          advocate.barCouncilId
                        }
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1.5">
                      <BriefcaseBusiness
                        size={13}
                      />

                      {experience} Years Experience
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
  {verificationLoading ? (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">
      <span className="size-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      Checking Status
    </span>
  ) : isProfileBlocked ? (
    <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
      <AlertCircle size={13} />
      Blocked
    </span>
  ) : isAdminApproved ? (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
      <ShieldCheck size={13} />
      Approved
    </span>
  ) : isProfileRejected ? (
    <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
      <AlertCircle size={13} />
      Rejected
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
      <Clock3 size={13} />
      Pending
    </span>
  )}

  {advocate?.gender && (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">
      {advocate.gender}
    </span>
  )}
</div>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 lg:w-auto">
                {/* ACTION BUTTONS */}

                <div className="flex flex-col gap-2 sm:flex-row">
                  {/* PREVIEW PROFILE */}

                  <button
                    type="button"
                    onClick={handlePreviewProfile}
                    title="Preview your public profile"
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus-visible:outline-none"
                  >
                    <Eye size={16} />
                    Preview Profile
                  </button>

                  {/* EDIT PROFILE */}

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/advocate/profile/edit",
                      )
                    }
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-extrabold text-white outline-none transition hover:bg-slate-800 focus:outline-none focus-visible:outline-none"
                  >
                    <Edit3 size={16} />
                    Edit Profile
                  </button>

                  {/* REFRESH */}

                  <button
                    type="button"
                    disabled={
                      refreshing ||
                      verificationLoading
                    }
                    onClick={async () => {
                      setPreviewMessage("");

                      await Promise.all([
                        fetchProfile({
                          silent: true,
                        }),
                        fetchVerificationStatus({
                          silent: true,
                        }),
                      ]);
                    }}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 outline-none transition hover:bg-slate-50 focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Refresh profile"
                  >
                    <RefreshCw
                      size={16}
                      className={
                        refreshing ||
                          verificationLoading
                          ? "animate-spin"
                          : ""
                      }
                    />
                  </button>
                </div>

                

                {/* ADMIN APPROVAL MESSAGE */}

                {!verificationLoading &&
                  approvalMessage &&
                  advocateId &&
                  (!isAdminApproved ||
                    isProfileBlocked) && (
                    <div
                      className={`rounded-xl border px-3.5 py-2.5 ${approvalMessage.wrapper}`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle
                          size={15}
                          className={`mt-0.5 shrink-0 ${approvalMessage.titleClass}`}
                        />

                        <div>
                          <p
                            className={`text-[11px] font-extrabold ${approvalMessage.titleClass}`}
                          >
                            {approvalMessage.title}
                          </p>

                          <p
                            className={`mt-0.5 max-w-[360px] text-[10px] leading-4 ${approvalMessage.messageClass}`}
                          >
                            {approvalMessage.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </motion.section>

          {!verificationLoading &&
  (!isAdminApproved ||
    isProfileBlocked) && (
    <motion.div
      initial={{
        opacity: 0,
        y: 6,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
        <AlertCircle
          size={18}
        />
      </div>

      <div>
        <p className="text-sm font-extrabold text-amber-900">
          Your profile is not approved by Admin.
        </p>

        <p className="mt-0.5 text-xs leading-5 text-amber-700">
          Your public profile and consultation availability will be enabled after Admin approval.
        </p>
      </div>
    </motion.div>
  )}

          {/* =====================================================
            STATS
        ===================================================== */}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <ProfileStat
              Icon={
                BriefcaseBusiness
              }
              label="Experience"
              value={`${experience} Years`}
              tone="amber"
            />

            <ProfileStat
              Icon={Trophy}
              label="Cases Handled"
              value={casesHandled}
              tone="emerald"
            />

            <ProfileStat
              Icon={Star}
              label="Rating"
              value={
                advocate?.averageRating ??
                "—"
              }
              tone="blue"
            />

            <ProfileStat
              Icon={Gavel}
              label="Practice Areas"
              value={
                practiceAreas.length
              }
              tone="violet"
            />
          </div>

          {/* =====================================================
            MAIN DETAILS
        ===================================================== */}

          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12 xl:gap-6">
            <div className="space-y-5 xl:col-span-8">
              {/* ACCOUNT */}

              <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
                <SectionTitle
                  title="Account Information"
                  description="Verified registration information."
                />

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoItem
                    Icon={UserRound}
                    label="Full Name"
                    value={
                      advocate?.fullName
                    }
                  />

                  <InfoItem
                    Icon={Phone}
                    label="Mobile Number"
                    value={
                      advocate?.phone
                    }
                  />

                  <InfoItem
                    Icon={Globe2}
                    label="Email"
                    value={
                      advocate?.email
                    }
                  />

                  <InfoItem
                    Icon={Scale}
                    label="Bar Council ID"
                    value={
                      advocate?.barCouncilId
                    }
                  />
                </div>
              </section>

              {/* ABOUT */}

              <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
                <SectionTitle
                  title="Professional Biography"
                  description="Your professional introduction."
                />

                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                  {cleanText(
                    advocate?.about,
                  ) ||
                    "No professional biography added yet."}
                </p>
              </section>

              {/* PRACTICE AREAS */}

              <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
                <SectionTitle
                  title="Practice Areas"
                  description="Areas of legal expertise."
                />

                {(() => {
                  const bestPracticeArea = String(
                    advocate?.bestPracticeArea || "",
                  ).trim();

                  const allPracticeAreas = [
                    ...(bestPracticeArea ? [bestPracticeArea] : []),
                    ...(Array.isArray(practiceAreas) ? practiceAreas : []),
                  ].filter((area, index, array) => {
                    const currentArea = String(area || "")
                      .trim()
                      .toLowerCase();

                    if (!currentArea) return false;

                    return (
                      array.findIndex(
                        (item) =>
                          String(item || "")
                            .trim()
                            .toLowerCase() === currentArea,
                      ) === index
                    );
                  });

                  const isBestPractice = (area) =>
                    Boolean(bestPracticeArea) &&
                    String(area || "").trim().toLowerCase() ===
                    bestPracticeArea.toLowerCase();

                  return allPracticeAreas.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {allPracticeAreas.map((area, index) => {
                        const highlighted = isBestPractice(area);

                        return (
                          <span
                            key={`${area}-${index}`}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition ${highlighted
                                ? "border-amber-300 bg-amber-50 text-amber-700 shadow-sm"
                                : "border-slate-200 bg-slate-50 text-slate-600"
                              }`}
                          >
                            {highlighted && (
                              <span className="material-symbols-outlined text-[15px] text-amber-500">
                                workspace_premium
                              </span>
                            )}

                            {area}


                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">
                      No practice areas added.
                    </p>
                  );
                })()}
              </section>

              {/* COURTS */}

              <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
                <SectionTitle
                  title="Court Practice"
                  description="Courts and professional practice information."
                />

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoItem
                    Icon={Gavel}
                    label="Top Court Practised"
                    value={
                      advocate?.topCourtPractised
                    }
                  />

                  <InfoItem
                    Icon={
                      Building2
                    }
                    label="Best Practice Area"
                    value={
                      advocate?.bestPracticeArea
                    }
                  />

                  <div className="sm:col-span-2">
                    <InfoItem
                      Icon={MapPin}
                      label="Complete Address"
                      value={
                        advocate?.completeAddress
                      }
                    />
                  </div>
                </div>

                {(() => {
                  const topCourt = String(
                    advocate?.topCourtPractised || "",
                  ).trim();

                  const remainingCourts = (
                    Array.isArray(courts) ? courts : []
                  ).filter(
                    (court, index, array) => {
                      const currentCourt = String(court || "")
                        .trim()
                        .toLowerCase();

                      if (!currentCourt) return false;

                      /* Remove Top Court duplicate */
                      if (
                        topCourt &&
                        currentCourt === topCourt.toLowerCase()
                      ) {
                        return false;
                      }

                      /* Remove other duplicates */
                      return (
                        array.findIndex(
                          (item) =>
                            String(item || "")
                              .trim()
                              .toLowerCase() === currentCourt,
                        ) === index
                      );
                    },
                  );

                  const hasCourts =
                    Boolean(topCourt) ||
                    remainingCourts.length > 0;

                  return hasCourts ? (
                    <div className="mt-5">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                        Courts Practised
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {/* TOP COURT — HIGHLIGHTED */}

                        {topCourt && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
                            <span className="material-symbols-outlined text-[14px] text-emerald-500">
                              workspace_premium
                            </span>

                            {topCourt}


                          </span>
                        )}

                        {/* OTHER COURTS — NORMAL */}

                        {remainingCourts.map((court, index) => (
                          <span
                            key={`${court}-${index}`}
                            className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600"
                          >
                            {court}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
              </section>

              {/* LANGUAGES */}

              <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
                <SectionTitle
                  title="Languages"
                  description="Languages available for client consultations."
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  {languages.length ? (
                    languages.map(
                      (language) => (
                        <span
                          key={
                            language
                          }
                          className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700"
                        >
                          <Languages
                            size={12}
                          />

                          {language}
                        </span>
                      ),
                    )
                  ) : (
                    <p className="text-sm text-slate-500">
                      No languages added.
                    </p>
                  )}
                </div>
              </section>
            </div>

            {/* =================================================
              PRICING SIDEBAR
          ================================================= */}

            <aside className="space-y-5 xl:sticky xl:top-6 xl:col-span-4">
              <section className="rounded-[26px] bg-slate-950 p-5 text-white shadow-[0_16px_45px_rgba(15,23,42,0.16)] sm:p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400">
                  <IndianRupee
                    size={20}
                  />
                </div>

                <h2 className="mt-5 text-lg font-extrabold">
                  Consultation Pricing
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Your current consultation charges.
                </p>

                <div className="mt-6 space-y-3">
                  <PricingItem
                    Icon={Video}
                    label="Video Call"
                    value={`${formatMoney(
                      advocate?.videoCallChargePerMinute,
                    )} / min`}
                  />

                  <PricingItem
                    Icon={Phone}
                    label="Voice Call"
                    value={`${formatMoney(
                      advocate?.voiceCallChargePerMinute,
                    )} / min`}
                  />

                  <PricingItem
                    Icon={
                      CalendarDays
                    }
                    label="Office Visit"
                    value={formatMoney(
                      advocate?.offlineVisitingFee,
                    )}
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/advocate/pricing",
                    )
                  }
                  className="mt-6 min-h-[44px] w-full rounded-xl bg-amber-500 px-4 text-sm font-extrabold text-slate-950 transition hover:bg-amber-400"
                >
                  Manage Pricing
                </button>
              </section>

              <section className="rounded-[26px] border border-slate-200 bg-white p-5">
                <SectionTitle
                  title="Location"
                  description="Professional location details."
                />

                <div className="mt-4 space-y-3">
                  <MiniInfo
                    label="Country"
                    value={
                      advocate?.country
                    }
                  />

                  <MiniInfo
                    label="State"
                    value={
                      advocate?.state
                    }
                  />

                  <MiniInfo
                    label="City"
                    value={
                      advocate?.city
                    }
                  />
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
      {showPreviewApprovalPopup && (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-[2px]"
    onClick={() =>
      setShowPreviewApprovalPopup(
        false,
      )
    }
  >
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.96,
        y: 8,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      onClick={(event) =>
        event.stopPropagation()
      }
      className="w-full max-w-sm rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.22)]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
        <AlertCircle
          size={23}
        />
      </div>

      <h3 className="mt-5 text-lg font-extrabold tracking-tight text-slate-950">
        Profile Preview Unavailable
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        Your profile is not approved by Admin.
      </p>

      <button
        type="button"
        onClick={() =>
          setShowPreviewApprovalPopup(
            false,
          )
        }
        className="mt-6 min-h-[44px] w-full rounded-xl bg-slate-950 px-4 text-sm font-extrabold text-white outline-none transition hover:bg-slate-800 focus:outline-none focus-visible:outline-none"
      >
        Okay
      </button>
    </motion.div>
  </div>
)}


    </>
  );
}

/* =========================================================================
   SMALL COMPONENTS
============================================================================ */

function SectionTitle({
  title,
  description,
}) {
  return (
    <div>
      <h2 className="text-[17px] font-extrabold tracking-tight text-slate-950">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

function InfoItem({
  Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
          <Icon size={16} />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
            {label}
          </p>

          <p className="mt-1.5 break-words text-sm font-bold leading-6 text-slate-700">
            {cleanText(value) ||
              "Not added"}
          </p>
        </div>
      </div>
    </div>
  );
}

function MiniInfo({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-700">
        {cleanText(value) ||
          "Not added"}
      </p>
    </div>
  );
}

function PricingItem({
  Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.05] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-amber-400">
          <Icon size={16} />
        </div>

        <p className="text-xs font-semibold text-slate-300">
          {label}
        </p>
      </div>

      <p className="text-sm font-extrabold text-white">
        {value}
      </p>
    </div>
  );
}