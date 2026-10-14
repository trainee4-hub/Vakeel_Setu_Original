import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  FiArrowLeft,
  FiBookOpen,
  FiClock,
  FiFileText,
  FiRefreshCw,
} from "react-icons/fi";

import {
  MdHistory,
  MdNewReleases,
  MdUpdate,
} from "react-icons/md";

import { getGuideById, getUpdateById } from "../services/legalHubApi";
import RichContent from "@shared/components/ui/RichContent";
import { hasRichText, richTextToPlain } from "@shared/utils/richText";

/* ============================================================
   TYPE CONFIG

   Route: /legal-hub/:type/:id
   Articles -> BlogDetails and Rights -> RightDetails own their
   pages. This page serves guides and updates; any other type
   shows Not Found.

   normalize() returns `sections` so a guide (one body) and an
   update (old -> new) render through the same layout.
============================================================ */

const TYPES = {
  guides: {
    label: "Guide",
    plural: "Guides",
    Icon: FiBookOpen,
    backTo: "/legal-hub/guides",
    notFoundTitle: "Guide not found",
    fetch: getGuideById,

    normalize: (guide) => ({
      title: guide.title,
      date: guide.createdAt,
      updatedAt: null,
      sections: [
        {
          key: "body",
          heading: null,
          tone: "plain",
          text: guide.description,
        },
      ],
    }),
  },

  updates: {
    label: "Legal Update",
    plural: "Updates",
    Icon: MdUpdate,
    backTo: "/legal-hub/updates",
    notFoundTitle: "Update not found",
    fetch: getUpdateById,

    normalize: (update) => ({
      title: update.title,
      date: update.createdAt,
      updatedAt: update.updatedAt,
      sections: [
        {
          key: "old",
          heading: "Previously",
          tone: "old",
          text: update.oldDescription,
        },
        {
          key: "new",
          heading: "What's changed",
          tone: "new",
          text: update.newDescription,
        },
      ],
    }),
  },
};

const SECTION_TONES = {
  plain: null,

  old: {
    wrapper: "border-slate-200 bg-white",
    badge: "bg-slate-100 text-slate-600",
    Icon: MdHistory,
  },

  new: {
    wrapper: "border-amber-200 bg-amber-50/60",
    badge: "bg-amber-100 text-amber-700",
    Icon: MdNewReleases,
  },
};

/* ============================================================
   HELPERS
============================================================ */

const readingTime = (sections) => {
  const words = sections
    .map((section) => richTextToPlain(section.text))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

  return `${Math.max(1, Math.ceil(words / 200))} min read`;
};

const formatDate = (value) => {
  if (!value) return "";

  /* Legacy records may have an HTML-wrapped date; unwrap before parsing. */
  const date = new Date(richTextToPlain(value));

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

/* ============================================================
   PAGE
============================================================ */

const LegalHubDetail = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();

  const config = TYPES[type] || null;

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(Boolean(config));
  const [errorKind, setErrorKind] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [type, id]);

  useEffect(() => {
    if (!config) return undefined;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setErrorKind(null);

      try {
        const result = await config.fetch(id);

        if (cancelled) return;

        if (!result) {
          setContent(null);
          setErrorKind("not_found");
          return;
        }

        setContent(config.normalize(result));
      } catch (err) {
        if (cancelled) return;

        if (import.meta.env?.DEV) {
          console.error(
            `[LegalHubDetail] GET /${type}/${id} failed:`,
            err,
          );
        }

        setContent(null);

        /*
          Only a 404 gets a specific message;
          everything else is generic so no raw
          server text reaches the page.
        */
        setErrorKind(
          err?.status === 404 ? "not_found" : "failed",
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
  }, [config, type, id, reloadToken]);

  useEffect(() => {
    if (!content?.title) return undefined;

    const previousTitle = document.title;

    document.title = `${content.title} | Vakeel Setu`;

    return () => {
      document.title = previousTitle;
    };
  }, [content]);

  /* ---------------- unknown type ---------------- */

  if (!config) {
    return (
      <NotFound
        Icon={FiFileText}
        title="Resource Not Found"
        message="The requested legal resource is not available."
        onBack={() => navigate("/legal-hub")}
        backLabel="Back to Legal Hub"
      />
    );
  }

  const backLabel = `Back to ${config.plural}`;

  /* ---------------- loading ---------------- */

  if (loading) {
    return <DetailSkeleton />;
  }

  /* ---------------- errors ---------------- */

  if (errorKind === "not_found") {
    return (
      <NotFound
        Icon={config.Icon}
        title={config.notFoundTitle}
        message="It may have been removed, or the link may be incorrect."
        onBack={() => navigate(config.backTo)}
        backLabel={backLabel}
      />
    );
  }

  if (errorKind === "failed" || !content) {
    return (
      <NotFound
        Icon={config.Icon}
        title={`Unable to load this ${config.label.toLowerCase()}`}
        message="Please check your connection and try again."
        onBack={() => navigate(config.backTo)}
        backLabel={backLabel}
        onRetry={() =>
          setReloadToken((value) => value + 1)
        }
      />
    );
  }

  const published = formatDate(content.date);
  const edited = formatDate(content.updatedAt);
  const showEdited = edited && edited !== published;

  const TypeIcon = config.Icon;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-14 lg:py-8">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
              <TypeIcon
                className="text-sm"
                aria-hidden="true"
              />

              {config.label}
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              {content.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              <FiClock
                className="text-lg"
                aria-hidden="true"
              />

              <span>{readingTime(content.sections)}</span>

              {published && (
                <>
                  <span>•</span>
                  <span>Published {published}</span>
                </>
              )}

              {showEdited && (
                <>
                  <span>•</span>
                  <span>Updated {edited}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="space-y-8">
          {content.sections.map((section) => (
            <ContentSection
              key={section.key}
              section={section}
            />
          ))}
        </div>

        <div className="mt-10">
          <Link
            to={config.backTo}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 transition hover:text-amber-600"
          >
            <FiArrowLeft
              className="text-lg"
              aria-hidden="true"
            />

            {backLabel}
          </Link>
        </div>
      </main>
    </div>
  );
};

/* ============================================================
   CONTENT SECTION
============================================================ */

const ContentSection = ({ section }) => {
  const tone = SECTION_TONES[section.tone];

  /* hasRichText treats "<p></p>" and "<p><br></p>" as empty. */
  if (!hasRichText(section.text)) {
    return null;
  }

  const body = (
    <RichContent
      value={section.text}
      className="text-base leading-8 text-slate-600 sm:text-lg"
    />
  );

  /* Guides: plain body, exactly as before. */
  if (!tone) {
    return body;
  }

  const ToneIcon = tone.Icon;

  /* Updates: labelled old/new panels. */
  return (
    <section
      className={`rounded-2xl border p-6 sm:p-8 ${tone.wrapper}`}
    >
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${tone.badge}`}
      >
        <ToneIcon
          className="text-sm"
          aria-hidden="true"
        />

        {section.heading}
      </span>

      <div className="mt-5">{body}</div>
    </section>
  );
};

/* ============================================================
   STATES
============================================================ */

const DetailSkeleton = () => (
  <div className="min-h-screen animate-pulse bg-slate-50">
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="h-3 w-40 rounded-full bg-slate-100" />

        <div className="mt-8 h-7 w-28 rounded-full bg-slate-100" />

        <div className="mt-5 h-12 w-3/4 rounded-2xl bg-slate-100" />

        <div className="mt-5 h-3 w-56 rounded-full bg-slate-100" />
      </div>
    </div>

    <div className="px-4 sm:px-6">
      <div className="mx-auto h-[220px] max-w-7xl rounded-3xl bg-slate-200/70 sm:h-[280px] lg:h-[320px]" />
    </div>

    <div className="mx-auto max-w-4xl space-y-4 px-4 py-12 sm:px-6">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className={`h-3 rounded-full bg-slate-200/70 ${
            index === 6 ? "w-2/3" : "w-full"
          }`}
        />
      ))}
    </div>
  </div>
);

const NotFound = ({
  Icon,
  title,
  message,
  onBack,
  backLabel,
  onRetry,
}) => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
        <Icon
          className="text-3xl text-amber-600"
          aria-hidden="true"
        />
      </div>

      <h1 className="mt-5 text-2xl font-bold text-slate-900">
        {title}
      </h1>

      <p className="mt-2 text-slate-500">
        {message}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
        >
          <FiArrowLeft
            className="text-lg"
            aria-hidden="true"
          />

          {backLabel}
        </button>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
          >
            <FiRefreshCw
              className="text-lg"
              aria-hidden="true"
            />

            Try again
          </button>
        )}
      </div>
    </div>
  </div>
);

export default LegalHubDetail;