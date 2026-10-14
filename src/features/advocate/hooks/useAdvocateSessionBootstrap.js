import { useCallback } from "react";

import { useAuth } from "../../auth";
import { markAdvocateProfileSynced } from "./useAdvocateProfileSync";
import { getAdvocateProfile } from "../services/advocateApi";
import {
  normalizeAdvocate,
  resolveAdvocateRedirect,
} from "@/utils/advocateProfile";

/* =========================================================================
   ADVOCATE SESSION BOOTSTRAP

   Everything that must happen AFTER an advocate is authenticated, regardless
   of how they authenticated:

     email + password  -> token in response body
     phone OTP         -> token in response body
     Google OAuth      -> cookie set by the backend, no token in JS

   All three converge here:

     persist token (if any) -> GET /advocate/profile -> normalize (role from
     type) -> Redux + storage -> resolve redirect from completeness

   Using this everywhere is what stops a phone-OTP or Google login from
   skipping the completeness check and bouncing off the dashboard guard.
   ========================================================================= */

export function useAdvocateSessionBootstrap() {
  const { login } = useAuth();

  /**
   * @param {string|null} token  Bearer token when the auth method returns one;
   *                             null for cookie-only flows (Google).
   * @param {string|null} from   Intended route saved by ProtectedRoute.
   * @returns {Promise<{ advocate: object, redirectTo: string }>}
   */
  const establishSession = useCallback(
    async ({ token = null, from = null } = {}) => {
      /* The profile request is authenticated by the cookie session and, when
         available, the bearer token. login() below persists the token through
         the existing auth helper. */
      const advocate = await getAdvocateProfile();

      const normalizedAdvocate = normalizeAdvocate(advocate);

      login(normalizedAdvocate, token);

      /* Redux now holds fresher data than any sync would fetch. */
      markAdvocateProfileSynced();

      return {
        advocate: normalizedAdvocate,
        redirectTo: resolveAdvocateRedirect(normalizedAdvocate, from),
      };
    },
    [login],
  );

  return { establishSession };
}

export default useAdvocateSessionBootstrap;