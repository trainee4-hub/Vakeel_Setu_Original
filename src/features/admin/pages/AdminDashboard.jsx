import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBlogs } from "../services/content/blogApi";
import { getUserRights } from "../services/content/userRightsApi";
import { getGuides } from "../services/content/guidesApi";
import { getUpdates } from "../services/content/updatesApi";
import { getPendingAdvocates, getAdvocateDeletionRequests } from "../services/platform/adminAdvocatesApi";
import { getConsultancyRequests } from "../services/platform/adminConsultancyApi";
import { getFeedbackList } from "../services/platform/adminFeedbackApi";
import { getHelpRequests } from "../services/platform/adminHelpApi";
import { LEGAL_SECTION_META } from "../components/forms/legalSectionMeta";
import useAdminAuth from "../hooks/useAdminAuth";
import { ADMIN_PATHS, formatDate } from "../utils/adminUtils";
import { ADMIN_PERMISSIONS } from "../utils/permissions";
import PageHeader from "@shared/components/ui/PageHeader";
import StatCard from "@shared/components/ui/StatCard";
import Card from "@shared/components/ui/Card";
import { CardGridSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { Button, Icon } from "@shared/components/ui/Button";

/*
 * Counts and Recent Content come only from real list APIs.
 * IPC / BNS use the public GET /ipc and GET /bns lists.
 */
const byTitle = (item) => item.title;
const bySection = (label) => (item) =>
  [`${label} ${item.sectionNo ?? ""}`.trim(), item.heading].filter(Boolean).join(" – ");

const PLATFORM_MODULES = [
  {
    key: "pendingAdvocates",
    label: "Pending Approvals",
    icon: "badge",
    caption: "Advocate applications awaiting review",
    to: `${ADMIN_PATHS.advocates.list}?tab=pending`,
    permission: ADMIN_PERMISSIONS.ADVOCATES_VIEW,
    load: () => getPendingAdvocates({ page: 1, limit: 1 }),
  },
  {
    key: "deletionRequests",
    label: "Deletion Requests",
    icon: "person_remove",
    caption: "Advocate account deletion queue",
    to: `${ADMIN_PATHS.advocates.list}?tab=deletions`,
    permission: ADMIN_PERMISSIONS.ADVOCATES_VIEW,
    load: () => getAdvocateDeletionRequests({ page: 1, limit: 1 }),
  },
  {
    key: "pendingConsultancy",
    label: "Pending Consultations",
    icon: "phone_in_talk",
    caption: "Scheduled legal consultations",
    to: ADMIN_PATHS.consultancy.list,
    permission: ADMIN_PERMISSIONS.CONSULTANCY_VIEW,
    load: () => getConsultancyRequests({ status: "PENDING", page: 1, limit: 1 }),
  },
  {
    key: "totalFeedback",
    label: "Total Feedback",
    icon: "rate_review",
    caption: "Citizen queries & feedback",
    to: ADMIN_PATHS.feedback.list,
    permission: ADMIN_PERMISSIONS.FEEDBACK_VIEW,
    load: () => getFeedbackList({ page: 1, limit: 1 }),
  },
  {
    key: "openHelpRequests",
    label: "Open Help Requests",
    icon: "contact_support",
    caption: "Support requests awaiting resolution",
    to: `${ADMIN_PATHS.help.list}?status=OPEN`,
    permission: ADMIN_PERMISSIONS.HELP_VIEW,
    load: () => getHelpRequests({ status: "OPEN", page: 1, limit: 1 }),
  },
];

const CONTENT_MODULES = [
  {
    key: "blogs",
    label: "Blogs",
    recentLabel: "Blog",
    icon: "article",
    caption: "Published articles",
    paths: ADMIN_PATHS.blogs,
    createLabel: "Create Blog",
    viewPermission: [ADMIN_PERMISSIONS.BLOGS_READ, ADMIN_PERMISSIONS.BLOGS_CREATE, ADMIN_PERMISSIONS.BLOGS_UPDATE],
    createPermission: ADMIN_PERMISSIONS.BLOGS_CREATE,
    load: getBlogs,
    titleOf: byTitle,
  },
  {
    key: "ipc",
    label: "IPC Sections",
    recentLabel: "IPC Section",
    icon: "gavel",
    caption: "Indian Penal Code reference",
    paths: ADMIN_PATHS.ipc,
    createLabel: "Add IPC Section",
    viewPermission: [ADMIN_PERMISSIONS.IPC_CREATE, ADMIN_PERMISSIONS.IPC_UPDATE],
    createPermission: ADMIN_PERMISSIONS.IPC_CREATE,
    load: LEGAL_SECTION_META.IPC.list,
    titleOf: bySection("IPC"),
  },
  {
    key: "bns",
    label: "BNS Sections",
    recentLabel: "BNS Section",
    icon: "balance",
    caption: "Bharatiya Nyaya Sanhita reference",
    paths: ADMIN_PATHS.bns,
    createLabel: "Add BNS Section",
    viewPermission: [ADMIN_PERMISSIONS.BNS_CREATE, ADMIN_PERMISSIONS.BNS_UPDATE],
    createPermission: ADMIN_PERMISSIONS.BNS_CREATE,
    load: LEGAL_SECTION_META.BNS.list,
    titleOf: bySection("BNS"),
  },
  {
    key: "userRights",
    label: "User Rights",
    recentLabel: "User Right",
    icon: "verified_user",
    caption: "Citizens' rights explained",
    paths: ADMIN_PATHS.userRights,
    createLabel: "Add User Right",
    viewPermission: [ADMIN_PERMISSIONS.USER_RIGHTS_CREATE, ADMIN_PERMISSIONS.USER_RIGHTS_UPDATE],
    createPermission: ADMIN_PERMISSIONS.USER_RIGHTS_CREATE,
    load: getUserRights,
    titleOf: byTitle,
  },
  {
    key: "guides",
    label: "Guides",
    recentLabel: "Guide",
    icon: "menu_book",
    caption: "Step-by-step legal guides",
    paths: ADMIN_PATHS.guides,
    createLabel: "Create Guide",
    viewPermission: [ADMIN_PERMISSIONS.GUIDES_CREATE, ADMIN_PERMISSIONS.GUIDES_UPDATE],
    createPermission: ADMIN_PERMISSIONS.GUIDES_CREATE,
    load: getGuides,
    titleOf: byTitle,
  },
  {
    key: "updates",
    label: "Updates",
    recentLabel: "Update",
    icon: "update",
    caption: "Legal and platform changes",
    paths: ADMIN_PATHS.updates,
    createLabel: "Post Update",
    viewPermission: [ADMIN_PERMISSIONS.UPDATES_CREATE, ADMIN_PERMISSIONS.UPDATES_UPDATE],
    createPermission: ADMIN_PERMISSIONS.UPDATES_CREATE,
    load: getUpdates,
    titleOf: byTitle,
  },
];

const RECENT_LIMIT = 5;

export default function AdminDashboard() {
  const { user, has } = useAdminAuth();
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState({ key: null, data: {} });

  // Filter modules user has permission to see
  const visiblePlatformModules = useMemo(
    () => PLATFORM_MODULES.filter((m) => has(m.permission)),
    [has],
  );

  const visibleContentModules = useMemo(
    () => CONTENT_MODULES.filter((m) => has(m.viewPermission)),
    [has],
  );

  useEffect(() => {
    let ignore = false;
    const allLoadable = [
      ...visiblePlatformModules.map((m) => ({ key: m.key, fn: m.load })),
      ...visibleContentModules.map((m) => ({ key: m.key, fn: () => m.load({ page: 1, limit: RECENT_LIMIT }) })),
    ];

    if (!allLoadable.length) {
      Promise.resolve().then(() => {
        if (!ignore) setResult({ key: reloadKey, data: {} });
      });
      return () => {
        ignore = true;
      };
    }

    Promise.allSettled(allLoadable.map((item) => item.fn())).then((settled) => {
      if (ignore) return;
      const data = {};
      settled.forEach((outcome, index) => {
        data[allLoadable[index].key] = outcome.status === "fulfilled" ? outcome.value : { error: outcome.reason };
      });
      setResult({ key: reloadKey, data });
    });

    return () => {
      ignore = true;
    };
  }, [reloadKey, visiblePlatformModules, visibleContentModules]);

  const retry = useCallback(() => setReloadKey((key) => key + 1), []);
  const loading = result.key !== reloadKey;
  const data = result.data;
  const failed = Object.values(data).some((entry) => entry?.error);

  const recent = visibleContentModules
    .flatMap((module) =>
      (data[module.key]?.items ?? [])
        .filter((item) => item?.id ?? item?._id)
        .map((item) => {
          const itemId = item.id ?? item._id;
          return {
            id: `${module.key}-${itemId}`,
            module,
            title: module.titleOf(item) || "Untitled",
            at: item.updatedAt || item.createdAt,
            to: module.paths.edit(itemId),
          };
        }),
    )
    .filter((entry) => entry.at)
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 8);

  const firstName = user?.fullName?.split(/\s+/)[0];

  return (
    <>
      <PageHeader
        title="Admin Overview"
        description={`${firstName ? `Welcome back, ${firstName}. ` : ""}Manage platform operations and legal knowledge across VakeelSetu.`}
      />

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : (
        <>
          {failed ? (
            <div
              role="alert"
              className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              <span>Some totals couldn't be loaded.</span>
              <Button variant="secondary" icon="refresh" onClick={retry}>
                Retry
              </Button>
            </div>
          ) : null}

          {/* Operational Platform Tiles */}
          {visiblePlatformModules.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
                Platform Operations
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {visiblePlatformModules.map((module) => (
                  <StatCard
                    key={module.key}
                    to={module.to}
                    icon={module.icon}
                    label={module.label}
                    caption={module.caption}
                    count={data[module.key]?.pagination?.total ?? data[module.key]?.items?.length}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Content Tiles */}
          {visibleContentModules.length > 0 && (
            <div>
              {visiblePlatformModules.length > 0 && (
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Legal Knowledge & Content
                </h2>
              )}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleContentModules.map((module) => (
                  <StatCard
                    key={module.key}
                    to={module.paths.list}
                    icon={module.icon}
                    label={module.label}
                    caption={module.caption}
                    count={data[module.key]?.pagination?.total}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 grid gap-6 lg:grid-cols-5">
            <Card className="p-5 lg:col-span-2">
              <h2 className="text-base font-semibold text-slate-950">Quick Actions</h2>
              <ul className="mt-4 space-y-1">
                {has(ADMIN_PERMISSIONS.ADVOCATES_VIEW) && (
                  <li>
                    <Link
                      to={`${ADMIN_PATHS.advocates.list}?tab=pending`}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-amber-50 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                      <Icon name="badge" className="text-[20px] text-amber-600" />
                      Review Pending Advocates
                    </Link>
                  </li>
                )}
                {has(ADMIN_PERMISSIONS.ROLES_MANAGE) && (
                  <li>
                    <Link
                      to={ADMIN_PATHS.roles.create}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-amber-50 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                      <Icon name="admin_panel_settings" className="text-[20px] text-amber-600" />
                      Create New Role
                    </Link>
                  </li>
                )}
                {has(ADMIN_PERMISSIONS.CONTENT_CREATORS_CREATE) && (
                  <li>
                    <Link
                      to={ADMIN_PATHS.contentCreators.list}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-amber-50 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                      <Icon name="person_add" className="text-[20px] text-amber-600" />
                      Add Staff Account
                    </Link>
                  </li>
                )}
                {visibleContentModules
                  .filter((module) => has(module.createPermission))
                  .map((module) => (
                    <li key={module.key}>
                      <Link
                        to={module.paths.create}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-amber-50 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                      >
                        <Icon name="add" className="text-[20px] text-amber-600" />
                        {module.createLabel}
                      </Link>
                    </li>
                  ))}
              </ul>
            </Card>

            <Card className="p-5 lg:col-span-3">
              <h2 className="text-base font-semibold text-slate-950">Recent Content</h2>
              {recent.length ? (
                <ul className="mt-4 divide-y divide-slate-100">
                  {recent.map((entry) => (
                    <li key={entry.id}>
                      <Link
                        to={entry.to}
                        className="flex items-center gap-3 rounded-lg py-3 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                          <Icon name={entry.module.icon} className="text-[18px]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">{entry.title}</p>
                          <p className="text-xs text-slate-500">{entry.module.recentLabel}</p>
                        </div>
                        <time dateTime={entry.at} className="shrink-0 text-xs text-slate-400">
                          {formatDate(entry.at)}
                        </time>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-slate-500">Content you publish will appear here.</p>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  );
}
