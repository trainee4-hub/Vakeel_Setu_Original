import { apiRequest } from "@shared/services/apiClient";
import { toAdminError } from "../utils/adminUtils";

/**
 * POST /api/admin/login
 * Response: { success, message, token, admin: { id, email, fullName } }
 * The backend sets the HTTP-only auth_token cookie
 * (apiRequest sends credentials: "include").
 */
export async function loginAdmin({ email, password }) {
  try {
    const response = await apiRequest("/admin/login", {
      method: "POST",
      body: { email, password },
    });

    return {
      token: response?.token ?? null,
      admin: response?.admin ?? null,
    };
  } catch (error) {
    throw toAdminError(error);
  }
}
