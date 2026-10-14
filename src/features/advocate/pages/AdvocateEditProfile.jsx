import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  Gavel,
  Globe2,
  IndianRupee,
  Languages,
  Loader2,
  MapPin,
  Save,
  Scale,
  ShieldCheck,
  Sparkles,
  Trophy,
  Upload,
  UserRound,
  X,
} from "lucide-react";

import { advocateProfileApi } from "../index";

/* =========================================================================
   FORM MODEL

   IMPORTANT:
   Only documented PATCH fields are present here.
============================================================================ */

const EMPTY_FORM = {
  experienceYears: "",
  casesHandled: "",

  practiceAreas: "",
  bestPracticeArea: "",

  topCourtPractised: "",
  courtPractice: "",

  about: "",
  completeAddress: "",

  languagesSpoken: "",

  country: "",
  state: "",
  city: "",

  videoCallChargePerMinute:
    "",
  voiceCallChargePerMinute:
    "",
  offlineVisitingFee: "",
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

const listToInput = (
  value,
) => {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map(cleanText)
    .filter(Boolean)
    .join(", ");
};

const inputToList = (
  value,
) =>
  cleanText(value)
    .split(",")
    .map(
      (item) =>
        item.trim(),
    )
    .filter(Boolean);

const countWords = (
  value,
) => {
  const text =
    cleanText(value);

  if (!text) {
    return 0;
  }

  return text
    .split(/\s+/)
    .filter(Boolean)
    .length;
};

const getName = (
  profile,
) =>
  cleanText(
    profile?.fullName,
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

const safeNumberInput = (
  value,
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value);
};

const sameList = (a, b) => {
  const first =
    Array.isArray(a) ? a : [];

  const second =
    Array.isArray(b) ? b : [];

  if (
    first.length !==
    second.length
  ) {
    return false;
  }

  return first.every(
    (item, index) =>
      cleanText(item) ===
      cleanText(
        second[index],
      ),
  );
};

const addStringPatch = (
  payload,
  key,
  currentValue,
  initialValue,
) => {
  const current =
    cleanText(currentValue);

  const initial =
    cleanText(initialValue);

  if (current === initial) {
    return;
  }

  /*
   * Empty optional values ko PATCH me
   * unnecessarily mat bhejo.
   */
  if (!current) {
    return;
  }

  payload[key] = current;
};

const addNumberPatch = (
  payload,
  key,
  currentValue,
  initialValue,
) => {
  const currentEmpty =
    currentValue === "" ||
    currentValue === null ||
    currentValue ===
    undefined;

  if (currentEmpty) {
    return;
  }

  const current =
    Number(currentValue);

  const initial =
    initialValue === "" ||
      initialValue === null ||
      initialValue ===
      undefined
      ? null
      : Number(initialValue);

  if (
    !Number.isFinite(
      current,
    )
  ) {
    return;
  }

  if (current === initial) {
    return;
  }

  payload[key] = current;
};

/* =========================================================================
   FIELD
============================================================================ */

function Field({
  label,
  hint,
  error,
  required,
  children,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-extrabold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}

      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-5 text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/* =========================================================================
   MAIN
============================================================================ */

export default function AdvocateEditProfile() {
  const navigate =
    useNavigate();

  const fileInputRef =
    useRef(null);

  const [
    profile,
    setProfile,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState(
    EMPTY_FORM,
  );

  const [
    initialForm,
    setInitialForm,
  ] = useState(
    EMPTY_FORM,
  );

  const [
    errors,
    setErrors,
  ] = useState({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    photoUploading,
    setPhotoUploading,
  ] = useState(false);

  const [
    pageError,
    setPageError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    previewPhoto,
    setPreviewPhoto,
  ] = useState("");



  /* =========================================================================
     GET PROFILE
  ========================================================================== */

  const fetchProfile =
    useCallback(
      async () => {
        setLoading(true);
        setPageError("");

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

          const data =
            response.advocate;

          setProfile(data);

          const nextForm = {
            experienceYears:
              safeNumberInput(
                data?.experienceYears,
              ),

            casesHandled:
              safeNumberInput(
                data?.casesHandled,
              ),

            practiceAreas:
              listToInput(
                data?.practiceAreas,
              ),

            bestPracticeArea:
              cleanText(
                data?.bestPracticeArea,
              ),

            topCourtPractised:
              cleanText(
                data?.topCourtPractised,
              ),

            courtPractice:
              listToInput(
                data?.courtPractice,
              ),

            about:
              cleanText(
                data?.about,
              ),

            completeAddress:
              cleanText(
                data?.completeAddress,
              ),

            languagesSpoken:
              listToInput(
                data?.languagesSpoken,
              ),

            country:
              cleanText(
                data?.country,
              ),

            state:
              cleanText(
                data?.state,
              ),

            city:
              cleanText(
                data?.city,
              ),

            videoCallChargePerMinute:
              safeNumberInput(
                data?.videoCallChargePerMinute,
              ),

            voiceCallChargePerMinute:
              safeNumberInput(
                data?.voiceCallChargePerMinute,
              ),

            offlineVisitingFee:
              safeNumberInput(
                data?.offlineVisitingFee,
              ),
          };

          setForm(nextForm);

          setInitialForm(
            nextForm,
          );

          setPreviewPhoto(
            data?.profilePhotoUrl ||
            "",
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
            setPageError(
              "Only Advocate accounts can manage this profile.",
            );

            return;
          }

          setPageError(
            requestError?.message ||
            "Unable to load Advocate profile.",
          );
        } finally {
          setLoading(false);
        }
      },
      [navigate],
    );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /* =========================================================================
     CHANGE
  ========================================================================== */

  const handleChange = (
    name,
    value,
  ) => {
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

  /* =========================================================================
     COMPUTED
  ========================================================================== */

  const dirty = useMemo(
    () =>
      JSON.stringify(form) !==
      JSON.stringify(
        initialForm,
      ),
    [form, initialForm],
  );

  const practiceAreas =
    useMemo(
      () =>
        inputToList(
          form.practiceAreas,
        ),
      [form.practiceAreas],
    );

  const courts = useMemo(
    () =>
      inputToList(
        form.courtPractice,
      ),
    [form.courtPractice],
  );

  const languages =
    useMemo(
      () =>
        inputToList(
          form.languagesSpoken,
        ),
      [form.languagesSpoken],
    );

  const aboutWordCount =
    useMemo(
      () =>
        countWords(
          form.about,
        ),
      [form.about],
    );

  const isAboutInvalid =
    aboutWordCount < 50 ||
    aboutWordCount > 500;
  /* =========================================================================
     VALIDATION

     Mirrors backend constraints from README.
  ========================================================================== */

  const validate = () => {
    const nextErrors = {};

    const experience =
      Number(
        form.experienceYears,
      );

    if (
      form.experienceYears ===
      ""
    ) {
      nextErrors.experienceYears =
        "Experience is required.";
    } else if (
      !Number.isInteger(
        experience,
      ) ||
      experience < 0 ||
      experience > 80
    ) {
      nextErrors.experienceYears =
        "Experience must be an integer between 0 and 80.";
    }

    const casesHandled =
      Number(form.casesHandled);

    if (
      form.casesHandled === ""
    ) {
      nextErrors.casesHandled =
        "Cases Handled is required.";
    } else if (
      !Number.isInteger(
        casesHandled,
      ) ||
      casesHandled < 0 ||
      casesHandled > 100000
    ) {
      nextErrors.casesHandled =
      "Cases Handled must be an integer between 0 and 100000.";
    }

    if (
      !practiceAreas.length
    ) {
      nextErrors.practiceAreas =
        "Add at least one practice area.";
    } else if (
      practiceAreas.length >
      20
    ) {
      nextErrors.practiceAreas =
        "Maximum 20 practice areas are allowed.";
    }

    if (
      !cleanText(
        form.bestPracticeArea,
      )
    ) {
      nextErrors.bestPracticeArea =
        "Best practice area is required.";
    } else if (
      cleanText(
        form.bestPracticeArea,
      ).length > 100
    ) {
      nextErrors.bestPracticeArea =
        "Maximum 100 characters allowed.";
    }

    if (
      cleanText(
        form.topCourtPractised,
      ).length > 100
    ) {
      nextErrors.topCourtPractised =
        "Maximum 100 characters allowed.";
    }

    if (aboutWordCount < 50) {
      nextErrors.about =
        "Professional biography must contain at least 50 words."
    } else if (aboutWordCount > 500) {
      nextErrors.about =
        "Professional biography cannot exceed 500 words.";
    }

    if (
      cleanText(
        form.completeAddress,
      ).length > 500
    ) {
      nextErrors.completeAddress =
        "Address cannot exceed 500 characters.";
    }

    const chargeFields = [
      [
        "videoCallChargePerMinute",
        "Video call charge",
      ],
      [
        "voiceCallChargePerMinute",
        "Voice call charge",
      ],
      [
        "offlineVisitingFee",
        "Office visiting fee",
      ],
    ];

    chargeFields.forEach(
      ([key, label]) => {
        if (
          form[key] === ""
        ) {
          return;
        }

        const value =
          Number(form[key]);

        if (
          !Number.isFinite(
            value,
          ) ||
          value < 0
        ) {
          nextErrors[key] =
            `${label} must be 0 or greater.`;
        }
      },
    );

    setErrors(
      nextErrors,
    );

    return (
      Object.keys(
        nextErrors,
      ).length === 0
    );
  };

  /* =========================================================================
     PATCH PROFILE
  ========================================================================== */

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    setPageError("");
    setSuccess("");

    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      const payload = {};

      /* ===============================
         NUMBERS
      =============================== */

      addNumberPatch(
        payload,
        "experienceYears",
        form.experienceYears,
        initialForm.experienceYears,
      );

      addNumberPatch(
        payload,
        "casesHandled",
        form.casesHandled,
        initialForm.casesHandled,
      );

      addNumberPatch(
        payload,
        "videoCallChargePerMinute",
        form.videoCallChargePerMinute,
        initialForm.videoCallChargePerMinute,
      );

      addNumberPatch(
        payload,
        "voiceCallChargePerMinute",
        form.voiceCallChargePerMinute,
        initialForm.voiceCallChargePerMinute,
      );

      addNumberPatch(
        payload,
        "offlineVisitingFee",
        form.offlineVisitingFee,
        initialForm.offlineVisitingFee,
      );

      /* ===============================
         REQUIRED / NORMAL STRINGS
      =============================== */

      addStringPatch(
        payload,
        "bestPracticeArea",
        form.bestPracticeArea,
        initialForm.bestPracticeArea,
      );

      addStringPatch(
        payload,
        "topCourtPractised",
        form.topCourtPractised,
        initialForm.topCourtPractised,
      );

      addStringPatch(
        payload,
        "about",
        form.about,
        initialForm.about,
      );

      addStringPatch(
        payload,
        "completeAddress",
        form.completeAddress,
        initialForm.completeAddress,
      );

      addStringPatch(
        payload,
        "country",
        form.country,
        initialForm.country,
      );

      addStringPatch(
        payload,
        "state",
        form.state,
        initialForm.state,
      );

      addStringPatch(
        payload,
        "city",
        form.city,
        initialForm.city,
      );

      /* ===============================
         ARRAYS
      =============================== */

      const initialPracticeAreas =
        inputToList(
          initialForm.practiceAreas,
        );

      if (
        !sameList(
          practiceAreas,
          initialPracticeAreas,
        )
      ) {
        payload.practiceAreas =
          practiceAreas;
      }

      const initialCourts =
        inputToList(
          initialForm.courtPractice,
        );

      if (
        !sameList(
          courts,
          initialCourts,
        )
      ) {
        /*
         * Empty array ko tabhi bhejna jab
         * tum backend se list clear karna
         * explicitly support karte ho.
         */
        if (courts.length > 0) {
          payload.courtPractice =
            courts;
        }
      }

      const initialLanguages =
        inputToList(
          initialForm.languagesSpoken,
        );

      if (
        !sameList(
          languages,
          initialLanguages,
        )
      ) {
        if (
          languages.length >
          0
        ) {
          /*
           * PATCH API expects "languages".
           * GET response uses "languagesSpoken".
           */
          payload.languages =
            languages;
        }
      }

      /* ===============================
         NOTHING ACTUALLY CHANGED
      =============================== */

      if (
        Object.keys(payload)
          .length === 0
      ) {
        setSuccess(
          "No profile changes to save.",
        );

        setInitialForm({
          ...form,
        });

        return;
      }

      console.log(
        "ADVOCATE PROFILE PATCH:",
        payload,
      );

      const response =
        await advocateProfileApi.updateProfile(
          payload,
        );

      console.log(
        "ADVOCATE PROFILE PATCH RESPONSE:",
        response,
      );

      if (!response?.success) {
        throw new Error(
          response?.message ||
          "Unable to update profile.",
        );
      }

      const updatedProfile =
        response?.advocate ||
        response?.data
          ?.advocate ||
        response?.data ||
        null;

      setInitialForm({
        ...form,
      });

      if (updatedProfile) {
        setProfile(
          updatedProfile,
        );
      }

      setSuccess(
        response?.message ||
        "Profile updated successfully.",
      );

      window.setTimeout(
        () => {
          navigate(
            "/advocate/profile",
            {
              replace: true,
            },
          );
        },
        800,
      );
    } catch (
    requestError
    ) {
      console.error(
        "ADVOCATE PROFILE UPDATE ERROR:",
        {
          status:
            requestError?.status,
          message:
            requestError?.message,
          data:
            requestError?.data,
        },
      );

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
        setPageError(
          "Only Advocate accounts can update this profile.",
        );

        return;
      }

      /*
       * Backend validation fields bhi UI me show
       * karne ki attempt.
       */
      if (
        requestError?.data
          ?.errors &&
        typeof requestError.data
          .errors === "object" &&
        !Array.isArray(
          requestError.data
            .errors,
        )
      ) {
        setErrors(
          (previous) => ({
            ...previous,
            ...requestError.data
              .errors,
          }),
        );
      }

      setPageError(
        requestError?.data
          ?.message ||
        requestError?.message ||
        "Unable to update Advocate profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================================
     PHOTO
  ========================================================================== */

  const handlePhotoChange =
    async (event) => {
      const file =
        event.target.files?.[0];

      event.target.value = "";

      if (!file) {
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowedTypes.includes(
          file.type,
        )
      ) {
        setPageError(
          "Only JPG, JPEG, PNG or WEBP images are allowed.",
        );

        return;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        setPageError(
          "Profile photo must not exceed 5 MB.",
        );

        return;
      }

      setPageError("");
      setSuccess("");

      const oldPhoto =
        previewPhoto;

      const localUrl =
        URL.createObjectURL(
          file,
        );

      setPreviewPhoto(
        localUrl,
      );

      setPhotoUploading(
        true,
      );

      try {
        const response =
          await advocateProfileApi.uploadPhoto(
            file,
          );

        if (
          !response?.success
        ) {
          throw new Error(
            response?.message ||
            "Unable to update profile photo.",
          );
        }

        const newPhoto =
          response?.profilePhotoUrl ||
          response?.advocate
            ?.profilePhotoUrl ||
          "";

        setPreviewPhoto(
          newPhoto,
        );

        setProfile(
          response?.advocate ||
          ((previous) => ({
            ...(previous ||
              {}),
            profilePhotoUrl:
              newPhoto,
          })),
        );

        setSuccess(
          response?.message ||
          "Profile photo updated successfully.",
        );
      } catch (
      requestError
      ) {
        setPreviewPhoto(
          oldPhoto,
        );

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

        setPageError(
          requestError?.message ||
          "Unable to upload profile photo.",
        );
      } finally {
        setPhotoUploading(
          false,
        );

        URL.revokeObjectURL(
          localUrl,
        );
      }
    };

  const handleLanguageKeyDown = (event) => {
    if (event.key !== " ") {
      return;
    }

    event.preventDefault();

    const currentValue =
      String(
        form.languagesSpoken || "",
      );

    const input =
      event.currentTarget;

    const cursorPosition =
      input.selectionStart ??
      currentValue.length;

    /*
     * Cursor se pehle aur baad ka text.
     */
    const beforeCursor =
      currentValue.slice(
        0,
        cursorPosition,
      );

    const afterCursor =
      currentValue.slice(
        cursorPosition,
      );

    /*
     * Empty input par space allow nahi karna.
     */
    if (
      !beforeCursor.trim()
    ) {
      return;
    }

    /*
     * Agar already comma separator hai,
     * duplicate comma create nahi karenge.
     */
    const cleanBefore =
      beforeCursor
        .replace(
          /,\s*$/,
          "",
        )
        .trimEnd();

    const updatedValue =
      `${cleanBefore}, ${afterCursor.replace(
        /^\s+/,
        "",
      )}`;

    handleChange(
      "languagesSpoken",
      updatedValue,
    );

    /*
     * Controlled input update hone ke baad
     * cursor ko separator ke baad position karo.
     */
    requestAnimationFrame(() => {
      const nextPosition =
        cleanBefore.length + 2;

      input.setSelectionRange(
        nextPosition,
        nextPosition,
      );
    });
  };

  /* =========================================================================
     LOADING
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

  const name =
    getName(profile);

  /* =========================================================================
     PAGE
  ========================================================================== */

  return (
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
          <div className="pointer-events-none absolute right-0 top-0 h-full w-96 bg-gradient-to-l from-amber-50/90 to-transparent" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/advocate/profile",
                  )
                }
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-slate-950"
              >
                <ArrowLeft
                  size={15}
                />
                Back to Profile
              </button>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-amber-700">
                <Sparkles
                  size={13}
                />
                Professional Profile
              </div>

              <h1 className="mt-3 text-[24px] font-extrabold tracking-[-0.035em] text-slate-950 sm:text-[29px]">
                Update Advocate
                Profile
              </h1>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                Manage your
                professional details,
                court practice,
                location,
                languages and
                consultation pricing.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <ShieldCheck
                size={13}
              />
              Secure Profile Update
            </span>
          </div>
        </motion.section>

        {/* FEEDBACK */}

        {pageError && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-red-500"
            />

            <p className="text-sm font-medium text-red-700">
              {pageError}
            </p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-emerald-600"
            />

            <p className="text-sm font-bold text-emerald-700">
              {success}
            </p>
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
          className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12 xl:gap-6"
        >
          {/* =================================================
              LEFT FORM
          ================================================= */}

          <div className="space-y-5 xl:col-span-8">
            {/* VERIFIED IDENTITY */}

            <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
              <SectionHeader
                Icon={UserRound}
                title="Verified Account Information"
                description="These registration details are read-only."
              />

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ReadOnlyField
                  label="Full Name"
                  value={
                    profile?.fullName
                  }
                />

                <ReadOnlyField
                  label="Email"
                  value={
                    profile?.email
                  }
                />

                <ReadOnlyField
                  label="Phone"
                  value={
                    profile?.phone
                  }
                />

                <ReadOnlyField
                  label="Bar Council ID"
                  value={
                    profile?.barCouncilId
                  }
                />
              </div>
            </section>

            {/* PROFESSIONAL */}

            <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
              <SectionHeader
                Icon={
                  BriefcaseBusiness
                }
                title="Professional Experience"
                description="Manage experience, cases and practice expertise."
              />

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field
                  label="Experience"
                  required
                  error={
                    errors.experienceYears
                  }
                  hint="0–80 years"
                >
                  <input
                    type="number"
                    min="0"
                    max="80"
                    step="1"
                    value={
                      form.experienceYears
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "experienceYears",
                        event.target
                          .value,
                      )
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </Field>

                <Field
                  label="Cases Handled"
                  required
                  error={
                    errors.casesHandled
                  }
                  hint="0–100000"
                >
                  <input
                    type="number"
                    min="0"
                    max="100000"
                    step="1"
                    value={
                      form.casesHandled
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "casesHandled",
                        event.target
                          .value,
                      )
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field
                    label="Practice Areas"
                    required
                    error={
                      errors.practiceAreas
                    }
                    hint={`${practiceAreas.length}/20 areas. Separate using commas.`}
                  >
                    <input
                      type="text"
                      value={
                        form.practiceAreas
                      }
                      onChange={(
                        event,
                      ) =>
                        handleChange(
                          "practiceAreas",
                          event.target
                            .value,
                        )
                      }
                      placeholder="Civil Law, Family Law, Property Law"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                    />

                    {practiceAreas.length >
                      0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {practiceAreas.map(
                            (area) => (
                              <span
                                key={
                                  area
                                }
                                className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700"
                              >
                                {area}
                              </span>
                            ),
                          )}
                        </div>
                      )}
                  </Field>
                </div>

                <Field
                  label="Best Practice Area"
                  required
                  error={
                    errors.bestPracticeArea
                  }
                  hint="Maximum 100 characters"
                >
                  <input
                    type="text"
                    maxLength={100}
                    value={
                      form.bestPracticeArea
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "bestPracticeArea",
                        event.target
                          .value,
                      )
                    }
                    placeholder="Property Disputes"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </Field>

                <Field
                  label="Top Court Practised"
                  error={
                    errors.topCourtPractised
                  }
                  hint="Maximum 100 characters"
                >
                  <input
                    type="text"
                    maxLength={100}
                    value={
                      form.topCourtPractised
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "topCourtPractised",
                        event.target
                          .value,
                      )
                    }
                    placeholder="Delhi High Court"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </Field>
              </div>
            </section>

            {/* ABOUT */}

            <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
              <SectionHeader
                Icon={Trophy}
                title="About"
                description="Write a minimum of 50 words and a maximum of 500 words."
              />

              <div className="mt-6">
                <Field
                  label="About"
                  required
                  error={errors.about}
                >
                  <textarea
                    rows={6}
                    value={form.about}
                    onChange={(event) => {
                      const value =
                        event.target.value;

                      handleChange(
                        "about",
                        value,
                      );
                    }}
                    placeholder="Describe your legal experience, areas of expertise, professional achievements and approach towards clients..."
                    className={`w-full resize-none rounded-xl border bg-slate-50/70 px-4 py-3 text-sm font-medium leading-7 text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${isAboutInvalid
                        ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-amber-400 focus:ring-amber-500/10"
                      }`}
                  />

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <p
                      className={`text-xs font-medium ${isAboutInvalid
                          ? "text-red-600"
                          : "text-emerald-600"
                        }`}
                    >
                      {aboutWordCount}/500 words
                    </p>

                    <p
                      className={`text-xs ${isAboutInvalid
                          ? "font-semibold text-red-600"
                          : "font-medium text-emerald-600"
                        }`}
                    >
                      {aboutWordCount < 50
                        ? `${50 - aboutWordCount} more words required`
                        : aboutWordCount > 500
                          ? `${aboutWordCount - 500} words over the limit`
                          : "Word count is valid"}
                    </p>
                  </div>
                </Field>
              </div>
            </section>

            {/* COURT */}

            <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
              <SectionHeader
                Icon={Gavel}
                title="Court Practice"
                description="Add the courts where you practise."
              />

              <div className="mt-6">
                <Field
                  label="Court Practice"
                  hint="Separate courts using commas."
                >
                  <input
                    type="text"
                    value={
                      form.courtPractice
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "courtPractice",
                        event.target
                          .value,
                      )
                    }
                    placeholder="High Court, District Court"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />

                  {courts.length >
                    0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {courts.map(
                          (court) => (
                            <span
                              key={
                                court
                              }
                              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-600"
                            >
                              {court}
                            </span>
                          ),
                        )}
                      </div>
                    )}
                </Field>
              </div>
            </section>

            {/* LOCATION */}

            <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
              <SectionHeader
                Icon={MapPin}
                title="Location & Address"
                description="Professional office and location details."
              />

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Field label="Country">
                  <input
                    type="text"
                    value={
                      form.country
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "country",
                        event.target
                          .value,
                      )
                    }
                    placeholder="India"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </Field>

                <Field label="State">
                  <input
                    type="text"
                    value={
                      form.state
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "state",
                        event.target
                          .value,
                      )
                    }
                    placeholder="Uttar Pradesh"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </Field>

                <Field label="City">
                  <input
                    type="text"
                    value={
                      form.city
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "city",
                        event.target
                          .value,
                      )
                    }
                    placeholder="Ghaziabad"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </Field>

                <div className="sm:col-span-3">
                  <Field
                    label="Complete Address"
                    error={
                      errors.completeAddress
                    }
                    hint={`${cleanText(form.completeAddress).length}/500 characters`}
                  >
                    <textarea
                      rows={4}
                      maxLength={
                        500
                      }
                      value={
                        form.completeAddress
                      }
                      onChange={(
                        event,
                      ) =>
                        handleChange(
                          "completeAddress",
                          event.target
                            .value,
                        )
                      }
                      placeholder="Office No. 204, District Court Complex"
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium leading-6 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* LANGUAGES */}

            <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
              <SectionHeader
                Icon={Languages}
                title="Languages"
                description="Languages spoken during consultations."
              />

              <div className="mt-6">
                <Field
                  label="Languages Spoken"
                  hint="Type a language and press Space to add the next language."
                >
                  <input
                    type="text"
                    value={
                      form.languagesSpoken
                    }
                    onChange={(
                      event,
                    ) =>
                      handleChange(
                        "languagesSpoken",
                        event.target.value,
                      )
                    }
                    onKeyDown={
                      handleLanguageKeyDown
                    }
                    placeholder="Hindi English Punjabi"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />

                  {languages.length >
                    0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {languages.map(
                          (
                            language,
                            index,
                          ) => (
                            <span
                              key={`${language}-${index}`}
                              className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700"
                            >
                              {language}
                            </span>
                          ),
                        )}
                      </div>
                    )}
                </Field>
              </div>
            </section>

            {/* PRICING */}

            <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
              <SectionHeader
                Icon={
                  IndianRupee
                }
                title="Consultation Pricing"
                description="All charges must be 0 or greater."
              />

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Field
                  label="Video / Minute"
                  error={
                    errors.videoCallChargePerMinute
                  }
                >
                  <MoneyInput
                    value={
                      form.videoCallChargePerMinute
                    }
                    onChange={(
                      value,
                    ) =>
                      handleChange(
                        "videoCallChargePerMinute",
                        value,
                      )
                    }
                  />
                </Field>

                <Field
                  label="Voice / Minute"
                  error={
                    errors.voiceCallChargePerMinute
                  }
                >
                  <MoneyInput
                    value={
                      form.voiceCallChargePerMinute
                    }
                    onChange={(
                      value,
                    ) =>
                      handleChange(
                        "voiceCallChargePerMinute",
                        value,
                      )
                    }
                  />
                </Field>

                <Field
                  label="Office Visit"
                  error={
                    errors.offlineVisitingFee
                  }
                >
                  <MoneyInput
                    value={
                      form.offlineVisitingFee
                    }
                    onChange={(
                      value,
                    ) =>
                      handleChange(
                        "offlineVisitingFee",
                        value,
                      )
                    }
                  />
                </Field>
              </div>
            </section>
          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="space-y-5 xl:sticky xl:top-6 xl:col-span-4">
            {/* PHOTO */}

            <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
              <h2 className="text-[16px] font-extrabold text-slate-950 text-center">
                Profile Photo
              </h2>

              <p className="mt-1 text-xs text-slate-500 text-center">
                JPG, JPEG, PNG or
                WEBP. Maximum 5 MB.
              </p>

              <div className="mt-6 flex flex-col items-center text-center">
                <div className="relative">
                  {previewPhoto ? (
                    <img
                      src={
                        previewPhoto
                      }
                      alt={name}
                      className="h-28 w-28 rounded-[26px] object-cover ring-4 ring-slate-100"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-[26px] border border-amber-200 bg-amber-50 text-xl font-extrabold text-amber-700">
                      {getInitials(
                        name,
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={
                      photoUploading
                    }
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    {photoUploading ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Camera
                        size={17}
                      />
                    )}
                  </button>
                </div>


                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handlePhotoChange
                  }
                  className="hidden"
                />
              </div>
            </section>

            {/* SAVE */}

            <section className="rounded-[26px] bg-slate-950 p-5 text-white shadow-[0_16px_45px_rgba(15,23,42,0.16)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                <Save size={18} />
              </div>

              <h2 className="mt-4 text-base font-extrabold">
                Save Profile
              </h2>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Changes are sent
                directly to your
                authenticated Advocate
                profile.
              </p>

              {dirty ? (
                <div className="mt-4 rounded-xl border border-amber-400/15 bg-amber-500/10 px-3 py-2.5 text-xs font-bold text-amber-300">
                  You have unsaved
                  profile changes.
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-emerald-400/15 bg-emerald-500/10 px-3 py-2.5 text-xs font-bold text-emerald-300">
                  Profile is up to
                  date.
                </div>
              )}

              <button
                type="submit"
                disabled={
                  saving ||
                  !dirty ||
                  isAboutInvalid
                }
                className="mt-5 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-extrabold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={
                  !dirty ||
                  saving
                }
                onClick={() => {
                  setForm(
                    initialForm,
                  );

                  setErrors(
                    {},
                  );

                  setPageError(
                    "",
                  );
                }}
                className="mt-2 inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-white/10 text-xs font-bold text-slate-300 transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X size={15} />
                Reset Changes
              </button>
            </section>

            {/* SECURITY */}

            <section className="flex items-start gap-3 rounded-[22px] border border-blue-100 bg-blue-50/60 p-4">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div>
                <p className="text-xs font-extrabold text-blue-900">
                  Authenticated Profile
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-700">
                  Your Advocate ID is
                  resolved from the
                  secure HTTP-only
                  session cookie. No
                  Advocate ID is sent
                  in this form.
                </p>
              </div>
            </section>
          </aside>
        </form>
      </div>
    </main>
  );
}

/* =========================================================================
   SMALL COMPONENTS
============================================================================ */

function SectionHeader({
  Icon,
  title,
  description,
}) {
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

function ReadOnlyField({
  label,
  value,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-extrabold text-slate-700">
        {label}
      </label>

      <input
        type="text"
        value={
          cleanText(value)
        }
        disabled
        className="h-12 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-500"
      />
    </div>
  );
}

function MoneyInput({
  value,
  onChange,
}) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-400">
        ₹
      </span>

      <input
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
      />
    </div>
  );
}