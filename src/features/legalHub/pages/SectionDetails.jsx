import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";

import {
  getAct,
  getActSections,
  getSection,
} from "../services/bareActsApi";

import RichContent from "@shared/components/ui/RichContent";

import {
  LawLibraryError,
} from "../components/lawLibrary/LawLibraryStates";

import {
  setBreadcrumbLabel,
} from "@/utils/breadcrumbStore";

import {
  actTitle,
  cleanChapterName,
  cleanChapterNo,
  getSequentialSections,
  sectionLabel,
} from "../components/lawLibrary/lawLibraryUtils";

/* =========================================================
   HELPERS
========================================================= */

const normalizeSections = (result) => {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.sections)) {
    return result.sections;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  if (Array.isArray(result?.data?.sections)) {
    return result.data.sections;
  }

  return [];
};

const getSectionId = (item) =>
  item?.id ||
  item?._id ||
  item?.sectionId ||
  null;

/* =========================================================
   COMPONENT
========================================================= */

const SectionDetails = () => {
  const navigate = useNavigate();
  const {
    actId,
    sectionId,
  } = useParams();

  const [section, setSection] =
    useState(null);

  const [act, setAct] =
    useState(null);

  const [actSections, setActSections] =
    useState([]);

  const [actSectionsLoading, setActSectionsLoading] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [reloadToken, setReloadToken] =
    useState(0);

  /* =======================================================
     SCROLL TO TOP WHEN SECTION CHANGES
  ======================================================= */

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [sectionId]);

  /* =======================================================
     LOAD CURRENT SECTION
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await getSection(sectionId);

        if (cancelled) {
          return;
        }

        if (!result) {
          setSection(null);
          setError(
            "Section not found.",
          );
          return;
        }

        setSection(result);

        setBreadcrumbLabel(
          sectionId,
          result.title ||
            sectionLabel(result) ||
            "Section Details",
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        if (import.meta.env?.DEV) {
          console.error(
            "[SectionDetails] GET /sections/:id failed:",
            err,
          );
        }

        setSection(null);

        setError(
          err?.status === 404
            ? "Section not found."
            : "Unable to load this section.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [
    sectionId,
    reloadToken,
  ]);

  /* =======================================================
     LOAD PARENT ACT & ALL SECTIONS IN SEQUENTIAL ORDER
  ======================================================= */

  useEffect(() => {
    if (!actId) {
      setAct(null);
      setActSections([]);
      return undefined;
    }

    let cancelled = false;

    const loadActAndSections = async () => {
      setActSectionsLoading(true);
      try {
        const result = await getAct(actId);
        if (cancelled || !result?.act) return;

        setAct(result.act);
        setBreadcrumbLabel(actId, actTitle(result.act));

        // 1. Check if sections are embedded directly in getAct response
        let sections = normalizeSections(result.sections ?? result.act?.sections);

        // 2. Fallback to getActSections with a high limit if not embedded
        if (!sections || sections.length === 0) {
          try {
            const secResult = await getActSections(actId, { page: 1, limit: 1000 });
            sections = normalizeSections(secResult);
          } catch {
            sections = [];
          }
        }

        if (!cancelled && sections && sections.length > 0) {
          // Sort into continuous sequential reading order across all chapters
          setActSections(getSequentialSections(sections));
        }
      } catch (err) {
        if (import.meta.env?.DEV) {
          console.error("[SectionDetails] Error loading act / sections:", err);
        }
      } finally {
        if (!cancelled) {
          setActSectionsLoading(false);
        }
      }
    };

    loadActAndSections();

    return () => {
      cancelled = true;
    };
  }, [actId]);

  /* =======================================================
     FIND CURRENT SECTION INDEX
  ======================================================= */

  const currentSectionIndex = useMemo(() => {
    if (!sectionId || !actSections.length) {
      return -1;
    }

    // 1. Direct ID match
    const index = actSections.findIndex(
      (item) => String(getSectionId(item)) === String(sectionId),
    );
    if (index !== -1) return index;

    // 2. Fallback match by section label or sectionOrder
    return actSections.findIndex(
      (item) =>
        (section?.section && item?.section === section.section) ||
        (section?.sectionOrder !== undefined &&
          section?.sectionOrder !== null &&
          item?.sectionOrder === section.sectionOrder),
    );
  }, [actSections, sectionId, section]);

  /* =======================================================
     PREVIOUS SECTION
  ======================================================= */

  const previousSection = useMemo(() => {
    if (currentSectionIndex <= 0 || !actSections.length) {
      return null;
    }

    return actSections[currentSectionIndex - 1];
  }, [actSections, currentSectionIndex]);

  const previousSectionId = getSectionId(previousSection);

  /* =======================================================
     NEXT SECTION
  ======================================================= */

  const nextSection = useMemo(() => {
    if (
      currentSectionIndex === -1 ||
      !actSections.length ||
      currentSectionIndex >= actSections.length - 1
    ) {
      return null;
    }

    return actSections[currentSectionIndex + 1];
  }, [actSections, currentSectionIndex]);

  const nextSectionId = getSectionId(nextSection);

  /* =======================================================
     ROUTES
  ======================================================= */

  const secChapNo = cleanChapterNo(section?.chapterNo);
  const secChapName = cleanChapterName(section?.chapterName);
  const backParam = secChapNo || secChapName || null;

  const backToIndex =
    `/legal-hub/law-library/acts/${actId}${
      backParam
        ? `?chapter=${encodeURIComponent(
            backParam,
          )}`
        : ""
    }`;

  const previousSectionPath =
    previousSectionId
      ? `/legal-hub/law-library/acts/${actId}/sections/${previousSectionId}`
      : null;

  const nextSectionPath =
    nextSectionId
      ? `/legal-hub/law-library/acts/${actId}/sections/${nextSectionId}`
      : null;

  /* =======================================================
     KEYBOARD NAVIGATION (ArrowLeft / ArrowRight)
  ======================================================= */

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target?.isContentEditable
      ) {
        return;
      }
      if (e.key === "ArrowLeft" && previousSectionPath) {
        navigate(previousSectionPath);
      } else if (e.key === "ArrowRight" && nextSectionPath) {
        navigate(nextSectionPath);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previousSectionPath, nextSectionPath, navigate]);

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-4xl animate-pulse">
          <div className="h-6 w-24 rounded-lg bg-slate-200/70" />

          <div className="mt-5 h-10 w-3/4 rounded-2xl bg-slate-200/70" />

          <div className="mt-10 space-y-3">
            {Array.from({
              length: 8,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className={`h-3 rounded-full bg-slate-200/70 ${
                    index === 7
                      ? "w-2/3"
                      : "w-full"
                  }`}
                />
              ),
            )}
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR STATE
  ======================================================= */

  if (
    error ||
    !section
  ) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <LawLibraryError
            message={
              error ||
              "Section not found."
            }
            onRetry={() =>
              setReloadToken(
                (token) =>
                  token + 1,
              )
            }
          />

          <div className="mt-6 text-center">
            <Link
              to={`/legal-hub/law-library/acts/${actId}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 transition hover:text-amber-600"
            >
              <FiArrowLeft
                className="shrink-0 text-lg"
                aria-hidden="true"
              />

              Back to Act Index
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="border-b border-slate-100 bg-white px-4 pt-6 pb-10 sm:pt-8">
        <div className="mx-auto max-w-4xl">
          {/* Back to Act Index */}

          <Link
            to={backToIndex}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-amber-600"
          >
            <FiArrowLeft
              className="shrink-0 text-[18px]"
              aria-hidden="true"
            />

            Back to Act Index
          </Link>

          {/* Section / Chapter Badges */}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {sectionLabel(
              section,
            ) && (
              <span className="inline-flex items-center rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700">
                {sectionLabel(
                  section,
                )}
              </span>
            )}

            {(() => {
              const badgeText = secChapNo
                ? secChapName
                  ? `Chapter ${secChapNo} \u2013 ${secChapName}`
                  : `Chapter ${secChapNo}`
                : secChapName || null;
              return badgeText ? (
                <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                  {badgeText}
                </span>
              ) : null;
            })()}
          </div>

          {/* Section Title */}

          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            {section.title ||
              "Untitled section"}
          </h1>

          {/* Parent Act */}

          {act && (
            <p className="mt-3 text-sm text-slate-500">
              {actTitle(act)}

              {act.year &&
                ` • ${act.year}`}
            </p>
          )}
        </div>
      </section>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <main className="mx-auto max-w-4xl px-4 py-12">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-9">
          <RichContent
            value={
              section.description
            }
            className="text-base leading-8 text-slate-600 sm:text-[17px]"
          />
        </article>

        {/* =================================================
            PREVIOUS / NEXT NAVIGATION
        ================================================= */}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          {/* Previous Section */}

          {actSectionsLoading && !previousSectionPath ? (
            <div className="h-5 w-28 animate-pulse rounded bg-slate-200/60" />
          ) : previousSectionPath ? (
            <Link
              to={previousSectionPath}
              title={
                previousSection?.title ||
                previousSection?.section ||
                "Previous Section"
              }
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 transition hover:text-amber-600"
            >
              <FiArrowLeft
                className="shrink-0 text-lg"
                aria-hidden="true"
              />

              Previous Section
            </Link>
          ) : (
            <span />
          )}

          {/* Next Section */}

          {actSectionsLoading && !nextSectionPath ? (
            <div className="h-5 w-24 animate-pulse rounded bg-slate-200/60" />
          ) : nextSectionPath ? (
            <Link
              to={nextSectionPath}
              title={
                nextSection?.title ||
                nextSection?.section ||
                "Next Section"
              }
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 transition hover:text-amber-600"
            >
              Next Section

              <FiArrowRight
                className="shrink-0 text-lg"
                aria-hidden="true"
              />
            </Link>
          ) : (
            <span />
          )}
        </div>
      </main>
    </div>
  );
};

export default SectionDetails;