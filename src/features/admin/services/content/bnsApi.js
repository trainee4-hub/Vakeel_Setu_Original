import { adminRequest, extractRecord, idPath } from "../../utils/adminUtils";

/*
 * Only these two BNS endpoints are confirmed.
 * No BNS list/detail/delete endpoint exists in the frontend services, and the
 * public BNS page uses a hardcoded array — so none are called here.
 */

const RECORD_KEYS = ["data", "bns", "bnsSection", "section"];

/** POST /api/admin/bns — JSON, keywords as an array. */
export async function createBNSSection(body) {
  const response = await adminRequest("/admin/bns", { method: "POST", body });
  return extractRecord(response, RECORD_KEYS);
}

/** PATCH /api/admin/bns/:id — partial update. */
export async function updateBNSSection(id, body) {
  const response = await adminRequest(`/admin/bns/${idPath(id)}`, { method: "PATCH", body });
  return extractRecord(response, RECORD_KEYS);
}
