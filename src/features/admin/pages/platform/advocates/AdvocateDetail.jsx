import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "@shared/components/ui/PageHeader";
import Card from "@shared/components/ui/Card";
import ConfirmModal from "@shared/components/ui/ConfirmModal";
import { ErrorState } from "@shared/components/feedback/ErrorState";
import { FormSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { Button, Icon } from "@shared/components/ui/Button";
import { useToast } from "@shared/components/ui/Toast";
import useAdminAuth from "../../../hooks/useAdminAuth";
import { ADMIN_PERMISSIONS } from "../../../utils/permissions";
import {
  getAdvocate,
  approveAdvocate,
  rejectAdvocate,
  updateAdvocateStatus,
  updateCallAvailability,
  cancelAdvocateDeletion,
  deleteAdvocatePermanently,
} from "../../../services/platform/adminAdvocatesApi";
import { ADMIN_PATHS, daysUntil, formatDate, formatDateTime } from "../../../utils/adminUtils";
import AdvocateProfileEditDrawer from "./AdvocateProfileEditDrawer";

export default function AdvocateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { has } = useAdminAuth();
  const toast = useToast();

  const [advocate, setAdvocate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Profile Drawer state
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [canEditOverride, setCanEditOverride] = useState(true);
  const [recentChanges, setRecentChanges] = useState(null);

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveCallAvailability, setApproveCallAvailability] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [showCancelDeletionConfirm, setShowCancelDeletionConfirm] = useState(false);

  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false);
  const [confirmNameInput, setConfirmNameInput] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdvocate(id);
      if (!data) throw new Error("Advocate not found.");
      setAdvocate(data);
    } catch (err) {
      setError(err?.message || "Failed to load advocate profile.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const approvalStatus = (advocate?.approvalStatus || "PENDING").toUpperCase();
  const accountStatus = (advocate?.accountStatus || advocate?.status || "ACTIVE").toUpperCase();
  const isPendingDeletion = Boolean(advocate?.deletionRequestedAt || advocate?.scheduledDeletionAt);
  const daysLeft = daysUntil(advocate?.scheduledDeletionAt);

  // Edit permission check: advocates:edit OR wildcard "*"
  const canEdit =
    (has(ADMIN_PERMISSIONS.ADVOCATES_EDIT) || has("*")) && canEditOverride;

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approveAdvocate(id, {
        approvalStatus: "APPROVED",
        callAvailability: approveCallAvailability,
      });
      toast.show("Advocate approved successfully.", "success");
      setShowApproveModal(false);
      if (approvalStatus === "REJECTED") {
        navigate(`${ADMIN_PATHS.advocates.list}?tab=rejected`, { replace: true });
        return;
      }
      loadProfile();
    } catch (err) {
      toast.show(err?.message || "Failed to approve advocate.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await rejectAdvocate(id, { reason: rejectReason.trim() });
      toast.show("Advocate application rejected.", "info");
      setShowRejectModal(false);
      setRejectReason("");
      loadProfile();
    } catch (err) {
      toast.show(err?.message || "Failed to reject advocate.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    const nextStatus = accountStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    setActionLoading(true);
    try {
      await updateAdvocateStatus(id, { status: nextStatus });
      toast.show(`Advocate account status set to ${nextStatus}.`, "success");
      setShowStatusConfirm(false);
      loadProfile();
    } catch (err) {
      toast.show(err?.message || "Failed to update account status.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCallAvailability = async () => {
    setActionLoading(true);
    const next = !advocate?.callAvailability;
    try {
      await updateCallAvailability(id, { callAvailability: next });
      toast.show(`Call availability turned ${next ? "ON" : "OFF"}.`, "success");
      loadProfile();
    } catch (err) {
      toast.show(err?.message || "Failed to update call availability.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    setActionLoading(true);
    try {
      await cancelAdvocateDeletion(id);
      toast.show("Deletion request cancelled. Account restored to normal.", "success");
      setShowCancelDeletionConfirm(false);
      loadProfile();
    } catch (err) {
      toast.show(err?.message || "Failed to cancel deletion request.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    const advocateName = advocate?.fullName || advocate?.name || "";
    if (confirmNameInput.trim() !== advocateName.trim()) return;
    setActionLoading(true);
    try {
      await deleteAdvocatePermanently(id);
      toast.show("Advocate permanently deleted and archived.", "info");
      navigate(ADMIN_PATHS.advocates.list, { replace: true });
    } catch (err) {
      toast.show(err?.message || "Failed to permanently delete advocate.", "error");
      setActionLoading(false);
    }
  };

  if (loading) return <FormSkeleton />;
  if (error || !advocate) {
    return (
      <ErrorState
        title="Advocate not found"
        message={error || "Could not retrieve advocate profile."}
        actionLabel="Back to Advocates"
        onAction={() => navigate(ADMIN_PATHS.advocates.list)}
      />
    );
  }

  const advocateName = advocate.fullName || advocate.name || "Advocate";

  return (
    <div className="space-y-6">
      {/* Rejected Banner (Styled like ErrorState palette) */}
      {approvalStatus === "REJECTED" ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-600 shrink-0 mt-0.5">
              <Icon name="error" className="text-[20px]" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-red-950">
                Rejected on {formatDateTime(advocate.rejectedAt || advocate.updatedAt)} — Reason: {advocate.rejectionReason || "No reason specified."}
              </p>
              <p className="mt-1 text-xs text-red-800">
                You can edit this advocate's credentials to resolve issues, or approve the profile directly.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Changes Made Panel */}
      {recentChanges && recentChanges.length > 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-950 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon name="check_circle" className="text-emerald-600 text-[18px]" />
              <span className="font-semibold text-sm">Changes made:</span>
            </div>
            <button
              type="button"
              onClick={() => setRecentChanges(null)}
              className="text-xs text-emerald-700 hover:text-emerald-950 font-medium"
            >
              Dismiss
            </button>
          </div>
          <ul className="text-xs font-mono space-y-1 text-emerald-900">
            {recentChanges.map((cf, idx) => (
              <li key={idx}>
                <span className="font-semibold">{cf.field}:</span> {String(cf.oldValue ?? "—")} → {String(cf.newValue ?? "—")}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Header and Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link
            to={ADMIN_PATHS.advocates.list}
            className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            <Icon name="arrow_back" className="text-[14px]" /> Back to Advocates
          </Link>
          <PageHeader
            title={advocateName}
            description={`Bar Council ID: ${advocate.barCouncilId || advocate.barId || "Unspecified"} · Registered ${formatDate(advocate.createdAt)}`}
          />
        </div>

        {/* Action Controls Toolbar */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2 w-full lg:w-auto shrink-0 [&>*]:w-full sm:[&>*]:w-auto [&>*:last-child:nth-child(odd)]:col-span-2">
          {/* Edit Profile Action */}
          {canEdit ? (
            <Button
              variant="secondary"
              icon="edit"
              onClick={() => setShowEditDrawer(true)}
            >
              Edit Profile
            </Button>
          ) : null}

          {/* Approval Actions */}
          {has(ADMIN_PERMISSIONS.ADVOCATES_APPROVE) && approvalStatus !== "APPROVED" ? (
            <Button
              variant="primary"
              icon="check_circle"
              onClick={() => {
                setApproveCallAvailability(Boolean(advocate.callAvailability));
                setShowApproveModal(true);
              }}
            >
              Approve
            </Button>
          ) : null}

          {has(ADMIN_PERMISSIONS.ADVOCATES_REJECT) && approvalStatus !== "REJECTED" ? (
            <Button
              variant="secondary"
              icon="cancel"
              onClick={() => {
                setRejectReason("");
                setShowRejectModal(true);
              }}
            >
              Reject
            </Button>
          ) : null}

          {/* Account Status Action */}
          {has(ADMIN_PERMISSIONS.ADVOCATES_UPDATE_STATUS) ? (
            <Button
              variant="tertiary"
              icon={accountStatus === "ACTIVE" ? "block" : "lock_open"}
              onClick={() => setShowStatusConfirm(true)}
            >
              {accountStatus === "ACTIVE" ? "Block Account" : "Activate Account"}
            </Button>
          ) : null}

          {/* Call Availability Action */}
          {has(ADMIN_PERMISSIONS.ADVOCATES_UPDATE_STATUS) && approvalStatus === "APPROVED" ? (
            <Button
              variant="secondary"
              icon="phone_in_talk"
              onClick={handleToggleCallAvailability}
              disabled={actionLoading}
            >
              Call: {advocate.callAvailability ? "Disable" : "Enable"}
            </Button>
          ) : null}

          {/* Deletion Management */}
          {isPendingDeletion && has(ADMIN_PERMISSIONS.ADVOCATES_DELETE) ? (
            <>
              <Button
                variant="secondary"
                icon="undo"
                onClick={() => setShowCancelDeletionConfirm(true)}
              >
                Cancel Deletion
              </Button>
              <Button
                variant="danger"
                icon="delete_forever"
                onClick={() => {
                  setConfirmNameInput("");
                  setShowPermanentDeleteModal(true);
                }}
              >
                Delete Permanently
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {/* Deletion Warning Banner */}
      {isPendingDeletion ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900 break-words">
          <div className="flex items-start gap-3">
            <Icon name="warning" className="text-[22px] text-red-600 mt-0.5 shrink-0" />
            <div className="text-sm min-w-0">
              <p className="font-semibold">Account Scheduled For Permanent Deletion</p>
              <p className="mt-1 text-red-800">
                Deletion requested on {formatDate(advocate.deletionRequestedAt)}. Scheduled for permanent erasure on{" "}
                {formatDate(advocate.scheduledDeletionAt)}{" "}
                {daysLeft !== null ? `(${daysLeft > 0 ? `${daysLeft} days remaining` : "Due for purge today"})` : ""}.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Personal & Contact */}
        <div className="space-y-6 lg:col-span-1 min-w-0">
          <Card className="p-4 sm:p-6">
            <div className="flex flex-col items-center text-center">
              {advocate.profilePhotoUrl ? (
                <img
                  src={advocate.profilePhotoUrl}
                  alt={advocateName}
                  className="h-28 w-28 rounded-full object-cover shadow-sm ring-2 ring-slate-100"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Icon name="person" className="text-[48px]" />
                </div>
              )}
              <h2 className="mt-4 text-lg font-bold text-slate-950 break-words max-w-full">{advocateName}</h2>
              <p className="text-xs text-slate-500 break-all max-w-full">{advocate.email || "No email"}</p>
              <p className="text-xs text-slate-500 break-words max-w-full">{advocate.phone || "No phone"}</p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${
                    approvalStatus === "APPROVED"
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                      : approvalStatus === "REJECTED"
                        ? "bg-red-50 text-red-700 ring-1 ring-red-600/20"
                        : "bg-amber-50 text-amber-800 ring-1 ring-amber-600/20"
                  }`}
                >
                  Approval: {approvalStatus}
                </span>

                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${
                    accountStatus === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                      : "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20"
                  }`}
                >
                  Status: {accountStatus}
                </span>
              </div>

              {advocate.rejectionReason ? (
                <div className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 p-3 text-left text-xs text-red-800 break-words">
                  <p className="font-semibold">Rejection Reason:</p>
                  <p className="mt-1 break-words">{advocate.rejectionReason}</p>
                </div>
              ) : null}
            </div>
          </Card>

          {/* Consultation Charges & Service Settings */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Service & Fee Settings</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between items-center gap-2">
                <dt className="text-slate-500 shrink-0">Call Available</dt>
                <dd className="font-semibold text-slate-900">{advocate.callAvailability ? "Yes" : "No"}</dd>
              </div>
              <div className="flex justify-between items-start gap-2">
                <dt className="text-slate-500 shrink-0">Online Status</dt>
                <dd className="flex flex-col items-end text-right">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      advocate.isOnline
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                        : "bg-slate-50 text-slate-600 ring-slate-500/10"
                    }`}
                  >
                    {advocate.isOnline ? "Online" : "Offline"}
                  </span>
                  {advocate.lastSeenAt ? (
                    <span className="mt-1 text-[11px] text-slate-400">
                      Last seen {formatDate(advocate.lastSeenAt)}
                    </span>
                  ) : null}
                </dd>
              </div>
              <div className="flex justify-between items-center gap-2">
                <dt className="text-slate-500 shrink-0">Video Call Rate</dt>
                <dd className="font-semibold text-slate-900">
                  {advocate.videoCallChargePerMinute !== null && advocate.videoCallChargePerMinute !== undefined
                    ? `₹${advocate.videoCallChargePerMinute}/min`
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between items-center gap-2">
                <dt className="text-slate-500 shrink-0">Voice Call Rate</dt>
                <dd className="font-semibold text-slate-900">
                  {advocate.voiceCallChargePerMinute !== null && advocate.voiceCallChargePerMinute !== undefined
                    ? `₹${advocate.voiceCallChargePerMinute}/min`
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between items-center gap-2">
                <dt className="text-slate-500 shrink-0">In-Person Visiting Fee</dt>
                <dd className="font-semibold text-slate-900">
                  {advocate.offlineVisitingFee !== null && advocate.offlineVisitingFee !== undefined
                    ? `₹${advocate.offlineVisitingFee}`
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between items-center gap-2">
                <dt className="text-slate-500 shrink-0">Aadhaar Verified</dt>
                <dd className="font-semibold text-slate-900">{advocate.aadhaarVerified ? "Yes" : "No"}</dd>
              </div>
            </dl>
          </Card>
        </div>

        {/* Right Columns: Legal Credentials & Practice Details */}
        <div className="space-y-6 lg:col-span-2 min-w-0">
          <Card className="p-4 sm:p-6">
            <h3 className="text-base font-semibold text-slate-900">Professional Credentials</h3>
            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 text-sm">
              <div className="min-w-0">
                <dt className="text-xs text-slate-500">Bar Council ID</dt>
                <dd className="mt-1 font-mono font-semibold text-slate-900 break-words">{advocate.barCouncilId || advocate.barId || "—"}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-slate-500">Experience</dt>
                <dd className="mt-1 font-medium text-slate-900 break-words">
                  {advocate.experienceYears || advocate.experience ? `${advocate.experienceYears || advocate.experience} years` : "—"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-slate-500">Primary Practice Area</dt>
                <dd className="mt-1 font-medium text-slate-900 break-words">{advocate.bestPracticeArea || advocate.lawType || "—"}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-slate-500">All Practice Areas</dt>
                <dd className="mt-1 font-medium text-slate-900 break-words">
                  {Array.isArray(advocate.practiceAreas) && advocate.practiceAreas.length > 0
                    ? advocate.practiceAreas.join(", ")
                    : advocate.bestPracticeArea || "—"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-slate-500">Top Court Practised</dt>
                <dd className="mt-1 font-medium text-slate-900 break-words">{advocate.topCourtPractised || "—"}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-slate-500">Courts Practiced</dt>
                <dd className="mt-1 font-medium text-slate-900 break-words">
                  {Array.isArray(advocate.courtPractice) && advocate.courtPractice.length > 0
                    ? advocate.courtPractice.join(", ")
                    : "—"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-slate-500">Languages Spoken</dt>
                <dd className="mt-1 font-medium text-slate-900 break-words">
                  {Array.isArray(advocate.languagesSpoken) && advocate.languagesSpoken.length > 0
                    ? advocate.languagesSpoken.join(", ")
                    : "—"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-slate-500">Gender</dt>
                <dd className="mt-1 font-medium text-slate-900 break-words">{advocate.gender || "—"}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-slate-500">Cases Handled</dt>
                <dd className="mt-1 font-medium text-slate-900 break-words">
                  {advocate.casesHandled !== null && advocate.casesHandled !== undefined
                    ? advocate.casesHandled
                    : "—"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-slate-500">City / State</dt>
                <dd className="mt-1 font-medium text-slate-900 break-words">
                  {[advocate.city, advocate.state].filter(Boolean).join(", ") || "—"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-slate-500">Pincode</dt>
                <dd className="mt-1 font-medium text-slate-900 break-words">{advocate.pincode || "—"}</dd>
              </div>
              <div className="sm:col-span-2 min-w-0">
                <dt className="text-xs text-slate-500">Complete Address</dt>
                <dd className="mt-1 font-medium text-slate-900 break-words">{advocate.completeAddress || "—"}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-4 sm:p-6">
            <h3 className="text-base font-semibold text-slate-900">Bio & Summary</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap break-words">
              {advocate.about || advocate.bio || "No professional biography provided."}
            </p>
          </Card>
        </div>
      </div>

      {/* EDIT PROFILE DRAWER */}
      <AdvocateProfileEditDrawer
        open={showEditDrawer}
        advocate={advocate}
        onClose={() => setShowEditDrawer(false)}
        onSaved={(result) => {
          if (result.changedFields && result.changedFields.length > 0) {
            toast.show("Profile updated", "success");
            setRecentChanges(result.changedFields);
          } else {
            toast.show("No changes", "info");
          }
          if (result.data) {
            setAdvocate(result.data);
          }
          setShowEditDrawer(false);
        }}
        onForbidden={(err) => {
          toast.show(err.message || "You do not have permission to edit advocate profiles.", "error");
          setCanEditOverride(false);
          setShowEditDrawer(false);
        }}
        onNotFound={(err) => {
          toast.show(err.message || "Advocate not found.", "error");
          navigate(ADMIN_PATHS.advocates.list);
        }}
      />

      {/* APPROVE MODAL */}
      <ConfirmModal
        open={showApproveModal}
        title={`Approve ${advocateName}`}
        confirmLabel="Approve Advocate"
        variant="primary"
        busy={actionLoading}
        onConfirm={handleApprove}
        onCancel={() => setShowApproveModal(false)}
      >
        <p className="text-sm text-slate-600">
          Approving this profile will grant the advocate full access to consultation bookings and client inquiries.
        </p>
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <input
            id="call-avail-checkbox"
            type="checkbox"
            checked={approveCallAvailability}
            onChange={(e) => setApproveCallAvailability(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          <label htmlFor="call-avail-checkbox" className="text-sm font-medium text-slate-800">
            Enable Call Availability immediately
          </label>
        </div>
      </ConfirmModal>

      {/* REJECT MODAL */}
      {showRejectModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-950">Reject Advocate Application</h3>
            <p className="mt-1 text-sm text-slate-600">
              Please state the specific reason for rejection. This reason will be recorded and communicated.
            </p>
            <form onSubmit={handleReject} className="mt-4 space-y-4">
              <div>
                <label htmlFor="reject-reason" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reject-reason"
                  rows={4}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Incomplete bar council documentation or unverifiable license number."
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="tertiary" type="button" onClick={() => setShowRejectModal(false)} disabled={actionLoading}>
                  Cancel
                </Button>
                <Button variant="danger" type="submit" disabled={!rejectReason.trim() || actionLoading}>
                  {actionLoading ? "Rejecting…" : "Reject Application"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* STATUS TOGGLE CONFIRM MODAL */}
      <ConfirmModal
        open={showStatusConfirm}
        title={`${accountStatus === "ACTIVE" ? "Block" : "Activate"} Advocate`}
        message={`Are you sure you want to ${accountStatus === "ACTIVE" ? "block" : "activate"} this advocate account? ${
          accountStatus === "ACTIVE"
            ? "Blocked advocates will be completely hidden from clients and cannot accept calls."
            : "Activated advocates will be publicly visible to clients."
        }`}
        confirmLabel={accountStatus === "ACTIVE" ? "Block Account" : "Activate Account"}
        variant={accountStatus === "ACTIVE" ? "danger" : "primary"}
        busy={actionLoading}
        onConfirm={handleToggleStatus}
        onCancel={() => setShowStatusConfirm(false)}
      />

      {/* CANCEL DELETION CONFIRM MODAL */}
      <ConfirmModal
        open={showCancelDeletionConfirm}
        title="Cancel Account Deletion"
        message="Are you sure you want to cancel the deletion request for this advocate? The scheduled purge will be revoked."
        confirmLabel="Cancel Deletion"
        variant="primary"
        busy={actionLoading}
        onConfirm={handleCancelDeletion}
        onCancel={() => setShowCancelDeletionConfirm(false)}
      />

      {/* DESTRUCTIVE PERMANENT DELETE MODAL */}
      {showPermanentDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-red-300">
            <div className="flex items-center gap-3 text-red-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                <Icon name="delete_forever" className="text-[24px]" />
              </div>
              <h3 className="text-lg font-bold text-slate-950">Permanently Delete Advocate</h3>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p className="font-semibold text-red-700">
                WARNING: This action is permanent and cannot be undone.
              </p>
              <p>
                All lawyer profile details, appointments, direct consultation history, and associated tokens will be
                permanently purged. Only compliance records and invoice audit logs will be preserved in cold archive.
              </p>
              <p>
                To confirm permanent deletion, type the advocate's exact name{" "}
                <span className="font-bold text-slate-950 select-all font-mono">"{advocateName}"</span> below:
              </p>

              <input
                type="text"
                value={confirmNameInput}
                onChange={(e) => setConfirmNameInput(e.target.value)}
                placeholder={advocateName}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 font-medium"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="tertiary" onClick={() => setShowPermanentDeleteModal(false)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button
                variant="danger"
                icon="delete_forever"
                disabled={confirmNameInput.trim() !== advocateName.trim() || actionLoading}
                onClick={handlePermanentDelete}
              >
                {actionLoading ? "Deleting…" : "Delete Advocate Permanently"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
