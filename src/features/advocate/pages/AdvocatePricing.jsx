import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BadgeIndianRupee,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Info,
  Loader2,
  MapPin,
  MonitorPlay,
  Phone,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";

import { apiRequest } from "@shared/services/apiClient";
import { getAuthToken } from "@/utils/auth";

/* =========================================================================
   HELPERS
============================================================================ */

const toAmount = (value) => {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return null;
  }

  const number = Number(raw);

  if (!Number.isFinite(number) || number < 0) {
    return null;
  }

  return number;
};

const toInputValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= 0
    ? String(number)
    : "";
};

const formatCurrency = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(number);
};

const getProfileFromResponse = (response) =>
  response?.advocate ??
  response?.data?.advocate ??
  response?.data ??
  null;

const createPricingValues = (advocate) => ({
  videoCallPricePer15Min: toInputValue(
    advocate?.videoCallPricePer15Min,
  ),
  voiceCallPricePer15Min: toInputValue(
    advocate?.voiceCallPricePer15Min,
  ),
  offlineVisitingFee: toInputValue(
    advocate?.offlineVisitingFee,
  ),
  officeVisitDurationMinutes: toInputValue(
    advocate?.officeVisitDurationMinutes,
  ),
});

const arePricingValuesEqual = (a, b) =>
  String(a?.videoCallPricePer15Min ?? "") ===
    String(b?.videoCallPricePer15Min ?? "") &&
  String(a?.voiceCallPricePer15Min ?? "") ===
    String(b?.voiceCallPricePer15Min ?? "") &&
  String(a?.offlineVisitingFee ?? "") ===
    String(b?.offlineVisitingFee ?? "") &&
  String(a?.officeVisitDurationMinutes ?? "") ===
    String(b?.officeVisitDurationMinutes ?? "");

/* =========================================================================
   SMALL UI COMPONENTS
============================================================================ */

const PricingSkeleton = () => (
  <div className="min-h-screen bg-[#f6f8fb] px-4 py-6 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-[1320px] animate-pulse">
      <div className="h-10 w-32 rounded-xl bg-slate-200" />

      <div className="mt-7 rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8">
        <div className="h-7 w-60 rounded-lg bg-slate-200" />
        <div className="mt-3 h-4 w-96 max-w-full rounded-lg bg-slate-100" />

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-[22px] bg-slate-100"
            />
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-44 rounded-[24px] border border-slate-200 bg-white"
            />
          ))}
        </div>

        <div className="space-y-4 xl:col-span-4">
          <div className="h-80 rounded-[24px] bg-slate-950/90" />
          <div className="h-40 rounded-[24px] border border-slate-200 bg-white" />
        </div>
      </div>
    </div>
  </div>
);

const FieldError = ({ children }) => {
  if (!children) return null;

  return (
    <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600">
      <AlertCircle size={13} />
      {children}
    </div>
  );
};

const PricingInput = ({
  id,
  label,
  description,
  value,
  error,
  onChange,
}) => (
  <div>
    <label
      htmlFor={id}
      className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500"
    >
      {label}
    </label>

    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center border-r border-slate-200 text-slate-500">
        <IndianRupee size={16} />
      </div>

      <input
        id={id}
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        value={value}
        onChange={onChange}
        placeholder="0"
        className={`h-12 w-full rounded-xl border bg-slate-50/70 pl-14 pr-4 text-sm font-bold text-slate-950 outline-none transition-all placeholder:font-medium placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
            : "border-slate-200 focus:border-amber-400 focus:ring-amber-500/10"
        }`}
      />
    </div>

    <p className="mt-2 text-xs leading-5 text-slate-400">
      {description}
    </p>

    <FieldError>{error}</FieldError>
  </div>
);

const PricingCard = ({
  Icon,
  title,
  badge,
  description,
  children,
  tone = "amber",
}) => {
  const tones = {
    amber: {
      icon: "border-amber-100 bg-amber-50 text-amber-600",
      badge: "border-amber-100 bg-amber-50 text-amber-700",
    },
    blue: {
      icon: "border-blue-100 bg-blue-50 text-blue-600",
      badge: "border-blue-100 bg-blue-50 text-blue-700",
    },
    emerald: {
      icon: "border-emerald-100 bg-emerald-50 text-emerald-600",
      badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
    },
  };

  void Icon;
  const theme = tones[tone] || tones.amber;

  return (
    <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${theme.icon}`}
        >
          <Icon size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[16px] font-extrabold tracking-tight text-slate-950">
              {title}
            </h2>

            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${theme.badge}`}
            >
              {badge}
            </span>
          </div>

          <p className="mt-1.5 max-w-xl text-[13px] leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        {children}
      </div>
    </section>
  );
};

/* =========================================================================
   MAIN
============================================================================ */

const AdvocatePricing = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [advocate, setAdvocate] = useState(null);

  const [pricing, setPricing] = useState({
    videoCallPricePer15Min: "",
    voiceCallPricePer15Min: "",
    offlineVisitingFee: "",
    officeVisitDurationMinutes: "",
  });

  const [savedPricing, setSavedPricing] = useState({
    videoCallPricePer15Min: "",
    voiceCallPricePer15Min: "",
    offlineVisitingFee: "",
    officeVisitDurationMinutes: "",
  });

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState("");

  /* =========================================================================
     FETCH CURRENT ADVOCATE PROFILE
  ========================================================================== */

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const response = await apiRequest("/advocate/profile", {
        method: "GET",

        /*
         * apiRequest already sends credentials:"include".
         * Token is also supplied for compatibility with the app's
         * existing token-based authentication.
         */
        token: getAuthToken(),
      });

      const profile = getProfileFromResponse(response);

      if (!profile) {
        throw new Error("Unable to load your advocate profile.");
      }

      const values = createPricingValues(profile);

      setAdvocate(profile);
      setPricing(values);
      setSavedPricing(values);
      setErrors({});
    } catch (error) {
      if (error?.status === 401) {
        navigate("/login", {
          replace: true,
          state: {
            from: location.pathname + location.search,
          },
        });

        return;
      }

      if (error?.status === 403) {
        setLoadError(
          "This pricing area is available only to Advocate accounts.",
        );

        return;
      }

      setLoadError(
        error?.message ||
          "We couldn't load your consultation pricing.",
      );
    } finally {
      setLoading(false);
    }
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /* =========================================================================
     FORM
  ========================================================================== */

  const setField = (key) => (event) => {
    const value = event.target.value;

    setPricing((previous) => ({
      ...previous,
      [key]: value,
    }));

    setErrors((previous) => {
      if (!previous[key]) return previous;

      const next = { ...previous };
      delete next[key];

      return next;
    });

    setSaveError(null);
    setSaveSuccess("");
  };

  const validate = () => {
    const next = {};

    const rawVideo = String(pricing.videoCallPricePer15Min ?? "").trim();
    const rawVoice = String(pricing.voiceCallPricePer15Min ?? "").trim();
    const rawOffice = String(pricing.offlineVisitingFee ?? "").trim();
    const rawDuration = String(pricing.officeVisitDurationMinutes ?? "").trim();

    let videoVal = null;
    let voiceVal = null;
    let officeVal = null;
    let durationVal = null;

    if (rawVideo !== "") {
      const num = Number(rawVideo);
      if (!Number.isFinite(num) || num < 0) {
        next.videoCallPricePer15Min = "Enter a valid non-negative video consultation fee.";
      } else {
        videoVal = num;
      }
    }

    if (rawVoice !== "") {
      const num = Number(rawVoice);
      if (!Number.isFinite(num) || num < 0) {
        next.voiceCallPricePer15Min = "Enter a valid non-negative voice consultation fee.";
      } else {
        voiceVal = num;
      }
    }

    // Office visit duration and price go TOGETHER (both filled or both empty)
    if (rawOffice !== "" && rawDuration === "") {
      next.officeVisitDurationMinutes = "Office visit duration is required when price is set.";
    } else if (rawDuration !== "" && rawOffice === "") {
      next.offlineVisitingFee = "Office visit price is required when duration is set.";
    } else if (rawOffice !== "" && rawDuration !== "") {
      const feeNum = Number(rawOffice);
      const durNum = Number(rawDuration);
      if (!Number.isFinite(feeNum) || feeNum < 0) {
        next.offlineVisitingFee = "Enter a valid non-negative office consultation fee.";
      } else {
        officeVal = feeNum;
      }
      if (!Number.isInteger(durNum) || durNum < 1 || durNum > 1440) {
        next.officeVisitDurationMinutes = "Duration must be a whole number between 1 and 1440 minutes.";
      } else {
        durationVal = durNum;
      }
    }

    return {
      errors: next,
      values: {
        videoCallPricePer15Min: videoVal,
        voiceCallPricePer15Min: voiceVal,
        offlineVisitingFee: officeVal,
        officeVisitDurationMinutes: durationVal,
      },
    };
  };

  const dirty = useMemo(
    () => !arePricingValuesEqual(pricing, savedPricing),
    [pricing, savedPricing],
  );

  /* =========================================================================
     PREVIEW
  ========================================================================== */

  const preview = useMemo(() => {
    const video = toAmount(pricing.videoCallPricePer15Min) ?? 0;
    const voice = toAmount(pricing.voiceCallPricePer15Min) ?? 0;
    const offline = toAmount(pricing.offlineVisitingFee) ?? 0;
    const officeDuration = toAmount(pricing.officeVisitDurationMinutes) ?? 60;

    return {
      video,
      voice,
      offline,
      officeDuration,
    };
  }, [pricing]);

  /* =========================================================================
     RESET
  ========================================================================== */

  const handleReset = () => {
    if (saving) return;

    setPricing(savedPricing);
    setErrors({});
    setSaveError(null);
    setSaveSuccess("");
  };

  /* =========================================================================
     SAVE
  ========================================================================== */

  const handleSubmit = async (event) => {
    event?.preventDefault();

    if (saving || !dirty) {
      return;
    }

    const validation = validate();

    setErrors(validation.errors);
    setSaveError(null);
    setSaveSuccess("");

    if (Object.keys(validation.errors).length > 0) {
      return;
    }

    setSaving(true);

    try {
      /*
       * IMPORTANT:
       *
       * The backend schema is strict.
       * Send ONLY documented Advocate Profile fields.
       *
       * Do not send:
       * - advocateId
       * - messageConsultancy
       * - messageLimit
       * - enabled
       * - offlineMeetingConfiguration
       * - officeLocation
       * - step
       */
      const response = await apiRequest("/advocate/profile", {
        method: "PATCH",
        token: getAuthToken(),
        body: {
          videoCallPricePer15Min:
            validation.values.videoCallPricePer15Min,

          voiceCallPricePer15Min:
            validation.values.voiceCallPricePer15Min,

          offlineVisitingFee:
            validation.values.offlineVisitingFee,

          officeVisitDurationMinutes:
            validation.values.officeVisitDurationMinutes,
        },
      });

      const updatedAdvocate =
        getProfileFromResponse(response) ||
        advocate;

      const savedValues = updatedAdvocate
        ? createPricingValues(updatedAdvocate)
        : {
            videoCallPricePer15Min: toInputValue(
              validation.values.videoCallPricePer15Min,
            ),
            voiceCallPricePer15Min: toInputValue(
              validation.values.voiceCallPricePer15Min,
            ),
            offlineVisitingFee: toInputValue(
              validation.values.offlineVisitingFee,
            ),
            officeVisitDurationMinutes: toInputValue(
              validation.values.officeVisitDurationMinutes,
            ),
          };

      setAdvocate((previous) => ({
        ...(previous || {}),
        ...(updatedAdvocate || {}),
        videoCallPricePer15Min:
          validation.values.videoCallPricePer15Min,
        voiceCallPricePer15Min:
          validation.values.voiceCallPricePer15Min,
        offlineVisitingFee:
          validation.values.offlineVisitingFee,
        officeVisitDurationMinutes:
          validation.values.officeVisitDurationMinutes,
      }));

      setPricing(savedValues);
      setSavedPricing(savedValues);

      setErrors({});

      const isApprovedAdvocate =
        advocate?.isApproved || advocate?.status === "APPROVED";
      if (isApprovedAdvocate) {
        await apiRequest("/advocate/profile/submit-for-approval", {
          method: "POST",
          token: getAuthToken(),
        });
      }

      setSaveSuccess(
        response?.message ||
          "Your consultation pricing has been updated and submitted for approval.",
      );
    } catch (error) {
      if (error?.status === 401) {
        navigate("/login", {
          replace: true,
          state: {
            from: location.pathname + location.search,
          },
        });

        return;
      }

      if (error?.status === 403) {
        setSaveError(
          "Only Advocate accounts can update consultation pricing.",
        );

        return;
      }

      if (error?.status === 400) {
        const backendErrors = error?.data?.errors || error?.errors;
        if (Array.isArray(backendErrors) && backendErrors.length > 0) {
          const fieldMap = {};
          backendErrors.forEach((e) => {
            if (e.field) fieldMap[e.field] = e.message;
          });
          setErrors(fieldMap);
        }
      }

      setSaveError(
        error?.data?.message ||
          error?.message ||
          "We couldn't update your pricing. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================================
     LOADING
  ========================================================================== */

  if (loading) {
    return <PricingSkeleton />;
  }

  /* =========================================================================
     HARD ERROR
  ========================================================================== */

  if (loadError && !advocate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-4">
        <div className="w-full max-w-md rounded-[26px] border border-slate-200 bg-white p-7 text-center shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertCircle size={24} />
          </div>

          <h1 className="mt-5 text-xl font-extrabold tracking-tight text-slate-950">
            Unable to load pricing
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {loadError}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/advocate/dashboard")}
              className="min-h-[44px] flex-1 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={fetchProfile}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     PAGE
  ========================================================================== */

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f6f8fb] text-slate-600 antialiased">
      <main className="w-full max-w-none px-4 pb-16 pt-5 sm:px-5 sm:pt-6 lg:px-6 xl:px-8">
        
        {/* ===============================================================
            HEADER
        =============================================================== */}

        <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_12px_42px_rgba(15,23,42,0.045)] sm:p-7 lg:p-8">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-[420px] bg-gradient-to-l from-amber-50/90 to-transparent" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-amber-700">
                <Sparkles size={13} />
                Advocate Pricing
              </div>

              <h1 className="mt-4 text-[27px] font-extrabold tracking-[-0.035em] text-slate-950 sm:text-[32px]">
                Consultation Pricing
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                Set the consultation fees displayed on your professional
                advocate profile.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <ShieldCheck size={13} />
                  Secure Advocate Profile
                </span>

                {dirty && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                    <Clock3 size={13} />
                    Unsaved changes
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 lg:min-w-[250px]">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                Pricing for
              </p>

              <p className="mt-1 truncate text-sm font-extrabold text-slate-900">
                {advocate?.fullName || "Advocate"}
              </p>

              {(advocate?.city || advocate?.state) && (
                <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                  <MapPin size={12} />
                  {[advocate?.city, advocate?.state]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* =============================================================
              CURRENT VALUES SUMMARY
          ============================================================= */}

          <div className="relative mt-7 grid gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="rounded-[20px] border border-blue-100 bg-blue-50/60 p-4">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <Video size={17} />
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                  15 min
                </span>
              </div>

              <p className="mt-4 text-xs font-semibold text-slate-500">
                Video Call
              </p>

              <p className="mt-1 text-xl font-extrabold tracking-tight text-slate-950">
                {formatCurrency(preview.video)}
                <span className="ml-1 text-xs font-semibold text-slate-400">
                  / 15 min
                </span>
              </p>
            </div>

            <div className="rounded-[20px] border border-amber-100 bg-amber-50/60 p-4">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                  <Phone size={17} />
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  15 min
                </span>
              </div>

              <p className="mt-4 text-xs font-semibold text-slate-500">
                Voice Call
              </p>

              <p className="mt-1 text-xl font-extrabold tracking-tight text-slate-950">
                {formatCurrency(preview.voice)}
                <span className="ml-1 text-xs font-semibold text-slate-400">
                  / 15 min
                </span>
              </p>
            </div>

            <div className="rounded-[20px] border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                  <Building2 size={17} />
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  {preview.officeDuration} min
                </span>
              </div>

              <p className="mt-4 text-xs font-semibold text-slate-500">
                Office Visit
              </p>

              <p className="mt-1 text-xl font-extrabold tracking-tight text-slate-950">
                {formatCurrency(preview.offline)}
                <span className="ml-1 text-xs font-semibold text-slate-400">
                  / {preview.officeDuration} min
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* ===============================================================
            FEEDBACK
        =============================================================== */}

        {saveSuccess && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-emerald-600"
            />

            <div>
              <p className="text-sm font-bold text-emerald-800">
                Pricing updated
              </p>

              <p className="mt-0.5 text-xs leading-5 text-emerald-700">
                {saveSuccess}
              </p>
            </div>
          </div>
        )}

        {saveError && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-red-500"
            />

            <div>
              <p className="text-sm font-bold text-red-800">
                Pricing wasn't updated
              </p>

              <p className="mt-0.5 text-xs leading-5 text-red-700">
                {saveError}
              </p>
            </div>
          </div>
        )}

        {/* ===============================================================
            FORM + PREVIEW
        =============================================================== */}

        <form
          onSubmit={handleSubmit}
          className="mt-6 grid items-start gap-6 xl:grid-cols-12"
        >
          {/* =============================================================
              PRICING FORM
          ============================================================= */}

          <div className="space-y-4 xl:col-span-8">
            <PricingCard
              Icon={Video}
              title="Video Consultation"
              badge="15 Minutes"
              tone="blue"
              description="Set your professional fee for a 15-minute video consultation session (leave empty if not offered)."
            >
              <PricingInput
                id="video-call-charge"
                label="Video call fee (15 min)"
                description="Stored as videoCallPricePer15Min on your advocate profile."
                value={pricing.videoCallPricePer15Min}
                error={errors.videoCallPricePer15Min}
                onChange={setField("videoCallPricePer15Min")}
              />
            </PricingCard>

            <PricingCard
              Icon={Phone}
              title="Voice Consultation"
              badge="15 Minutes"
              tone="amber"
              description="Set your professional fee for a 15-minute voice consultation session (leave empty if not offered)."
            >
              <PricingInput
                id="voice-call-charge"
                label="Voice call fee (15 min)"
                description="Stored as voiceCallPricePer15Min on your advocate profile."
                value={pricing.voiceCallPricePer15Min}
                error={errors.voiceCallPricePer15Min}
                onChange={setField("voiceCallPricePer15Min")}
              />
            </PricingCard>

            <PricingCard
              Icon={Building2}
              title="Office Consultation"
              badge="Per Visit"
              tone="emerald"
              description="Set the professional fee and session duration for an in-person office visit."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <PricingInput
                  id="offline-visiting-fee"
                  label="Office visiting fee (₹)"
                  description="Stored as offlineVisitingFee on your advocate profile."
                  value={pricing.offlineVisitingFee}
                  error={errors.offlineVisitingFee}
                  onChange={setField("offlineVisitingFee")}
                />

                <div>
                  <label
                    htmlFor="office-visit-duration"
                    className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500"
                  >
                    Office visit duration (min)
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center border-r border-slate-200 text-slate-500">
                      <Clock3 size={16} />
                    </div>

                    <input
                      id="office-visit-duration"
                      type="number"
                      min="1"
                      max="1440"
                      step="1"
                      value={pricing.officeVisitDurationMinutes}
                      onChange={setField("officeVisitDurationMinutes")}
                      placeholder="60"
                      className={`h-12 w-full rounded-xl border bg-slate-50/70 pl-14 pr-4 text-sm font-bold text-slate-950 outline-none transition-all placeholder:font-medium placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                        errors.officeVisitDurationMinutes
                          ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
                          : "border-slate-200 focus:border-amber-400 focus:ring-amber-500/10"
                      }`}
                    />
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Stored as officeVisitDurationMinutes (1 to 1440 min).
                  </p>

                  <FieldError>{errors.officeVisitDurationMinutes}</FieldError>
                </div>
              </div>

              {(advocate?.officeAddress || advocate?.office?.officeAddress) && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <MapPin
                    size={17}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />

                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      Your consultation address
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {advocate.officeAddress || advocate.office?.officeAddress}
                    </p>
                  </div>
                </div>
              )}
            </PricingCard>

            {/* ===========================================================
                ACTIONS
            =========================================================== */}

            <div className="flex flex-col-reverse gap-3 rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.03)] sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleReset}
                disabled={!dirty || saving}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw size={16} />
                Reset Changes
              </button>

              <button
                type="submit"
                disabled={!dirty || saving}
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 text-sm font-extrabold text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-400 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Saving Pricing...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Pricing
                  </>
                )}
              </button>
            </div>
          </div>

          {/* =============================================================
              RIGHT SIDEBAR
          ============================================================= */}

          <aside className="space-y-4 xl:sticky xl:top-6 xl:col-span-4">
            {/* LIVE PREVIEW */}

            <section className="relative overflow-hidden rounded-[26px] bg-slate-950 p-5 text-white shadow-[0_16px_45px_rgba(15,23,42,0.16)] sm:p-6">
              <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-amber-500/10 blur-3xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400">
                    <BadgeIndianRupee size={21} />
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Live Preview
                  </span>
                </div>

                <h2 className="mt-5 text-lg font-extrabold">
                  Client Pricing Preview
                </h2>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Approximate consultation costs based on the rates currently
                  entered.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.045] p-4">
                    <div className="flex items-center gap-2">
                      <Video
                        size={16}
                        className="text-blue-300"
                      />

                      <p className="text-xs font-bold text-slate-300">
                        Video consultation
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500">
                        15 minutes
                      </span>

                      <span className="text-lg font-extrabold text-white">
                        {formatCurrency(preview.video)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.045] p-4">
                    <div className="flex items-center gap-2">
                      <Phone
                        size={16}
                        className="text-amber-300"
                      />

                      <p className="text-xs font-bold text-slate-300">
                        Voice consultation
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500">
                        15 minutes
                      </span>

                      <span className="text-lg font-extrabold text-white">
                        {formatCurrency(preview.voice)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.045] p-4">
                    <div className="flex items-center gap-2">
                      <Building2
                        size={16}
                        className="text-emerald-300"
                      />

                      <p className="text-xs font-bold text-slate-300">
                        Office consultation
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500">
                        {preview.officeDuration} minutes visit
                      </span>

                      <span className="text-lg font-extrabold text-white">
                        {formatCurrency(preview.offline)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* PROFILE CONTEXT */}

            <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-950">
                    Profile-linked pricing
                  </h3>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Saved directly to your advocate profile
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                {[
                  "Video fee is charged per 15 minutes",
                  "Voice fee is charged per 15 minutes",
                  "Office fee and duration are saved together",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2.5"
                  >
                    <Check
                      size={14}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />

                    <p className="text-xs leading-5 text-slate-500">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* NOTE */}

            <section className="flex items-start gap-3 rounded-[22px] border border-amber-100 bg-amber-50/70 p-4">
              <Info
                size={17}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <div>
                <p className="text-xs font-extrabold text-amber-800">
                  Pricing changes are public-facing
                </p>

                <p className="mt-1 text-[11px] leading-5 text-amber-700">
                  Review your rates before saving. Updated profile pricing can
                  be used wherever your advocate fees are displayed.
                </p>
              </div>
            </section>
          </aside>
        </form>
      </main>
    </div>
  );
};

export default AdvocatePricing;