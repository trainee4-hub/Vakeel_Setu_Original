import { adminRequest, extractRecord, idPath } from "../../utils/adminUtils";

/*
 * Only these two IPC endpoints are confirmed.
 * No IPC list/detail/delete endpoint exists in the frontend services, and the
 * public IPC page uses a hardcoded array — so none are called here.
 */

const RECORD_KEYS = ["data", "ipc", "ipcSection", "section"];

/** POST /api/admin/ipc — JSON, keywords as an array. */
export async function createIPCSection(body) {
  const response = await adminRequest("/admin/ipc", { method: "POST", body });
  return extractRecord(response, RECORD_KEYS);
}

/** PATCH /api/admin/ipc/:id — partial update. */
export async function updateIPCSection(id, body) {
  const response = await adminRequest(`/admin/ipc/${idPath(id)}`, { method: "PATCH", body });
  return extractRecord(response, RECORD_KEYS);
}
