import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@shared/services/apiClient";

const usePremiumAdvocates = () => {
  const [premiumAdvocates, setPremiumAdvocates] = useState([]);
  const [premiumAdvocatesLoading, setPremiumAdvocatesLoading] = useState(true);
  const [premiumAdvocatesError, setPremiumAdvocatesError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchPremiumAdvocates = async () => {
      setPremiumAdvocatesLoading(true);
      setPremiumAdvocatesError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/advocates?limit=5`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load advocates (${response.status})`,
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message || "Failed to load advocates.",
          );
        }

        const advocates = Array.isArray(data.advocates)
          ? data.advocates
          : [];

        setPremiumAdvocates(advocates.slice(0, 5));
      } catch (error) {
        if (error?.name === "AbortError") return;

        console.error("Error fetching premium advocates:", error);

        setPremiumAdvocates([]);
        setPremiumAdvocatesError(
          error?.message || "Unable to load advocates right now.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setPremiumAdvocatesLoading(false);
        }
      }
    };

    fetchPremiumAdvocates();

    return () => controller.abort();
  }, []);

  const premiumAdvocatesTripled = useMemo(
    () => [
      ...premiumAdvocates,
      ...premiumAdvocates,
      ...premiumAdvocates,
    ],
    [premiumAdvocates],
  );

  return {
    premiumAdvocates,
    premiumAdvocatesTripled,
    premiumAdvocatesLoading,
    premiumAdvocatesError,
  };
};

export default usePremiumAdvocates;
