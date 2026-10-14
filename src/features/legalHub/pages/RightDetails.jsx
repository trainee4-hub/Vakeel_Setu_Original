import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  FaBalanceScale,
  FaGavel,
  FaCalendarAlt,
} from "react-icons/fa";

import {
  FiSearch,
  FiArrowLeft,
  FiRefreshCw,
} from "react-icons/fi";

import { getUserRightById } from "../services/userRightsApi";
import RichContent from "@shared/components/ui/RichContent";
import { richTextToPlain } from "@shared/utils/richText";

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(richTextToPlain(value));

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const RightDetails = () => {
  const { id } = useParams();

  const [right, setRight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      setImageFailed(false);

      try {
        const result = await getUserRightById(id);

        if (cancelled) return;

        if (!result) {
          throw new Error("User Right not found");
        }

        setRight(result);
      } catch (err) {
        if (cancelled) return;

        setRight(null);
        setError(err?.message || "User Right not found");
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
  }, [id, reloadToken]);

  const publishedOn = formatDate(right?.createdAt);
  const showPhoto = Boolean(right?.photo) && !imageFailed;

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {loading ? (
            <DetailSkeleton />
          ) : error ? (
            <DetailError
              message={error}
              onRetry={() =>
                setReloadToken((token) => token + 1)
              }
            />
          ) : (
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {/* Image */}
              <div className="aspect-[16/9] w-full overflow-hidden bg-amber-50">
                {showPhoto ? (
                  <img
                    src={right.photo}
                    alt={right.title}
                    onError={() => setImageFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100/60">
                    <FaBalanceScale
                      className="text-6xl text-amber-500"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 sm:p-10">
                <div className="flex items-center gap-2 text-amber-600">
                  <FaGavel
                    className="text-base"
                    aria-hidden="true"
                  />

                  <span className="text-xs font-bold uppercase tracking-[0.15em]">
                    Know Your Rights
                  </span>
                </div>

                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {right.title}
                </h1>

                {publishedOn && (
                  <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-400">
                    <FaCalendarAlt
                      className="shrink-0 text-base"
                      aria-hidden="true"
                    />

                    Published {publishedOn}
                  </p>
                )}

                <RichContent
                  value={right.description}
                  className="mt-6 text-base leading-8 text-slate-600"
                />
              </div>
            </article>
          )}
        </div>
      </section>
    </div>
  );
};

/* ============================================================
   STATES
============================================================ */

const DetailSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="aspect-[16/9] w-full bg-slate-100" />

    <div className="p-6 sm:p-10">
      <div className="h-3 w-32 rounded-full bg-slate-100" />

      <div className="mt-4 h-8 w-2/3 rounded-full bg-slate-100" />

      <div className="mt-4 h-3 w-40 rounded-full bg-slate-100" />

      <div className="mt-8 space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className={`h-3 rounded-full bg-slate-100 ${
              index === 5 ? "w-2/3" : "w-full"
            }`}
          />
        ))}
      </div>
    </div>
  </div>
);

const DetailError = ({ message, onRetry }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
    {/* Error Icon */}
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
      <FiSearch
        className="text-xl"
        aria-hidden="true"
      />
    </div>

    <h2 className="mt-4 text-lg font-bold text-slate-900">
      {message}
    </h2>

    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
      This right may have been removed, or the link may be incorrect.
    </p>

    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      {/* Back */}
      <Link
        to="/legal-hub/rights"
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
      >
        <FiArrowLeft
          className="text-base"
          aria-hidden="true"
        />

        Back to Rights
      </Link>

      {/* Retry */}
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
      >
        <FiRefreshCw
          className="text-base"
          aria-hidden="true"
        />

        Try again
      </button>
    </div>
  </div>
);

export default RightDetails;