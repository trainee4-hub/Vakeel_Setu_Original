import { useCallback, useEffect, useState } from "react";
import PageHeader from "@shared/components/ui/PageHeader";
import ResourceTable from "@shared/components/ui/ResourceTable";
import Pagination from "@shared/components/ui/Pagination";
import ConfirmModal from "@shared/components/ui/ConfirmModal";
import { EmptyState } from "@shared/components/feedback/EmptyState";
import { ErrorState } from "@shared/components/feedback/ErrorState";
import { TableSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { Icon } from "@shared/components/ui/Button";
import { useToast } from "@shared/components/ui/Toast";
import useAdminAuth from "../../../hooks/useAdminAuth";
import { ADMIN_PERMISSIONS } from "../../../utils/permissions";
import { getFeedbackList, deleteFeedback } from "../../../services/platform/adminFeedbackApi";
import { formatDate } from "../../../utils/adminUtils";

export default function FeedbackList() {
  const toast = useToast();
  const { has } = useAdminAuth();
  const canDelete = has(ADMIN_PERMISSIONS.FEEDBACK_DELETE);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ items: [], pagination: {} });
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [itemToDelete, setItemToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFeedbackList({ page, limit: 15 });
      setData(res);
    } catch (err) {
      setError(err?.message || "Failed to load user feedback.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadData();
  }, [loadData, reloadTrigger]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setActionLoading(true);
    try {
      await deleteFeedback(itemToDelete.id);
      toast.show("Feedback entry removed.", "info");
      setItemToDelete(null);
      setReloadTrigger((k) => k + 1);
    } catch (err) {
      toast.show(err?.message || "Failed to delete feedback.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Feedback"
        description="Review suggestions, reports, and inquiries submitted by platform visitors and clients."
      />

      {loading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : error ? (
        <ErrorState
          title="Could not load feedback"
          message={error}
          actionLabel="Retry"
          onAction={() => setReloadTrigger((k) => k + 1)}
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon="rate_review"
          title="No feedback submitted yet"
          message="User feedback and contact submissions will appear here."
        />
      ) : (
        <div className="space-y-4">
          <ResourceTable
            data={data.items}
            keyField="id"
            columns={[
              {
                key: "sender",
                header: "Sender",
                render: (row) => (
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">{row.name || "Anonymous User"}</span>
                    <span className="text-xs text-slate-500 font-mono">{row.phone || row.phoneNumber || "No phone"}</span>
                  </div>
                ),
              },
              {
                key: "message",
                header: "Feedback Message",
                render: (row) => (
                  <div className="max-w-xl">
                    <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {row.description || row.message || "—"}
                    </p>
                  </div>
                ),
              },
              {
                key: "createdAt",
                header: "Submitted",
                render: (row) => (
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(row.createdAt)}
                  </span>
                ),
              },
              {
                key: "actions",
                header: "Actions",
                className: "text-right",
                render: (row) =>
                  canDelete ? (
                    <button
                      type="button"
                      onClick={() => setItemToDelete(row)}
                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700"
                      title="Delete Feedback"
                    >
                      <Icon name="delete" className="text-[16px]" />
                    </button>
                  ) : null,
              },
            ]}
          />

          <Pagination
            pagination={data.pagination}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        open={Boolean(itemToDelete)}
        title="Delete User Feedback"
        message={`Are you sure you want to delete this feedback from ${itemToDelete?.name || "this user"}?`}
        confirmLabel="Delete Feedback"
        variant="danger"
        busy={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
