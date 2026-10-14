import { useMemo } from "react";

import { useAuth } from "../../auth";
import { getAdvocateProfileCompletion } from "@/utils/advocateProfile";

/* =========================================================================
   ADVOCATE DASHBOARD DATA

   Advocate profile is already restored/synced by AdvocateProfileGuard.

   Consultation / booking API is NOT implemented in backend yet,
   therefore no consultation request is made from this hook.
   ========================================================================= */

export default function useAdvocateDashboard() {
  const { user } = useAuth();

  /* -----------------------------------------------------------------------
     PROFILE COMPLETION
  ----------------------------------------------------------------------- */

  const completion = useMemo(
    () => getAdvocateProfileCompletion(user),
    [user],
  );

  return {
    advocate: user,

    completion,

    /*
     * No separate dashboard fetch is running anymore.
     */
    isLoading: false,
    error: null,

    /*
     * Kept so existing components calling refresh()
     * do not immediately break.
     *
     * Remove this later if no component uses refresh.
     */
    refresh: () => {},
  };
}