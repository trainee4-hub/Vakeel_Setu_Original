# VakeelSetu Frontend

## 1. What This Is
VakeelSetu is a React and Vite single-page application for a legal-tech platform connecting Indian citizens and businesses with verified legal advocates. The frontend comprises four distinct functional areas: a public informational site and law library, a client user portal for booking and consultation management, an advocate workspace for practice and profile management, and an administrative panel for legal content and catalog moderation.

---

## 2. Setup & Running Locally

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Installation
```bash
cd vite-project
npm install
```

### Environment Variables
Create or verify `.env` in the `vite-project` root directory:
```env
VITE_API_URL=https://backend-vakeelsetu.vercel.app/api
```
- `VITE_API_URL` points to the backend REST API base URL. Note that it includes the trailing `/api` segment. All network calls resolve against this variable through `src/shared/services/apiClient.js`.

### Development & Build Commands
- **Start Dev Server:** `npm run dev` (Runs locally at `http://localhost:5173`)
- **Production Build:** `npm run build` (Compiles optimized assets to `dist/`)
- **Preview Bundle:** `npm run preview` (Locally serves the `dist/` production build)
- **Run Linter:** `npm run lint` (Executes ESLint across all source files)

---

## 3. Folder Structure
The codebase follows a modular, feature-based architecture with clean boundary isolation:

```
src/
├── app/          # Application core: routes, layouts (Navbar/Footer), Redux store, and entrypoint
├── shared/       # Feature-agnostic UI primitives, shared hooks, utility helpers, and apiClient
├── features/     # Domain features, each isolated with its own public index.js barrel
│   ├── admin/       # Admin dashboard and legal content CRUD (blogs, IPC, BNS, bare acts, etc.)
│   ├── advocate/    # Advocate dashboard, profile onboarding/editing, team, bookings, pricing
│   ├── auth/        # Multi-step signup engine, login pages (user/advocate/admin), OAuth flows
│   ├── legalHub/    # Public legal portal, legal knowledge articles, and law library drill-down
│   ├── marketing/   # Public landing pages, static informational views, terms, and policies
│   └── user/        # Client user dashboard, profile, saved advocates, bookings, and chat
├── constants/    # Global constants (e.g. practice categories)
├── hooks/        # Application-wide utility hooks
└── utils/        # Generic browser and token helpers
```

---

## 4. Non-Obvious Development Rules

1. **Service paths must NOT include `/api`:**  
   `API_BASE_URL` in `src/shared/services/apiClient.js` already terminates with `/api`. Service endpoints must start with a leading slash relative to that base (e.g., use `apiRequest("/auth/advocate/login")`, never `apiRequest("/api/auth/advocate/login")`).

2. **No cross-feature deep imports:**  
   Components in one feature must never import internal files from another feature (e.g., do not write `import X from "@features/auth/components/signup/OtpInput"`). External features may only consume exports exposed by that feature's root `index.js` (e.g., `import { OtpInput } from "@features/auth"`).

3. **Use path aliases instead of deep relative climbs:**  
   Vite and `jsconfig.json` configure four top-level aliases:
   - `@/*` $\rightarrow$ `src/*`
   - `@shared/*` $\rightarrow$ `src/shared/*`
   - `@app/*` $\rightarrow$ `src/app/*`
   - `@features/*` $\rightarrow$ `src/features/*`  
   Use these aliases rather than relative paths climbing three or more levels (`../../../`). Short relative imports (`./` and `../`) remain appropriate within the same folder or feature.

4. **Do not rename backend content endpoints:**  
   The backend's content write endpoints still use legacy `/content-creator/*` paths (e.g., `POST /api/content-creator/blogs`). The frontend feature was renamed to `admin`, but the backend API contract was not. Do not attempt to "fix" or rename these service paths to `/admin/*` without coordinated backend migrations.

---

## 5. Route Map

### 5.1 Public Site (Unauthenticated)
- `/`: Public homepage and landing page
- `/find-lawyer`: Search and filter catalog of verified advocates
- `/legal-hub`: Knowledge hub (legal rights, guides, updates, blogs)
- `/law-library`: Bare acts catalog and searchable legal code hub
- `/law-library/acts`: Bare acts list view
- `/law-library/acts/:id`: Bare act view
- `/law-library/acts/:id/sections/:secId`: Individual statutory section viewer
- `/legal-assistant`: AI-assisted legal intake and guidance chat
- `/about`, `/contact`: Company information and contact form
- `/terms`, `/privacy-policy`, `/cookies`, `/cancellation-refund`: Legal policies

### 5.2 Authentication (Public)
- `/login`: User client login (phone number + OTP)
- `/signup`: Multi-step user and advocate registration engine
- `/forgot-password`: Password reset request and recovery
- `/advocate/login`: Advocate email and password login
- `/admin/login`: Administrative credential login

### 5.3 User Portal (Protected — Role: `user`)
- `/dashboard`: Client dashboard and consultation overview
- `/user-profile`: Client profile details and account settings
- `/saved-lawyers`: Bookmarked advocate profiles
- `/bookings`: Scheduled and past consultation appointments
- `/messages`: Active chat threads and consultation messages

### 5.4 Advocate Panel (Protected — Role: `advocate`)
*Note: All workspace routes except onboarding are guarded by `AdvocateProfileGuard`, requiring a completed profile ($\ge$ 50 words bio).*
- `/advocate/complete-profile`: Multi-step advocate profile onboarding guard
- `/advocate/dashboard`: Practice overview, statistics, and appointment schedule
- `/advocate/profile`: Public profile preview and bio
- `/advocate/profile/edit`: Practice credentials, education, and fee configuration
- `/advocate/team`: Sub-advocate and paralegal team member management
- `/advocate/bookings`: Consultation appointment queue and management
- `/advocate/messages`: Client inquiry messages inbox
- `/advocate/pricing`: Fee structures for chat, audio, and video sessions
- `/advocate/account-settings`: Security, password, and session settings

### 5.5 Admin Panel (Protected — Role: `ADMIN`)
- `/admin/dashboard`: Administrative metrics and content moderation overview
- `/admin/advocates` (+ `/:id`): Advocate registrations, credentials review, account status, rejected profiles, and deletion requests:
  - List shows a dot beside each advocate's name for online status (All, Pending, and Rejected tabs).
  - Detail page shows an Online/Offline badge with last-seen time.
  - The value is a server-computed snapshot: the backend returns `isOnline: false` once the heartbeat is older than `ADVOCATE_ONLINE_TIMEOUT_SECONDS` (default 120s).
  - It does not auto-refresh; it updates on page load or refetch.
  - Advocate detail page is responsive down to 375px.
- `/admin/content/blogs` (+ `/create`, `/:id/edit`): Legal blog posts management
- `/admin/content/ipc` (+ `/create`, `/:id/edit`): Indian Penal Code sections management
- `/admin/content/bns` (+ `/create`, `/:id/edit`): Bharatiya Nyaya Sanhita sections management
- `/admin/content/user-rights` (+ `/create`, `/:id/edit`): Citizen rights management
- `/admin/content/guides` (+ `/create`, `/:id/edit`): Legal procedures guides management
- `/admin/content/updates` (+ `/create`, `/:id/edit`): Legal news updates management
- `/admin/content/bare-acts` (+ categories, acts, and sections create/edit): Statutory law library management

---

## 6. Demo Credentials & Authentication Notes

| Role | Identifier | Credential | Notes |
|---|---|---|---|
| **User (Client)** | `9876543210` | OTP: `123456` | Logs in via Phone OTP; user name: Rahul Verma |
| **Advocate** | `demoadvocate1@gmail.com` | `123456789` | Standard advocate account; name: Arjun Sharma |
| **Admin** | `trainee6@techvunex.in` | `1234` | Working admin account on the live backend |

> [!WARNING]
> **Admin Credential Ambiguity:**  
> On the live backend (`https://backend-vakeelsetu.vercel.app`), `POST /api/admin/login` authenticates successfully using `trainee6@techvunex.in` / `1234`. However, backend documentation lists this account as the *content creator* role, while the documented database admin seed (`admin@vakeelsetu.com` / `AdminPassword123!`) returns `401 Unauthorized`. This is an open question documented for the backend team. Do not modify the frontend admin authentication logic until the backend roles are clarified.

---

## 7. How to Add a New Feature

To add a new feature domain (e.g. `disputes`):
1. **Create the Feature Directory:**
   ```bash
   mkdir -p src/features/disputes/{components,pages,services,hooks}
   ```
2. **Implement Pages & Services:**
   - Create page components inside `src/features/disputes/pages/`.
   - Create API functions inside `src/features/disputes/services/disputesApi.js` using `apiRequest` from `@shared/services/apiClient`.
3. **Export Public Interface via `index.js`:**
   - Create `src/features/disputes/index.js`.
   - Export only components, hooks, or utilities that other parts of the application need to access.
4. **Mount Feature Routes:**
   - Define sub-routes in `src/features/disputes/routes/DisputesRoutes.jsx` (or export the root pages directly).
   - In `src/app/routes/AppRoutes.jsx`, import the feature pages or route component from `@features/disputes` and mount them with appropriate route protection (`ProtectedRoute`).

---

## 8. Known Issues & Post-Refactor Follow-Ups

The following items are documented in [`REFACTOR_REPORT.md`](REFACTOR_REPORT.md) as follow-up architectural tasks:

1. **Dedicated 404 Route Handling:**  
   Unknown routes currently fall back to `<DashboardEntry />`; implement an explicit `src/app/pages/NotFoundPage.jsx` mounted at `<Route path="*" />`.
2. **Code Splitting & Bundle Optimization:**  
   The production build emits a 10.25 MB single chunk due to broad top-level eager imports; configure Vite `manualChunks` and lazy route boundaries.
3. **8 Pagination Call Sites Standardization:**  
   Eight disparate components implement ad-hoc pagination logic; migrate all onto `src/shared/hooks/usePaginatedList.js`.
4. **11 Date Formatters Consolidation:**  
   Eleven separate files implement divergent date formatting helpers; consolidate into `src/shared/utils/date.js`.
5. **God-Component Decomposition:**  
   Decompose monolithic components (`Signup.jsx` 6k lines, `AdvocateDashboard.jsx` 3k lines, `UserProfile.jsx` 2.3k lines, `AdvocateEditProfile.jsx` 2.2k lines) into focused sub-components.
6. **Duplicate React Key at `/advocate/team`:**  
   Resolve duplicate key `030cf18f-aaad-4d6b-8d7f-4effad373e8e` logged to the console during teammate rendering.
7. **`useAuth` Hook Placement:**  
   Promote `useAuth` from `src/features/auth/hooks/` to `src/app/hooks/useAuth.js` or re-export it at the app level since it is consumed globally.
8. **`OtpInput` Component Promotion:**  
   Promote `OtpInput` from `src/features/auth/components/signup/` to `src/shared/components/ui/OtpInput.jsx` to cleanly serve its 3 non-auth consumers.
9. **Admin Credential Ambiguity Resolution:**  
   Clarify with the backend team whether `trainee6@techvunex.in` is intended as the permanent admin account on the deployment or if the seed was mismatched.

---

## 9. Recent Features & Updates

### 9.1 Staff-Only RBAC & Staff Account Creation
- **Backend Handoff Rule:** Role assignment is strictly restricted to Admin Panel Staff accounts (`ContentCreator` records). Clients (`User`) and Advocates (`Advocate`) can never hold RBAC roles.
- **Add Staff Account Modal (`ContentCreatorsList.jsx`):**
  - Added role assignment via a clean single-select `<select>` dropdown.
  - An account can hold at most **one** assigned role (or default to the standard Content Creator role if unselected).
  - Selected role displays an interactive preview showing its description and granted permissions (`Grants: View Users, View Advocates...`).

### 9.2 Dynamic Sidebar Role & "Legal Hub" Collapsible Dropdown
- **Dynamic Role Badge (`AdminSidebar.jsx` & `AdminHeader.jsx`):**
  - The role displayed under the "VakeelSetu" brand in the admin sidebar is completely dynamic via `getDisplayRole(user)`:
    - Primary admin accounts always display **`Admin`**.
    - Staff accounts dynamically display their assigned role name (e.g. `Lead User`, `Blog Editor`, or `Content Creator`).
- **Legal Hub Dropdown Navigation:**
  - Grouped all 7 legal content management modules into a single collapsible **"Legal Hub"** dropdown in the admin sidebar:
    - 📄 Blogs (`/admin/content/blogs`)
    - ⚖️ IPC Sections (`/admin/content/ipc`)
    - ⚖️ BNS Sections (`/admin/content/bns`)
    - 📖 Bare Acts (`/admin/content/bare-acts`)
    - 🛡️ User Rights (`/admin/content/user-rights`)
    - 📚 Guides (`/admin/content/guides`)
    - 🔄 Updates (`/admin/content/updates`)
  - Automatically auto-expands when the current route is within any of these 7 content sub-paths.

### 9.3 Bare Acts & Statutes: Continuous Section Reading
- **Sequential Section Reader (`SectionDetails.jsx`):**
  - Integrated `Previous Section` and `Next Section` navigation buttons at the bottom of the section detail view.
  - Automatically walks across chapter boundaries in natural reading order so users can browse smoothly without returning to the index page.

### 9.4 Bare Acts: Single-Digit Section Search Fix
- **Issue:** Users searching for single-digit section numbers (e.g., `"1"`, `"2"`, `"5"`, `"9"`) inside an Act were seeing zero results because `MIN_SEARCH_LENGTH` was hardcoded to `2`.
- **Solution:**
  - Set `MIN_SEARCH_LENGTH = 1` in `lawLibraryUtils.js`.
  - Updated `ActDetails.jsx` to trigger search immediately for single-digit queries.
  - Added in-memory fallback in `ActDetails.jsx` so that if the backend search API encounters a network glitch, sections are filtered locally from memory.
  - Updated `LawLibrarySearch.jsx` helper message for single character queries.

### 9.5 Bare Acts: Exact Section Number Search Matching
- **Issue:** Searching a digit like `"2"` returned every section containing `"2"` anywhere in its number or text (e.g. `Section 12`, `Section 20`, `Section 21`, `Section 22`... or 231 results in Constitution of India).
- **Solution:**
  - Added `parseSectionNumber` and `filterSectionsSmart` in [lawLibraryUtils.js](file:///Users/admin/Desktop/vakeel_setu_3/vite-project/src/features/legalHub/components/lawLibrary/lawLibraryUtils.js).
  - When searching section numbers (e.g. `"2"`, `"8"`, `"28"`, `"Section 2"`, `"sec 8"`, `"Section 28"`), exact section number matching is applied:
    - Query `"2"` returns strictly **Section 2** (not 12, 20, 21, 22...).
    - Query `"8"` returns strictly **Section 8** (not 18, 28, 38...).
    - Query `"28"` returns strictly **Section 28**.
    - Query `"2A"` returns strictly **Section 2A**.
  - Text keyword searches (e.g. `"power of state"`, `"lok adalat"`, `"definition"`) continue to search across section titles and descriptions seamlessly.

### 9.6 Bare Acts: Dynamic Chapter Highlight During Search
- **Issue:** When searching a section while browsing an act (e.g. `?chapter=1`), the sidebar left `Chapter 1` highlighted even if the searched section was in a completely different chapter (e.g. Section 28 is in Chapter 7).
- **Solution:**
  - In [ActDetails.jsx](file:///Users/admin/Desktop/vakeel_setu_3/vite-project/src/features/legalHub/pages/ActDetails.jsx), added `searchResultChapterNos` and `isChapterActive(chapterNo)` to dynamically resolve the active chapter based on the search results.
  - When searching Section 28, **Chapter 7 — MISCELLANEOUS** is highlighted as active, and Chapter 1 is unhighlighted.
  - When searching Section 8, **Chapter 3 — STATE LEGAL SERVICES AUTHORITY** is highlighted as active.
  - When searching Section 2, **Chapter 1 — PRELIMINARY** is highlighted as active.
  - Added automatic smooth scrolling (`scrollIntoView`) to ensure the active chapter is always in view in the sidebar.
  - Works seamlessly across all Acts on both desktop sidebar and mobile drawer.


