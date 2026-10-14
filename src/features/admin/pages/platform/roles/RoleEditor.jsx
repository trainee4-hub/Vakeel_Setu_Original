import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "@shared/components/ui/PageHeader";
import Card from "@shared/components/ui/Card";
import { FormField } from "@shared/components/ui/FormControls";
import { FormSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { Button, Icon } from "@shared/components/ui/Button";
import { useToast } from "@shared/components/ui/Toast";
import {
  getRole,
  createRole,
  updateRole,
  getSystemPermissions,
} from "../../../services/platform/adminRolesApi";
import { ADMIN_PATHS } from "../../../utils/adminUtils";

export default function RoleEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [isSystem, setIsSystem] = useState(false);

  // Grouped system permissions: { [moduleName]: Permission[] }
  const [permissionGroups, setPermissionGroups] = useState({});
  const [selectedCodes, setSelectedCodes] = useState(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch system permissions
      const permRes = await getSystemPermissions({ grouped: true });
      let grouped = {};
      if (permRes.modules && typeof permRes.modules === "object") {
        grouped = permRes.modules;
      } else if (Array.isArray(permRes.permissions)) {
        permRes.permissions.forEach((p) => {
          const mod = String(p.module || "GENERAL").toUpperCase();
          if (!grouped[mod]) grouped[mod] = [];
          grouped[mod].push(p);
        });
      }
      setPermissionGroups(grouped);

      // 2. If edit mode, fetch existing role
      if (isEdit) {
        const roleData = await getRole(id);
        if (!roleData) throw new Error("Role not found.");
        setName(roleData.name || "");
        setDisplayName(roleData.displayName || roleData.name || "");
        setDescription(roleData.description || "");
        setIsSystem(Boolean(roleData.isSystem));

        // Pre-select existing role's permissions
        const currentCodes = new Set();
        if (Array.isArray(roleData.permissions)) {
          roleData.permissions.forEach((p) => {
            if (typeof p === "string") currentCodes.add(p);
            else if (p?.code) currentCodes.add(p.code);
            else if (p?.name) currentCodes.add(p.name);
          });
        }
        setSelectedCodes(currentCodes);
      }
    } catch (err) {
      setError(err?.message || "Failed to load role details.");
    } finally {
      setLoading(false);
    }
  }, [id, isEdit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const togglePermission = (code) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggleModuleAll = (moduleName, enable) => {
    const modulePerms = permissionGroups[moduleName] || [];
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      modulePerms.forEach((p) => {
        if (enable) next.add(p.code);
        else next.delete(p.code);
      });
      return next;
    });
  };

  const [nameError, setNameError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNameError("");

    const trimmedName = name.trim().toUpperCase();
    const trimmedDisplayName = displayName.trim();

    if (!trimmedName || !trimmedDisplayName) {
      toast.show("Please provide both Role Name and Display Title.", "error");
      return;
    }

    // Step 5: Client-side validation for reserved role names
    const RESERVED_ROLE_NAMES = new Set(["ADMIN", "USER", "ADVOCATE"]);
    if (RESERVED_ROLE_NAMES.has(trimmedName)) {
      setNameError("This role name is reserved.");
      return;
    }

    // Step 5: Validate uppercase alphanumeric with underscores
    if (!/^[A-Z0-9_]+$/.test(trimmedName)) {
      setNameError("Role name must contain only uppercase letters, numbers, and underscores (e.g. LEAD_USER).");
      return;
    }

    setSubmitting(true);
    const permissionCodesList = Array.from(selectedCodes);

    try {
      if (isEdit) {
        await updateRole(id, {
          name: trimmedName,
          displayName: trimmedDisplayName,
          description: description.trim(),
          permissionCodes: permissionCodesList,
        });
        toast.show("Role updated successfully.", "success");
      } else {
        await createRole({
          name: trimmedName,
          displayName: trimmedDisplayName,
          description: description.trim(),
          permissionCodes: permissionCodesList,
        });
        toast.show("Role created successfully.", "success");
      }
      navigate(ADMIN_PATHS.roles.list);
    } catch (err) {
      const errMsg = err?.data?.message || err?.message || "";
      if (errMsg.toLowerCase().includes("reserved")) {
        setNameError("This role name is reserved.");
      } else if (errMsg.toLowerCase().includes("uppercase")) {
        setNameError("Role name must contain only uppercase letters, numbers, and underscores (e.g. LEAD_USER).");
      } else {
        toast.show(errMsg || "Failed to save role.", "error");
      }
      setSubmitting(false);
    }
  };

  const moduleNames = useMemo(() => Object.keys(permissionGroups).sort(), [permissionGroups]);

  if (loading) return <FormSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={ADMIN_PATHS.roles.list}
          className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <Icon name="arrow_back" className="text-[14px]" /> Back to Roles
        </Link>
        <PageHeader
          title={isEdit ? `Edit Role: ${displayName || name}` : "Create Role"}
          description={
            isEdit
              ? "Modify role title, description, and assigned granular permission matrix."
              : "Define a new custom RBAC role and grant specific module permissions."
          }
        />
        <p className="mt-2 text-xs text-slate-500">
          Staff must sign in again for permission changes to take effect.
        </p>
      </div>

      {error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Role Information */}
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-950">Role Details</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="role-name"
              label="Unique Role Identifier (e.g. BLOG_EDITOR)"
              error={nameError}
            >
              <input
                id="role-name"
                type="text"
                required
                disabled={isSystem && isEdit}
                value={name}
                onChange={(e) => {
                  setName(e.target.value.toUpperCase());
                  if (nameError) setNameError("");
                }}
                placeholder="CONTENT_COORDINATOR"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-mono uppercase text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </FormField>

            <FormField id="role-display-name" label="Display Name">
              <input
                id="role-display-name"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Content Coordinator"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </FormField>
          </div>

          <FormField id="role-desc" label="Description">
            <textarea
              id="role-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of duties and granted capabilities…"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </FormField>
        </Card>

        {/* Permission Matrix Grouped by Module */}
        <Card className="p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Permission Matrix</h2>
              <p className="text-xs text-slate-500">
                Selected: <span className="font-bold text-amber-700">{selectedCodes.size}</span> permissions
              </p>
            </div>
            <div className="flex gap-2 text-xs">
              <Button
                variant="tertiary"
                type="button"
                className="!py-1 !px-2.5 !text-xs"
                onClick={() => {
                  const all = new Set();
                  Object.values(permissionGroups).forEach((list) => list.forEach((p) => all.add(p.code)));
                  setSelectedCodes(all);
                }}
              >
                Select All
              </Button>
              <Button
                variant="tertiary"
                type="button"
                className="!py-1 !px-2.5 !text-xs"
                onClick={() => setSelectedCodes(new Set())}
              >
                Clear All
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {moduleNames.map((modName) => {
              const perms = permissionGroups[modName] || [];
              const allChecked = perms.every((p) => selectedCodes.has(p.code));

              return (
                <div key={modName} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  {/* Module Group Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{modName}</span>
                      <span className="text-xs text-slate-400">({perms.length})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleModuleAll(modName, !allChecked)}
                      className="text-xs font-semibold text-amber-700 hover:text-amber-800 focus:outline-none"
                    >
                      {allChecked ? "Deselect Module" : "Select Module"}
                    </button>
                  </div>

                  {/* Module Checkbox Grid */}
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {perms.map((perm) => {
                      const checked = selectedCodes.has(perm.code);
                      return (
                        <label
                          key={perm.id || perm.code}
                          className={`flex items-start gap-3 rounded-lg border p-3 transition cursor-pointer ${
                            checked
                              ? "border-amber-400 bg-amber-50/50 text-slate-950"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermission(perm.code)}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold">{perm.name || perm.code}</p>
                            <p className="font-mono text-[10px] text-slate-500">{perm.code}</p>
                            {perm.description ? (
                              <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2" title={perm.description}>
                                {perm.description}
                              </p>
                            ) : null}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="tertiary"
            type="button"
            onClick={() => navigate(ADMIN_PATHS.roles.list)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create Role"}
          </Button>
        </div>
      </form>
    </div>
  );
}
