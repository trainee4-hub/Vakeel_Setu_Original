import {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

import RescheduleModal from "../components/RescheduleModal";
import DetailItem from "../components/DetailItem";

import {
  getPracticeAreas,
  getModeLabel,
  getModeIcon,
  getProfileUrl,
  getUserName,
  getAdvocateName,
  normalizeConsultation,
  getStatusColor,
  getStatusIcon,
  getStatusLabel,
} from "@/utils/consultationHelpers";
import { formatPaiseToRupees } from "../utils/paymentUtils";

const MOCK_CONSULTATIONS = [
  {
    _id: "demo-active-1",
    status: "active",
    type: "video",
    consultationMode: "video",
    consultationType: "Legal Consultation",
    date: "2026-08-15",
    time: "11:00 AM",
    createdAt: "2026-08-10T09:00:00.000Z",

    user: {
      _id: "client-1",
      fullName: "Rohit Malhotra",
      name: "Rohit Malhotra",
      profileUrl: "",
    },

    advocate: {
      _id: "advocate-1",
      name: "Adv. Rahul Mehta",

      personalDetails: {
        fullName: "Adv. Rahul Mehta",
        profileUrl: "",
      },

      professionalCredentials: {
        practiceAreas: [
          "criminal_law",
          "civil_law",
        ],
        yearsOfExperience: 8,
      },
    },

    payment: {
      amount: 499,
    },
  },

  {
    _id: "demo-upcoming-1",
    status: "upcoming",
    type: "call",
    consultationMode: "call",
    consultationType: "Legal Consultation",
    date: "2026-08-20",
    time: "03:00 PM",
    createdAt: "2026-08-11T09:00:00.000Z",

    user: {
      _id: "client-2",
      fullName: "Priya Verma",
      name: "Priya Verma",
      profileUrl: "",
    },

    advocate: {
      _id: "advocate-2",
      name: "Adv. Neha Kapoor",

      personalDetails: {
        fullName: "Adv. Neha Kapoor",
        profileUrl: "",
      },

      professionalCredentials: {
        practiceAreas: ["family_law"],
        yearsOfExperience: 10,
      },
    },

    payment: {
      amount: 599,
    },
  },

  {
    _id: "demo-upcoming-2",
    status: "upcoming",
    type: "offline",
    consultationMode: "in_person",
    consultationType: "Legal Consultation",
    date: "2026-08-25",
    time: "12:00 PM",
    createdAt: "2026-08-12T09:00:00.000Z",

    user: {
      _id: "client-3",
      fullName: "Sneha Gupta",
      name: "Sneha Gupta",
      profileUrl: "",
    },

    advocate: {
      _id: "advocate-3",
      name: "Adv. Vikram Malhotra",

      personalDetails: {
        fullName: "Adv. Vikram Malhotra",
        profileUrl: "",
      },

      professionalCredentials: {
        practiceAreas: ["property_law"],
        yearsOfExperience: 15,
      },
    },

    payment: {
      amount: 999,
    },
  },

  {
    _id: "demo-past-1",
    status: "completed",
    type: "video",
    consultationMode: "video",
    consultationType: "Legal Consultation",
    date: "2026-08-05",
    time: "03:00 PM",
    createdAt: "2026-08-05T15:00:00.000Z",

    user: {
      _id: "client-4",
      fullName: "Amit Kumar",
      name: "Amit Kumar",
      profileUrl: "",
    },

    advocate: {
      _id: "advocate-4",
      name: "Adv. Arjun Singh",

      personalDetails: {
        fullName: "Adv. Arjun Singh",
        profileUrl: "",
      },

      professionalCredentials: {
        practiceAreas: [
          "corporate_law",
          "civil_law",
        ],
        yearsOfExperience: 12,
      },
    },

    payment: {
      amount: 799,
      status: "Paid",
    },
  },

  {
    _id: "demo-past-2",
    status: "completed",
    type: "call",
    consultationMode: "call",
    consultationType: "Legal Consultation",
    date: "2026-07-30",
    time: "10:30 AM",
    createdAt: "2026-07-30T10:30:00.000Z",

    user: {
      _id: "client-5",
      fullName: "Karan Malhotra",
      name: "Karan Malhotra",
      profileUrl: "",
    },

    advocate: {
      _id: "advocate-5",
      name: "Adv. Priya Sharma",

      personalDetails: {
        fullName: "Adv. Priya Sharma",
        profileUrl: "",
      },

      professionalCredentials: {
        practiceAreas: ["labour_law"],
        yearsOfExperience: 9,
      },
    },

    payment: {
      amount: 599,
      status: "Paid",
    },
  },

  {
    _id: "demo-past-3",
    status: "cancelled",
    type: "offline",
    consultationMode: "in_person",
    consultationType: "Legal Consultation",
    date: "2026-07-25",
    time: "01:00 PM",
    createdAt: "2026-07-25T13:00:00.000Z",

    user: {
      _id: "client-6",
      fullName: "Deepa Nair",
      name: "Deepa Nair",
      profileUrl: "",
    },

    advocate: {
      _id: "advocate-3",
      name: "Adv. Vikram Malhotra",

      personalDetails: {
        fullName: "Adv. Vikram Malhotra",
        profileUrl: "",
      },

      professionalCredentials: {
        practiceAreas: ["property_law"],
        yearsOfExperience: 15,
      },
    },

    payment: {
      amount: 1200,
      status: "Refunded",
    },
  },

  {
    _id: "demo-message-1",
    status: "active",
    type: "message",
    consultationMode: "message",
    consultationType:
      "Message Consultation",
    date: "2026-08-14",
    time: "09:00 AM",
    createdAt:
      "2026-08-14T09:00:00.000Z",

    user: {
      _id: "client-7",
      fullName: "Rahul Sharma",
      name: "Rahul Sharma",
      profileUrl: "",
    },

    advocate: {
      _id: "advocate-1",
      name: "Adv. Rahul Mehta",

      personalDetails: {
        fullName: "Adv. Rahul Mehta",
        profileUrl: "",
      },

      professionalCredentials: {
        practiceAreas: [
          "criminal_law",
          "civil_law",
        ],
        yearsOfExperience: 8,
      },
    },

    payment: {
      amount: 299,
    },

    messagesUsed: 3,
    messageLimit: 20,
  },
];

const ACTIVE_STATUSES = new Set([
  "active",
  "pending",
  "payment_pending",
  "upcoming",
]);

const HISTORY_STATUSES = new Set([
  "completed",
  "cancelled",
  "rejected",
]);

const Bookings = ({
  user,
  onBack,
  onViewChat,
  onFindLawyer,
}) => {
  const [allConsultations, setAllConsultations] = useState([]);

  const [
    loadingActive,
    setLoadingActive,
  ] = useState(true);

  const [
    apiError,
    setApiError,
  ] = useState(false);

  const [
    activeTab,
    setActiveTab,
  ] = useState("upcoming");

  const [
    selectedBooking,
    setSelectedBooking,
  ] = useState(null);

  const [
    rescheduleBooking,
    setRescheduleBooking,
  ] = useState(null);

  /*
   * Temporary demo loader.
   *
   * When the real backend is ready, replace only this effect
   * with the real request.
   */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const normalized =
        MOCK_CONSULTATIONS
          .map(normalizeConsultation)
          .filter(Boolean);

      setAllConsultations(normalized);

      /*
       * true means the yellow demo-data notice remains visible,
       * same as your current implementation.
       */
      setApiError(true);
      setLoadingActive(false);
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const {
    activeConsultations,
    historyConsultations,
  } = useMemo(() => {
    const active = [];
    const history = [];

    allConsultations.forEach(
      (consultation) => {
        if (
          ACTIVE_STATUSES.has(
            consultation.status,
          )
        ) {
          active.push(consultation);
          return;
        }

        if (
          HISTORY_STATUSES.has(
            consultation.status,
          )
        ) {
          history.push(consultation);
        }
      },
    );

    return {
      activeConsultations: active,
      historyConsultations: history,
    };
  }, [allConsultations]);

  const displayedConsultations =
    activeTab === "upcoming"
      ? activeConsultations
      : historyConsultations;

  const handleRescheduleSuccess = (
    updatedBooking,
  ) => {
    if (!updatedBooking?._id) return;

    setAllConsultations(
      (previous) =>
        previous.map((booking) =>
          booking._id ===
          updatedBooking._id
            ? normalizeConsultation({
                ...booking,
                ...updatedBooking,
              })
            : booking,
        ),
    );
  };

  if (
    !loadingActive &&
    allConsultations.length === 0
  ) {
    return (
      <BookingsEmptyState
        user={user}
        onBack={onBack}
        onFindLawyer={onFindLawyer}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">

      {/* HEADER */}

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-slate-900">
            <span className="rounded-lg bg-amber-100 p-2 text-amber-600">
              <span className="material-symbols-outlined">
                calendar_month
              </span>
            </span>

            My Bookings
          </h1>

          <p className="ml-1 text-slate-500">
            Manage your upcoming and
            past legal consultations.
          </p>
        </div>

        {user?.role !==
          "advocate" && (
          <button
            type="button"
            onClick={onFindLawyer}
            className="flex self-start items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 font-bold text-white shadow-md transition-all hover:bg-slate-800 md:self-auto"
          >
            <span className="material-symbols-outlined text-sm">
              add
            </span>

            New Booking
          </button>
        )}
      </div>

      {/* DEMO NOTICE */}

      {apiError &&
        !loadingActive && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <span className="material-symbols-outlined text-lg">
              info
            </span>

            <span>
              Showing demo bookings
              while the service is
              unavailable.
            </span>
          </div>
        )}

      {/* TABS */}

      <div className="mb-8 flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() =>
            setActiveTab("upcoming")
          }
          className={`relative px-6 py-3 text-sm font-bold transition-all ${
            activeTab === "upcoming"
              ? "border-b-2 border-amber-600 bg-amber-50/50 text-amber-600"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }`}
        >
          Active & Upcoming

          <span className="ml-2 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600">
            {
              activeConsultations.length
            }
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab("history")
          }
          className={`relative px-6 py-3 text-sm font-bold transition-all ${
            activeTab === "history"
              ? "border-b-2 border-amber-600 bg-amber-50/50 text-amber-600"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }`}
        >
          Past History

          <span className="ml-2 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600">
            {
              historyConsultations.length
            }
          </span>
        </button>
      </div>

      {loadingActive ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="mb-4 size-12 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />

          <p className="font-medium text-slate-400">
            Loading your bookings...
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {displayedConsultations.length >
          0 ? (
            displayedConsultations.map(
              (consultation) => (
                <BookingCard
                  key={
                    consultation._id
                  }
                  consultation={
                    consultation
                  }
                  user={user}
                  onViewChat={
                    onViewChat
                  }
                  onReschedule={
                    setRescheduleBooking
                  }
                  onViewDetails={
                    setSelectedBooking
                  }
                />
              ),
            )
          ) : (
            <EmptyTabState
              activeTab={
                activeTab
              }
              user={user}
              onFindLawyer={
                onFindLawyer
              }
            />
          )}
        </div>
      )}

      {selectedBooking && (
        <BookingDetailsModal
          consultation={
            selectedBooking
          }
          user={user}
          onClose={() =>
            setSelectedBooking(null)
          }
        />
      )}

      {rescheduleBooking && (
        <RescheduleModal
          consultation={
            rescheduleBooking
          }
          onClose={() =>
            setRescheduleBooking(
              null,
            )
          }
          onSuccess={
            handleRescheduleSuccess
          }
        />
      )}
    </div>
  );
};

const BookingCard = memo(
  function BookingCard({
    consultation,
    user,
    onViewChat,
    onReschedule,
    onViewDetails,
  }) {
    const isAdvocate =
      user?.role === "advocate";

    const userInfo =
      consultation?.user;

    const advocateInfo =
      consultation?.advocate;

    const otherParty = isAdvocate
      ? userInfo
      : advocateInfo;

    const otherPartyName =
      isAdvocate
        ? getUserName(userInfo)
        : getAdvocateName(
            advocateInfo,
          );

    const profileUrl =
      getProfileUrl(otherParty);

    const specialty =
      getPracticeAreas(
        advocateInfo,
      );

    const mode =
      consultation?.consultationMode ||
      "message";

    const status =
      consultation?.status;

    const isPast =
      HISTORY_STATUSES.has(status);

    const isActive =
      status === "active";

    const isMessageType =
      mode === "message";

    const canChat =
      isActive && isMessageType;

    return (
      <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="flex flex-col gap-6 lg:flex-row">

          {/* LEFT */}

          <div className="flex min-w-0 flex-1 items-start gap-4">
            <div className="flex shrink-0 flex-col items-center gap-2">
              <div className="size-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                {profileUrl ? (
                  <img
                    src={profileUrl}
                    alt={
                      otherPartyName
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400">
                    <span className="material-symbols-outlined text-2xl">
                      person
                    </span>
                  </div>
                )}
              </div>

              <div
                className={`min-w-[80px] rounded-md border px-2 py-1 text-center text-[10px] font-bold uppercase tracking-wider ${
                  isAdvocate
                    ? "border-blue-100 bg-blue-50 text-blue-700"
                    : "border-amber-100 bg-amber-50 text-amber-700"
                }`}
              >
                {isAdvocate
                  ? "CLIENT"
                  : "ADVOCATE"}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold leading-tight text-slate-900">
                {otherPartyName}
              </h3>

              {!isAdvocate ? (
                <p className="mt-1 text-sm text-slate-500">
                  {specialty}
                </p>
              ) : (
                <p className="mt-1 text-sm text-slate-500">
                  Consultation with
                  client
                </p>
              )}

              <div className="mt-4">
                <p className="text-base font-bold text-amber-600">
                  {isMessageType
                    ? "Message Consultation"
                    : "Legal Consultation"}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="material-symbols-outlined text-[16px]">
                      calendar_month
                    </span>

                    {
                      consultation.displayDate
                    }
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="material-symbols-outlined text-[16px]">
                      schedule
                    </span>

                    {
                      consultation.displayTime
                    }
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="material-symbols-outlined text-[16px]">
                      {getModeIcon(
                        mode,
                      )}
                    </span>

                    {getModeLabel(
                      mode,
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 lg:min-w-[210px] lg:flex-col lg:items-end lg:justify-center lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <div className="text-left lg:text-right">
              <div className="text-lg font-bold text-slate-800">
                ₹
                {consultation.displayAmount ||
                  0}
              </div>

              {/* Show Paid / Refunded badge only when payment exists with status */}
              {consultation?.payment && consultation.payment.status && (
                <div className="mt-1">
                  {String(consultation.payment.status).toUpperCase() === "PAID" ? (
                    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Paid {consultation.payment.amount ? formatPaiseToRupees(consultation.payment.amount, consultation.payment.amountRupees) : `₹${consultation.displayAmount || 0}`}
                    </span>
                  ) : String(consultation.payment.status).toUpperCase() === "REFUNDED" ? (
                    <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                      Refunded
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {String(consultation.payment.status).replace(/_/g, " ")}
                    </span>
                  )}
                </div>
              )}

              {isActive &&
                isMessageType &&
                consultation?.messageLimit && (
                  <div className="mt-1 text-xs text-slate-500">
                    {consultation.messagesUsed ||
                      0}
                    /
                    {
                      consultation.messageLimit
                    }{" "}
                    msgs used
                  </div>
                )}
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              {!isPast &&
                !isMessageType && (
                  <>
                    <button
                      type="button"
                      onClick={() => {}}
                      className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-white transition-all hover:bg-amber-600"
                    >
                      Join Meeting
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onReschedule(
                          consultation,
                        )
                      }
                      className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-700 transition-all hover:bg-amber-50"
                    >
                      Reschedule
                    </button>
                  </>
                )}

              {!isPast &&
                isMessageType &&
                canChat && (
                  <button
                    type="button"
                    onClick={() =>
                      onViewChat?.(
                        consultation._id,
                      )
                    }
                    className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-white transition-all hover:bg-amber-600"
                  >
                    Open Chat

                    <span className="material-symbols-outlined text-[15px]">
                      arrow_forward
                    </span>
                  </button>
                )}

              {isPast && (
                <button
                  type="button"
                  onClick={() =>
                    onViewDetails(
                      consultation,
                    )
                  }
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50"
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

const EmptyTabState = memo(
  function EmptyTabState({
    activeTab,
    user,
    onFindLawyer,
  }) {
    const isUpcoming =
      activeTab === "upcoming";

    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-white shadow-sm">
          <span className="material-symbols-outlined text-3xl text-slate-300">
            {isUpcoming
              ? "event_available"
              : "history"}
          </span>
        </div>

        <p className="mb-1 font-bold text-slate-700">
          {isUpcoming
            ? "No Active Consultations"
            : "No Past Consultations"}
        </p>

        <p className="max-w-sm text-center text-sm text-slate-400">
          {isUpcoming
            ? "Your upcoming consultations will appear here."
            : "Your completed and cancelled consultations will appear here."}
        </p>

        {isUpcoming &&
          user?.role !==
            "advocate" && (
            <button
              type="button"
              onClick={
                onFindLawyer
              }
              className="mt-6 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-amber-600"
            >
              Book Consultation
            </button>
          )}
      </div>
    );
  },
);

const BookingsEmptyState = ({
  user,
  onBack,
  onFindLawyer,
}) => {
  const isAdvocate =
    user?.role === "advocate";

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-xl shadow-slate-200/40">
        <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-amber-400 to-amber-600" />

        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-amber-50 opacity-60 blur-3xl" />

        <div
          className={`pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full opacity-60 blur-3xl ${
            isAdvocate
              ? "bg-blue-50"
              : "bg-emerald-50"
          }`}
        />

        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`mb-8 rounded-full border p-6 shadow-sm ${
              isAdvocate
                ? "border-slate-100 bg-slate-50"
                : "border-amber-100 bg-amber-50"
            }`}
          >
            <span
              className={`material-symbols-outlined text-6xl ${
                isAdvocate
                  ? "text-slate-400"
                  : "text-amber-500"
              }`}
            >
              {isAdvocate
                ? "calendar_month"
                : "event_available"}
            </span>
          </div>

          <h1 className="mb-4 text-3xl font-bold text-slate-900">
            {isAdvocate
              ? "Awaiting New Bookings"
              : "No Bookings Yet"}
          </h1>

          <p className="mx-auto mb-8 max-w-lg leading-relaxed text-slate-500">
            {isAdvocate
              ? "Your profile is live and visible to potential clients. Upcoming consultations will appear here once booked."
              : "Connect with verified legal experts. Book a consultation to get professional advice tailored to your needs."}
          </p>

          {!isAdvocate ? (
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={
                  onFindLawyer
                }
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-3.5 text-lg font-bold text-white shadow-lg shadow-amber-500/30 transition-all hover:-translate-y-1 hover:bg-amber-600"
              >
                Find a Lawyer

                <span className="material-symbols-outlined">
                  search
                </span>
              </button>

              <button
                type="button"
                onClick={onBack}
                className="rounded-xl px-6 py-3.5 font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const BookingDetailsModal = ({
  consultation,
  user,
  onClose,
}) => {
  const isAdvocate =
    user?.role === "advocate";

  const otherParty = isAdvocate
    ? consultation?.user
    : consultation?.advocate;

  const name = isAdvocate
    ? getUserName(
        consultation?.user,
      )
    : getAdvocateName(
        consultation?.advocate,
      );

  const role = isAdvocate
    ? "Client"
    : "Advocate";

  const mode =
    consultation?.consultationMode ||
    "message";

  const status =
    consultation?.status;

  const profileUrl =
    getProfileUrl(otherParty);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Consultation Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {getStatusLabel(
                status,
              )}{" "}
              consultation
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
          >
            <span className="material-symbols-outlined">
              close
            </span>
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="size-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              {profileUrl ? (
                <img
                  src={profileUrl}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-2xl">
                    person
                  </span>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {name}
              </h3>

              <p className="text-sm text-slate-500">
                {role}
              </p>
            </div>
          </div>

          <div className="my-6 border-t border-slate-100" />

          <div>
            <h4 className="mb-4 text-sm font-bold text-slate-900">
              Consultation
              Information
            </h4>

            <div className="space-y-4">
              <DetailItem
                icon="calendar_month"
                label="Date"
                value={
                  consultation?.displayDate ||
                  "Date not available"
                }
              />

              <DetailItem
                icon="schedule"
                label="Time"
                value={
                  consultation?.displayTime ||
                  "Time not available"
                }
              />

              <DetailItem
                icon="gavel"
                label="Type"
                value={
                  consultation?.consultationType ||
                  "Legal Consultation"
                }
              />

              <DetailItem
                icon={getModeIcon(
                  mode,
                )}
                label="Mode"
                value={getModeLabel(
                  mode,
                )}
              />
            </div>
          </div>

          <div className="my-6 border-t border-slate-100" />

          <div>
            <h4 className="mb-4 text-sm font-bold text-slate-900">
              Payment
            </h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">
                    payments
                  </span>

                  <span className="text-sm text-slate-500">
                    Amount
                  </span>
                </div>

                <span className="text-sm font-bold text-slate-900">
                  ₹
                  {consultation?.displayAmount ||
                    0}
                </span>
              </div>

              {consultation?.payment?.status && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">
                      receipt_long
                    </span>

                    <span className="text-sm text-slate-500">
                      Payment Status
                    </span>
                  </div>

                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    {String(
                      consultation.payment.status,
                    ).replace(
                      /_/g,
                      " ",
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="my-6 border-t border-slate-100" />

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Status
            </span>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold uppercase ${getStatusColor(
                status,
              )}`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {getStatusIcon(
                  status,
                )}
              </span>

              {getStatusLabel(
                status,
              )}
            </span>
          </div>

          <div className="mt-7">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white transition-colors hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;