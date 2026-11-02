import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "@shared/components/ui/PageHeader";
import { Button, Icon } from "@shared/components/ui/Button";
import { ErrorState } from "@shared/components/feedback/ErrorState";
import {
  approveProfileChange,
  getAdvocate,
  getProfileChangeDetail,
  rejectProfileChange,
} from "../../../services/platform/adminAdvocatesApi";
import { ADMIN_PATHS, formatDateTime } from "../../../utils/adminUtils";

function StatusBadge({ status }) {
  const s = String(status || "").toUpperCase();
  if (s === "SUBMITTED" || s === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-300">
        <Icon name="schedule" className="text-[14px]" />
        Pending Review
      </span>
    );
  }
  if (s === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900 border border-emerald-300">
        <Icon name="check_circle" className="text-[14px]" />
        Approved
      </span>
    );
  }
  if (s === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-900 border border-rose-300">
        <Icon name="cancel" className="text-[14px]" />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
      {status || "—"}
    </span>
  );
}

function FeeComparison({ current, requested, unit = "" }) {
  const curNum = current !== undefined && current !== null && current !== "" ? Number(current) : null;
  const reqNum = requested !== undefined && requested !== null && requested !== "" ? Number(requested) : null;

  if (reqNum === null && curNum === null) {
    return <span className="text-slate-400">—</span>;
  }

  const diff = reqNum !== null && curNum !== null ? reqNum - curNum : 0;
  const isIncrease = diff > 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="font-extrabold text-slate-900">
        ₹{reqNum !== null ? reqNum : curNum}{unit}
      </span>
      {diff !== 0 && (
        <span
          className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
            isIncrease
              ? "bg-amber-100 text-amber-900 border border-amber-300"
              : "bg-emerald-100 text-emerald-800 border border-emerald-300"
          }`}
        >
          <Icon name={isIncrease ? "arrow_upward" : "arrow_downward"} className="text-[12px]" />
          {isIncrease ? `+₹${diff}${unit}` : `-₹${Math.abs(diff)}${unit}`}
          {isIncrease && <span className="ml-1 text-[10px] uppercase font-black tracking-wider text-amber-700">(Increase)</span>}
        </span>
      )}
    </div>
  );
}

export default function ProfileChangeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [advocate, setAdvocate] = useState(null);

  // Actions state
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [enlargedPhotoUrl, setEnlargedPhotoUrl] = useState(null);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resultSettled, advSettled] = await Promise.allSettled([
        getProfileChangeDetail(id),
        getAdvocate(id),
      ]);
      if (resultSettled.status === "fulfilled") {
        setData(resultSettled.value);
      } else {
        throw resultSettled.reason;
      }
      if (advSettled.status === "fulfilled") {
        setAdvocate(advSettled.value);
      }
    } catch (err) {
      console.error("Failed to load profile change detail:", err);
      setError(err?.message || "Failed to load profile change request.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleApprove = async () => {
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      const res = await approveProfileChange(id);
      setActionSuccess(res?.message || "Advocate profile changes approved and applied successfully.");
      setShowApproveModal(false);
      await loadDetail();
    } catch (err) {
      console.error("Approve profile change error:", err);
      if (err?.status === 409) {
        setActionError("This request is no longer pending (it may have been withdrawn or already reviewed). Refreshing...");
        setShowApproveModal(false);
        await loadDetail();
      } else {
        setActionError(err?.message || "Failed to approve profile changes.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const cleanReason = String(rejectionReason || "").trim();
    if (cleanReason.length < 5) {
      setActionError("Rejection reason must be at least 5 characters.");
      return;
    }

    setActionLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      const res = await rejectProfileChange(id, { reason: cleanReason });
      setActionSuccess(res?.message || "Advocate profile change request rejected.");
      setShowRejectModal(false);
      setRejectionReason("");
      await loadDetail();
    } catch (err) {
      console.error("Reject profile change error:", err);
      if (err?.status === 409) {
        setActionError("This request is no longer pending. Refreshing...");
        setShowRejectModal(false);
        await loadDetail();
      } else {
        setActionError(err?.message || "Failed to reject profile changes.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-white rounded-2xl border border-slate-200" />
        <div className="h-96 bg-white rounded-2xl border border-slate-200" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <ErrorState
          title="Could not load profile change request"
          message={error || "Profile change request not found."}
          actionLabel="Back to Requests"
          onAction={() => navigate(ADMIN_PATHS.profileChanges.list)}
        />
      </div>
    );
  }

  const change = data.profileChange || data;
  const advocateInfo = change.advocate || advocate || {};
  const fullName = change.fullName || advocateInfo.fullName || advocateInfo.name || "Advocate";
  const phone = change.phone || advocateInfo.phone || "—";
  const barCouncilId = change.barCouncilId || advocateInfo.barCouncilId || advocateInfo.barId || "—";
  const advocateId = change.advocateId || advocateInfo.id || id;
  const isPending = change.status === "SUBMITTED" || change.status === "PENDING";

  const current = { ...(advocateInfo || {}), ...(change.current || {}) };
  const requested = { ...(change.requested || {}) };

  // If backend returns `changes` array of objects:
  if (Array.isArray(change.changes)) {
    change.changes.forEach((c) => {
      if (c && c.field) {
        if (current[c.field] === undefined) current[c.field] = c.current;
        if (requested[c.field] === undefined) requested[c.field] = c.requested;
      }
    });
  }

  // Check which fields have differences
  const differences = [];

  // 1. Experience
  if (requested.experienceYears !== undefined && requested.experienceYears !== current.experienceYears) {
    differences.push({
      key: "experienceYears",
      label: "Experience",
      current: `${current.experienceYears ?? 0} Years`,
      requested: `${requested.experienceYears} Years`,
      isFee: false,
    });
  }

  // 2. About
  if (requested.about !== undefined && requested.about !== current.about) {
    differences.push({
      key: "about",
      label: "Professional Biography",
      current: current.about || "—",
      requested: requested.about,
      isFee: false,
      isLongText: true,
    });
  }

  // 3. Fees
  if (requested.voiceCallPricePer15Min !== undefined && Number(requested.voiceCallPricePer15Min) !== Number(current.voiceCallPricePer15Min)) {
    differences.push({
      key: "voiceCallPricePer15Min",
      label: "Voice Call Rate",
      current: current.voiceCallPricePer15Min,
      requested: requested.voiceCallPricePer15Min,
      isFee: true,
      unit: " / 15 min",
    });
  }

  if (requested.videoCallPricePer15Min !== undefined && Number(requested.videoCallPricePer15Min) !== Number(current.videoCallPricePer15Min)) {
    differences.push({
      key: "videoCallPricePer15Min",
      label: "Video Call Rate",
      current: current.videoCallPricePer15Min,
      requested: requested.videoCallPricePer15Min,
      isFee: true,
      unit: " / 15 min",
    });
  }

  if (requested.officeVisitDurationMinutes !== undefined && Number(requested.officeVisitDurationMinutes) !== Number(current.officeVisitDurationMinutes)) {
    differences.push({
      key: "officeVisitDurationMinutes",
      label: "Office Visit Duration",
      current: current.officeVisitDurationMinutes,
      requested: requested.officeVisitDurationMinutes,
      isFee: false,
      unit: " min",
    });
  }

  if (requested.offlineVisitingFee !== undefined && Number(requested.offlineVisitingFee) !== Number(current.offlineVisitingFee)) {
    differences.push({
      key: "offlineVisitingFee",
      label: "Office Visit Fee",
      current: current.offlineVisitingFee,
      requested: requested.offlineVisitingFee,
      isFee: true,
      unit: requested.officeVisitDurationMinutes || current.officeVisitDurationMinutes
        ? ` / ${requested.officeVisitDurationMinutes || current.officeVisitDurationMinutes} min`
        : "",
    });
  }

  // 4. Office Address
  if (requested.officeAddress !== undefined && requested.officeAddress !== current.officeAddress) {
    differences.push({
      key: "officeAddress",
      label: "Office Address",
      current: current.officeAddress || "—",
      requested: requested.officeAddress,
      isFee: false,
    });
  }

  // 5. Regional (Pincode, City, State)
  const pinDiff = requested.pincode !== undefined && requested.pincode !== current.pincode;
  const cityDiff = requested.city !== undefined && requested.city !== current.city;
  const stateDiff = requested.state !== undefined && requested.state !== current.state;
  if (pinDiff || cityDiff || stateDiff) {
    differences.push({
      key: "regionalLocation",
      label: "City / State / Pincode",
      current: `${current.city || "—"}, ${current.state || "—"} (${current.pincode || "—"})`,
      requested: `${requested.city || current.city || "—"}, ${requested.state || current.state || "—"} (${requested.pincode || current.pincode || "—"})`,
      isFee: false,
    });
  }

  // Any extra fields in change.changes not already included
  if (Array.isArray(change.changes)) {
    change.changes.forEach((c) => {
      if (!c || !c.field) return;
      const isPhotoField =
        c.field === "profilePhoto" ||
        c.field === "profilePhotoUrl" ||
        c.field === "officePhoto" ||
        c.field === "officePhotoUrl";
      const isCoordField =
        c.field === "officeLatitude" ||
        c.field === "officeLongitude";
      const alreadyHandled =
        differences.some((d) => d.key === c.field) ||
        isPhotoField ||
        isCoordField;
      if (!alreadyHandled) {
        const isFee = ["videoCallPricePer15Min", "voiceCallPricePer15Min", "offlineVisitingFee"].includes(c.field);
        const unit =
          c.field === "voiceCallPricePer15Min" || c.field === "videoCallPricePer15Min"
            ? " / 15 min"
            : c.field === "officeVisitDurationMinutes"
              ? " min"
              : "";
        differences.push({
          key: c.field,
          label: c.label || c.field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
          current: c.current,
          requested: c.requested,
          isFee,
          unit,
          isLongText: c.field === "about",
        });
      }
    });
  }

  // 6. Coordinates
  const hasCoordDiff =
    (requested.officeLatitude !== undefined && Number(requested.officeLatitude) !== Number(current.officeLatitude)) ||
    (requested.officeLongitude !== undefined && Number(requested.officeLongitude) !== Number(current.officeLongitude));

  // 7. Photos - normalized keys (profilePhoto / profilePhotoUrl, officePhoto / officePhotoUrl)
  const requestedProfilePhoto =
    requested.profilePhotoUrl ||
    requested.profilePhoto ||
    change.profilePhotoUrl ||
    change.profilePhoto ||
    null;
  const currentProfilePhoto =
    current.profilePhotoUrl ||
    current.profilePhoto ||
    advocateInfo.profilePhotoUrl ||
    advocateInfo.profilePhoto ||
    null;

  const requestedOfficePhoto =
    requested.officePhotoUrl ||
    requested.officePhoto ||
    change.officePhotoUrl ||
    change.officePhoto ||
    null;
  const currentOfficePhoto =
    current.officePhotoUrl ||
    current.officePhoto ||
    advocateInfo.officePhotoUrl ||
    advocateInfo.officePhoto ||
    null;

  const hasPhotoInChanges = Array.isArray(change.changes) && change.changes.some((c) => c?.field === "profilePhoto" || c?.field === "profilePhotoUrl");
  const hasPhotoDiff = Boolean(
    requestedProfilePhoto &&
      (hasPhotoInChanges || (currentProfilePhoto ? requestedProfilePhoto !== currentProfilePhoto : true))
  );

  const hasOfficePhotoInChanges = Array.isArray(change.changes) && change.changes.some((c) => c?.field === "officePhoto" || c?.field === "officePhotoUrl");
  const hasOfficePhotoDiff = Boolean(
    requestedOfficePhoto &&
      (hasOfficePhotoInChanges || (currentOfficePhoto ? requestedOfficePhoto !== currentOfficePhoto : true))
  );

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to={ADMIN_PATHS.profileChanges.list}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
            title="Back to request list"
          >
            <Icon name="arrow_back" className="text-[18px]" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-950">
                {fullName}
              </h1>
              <StatusBadge status={change.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Profile Change Request submitted on {formatDateTime(change.submittedAt || change.updatedAt)}
            </p>
          </div>
        </div>

        {/* Action Buttons for SUBMITTED state */}
        {isPending && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setShowRejectModal(true)}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-4 text-xs font-bold text-rose-700 shadow-xs hover:bg-rose-50 transition disabled:opacity-50"
            >
              <Icon name="close" className="text-[16px]" />
              Reject Request
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setShowApproveModal(true)}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 text-xs font-extrabold text-white shadow-xs transition disabled:opacity-50"
            >
              <Icon name="check" className="text-[16px]" />
              Approve All Changes
            </button>
          </div>
        )}
      </div>

      {/* Action Alerts */}
      {actionError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
          <Icon name="error" className="text-[20px] text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold">{actionError}</p>
        </div>
      )}

      {actionSuccess && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <Icon name="check_circle" className="text-[20px] text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-sm font-bold">{actionSuccess}</p>
        </div>
      )}

      {/* Rejection Notice Banner */}
      {change.status === "REJECTED" && change.rejectionReason && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50/80 p-4 text-rose-950">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-200 text-rose-800 shrink-0">
              <Icon name="cancel" className="text-[18px]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-700">
                Rejection Reason
              </p>
              <p className="mt-1 text-sm font-semibold text-rose-950">
                {change.rejectionReason}
              </p>
              {change.reviewedAt && (
                <p className="mt-1 text-[11px] text-rose-700">
                  Reviewed on {formatDateTime(change.reviewedAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Advocate Summary Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Advocate Details
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="block text-xs text-slate-500">Full Name</span>
            <span className="font-bold text-sm text-slate-900">{fullName}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-500">Phone Number</span>
            <span className="font-bold text-sm text-slate-900">{phone}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-500">Bar Council ID</span>
            <span className="font-mono font-bold text-sm text-slate-900">{barCouncilId}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-500">Account Profile</span>
            <Link
              to={ADMIN_PATHS.advocates.detail(advocateId)}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 mt-0.5"
            >
              <span className="text-[.80rem] text-black px-3 py-2 border rounded-full">Profile Details</span>
              {/* <Icon name="open_in_new" className="text-[14px]" /> */}
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
         SIDE-BY-SIDE DIFFERENCES TABLE
      ========================================================================= */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-950">
              Requested Field Changes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side comparison of current live values against requested draft updates.
            </p>
          </div>
          <span className="rounded-full bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 text-xs">
            {differences.length + (hasPhotoDiff ? 1 : 0) + (hasOfficePhotoDiff ? 1 : 0) + (hasCoordDiff ? 1 : 0)} changed items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6 w-1/4">Field</th>
                <th className="py-3.5 px-6 w-1/3">Current Live Value</th>
                <th className="py-3.5 px-6 w-5/12">Requested Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {differences.map((diff) => (
                <tr key={diff.key} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6 font-bold text-slate-800 align-top">
                    {diff.label}
                  </td>
                  <td className="py-4 px-6 text-slate-600 align-top">
                    {diff.isFee ? (
                      <span className="font-semibold text-slate-700">
                        ₹{diff.current !== undefined && diff.current !== null ? diff.current : 0}{diff.unit}
                      </span>
                    ) : (
                      <span className={diff.isLongText ? "whitespace-pre-wrap leading-relaxed text-xs text-slate-600 block max-h-40 overflow-y-auto" : ""}>
                        {diff.current}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-slate-900 align-top bg-amber-50/30">
                    {diff.isFee ? (
                      <FeeComparison current={diff.current} requested={diff.requested} unit={diff.unit} />
                    ) : (
                      <div className="flex items-start gap-2">
                        <span className={`font-semibold text-amber-950 ${diff.isLongText ? "whitespace-pre-wrap leading-relaxed text-xs block max-h-40 overflow-y-auto" : ""}`}>
                          {diff.requested}
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {/* Office GPS Coordinates comparison */}
              {hasCoordDiff && (
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6 font-bold text-slate-800 align-top">
                    Office GPS Coordinates
                  </td>
                  <td className="py-4 px-6 text-slate-600 align-top">
                    <div className="space-y-1">
                      <span className="font-mono text-xs block">
                        {current.officeLatitude ? `${Number(current.officeLatitude).toFixed(5)}, ${Number(current.officeLongitude).toFixed(5)}` : "Not set"}
                      </span>
                      {current.googleMapsUrl && (
                        <a
                          href={current.googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                        >
                          <span>Open current map</span>
                          <Icon name="open_in_new" className="text-[13px]" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-900 align-top bg-amber-50/30">
                    <div className="space-y-1">
                      <span className="font-mono text-xs font-bold text-amber-950 block">
                        {requested.officeLatitude ? `${Number(requested.officeLatitude).toFixed(5)}, ${Number(requested.officeLongitude).toFixed(5)}` : "—"}
                      </span>
                      {requested.googleMapsUrl && (
                        <a
                          href={requested.googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 transition"
                        >
                          <Icon name="location_on" className="text-[14px] text-amber-600" />
                          <span>View requested pin on Google Maps</span>
                          <Icon name="open_in_new" className="text-[13px]" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {differences.length === 0 && !hasCoordDiff && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400 text-sm">
                    No text or numeric field differences found. Check photos below.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
         REQUESTED PHOTOS (ONLY NEW PHOTO, NO COMPARISON)
      ========================================================================= */}
      {((hasPhotoDiff && requestedProfilePhoto) || (hasOfficePhotoDiff && requestedOfficePhoto)) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Requested Profile Photo Card (Only if changed) */}
          {hasPhotoDiff && requestedProfilePhoto && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-slate-950">
                  Requested Profile Photo
                </h3>
                <span className="rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold px-2 py-0.5">
                  Requested
                </span>
              </div>

              <div className="max-w-xs">
                <button
                  type="button"
                  onClick={() => setEnlargedPhotoUrl(requestedProfilePhoto)}
                  className="group relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-amber-400 bg-amber-50 block shadow-sm cursor-pointer"
                >
                  <img
                    src={requestedProfilePhoto}
                    alt="Requested profile"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                    Click to enlarge
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Requested Office Chamber Photo Card (Only if changed) */}
          {hasOfficePhotoDiff && requestedOfficePhoto && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-slate-950">
                  Requested Office Photo
                </h3>
                <span className="rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold px-2 py-0.5">
                  Requested
                </span>
              </div>

              <div className="max-w-md">
                <button
                  type="button"
                  onClick={() => setEnlargedPhotoUrl(requestedOfficePhoto)}
                  className="group relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-amber-400 bg-amber-50 block shadow-sm cursor-pointer"
                >
                  <img
                    src={requestedOfficePhoto}
                    alt="Requested office"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                    Click to enlarge
                  </div>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-3">
                Inspect the photo to confirm clear visibility of the chamber entrance, door, and advocate nameplate.
              </p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
         CONFIRM APPROVE MODAL
      ========================================================================= */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Icon name="check_circle" className="text-[28px]" />
            </div>
            <h3 className="mt-4 text-lg font-extrabold text-slate-950">
              Publish these changes?
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              This will approve all requested changes atomically and make them live on the public advocate profile.
              New consultation fees will apply to future bookings made after this approval.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleApprove}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition disabled:opacity-50"
              >
                {actionLoading && <Icon name="refresh" className="animate-spin text-[16px]" />}
                Approve & Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         CONFIRM REJECT MODAL
      ========================================================================= */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <Icon name="error" className="text-[28px]" />
            </div>
            <h3 className="mt-4 text-lg font-extrabold text-slate-950">
              Reject Profile Change Request
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Provide a clear reason explaining what must be corrected. The advocate will see this reason and can resubmit their draft.
            </p>

            <div className="mt-4">
              <label htmlFor="rejection-reason" className="block text-xs font-bold text-slate-700 mb-1.5">
                Rejection Reason (5 to 500 characters) *
              </label>
              <textarea
                id="rejection-reason"
                rows={4}
                maxLength={500}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="The chamber photo is too blurry. Please upload a clear photo showing the entrance and nameplate."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10 resize-none"
              />
              <span className="block text-right text-[11px] text-slate-400 mt-1">
                {rejectionReason.trim().length} / 500 characters (min 5)
              </span>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || rejectionReason.trim().length < 5}
                onClick={handleReject}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 transition disabled:opacity-50"
              >
                {actionLoading && <Icon name="refresh" className="animate-spin text-[16px]" />}
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         LIGHTBOX PHOTO MODAL
      ========================================================================= */}
      {enlargedPhotoUrl && (
        <div
          role="dialog"
          aria-label="Enlarged photo preview"
          onClick={() => setEnlargedPhotoUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-900 shadow-2xl">
            <img
              src={enlargedPhotoUrl}
              alt="Enlarged view"
              className="max-h-[85vh] w-auto object-contain"
            />
            <button
              type="button"
              onClick={() => setEnlargedPhotoUrl(null)}
              className="absolute top-3 right-3 rounded-full bg-slate-950/60 p-2 text-white hover:bg-slate-950 transition"
            >
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
