import { ADMIN_PATHS } from "../../utils/adminUtils";
import { ADMIN_PERMISSIONS } from "../../utils/permissions";

/**
 * Grouped navigation structure for Admin Back Office.
 * "Platform" group sits above "Content" group.
 */
export const ADMIN_NAV_GROUPS = [
  {
    title: null,
    items: [
      { to: ADMIN_PATHS.dashboard, label: "Overview", icon: "dashboard", permissions: null },
    ],
  },
  {
    title: "Platform",
    items: [
      {
        to: ADMIN_PATHS.advocates.list,
        label: "Advocates",
        icon: "badge",
        permissions: [ADMIN_PERMISSIONS.ADVOCATES_VIEW],
      },
      {
        to: ADMIN_PATHS.users.list,
        label: "Client",
        icon: "people",
        permissions: [ADMIN_PERMISSIONS.USERS_VIEW],
      },
      {
        to: ADMIN_PATHS.consultancy.list,
        label: "Consultancy",
        icon: "phone_in_talk",
        permissions: [ADMIN_PERMISSIONS.CONSULTANCY_VIEW],
      },
      {
        to: ADMIN_PATHS.advocateBookings.list,
        label: "Private Advocate",
        icon: "event_note",
        permissions: [ADMIN_PERMISSIONS.ADVOCATE_BOOKINGS_VIEW],
      },
      {
        to: ADMIN_PATHS.feedback.list,
        label: "Feedback",
        icon: "rate_review",
        permissions: [ADMIN_PERMISSIONS.FEEDBACK_VIEW],
      },
      {
        to: ADMIN_PATHS.help.list,
        label: "Help Requests",
        icon: "contact_support",
        permissions: [ADMIN_PERMISSIONS.HELP_VIEW],
      },
      {
        to: ADMIN_PATHS.contentCreators.list,
        label: "Staff Account Create",
        icon: "person_add",
        permissions: [ADMIN_PERMISSIONS.CONTENT_CREATORS_VIEW],
      },
      {
        
        to: ADMIN_PATHS.roles.list,
        label: "Roles & Permissions",
        icon: "admin_panel_settings",
        permissions: [ADMIN_PERMISSIONS.ROLES_MANAGE],
      },
    ],
  },
  {
    title: "Legal Hub",
    collapsible: true,
    icon: "menu_book",
    items: [
      {
        to: ADMIN_PATHS.blogs.list,
        label: "Blogs",
        icon: "article",
        permissions: [
          ADMIN_PERMISSIONS.BLOGS_CREATE,
          ADMIN_PERMISSIONS.BLOGS_UPDATE,
          ADMIN_PERMISSIONS.BLOGS_DELETE,
        ],
      },
      {
        to: ADMIN_PATHS.ipc.list,
        label: "IPC Sections",
        icon: "gavel",
        permissions: [ADMIN_PERMISSIONS.IPC_CREATE, ADMIN_PERMISSIONS.IPC_UPDATE],
      },
      {
        to: ADMIN_PATHS.bns.list,
        label: "BNS Sections",
        icon: "balance",
        permissions: [ADMIN_PERMISSIONS.BNS_CREATE, ADMIN_PERMISSIONS.BNS_UPDATE],
      },
      {
        to: ADMIN_PATHS.bareActs.list,
        label: "Bare Acts",
        icon: "library_books",
        permissions: [ADMIN_PERMISSIONS.ACTS_CREATE, ADMIN_PERMISSIONS.ACTS_UPDATE],
      },
      {
        to: ADMIN_PATHS.userRights.list,
        label: "User Rights",
        icon: "verified_user",
        permissions: [
          ADMIN_PERMISSIONS.USER_RIGHTS_CREATE,
          ADMIN_PERMISSIONS.USER_RIGHTS_UPDATE,
          ADMIN_PERMISSIONS.USER_RIGHTS_DELETE,
        ],
      },
      {
        to: ADMIN_PATHS.guides.list,
        label: "Guides",
        icon: "menu_book",
        permissions: [
          ADMIN_PERMISSIONS.GUIDES_CREATE,
          ADMIN_PERMISSIONS.GUIDES_UPDATE,
          ADMIN_PERMISSIONS.GUIDES_DELETE,
        ],
      },
      {
        to: ADMIN_PATHS.updates.list,
        label: "Updates",
        icon: "update",
        permissions: [
          ADMIN_PERMISSIONS.UPDATES_CREATE,
          ADMIN_PERMISSIONS.UPDATES_UPDATE,
          ADMIN_PERMISSIONS.UPDATES_DELETE,
        ],
      },
    ],
  },
];

export const ADMIN_NAV_ITEMS = ADMIN_NAV_GROUPS.flatMap((group) => group.items);

export function sectionTitleFor(pathname) {
  const match = [...ADMIN_NAV_ITEMS]
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));
  return match?.label ?? "Admin";
}

export function initialsOf(name) {
  return (
    String(name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "AD"
  );
}
