import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiChevronDown,
  FiChevronRight,
  FiDownload,
  FiEye,
  FiFileText,
  FiList,
  FiRefreshCw,
  FiSearch,
  FiX,
} from "react-icons/fi";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  getAct,
  getActSections,
  searchAct,
} from "../services/bareActsApi";
import {
  getActPdfs,
  getActPdfDownloadUrl,
  getActPdfViewUrl,
  checkActPdfAvailability,
} from "../services/actPdfApi";
import {
  LawLibraryEmpty,
  LawLibraryError,
  LawLibrarySkeleton,
  Pagination,
} from "../components/lawLibrary/LawLibraryStates";
import {
  ALL_CHAPTERS,
  MIN_SEARCH_LENGTH,
  NO_CHAPTER,
  SEARCH_DEBOUNCE_MS,
  actTitle,
  chapterLabel,
  cleanChapterName,
  cleanChapterNo,
  filterSectionsSmart,
  groupByChapter,
  sectionLabel,
} from "../components/lawLibrary/lawLibraryUtils";
import {
  setBreadcrumbLabel,
} from "@/utils/breadcrumbStore";
const getSchedulePdfs = (pdfs = []) => {
  if (!Array.isArray(pdfs)) {
    return [];
  }
  return pdfs.filter((pdf) => {
    const searchableText = [
      pdf?.displayName,
      pdf?.fileName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return searchableText.includes("schedule");
  });
};
const SCHEDULES_TAB = "__schedules__";
const ActDetails = () => {
  const { actId } = useParams();
  const navigate = useNavigate();
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();
  const chapterParam =
    searchParams.get("chapter") ||
    ALL_CHAPTERS;
  const [act, setAct] = useState(null);
  const [allSections, setAllSections] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState(null);
  const [
    reloadToken,
    setReloadToken,
  ] = useState(0);
  const [
    pagedSections,
    setPagedSections,
  ] = useState([]);
  const [
    pagination,
    setPagination,
  ] = useState(null);
  const [
    pagedPage,
    setPagedPage,
  ] = useState(1);
  const [
    pagedLoading,
    setPagedLoading,
  ] = useState(false);
  const [
    searchInput,
    setSearchInput,
  ] = useState("");
  const [
    query,
    setQuery,
  ] = useState("");
  const [
    searchResults,
    setSearchResults,
  ] = useState([]);
  const [
    searchPagination,
    setSearchPagination,
  ] = useState(null);
  const [
    searchPage,
    setSearchPage,
  ] = useState(1);
  const [
    searchLoading,
    setSearchLoading,
  ] = useState(false);
  const [
    searchError,
    setSearchError,
  ] = useState(null);
  const [
    actPdfs,
    setActPdfs,
  ] = useState([]);
  const [
    pdfsLoading,
    setPdfsLoading,
  ] = useState(false);
  const [
    pdfErrors,
    setPdfErrors,
  ] = useState({});
  const [
    checkingPdfId,
    setCheckingPdfId,
  ] = useState(null);
  const schedulePdfs = useMemo(
    () => getSchedulePdfs(actPdfs),
    [actPdfs],
  );

  useEffect(() => {
    if (!actPdfs.length) return;
    let cancelled = false;

    actPdfs.forEach(async (pdf) => {
      try {
        const probe = await checkActPdfAvailability(pdf);
        if (cancelled) return;
        if (!probe.available && probe.status === 404) {
          setPdfErrors((prev) => ({
            ...prev,
            [pdf.id]: {
              status: 404,
              message: "PDF file not found on disk (404).",
            },
          }));
        }
      } catch {
        // Ignore background probe network errors
      }
    });

    return () => {
      cancelled = true;
    };
  }, [actPdfs]);
  const [
    drawerOpen,
    setDrawerOpen,
  ] = useState(false);
  const searchRequestRef =
    useRef(0);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [actId]);
  useEffect(() => {
    let cancelled = false;
    const loadAct = async () => {
      setLoading(true);
      setError(null);
      try {
        const result =
          await getAct(actId);
        if (cancelled) {
          return;
        }
        if (!result?.act) {
          setAct(null);
          setAllSections(null);
          setError(
            "Act not found.",
          );
          return;
        }
        setAct(result.act);
        setAllSections(
          result.sections ?? null,
        );
        setBreadcrumbLabel(
          actId,
          actTitle(result.act),
        );
      } catch (err) {
        if (cancelled) {
          return;
        }
        if (
          import.meta.env?.DEV
        ) {
          console.error(
            "[ActDetails] GET /acts/:id failed:",
            err,
          );
        }
        setAct(null);
        setAllSections(null);
        setError(
          err?.status === 404
            ? "Act not found."
            : "Unable to load this act.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    loadAct();
    return () => {
      cancelled = true;
    };
  }, [
    actId,
    reloadToken,
  ]);
  useEffect(() => {
    if (
      !actId ||
      loading ||
      !act
    ) {
      return undefined;
    }
    const controller =
      new AbortController();
    const loadPdfs = async () => {
      setPdfsLoading(true);
      try {
        const pdfs =
          await getActPdfs(
            actId,
            {
              signal:
                controller.signal,
            },
          );
        if (
          controller.signal.aborted
        ) {
          return;
        }
        setActPdfs(
          Array.isArray(pdfs)
            ? pdfs
            : [],
        );
      } catch (err) {
        if (
          err?.name ===
          "AbortError"
        ) {
          return;
        }
        if (
          import.meta.env?.DEV
        ) {
          console.error(
            "[ActDetails] GET /acts/:actId/pdfs failed:",
            err,
          );
        }
        setActPdfs([]);
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setPdfsLoading(false);
        }
      }
    };
    loadPdfs();
    return () => {
      controller.abort();
    };
  }, [
    actId,
    act,
    loading,
  ]);
  useEffect(() => {
    if (
      loading ||
      !act ||
      allSections !== null
    ) {
      return undefined;
    }
    let cancelled = false;
    const loadSections =
      async () => {
        setPagedLoading(true);
        try {
          const result =
            await getActSections(
              actId,
              {
                page:
                  pagedPage,
                limit: 20,
              },
            );
          if (cancelled) {
            return;
          }
          setPagedSections(
            result?.sections ||
              [],
          );
          setPagination(
            result?.pagination ||
              null,
          );
        } catch (err) {
          if (cancelled) {
            return;
          }
          if (
            import.meta.env?.DEV
          ) {
            console.error(
              "[ActDetails] GET /acts/:id/sections failed:",
              err,
            );
          }
          setPagedSections(
            [],
          );
          setPagination(
            null,
          );
        } finally {
          if (!cancelled) {
            setPagedLoading(
              false,
            );
          }
        }
      };
    loadSections();
    return () => {
      cancelled = true;
    };
  }, [
    actId,
    act,
    allSections,
    pagedPage,
    loading,
  ]);
  useEffect(() => {
    const trimmed =
      searchInput.trim();
    const timer =
      setTimeout(() => {
        setQuery(
          (current) => {
            if (
              current ===
              trimmed
            ) {
              return current;
            }
            setSearchPage(1);
            return trimmed;
          },
        );
      }, SEARCH_DEBOUNCE_MS);
    return () =>
      clearTimeout(timer);
  }, [searchInput]);
  // Search effect: executes search when query changes
  useEffect(() => {
    // If search text is empty (less than 1 character), reset search results
    if (query.length < MIN_SEARCH_LENGTH) {
      setSearchResults([]);
      setSearchPagination(null);
      setSearchError(null);
      return undefined;
    }

    const requestId = ++searchRequestRef.current;
    const isCurrent = () => searchRequestRef.current === requestId;

    setSearchLoading(true);
    setSearchError(null);

    // If allSections is already loaded in memory, filter instantly!
    if (Array.isArray(allSections) && allSections.length > 0) {
      const matches = filterSectionsSmart(allSections, query);
      setSearchResults(matches);
      setSearchPagination({
        page: 1,
        limit: matches.length,
        total: matches.length,
        totalPages: 1,
      });
      setSearchLoading(false);
      return undefined;
    }

    // Call API to search sections inside this act
    searchAct(actId, {
      q: query,
      page: searchPage,
      limit: 20,
    })
      .then((result) => {
        if (!isCurrent()) return;
        const rawResults = result?.results || [];
        const filtered = filterSectionsSmart(rawResults, query);
        setSearchResults(filtered);
        setSearchPagination(
          result?.pagination
            ? {
                ...result.pagination,
                total: filtered.length,
              }
            : null,
        );
      })
      .catch((err) => {
        if (!isCurrent()) return;

        if (import.meta.env?.DEV) {
          console.error("[ActDetails] GET /acts/:id/search failed:", err);
        }

        // Fallback: If backend search fails but sections are already loaded, search locally
        if (Array.isArray(allSections) && allSections.length > 0) {
          const localMatches = filterSectionsSmart(allSections, query);
          setSearchResults(localMatches);
          setSearchPagination({
            page: 1,
            limit: localMatches.length,
            total: localMatches.length,
            totalPages: 1,
          });
          setSearchError(null);
          return;
        }

        setSearchResults([]);
        setSearchPagination(null);
        setSearchError("Search is unavailable right now.");
      })
      .finally(() => {
        if (isCurrent()) {
          setSearchLoading(false);
        }
      });

    return undefined;
  }, [actId, query, searchPage, allSections]);
  const chapters = useMemo(
    () =>
      allSections
        ? groupByChapter(
            allSections,
          )
        : [],
    [allSections],
  );
  const visibleGroups =
    useMemo(() => {
      if (!allSections) {
        return [];
      }
      if (
        chapterParam ===
        ALL_CHAPTERS
      ) {
        return chapters;
      }
      return chapters.filter(
        (group) => {
          const cNo = cleanChapterNo(group.chapterNo);
          if (cNo != null) {
            return cNo.toLowerCase() === String(chapterParam).trim().toLowerCase();
          }
          if (chapterParam === NO_CHAPTER) {
            return true;
          }
          const cName = cleanChapterName(group.chapterName);
          return cName ? cName.toLowerCase() === String(chapterParam).trim().toLowerCase() : false;
        },
      );
    }, [
      allSections,
      chapters,
      chapterParam,
    ]);
  const searching =
    query.length >=
    MIN_SEARCH_LENGTH;

  const sidebarNavRef = useRef(null);

  // Set of chapter identifiers that contain the search results
  const searchResultChapterNos = useMemo(() => {
    if (!searching || searchResults.length === 0) {
      return null;
    }
    const set = new Set();
    searchResults.forEach((s) => {
      const cNo = cleanChapterNo(s?.chapterNo);
      if (cNo) {
        set.add(cNo.toLowerCase());
      } else {
        const cName = cleanChapterName(s?.chapterName);
        set.add(cName ? cName.toLowerCase() : NO_CHAPTER);
      }
    });
    return set;
  }, [searching, searchResults]);

  // Helper to check if a chapter is active (works for both normal browsing and searching)
  const isChapterActive = (groupChapterNo, groupChapterName) => {
    const cleanGroupNo = cleanChapterNo(groupChapterNo);
    const cleanName = cleanChapterName(groupChapterName);
    const groupIdentifier = cleanGroupNo
      ? cleanGroupNo.toLowerCase()
      : cleanName
        ? cleanName.toLowerCase()
        : NO_CHAPTER;

    if (searching) {
      if (!searchResultChapterNos || searchResultChapterNos.size === 0) {
        return false;
      }
      return searchResultChapterNos.has(groupIdentifier);
    }
    return groupIdentifier === String(chapterParam ?? "").trim().toLowerCase();
  };

  // When searching, auto-scroll to the highlighted chapter in the sidebar
  useEffect(() => {
    if (searching && searchResultChapterNos && searchResultChapterNos.size > 0) {
      const activeBtn = sidebarNavRef.current?.querySelector('[aria-current="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [searching, searchResultChapterNos]);

  const viewingSchedules =
    chapterParam ===
    SCHEDULES_TAB;

  const hasSections =
    (Array.isArray(allSections) && allSections.length > 0) ||
    pagedSections.length > 0;
  const hasPdfs = actPdfs.length > 0;
  const isPdfOnly =
    !hasSections &&
    (hasPdfs || pdfsLoading) &&
    (allSections !== null || !pagedLoading);
  const selectChapter = (
    value,
  ) => {
    const next =
      new URLSearchParams(
        searchParams,
      );
    if (
      value ===
      ALL_CHAPTERS
    ) {
      next.delete(
        "chapter",
      );
    } else {
      next.set(
        "chapter",
        String(value),
      );
    }
    setSearchParams(next);
    setDrawerOpen(false);
    // If a search was typed, clear it so user can browse the selected chapter
    if (searchInput) {
      setSearchInput("");
    }
  };
  const openSection = (
    section,
  ) => {
    if (!section?.id) {
      return;
    }
    setBreadcrumbLabel(
      actId,
      actTitle(act),
    );
    setBreadcrumbLabel(
      section.id,
      section.title ||
        sectionLabel(
          section,
        ) ||
        "Section",
    );
    navigate(
      `/legal-hub/law-library/acts/${actId}/sections/${section.id}`,
    );
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="h-10 w-2/3 animate-pulse rounded-2xl bg-slate-200/70" />
          <div className="mt-10">
            <LawLibrarySkeleton
              count={8}
              variant="row"
            />
          </div>
        </div>
      </div>
    );
  }
  if (
    error ||
    !act
  ) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <LawLibraryError
            message={
              error ||
              "Act not found."
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
              to="/legal-hub/law-library/acts"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 transition hover:text-am-600"
            >
              <FiArrowLeft
                className="text-lg"
                aria-hidden="true"
              />
              Back to Acts
            </Link>
          </div>
        </div>
      </div>
    );
  }
  const chapterNav = (
    <nav
      ref={sidebarNavRef}
      aria-label="Chapters"
      className="space-y-1"
    >
      <button
        type="button"
        onClick={() =>
          selectChapter(
            ALL_CHAPTERS,
          )
        }
        aria-current={
          !searching && chapterParam === ALL_CHAPTERS
            ? "true"
            : undefined
        }
        className={`w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition-colors ${
          !searching && chapterParam === ALL_CHAPTERS
            ? "bg-amber-50 text-amber-700"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        All Sections
      </button>
      {chapters.map(
        (group, index) => {
          const label = chapterLabel(group);
          if (!label) return null;

          const cNo = cleanChapterNo(group.chapterNo);
          const cName = cleanChapterName(group.chapterName);
          const groupVal = cNo || cName;
          const key = cNo
            ? `chapter-${cNo}-${index}`
            : `unchaptered-${cName || index}`;
          const active = isChapterActive(group.chapterNo, group.chapterName);
          return (
            <button
              key={key}
              type="button"
              onClick={() =>
                selectChapter(
                  groupVal,
                )
              }
              aria-current={
                active
                  ? "true"
                  : undefined
              }
              className={`w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold leading-5 transition-colors ${
                active
                  ? "bg-amber-50 text-amber-700 font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {label}
            </button>
          );
        },
      )}
      {!pdfsLoading &&
        schedulePdfs.length > 0 && (
          <button
            type="button"
            onClick={() =>
              selectChapter(
                SCHEDULES_TAB,
              )
            }
            aria-current={
              viewingSchedules
                ? "true"
                : undefined
            }
            className={`w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition-colors ${
              viewingSchedules
                ? "bg-amber-50 text-amber-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Schedules
          </button>
        )}
    </nav>
  );
  const sectionRow = (
    section,
  ) => {
    return (
      <li key={section.id}>
        <button
          type="button"
          onClick={() =>
            openSection(section)
          }
          className="group flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md focus:outline-none focus-visible:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-500/30"
        >
          {sectionLabel(
            section,
          ) && (
            <span className="inline-flex shrink-0 items-center rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
              {sectionLabel(
                section,
              )}
            </span>
          )}
          <span className="min-w-0 flex-1 truncate font-semibold text-slate-800 transition-colors group-hover:text-amber-600">
            {section.title ||
              "Untitled section"}
          </span>
          <FiChevronRight
            className="shrink-0 text-[20px] text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-amber-500"
            aria-hidden="true"
          />
        </button>
      </li>
    );
  };
  const renderPdfCards = () => {
    if (pdfsLoading) {
      return (
        <LawLibrarySkeleton
          count={2}
          variant="row"
        />
      );
    }
    if (actPdfs.length === 0) {
      return null;
    }

    return actPdfs.map((pdf, index) => {
      const viewUrl = getActPdfViewUrl(pdf);
      const downloadUrl = getActPdfDownloadUrl(pdf);
      const isSinglePdf = actPdfs.length === 1;

      // Labeling rule:
      // Single PDF: use Act's own name (act.heading falling back to act.act)
      // Multiple PDFs: label each individual PDF entry with its own displayName
      const title = isSinglePdf
        ? actTitle(act) || pdf.displayName || "Act Document"
        : pdf.displayName || actTitle(act) || "Act Document";

      const isSchedule = (pdf.displayName || "")
        .toLowerCase()
        .includes("schedule");
      const badgeLabel = isSchedule ? "Schedules" : "Official PDF";

      const pdfError = pdfErrors[pdf?.id];

      const handleView = async () => {
        if (!viewUrl) return;
        setCheckingPdfId(pdf.id);
        try {
          const probe = await checkActPdfAvailability(pdf);
          if (!probe.available) {
            setPdfErrors((prev) => ({
              ...prev,
              [pdf.id]: {
                status: probe.status,
                message:
                  probe.status === 404
                    ? "PDF file not found on disk (404)."
                    : probe.message || "Unable to open this PDF document.",
              },
            }));
            return;
          }

          setPdfErrors((prev) => {
            const next = { ...prev };
            delete next[pdf.id];
            return next;
          });

          window.open(viewUrl, "_blank", "noopener,noreferrer");
        } catch (err) {
          setPdfErrors((prev) => ({
            ...prev,
            [pdf.id]: {
              status: 0,
              message: err?.message || "Failed to open PDF.",
            },
          }));
        } finally {
          setCheckingPdfId(null);
        }
      };

      const handleDownload = () => {
        if (!downloadUrl) return;
        const link = document.createElement("a");
        link.href = downloadUrl;
        const safeFilename =
          pdf.fileName ||
          `${title.replace(/[^a-zA-Z0-9_.-]/g, "_")}.pdf`;
        link.setAttribute("download", safeFilename);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      const handleRetry = async () => {
        setCheckingPdfId(pdf.id);
        try {
          const probe = await checkActPdfAvailability(pdf);
          if (probe.available) {
            setPdfErrors((prev) => {
              const next = { ...prev };
              delete next[pdf.id];
              return next;
            });
            if (viewUrl) {
              window.open(viewUrl, "_blank", "noopener,noreferrer");
            }
          } else {
            setPdfErrors((prev) => ({
              ...prev,
              [pdf.id]: {
                status: probe.status,
                message:
                  probe.status === 404
                    ? "PDF file not found on disk (404)."
                    : probe.message || "Unable to open this PDF document.",
              },
            }));
          }
        } finally {
          setCheckingPdfId(null);
        }
      };

      if (pdfError) {
        return (
          <li
            key={pdf?.id || `${title}-${index}`}
            className="list-none"
          >
            <article className="overflow-hidden rounded-xl border border-red-200 bg-white shadow-sm transition-all duration-200">
              <div className="h-1 bg-gradient-to-r from-red-500 to-amber-500" />
              <div className="p-3.5 sm:p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600">
                      <FiAlertCircle
                        className="text-[20px]"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-red-700">
                          Unavailable
                        </span>
                      </div>
                      <h3 className="truncate text-[15px] font-extrabold leading-6 text-slate-900 sm:text-base">
                        {title}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {pdfError.message ||
                          "This PDF could not be opened (404 Not Found)."}
                      </p>
                    </div>
                  </div>
                  <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
                    <button
                      type="button"
                      onClick={handleRetry}
                      disabled={checkingPdfId === pdf.id}
                      className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition-all hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 disabled:opacity-50"
                    >
                      <FiRefreshCw
                        className={`text-[16px] ${
                          checkingPdfId === pdf.id ? "animate-spin" : ""
                        }`}
                        aria-hidden="true"
                      />
                      Retry
                    </button>
                    {downloadUrl ? (
                      <a
                        href={downloadUrl}
                        download={
                          pdf.fileName ||
                          `${title.replace(/[^a-zA-Z0-9_.-]/g, "_")}.pdf`
                        }
                        className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
                      >
                        <FiDownload
                          className="text-[16px]"
                          aria-hidden="true"
                        />
                        Download
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          </li>
        );
      }

      return (
        <li
          key={pdf?.id || `${title}-${index}`}
          className="list-none"
        >
          <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-amber-300 hover:shadow-md">
            <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-slate-800" />
            <div className="p-3.5 sm:p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700">
                    <FiFileText
                      className="text-[20px]"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-amber-700">
                        {badgeLabel}
                      </span>
                    </div>
                    <h3 className="truncate text-[15px] font-extrabold leading-6 text-slate-900 sm:text-base">
                      {title}
                    </h3>
                  </div>
                </div>
                <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
                  <button
                    type="button"
                    onClick={handleView}
                    disabled={!viewUrl || checkingPdfId === pdf.id}
                    className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition-all hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiEye
                      className="text-[16px]"
                      aria-hidden="true"
                    />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!downloadUrl}
                    className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiDownload
                      className="text-[16px]"
                      aria-hidden="true"
                    />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </article>
        </li>
      );
    });
  };

  const renderScheduleCards = () => {
    if (pdfsLoading || schedulePdfs.length === 0) {
      return null;
    }
    return schedulePdfs.map((pdf, index) => {
      const viewUrl =
        getActPdfViewUrl(pdf);
      const downloadUrl =
        getActPdfDownloadUrl(pdf);
      const title =
        actTitle(act) || "Act Schedules";
      const pdfError = pdfErrors[pdf?.id];

      const handleView = async () => {
        if (!viewUrl) {
          return;
        }
        setCheckingPdfId(pdf.id);
        try {
          const probe = await checkActPdfAvailability(pdf);
          if (!probe.available) {
            setPdfErrors((prev) => ({
              ...prev,
              [pdf.id]: {
                status: probe.status,
                message:
                  probe.status === 404
                    ? "PDF file not found on disk (404)."
                    : probe.message || "Unable to open this PDF document.",
              },
            }));
            return;
          }

          setPdfErrors((prev) => {
            const next = { ...prev };
            delete next[pdf.id];
            return next;
          });

          window.open(
            viewUrl,
            "_blank",
            "noopener,noreferrer",
          );
        } catch (err) {
          setPdfErrors((prev) => ({
            ...prev,
            [pdf.id]: {
              status: 0,
              message: err?.message || "Failed to open PDF.",
            },
          }));
        } finally {
          setCheckingPdfId(null);
        }
      };

      const handleDownload = () => {
        if (!downloadUrl) {
          return;
        }
        const link = document.createElement("a");
        link.href = downloadUrl;
        const safeFilename =
          pdf.fileName ||
          `${title.replace(/[^a-zA-Z0-9_.-]/g, "_")}.pdf`;
        link.setAttribute("download", safeFilename);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      const handleRetry = async () => {
        setCheckingPdfId(pdf.id);
        try {
          const probe = await checkActPdfAvailability(pdf);
          if (probe.available) {
            setPdfErrors((prev) => {
              const next = { ...prev };
              delete next[pdf.id];
              return next;
            });
            if (viewUrl) {
              window.open(viewUrl, "_blank", "noopener,noreferrer");
            }
          } else {
            setPdfErrors((prev) => ({
              ...prev,
              [pdf.id]: {
                status: probe.status,
                message:
                  probe.status === 404
                    ? "PDF file not found on disk (404)."
                    : probe.message || "Unable to open this PDF document.",
              },
            }));
          }
        } finally {
          setCheckingPdfId(null);
        }
      };

      if (pdfError) {
        return (
          <li
            key={pdf?.id || `${title}-${index}`}
            className="list-none"
          >
            <article className="overflow-hidden rounded-xl border border-red-200 bg-white shadow-sm transition-all duration-200">
              <div className="h-1 bg-gradient-to-r from-red-500 to-amber-500" />
              <div className="p-3.5 sm:p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600">
                      <FiAlertCircle
                        className="text-[20px]"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-red-700">
                          Unavailable
                        </span>
                      </div>
                      <h3 className="truncate text-[15px] font-extrabold leading-6 text-slate-900 sm:text-base">
                        {title}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {pdfError.message ||
                          "This PDF could not be opened (404 Not Found)."}
                      </p>
                    </div>
                  </div>
                  <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
                    <button
                      type="button"
                      onClick={handleRetry}
                      disabled={checkingPdfId === pdf.id}
                      className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition-all hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 disabled:opacity-50"
                    >
                      <FiRefreshCw
                        className={`text-[16px] ${
                          checkingPdfId === pdf.id ? "animate-spin" : ""
                        }`}
                        aria-hidden="true"
                      />
                      Retry
                    </button>
                    {downloadUrl ? (
                      <a
                        href={downloadUrl}
                        download={
                          pdf.fileName ||
                          `${title.replace(/[^a-zA-Z0-9_.-]/g, "_")}.pdf`
                        }
                        className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
                      >
                        <FiDownload
                          className="text-[16px]"
                          aria-hidden="true"
                        />
                        Download
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          </li>
        );
      }

      return (
        <li
          key={
            pdf?.id ||
            `${title}-${viewUrl}`
          }
          className="list-none"
        >
          <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-amber-300 hover:shadow-md">
            <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-slate-800" />
            <div className="p-3.5 sm:p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700">
                    <FiFileText
                      className="text-[20px]"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-amber-700">
                        Schedules
                      </span>
                    </div>
                    <h3 className="truncate text-[15px] font-extrabold leading-6 text-slate-900 sm:text-base">
                      {title}
                    </h3>
                  </div>
                </div>
                <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
                  <button
                    type="button"
                    onClick={handleView}
                    disabled={!viewUrl || checkingPdfId === pdf.id}
                    className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition-all hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiEye
                      className="text-[16px]"
                      aria-hidden="true"
                    />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!downloadUrl}
                    className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiDownload
                      className="text-[16px]"
                      aria-hidden="true"
                    />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </article>
        </li>
      );
    });
  };
return (
    <div className="min-h-screen bg-slate-50">
      {}
      <section className="border-b border-slate-100 bg-white px-4 pb-10 pt-6 sm:pt-8">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/legal-hub/law-library/acts"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-amber-600"
          >
            <FiArrowLeft
              className="text-[18px]"
              aria-hidden="true"
            />
            Back to Acts
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {actTitle(act)}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            {act.act && (
              <span>
                {act.act}
              </span>
            )}
            {act.act &&
              act.year && (
                <span>
                  •
                </span>
              )}
            {act.year && (
              <span>
                {act.year}
              </span>
            )}
          </div>
          {}
          {hasSections && (
            <div className="mt-7 max-w-xl">
              <label
                htmlFor="act-search"
                className="sr-only"
              >
                Search within this act
              </label>
              <div className="flex min-h-[52px] items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-4 transition-all focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/20">
                <FiSearch
                  className="shrink-0 text-[20px] text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="act-search"
                  type="text"
                  value={
                    searchInput
                  }
                  onChange={(
                    event,
                  ) =>
                    setSearchInput(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Search within this act..."
                  className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm font-medium text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                />
                {searchLoading && (
                  <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-amber-200 border-t-amber-500" />
                )}
                {searchInput &&
                  !searchLoading && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearchInput(
                          "",
                        )
                      }
                      aria-label="Clear search"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                      <FiX
                        className="text-[18px]"
                        aria-hidden="true"
                      />
                    </button>
                  )}
              </div>
            </div>
          )}
        </div>
      </section>
      {}
      <section className="px-4 py-12">
        <div
          className={`mx-auto ${
            chapters.length > 0
              ? "grid max-w-7xl gap-8 lg:grid-cols-[300px_minmax(0,1fr)]"
              : "max-w-4xl"
          }`}
        >
          {/* Left Sidebar: Chapters navigation (Always visible on desktop) */}
          {allSections &&
            chapters.length > 0 && (
              <aside className="hidden lg:block">
                <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Chapters
                  </p>
                  {chapterNav}
                </div>
              </aside>
            )}

          <div className="min-w-0">
            {/* Mobile Chapters button */}
            {allSections &&
              chapters.length > 0 && (
                <div className="mb-6 lg:hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setDrawerOpen(
                        true,
                      )
                    }
                    className="inline-flex min-h-[48px] w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FiList
                        className="shrink-0 text-[19px] text-amber-600"
                        aria-hidden="true"
                      />
                      <span className="truncate">
                        {viewingSchedules
                          ? "Schedules"
                          : searching && searchResults.length > 0
                            ? chapters.find((g) => {
                                const cNo = cleanChapterNo(g?.chapterNo);
                                const id = cNo ? cNo.toLowerCase() : (cleanChapterName(g?.chapterName)?.toLowerCase() || NO_CHAPTER);
                                return searchResultChapterNos?.has(id);
                              })
                              ? chapterLabel(
                                  chapters.find((g) => {
                                    const cNo = cleanChapterNo(g?.chapterNo);
                                    const id = cNo ? cNo.toLowerCase() : (cleanChapterName(g?.chapterName)?.toLowerCase() || NO_CHAPTER);
                                    return searchResultChapterNos?.has(id);
                                  }),
                                )
                              : "Search Results"
                            : chapterParam ===
                                ALL_CHAPTERS
                              ? "All Sections"
                              : (() => {
                                  const matchingGroup = chapters.find((group) => {
                                    const cNo = cleanChapterNo(group.chapterNo);
                                    if (cNo != null) return cNo.toLowerCase() === String(chapterParam).trim().toLowerCase();
                                    if (chapterParam === NO_CHAPTER) return true;
                                    const cName = cleanChapterName(group.chapterName);
                                    return cName ? cName.toLowerCase() === String(chapterParam).trim().toLowerCase() : false;
                                  });
                                  return matchingGroup ? chapterLabel(matchingGroup) : "Sections";
                                })()}
                      </span>
                    </span>
                    <FiChevronDown
                      className="shrink-0 text-[20px] text-slate-400"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              )}
            {}
            {searching ? (
              searchLoading &&
              searchResults.length ===
                0 ? (
                <LawLibrarySkeleton
                  count={6}
                  variant="row"
                />
              ) : searchError ? (
                <LawLibraryError
                  message={
                    searchError
                  }
                />
              ) : searchResults.length ===
                0 ? (
                <LawLibraryEmpty
                  icon="search_off"
                  title={`No sections match "${query}".`}
                  message="Try a different section number or keyword."
                />
              ) : (
                <>
                  <p className="mb-5 text-sm text-slate-500">
                    {searchPagination?.total ??
                      searchResults.length}{" "}
                    result
                    {(searchPagination?.total ??
                      searchResults.length) ===
                    1
                      ? ""
                      : "s"}{" "}
                    for “
                    {query}
                    ”
                  </p>
                  <ul className="space-y-3">
                    {searchResults.map(
                      (
                        section,
                      ) =>
                        sectionRow(
                          section,
                        ),
                    )}
                  </ul>
                  <Pagination
                    pagination={
                      searchPagination
                        ? {
                            ...searchPagination,
                            page:
                              searchPage,
                          }
                        : null
                    }
                    onChange={
                      setSearchPage
                    }
                    disabled={
                      searchLoading
                    }
                  />
                </>
              )
            ) : isPdfOnly ? (
              pdfsLoading ? (
                <LawLibrarySkeleton
                  count={2}
                  variant="row"
                />
              ) : (
                <ul className="space-y-3">
                  {renderPdfCards()}
                </ul>
              )
            ) : viewingSchedules ? (
              <ul className="space-y-3">
                {renderScheduleCards()}
              </ul>
            ) : allSections ? (
              visibleGroups.length ===
              0 ? (
                <LawLibraryEmpty
                  icon="article"
                  title="No sections are available for this act yet."
                />
              ) : (
                <div className="space-y-10">
                  {visibleGroups.map(
                    (
                      group,
                      index,
                    ) => {
                      const heading = chapterLabel(group);
                      return (
                        <div
                          key={
                            cleanChapterNo(group.chapterNo)
                              ? `chapter-${cleanChapterNo(group.chapterNo)}-${index}`
                              : `unchaptered-${cleanChapterName(group.chapterName) || index}`
                          }
                        >
                          {heading && (
                            <h2 className="mb-4 text-lg font-bold text-slate-900">
                              {heading}
                            </h2>
                          )}
                          <ul className="space-y-3">
                            {group.sections.map(
                              (
                                section,
                              ) =>
                                sectionRow(
                                  section,
                                ),
                            )}
                          </ul>
                        </div>
                      );
                    },
                  )}
                </div>
              )
            ) : pagedLoading ? (
              <LawLibrarySkeleton
                count={8}
                variant="row"
              />
            ) : pagedSections.length ===
              0 ? (
              <LawLibraryEmpty
                icon="article"
                title="No sections are available for this act yet."
              />
            ) : (
              <>
                <ul className="space-y-3">
                  {pagedSections.map(
                    (
                      section,
                    ) =>
                      sectionRow(
                        section,
                      ),
                  )}
                </ul>
                <Pagination
                  pagination={
                    pagination
                      ? {
                          ...pagination,
                          page:
                            pagedPage,
                        }
                      : null
                  }
                  onChange={
                    setPagedPage
                  }
                  disabled={
                    pagedLoading
                  }
                />
              </>
            )}
          </div>
        </div>
      </section>
      {}
      {drawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Select a chapter"
          className="fixed inset-0 z-[120] flex items-end lg:hidden"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() =>
              setDrawerOpen(
                false,
              )
            }
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          />
          <div className="relative flex max-h-[80vh] w-full flex-col overflow-hidden rounded-t-[26px] border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-bold text-slate-900">
                Chapters
              </h2>
              <button
                type="button"
                onClick={() =>
                  setDrawerOpen(
                    false,
                  )
                }
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              >
                <FiX
                  className="text-[18px]"
                  aria-hidden="true"
                />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {chapterNav}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ActDetails;
