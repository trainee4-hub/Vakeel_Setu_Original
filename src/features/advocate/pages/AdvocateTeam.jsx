import {
  useCallback,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const MotionArticle = motion.article;
const MotionSection = motion.section;
import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle2,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  UserRoundPlus,
  Users,
} from "lucide-react";

import useAdvocateTeam from "../hooks/useAdvocateTeam";

import AddTeamMateModal from "../components/team/AddTeamMateModal";
import RemoveTeamMateModal from "../components/team/RemoveTeamMateModal";

/* =========================================================================
   ADVOCATE TEAM

   REAL API FLOW
   -------------------------------------------------------------------------
   GET    /api/advocates/team-mates
   GET    /api/advocates/search?barId=...
   POST   /api/advocates/:advocateId/team-request
   POST   /api/advocates/team-request/:requestId/verify
   DELETE /api/advocates/team-mates/:advocateId

   Team data is always real API data.
   No development/mock members are added here.
============================================================================ */

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

const getMateId = (mate) =>
  mate?.id ||
  mate?._id ||
  mate?.advocateId ||
  null;

const getMateName = (mate) =>
  cleanText(mate?.fullName) ||
  cleanText(mate?.name) ||
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

const getPracticeArea = (mate) =>
  cleanText(mate?.bestPracticeArea) ||
  cleanText(mate?.specialization) ||
  (Array.isArray(mate?.practiceAreas)
    ? cleanText(mate.practiceAreas[0])
    : "") ||
  "Legal Practice";

const getLocation = (mate) =>
  [
    cleanText(mate?.city),
    cleanText(mate?.state),
  ]
    .filter(Boolean)
    .join(", ") || "Location unavailable";

const getExperience = (mate) => {
  const value =
    mate?.experienceYears ??
    mate?.yearsOfExperience ??
    null;

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.max(0, number);
};

const getBarId = (mate) =>
  cleanText(
    mate?.barCouncilId,
  ) ||
  cleanText(
    mate?.barId,
  ) ||
  "";

/* =========================================================================
   AVATAR
============================================================================ */

const TeamAvatar = ({
  mate,
  size = "md",
}) => {
  const name = getMateName(mate);

  const photo =
    mate?.profilePhotoUrl ||
    mate?.profileImage ||
    mate?.avatar ||
    "";

  const sizeClass =
    size === "lg"
      ? "h-14 w-14 text-sm"
      : "h-12 w-12 text-xs";

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className={`${sizeClass} shrink-0 rounded-2xl object-cover ring-1 ring-slate-200`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 font-extrabold text-amber-700`}
    >
      {getInitials(name)}
    </div>
  );
};

/* =========================================================================
   SKELETON
============================================================================ */

const Skeleton = ({
  className = "",
}) => (
  <div
    className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`}
  />
);

const AdvocateTeamSkeleton = () => (
  <main className="w-full max-w-none px-4 pb-16 pt-5 sm:px-5 sm:pt-6 lg:px-6 xl:px-8">
    <div className="w-full space-y-5 sm:space-y-6">
      <div className="rounded-[26px] border border-slate-200 bg-white p-6">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="mt-4 h-8 w-64 max-w-full" />
        <Skeleton className="mt-3 h-4 w-[430px] max-w-full" />

        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-24 rounded-[20px]"
            />
          ))}
        </div>
      </div>

      <div className="rounded-[26px] border border-slate-200 bg-white p-5">
        <Skeleton className="h-11 w-full" />

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-48 rounded-[22px]"
            />
          ))}
        </div>
      </div>
    </div>
  </main>
);

/* =========================================================================
   STAT
============================================================================ */

const TeamStat = ({
  Icon: _Icon,
  label,
  value,
  tone = "amber",
}) => {
  const tones = {
    amber:
      "border-amber-100 bg-amber-50/60 text-amber-600",
    blue:
      "border-blue-100 bg-blue-50/60 text-blue-600",
    emerald:
      "border-emerald-100 bg-emerald-50/60 text-emerald-600",
  };

  const IconComp = _Icon;

  return (
    <div
      className={`rounded-[20px] border p-4 ${tones[tone] ||
        tones.amber
        }`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
        {IconComp ? <IconComp size={17} /> : null}
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-extrabold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
};

/* =========================================================================
   TEAM MEMBER CARD
============================================================================ */

const TeamMemberCard = ({
  mate,
  removing,
  onView,
  onRemove,
}) => {
  const experience =
    getExperience(mate);

  return (
    <MotionArticle
      whileHover={{
        y: -3,
      }}
      transition={{
        duration: 0.2,
      }}
      className="flex h-full flex-col rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.035)] transition-shadow hover:shadow-[0_14px_36px_rgba(15,23,42,0.07)] sm:p-5 cursor-pointer"
      onClick={() => onView(mate)}
    >
      <div className="flex items-start gap-3">
        <TeamAvatar mate={mate} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-extrabold text-slate-950">
              {getMateName(mate)}
            </h3>

            <CheckCircle2
              size={14}
              className="shrink-0 text-emerald-500"
            />
          </div>

          <p className="mt-1 truncate text-xs font-semibold text-amber-700">
            {getPracticeArea(mate)}
          </p>

          <p className="mt-1.5 flex items-center gap-1.5 truncate text-[11px] text-slate-400">
            <MapPin
              size={11}
              className="shrink-0"
            />

            {getLocation(mate)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {/* EXPERIENCE */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
            Experience
          </p>

          <p className="mt-1 text-xs font-bold text-slate-700">
            {experience !== null
              ? `${experience} ${experience === 1
                ? "Year"
                : "Years"
              }`
              : "—"}
          </p>
        </div>

        {/* BAR ID */}
        <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
            Bar ID
          </p>

          <p
            className="mt-1 truncate text-xs font-bold text-slate-700"
            title={getBarId(mate) || ""}
          >
            {getBarId(mate) || "—"}
          </p>
        </div>
      </div>


      <div className="mt-auto flex gap-2 pt-5">
        <button
          type="button"
          onClick={() =>
            onView(mate)
          }
          className="min-h-[42px] flex-1 rounded-xl bg-slate-950 px-3 text-xs font-bold text-white transition hover:bg-slate-800"
        >
          View Profile
        </button>

        <button
          type="button"
          disabled={removing}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(mate);
          }}
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Remove ${getMateName(
            mate,
          )} from team`}
        >
          {removing ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      </div>
    </MotionArticle>
  );
};

/* =========================================================================
   MAIN
============================================================================ */

export default function AdvocateTeam() {
  const navigate = useNavigate();

  const team =
    useAdvocateTeam();

  const [
    addModalOpen,
    setAddModalOpen,
  ] = useState(false);

  const [
    teamMateToRemove,
    setTeamMateToRemove,
  ] = useState(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    isManualRefreshing,
    setIsManualRefreshing,
  ] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (isManualRefreshing || team.teamLoading) return;
    setIsManualRefreshing(true);
    const startTime = Date.now();
    try {
      await team.refreshTeam(700);
    } finally {
      const elapsed = Date.now() - startTime;
      const minSpinMs = 700;
      if (elapsed < minSpinMs) {
        await new Promise((resolve) => setTimeout(resolve, minSpinMs - elapsed));
      }
      setIsManualRefreshing(false);
    }
  }, [isManualRefreshing, team]);

  const isSpinning = Boolean(team.teamLoading || isManualRefreshing);

  const teamMates = useMemo(
    () => (Array.isArray(team.teamMates) ? team.teamMates : []),
    [team.teamMates]
  );

  /* =========================================================================
     ADD TEAM MATE
  ========================================================================== */

  const openAddModal = () => {
    team.resetSearch?.();
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    team.resetSearch?.();
  };

  /* =========================================================================
     REMOVE
  ========================================================================== */

  const confirmRemove = async () => {
    const id =
      getMateId(
        teamMateToRemove,
      );

    if (!id) {
      return;
    }

    const removed =
      await team.removeTeamMate(id);

    if (removed) {
      setTeamMateToRemove(
        null,
      );
    }
  };

  /* =========================================================================
     FILTER
  ========================================================================== */

  const filteredMates =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      if (!query) {
        return teamMates;
      }

      return teamMates.filter(
        (mate) => {
          const searchable = [
            getMateName(mate),
            getPracticeArea(mate),
            mate?.city,
            mate?.state,
            mate?.barCouncilId,
            mate?.barId,
            ...(Array.isArray(
              mate?.practiceAreas,
            )
              ? mate.practiceAreas
              : []),
          ]
            .map(cleanText)
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            query,
          );
        },
      );
    }, [
      search,
      teamMates,
    ]);

  /* =========================================================================
     STATS
  ========================================================================== */

  const stats = useMemo(() => {
  /* ===============================
     UNIQUE CITIES
  =============================== */

  const locations = new Set();

  teamMates.forEach((mate) => {
    const city = cleanText(
      mate?.city,
    )
      .replace(/\s+/g, " ")
      .toLowerCase();

    if (city) {
      locations.add(city);
    }
  });

  /* ===============================
     UNIQUE PRACTICE AREAS
  =============================== */

  const practiceAreas =
    new Set();

  const addPracticeArea = (
    value,
  ) => {
    if (!value) return;

    /*
     * Array support
     */
    if (Array.isArray(value)) {
      value.forEach(
        addPracticeArea,
      );

      return;
    }

    /*
     * String support.
     *
     * "Civil Law, Family Law"
     * ko bhi separate areas maana jayega.
     */
    String(value)
      .split(",")
      .forEach((item) => {
        const normalized =
          cleanText(item)
            .replace(
              /\s+/g,
              " ",
            )
            .toLowerCase();

        if (normalized) {
          practiceAreas.add(
            normalized,
          );
        }
      });
  };

  teamMates.forEach((mate) => {
    /*
     * Complete practiceAreas list
     */
    addPracticeArea(
      mate?.practiceAreas,
    );

    /*
     * Best practice
     */
    addPracticeArea(
      mate?.bestPracticeArea,
    );

    /*
     * Other possible API field
     */
    addPracticeArea(
      mate?.practiceArea,
    );

    /*
     * Most important:
     * same helper used by TeamMemberCard.
     *
     * Agar card par "Legal Practice"
     * show ho raha hai to stats me bhi
     * include hoga.
     */
    addPracticeArea(
      getPracticeArea(mate),
    );
  });

  return {
    members:
      teamMates.length,

    cities:
      locations.size,

    practices:
      practiceAreas.size,
  };
}, [teamMates]);

  /* =========================================================================
     LOADING
  ========================================================================== */

  if (
    team.teamLoading &&
    !teamMates.length
  ) {
    return (
      <AdvocateTeamSkeleton />
    );
  }

  /* =========================================================================
     PAGE
  ========================================================================== */

  return (
    <>
      <main className="w-full max-w-none px-4 pb-16 pt-5 sm:px-5 sm:pt-6 lg:px-6 xl:px-8">
        <div className="w-full space-y-5 sm:space-y-6">
          {/* =========================================================
              HEADER
          ========================================================= */}

          <MotionSection
            initial={{
              opacity: 0,
              y: 14,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}
            className="relative overflow-hidden rounded-[26px] border border-slate-200/70 bg-white px-5 py-5 shadow-[0_14px_45px_rgba(15,23,42,0.05)] sm:px-6 sm:py-6"
          >
            <div className="pointer-events-none absolute right-0 top-0 h-full w-96 bg-gradient-to-l from-amber-50/80 to-transparent" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-amber-700">
                  <Sparkles
                    size={13}
                  />
                  Professional Network
                </div>

                <h1 className="mt-4 text-[24px] font-extrabold tracking-[-0.035em] text-slate-950 sm:text-[29px]">
                  Your Legal Team
                </h1>

                <p className="mt-1.5 max-w-2xl text-[14px] leading-6 text-slate-500 sm:text-[15px]">
                  Build and manage your
                  verified advocate team
                  for professional
                  collaboration.
                </p>

                <div className="mt-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    <ShieldCheck
                      size={13}
                    />
                    Verified Advocate
                    Connections
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={
                    isSpinning
                  }
                  onClick={
                    handleRefresh
                  }
                  title="Refresh team members"
                  aria-label="Refresh team members"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  <RefreshCw
                    size={16}
                    className={
                      isSpinning
                        ? "animate-spin text-amber-600"
                        : ""
                    }
                  />

                  Refresh
                </button>

                <button
                  type="button"
                  onClick={
                    openAddModal
                  }
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-extrabold text-white shadow-md shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  <UserPlus
                    size={17}
                  />
                  Add Team Mate
                </button>
              </div>
            </div>

            {/* =====================================================
                STATS
            ===================================================== */}

            <div className="relative mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <TeamStat
                Icon={Users}
                label="Team Members"
                value={
                  stats.members
                }
                tone="amber"
              />

              <TeamStat
                Icon={
                  BriefcaseBusiness
                }
                label="Practice Areas"
                value={
                  stats.practices
                }
                tone="blue"
              />

              <TeamStat
                Icon={MapPin}
                label="Cities Covered"
                value={
                  stats.cities
                }
                tone="emerald"
              />
            </div>
          </MotionSection>

          {/* =========================================================
              ERROR
          ========================================================= */}

          {team.teamError && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-red-800">
                  Unable to load your
                  team
                </p>

                <p className="mt-0.5 text-xs leading-5 text-red-700">
                  {team.teamError
                    ?.message ||
                    String(
                      team.teamError,
                    )}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleRefresh
                }
                className="shrink-0 text-xs font-extrabold text-red-700 hover:text-red-800"
              >
                Retry
              </button>
            </div>
          )}

          {/* =========================================================
              TEAM CONTENT
          ========================================================= */}

          <section className="rounded-[26px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-5 lg:p-6">
            {/* =====================================================
                TOOLBAR
            ===================================================== */}

            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-[17px] font-extrabold tracking-tight text-slate-950">
                  Team Members
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {
                    filteredMates.length
                  }{" "}
                  {filteredMates.length ===
                    1
                    ? "advocate"
                    : "advocates"}{" "}
                  in your team
                </p>
              </div>

              <div className="relative w-full sm:w-[320px]">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(
                    event,
                  ) =>
                    setSearch(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Search team member..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                />
              </div>
            </div>

            {/* =====================================================
                CARDS
            ===================================================== */}

            {filteredMates.length ? (
              <div className="mt-5 grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {filteredMates.map(
                  (
                    mate,
                    index,
                  ) => {
                    const id =
                      getMateId(
                        mate,
                      );

                    const removing =
                      String(
                        team.removingId,
                      ) ===
                      String(id);

                    return (
                      <TeamMemberCard
                        key={
                          id ||
                          index
                        }
                        mate={mate}
                        removing={
                          removing
                        }
                        onView={(
                          selectedMate,
                        ) => {
                          const mateId =
                            getMateId(
                              selectedMate,
                            );

                          if (
                            mateId
                          ) {
                            navigate(
                              `/advocate/team/${mateId}`,
                            );
                          }
                        }}
                        onRemove={
                          setTeamMateToRemove
                        }
                      />
                    );
                  },
                )}
              </div>
            ) : (
              <div className="flex min-h-[390px] flex-col items-center justify-center px-5 py-12 text-center">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-amber-100 bg-amber-50 text-amber-600">
                    <UserRoundPlus
                      size={27}
                    />
                  </div>

                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white">
                    <CheckCircle2
                      size={13}
                    />
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-extrabold tracking-tight text-slate-950">
                  {search
                    ? "No matching team member"
                    : "Build your legal team"}
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {search
                    ? "Try searching by advocate name, Bar ID, practice area or location."
                    : "Search for an active advocate by Name or BAR ID, send a team request, and complete OTP verification to establish a verified professional connection."}
                </p>

                {!search && (
                  <button
                    type="button"
                    onClick={
                      openAddModal
                    }
                    className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-extrabold text-white transition hover:bg-slate-800"
                  >
                    <UserPlus
                      size={17}
                    />
                    Add Your First
                    Team Mate
                  </button>
                )}
              </div>
            )}
          </section>

          {/* =========================================================
              INFO
          ========================================================= */}

          <section className="flex items-start gap-3 rounded-[22px] border border-blue-100 bg-blue-50/60 p-4">
            <ShieldCheck
              size={18}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <div>
              <p className="text-xs font-extrabold text-blue-900">
                Secure team
                verification
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                Search supports advocate Name or BAR ID.
                The backend excludes self and blocked advocates.
                A team connection is created only after the
                requesting advocate verifies the 6-digit OTP
                sent to the selected advocate's registered
                mobile number.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* ===============================================================
          ADD MODAL
      =============================================================== */}

      <AddTeamMateModal
        open={addModalOpen}
        team={team}
        onClose={closeAddModal}
      />

      {/* ===============================================================
          REMOVE MODAL
      =============================================================== */}

      <RemoveTeamMateModal
        mate={teamMateToRemove}
        removing={
          String(
            team.removingId,
          ) ===
          String(
            getMateId(
              teamMateToRemove,
            ),
          )
        }
        error={
          team.removeError
        }
        onCancel={() =>
          setTeamMateToRemove(
            null,
          )
        }
        onConfirm={
          confirmRemove
        }
      />
    </>
  );
}