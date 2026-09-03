# System Architecture

## 1. The Moving Pieces and Communication

The system is structured as a decoupled client-server architecture with three primary layers:

1. **Frontend Client (`client/`)**:
   - Single Page Application (SPA) built with React 18, Vite, and TypeScript.
   - Communicates with the backend exclusively via RESTful JSON HTTP calls with Bearer JWT tokens attached in the `Authorization` header.
   - Uses an `AuthContext` to maintain reactive user session state and client-side route authorization, while delegating all actual security rules to the backend.

2. **Backend API (`server/`)**:
   - Node.js application built with Express and TypeScript.
   - Stateless request pipeline:
     - `CORS` and `express.json()` body parsing.
     - `authenticate` middleware: verifies JWT signature, extracts `{ userId, role }`, and decorates `req.user`.
     - `requireRole('staff')`: server-side authorization barrier ensuring non-staff cannot invoke administrative mutations.
     - Resource routers: `auth`, `classes`, `sessions`, `bookings`, `members`.
     - `asyncHandler` wrapper ensuring unhandled exceptions are caught and returned as clean standardized JSON errors (`{ error: string }`).

3. **Data Layer (PostgreSQL via Drizzle ORM)**:
   - Managed PostgreSQL instance on Supabase.
   - Schema defined and migrated using Drizzle ORM (`drizzle-orm` + `drizzle-kit`).
   - Strong foreign key constraints with relational query mapping for parent-child relationship fetches.

---

## 2. Where Each Piece Runs

- **Browser**: React SPA executing in the user's web browser, rendering UI components with CSS glassmorphism, responsive tables, and interactive dialogs.
- **Node.js Runtime**: Express server running on port 3000 (proxied during local development through Vite on port 5173 to avoid cross-origin friction).
- **Cloud Database**: Managed PostgreSQL running in Supabase's cloud infrastructure, connected via SSL connection pooling.

---

## 3. End-to-End Request Path: Cancelling a Booking and Auto-Promoting Waitlist

Consider a studio staff member cancelling a `booked` reservation for a session that currently has a waitlist:

1. **User Action**: The staff clicks "Cancel" on a booking card in the React UI (`client/src/pages/SessionDetail.tsx`).
2. **Client Request**: `api.cancelBooking(bookingId, note)` fires a `PATCH /api/bookings/:id/cancel` with headers `Authorization: Bearer <jwt>` and JSON body `{ note: "Member called to cancel" }`.
3. **Gateway & Auth**:
   - Express router receives the HTTP packet.
   - `authenticate` middleware validates the JWT token against `JWT_SECRET`.
   - `requireRole('staff')` verifies `req.user.role === 'staff'`.
4. **Validation**:
   - The handler queries `bookings` table for `id`.
   - Verifies current status is `booked` or `waitlisted` (rejects `attended`, `no_show`, or already `cancelled` with a 400 status).
5. **State Transition**:
   - Updates target booking's status to `cancelled`.
   - Appends a new immutable row to `booking_history` with `oldStatus: 'booked'`, `newStatus: 'cancelled'`, `changedBy: userId`, and `note`.
6. **Waitlist Auto-Promotion**:
   - Since the cancelled booking was `booked`, the server queries the earliest waitlisted booking for the same session:
     ```sql
     SELECT * FROM bookings WHERE session_id = ? AND status = 'waitlisted' ORDER BY created_at ASC LIMIT 1
     ```
   - If found, updates that record to `status = 'booked'`.
   - Appends an audit log to `booking_history`: `oldStatus: 'waitlisted'`, `newStatus: 'booked'`, `note: 'Auto-promoted from waitlist after cancellation'`.
7. **Response & UI Update**:
   - The server returns `{ cancelled: Booking, promoted: Booking }`.
   - React updates the local state, changes the badge colors immediately from `booked` to `cancelled` and waitlisted to `booked`, and displays a success notification banner.

---

## 4. What We Decided *Not* to Build, and Why

- **Did not build public member self-registration / self-checkout**:
  - The core prompt states: *"Studio staff schedule classes and their sessions, track each member's membership status... Instructors see their own sessions"*.
  - Member self-service is explicitly an optional stretch idea (Stretch #1). Focusing on the staff and instructor operational workflows ensured all 10 core lifecycle and data consistency requirements were rigorously met first.
- **Did not build client-side status state machines**:
  - All status transitions, capacity checks, and expiry validations run on the server. The client is purely a projection of the server state. If the UI allowed actions that the server rejected, bad state would proliferate.
- **Did not use an over-complex microservices architecture**:
  - A clean monolithic modular Express backend with PostgreSQL is the appropriate design for this domain, guaranteeing atomic database transactions across bookings and waitlists without distributed transaction overhead.
