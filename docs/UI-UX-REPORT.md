# Lawyer2Lawyer — Full App UI/UX Report

> **Purpose:** A complete, component-by-component map of the mobile app's UI/UX
> so you can hand this to Claude (or any model) to plan further changes and
> improvements. It documents *what exists*, *how it's built*, *which design
> tokens it uses*, and *known inconsistencies/gaps*.
>
> **Scope analyzed:** `app/mobile/src` — Expo (SDK 56) + React Native 0.85 +
> React 19 + TypeScript + `expo-router` (file-based routes). Cross-platform
> (iOS / Android / Web).

---

## 1. TL;DR — What this app is

A **premium legal-tech portal for Indian advocates** ("Lawyer2Lawyer") with
three primary role surfaces:

- **Public** — Home, Explore (lawyer search), Bare Acts, Courts (Supreme
  Court, Delhi Courts, District Courts, VC links, Registrars), Criminal Law,
  Tribunals, Revenue Court, Tax & Corporate, Knowledge Hub, Draft Library,
  Misc. Forms, Professionals, booking, privacy/terms.
- **Lawyer / CourtDesk (Phase 1)** — Dashboard, Cases, Court Diary, AI tools.
- **Admin Panel** — Full CMS (users, lawyers, clients, cases, articles, bare
  acts, judge directory, audit logs, reports, phase-8/9 content modules),
  protected by RBAC.

A **floating AI copilot chat** (`FloatingAIAgent`) overlays nearly every screen.

---

## 2. Tech Stack (UI-relevant)

| Concern | Choice |
|---|---|
| Framework | Expo SDK 56, `expo-router` (file-based routes) |
| Language | TypeScript (cross-platform), **some legacy `.js`** (`Sidebar.js`, `Navbar.js`, `LawyerCard.js`, `SearchLawyerScreen.js`, `HomeScreen.js`, `BookingScreen.js`, `LoginScreen.js`, `RegisterScreen.js`, `SearchLawyerScreen.js`) |
| UI primitives | `@expo/vector-icons` (Ionicons), `@expo/ui`, `expo-image`, `@expo/glass-effect` |
| Theme | Custom design-system in `src/theme/designSystem.ts` + `ThemeProvider` (light/dark/system) |
| Animation | `react-native-reanimated`, `react-native-animatable`, `react-native-gesture-handler`, `Animated` tokens |
| Icons | `@expo/vector-icons` (Ionicons) — `home-outline`, `briefcase-outline`, etc. |
| Safe areas | `react-native-safe-area-context` |
| Storage | `@react-native-async-storage/async-storage` |
| HTTP | `axios` |

---

## 3. Design System (the "source of truth")

**Central file:** `src/theme/designSystem.ts`. This is where colors, radii,
spacing, typography, shadows, and font families are defined. It is the
intended single source of truth, but **many screens bypass it with hard-coded
hex values** (see §8 — Consistency Issues).

### 3.1 Color palette — "Premium navy + legal gold"

**Dark mode (default, `colors = darkColors`):**

- **Backgrounds:** `bg.primary #0F172A` (navy), `surface #162033`,
  `elevated #1B2638`, `overlay #22304A`
- **Borders:** subtle/default/strong slate-alpha; `gold`, `goldLight`
- **Text:** primary `#F8FAFC`, secondary `#94A3B8`, muted `#64748B`
- **Accent:** `gold #D4AF37`, `goldDark #B8942A`, gold tints
- **Semantic:** success `#22C55E`, warning `#EAB308`, danger `#EF4444`,
  info `#60A5FA` (+ subtle variants)

**Light mode** (`lightColors`) mirrors the same structure with white surfaces.

> **Theme source-of-confusion:** there are **two overlapping systems** —
> `constants/theme.ts` (Expo starter `Colors`/`Fonts`/`Spacing`) and the newer
> `theme/designSystem.ts` + `theme/appTheme.ts` + `ThemeProvider.tsx`.
> `constants/ui.ts` mixes both (`surface: "#161616"` hard-coded vs
> `colors.accent.gold`). Models/Claude should prefer the
> `theme/designSystem.ts` tokens.

### 3.2 Radii
`xs 6 · sm 8 · md 12 · lg 16 · xl 24 · 2xl 32 · full 9999`

### 3.3 Spacing scale
`xs 4 · sm 8 · md 16 · lg 24 · xl 32 · 2xl 48`

### 3.4 Typography

| Token | size / weight / tracking |
|---|---|
| display | 32 / 800 / -0.5 |
| h1 | 24 / 800 / -0.3 |
| h2 | 20 / 700 / -0.2 |
| h3 | 18 / 700 / -0.1 |
| h4 | 16 / 600 / 0 |
| body | 15 / 400 / 0 |
| bodySemibold | 15 / 600 / 0 |
| caption | 12 / 500 / 0.3 |
| overline | 10 / 700 / 0.8 |
| legal | 14 / 400 / 0.1 (line-height 24 — for statutes/acts) |
| button | 14 / 700 / 0.5 |

### 3.5 Shadows
`level0`–`level4` (elevations 0→12 with increasing opacity/radius). Cards use
`level1`–`level2`; modals/floating agents use `level3`–`level4`.

### 3.6 Fonts
Platform-selected: iOS `system-ui`, Android `Roboto`, Web `Inter,
system-ui,…` (loaded via Google Fonts `@import` in `global.css`); mono stack
for code/legal citations.

### 3.7 Theme switching
`ThemeProvider` (`src/theme/ThemeProvider.tsx`) exposes `useThemeContext()`,
`useThemeColors()`, `useThemeToggle()`. Default mode **dark**; persists choice
in AsyncStorage (key `@lawyer2lawyer/theme_mode`). Components that use
`useThemeColors()` adapt; components that hard-code hex **do not** (key
issue).

---
## 4. App Shell (global chrome around every screen)

### 4.1 Route layout — `src/app/_layout.tsx`
Wraps everything in `SafeAreaProvider > ThemeProvider(dark) > SidebarLayout`.
Inside: an `expo-router` **Stack** (`headerShown: false`), the **BottomTabs**,
the **FloatingAIAgent**, and an **AppErrorBoundary**. The outer shell is
hidden on admin, courtdesk, lawyer-login, and register routes.

### 4.2 Header + Sidebar (`SidebarLayout.tsx` + `Sidebar.js`)
- Top app bar shows a **hamburger (≡)** gold button and a contextual
  **title** that changes per route (e.g. "New Case", "Case Timeline",
  "Dashboard", "AI Legal Assistant"...). Gold bottom border, `level1` shadow.
- **Drawer sidebar** (260px, animated backdrop `rgba(0,0,0,0.45)`). Contains
  a gold **"Lawyer2Lawyer"** brand, a ScrollView of nav items, and a footer
  ("Professional Legal Portal · v1.0.0").
- Nav items are **role-aware**: `NAV_ITEMS_PUBLIC` for everyone; admin/lawyer
  items appended based on decoded JWT role from the token (base64-decode in
  the client).
- Each item: icon + label, active state = gold-subtle background + left gold
  **active indicator bar** (4px), hover state on web, gold close button.

### 4.3 Bottom navigation (`BottomTabs.tsx`) — the FAB design
- 4 tabs around a floating center **+"New Case" FAB**:
  - Home `/` (home icon) · Cases `/cases` (briefcase) · Legal
    `/knowledge-hub` (library) · Profile `/dashboard` (person)
- Active tab: gold icon + gold label on gold-subtle tile with gold border.
- **Center FAB**: gold circle (60px, 3px navy border), `+` icon, opens
  `/cases/new`. Hover variant on web.
- `pointerEvents:"box-none"` + blur-on-navigate (web correctness).
- (Note: `app-tabs.tsx` / `app-tabs.web.tsx` are **legacy Expo starter tabs**
  — Home/Explore — unused by the real shell; keep or delete.)
### 4.4 Floating AI Agent (`FloatingAIAgent.tsx`) — global copilot
- A **draggable sparkle bubble** (position persisted in AsyncStorage,
  default x16/y160), hides on `/login` & `/register`.
- Opens a **chat panel**: welcome message, message bubbles (assistant =
  dark w/ gold border; user = translucent white), timestamps,
  markdown-ish rendering with `monospace` gold code blocks, quick-action
  pills, a text input + gold send button, copy-to-clipboard, "new
  conversation", history access, and drag-to-move via gesture-handler +
  reanimated.
- Send is disabled on error/empty async-storage state; shows an inline
  error/loading row.
- Uses backendAI endpoints and passes **screen context** (current route) to
  the prompt.

### 4.5 AuthGate (`AuthGate.tsx`) — route-level guard
- Public routes render children immediately.
- `/admin/*` requires `role=admin`; `/courtdesk/*` requires `role=lawyer`
  (decoded from token). Redundant with backend but prevents UI data leaks.
- While checking shows "Checking access..."; on failure "Please login first"
  then `router.replace` to the relevant login.

### 4.6 Error boundary (`AppErrorBoundary.tsx`)
Catches render errors in the Stack and floating agent to avoid white-screen
crashes.

---

## 5. Shared UI Primitives (`src/components/ui/`)

Barrel: `src/components/ui/index.ts` re-exports everything as `@/components/ui`.

| Primitive | File | Description |
|---|---|---|
| **AppButton** | AppButton.tsx | Alias → PremiumButton |
| **AppCard** | AppCard.tsx | Alias → PremiumCard |
| **AppInput** | AppInput.tsx | Labeled input w/ variants `outlined`/`filled`, sizes `sm/md/lg`, leading/trailing icons, inline **error** & **hint**, password show/hide eye toggle, focus border→gold, disabled opacity |
| **CategoryChip** | CategoryChip.tsx | Selectable chip (gold when active) |
| **ConfirmDialog** | ConfirmDialog.tsx | Cross-platform Modal (RN `Alert.alert` is a no-op on web). promise-based `useConfirmDialog()` → `confirm()` / `notice()`; danger/gold accent; used for delete+notice flows app-wide |
| **EmptyState** | EmptyState.tsx | Centered icon tile + title/subtitle + optional secondary button |
| **ErrorState** | ErrorState.tsx | Alert icon, title "Something went wrong", message, retry button |
| **GlassCard** | GlassCard.tsx | Layered card: elevated bg, gold border, accent glow rim, 1.5px gold bottom edge; optional press with hover/scale; elevation 0–4 |
| **HomeCard** | HomeCard.tsx | Icon-tile grid card for Home (48px gold icon tile, centered title/subtitle) |
| **KeyboardAwareView** | KeyboardAwareView.tsx | Keyboard avoid + inputs handler wrapper |
| **MetadataRow** | MetadataRow.tsx | label / value row w/ icon, gold icon tile, right-aligned value |
| **PremiumButton** | PremiumButton.tsx | The primary button. variants `primary`(gold)/`secondary`(surface)/`tertiary`(transparent)/`destructive`(red), sizes sm/md/lg, `loading` dot, `icon`, hover (web), press scale, disabled opacity |
| **PremiumCard** | PremiumCard.tsx | Elevated card w/ gold border + optional accent bottom edge + inner glow at elev≥3 |
| **SectionHeader** | SectionHeader.tsx | Title + subtitle + optional action + **count badge** (gold pill) |
| **SkeletonCard** | SkeletonCard.tsx | Loading placeholder card (avatar/header/body/actions shimmer lines) |
| **StatusBadge** | StatusBadge.tsx | Pill badge; variants success/warning/danger/info/gold/default; optional dot; sm/md |

### Supporting legacy/chrome UI
- `themed-text.tsx` / `themed-view.tsx` — Expo starter themed components
  (used by the unused `app-tabs`; low relevance).
- `external-link.tsx`, `web-badge.tsx`, `hint-row.tsx`, `collapsible.tsx`
  (in ui/), `animated-icon.tsx`/`.web.tsx` — small utility chrome.

---

## 6. Screens by Feature Area
### 6.1 Public — Home (`src/app/index.tsx`)
- **Animated marquee announcement** (auto-scrolling text, respects
  "reduce motion" via `AccessibilityInfo`).
- **Hero media** (200px image w/ dark overlay), centered **display-type
  title**, subtitle, coverage counter, and a **gold CTA**.
- **Responsive card grid** from `HOME_SECTIONS`: Research (Bare Acts,
  Criminal Law, Tribunals, Knowledge Hub), Courts (SC, Delhi Courts,
  District Courts), Practice (Draft Library, Misc. Forms), Intelligence
  (**AI Assistant** — accent/gold highlighted w/ subtitle).
- Cards are `HomeCard`s; whole page scrolls; bottom padding accounts for the
  tab bar.

### 6.2 Public — Explore (`/explore` → `screens/SearchLawyerScreen.js`)
> ⚠️ **Big theme inconsistency** — this screen uses a **light** palette
> (`#FAF9F6` bg, `#1E293B` text, white cards, dark button). Feels like a
> totally different app vs. the navy/gold dark shell.
- Title "Find lawyers", helper text, 3 free-text inputs (specialization,
  state, city), horizontal **state chips** + **city chips** (selected =
  gold), a dark Search button, results as `LawyerCard`s navigating to
  `/booking`.
- Legacy `.js` screen.

### 6.3 Public — Legal research / reference screens
These share a common pattern: **search bar + category chips + responsive card
grid + loading/error/empty states**, each with a domain-specific card:

| Screen file | Domain cards |
|---|---|
| `supreme-court.tsx` (+ `supreme-court-vc-links`) | `components/supreme-court/*` (Card, SearchBar, Filters, Empty/Error/Skeleton) |
| `delhi-courts.tsx`, `delhi-district-courts.tsx` (+ `[complexId]/[districtId]`, `judges-list`, `judges-on-leave`) | `components/judge/JudgeCard.tsx` |
| `bare-acts.tsx` | `components/acts/*` (ActCard, ActsSearchBar, CategoryChips), favs/recents |
| `criminal-law.tsx` | criminal-law category tiles |
| `tribunals.tsx` | `components/tribunals/*` (TribunalCard, FilterChips, SectionHeader, StatisticsHeader, SearchBar, Loading/Empty/Error) |
| `revenue-court.tsx`, `tax-corporate.tsx`, `knowledge-hub.tsx`, `draft-library.tsx` (+ `[key]` detail) | SectionCard-style content + detail screens |
| `misc-forms.tsx`, `professionals.tsx`, `court-diary.tsx`, `booking.tsx` | pragmatic single-purpose screens |

Reusable content pieces: `SectionCard.tsx`, `Navbar.js`, `hint-row.tsx`,
`components/legal/LegalDocumentScreen.tsx` (renders legal text with proper
typography).

### 6.4 Auth
- **Admin login (`/login`)** — `KeyboardAwareView`, centered gold
  "Lawyer2Lawyer" wordmark, **Admin Login** heading, `AppInput`
  email/password (mail & lock gold icons, show/hide eye), inline validation,
  `PremiumButton` loading "Signing in…", cross-platform notice dialogs →
  `/admin`. **Best-practice auth form.**
- **Lawyer login (`/lawyer-login`)** — mirrored admin-login pattern →
  `/courtdesk`.
- **Register (`/register`)** — ⚠️ **inconsistent**: raw `TextInput` +
  `Pressable` + `KeyboardAvoidingView` + hard-coded `#101D31` inputs instead
  of `AppInput`/`PremiumButton`. Fields: name, email, password, state, city,
  specialization; error text; gold submit; link to sign-in.
- Legacy `screens/LoginScreen.js`, `RegisterScreen.js`, `HomeScreen.js`,
  `BookingScreen.js` appear **unused** (pre-router leftovers; removal
  candidates).
### 6.5 Lawyer — Dashboard (`/dashboard`)
Priority-ordered stack of cards powered by `components/dashboard/*`:

1. **DashboardHeader** (GlassCard elev3) — live clock/date (updates every 1s),
   avatar (initials on gold + green online dot), "SENIOR ADVOCATE" /
   greeting, enrollment & court.
2. **NextHearingCard** — combined today+upcoming, highlighted next hearing.
3. **TodayHearings** — today's hearing list.
4. **DashboardStats** — 6 `StatItem`s (Today's Hearings, Active, Pending,
   Revenue Today ₹ INR, Client Meetings, Pending Drafts) as 2-col GlassCards.
5. **QuickActionsGrid** — 3-col grid of GlassCard tiles: New Case, AI
   Assistant, Court Diary, Draft Library, Bare Acts, Search.
6. **TodayTimeline** — a day timeline of hearings.
7. **UpcomingHearings · PendingDrafts · PendingClientCalls ·
   RecentNotifications · CourtHolidayCard · CauseListCard · AIInsightsCard ·
   LegalNewsCard · RecentActivityCard**.
- Loading = `DashboardLoadingState` (skeletons); error = `DashboardErrorState`;
  empty = `DashboardEmptyState`. Pull-to-refresh.

### 6.6 Lawyer — CourtDesk (`/courtdesk`)
- Role-guards via token; loader while booting; stat banner; case cards
  (case number, client, court · practice area, status & priority badges);
  empty state; footer note + logout. Uses its own navy palette (`#101D31`).
  Tagged "Phase 1 placeholder" — case detail/timeline/editing noted as future
  work. Some duplicated logic vs. the newer `/cases`.

### 6.7 Lawyer — Cases (`/cases` + sub-routes)
- **List (`cases.tsx`)** — search/filter bar (`CaseSearchFilters`), header
  w/ count + gold "Add case" + refresh, responsive list of case cards
  (title, gold status badge, meta, next-hearing row, item-scoped **delete**
  w/ per-item spinner + confirm dialog). Skeleton, empty, error states via
  `SkeletonCard`/`ErrorState`/`EmptyState` + status→badge mapping.
- **New (`cases/new.tsx`)** — `CaseForm(mode="create")`, submit spinner,
  "Back to list".
- **Detail (`cases/[id].tsx`)** + sub-tabs: **documents**, **expenses**,
  **notes**, **timeline**, **edit**.
- **CaseForm** (`components/cases/CaseForm.tsx`) — full create/edit form.
  **Enum-backed chip selectors** (Status, Current Stage, Priority) rather than
  free text (prevents backend 400s); labeled fields, gold labels, gold-border
  inputs, inline + boxed submit errors, "Saving…" disabled state.
  ⚠️ Raw `TextInput`+`Pressable` (not AppInput/PremiumButton) + hard-coded
  `#F8FAFC`/`#D4AF37` — inconsistent with design-system primitives.

### 6.8 Admin Panel (`/admin/*`)
- **Admin index (`admin/index.tsx`)** — `AdminHeader`, permission-aware CMS
  module grid grouped by category (legal_data, content, police, court_info,
  users), stat cards, Quick Actions (Lawyers/Clients/Cases/Articles),
  cases-by-status **bar chart** (pure Views), recent-activity feed.
  Hard-coded palette (`#F8FAFC`, `#94A3B8`, `#121212`).
- Shared admin components: `AdminHeader`, `StatCard`, `SearchBar`,
  `AdminStatusBadge`, `AdminConfirmDialog`.
- **Clients / Lawyers / Cases / Articles** list + `[id]` detail, `admin-users`,
  `bare-acts2`, `judge-directory`, `reports`, `audit-logs`,
  `revenue-court-phase8`, `tax-corporate-phase9`.
- **Generic CMS** (`admin/cms/[module].tsx` + `[id].tsx`) — data-driven CRUD
  from the backend module registry, RBAC-permission filtered.

### 6.9 AI Assistant module (`src/modules/aiAssistant/`)
- **AILegalAssistantScreen (`/ai-assistant`)** — header (gold sparkle), "AI
  Legal Assistant" title, "AI TOOLS" divider, a set of **FeatureCards**
  currently shown "Soon" (disabled, 50% opacity, "SOON" badges), a history
  row, and an AI disclaimer. Other entry screens: `/ai-draft-legal-notice`,
  `/ai-summarize-judgment`, `/ai-explain-bare-act`, `/ai-case-summary`,
  `/ai-find-lawyers`, `/ai-search-documents`, `/ai-legal-checklist`,
  `/ai-history`.
- **Components:** `AIButton`, `AIHeader`, `AIInput`, `AIResultCard`,
  `ActionButtons`, `FeatureCard`, `EmptyState`, `ErrorCard`, `LoadingCard`,
  `FloatingAIAgent`.
- **Providers:** `AIProvider.ts` (interface), `OpenAIProvider`,
  `MockAIProvider`, `UnavailableAIProvider`, `backendAI`. UX varies by
  provider availability (loading/error/empty handled).
- Uses its own **AI-themed constants** (`AI_GOLD`, `AI_BG`, `AI_CARD_BG`,
  `AI_TEXT_*`) — a parallel mini-palette slightly different from
  `designSystem`.
---

## 7. Design Patterns Observed (the "house style")

- **Dark navy + gold** is dominant; gold is reserved for primary actions,
  active states, and premium/feature highlights.
- **Cards everywhere** — `GlassCard`/`PremiumCard`/`HomeCard`/plain border
  cards; consistent `radii.lg`–`xl`, 1px borders, `level1`–`level2` shadows.
- **StatusBadge / count badge / chips** for meta and filters.
- **Consistent loading** (skeletons) / **empty** / **error** triads per
  feature (each domain re-implements small local variants).
- **web-aware** niceties: hover states, pointer cooling (`box-none`,
  `blurActiveElement`), `cursor:pointer`.
- **Custom web-safe dialogs** (`ConfirmDialog`/`useConfirmDialog`) because RN
  `Alert.alert` is a no-op on web — good cross-platform thinking.
- **Accessibility**: `accessibilityRole`, `accessibilityLabel/Hint/State`,
  reduce-motion support, semantic regrouped text (`accessible={false}`).

---

## 8. Consistency Issues & Red Flags (things for Claude to fix)

1. **Three parallel theme systems.** `constants/theme.ts` (starter `Colors`),
   `theme/designSystem.ts` (+`ThemeProvider`), and `constants/ui.ts` overlap.
   Many components import one while others import another. → Consolidate on
   `designSystem` + hooks.
2. **Hard-coded hex everywhere** — `#F8FAFC`, `#94A3B8`, `#101D31`,
   `#D4AF37`, `#121212`, `#1E293B`, `#FAF9F6`. These **break dark/light mode**
   because they don't use `useThemeColors()`. The ThemeProvider currently only
   affects components that opt in; most screens are effectively dark-only.
3. **Light-themed outlier screens** — `SearchLawyerScreen.js` (Explore) and
   `register.tsx` use light palettes that clash with the navy dark shell.
4. **Mixed primitive usage** — admin `login.tsx` and `cases/new.tsx` use
   `AppInput`/`PremiumButton`, while `register.tsx`, `CaseForm.tsx`, several
   admin views, and CourtDesk hand-roll `TextInput`/`Pressable` with custom
   style blocks → inconsistent inputs/buttons/radii.
5. **Duplicated domain scaffolding** — each domain re-implements its own
   search bar, chips, and loading/empty/error components instead of reusing
   the `ui/*` primitives (acts, supreme-court, tribunals bars are near-dupes).
6. **Legacy/unused files** — `app-tabs.tsx`, `app-tabs.web.tsx`,
   `screens/LoginScreen.js`, `RegisterScreen.js`, `HomeScreen.js`,
   `BookingScreen.js`, `screens/SearchLawyerScreen.js` arena (some still
   reachable e.g. Explore). Dead code adds confusion.
7. **Hard-coded "SENIOR ADVOCATE"** & court default in DashboardHeader — not
   driven by profile data (badge may be wrong for users).
8. **AI "Soon" cards** are present but non-functional; the working AI is only
   the floating chat. UX gap: feature discoverability vs. broken expectations.
9. **CourtDesk vs. Cases duplication** — two separate case-list experiences
   with different styling/behavior; likely should be unified.
10. **Nonstandard AI mini-palette** (`AI_*` constants) drifts from
    `designSystem`; low-severity but adds token debt.

---

## 9. Improvement Recommendations to give Claude

**Design-system consolidation (highest impact)**
- Make `designSystem.ts` + `ThemeProvider` the single source. Delete or
  deprecate `constants/theme.ts` and `constants/ui.ts`.
- Convert remaining hard-coded hex to tokens; adopt `useThemeColors()` so
  light/dark works everywhere. Add a light-mode visual QA pass.

**Reuse the primitives**
- Replace hand-rolled search bars/chips/loading/empty/error triads with the
  `ui/*` components across acts, courts, tribunals, supreme-court.
- Refactor `register.tsx`, `CaseForm.tsx`, CourtDesk, and admin views to use
  `AppInput`/`PremiumButton`/`StatusBadge`/`EmptyState`/`ErrorState`.

**Experience polish**
- Make quick actions / dashboard cards actually reflect profile data
  (remove "SENIOR ADVOCATE" hard-code).
- Unify CourtDesk into the `/cases` experience (or clearly mark one canonical).
- Either wire the AI feature cards to real providers or remove the "Soon"
  placeholders from primary nav.
- Add empty/landing guidance and onboarding/hints for new lawyers
  (`hint-row.tsx` is a start).

**Cleanup**
- Remove unreferenced legacy screens/tabs; run `npx tsc --noEmit` and
  `npx eslint src` (ESLint already 0 errors baseline).

**Testing**
- Add a light-mode smoke check and snapshot the known light-outlier screens
  (Explore, Register).

---

*Generated from `app/mobile/src` codebase analysis. Verify specifics against
the source before adopting — file paths and route names reference the actual
repo.*