import { useNavigate } from "react-router-dom";
import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  FiArrowLeft,
  FiBookmark,
  FiSearch,
  FiRefreshCw,
} from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";

import { HiOutlineSparkles } from "react-icons/hi2";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { AdvocateCard } from "../../advocate";

import {
  getAuthToken,
} from "@/utils/auth";

import API_BASE_URL from "@/config/api";

/* =====================================================
   ANIMATION VARIANTS
===================================================== */

const pageVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 28,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.94,
    transition: {
      duration: 0.25,
      ease: "easeInOut",
    },
  },
};

const SavedLawyer = () => {
  const navigate = useNavigate();

  const [savedLawyers, setSavedLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  /* =====================================================
     FETCH SAVED LAWYERS
  ===================================================== */

  const fetchSavedLawyers = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          getAuthToken();

        const headers = {
          "Content-Type":
            "application/json",
        };

        /*
         * Normal OTP/password login me token
         * available ho sakta hai.
         *
         * Google cookie login me token null
         * ho sakta hai, so token mandatory
         * nahi rakhenge.
         */
        if (token) {
          headers.Authorization =
            `Bearer ${token}`;
        }

        const response =
          await fetch(
            `${API_BASE_URL}/saved-lawyers`,
            {
              method: "GET",

              credentials:
                "include",

              headers,
            },
          );

        let data = null;

        try {
          data =
            await response.json();
        } catch {
          data = null;
        }

        if (
          response.status ===
          401
        ) {
          throw new Error(
            data?.message ||
              "Your login session has expired. Please login again.",
          );
        }

        if (
          !response.ok ||
          data?.success ===
            false
        ) {
          throw new Error(
            data?.message ||
              `Failed to fetch saved lawyers (${response.status})`,
          );
        }

        setSavedLawyers(
          Array.isArray(
            data?.advocates,
          )
            ? data.advocates
            : Array.isArray(
                  data?.savedLawyers,
                )
              ? data.savedLawyers
              : [],
        );
      } catch (err) {
        console.error(
          "Fetch saved lawyers error:",
          err,
        );

        setSavedLawyers(
          [],
        );

        setError(
          err?.message ||
            "Unable to load your saved lawyers.",
        );
      } finally {
        setLoading(
          false,
        );
      }
    },
    [],
  );

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchSavedLawyers();
  }, [fetchSavedLawyers]);

  /* =====================================================
     REMOVE SAVED LAWYER
  ===================================================== */

  const handleRemoveSavedLawyer =
    async (advocateId) => {
      if (
        !advocateId ||
        removingId
      ) {
        return;
      }

      try {
        setRemovingId(
          advocateId,
        );

        const token =
          getAuthToken();

        const headers = {
          "Content-Type":
            "application/json",
        };

        if (token) {
          headers.Authorization =
            `Bearer ${token}`;
        }

        const response =
          await fetch(
            `${API_BASE_URL}/saved-lawyers/${encodeURIComponent(
              advocateId,
            )}`,
            {
              method: "DELETE",

              credentials:
                "include",

              headers,
            },
          );

        let data = null;

        try {
          data =
            await response.json();
        } catch {
          data = null;
        }

        if (
          response.status ===
          401
        ) {
          throw new Error(
            data?.message ||
              "Your login session has expired. Please login again.",
          );
        }

        if (
          !response.ok ||
          data?.success ===
            false
        ) {
          throw new Error(
            data?.message ||
              "Failed to remove saved lawyer",
          );
        }

        setSavedLawyers(
          (current) =>
            current.filter(
              (lawyer) =>
                String(
                  lawyer?.id ||
                    lawyer?._id,
                ) !==
                String(
                  advocateId,
                ),
            ),
        );
      } catch (err) {
        console.error(
          "Remove saved lawyer error:",
          err,
        );

        alert(
          err?.message ||
            "Unable to remove this saved lawyer.",
        );
      } finally {
        setRemovingId(
          null,
        );
      }
    };

  /* =====================================================
     LOADING UI
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          {/* Back skeleton */}
          <div className="mb-8 h-9 w-24 animate-pulse rounded-xl bg-slate-200" />

          {/* Header skeleton */}
          <div className="mb-10 flex items-center gap-4">
            <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-200" />

            <div className="space-y-3">
              <div className="h-7 w-52 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-4 w-72 max-w-full animate-pulse rounded-lg bg-slate-200" />
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm"
              >
                <div className="flex animate-pulse items-start gap-4">
                  <div className="h-16 w-16 shrink-0 rounded-2xl bg-slate-200" />

                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-2/3 rounded bg-slate-200" />
                    <div className="h-4 w-1/2 rounded bg-slate-100" />
                    <div className="h-4 w-3/4 rounded bg-slate-100" />
                  </div>
                </div>

                <div className="mt-6 h-11 animate-pulse rounded-xl bg-slate-100" />
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR UI
  ===================================================== */

  if (error) {
    return (
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen bg-[#f7f8fa]"
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              mb-8
              inline-flex
              items-center
              gap-2
              rounded-xl
              px-3
              py-2
              text-sm
              font-semibold
              text-slate-600
              transition-all
              duration-300
              hover:bg-white
              hover:text-slate-950
              hover:shadow-sm
            "
          >
            <FiArrowLeft className="text-[18px]" />
            Back
          </button>

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              mx-auto
              max-w-2xl
              overflow-hidden
              rounded-[28px]
              border
              border-red-100
              bg-white
              p-8
              text-center
              shadow-[0_20px_60px_rgba(15,23,42,0.07)]
              sm:p-10
            "
          >
            <div className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-red-50
            ">
              <FiBookmark
                className="text-[28px] text-red-500"
              />
            </div>

            <h2 className="mt-6 text-xl font-bold tracking-tight text-slate-950">
              Unable to load saved lawyers
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchSavedLawyers}
              className="
                mt-7
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-slate-950
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-slate-950/10
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-slate-800
                hover:shadow-xl
              "
            >
              <FiRefreshCw className="text-[17px]" />
              Try Again
            </button>
          </motion.div>

        </div>
      </motion.div>
    );
  }

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-[#f6f8fb]"
    >
      {/* soft background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-amber-100/40 blur-[120px]" />
        <div className="absolute -left-40 top-[35%] h-[420px] w-[420px] rounded-full bg-slate-200/40 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* BACK */}
        <motion.button
          type="button"
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.97 }}
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            rounded-xl
            px-3
            py-2
            text-[15px]
            font-semibold
            text-slate-600
            transition
            hover:bg-white
            hover:text-slate-950
            hover:shadow-sm
          "
        >
          <FiArrowLeft className="text-[18px]" />
          Back
        </motion.button>

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            relative
            mb-9
            overflow-hidden
            rounded-[26px]
            border
            border-slate-200/70
            bg-white
            px-6
            py-6
            shadow-[0_14px_45px_rgba(15,23,42,0.06)]
            sm:px-7
          "
        >
          <div className="absolute right-0 top-0 h-full w-52 bg-gradient-to-l from-amber-50/90 to-transparent" />

          <div className="
            relative
            flex
            flex-col
            gap-6
            sm:flex-row
            sm:items-center
            sm:justify-between
          ">
            <div className="flex items-center gap-4">

              <motion.div
                whileHover={{
                  scale: 1.05,
                  rotate: -4,
                }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 16,
                }}
                className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-amber-200
                  bg-gradient-to-br
                  from-amber-50
                  to-orange-50
                  shadow-sm
                "
              >
                <FiBookmark
                  className="text-[27px] text-amber-500"
                />
              </motion.div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="
                    text-2xl
                    font-bold
                    tracking-[-0.035em]
                    text-slate-950
                    sm:text-[30px]
                  ">
                    Saved Lawyers
                  </h1>

                  <span className="
                    inline-flex
                    items-center
                    gap-1
                    rounded-full
                    border
                    border-amber-200
                    bg-amber-50
                    px-2.5
                    py-1
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-amber-700
                  ">
                    <HiOutlineSparkles className="text-[12px]" />
                    Saved
                  </span>
                </div>

                <p className="
                  mt-1.5
                  max-w-2xl
                  text-[15px]
                  leading-6
                  text-slate-500
                ">
                  Your selected legal professionals, saved in one
                  place for quick and easy access.
                </p>
              </div>

            </div>

            {savedLawyers.length > 0 && (
              <div className="
                flex
                min-w-[150px]
                items-center
                gap-3
                rounded-2xl
                border
                border-slate-200
                bg-slate-50/80
                px-4
                py-3
              ">
                <div className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-950
                  text-sm
                  font-bold
                  text-white
                  shadow-sm
                ">
                  {savedLawyers.length}
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Total
                  </p>

                  <p className="text-sm font-semibold text-slate-800">
                    {savedLawyers.length === 1
                      ? "Saved Lawyer"
                      : "Saved Lawyers"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* EMPTY */}
        {savedLawyers.length === 0 ? (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              rounded-[28px]
              border
              border-slate-200/80
              bg-white
              px-6
              py-16
              text-center
              shadow-[0_15px_45px_rgba(15,23,42,0.05)]
            "
          >
            <motion.div
              initial={{
                scale: 0.7,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                type: "spring",
                stiffness: 170,
                damping: 15,
                delay: 0.1,
              }}
              className="
                mx-auto
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-[24px]
                border
                border-amber-200
                bg-gradient-to-br
                from-amber-50
                to-orange-50
                shadow-[0_14px_35px_rgba(245,158,11,0.15)]
              "
            >
              <FiBookmark
                className="text-[34px] text-amber-500"
              />
            </motion.div>

            <h2 className="mt-6 text-xl font-bold text-slate-950">
              No saved lawyers yet
            </h2>

            <p className="
              mx-auto
              mt-2
              max-w-md
              text-[15px]
              leading-6
              text-slate-500
            ">
              Save lawyers you are interested in and quickly
              access their profiles whenever you need legal help.
            </p>

            <motion.button
              type="button"
              onClick={() => navigate("/find-lawyer")}
              whileHover={{
                y: -2,
                scale: 1.015,
              }}
              whileTap={{
                scale: 0.97,
              }}
              className="
                mt-7
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-slate-950
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                shadow-[0_10px_25px_rgba(15,23,42,0.18)]
                transition-colors
                hover:bg-slate-800
              "
            >
              <FiSearch className="text-[17px]" />
              Find a Lawyer
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
          >
            {/* SECTION TITLE */}
            <div className="
              mb-5
              flex
              flex-col
              gap-1
              sm:flex-row
              sm:items-center
              sm:justify-between
            ">
              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  Your saved lawyers
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  Review and connect with your preferred advocates.
                </p>
              </div>

              <p className="hidden text-sm text-slate-400 sm:block">
                Select a profile to view complete details
              </p>
            </div>

            {/* CARDS */}
            <motion.div
              layout
              className="
                grid
                grid-cols-1
                gap-6
                lg:grid-cols-2
              "
            >
              <AnimatePresence mode="popLayout">
                {savedLawyers.map((advocate) => {
                  const advocateId =
                    advocate?.id ||
                    advocate?._id;

                  return (
                    <motion.div
                      layout
                      key={advocateId}
                      initial={{
                        opacity: 0,
                        y: 24,
                        scale: 0.97,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.94,
                        y: -10,
                      }}
                      transition={{
                        duration: 0.45,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      whileHover={{
                        y: -5,
                      }}
                      className="
                        group
                        relative
                        w-full
                      "
                    >
                      <div className="
                        relative
                        w-full
                        overflow-hidden
                        rounded-[26px]
                        border
                        border-slate-200/80
                        bg-amber-500
                        shadow-[0_10px_35px_rgba(15,23,42,0.06)]
                        transition-all
                        duration-500
                        group-hover:border-amber-200/80
                        group-hover:shadow-[0_22px_55px_rgba(15,23,42,0.11)]
                      ">
                        {/* small premium top gradient */}
                        <div className="
                          pointer-events-none
                          absolute
                          inset-x-0
                          top-0
                          h-20
                          bg-gradient-to-b
                          from-amber-50/50
                          to-transparent
                          opacity-0
                          transition-opacity
                          duration-500
                          group-hover:opacity-100
                        " />

                        <div className="relative h-full w-full">
                          <AdvocateCard
                            advocate={advocate}
                            onClick={() =>
                              navigate(
                                `/find-lawyer/${advocateId}`,
                              )
                            }
                          />
                        </div>
                      </div>

                      {/* REMOVE SAVED */}
                      <motion.button
                        type="button"
                        aria-label="Remove saved lawyer"
                        disabled={
                          removingId === advocateId
                        }
                        onClick={(event) => {
                          event.stopPropagation();

                          handleRemoveSavedLawyer(
                            advocateId,
                          );
                        }}
                        whileHover={{
                          scale: 1.08,
                        }}
                        whileTap={{
                          scale: 0.9,
                        }}
                        className="
                          absolute
                          right-4
                          top-4
                          z-20
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-[14px]
                          border
                          border-slate-200/80
                          bg-white/95
                          shadow-[0_8px_24px_rgba(15,23,42,0.12)]
                          backdrop-blur-xl
                          transition
                          hover:border-amber-200
                          hover:bg-amber-50
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        {removingId === advocateId ? (
                          <FiRefreshCw
                            className="animate-spin text-[18px] text-amber-500"
                          />
                        ) : (
                          
                          <FaBookmark
                            className="text-[19px] text-amber-500"
                          />
                        )}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SavedLawyer;