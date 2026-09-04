# Submission

Fill this in and commit it. This is the first file we open.

## Links

- **GitHub repository:** https://github.com/victorchanda345-tech/v-fitness-studio
- **Live application:** https://v-fitness-studio.vercel.app
- **Backend API:** https://v-fitness-studio.onrender.com

## Notes for the reviewer

- **Studio**: **V Fitness Studio** — Boutique fitness & studio class booking system.
- **Live Application**: Deployed on Vercel at `https://v-fitness-studio.vercel.app`.
- **Backend API**: Live on Render at `https://v-fitness-studio.onrender.com`. Healthcheck available at `https://v-fitness-studio.onrender.com/api/health`.
- **Note on Free-Tier Sleeping**: The backend is hosted on Render's free tier. Free tier instances automatically spin down/sleep when idle and can take 30–60 seconds to wake up on the first request. Subsequent requests are fast.
- **Database**: PostgreSQL hosted on Supabase with Drizzle ORM. Strict relational foreign keys with `CASCADE` deletes, uniqueness constraints on co-instructors `(session_id, instructor_id)`, and immutable audit log tables.
- **Frontend**: React 18 + Vite with TypeScript running on Vercel edge network with SPA rewrites.
- **Production Build**: Verified with `npm run build` in `client/` (0 errors, 0 warnings).

## Demo credentials

| Role | Name | Email | Password |
|------|------|-------|----------|
| **Studio Manager** | **Victor Sharma** | `victor@vfitness.com` | `password123` |
| **Staff Manager** | **Priya Patel** | `priya@vfitness.com` | `password123` |
| **Instructor** | **Aarav Mehta** | `aarav@vfitness.com` | `password123` |
| **Instructor** | **Ananya Iyer** | `ananya@vfitness.com` | `password123` |
| **Instructor** | **Rohan Verma** | `rohan@vfitness.com` | `password123` |

## Stack

| Layer | What you used | Why |
|-------|---------------|-----|
| Frontend | React 18 + Vite (TypeScript) + Vanilla CSS Glassmorphism | Fast bundling, reactive component tree, type-safe API client, modern dark-mode responsive aesthetics |
| Backend | Node.js + Express 5 (TypeScript) | Lightweight, flexible middleware pipeline with stateless JWT auth, role-based authorization |
| Database | PostgreSQL (Supabase) + Drizzle ORM | Native SQL relational modeling, strict FK cascades, zero runtime ORM overhead, full type safety |
| Hosting | Vercel (Frontend SPA) + Render (Node.js API) + Supabase (PostgreSQL DB) | Zero-cost modern serverless architecture with global CDN caching and managed PostgreSQL |

## Goal checklist

Mark each honestly. Partial is fine — say what is partial.

| # | Goal | Status | Notes |
|---|------|--------|-------|
| 1 | Accounts and roles | Done | Staff & instructor roles enforced on server via JWT middleware; staff can assign primary & co-instructors; instructors can view assigned roster and settle attendance. |
| 2 | Classes | Done | Title, description, discipline, defaults (duration, capacity), archive & restore toggle with filter for archived classes. |
| 3 | Sessions inside classes | Done | Date, time, room, duration, capacity override, primary instructor assignment with validation. |
| 4 | Booking lifecycle with rules | Done | Automatic waitlisting when capacity reached, auto-promotion on cancellation, settlement (`attended`/`no_show`) restricted to session end, expired membership rejection. |
| 5 | Co-instructors | Done | Join table `session_co_instructors` with unique constraint; staff can assign/remove co-instructors; unified schedule view for instructors showing all primary and co-assigned sessions with role badges; co-instructors have settlement authorization. |
| 6 | Finding bookings | Done | Dedicated Bookings view with server-side text search (member name/email), class filter, status filter, sorting (`createdAt`, `status`, `session`), and full server pagination with page controls. Scoped for instructors to assigned sessions. |
| 7 | Recurring schedule generator | Done | Bulk-generates recurring weekly sessions across date range; conflict detection checks room overlaps and instructor (primary/co) overlaps; reports detailed summary of created vs skipped sessions with exact reasons; CSV attendance export endpoint & download button. |
| 8 | Dashboard | Done | Landing view displays 4 headline metrics (Sessions Today, Bookings Made Today, No-Shows This Week, Members Waitlisted), interactive bookings breakdown by status and class, and an 8-week weekly attendance chart. |
| 9 | History you cannot rewrite | Done | Immutable `booking_history` table recording every status transition, timestamp, and actor; staff can append permanent audit notes (`POST /api/bookings/:id/notes`); timeline modal in session and booking views. |
| 10 | Expiring membership alerts | Done | Alerts view for members whose membership expires within $\le 7$ days or has passed, with count badge in navigation; staff can dismiss alerts for the current expiry date; renewing membership expiry resets dismissal so alerts re-appear in future cycles. |

### Stretch Features Implemented

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| S1 | Public class schedule page | Done | Unauthenticated public timetable endpoint `GET /api/public/schedule` and responsive frontend (`PublicSchedule.tsx`). Real-time availability indicator ("X spots left" vs "Waitlist Only"), discipline filter pills, date selector, instructor and co-instructor badges, and guest sign-in CTA. Accessible via Login page and Navbar. |
| S2 | Instructor payroll based on sessions taught | Done | Staff endpoint `GET /api/reports/payroll` and frontend (`Payroll.tsx`). Calculates total earnings for finished sessions taught within customizable date range. Configurable primary rate ($50) and co-instructor rate ($35), KPI summary cards, instructor breakdown table, expandable itemized session audit drawer, and one-click CSV export. |
| S3 | Room utilization reporting | Done | Staff endpoint `GET /api/reports/room-utilization` and frontend (`RoomUtilization.tsx`). Computes room occupancy %, booked classroom hours vs customizable daily operating window (e.g. 12h/day), member capacity fill rate %, and peak-time distribution (Morning, Afternoon, Evening). |

## How much time did you actually spend?

Around 7–8 hours total, split into:
- 1.5 hours: Architecture review, database schema expansion (co-instructors join table, alert dismissal tracking, audit history).
- 2.5 hours: Backend API development and business logic validation (schedule generator conflict detection, pagination, settlement role access, CSV export, analytics aggregation).
- 2.5 hours: Frontend UI engineering (responsive Bookings view, Membership Alerts center, Dashboard analytics cards & 8-week chart, recurring generator modal, co-instructor management).
- 1 hour: End-to-end integration testing and automated verification.

## What would you do next, with another 12 hours?

1. **Email / SMS Notification Queue**: Integrate Resend or Twilio with a background job queue (e.g. BullMQ / Redis) to dispatch automated notifications when a waitlisted member is auto-promoted or when their membership enters the 7-day expiry window.
2. **WebSocket / SSE Live Updates**: Implement Server-Sent Events (SSE) or WebSockets so when front desk staff books or cancels a spot, the roster and waitlist counts update in real-time on all instructor screens without page refresh.
3. **Calendar View & Drag-and-Drop Rescheduling**: Build a full weekly visual calendar grid (FullCalendar / custom grid) allowing studio staff to visualize room occupancy, spot open slots, and drag sessions to reschedule.
4. **Member Self-Service Portal**: Create a public/member-facing view where studio members can log in, view available classes, self-book, check waitlist rank, and cancel bookings prior to cutoff windows.

## What are you least happy with in this codebase, and why?

- **Database Round-Trip Latency for Analytics**: While the 8-week attendance aggregation query was optimized using `Promise.all`, running 8 date-range count queries against cloud-hosted PostgreSQL (Supabase free-tier) can experience slight network latency compared to a single pre-aggregated SQL materialized view or a single `crosstab` / `generate_series` SQL CTE. In a high-traffic production system, we would maintain an hourly aggregated rollup table or Redis cache for dashboard metrics.
- **Express 5 Param Types**: In Express 5, `req.params` values are typed as `string | string[]`, requiring manual defensive parsing (`getIdParam`) in route handlers rather than schema-inferred validated types like Zod or tRPC would provide end-to-end.
