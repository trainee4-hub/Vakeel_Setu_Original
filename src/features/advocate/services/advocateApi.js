import { getAuthToken } from "@/utils/auth";
import { ApiError, apiRequest ,API_BASE_URL} from "@shared/services/apiClient";


/* =========================================================================
   ADVOCATE API

   Every endpoint here is taken from the confirmed backend contract. Nothing
   is inferred.

     POST  /api/auth/advocate/login       { email, password } -> { token }
     GET   /api/advocate/profile          -> { advocate }
     PATCH /api/advocate/profile          partial -> { advocate }
     POST  /api/advocate/profile/photo    multipart -> { profilePhotoUrl, advocate }
   ========================================================================= */

export const ADVOCATE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export const ADVOCATE_PHOTO_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

/**
 * Email + password login.
 *
 * The response contains ONLY { success, message, token } — no user, no role,
 * no completion flag. The caller must follow this with getAdvocateProfile().
 */
export async function advocateLogin({ email, password }) {
  const data = await apiRequest("/auth/advocate/login", {
    method: "POST",
    body: { email, password },
  });

  if (!data?.token) {
    throw new ApiError("Authentication token was not returned.");
  }

  return data;
}

/** Phone OTP login — step 1. Throws with the backend message on 400
 *  ("Account not found. Please create an account first."). */
export async function advocateLoginSendOtp({ phone }) {
  return apiRequest("/auth/advocate/login/send-otp", {
    method: "POST",
    body: { phone },
  });
}

/**
 * Phone OTP login — step 2.
 *
 * The token may or may not be present depending on whether this endpoint
 * mirrors the email/password response or relies purely on the session cookie,
 * so the caller treats it as optional.
 */
export async function advocateLoginVerifyOtp({ phone, otp }) {
  return apiRequest("/auth/advocate/login/verify-otp", {
    method: "POST",
    body: { phone, otp },
  });
}

/** Authoritative advocate object. Cookie session + bearer token if present. */
export async function getAdvocateProfile() {
  const data = await apiRequest("/advocate/profile", {
    method: "GET",
    token: getAuthToken(),
  });

  if (!data?.advocate) {
    throw new ApiError("Advocate profile was not returned.");
  }

  return data.advocate;
}

/**
 * Partial update. Send ONLY changed fields — never the whole object.
 * Returns the full updated advocate.
 */
export async function patchAdvocateProfile(partialPayload) {
  const data = await apiRequest("/advocate/profile", {
    method: "PATCH",
    body: partialPayload,
    token: getAuthToken(),
  });

  if (!data?.advocate) {
    throw new ApiError("Updated advocate profile was not returned.");
  }

  return data.advocate;
}


/* =========================================================================
   ADVOCATE LIKES

   Separate from saved-lawyers in every way: different endpoints, different
   state, different meaning. Like = public appreciation with a count.
   Save = private bookmark. They must never be merged.

   Authorization is USER-only on the backend (req.user.type === "user"), so
   the UI blocks advocate accounts before a request is ever sent.
   ========================================================================= */

/** POST /advocates/:id/like -> { advocateId, liked, likeCount } */
export async function likeAdvocate(advocateId) {
  const data = await apiRequest(
    `/advocates/${encodeURIComponent(advocateId)}/like`,
    { method: "POST", token: getAuthToken() },
  );

  return data?.data ?? null;
}

/** DELETE /advocates/:id/like -> { advocateId, liked, likeCount } */
export async function unlikeAdvocate(advocateId) {
  const data = await apiRequest(
    `/advocates/${encodeURIComponent(advocateId)}/like`,
    { method: "DELETE", token: getAuthToken() },
  );

  return data?.data ?? null;
}

/** GET /user/liked-advocates -> [{ id, likeCount, isLiked, ... }] */
export async function getLikedAdvocates() {
  const data = await apiRequest("/user/liked-advocates", {
    method: "GET",
    token: getAuthToken(),
  });

  const list =
    data?.data?.advocates ??
    data?.data?.likedAdvocates ??
    data?.likedAdvocates ??
    data?.advocates ??
    data?.data ??
    [];

  return Array.isArray(list) ? list : [];
}

/* =========================================================================
   ADVOCATE TEAM MATES

   REAL BACKEND CONTRACT

   GET    /api/advocates/search?query=<name-or-bar-id>&page=1&limit=10
   POST   /api/advocates/:advocateId/team-request
   POST   /api/advocates/team-request/:requestId/verify
   GET    /api/advocates/team-mates
   DELETE /api/advocates/team-mates/:advocateId

   Backend enforces:
   - ADVOCATE role only
   - self exclusion / self-add protection
   - ACTIVE advocate only
   - duplicate team protection
   - duplicate pending request protection
   - OTP expiry / attempt limits
   ========================================================================= */

/**
 * Search advocates by:
 * - partial/full Name
 * - exact BAR ID
 *
 * GET /advocates/search?query=Rahul&page=1&limit=10
 */
export async function searchAdvocatesForTeam({
  query,
  page = 1,
  limit = 10,
}) {
  const cleanQuery = String(query || "").trim();

  if (!cleanQuery) {
    throw new ApiError(
      "Search query parameter is required.",
    );
  }

  const safePage = Math.max(
    1,
    Number(page) || 1,
  );

  const safeLimit = Math.min(
    50,
    Math.max(
      1,
      Number(limit) || 10,
    ),
  );

  const params =
    new URLSearchParams({
      query: cleanQuery,
      page: String(safePage),
      limit: String(safeLimit),
    });

  const data = await apiRequest(
    `/advocates/search?${params.toString()}`,
    {
      method: "GET",
      token: getAuthToken(),
    },
  );

  return {
    advocates:
      Array.isArray(data?.data)
        ? data.data
        : [],

    pagination: {
      page:
        Number(
          data?.pagination?.page,
        ) || safePage,

      limit:
        Number(
          data?.pagination?.limit,
        ) || safeLimit,

      total:
        Number(
          data?.pagination?.total,
        ) || 0,

      totalPages:
        Number(
          data?.pagination
            ?.totalPages,
        ) || 0,
    },
  };
}

/**
 * Initiate team request.
 *
 * OTP is sent to Advocate B.
 *
 * POST /advocates/:advocateId/team-request
 */
export async function sendTeamMateRequest(
  advocateId,
) {
  if (!advocateId) {
    throw new ApiError(
      "Advocate ID is required.",
    );
  }

  const data = await apiRequest(
    `/advocates/${encodeURIComponent(
      advocateId,
    )}/team-request`,
    {
      method: "POST",
      token: getAuthToken(),
    },
  );

  return data?.data ?? null;
}

/**
 * Advocate A verifies OTP received by Advocate B.
 *
 * POST /advocates/team-request/:requestId/verify
 * body: { otp }
 */
export async function verifyTeamMateRequest(
  requestId,
  otp,
) {
  if (!requestId) {
    throw new ApiError(
      "Team request ID is required.",
    );
  }

  const cleanOtp =
    String(otp || "").trim();

  if (
    !/^\d{6}$/.test(
      cleanOtp,
    )
  ) {
    throw new ApiError(
      "Please enter the 6-digit OTP.",
    );
  }

  const data = await apiRequest(
    `/advocates/team-request/${encodeURIComponent(
      requestId,
    )}/verify`,
    {
      method: "POST",

      body: {
        otp: cleanOtp,
      },

      token: getAuthToken(),
    },
  );

  return data?.data ?? null;
}

/**
 * GET /advocates/team-mates
 */
export async function getAdvocateTeamMates() {
  const data = await apiRequest(
    "/advocates/team-mates",
    {
      method: "GET",
      token: getAuthToken(),
    },
  );

  return Array.isArray(
    data?.teamMates,
  )
    ? data.teamMates
    : [];
}

/**
 * DELETE /advocates/team-mates/:advocateId
 */
export async function removeAdvocateTeamMate(
  advocateId,
) {
  if (!advocateId) {
    throw new ApiError(
      "Advocate ID is required.",
    );
  }

  return apiRequest(
    `/advocates/team-mates/${encodeURIComponent(
      advocateId,
    )}`,
    {
      method: "DELETE",
      token: getAuthToken(),
    },
  );
}

/** Client-side guard so an oversized/unsupported file never hits the network. */
export function validateAdvocatePhoto(file) {
  if (!file) return "Please choose a photo to upload.";
  if (!ADVOCATE_PHOTO_TYPES.includes(file.type))
    return "Only JPG, JPEG, PNG or WEBP images are allowed.";
  if (file.size > ADVOCATE_PHOTO_MAX_BYTES)
    return "Photo must be smaller than 5MB.";
  return "";
}

/**
 * Profile photo upload.
 *
 * Content-Type is intentionally NOT set — the browser generates the multipart
 * boundary. Returns { profilePhotoUrl, advocate }.
 */
export async function uploadAdvocateProfilePhoto(file) {
  const formData = new FormData();
  formData.append("profilePhoto", file);

  const data = await apiRequest("/advocate/profile/photo", {
    method: "POST",
    formData,
    token: getAuthToken(),
  });

  return {
    profilePhotoUrl: data?.profilePhotoUrl || null,
    advocate: data?.advocate || null,
  };
}



export const getAdvocateVerificationStatus = async () => {
  const response = await fetch(
    `${API_BASE_URL}/advocate/profile/verification-status`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Unable to fetch profile verification status.",
    );
  }

  return data;
};


/* =========================================================================
   ADVOCATE ACCOUNT DELETION

   REAL BACKEND CONTRACT

   POST /api/advocate/delete-account/request-otp
   POST /api/advocate/delete-account/verify-otp

   Advocate identity comes from authenticated cookie / token.
   Never send advocateId from frontend.
============================================================================ */

/**
 * Step 1:
 * Send deletion verification OTP to registered advocate phone.
 */
export async function requestAdvocateDeletionOtp() {
  return apiRequest(
    "/advocate/delete-account/request-otp",
    {
      method: "POST",
      token: getAuthToken(),
    },
  );
}

/**
 * Step 2:
 * Verify deletion OTP and place account into 30-day
 * PENDING deletion state.
 */
export async function verifyAdvocateDeletionOtp({
  otp,
}) {
  const cleanOtp =
    String(otp || "").trim();

  if (
    !/^\d{6}$/.test(
      cleanOtp,
    )
  ) {
    throw new ApiError(
      "Please enter the 6-digit verification OTP.",
    );
  }

  return apiRequest(
    "/advocate/delete-account/verify-otp",
    {
      method: "POST",

      body: {
        otp: cleanOtp,
      },

      token: getAuthToken(),
    },
  );
}


// -----------------------------------------------------------------------------
// ADVOCATE ONLINE / OFFLINE STATUS
// -----------------------------------------------------------------------------

/**
 * Refresh Advocate heartbeat.
 * Backend updates:
 * isOnline = true
 * lastSeenAt = current server time
 */
export async function sendAdvocateHeartbeat() {
  return apiRequest(
    "/advocate/heartbeat",
    {
      method: "POST",
      token: getAuthToken(),
    },
  );
}

/**
 * Manually change Advocate online/offline status.
 */
export async function updateAdvocateOnlineStatus(isOnline) {
  if (typeof isOnline !== "boolean") {
    throw new ApiError(
      "Online status must be true or false.",
    );
  }

  return apiRequest(
    "/advocate/online-status",
    {
      method: "PATCH",

      body: {
        isOnline,
      },

      token: getAuthToken(),
    },
  );
}

/**
 * Logout Advocate and immediately mark them offline.
 */
export async function logoutAdvocate() {
  return apiRequest(
    "/advocate/logout",
    {
      method: "POST",
      token: getAuthToken(),
    },
  );
}