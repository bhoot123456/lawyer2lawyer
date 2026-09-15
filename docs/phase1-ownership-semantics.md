# Case Ownership & Authorization Semantics (Phase 0 baseline → Phase 1)

Applies to `app/backend/services/caseService.js` and
`app/backend/controllers/caseController.js`, and the new Phase 1 surfaces
(`app/backend/routes/courtdesk.js` + `app/backend/middleware/lawyerAuth.js`).

## 1. The three ownership fields on `Case`

| Field       | Meaning                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------- |
| `createdBy` | `User._id` of the account that created the case. Set by the create flow from `req.user`. Denormalized, not authoritative for the public module. |
| `assignedTo`| `User._id` of the lawyer the case is assigned to. **The authoritative scope for the lawyer workflow.** Admin tooling sets this. The public `/cases` update path strips it (`delete update.assignedTo`) so a client can never reassign a case. |
| `deviceId`  | UUID that owns the case in the **public, no-login module**. `X-Device-Id` header validated by `deviceAuth` middleware; whatever mobile install created the case owns it. |

## 2. Identity precedence (the P0 isolation rule)

The public `/api/cases` module is device-first:

1. When a **validated `X-Device-Id`** is present, it is the **canonical**
   identity (`deviceId` field on the doc). Any JWT that may *also* be
   attached (e.g. a stale admin token left in AsyncStorage) **never widens**
   the scope.
2. When no device header is present (legacy / white-label clients), the
   **JWT** is used: `admin` sees all; `lawyer` sees only
   `assignedTo === user._id`; `client`/unknown sees only
   `createdBy === user._id`.
3. No identity at all → deny.

`getCaseById`, `getAllCases` (list filter via `buildCaseQueryFilters`),
and the edit guard `canEditCase` all follow this. Phase 1 extracted the
pure `canViewCase`/`canEditCase` helpers (exported, unit-tested in
`tests/lawyer-security.test.js`) so the read rule and the edit rule each
have one authoritative implementation instead of duplicated inline blocks.

## 3. Phase 1 — lawyer surfaces (`/api/courtdesk`)

- Mounted WITHOUT `deviceAuth`: a lawyer's private data is JWT-only.
  The mobile interceptor's `X-Device-Id` is sent but **ignored** on this
  surface, preventing device cross-talk from ever leaking a lawyer's list.
- `lawyerAuth` (new middleware) reuses the same `JWT_SECRET`/payload shape
  as `auth.js` and adds a role gate (`role === 'lawyer'`, active, not
  suspended). 401 = no/invalid token; 403 = wrong role.
- `/courtdesk/cases` → `getAllCases({ query, user })` → lawyer sees only
  cases where `assignedTo === lawyerId` (enforced in
  `buildCaseQueryFilters`).
- `GET /courtdesk/cases/:id` → `getCaseById` `canViewCase`; a lawyer asking
  for another lawyer's case gets a **404 (not 403)** so records cannot be
  enumerated by id.

## 4. Ownership fix included in Phase 1

`POST /cases/:id/timeline` previously let ANY authenticated user append to
ANY case. `addTimeline` now enforces `canEditCase` (admin or assigned
lawyer) and the route passes `req.user` through. Unit-tested via
`canEditCase` in `tests/lawyer-security.test.js`.

## 5. Tests

- `backend/tests/lawyer-security.test.js` — no-DB unit checks for
  `resolveSelfServiceRole`, `isLawyer`, `canViewCase`, `canEditCase`.
- `backend/scripts/smoke-lawyer-security.js` — end-to-end against a
  running server: role escalation rejection, courtdesk authz matrix,
  lawyer A/B isolation, no case enumeration.