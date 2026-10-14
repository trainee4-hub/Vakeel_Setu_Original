import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_FILTERS,
  experienceOptions,
  getNumericValue,
  getPracticeAreaFromSearch,
  isValidPincode,
  matchesArrayItem,
  matchesExact,
  matchesSearch,
} from "../utils/findLawyerUtils";
import {
  API_BASE_URL,
} from "@shared/services/apiClient";

const ITEMS_PER_PAGE = 12;

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

const useFindLawyer = ({ initialSpecialty = "" } = {}) => {
  const location = useLocation();

  const initialPracticeArea = getPracticeAreaFromSearch(
    location.search,
    initialSpecialty,
  );

  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    practiceArea: initialPracticeArea || "",
  }));

  const [tempFilters, setTempFilters] = useState({ searchQuery: "" });
  const [selectedExperienceRange, setSelectedExperienceRange] = useState("Any");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedFilters = useDebouncedValue(filters, 400);

  const visibleAdvocates = useMemo(() => {
    return advocates.filter((advocate) => {
      if (!matchesSearch(advocate, filters.searchQuery)) return false;
      if (!matchesExact(advocate?.state, filters.state)) return false;
      if (!matchesExact(advocate?.city, filters.city)) return false;
      if (!matchesExact(advocate?.bestPracticeArea, filters.bestPracticeArea)) {
        return false;
      }
      if (!matchesExact(advocate?.topCourtPractised, filters.topCourtPractised)) {
        return false;
      }
      if (!matchesArrayItem(advocate?.courtPractice, filters.courtPractice)) {
        return false;
      }
      if (!matchesArrayItem(advocate?.practiceAreas, filters.practiceArea)) {
        return false;
      }

      if (filters.rating) {
        const minimumRating = getNumericValue(filters.rating);
        const advocateRating = getNumericValue(advocate?.averageRating);
        if (advocateRating < minimumRating) return false;
      }

      const selectedExperience = experienceOptions.find(
        (option) => option.label === selectedExperienceRange,
      );

      if (selectedExperience && selectedExperience.label !== "Any") {
        const experience = getNumericValue(advocate?.experienceYears);

        if (
          selectedExperience.min !== null &&
          experience < selectedExperience.min
        ) {
          return false;
        }

        if (
          selectedExperience.max !== null &&
          experience >= selectedExperience.max
        ) {
          return false;
        }
      }

      return true;
    });
  }, [advocates, filters, selectedExperienceRange]);

  const fetchAdvocates = useCallback(
    async (signal) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        params.set("page", String(currentPage));
        params.set("limit", String(ITEMS_PER_PAGE));

        if (debouncedFilters.searchQuery.trim()) {
          params.set("search", debouncedFilters.searchQuery.trim());
        }
        if (debouncedFilters.practiceArea) {
          params.set("practiceArea", debouncedFilters.practiceArea);
        }
        if (debouncedFilters.topCourtPractised) {
          params.set("topCourtPractised", debouncedFilters.topCourtPractised);
        }
        if (debouncedFilters.bestPracticeArea) {
          params.set("bestPracticeArea", debouncedFilters.bestPracticeArea);
        }
        if (debouncedFilters.courtPractice) {
          params.set("courtPractice", debouncedFilters.courtPractice);
        }
        if (debouncedFilters.state) {
          params.set("state", debouncedFilters.state);
        }
        if (debouncedFilters.city) {
          params.set("city", debouncedFilters.city);
        }
        if (debouncedFilters.experienceYears !== "") {
          params.set(
            "experienceYears",
            String(debouncedFilters.experienceYears),
          );
        }
        if (debouncedFilters.rating) {
          params.set("rating", debouncedFilters.rating);
        }

        if (isValidPincode(debouncedFilters.pincode)) {
          params.set("pincode", debouncedFilters.pincode.trim());
        }

        if (debouncedFilters.sort) {
          params.set("sort", debouncedFilters.sort);
        }

        const response = await fetch(
          `${API_BASE_URL}/advocates?${params.toString()}`,
          signal ? { signal } : undefined,
        );

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to load advocates.");
        }

        const rawAdvocates = Array.isArray(data.advocates)
          ? data.advocates
          : [];

        setAdvocates(rawAdvocates);
        setTotalCount(data.pagination?.total ?? rawAdvocates.length);
        setTotalPages(data.pagination?.totalPages ?? 1);
      } catch (err) {
        if (err?.name === "AbortError") return;

        console.error("Error fetching advocates:", err);
        setError(
          err?.message || "Something went wrong while loading advocates.",
        );
        setAdvocates([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [currentPage, debouncedFilters],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    const controller = new AbortController();
    fetchAdvocates(controller.signal);
    return () => controller.abort();
  }, [fetchAdvocates]);

  useEffect(() => {
    const nextPracticeArea = getPracticeAreaFromSearch(
      location.search,
      initialSpecialty,
    );

    setFilters((previous) => ({
      ...previous,
      practiceArea: nextPracticeArea,
      searchQuery: "",
    }));
    setTempFilters({ searchQuery: "" });
    setCurrentPage(1);

    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [location.search, initialSpecialty]);

  const handleSearch = useCallback(() => {
    setFilters((previous) => ({
      ...previous,
      searchQuery: tempFilters.searchQuery.trim(),
    }));
  }, [tempFilters.searchQuery]);

  const handleExperienceChange = useCallback((option) => {
    setSelectedExperienceRange(option.label);

    setFilters((previous) => ({
      ...previous,
      experienceYears: option.min ?? "",
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
    setTempFilters({ searchQuery: "" });
    setSelectedExperienceRange("Any");
  }, []);

  return {
    advocates,
    visibleAdvocates,
    loading,
    error,
    filters,
    setFilters,
    tempFilters,
    setTempFilters,
    selectedExperienceRange,
    currentPage,
    setCurrentPage,
    totalCount,
    totalPages,
    fetchAdvocates,
    handleSearch,
    handleExperienceChange,
    handleResetFilters,
  };
};

export default useFindLawyer;
