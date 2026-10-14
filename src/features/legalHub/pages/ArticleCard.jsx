import React from "react";
import { useNavigate } from "react-router-dom";

import {
  FiArrowRight,
  FiBookOpen,
  FiFileText,
} from "react-icons/fi";

import {
  FaBalanceScale,
  FaGavel,
} from "react-icons/fa";

const ARTICLE_ICONS = {
  article: FiFileText,
  description: FiFileText,
  document: FiFileText,
  book: FiBookOpen,
  menu_book: FiBookOpen,
  gavel: FaGavel,
  balance: FaBalanceScale,
};

const ArticleCard = ({
  id,
  slug,
  title,
  description,
  image,
  heading,
  date,
  writtenBy,
  metaDescription,
  icon = "article",
}) => {
  const navigate = useNavigate();

  const handleOpenArticle = () => {
    if (!slug) return;

    navigate(`/legal-hub/articles/${slug}`);
  };

  const handleKeyDown = (event) => {
    if (!slug) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenArticle();
    }
  };

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  const ArticleIcon = ARTICLE_ICONS[icon] || FiFileText;

  return (
    <article
      onClick={handleOpenArticle}
      onKeyDown={handleKeyDown}
      role={slug ? "button" : undefined}
      tabIndex={slug ? 0 : -1}
      className={`
        group
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-amber-200
        hover:shadow-xl
        focus:outline-none
        focus:ring-4
        focus:ring-amber-500/10
        ${slug ? "cursor-pointer" : "cursor-default"}
      `}
    >
      {/* =====================================================
          IMAGE / COVER
      ====================================================== */}

      <div
        className="
          relative
          h-44
          overflow-hidden
          bg-gradient-to-br
          from-slate-900
          via-slate-800
          to-slate-700
        "
      >
        {image ? (
          <img
            src={image}
            alt={title || "Legal Article"}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <>
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />

            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-white/20
                  bg-white/10
                  text-amber-400
                  backdrop-blur-md
                  transition-all
                  duration-300
                  group-hover:rotate-2
                  group-hover:scale-110
                "
              >
                <ArticleIcon
                  className="text-3xl"
                  aria-hidden="true"
                />
              </div>
            </div>
          </>
        )}

        {/* CATEGORY */}

        <div className="absolute left-4 top-4">
          <span
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              border
              border-white/20
              bg-black/30
              px-2.5
              py-1
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-white
              backdrop-blur-md
            "
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />

            {heading || "Legal Article"}
          </span>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="p-5">
        <h3
          className="
            text-lg
            font-bold
            leading-7
            text-slate-900
            transition-colors
            duration-200
            group-hover:text-amber-600
          "
        >
          {title}
        </h3>

        {description && (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}

        {/* META */}

        {(writtenBy || formattedDate) && (
          <div className="mt-3 flex items-center justify-between gap-3">
            {writtenBy && (
              <span className="truncate text-xs font-medium text-slate-400">
                By {writtenBy}
              </span>
            )}

            {formattedDate && (
              <span className="shrink-0 text-xs font-medium text-slate-400">
                {formattedDate}
              </span>
            )}
          </div>
        )}

        {/* READ MORE */}

        {slug && (
          <div
            className="
              mt-5
              inline-flex
              items-center
              gap-2
              text-sm
              font-bold
              text-slate-800
              transition-colors
              group-hover:text-amber-600
            "
          >
            Read More

            <FiArrowRight
              className="
                text-lg
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    </article>
  );
};

export default ArticleCard;