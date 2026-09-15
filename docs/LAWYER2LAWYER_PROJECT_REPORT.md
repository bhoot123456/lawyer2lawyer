# Lawyer2Lawyer — Complete Project Report

> **Tagline:** "Your Legal Practice. Connected."
> **Date:** September 2026 · **Version:** 1.0 (baseline stable)
> **Repository:** `d:\lawyer2lawyer` → `app/backend/` (API) + `app/mobile/` (Expo RN)

---

## 1. Project Overview

Lawyer2Lawyer is a premium legal-tech platform built for the Indian legal market. It is a full-stack application with a React Native (Expo) cross-platform mobile/web frontend and a Node.js/Express + MongoDB backend. The platform connects lawyers, clients, and courts — providing legal research tools, case management, court directories, AI-powered legal assistance, and a comprehensive admin CMS.

**Target Users:** Lawyers, advocates, legal professionals, and clients across India (initially focused on Delhi/NCR with 8 major legal hubs).

**Deployment Model:**
- **Backend:** Node.js on Railway (PaaS), MongoDB Atlas (cloud)
- **Mobile:** Expo SDK 56 — iOS, Android, Web via EAS Build
- **Package name:** `com.lawyer2lawyer.mobile`

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (Mobile + Web)                    │
│    React Native (Expo SDK 56) + TypeScript                  │
│    expo-router (file-based routing)                         │
│    Runs on: iOS · Android · Web                             │
└────────────────────────┬────────────────────────────────────┘
                         │  REST API (Axios)
                         │  JWT Auth + Device-scoped anonymous
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (API Server)                       │
│    Node.js + Express 5 + Mongoose 9                         │
│    Port: 5000 · MongoDB Atlas (cloud)                       │
│    AI: OpenRouter → GPT-5 / DeepSeek / Gemini               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (MongoDB Atlas)                       │
│    28 Mongoose Models / Collections                         │
│    Text indexes · compound indexes · TTL indexes            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### Backend (`app/backend/`)

| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥20 | Runtime |
| Express | v5.2.1 | HTTP framework |
| Mongoose | v9.6.2 | MongoDB ODM |
| MongoDB driver | v7.2.0 | Database connectivity (Atlas cloud) |
| jsonwebtoken | v9.0.3 | JWT auth (access + refresh tokens) |
| bcryptjs | v3.0.3 | Password hashing |
| openai SDK | v4.104.0 | AI completions via OpenRouter proxy |
| @openrouter/agent | ^0.7.2 | OpenRouter agent integration |
| helmet | v8.3.0 | Security headers |
| cors | v2.8.6 | Cross-origin config |
| express-validator | v7.3.2 | Input validation |
| multer | v2.2.0 | File uploads |
| node-cron | v4.6.0 | Scheduled jobs (Judicial Intelligence Engine) |
| nodemon | v3.1.14 | Dev hot-reload |
| dotenv | v17.4.2 | Environment configuration |
| axios | ^1.18.1 | Server-side HTTP client |
| axios-cookiejar-support | ^7.0.0 | Cookie jar for server-side requests |
| tough-cookie | ^6.0.2 | Cookie handling |

### Frontend (`app/mobile/`)

| Technology | Version | Purpose |
|---|---|---|
| React Native | 0.85.3 | Cross-platform UI |
| Expo | SDK 56 | Build/dev toolchain |
| expo-router | ~56.2.19 | File-based routing |
| TypeScript | ~6.0.3 | Type safety |
| Axios | ^1.16.1 | HTTP client |
| @react-native-async-storage/async-storage | 2.2.0 | Local persistence |
| react-native-reanimated | 4.3.1 | Animations |
| expo-notifications | ~56.0.24 | Push notifications |
| react-native-svg | 15.15.4 | SVG rendering |
| @expo/vector-icons | ^15.1.1 | Icon library (Ionicons) |
| react-native-gesture-handler | ~2.31.1 | Gesture handling |
| react-native-safe-area-context | ~5.7.0 | Safe area management |
| react-native-screens | ~4.26.0 | Native screen management |
| expo-splash-screen | ~56.0.14 | Splash screen |
| expo-status-bar | ~56.0.4 | Status bar |
| expo-symbols | ~56.0.7 | SF Symbols |
| expo-system-ui | ~56.0.5 | System UI |
| expo-web-browser | ~56.0.6 | In-app browser |
| expo-font | ~56.0.5 | Font loading |
| expo-device | ~56.0.4 | Device info |
| expo-constants | ~56.0.20 | Constants |
| expo-image | ~56.0.12 | Image component |
| expo-linking | ~56.0.17 | Deep linking |
| react-native-web | ~0.21.0 | Web rendering |
| react-native-worklets | 0.8.3 | Worklet runtime |
| react-native-animatable | ^1.4.0 | Animation library |
| react-native-vector-icons | ^10.3.0 | Vector icons (compat) |
| expo-glass-effect | ~56.0.4 | Glassmorphism effect |
| expo-clipboard | ~56.0.4 | Clipboard API |
| @expo/ui | ~56.0.26 | Expo UI components |

---

## 4. Project File Structure

```
lawyer2lawyer/
├── app/
│   ├── backend/
│   │   ├── index.js (466 lines) — Entry point, routes, middleware, error handling
│   │   ├── config/corsOptions.js — Hardened CORS (loopback-allowed, allowlist)
│   │   ├── controllers/ (14 files) — Business logic for all routes
│   │   ├── middleware/ (6 files) — auth, adminAuth, deviceAuth, lawyerAuth, optionalAuth, rateLimit
│   │   ├── models/ (28 files) — Mongoose schemas for all collections
│   │   ├── routes/ (27 files) — 26 functional + 1 stub (bookings.js)
│   │   ├── services/ (6 files) — aiService, authService, caseService, + 3 others
│   │   ├── validation/ (2 files) — caseValidation, policeStationValidation
│   │   ├── utils/ (3 files) — logger, httpError, judicialIntelligenceUtils
│   │   ├── jobs/ (1 file) — Judicial Intelligence cron runner
│   │   ├── admin/ — Admin subsystem
│   │   │   ├── audit/auditService.js — Audit trail + deepSanitize
│   │   │   ├── controllers/ (2 files) — adminUsersController, cmsController
│   │   │   ├── permissions/ (2 files) — registry.js, roles.js
│   │   │   ├── registry/contentRegistry.js — Server-side CMS module allowlist
│   │   │   └── services/crudEngine.js — Universal CRUD engine
│   │   ├── scripts/ (11 files) — Smoke tests, migrations, admin scripts
│   │   ├── tests/ (2 files) — rbac.test.js, lawyer-security.test.js
│   │   ├── seed.js, seed-*.js (5 files) — Data seeding scripts
│   │   ├── import-*.js, insert-*.js — Import scripts
│   │   └── .env.example — Environment configuration template
│   │
│   ├── mobile/
│   │   ├── src/
│   │   │   ├── app/ (74 files) — File-based routing
│   │   │   │   ├── _layout.tsx — Root layout, Sidebar, BottomTabs, FloatingAI
│   │   │   │   ├── ~40 top-level screens (home, dashboard, cases, AI, etc.)
│   │   │   │   ├── 9 AI feature screens (ai-assistant, ai-case-summary, etc.)
│   │   │   │   ├── 12 admin panel screens
│   │   │   │   └── 7 nested route directories (admin/, cases/, delhi-district-courts/,
│   │   │   │       draft-library/, knowledge-hub/, revenue-court/, tax-corporate/)
│   │   │   ├── components/ (172+ files)
│   │   │   │   ├── FloatingAIAgent.tsx, SidebarLayout.tsx, BottomTabs.tsx, AuthGate.tsx
│   │   │   │   ├── dashboard/ (21 files), ui/ (18 files)
│   │   │   │   ├── admin/ (5), cases/ (2), acts/ (4), judge/ (1), legal/ (2)
│   │   │   │   ├── supreme-court/ (7), tribunals/ (9)
│   │   │   │   └── AppErrorBoundary, SectionCard, etc.
│   │   │   ├── services/ (15 files) — api.js + 14 API service modules
│   │   │   ├── modules/aiAssistant/ — AI module
│   │   │   │   ├── screens/ (10 files), components/ (11 files)
│   │   │   │   ├── services/ (5 files), hooks/, types/, utils/, constants/
│   │   │   ├── theme/ (3 files) — designSystem.ts, ThemeProvider.tsx, appTheme.ts
│   │   │   ├── types/ (2 files), data/ (1 file), hooks/ (5 files), utils/ (5 files)
│   │   ├── screens/ (5 JS files) — Legacy screens (being migrated to TS)
│   │   ├── app.json, eas.json, tsconfig.json, babel.config.js
│   │   └── .env.example — Mobile env config
│   ├── shared/ — Shared code (currently empty)
│   ├── docs/ — Documentation (CRASH_AUDIT, CRASH_FIX_PROGRESS, phase1 docs, UI-UX-REPORT)
│   ├── .github/workflows/ci.yml — CI/CD pipeline
│   └── README.md — Verification gate documentation

---

## 5. Database Models (28 Mongoose Collections)

| Model | Key Fields | Purpose |
|---|---|---|
| User | name, email, password, role (client/lawyer/admin), state, city, specialization, verificationStatus, adminType, permissions | User accounts with RBAC |
| Session | refreshTokenHash, user, revokedAt, expiresAt, device/ip info | JWT refresh token sessions |
| Case | caseTitle, caseNumber (unique), client, advocate, court, judge, oppositeParty, status, priority, currentStage, documents[], expenses, timeline[], notes[], deviceId, createdBy, assignedTo | Full case management |
| BareAct | title, actName, slug (unique), year, category, ministry, pdfUrl, status, content, tags, jurisdiction | Indian bare acts/legislation library |
| BareActFavourite | userId, bareActId | User favorites for bare acts |
| BareActRecentlyOpened | userId, bareActId, openedAt | Recently opened acts tracking |
| Tribunal | name, abbreviation, category, jurisdiction, location, website + extended metadata | 179+ tribunal directory entries |
| PoliceStation | name, district, subdivision, address, phone, sho (officer), location (lat/lng), status | Delhi Police station directory (179 stations) |
| PoliceHierarchyOffice | district, subdivision, officer details (DCP, ACP) | Police hierarchy officers |
| DistrictCourtJudge | judgeName, court, courtId, designation, roomNumber, benchType | Delhi District Court judges |
| JudgeDirectory | judgeName, courtId, designation, published status | Published judge directory |
| SupremeCourt | case details, VC links | Supreme Court data |
| CourtHoliday | date, courtType, description | Court holiday calendar |
| DailyCauseListEntry | caseNumber, court, date, timeSlot | Daily cause list |
| CriminalLawAct | title, actName, sections, category | Criminal law reference (BNS, BNSS, BSA) |
| DraftTemplate | title, content, category | Legal draft templates |
| MiscForm | title, formUrl, category | Miscellaneous court forms |
| KnowledgeHubItem | title, content, category, tags | Legal knowledge articles |
| Article | title, content, author, status | CMS articles |
| JudicialIntelligenceSourceItem | title, content, source, category | Judicial intelligence data |
| JudicialJudgment | title, judgment details, court | Judgment database |
| Notification | user, category (30+ types), title, body, status, channels, scheduledFor, dedupeKey | Notification system |
| AIConversation | user, messages[], metadata | AI chat history persistence |
| AuditLog | action, actor, target, metadata, timestamp | Admin audit trail |
| Report | reportType, data | Admin reports |
| RevenueCourtPhase8 | (Phase 8 data) | Revenue court data |
| TaxCorporatePhase9 | (Phase 9 data) | Tax & corporate law data |
| Booking | (empty/placeholder) | Future booking feature (stub) |

---

## 6. Backend API Endpoints

### Authentication & Users
| Route File | Endpoint | Description |
|---|---|---|
| auth.js | POST /api/auth/register | Registration (client/lawyer only; admin→client) |
| auth.js | POST /api/auth/login | Login — access (15m) + refresh (30d) JWT |
| auth.js | POST /api/auth/refresh | Token refresh with rotation |
| auth.js | POST /api/auth/logout | Revoke current session |
| auth.js | POST /api/auth/logout-all | Revoke all sessions |
| auth.js | GET /api/auth/me | Get authenticated user profile |
| lawyers.js | GET /api/lawyers | Search/list lawyers |

### Case Management
| Route File | Endpoint | Description |
|---|---|---|
| cases.js | GET /api/cases | List cases (device-scoped or JWT-scoped) |
| cases.js | POST /api/cases | Create case (ANON-* auto-gen for anonymous) |
| cases.js | GET /api/cases/:id | Get case detail |
| cases.js | PUT /api/cases/:id | Update case |
| cases.js | DELETE /api/cases/:id | Delete case |
| cases.js | POST /api/cases/:id/notes | Add note |
| cases.js | POST /api/cases/:id/documents | Add document |
| cases.js | PUT /api/cases/:id/expenses | Update expenses |

### CourtDesk (Lawyer-Private Surface)
| Route File | Endpoint | Description |
|---|---|---|
| courtdesk.js | GET /api/courtdesk/profile | Lawyer profile (JWT-only) |
| courtdesk.js | GET /api/courtdesk/cases | Lawyer's assigned cases only |
| courtdesk.js | GET /api/courtdesk/cases/:id | Single case scoped to lawyer |

### Legal Research
| Route File | Endpoint | Description |
|---|---|---|
| bare-acts.js | GET /api/bare-acts | Browse/search bare acts (100+ acts) |
| bare-acts-favourites.js | GET/POST/DELETE /api/bare-acts/favourites | Favourites CRUD |
| bare-acts-recently-opened.js | GET/POST /api/bare-acts/recently-opened | Recently opened tracking |
| criminal-law-acts.js | GET /api/criminal-law-acts | Criminal law reference (BNS, BNSS, BSA) |
| knowledge-hub.js | GET /api/knowledge-hub | Knowledge articles |
| draft-library.js | GET/POST/PUT/DELETE /api/draft-library | Legal drafts CRUD |
| misc-forms.js | GET /api/misc-forms | Court forms directory |

### Court & Legal Directories
| Route File | Endpoint | Description |
|---|---|---|
| tribunalRoutes.js | GET /api/tribunals | Tribunal directory (179+ entries) |
| supreme-court.js | GET /api/supreme-court | Supreme Court data & VC links |
| district-court-judges.js | GET /api/district-courts | Delhi District Court judges |
| judge-directory.js | GET /api/judge-directory | Published judge directory |
| police-stations.js | GET /api/police-stations | Police station directory (179 stations) |
| states.js | GET /api/states | Indian states list |
| revenue-court.js | GET /api/revenue-court | Revenue court data (Phase 8) |
| tax-corporate.js | GET /api/tax-corporate | Tax & corporate data (Phase 9) |

### AI Assistant
| Route File | Endpoint | Description |
|---|---|---|
| ai.js | POST /api/ai/chat | AI conversation (OpenRouter → GPT-5/DeepSeek/Gemini) |
| ai.js | POST /api/ai/chat/continue | Continue conversation |
| ai.js | POST /api/ai/chat/reset | Reset conversation |
| ai.js | GET/POST /api/ai/conversations | List/create conversations |
| ai.js | GET /api/ai/conversations/:id | Get conversation |
| ai.js | PATCH /api/ai/conversations/:id | Rename |
| ai.js | DELETE /api/ai/conversations/:id | Delete |
| ai.js | GET /api/ai/context | Context metadata |
| ai.js | GET /api/ai/insights | AI insights (global) |

### Dashboard & Notifications
| Route File | Endpoint | Description |
|---|---|---|
| dashboard.js | GET /api/court-holidays | Court holiday calendar (public) |
| dashboard.js | GET /api/daily-cause-list | Daily cause list (public) |
| dashboard.js | GET /api/legal-news | Legal news (public) |
| dashboard.js | GET /api/client-calls | Client meetings (auth) |
| dashboard.js | GET /api/activity/recent | Recent activity (auth) |
| dashboard.js | GET /api/dashboard/stats | Dashboard stats (auth) |
| notifications.js | GET /api/notifications | Notification history |
| notifications.js | POST /api/notifications/:id/read | Mark read |
| notifications.js | POST /api/notifications/read-all | Mark all read |
| notifications.js | GET /api/notifications/briefing/today | Today's briefing (auth) |

### Admin CMS
| Route File | Endpoint | Description |
|---|---|---|
| admin.js | /api/admin/lawyers | Lawyer management |
| admin.js | /api/admin/clients | Client management |
| admin.js | /api/admin/cases | Case management (admin) |
| admin.js | /api/admin/users | User directory |
| admin.js | /api/admin/police-stations | Police station management |
| admin.js | /api/admin/police-hierarchy | Police hierarchy management |
| admin.js | /api/admin/* | All CMS entity CRUD |
| admin-cms.js | /api/admin/cms/:module | Registry-driven CRUD (list/create/get/update/delete/status) |
| admin-cms.js | GET /api/admin/cms/_modules | List authorized CMS modules |
| admin-cms.js | PATCH /api/admin/cms/:module/:id/status | Status actions |
| admin-system.js | GET /api/admin/system/me | Admin role/permissions |
| admin-system.js | GET /api/admin/system/audit-logs | Audit trail |
| admin-system.js | GET /api/admin/system/data-health | Data health statistics |

### Judicial Intelligence
| Route File | Endpoint | Description |
|---|---|---|
| judicial-intelligence-search.js | GET /api/judicial-intelligence/search | Search judicial intelligence data |

### Health & System
| Endpoint | Description |
|---|---|
| GET / | Server alive check |
| GET /health | Liveness probe |
| GET /health/ready | Readiness probe (checks MongoDB) |
| GET /.well-known/assetlinks.json | Android App Links (404 if not configured) |

> **Note:** `bookings.js` route file exists as a stub (`// booking routes removed`); the Booking model exists as an empty placeholder for a future booking feature.

---

## 7. Authentication & Authorization System

### Authentication Flow

**Registration:** `POST /api/auth/register` — bcrypt password hashing, JWT issuance. Server enforces that only `client` and `lawyer` roles can be self-assigned; `admin` and any other role is forcibly downgraded to `client` via `authService.resolveSelfServiceRole()`.

**Login:** `POST /api/auth/login` — returns access token (15m) + refresh token (30d). Refresh token is hashed with bcrypt and stored in MongoDB `Session` collection.

**Token Refresh:** `POST /api/auth/refresh` — refresh token rotation: old session is revoked (`revokedAt` set, `revokedReason: 'rotated'`), and a new session with a new token pair is issued. Rotation version lineage is tracked via `parentSessionId`.

**Session Management:** Sessions stored in MongoDB with hashed refresh tokens. Supports:
- Revoking single sessions (logout)
- Revoking all sessions (logout-all)
- Device tracking (userAgent, deviceId, platform, ipAddress)
- Session expiry enforcement

**Logout:** Single session revocation or all-sessions revocation via `POST /api/auth/logout` or `POST /api/auth/logout-all`.

### User Roles

| Role | Access Level |
|---|---|
| client | Basic features, case creation, AI assistant |
| lawyer | Full practice tools, case management, dashboard, CourtDesk |
| admin | CMS access, varies by adminType |

### Admin Hierarchy (adminType)

| Type | Permissions |
|---|---|
| super_admin | Full system access (bypasses all permission checks) |
| content_admin | CMS content management (articles, knowledge hub, drafts, forms) |
| legal_data_admin | Legal data management (bare acts, criminal laws, courts, tribunals) |
| police_admin | Police station + hierarchy data management |
| court_admin | Court data management (holidays, cause lists, judges) |
| editor | Content editing (create/edit own module content, cannot publish/delete) |
| viewer | Read-only access (dashboard.view only) |

### Authorization Middleware (6 files)

| Middleware | Purpose |
|---|---|
| auth.js | JWT verification for authenticated routes (15m access token) |
| adminAuth.js | Admin role verification + granular permission checks |
| deviceAuth.js | Device-scoped anonymous access (UUID v4 validation via X-Device-Id header) |
| lawyerAuth.js | Lawyer role gate (JWT-only, no deviceAuth) for CourtDesk surface |
| optionalAuth.js | Mixed auth — authenticated users get req.user, anonymous users proceed |
| rateLimit.js | IP-based rate limiting (auth: 10/min, AI: 60/min) |

### RBAC Permission System

The RBAC system uses a **secure-by-default explicit-grant model**:

- **Permission registry** (`admin/permissions/registry.js`): Defines all available permissions as `{module}.{action}` strings (e.g., `tribunals.edit`, `bareActs.publish`). Contains 80+ permissions across 20+ modules. Unknown permission strings are never grantable.

- **Role templates** (`admin/permissions/roles.js`): Each `adminType` has a baseline permission set. `super_admin` resolves dynamically to all permissions.

- **Legacy compatibility**: Legacy flat permissions (`manageLawyers`, `manageTribunals`, etc.) are mapped to their granular equivalents via `LEGACY_PERMISSION_MAP`. Existing production admins keep working without data migration.

- **Secure by default**: A permission is granted ONLY when explicitly `true` on the user document. Missing/undefined/false permissions are ALWAYS denied.

- **Admin users management**: All mutations to admin accounts (create, update, role changes, permissions) are restricted to super_admin only. Self-role/self-permission changes are rejected.

---

## 8. AI Assistant System

### Architecture

**Backend:** `aiService.js` (581 lines) — OpenRouter API integration using the OpenAI SDK pointed at the OpenRouter-compatible endpoint. Supports model fallback chain, conversation persistence, and context-aware system prompts.

**Frontend:** Two-layer architecture:
1. **`FloatingAIAgent.tsx`** — Persistent AI chat overlay (28KB) that floats on all non-admin, non-CourtDesk screens. Provides quick-access conversational AI.
2. **9 dedicated AI feature screens** in `modules/aiAssistant/screens/` — Full-screen specialized AI tools.
3. **`modules/aiAssistant/services/`** — Dual provider architecture: `backendAI.ts` (production), `MockAIProvider.ts` (dev), `OpenAIProvider.ts`, `UnavailableAIProvider.ts` (offline fallback).

### AI Features

| Feature | Route/Module | Description |
|---|---|---|
| General Chat | `/ai-assistant` → POST /api/ai/chat | Conversational legal AI assistant |
| Case Summary | `/ai-case-summary` → POST /api/ai/chat | AI-generated case summaries |
| Draft Legal Notice | `/ai-draft-legal-notice` → POST /api/ai/chat | Auto-draft legal notices |
| Explain Bare Act | `/ai-explain-bare-act` → POST /api/ai/chat | Plain-language act explanations |
| Find Lawyers | `/ai-find-lawyers` → POST /api/ai/chat | AI lawyer recommendations |
| Legal Checklist | `/ai-legal-checklist` → POST /api/ai/chat | Step-by-step legal checklists |
| Search Documents | `/ai-search-documents` → POST /api/ai/chat | Intelligent document search |
| Summarize Judgment | `/ai-summarize-judgment` → POST /api/ai/chat | Judgment summary generator |
| Chat History | `/ai-history` | Conversation history browser (list, search, pin, export) |

### AI Configuration

| Setting | Value |
|---|---|
| Provider | OpenRouter API (proxy to multiple LLMs) |
| Primary Model | `openai/gpt-5` (configurable via `OPENROUTER_MODEL`) |
| Fallback Models | `deepseek/deepseek-chat` → `google/gemini-2.5-flash` → `mistralai/mistral-large-latest` |
| Timeout | 15,000ms (configurable via `OPENROUTER_TIMEOUT_MS`) |
| Rate Limit | 60 requests/minute per IP |
| Context | System prompt includes user role, location (city/state), current page path |
| Persistence | Conversations stored in MongoDB (`AIConversation` model) with text search, pinning, export |
| Authentication | Optional — both logged-in and anonymous users can access AI features |

---

## 9. Frontend Design System

### Theme System

- **Dark mode default** with full light mode support
- **Color palette:** Navy slate backgrounds (`#0F172A`) with legal-gold accent (`#D4AF37`)
- **Typography scale:** 8 levels (display → overline + legal)
- **Spacing scale:** 6 levels (xs: 4 → 2xl: 48)
- **Shadow levels:** 5 elevation levels (level0–level4)
- **Border radius:** 7 levels (xs: 6 → full: 9999)
- **Theme Provider:** React context with dark/light switching (`ThemeProvider.tsx`)
- **Semantic aliases:** PHASE 1 semantic aliases added (background, surface, elevated, textPrimary, etc.)

### UI Component Library (18 components in `components/ui/`)

| Component | Purpose |
|---|---|
| GlassCard | Premium glassmorphism container |
| PremiumCard | Elevated card with shadow |
| PremiumButton | Primary action button |
| HomeCard | Home page grid card |
| SectionHeader | Section titles |
| CategoryChip | Category tags/filters |
| StatusBadge | Status indicators (Pending, Filed, etc.) |
| MetadataRow | Key-value data display |
| AppInput | Form text input |
| KeyboardAwareView | Keyboard-avoiding container |
| EmptyState | No-data illustrations |
| ErrorState | Error display |
| SkeletonCard | Loading placeholder |
| Collapsible | Expandable/collapsible sections |
| AppButton | Button with variant styles |
| AppCard | Basic card wrapper |
| ConfirmDialog | Confirmation dialogs |
| index.ts | Barrel export |

### Dashboard Components (21 files in `components/dashboard/`)

| Component | Purpose |
|---|---|
| DashboardHeader | Lawyer profile header with stats |
| DashboardStats | Stats grid (hearings, cases, revenue, drafts) |
| QuickActionsGrid | Quick action buttons |
| NextHearingCard | Next upcoming hearing |
| TodayHearings | Today's hearings list |
| UpcomingHearings | Upcoming hearings timeline |
| TodayTimeline | Daily timeline view |
| PendingDrafts | Task cards for pending drafts |
| PendingClientCalls | Client meeting reminders |
| RecentNotifications | Notification feed |
| RecentActivityCard | Recent activity list |
| CourtHolidayCard | Court holiday calendar |
| CauseListCard | Daily cause list |
| AIInsightsCard | AI-powered insights |
| LegalNewsCard | Legal news feed |
| DailyBriefCard | Daily briefing |
| DashboardEmptyState | Empty state for dashboard |
| DashboardErrorState | Error state for dashboard |
| DashboardLoadingState | Loading state for dashboard |
| types.ts | Dashboard type definitions |
| index.ts | Barrel export |

### Navigation

- **Mobile:** Bottom tab navigation (`BottomTabs.tsx`) — Home, Dashboard, Cases, Search, Menu
- **Web:** Sidebar navigation (`SidebarLayout.tsx`) with collapsible sections
- **Floating AI:** Persistent AI chat bubble on all non-admin, non-CourtDesk screens
- **Admin:** Separate admin panel with hidden BottomTabs on admin routes
- **CourtDesk:** Standalone layout (no BottomTabs/FloatingAI)

---

## 10. Key Features by Module

### 10.1 Case Management

Full CRUD with auto-generated case numbers:
- **Anonymous (device-scoped):** `ANON-<timestamp>-<random>` prefix
- **Authenticated (JWT-scoped):** Normal case numbers assigned by user/lawyer

**Case stages:** Draft → Pending → Filed → Notice Issued → Reply Filed → Evidence → Arguments → Reserved → Disposed → Closed

**Priority levels:** Low, Medium, High, Urgent

**Document management:** Categories — Petition, Reply, Evidence, Order, Judgment, Notice, Affidavit, Agreement, Other

**Expense tracking:** court fee, stamp, printing, travel, miscellaneous (+ auto-calculated total via Mongoose pre-save hook)

**Timeline history:** Auto-logged events (Case Created, Document Uploaded, Next Hearing Changed, Status Updated, Note Added, Expense Updated)

**Notes system:** Unlimited notes per case with author attribution

**Dual ownership model (P0 isolation):**
- Device-scoped (anonymous) via `deviceId` — validated UUID v4 via `X-Device-Id` header
- JWT-scoped (authenticated) via `createdBy` / `assignedTo`
- **Device-first precedence:** A validated `X-Device-Id` is always canonical for the public/no-login Cases module. A stale JWT in storage can NEVER widen device scope.
- **Cross-device isolation:** 403/404 for unauthorized access; case enumeration prevented (404 returned instead of 403 to unauthorized lawyers)

### 10.2 Legal Research

- **Bare Acts Library:** 100+ Indian bare acts with PDF links, categories, year filtering, favourites, recently opened, search, source/verification metadata
- **Criminal Law:** BNS (Bharatiya Nyaya Sanhita), BNSS, BSA reference with sections and categories
- **Knowledge Hub:** Curated legal articles and resources
- **Draft Library:** Legal draft templates (CRUD for authenticated users)
- **Miscellaneous Forms:** Court forms directory

### 10.3 Court Directories

- **Supreme Court:** Court info, VC (video conference) links, cause lists
- **Delhi High Court:** Bench details, court info
- **Delhi District Courts:** All 11 district courts, judge directory, court types (Regular, Registrar)
- **Tribunals:** 179+ tribunal entries (ITAT, NCLT, SAT, NGT, etc.) with extended metadata (bench info, contact, working hours, e-filing, video conference, resource links, verification data)

### 10.4 Police Station Directory

- 179 Delhi territorial police stations
- Station details: SHO, contact, address, district, subdivision, geolocation (lat/lng)
- Police hierarchy (DCP, ACP levels) in separate `PoliceHierarchyOffice` collection
- Text search across name, district, subdivision, address, phone, SHO name
- Data provenance: source + lastVerified fields

### 10.5 Dashboard (Lawyer-Focused)

- Profile header with advocate details
- Stats: today's hearings, active cases, pending cases, revenue, client meetings, pending drafts
- Quick actions grid
- Today's hearings + upcoming hearings list
- Today timeline view
- Pending drafts & client calls task cards
- Recent notifications feed
- Court holiday calendar
- Daily cause list
- AI insights card
- Legal news feed
- Recent activity card
- Daily briefing card

### 10.6 Admin Panel

- **User Management:** View/manage lawyers, clients, admin users (super_admin only for create/update)
- **Content CMS:** Universal registry-driven CRUD for bare acts, articles, tribunals, judges, police stations, court holidays, cause lists, etc.
- **Publish Workflow:** Draft → Published → Archived status management per module
- **Judge Directory:** Manage court judge listings
- **Audit Logs:** Complete admin action audit trail with before/after diffs (sensitive fields redacted via deepSanitize)
- **Reports & Data Health:** System analytics, per-module record counts, verification status, unverified records, missing source URLs
- **Permissions Management:** Permission catalog, role-based templates, legacy permission mapping
- **Admin User Management:** Create/edit admins with granular permission controls (super_admin only)

### 10.7 Notification System

- 30+ notification categories spanning court holidays, legal updates, case notifications, system
- In-app notification history with read/unread tracking
- Daily briefing aggregation (`GET /api/notifications/briefing/today`)
- Push notification infrastructure ready (expo-notifications installed; delivery not yet wired)
- De-duplication via `dedupeKey`
- Soft archive for data retention (`archivedAt` field)
- Scheduled notification support (`scheduledFor` field)

### 10.8 CourtDesk (Phase 1 — Authenticated Lawyer Foundation)

- Lawyer-private surface accessible only via JWT (no device scoping)
- Identity precedence: JWT > device header (device header explicitly ignored)
- Endpoints: `/api/courtdesk/profile`, `/api/courtdesk/cases`, `/api/courtdesk/cases/:id`
- Lawyer sees ONLY cases assigned to them (`assignedTo` field)
- Case detail returns 404 (not 403) to unauthorized lawyers — prevents case enumeration

---

## 11. Security Implementation

| Feature | Implementation |
|---|---|
| Helmet.js | Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, etc.) |
| CORS | Hardened origin whitelist (`corsOptions.js`) — loopback always allowed in dev, production requires explicit `CORS_ORIGIN` allowlist; no wildcards |
| JWT | Access token (15m) + Refresh token (30d) with rotation; refresh tokens hashed with bcrypt and stored in `Session` collection |
| Password Hashing | bcryptjs with salted hashes (10 rounds) |
| Rate Limiting | Custom IP-based limiter (no new dependencies): auth 10/min, AI 60/min, configurable via env vars |
| Input Validation | `express-validator` on all mutable endpoints; case validation in `validation/caseValidation.js` |
| RBAC | Permission-based admin access (deny-by-default); secure-by-default explicit-grant model; legacy permission mapping |
| Request Body Limits | 10MB max JSON/urlencoded (DoS prevention) |
| Audit Trail | All admin mutations logged to `AuditLog` collection with before/after diffs; sensitive fields redacted via `deepSanitize` |
| Error Sanitization | Production never exposes stack traces or internal details; Mongoose CastError→400, ValidationError→400, duplicate key→409 |
| Trust Proxy | `trust proxy` set to 1 in production for correct IP parsing behind reverse proxy |
| X-Robots-Tag | `noindex` header on all API responses |
| Graceful Shutdown | SIGTERM/SIGINT handling with 30s drain timeout; MongoDB connection closed cleanly |
| Device ID Validation | UUID v4 format validation via regex for all anonymous case operations |
| Device-First Isolation | `X-Device-Id` always takes precedence over stale JWT tokens for case scoping |
| No Fabricated Data | Android App Links endpoint returns 404 if SHA256 fingerprint not configured |
| Production Fail-Fast | Server refuses to boot in production without `JWT_SECRET`, `MONGO_URI`, `OPENROUTER_API_KEY` |

### Security Key Files

| File | Security Role |
|---|---|
| `middleware/auth.js` | JWT verification (access token) |
| `middleware/adminAuth.js` | Admin role + granular permission checks |
| `middleware/deviceAuth.js` | UUID v4 device ID validation |
| `middleware/lawyerAuth.js` | Lawyer role gate for CourtDesk |
| `middleware/optionalAuth.js` | Optional auth (anonymous-friendly) |
| `middleware/rateLimit.js` | IP rate limiting (custom, no deps) |
| `config/corsOptions.js` | Hardened CORS with loopback allowance |
| `admin/audit/auditService.js` | Audit logging + sensitive field redaction |
| `admin/services/crudEngine.js` | Field allowlist, NoSQL injection prevention, optimistic concurrency |
| `services/caseService.js` | P0 isolation: device-first authorization logic |

---

## 12. Testing Strategy

### Automated Test Suites (5 commands + 2 unit test files)

| Command | Checks | What it Tests |
|---|---|---|
| `npm test` | 36 | RBAC permission registry, audit sanitizer, permission model resolution, CMS module authorization, structured field validation, legacy permission mapping |
| `npm run test:smoke` | 16 | Live CMS smoke test (auth, CRUD, publish, public API, audit, allowlist) |
| `npm run test:cases` | 22 | Anonymous case CRUD, device isolation, filters, ANON-* case number, duplicate 409, delete + 404 |
| `npm run test:cases:auth` | — | Authenticated case CRUD, JWT scoping, ownership, cross-user isolation |
| `npx tsc --noEmit` | — | TypeScript compilation (zero errors) |

### Test Files (2 unit test files)

| File | Tests | Focus |
|---|---|---|
| `tests/rbac.test.js` | 24+ | Permission registry, role templates, CMS module authorization, structured field validation, legacy permission mapping |
| `tests/lawyer-security.test.js` | 12+ | Self-service role resolution, isLawyer gate, device-first P0 isolation, case view/edit/delete authorization |

### Additional Test Scripts (6)

| Script | Purpose |
|---|---|
| `scripts/smoke-cases-anonymous.js` | Anonymous case management contract |
| `scripts/smoke-cases-authenticated.js` | Authenticated case management contract |
| `scripts/smoke-cases-blank-case-number-regression.js` | Blank case number regression test |
| `scripts/smoke-cases-stale-token-isolation.js` | Stale token isolation test |
| `scripts/cleanup-smoke-cases.js` | Test data cleanup |
| `scripts/smoke-cms-local.js` | Live CMS smoke test |
| `scripts/smoke-lawyer-security.js` | Lawyer security test |

### CI/CD Pipeline

**File:** `.github/workflows/ci.yml`

The GitHub Actions workflow runs on every push and pull request with the following steps:

1. **Setup:** Ubuntu runner, Node.js 20 with npm caching
2. **Backend unit tests:** `npm test` (36 RBAC + security checks)
3. **Boot backend:** Starts server against MongoDB 7 service container
4. **Seed CI super admin:** Creates disposable test admin
5. **CMS smoke test:** `npm run test:smoke` (16 checks)
6. **Anonymous cases:** `npm run test:cases` (22 checks)
7. **Authenticated cases:** `npm run test:cases:auth`
8. **Mobile TypeScript:** `npx tsc --noEmit` (zero errors)
9. **Mobile ESLint:** `npx eslint src` (0 errors, warnings allowed)

---

## 13. Data Seeding & Migration

### Seed Scripts (5)

| Script | Purpose |
|---|---|
| `seed.js` | Main seed script (general data) |
| `seed-judge-directory.js` | Delhi court judge data |
| `seed-district-court-judges.js` | District court judges (comprehensive) |
| `seed-police-stations.js` | Delhi police stations (179 entries) |
| `seed-tribunals.js` | Tribunal directory (179+ entries) |

### Import Scripts (2)

| Script | Purpose |
|---|---|
| `import-central-bare-acts.js` | Import central bare acts dataset |
| `insert-quasi-judicial.js` | Quasi-judicial bodies data |

### Additional Scripts (11 in `scripts/`)

| Script | Purpose |
|---|---|
| `scripts/migrate-static-content.js` | Static content migration (with `--dry-run`) |
| `scripts/create-super-admin.js` | Super admin user creation |
| `scripts/smoke-cases-anonymous.js` | Anonymous case smoke test |
| `scripts/smoke-cases-authenticated.js` | Authenticated case smoke test |
| `scripts/smoke-cases-blank-case-number-regression.js` | Blank case number regression |
| `scripts/smoke-cases-stale-token-isolation.js` | Stale token isolation |
| `scripts/cleanup-smoke-cases.js` | Test data cleanup |
| `scripts/smoke-cms-local.js` | CMS smoke test |
| `scripts/smoke-lawyer-security.js` | Lawyer security test |
| `scripts/e2e-cms-tribunal.js` | E2E CMS tribunal test |
| `scripts/repro-cms-tribunal.js` | CMS tribunal repro test |

---

## 14. Environment Configuration

### Required Backend Environment Variables

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `OPENROUTER_API_KEY` | AI service API key |

### Optional Backend Configuration

| Variable | Purpose | Default |
|---|---|---|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5000 |
| `CORS_ORIGIN` | Allowed origins (comma-separated) | loopback only |
| `OPENROUTER_MODEL` | AI model selection | `deepseek/deepseek-chat` |
| `OPENROUTER_TIMEOUT_MS` | AI request timeout | 15000 |
| `JWT_ACCESS_TTL` | Access token TTL | 15m |
| `JWT_REFRESH_TTL` | Refresh token TTL | 30d |
| `AI_RATE_LIMIT_MAX` | AI rate limit | 60 |
| `AUTH_RATE_LIMIT_MAX` | Auth rate limit | 10 |
| `JIE_JOB_INTERVAL_MS` | Judicial intelligence cron interval | 86400000 (24h) |
| `ANDROID_SHA256_FINGERPRINT` | Android App Links fingerprint | — |

### Frontend Environment Variables

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_URL` | Backend API URL for mobile app |

> **Production Note:** In production builds, `EXPO_PUBLIC_API_URL` MUST be set via EAS build environment variables to a valid HTTPS endpoint (never localhost/127.0.0.1).

---

## 15. Deployment & Infrastructure

### Backend

| Aspect | Detail |
|---|---|
| Runtime | Node.js |
| Database | MongoDB Atlas (cloud) |
| Deployment target | Railway (or similar PaaS) |
| Health checks | `/health` (liveness) + `/health/ready` (readiness, checks DB) |
| Graceful shutdown | SIGTERM/SIGINT with 30s drain timeout |
| Connection pooling | Min 5, Max 50 MongoDB connections |
| Auto-index | Disabled in production |
| Retry logic | Bounded retries (5 attempts, 3s delay) for MongoDB connection |
| Socket timeout | 30s, keep-alive 65s |

### Frontend (Mobile)

| Aspect | Detail |
|---|---|
| Build system | EAS Build (Expo Application Services) |
| Platforms | iOS, Android, Web |
| Package name | `com.lawyer2lawyer.mobile` |
| Android App Links | Digital Asset Links via backend `.well-known/assetlinks.json` |
| Build profiles | development, preview, production (see `eas.json`) |
| Typed routes | Enabled via `app.json` experiments |
| React Compiler | Enabled via `app.json` experiments |

---

## 16. Key Design Decisions

### Dual Case Ownership (P0 Isolation)
Cases work both anonymously (device-scoped via `deviceId`) and for authenticated users (JWT-scoped via `createdBy`/`assignedTo`). This lets users try the app before creating an account. The `X-Device-Id` (UUID v4 validated) is ALWAYS canonical for anonymous cases — a stale JWT token cannot widen device scope.

### OpenRouter as AI Proxy
Instead of directly calling OpenAI, the backend uses OpenRouter which provides access to multiple LLMs (GPT-5, DeepSeek, Gemini, Mistral) with automatic fallback chain. This provides model redundancy without multiple provider integrations.

### File-Based Routing (Expo Router)
All mobile screens are files in `src/app/` — the URL structure maps directly to file paths. Type-safe routing is enabled via `app.json` experiments.

### Mongoose 9 Compatibility
The codebase uses promise-based middleware (no `next()` callback) and modern Mongoose patterns. Example: `caseSchema.pre("save", async function () {})` instead of the deprecated `next`-based middleware.

### Admin Subsystem Isolation
The admin system has its own directory (`admin/`) with separate permissions, audit, controllers, and services — keeping it architecturally clean and independently evolvable.

### Registry-Driven CMS
The `contentRegistry.js` serves as a server-side allowlist for all admin-manageable collections. New modules become admin-manageable ONLY by adding an explicit entry with `allowedFields`, `permissionKey`, and workflow declarations. No generic "edit any collection" endpoint exists.

### Data Provenance
Tribunal, police station, and bare act records carry source/verification metadata — tracking where the data came from, when it was last verified, and verification status.

### No Fabricated Data Policy
The system never serves placeholder/fake data. The Android App Links endpoint returns 404 rather than a fake fingerprint. The `Booking` model and `bookings.js` route exist as explicit stubs.

### Custom Rate Limiter
A custom, dependency-free IP-based rate limiter was chosen over `express-rate-limit` to avoid adding dependencies. Supports two pre-configured limiters (AI: 60/min, auth: 10/min) with automatic cleanup.

### Permission Security Model
The RBAC system uses an explicit-grant model where permissions are only granted when explicitly `true`. Missing/undefined permissions are always denied. New permissions are opt-in by default.

### CourtDesk Identity Precedence
The CourtDesk surface uses JWT-only authentication (no `deviceAuth` mounted). This ensures a lawyer's private data is never scoped to a wrong device — identity precedence is strictly JWT > device header.

---

## 17. Current Project Status

### What's Working

- ✅ Full backend API running on port 5000
- ✅ Mobile/web app running via Expo SDK 56
- ✅ JWT authentication with refresh token rotation
- ✅ Case management (anonymous + authenticated, P0 isolation)
- ✅ Bare acts library with favourites & recently opened
- ✅ Tribunal directory (179+ entries)
- ✅ Police station directory (179 stations)
- ✅ Delhi district courts & judge directory
- ✅ Supreme Court data & VC links
- ✅ AI assistant with 9 specialized features
- ✅ Admin CMS with registry-driven CRUD
- ✅ Dashboard with 14+ widget components
- ✅ Notification system (in-app + briefing)
- ✅ Audit logging with sensitive field redaction
- ✅ Criminal law reference (BNS/BNSS/BSA)
- ✅ Draft library
- ✅ Knowledge hub
- ✅ CourtDesk lawyer surface (Phase 1)
- ✅ Design system (dark/light themes, 18 UI components)
- ✅ CI/CD pipeline with automated tests
- ✅ TypeScript compilation: zero errors
- ✅ Secure-by-default RBAC permission system

### Phases/Modules In Progress

| Phase | Status | Description |
|---|---|---|
| Phase 8 | In Progress | Revenue Court module |
| Phase 9 | In Progress | Tax & Corporate module |
| Booking | Stub | Model + route stub exist; feature not yet built |
| Push Notifications | Infrastructure Ready | expo-notifications installed; delivery not wired |
| Judicial Intelligence Engine | In Progress | Cron job running (daily); ingestion pipeline placeholder |

---

## 18. Codebase Metrics

| Metric | Count |
|---|---|
| Backend model files | 28 |
| Backend route files | 27 (26 functional + 1 stub) |
| Backend controller files | 14 |
| Backend service files | 6 |
| Backend middleware files | 6 |
| Backend admin subsystem files | 7 |
| Backend scripts | 11 |
| Backend test files | 2 |
| Backend test scripts | 7 |
| Backend seed scripts | 5 |
| Mobile route files (src/app/) | 74 |
| Mobile component files | 172+ |
| Mobile service files | 15 |
| Mobile admin panel screens | 12 |
| Mobile AI feature screens | 9 |
| Mobile dashboard sub-components | 21 |
| Mobile UI design components | 18 |
| Mobile custom hooks | 5 |
| Mobile utility files | 5 |
| Mobile type definition files | 2 |
| Total backend entry (index.js) | 466 lines |
| Total AI service (aiService.js) | 581 lines |
| Total auth service (authService.js) | 403 lines |
| Total admin routes (admin.js) | 452 lines |
| Total mobile source files | 231 (172 .tsx + 48 .ts + 11 .js) |

---

*Report generated: September 2026*
*Last verified against commit on `master` branch*