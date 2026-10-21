import { useCallback, useEffect, useState } from "react";
import PageHeader from "@shared/components/ui/PageHeader";
import ResourceTable from "@shared/components/ui/ResourceTable";
import { FormField } from "@shared/components/ui/FormControls";
import { EmptyState } from "@shared/components/feedback/EmptyState";
import { ErrorState } from "@shared/components/feedback/ErrorState";
import { TableSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { Button, Icon } from "@shared/components/ui/Button";
import { useToast } from "@shared/components/ui/Toast";
import useAdminAuth from "../../../hooks/useAdminAuth";
import { ADMIN_PERMISSIONS } from "../../../utils/permissions";
import {
  getContentCreators,
  createContentCreator,
} from "../../../services/platform/adminContentCreatorsApi";
import { getRoles } from "../../../services/platform/adminRolesApi";
import { formatDate } from "../../../utils/adminUtils";

export default function ContentCreatorsList() {
  const toast = useToast();
  const { has } = useAdminAuth();
  const canCreate = has(ADMIN_PERMISSIONS.CONTENT_CREATORS_CREATE);
  const canManageRoles = has(ADMIN_PERMISSIONS.ROLES_MANAGE);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creators, setCreators] = useState([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Add Staff Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    roleNames: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Roles available for staff assignment
  const [availableRoles, setAvailableRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [_invalidRoles, setInvalidRoles] = useState([]);
  const [hideRolesField, setHideRolesField] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await getContentCreators();
      setCreators(items);
    } catch (err) {
      setError(err?.message || "Failed to load staff accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, reloadTrigger]);

  const loadAvailableRoles = useCallback(async () => {
    if (!canManageRoles) return;
    setRolesLoading(true);
    try {
      const res = await getRoles({ isActive: true, limit: 100 });
      setAvailableRoles(res.items || []);
    } catch (err) {
      console.error("[ContentCreatorsList] Failed to load available roles:", err);
    } finally {
      setRolesLoading(false);
    }
  }, [canManageRoles]);

  const handleOpenAdd = () => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
      roleNames: [],
    });
    setFormErrors({});
    setInvalidRoles([]);
    setHideRolesField(false);
    setShowPassword(false);
    setShowAddModal(true);
    loadAvailableRoles();
  };

  const handleRoleChange = (e) => {
    const roleName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      roleNames: roleName ? [roleName] : [],
    }));
    if (formErrors.roles) {
      setFormErrors((prev) => ({ ...prev, roles: undefined }));
    }
    setInvalidRoles([]);
  };

  const _handleToggleRole = (roleName) => {
    setFormData((prev) => {
      const current = prev.roleNames || [];
      const next = current.includes(roleName) ? [] : [roleName];
      return { ...prev, roleNames: next };
    });
    if (formErrors.roles) {
      setFormErrors((prev) => ({ ...prev, roles: undefined }));
    }
    setInvalidRoles([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    const trimmedName = formData.fullName.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedName) {
      nextErrors.fullName = "Full name is required.";
    } else if (trimmedName.length < 2 || trimmedName.length > 100) {
      nextErrors.fullName = "Full name must be between 2 and 100 characters.";
    }

    if (!trimmedEmail) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await createContentCreator({
        fullName: trimmedName,
        email: trimmedEmail,
        password: formData.password,
        roleNames: canManageRoles && !hideRolesField ? formData.roleNames : [],
      });
      toast.show("Staff account created successfully.", "success");
      setShowAddModal(false);
      setReloadTrigger((k) => k + 1);
    } catch (err) {
      const errMsg = err?.data?.message || err?.message || "";
      const lower = errMsg.toLowerCase();

      // 400 "This email is reserved for the main admin account."
      if (lower.includes("reserved for the main admin")) {
        setFormErrors((prev) => ({
          ...prev,
          email: "This email is reserved for the main admin account.",
        }));
      }
      // 400 "A staff account with this email already exists."
      else if (lower.includes("already exists") || lower.includes("duplicate") || err?.status === 409) {
        setFormErrors((prev) => ({
          ...prev,
          email: "A staff account with this email already exists.",
        }));
      }
      // 400 "One or more roles are invalid or inactive." (+ invalidRoles[])
      else if (lower.includes("invalid or inactive")) {
        const offending = err?.invalidRoles || err?.data?.invalidRoles || [];
        setInvalidRoles(offending);
        setFormErrors((prev) => ({
          ...prev,
          roles: "One or more roles are invalid or inactive.",
        }));
        // Refetch the roles list to refresh active state
        loadAvailableRoles();
      }
      // 403 "You need the roles:manage permission to assign roles."
      else if (err?.status === 403 || lower.includes("roles:manage")) {
        toast.show("You need the roles:manage permission to assign roles.", "error");
        setHideRolesField(true);
      }
      // 400 "At least one role is required."
      else if (lower.includes("at least one role")) {
        setFormErrors((prev) => ({
          ...prev,
          roles: "At least one role is required.",
        }));
      } else {
        toast.show(errMsg || "Failed to create staff account.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Staff Accounts"
          description="Manage back-office staff accounts (Content Creators) and their assigned RBAC roles."
        />

        {canCreate ? (
          <Button variant="primary" icon="person_add" onClick={handleOpenAdd}>
            Add Staff Account
          </Button>
        ) : null}
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : error ? (
        <ErrorState
          title="Could not load staff accounts"
          message={error}
          actionLabel="Retry"
          onAction={() => setReloadTrigger((k) => k + 1)}
        />
      ) : creators.length === 0 ? (
        <EmptyState
          icon="person_add"
          title="No staff accounts found"
          message="No back-office staff accounts are currently registered."
        />
      ) : (
        <ResourceTable
          data={creators}
          keyField="id"
          columns={[
            {
              key: "staff",
              header: "Staff Member",
              render: (row) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200">
                    {(row.fullName || row.name || "S").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">{row.fullName || row.name}</span>
                    <span className="text-xs text-slate-500">{row.email}</span>
                  </div>
                </div>
              ),
            },
            {
              key: "roles",
              header: "Roles",
              render: (row) => {
                const roles = Array.isArray(row.roles) ? row.roles : [];
                if (!roles.length) {
                  return (
                    <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 border border-amber-200/60">
                      Content Creator
                    </span>
                  );
                }
                return (
                  <div className="flex flex-wrap gap-1.5">
                    {roles.map((r, idx) => {
                      const isObj = typeof r === "object" && r !== null;
                      const displayName = isObj ? (r.displayName || r.name) : String(r);
                      const isInactive = isObj && r.isActive === false;

                      if (isInactive) {
                        return (
                          <span
                            key={r.id || r.name || idx}
                            title="Inactive Role"
                            className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-400 line-through border border-dashed border-slate-300"
                          >
                            {displayName}
                          </span>
                        );
                      }

                      return (
                        <span
                          key={r.id || r.name || idx}
                          className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 border border-amber-200/60"
                        >
                          {displayName}
                        </span>
                      );
                    })}
                  </div>
                );
              },
            },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                    row.isActive !== false
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {row.isActive !== false ? "Active" : "Inactive"}
                </span>
              ),
            },
            {
              key: "createdAt",
              header: "Created",
              render: (row) => (
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {formatDate(row.createdAt)}
                </span>
              ),
            },
          ]}
        />
      )}

      {/* ADD STAFF MODAL */}
      {showAddModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-950">Add Staff Account</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <FormField id="staff-name" label="Full Name" error={formErrors.fullName}>
                <input
                  id="staff-name"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: undefined });
                  }}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </FormField>

              <FormField id="staff-email" label="Email Address" error={formErrors.email}>
                <input
                  id="staff-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                  }}
                  placeholder="staff@example.com"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </FormField>

              <FormField id="staff-password" label="Temporary Password (min 8 chars)" error={formErrors.password}>
                <div className="relative">
                  <input
                    id="staff-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (formErrors.password) setFormErrors({ ...formErrors, password: undefined });
                    }}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 p-2.5 pr-10 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-[18px]" />
                  </button>
                </div>
              </FormField>

              {/* Role Dropdown (Render only when admin has roles:manage permission) */}
              {canManageRoles && !hideRolesField ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="staff-role-select" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Assign RBAC Role
                    </label>
                    <span className="text-[11px] text-slate-400">Optional</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Staff must sign in again for permission changes to take effect.
                  </p>

                  {rolesLoading ? (
                    <div className="p-3 text-xs text-slate-400">Loading active roles…</div>
                  ) : availableRoles.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500 italic rounded-xl border border-slate-200">
                      No active custom roles available. Account will use default Content Creator permissions.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <select
                        id="staff-role-select"
                        value={formData.roleNames[0] || ""}
                        onChange={handleRoleChange}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 bg-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm"
                      >
                        <option value="">Select Role (Default Content Creator)</option>
                        {availableRoles.map((role) => (
                          <option key={role.id || role.name} value={role.name}>
                            {role.displayName || role.name}
                          </option>
                        ))}
                      </select>

                      {/* Display preview of the selected role */}
                      {(() => {
                        const selectedRoleObj = availableRoles.find(
                          (r) => r.name === formData.roleNames[0]
                        );
                        if (!selectedRoleObj) {
                          return (
                            <p className="text-xs text-slate-500">
                              If no role is selected, the account defaults to standard Content Creator permissions.
                            </p>
                          );
                        }

                        return (
                          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 space-y-1.5 text-xs text-slate-800">
                            <div className="flex items-center justify-between font-semibold text-amber-900">
                              <span>{selectedRoleObj.displayName || selectedRoleObj.name}</span>
                              <span className="text-[11px] font-normal text-amber-700">Selected</span>
                            </div>
                            {selectedRoleObj.description ? (
                              <p className="text-[11px] text-slate-600">{selectedRoleObj.description}</p>
                            ) : null}
                            {Array.isArray(selectedRoleObj.permissions) && selectedRoleObj.permissions.length > 0 ? (
                              <div className="pt-1 border-t border-amber-200/60 text-[11px] text-amber-900">
                                <span className="font-semibold">Grants: </span>
                                {selectedRoleObj.permissions
                                  .slice(0, 6)
                                  .map((p) => p.name || p.code || p)
                                  .join(", ")}
                                {selectedRoleObj.permissions.length > 6 ? ` +${selectedRoleObj.permissions.length - 6} more` : ""}
                              </div>
                            ) : null}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {formErrors.roles ? (
                    <p className="text-xs text-rose-600 font-medium">{formErrors.roles}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  variant="tertiary"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? "Creating Account…" : "Create Staff Account"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
