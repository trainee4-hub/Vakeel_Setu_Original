import React, { useCallback, useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { FaExclamationCircle } from "react-icons/fa";

import ArticleCard from "./ArticleCard";
import API_BASE_URL from "@shared/services/apiClient";
import { richTextExcerpt } from "@shared/utils/richText";

const DEFAULT_LIMIT = 10;

const Articles = () => {
  const [blogs, setBlogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: DEFAULT_LIMIT,
    totalBlogs: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchBlogs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/blogs?page=${page}&limit=${DEFAULT_LIMIT}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "Unable to load legal articles."
        );
      }

      setBlogs(Array.isArray(data?.blogs) ? data.blogs : []);

      if (data?.pagination) {
        setPagination(data.pagination);
        setCurrentPage(data.pagination.currentPage || page);
      }
    } catch (err) {
      console.error("Fetch blogs error:", err);

      setError(
        err?.message ||
          "Unable to load articles. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs(currentPage);
  }, [currentPage, fetchBlogs]);

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > pagination.totalPages ||
      page === currentPage
    ) {
      return;
    }

    setCurrentPage(page);

    // Scroll back to articles section
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="border-b border-slate-200 bg-white px-4 py-8 sm:py-10 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-amber-600">
              <HiOutlineDocumentText
                className="text-[24px]"
                aria-hidden="true"
              />

              <span className="text-xs font-bold uppercase tracking-[0.18em]">
                Legal Articles
              </span>
            </div>

            <h1
              className="
                mt-3
                text-4xl
                font-extrabold
                tracking-tight
                text-slate-900
                sm:text-5xl
              "
            >
              Legal Articles
              <span className="text-amber-600">
                {" "}
                & Insights
              </span>
            </h1>

            <p
              className="
                mt-4
                max-w-2xl
                text-base
                leading-7
                text-slate-500
                sm:text-lg
              "
            >
              Explore simple and practical explanations of important
              legal topics, rights and everyday legal situations.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          ARTICLES
      ===================================================== */}
      <section className="px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl">
          {/* RESULT HEADER */}
          <div
            className="
              mb-7
              flex
              flex-col
              gap-2
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Explore our collection
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                All Articles
              </h2>
            </div>

            {!loading && !error && (
              <p className="text-sm text-slate-400">
                {pagination.totalBlogs}{" "}
                {pagination.totalBlogs === 1
                  ? "article"
                  : "articles"}
              </p>
            )}
          </div>

          {/* =====================================================
              LOADING
          ===================================================== */}
          {loading && (
            <div
              className="
                grid
                gap-6
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                  "
                >
                  <div className="h-44 animate-pulse bg-slate-200" />

                  <div className="p-5">
                    <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />

                    <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />

                    <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-100" />

                    <div className="mt-5 h-4 w-24 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* =====================================================
              ERROR
          ===================================================== */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <FaExclamationCircle
                  className="text-2xl text-red-500"
                  aria-hidden="true"
                />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Unable to load articles
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() => fetchBlogs(currentPage)}
                className="
                  mt-5
                  rounded-xl
                  bg-slate-900
                  px-5
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-slate-800
                "
              >
                Try Again
              </button>
            </div>
          )}

          {/* =====================================================
              EMPTY
          ===================================================== */}
          {!loading && !error && blogs.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <HiOutlineDocumentText
                  className="text-3xl text-slate-400"
                  aria-hidden="true"
                />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                No articles available
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                There are no legal articles published at the moment.
                Please check back later.
              </p>
            </div>
          )}

          {/* =====================================================
              BLOG CARDS
          ===================================================== */}
          {!loading && !error && blogs.length > 0 && (
            <div
              className="
                grid
                gap-6
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {blogs.map((blog) => (
                <ArticleCard
                  key={blog.id}
                  id={blog.id}
                  slug={blog.slug}
                  title={blog.title}
                  description={
                    richTextExcerpt(blog.content, 150) ||
                    "Understand this legal topic in simple and easy-to-follow language."
                  }
                  image={blog.image}
                  heading={blog.heading}
                  date={blog.date}
                  writtenBy={blog.writtenBy}
                  metaDescription={blog.metaDescription}
                />
              ))}
            </div>
          )}

          {/* =====================================================
              PAGINATION
          ===================================================== */}
          {!loading &&
            !error &&
            blogs.length > 0 &&
            pagination.totalPages > 1 && (
              <div className="mt-10 flex flex-col items-center gap-4">
                {/* Page information */}
                <p className="text-sm text-slate-500">
                  Page{" "}
                  <span className="font-semibold text-slate-800">
                    {pagination.currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-800">
                    {pagination.totalPages}
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  {/* PREVIOUS */}
                  <button
                    type="button"
                    onClick={() =>
                      handlePageChange(currentPage - 1)
                    }
                    disabled={!pagination.hasPreviousPage}
                    className="
                      inline-flex
                      h-10
                      items-center
                      gap-1.5
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      text-sm
                      font-semibold
                      text-slate-700
                      transition
                      hover:border-slate-300
                      hover:bg-slate-50
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <FiChevronLeft
                      className="text-lg"
                      aria-hidden="true"
                    />

                    Previous
                  </button>

                  {/* PAGE NUMBERS */}
                  <div className="flex items-center gap-1">
                    {Array.from(
                      {
                        length: pagination.totalPages,
                      },
                      (_, index) => index + 1
                    ).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() =>
                          handlePageChange(page)
                        }
                        className={`
                          h-10
                          min-w-10
                          rounded-xl
                          px-3
                          text-sm
                          font-semibold
                          transition
                          ${
                            page === currentPage
                              ? "bg-amber-500 text-white shadow-sm"
                              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }
                        `}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* NEXT */}
                  <button
                    type="button"
                    onClick={() =>
                      handlePageChange(currentPage + 1)
                    }
                    disabled={!pagination.hasNextPage}
                    className="
                      inline-flex
                      h-10
                      items-center
                      gap-1.5
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      text-sm
                      font-semibold
                      text-slate-700
                      transition
                      hover:border-slate-300
                      hover:bg-slate-50
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    Next

                    <FiChevronRight
                      className="text-lg"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            )}
        </div>
      </section>
    </main>
  );
};

export default Articles;