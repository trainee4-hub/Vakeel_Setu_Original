import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Keep Framer Motion recognized by ESLint configurations without JSX usage tracking.
void motion;
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Gavel,
  Globe2,
  IndianRupee,
  Languages,
  Loader2,
  MapPin,
  RefreshCw,
  RotateCcw,
  Save,
  Scale,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  Upload,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import { advocateProfileApi } from "../services/advocateProfileApi";
import LiveCameraModal from "../components/office/LiveCameraModal";
import OfficeLocationPicker from "../components/office/OfficeLocationPicker";

const PINCODE_LOOKUP_URL = "https://api.postalpincode.in/pincode";

/* =========================================================================
   FORM MODEL
============================================================================ */

const EMPTY_FORM = {
  experienceYears: "",
  casesHandled: "",

  practiceAreas: "",
  bestPracticeArea: "",

  topCourtPractised: "",
  courtPractice: "",

  about: "",

  languagesSpoken: "",

  country: "",
  state: "",
  city: "",
  pincode: "",
  officeAddress: "",
  officeLatitude: null,
  officeLongitude: null,

  videoCallChargePerMinute: "",
  voiceCallChargePerMinute: "",
  offlineVisitingFee: "",
};

/* =========================================================================
   HELPERS
============================================================================ */

const cleanText = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
};

const listToInput = (value) => {
  if (!Array.isArray(value)) {
    return "";
  }
  return value
    .map(cleanText)
    .filter(Boolean)
    .join(", ");
};

const inputToList = (value) =>
  cleanText(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const countWords = (value) => {
  const text = cleanText(value);
  if (!text) {
    return 0;
  }
  return text.split(/\s+/).filter(Boolean).length;
};

const getName = (profile) =>
  cleanText(profile?.fullName) ||
  cleanText(profile?.name) ||
  "Advocate";

const getInitials = (name) => {
  const parts = cleanText(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "AD";
  }

  return parts
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const safeNumberInput = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
};

const sameList = (a, b) => {
  const first = Array.isArray(a) ? a : [];
  const second = Array.isArray(b) ? b : [];

  if (first.length !== second.length) {
    return false;
  }

  return first.every(
    (item, index) => cleanText(item) === cleanText(second[index]),
  );
};

const addStringPatch = (payload, key, currentValue, initialValue) => {
  const current = cleanText(currentValue);
  const initial = cleanText(initialValue);

  if (current === initial) {
    return;
  }

  if (!current && !initial) {
    return;
  }

  payload[key] = current;
};

const addNumberPatch = (payload, key, currentValue, initialValue) => {
  const currentEmpty =
    currentValue === "" ||
    currentValue === null ||
    currentValue === undefined;

  const initialEmpty =
    initialValue === "" ||
    initialValue === null ||
    initialValue === undefined;

  if (currentEmpty && initialEmpty) {
    return;
  }

  const current = currentEmpty ? null : Number(currentValue);
  const initial = initialEmpty ? null : Number(initialValue);

  if (current !== null && !Number.isFinite(current)) {
    return;
  }

  if (current === initial) {
    return;
  }

  if (current !== null) {
    payload[key] = current;
  }
};

/* =========================================================================
   FIELD COMPONENT
============================================================================ */

function Field({
  label,
  hint,
  error,
  required,
  needsApproval,
  pendingHint,
  children,
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2 flex-wrap">
        <label className="block text-xs font-extrabold text-slate-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {needsApproval && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 border border-amber-200/90 shadow-2xs">
            <ShieldCheck className="w-3 h-3 text-amber-600" />
            Needs admin approval
          </span>
        )}
      </div>

      {children}

      {pendingHint ? (
        <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50/80 px-2.5 py-1.5 text-xs text-amber-900">
          <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
          <span className="leading-snug">{pendingHint}</span>
        </div>
      ) : null}

      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-5 text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

/* =========================================================================
   STATUS BANNER COMPONENT
============================================================================ */

function StatusBanner({
  profileChange,
  isApproved,
  onRequestApproval,
  onWithdraw,
  onDiscard,
  actionLoading,
  onDismissApproved,
  approvedDismissed,
}) {
  if (!isApproved || !profileChange?.status) {
    return null;
  }

  const { status, rejectionReason, requestedChanges = {} } = profileChange;
  const count = Object.keys(requestedChanges || {}).length;

  if (status === "DRAFT") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-amber-50/80 to-orange-50/70 p-4 sm:p-5 shadow-sm text-amber-950"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-800 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-extrabold text-amber-950">
                  You have changes awaiting approval ({count} {count === 1 ? "field" : "fields"}).
                </span>
                <span className="inline-flex items-center rounded-md bg-amber-200/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-950">
                  DRAFT
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-amber-900">
                Sensitive profile updates are staged as a draft. When ready, submit them for admin review, or discard to restore your live profile.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            <button
              type="button"
              disabled={actionLoading}
              onClick={onDiscard}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-amber-300/80 bg-white/90 px-3.5 text-xs font-bold text-amber-900 shadow-xs hover:bg-white hover:text-amber-950 transition disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Discard changes
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={onRequestApproval}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-slate-950 px-4 text-xs font-extrabold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 text-amber-400" />
              )}
              Request for approval
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "SUBMITTED") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-sky-50/70 to-indigo-50/60 p-4 sm:p-5 shadow-sm text-blue-950"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-700 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-extrabold text-blue-950">
                  Changes sent for admin approval.
                </span>
                <span className="inline-flex items-center rounded-md bg-blue-200/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-900">
                  UNDER REVIEW
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-blue-900">
                Your current profile stays live until approved. Approval fields are read-only while under review. You can withdraw the request to make more changes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              disabled={actionLoading}
              onClick={onWithdraw}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-blue-300 bg-white px-4 text-xs font-bold text-blue-900 shadow-xs hover:bg-blue-50 hover:text-blue-950 transition disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              Withdraw request
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-rose-300 bg-gradient-to-r from-rose-50 via-red-50/70 to-orange-50/60 p-4 sm:p-5 shadow-sm text-rose-950"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-700 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-extrabold text-rose-950">
                  Changes rejected: {rejectionReason || "Please review the flagged details."}
                </span>
                <span className="inline-flex items-center rounded-md bg-rose-200/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-950">
                  REJECTED
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-rose-900">
                Your draft has been preserved. Correct the flagged fields below and submit again, or discard your draft.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            <button
              type="button"
              disabled={actionLoading}
              onClick={onDiscard}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-3.5 text-xs font-bold text-rose-900 shadow-xs hover:bg-rose-50 transition disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Discard
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={onRequestApproval}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-slate-950 px-4 text-xs font-extrabold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 text-amber-400" />
              )}
              Submit again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "APPROVED" && !approvedDismissed) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-emerald-50/80 to-teal-50/60 p-4 sm:p-5 shadow-sm text-emerald-950"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-emerald-950">
                Your changes are approved and live.
              </p>
              <p className="text-xs text-emerald-800">
                All approved profile details and fees are now active on your public profile.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismissApproved}
            className="text-emerald-700 hover:text-emerald-950 p-1.5 rounded-lg transition"
            title="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}

/* =========================================================================
   MAIN COMPONENT
============================================================================ */

export default function AdvocateEditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [initialForm, setInitialForm] = useState(EMPTY_FORM);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [pageError, setPageError] = useState("");
  const [success, setSuccess] = useState("");

  // Photo uploads
  const [previewPhoto, setPreviewPhoto] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);

  // Office Camera & Photo
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [officePhotoBlob, setOfficePhotoBlob] = useState(null);
  const [officePhotoPreview, setOfficePhotoPreview] = useState("");

  // Pincode lookup state
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeNotice, setPincodeNotice] = useState("");

  // Discard confirm dialog
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [approvedDismissed, setApprovedDismissed] = useState(false);

  /* =========================================================================
     APPROVAL RULES (SOURCE OF TRUTH FROM GET /api/advocate/profile)
  ========================================================================== */

  const isApproved = profile?.approvalStatus === "APPROVED";
  const profileChange = profile?.profileChange || null;

  // Source of truth: DO NOT hardcode the list. Take from profileChange.approvalFields or profile.approvalFields.
  const approvalFields = useMemo(() => {
    if (Array.isArray(profileChange?.approvalFields)) {
      return profileChange.approvalFields;
    }
    if (Array.isArray(profile?.approvalFields)) {
      return profile.approvalFields;
    }
    return [];
  }, [profileChange, profile]);

  const isApprovalField = useCallback(
    (fieldKey) => {
      if (!isApproved) return false;
      return approvalFields.includes(fieldKey);
    },
    [isApproved, approvalFields],
  );

  const isSubmitted = isApproved && profileChange?.status === "SUBMITTED";
  const requestedChanges = useMemo(
    () => profileChange?.requestedChanges || profileChange?.changes || {},
    [profileChange],
  );

  /* =========================================================================
     GET PROFILE
  ========================================================================== */

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await advocateProfileApi.getProfile();

      if (!response?.success || !response?.advocate) {
        throw new Error("Unable to load Advocate profile.");
      }

      const data = response.advocate;
      const liveOffice = data?.office || {};
      const changes = data?.profileChange?.requestedChanges || data?.profileChange?.changes || {};

      setProfile(data);

      const nextForm = {
        experienceYears: safeNumberInput(changes.experienceYears ?? data?.experienceYears),
        casesHandled: safeNumberInput(data?.casesHandled),

        practiceAreas: listToInput(data?.practiceAreas),
        bestPracticeArea: cleanText(data?.bestPracticeArea),

        topCourtPractised: cleanText(data?.topCourtPractised),
        courtPractice: listToInput(data?.courtPractice),

        about: cleanText(changes.about ?? data?.about),

        languagesSpoken: listToInput(data?.languagesSpoken),

        country: cleanText(data?.country || "India"),
        state: cleanText(changes.state ?? (data?.state || liveOffice.state || "")),
        city: cleanText(changes.city ?? (data?.city || liveOffice.city || "")),
        pincode: cleanText(changes.pincode ?? (data?.pincode || liveOffice.pincode || "")),

        officeAddress: cleanText(
          changes.officeAddress ??
            (data?.officeAddress || liveOffice.officeAddress || ""),
        ),
        officeLatitude:
          changes.officeLatitude !== undefined && changes.officeLatitude !== null
            ? Number(changes.officeLatitude)
            : data?.officeLatitude !== undefined && data?.officeLatitude !== null
              ? Number(data.officeLatitude)
              : liveOffice.latitude !== undefined && liveOffice.latitude !== null
                ? Number(liveOffice.latitude)
                : null,
        officeLongitude:
          changes.officeLongitude !== undefined && changes.officeLongitude !== null
            ? Number(changes.officeLongitude)
            : data?.officeLongitude !== undefined && data?.officeLongitude !== null
              ? Number(data.officeLongitude)
              : liveOffice.longitude !== undefined && liveOffice.longitude !== null
                ? Number(liveOffice.longitude)
                : null,

        videoCallChargePerMinute: safeNumberInput(
          changes.videoCallChargePerMinute ?? data?.videoCallChargePerMinute,
        ),
        voiceCallChargePerMinute: safeNumberInput(
          changes.voiceCallChargePerMinute ?? data?.voiceCallChargePerMinute,
        ),
        offlineVisitingFee: safeNumberInput(
          changes.offlineVisitingFee ?? data?.offlineVisitingFee,
        ),
      };

      setForm(nextForm);
      setInitialForm(nextForm);

      setPreviewPhoto(changes.profilePhotoUrl || data?.profilePhotoUrl || "");
      setOfficePhotoPreview(changes.officePhotoUrl || liveOffice.photoUrl || data?.officePhotoUrl || "");
    } catch (requestError) {
      if (requestError?.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      if (requestError?.status === 403) {
        setPageError("Only Advocate accounts can manage this profile.");
        return;
      }
      setPageError(requestError?.message || "Unable to load Advocate profile.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /* =========================================================================
     CHANGE HANDLERS
  ========================================================================== */

  const handleChange = (name, value) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSuccess("");
    setPageError("");
  };

  const handlePincodeChange = async (val) => {
    const cleanPin = val.replace(/\D/g, "").slice(0, 6);
    handleChange("pincode", cleanPin);

    if (cleanPin.length === 6) {
      setPincodeLoading(true);
      setPincodeNotice("");
      try {
        const res = await fetch(`${PINCODE_LOOKUP_URL}/${cleanPin}`);
        const pinData = await res.json();
        const entry = Array.isArray(pinData) ? pinData[0] : null;
        if (
          entry?.Status === "Success" &&
          Array.isArray(entry?.PostOffice) &&
          entry.PostOffice.length > 0
        ) {
          const po = entry.PostOffice[0];
          if (po.District) handleChange("city", po.District);
          if (po.State) handleChange("state", po.State);
          setPincodeNotice(`Detected: ${po.District}, ${po.State}`);
        } else {
          setPincodeNotice("Pincode detected. Please confirm city and state.");
        }
      } catch {
        setPincodeNotice("Could not auto-detect location. Please enter city & state manually.");
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  /* =========================================================================
     COMPUTED VALUES
  ========================================================================== */

  const dirty = useMemo(
    () =>
      JSON.stringify(form) !== JSON.stringify(initialForm) ||
      Boolean(profilePhotoFile) ||
      Boolean(officePhotoBlob),
    [form, initialForm, profilePhotoFile, officePhotoBlob],
  );

  const practiceAreas = useMemo(
    () => inputToList(form.practiceAreas),
    [form.practiceAreas],
  );

  const courts = useMemo(
    () => inputToList(form.courtPractice),
    [form.courtPractice],
  );

  const languages = useMemo(
    () => inputToList(form.languagesSpoken),
    [form.languagesSpoken],
  );

  const aboutWordCount = useMemo(
    () => countWords(form.about),
    [form.about],
  );

  const isAboutInvalid = aboutWordCount < 50 || aboutWordCount > 500;

  /* =========================================================================
     VALIDATION
  ========================================================================== */

  const validate = () => {
    const nextErrors = {};

    const experience = Number(form.experienceYears);
    if (form.experienceYears === "") {
      nextErrors.experienceYears = "Experience is required.";
    } else if (
      !Number.isInteger(experience) ||
      experience < 0 ||
      experience > 80
    ) {
      nextErrors.experienceYears = "Experience must be an integer between 0 and 80.";
    }

    const casesHandled = Number(form.casesHandled);
    if (form.casesHandled === "") {
      nextErrors.casesHandled = "Cases Handled is required.";
    } else if (
      !Number.isInteger(casesHandled) ||
      casesHandled < 0 ||
      casesHandled > 100000
    ) {
      nextErrors.casesHandled = "Cases Handled must be an integer between 0 and 100000.";
    }

    if (!practiceAreas.length) {
      nextErrors.practiceAreas = "Add at least one practice area.";
    } else if (practiceAreas.length > 20) {
      nextErrors.practiceAreas = "Maximum 20 practice areas are allowed.";
    }

    if (!cleanText(form.bestPracticeArea)) {
      nextErrors.bestPracticeArea = "Best practice area is required.";
    } else if (cleanText(form.bestPracticeArea).length > 100) {
      nextErrors.bestPracticeArea = "Maximum 100 characters allowed.";
    }

    if (cleanText(form.topCourtPractised).length > 100) {
      nextErrors.topCourtPractised = "Maximum 100 characters allowed.";
    }

    if (aboutWordCount < 50) {
      nextErrors.about = "Professional biography must contain at least 50 words.";
    } else if (aboutWordCount > 500) {
      nextErrors.about = "Professional biography cannot exceed 500 words.";
    }

    // Office address validation (if provided)
    const officeAddr = cleanText(form.officeAddress);
    if (officeAddr && officeAddr.length < 10) {
      nextErrors.officeAddress = "Office address must be at least 10 characters.";
    } else if (officeAddr.length > 500) {
      nextErrors.officeAddress = "Office address cannot exceed 500 characters.";
    }

    // Pincode validation (if provided)
    const pin = cleanText(form.pincode);
    if (pin && !/^[0-9]{6}$/.test(pin)) {
      nextErrors.pincode = "Pincode must be exactly 6 digits.";
    }

    const chargeFields = [
      ["videoCallChargePerMinute", "Video call charge"],
      ["voiceCallChargePerMinute", "Voice call charge"],
      ["offlineVisitingFee", "Office visiting fee"],
    ];

    chargeFields.forEach(([key, label]) => {
      if (form[key] === "") return;
      const value = Number(form[key]);
      if (!Number.isFinite(value) || value < 0) {
        nextErrors[key] = `${label} must be 0 or greater.`;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  /* =========================================================================
     BUILD PAYLOAD (DIFF ONLY — NEVER SEND LATITUDE/LONGITUDE)
  ========================================================================== */

  const buildDiffPayload = () => {
    const payload = {};

    /* --- NUMBERS --- */
    addNumberPatch(payload, "experienceYears", form.experienceYears, initialForm.experienceYears);
    addNumberPatch(payload, "casesHandled", form.casesHandled, initialForm.casesHandled);
    addNumberPatch(payload, "videoCallChargePerMinute", form.videoCallChargePerMinute, initialForm.videoCallChargePerMinute);
    addNumberPatch(payload, "voiceCallChargePerMinute", form.voiceCallChargePerMinute, initialForm.voiceCallChargePerMinute);
    addNumberPatch(payload, "offlineVisitingFee", form.offlineVisitingFee, initialForm.offlineVisitingFee);

    /* --- STRINGS --- */
    addStringPatch(payload, "bestPracticeArea", form.bestPracticeArea, initialForm.bestPracticeArea);
    addStringPatch(payload, "topCourtPractised", form.topCourtPractised, initialForm.topCourtPractised);
    addStringPatch(payload, "about", form.about, initialForm.about);
    addStringPatch(payload, "country", form.country, initialForm.country);
    addStringPatch(payload, "officeAddress", form.officeAddress, initialForm.officeAddress);

    /* --- COORDINATES: MUST BE SENT TOGETHER (NEVER send latitude/longitude) --- */
    const latChanged = form.officeLatitude !== initialForm.officeLatitude;
    const lngChanged = form.officeLongitude !== initialForm.officeLongitude;
    if (latChanged || lngChanged) {
      if (
        form.officeLatitude !== null &&
        form.officeLatitude !== undefined &&
        form.officeLatitude !== "" &&
        form.officeLongitude !== null &&
        form.officeLongitude !== undefined &&
        form.officeLongitude !== ""
      ) {
        payload.officeLatitude = Number(form.officeLatitude);
        payload.officeLongitude = Number(form.officeLongitude);
      }
    }

    /* --- REGIONAL LOCATION: PINCODE + CITY + STATE MUST BE SENT TOGETHER --- */
    const pinChanged = cleanText(form.pincode) !== cleanText(initialForm.pincode);
    const cityChanged = cleanText(form.city) !== cleanText(initialForm.city);
    const stateChanged = cleanText(form.state) !== cleanText(initialForm.state);
    if (pinChanged || cityChanged || stateChanged) {
      if (cleanText(form.pincode) || cleanText(form.city) || cleanText(form.state)) {
        payload.pincode = cleanText(form.pincode);
        payload.city = cleanText(form.city);
        payload.state = cleanText(form.state);
      }
    }

    /* --- ARRAYS --- */
    const initialPracticeAreas = inputToList(initialForm.practiceAreas);
    if (!sameList(practiceAreas, initialPracticeAreas)) {
      payload.practiceAreas = practiceAreas;
    }

    const initialCourts = inputToList(initialForm.courtPractice);
    if (!sameList(courts, initialCourts) && courts.length > 0) {
      payload.courtPractice = courts;
    }

    const initialLanguages = inputToList(initialForm.languagesSpoken);
    if (!sameList(languages, initialLanguages) && languages.length > 0) {
      payload.languages = languages;
    }

    return payload;
  };

  /* =========================================================================
     SAVE HANDLER
  ========================================================================== */

  const handleSubmit = async (event) => {
    if (event?.preventDefault) event.preventDefault();

    if (saving) return;

    if (isSubmitted) {
      setPageError("Your profile changes are currently submitted and under review. Please withdraw the request before making further edits.");
      return;
    }

    setPageError("");
    setSuccess("");

    if (!validate()) return;

    const payload = buildDiffPayload();
    const hasFiles = Boolean(profilePhotoFile) || Boolean(officePhotoBlob);

    if (Object.keys(payload).length === 0 && !hasFiles) {
      setSuccess("No profile changes to save.");
      return;
    }

    setSaving(true);

    try {
      let response;

      if (hasFiles) {
        const formData = new FormData();

        // Append diff fields
        Object.entries(payload).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });

        // Append files
        if (profilePhotoFile) {
          formData.append("profilePhoto", profilePhotoFile);
        }
        if (officePhotoBlob) {
          formData.append("officePhoto", officePhotoBlob, "office_photo.jpg");
        }

        response = await advocateProfileApi.updateProfile(formData);
      } else {
        response = await advocateProfileApi.updateProfile(payload);
      }

      if (!response?.success) {
        throw new Error(response?.message || "Unable to update profile.");
      }

      setProfilePhotoFile(null);
      setOfficePhotoBlob(null);

      // Show backend message
      setSuccess(response?.message || "Profile updated successfully.");

      // Refresh profile to update draft banner and pending hints
      await fetchProfile();
    } catch (requestError) {
      console.error("ADVOCATE PROFILE UPDATE ERROR:", requestError);
      if (requestError?.status === 409) {
        setPageError(
          requestError?.data?.message ||
            "Your profile changes are currently submitted and under review. Please withdraw the request before making further edits.",
        );
      } else if (requestError?.status === 400) {
        setPageError(
          requestError?.data?.message ||
            requestError?.message ||
            "Invalid profile data submitted. Please check the required fields.",
        );
      } else {
        setPageError(requestError?.message || "Unable to save profile changes.");
      }
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================================
     APPROVAL WORKFLOW ACTIONS
  ========================================================================== */

  const handleRequestApproval = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    setPageError("");
    setSuccess("");

    try {
      // If there are unsaved edits, save them first
      if (dirty) {
        if (!validate()) {
          setActionLoading(false);
          return;
        }
        const payload = buildDiffPayload();
        const hasFiles = Boolean(profilePhotoFile) || Boolean(officePhotoBlob);
        if (Object.keys(payload).length > 0 || hasFiles) {
          if (hasFiles) {
            const formData = new FormData();
            Object.entries(payload).forEach(([k, v]) => {
              if (Array.isArray(v)) formData.append(k, JSON.stringify(v));
              else if (v !== null && v !== undefined) formData.append(k, String(v));
            });
            if (profilePhotoFile) formData.append("profilePhoto", profilePhotoFile);
            if (officePhotoBlob) formData.append("officePhoto", officePhotoBlob, "office_photo.jpg");
            await advocateProfileApi.updateProfile(formData);
          } else {
            await advocateProfileApi.updateProfile(payload);
          }
          setProfilePhotoFile(null);
          setOfficePhotoBlob(null);
        }
      }

      const res = await advocateProfileApi.submitForApproval();
      if (!res?.success) {
        throw new Error(res?.message || "Failed to submit request for approval.");
      }

      setSuccess(res?.message || "Profile change request submitted for admin approval.");
      await fetchProfile();
    } catch (err) {
      console.error("Submit for approval error:", err);
      setPageError(err?.data?.message || err?.message || "Failed to submit for approval.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    setPageError("");
    setSuccess("");

    try {
      const res = await advocateProfileApi.withdrawProfileChange();
      if (!res?.success) {
        throw new Error(res?.message || "Failed to withdraw change request.");
      }

      setSuccess(res?.message || "Profile change request withdrawn. You can now edit your draft.");
      await fetchProfile();
    } catch (err) {
      console.error("Withdraw change request error:", err);
      setPageError(err?.data?.message || err?.message || "Failed to withdraw change request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDiscard = async () => {
    setActionLoading(true);
    setPageError("");
    setSuccess("");

    try {
      const res = await advocateProfileApi.discardProfileChange();
      if (!res?.success) {
        throw new Error(res?.message || "Failed to discard draft changes.");
      }

      setSuccess(res?.message || "Profile change draft discarded successfully.");
      setShowDiscardModal(false);
      setProfilePhotoFile(null);
      setOfficePhotoBlob(null);
      await fetchProfile();
    } catch (err) {
      console.error("Discard change request error:", err);
      setPageError(err?.data?.message || err?.message || "Failed to discard changes.");
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================================
     PHOTO CHANGE HANDLERS
  ========================================================================== */

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPageError("Profile photo cannot exceed 5 MB.");
      return;
    }

    setProfilePhotoFile(file);
    setPreviewPhoto(URL.createObjectURL(file));
    setSuccess("New profile photo selected. Click 'Save Changes' or 'Request for approval' to submit.");
  };

  const handleLanguageKeyDown = (event) => {
    if (event.key !== " " && event.key !== "Spacebar") return;
    const input = event.currentTarget;
    const { selectionStart, selectionEnd, value } = input;
    if (selectionStart !== selectionEnd) return;

    const beforeCursor = value.slice(0, selectionStart);
    const afterCursor = value.slice(selectionEnd);
    if (!beforeCursor.trim()) return;

    const cleanBefore = beforeCursor.replace(/,\s*$/, "").trimEnd();
    const updatedValue = `${cleanBefore}, ${afterCursor.replace(/^\s+/, "")}`;
    handleChange("languagesSpoken", updatedValue);

    requestAnimationFrame(() => {
      const nextPosition = cleanBefore.length + 2;
      input.setSelectionRange(nextPosition, nextPosition);
    });
  };

  /* =========================================================================
     LOADING STATE
  ========================================================================== */

  if (loading) {
    return (
      <main className="w-full max-w-none px-4 pb-16 pt-5 sm:px-5 sm:pt-6 lg:px-6 xl:px-8">
        <div className="animate-pulse space-y-5">
          <div className="h-44 rounded-[26px] bg-white" />
          <div className="grid gap-5 xl:grid-cols-12">
            <div className="h-[760px] rounded-[26px] bg-white xl:col-span-8" />
            <div className="h-[440px] rounded-[26px] bg-white xl:col-span-4" />
          </div>
        </div>
      </main>
    );
  }

  const name = getName(profile);

  /* =========================================================================
     RENDER
  ========================================================================== */

  return (
    <main className="w-full max-w-none px-4 pb-16 pt-5 sm:px-5 sm:pt-6 lg:px-6 xl:px-8">
      <div className="w-full space-y-5 sm:space-y-6">
        {/* =====================================================
            HEADER BAR
        ===================================================== */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[26px] border border-slate-200/70 bg-white p-5 shadow-[0_14px_45px_rgba(15,23,42,0.05)] sm:p-6"
        >
          <div className="pointer-events-none absolute right-0 top-0 h-full w-96 bg-gradient-to-l from-amber-50/90 to-transparent" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigate("/advocate/profile")}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-slate-950"
              >
                <ArrowLeft size={15} />
                Back to Profile
              </button>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-amber-700">
                <Sparkles size={13} />
                Professional Profile
              </div>

              <h1 className="mt-3 text-[24px] font-extrabold tracking-[-0.035em] text-slate-950 sm:text-[29px]">
                Update Advocate Profile
              </h1>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                Manage your professional details, office location, consultation pricing, and profile information.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <ShieldCheck size={14} />
              {isApproved ? "Approved Advocate" : "Verified Identity"}
            </span>
          </div>
        </motion.section>

        {/* =====================================================
            STATUS BANNER (APPROVAL WORKFLOW)
        ===================================================== */}
        <StatusBanner
          profileChange={profileChange}
          isApproved={isApproved}
          onRequestApproval={handleRequestApproval}
          onWithdraw={handleWithdraw}
          onDiscard={() => setShowDiscardModal(true)}
          actionLoading={actionLoading}
          onDismissApproved={() => setApprovedDismissed(true)}
          approvedDismissed={approvedDismissed}
        />

        {/* FEEDBACK ALERTS */}
        {pageError && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm font-medium text-red-700">{pageError}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="text-sm font-bold text-emerald-700">{success}</p>
          </div>
        )}

        {/* =====================================================
            MAIN FORM
        ===================================================== */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12 xl:gap-6"
        >
          {/* ==================== LEFT COLUMN ==================== */}
          <div className="space-y-5 xl:col-span-8">
            {/* VERIFIED IDENTITY (READ-ONLY) */}
            <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
              <SectionHeader
                Icon={ShieldCheck}
                title="Verified Identity"
                description="These credentials were authenticated during onboarding."
              />

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <ReadOnlyField label="Full Name" value={name} />
                <ReadOnlyField label="Email Address" value={profile?.email} />
                <ReadOnlyField label="Phone Number" value={profile?.phone} />
                <ReadOnlyField label="Bar Council ID" value={profile?.barCouncilId} />
              </div>
            </section>

            {/* PROFESSIONAL DETAILS */}
            <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
              <SectionHeader
                Icon={BriefcaseBusiness}
                title="Professional Experience & Practice"
                description="Update your years of experience, handled cases, and specialized practice courts."
              />

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field
                  label="Experience (Years)"
                  required
                  needsApproval={isApprovalField("experienceYears")}
                  pendingHint={
                    requestedChanges.experienceYears !== undefined
                      ? `Pending: ${requestedChanges.experienceYears} yrs (Current: ${profile?.experienceYears || 0} yrs)`
                      : null
                  }
                  error={errors.experienceYears}
                  hint="Integer between 0 and 80 years."
                >
                  <input
                    type="number"
                    min="0"
                    max="80"
                    disabled={isSubmitted && isApprovalField("experienceYears")}
                    value={form.experienceYears}
                    onChange={(e) => handleChange("experienceYears", e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                  />
                </Field>

                <Field
                  label="Cases Handled"
                  required
                  error={errors.casesHandled}
                  hint="Integer between 0 and 100,000."
                >
                  <input
                    type="number"
                    min="0"
                    max="100000"
                    value={form.casesHandled}
                    onChange={(e) => handleChange("casesHandled", e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </Field>

                <Field
                  label="Best Practice Area"
                  required
                  error={errors.bestPracticeArea}
                  hint="Primary specialization (e.g. Criminal Law)."
                >
                  <input
                    type="text"
                    maxLength={100}
                    value={form.bestPracticeArea}
                    onChange={(e) => handleChange("bestPracticeArea", e.target.value)}
                    placeholder="Criminal Law"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </Field>

                <Field
                  label="Top Court Practised"
                  error={errors.topCourtPractised}
                  hint="Highest or most frequent court."
                >
                  <input
                    type="text"
                    maxLength={100}
                    value={form.topCourtPractised}
                    onChange={(e) => handleChange("topCourtPractised", e.target.value)}
                    placeholder="Delhi High Court"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field
                    label="Practice Areas"
                    required
                    error={errors.practiceAreas}
                    hint="Separate multiple practice areas with commas (maximum 20)."
                  >
                    <input
                      type="text"
                      value={form.practiceAreas}
                      onChange={(e) => handleChange("practiceAreas", e.target.value)}
                      placeholder="Criminal Law, Civil Law, Corporate Law"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                    />
                    {practiceAreas.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {practiceAreas.map((area, idx) => (
                          <span
                            key={`${area}-${idx}`}
                            className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    )}
                  </Field>
                </div>

                <div className="sm:col-span-2">
                  <Field
                    label="Courts of Practice"
                    error={errors.courtPractice}
                    hint="Courts where you actively appear, separated by commas."
                  >
                    <input
                      type="text"
                      value={form.courtPractice}
                      onChange={(e) => handleChange("courtPractice", e.target.value)}
                      placeholder="Supreme Court of India, Delhi High Court, Tis Hazari District Court"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                    />
                    {courts.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {courts.map((court, idx) => (
                          <span
                            key={`${court}-${idx}`}
                            className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700"
                          >
                            {court}
                          </span>
                        ))}
                      </div>
                    )}
                  </Field>
                </div>
              </div>
            </section>

            {/* PROFESSIONAL BIOGRAPHY */}
            <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
              <SectionHeader
                Icon={Gavel}
                title="Professional Biography"
                description="Describe your practice, notable achievements, and experience (50 to 500 words)."
              />

              <div className="mt-6">
                <Field
                  label="About You / Bio"
                  required
                  needsApproval={isApprovalField("about")}
                  pendingHint={
                    requestedChanges.about !== undefined
                      ? `Pending updated bio: "${requestedChanges.about.slice(0, 80)}..." (Current: ${countWords(profile?.about)} words)`
                      : null
                  }
                  error={errors.about}
                  hint={`${aboutWordCount} words (Minimum 50, maximum 500 words)`}
                >
                  <textarea
                    rows={6}
                    disabled={isSubmitted && isApprovalField("about")}
                    value={form.about}
                    onChange={(e) => handleChange("about", e.target.value)}
                    placeholder="Write a comprehensive overview of your legal background, major cases, and legal consultation philosophy..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium leading-6 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                  />
                </Field>
              </div>
            </section>

            {/* CONSULTATION PRICING */}
            <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
              <SectionHeader
                Icon={IndianRupee}
                title="Consultation Pricing"
                description="Set your rates for video, voice, and offline chamber visits."
              />

              <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/80 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                <span>
                  <strong>Notice on consultation fees:</strong> New fees apply to bookings made after admin approval. Existing bookings and active client booking quotes retain current live rates until approved.
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Field
                  label="Video Call (₹ / min)"
                  needsApproval={isApprovalField("videoCallChargePerMinute")}
                  pendingHint={
                    requestedChanges.videoCallChargePerMinute !== undefined
                      ? `Pending: ₹${requestedChanges.videoCallChargePerMinute}/min (Current: ₹${profile?.videoCallChargePerMinute || 0}/min)`
                      : null
                  }
                  error={errors.videoCallChargePerMinute}
                >
                  <MoneyInput
                    disabled={isSubmitted && isApprovalField("videoCallChargePerMinute")}
                    value={form.videoCallChargePerMinute}
                    onChange={(val) => handleChange("videoCallChargePerMinute", val)}
                  />
                </Field>

                <Field
                  label="Voice Call (₹ / min)"
                  needsApproval={isApprovalField("voiceCallChargePerMinute")}
                  pendingHint={
                    requestedChanges.voiceCallChargePerMinute !== undefined
                      ? `Pending: ₹${requestedChanges.voiceCallChargePerMinute}/min (Current: ₹${profile?.voiceCallChargePerMinute || 0}/min)`
                      : null
                  }
                  error={errors.voiceCallChargePerMinute}
                >
                  <MoneyInput
                    disabled={isSubmitted && isApprovalField("voiceCallChargePerMinute")}
                    value={form.voiceCallChargePerMinute}
                    onChange={(val) => handleChange("voiceCallChargePerMinute", val)}
                  />
                </Field>

                <Field
                  label="Office Visit (₹ flat)"
                  needsApproval={isApprovalField("offlineVisitingFee")}
                  pendingHint={
                    requestedChanges.offlineVisitingFee !== undefined
                      ? `Pending: ₹${requestedChanges.offlineVisitingFee} (Current: ₹${profile?.offlineVisitingFee || 0})`
                      : null
                  }
                  error={errors.offlineVisitingFee}
                >
                  <MoneyInput
                    disabled={isSubmitted && isApprovalField("offlineVisitingFee")}
                    value={form.offlineVisitingFee}
                    onChange={(val) => handleChange("offlineVisitingFee", val)}
                  />
                </Field>
              </div>
            </section>

            {/* OFFICE LOCATION & ADDRESS */}
            <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
              <SectionHeader
                Icon={Building2}
                title="Office Chamber & GPS Location"
                description="Accurate office details and camera-captured chamber photo for client navigation."
              />

              <div className="mt-6 space-y-5">
                {/* Office Address Textarea */}
                <Field
                  label="Office address"
                  needsApproval={isApprovalField("officeAddress")}
                  pendingHint={
                    requestedChanges.officeAddress !== undefined
                      ? `Pending: "${requestedChanges.officeAddress}" (Current: "${profile?.officeAddress || "Not set"}")`
                      : null
                  }
                  error={errors.officeAddress}
                  hint={`${cleanText(form.officeAddress).length}/500 characters (min 10 characters)`}
                >
                  <textarea
                    rows={3}
                    maxLength={500}
                    disabled={isSubmitted && isApprovalField("officeAddress")}
                    value={form.officeAddress}
                    onChange={(e) => handleChange("officeAddress", e.target.value)}
                    placeholder="Chamber 204, Second Floor, High Court Complex, Sector 1"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium leading-6 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                  />
                </Field>

                {/* Pincode, City, State */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <Field
                    label="Pincode"
                    needsApproval={isApprovalField("pincode")}
                    pendingHint={
                      requestedChanges.pincode !== undefined
                        ? `Pending: ${requestedChanges.pincode} (Current: ${profile?.pincode || "None"})`
                        : null
                    }
                    error={errors.pincode}
                    hint={
                      pincodeLoading
                        ? "Looking up area details..."
                        : pincodeNotice || "6-digit postal code"
                    }
                  >
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        disabled={isSubmitted && isApprovalField("pincode")}
                        value={form.pincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        placeholder="110001"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                      />
                      {pincodeLoading && (
                        <Loader2
                          size={16}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-amber-600"
                        />
                      )}
                    </div>
                  </Field>

                  <Field
                    label="City / District"
                    needsApproval={isApprovalField("city")}
                    pendingHint={
                      requestedChanges.city !== undefined
                        ? `Pending: ${requestedChanges.city} (Current: ${profile?.city || "None"})`
                        : null
                    }
                  >
                    <input
                      type="text"
                      disabled={isSubmitted && isApprovalField("city")}
                      value={form.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="New Delhi"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                    />
                  </Field>

                  <Field
                    label="State"
                    needsApproval={isApprovalField("state")}
                    pendingHint={
                      requestedChanges.state !== undefined
                        ? `Pending: ${requestedChanges.state} (Current: ${profile?.state || "None"})`
                        : null
                    }
                  >
                    <input
                      type="text"
                      disabled={isSubmitted && isApprovalField("state")}
                      value={form.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      placeholder="Delhi"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                    />
                  </Field>
                </div>

                {/* Office Location Picker (GPS Pin) */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2 flex-wrap">
                    <label className="block text-xs font-extrabold text-slate-700">
                      Draggable GPS Map Pin
                    </label>
                    {isApprovalField("officeLatitude") && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 border border-amber-200/90 shadow-2xs">
                        <ShieldCheck className="w-3 h-3 text-amber-600" />
                        Needs admin approval
                      </span>
                    )}
                  </div>

                  {requestedChanges.officeLatitude !== undefined && (
                    <div className="mb-2 flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/80 px-2.5 py-1.5 text-xs text-amber-900">
                      <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      <span>
                        Pending pin: {Number(requestedChanges.officeLatitude).toFixed(5)},{" "}
                        {Number(requestedChanges.officeLongitude).toFixed(5)}
                      </span>
                    </div>
                  )}

                  <div className={isSubmitted && isApprovalField("officeLatitude") ? "pointer-events-none opacity-60" : ""}>
                    <OfficeLocationPicker
                      initialLatitude={form.officeLatitude}
                      initialLongitude={form.officeLongitude}
                      onChange={({ latitude, longitude }) => {
                        handleChange("officeLatitude", latitude);
                        handleChange("officeLongitude", longitude);
                      }}
                      showSaveButton={false}
                    />
                  </div>
                </div>

                {/* Live Office Chamber Photo */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700">
                        Live Office Chamber Photo
                      </label>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Camera-captured photograph of your office entrance and nameplate.
                      </p>
                    </div>
                    {isApprovalField("officePhoto") && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 border border-amber-200/90 shadow-2xs">
                        <ShieldCheck className="w-3 h-3 text-amber-600" />
                        Needs admin approval
                      </span>
                    )}
                  </div>

                  {requestedChanges.officePhotoUrl && (
                    <div className="mb-3 flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/80 px-2.5 py-1.5 text-xs text-amber-900">
                      <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      <span>A new chamber photo has been submitted and is awaiting approval.</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {officePhotoPreview ? (
                      <div className="relative group rounded-2xl overflow-hidden border border-slate-200 w-44 h-28 bg-slate-100 shrink-0">
                        <img
                          src={officePhotoPreview}
                          alt="Office Chamber"
                          className="w-full h-full object-cover"
                        />
                        {officePhotoBlob && (
                          <div className="absolute top-1.5 right-1.5 rounded-md bg-emerald-600 text-white px-1.5 py-0.5 text-[10px] font-bold">
                            New Still
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 w-44 h-28 bg-slate-50 text-slate-400 shrink-0">
                        <Building2 className="w-8 h-8 text-slate-300 mb-1" />
                        <span className="text-[11px] font-medium">No photo set</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <button
                        type="button"
                        disabled={isSubmitted && isApprovalField("officePhoto")}
                        onClick={() => setIsCameraOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Camera size={14} className="text-amber-400" />
                        {officePhotoPreview ? "Retake Live Office Photo" : "Capture Live Office Photo"}
                      </button>
                      <p className="text-[11px] text-slate-400">
                        Direct camera access ensures client transparency.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>


            {/* LANGUAGES */}
            <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
              <SectionHeader
                Icon={Languages}
                title="Languages"
                description="Languages spoken during consultations (updates live immediately)."
              />

              <div className="mt-6">
                <Field
                  label="Languages Spoken"
                  hint="Type a language and press Space to add the next language."
                >
                  <input
                    type="text"
                    value={form.languagesSpoken}
                    onChange={(e) => handleChange("languagesSpoken", e.target.value)}
                    onKeyDown={handleLanguageKeyDown}
                    placeholder="Hindi English Punjabi"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />

                  {languages.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {languages.map((language, idx) => (
                        <span
                          key={`${language}-${idx}`}
                          className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  )}
                </Field>
              </div>
            </section>
          </div>

          {/* ==================== RIGHT SIDEBAR ==================== */}
          <aside className="space-y-5 xl:sticky xl:top-6 xl:col-span-4">
            {/* PROFILE PHOTO CARD */}
            <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[16px] font-extrabold text-slate-950">
                  Profile Photo
                </h2>
                {isApprovalField("profilePhoto") && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 border border-amber-200/90 shadow-2xs">
                    Needs approval
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-slate-500">
                JPG, JPEG, PNG or WEBP (Max 5 MB).
              </p>

              {requestedChanges.profilePhotoUrl && (
                <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/80 px-2.5 py-1.5 text-xs text-amber-900">
                  <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>New profile photo pending admin approval.</span>
                </div>
              )}

              <div className="mt-6 flex flex-col items-center text-center">
                <div className="relative">
                  {previewPhoto ? (
                    <img
                      src={previewPhoto}
                      alt={name}
                      className="h-28 w-28 rounded-[26px] object-cover ring-4 ring-slate-100 shadow-sm"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-[26px] border border-amber-200 bg-amber-50 text-xl font-extrabold text-amber-700">
                      {getInitials(name)}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isSubmitted && isApprovalField("profilePhoto")}
                    onClick={() => fileInputRef.current?.click()}
                    title="Change profile photo"
                    className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera size={17} />
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />

                {profilePhotoFile && (
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <Check size={13} />
                    New photo selected
                  </span>
                )}
              </div>
            </section>

            {/* SAVE ACTIONS CARD */}
            <section className="rounded-[26px] bg-slate-950 p-5 text-white shadow-[0_16px_45px_rgba(15,23,42,0.16)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                <Save size={18} />
              </div>

              <h2 className="mt-4 text-base font-extrabold">Save Profile</h2>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Direct fields update live immediately. Sensitive fields diff against your approved profile and are saved to draft for admin review.
              </p>

              {dirty ? (
                <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2.5 text-xs font-bold text-amber-300">
                  You have unsaved changes in this form.
                </div>
              ) : isSubmitted ? (
                <div className="mt-4 rounded-xl border border-blue-400/20 bg-blue-500/10 px-3 py-2.5 text-xs font-bold text-blue-300">
                  Changes submitted for admin approval.
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2.5 text-xs font-bold text-emerald-300">
                  Profile form is up to date.
                </div>
              )}

              {/* MAIN SAVE BUTTON */}
              <button
                type="submit"
                disabled={saving || !dirty || isAboutInvalid || isSubmitted}
                className="mt-5 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-extrabold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : isSubmitted ? (
                  <>
                    <ShieldCheck size={16} />
                    Under Review (Locked)
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>

              {/* REQUEST FOR APPROVAL (IF DRAFT OR REJECTED) */}
              {isApproved && (profileChange?.status === "DRAFT" || profileChange?.status === "REJECTED") && (
                <button
                  type="button"
                  disabled={actionLoading || saving}
                  onClick={handleRequestApproval}
                  className="mt-2.5 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/15 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                  {profileChange.status === "REJECTED" ? "Submit Again for Approval" : "Request Admin Approval"}
                </button>
              )}

              {/* WITHDRAW BUTTON (IF SUBMITTED) */}
              {isSubmitted && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleWithdraw}
                  className="mt-2.5 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 text-xs font-bold text-white hover:bg-white/20 transition disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <RotateCcw size={15} />
                  )}
                  Withdraw Request to Edit
                </button>
              )}

              {/* RESET FORM */}
              <button
                type="button"
                disabled={!dirty || saving}
                onClick={() => {
                  setForm(initialForm);
                  setErrors({});
                  setPageError("");
                  setProfilePhotoFile(null);
                  setOfficePhotoBlob(null);
                }}
                className="mt-2 inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl border border-white/10 text-xs font-bold text-slate-300 transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X size={14} />
                Reset Changes
              </button>
            </section>

            {/* SECURITY NOTICE */}
            <section className="flex items-start gap-3 rounded-[22px] border border-blue-100 bg-blue-50/60 p-4">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-blue-600" />
              <div>
                <p className="text-xs font-extrabold text-blue-900">
                  Protected Profile Updates
                </p>
                <p className="mt-1 text-xs leading-5 text-blue-700">
                  Sensitive updates undergo administrative review before client pricing and office chamber coordinates update live on public listings.
                </p>
              </div>
            </section>
          </aside>
        </form>
      </div>

      {/* =====================================================
          DISCARD MODAL
      ===================================================== */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertCircle size={24} />
            </div>
            <h3 className="mt-4 text-lg font-extrabold text-slate-950">
              Discard all pending changes?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              This will discard all unapproved edits made to your sensitive profile fields and revert to your currently live profile. Any temporary photos will be removed.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Keep Changes
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmDiscard}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 transition disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          LIVE CAMERA MODAL
      ===================================================== */}
      <LiveCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCaptured={(blob, dataUrl) => {
          setOfficePhotoBlob(blob);
          setOfficePhotoPreview(dataUrl);
          setIsCameraOpen(false);
          setSuccess("New office chamber photo captured. Click 'Save Changes' or 'Request for approval' to submit.");
        }}
        allowFallback={true}
      />
    </main>
  );
}

/* =========================================================================
   SMALL PRESENTATIONAL COMPONENTS
============================================================================ */

function SectionHeader({ Icon, title, description }) {
  void Icon;
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
        <Icon size={18} />
      </div>

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
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-extrabold text-slate-700">
        {label}
      </label>

      <input
        type="text"
        value={cleanText(value)}
        disabled
        className="h-12 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-500"
      />
    </div>
  );
}

function MoneyInput({ value, onChange, disabled }) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-400">
        ₹
      </span>

      <input
        type="number"
        min="0"
        step="1"
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
      />
    </div>
  );
}