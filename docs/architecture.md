# System Architecture

## 1. Moving Pieces and Communication Protocols

The system is engineered as a decoupled, modern client-server architecture with three principal layers:

### A. Frontend Single-Page Application (`client/`)
- **Technology**: React 18, TypeScript, and Vite.
- **Styling**: Vanilla CSS design system featuring responsive glassmorphism, tailored dark slate/carbon aesthetics (`#0a0d14`), crimson accent tokens, and modern typography (Bebas Neue, Plus Jakarta Sans, and JetBrains Mono).
- **Communication**: Communicates with the backend exclusively through asynchronous RESTful HTTP calls. Authenticated requests append a Bearer JSON Web Token (JWT) in the HTTP `Authorization` header.
- **State & Session**: An `AuthContext` provider manages user state, authentication tokens, and reactive role switching in the browser, while all access control and business logic are strictly enforced on the server.

### B. Backend REST API (`server/`)
- **Technology**: Node.js and Express 5 written in TypeScript.
- **Middleware Pipeline**:
  1. `cors`: Restricts and authorizes cross-origin client requests.
  2. `express.json()`: Parses incoming JSON payloads.
  3. `authenticate`: Verifies JWT cryptographic signatures using `JWT_SECRET`, decodes `{ userId, role }`, and decorates `req.user`.
  4. `requireRole('staff' | 'instructor')`: Server-side role guard that blocks unauthorized mutations with HTTP 403 Forbidden.
  5. `asyncHandler`: Global exception boundary that catches unhandled async errors and formats standardized JSON error responses (`{ error: string }`).
- **Domain Routers**:
  - `/api/auth`: Login, credential verification, and instructor account provisioning.
  - `/api/classes`: Catalog management, duration/capacity defaults, and soft-archive/restore.
  - `/api/sessions`: Class scheduling, room assignments, duration/capacity overrides, co-instructor assignments, and recurring schedule generation.
  - `/api/bookings`: Booking lifecycle transitions (Booked, Waitlisted, Cancelled, Attended, No Show), waitlist auto-promotion, server-side pagination, search, and CSV export.
  - `/api/members`: Member registration, membership expiry tracking, and renewal alert dismissals.
  - `/api/dashboard`: Executive KPI aggregations and 8-week historical attendance trend analysis.
  - `/api/reports`: Instructor payroll calculation and studio room utilization analytics.
  - `/api/public`: Unauthenticated timetable (`/api/public/schedule`) and member self-service booking.

### C. Relational Data Layer (PostgreSQL via Drizzle ORM)
- **Database Engine**: Cloud-hosted PostgreSQL on Supabase.
- **ORM**: Drizzle ORM (`drizzle-orm` and `drizzle-kit`) for TypeScript type-safe queries and schema definition.
- **Integrity**: Enforces relational foreign keys with `ON DELETE CASCADE`, unique constraints on email and co-instructor tuples `(session_id, instructor_id)`, and enum type safety on roles and booking statuses.

---

## 2. Execution Environments (Where Each Piece Runs)

| Component | Platform | Hosting Tier | Operational Role |
|-----------|----------|--------------|------------------|
| **Client SPA** | Vercel Edge Network | Free / Global Edge CDN | Delivers bundled static assets (HTML/CSS/JS) with SPA rewrites for instant client-side rendering globally. |
| **Backend API** | Render Cloud Services | Free Tier (Node.js Web Service) | Executes Express API application logic, manages JWT auth, performs conflict detection, and coordinates database mutations. |
| **Relational DB** | Supabase Cloud | Free Tier (Managed PostgreSQL) | Persists relational data tables, foreign key constraints, and immutable audit logs via SSL connection pooling. |

---

## 3. End-to-End Request Path: Booking Cancellation & Waitlist Auto-Promotion

To illustrate the end-to-end execution path across all architectural layers, consider studio staff cancelling an active booking for a class session that has waitlisted members:

```
[Staff Browser] ──(1. Click 'Cancel')──> [Client: api.cancelBooking(id, note)]
                                                        │
                                                        ▼
                                           (2. PATCH /api/bookings/:id/cancel)
                                                        │
                                                        ▼
                                          [Express Server (Render)]
                                          ├── authenticate middleware (validates JWT)
                                          ├── requireRole('staff') (verifies staff role)
                                          └── bookingsRouter handler
                                                        │
                                                        ▼
                                          [PostgreSQL Database (Supabase)]
                                          ├── 3. Fetch target booking (verify status === 'booked')
                                          ├── 4. Update status = 'cancelled'
                                          ├── 5. Insert row into booking_history (immutable log)
                                          ├── 6. Query earliest waitlisted booking (ORDER BY created_at ASC LIMIT 1)
                                          ├── 7. Update waitlisted booking to status = 'booked'
                                          └── 8. Insert auto-promotion row into booking_history
                                                        │
                                                        ▼
[Staff Browser] <──(9. Return HTTP 200 { cancelled, promoted })── [Express Server]
       │
       ▼
[React UI]: Immediately updates local state, changes booking pills from 'Booked' to 'Cancelled'
            and 'Waitlisted' to 'Booked', and renders a toast confirmation.
```

### Detailed Execution Trace:
1. **User Interaction**: Staff clicks "Cancel" on an active booking card in `SessionDetail.tsx`.
2. **Client Dispatch**: The client calls `api.cancelBooking(bookingId, note)` which fires `PATCH /api/bookings/:id/cancel` with the staff's JWT in the `Authorization` header and `{ note: "Member phoned to cancel" }` in the JSON body.
3. **Gateway Verification**: The Express request pipeline validates the JWT signature, extracts `{ userId: 1, role: 'staff' }`, and verifies staff authorization.
4. **State Machine Validation**: The route handler inspects the target booking. If the booking is already `cancelled`, `attended`, or `no_show`, the server rejects the request with HTTP 400 and an explanatory message.
5. **State Mutation & Audit Log**: The target booking's status transitions to `cancelled`. A new row is appended to `booking_history` recording `old_status: 'booked'`, `new_status: 'cancelled'`, `changed_by: 1`, and the cancellation note.
6. **Automatic Promotion**: The server queries the earliest waitlisted booking for the session (`ORDER BY created_at ASC LIMIT 1`). When found, its status is updated to `booked`, and an audit row is appended to `booking_history` noting `"Auto-promoted from waitlist after cancellation"`.
7. **Client Response**: The server returns `{ cancelled: Booking, promoted: Booking }`. The React client updates its state cache, updating UI badges with zero page reloads.

---

## 4. Architectural Deliberations: What Was *Not* Built, and Why

1. **No External Payment Gateway / Subscription Billing (Stripe / Razorpay)**:
   - *Rationale*: The brief explicitly focuses on studio class operations, room scheduling, attendance settlements, and membership expiry date tracking. Integrating a third-party payment gateway would introduce webhook dependencies and sandbox credit card configurations without advancing the 10 core operational requirements.
2. **No Monolithic Full-Page Refresh Architecture**:
   - *Rationale*: Server-rendered HTML (e.g. EJS or Pug) was rejected in favor of a clean React SPA backed by a decoupled JSON REST API. This architectural separation ensures that mobile web clients, future native apps, or third-party studio portals can consume the identical backend API contract.
3. **No Heavy External Calendar / Scheduling Plugins**:
   - *Rationale*: Third-party drag-and-drop calendar packages introduce heavy bundle weight and opinionated DOM rendering. We built custom, lightweight, responsive timetable views tailored precisely to studio capacity limits and discipline categories.
4. **No Distributed Microservices Complexity**:
   - *Rationale*: For a boutique studio operating multiple rooms, a modular monolithic Express architecture provides clear simplicity. It guarantees atomic database operations across bookings, waitlists, and audit ledgers within a single PostgreSQL transaction boundary, eliminating distributed transaction overhead.
5. **No Client-Side Authority on State Machines or Dates**:
   - *Rationale*: Clients never dictate lifecycle transitions directly. Capacity calculations, waitlist queues, attendance settlement eligibility, and membership expiry checks are evaluated centrally on the server to prevent race conditions and tamper attempts.
