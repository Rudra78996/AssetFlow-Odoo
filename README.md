# AssetFlow Backend

**🚀 Live Application:** [https://asset-flow-odoo-rho.vercel.app](https://asset-flow-odoo-rho.vercel.app)

Production-grade REST backend for **AssetFlow**, an enterprise asset/resource
management system. Built with **Next.js 14 (App Router, Node runtime) + MongoDB +
Prisma + TypeScript (strict) + Zod**, JWT cookie auth, layered architecture, and a
consistent response envelope. The existing Next.js + Tailwind frontend can consume
this API by swapping its mock-data imports for `fetch` calls.

---

## What is AssetFlow? (How the Application Works)

AssetFlow is a centralized system for tracking the lifecycle, assignment, and health of company assets. It ensures that every piece of equipment is accounted for, maintained, and properly distributed.

### Core Workflows

1. **Asset Registry**: The core directory of all company physical items (laptops, monitors, vehicles). Each asset has a unique tag (`AF-0001`), a status (`AVAILABLE`, `IN_USE`, `MAINTENANCE`, `RETIRED`), and belongs to a specific Category and Department.
2. **Allocations (Long-term)**: When an employee needs an asset for everyday work (e.g., a laptop), an **Allocation** is created. 
   - Approving an allocation automatically updates the asset's status to `IN_USE`. 
   - Returning the asset sets it back to `AVAILABLE`.
   - A background worker (`worker:overdue`) constantly monitors expected return dates and flags overdue items.
3. **Bookings (Short-term)**: For shared resources (like a projector or a company car), employees create **Bookings** for specific dates. The system strictly prevents double-booking through server-side overlap checks.
4. **Maintenance**: If an asset breaks, a **Maintenance Request** is opened. 
   - This transitions the asset to `MAINTENANCE` status, preventing it from being allocated or booked. 
   - Once the repair is resolved, the asset is returned to the available pool.
5. **Audits**: Managers can open **Audit Cycles** to verify the physical presence and condition of assets in their department. 
   - Employees or managers scan/verify the assets.
   - If an asset is marked as missing or damaged during an audit, it automatically creates a **Discrepancy** record for investigation.

This system guarantees that the **Asset Status** is always a single source of truth, automatically kept in sync by Transactions when Allocations or Maintenance requests are updated.

---

## Architecture

Layered — thin route handlers, business logic in services, all Prisma calls isolated
in repositories.

```
Request
  │
  ▼
src/app/api/**/route.ts        ← parse → call service → shape response (no logic)
  │  (wrapped by defineRoute)
  ▼
src/middleware/                ← rate-limit → auth/RBAC → zod validation → errorHandler
  │
  ▼
src/modules/<domain>/
  *.schema.ts   (Zod: the ONLY place input is validated)
  *.service.ts  (business rules; calls logActivity/notify; NO Prisma import)
  *.repository.ts (the ONLY place Prisma is imported)
  │
  ▼
src/lib/  prisma · jwt · hash · errors · apiResponse · pagination · rateLimit · cache · tx
  │
  ▼
MongoDB (replica set — required for Prisma transactions)
```

**Hard rules enforced across the codebase**
- No Prisma import outside a `*.repository.ts`.
- No business logic inside a route handler.
- Every request/query/body validated by Zod at the edge; services never re-validate.
- Every endpoint returns the same envelope:
  ```jsonc
  // success
  { "success": true, "data": <T>, "meta"?: { "page", "limit", "total", "totalPages" } }
  // error
  { "success": false, "error": { "code": "STRING", "message": "…", "details"?: <unknown> } }
  ```
- Status codes: 400 validation · 401 unauthenticated · 403 forbidden · 404 not found ·
  409 conflict · 429 rate-limited · 500 unhandled.

---

## Quick start

Prerequisites: Node 20+, Docker (for Mongo).

```bash
# 1. Env
cp .env.example .env            # secrets are dev-safe defaults; change for prod

# 2. One-command Mongo replica set + app
docker compose up --build       # app on http://localhost:3000

# --- or run the app locally against Dockerized Mongo ---
docker compose up -d mongo
npm install
npx prisma generate
npx prisma db push              # sync schema to Mongo (no SQL migrations on Mongo)
npm run seed                    # populate data mirroring the frontend mock data
npm run dev
```

- API docs (Swagger UI): **http://localhost:3000/api/docs**
- OpenAPI JSON: **/api/openapi** · spec source: [`openapi.yaml`](./openapi.yaml)
- Postman collection: [`docs/assetflow.postman_collection.json`](./docs/assetflow.postman_collection.json)
- Overdue worker (flips past-due allocations → OVERDUE + notifies): `npm run worker:overdue`
  (or POST `/api/cron/overdue` with header `x-cron-secret: $CRON_SECRET` from a platform Cron).

**Seeded admin:** `alex.rivera@assetflow.com` / `Password123` (all seeded users share that password).

### Scripts
| script | purpose |
|---|---|
| `npm run dev` / `build` / `start` | Next.js dev / prod build (`build` runs `prisma generate`) |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run seed` | idempotent seed mirroring `src/lib/mockData.ts` |
| `npm run test` / `test:coverage` | Vitest unit + integration |
| `npm run worker:overdue` | node-cron overdue sweep |

---

## Auth & RBAC

- Access token (~15m) + rotating refresh token (~7d), both **httpOnly, sameSite, secure**
  cookies — **never returned in the JSON body** (XSS-resistant). The refresh cookie is
  scoped to `/api/auth`.
- Refresh **rotation with reuse detection**: only the token hash is stored; a presented
  refresh token that no longer matches the stored hash means it was already rotated (i.e.
  stolen + replayed) → the whole session is revoked.
- `/api/auth/*` is rate-limited (5 req/min/IP) to blunt credential stuffing.
- Roles enforced in one place (`withAuth`/`defineRoute({ auth: [...] })`), never ad hoc:

| Action | Employee | Manager | Admin |
|---|:---:|:---:|:---:|
| View assets/bookings/allocations | ✅ | ✅ | ✅ |
| Create booking / maintenance request | ✅ | ✅ | ✅ |
| Register/edit/delete asset | ❌ | ✅ | ✅ |
| Approve allocation / maintenance | ❌ | ✅ | ✅ |
| Manage depts/categories/employees, promote | ❌ | ❌ | ✅ |
| Create/close audit cycle | ❌ | ✅ | ✅ |
| View activity log | ❌ | ✅ (own dept) | ✅ (all) |

---

## Extending the Application (How to Add Code Safely)

If you need to add new features, endpoints, or business logic without "hammering" or breaking the existing codebase, strictly follow the layered architecture. **Do not add logic directly into route handlers.** 

Follow these steps to safely add new code:

**1. Define or update your Data Schema (`src/modules/<domain>/*.schema.ts`)**
- Use **Zod** to define the exact shape of expected inputs (body, query, params).
- This is the *only* place where request validation should happen.

**2. Update the Repository (`src/modules/<domain>/*.repository.ts`)**
- This is the **only** layer allowed to import and interact with Prisma (`src/lib/prisma`).
- Create a new method here if you need a new database query (e.g., `findCustomAssets`, `updateSomething`).
- Return raw data or mapped data from the database. **No business logic or error throwing here.**

**3. Implement Business Logic in the Service (`src/modules/<domain>/*.service.ts`)**
- Call the repository methods from here.
- Add your core business rules, calculations, and side-effects (like calling `logActivity` or `notifyUser`).
- Throw `AppError` (from `src/lib/errors`) if business rules are violated (e.g., `throw new AppError('Asset already assigned', 'CONFLICT', 409)`).

**4. Expose the Route Handler (`src/app/api/<domain>/route.ts`)**
- Wrap your Next.js route with `defineRoute` (from `src/lib/apiResponse.ts` or `src/middleware/compose.ts`).
- Route handlers should be extremely thin: 
  1. Call Zod to parse the request.
  2. Pass the parsed data to the Service.
  3. Return the result.
- **Never write Prisma queries or business `if/else` logic in the route handler.**

### Golden Rules to Avoid Breaking Things:
- **Don't bypass Zod:** If you add a new API parameter, ensure it's validated.
- **Don't skip the Service layer:** Even for simple fetches, go through the service. This ensures that if we add caching or logging later, it's centralized.
- **Transactions:** If your new code needs to update multiple tables at once, use Prisma transactions inside the repository layer (or use the `withTxRetry` wrapper if it's highly concurrent).
- **Responses:** Never use `NextResponse.json(...)` directly. The `defineRoute` wrapper will automatically format your return value into the `{ success: true, data: ... }` envelope and handle thrown errors.

---

## Design Decisions

**1. History is derived, never embedded.** The frontend mock embeds
`Asset.allocationHistory` and `Asset.maintenanceHistory`. Storing those as truth invites
drift. Instead they are **computed from the `Allocation` and `MaintenanceRequest`
collections** (asset detail endpoint derives them on read). `AuditDiscrepancy` is likewise
a **computed view** over `AuditAsset` rows with status `MISSING`/`DAMAGED` — no separate
collection. Same for `Department.staffCount` and all `AuditCycle` stats (progress,
verifiedCount, discrepancyCount, complianceGauge): computed via aggregation, never stored.
Consistent by construction.

**2. Race-safe tag generation.** The frontend's client-side `generateAssetTag` scans
existing tags — under concurrent registrations that yields duplicate tags. Replaced with
an atomic Mongo counter (`Counter { _id: "asset_tag", seq }`) incremented via
`findAndModify` + `$inc` (`assetRepository.nextTagSeq`). Two simultaneous registrations
always get distinct, monotonic tags (`AF-0001`, `AF-0002`, …).

**3. Transactions for coupled writes.** Approving/returning an allocation flips both the
allocation status **and** the asset status; approving/resolving maintenance flips the
request **and** the asset. These run in Prisma `$transaction`s so both succeed or neither
does. On Mongo this **requires a replica set** — hence the docker-compose single-node
replica set even in dev.

**4. Write-conflict retries.** Concurrent Mongo transactions touching the same document
abort one side; Prisma surfaces this as `P2034`. The highest-contention write paths
(allocation create/approve/return, booking create) are wrapped in `withTxRetry` — a few
attempts with jittered backoff.

**5. Idempotent state transitions.** `approve`, `return`, `resolve`, `close`, `promote`,
`markRead` are safe to call repeatedly: if already in the target state they no-op and don't
double-log. Maintenance uses an **explicit allowed-transitions map** (`OPEN → APPROVED →
TECHNICIAN_ASSIGNED → IN_PROGRESS → RESOLVED`), so illegal jumps (e.g. `OPEN → RESOLVED`)
are rejected with 409 by construction rather than scattered `if`s.

**6. Server-side conflict checks are authoritative.** Allocation "asset already in use"
and booking overlap (`start < existingEnd && end > existingStart`) are enforced on the
server and return 409 with the conflicting record — the client is never trusted to have
checked. Booking status (`UPCOMING/ONGOING/COMPLETED`) is **computed on read** from
wall-clock time — cheaper than a cron and always correct.

**7. Aggregation-driven analytics.** Dashboard/reports use Prisma `groupBy`/`aggregate`
(and `$runCommandRaw` where needed) — never pull rows into Node to reduce in memory —
behind a short (~45s) TTL cache since dashboards are read-heavy.

**8. bcryptjs (cost 12).** Pure-JS bcrypt chosen over native `bcrypt`/`argon2` so the repo
installs and runs identically across dev, CI, and Docker with zero native-build friction.
Cost factor 12 per the security bar.

**9. Soft delete for assets.** Assets are never hard-deleted (that would orphan
allocation/maintenance/audit history). `deletedAt` is set and soft-deleted rows are
excluded from default queries.

**10. Category reconciliation.** The frontend has two "category" notions — the Asset
Directory's simple string (`"Computing"`) and Org Setup's rich named categories with custom
fields. Both are served from a single `AssetCategory` collection; the seed creates the rich
categories **and** the simple kinds so both views render from one source.

**11. Signup name.** The frontend collects first + last name. Signup accepts either a
single `name` or `firstName`/`lastName` (concatenated). New users default to `EMPLOYEE`.

### Security
Zod at the edge rejects non-scalar values where scalars are expected (neutralizing Mongo
operator injection like `{ "$gt": "" }`). CORS origin, cookie domain, and secrets come from
env only and are redacted from logs (`pino` redaction). Every request gets an `x-request-id`
correlated across all log lines; stack traces are never leaked in production responses.

### Indexes
All indexes implied by the schema are declared (asset `status`/`category`/`deletedAt`,
allocation `[assetId, requestedAt]`/`status`/`recipientId`, booking `[assetId, date]`,
maintenance `status`/`priority`, auditAsset `[auditCycleId, status]`, activity `createdAt`
etc.). Unique fields (`email`, `tag`, `serialNumber`, category/department `name`) carry their
own unique index. Verify the heaviest queries (asset search, booking overlap, dashboard
aggregates) with `.explain()` against a seeded DB.

### Known gaps / v2
- Per-asset MTTR/uptime (needs modeled downtime windows) — reports expose utilization,
  idle count, operational cost, and department allocation today.
- Rate limiter and caches are in-process (fine single-node); swap to Redis for multi-instance.
- Integration tests assume a Mongo replica set (real or `mongodb-memory-server` configured
  as a replica set); unit tests run with mocked repositories and need no DB.

---

## Testing

```bash
npm run test            # unit (mocked repos) — no DB needed
npm run test:coverage
```

Unit tests cover the core business rules: allocation conflict detection, booking overlap
math, the maintenance status-transition guard, audit compliance calculation, and the
race-safe tag counter logic. CI (`.github/workflows/ci.yml`) runs install → prisma generate
→ lint → typecheck → test on every PR.

## Project layout
```
src/app/api/**/route.ts   route handlers (defineRoute-wrapped)
src/middleware/           withAuth · withValidation · errorHandler · compose
src/modules/<domain>/     schema · service · repository (13 domains)
src/lib/                  prisma · jwt · hash · logger · errors · apiResponse · pagination · rateLimit · cache · tx · cookies · time · config
prisma/                   schema.prisma · seed.ts
tests/                    vitest unit tests
docs/                     Postman collection
openapi.yaml              OpenAPI 3.1 (served at /api/docs)
docker-compose.yml        Mongo single-node replica set + app
```
