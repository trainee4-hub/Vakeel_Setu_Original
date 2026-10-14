/**
 * registrationAuthApi.js
 *
 * Legacy/backward-compatible registration exports.
 *
 * New code should preferably import directly from:
 *
 * ./authApi
 */

export {
  getUserGoogleRegisterUrl,
  getAdvocateGoogleRegisterUrl,
  getUserRegistrationSession,
  getAdvocateRegistrationSession,
} from "./authApi";