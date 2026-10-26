import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiEye,
  FiMapPin,
  FiSearch,
  FiShield,
  FiUserPlus,
  FiX,
} from "react-icons/fi";

import { OtpInput } from "@features/auth";

const cleanText = (value) =>
  value === null ||
  value === undefined
    ? ""
    : String(value).trim();

const getAdvocateId = (
  advocate,
) =>
  advocate?.id ||
  advocate?._id ||
  null;

const getName = (
  advocate,
) =>
  cleanText(
    advocate?.fullName,
  ) ||
  cleanText(
    advocate?.name,
  ) ||
  "Advocate";

const getBarId = (
  advocate,
) =>
  cleanText(
    advocate?.barCouncilId,
  ) ||
  cleanText(
    advocate?.barId,
  ) ||
  "—";

const getPracticeArea = (
  advocate,
) =>
  cleanText(
    advocate?.bestPracticeArea,
  ) ||
  cleanText(
    advocate?.lawType,
  ) ||
  "Legal Practice";

const getProfilePhoto = (
  advocate,
) =>
  advocate?.profilePhotoUrl ||
  advocate?.profileImage ||
  "";

const getLocation = (
  advocate,
) =>
  [
    cleanText(
      advocate?.city,
    ),
    cleanText(
      advocate?.state,
    ),
  ]
    .filter(Boolean)
    .join(", ") ||
  "Location unavailable";

export default function AddTeamMateModal({
  open,
  team,
  onClose,
}) {
  const navigate =
    useNavigate();

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    otp,
    setOtp,
  ] = useState("");

  /*
   * Every time modal closes, clear its local state.
   */
  useEffect(() => {
    if (!open) {
      setQuery("");
      setOtp("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const request =
    team.pendingRequest;

  const pagination =
    team.searchPagination || {
      page: 1,
      totalPages: 0,
      total: 0,
    };

  /* =======================================================================
     CLOSE
  ======================================================================= */

  const handleClose = () => {
    if (
      team.requestLoading ||
      team.verifyLoading
    ) {
      return;
    }

    setQuery("");
    setOtp("");

    team.resetSearch?.();

    onClose?.();
  };

  /* =======================================================================
     SEARCH
  ======================================================================= */

  const handleSearch =
    async (event) => {
      event.preventDefault();

      const cleanQuery =
        query.trim();

      if (!cleanQuery) {
        return;
      }

      await team.searchAdvocates(
        cleanQuery,
        1,
      );
    };

  const handlePage = (
    page,
  ) => {
    if (
      !team.activeSearchQuery
    ) {
      return;
    }

    team.searchAdvocates(
      team.activeSearchQuery,
      page,
    );
  };

  /* =======================================================================
     SEND REQUEST
  ======================================================================= */

  const handleAdd = async (
    advocate,
  ) => {
    setOtp("");

    await team.sendTeamRequest(
      advocate,
    );
  };

  /* =======================================================================
     VERIFY OTP
  ======================================================================= */

  const handleVerify =
    async (event) => {
      event.preventDefault();

      if (
        !/^\d{6}$/.test(
          otp,
        )
      ) {
        return;
      }

      const targetId =
        request?.targetAdvocateId ||
        request?.targetAdvocate?.id;

      const result =
        await team.verifyPendingRequest(
          otp,
        );

      if (
        result?.verified
      ) {
        const newMemberId =
          result?.teamMate?.id ||
          targetId;

        setOtp("");

        onClose?.();

        if (newMemberId) {
          navigate(
            `/advocate/team/${newMemberId}`,
          );
        }
      }
    };

  return (
    <div
      className="fixed inset-0 z-[700] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={
        handleClose
      }
    >
      <div
        className="relative max-h-[90vh] w-full max-w-[720px] overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-2xl"
        onMouseDown={(
          event,
        ) =>
          event.stopPropagation()
        }
      >
        {/* =============================================================
            HEADER
        ============================================================= */}

        <div className="relative overflow-hidden bg-slate-950 px-5 py-5 text-white sm:px-6">
          <div className="pointer-events-none absolute -right-16 -top-24 h-52 w-52 rounded-full bg-amber-500/15 blur-3xl" />

          <button
            type="button"
            onClick={
              handleClose
            }
            disabled={
              team.requestLoading ||
              team.verifyLoading
            }
            className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <FiX size={17} />
          </button>

          <div className="relative pr-12">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-slate-950">
              {request ? (
                <FiShield
                  size={20}
                />
              ) : (
                <FiUserPlus
                  size={20}
                />
              )}
            </div>

            <h2 className="mt-4 text-xl font-black">
              {request
                ? "Verify Team Request"
                : "Add Team Mate"}
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-400">
              {request
                ? "Enter the OTP sent to the selected advocate's registered mobile number."
                : "Search an active advocate by Name or BAR ID and send a verified team request."}
            </p>
          </div>
        </div>

        {/* =============================================================
            BODY
        ============================================================= */}

        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-5 sm:p-6">
          {!request ? (
            <>
              {/* =====================================================
                  SEARCH FORM
              ===================================================== */}

              <form
                onSubmit={
                  handleSearch
                }
                className="flex flex-col gap-2 sm:flex-row"
              >
                <div className="relative flex-1">
                  <FiSearch
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="search"
                    value={query}
                    maxLength={100}
                    onChange={(
                      event,
                    ) =>
                      setQuery(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Search by advocate name or BAR ID"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    team.searchLoading ||
                    !query.trim()
                  }
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {team.searchLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <FiSearch
                      size={16}
                    />
                  )}

                  Search
                </button>
              </form>

              <p className="mt-2 text-[11px] leading-5 text-slate-400">
                Name searches support partial
                matches. BAR ID searches are
                case-insensitive.
              </p>

              {/* =====================================================
                  SEARCH ERROR
              ===================================================== */}

              {team.searchError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                  {team.searchError
                    ?.message ||
                    "Unable to search advocates."}
                </div>
              )}

              {team.requestError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                  {team.requestError
                    ?.message ||
                    "Unable to send team request."}
                </div>
              )}

              {/* =====================================================
                  RESULTS
              ===================================================== */}

              {team.searchResults
                ?.length > 0 && (
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-400">
                      Search Results
                    </p>

                    <p className="text-xs font-semibold text-slate-400">
                      {pagination.total ||
                        team.searchResults
                          .length}{" "}
                      found
                    </p>
                  </div>

                  {team.searchResults.map(
                    (advocate) => {
                      const id =
                        getAdvocateId(
                          advocate,
                        );

                      const photo =
                        getProfilePhoto(
                          advocate,
                        );

                      const requestSent =
                        team.isRequestSent?.(
                          advocate,
                        ) ||
                        advocate?.requestSent ===
                          true;

                      const isSending =
                        String(
                          team.requestingAdvocateId ||
                            "",
                        ) ===
                        String(
                          id || "",
                        );

                      return (
                        <div
                          key={id}
                          className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-amber-200 hover:shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            {photo ? (
                              <img
                                src={
                                  photo
                                }
                                alt={getName(
                                  advocate,
                                )}
                                className="h-12 w-12 shrink-0 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-sm font-black text-amber-700">
                                {getName(
                                  advocate,
                                )
                                  .split(
                                    /\s+/,
                                  )
                                  .slice(
                                    0,
                                    2,
                                  )
                                  .map(
                                    (
                                      part,
                                    ) =>
                                      part[0],
                                  )
                                  .join(
                                    "",
                                  )
                                  .toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-sm font-extrabold text-slate-950">
                                  {getName(
                                    advocate,
                                  )}
                                </h3>

                                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-600">
                                  Active
                                </span>
                              </div>

                              <p className="mt-1 text-xs font-bold text-amber-700">
                                {getPracticeArea(
                                  advocate,
                                )}
                              </p>

                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                                <span>
                                  BAR ID:{" "}
                                  <strong>
                                    {getBarId(
                                      advocate,
                                    )}
                                  </strong>
                                </span>

                                <span className="inline-flex items-center gap-1">
                                  <FiMapPin
                                    size={11}
                                  />

                                  {getLocation(
                                    advocate,
                                  )}
                                </span>

                                {Number.isFinite(
                                  Number(
                                    advocate?.experienceYears,
                                  ),
                                ) && (
                                  <span>
                                    {
                                      advocate.experienceYears
                                    }{" "}
                                    years
                                    experience
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  id
                                ) {
                                  onClose?.();
                                  navigate(
                                    `/advocate/team/${id}`,
                                  );
                                }
                              }}
                              className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                            >
                              <FiEye
                                size={14}
                              />

                              View Profile
                            </button>

                            <button
                              type="button"
                              disabled={
                                team.requestLoading ||
                                requestSent
                              }
                              onClick={() =>
                                handleAdd(
                                  advocate,
                                )
                              }
                              className={`inline-flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold transition ${
                                requestSent
                                  ? "cursor-default border border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "bg-amber-500 text-white hover:bg-amber-600"
                              } ${
                                team.requestLoading &&
                                !isSending
                                  ? "cursor-not-allowed opacity-50"
                                  : ""
                              }`}
                            >
                              {requestSent ? (
                                <>
                                  <FiCheckCircle
                                    size={14}
                                  />

                                  Request Sent
                                </>
                              ) : isSending ? (
                                <>
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                  Sending...
                                </>
                              ) : (
                                <>
                                  <FiUserPlus
                                    size={14}
                                  />

                                  Send Request
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    },
                  )}

                  {/* =================================================
                      PAGINATION
                  ================================================= */}

                  {pagination.totalPages >
                    1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        disabled={
                          team.searchLoading ||
                          pagination.page <=
                            1
                        }
                        onClick={() =>
                          handlePage(
                            pagination.page -
                              1,
                          )
                        }
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 disabled:opacity-40"
                      >
                        <FiChevronLeft
                          size={14}
                        />
                        Previous
                      </button>

                      <span className="text-xs font-semibold text-slate-500">
                        Page{" "}
                        {
                          pagination.page
                        }{" "}
                        of{" "}
                        {
                          pagination.totalPages
                        }
                      </span>

                      <button
                        type="button"
                        disabled={
                          team.searchLoading ||
                          pagination.page >=
                            pagination.totalPages
                        }
                        onClick={() =>
                          handlePage(
                            pagination.page +
                              1,
                          )
                        }
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 disabled:opacity-40"
                      >
                        Next

                        <FiChevronRight
                          size={14}
                        />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!team.searchLoading &&
                team.activeSearchQuery &&
                !team.searchError &&
                !team.searchResults
                  ?.length && (
                  <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-8 text-center">
                    <FiSearch
                      size={24}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-bold text-slate-700">
                      No advocates
                      found
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Try another name
                      or BAR ID.
                    </p>
                  </div>
                )}
            </>
          ) : (
            /* =========================================================
               OTP VERIFICATION
            ========================================================= */

            <form
              onSubmit={
                handleVerify
              }
              className="space-y-5"
            >
              <button
                type="button"
                disabled={
                  team.verifyLoading
                }
                onClick={() => {
                  team.resetSearch?.();
                  setOtp("");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-600"
              >
                <FiArrowLeft
                  size={14}
                />

                Back to search
              </button>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex gap-3">
                  <FiShield
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <div>
                    <p className="text-sm font-extrabold text-emerald-900">
                      Team request
                      initiated
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                      A 6-digit OTP has
                      been sent to the
                      selected
                      advocate's
                      registered mobile
                      number.
                    </p>

                    {request.maskedPhone && (
                      <p className="mt-2 text-xs font-bold text-emerald-800">
                        Mobile:{" "}
                        {
                          request.maskedPhone
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {request.targetAdvocate && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                    Selected Advocate
                  </p>

                  <p className="mt-1 text-sm font-extrabold text-slate-900">
                    {getName(
                      request.targetAdvocate,
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    BAR ID:{" "}
                    {getBarId(
                      request.targetAdvocate,
                    )}
                  </p>
                </div>
              )}

              <div>
                <label className="mb-3 block text-sm font-bold text-slate-700">
                  Enter 6-digit OTP
                </label>

                <OtpInput
                  value={otp}
                  onChange={
                    setOtp
                  }
                  length={6}
                  error={
                    Boolean(
                      team.verifyError,
                    )
                  }
                  disabled={
                    team.verifyLoading
                  }
                  autoFocus
                />

                <p className="mt-3 text-[11px] leading-5 text-slate-400">
                  OTP expires in{" "}
                  {request.expiresInMinutes ||
                    5}{" "}
                  minutes. Maximum 5
                  incorrect verification
                  attempts are allowed.
                </p>
              </div>

              {team.verifyError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                  {team.verifyError
                    ?.message ||
                    "OTP verification failed."}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  team.verifyLoading ||
                  otp.length !== 6
                }
                className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-bold text-white transition hover:bg-amber-500 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {team.verifyLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />

                    Verifying...
                  </>
                ) : (
                  <>
                    <FiShield
                      size={16}
                    />

                    Verify & Add
                    Team Mate
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}