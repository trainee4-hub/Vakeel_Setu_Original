import { apiRequest } from "@shared/services/apiClient";

/**
 * GET /api/advocate/earnings?page=1&limit=20
 * Returns balance summary and paginated earnings ledger.
 */
export async function getAdvocateEarnings({ page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));

  return apiRequest(`/advocate/earnings?${params.toString()}`, {
    cache: false,
    forceRefresh: true,
  });
}

/**
 * GET /api/advocate/payout-account
 * Returns saved payout bank details (masked) for form prefill.
 */
export async function getAdvocatePayoutAccount() {
  return apiRequest("/advocate/payout-account", {
    cache: false,
    forceRefresh: true,
  });
}
export { getAdvocatePayoutAccount as getPayoutAccount };

/**
 * POST /api/advocate/withdrawals
 * Submits a new withdrawal request.
 * Body: { amount, accountHolderName, accountNumber, confirmAccountNumber, ifsc, bankName }
 */
export async function submitAdvocateWithdrawal(data) {
  return apiRequest("/advocate/withdrawals", {
    method: "POST",
    body: {
      amount: Number(data.amount),
      accountHolderName: String(data.accountHolderName || "").trim(),
      accountNumber: String(data.accountNumber || "").trim(),
      confirmAccountNumber: String(data.confirmAccountNumber || "").trim(),
      ifsc: String(data.ifsc || "").trim().toUpperCase(),
      bankName: String(data.bankName || "").trim(),
    },
  });
}

/**
 * GET /api/advocate/withdrawals?status=&page=&limit=
 * Lists advocate's own withdrawal history.
 */
export async function getAdvocateWithdrawals({ status, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (status && status !== "ALL") params.set("status", status);

  return apiRequest(`/advocate/withdrawals?${params.toString()}`, {
    cache: false,
    forceRefresh: true,
  });
}

/**
 * GET /api/advocate/withdrawals/:id
 * Gets detail of a specific withdrawal request.
 */
export async function getAdvocateWithdrawalDetail(id) {
  if (!id) throw new Error("Withdrawal ID is required");
  return apiRequest(`/advocate/withdrawals/${encodeURIComponent(id)}`, {
    cache: false,
    forceRefresh: true,
  });
}
