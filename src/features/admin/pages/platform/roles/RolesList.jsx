import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@shared/components/ui/PageHeader";
import ResourceTable from "@shared/components/ui/ResourceTable";
import Pagination from "@shared/components/ui/Pagination";
import ConfirmModal from "@shared/components/ui/ConfirmModal";
import { EmptyState } from "@shared/components/feedback/EmptyState";
import { ErrorState } from "@shared/components/feedback/ErrorState";
import { TableSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { Button, Icon } from "@shared/components/ui/Button";
import { useToast } from "@shared/components/ui/Toast";
import { getRoles, updateRoleStatus, deleteRole } from "../../../services/platform/adminRolesApi";
import { ADMIN_PATHS, formatDate } from "../../../utils/adminUtils";

export default function RolesList() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ items: [], pagination: {} });
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Status & Delete modals
  const [roleToToggle, setRoleToToggle] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRoles({ page, limit: 15, search: searchTerm });
      setData(res);
    } catch (err) {
      setError(err?.message || "Failed to load roles.");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData, reloadTrigger]);

  const handleToggleStatus = async () => {
    if (!roleToToggle) return;
    setActionLoading(true);
    const nextState = !roleToToggle.isActive;
    try {
      await updateRoleStatus(roleToToggle.id, { isActive: nextState });
      toast.show(`Role '${roleToToggle.displayName || roleToToggle.name}' set to ${nextState ? "Active" : "Inactive"}.`, "success");
      setRoleToToggle(null);
      setReloadTrigger((k) => k + 1);
    } catch (err) {
      toast.show(err?.message || "Failed to update role status.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;
    setActionLoading(true);
    try {
      await deleteRole(roleToDelete.id);
      toast.show(`Role '${roleToDelete.displayName || roleToDelete.name}' deleted successfully.`, "info");
      setRoleToDelete(null);
      setReloadTrigger((k) => k + 1);
    } catch (err) {
      toast.show(err?.message || "Failed to delete role.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Roles & Permissions"
          description="Manage role definitions and assign granular permissions across all modules."
        />
        <Link to={ADMIN_PATHS.roles.create}>
          <Button variant="primary" icon="add">
            Create Role
          </Button>
        </Link>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          placeholder="Search roles by name or display title…"
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : error ? (
        <ErrorState
          title="Could not load roles"
          message={error}
          actionLabel="Retry"
          onAction={() => setReloadTrigger((k) => k + 1)}
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon="admin_panel_settings"
          title="No roles found"
          message="No custom or system roles matching your query."
        />
      ) : (
        <div className="space-y-4">
          <ResourceTable
            data={data.items}
            keyField="id"
            columns={[
              {
                key: "role",
                header: "Role Name",
                render: (row) => (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{row.displayName || row.name}</span>
                      {row.isSystem ? (
                        <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          System
                        </span>
                      ) : null}
                    </div>
                    <span className="font-mono text-xs text-slate-500">{row.name}</span>
                  </div>
                ),
              },
              {
                key: "description",
                header: "Description",
                className: "max-w-md",
                render: (row) => (
                  <span className="text-xs text-slate-600 line-clamp-2" title={row.description}>
                    {row.description || "—"}
                  </span>
                ),
              },
              {
                key: "permissions",
                header: "Permissions",
                render: (row) => (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800">
                    {row.permissionsCount ?? (Array.isArray(row.permissions) ? row.permissions.length : 0)} perms
                  </span>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                      row.isActive
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {row.isActive ? "Active" : "Inactive"}
                  </span>
                ),
              },
              {
                key: "updatedAt",
                header: "Updated",
                render: (row) => (
                  <span className="text-xs text-slate-500">{formatDate(row.updatedAt || row.createdAt)}</span>
                ),
              },
              {
                key: "actions",
                header: "Actions",
                className: "text-right",
                render: (row) => (
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      to={ADMIN_PATHS.roles.edit(row.id)}
                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      title="Edit Role & Permissions"
                    >
                      <Icon name="edit" className="text-[16px]" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setRoleToToggle(row)}
                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      title={row.isActive ? "Deactivate Role" : "Activate Role"}
                    >
                      <Icon name={row.isActive ? "pause" : "play_arrow"} className="text-[16px]" />
                    </button>

                    {/* Hide delete button completely for isSystem roles */}
                    {!row.isSystem ? (
                      <button
                        type="button"
                        onClick={() => setRoleToDelete(row)}
                        className="rounded-lg border border-slate-200 bg-white p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700"
                        title="Delete Role"
                      >
                        <Icon name="delete" className="text-[16px]" />
                      </button>
                    ) : null}
                  </div>
                ),
              },
            ]}
          />

          <Pagination
            pagination={data.pagination}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* TOGGLE STATUS CONFIRM MODAL */}
      <ConfirmModal
        open={Boolean(roleToToggle)}
        title={`${roleToToggle?.isActive ? "Deactivate" : "Activate"} Role`}
        message={`Are you sure you want to ${roleToToggle?.isActive ? "deactivate" : "activate"} '${roleToToggle?.displayName || roleToToggle?.name}'?`}
        confirmLabel={roleToToggle?.isActive ? "Deactivate" : "Activate"}
        variant="primary"
        busy={actionLoading}
        onConfirm={handleToggleStatus}
        onCancel={() => setRoleToToggle(null)}
      />

      {/* DELETE ROLE CONFIRM MODAL */}
      <ConfirmModal
        open={Boolean(roleToDelete)}
        title="Delete Role"
        message={`Are you sure you want to delete role '${roleToDelete?.displayName || roleToDelete?.name}'? This cannot be undone.`}
        confirmLabel="Delete Role"
        variant="danger"
        busy={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setRoleToDelete(null)}
      />
    </div>
  );
}
