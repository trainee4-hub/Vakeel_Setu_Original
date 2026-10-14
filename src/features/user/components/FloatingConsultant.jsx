import {
  useMemo,
  useState,
  useEffect,
} from "react";

import {
  FiCheck,
  FiChevronRight,
  FiClock,
  FiPhone,
  FiVideo,
  FiX,
} from "react-icons/fi";

import { FaHeadset } from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth";

import {
  createConsultancyRequest,
} from "../services/consultancyApi";

/* ================================================================
   CONFIG
================================================================ */

const PACKAGES = [
  {
    id: "call-15",
    callType: "CALL",
    duration: 15,
    price: 199,
    title: "Quick Call",
    description: "15 minute voice consultation",
    icon: FiPhone,
  },
  {
    id: "call-30",
    callType: "CALL",
    duration: 30,
    price: 499,
    title: "Detailed Call",
    description: "30 minute voice consultation",
    icon: FiPhone,
  },
  {
    id: "video-15",
    callType: "VIDEO_CALL",
    duration: 15,
    price: 499,
    title: "Video Consultation",
    description: "15 minute video consultation",
    icon: FiVideo,
  },
  {
    id: "video-30",
    callType: "VIDEO_CALL",
    duration: 30,
    price: 899,
    title: "Detailed Video Call",
    description: "30 minute video consultation",
    icon: FiVideo,
  },
];

const FLOATING_MESSAGES = [
  "Book a Consultant",
  "Book Consultation",
  "Consult a Lawyer",
  "Talk to an Expert",
  "Need Legal Help?",
];

/* ================================================================
   USER HELPERS
================================================================ */

const getUserEmail = (user) => {
  return user?.email || "";
};

const getUserPhone = (user) => {
  return (
    user?.phone ||
    user?.phoneNumber ||
    user?.mobile ||
    user?.mobileNumber ||
    ""
  );
};

/* ================================================================
   COMPONENT
================================================================ */

const FloatingConsultant = () => {
  const navigate = useNavigate();

  const {
    user,
    isLoggedIn,
  } = useAuth();

  /* ==============================================================
     STATE
  ============================================================== */

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    messageIndex,
    setMessageIndex,
  ] = useState(0);

  const [
    selectedPackageId,
    setSelectedPackageId,
  ] = useState("call-15");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState(false);

  const [
    createdRequest,
    setCreatedRequest,
  ] = useState(null);

  /* ==============================================================
     ROTATING FLOATING MESSAGE
  ============================================================== */

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessageIndex(
        (previous) =>
          (previous + 1) %
          FLOATING_MESSAGES.length,
      );
    }, 3500);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  /* ==============================================================
     SELECTED PACKAGE
  ============================================================== */

  const selectedPackage = useMemo(() => {
    return (
      PACKAGES.find(
        (item) =>
          item.id ===
          selectedPackageId,
      ) || PACKAGES[0]
    );
  }, [selectedPackageId]);

  /* ==============================================================
     OPEN MODAL
  ============================================================== */

  const handleOpen = () => {
    setError("");
    setSuccess(false);
    setCreatedRequest(null);
    setModalOpen(true);
  };

  /* ==============================================================
     CLOSE MODAL
  ============================================================== */

  const handleClose = () => {
    if (loading) {
      return;
    }

    setModalOpen(false);

    window.setTimeout(() => {
      setError("");
      setSuccess(false);
      setCreatedRequest(null);
    }, 200);
  };

  /* ==============================================================
     VALIDATE LOGGED-IN USER CONTACT DETAILS

     Contact inputs are intentionally not shown in the modal.

     Current consultancy API requires:
     - phoneNumber
     - email

     So those values are automatically taken from the logged-in
     user's account/profile.
  ============================================================== */

  const validateUserContact = () => {
    const normalizedPhone = String(
      getUserPhone(user) || "",
    )
      .replace(/\D/g, "")
      .slice(-10);

    const userEmail = String(
      getUserEmail(user) || "",
    ).trim();

    if (
      !/^\d{10}$/.test(
        normalizedPhone,
      )
    ) {
      return {
        valid: false,
        message:
          "A valid 10-digit phone number is required in your account before booking a consultation.",
      };
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        userEmail,
      )
    ) {
      return {
        valid: false,
        message:
          "A valid email address is required in your account before booking a consultation.",
      };
    }

    return {
      valid: true,
      phoneNumber: normalizedPhone,
      email: userEmail,
    };
  };

  /* ==============================================================
     LOGIN REDIRECT
  ============================================================== */

  const redirectToLogin = () => {
    setModalOpen(false);

    navigate("/login", {
      state: {
        from:
          window.location.pathname +
          window.location.search,

        openConsultancy: true,
      },
    });
  };

  /* ==============================================================
     SUBMIT CONSULTATION
  ============================================================== */

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    setError("");

    /*
     * Guest user:
     * redirect to login.
     */

    if (!isLoggedIn || !user) {
      redirectToLogin();
      return;
    }

    /*
     * Since contact fields are hidden,
     * validate contact information stored
     * in the logged-in user's account.
     */

    const validation =
      validateUserContact();

    if (!validation.valid) {
      setError(
        validation.message,
      );

      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANT
       *
       * Backend controls:
       * - price
       * - userId
       * - status
       *
       * Do not send those fields.
       */

      const payload = {
        callType:
          selectedPackage.callType,

        duration:
          selectedPackage.duration,

        phoneNumber:
          validation.phoneNumber,

        email:
          validation.email,
      };

      const response =
        await createConsultancyRequest(
          payload,
        );

      /*
       * Supports:
       *
       * { data: {...} }
       *
       * and direct object responses.
       */

      const requestData =
        response?.data ??
        response ??
        null;

      setCreatedRequest(
        requestData,
      );

      setSuccess(true);
    } catch (requestError) {
      const status =
  requestError?.status;

const message =
  requestError?.data?.message ||
  requestError?.message;

      /*
       * Unauthorized
       */

      if (status === 401) {
        redirectToLogin();
        return;
      }

      /*
       * Wrong role
       */

      if (status === 403) {
        setError(
          "Consultation requests are currently available for normal user accounts only.",
        );

        return;
      }

      setError(
        message ||
          "Unable to submit your consultation request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==============================================================
     UI
  ============================================================== */

  return (
    <>
      {/* ===========================================================
          FLOATING CONSULTATION WIDGET
      ============================================================ */}

      <div
        className="
          notranslate
          pointer-events-none
          fixed
          bottom-[max(32px,env(safe-area-inset-bottom))]
          right-6
          z-[180]
          flex
          items-end
          gap-2

          sm:bottom-10
          sm:right-10

          lg:bottom-20
          lg:right-20
        "
        translate="no"
      >
        {/* =========================================================
            MESSAGE BUBBLE
        ========================================================== */}

        <button
          type="button"
          onClick={handleOpen}
          className="
            pointer-events-auto
            relative
            mb-1
            hidden
            max-w-[190px]
            rounded-2xl
            rounded-br-md
            border
            border-slate-200
            bg-white
            px-4
            py-3
            text-left
            shadow-[0_12px_40px_rgba(15,23,42,0.16)]
            transition
            hover:-translate-y-0.5
            sm:block
          "
        >
          <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-amber-600">
            Vakeel Setu
          </span>

          <span
            key={messageIndex}
            className="
              mt-1
              block
              animate-[consultantFade_.35s_ease-out]
              text-[13px]
              font-black
              leading-5
              text-slate-900
            "
          >
            {
              FLOATING_MESSAGES[
                messageIndex
              ]
            }
          </span>

          <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-slate-400">
            Get legal assistance

            <FiChevronRight className="text-[12px]" />
          </span>

          {/* Bubble pointer */}

          <span
            className="
              absolute
              -right-[5px]
              bottom-4
              h-3
              w-3
              rotate-45
              border-r
              border-t
              border-slate-200
              bg-white
            "
          />
        </button>

        {/* =========================================================
            FLOATING HEADSET BUTTON
        ========================================================== */}

        <div className="pointer-events-auto relative shrink-0">
          {/* Glow */}

          <span
            className="
              absolute
              inset-0
              rounded-full
              bg-amber-400/30
              blur-md
              animate-pulse
            "
          />

          {/* Outer animated ring */}

          <span
            className="
              absolute
              -inset-1.5
              rounded-full
              border
              border-amber-400/40
              animate-[consultantPing_2.4s_ease-out_infinite]
            "
          />

          <button
            type="button"
            onClick={handleOpen}
            aria-label="Book a legal consultation"
            title="Book a Consultation"
            className="
              relative
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              border-[3px]
              border-white
              bg-slate-950
              text-white
              shadow-[0_10px_35px_rgba(15,23,42,0.3)]
              outline-none
              transition

              hover:scale-105
              hover:bg-amber-500

              focus:outline-none
              focus-visible:ring-4
              focus-visible:ring-amber-300/40

              sm:h-16
              sm:w-16
            "
          >
            <FaHeadset className="text-[23px] sm:text-[26px]" />
          </button>
        </div>
      </div>

      {/* ===========================================================
          CONSULTATION MODAL
      ============================================================ */}

      {modalOpen && (
        <div
          className="
            notranslate
            fixed
            inset-0
            z-[500]
            flex
            items-end
            justify-center
            bg-slate-950/55
            p-0
            backdrop-blur-sm

            sm:items-center
            sm:p-5
          "
          translate="no"
          onMouseDown={
            success
              ? undefined
              : handleClose
          }
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="consultancy-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            className="
              max-h-[88dvh]
              w-full
              overflow-y-auto
              rounded-t-[26px]
              border
              border-slate-200
              bg-white
              shadow-[0_30px_100px_rgba(15,23,42,0.3)]

              sm:max-w-2xl
              sm:rounded-[26px]
            "
          >
            {/* =====================================================
                SUCCESS STATE
            ====================================================== */}

            {success ? (
              <div className="p-6 text-center sm:p-8">
                {/* Success icon */}

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <FiCheck className="text-[27px]" />
                </div>

                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
                  Request Submitted
                </p>

                <h2 className="mt-1.5 text-2xl font-black tracking-tight text-slate-950">
                  Consultation Requested
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Your consultation request has
                  been submitted successfully.
                  Our team can now process it
                  through the consultation queue.
                </p>

                {/* Request information */}

                {createdRequest && (
                  <div className="mx-auto mt-5 max-w-md rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-slate-500">
                        Consultation
                      </span>

                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[9px] font-black uppercase text-amber-700">
                        {createdRequest.status ||
                          "PENDING"}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {/* Duration */}

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                          Duration
                        </p>

                        <p className="mt-1 text-sm font-black text-slate-900">
                          {createdRequest.duration ??
                            selectedPackage.duration}{" "}
                          minutes
                        </p>
                      </div>

                      {/* Price */}

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                          Price
                        </p>

                        <p className="mt-1 text-sm font-black text-slate-900">
                          ₹
                          {createdRequest.price ??
                            selectedPackage.price}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Done */}

                <button
                  type="button"
                  onClick={handleClose}
                  className="
                    mt-5
                    min-h-[46px]
                    w-full
                    max-w-md
                    rounded-xl
                    bg-slate-950
                    px-5
                    text-sm
                    font-black
                    text-white
                    transition
                    hover:bg-slate-800
                  "
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                {/* =================================================
                    MODAL HEADER
                ================================================== */}

                <div className="relative overflow-hidden border-b border-slate-100 px-5 py-4 sm:px-6">
                  {/* Decorative glow */}

                  <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-amber-100/60 blur-3xl" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      {/* Headset */}

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                        <FaHeadset className="text-[18px]" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.17em] text-amber-600">
                          Legal Consultation
                        </p>

                        <h2
                          id="consultancy-title"
                          className="mt-0.5 text-xl font-black tracking-tight text-slate-950 sm:text-[22px]"
                        >
                          Talk to an Expert
                        </h2>

                        <p className="mt-1 max-w-md text-[11px] leading-4 text-slate-500">
                          Choose your consultation
                          type and book your
                          consultation.
                        </p>
                      </div>
                    </div>

                    {/* Close */}

                    <button
                      type="button"
                      onClick={handleClose}
                      aria-label="Close consultation"
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-slate-50
                        text-slate-400
                        transition
                        hover:bg-slate-100
                        hover:text-slate-950
                      "
                    >
                      <FiX className="text-[17px]" />
                    </button>
                  </div>
                </div>

                {/* =================================================
                    FORM
                ================================================== */}

                <form
                  onSubmit={handleSubmit}
                  className="p-4 sm:p-5"
                >
                  {/* =================================================
                      PACKAGE SELECTION
                  ================================================== */}

                  <div>
                    <div className="flex items-end justify-between gap-3">
                      <h3 className="text-sm font-black text-slate-950 sm:text-base">
                        Select Consultation
                      </h3>

                      <span className="text-[9px] font-semibold text-slate-400">
                        Fixed packages
                      </span>
                    </div>

                    {/* Packages */}

                    <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                      {PACKAGES.map(
                        (
                          consultancyPackage,
                        ) => {
                          const Icon =
                            consultancyPackage.icon;

                          const active =
                            selectedPackageId ===
                            consultancyPackage.id;

                          return (
                            <button
                              key={
                                consultancyPackage.id
                              }
                              type="button"
                              onClick={() => {
                                setSelectedPackageId(
                                  consultancyPackage.id,
                                );

                                setError("");
                              }}
                              className={`
                                relative
                                rounded-xl
                                border
                                p-3
                                text-left
                                transition

                                ${
                                  active
                                    ? "border-amber-400 bg-amber-50/70 shadow-[0_8px_25px_rgba(245,158,11,0.08)]"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                                }
                              `}
                            >
                              {/* Active check */}

                              {active && (
                                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white">
                                  <FiCheck className="text-[11px]" />
                                </span>
                              )}

                              {/* Package icon */}

                              <div
                                className={`
                                  flex
                                  h-8
                                  w-8
                                  items-center
                                  justify-center
                                  rounded-lg

                                  ${
                                    active
                                      ? "bg-amber-500 text-white"
                                      : "bg-slate-100 text-slate-600"
                                  }
                                `}
                              >
                                <Icon className="text-[15px]" />
                              </div>

                              {/* Title */}

                              <p className="mt-2 pr-6 text-[13px] font-black text-slate-950">
                                {
                                  consultancyPackage.title
                                }
                              </p>

                              {/* Description */}

                              <p className="mt-0.5 text-[10px] leading-4 text-slate-400">
                                {
                                  consultancyPackage.description
                                }
                              </p>

                              {/* Duration + Price */}

                              <div className="mt-2 flex items-end justify-between gap-3">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                                  <FiClock />

                                  {
                                    consultancyPackage.duration
                                  }{" "}
                                  min
                                </span>

                                <span className="text-base font-black text-slate-950">
                                  ₹
                                  {
                                    consultancyPackage.price
                                  }
                                </span>
                              </div>
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>

                  {/* =================================================
                      SELECTED PACKAGE SUMMARY
                  ================================================== */}

                  <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Selected
                      </p>

                      <p className="mt-0.5 truncate text-sm font-black text-slate-900">
                        {selectedPackage.title}
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {
                          selectedPackage.duration
                        }{" "}
                        min •{" "}
                        {selectedPackage.callType ===
                        "VIDEO_CALL"
                          ? "Video Call"
                          : "Voice Call"}
                      </p>
                    </div>

                    <p className="shrink-0 text-xl font-black text-slate-950">
                      ₹{selectedPackage.price}
                    </p>
                  </div>

                  {/* =================================================
                      ERROR
                  ================================================== */}

                  {error && (
                    <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-semibold leading-5 text-red-600">
                      {error}
                    </div>
                  )}

                  {/* =================================================
                      BOOK / LOGIN BUTTON
                  ================================================== */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      mt-4
                      flex
                      min-h-[48px]
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-slate-950
                      px-5
                      text-sm
                      font-black
                      text-white
                      transition

                      hover:bg-amber-500

                      disabled:cursor-not-allowed
                      disabled:bg-slate-300
                    "
                  >
                    {loading
                      ? "Submitting..."
                      : isLoggedIn
                        ? "Book Consultation"
                        : "Login to Book Consultation"}

                    {!loading && (
                      <FiChevronRight className="text-[18px]" />
                    )}
                  </button>

                  {/* Small note */}

                  <p className="mt-2.5 text-center text-[9px] leading-4 text-slate-400">
                    Pricing is securely
                    verified by the server
                    according to the selected
                    consultation package.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingConsultant;