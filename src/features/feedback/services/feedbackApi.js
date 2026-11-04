import { apiRequest } from "../../../shared/services/apiClient";

/**
 * Submit feedback for authenticated User or Advocate.
 * 
 * Spec:
 * - User: POST /api/user/feedback (or /api/feedback)
 * - Advocate: POST /api/advocate/feedback (or /api/feedback)
 * - Headers: Authorization: Bearer <TOKEN> (or auth_token cookie)
 * - Body: { description: string } (min 3, max 2000 characters)
 */
export async function submitFeedback({ description, role, token }) {
  const trimmed = typeof description === "string" ? description.trim() : "";

  if (!trimmed) {
    throw new Error("Feedback description cannot be empty.");
  }
  if (trimmed.length < 3) {
    throw new Error("Description must be at least 3 characters long.");
  }
  if (trimmed.length > 2000) {
    throw new Error("Description must be at most 2000 characters long.");
  }

  const isAdvocate = String(role || "").toLowerCase() === "advocate";
  const primaryEndpoint = isAdvocate ? "/advocate/feedback" : "/user/feedback";

  try {
    return await apiRequest(primaryEndpoint, {
      method: "POST",
      body: { description: trimmed },
      token,
    });
  } catch (err) {
    // If specific role endpoint is not routed or returns 404, fall back to alias endpoint /feedback
    if (err?.status === 404) {
      return await apiRequest("/feedback", {
        method: "POST",
        body: { description: trimmed },
        token,
      });
    }
    throw err;
  }
}

