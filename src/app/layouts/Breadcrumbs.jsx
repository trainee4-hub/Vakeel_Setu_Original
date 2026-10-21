import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import { IoChevronForward } from "react-icons/io5";

import {
  getBreadcrumbLabel,
} from "../../utils/breadcrumbStore";

/* =========================================================
   SEGMENT LABELS OVERRIDE MAP
========================================================= */

const SEGMENT_LABELS = {
  "ipc-wiki": "Legal Assistant",
  "legal-assistant": "Legal Assistant",
  "legal-assistants": "Legal Assistant",
  "ipc": "IPC",
  "bns": "BNS",
  "faq": "FAQ",
};

/* =========================================================
   HELPERS
========================================================= */

const formatLabel = (segment = "") => {
  if (SEGMENT_LABELS[segment]) {
    return SEGMENT_LABELS[segment];
  }

  try {
    return decodeURIComponent(segment)
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase(),
      );
  } catch {
    return segment
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase(),
      );
  }
};

const isDatabaseId = (value = "") => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const mongoRegex =
    /^[0-9a-f]{24}$/i;

  const longIdRegex =
    /^[a-z0-9]{20,}$/i;

  return (
    uuidRegex.test(value) ||
    mongoRegex.test(value) ||
    longIdRegex.test(value)
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const Breadcrumbs = () => {
  const location = useLocation();

  /*
   * Used only to re-render Breadcrumbs whenever
   * breadcrumbStore gets updated by ActDetails /
   * SectionDetails.
   */
  const [, setVersion] = useState(0);

  useEffect(() => {
    const handleBreadcrumbChange = () => {
      setVersion((current) => current + 1);
    };

    window.addEventListener(
      "breadcrumb-label-change",
      handleBreadcrumbChange,
    );

    return () => {
      window.removeEventListener(
        "breadcrumb-label-change",
        handleBreadcrumbChange,
      );
    };
  }, []);

  const segments = location.pathname
    .split("/")
    .filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  /* =======================================================
     HIDDEN ROUTES
  ======================================================= */

  const hiddenPaths = [
    "/login",
    "/signup",
    "/dashboard",
    "/advocate-signup",
    "/advocate-signup/experience",
    "/advocate-signup/pricing",
  ];

  if (
    hiddenPaths.includes(
      location.pathname,
    )
  ) {
    return null;
  }

  /* =======================================================
     ROUTER STATE FALLBACKS
  ======================================================= */

  const advocateName =
    location.state?.advocateName ||
    location.state?.fromAdvocateName ||
    null;

  const stateActName =
    location.state?.actName ||
    location.state?.actTitle ||
    null;

  const stateSectionName =
    location.state?.sectionName ||
    location.state?.sectionTitle ||
    null;

  /* =======================================================
     GET LABEL
  ======================================================= */

  const getLabel = (
    segment,
    index,
  ) => {
    if (SEGMENT_LABELS[segment]) {
      return SEGMENT_LABELS[segment];
    }

    const previousSegment =
      segments[index - 1];

    /*
     * IMPORTANT:
     *
     * First check our runtime breadcrumb store.
     *
     * ActDetails / SectionDetails put real API names
     * here after loading.
     */
    const storedLabel =
      getBreadcrumbLabel(segment);

    if (storedLabel) {
      return storedLabel;
    }

    /* ================= ADVOCATE ================= */

    const isAdvocateProfileId =
      segments[0] === "find-lawyer" &&
      index === 1 &&
      isDatabaseId(segment);

    if (isAdvocateProfileId) {
      return (
        advocateName ||
        "Advocate Profile"
      );
    }

    /* ================= ACT ================= */

    const isActId =
      previousSegment === "acts" &&
      isDatabaseId(segment);

    if (isActId) {
      return (
        stateActName ||
        "Act Details"
      );
    }

    /* ================= SECTION ================= */

    const isSectionId =
      previousSegment === "sections" &&
      isDatabaseId(segment);

    if (isSectionId) {
      return (
        stateSectionName ||
        "Section Details"
      );
    }

    /* ================= OTHER IDS ================= */

    if (isDatabaseId(segment)) {
      return "Details";
    }

    return formatLabel(segment);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="bg-slate-50 pt-20">
      <nav
        aria-label="Breadcrumb"
        className="w-full px-4 py-3 sm:px-6"
      >
        <ol
          className="
            mx-auto
            flex
            max-w-7xl
            items-center
            gap-2
            overflow-hidden
            text-sm
          "
        >
          {/* HOME */}

          <li className="shrink-0">
            <Link
              to="/"
              className="
                font-bold
                text-slate-900
                transition-colors
                duration-300
                hover:text-amber-600
              "
            >
              Home
            </Link>
          </li>

          {/* PATH SEGMENTS */}

         {segments.map(
  (segment, index) => {
    // These route segments are required in the URL,
    // but we don't want to show them in the breadcrumb.
    if (
      segment === "legal-hub" ||
      segment === "sections" ||
      segment === "sections"
    ) {
      return null;
    }

    const isLast =
      index ===
      segments.length - 1;

              const path =
                "/" +
                segments
                  .slice(
                    0,
                    index + 1,
                  )
                  .join("/");

              const label =
                getLabel(
                  segment,
                  index,
                );

              return (
                <li
                  key={path}
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-2
                  "
                >
                  <IoChevronForward
                    aria-hidden="true"
                    className="
                      shrink-0
                      text-[14px]
                      text-slate-300
                    "
                  />

                  {isLast ? (
                    <span
                      title={label}
                      className="
                        max-w-[180px]
                        truncate
                        font-normal
                        text-slate-400

                        sm:max-w-[260px]
                        lg:max-w-[360px]
                      "
                    >
                      {label}
                    </span>
                  ) : (
                    <Link
                      to={path}
                      title={label}
                      className="
                        max-w-[220px]
                        truncate
                        font-bold
                        text-slate-900
                        transition-colors
                        duration-300
                        hover:text-amber-600
                      "
                    >
                      {label}
                    </Link>
                  )}
                </li>
              );
            },
          )}
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumbs;