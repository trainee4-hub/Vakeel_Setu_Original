import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth";
import {
  markAdvocateProfileSynced,
  patchAdvocateProfile,
  uploadAdvocateProfilePhoto,
  validateAdvocatePhoto,
} from "../index";

import {
  getAdvocateProfileCompletion,
  isAdvocateProfileComplete,
  normalizeAdvocate,
} from "@/utils/advocateProfile";

import {
  ABOUT_MAX_WORDS,
  ABOUT_MIN_WORDS,
  buildAdvocateProfilePatch,
  buildFormStateFromAdvocate,
  countWords,
  mapServerFieldErrors,
  sameTag,
  validateAdvocateProfileForm,
} from "@/utils/advocateProfileFormUtils";

/* =========================================================================
   ADVOCATE COMPLETE PROFILE

   This page uses the advocate already synced into auth/Redux by the
   AdvocateProfileGuard.

   PATCH /advocate/profile sends only changed fields.
   ========================================================================= */

/* -------------------------------------------------------------------------
   FIELD
------------------------------------------------------------------------- */

function Field({
  label,
  required,
  error,
  hint,
  children,
}) {
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-bold text-slate-800">
          {label}

          {required && (
            <span className="ml-1 text-amber-600">
              *
            </span>
          )}
        </label>

        {hint && (
          <span className="text-xs font-medium text-slate-400">
            {hint}
          </span>
        )}
      </div>

      {children}

      {error && (
        <p className="mt-1.5 text-xs font-semibold text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
   COMMON INPUT CLASS
------------------------------------------------------------------------- */

const inputClass = (hasError) =>
  [
    "w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-slate-900",
    "outline-none transition-all placeholder:text-slate-400",
    "focus:bg-white focus:outline-none focus-visible:outline-none focus:ring-2",
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
      : "border-slate-200 focus:border-amber-500 focus:ring-amber-500/10",
  ].join(" ");

/* -------------------------------------------------------------------------
   TAG HELPERS
------------------------------------------------------------------------- */

const getTagOptions = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        String(item).trim(),
      )
      .filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) =>
      item.trim(),
    )
    .filter(Boolean);
};

/* -------------------------------------------------------------------------
   TAG INPUT

   Tags and input stay inside the same bordered container.
   No separate Add button.
------------------------------------------------------------------------- */

function TagInput({
  value = [],
  onChange,
  placeholder,
  error,
}) {
  const [draft, setDraft] = useState("");

  const tags = Array.isArray(value)
    ? value
    : getTagOptions(value);

  const add = () => {
    const entry = draft.trim();

    if (!entry) {
      return;
    }

    const alreadyExists = tags.some(
      (item) =>
        sameTag(item, entry),
    );

    if (!alreadyExists) {
      onChange([
        ...tags,
        entry,
      ]);
    }

    setDraft("");
  };

  const remove = (entry) => {
    onChange(
      tags.filter(
        (item) =>
          !sameTag(
            item,
            entry,
          ),
      ),
    );
  };

  return (
    <div
      className={[
        "flex min-h-[52px] w-full flex-wrap items-center gap-2",
        "rounded-xl border bg-white px-3 py-2",
        "transition-all duration-200",
        "focus-within:outline-none focus-within:ring-2",
        error
          ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-500/10"
          : "border-slate-200 focus-within:border-amber-500 focus-within:ring-amber-500/10",
      ].join(" ")}
    >
      {tags.map((entry) => (
        <span
          key={entry}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700"
        >
          {entry}

          <button
            type="button"
            aria-label={`Remove ${entry}`}
            onClick={() =>
              remove(entry)
            }
            className="flex items-center justify-center text-amber-500 outline-none transition-colors hover:text-amber-700 focus:outline-none focus-visible:outline-none focus-visible:ring-0"
          >
            <span className="material-symbols-outlined text-[14px]">
              close
            </span>
          </button>
        </span>
      ))}

      <input
        type="text"
        value={draft}
        placeholder={placeholder}
        onChange={(event) =>
          setDraft(
            event.target.value,
          )
        }
        onKeyDown={(event) => {
          if (
            event.key ===
            "Enter"
          ) {
            event.preventDefault();
            add();
            return;
          }

          if (
            event.key ===
            "Backspace" &&
            !draft &&
            tags.length > 0
          ) {
            remove(
              tags[
              tags.length -
              1
              ],
            );
          }
        }}
        className="min-w-[190px] flex-1 border-0 bg-transparent px-1 py-1.5 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------
   READ ONLY ROW
------------------------------------------------------------------------- */

function ReadOnlyRow({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-slate-800">
        {value || "—"}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------
   CARD
------------------------------------------------------------------------- */

function Card({
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-950">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      <div className="space-y-7">
        {children}
      </div>
    </section>
  );
}

/* =========================================================================
   COMPONENT
============================================================================ */

export default function AdvocateCompleteProfile() {
  const navigate = useNavigate();

  const {
    user,
    updateProfile,
  } = useAuth();

  /*
   * Snapshot used as PATCH diff baseline.
   */
  const originalRef =
    useRef(user);

  const [form, setForm] =
    useState(() =>
      buildFormStateFromAdvocate(
        user,
      ),
    );

  const [errors, setErrors] =
    useState({});

  const [
    submitError,
    setSubmitError,
  ] = useState(null);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    photoUploading,
    setPhotoUploading,
  ] = useState(false);

  const [
    photoError,
    setPhotoError,
  ] = useState("");

  const fileInputRef =
    useRef(null);

  /* -----------------------------------------------------------------------
     FORM DERIVED VALUES
  ----------------------------------------------------------------------- */

  const practiceAreaOptions =
    getTagOptions(
      form.practiceAreas,
    );

  const courtOptions =
    getTagOptions(
      form.courtPractice,
    );

  const aboutWordCount =
    countWords(
      form.about,
    );

  const isAboutInvalid =
    aboutWordCount <
    ABOUT_MIN_WORDS ||
    aboutWordCount >
    ABOUT_MAX_WORDS;

  /* -----------------------------------------------------------------------
     SET FIELD
  ----------------------------------------------------------------------- */

  const setField = useCallback(
    (field, value) => {
      setForm(
        (previous) => ({
          ...previous,
          [field]: value,
        }),
      );

      setErrors(
        (previous) => {
          if (
            !previous[field]
          ) {
            return previous;
          }

          const next = {
            ...previous,
          };

          delete next[field];

          return next;
        },
      );
    },
    [],
  );

  /* -----------------------------------------------------------------------
     COMPLETION
  ----------------------------------------------------------------------- */

  const completion = useMemo(
    () =>
      getAdvocateProfileCompletion({
        ...user,
        ...form,
      }),
    [user, form],
  );

  console.log(
    "PROFILE COMPLETION:",
    completion,
  );

  console.log(
    "MISSING FIELDS:",
    completion.missingFields,
  );
  /* -----------------------------------------------------------------------
     PHOTO
  ----------------------------------------------------------------------- */

  const handlePhotoSelect =
    async (event) => {
      const file =
        event.target.files?.[0];

      event.target.value = "";

      if (!file) {
        return;
      }

      const validationError =
        validateAdvocatePhoto(
          file,
        );

      setPhotoError(
        validationError,
      );

      if (validationError) {
        return;
      }

      setPhotoUploading(true);

      try {
        const {
          advocate,
        } =
          await uploadAdvocateProfilePhoto(
            file,
          );

        if (advocate) {
          const normalized =
            normalizeAdvocate(
              advocate,
            );

          originalRef.current =
            normalized;

          updateProfile(
            normalized,
          );

          markAdvocateProfileSynced();
        }
      } catch (error) {
        setPhotoError(
          error?.message ||
          "We couldn't upload your photo.",
        );
      } finally {
        setPhotoUploading(
          false,
        );
      }
    };

  /* -----------------------------------------------------------------------
     SUBMIT
  ----------------------------------------------------------------------- */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationErrors =
      validateAdvocateProfileForm(form);

    setErrors(validationErrors);
    setSubmitError(null);

    console.log(
      "SUBMIT VALIDATION:",
      validationErrors,
    );

    if (
      Object.keys(validationErrors).length > 0
    ) {
      console.log(
        "SUBMIT BLOCKED BY VALIDATION:",
        validationErrors,
      );

      return;
    }

    const payload =
      buildAdvocateProfilePatch(
        form,
        originalRef.current,
      );

    console.log(
      "PROFILE PATCH PAYLOAD:",
      payload,
    );

    /* Nothing changed, but current form is complete */
    if (
      Object.keys(payload).length === 0
    ) {
      if (
        isAdvocateProfileComplete({
          ...user,
          ...form,
        })
      ) {
        navigate(
          "/advocate/dashboard",
          { replace: true },
        );

        return;
      }

      setSubmitError(
        "Some required details are still missing. Please review the highlighted sections.",
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const advocate =
        await patchAdvocateProfile(
          payload,
        );

      /*
       * IMPORTANT:
       * Do not validate only the PATCH response.
       *
       * Some APIs return only changed fields.
       * Merge:
       * old user + current form + backend response
       */
      const normalized =
        normalizeAdvocate({
          ...user,
          ...form,
          ...(advocate || {}),
        });

      console.log(
        "SAVED ADVOCATE:",
        advocate,
      );

      console.log(
        "MERGED ADVOCATE:",
        normalized,
      );

      console.log(
        "PROFILE COMPLETE AFTER SAVE:",
        isAdvocateProfileComplete(
          normalized,
        ),
      );

      originalRef.current =
        normalized;

      updateProfile(
        normalized,
      );

      markAdvocateProfileSynced();

      if (
        isAdvocateProfileComplete(
          normalized,
        )
      ) {
        navigate(
          "/advocate/dashboard",
          { replace: true },
        );

        return;
      }

      setSubmitError(
        "Some required details are still missing. Please review the highlighted sections.",
      );
    } catch (error) {
      console.error(
        "PROFILE SAVE ERROR:",
        error,
      );

      const fieldErrors =
        mapServerFieldErrors(
          error?.data,
        );

      if (
        Object.keys(fieldErrors).length > 0
      ) {
        setErrors(
          fieldErrors,
        );
      }

      setSubmitError(
        error?.message ||
        "We couldn't save your profile. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  /* =========================================================================
     JSX
  ========================================================================= */

  return (
    <div className="min-h-screen bg-[#f6f8fb] pb-24">
      <meta
        name="robots"
        content="noindex,nofollow"
      />

      <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 lg:px-8">
        {/* ---------------- HEADER ---------------- */}

        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600">
            One last step
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Complete your advocate profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Your account is created. Add the professional details clients see
            before your dashboard unlocks.
          </p>
        </header>

        {/* ---------------- PROGRESS ---------------- */}

        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-900">
                Profile completion
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                {completion.completed} of{" "}
                {completion.total} required
                details added
              </p>
            </div>

            <span className="text-2xl font-bold text-slate-950">
              {completion.percentage}%
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
              style={{
                width: `${completion.percentage}%`,
              }}
            />
          </div>
        </div>

        {/* ---------------- SUBMIT ERROR ---------------- */}

        {submitError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-semibold text-red-700">
              {submitError}
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* =============================================================
              ACCOUNT DETAILS
          ============================================================= */}

          <Card
            title="Account details"
            description="Collected during registration. Contact support to change these."
          >
            <div className="flex items-center gap-5">
              <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                {user?.profilePhotoUrl ? (
                  <img
                    src={
                      user.profilePhotoUrl
                    }
                    alt={
                      user?.fullName ||
                      "Advocate"
                    }
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-3xl text-slate-300">
                    account_circle
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={
                    photoUploading
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none transition-colors hover:bg-slate-50 focus:outline-none focus-visible:outline-none disabled:opacity-60"
                >
                  {photoUploading
                    ? "Uploading..."
                    : "Change photo"}
                </button>

                <p className="mt-2 text-xs text-slate-400">
                  JPG, PNG or WEBP.
                  Max 5MB.
                </p>

                {photoError && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    {photoError}
                  </p>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={
                  handlePhotoSelect
                }
              />
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-5 py-1">
              <ReadOnlyRow
                label="Full name"
                value={
                  user?.fullName
                }
              />

              <ReadOnlyRow
                label="Email"
                value={user?.email}
              />

              <ReadOnlyRow
                label="Phone"
                value={user?.phone}
              />

              <ReadOnlyRow
                label="Gender"
                value={user?.gender}
              />

              <ReadOnlyRow
                label="Bar Council ID"
                value={
                  user?.barCouncilId
                }
              />

              <ReadOnlyRow
                label="Languages"
                value={(
                  user?.languagesSpoken ||
                  []
                ).join(", ")}
              />

              <ReadOnlyRow
                label="Location"
                value={[
                  user?.city,
                  user?.state,
                ]
                  .filter(Boolean)
                  .join(", ")}
              />
            </div>
          </Card>

          {/* =============================================================
              PROFESSIONAL BACKGROUND
          ============================================================= */}

          <Card
            title="Professional background"
            description="Your experience and areas of practice."
          >
            {/* YEARS + CASES */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Years of experience"
                required
                error={
                  errors.experienceYears
                }
              >
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={
                    form.experienceYears
                  }
                  onChange={(event) =>
                    setField(
                      "experienceYears",
                      event.target.value,
                    )
                  }
                  placeholder="e.g. 5"
                  className={inputClass(
                    Boolean(
                      errors.experienceYears,
                    ),
                  )}
                />
              </Field>

              <Field
                label="Cases Handled"
                required
                error={
                  errors.casesHandled
                }
              >
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={
                    form.casesHandled
                  }
                  onChange={(event) =>
                    setField(
                      "casesHandled",
                      event.target.value,
                    )
                  }
                  placeholder="e.g. 120"
                  className={inputClass(
                    Boolean(
                      errors.casesHandled,
                    ),
                  )}
                />
              </Field>
            </div>

            {/* PRACTICE AREAS */}

            <Field
              label="Practice areas"
              required
              error={
                errors.practiceAreas
              }
              hint="Press Enter to add"
            >
              <TagInput
                value={
                  form.practiceAreas
                }
                onChange={(value) => {
                  setField(
                    "practiceAreas",
                    value,
                  );

                  /*
                   * If currently-selected best area has
                   * been removed, clear the selection.
                   */
                  if (
                    form.bestPracticeArea &&
                    !value.some(
                      (area) =>
                        sameTag(
                          area,
                          form.bestPracticeArea,
                        ),
                    )
                  ) {
                    setField(
                      "bestPracticeArea",
                      "",
                    );
                  }
                }}
                placeholder="Add another practice area..."
                error={
                  errors.practiceAreas
                }
              />
            </Field>

            {/* BEST PRACTICE AREA */}

            <Field
              label="Best Practice area"
              required
              error={
                errors.bestPracticeArea
              }
              hint="Select one from your practice areas"
            >
              <div className="relative">
                <select
                  value={
                    form.bestPracticeArea ||
                    ""
                  }
                  onChange={(event) =>
                    setField(
                      "bestPracticeArea",
                      event.target.value,
                    )
                  }
                  disabled={
                    practiceAreaOptions.length ===
                    0
                  }
                  className={`${inputClass(
                    Boolean(
                      errors.bestPracticeArea,
                    ),
                  )} appearance-none pr-11 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
                >
                  <option value="">
                    {practiceAreaOptions.length >
                      0
                      ? "Select from practice areas"
                      : "Add practice areas first"}
                  </option>

                  {practiceAreaOptions.map(
                    (area) => (
                      <option
                        key={area}
                        value={area}
                      >
                        {area}
                      </option>
                    ),
                  )}
                </select>

                <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[19px] text-slate-400">
                  expand_more
                </span>
              </div>
            </Field>

            {/* COURTS */}

            <Field
              label="Courts practised in"
              required
              error={
                errors.courtPractice
              }
              hint="Press Enter to add"
            >
              <TagInput
                value={
                  form.courtPractice
                }
                onChange={(value) => {
                  setField(
                    "courtPractice",
                    value,
                  );

                  /*
                   * If currently-selected best court has
                   * been removed, clear the selection.
                   */
                  if (
                    form.topCourtPractised &&
                    !value.some(
                      (court) =>
                        sameTag(
                          court,
                          form.topCourtPractised,
                        ),
                    )
                  ) {
                    setField(
                      "topCourtPractised",
                      "",
                    );
                  }
                }}
                placeholder="Add another court..."
                error={
                  errors.courtPractice
                }
              />
            </Field>

            {/* BEST COURT */}

            <Field
              label="Best Courts practised"
              required
              error={
                errors.topCourtPractised
              }
              hint="Select one from courts practised in"
            >
              <div className="relative">
                <select
                  value={
                    form.topCourtPractised ||
                    ""
                  }
                  onChange={(event) =>
                    setField(
                      "topCourtPractised",
                      event.target.value,
                    )
                  }
                  disabled={
                    courtOptions.length ===
                    0
                  }
                  className={`${inputClass(
                    Boolean(
                      errors.topCourtPractised,
                    ),
                  )} appearance-none pr-11 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
                >
                  <option value="">
                    {courtOptions.length >
                      0
                      ? "Select from courts practised in"
                      : "Add courts practised first"}
                  </option>

                  {courtOptions.map(
                    (court) => (
                      <option
                        key={court}
                        value={court}
                      >
                        {court}
                      </option>
                    ),
                  )}
                </select>

                <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[19px] text-slate-400">
                  expand_more
                </span>
              </div>
            </Field>

            {/* PROFESSIONAL BIO */}

            <Field
              label="Professional bio"
              required
              error={errors.about}
              hint={`Minimum ${ABOUT_MIN_WORDS} words, maximum ${ABOUT_MAX_WORDS} words`}
            >
              <textarea
                rows={7}
                value={
                  form.about
                }
                onChange={(event) =>
                  setField(
                    "about",
                    event.target.value,
                  )
                }
                placeholder="Describe your legal experience, areas of expertise, professional achievements and approach towards clients..."
                className={`${inputClass(
                  Boolean(
                    errors.about ||
                    isAboutInvalid,
                  ),
                )} min-h-[170px] resize-y leading-6`}
              />

              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                <p
                  className={`text-xs font-bold ${isAboutInvalid
                      ? "text-red-600"
                      : "text-emerald-600"
                    }`}
                >
                  {aboutWordCount}/
                  {ABOUT_MAX_WORDS}{" "}
                  words
                </p>

                <div
                  className={`flex items-center gap-1.5 text-xs font-semibold ${isAboutInvalid
                      ? "text-red-600"
                      : "text-emerald-600"
                    }`}
                >
                  {!isAboutInvalid && (
                    <span className="material-symbols-outlined text-[17px]">
                      check_circle
                    </span>
                  )}

                  <span>
                    {aboutWordCount <
                      ABOUT_MIN_WORDS
                      ? `${ABOUT_MIN_WORDS -
                      aboutWordCount
                      } more word${ABOUT_MIN_WORDS -
                        aboutWordCount ===
                        1
                        ? ""
                        : "s"
                      } required`
                      : aboutWordCount >
                        ABOUT_MAX_WORDS
                        ? `${aboutWordCount -
                        ABOUT_MAX_WORDS
                        } word${aboutWordCount -
                          ABOUT_MAX_WORDS ===
                          1
                          ? ""
                          : "s"
                        } over the limit`
                        : "Word count is valid"}
                  </span>
                </div>
              </div>
            </Field>
          </Card>

          {/* =============================================================
              OFFICE
          ============================================================= */}

          <Card
            title="Office"
            description="Where clients can meet you in person."
          >
            <Field
              label="Complete office address"
              required
              error={
                errors.completeAddress
              }
            >
              <textarea
                rows={3}
                value={
                  form.completeAddress
                }
                onChange={(event) =>
                  setField(
                    "completeAddress",
                    event.target.value,
                  )
                }
                placeholder="Office No. 204, District Court Complex, ..."
                className={`${inputClass(
                  Boolean(
                    errors.completeAddress,
                  ),
                )} resize-none`}
              />
            </Field>
          </Card>

          {/* =============================================================
              PRICING
          ============================================================= */}

          <Card
            title="Consultation pricing"
            description="Set a fee for each consultation mode you offer."
          >
            <div className="grid gap-5 sm:grid-cols-3">
              <Field
                label="Video (₹/min)"
                required
                error={
                  errors.videoCallChargePerMinute
                }
              >
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={
                    form.videoCallChargePerMinute
                  }
                  onChange={(event) =>
                    setField(
                      "videoCallChargePerMinute",
                      event.target.value,
                    )
                  }
                  placeholder="50"
                  className={inputClass(
                    Boolean(
                      errors.videoCallChargePerMinute,
                    ),
                  )}
                />
              </Field>

              <Field
                label="Voice (₹/min)"
                required
                error={
                  errors.voiceCallChargePerMinute
                }
              >
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={
                    form.voiceCallChargePerMinute
                  }
                  onChange={(event) =>
                    setField(
                      "voiceCallChargePerMinute",
                      event.target.value,
                    )
                  }
                  placeholder="30"
                  className={inputClass(
                    Boolean(
                      errors.voiceCallChargePerMinute,
                    ),
                  )}
                />
              </Field>

              <Field
                label="Office visit (₹)"
                required
                error={
                  errors.offlineVisitingFee
                }
              >
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={
                    form.offlineVisitingFee
                  }
                  onChange={(event) =>
                    setField(
                      "offlineVisitingFee",
                      event.target.value,
                    )
                  }
                  placeholder="1000"
                  className={inputClass(
                    Boolean(
                      errors.offlineVisitingFee,
                    ),
                  )}
                />
              </Field>
            </div>
          </Card>

          {/* =============================================================
              SUBMIT
          ============================================================= */}

          <div className="sticky bottom-4 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                {completion.percentage ===
                  100
                  ? "Everything looks good."
                  : `${completion.total -
                  completion.completed
                  } required detail${completion.total -
                    completion.completed ===
                    1
                    ? ""
                    : "s"
                  } remaining.`}
              </p>

              <button
                type="submit"
                disabled={
                  isSubmitting
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-7 py-3 text-sm font-bold text-white outline-none shadow-sm transition-all hover:bg-amber-600 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save and continue

                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}