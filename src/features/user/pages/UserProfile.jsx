import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  useAuth,
  OtpInput,
  getCurrentUser,
  requestUserDeletionOtp,
  verifyUserDeletionOtp,
} from "../../auth";
import { getAuthToken } from "@/utils/auth";
import { API_BASE_URL } from "@shared/services/apiClient";

import {
  GOOGLE_TRANSLATE_LANGUAGES,
  GOOGLE_TRANSLATE_STORAGE_KEY,
} from "@app/components/GoogleTranslateHost";


import {
  FiArrowRight,
  FiBookmark,
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiFileText,
  FiHelpCircle,
  FiHome,
  FiInfo,
  FiLock,
  FiLogOut,
  FiMail,
  FiMap,
  FiMapPin,
  FiSettings,
  FiShield,
  FiSliders,
  FiSmartphone,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

import {
  FaBalanceScale,
  FaBirthdayCake,
  FaCity,
  FaExclamationTriangle,
  FaGavel,
  FaLanguage,
  FaMagic,
  FaRegAddressCard,
  FaVenusMars,
} from "react-icons/fa";

import {
  MdAlternateEmail,
  MdOutlinePayments,
  MdVerified,
} from "react-icons/md";

import { TermsAndConditionsContent } from "../../marketing";




const getSavedLanguage = () => {
  try {
    return (
      localStorage.getItem(
        GOOGLE_TRANSLATE_STORAGE_KEY,
      ) || "en"
    );
  } catch {
    return "en";
  }
};

const setGoogleTranslateCookie = (
  languageCode,
) => {
  const value =
    languageCode === "en"
      ? "/en/en"
      : `/en/${languageCode}`;

  document.cookie =
    `googtrans=${value};path=/`;

  const hostname =
    window.location.hostname;

  if (
    hostname &&
    hostname !== "localhost" &&
    hostname.includes(".")
  ) {
    document.cookie =
      `googtrans=${value};path=/;domain=${hostname}`;
  }
};

const applyGoogleTranslation = (
  languageCode,
) => {
  try {
    localStorage.setItem(
      GOOGLE_TRANSLATE_STORAGE_KEY,
      languageCode,
    );
  } catch {
    // Ignore storage restrictions.
  }

  setGoogleTranslateCookie(
    languageCode,
  );

  const googleSelect =
    document.querySelector(
      ".goog-te-combo",
    );

  if (googleSelect) {
    googleSelect.value =
      languageCode;

    googleSelect.dispatchEvent(
      new Event("change", {
        bubbles: true,
      }),
    );

    return;
  }

  /*
   * Google widget may still be loading.
   * Cookie is already saved, so reload once.
   */
  window.location.reload();
};

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

const getInitials = (name) => {
  const parts = cleanText(
    name || "User",
  )
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "U";
  }

  return parts
    .map((part) =>
      part.charAt(0).toUpperCase(),
    )
    .join("");
};

const normalizeCurrentUser = (
  response,
) => {
  const data =
    response?.data || response;

  const account =
    response?.user ||
    response?.account ||
    data?.user ||
    data?.account ||
    data;

  return {
    id:
      account?.id ||
      account?._id ||
      "",

    fullName:
      cleanText(
        account?.fullName ||
        account?.name,
      ),

    email:
      cleanText(
        account?.email,
      ),

    phone:
      cleanText(
        account?.phone,
      ),

    city:
      cleanText(
        account?.city,
      ),

    state:
      cleanText(
        account?.state,
      ),

    pincode:
      cleanText(
        account?.pincode,
      ),

    completeAddress:
      cleanText(
        account?.completeAddress ||
        account?.address,
      ),

    gender:
      cleanText(
        account?.gender,
      ),

    dateOfBirth:
      cleanText(
        account?.dateOfBirth ||
        account?.dob,
      ),

    role:
      cleanText(
        account?.role ||
        account?.accountType ||
        account?.type,
      ),

    status:
      cleanText(
        account?.status,
      ),

    profilePhotoUrl:
      cleanText(
        account?.profilePhotoUrl ||
        account?.profileUrl ||
        account?.avatar?.url,
      ),

    emailVerified:
      Boolean(
        account?.isEmailVerified ===
        true ||
        account?.emailVerified ===
        true,
      ),

    phoneVerified:
      Boolean(
        account?.isPhoneVerified ===
        true ||
        account?.phoneVerified ===
        true,
      ),

    latitude:
      account?.latitude ?? null,

    longitude:
      account?.longitude ?? null,

    createdAt:
      account?.createdAt || null,
  };
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return cleanText(value);
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(date);
};

const getSavedLawyerList = (
  response,
) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    Array.isArray(
      response?.savedLawyers,
    )
  ) {
    return response.savedLawyers;
  }

  if (
    Array.isArray(
      response?.data,
    )
  ) {
    return response.data;
  }

  if (
    Array.isArray(
      response?.data
        ?.savedLawyers,
    )
  ) {
    return response.data
      .savedLawyers;
  }

  return [];
};

const formatCountdown = (
  seconds,
) => {
  const minutes =
    Math.floor(seconds / 60);

  const remaining =
    seconds % 60;

  return `${minutes}:${String(
    remaining,
  ).padStart(2, "0")}`;
};

/* =========================================================================
   SHARED UI
============================================================================ */

const SectionCard = ({
  children,
  className = "",
  id,
}) => (
  <section
    id={id}
    className={`scroll-mt-24 rounded-[28px] border border-slate-200/70 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.045)] ${className}`}
  >
    {children}
  </section>
);

const SectionHeader = ({
  eyebrow,
  title,
  description,
  danger = false,
}) => (
  <div className="border-b border-slate-100 pb-5">
    <p
      className={`mb-2 text-[10px] font-black uppercase tracking-[0.18em] ${danger
          ? "text-red-500"
          : "text-amber-600"
        }`}
    >
      {eyebrow}
    </p>

    <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
      {title}
    </h2>

    {description && (
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    )}
  </div>
);

const InfoItem = ({
  icon: Icon,
  label,
  value,
  badge,
}) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
    <div className="mb-2 flex items-center gap-2 text-slate-400">
      {Icon && (
        <Icon className="shrink-0 text-[17px]" />
      )}

      <span className="text-[10px] font-black uppercase tracking-[0.16em]">
        {label}
      </span>
    </div>

    <div className="flex items-center justify-between gap-3">
      <p className="min-w-0 break-words text-[15px] font-bold text-slate-900">
        {cleanText(value) || "Not added"}
      </p>

      {badge}
    </div>
  </div>
);



const SidebarButton = ({
  icon: Icon,
  label,
  onClick,
  danger = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold outline-none transition ${danger
        ? "text-red-500 hover:bg-red-50 hover:text-red-600"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
      } focus:outline-none focus-visible:outline-none`}
  >
    {Icon && (
      <Icon className="shrink-0 text-[20px]" />
    )}

    <span className="min-w-0 flex-1">
      {label}
    </span>

    {!danger && (
      <FiChevronRight className="shrink-0 text-[17px] text-slate-300" />
    )}
  </button>
);


const QuickCard = ({
  icon: Icon,
  label,
  value,
  subtitle,
  onClick,
  disabled = false,
}) => (
  <button
    type="button"
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className="group rounded-[24px] border border-slate-200/70 bg-white p-5 text-left shadow-[0_12px_35px_rgba(15,23,42,0.04)] outline-none transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-[0_16px_40px_rgba(15,23,42,0.07)] focus:outline-none focus-visible:outline-none disabled:cursor-default disabled:hover:translate-y-0"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600">
        {Icon && (
          <Icon className="text-[22px]" />
        )}
      </div>

      {!disabled && (
        <FiArrowRight className="text-[18px] text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-amber-500" />
      )}
    </div>

    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-2xl font-black tracking-tight text-slate-950">
      {value}
    </p>

    <p className="mt-1 text-xs font-semibold text-slate-400">
      {subtitle}
    </p>
  </button>
);



const SettingsRow = ({
  icon: Icon,
  title,
  description,
  onClick,
  right,
  disabled = false,
  danger = false,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={disabled ? undefined : onClick}
    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left outline-none transition ${danger
        ? "border-red-100 bg-red-50/50 hover:border-red-200"
        : "border-slate-100 bg-slate-50/70 hover:border-amber-200 hover:bg-amber-50/40"
      } focus:outline-none focus-visible:outline-none disabled:cursor-default disabled:opacity-70`}
  >
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ${danger
          ? "text-red-600"
          : "text-slate-600"
        }`}
    >
      {Icon && (
        <Icon className="text-[20px]" />
      )}
    </div>

    <div className="min-w-0 flex-1">
      <h3
        className={`text-sm font-black ${danger
            ? "text-red-900"
            : "text-slate-900"
          }`}
      >
        {title}
      </h3>

      {description && (
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      )}
    </div>

    {right || (
      <FiChevronRight className="shrink-0 text-[18px] text-slate-300" />
    )}
  </button>
);


/* =========================================================================
   SKELETON
============================================================================ */

const ProfileSkeleton = () => (
  <div className="min-h-[60vh] bg-[#f8fafc] px-4 py-6">
    <div className="mx-auto grid max-w-7xl animate-pulse gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="h-[560px] rounded-[28px] bg-white" />

      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-3">
          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="h-[150px] rounded-[24px] bg-white"
              />
            ),
          )}
        </div>

        <div className="h-[420px] rounded-[28px] bg-white" />
      </div>
    </div>
  </div>
);

/* =========================================================================
   USER PROFILE
============================================================================ */

const UserProfile = () => {
  const navigate =
    useNavigate();

  const {
    user: authUser,
    logout,
    authLoading,
  } = useAuth();

  const [
    profile,
    setProfile,
  ] = useState(() =>
    normalizeCurrentUser(
      authUser || {},
    ),
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* =========================================================================
     SAVED LAWYERS
  ========================================================================== */

  const [
    savedLawyersCount,
    setSavedLawyersCount,
  ] = useState(null);

  /* =========================================================================
     LOCAL PREFERENCES
  ========================================================================== */

  const [
  language,
  setLanguage,
] = useState(
  getSavedLanguage,
);

const [
  showLanguageModal,
  setShowLanguageModal,
] = useState(false);



  const [
    showTermsModal,
    setShowTermsModal,
  ] = useState(false);
  /* =========================================================================
     DELETE ACCOUNT
  ========================================================================== */

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false);

  const [
    deleteAgreement,
    setDeleteAgreement,
  ] = useState(false);

  /*
   * Extra deliberate confirmation.
   * User must type DELETE before an OTP can be requested.
   */
  const [
    deletionConfirmation,
    setDeletionConfirmation,
  ] = useState("");

  const [
    deletionStep,
    setDeletionStep,
  ] = useState("warning");

  const [
    deletionOtp,
    setDeletionOtp,
  ] = useState("");

  const [
    deletionLoading,
    setDeletionLoading,
  ] = useState(false);

  const [
    deletionError,
    setDeletionError,
  ] = useState("");

  const [
    deletionMessage,
    setDeletionMessage,
  ] = useState("");

  const [
    scheduledDeletionAt,
    setScheduledDeletionAt,
  ] = useState(null);

  const [
    resendCountdown,
    setResendCountdown,
  ] = useState(0);

  /* =========================================================================
     LOAD CURRENT USER
  ========================================================================== */

  useEffect(() => {
    let active = true;

    const loadProfile =
      async () => {
        setLoading(true);
        setError("");

        try {
          const response =
            await getCurrentUser();

          if (!active) {
            return;
          }

          setProfile(
            normalizeCurrentUser(
              response,
            ),
          );
        } catch (requestError) {
          if (!active) {
            return;
          }

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

          setError(
            requestError?.message ||
            "Unable to load your profile.",
          );
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  /* =========================================================================
     LOAD SAVED LAWYERS COUNT
  ========================================================================== */

  useEffect(() => {
    let active = true;

    const loadSavedLawyers =
      async () => {
        try {
          const token =
            getAuthToken();

          const response =
            await fetch(
              `${API_BASE_URL}/saved-lawyers`,
              {
                method: "GET",

                credentials:
                  "include",

                headers: {
                  Accept:
                    "application/json",

                  ...(token
                    ? {
                      Authorization:
                        `Bearer ${token}`,
                    }
                    : {}),
                },
              },
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
              "Unable to load saved lawyers.",
            );
          }

          if (!active) {
            return;
          }

          setSavedLawyersCount(
            getSavedLawyerList(
              data,
            ).length,
          );
        } catch (requestError) {
          console.warn(
            "Saved lawyers count failed:",
            requestError,
          );

          if (active) {
            setSavedLawyersCount(
              null,
            );
          }
        }
      };

    loadSavedLawyers();

    return () => {
      active = false;
    };
  }, []);

  /* =========================================================================
     DELETE RESEND TIMER
  ========================================================================== */

  useEffect(() => {
    if (
      resendCountdown <= 0
    ) {
      return undefined;
    }

    const timer =
      window.setInterval(
        () => {
          setResendCountdown(
            (previous) =>
              previous <= 1
                ? 0
                : previous - 1,
          );
        },
        1000,
      );

    return () =>
      window.clearInterval(
        timer,
      );
  }, [resendCountdown]);

  /* =========================================================================
     DERIVED
  ========================================================================== */

  const displayName =
    profile.fullName ||
    "User";

  const initials =
    useMemo(
      () =>
        getInitials(
          displayName,
        ),
      [displayName],
    );

  const location =
    useMemo(() => {
      return [
        profile.city,
        profile.state,
        profile.pincode,
      ]
        .filter(Boolean)
        .join(", ");
    }, [
      profile.city,
      profile.state,
      profile.pincode,
    ]);

    const selectedLanguage = useMemo(() => {
  return (
    GOOGLE_TRANSLATE_LANGUAGES.find(
      (item) => item.code === language,
    ) || GOOGLE_TRANSLATE_LANGUAGES[0]
  );
}, [language]);

  const isVerified =
    profile.emailVerified ||
    profile.phoneVerified;

  const deletionPhraseValid =
    deletionConfirmation
      .trim()
      .toUpperCase() ===
    "DELETE";

  const canRequestDeletionOtp =
    deleteAgreement &&
    deletionPhraseValid &&
    !deletionLoading;

  /* =========================================================================
     NAVIGATION
  ========================================================================== */

  const scrollToSection = (
    sectionId,
  ) => {
    document
      .getElementById(
        sectionId,
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  /* =========================================================================
     LANGUAGE
  ========================================================================== */

const handleLanguageChange = (
  selectedLanguageItem
) => {
  const code =
    selectedLanguageItem.code;

  // 1. UserProfile update
  setLanguage(code);

  // 2. Save FIRST
  try {
    localStorage.setItem(
      GOOGLE_TRANSLATE_STORAGE_KEY,
      code
    );
  } catch (error) {
    console.error(
      "Unable to save language:",
      error
    );
  }

  // 3. Notify all React components
  window.dispatchEvent(
    new CustomEvent(
      "vakeel-language-change",
      {
        detail: {
          language: code,
        },
      }
    )
  );

  // 4. Close modal
  setShowLanguageModal(false);

  // 5. Google translation
  applyGoogleTranslation(code);
};

  /* =========================================================================
     LOGOUT
  ========================================================================== */

  const handleLogout =
    async () => {
      try {
        await logout();
      } finally {
        navigate("/", {
          replace: true,
        });
      }
    };

  /* =========================================================================
     DELETE ACCOUNT HELPERS
  ========================================================================== */

  const resetDeletionState =
    () => {
      setDeleteAgreement(
        false,
      );

      setDeletionConfirmation(
        "",
      );

      setDeletionStep(
        "warning",
      );

      setDeletionOtp("");

      setDeletionError("");

      setDeletionMessage("");

      setScheduledDeletionAt(
        null,
      );

      setResendCountdown(0);
    };

  const openDeleteAccountModal =
    () => {
      resetDeletionState();

      setShowDeleteModal(
        true,
      );
    };

  const closeDeleteAccountModal =
    () => {
      if (deletionLoading) {
        return;
      }

      setShowDeleteModal(
        false,
      );

      resetDeletionState();
    };

  const handleRequestDeletionOtp =
    async () => {
      if (!deleteAgreement) {
        setDeletionError(
          "Please confirm that you understand the account deletion process.",
        );

        return;
      }

      if (!deletionPhraseValid) {
        setDeletionError(
          'Please type "DELETE" to continue.',
        );

        return;
      }

      setDeletionLoading(
        true,
      );

      setDeletionError("");

      setDeletionMessage("");

      try {
        const response =
          await requestUserDeletionOtp();

        setDeletionMessage(
          response?.message ||
          "OTP has been sent to your registered phone number.",
        );

        setDeletionStep(
          "otp",
        );

        setDeletionOtp("");

        setResendCountdown(
          30,
        );
      } catch (requestError) {
        setDeletionError(
          requestError?.message ||
          "Unable to send deletion OTP.",
        );
      } finally {
        setDeletionLoading(
          false,
        );
      }
    };

  const handleResendDeletionOtp =
    async () => {
      if (
        deletionLoading ||
        resendCountdown > 0
      ) {
        return;
      }

      setDeletionLoading(
        true,
      );

      setDeletionError("");

      try {
        const response =
          await requestUserDeletionOtp();

        setDeletionMessage(
          response?.message ||
          "OTP has been sent again.",
        );

        setResendCountdown(
          30,
        );
      } catch (requestError) {
        setDeletionError(
          requestError?.message ||
          "Unable to resend OTP.",
        );
      } finally {
        setDeletionLoading(
          false,
        );
      }
    };

  const handleVerifyDeletionOtp =
    async () => {
      const otp =
        deletionOtp.trim();

      if (
        !/^\d{6}$/.test(
          otp,
        )
      ) {
        setDeletionError(
          "Please enter the 6-digit verification OTP.",
        );

        return;
      }

      setDeletionLoading(
        true,
      );

      setDeletionError("");

      try {
        const response =
          await verifyUserDeletionOtp({
            otp,
          });

        setScheduledDeletionAt(
          response
            ?.scheduledDeletionAt ||
          null,
        );

        setDeletionMessage(
          response?.message ||
          "Your account is scheduled for deletion after 30 days.",
        );

        setDeletionStep(
          "success",
        );
      } catch (requestError) {
        setDeletionError(
          requestError?.message ||
          "Unable to verify deletion OTP.",
        );
      } finally {
        setDeletionLoading(
          false,
        );
      }
    };

  const handleContinueToLogin =
    () => {
      window.location.replace(
        "/login",
      );
    };

  /* =========================================================================
     LOADING
  ========================================================================== */

  if (
    loading ||
    (authLoading &&
      !authUser)
  ) {
    return (
      <ProfileSkeleton />
    );
  }

  /* =========================================================================
     ERROR
  ========================================================================== */

  if (error) {
    return (
      <main className="min-h-[60vh] bg-[#f8fafc] px-4 py-10">
        <div className="mx-auto max-w-xl rounded-[28px] border border-red-200 bg-white p-7 shadow-sm">
          <FaExclamationTriangle className="text-3xl text-red-500" />

          <h1 className="mt-4 text-xl font-black text-slate-950">
            Unable to load profile
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white outline-none transition hover:bg-slate-800 focus:outline-none focus-visible:outline-none"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  /* =========================================================================
     UI
  ========================================================================== */

  return (
    <>
      <div className="relative min-h-[calc(100dvh-116px)] bg-[#f8fafc] py-5 text-slate-600">
        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-amber-100/25 blur-3xl" />

        <div className="pointer-events-none absolute -right-32 top-80 h-80 w-80 rounded-full bg-slate-200/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8">
          {/* =============================================================
              LEFT SIDEBAR
          ============================================================== */}

          <aside className="lg:sticky lg:top-5 lg:self-start">
            <SectionCard className="overflow-hidden">
              <div className="h-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />

              <div className="-mt-11 px-5 pb-5">
                <div className="flex flex-col items-center text-center">
                  <div className="relative rounded-full bg-white p-1.5 shadow-xl">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
                      {profile.profilePhotoUrl ? (
                        <img
                          src={
                            profile.profilePhotoUrl
                          }
                          alt={
                            displayName
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-black text-slate-500">
                          {
                            initials
                          }
                        </span>
                      )}
                    </div>

                    {isVerified && (
                      <div className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-white bg-amber-500 text-white">
                        <MdVerified className="text-[14px]" />
                      </div>
                    )}
                  </div>

                  <h2 className="mt-4 w-full truncate text-xl font-black tracking-tight text-slate-950">
                    {displayName}
                  </h2>

                  <p className="mt-1 w-full truncate text-sm text-slate-400">
                    {profile.phone ||
                      profile.email ||
                      "User account"}
                  </p>

                  {profile.role && (
                    <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-amber-700">
                      <FiUser className="text-[14px]" />
                      {profile.role}
                    </span>
                  )}
                </div>

                <div className="my-5 h-px bg-slate-100" />

                <nav className="space-y-1">
                  <SidebarButton
                    icon={FiUser}
                    label="Personal Information"
                    onClick={() =>
                      scrollToSection("personal-information")
                    }
                  />

                  <SidebarButton
                    icon={FaLanguage}
                    label="Language"
                    onClick={() =>
                      setShowLanguageModal(true)
                    }
                  />

                  <SidebarButton
                    icon={FiSliders}
                    label="Preferences"
                    onClick={() =>
                      scrollToSection("preferences")
                    }
                  />

                  <SidebarButton
                    icon={FiHelpCircle}
                    label="Help & Support"
                    onClick={() =>
                      scrollToSection("support")
                    }
                  />

                  <SidebarButton
                    icon={FaGavel}
                    label="Legal"
                    onClick={() =>
                      scrollToSection("legal")
                    }
                  />

                  <SidebarButton
                    icon={FiSettings}
                    label="Account Settings"
                    onClick={() =>
                      scrollToSection("account-settings")
                    }
                  />


                </nav>

                <div className="my-5 h-px bg-slate-100" />

                <SidebarButton
                  icon={FiLogOut}
                  label="Sign Out"
                  danger
                  onClick={handleLogout}
                />
              </div>
            </SectionCard>
          </aside>

          {/* =============================================================
              RIGHT CONTENT
          ============================================================== */}

          <main className="min-w-0 space-y-5">
            {/* HEADER */}

            <SectionCard className="relative overflow-hidden p-5 sm:p-7">
              <div className="pointer-events-none absolute right-0 top-0 h-full w-72 bg-gradient-to-l from-amber-50/80 to-transparent" />

              <div className="relative">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">
                  Account
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-[-0.035em] text-slate-950">
                  My Profile
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Manage your personal information, saved lawyers, preferences,
                  support options and account settings.
                </p>
              </div>
            </SectionCard>

            {/* QUICK CARDS */}

            <div className="grid gap-4 sm:grid-cols-3">
              <QuickCard
                icon={FiCalendar}
                label="My Bookings"
                value="View"
                subtitle="Consultations & history"
                onClick={() => navigate("/bookings")}
              />

              <QuickCard
                icon={FiBookmark}
                label="Saved Lawyers"
                value={
                  savedLawyersCount === null
                    ? "—"
                    : savedLawyersCount
                }
                subtitle="Bookmarked advocates"
                onClick={() =>
                  navigate("/saved-lawyers")
                }
              />

              <QuickCard
                icon={FaMagic}
                label="Legal Assistant"
                value="AI"
                subtitle="Get legal guidance"
                onClick={() =>
                  navigate("/legal-assistant")
                }
              />
            </div>

            {/* PERSONAL INFORMATION */}

            <SectionCard
              id="personal-information"
              className="p-5 sm:p-7 lg:p-8"
            >
              <SectionHeader
                eyebrow="Account"
                title="Personal Information"
                description="Your account information registered with Advocate Connect."
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={FaRegAddressCard}
                  label="Full Name"
                  value={profile.fullName}
                />

                <InfoItem
                  icon={MdAlternateEmail}
                  label="Email Address"
                  value={profile.email}
                  badge={
                    profile.emailVerified ? (
                      <MdVerified className="text-[19px] text-emerald-500" />
                    ) : null
                  }
                />

                <InfoItem
                  icon={FiSmartphone}
                  label="Phone Number"
                  value={profile.phone}
                  badge={
                    profile.phoneVerified ? (
                      <MdVerified className="text-[19px] text-emerald-500" />
                    ) : null
                  }
                />

                <InfoItem
                  icon={FaVenusMars}
                  label="Gender"
                  value={profile.gender}
                />

                <InfoItem
                  icon={FaBirthdayCake}
                  label="Date of Birth"
                  value={formatDate(profile.dateOfBirth)}
                />

                <InfoItem
                  icon={FiUser}
                  label="Account Role"
                  value={profile.role}
                />
              </div>

              <div className="mt-7 border-t border-slate-100 pt-6">
                <div className="mb-4">
                  <h3 className="text-base font-black text-slate-950">
                    Location
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Location information saved during your account registration.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoItem
                    icon={FaCity}
                    label="City"
                    value={profile.city}
                  />

                  <InfoItem
                    icon={FiMap}
                    label="State"
                    value={profile.state}
                  />

                  <InfoItem
                    icon={FiMapPin}
                    label="Pincode"
                    value={profile.pincode}
                  />

                  <InfoItem
                    icon={FiHome}
                    label="Complete Address"
                    value={profile.completeAddress}
                  />

                 

                  {location && (
                    <div className="sm:col-span-2">
                      <InfoItem
                        icon={FiMapPin}
                        label="Location Summary"
                        value={location}
                      />
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* LANGUAGE */}

            <SectionCard className="p-5 sm:p-7 lg:p-8">
              <SectionHeader
                eyebrow="Language"
                title="Language Preference"
                description="Choose the language you prefer while using the platform."
              />

              <div className="mt-6">
                <SettingsRow
  icon={FaLanguage}
  title="Preferred Language"
  description={`Currently selected: ${selectedLanguage.name}`}
  onClick={() =>
    setShowLanguageModal(true)
  }
  right={
    <span
      className="notranslate max-w-[120px] truncate rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-black text-amber-700"
      translate="no"
    >
      {selectedLanguage.nativeName}
    </span>
  }
/>
              </div>
            </SectionCard>

            {/* PREFERENCES */}

            <SectionCard
              id="preferences"
              className="p-5 sm:p-7 lg:p-8"
            >
              <SectionHeader
                eyebrow="Preferences"
                title="App Preferences"
                description="Manage local preferences for your account."
              />

              <div className="mt-6 space-y-3">
                <SettingsRow
                  icon={MdOutlinePayments}
                  title="Payment Methods"
                  description="Payment method management will be available here."
                  disabled
                  right={
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-wide text-slate-500">
                      Coming Soon
                    </span>
                  }
                />
              </div>
            </SectionCard>

            {/* SUPPORT */}

            <SectionCard
              id="support"
              className="p-5 sm:p-7 lg:p-8"
            >
              <SectionHeader
                eyebrow="Support"
                title="Help & Assistance"
                description="Get help with your account or use our legal assistance tools."
              />

              <div className="mt-6 space-y-3">
                <SettingsRow
                  icon={FiHelpCircle}
                  title="Chat and Support"
                  description="Need help with the platform? Visit our support area."
                  onClick={() => navigate("/help")}
                />

                <SettingsRow
                  icon={FaMagic}
                  title="Legal Assistant"
                  description="Ask legal questions and explore legal information."
                  onClick={() => navigate("/legal-assistant")}
                />
              </div>
            </SectionCard>

            {/* LEGAL */}

            <SectionCard
              id="legal"
              className="p-5 sm:p-7 lg:p-8"
            >
              <SectionHeader
                eyebrow="Legal"
                title="Legal Information"
                description="Platform policies, terms and licensing information."
              />

              <div className="mt-6 space-y-3">
                <SettingsRow
                  icon={FiShield}
                  title="Privacy Policy"
                  description="Privacy policy page is not connected yet."
                  disabled
                  right={
                    <span className="text-[10px] font-bold text-slate-400">
                      Coming Soon
                    </span>
                  }
                />

                <SettingsRow
                  icon={FiFileText}
                  title="Terms and Conditions"
                  description="Read the terms governing your use of Vakeel Setu."
                  onClick={() =>
                    setShowTermsModal(true)
                  }
                  right={
                    <FiChevronRight className="text-[18px] text-slate-300" />
                  }
                />

                <SettingsRow
                  icon={MdVerified}
                  title="License"
                  description="Application licensing information."
                  disabled
                  right={
                    <span className="text-[10px] font-bold text-slate-400">
                      Coming Soon
                    </span>
                  }
                />
              </div>
            </SectionCard>

            {/* ===========================================================
                ACCOUNT SETTINGS
            ============================================================ */}

            <SectionCard
              id="account-settings"
              className="p-5 sm:p-7 lg:p-8"
            >
              <SectionHeader
                eyebrow="Account / Settings"
                title="Account Settings"
                description="Manage security and important settings related to your account."
              />

              <div className="mt-6 space-y-3">
                <SettingsRow
                  icon={FiShield}
                  title="Account Security"
                  description="Manage account security and verification settings."
                  disabled
                  right={
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-wide text-slate-500">
                      Coming Soon
                    </span>
                  }
                />

                <SettingsRow
                  icon={FiSmartphone}
                  title="Login & Sessions"
                  description="Review devices and active login sessions."
                  disabled
                  right={
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-wide text-slate-500">
                      Coming Soon
                    </span>
                  }
                />


              </div>

              {/* =========================================================
                  DANGER ZONE
              ========================================================== */}

              <div className="mt-8 border-t border-slate-100 pt-7">
                <div className="mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">
                    Danger Zone
                  </p>

                  <h3 className="mt-2 text-base font-black text-slate-950">
                    Account Deletion
                  </h3>

                  <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                    Deleting your account starts a 30-day grace period. During
                    this period you can cancel the deletion by signing in again.
                  </p>
                </div>

                <SettingsRow
                  icon={FiTrash2}
                  title="Request Account Deletion"
                  description="Start the identity verification process required to permanently delete your account."
                  danger
                  onClick={openDeleteAccountModal}
                />
              </div>
            </SectionCard>
          </main>
        </div>
      </div>

{/* ================================================================
    TERMS & CONDITIONS MODAL
================================================================= */}

{showTermsModal && (
  <div
    className="fixed inset-0 z-[450] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-5"
    onClick={() => setShowTermsModal(false)}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
      onClick={(event) => event.stopPropagation()}
      className="flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)]"
    >
      {/* HEADER */}
      <div className="shrink-0 border-b border-slate-100 bg-white px-5 py-5 sm:px-7">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <FiFileText className="text-[21px]" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">
                  Legal
                </p>

                <h2
                  id="terms-title"
                  className="mt-0.5 text-xl font-black tracking-tight text-slate-950 sm:text-2xl"
                >
                  Terms & Conditions
                </h2>
              </div>
            </div>

            <p className="mt-3 max-w-2xl text-xs leading-5 text-slate-500">
              Please read these terms carefully before using Vakeel Setu.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowTermsModal(false)}
            aria-label="Close Terms and Conditions"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 outline-none transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
          >
            <FiX className="text-[19px]" />
          </button>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7 sm:py-7">
        <TermsAndConditionsContent />
      </div>

      {/* FOOTER */}
      <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] leading-5 text-slate-400">
            <span className="notranslate" translate="no">Vakeel Setu</span> • Operated by Techvunex Innovations
          </p>

          <button
            type="button"
            onClick={() => setShowTermsModal(false)}
            className="min-h-[40px] rounded-xl bg-slate-950 px-5 text-xs font-black text-white outline-none transition hover:bg-slate-800 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* ================================================================
    LANGUAGE MODAL
================================================================= */}

{showLanguageModal && (
  <div
    className="notranslate fixed inset-0 z-[350] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
    translate="no"
    onClick={() =>
      setShowLanguageModal(false)
    }
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-modal-title"
      onClick={(event) =>
        event.stopPropagation()
      }
      className="flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl"
    >
      {/* HEADER */}

      <div className="shrink-0 border-b border-slate-100 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">
              Language
            </p>

            <h3
              id="language-modal-title"
              className="mt-2 text-2xl font-black text-slate-950"
            >
              Select Language
            </h3>

            <p className="mt-2 text-sm leading-5 text-slate-500">
              Choose your preferred language for Vakeel Setu.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowLanguageModal(false)
            }
            aria-label="Close language dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 outline-none transition hover:bg-slate-100 hover:text-slate-900"
          >
            <FiX className="text-[18px]" />
          </button>
        </div>
      </div>

      {/* LANGUAGE LIST */}

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="space-y-1.5">
          {GOOGLE_TRANSLATE_LANGUAGES.map(
            (item) => {
              const active =
                language === item.code;

              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() =>
                    handleLanguageChange(
                      item,
                    )
                  }
                  className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left outline-none transition ${
                    active
                      ? "border-amber-300 bg-amber-50"
                      : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="min-w-0">
                    <p
                      className={`truncate text-sm font-black ${
                        active
                          ? "text-amber-800"
                          : "text-slate-800"
                      }`}
                    >
                      {item.nativeName}
                    </p>

                    {item.name !==
                      item.nativeName && (
                      <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                        {item.name}
                      </p>
                    )}
                  </div>

                  {active && (
                    <FiCheckCircle className="shrink-0 text-[19px] text-amber-600" />
                  )}
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* FOOTER */}

      <div className="shrink-0 border-t border-slate-100 bg-slate-50/70 px-6 py-3">
        <p className="text-[10px] leading-4 text-slate-400">
          Translation is provided automatically and may not preserve
          the exact meaning of legal terms.
        </p>
      </div>
    </div>
  </div>
)}

{/* ================================================================
    DELETE ACCOUNT MODAL
================================================================= */}

{showDeleteModal && (
  <div
    className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
    onClick={
      deletionStep === "success"
        ? undefined
        : closeDeleteAccountModal
    }
  >
    <div
      onClick={(event) => event.stopPropagation()}
      className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.25)] sm:p-7"
    >
      {deletionStep !== "success" && (
        <button
          type="button"
          onClick={closeDeleteAccountModal}
          disabled={deletionLoading}
          aria-label="Close delete account dialog"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-400 outline-none transition hover:text-slate-900 focus:outline-none focus-visible:outline-none disabled:opacity-50"
        >
          <FiX className="text-[18px]" />
        </button>
      )}

      {/* ===========================================================
          WARNING
      ============================================================ */}

      {deletionStep === "warning" && (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <FaExclamationTriangle className="text-[20px]" />
          </div>

          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-red-500">
            Sensitive Account Action
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Request Account Deletion
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Please review the information below carefully. Your account
            will not be deleted immediately.
          </p>

          {/* CONSEQUENCES */}
          <div className="mt-5 space-y-3 rounded-2xl border border-red-100 bg-red-50/50 p-4">
            {[
              "Your account is not deleted immediately.",
              "A 30-day grace period begins only after OTP verification.",
              "Signing in during the 30-day grace period automatically cancels deletion.",
              "After the grace period, your account becomes eligible for permanent deletion.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-2.5"
              >
                <FiCheckCircle className="mt-0.5 shrink-0 text-[17px] text-red-500" />

                <p className="text-sm leading-5 text-slate-600">
                  {item}
                </p>
              </div>
            ))}
          </div>

          {/* TYPED CONFIRMATION */}
          <div className="mt-5">
            <label
              htmlFor="delete-confirmation"
              className="block text-sm font-black text-slate-800"
            >
              Type DELETE to continue
            </label>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              This confirmation helps prevent accidental account
              deletion requests.
            </p>

            <input
              id="delete-confirmation"
              type="text"
              value={deletionConfirmation}
              onChange={(event) => {
                setDeletionConfirmation(
                  event.target.value.toUpperCase(),
                );
                setDeletionError("");
              }}
              placeholder="DELETE"
              autoComplete="off"
              spellCheck={false}
              disabled={deletionLoading}
              className={`mt-3 w-full rounded-xl border bg-white px-4 py-3 text-sm font-black tracking-[0.08em] text-slate-900 outline-none transition ${
                deletionConfirmation && !deletionPhraseValid
                  ? "border-red-300 focus:border-red-400"
                  : deletionPhraseValid
                    ? "border-emerald-300 focus:border-emerald-400"
                    : "border-slate-200 focus:border-slate-400"
              } disabled:cursor-not-allowed disabled:bg-slate-50`}
            />

            {deletionPhraseValid && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <FiCheckCircle className="shrink-0 text-[16px]" />
                Confirmation entered
              </div>
            )}
          </div>

          {/* AGREEMENT */}
          <label
            className={`mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
              deleteAgreement
                ? "border-red-200 bg-red-50/40"
                : "border-slate-200 bg-white"
            }`}
          >
            <input
              type="checkbox"
              checked={deleteAgreement}
              onChange={(event) => {
                setDeleteAgreement(event.target.checked);
                setDeletionError("");
              }}
              disabled={deletionLoading}
              className="mt-0.5 h-4 w-4 shrink-0 accent-red-600"
            />

            <span className="text-sm font-semibold leading-5 text-slate-700">
              I understand that after OTP verification my account will
              be scheduled for deletion and that permanent deletion may
              occur after the 30-day grace period.
            </span>
          </label>

          {deletionError && (
            <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
              {deletionError}
            </p>
          )}

          {/* PROGRESS */}
          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
              Before OTP verification
            </p>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                {deletionPhraseValid ? (
                  <FiCheckCircle className="shrink-0 text-[17px] text-emerald-500" />
                ) : (
                  <span className="h-[17px] w-[17px] shrink-0 rounded-full border-2 border-slate-300" />
                )}

                <span className="text-xs font-semibold text-slate-600">
                  Type DELETE
                </span>
              </div>

              <div className="flex items-center gap-2">
                {deleteAgreement ? (
                  <FiCheckCircle className="shrink-0 text-[17px] text-emerald-500" />
                ) : (
                  <span className="h-[17px] w-[17px] shrink-0 rounded-full border-2 border-slate-300" />
                )}

                <span className="text-xs font-semibold text-slate-600">
                  Confirm deletion terms
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-[17px] w-[17px] shrink-0 rounded-full border-2 border-slate-300" />

                <span className="text-xs font-semibold text-slate-600">
                  Verify registered phone number
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRequestDeletionOtp}
            disabled={!canRequestDeletionOtp}
            className="mt-5 min-h-[46px] w-full rounded-xl bg-red-600 px-5 text-sm font-black text-white outline-none transition hover:bg-red-700 focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {deletionLoading
              ? "Sending Verification OTP..."
              : "Continue to Phone Verification"}
          </button>

          <button
            type="button"
            onClick={closeDeleteAccountModal}
            disabled={deletionLoading}
            className="mt-2 min-h-[44px] w-full rounded-xl px-5 text-sm font-bold text-slate-500 outline-none transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none disabled:opacity-50"
          >
            Keep My Account
          </button>
        </>
      )}

      {/* ===========================================================
          OTP
      ============================================================ */}

      {deletionStep === "otp" && (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <FiLock className="text-[20px]" />
          </div>

          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">
            Final Identity Verification
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Verify Your Phone
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter the 6-digit OTP sent to your registered phone number
            to confirm this account deletion request.
          </p>

          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50/50 p-4">
            <div className="flex items-start gap-3">
              <FiInfo className="mt-0.5 shrink-0 text-[19px] text-red-500" />

              <p className="text-xs font-semibold leading-5 text-slate-600">
                Verifying this OTP will schedule your account for
                deletion. Your 30-day grace period will begin after
                successful verification.
              </p>
            </div>
          </div>

          {deletionMessage && (
            <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700">
              {deletionMessage}
            </p>
          )}

          <div className="mt-5">
            <label className="mb-3 block text-sm font-bold text-slate-700">
              Enter 6-digit OTP
            </label>

            <OtpInput
              value={deletionOtp}
              onChange={(value) => {
                setDeletionOtp(value);
                setDeletionError("");
              }}
              length={6}
              error={Boolean(deletionError)}
              disabled={deletionLoading}
              autoFocus
            />

            <p className="mt-3 text-[11px] leading-5 text-slate-400">
              Never share this verification code with anyone.
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              Didn't receive the OTP?
            </p>

            <button
              type="button"
              onClick={handleResendDeletionOtp}
              disabled={
                deletionLoading ||
                resendCountdown > 0
              }
              className="shrink-0 text-xs font-black text-amber-600 outline-none hover:text-amber-700 focus:outline-none disabled:cursor-not-allowed disabled:text-slate-400"
            >
              {resendCountdown > 0
                ? `Resend in ${formatCountdown(resendCountdown)}`
                : "Resend OTP"}
            </button>
          </div>

          {deletionError && (
            <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
              {deletionError}
            </p>
          )}

          <button
            type="button"
            onClick={handleVerifyDeletionOtp}
            disabled={
              deletionLoading ||
              deletionOtp.length !== 6
            }
            className="mt-5 min-h-[46px] w-full rounded-xl bg-red-600 px-5 text-sm font-black text-white outline-none transition hover:bg-red-700 focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {deletionLoading
              ? "Verifying..."
              : "Verify & Schedule Deletion"}
          </button>

          <button
            type="button"
            onClick={closeDeleteAccountModal}
            disabled={deletionLoading}
            className="mt-2 min-h-[44px] w-full rounded-xl px-5 text-sm font-bold text-slate-500 outline-none transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none disabled:opacity-50"
          >
            Cancel
          </button>
        </>
      )}

      {/* ===========================================================
          SUCCESS
      ============================================================ */}

      {deletionStep === "success" && (
        <div className="py-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <FiCheckCircle className="text-[32px]" />
          </div>

          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
            Request Submitted
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Deletion Scheduled
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {deletionMessage ||
              "Your account is scheduled for deletion after 30 days."}
          </p>

          {scheduledDeletionAt && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                Scheduled Deletion
              </p>

              <p className="mt-1 text-sm font-black text-slate-900">
                {formatDate(scheduledDeletionAt)}
              </p>
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-left">
            <div className="flex items-start gap-3">
              <FiClock className="mt-0.5 shrink-0 text-[19px] text-amber-600" />

              <div>
                <p className="text-sm font-black text-slate-900">
                  Changed your mind?
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Sign in again within the 30-day grace period to
                  automatically cancel your deletion request.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleContinueToLogin}
            className="mt-6 min-h-[46px] w-full rounded-xl bg-slate-950 px-5 text-sm font-black text-white outline-none transition hover:bg-slate-800 focus:outline-none focus-visible:outline-none"
          >
            Continue to Login
          </button>
        </div>
      )}
    </div>
  </div>
)}
    </>
  );
};

export default UserProfile;