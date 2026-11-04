import { adminRequest, idPath } from "../../utils/adminUtils";

/**
 * GET /api/admin/withdrawals
 * Query params: status, search, from, to, page, limit
 */
export async function getAdminWithdrawals({
  status = "",
  search = "",
  from = "",
  to = "",
  page = 1,
  limit = 20,
} = {}) {
  const params = new URLSearchParams();
  if (status && status !== "ALL") params.set("status", status);
  if (search) params.set("search", search.trim());
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));

  const query = params.toString();
  return adminRequest(`/admin/withdrawals${query ? `?${query}` : ""}`, {
    cache: false,
    forceRefresh: true,
  });
}

/**
 * GET /api/admin/withdrawals/:id
 * Fetches withdrawal detail, decrypted account (if payouts:manage),
 * advocateSummary, recentLedger, and previousWithdrawals.
 */
export async function getAdminWithdrawalDetail(id) {
  return adminRequest(`/admin/withdrawals/${idPath(id)}`, {
    cache: false,
    forceRefresh: true,
  });
}

/**
 * POST /api/admin/withdrawals/:id/approve
 */
export async function approveWithdrawal(id) {
  return adminRequest(`/admin/withdrawals/${idPath(id)}/approve`, {
    method: "POST",
  });
}

/**
 * POST /api/admin/withdrawals/:id/mark-paid
 * Body: { utr, paidAt }
 */
export async function markPaidWithdrawal(id, { utr, paidAt }) {
  return adminRequest(`/admin/withdrawals/${idPath(id)}/mark-paid`, {
    method: "POST",
    body: {
      utr: String(utr || "").trim(),
      ...(paidAt ? { paidAt } : {}),
    },
  });
}

/**
 * POST /api/admin/withdrawals/:id/reject
 * Body: { reason }
 */
export async function rejectWithdrawal(id, { reason }) {
  return adminRequest(`/admin/withdrawals/${idPath(id)}/reject`, {
    method: "POST",
    body: {
      reason: String(reason || "").trim(),
    },
  });
}

/**
 * GET /api/admin/advocates/:advocateId/earnings
 */
export async function getAdminAdvocateEarnings(advocateId) {
  return adminRequest(`/admin/advocates/${idPath(advocateId)}/earnings`, {
    cache: false,
    forceRefresh: true,
  });
}

