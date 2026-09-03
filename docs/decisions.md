# Architecture & Implementation Decisions

## Decision 1: Project Folder Separation

- **Chose:** Explicit separate `server/` and `client/` directories with dedicated `package.json` and `tsconfig.json` files.
- **Rejected:** Merging client and server dependencies into a single root `package.json` with mixed scripts.
- **Why:** The frontend runs in a browser DOM environment (React, Vite, JSX) while the backend runs in Node.js with postgres and express. Mixing their dependency trees resulted in conflicting TypeScript module resolution configs and package lock bloat.
- **Later reversed:** We initially started with the starter repository's single root `package.json` which had Express mixed with dev tools. When configuring Vite and TypeScript compilation targets, compilerOptions like `"jsx": "react-jsx"` conflicted with Node server output settings. We reversed this and split the codebase into clean `server/` and `client/` directories.

## Decision 2: Drizzle ORM over Prisma or Raw SQL

- **Chose:** Drizzle ORM with TypeScript schema definitions.
- **Rejected:** Prisma ORM or writing raw SQL queries.
- **Why:** Drizzle provides compile-time TypeScript type safety without requiring a heavy Rust binary engine or code-generation step like Prisma. It maps 1:1 with PostgreSQL relational constructs (enums, serial PKs, foreign key cascades) and executes with zero runtime overhead via the lightweight `postgres.js` client.

## Decision 3: Server-Side State Machine for Booking Transitions

- **Chose:** Enforcing all booking lifecycle rules and auto-promotions in backend route handlers.
- **Rejected:** Relying on client-side status calculations or allowing clients to send arbitrary statuses (e.g. `PATCH /api/bookings/:id` with `{ status: "attended" }`).
- **Why:** In a studio booking scenario, multiple staff members or instructors may be using the system simultaneously. If the client decides whether a booking is `booked` or `waitlisted`, two browsers will both claim the last spot. By computing capacity and waitlists centrally on the server, the database remains consistent and race conditions are mitigated.

## Decision 4: Immutable Audit Log in `booking_history` Table

- **Chose:** A dedicated append-only `booking_history` table that records previous status, new status, user ID, note, and timestamp.
- **Rejected:** Storing status history in an array column or JSONB blob inside the `bookings` row, or simply updating `updated_at`.
- **Why:** Requirement 9 ("History you cannot rewrite") strictly mandates that nothing in the timeline can be edited or deleted. A normalized relational table with foreign keys to both `bookings` and `users` allows straightforward chronological querying, audit traceability, and database-level permissions if row-level security is enabled.

## Decision 5: Expiry Verification at Booking Time vs Cron-Based Account Inactivation

- **Chose:** Evaluating `member.membershipExpiry < currentDate` dynamically inside the booking creation transaction.
- **Rejected:** Running a background nightly cron job to toggle a boolean flag `isActive = false` on expired members.
- **Why:** A member whose membership expired 1 hour ago should be blocked immediately, without waiting for a midnight cron job. Evaluating the date against the database record at the exact moment of booking creation ensures zero lag and prevents expired members from claiming spots.
