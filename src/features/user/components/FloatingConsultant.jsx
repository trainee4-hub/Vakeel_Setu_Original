import {
  useMemo,
  useState,
  useEffect,
  useCallback,
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
  checkoutConsultancy,
  verifyConsultancyPayment,
  getCheckoutStatus,
} from "../services/consultancyApi";

import { isPaymentsEnabled } from "../config/paymentsConfig";
import {
  usePaymentStateMachine,
  PAYMENT_STATES,
} from "../hooks/usePaymentStateMachine";
import {
  PaymentConfirmingView,
  PaymentSuccessView,
  PaymentFailedView,
  PaymentProcessingView,
} from "./payments/PaymentScreens";

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

  // FEATURE FLAG: read in ONE place and passed down. Defaults to false.
  const paymentsEnabled = isPaymentsEnabled();

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

  // User contact fields (used for payment checkout & summary)
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  useEffect(() => {
    if (user) {
      setContactPhone(getUserPhone(user));
      setContactEmail(getUserEmail(user));
    }
  }, [user]);

  /* ==============================================================
     PAYMENT STATE MACHINE (Active when paymentsEnabled is true)
  ============================================================== */

  const handleInitiateCheckout = useCallback(async (payload) => {
    return await checkoutConsultancy(payload);
  }, []);

  const handleFallbackToFree = useCallback(async (payload) => {
    return await createConsultancyRequest(payload);
  }, []);

  const handleVerifyPayment = useCallback(async (verifyPayload) => {
    return await verifyConsultancyPayment(verifyPayload);
  }, []);

  const handleCheckStatus = useCallback(async (checkoutId) => {
    return await getCheckoutStatus(checkoutId);
  }, []);

  const {
    state: paymentState,
    errorMessage: paymentErrorMessage,
    paymentResult,
    isPayDisabled,
    startPayment,
    resetToIdle,
    checkCurrentStatus,
  } = usePaymentStateMachine({
    onInitiateCheckout: handleInitiateCheckout,
    onVerifyPayment: handleVerifyPayment,
    onCheckStatus: handleCheckStatus,
    onFallbackToFree: handleFallbackToFree,
  });

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
    resetToIdle();
    if (user) {
      setContactPhone(getUserPhone(user));
      setContactEmail(getUserEmail(user));
    }
    setModalOpen(true);
  };

  /* ==============================================================
     CLOSE MODAL
  ============================================================== */

  const handleClose = () => {
    if (
      loading ||
      paymentState === PAYMENT_STATES.STARTING ||
      paymentState === PAYMENT_STATES.POPUP_OPEN ||
      paymentState === PAYMENT_STATES.CONFIRMING
    ) {
      return;
    }

    setModalOpen(false);

    window.setTimeout(() => {
      setError("");
      setSuccess(false);
      setCreatedRequest(null);
      resetToIdle();
    }, 200);
  };

  /* ==============================================================
     VALIDATE LOGGED-IN USER CONTACT DETAILS
  ============================================================== */

  const validateUserContact = () => {
    const rawPhone = contactPhone || getUserPhone(user) || "";
    const normalizedPhone = String(rawPhone)
      .replace(/\D/g, "")
      .slice(-10);

    const rawEmail = contactEmail || getUserEmail(user) || "";
    const userEmail = String(rawEmail).trim();

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
     * Validate contact details
     */
    const validation =
      validateUserContact();

    if (!validation.valid) {
      setError(
        validation.message,
      );

      return;
    }

    /*
     * 1. If payments are ENABLED behind the flag:
     * Hand over to the explicit payment state machine.
     */
    if (paymentsEnabled) {
      await startPayment(selectedPackage, {
        phoneNumber: validation.phoneNumber,
        email: validation.email,
      });
      return;
    }

    /*
     * 2. If payments are DISABLED (default):
     * Run the existing free booking request exactly as before.
     */
    setLoading(true);

    try {
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

      if (status === 401) {
        redirectToLogin();
        return;
      }

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
            border
            border-amber-200/60
            bg-white/95
            px-3.5
            py-2
            text-left
            shadow-[0_12px_30px_rgba(15,23,42,0.12)]
            backdrop-blur-md
            transition
            duration-200

            hover:-translate-y-0.5
            hover:border-amber-300
            hover:shadow-[0_16px_36px_rgba(245,158,11,0.18)]

            sm:block
          "
        >
          <span className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 border-b border-r border-amber-200/60 bg-white/95" />

          <p className="text-[10px] font-black uppercase tracking-wider text-amber-600">
            Expert Lawyers
          </p>

          <p className="line-clamp-1 text-xs font-black text-slate-900">
            {FLOATING_MESSAGES[messageIndex]}
          </p>
        </button>

        {/* =========================================================
            FLOATING BUTTON
        ========================================================== */}

        <button
          type="button"
          onClick={handleOpen}
          aria-label="Book Consultation"
          className="
            pointer-events-auto
            relative
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-slate-950
            text-white
            shadow-[0_16px_36px_rgba(15,23,42,0.3)]
            transition
            duration-300

            hover:scale-105
            hover:bg-amber-500
            hover:shadow-[0_20px_45px_rgba(245,158,11,0.35)]

            active:scale-95

            sm:h-16
            sm:w-16
          "
        >
          {/* Subtle pulse */}
          <span
            className="
              absolute
              inset-0
              -z-10
              rounded-2xl
              bg-amber-400/30
              blur-md
              transition-opacity
            "
          />

          <FaHeadset className="text-xl sm:text-2xl" />

          {/* Online badge */}
          <span className="absolute right-2 top-2 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-500" />
          </span>
        </button>
      </div>

      {/* ===========================================================
          MODAL
      ============================================================ */}

      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="consultancy-title"
          className="
            fixed
            inset-0
            z-[190]
            flex
            items-center
            justify-center
            p-3
            sm:p-4
          "
        >
          {/* Backdrop */}

          <div
            onClick={handleClose}
            className="
              absolute
              inset-0
              bg-slate-950/60
              backdrop-blur-sm
              transition-opacity
            "
          />

          {/* Card */}

          <div
            className="
              relative
              z-10
              w-full
              max-w-lg
              overflow-hidden
              rounded-3xl
              border
              border-slate-200
              bg-white
              shadow-2xl
              transition-all
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* =====================================================
                BRANCH 1: FLAG OFF & SUCCESS (Existing Free Submitted UI)
            ====================================================== */}
            {!paymentsEnabled && success ? (
              <div className="p-6 text-center sm:p-8">
                {/* Success check */}

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <FiCheck className="text-3xl" />
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
            ) : paymentsEnabled && paymentState === PAYMENT_STATES.CONFIRMING ? (
              /* =====================================================
                  BRANCH 2: FLAG ON & CONFIRMING
              ====================================================== */
              <div className="p-6 sm:p-8">
                <PaymentConfirmingView />
              </div>
            ) : paymentsEnabled && paymentState === PAYMENT_STATES.SUCCESS ? (
              /* =====================================================
                  BRANCH 3: FLAG ON & SUCCESS
              ====================================================== */
              <div className="p-6 sm:p-8">
                <PaymentSuccessView
                  paymentResult={paymentResult}
                  onNavigateToBookings={() => {
                    handleClose();
                    navigate("/bookings");
                  }}
                  onClose={handleClose}
                />
              </div>
            ) : paymentsEnabled && paymentState === PAYMENT_STATES.FAILED ? (
              /* =====================================================
                  BRANCH 4: FLAG ON & FAILED
              ====================================================== */
              <div className="p-6 sm:p-8">
                <PaymentFailedView
                  errorMessage={paymentErrorMessage || error}
                  onTryAgain={() => {
                    setError("");
                    resetToIdle();
                  }}
                  onClose={handleClose}
                />
              </div>
            ) : paymentsEnabled && paymentState === PAYMENT_STATES.PROCESSING ? (
              /* =====================================================
                  BRANCH 5: FLAG ON & PROCESSING
              ====================================================== */
              <div className="p-6 sm:p-8">
                <PaymentProcessingView
                  onCheckStatus={checkCurrentStatus}
                  onClose={handleClose}
                />
              </div>
            ) : (
              /* =====================================================
                  BRANCH 6: PACKAGE SELECTION & PAY / BOOK FORM
              ====================================================== */
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
                      CONTACT DETAILS (Visible in Payment Flow)
                  ================================================== */}

                  {paymentsEnabled && (
                    <div className="mt-3.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Contact Details
                      </p>

                      <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="10-digit phone"
                            maxLength={10}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

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
                      BOOK / PAY BUTTON
                  ================================================== */}

                  <button
                    type="submit"
                    disabled={paymentsEnabled ? isPayDisabled : loading}
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
                    {paymentsEnabled ? (
                      paymentState === PAYMENT_STATES.STARTING ? (
                        "Initiating payment..."
                      ) : paymentState === PAYMENT_STATES.POPUP_OPEN ? (
                        "Payment in progress..."
                      ) : !isLoggedIn ? (
                        "Login to Pay"
                      ) : (
                        `Pay ₹${selectedPackage.price}`
                      )
                    ) : loading ? (
                      "Submitting..."
                    ) : isLoggedIn ? (
                      "Book Consultation"
                    ) : (
                      "Login to Book Consultation"
                    )}

                    {!loading &&
                      (!paymentsEnabled ||
                        paymentState === PAYMENT_STATES.IDLE) && (
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