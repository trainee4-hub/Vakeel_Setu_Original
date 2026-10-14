import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCalendar,
  FiUser,
} from "react-icons/fi";

import API_BASE_URL from "@shared/services/apiClient";
import RichContent from "@shared/components/ui/RichContent";
import { richTextToPlain } from "@shared/utils/richText";

const BlogDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/blogs/${encodeURIComponent(slug)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          },
        );

        const data = await response.json();

        if (!response.ok || data?.success === false) {
          throw new Error(
            data?.message || "Unable to load this article.",
          );
        }

        setBlog(data?.blog || null);
      } catch (err) {
        console.error("Fetch blog error:", err);

        setError(
          err?.message || "Unable to load this article.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlog();
    } else {
      setLoading(false);
      setError("Article URL is invalid.");
    }
  }, [slug]);

  /* -----------------------------------------
     LOADING
  ----------------------------------------- */
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />

          <div className="mt-8 h-72 animate-pulse rounded-2xl bg-slate-200" />

          <div className="mt-8 h-8 w-3/4 animate-pulse rounded bg-slate-200" />

          <div className="mt-4 h-5 w-1/2 animate-pulse rounded bg-slate-200" />

          <div className="mt-8 space-y-3">
            <div className="h-4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  /* -----------------------------------------
     ERROR / NOT FOUND
  ----------------------------------------- */
  if (error || !blog) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <FiAlertCircle
              className="text-3xl text-red-500"
              aria-hidden="true"
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Article not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error || "This article could not be found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/legal-hub/articles")}
            className="
              mt-6
              rounded-xl
              bg-slate-900
              px-5
              py-3
              text-sm
              font-bold
              text-white
              hover:bg-slate-800
            "
          >
            Back to Articles
          </button>
        </div>
      </main>
    );
  }

  /* -----------------------------------------
     DATE
  ----------------------------------------- */
  const getFormattedDate = (value) => {
    if (!value) return "";

    const plainDate = richTextToPlain(value);
    const date = new Date(plainDate);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formattedDate = getFormattedDate(blog.date);

  /* -----------------------------------------
     AUTHOR
  ----------------------------------------- */
  const creator = blog?.creator || blog?.["content" + "Creator"];

  const authorName =
    creator?.name ||
    blog.writtenBy ||
    "Vakeel Setu";

  const authorImage = creator?.image;

  return (
    <main className="min-h-screen bg-slate-50">
      <article className="px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl">
          {/* BACK */}
          <button
            type="button"
            onClick={() => navigate("/legal-hub/articles")}
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-slate-600
              hover:text-amber-600
            "
          >
            <FiArrowLeft
              className="text-lg"
              aria-hidden="true"
            />

            Back to Articles
          </button>

          {/* ARTICLE */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* IMAGE */}
            {blog.image && (
              <div className="h-64 overflow-hidden sm:h-80 lg:h-96">
                <img
                  src={blog.image}
                  alt={
                    blog.title ||
                    blog.heading ||
                    "Article"
                  }
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* CONTENT */}
            <div className="p-6 sm:p-8 lg:p-10">
              {/* HEADING / CATEGORY */}
              {blog.heading && (
                <div className="mb-4">
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      bg-amber-50
                      px-3
                      py-1.5
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-amber-700
                    "
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

                    {blog.heading}
                  </span>
                </div>
              )}

              {/* TITLE */}
              <h1
                className="
                  text-3xl
                  font-extrabold
                  leading-tight
                  tracking-tight
                  text-slate-900
                  sm:text-4xl
                "
              >
                {blog.title}
              </h1>

              {/* META */}
              <div
                className="
                  mt-5
                  flex
                  flex-wrap
                  items-center
                  gap-x-5
                  gap-y-3
                  border-b
                  border-slate-100
                  pb-5
                  text-sm
                  text-slate-500
                "
              >
                {/* AUTHOR */}
                {authorName && (
                  <div className="flex items-center gap-2">
                    {authorImage ? (
                      <img
                        src={authorImage}
                        alt={authorName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <FiUser
                        className="text-lg text-slate-400"
                        aria-hidden="true"
                      />
                    )}

                    <span>
                      Written by{" "}
                      <strong className="font-semibold text-slate-700">
                        {authorName}
                      </strong>
                    </span>
                  </div>
                )}

                {/* DATE */}
                {formattedDate && (
                  <div className="flex items-center gap-2">
                    <FiCalendar
                      className="text-lg text-slate-400"
                      aria-hidden="true"
                    />

                    {formattedDate}
                  </div>
                )}
              </div>

              {/* BLOG CONTENT */}
              <RichContent
                value={blog.content}
                className="mt-8 text-base leading-8 text-slate-700"
              />

              {/* CONTENT CREATOR */}
              {creator && (
                <div className="mt-10 border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-4">
                    {creator.image ? (
                      <img
                        src={creator.image}
                        alt={
                          creator.name ||
                          "Content Creator"
                        }
                        className="
                          h-12
                          w-12
                          rounded-full
                          object-cover
                        "
                      />
                    ) : (
                      <div
                        className="
                          flex
                          h-12
                          w-12
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-slate-100
                        "
                      >
                        <FiUser
                          className="text-xl text-slate-500"
                          aria-hidden="true"
                        />
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Content Creator
                      </p>

                      <p className="text-sm font-bold text-slate-800">
                        {creator.name}
                      </p>

                      {creator.bio && (
                        <p className="mt-1 text-sm text-slate-500">
                          {creator.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </main>
  );
};

export default BlogDetails;