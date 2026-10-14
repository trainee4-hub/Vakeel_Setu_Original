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
  getUser,
  getUserRoles,
  assignUserRole,
  removeUserRole,
} from "../../../services/platform/adminUsersApi";
import { getRoles } from "../../../services/platform/adminRolesApi";
import { ADMIN_PATHS, formatDate } from "../../../utils/adminUtils";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { has } = useAdminAuth();
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [assignedRoles, setAssignedRoles] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [selectedRoleName, setSelectedRoleName] = useState("");
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [error, setError] = useState(null);

  const [roleToRemove, setRoleToRemove] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const canManageRoles = has(ADMIN_PERMISSIONS.ROLES_MANAGE);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await getUser(id);
      if (!userData) throw new Error("User not found.");
      setUser(userData);

      // Only load RBAC roles if account explicitly supports them
      if (userData.rolesAllowed === true) {
        const userRolesRes = await getUserRoles(id, { userType: "USER" });
        setAssignedRoles(userRolesRes.roles || userData.assignedRoles || userData.roles || []);

        if (canManageRoles) {
          const rolesListRes = await getRoles({ limit: 50 });
          setAllRoles(rolesListRes.items || []);
        }
      } else {
        setAssignedRoles([]);
      }
    } catch (err) {
      setError(err?.message || "Failed to load user profile.");
    } finally {
      setLoading(false);
    }
  }, [id, canManageRoles]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleAssignRole = async (e) => {
    e.preventDefault();
    if (!selectedRoleName) return;
    setRolesLoading(true);
    try {
      await assignUserRole(id, { roleName: selectedRoleName, userType: "USER" });
      toast.show(`Role '${selectedRoleName}' assigned successfully.`, "success");
      setSelectedRoleName("");
      // Reload assigned roles
      const userRolesRes = await getUserRoles(id, { userType: "USER" });
      setAssignedRoles(userRolesRes.roles || []);
    } catch (err) {
      toast.show(err?.message || "Failed to assign role.", "error");
    } finally {
      setRolesLoading(false);
    }
  };

  const handleConfirmRemoveRole = async () => {
    if (!roleToRemove) return;
    setActionLoading(true);
    try {
      await removeUserRole(id, roleToRemove.id);
      toast.show(`Role '${roleToRemove.displayName || roleToRemove.name}' removed.`, "info");
      setRoleToRemove(null);
      // Reload assigned roles
      const userRolesRes = await getUserRoles(id, { userType: "USER" });
      setAssignedRoles(userRolesRes.roles || []);
    } catch (err) {
      toast.show(err?.message || "Failed to remove role.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <FormSkeleton />;
  if (error || !user) {
    return (
      <ErrorState
        title="User not found"
        message={error || "Could not retrieve user profile."}
        actionLabel="Back to Users"
        onAction={() => navigate(ADMIN_PATHS.users.list)}
      />
    );
  }

  const isDeletionPending = user.status === "DELETION_PENDING";

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={ADMIN_PATHS.users.list}
          className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <Icon name="arrow_back" className="text-[14px]" /> Back to Users
        </Link>
        <PageHeader
          title={user.fullName || "User Profile"}
          description={`Registered client account · Joined ${formatDate(user.createdAt)} (Read-only profile)`}
        />
      </div>

      {/* Deletion Warning Banner */}
      {isDeletionPending ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900">
          <div className="flex items-start gap-3">
            <Icon name="warning" className="text-[22px] text-red-600 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Account Scheduled For Deletion</p>
              <p className="mt-1 text-red-800">
                This client requested account deletion. Background automated worker will purge this record upon deadline.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Account Summary */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold text-2xl">
                {(user.fullName || "U").slice(0, 2).toUpperCase()}
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-950">{user.fullName}</h2>
              <p className="text-xs text-slate-500">{user.email || "No email"}</p>
              <p className="text-xs text-slate-500">{user.phone || "No phone"}</p>

              <div className="mt-4">
                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${
                    user.status === "DELETION_PENDING"
                      ? "bg-red-50 text-red-700 ring-1 ring-red-600/20"
                      : user.isActive || user.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                        : "bg-slate-100 text-slate-700"
                  }`}
                >
                  Status: {user.status || (user.isActive ? "ACTIVE" : "INACTIVE")}
                </span>
              </div>
            </div>
          </Card>

          {/* Contact Verification */}
          <Card className="p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Verification Status</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Email Verified</dt>
                <dd className="font-medium">
                  {user.emailVerified ? (
                    <span className="text-emerald-600 flex items-center gap-1"><Icon name="check" className="text-[14px]" /> Yes</span>
                  ) : (
                    <span className="text-slate-400">No</span>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Phone Verified</dt>
                <dd className="font-medium">
                  {user.phoneVerified ? (
                    <span className="text-emerald-600 flex items-center gap-1"><Icon name="check" className="text-[14px]" /> Yes</span>
                  ) : (
                    <span className="text-slate-400">No</span>
                  )}
                </dd>
              </div>
            </dl>
          </Card>
        </div>

        {/* Right Column: Location & Assigned Roles */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-base font-semibold text-slate-950">Client Location</h3>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">City</dt>
                <dd className="mt-1 font-medium text-slate-900">{user.city || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">State</dt>
                <dd className="mt-1 font-medium text-slate-900">{user.state || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Pincode</dt>
                <dd className="mt-1 font-mono font-medium text-slate-900">{user.pincode || "—"}</dd>
              </div>
            </dl>
          </Card>

          {/* Assigned RBAC Roles Section (Only rendered if account type supports RBAC roles) */}
          {user?.rolesAllowed ? (
            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-slate-950">Assigned Roles</h3>
                  <p className="text-xs text-slate-500">RBAC permissions granted to this user.</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Staff must sign in again for permission changes to take effect.
                  </p>
                </div>
                {!canManageRoles ? (
                  <span className="text-xs text-slate-400">Requires roles:manage permission to modify</span>
                ) : null}
              </div>

              {/* List of currently assigned roles */}
              <div className="mt-4">
                {assignedRoles.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No custom RBAC roles currently assigned to this user.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {assignedRoles.map((role) => (
                      <li key={role.id || role.name} className="flex items-center justify-between p-3 text-sm">
                        <div>
                          <p className="font-semibold text-slate-900">{role.displayName || role.name}</p>
                          {role.description ? <p className="text-xs text-slate-500">{role.description}</p> : null}
                        </div>
                        {canManageRoles && role.id ? (
                          <Button
                            variant="danger"
                            className="!py-1 !px-2.5 !text-xs"
                            onClick={() => setRoleToRemove(role)}
                          >
                            Remove
                          </Button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Assign Role Form (gated on roles:manage) */}
              {canManageRoles ? (
                <form onSubmit={handleAssignRole} className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                  <div className="flex-1 min-w-[200px]">
                    <label htmlFor="assign-role-select" className="sr-only">Select Role</label>
                    <select
                      id="assign-role-select"
                      value={selectedRoleName}
                      onChange={(e) => setSelectedRoleName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">Select a role to assign…</option>
                      {allRoles.map((r) => (
                        <option key={r.id || r.name} value={r.name}>
                          {r.displayName || r.name} ({r.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    variant="secondary"
                    icon="add"
                    type="submit"
                    disabled={!selectedRoleName || rolesLoading}
                  >
                    {rolesLoading ? "Assigning…" : "Assign Role"}
                  </Button>
                </form>
              ) : null}
            </Card>
          ) : null}
        </div>
      </div>

      {/* CONFIRM REMOVE ROLE MODAL */}
      {user?.rolesAllowed ? (
        <ConfirmModal
          open={Boolean(roleToRemove)}
          title="Remove Assigned Role"
          message={`Are you sure you want to remove the role '${roleToRemove?.displayName || roleToRemove?.name}' from this user?`}
          confirmLabel="Remove Role"
          variant="danger"
          busy={actionLoading}
          onConfirm={handleConfirmRemoveRole}
          onCancel={() => setRoleToRemove(null)}
        />
      ) : null}
    </div>
  );
}
