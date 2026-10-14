import { useEffect, useMemo, useState } from "react";
import Card from "@shared/components/ui/Card";
import { Button, Icon } from "@shared/components/ui/Button";
import { FormField } from "@shared/components/ui/FormControls";
import { fieldClass } from "@shared/components/ui/styles";
import {
  getPracticeAreas,
  getCourts,
  updateAdvocateProfile,
} from "../../../services/platform/adminAdvocatesApi";
import { countWords } from "../../../utils/adminUtils";

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

const DEFAULT_PRACTICE_AREAS = [
  "Criminal Law",
  "Civil Law",
  "Family Law",
  "Constitutional Law",
  "Corporate Law",
  "Intellectual Property",
  "Labor Law",
  "Tax Law",
  "Real Estate Law",
  "Environmental Law",
];

const DEFAULT_COURTS = [
  "Supreme Court of India",
  "Delhi High Court",
  "Bombay High Court",
  "Calcutta High Court",
  "Madras High Court",
  "Allahabad High Court",
  "Patna High Court",
  "Karnataka High Court",
  "Gujarat High Court",
  "Rajasthan High Court",
];

export default function AdvocateProfileEditDrawer({
  open,
  advocate,
  onClose,
  onSaved,
  onForbidden,
  onNotFound,
}) {
  const [formState, setFormState] = useState({});
  const [practiceAreaOptions, setPracticeAreaOptions] = useState(DEFAULT_PRACTICE_AREAS);
  const [courtOptions, setCourtOptions] = useState(DEFAULT_COURTS);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [bannerError, setBannerError] = useState("");

  // Tag input temp strings
  const [courtTagInput, setCourtTagInput] = useState("");
  const [langTagInput, setLangTagInput] = useState("");

  // Load practice areas & courts options
  useEffect(() => {
    let cancelled = false;
    async function fetchOptions() {
      try {
        const [pAreas, courts] = await Promise.all([
          getPracticeAreas(),
          getCourts(),
        ]);
        if (!cancelled) {
          if (Array.isArray(pAreas) && pAreas.length > 0) {
            setPracticeAreaOptions(pAreas.map((p) => (typeof p === "string" ? p : p.name || p.id)));
          }
          if (Array.isArray(courts) && courts.length > 0) {
            setCourtOptions(courts.map((c) => (typeof c === "string" ? c : c.name || c.id)));
          }
        }
      } catch {
        // Fallback options already set
      }
    }
    fetchOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  // Initialize form state whenever advocate or open changes
  useEffect(() => {
    if (!advocate || !open) return;
    setFormState({
      fullName: advocate.fullName || advocate.name || "",
      gender: advocate.gender || "",
      barCouncilId: advocate.barCouncilId || advocate.barId || "",
      experienceYears:
        advocate.experienceYears !== null && advocate.experienceYears !== undefined
          ? String(advocate.experienceYears)
          : advocate.experience !== null && advocate.experience !== undefined
            ? String(advocate.experience)
            : "",
      casesHandled:
        advocate.casesHandled !== null && advocate.casesHandled !== undefined
          ? String(advocate.casesHandled)
          : "",
      practiceAreas: Array.isArray(advocate.practiceAreas)
        ? advocate.practiceAreas
        : advocate.bestPracticeArea || advocate.lawType
          ? [advocate.bestPracticeArea || advocate.lawType]
          : [],
      bestPracticeArea: advocate.bestPracticeArea || advocate.lawType || "",
      topCourtPractised: advocate.topCourtPractised || "",
      courtPractice: Array.isArray(advocate.courtPractice) ? advocate.courtPractice : [],
      about: advocate.about || advocate.bio || "",
      languagesSpoken: Array.isArray(advocate.languagesSpoken)
        ? advocate.languagesSpoken
        : ["English"],
      completeAddress: advocate.completeAddress || "",
      state: advocate.state || "",
      city: advocate.city || "",
      pincode: advocate.pincode || "",
      videoCallChargePerMinute:
        advocate.videoCallChargePerMinute !== null && advocate.videoCallChargePerMinute !== undefined
          ? String(advocate.videoCallChargePerMinute)
          : "",
      voiceCallChargePerMinute:
        advocate.voiceCallChargePerMinute !== null && advocate.voiceCallChargePerMinute !== undefined
          ? String(advocate.voiceCallChargePerMinute)
          : "",
      offlineVisitingFee:
        advocate.offlineVisitingFee !== null && advocate.offlineVisitingFee !== undefined
          ? String(advocate.offlineVisitingFee)
          : "",
    });
    setFieldErrors({});
    setBannerError("");
    setCourtTagInput("");
    setLangTagInput("");
  }, [advocate, open]);

  // Compute diff against original loaded record
  const diff = useMemo(() => {
    if (!advocate) return {};
    const patch = {};

    // String fields
    const textFields = [
      "fullName",
      "gender",
      "barCouncilId",
      "bestPracticeArea",
      "topCourtPractised",
      "completeAddress",
      "state",
      "city",
      "pincode",
    ];
    textFields.forEach((key) => {
      const origVal = (advocate[key] ?? "").trim();
      const currVal = (formState[key] ?? "").trim();
      if (currVal !== origVal) {
        patch[key] = currVal;
      }
    });

    // Bio / About
    const origAbout = (advocate.about ?? advocate.bio ?? "").trim();
    const currAbout = (formState.about ?? "").trim();
    if (currAbout !== origAbout) {
      patch.about = currAbout;
    }

    // Integer fields: experienceYears, casesHandled
    const intFields = ["experienceYears", "casesHandled"];
    intFields.forEach((key) => {
      const origRaw = advocate[key] ?? (key === "experienceYears" ? advocate.experience : null);
      const origVal =
        origRaw !== null && origRaw !== undefined && String(origRaw).trim() !== ""
          ? parseInt(origRaw, 10)
          : null;
      const currRaw = formState[key];
      const currVal =
        currRaw !== null && currRaw !== undefined && String(currRaw).trim() !== ""
          ? parseInt(currRaw, 10)
          : null;
      if (currVal !== origVal && currVal !== null) {
        patch[key] = currVal;
      }
    });

    // Number fields: fees
    const feeFields = [
      "videoCallChargePerMinute",
      "voiceCallChargePerMinute",
      "offlineVisitingFee",
    ];
    feeFields.forEach((key) => {
      const origRaw = advocate[key];
      const origVal =
        origRaw !== null && origRaw !== undefined && String(origRaw).trim() !== ""
          ? parseFloat(origRaw)
          : null;
      const currRaw = formState[key];
      const currVal =
        currRaw !== null && currRaw !== undefined && String(currRaw).trim() !== ""
          ? parseFloat(currRaw)
          : null;
      if (currVal !== origVal && currVal !== null) {
        patch[key] = currVal;
      }
    });

    // Array fields
    const arrayFields = ["practiceAreas", "courtPractice", "languagesSpoken"];
    arrayFields.forEach((key) => {
      const origArr = Array.isArray(advocate[key])
        ? advocate[key].map((s) => String(s).trim()).filter(Boolean)
        : [];
      const currArr = Array.isArray(formState[key])
        ? formState[key].map((s) => String(s).trim()).filter(Boolean)
        : [];
      const isDiff =
        origArr.length !== currArr.length ||
        origArr.some((item, idx) => item !== currArr[idx]);
      if (isDiff) {
        patch[key] = currArr;
      }
    });

    return patch;
  }, [advocate, formState]);

  const hasChanges = Object.keys(diff).length > 0;

  // Bio word count validation
  const bioWords = countWords(formState.about);
  const isBioInvalid = bioWords < 50 || bioWords > 500;
  const bioErrorMessage = isBioInvalid
    ? bioWords < 50
      ? `Bio must contain at least 50 words (currently ${bioWords}).`
      : `Bio cannot exceed 500 words (currently ${bioWords}).`
    : "";

  // Pincode validation: exactly 6 digits
  const pincodeTrimmed = (formState.pincode || "").trim();
  const isPincodeInvalid = pincodeTrimmed ? !/^\d{6}$/.test(pincodeTrimmed) : false;
  const pincodeError = isPincodeInvalid ? "Pincode must be exactly 6 digits." : "";

  // Can save check
  const isSaveDisabled =
    !hasChanges ||
    isBioInvalid ||
    isPincodeInvalid ||
    saving;

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleTogglePracticeArea = (area) => {
    setFormState((prev) => {
      const current = prev.practiceAreas || [];
      const exists = current.includes(area);
      let updated;
      if (exists) {
        updated = current.filter((a) => a !== area);
      } else {
        if (current.length >= 20) return prev;
        updated = [...current, area];
      }
      return {
        ...prev,
        practiceAreas: updated,
        bestPracticeArea:
          prev.bestPracticeArea === area && exists
            ? updated[0] || ""
            : prev.bestPracticeArea || (updated[0] || ""),
      };
    });
  };

  const handleAddCourt = (court) => {
    const val = String(court || courtTagInput).trim();
    if (!val) return;
    setFormState((prev) => {
      const current = prev.courtPractice || [];
      if (current.includes(val)) return prev;
      return { ...prev, courtPractice: [...current, val] };
    });
    setCourtTagInput("");
  };

  const handleRemoveCourt = (court) => {
    setFormState((prev) => ({
      ...prev,
      courtPractice: (prev.courtPractice || []).filter((c) => c !== court),
    }));
  };

  const handleAddLanguage = (lang) => {
    const val = String(lang || langTagInput).trim();
    if (!val) return;
    setFormState((prev) => {
      const current = prev.languagesSpoken || [];
      if (current.includes(val)) return prev;
      return { ...prev, languagesSpoken: [...current, val] };
    });
    setLangTagInput("");
  };

  const handleRemoveLanguage = (lang) => {
    setFormState((prev) => ({
      ...prev,
      languagesSpoken: (prev.languagesSpoken || []).filter((l) => l !== lang),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaveDisabled) return;

    setSaving(true);
    setFieldErrors({});
    setBannerError("");

    try {
      const result = await updateAdvocateProfile(advocate.id, diff);
      if (onSaved) {
        onSaved(result);
      }
    } catch (err) {
      if (err.status === 404) {
        if (onNotFound) onNotFound(err);
        return;
      }
      if (err.status === 403) {
        if (onForbidden) onForbidden(err);
        return;
      }
      if (err.status === 400) {
        const errors = { ...err.fieldErrors };
        if (err.message?.includes("Bar Council ID is already registered")) {
          errors.barCouncilId = err.message;
        }
        setFieldErrors(errors);
        if (Object.keys(errors).length === 0) {
          setBannerError(err.message || "Failed to update profile.");
        }
        return;
      }
      setBannerError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/80">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Edit Advocate Profile</h2>
              <p className="text-xs text-slate-500">
                Fix or update profile details for {advocate?.fullName || advocate?.name || "Advocate"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Close drawer"
            >
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>

          {/* Form Body */}
          <form id="advocate-edit-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {bannerError ? (
              <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
                <Icon name="error" className="text-[18px] text-red-600 shrink-0" />
                <span>{bannerError}</span>
              </div>
            ) : null}

            {/* Read-Only System Identity Section */}
            <Card className="p-4 bg-slate-50/60 border border-slate-200/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Icon name="lock" className="text-[14px]" /> Read-Only System Fields
                </span>
                <span className="text-[11px] font-medium text-slate-400">Not editable by policy</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Email:</span>
                  <p className="font-medium text-slate-700 truncate">{advocate?.email || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-400">Phone:</span>
                  <p className="font-medium text-slate-700 truncate">{advocate?.phone || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-400">Approval Status:</span>
                  <p className="font-semibold text-slate-800">{advocate?.approvalStatus || "PENDING"}</p>
                </div>
                <div>
                  <span className="text-slate-400">Account Status:</span>
                  <p className="font-semibold text-slate-800">{advocate?.accountStatus || advocate?.status || "ACTIVE"}</p>
                </div>
                <div>
                  <span className="text-slate-400">Aadhaar Status:</span>
                  <p className="text-slate-700">{advocate?.aadhaarVerified ? "Verified" : "Unverified"}</p>
                </div>
                <div>
                  <span className="text-slate-400">Call Availability:</span>
                  <p className="text-slate-700">{advocate?.callAvailability ? "Enabled" : "Disabled"}</p>
                </div>
              </div>
            </Card>

            {/* Personal & Bar Credentials */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Personal & Bar Credentials
              </h3>

              <FormField
                id="edit-fullName"
                label="Full Name"
                required
                error={fieldErrors.fullName}
              >
                <input
                  id="edit-fullName"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={formState.fullName || ""}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className={fieldClass(Boolean(fieldErrors.fullName))}
                  placeholder="e.g. Adv. Rajesh Sharma"
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  id="edit-gender"
                  label="Gender"
                  error={fieldErrors.gender}
                >
                  <select
                    id="edit-gender"
                    value={formState.gender || ""}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className={fieldClass(Boolean(fieldErrors.gender))}
                  >
                    <option value="">Select Gender</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  id="edit-barCouncilId"
                  label="Bar Council ID"
                  required
                  error={fieldErrors.barCouncilId}
                >
                  <input
                    id="edit-barCouncilId"
                    type="text"
                    required
                    minLength={3}
                    maxLength={50}
                    value={formState.barCouncilId || ""}
                    onChange={(e) => handleChange("barCouncilId", e.target.value)}
                    className={`${fieldClass(Boolean(fieldErrors.barCouncilId))} font-mono`}
                    placeholder="e.g. D/1234/2018"
                  />
                </FormField>
              </div>
            </div>

            {/* Practice Experience */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Experience & Practice
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  id="edit-experienceYears"
                  label="Experience (Years)"
                  error={fieldErrors.experienceYears}
                >
                  <input
                    id="edit-experienceYears"
                    type="number"
                    min={0}
                    max={80}
                    value={formState.experienceYears ?? ""}
                    onChange={(e) => handleChange("experienceYears", e.target.value)}
                    className={fieldClass(Boolean(fieldErrors.experienceYears))}
                    placeholder="0–80"
                  />
                </FormField>

                <FormField
                  id="edit-casesHandled"
                  label="Cases Handled"
                  error={fieldErrors.casesHandled}
                >
                  <input
                    id="edit-casesHandled"
                    type="number"
                    min={0}
                    max={100000}
                    value={formState.casesHandled ?? ""}
                    onChange={(e) => handleChange("casesHandled", e.target.value)}
                    className={fieldClass(Boolean(fieldErrors.casesHandled))}
                    placeholder="0–100000"
                  />
                </FormField>
              </div>

              {/* Practice Areas Multi-Select */}
              <FormField
                id="edit-practiceAreas"
                label="Practice Areas"
                hint="Select 1 to 20 practice areas"
                error={fieldErrors.practiceAreas}
              >
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 max-h-44 overflow-y-auto">
                  {practiceAreaOptions.map((area) => {
                    const selected = (formState.practiceAreas || []).includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => handleTogglePracticeArea(area)}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                          selected
                            ? "bg-amber-500 text-slate-950 font-semibold shadow-sm"
                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {selected ? <Icon name="check" className="text-[14px]" /> : null}
                        {area}
                      </button>
                    );
                  })}
                </div>
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  id="edit-bestPracticeArea"
                  label="Primary Practice Area"
                  error={fieldErrors.bestPracticeArea}
                >
                  <input
                    id="edit-bestPracticeArea"
                    type="text"
                    maxLength={100}
                    value={formState.bestPracticeArea || ""}
                    onChange={(e) => handleChange("bestPracticeArea", e.target.value)}
                    className={fieldClass(Boolean(fieldErrors.bestPracticeArea))}
                    placeholder="e.g. Criminal Law"
                  />
                </FormField>

                <FormField
                  id="edit-topCourtPractised"
                  label="Top Court Practised"
                  error={fieldErrors.topCourtPractised}
                >
                  <select
                    id="edit-topCourtPractised"
                    value={formState.topCourtPractised || ""}
                    onChange={(e) => handleChange("topCourtPractised", e.target.value)}
                    className={fieldClass(Boolean(fieldErrors.topCourtPractised))}
                  >
                    <option value="">Select Top Court</option>
                    {courtOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              {/* Court Practice Tags */}
              <FormField
                id="edit-courtPractice"
                label="Court Practice (All Courts)"
                hint="Add courts practiced at"
                error={fieldErrors.courtPractice}
              >
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      id="edit-courtPractice-input"
                      type="text"
                      value={courtTagInput}
                      onChange={(e) => setCourtTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          handleAddCourt();
                        }
                      }}
                      placeholder="Type court name and press Add"
                      className={fieldClass(false)}
                    />
                    <Button type="button" variant="secondary" onClick={() => handleAddCourt()}>
                      Add
                    </Button>
                  </div>
                  {(formState.courtPractice || []).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {formState.courtPractice.map((court) => (
                        <span
                          key={court}
                          className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-800"
                        >
                          {court}
                          <button
                            type="button"
                            onClick={() => handleRemoveCourt(court)}
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Icon name="close" className="text-[12px]" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </FormField>

              {/* Languages Spoken */}
              <FormField
                id="edit-languagesSpoken"
                label="Languages Spoken"
                hint="e.g. English, Hindi"
                error={fieldErrors.languagesSpoken}
              >
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      id="edit-languagesSpoken-input"
                      type="text"
                      value={langTagInput}
                      onChange={(e) => setLangTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          handleAddLanguage();
                        }
                      }}
                      placeholder="Type language and press Add"
                      className={fieldClass(false)}
                    />
                    <Button type="button" variant="secondary" onClick={() => handleAddLanguage()}>
                      Add
                    </Button>
                  </div>
                  {(formState.languagesSpoken || []).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {formState.languagesSpoken.map((lang) => (
                        <span
                          key={lang}
                          className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-1 text-xs font-medium text-amber-900"
                        >
                          {lang}
                          <button
                            type="button"
                            onClick={() => handleRemoveLanguage(lang)}
                            className="text-amber-600 hover:text-red-600"
                          >
                            <Icon name="close" className="text-[12px]" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </FormField>
            </div>

            {/* Biography & Live Word Counter */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Professional Bio (50–500 Words)
              </h3>

              <FormField
                id="edit-about"
                label="About / Bio"
                required
                counter={
                  <span
                    aria-live="polite"
                    className={`text-xs tabular-nums font-semibold ${
                      isBioInvalid ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {bioWords} / 50–500 words
                  </span>
                }
                error={bioErrorMessage || fieldErrors.about}
              >
                <textarea
                  id="edit-about"
                  rows={6}
                  required
                  value={formState.about || ""}
                  onChange={(e) => handleChange("about", e.target.value)}
                  className={fieldClass(Boolean(isBioInvalid || fieldErrors.about))}
                  placeholder="Provide an overview of professional experience, bar admissions, areas of law, and notable background (minimum 50 words)..."
                />
              </FormField>
            </div>

            {/* Location & Address */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Location & Office Address
              </h3>

              <FormField
                id="edit-completeAddress"
                label="Complete Office Address"
                error={fieldErrors.completeAddress}
              >
                <input
                  id="edit-completeAddress"
                  type="text"
                  maxLength={500}
                  value={formState.completeAddress || ""}
                  onChange={(e) => handleChange("completeAddress", e.target.value)}
                  className={fieldClass(Boolean(fieldErrors.completeAddress))}
                  placeholder="Chamber No, Court Complex / Office Address"
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  id="edit-city"
                  label="City"
                  error={fieldErrors.city}
                >
                  <input
                    id="edit-city"
                    type="text"
                    minLength={2}
                    maxLength={100}
                    value={formState.city || ""}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className={fieldClass(Boolean(fieldErrors.city))}
                    placeholder="e.g. New Delhi"
                  />
                </FormField>

                <FormField
                  id="edit-state"
                  label="State"
                  error={fieldErrors.state}
                >
                  <input
                    id="edit-state"
                    type="text"
                    minLength={2}
                    maxLength={100}
                    value={formState.state || ""}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className={fieldClass(Boolean(fieldErrors.state))}
                    placeholder="e.g. Delhi"
                  />
                </FormField>

                <FormField
                  id="edit-pincode"
                  label="Pincode"
                  error={pincodeError || fieldErrors.pincode}
                >
                  <input
                    id="edit-pincode"
                    type="text"
                    maxLength={6}
                    value={formState.pincode || ""}
                    onChange={(e) => handleChange("pincode", e.target.value)}
                    className={fieldClass(Boolean(pincodeError || fieldErrors.pincode))}
                    placeholder="6 digits"
                  />
                </FormField>
              </div>
            </div>

            {/* Consultation Fees */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Consultation Charges (₹)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  id="edit-videoCallCharge"
                  label="Video Call (₹/min)"
                  error={fieldErrors.videoCallChargePerMinute}
                >
                  <input
                    id="edit-videoCallCharge"
                    type="number"
                    min={0}
                    step="any"
                    value={formState.videoCallChargePerMinute ?? ""}
                    onChange={(e) => handleChange("videoCallChargePerMinute", e.target.value)}
                    className={fieldClass(Boolean(fieldErrors.videoCallChargePerMinute))}
                    placeholder="0"
                  />
                </FormField>

                <FormField
                  id="edit-voiceCallCharge"
                  label="Voice Call (₹/min)"
                  error={fieldErrors.voiceCallChargePerMinute}
                >
                  <input
                    id="edit-voiceCallCharge"
                    type="number"
                    min={0}
                    step="any"
                    value={formState.voiceCallChargePerMinute ?? ""}
                    onChange={(e) => handleChange("voiceCallChargePerMinute", e.target.value)}
                    className={fieldClass(Boolean(fieldErrors.voiceCallChargePerMinute))}
                    placeholder="0"
                  />
                </FormField>

                <FormField
                  id="edit-offlineVisitingFee"
                  label="In-Person Fee (₹)"
                  error={fieldErrors.offlineVisitingFee}
                >
                  <input
                    id="edit-offlineVisitingFee"
                    type="number"
                    min={0}
                    step="any"
                    value={formState.offlineVisitingFee ?? ""}
                    onChange={(e) => handleChange("offlineVisitingFee", e.target.value)}
                    className={fieldClass(Boolean(fieldErrors.offlineVisitingFee))}
                    placeholder="0"
                  />
                </FormField>
              </div>
            </div>
          </form>

          {/* Drawer Footer Actions */}
          <div className="border-t border-slate-200 bg-white p-5 shadow-lg space-y-2">
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button
                type="submit"
                form="advocate-edit-form"
                variant="primary"
                loading={saving}
                disabled={isSaveDisabled}
              >
                Save Changes
              </Button>
            </div>
            <p className="text-center text-xs text-slate-500">
              Saving does not approve the profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
