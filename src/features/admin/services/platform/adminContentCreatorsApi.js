import { adminRequest, extractList, extractRecord, idPath } from "../../utils/adminUtils";

/**
 * GET /api/admin/staff
 * Lists all staff accounts (+ roles[]).
 */
export async function getContentCreators() {
  const response = await adminRequest("/admin/staff");
  return extractList(response, ["staff", "creators", "contentCreators", "data"]);
}
export const getStaffAccounts = getContentCreators;

/**
 * GET /api/admin/staff/:id
 * Detail (+ roles[], permissions[]).
 */
export async function getContentCreator(id) {
  const response = await adminRequest(`/admin/staff/${idPath(id)}`);
  return extractRecord(response, ["staffMember", "creator", "contentCreator", "data"]);
}
export const getStaffAccount = getContentCreator;

/**
 * POST /api/admin/staff
 * Creates staff account with inline roles.
 * Body: { fullName, email, password, roleNames }
 */
export async function createContentCreator({ fullName, email, password, roleNames = [] }) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanFullName = String(fullName || "").trim();

  try {
    const response = await adminRequest("/admin/staff", {
      method: "POST",
      body: {
        fullName: cleanFullName,
        email: cleanEmail,
        password: String(password || ""),
        roleNames: Array.isArray(roleNames) ? roleNames : [],
      },
    });
    return extractRecord(response, ["staffMember", "creator", "contentCreator", "data"]);
  } catch (error) {
    const errorMsg = error?.data?.message || error?.message || "";
    const lower = errorMsg.toLowerCase();

    // Map specific backend errors to field-level errors
    if (lower.includes("already exists") || lower.includes("duplicate") || error?.status === 409) {
      error.fieldErrors = { ...(error.fieldErrors || {}), email: errorMsg || "A staff account with this email already exists." };
    } else if (lower.includes("reserved for the main admin") || lower.includes("reserved")) {
      error.fieldErrors = { ...(error.fieldErrors || {}), email: errorMsg || "This email is reserved for the main admin account." };
    } else if (lower.includes("invalid or inactive")) {
      error.invalidRoles = error?.data?.invalidRoles || [];
      error.fieldErrors = { ...(error.fieldErrors || {}), roles: errorMsg };
    }
    throw error;
  }
}
export const createStaffAccount = createContentCreator;

/**
 * PUT /api/admin/staff/:id/roles
 * Replaces the whole role set for a staff account.
 * Body: { roleNames: string[] }
 */
export async function updateContentCreatorRoles(id, { roleNames = [] }) {
  const response = await adminRequest(`/admin/staff/${idPath(id)}/roles`, {
    method: "PUT",
    body: { roleNames: Array.isArray(roleNames) ? roleNames : [] },
  });
  return extractRecord(response, ["staffMember", "creator", "contentCreator", "data", "roles"]);
}
export const updateStaffAccountRoles = updateContentCreatorRoles;
