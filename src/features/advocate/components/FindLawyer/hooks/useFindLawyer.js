import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  DEFAULT_FILTERS,
  experienceOptions,
  getNumericValue,
  getPracticeAreaFromSearch,
  isValidPincode,
  matchesArrayItem,
  matchesExact,
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
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
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
    searchQuery: initialSearch,
  }));

  const [tempFilters, setTempFilters] = useState({ searchQuery: initialSearch });
  const [selectedExperienceRange, setSelectedExperienceRange] = useState("Any");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce sidebar filters (like city, rating) so we don't spam requests
  const debouncedFilters = useDebouncedValue(filters, 400);

  const debounceTimerRef = useRef(null);
  const activeAbortControllerRef = useRef(null);
  const requestIdRef = useRef(0);

  // Sync search to URL query string with replace: true
  const updateUrlSearch = useCallback(
    (searchTerm) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const trimmed = searchTerm ? searchTerm.trim() : "";
          if (trimmed) {
            if (next.get("search") === trimmed) return prev;
            next.set("search", trimmed);
          } else {
            if (!next.has("search")) return prev;
            next.delete("search");
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // Clean up debounce timer and abort controller on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (activeAbortControllerRef.current) {
        activeAbortControllerRef.current.abort();
      }
    };
  }, []);

  // Synchronize when URL search param changes externally (e.g. browser back/forward)
  const urlSearchParam = searchParams.get("search") || "";
  useEffect(() => {
    if (urlSearchParam !== filters.searchQuery) {
      setFilters((previous) => ({
        ...previous,
        searchQuery: urlSearchParam,
      }));
      setTempFilters({ searchQuery: urlSearchParam });
      setCurrentPage(1);
    }
  }, [urlSearchParam, filters.searchQuery]);

  // Synchronize when practice area changes from navigation
  const practiceAreaFromUrl = getPracticeAreaFromSearch(
    location.search,
    initialSpecialty,
  );
  const prevPracticeAreaRef = useRef(practiceAreaFromUrl);

  useEffect(() => {
    if (prevPracticeAreaRef.current !== practiceAreaFromUrl) {
      prevPracticeAreaRef.current = practiceAreaFromUrl;
      setFilters((previous) => ({
        ...previous,
        practiceArea: practiceAreaFromUrl,
      }));
      setCurrentPage(1);
      window.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }
  }, [practiceAreaFromUrl]);

  // Server-side advocate search handles full-text filtering across the database.
  // We avoid filtering by search query here to prevent flickering/blanking the list
  // before the server response arrives.
  const visibleAdvocates = useMemo(() => {
    return advocates.filter((advocate) => {
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

  const fetchAdvocates = useCallback(async () => {
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeAbortControllerRef.current = controller;
    const currentRequestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      params.set("page", String(currentPage));
      params.set("limit", String(ITEMS_PER_PAGE));

      if (filters.searchQuery.trim()) {
        params.set("search", filters.searchQuery.trim());
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
        { signal: controller.signal },
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Discard response if a newer request was dispatched
      if (currentRequestId !== requestIdRef.current) return;

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
      if (currentRequestId !== requestIdRef.current) return;

      console.error("Error fetching advocates:", err);
      setError(
        err?.message || "Something went wrong while loading advocates.",
      );
      setAdvocates([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [currentPage, filters.searchQuery, debouncedFilters]);

  useEffect(() => {
    fetchAdvocates();
    return () => {
      if (activeAbortControllerRef.current) {
        activeAbortControllerRef.current.abort();
      }
    };
  }, [fetchAdvocates]);

  const handleSearchInputChange = useCallback(
    (value) => {
      setTempFilters({ searchQuery: value });

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      const trimmed = value.trim();

      if (!trimmed) {
        // Step 3: Immediate reset when empty (no debounce delay)
        setFilters((previous) => {
          if (!previous.searchQuery) return previous;
          return {
            ...previous,
            searchQuery: "",
          };
        });
        setCurrentPage(1);
        updateUrlSearch("");
        return;
      }

      // Step 1: 350ms debounced search
      debounceTimerRef.current = setTimeout(() => {
        setFilters((previous) => {
          if (previous.searchQuery === trimmed) return previous;
          return {
            ...previous,
            searchQuery: trimmed,
          };
        });
        setCurrentPage(1);
        updateUrlSearch(trimmed);
      }, 350);
    },
    [updateUrlSearch],
  );

  const handleClearSearch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setTempFilters({ searchQuery: "" });
    setFilters((previous) => {
      if (!previous.searchQuery) return previous;
      return {
        ...previous,
        searchQuery: "",
      };
    });
    setCurrentPage(1);
    updateUrlSearch("");
  }, [updateUrlSearch]);

  const handleSearch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    const trimmed = tempFilters.searchQuery.trim();
    setFilters((previous) => ({
      ...previous,
      searchQuery: trimmed,
    }));
    setCurrentPage(1);
    updateUrlSearch(trimmed);
  }, [tempFilters.searchQuery, updateUrlSearch]);

  const handleExperienceChange = useCallback((option) => {
    setSelectedExperienceRange(option.label);

    setFilters((previous) => ({
      ...previous,
      experienceYears: option.min ?? "",
    }));
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setFilters({ ...DEFAULT_FILTERS });
    setTempFilters({ searchQuery: "" });
    setSelectedExperienceRange("Any");
    setCurrentPage(1);
    updateUrlSearch("");
  }, [updateUrlSearch]);

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
    handleSearchInputChange,
    handleClearSearch,
    handleExperienceChange,
    handleResetFilters,
  };
};

export default useFindLawyer;

