import { useCallback, useEffect, useState } from "react";
import PageHeader from "@shared/components/ui/PageHeader";
import Card from "@shared/components/ui/Card";
import Pagination from "@shared/components/ui/Pagination";
import ConfirmModal from "@shared/components/ui/ConfirmModal";
import { EmptyState } from "@shared/components/feedback/EmptyState";
import { ErrorState } from "@shared/components/feedback/ErrorState";
import { CardGridSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { Button, Icon } from "@shared/components/ui/Button";
import { useToast } from "@shared/components/ui/Toast";
import useAdminAuth from "../../../hooks/useAdminAuth";
import { ADMIN_PERMISSIONS } from "../../../utils/permissions";
import {
  getConsultancyRequests,
  updateConsultancyStatus,
} from "../../../services/platform/adminConsultancyApi";
import { formatDate } from "../../../utils/adminUtils";

export default function ConsultancyList() {
  const toast = useToast();
  const { has } = useAdminAuth();
  const canUpdate = has(ADMIN_PERMISSIONS.CONSULTANCY_UPDATE);

  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ items: [], pagination: {} });
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [itemToComplete, setItemToComplete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // FIFO: Server returns oldest first by design. Do not re-sort client-side!
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getConsultancyRequests({ page, limit: 12, status: statusFilter });
      setData(res);
    } catch (err) {
      setError(err?.message || "Failed to load consultancy requests.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData, reloadTrigger]);

  const handleMarkCompleted = async () => {
    if (!itemToComplete) return;
    setActionLoading(true);
    try {
      await updateConsultancyStatus(itemToComplete.id, { status: "COMPLETED" });
      toast.show("Consultation marked as completed.", "success");
      setItemToComplete(null);
      setReloadTrigger((k) => k + 1);
    } catch (err) {
      toast.show(err?.message || "Failed to complete consultation.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Consultancy Requests"
          description="Operational consultation booking queue. Processed First-In-First-Out (FIFO, oldest first)."
        />

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <label htmlFor="consultancy-status" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Status:
          </label>
          <select
            id="consultancy-status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">All Consultations</option>
            <option value="PENDING">Pending (Action Required)</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : error ? (
        <ErrorState
          title="Could not load consultations"
          message={error}
          actionLabel="Retry"
          onAction={() => setReloadTrigger((k) => k + 1)}
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon="phone_in_talk"
          title="No consultation requests found"
          message={
            statusFilter === "PENDING"
              ? "All consultation requests are cleared!"
              : "No consultation requests recorded in this queue."
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((item) => {
              const isPending = item.status === "PENDING";
              const clientName = item.user?.fullName || item.userName || "Client";
              return (
                <Card key={item.id} className="flex flex-col justify-between p-5 border border-slate-200">
                  <div className="space-y-3">
                    {/* Header line: Type & Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <Icon name="phone" className="text-[18px] text-amber-600" />
                        {item.callType || "Audio Consultation"}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                          isPending
                            ? "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20"
                            : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Client & Phone Details */}
                    <div className="space-y-1 text-xs">
                      <p className="text-slate-500">
                        Client: <span className="font-semibold text-slate-900">{clientName}</span>
                      </p>
                      <p className="text-slate-500 font-mono">
                        Phone: <span className="text-slate-800">{item.phoneNumber || item.user?.phone || "—"}</span>
                      </p>
                      {item.email || item.user?.email ? (
                        <p className="text-slate-500">
                          Email: <span className="text-slate-800">{item.email || item.user?.email}</span>
                        </p>
                      ) : null}
                    </div>

                    {/* Duration & Price Metric (Price is strictly display-only) */}
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs">
                      <div>
                        <span className="text-slate-400 block">Duration</span>
                        <span className="font-medium text-slate-800">{item.duration || "15 mins"}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block">Consultation Fee</span>
                        <span className="font-bold text-slate-900">
                          {item.price ? `₹${item.price}` : "Free"}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Requested: {formatDate(item.createdAt)}
                    </p>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {isPending && canUpdate ? (
                      <Button
                        variant="primary"
                        className="w-full !py-1.5 !text-xs"
                        icon="check"
                        onClick={() => setItemToComplete(item)}
                      >
                        Mark Completed
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        {isPending ? "Pending review" : "Consultation finished"}
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <Pagination
            pagination={data.pagination}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* CONFIRM MARK COMPLETED MODAL */}
      <ConfirmModal
        open={Boolean(itemToComplete)}
        title="Mark Consultation Completed"
        message={`Are you sure you want to mark this consultation for ${itemToComplete?.user?.fullName || itemToComplete?.phoneNumber || "client"} as COMPLETED? Once completed, this consultation cannot revert to pending.`}
        confirmLabel="Mark Completed"
        variant="primary"
        busy={actionLoading}
        onConfirm={handleMarkCompleted}
        onCancel={() => setItemToComplete(null)}
      />
    </div>
  );
}
