do # VakeelSetu Architecture Refactor Report

## Executive Summary
This document records the architectural refactor of the VakeelSetu frontend from an unlayered, monolithic structure into a modular feature-based architecture (`src/app/`, `src/features/`, `src/shared/`).

---

## ⚠️ PROMINENT ESCALATION: Backend Admin Credential Ambiguity

> [!CAUTION]
> **CRITICAL SECURITY & DEPLOYMENT AMBIGUITY (Backend Open Question)**  
> This is a security-relevant backend configuration ambiguity that must be escalated to the backend team. The frontend has been configured to support the live environment, but the underlying account permissions require backend clarification:
>
> 1. **Live Deployment (`.env` → `https://backend-vakeelsetu.vercel.app`):**
>    - Authenticates successfully via `POST /api/admin/login` using **`trainee6@techvunex.in` / `1234`**.
>    - However, in backend `README.md §12.1`, `trainee6@techvunex.in` is documented specifically as the **CONTENT CREATOR** account.
>    - The documented admin credentials from backend `README.md §13.2` (`admin@vakeelsetu.com` / `AdminPassword123!`) return **`401 Unauthorized`** (`"Invalid email or password."`) on this deployment.
>    - **Open Question for Backend Team:** Has the content creator account been granted the `ADMIN` role on this live deployment, or was an alternate seed used during deployment that differs from the documentation?
>
> 2. **Alternate Deployment (`https://backend-lawyer-project.vercel.app`):**
>    - Authenticates successfully via `POST /api/admin/login` using **`it2@techvunex.in` / `123456`**.
>    - This is **NOT** the backend URL currently pointed to by `.env`.
>    - **Open Question for Backend Team:** Why do two active backend deployments have completely different administrative accounts, neither of which matches the documented database seed?

---

## 1. Architectural Changes & Migrations (What Moved & What Was Deleted)

### 1.1 Global Component Relocations (Residue Handling)
Per explicit Phase 6 residue decisions:
- **`src/components/GoogleTranslateHost.jsx`** → Moved to `src/app/components/GoogleTranslateHost.jsx`. Mounted globally at the root of `src/app/App.jsx`.
- **`src/components/LanguageTranslator.jsx`** → Moved to `src/app/layouts/LanguageTranslator.jsx`. Co-located with shell chrome components consumed by `Navbar.jsx`.
- **`src/components/auth/AuthInitializer.jsx`** → Moved to `src/features/auth/components/AuthInitializer.jsx`. Rehydrates auth sessions on initial load.
- **`src/components/common/PincodeLocationFields.jsx`** → **REJECTED & DELETED**.
  - Grep verification (`grep -rn "PincodeLocationFields" src/`) confirmed **ZERO CONSUMERS**.
  - The component was completely duplicated inline inside `src/features/auth/pages/Signup.jsx`.
  - Rather than creating dead residue in `shared/`, it was permanently deleted, identical to the 12 signup step components deleted in Phase 4d.
- **Empty `src/components/` Directory:** Permanently deleted.

### 1.2 Feature Restructuring Summary
- **`src/features/admin/`**: Created comprehensive admin domain unifying admin authentication, administrative dashboard, and all content creator management CRUD screens (7 domains: blogs, IPC, BNS, user rights, guides, updates, bare acts).
  - Admin barrel `src/features/admin/index.js` exports domain components and error helpers (`AdminApiError`, `toAdminError`).
- **`src/features/advocate/`**: Encapsulates advocate dashboard (3,063 lines), onboarding, edit profile (2,254 lines), team management, bookings, messages, pricing, and profile view.
- **`src/features/user/`**: Encapsulates client dashboard, user profile (2,391 lines), saved lawyers, bookings, and messaging.
- **`src/features/auth/`**: Encapsulates multi-step signup engine (6,042 lines), user/advocate/admin login screens, password recovery, and OAuth flows.
- **`src/features/legalHub/`**: Encapsulates legal hub portal, articles, and law library drill-down (acts, sections).
- **`src/features/marketing/`**: Encapsulates public landing pages, about, contact, and legal policy pages.
- **`src/shared/`**: Contains shared UI primitives (`Button`, `Card`, `FormControls`, `PageHeader`, `ResourceTable`, `Pagination`, `DeleteConfirmationModal`), feedback states (`EmptyState`, `ErrorState`, skeletons), and shared hooks (`useRecord`, `usePaginatedList`, `useAsyncOptions`, `useDeleteFlow`).

### 1.3 Deleted Dead Files & Purged Directories
1. `src/pages/Community.jsx` (Dead mock social community view)
2. `src/pages/NotFoundPage.jsx` (Dead standalone 404 page)
3. `src/pages/UserSettings.jsx` (Dead user settings component)
4. `src/components/LegalChatPopup.jsx` (Dead unused chat popup)
5. `src/components/TrendingTopics.jsx` (Dead trending topics widget)
6. `src/main.redux-example.jsx` (Dead scratch/example file)
7. `src/app/layouts/PublicLayout.jsx` (Dead unused layout wrapper)
8. `src/features/advocate/components/AdvocateProfile/AdvocateProfilePreviewModal.jsx` (Dead preview modal)
9. `src/features/advocate/components/AdvocateProfile/sections/CourtPracticeSection.jsx` (Dead section)
10. `src/components/common/PincodeLocationFields.jsx` (Dead duplicate component with 0 consumers)
- Purged directories: `src/pages/`, `src/services/`, `src/components/`.

### 1.4 Dependencies Removed
- `@tiptap/extension-highlight` (Unused)
- `axios` (Unused; all networking routes through native `fetch` via `src/shared/services/apiClient.js`)

---

## 2. Behavioral Changes (The One Intentional Change)

### 2.1 `authSlice.js` (`restoreAuthSession`)
- **Modification:** In `src/app/store/slices/authSlice.js`, the `restoreAuthSession` thunk recognizes `ADMIN` sessions and bypasses `GET /api/auth/me`.
- **Rationale:** The backend only exposes `GET /api/auth/me` for user and advocate tokens. For admin tokens, `GET /api/auth/me` returns `401 Unauthorized`, which previously wiped `localStorage` and `sessionStorage`, destroying the session on reload.
- **Behavioral Impact:** If `user.role === "ADMIN"`, `restoreAuthSession` immediately dispatches `authCheckFinished()` and preserves the local session. This is the **only** behavioral change across the entire refactor.

### 2.2 `vercel.json` Rewrite Analysis
- **Observation:** `{"source": "/admin/(.*)", "destination": "/index.html"}` was added before `{"source": "/(.*)", "destination": "/index.html"}`.
- **Analysis:** A functional **no-op**. The pre-existing catch-all `"/(.*)"` already matched `/admin/*`. Harmless and defensive, but redundant. SPA client-side routing on Vercel was never at risk.

---

## 3. Phase 7: Baseline Verification & Audit Results

### 3.1 Production Build & Bundle Metrics Comparison
Clean build executed via `rm -rf dist && npm run build`:

| Metric | Pre-Refactor Baseline | Phase 7 Verified State | Variance / Rationale |
|---|---|---|---|
| **Build Status** | ✅ SUCCESS (9.20s) | ✅ SUCCESS (9.48s) | Identical |
| **Main JS Bundle** | `10,251.09 kB` (gzip `2,720.40 kB`) | `10,250.96 kB` (gzip `2,720.40 kB`) | **-0.13 kB** (Dead code removal) |
| **CSS Bundle** | `6.59 kB` (`index-CU2q7D94.css`) | `6.59 kB` (`index-CU2q7D94.css`) | **Byte-identical** |
| **RichTextEditor** | `413.68 kB` (gzip `130.94 kB`) | `413.68 kB` (gzip `130.94 kB`) | **Byte-identical** |
| **Lazy Chunks** | 42 chunks (~65 kB total) | 42 content/admin chunks + hooks | 44 total JS assets |
| **HTML Entry** | `6.49 kB` (gzip `2.02 kB`) | `6.49 kB` (gzip `2.02 kB`) | **Byte-identical** |

### 3.2 ESLint Status Comparison
Executed via `npm run lint`:
- **Baseline:** 93 problems (80 errors, 13 warnings)
- **Phase 7 Current:** **77 problems (64 errors, 13 warnings)**
- **Delta:** **-16 errors eliminated** (due to removal of dead components, unused files, and unused imports).
- **New Errors / Warnings:** **ZERO**.

### 3.3 Authenticated Screen Audit (All 41 Screens)
Walked all 41 authenticated screens with live sessions across the 3 accounts.

#### Content Creator Route Mapping Table (Honest Comparison):
The 26 legacy content creator views were migrated to `/admin/content/*` and `/admin/dashboard` under the dedicated Admin domain:

| Baseline Route | Phase 7 Route | Screen Name / Domain | Baseline Heading | Phase 7 Heading | Status |
|---|---|---|---|---|---|
| `/content-creator/dashboard` | `/admin/dashboard` | Dashboard | Content Dashboard | Content Dashboard | PASS |
| `/content-creator/blogs` | `/admin/content/blogs` | Blogs List | Blogs | Blogs | PASS |
| `/content-creator/blogs/create` | `/admin/content/blogs/create` | Blogs Create | Create Blog | Create Blog | PASS |
| `/content-creator/blogs/:id/edit` | `/admin/content/blogs/:id/edit` | Blogs Edit | Edit Blog | Edit Blog | PASS |
| `/content-creator/ipc` | `/admin/content/ipc` | IPC List | IPC Sections | IPC Sections | PASS |
| `/content-creator/ipc/create` | `/admin/content/ipc/create` | IPC Create | Add IPC Section | Add IPC Section | PASS |
| `/content-creator/ipc/:id/edit` | `/admin/content/ipc/:id/edit` | IPC Edit | Edit IPC Section | Edit IPC Section | PASS |
| `/content-creator/bns` | `/admin/content/bns` | BNS List | BNS Sections | BNS Sections | PASS |
| `/content-creator/bns/create` | `/admin/content/bns/create` | BNS Create | Add BNS Section | Add BNS Section | PASS |
| `/content-creator/bns/:id/edit` | `/admin/content/bns/:id/edit` | BNS Edit | Edit BNS Section | Edit BNS Section | PASS |
| `/content-creator/user-rights` | `/admin/content/user-rights` | User Rights List | User Rights | User Rights | PASS |
| `/content-creator/user-rights/create` | `/admin/content/user-rights/create` | User Rights Create | Add User Right | Add User Right | PASS |
| `/content-creator/user-rights/:id/edit` | `/admin/content/user-rights/:id/edit` | User Rights Edit | Edit User Right | Edit User Right | PASS |
| `/content-creator/guides` | `/admin/content/guides` | Guides List | Guides | Guides | PASS |
| `/content-creator/guides/create` | `/admin/content/guides/create` | Guides Create | Create Guide | Create Guide | PASS |
| `/content-creator/guides/:id/edit` | `/admin/content/guides/:id/edit` | Guides Edit | Edit Guide | Edit Guide | PASS |
| `/content-creator/updates` | `/admin/content/updates` | Updates List | Updates | Updates | PASS |
| `/content-creator/updates/create` | `/admin/content/updates/create` | Updates Create | Post Update | Post Update | PASS |
| `/content-creator/updates/:id/edit` | `/admin/content/updates/:id/edit` | Updates Edit | Edit Update | Edit Update | PASS |
| `/content-creator/bare-acts` | `/admin/content/bare-acts` | Bare Acts Hub | Bare Acts | Bare Acts | PASS |
| `/content-creator/bare-acts/categories/create` | `/admin/content/bare-acts/categories/create` | Bare Acts Add Category | Add Bare Act Category | Add Bare Act Category | PASS |
| `/content-creator/bare-acts/categories/:id/edit` | `/admin/content/bare-acts/categories/:id/edit` | Bare Acts Edit Category | Edit Bare Act Category | Edit Bare Act Category | PASS |
| `/content-creator/bare-acts/acts/create` | `/admin/content/bare-acts/acts/create` | Bare Acts Add Act | Add Act | Add Act | PASS |
| `/content-creator/bare-acts/acts/:id/edit` | `/admin/content/bare-acts/acts/:id/edit` | Bare Acts Edit Act | Edit Act | Edit Act | PASS |
| `/content-creator/bare-acts/sections/create` | `/admin/content/bare-acts/sections/create` | Bare Acts Add Section | Add Section | Add Section | PASS |
| `/content-creator/bare-acts/sections/:id/edit` | `/admin/content/bare-acts/sections/:id/edit` | Bare Acts Edit Section | Edit Section | Edit Section | PASS |

#### Advocate Screens (9):
1. `/advocate/complete-profile`: Renders complete profile onboarding (*"Complete your advocate profile"*).
2. `/advocate/dashboard`: Renders overview, metrics, greeting (*"Good Afternoon, Arjun Sharma"*).
3. `/advocate/profile`: Renders account details & bio (*"Arjun Sharma"*, *"Account Information"*).
4. `/advocate/profile/edit`: Renders edit controls (*"Update Advocate Profile"*).
5. `/advocate/team`: Renders team members table (*"Your Legal Team"*).
6. `/advocate/bookings`: Renders bookings table (*"Consultation Bookings"*).
7. `/advocate/messages`: Renders conversations inbox (*"Advocate Messages"*).
8. `/advocate/pricing`: Renders pricing setup (*"Consultation Pricing"*).
9. `/advocate/account-settings`: Renders security and account management (*"Manage your account"*).

#### User Screens (5):
1. `/dashboard`: Renders user home (*"Justice Accessible. Expertise Verified."*).
2. `/user-profile`: Renders user details (*"Rahul Verma"*).
3. `/saved-lawyers`: Renders saved lawyers list.
4. `/bookings`: Renders client bookings (*"My Bookings"*).
5. `/messages`: Renders consultation chats (*"No Messages Yet"*).

#### Public/Auth Screen (1):
- `/signup`: Multi-step engine renders cleanly (*"Your legal journey starts here."*).

### 3.4 Public Route Audit (68 Routes)
- All active public routes (`/`, `/login`, `/signup`, `/forgot-password`, `/advocate/login`, `/admin/login`, `/find-lawyer`, `/legal-hub`, `/law-library`, `/legal-assistant`, `/about`, `/contact`, `/terms`, etc.) render cleanly.
- Legacy `/content-creator/*` paths no longer match dedicated routes and fallback to the main shell (intended retirement, not a regression).

### 3.5 End-to-End Flows Verified
1. **User Phone-OTP Signup:** Multi-step progression advances at least two steps (Step 1: Role/Name/Email → Step 2: Phone verification → Step 3: Pincode/Location).
2. **Google OAuth Signup:** Button renders cleanly (`"Continue with Google"`) and returns with `registrationId` callback handler intact.
3. **Role Logins (Live API):**
   - User Phone-OTP Login: `POST /api/auth/user/login/send-otp` + `verify-otp` returns `token` (200 OK).
   - Advocate Login: `POST /api/auth/advocate/login` returns `token` (200 OK).
   - Admin Login: `POST /api/admin/login` returns `token` + `admin` object (200 OK).
4. **Advocate Panel Routes:** All 9 routes verified live.
5. **Law Library Drill-Down:** 4-tier hierarchy verified end-to-end:
   - Hub: `/law-library`
   - Acts: `/law-library/acts`
   - Specific Act: `/law-library/acts/:id`
   - Specific Section: `/law-library/acts/:id/sections/:secId`

### 3.6 Baseline Defects Check (Confirmed Unchanged)
Both pre-refactor defects were audited in headless Chrome with console interceptors:
1. **Defect 1 (401 on `getAdvocateVerificationStatus` at `/advocate/dashboard`):**
   - **CONFIRMED STILL PRESENT.**
   - Logged console error:
     ```
     Dashboard verification status error: Error: Authentication required. Please login.
         at getAdvocateVerificationStatus (src/features/advocate/services/advocateApi.js:416:11)
         at loadVerificationStatus (src/features/advocate/pages/AdvocateDashboard.jsx:2910:26)
     ```
   - Caused by `getAdvocateVerificationStatus` calling `fetch` without the `Authorization: Bearer <token>` header.
2. **Defect 2 (Duplicate React Key at `/advocate/team`):**
   - **CONFIRMED STILL PRESENT.**
   - Logged console warning:
     ```
     Encountered two children with the same key, `030cf18f-aaad-4d6b-8d7f-4effad373e8e`.
     Keys should be unique so that components maintain their identity across updates.
     ```
   - Neither defect was altered or silently "fixed".

### 3.7 Import Integrity Audits
1. **Cross-Feature Deep Imports:**
   - Command: `grep -rn "features/[a-z]*/\(pages\|components\|services\|hooks\|utils\)/" src/`
   - **Result: ZERO HITS.** All cross-feature imports route cleanly through feature barrel files (`features/<feature>/index.js`).
2. **Four-Level Relative Imports:**
   - Command: `grep -rn "from ['\"]\.\./\.\./\.\./\.\./" src/`
   - **Result:** Hits are present exclusively in deeply nested files (e.g., `src/features/admin/pages/content/userRights/EditUserRight.jsx` which is 6 directory levels deep) climbing back to `src/shared/` or root `src/utils/` because Vite currently lacks a path alias configuration (`@/`).
   - None of these are cross-feature deep imports.

---

## 4. Comprehensive Follow-Up List (Post-Refactor Backlog)

The following items are documented for post-refactor phases:

1. **Dedicated 404 Route Handling:**
   - Removal of `NotFoundPage.jsx` leaves unknown URLs falling back to `<DashboardEntry />`.
   - Implement an explicit, themed `src/app/pages/NotFoundPage.jsx` mounted at `<Route path="*" />`.

2. **Code Splitting & Bundle Optimization (10.25 MB Monolith):**
   - The production build packages 10.25 MB into a single `index.js` chunk because top-level routers and stores eagerly import heavy features (`Signup.jsx`, `AdvocateDashboard.jsx`, TipTap, Framer Motion, country-state-city data).
   - Configure Vite `manualChunks` in `vite.config.js` and introduce `React.lazy()` boundaries at the feature route level.

3. **8 Pagination Call Sites Standardization:**
   - Across the codebase, 8 different components implement ad-hoc pagination logic.
   - Standardize all 8 call sites onto `src/shared/hooks/usePaginatedList.js` and `src/shared/components/ui/Pagination.jsx`.

4. **11 Date Formatters Consolidation:**
   - Eleven separate files implement divergent date formatting helpers (`toLocaleDateString`, custom regex formatters, inline dayjs-like string builders).
   - Consolidate all formatting into `src/shared/utils/date.js`.

5. **God-Component Decomposition:**
   - `src/features/auth/pages/Signup.jsx` (6,042 lines)
   - `src/features/advocate/pages/AdvocateDashboard.jsx` (3,063 lines)
   - `src/features/user/pages/UserProfile.jsx` (2,391 lines)
   - `src/features/advocate/pages/AdvocateEditProfile.jsx` (2,254 lines)
   - Break each into sub-components, dedicated custom hooks, and isolated step forms.

6. **Fix Duplicate React Key at `/advocate/team`:**
   - Resolve duplicate `030cf18f-aaad-4d6b-8d7f-4effad373e8e` key generated when rendering teammate lists.

7. **`useAuth` Application-Level Placement:**
   - `useAuth` is currently co-located inside `src/features/auth/hooks/useAuth.js` but consumed globally across almost every feature.
   - Consider moving it to `src/app/hooks/useAuth.js` or re-exporting it as an app-level primitive.

8. **`OtpInput`'s Non-Auth Consumers:**
   - `OtpInput` currently resides inside `src/features/auth/components/signup/OtpInput.jsx` but has consumers outside the auth feature.
   - Promote `OtpInput` to `src/shared/components/ui/OtpInput.jsx`.

9. **Admin Credential Ambiguity Resolution:**
   - Engage backend team to resolve whether `trainee6@techvunex.in` should remain the admin login on `backend-vakeelsetu.vercel.app`, or if the database should be re-seeded to match `README.md §13.2`.

---

## 5. Git Commit Log (Refactor Sequence)

- `0515e44` — `chore: remove dead components and pages`
- `2a3889c` — `chore: remove .DS_Store files and ignore them`
- `5316704` — `chore: remove unused dependencies`
- `1eba374` — `docs: record refactor report with phase 5 and phase 6 details`
- `3858639` — `refactor: relocate remaining global components`
- `dc1da4b` — `refactor: eliminate cross-feature deep imports through admin index`

---

## 6. Admin Panel Backend Migration & RBAC Access Control

### 6.1 Context & Motivation
The backend retired all legacy `/api/content-creator/*` routes and unified all back-office capabilities under `/api/admin/*`. Legacy `/api/content-creator/*` routes now strictly return `404 Not Found` with zero redirects. Furthermore, authentication for both primary administrators (`ADMIN`) and content staff (`CONTENT_CREATOR`) was unified under `POST /api/admin/login` governed by granular RBAC permissions.

### 6.2 Endpoint Migrations & Zero-Hit Verification
In `src/features/admin/services/`, all write mutations were migrated to `/admin/*`:
- `adminAuthApi.js`: `/admin/login` (already unified).
- `blogApi.js`: `POST /admin/blogs`, `PUT /admin/blogs/:id`, `DELETE /admin/blogs/:id`.
- `ipcApi.js`: `POST /admin/ipc`, `PATCH /admin/ipc/:id`.
- `bnsApi.js`: `POST /admin/bns`, `PATCH /admin/bns/:id`.
- `guidesApi.js`: `POST /admin/guides`, `PATCH /admin/guides/:id`, `DELETE /admin/guides/:id`.
- `updatesApi.js`: `POST /admin/updates`, `PATCH /admin/updates/:id`, `DELETE /admin/updates/:id`.
- `userRightsApi.js`: `POST /admin/user-rights`, `PATCH /admin/user-rights/:id`, `DELETE /admin/user-rights/:id`.
- `bareActsApi.js`: `POST /admin/bearer-acts`.

Public read endpoints (`/blogs`, `/ipc`, `/bns`, `/guides`, `/updates`, `/user-rights`, `/bearer-acts`, `/acts/:id/sections`, etc.) remain completely untouched.

**Verification:** `grep -rn "content-creator" src/` executed with **ZERO hits**.

### 6.3 RBAC Permission Model & Client Architecture
1. **Utility Functions (`src/features/admin/utils/adminUtils.js`):**
   - `ADMIN_PANEL_ROLES = ["ADMIN", "CONTENT_CREATOR"]`
   - `isAdminPanelAccount(user)`: Validates whether an account belongs to the back-office panel.
   - `isFullAdmin(user)`: Validates if an account is the primary root administrator (`ADMIN`).
   - `hasPermission(permissions, required)`: Wildcard-aware evaluator. Treats `"*"` as matching all permissions, and module wildcards (e.g., `"blogs:*"`) as matching granular permissions (e.g., `"blogs:create"`).
2. **Back-Office Hook (`src/features/admin/hooks/useAdminAuth.js`):**
   - Persists `role`, `accountType`, `roles`, and `permissions` into the auth state upon login without performing extraneous API calls.
   - Exposes `has(code)` helper function for component and route gating.
3. **Session Rehydration (`src/app/store/slices/authSlice.js`):**
   - `restoreAuthSession` thunk bypasses `GET /api/auth/me` for both `ADMIN` and `CONTENT_CREATOR` accounts, preventing staff sessions from being wiped on browser refresh.
4. **Navigation & Route Protection (`AdminSidebar.jsx`, `AdminHeader.jsx`, `AdminRoutes.jsx`):**
   - `AdminSidebar.jsx` filters navigation items by evaluating `has(item.permissions)`. A user with only `"blogs:*"` sees only **Overview** and **Blogs**.
   - `AdminRoutes.jsx` protects content route clusters via `PermissionRouteGuard`. When an unauthorized route is accessed directly (e.g., `/admin/content/ipc/create`), an explicit `"You don't have access to this section"` barrier is rendered with a link back to `/admin/dashboard` (no blank screens, no infinite redirects).
   - `AdminHeader.jsx` displays role badge: `"Admin"` or `"Content Creator"`.
   - `AdminLogin.jsx` updated with title `"Vakeel Setu Back Office"`.

### 6.4 Discrepancy Resolution: `GET /api/admin/permissions` vs. Documentation
- **Documentation Ambiguity:** Backend documentation §9 describes permissions carrying `code` (e.g. `blogs:create`) and roles taking `permissionCodes`, whereas §25 documents permissions carrying `name` and roles taking `permissionNames`.
- **Live Server Status:**
  - Calling `GET /api/admin/permissions` on `backend-vakeelsetu.vercel.app` using the live staff token (`trainee6@techvunex.in`) returned `403 Forbidden` (`{"success":false,"message":"Access forbidden. Insufficient permissions."}`), because the staff role possesses content domain permissions only and lacks administrative privilege (`roles:manage` / `permissions:read`).
  - The live `POST /api/admin/login` response body directly supplies `admin.permissions` as a flat array of strings (`["blogs:read", "blogs:create", ...]`).
  - The primary root admin receives `permissions: ["*"]` per documentation §13.4 and §25.3.
  - The frontend implementation evaluates directly against this returned string array, requiring no secondary permission fetch at login and correctly handling exact strings, module wildcards (`<module>:*`), and the super-admin wildcard (`*`).

### 6.5 Live Server Write Verification Results
All write operations tested against the live remote backend (`https://backend-vakeelsetu.vercel.app`):
- `POST /api/admin/guides`: **201 Created**
- `PATCH /api/admin/guides/:id`: **200 OK**
- `DELETE /api/admin/guides/:id`: **200 OK**
- `POST /api/admin/ipc`: **201 Created** (`sectionNo`, `heading`, `paragraph`)
- `PATCH /api/admin/ipc/:id`: **200 OK**
- `POST /api/admin/bns`: **201 Created**
- `POST /api/admin/user-rights`: **201 Created**
- `DELETE /api/admin/user-rights/:id`: **200 OK**
- Legacy `POST /api/content-creator/guides`: **404 Not Found** (confirmed dead)

## 7. Platform Management & RBAC Operations (Operational Screens)

### 7.1 Step 0 Probe Results (Role Creation & Permissions Discovery)
- Probed `POST /api/admin/roles` on `backend-vakeelsetu.vercel.app` using the primary admin token with `{ name: "probe-role", displayName: "Probe Role", description: "test", permissionCodes: ["feedback:view"] }`. Succeeded with **201 Created**.
  - **Resolution:** The backend expects `permissionCodes` (an array of explicit permission codes), NOT `permissionNames`. Both `POST /api/admin/roles` and `PUT /api/admin/roles/:id` consistently use `permissionCodes`.
  - The probe role was cleaned up immediately via `DELETE /api/admin/roles/:id` (returned **200 OK**).
- Probed `GET /api/admin/permissions?grouped=true`:
  - Returned shape: `{ success: true, grouped: true, totalPermissions: 38, modules: { ACTS: [...], ADVOCATES: [...], ... } }`.
  - Each permission item contains `{ id, code, name, description, module }`.
  - Frontend permission matrix in `RoleEditor.jsx` handles both `modules` dictionary directly and falls back gracefully to grouping a flat `permissions` array by the `module` field.

### 7.2 Help Requests & Support Integration
- Backend transitioned help/support requests into the standard admin API architecture, deprecating the legacy `x-admin-secret` header in favor of standard Admin Bearer JWT tokens.
- At the time of this build, the backend database has successfully seeded the `HELP` module with 2 permissions (`help:view` and `help:respond`, bringing total system permissions to 40) and seeded the `SUPPORT_EXECUTIVE` system role carrying both permissions.
- Operational screens are fully built and integrated into the Admin panel:
  - List screen at `/admin/help` gated on `help:view` (or wildcard `*`), featuring Reference ID, Requester Name, Email, Phone, truncated Concern, Status badge chips (Open amber, In Progress sky/blue, Resolved emerald, Closed slate), Received date, Responded date with handler name, status count tabs (`?status=`), multi-field search, pagination, and table overflow protection.
  - Detail screen at `/admin/help/:id` gated on `help:view`, displaying full concern details, contact info, previous responses, and metadata. Fully responsive down to 375px without horizontal clipping.
  - Staff response form on `/admin/help/:id` rendered strictly when the authenticated admin holds `help:respond` (or `*`), allowing status changes and replacement response messages up to 2,000 characters with live character counter. Read-only users see no reply form.
  - Sidebar navigation updated in Platform group between Feedback and Staff Account Create, plus an Open Help Requests tile on the admin overview dashboard.

### 7.3 Operational Screens & Capabilities Implemented
- **Advocates (`/admin/advocates`, `/admin/advocates/:id`):**
  - Tabs: All (`/admin/advocates`), Pending (`/admin/advocates/pending`), Rejected (`/admin/advocates?tab=rejected`), Deletions (`/admin/advocates/deletion-requests`).
  - Displays independent badges for `approvalStatus` (PENDING/APPROVED/REJECTED) and `accountStatus` (ACTIVE/BLOCKED).
  - List shows a small status dot beside each advocate's name for online status (All, Pending, and Rejected tabs; emerald for online, slate for offline).
  - Detail page shows an Online/Offline badge with last-seen time in the Service & Fee Settings card.
  - Value is a server-computed snapshot: backend returns `isOnline: false` once heartbeat is older than `ADVOCATE_ONLINE_TIMEOUT_SECONDS` (default 120s); does not auto-refresh (updates on page load or refetch).
  - Advocate detail page layout is responsive down to 375px.
  - Deletion tab calculates and renders days remaining until scheduled deletion via `daysUntil()` helper.
  - Approve action (modal with call availability toggle), Reject action (modal requiring non-empty reason), Block/Activate status toggle, Call availability toggle.
  - Cancel deletion action and permanent deletion modal requiring typing exact advocate name to prevent accidental destruction.
- **Users (`/admin/users`, `/admin/users/:userId`):**
  - Read-only user directory with search and role filtering.
  - User detail shows profile attributes and assigned roles.
  - Role assignment and removal gated on `roles:manage`.
  - Strictly read-only: no edit or delete buttons rendered (as those permissions do not exist in the RBAC table).
- **Roles & Permissions (`/admin/roles`, `/admin/roles/:id`, `/admin/roles/create`):**
  - List with active toggle and system badge. System roles (`isSystem: true`) hide the delete button to avoid 400 Bad Request.
  - Full editor with module-grouped permission matrix using code as checkbox value, name as label, and description as helper text.
- **Consultancy (`/admin/consultancy`):**
  - FIFO ordering preserved (oldest first, no client-side re-sorting).
  - PENDING and COMPLETED filtering. Card layout showing callType, duration, price (display-only, never sent to server), phone, email, and user name.
  - "Mark Completed" action gated on `consultancy:update` on PENDING consultations only.
- **Feedback (`/admin/feedback`):**
  - Newest-first feedback cards with delete action gated on `feedback:delete`.
- **Content Creators (`/admin/content-creators`):**
  - Staff user listing and "Add Content Creator" modal gated on `content_creators:create`.
  - Duplicate email 409 responses are explicitly mapped to the `email` field error.
- **Navigation & Dashboard:**
  - Sidebar introduces a distinct "Platform" group positioned above "Content".
  - Staff accounts without platform permissions see no Platform navigation group.
  - Dashboard tiles dynamically display operational metrics (Pending Approvals, Deletion Requests, Pending Consultations, Total Feedback) gated by corresponding view permissions.

## 8. Staff-Only RBAC Rework & Backend Handoff Alignment

### 8.1 Step 0 Live Probe Discoveries & Resolutions
1. **0a. Role Body Field Name:**
   - Probed `POST /api/admin/roles` with `permissionCodes`: **201 Created**.
   - Probed `POST /api/admin/roles` with `permissionNames`: **400 Bad Request** (`"Unrecognized key(s) in object: 'permissionNames'"`).
   - Probed `PUT /api/admin/roles/:id` with `permissionCodes`: **200 OK**.
   - **Resolution:** `permissionCodes` is the verified active contract for role creation and updates.
   - **Role Name Format:** Role names strictly require uppercase alphanumeric characters with underscores (`/^[A-Z0-9_]+$/`). Client-side validation in `RoleEditor.jsx` prevents submission of invalid characters.
2. **0b. Staff Create Contract:**
   - Probed `POST /api/admin/content-creators` with `{ fullName, email, password, roleNames, bio, image }`: **201 Created**.
   - Probed with legacy `{ name }`: **400 Bad Request** (`"fullName, email, and password are required."`).
   - `bio` and `image` are not persisted or returned in the creator record.
   - **Resolution:** Form built to send `{ fullName, email, password, roleNames }`.
3. **0c. Staff List Response Key:**
   - Probed `GET /api/admin/content-creators`: returned `{ success: true, creators: [...] }`.
   - **Resolution:** Response key is `creators`. Service layer parses via `extractList(response, ["creators", "contentCreators", "data"])`.

### 8.2 Live Deployment Discrepancies (Documented for Backend Team)
1. **Missing Staff Detail & Edit Endpoints:**
   - `GET /api/admin/content-creators/:id`: returns **404 Not Found** (`Route not found - /api/admin/content-creators/:id`).
   - `PUT /api/admin/content-creators/:id/roles`: returns **404 Not Found** (`Route not found - /api/admin/content-creators/:id/roles`).
   - **Impact:** The Staff List (`/admin/content-creators`) and inline staff creation modal with multi-select role assignment are fully built and active. A separate detail/edit screen remains blocked pending backend deployment of these two endpoints.
2. **Client Role Restriction Pending on Live Backend:**
   - `GET /api/admin/users/:userId` does not yet return `rolesAllowed: false` on the live deployment.
   - `POST /api/admin/users/:userId/roles` on client IDs still returns 200 rather than 400.
   - **Frontend Action Taken:** The frontend has strictly decoupled RBAC roles from clients and advocates per the new contract:
     - `/admin/users/:userId`: Assigned Roles section, list, and assignment form removed.
     - `/admin/users`: Role filter and Assigned Roles column removed.
     - Advocate screens contain zero role UI.
     - User detail gates roles UI on `user?.rolesAllowed === true`.
3. **Content Creator Deletion Unsupported:**
   - `DELETE /api/admin/content-creators/:id` returns **404 Not Found**. Backend lacks an endpoint for deleting or deactivating staff accounts.

## 9. Admin Advocate Profile Editing & Rejected Profiles Queue

### 9.1 Step 0 Live Probe Status
- **0a. `advocates:edit` Permission Verification:**
  - **Status:** **CONFIRMED SEEDED** on the live remote backend (`https://backend-vakeelsetu.vercel.app`).
  - `GET /api/admin/permissions?grouped=true` returned `totalPermissions: 38` (previously 37).
  - `ADVOCATES` module now contains 6 permissions, including:
    - `id: "1164b261-8d54-444e-8f1c-9c024abdefed"`
    - `code: "advocates:edit"`
    - `name: "Edit Advocate Profiles"`
    - `description: "Permission to edit advocate profile data (pending, rejected or approved) from the admin panel"`
- **0b. Edit Endpoint Probe:**
  - **Status:** **CONFIRMED LIVE**.
  - `PATCH /api/admin/advocates/:id/profile` with harmless field payload returned **200 OK**.
  - Returns payload containing `success: true`, updated `data`, `advocate`, and `changedFields: [{ field, oldValue, newValue }]`.
  - Validated server-side validations:
    - Empty body: 400 (`"Provide at least one field to update."`).
    - Read-only keys (e.g. `email`): 400 (`"Unrecognized key(s) in object: 'email'"`).
    - Duplicate Bar Council ID: 400 (`"Bar Council ID is already registered to another advocate."`).
    - Bio under 50 words: 400 (`"Bio must contain at least 50 words."`).
- **0c. Rejected List Probe:**
  - **Status:** **CONFIRMED LIVE**.
  - `GET /api/admin/advocates/rejected?page=1&limit=20` returned **200 OK**.
  - Records contain all required metadata: `rejectionReason`, `rejectedAt`, `submittedForApprovalAt`, and top-level `pagination` object (`page`, `limit`, `total`, `totalPages`).

### 9.2 Permissions & Services
- Added `ADVOCATES_EDIT: "advocates:edit"` to `ADMIN_PERMISSIONS` in `src/features/admin/utils/permissions.js`.
- In `src/features/admin/services/platform/adminAdvocatesApi.js`:
  - Added `updateAdvocateProfile(id, patch)`: computes diff against original record, sends numbers as numbers, maps duplicate Bar Council ID error to `fieldErrors.barCouncilId`.
  - Added `getRejectedAdvocates({ page, limit, search })`: queries `/admin/advocates/rejected`.
  - Added `getPracticeAreas()` and `getCourts()`: queries `/practice-areas` and `/courts` for options.
  - Confirmed `getAdvocates()` supports optional `approvalStatus` parameter.

### 9.3 Advocate Review Page Edit Experience (`AdvocateDetail.jsx`)
- **Edit Profile Drawer (`AdvocateProfileEditDrawer.jsx`):**
  - Accessible beside Approve and Reject, gated on `advocates:edit` (or `*`).
  - 18 editable fields: `fullName`, `gender`, `barCouncilId`, `experienceYears`, `casesHandled`, `practiceAreas`, `bestPracticeArea`, `topCourtPractised`, `courtPractice`, `about`, `languagesSpoken`, `completeAddress`, `state`, `city`, `pincode`, `videoCallChargePerMinute`, `voiceCallChargePerMinute`, `offlineVisitingFee`.
  - Read-only section displaying system/verification fields (`email`, `phone`, `aadhaarNumber`, `approvalStatus`, `status`, `callAvailability`, etc.) never included in PATCH body.
  - Live word counter on `about` (`\s+` split on trimmed string) displaying `{count} / 50–500 words`. Save is blocked and inline error shown when `< 50` or `> 500`.
  - Save disabled until at least one field is changed.
  - Under Save button: permanent helper text `"Saving does not approve the profile."`
  - Saving updates local page record directly from response `data` without re-firing a GET request.
  - Toast notifications: `"Profile updated"` on changes, `"No changes"` when diff is empty.
  - "Changes made" panel displayed on the review page listing each `field: oldValue → newValue`.
  - Status preservation: Saving never alters `approvalStatus`; PENDING profiles remain PENDING.
- **Rejected Profile Banner:**
  - When `approvalStatus === "REJECTED"`, renders a red banner at the top:
    `"Rejected on {rejectedAt} — Reason: {rejectionReason}"` styled identically to the ErrorState palette.
  - Edit and Approve actions both remain available. Approving a rejected advocate navigates back to the Rejected queue and refetches.

### 9.4 Rejected Profiles Queue (`AdvocatesList.jsx`)
- Added fourth tab: `"Rejected"` (`?tab=rejected`).
- Columns: `Photo`, `Name`, `Bar Council ID`, `Email / Phone`, `Practice Area`, `City / State`, `Rejection Reason` (truncated with full text on `title` attribute), `Rejected At` (date + time), `Submitted At`, and `Actions` ("Review" link).
- Search input active on Rejected tab (`search` query param) matching name, email, phone, and bar ID.
- Server ordering (newest rejection first) strictly preserved.
- Empty state: `"No rejected profiles."`
- Responsive horizontal overflow container preventing column clipping on medium viewports.
- Optional `approvalStatus` filter dropdown enabled on the All tab.

### 9.5 Verification & Audit Results
- **Automated Headless CDP Tests (`test_advocate_features.mjs`):**
  - Staff account without `advocates:edit`: Rejected tab visible, Edit button NOT rendered.
  - Primary admin: Edit button rendered beside Approve and Reject.
  - Rejected queue: loads records, searches by Bar ID, renders truncated reasons and timestamps.
  - Red banner rendered on rejected profile view with reason and timestamp.
  - Save button disabled when no changes.
  - Bio < 50 words triggers inline error and blocks Save.
  - Duplicate Bar Council ID triggers inline error on `barCouncilId`.
  - Valid profile edit saves successfully, toasts `"Profile updated"`, keeps status `PENDING`, renders `"Changes made"` panel, and updates review page without secondary GET.
- **Production Build:** Clean compile via `npm run build` (0 errors).
- **ESLint:** 0 new errors or warnings across all modified and newly created admin files.
