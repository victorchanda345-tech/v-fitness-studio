# Architectural & Implementation Decisions

This document records key technical decisions made during the design and development of V Fitness Studio, the alternatives evaluated, why choices were made, and which decisions were subsequently revisited.

---

## Decision 1: Project Repository Structure (Reversed)

- **Context**: The starter codebase initially contained a single root `package.json` with dev tooling and Express dependencies merged together.
- **Options Considered**:
  1. Monorepo with unified root dependencies.
  2. Decoupled `client/` and `server/` subprojects with dedicated `package.json` and `tsconfig.json` configurations.
- **Decision**: Decoupled separate `server/` and `client/` directories.
- **Rejected**: Maintaining a single root `package.json`.
- **Rationale**: The frontend runs in a browser DOM environment (React, Vite, JSX) requiring modern ES module compilation and DOM types, whereas the backend runs in Node.js with Express and PostgreSQL. Combining them caused TypeScript compiler conflicts (e.g. `"jsx": "react-jsx"` vs Node commonjs/ES targets) and dependency bloat.
- **Decision Reversed**: We initially attempted to keep the single root setup to minimize directory nesting. However, when Vite's build tooling threw TypeScript path-resolution warnings against backend modules, we reversed this choice and cleanly separated the application into `server/` and `client/`.

---

## Decision 2: ORM & Database Access Layer (Drizzle ORM vs Prisma vs Raw SQL)

- **Context**: The application requires robust relational data modeling across 7 tables with strict foreign key constraints, cascading deletes, and complex multi-table joins for dashboard metrics.
- **Options Considered**:
  1. Prisma ORM.
  2. Drizzle ORM (`drizzle-orm` with PostgreSQL).
  3. Raw SQL queries via `pg` driver.
- **Decision**: Drizzle ORM with TypeScript schema definitions.
- **Rejected**: Prisma ORM and Raw SQL.
- **Rationale**:
  - *Why not Prisma?* Prisma relies on a heavy Rust query engine binary, requires external schema compilation steps (`prisma generate`), and introduces notable latency in serverless and containerized free tiers.
  - *Why not Raw SQL?* Raw SQL lacks end-to-end type safety and compile-time verification when table columns or relational names change.
  - *Why Drizzle?* Drizzle is lightweight, has zero runtime dependencies beyond the SQL driver (`postgres`), generates standard SQL queries without magic translation layers, and offers 100% TypeScript type inference directly from database table definitions.

---

## Decision 3: Server-Side State Machine for Booking Transitions & Waitlists

- **Context**: Goal 4 mandates strict lifecycle transitions (Booked, Waitlisted, Cancelled, Attended, No Show), capacity enforcement, and automatic waitlist promotion upon cancellation.
- **Options Considered**:
  1. Client-driven status updates where the frontend computes remaining capacity and sends the target status (`PATCH /api/bookings/:id` with `{ status: "attended" }`).
  2. Server-side authoritative state machine with dedicated semantic action endpoints (`/api/sessions/:id/book`, `/api/bookings/:id/cancel`, `/api/bookings/:id/settle`).
- **Decision**: Authoritative server-side state machine.
- **Rejected**: Client-side status calculations and generic status patch endpoints.
- **Rationale**: If two members attempt to book the final spot simultaneously, client-side capacity checks would result in a race condition where both claim the spot and cause room overcrowding. By enforcing all capacity evaluations, waitlist queuing, and status transitions on the server within atomic database queries, data consistency is strictly preserved.

---

## Decision 4: Immutable Audit Log via Dedicated `booking_history` Table

- **Context**: Goal 9 requires an immutable timeline of every booking's lifecycle showing creation, every status transition with old and new values, the actor who performed it, and any staff notes, which cannot be modified or deleted.
- **Options Considered**:
  1. JSONB array column (`audit_trail`) stored inside the `bookings` row.
  2. Dedicated append-only relational table (`booking_history`).
  3. Application-level file logger (e.g. Winston / Morgan).
- **Decision**: Dedicated append-only `booking_history` table.
- **Rejected**: JSONB column on `bookings` and file-based logging.
- **Rationale**: Storing audit logs in a JSONB array inside the mutable `bookings` record risks accidental data loss or corruption if the row is updated or replaced. A dedicated normalized relational table with foreign keys to both `bookings` and `users` allows reliable chronological indexing (`ORDER BY created_at ASC`), prevents modification by omitting update endpoints entirely, and makes audit queries simple and performant.

---

## Decision 5: Real-Time Dynamic Expiry Verification vs Cron-Based Account Deactivation

- **Context**: Goal 4 specifies that a member whose membership expiry date has passed cannot create a new booking.
- **Options Considered**:
  1. Nightly background cron job that scans all members and toggles an `isActive = false` flag on expired accounts.
  2. Real-time dynamic comparison (`membershipExpiry < today`) evaluated inside the booking creation transaction.
- **Decision**: Dynamic comparison at the moment of booking creation.
- **Rejected**: Asynchronous cron job flag toggling.
- **Rationale**: Cron-based deactivation introduces a temporal vulnerability window: a member whose membership expired earlier that morning could still book classes until midnight when the cron job executes. Dynamically checking the membership expiry date directly against the current date in the database query provides zero lag, instantaneous enforcement, and requires no background worker infrastructure.

---

## Decision 6: Navigation Architecture & Tab-Based UI State vs Heavy Client Routers

- **Context**: The studio staff dashboard contains multiple operational modules (Classes, Sessions, Bookings, Recurring Schedule Generator, Membership Alerts, Reports, and Settings).
- **Options Considered**:
  1. Deep nested URL routes using heavy client-side router packages with synchronized query parameters.
  2. Clean state-driven tab switching (`activeTab`, `selectedClassId`, `selectedSessionId`) combined with persistent URL entry points (`/login`, `/schedule`).
- **Decision**: State-driven operational tabs for authenticated workflows with distinct top-level routes for public visitors.
- **Rejected**: Over-complex nested client routing setups with deep URL synchronization.
- **Rationale**: Studio staff frequently switch rapidly between class sessions, bookings, and alerts while managing physical front desk check-ins. Modal drawers and reactive tab states keep navigation instantaneous, prevent layout thrashing, and eliminate URL state synchronization bugs during high-concurrency studio operations.
