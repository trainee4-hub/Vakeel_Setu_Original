/**
 * Backward-compatibility re-exports.
 * New signup code should import these directly from ./authApi.
 */

export {
  getUserGoogleRegisterUrl,
  getAdvocateGoogleRegisterUrl,
  getUserRegistrationSession,
  getAdvocateRegistrationSession,
} from "./authApi";
