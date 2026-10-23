  import { useCallback, useEffect, useState } from "react";

  import { getAuthToken } from "@/utils/auth";
  import {
    API_BASE_URL,
    mapDetailAdvocate,
  } from "../utils/advocateProfileUtils";

  export default function useAdvocateProfile(advocateId, authToken = null) {
    const [advocate, setAdvocate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [retryToken, setRetryToken] = useState(0);

    const retry = useCallback(() => {
      setRetryToken((value) => value + 1);
    }, []);

    useEffect(() => {
      const controller = new AbortController();

      setLoading(true);
      setAdvocate(null);
      setFetchError(null);

      const fetchAdvocate = async () => {
        try {
          if (!advocateId) {
            throw new Error("Advocate ID is missing.");
          }

          const token = authToken || getAuthToken();

          const response = await fetch(
            `${API_BASE_URL}/advocates/${encodeURIComponent(
              advocateId,
            )}`,
            {
              method: "GET",
              signal: controller.signal,
              credentials: "include",
              cache: "no-cache",
              headers: {
                Accept: "application/json",

                ...(token
                  ? {
                      Authorization: `Bearer ${token}`,
                    }
                  : {}),
              },
            },
          );

          let data = null;

          try {
            data = await response.json();
          } catch {
            data = null;
          }

          if (!response.ok) {
            throw new Error(
              data?.message ||
                `Request failed with status ${response.status}`,
            );
          }

          /*
          * Backend response may contain:
          *
          * {
          *   success: true,
          *   data: {...},
          *   advocate: {...}
          * }
          *
          * Prefer advocate, otherwise data.
          */
          const rawAdvocate =
            data?.advocate || data?.data || null;

          if (!data?.success || !rawAdvocate) {
            throw new Error(
              data?.message || "Advocate not found.",
            );
          }

          if (controller.signal.aborted) {
            return;
          }

          /*
          * Existing mapper converts backend detail response
          * into the structure expected by AdvocateProfile.jsx.
          */
          const mappedAdvocate =
            mapDetailAdvocate(rawAdvocate);

          if (!mappedAdvocate) {
            throw new Error(
              "Unable to process advocate details.",
            );
          }

          /*
          * IMPORTANT:
          * Preserve top-level API fields which may otherwise
          * be removed by mapDetailAdvocate().
          *
          * isOnline is the ONLY presence source.
          *
          * status === "ACTIVE" does NOT mean online.
          * callAvailability does NOT mean online.
          */
          const finalAdvocate = {
            ...mappedAdvocate,

            id:
              mappedAdvocate?.id ||
              rawAdvocate?.id ||
              rawAdvocate?._id,

            isOnline:
              rawAdvocate?.isOnline === true,

            lastSeenAt:
              rawAdvocate?.lastSeenAt ?? null,

            callAvailability:
              rawAdvocate?.callAvailability === true,

            status:
              rawAdvocate?.status ??
              mappedAdvocate?.status ??
              null,

            approvalStatus:
              rawAdvocate?.approvalStatus ??
              mappedAdvocate?.approvalStatus ??
              null,

            isLiked:
              typeof rawAdvocate?.isLiked === "boolean"
                ? rawAdvocate.isLiked
                : mappedAdvocate?.isLiked ?? false,

            isSaved:
              typeof rawAdvocate?.isSaved === "boolean"
                ? rawAdvocate.isSaved
                : mappedAdvocate?.isSaved ?? false,

            likeCount:
              Number(
                rawAdvocate?.likeCount ??
                  mappedAdvocate?.likeCount ??
                  0,
              ) || 0,

            averageRating:
              rawAdvocate?.averageRating ??
              mappedAdvocate?.averageRating ??
              null,

            totalReviews:
              Number(
                rawAdvocate?.totalReviews ??
                  mappedAdvocate?.totalReviews ??
                  0,
              ) || 0,
          };

          if (!controller.signal.aborted) {
            setAdvocate(finalAdvocate);
          }
        } catch (error) {
          if (error?.name === "AbortError") {
            return;
          }

          console.error(
            "Error fetching advocate:",
            error,
          );

          if (!controller.signal.aborted) {
            setFetchError(
              error?.message ||
                "Failed to load this advocate.",
            );

            setAdvocate(null);
          }
        } finally {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        }
      };

      fetchAdvocate();

      return () => {
        controller.abort();
      };
    }, [advocateId, retryToken, authToken]);

    return {
      advocate,
      loading,
      fetchError,
      retryToken,
      retry,
    };
  }