import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "@shared/components/ui/PageHeader";
import Card from "@shared/components/ui/Card";
import { CharCounter, FormField } from "@shared/components/ui/FormControls";
import { ErrorState } from "@shared/components/feedback/ErrorState";
import { FormSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { Button, Icon } from "@shared/components/ui/Button";
import { useToast } from "@shared/components/ui/Toast";
import useAdminAuth from "../../../hooks/useAdminAuth";
import { ADMIN_PERMISSIONS } from "../../../utils/permissions";
import { getHelpRequest, updateHelpRequest } from "../../../services/platform/adminHelpApi";
import { ADMIN_PATHS, formatDate, formatDateTime } from "../../../utils/adminUtils";
import { HelpStatusBadge } from "./HelpRequestsList";

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

export default function HelpRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { has } = useAdminAuth();

  const canRespond = has(ADMIN_PERMISSIONS.HELP_RESPOND);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [helpRequest, setHelpRequest] = useState(null);

  // Form states for reply
  const [replyText, setReplyText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("OPEN");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const record = await getHelpRequest(id);
      if (!record) {
        toast.show("Help request not found.", "error");
        navigate(ADMIN_PATHS.help.list, { replace: true });
        return;
      }
      setHelpRequest(record);
      setReplyText(record.response || "");
      setSelectedStatus(record.status || "OPEN");
    } catch (err) {
      if (err?.status === 404) {
        toast.show("Help request not found.", "error");
        navigate(ADMIN_PATHS.help.list, { replace: true });
        return;
      }
      if (err?.status === 403) {
        toast.show("Access forbidden. Insufficient permissions.", "error");
      }
      setError(err?.message || "Failed to load help request details.");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const trimmedResponse = replyText.trim();
    if (!trimmedResponse) {
      setFieldErrors({ response: "Response text is required." });
      return;
    }

    if (trimmedResponse.length > 2000) {
      setFieldErrors({ response: "Response must not exceed 2000 characters." });
      return;
    }

    setSubmitting(true);
    try {
      const updated = await updateHelpRequest(id, {
        response: trimmedResponse,
        status: selectedStatus,
      });

      toast.show("Response saved", "success");
      // Update from returned record directly without firing another GET
      if (updated) {
        setHelpRequest(updated);
        setReplyText(updated.response || "");
        setSelectedStatus(updated.status || selectedStatus);
      }
    } catch (err) {
      if (err?.status === 404) {
        toast.show("Help request not found.", "error");
        navigate(ADMIN_PATHS.help.list, { replace: true });
        return;
      }
      if (err?.status === 403) {
        toast.show("Access forbidden. Insufficient permissions.", "error");
        return;
      }
      if (err?.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setFieldErrors(err.fieldErrors);
      } else {
        toast.show(err?.message || "Failed to save response.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Top Header & Navigation */}
      <PageHeader
        back={
          <Link
            to={ADMIN_PATHS.help.list}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <Icon name="arrow_back" className="text-[16px]" />
            Back to Help Requests
          </Link>
        }
        title={`Help Request: ${helpRequest?.referenceId || "Details"}`}
        description="View citizen support request details and submit staff resolutions."
        actions={
          <Link
            to={ADMIN_PATHS.help.list}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
          >
            <Icon name="list" className="text-[18px]" />
            All Requests
          </Link>
        }
      />

      {loading ? (
        <FormSkeleton />
      ) : error ? (
        <ErrorState
          title="Could not load help request"
          message={error}
          actionLabel="Retry"
          onAction={loadDetail}
        />
      ) : !helpRequest ? null : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 min-w-0">
          {/* Main Column: Request Overview & Concern */}
          <div className="space-y-6 lg:col-span-2 min-w-0">
            {/* Citizen Request Card */}
            <Card className="p-4 sm:p-6 space-y-5 border border-slate-200 min-w-0 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    {helpRequest.referenceId || "—"}
                  </span>
                  <HelpStatusBadge status={helpRequest.status} />
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  Received {formatDateTime(helpRequest.createdAt)}
                </span>
              </div>

              {/* Concern Section */}
              <div className="min-w-0">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Concern / Inquired Issue
                </h2>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 min-w-0">
                  <p className="text-sm text-slate-900 whitespace-pre-wrap break-words leading-relaxed font-normal">
                    {helpRequest.concern || "—"}
                  </p>
                </div>
              </div>

              {/* Citizen Contact Details */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Requester Details
                </h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs min-w-0">
                  <div className="min-w-0 rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <dt className="text-slate-400 font-medium">Name</dt>
                    <dd className="font-semibold text-slate-900 break-words mt-1 text-sm">
                      {helpRequest.name || "—"}
                    </dd>
                  </div>
                  <div className="min-w-0 rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <dt className="text-slate-400 font-medium">Email Address</dt>
                    <dd className="text-slate-800 break-all mt-1">
                      {helpRequest.email ? (
                        <a
                          href={`mailto:${helpRequest.email}`}
                          className="text-amber-700 font-medium hover:underline"
                        >
                          {helpRequest.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                  <div className="min-w-0 rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <dt className="text-slate-400 font-medium">Phone Number</dt>
                    <dd className="font-mono text-slate-800 break-words mt-1 font-medium">
                      {helpRequest.phoneNumber || helpRequest.phone ? (
                        <a
                          href={`tel:${helpRequest.phoneNumber || helpRequest.phone}`}
                          className="hover:underline text-slate-900"
                        >
                          {helpRequest.phoneNumber || helpRequest.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </Card>

            {/* Read-only Current Response Display (if response exists) */}
            {helpRequest.response ? (
              <Card className="p-4 sm:p-6 space-y-4 border border-emerald-200 bg-emerald-50/25 min-w-0 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-3">
                  <h3 className="text-sm font-semibold text-emerald-950 flex items-center gap-1.5">
                    <Icon name="check_circle" className="text-[18px] text-emerald-600" />
                    Latest Staff Response
                  </h3>
                  {helpRequest.respondedAt ? (
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      Responded {formatDateTime(helpRequest.respondedAt)}
                    </span>
                  ) : null}
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-slate-900 whitespace-pre-wrap break-words leading-relaxed">
                    {helpRequest.response}
                  </p>
                </div>

                {/* Only display respondedByName if present on record */}
                {helpRequest.respondedByName ? (
                  <div className="text-xs text-slate-600 pt-2 border-t border-emerald-100/60 flex items-center gap-1.5">
                    <Icon name="account_circle" className="text-[16px] text-slate-400" />
                    <span>Responded by: </span>
                    <span className="font-semibold text-slate-900">
                      {helpRequest.respondedByName}
                    </span>
                  </div>
                ) : null}
              </Card>
            ) : null}

            {/* Response Form: Rendered ONLY when admin has help:respond or wildcard */}
            {canRespond ? (
              <Card className="p-4 sm:p-6 space-y-5 border border-slate-200 min-w-0 shadow-sm">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-semibold text-slate-950">
                    {helpRequest.response ? "Update Response" : "Submit Response"}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Provide guidance or resolution to this citizen's inquiry.
                  </p>
                </div>

                <form onSubmit={handleSubmitResponse} className="space-y-5 min-w-0">
                  {/* Status Selection */}
                  <FormField
                    id="help-status-select"
                    label="Status"
                    required
                    error={fieldErrors.status}
                  >
                    <select
                      id="help-status-select"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm transition"
                      required
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  {/* Response Textarea */}
                  <FormField
                    id="help-response-text"
                    label="Response"
                    required
                    error={fieldErrors.response}
                    counter={<CharCounter value={replyText} max={2000} />}
                    hint="Saving replaces the previous response."
                  >
                    <textarea
                      id="help-response-text"
                      rows={6}
                      maxLength={2000}
                      required
                      value={replyText}
                      onChange={(e) => {
                        setReplyText(e.target.value);
                        if (fieldErrors.response) {
                          setFieldErrors((prev) => ({ ...prev, response: undefined }));
                        }
                      }}
                      placeholder="Type your official resolution or response message here…"
                      className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 break-words shadow-sm transition"
                    />
                  </FormField>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={submitting}
                      disabled={submitting}
                      icon="save"
                    >
                      {submitting ? "Saving…" : "Save Response"}
                    </Button>
                  </div>
                </form>
              </Card>
            ) : null}
          </div>

          {/* Right Column: Meta Information & Summary */}
          <div className="space-y-6 lg:col-span-1 min-w-0">
            <Card className="p-4 sm:p-6 space-y-4 border border-slate-200 min-w-0 shadow-sm sticky top-6">
              <h3 className="text-sm font-semibold text-slate-950 uppercase tracking-wider">
                Request Summary
              </h3>

              <div className="space-y-3 text-xs min-w-0">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Status</span>
                  <HelpStatusBadge status={helpRequest.status} />
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Reference ID</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {helpRequest.referenceId || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Created At</span>
                  <span className="text-slate-800 text-right">
                    {formatDate(helpRequest.createdAt)}
                  </span>
                </div>
                {helpRequest.respondedAt ? (
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Responded At</span>
                    <span className="text-slate-800 text-right">
                      {formatDate(helpRequest.respondedAt)}
                    </span>
                  </div>
                ) : null}
                {helpRequest.respondedByName ? (
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-500">Handled By</span>
                    <span className="font-medium text-slate-900 text-right truncate max-w-[150px]">
                      {helpRequest.respondedByName}
                    </span>
                  </div>
                ) : null}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
