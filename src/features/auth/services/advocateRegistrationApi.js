/**
 * advocateRegistrationApi.js
 *
 * Backwards-compatible facade for old Advocate registration code.
 *
 * IMPORTANT:
 * Real registration implementation now lives in authApi.js.
 *
 * This file contains NO duplicate fetch logic.
 */

import {
  AuthApiError,

  startAdvocateRegistration,
  resendAdvocateEmailOtp,
  verifyAdvocateEmailOtp,
  uploadAdvocateRegistrationPhoto,
  sendAdvocatePhoneOtp,
  verifyAdvocatePhoneOtp,
  generateAdvocateAadhaarOtp,
  verifyAdvocateAadhaarOtp,
  initiateAdvocateDigilocker,
  verifyAdvocateDigilocker,
  completeAdvocateRegistration,
  getAdvocateRegistrationSession,
  getAdvocateGoogleRegisterUrl,
} from "./authApi";

export {
  AuthApiError as AdvocateApiError,
};

export {
  getAdvocateGoogleRegisterUrl,
  getAdvocateRegistrationSession,
};

export const advocateApi = {
  startRegistration:
    startAdvocateRegistration,

  resendEmailOtp:
    resendAdvocateEmailOtp,

  verifyEmail:
    verifyAdvocateEmailOtp,

  uploadProfilePhoto:
    uploadAdvocateRegistrationPhoto,

  sendPhoneOtp:
    sendAdvocatePhoneOtp,

  verifyPhone:
    verifyAdvocatePhoneOtp,

  generateAadhaarOtp:
    generateAdvocateAadhaarOtp,

  verifyAadhaarOtp:
    verifyAdvocateAadhaarOtp,

  initiateDigilocker:
    initiateAdvocateDigilocker,

  verifyDigilocker:
    verifyAdvocateDigilocker,

  completeProfile:
    completeAdvocateRegistration,

  getSession:
    getAdvocateRegistrationSession,
};