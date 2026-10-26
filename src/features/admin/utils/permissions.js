/**
 * Central system permission codes for the VakeelSetu Admin / Back Office.
 * Sourced directly from the active RBAC permissions table on the backend.
 * Do not use raw permission string literals inside components.
 */

export const ADMIN_PERMISSIONS = Object.freeze({
  // Advocates
  ADVOCATES_VIEW: "advocates:view",
  ADVOCATES_APPROVE: "advocates:approve",
  ADVOCATES_REJECT: "advocates:reject",
  ADVOCATES_UPDATE_STATUS: "advocates:update_status",
  ADVOCATES_DELETE: "advocates:delete",
  ADVOCATES_EDIT: "advocates:edit",

  // Users
  USERS_VIEW: "users:view",

  // Consultancy
  CONSULTANCY_VIEW: "consultancy:view",
  CONSULTANCY_UPDATE: "consultancy:update",

  // Private Advocate Bookings
  ADVOCATE_BOOKINGS_VIEW: "advocate_bookings:view",

  // Feedback
  FEEDBACK_VIEW: "feedback:view",
  FEEDBACK_DELETE: "feedback:delete",

  // Content Creators (Staff)
  CONTENT_CREATORS_VIEW: "content_creators:view",
  CONTENT_CREATORS_CREATE: "content_creators:create",

  // Roles & Permissions
  ROLES_MANAGE: "roles:manage",

  // Help & Support (Backend module: HELP)
  HELP_VIEW: "help:view",
  HELP_RESPOND: "help:respond",

  // Content Domains
  BLOGS_READ: "blogs:read",
  BLOGS_CREATE: "blogs:create",
  BLOGS_UPDATE: "blogs:update",
  BLOGS_DELETE: "blogs:delete",

  ACTS_READ: "acts:read",
  ACTS_CREATE: "acts:create",
  ACTS_UPDATE: "acts:update",
  ACTS_DELETE: "acts:delete",

  ACT_PDFS_UPLOAD: "act_pdfs:upload",
  ACT_PDFS_DELETE: "act_pdfs:delete",
  ACT_PDFS_SYNC: "act_pdfs:sync",

  IPC_CREATE: "ipc:create",
  IPC_UPDATE: "ipc:update",

  BNS_CREATE: "bns:create",
  BNS_UPDATE: "bns:update",

  GUIDES_CREATE: "guides:create",
  GUIDES_UPDATE: "guides:update",
  GUIDES_DELETE: "guides:delete",

  UPDATES_CREATE: "updates:create",
  UPDATES_UPDATE: "updates:update",
  UPDATES_DELETE: "updates:delete",

  USER_RIGHTS_CREATE: "user_rights:create",
  USER_RIGHTS_UPDATE: "user_rights:update",
  USER_RIGHTS_DELETE: "user_rights:delete",
});

export default ADMIN_PERMISSIONS;
