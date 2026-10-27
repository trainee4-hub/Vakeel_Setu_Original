import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getAdvocateTeamMates,
  removeAdvocateTeamMate,
  searchAdvocatesForTeam,
  sendTeamMateRequest,
  verifyTeamMateRequest,
} from "@features/advocate";

/* =========================================================================
   ADVOCATE TEAM HOOK

   REAL API ONLY.
   No mock data.
   ========================================================================= */

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

const getAdvocateId = (advocate) =>
  advocate?.id ||
  advocate?._id ||
  advocate?.advocateId ||
  null;

export default function useAdvocateTeam() {
  /* =======================================================================
     TEAM LIST
  ======================================================================= */

  const [
    teamMates,
    setTeamMates,
  ] = useState([]);

  const [
    teamLoading,
    setTeamLoading,
  ] = useState(true);

  const [
    teamError,
    setTeamError,
  ] = useState(null);

  /* =======================================================================
     SEARCH
  ======================================================================= */

  const [
    searchResults,
    setSearchResults,
  ] = useState([]);

  const [
    searchPagination,
    setSearchPagination,
  ] = useState(
    DEFAULT_PAGINATION,
  );

  const [
    searchLoading,
    setSearchLoading,
  ] = useState(false);

  const [
    searchError,
    setSearchError,
  ] = useState(null);

  const [
    activeSearchQuery,
    setActiveSearchQuery,
  ] = useState("");

  /* =======================================================================
     REQUEST / OTP
  ======================================================================= */

  const [
    pendingRequest,
    setPendingRequest,
  ] = useState(null);

  const [
    requestLoading,
    setRequestLoading,
  ] = useState(false);
  const [
  requestingAdvocateId,
  setRequestingAdvocateId,
] = useState(null);

const [
  sentRequestIds,
  setSentRequestIds,
] = useState(() => new Set());

  const [
    requestError,
    setRequestError,
  ] = useState(null);

  const [
    verifyLoading,
    setVerifyLoading,
  ] = useState(false);

  const [
    verifyError,
    setVerifyError,
  ] = useState(null);

  /* =======================================================================
     REMOVE
  ======================================================================= */

  const [
    removingId,
    setRemovingId,
  ] = useState(null);

  const [
    removeError,
    setRemoveError,
  ] = useState(null);

  const initialLoadStartedRef =
    useRef(false);


// REquest helper 
    const isRequestSent =
  useCallback(
    (advocate) => {
      const advocateId =
        typeof advocate ===
        "string"
          ? advocate
          : getAdvocateId(
              advocate,
            );

      if (!advocateId) {
        return false;
      }

      return sentRequestIds.has(
        String(
          advocateId,
        ),
      );
    },
    [sentRequestIds],
  );
  /* =======================================================================
     GET TEAM
  ======================================================================= */

  const refreshTeam =
    useCallback(async (minDuration = 0) => {
      setTeamLoading(true);
      setTeamError(null);
      const startTime = Date.now();

      try {
        const data =
          await getAdvocateTeamMates();

        setTeamMates(
          Array.isArray(data)
            ? data
            : [],
        );

        return data;
      } catch (error) {
        setTeamError(error);

        return null;
      } finally {
        if (minDuration > 0) {
          const elapsed = Date.now() - startTime;
          if (elapsed < minDuration) {
            await new Promise((r) => setTimeout(r, minDuration - elapsed));
          }
        }
        setTeamLoading(false);
      }
    }, []);

  /*
   * Prevent StrictMode duplicate initial request.
   */
  useEffect(() => {
    if (
      initialLoadStartedRef.current
    ) {
      return;
    }

    initialLoadStartedRef.current =
      true;

    refreshTeam();
  }, [refreshTeam]);

  /* =======================================================================
     SEARCH BY NAME / BAR ID
  ======================================================================= */

  const searchAdvocates =
    useCallback(
      async (
        query,
        page = 1,
      ) => {
        const cleanQuery =
          String(
            query || "",
          ).trim();

        if (!cleanQuery) {
          setSearchResults([]);

          setSearchPagination(
            DEFAULT_PAGINATION,
          );

          setSearchError(
            new Error(
              "Enter an advocate name or BAR ID.",
            ),
          );

          return null;
        }

        setSearchLoading(true);
        setSearchError(null);

        try {
          const result =
            await searchAdvocatesForTeam({
              query:
                cleanQuery,
              page,
              limit: 10,
            });

          setActiveSearchQuery(
            cleanQuery,
          );

          setSearchResults(
            result.advocates,
          );

          setSearchPagination(
            result.pagination,
          );

          return result;
        } catch (error) {
          setSearchResults([]);

          setSearchPagination(
            DEFAULT_PAGINATION,
          );

          setSearchError(error);

          return null;
        } finally {
          setSearchLoading(false);
        }
      },
      [],
    );

  /* =======================================================================
     SEND TEAM REQUEST
  ======================================================================= */

  const sendTeamRequest =
  useCallback(
    async (advocate) => {
      const advocateId =
        typeof advocate ===
        "string"
          ? advocate
          : getAdvocateId(
              advocate,
            );

      if (!advocateId) {
        setRequestError(
          new Error(
            "Unable to identify this advocate.",
          ),
        );

        return null;
      }

      /*
       * Agar isi advocate ko request
       * already successfully send ho chuki hai
       * to duplicate API call mat karo.
       */
      if (
        sentRequestIds.has(
          String(
            advocateId,
          ),
        )
      ) {
        return null;
      }

      setRequestLoading(true);

      setRequestingAdvocateId(
        advocateId,
      );

      setRequestError(null);
      setVerifyError(null);

      try {
        const data =
          await sendTeamMateRequest(
            advocateId,
          );

        if (
          !data?.requestId
        ) {
          throw new Error(
            "Team request ID was not returned.",
          );
        }

        /*
         * Mark ONLY clicked advocate
         * as request sent.
         */
        setSentRequestIds(
          (previous) => {
            const next =
              new Set(previous);

            next.add(
              String(
                advocateId,
              ),
            );

            return next;
          },
        );

        /*
         * Keep current search result
         * updated as well.
         */
        setSearchResults(
          (previous) =>
            previous.map(
              (item) => {
                const itemId =
                  getAdvocateId(
                    item,
                  );

                if (
                  String(
                    itemId,
                  ) !==
                  String(
                    advocateId,
                  )
                ) {
                  return item;
                }

                return {
                  ...item,

                  requestSent:
                    true,
                };
              },
            ),
        );

        setPendingRequest({
          ...data,

          targetAdvocate:
            typeof advocate ===
            "object"
              ? advocate
              : null,
        });

        return data;
      } catch (error) {
        setRequestError(
          error,
        );

        return null;
      } finally {
        setRequestLoading(
          false,
        );

        setRequestingAdvocateId(
          null,
        );
      }
    },
    [sentRequestIds],
  );

  /* =======================================================================
     VERIFY OTP
  ======================================================================= */

  const verifyPendingRequest =
    useCallback(
      async (otp) => {
        if (
          !pendingRequest
            ?.requestId
        ) {
          setVerifyError(
            new Error(
              "No pending team request was found.",
            ),
          );

          return null;
        }

        setVerifyLoading(true);
        setVerifyError(null);

        try {
          const result =
            await verifyTeamMateRequest(
              pendingRequest.requestId,
              otp,
            );

          if (
            !result?.verified
          ) {
            throw new Error(
              "Team request could not be verified.",
            );
          }

          setPendingRequest(null);

          /*
           * Relationship is mutual now.
           * Refresh authoritative list.
           */
          await refreshTeam();

          return result;
        } catch (error) {
          setVerifyError(error);

          return null;
        } finally {
          setVerifyLoading(false);
        }
      },
      [
        pendingRequest,
        refreshTeam,
      ],
    );


    // Back to Search 

    const backToSearch =
  useCallback(() => {
    setPendingRequest(null);

    setRequestError(null);
    setVerifyError(null);
  }, []);
  /* =======================================================================
     REMOVE TEAM MATE
  ======================================================================= */

  const removeTeamMate =
    useCallback(
      async (advocateId) => {
        if (!advocateId) {
          return false;
        }

        setRemovingId(
          advocateId,
        );

        setRemoveError(null);

        try {
          await removeAdvocateTeamMate(
            advocateId,
          );

          setTeamMates(
            (current) =>
              current.filter(
                (mate) =>
                  String(
                    getAdvocateId(
                      mate,
                    ),
                  ) !==
                  String(
                    advocateId,
                  ),
              ),
          );

          return true;
        } catch (error) {
          setRemoveError(error);

          return false;
        } finally {
          setRemovingId(null);
        }
      },
      [],
    );

  /* =======================================================================
     RESET SEARCH / MODAL FLOW
  ======================================================================= */

  const resetSearch =
    useCallback(() => {
      setSearchResults([]);

      setSearchPagination(
        DEFAULT_PAGINATION,
      );

      setSearchError(null);
      setActiveSearchQuery("");

      setPendingRequest(null);

      setRequestError(null);
      setVerifyError(null);
    }, []);

  return {
    /* team */
    teamMates,
    teamLoading,
    teamError,
    refreshTeam,

    /* search */
    searchResults,
    searchPagination,
    searchLoading,
    searchError,
    activeSearchQuery,
    searchAdvocates,
    resetSearch,

    /* request */
    pendingRequest,
    requestLoading,
    requestingAdvocateId,
    requestError,
    sentRequestIds,
    isRequestSent,
    sendTeamRequest,
    backToSearch,

    /* verify */
    verifyLoading,
    verifyError,
    verifyPendingRequest,

    /* remove */
    removingId,
    removeError,
    removeTeamMate,
  };
}