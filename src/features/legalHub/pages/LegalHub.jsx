import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  FiAlertCircle,
  FiArrowRight,
  FiRefreshCw,
} from "react-icons/fi";

import {
  FaBalanceScale,
  FaGavel,
  FaStar,
} from "react-icons/fa";

import {
  IoDocumentTextOutline,
  IoBookOutline,
} from "react-icons/io5";

import { getUserRights } from "../services/userRightsApi";
import { getBlogs, getGuides } from "../services/legalHubApi";
import {
  richTextExcerpt,
  richTextToPlain,
} from "@shared/utils/richText";

/* Module-scope loaders so they are stable references — the section hook
   depends on them, and inline arrows would refetch on every render. */
const loadRights = () =>
  getUserRights({ page: 1, limit: 5 }).then(
    (result) => result.rights,
  );

/* One call feeds both Featured (blogs[0]) and Articles (blogs[1..3]). */
const loadBlogs = () =>
  getBlogs({ page: 1, limit: 4 }).then(
    (result) => result.blogs,
  );

const loadGuides = () =>
  getGuides({ page: 1, limit: 6 }).then(
    (result) => result.guides,
  );

/* ============================================================
   HELPERS
============================================================ */

const toPlainText = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const excerpt = (value, max = 160) => {
  const text = toPlainText(value);

  if (text.length <= max) return text;

  return `${text
    .slice(0, max)
    .replace(/\s+\S*$/, "")}…`;
};

/** Derived from the real body, not hardcoded. HTML-aware. */
const readingTime = (value) => {
  const words = richTextToPlain(value)
    .split(" ")
    .filter(Boolean).length;

  return `${Math.max(
    1,
    Math.ceil(words / 200),
  )} min read`;
};

const articlePath = (blog) =>
  `/legal-hub/articles/${encodeURIComponent(
    blog.slug || blog.id,
  )}`;

/**
 * Each section loads independently, so one failing API never blanks the
 * whole page. `retry` re-runs only that section.
 */
const useSection = (loader) => {
  const [state, setState] = useState({
    items: [],
    loading: true,
    error: "",
  });

  const [token, setToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setState((previous) => ({
      ...previous,
      loading: true,
      error: "",
    }));

    loader()
      .then((items) => {
        if (cancelled) return;

        setState({
          items: Array.isArray(items) ? items : [],
          loading: false,
          error: "",
        });
      })
      .catch((error) => {
        if (cancelled) return;

        setState({
          items: [],
          loading: false,
          error:
            error?.message ||
            "Unable to load this section right now.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [loader, token]);

  return {
    ...state,
    retry: () =>
      setToken((value) => value + 1),
  };
};

/* ============================================================
   ICON HELPERS
============================================================ */

const SECTION_ICONS = {
  gavel: FaGavel,
  article: IoDocumentTextOutline,
  menu_book: IoBookOutline,
};

const FALLBACK_ICONS = {
  article: IoDocumentTextOutline,
  balance: FaBalanceScale,
  menu_book: IoBookOutline,
  gavel: FaGavel,
};

const SectionIcon = ({ icon, className = "" }) => {
  const IconComponent =
    SECTION_ICONS[icon] ||
    IoDocumentTextOutline;

  return (
    <IconComponent
      className={className}
      aria-hidden="true"
    />
  );
};

const FallbackIcon = ({
  icon,
  className = "",
}) => {
  const IconComponent =
    FALLBACK_ICONS[icon] ||
    IoDocumentTextOutline;

  return (
    <IconComponent
      className={className}
      aria-hidden="true"
    />
  );
};

/* ============================================================
   PAGE
============================================================ */

const LegalHub = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const rights = useSection(loadRights);
  const blogs = useSection(loadBlogs);
  const guides = useSection(loadGuides);

  const featured = blogs.items[0] || null;
  const latestArticles = blogs.items.slice(1, 4);

  useEffect(() => {
    if (!location.hash) return undefined;

    const sectionId =
      location.hash.substring(1);

    const timer = setTimeout(() => {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);

    return () => clearTimeout(timer);
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          HERO + FEATURED
      ====================================================== */}

      <section className="px-4 pb-10 pt-6 sm:pb-12 sm:pt-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-amber-600">
              Legal Resources
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Know Your Rights.
              <span className="text-amber-600">
                {" "}
                Know the Law.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Simple and practical legal information
              to help you understand your rights,
              legal procedures and important laws.
            </p>
          </div>

          {blogs.loading ? (
            <div className="h-[280px] animate-pulse rounded-3xl bg-slate-200/70" />
          ) : featured ? (
            <FeaturedCard
              blog={featured}
              onOpen={() =>
                navigate(articlePath(featured))
              }
            />
          ) : null}
        </div>
      </section>

      {/* =====================================================
          KNOW YOUR RIGHTS
      ====================================================== */}

      <section
        id="rights"
        className="scroll-mt-24 bg-white px-4 py-16"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            icon="gavel"
            title="Know Your Rights"
            description="Understand your basic legal rights in everyday situations."
          />

          <SectionBody
            section={rights}
            skeleton={
              <CardSkeleton
                count={5}
                gridClass="sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
              />
            }
            emptyText="No rights have been published yet."
          >
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {rights.items.map((right) => (
                <RightCard
                  key={right.id}
                  right={right}
                  onClick={() =>
                    navigate(
                      `/legal-hub/rights/${right.id}`,
                    )
                  }
                />
              ))}
            </div>
          </SectionBody>

          {!rights.loading &&
            !rights.error &&
            rights.items.length > 0 && (
              <ViewAllButton
                label="View All Rights"
                onClick={() =>
                  navigate("/legal-hub/rights")
                }
              />
            )}
        </div>
      </section>

      {/* =====================================================
          ARTICLES
      ====================================================== */}

      <section
        id="articles"
        className="scroll-mt-24 bg-slate-50 px-4 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            icon="article"
            title="Latest Articles"
            description="Read simple explanations of important legal topics."
          />

          <SectionBody
            section={blogs}
            skeleton={
              <CardSkeleton
                count={3}
                gridClass="md:grid-cols-2 lg:grid-cols-3"
                tall
              />
            }
            emptyText="No articles have been published yet."
          >
            {latestArticles.length > 0 && (
              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {latestArticles.map((blog) => (
                  <ArticleCard
                    key={blog.id}
                    blog={blog}
                    onClick={() =>
                      navigate(articlePath(blog))
                    }
                  />
                ))}
              </div>
            )}
          </SectionBody>

          {!blogs.loading &&
            !blogs.error &&
            blogs.items.length > 0 && (
              <ViewAllButton
                label="View All Articles"
                onClick={() => {
                  window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: "instant",
                  });

                  navigate(
                    "/legal-hub/articles",
                  );
                }}
              />
            )}
        </div>
      </section>

      {/* =====================================================
          GUIDES
      ====================================================== */}

      <section
        id="guides"
        className="scroll-mt-24 bg-white px-4 py-16"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            icon="menu_book"
            title="Legal Guides"
            description="Step-by-step guides for common legal processes."
          />

          <SectionBody
            section={guides}
            skeleton={
              <CardSkeleton
                count={3}
                gridClass="md:grid-cols-2 lg:grid-cols-3"
              />
            }
            emptyText="No guides have been published yet."
          >
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {guides.items.map((guide) => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                  onClick={() =>
                    navigate(
                      `/legal-hub/guides/${guide.id}`,
                    )
                  }
                />
              ))}
            </div>
          </SectionBody>

          {!guides.loading &&
            !guides.error &&
            guides.items.length > 0 && (
              <ViewAllButton
                label="View All Guides"
                onClick={() =>
                  navigate("/legal-hub/guides")
                }
              />
            )}
        </div>
      </section>
    </div>
  );
};

/* ============================================================
   SECTION SCAFFOLDING
============================================================ */

const SectionHeading = ({
  icon,
  title,
  description,
}) => (
  <div>
    <div className="flex items-center gap-2 text-amber-600">
      <SectionIcon
        icon={icon}
        className="text-[20px]"
      />

      <span className="text-sm font-bold uppercase tracking-[0.15em]">
        Legal Hub
      </span>
    </div>

    <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
      {title}
    </h2>

    <p className="mt-2 max-w-2xl text-slate-500">
      {description}
    </p>
  </div>
);

/** Loading -> error -> empty -> content, identical for every section. */
const SectionBody = ({
  section,
  skeleton,
  emptyText,
  children,
}) => {
  if (section.loading) return skeleton;

  if (section.error) {
    return (
      <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center sm:flex-row sm:text-left">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <FiAlertCircle className="text-[21px]" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900">
            Unable to load this section
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {section.error}
          </p>
        </div>

        <button
          type="button"
          onClick={section.retry}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
        >
          <FiRefreshCw className="text-base" />
          Try again
        </button>
      </div>
    );
  }

  if (section.items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
        <p className="text-sm font-medium text-slate-500">
          {emptyText}
        </p>
      </div>
    );
  }

  return children;
};

const CardSkeleton = ({
  count,
  gridClass,
  tall = false,
}) => (
  <div
    className={`mt-8 grid animate-pulse gap-5 ${gridClass}`}
  >
    {Array.from({ length: count }).map(
      (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <div
            className={`${
              tall ? "h-40" : "aspect-[4/3]"
            } w-full bg-slate-100`}
          />

          <div className="space-y-3 p-6">
            <div className="h-4 w-3/4 rounded-full bg-slate-100" />
            <div className="h-3 w-full rounded-full bg-slate-100" />
            <div className="h-3 w-2/3 rounded-full bg-slate-100" />
          </div>
        </div>
      ),
    )}
  </div>
);

const ViewAllButton = ({
  label,
  onClick,
}) => (
  <div className="mt-10 flex justify-center">
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:text-amber-600 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
    >
      {label}

      <FiArrowRight className="text-lg transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  </div>
);

/** Shared image with a legal-themed fallback — never a broken-image icon. */
const SafeImage = ({
  src,
  alt,
  fallbackIcon,
  className,
  fallbackClass,
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center ${fallbackClass}`}
      >
        <FallbackIcon
          icon={fallbackIcon}
          className="text-4xl"
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

const keyboardOpen =
  (onClick) => (event) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      onClick();
    }
  };

/* ============================================================
   FEATURED — newest blog
============================================================ */

const FeaturedCard = ({
  blog,
  onOpen,
}) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onOpen}
    onKeyDown={keyboardOpen(onOpen)}
    className="group relative cursor-pointer overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 lg:grid lg:grid-cols-5"
  >
    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

    <div className="relative z-10 p-7 sm:p-10 lg:col-span-3">
      <div className="mb-5 flex items-center gap-2">
        <FaStar className="text-[19px] text-amber-400" />

        <span className="text-sm font-semibold uppercase tracking-wider text-amber-400">
          Featured
        </span>
      </div>

      <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
        {blog.title}
      </h2>

      <p className="mt-3 text-sm text-slate-400">
        {readingTime(blog.content)}
        {blog.writtenBy &&
          ` • ${blog.writtenBy}`}
      </p>

      <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
        {blog.metaDescription ||
          richTextExcerpt(
            blog.content,
            200,
          )}
      </p>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-bold text-slate-900 transition-all hover:bg-amber-400 group-hover:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
      >
        Read Article

        <FiArrowRight className="text-lg" />
      </button>
    </div>

    {blog.image && (
      <div className="relative hidden lg:col-span-2 lg:block">
        <SafeImage
          src={blog.image}
          alt={blog.title}
          fallbackIcon="article"
          className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
          fallbackClass="bg-slate-800 text-amber-400"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/20 to-transparent" />
      </div>
    )}
  </div>
);

/* ============================================================
   CARDS
============================================================ */

const RightCard = ({
  right,
  onClick,
}) => (
  <article
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={keyboardOpen(onClick)}
    className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl focus:outline-none focus-visible:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-500/30"
  >
    <div className="aspect-[4/3] w-full overflow-hidden bg-amber-50">
      <SafeImage
        src={right.photo}
        alt={right.title}
        fallbackIcon="balance"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        fallbackClass="bg-gradient-to-br from-amber-50 to-amber-100/60 text-amber-500"
      />
    </div>

    <div className="flex flex-1 flex-col p-6">
      <h3 className="font-bold text-slate-900 transition-colors group-hover:text-amber-600">
        {right.title}
      </h3>

      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
        {richTextExcerpt(
          right.description,
          180,
        )}
      </p>

      <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-bold text-amber-600 transition-all group-hover:gap-2">
        Explore

        <FiArrowRight className="text-base" />
      </span>
    </div>
  </article>
);

const ArticleCard = ({
  blog,
  onClick,
}) => (
  <article
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={keyboardOpen(onClick)}
    className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
  >
    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
      <SafeImage
        src={blog.image}
        alt={blog.title}
        fallbackIcon="article"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        fallbackClass="text-amber-400"
      />

      <div className="absolute left-4 top-4">
        <span className="rounded-full border border-white/20 bg-slate-900/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
          {blog.heading ||
            "Legal Article"}
        </span>
      </div>
    </div>

    <div className="flex flex-1 flex-col p-6">
      <h3 className="text-lg font-bold leading-7 text-slate-900 transition-colors group-hover:text-amber-600">
        {blog.title}
      </h3>

      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
        {blog.metaDescription ||
          richTextExcerpt(blog.content)}
      </p>

      <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-slate-800 transition-all group-hover:gap-3 group-hover:text-amber-600">
        View More

        <FiArrowRight className="text-lg" />
      </span>
    </div>
  </article>
);

const GuideCard = ({
  guide,
  onClick,
}) => (
  <article
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={keyboardOpen(onClick)}
    className="group flex h-full cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl focus:outline-none focus-visible:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-500/30"
  >
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
      <IoBookOutline className="text-[24px] text-amber-600" />
    </div>

    <h3 className="mt-5 font-bold text-slate-900 transition-colors group-hover:text-amber-600">
      {guide.title}
    </h3>

    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
      {richTextExcerpt(
        guide.description,
        120,
      )}
    </p>

    <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-amber-600 transition-all group-hover:gap-3">
      View Guide

      <FiArrowRight className="text-base" />
    </span>
  </article>
);

export default LegalHub;