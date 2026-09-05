# Submission

## Links

- **GitHub repository:** https://github.com/victorchanda345-tech/v-fitness-studio
- **Live application:** https://v-fitness-studio.vercel.app
- **Backend API:** https://v-fitness-studio.onrender.com

## Notes for the reviewer

- **Studio**: **V Fitness Studio** — Premium boutique fitness studio operations and class booking management platform.
- **Live Application**: Deployed on Vercel at `https://v-fitness-studio.vercel.app`.
- **Backend API**: Deployed on Render at `https://v-fitness-studio.onrender.com`. Health check endpoint verified at `https://v-fitness-studio.onrender.com/api/health`.
- **Note on Free-Tier Spin-Up**: The backend is hosted on Render's free tier. Idle instances automatically spin down and require 30–60 seconds to initialize upon the initial request. Subsequent requests execute with low-latency response times.
- **Database**: PostgreSQL hosted on Supabase with Drizzle ORM. Configured with strict relational foreign keys, `CASCADE` deletions, uniqueness constraints on co-instructor assignments `(session_id, instructor_id)`, and immutable audit log tables.
- **Frontend**: React 18 with TypeScript and Vite, served via Vercel's global edge network with single-page application (SPA) rewrites.
- **Production Build**: Verified with `npm run build` in `client/` (0 errors, 0 warnings).

## Demo credentials

| Role | Name | Email | Password |
|------|------|-------|----------|
| **Studio Manager** | **Victor Chanda** | `victor@vfitness.com` | `password123` |
| **Staff Manager** | **Priya Patel** | `priya@vfitness.com` | `password123` |
| **Instructor** | **Aarav Mehta** | `aarav@vfitness.com` | `password123` |
| **Instructor** | **Ananya Iyer** | `ananya@vfitness.com` | `password123` |
| **Instructor** | **Rohan Verma** | `rohan@vfitness.com` | `password123` |
| **Member (Active 90d)** | **Rahul Sharma** | `rahul@example.com` | `password123` |
| **Member (Active 60d)** | **Sneha Rao** | `sneha@example.com` | `password123` |
| **Member (Expiring 5d)** | **Arjun Nair** | `arjun@example.com` | `password123` |

## Stack

| Layer | Technology | Architectural Rationale |
|-------|------------|-------------------------|
| Frontend | React 18 + Vite (TypeScript) + Vanilla CSS Glassmorphism | Fast compilation, reactive component architecture, type-safe API client, and custom dark carbon & crimson design system |
| Backend | Node.js + Express 5 (TypeScript) | Lightweight, modular middleware pipeline with stateless JWT authentication and role-based authorization |
| Database | PostgreSQL (Supabase) + Drizzle ORM | Native SQL relational schema, strict foreign key constraints, zero runtime ORM overhead, and full TypeScript type safety |
| Hosting | Vercel (Frontend SPA) + Render (Node.js API) + Supabase (Managed PostgreSQL) | Modern cloud architecture with global edge CDN caching and scalable managed database infrastructure |

## Goal checklist

| # | Goal | Status | Notes |
|---|------|--------|-------|
| 1 | Accounts and roles | Done | Staff and instructor roles are enforced via secure JWT middleware. Studio staff can assign primary and co-instructors, while instructors access their assigned session rosters and execute attendance settlements. |
| 2 | Classes | Done | Comprehensive class catalog management including title, description, athletic discipline, default duration, default capacity, and archive/restore status with filter toggling. |
| 3 | Sessions inside classes | Done | Full session scheduling supporting date, start time, room assignment, custom capacity overrides, and validated primary instructor assignments. |
| 4 | Booking lifecycle with rules | Done | Automated waitlist placement upon reaching capacity, instant auto-promotion on cancellation, post-session attendance settlement (`attended`/`no_show`), and strict rejection of expired memberships. |
| 5 | Co-instructors | Done | Relational `session_co_instructors` join table with uniqueness constraints. Staff can dynamically assign or remove co-instructors. Instructors benefit from a unified schedule displaying both primary and co-assigned sessions with role badges and authorized settlement privileges. |
| 6 | Finding bookings | Done | Dedicated enterprise Bookings view with server-side text search (member name/email), multi-parameter filters (class, session, status), column sorting (`createdAt`, `status`, `session`), and server-side pagination controls. Roster visibility is automatically scoped for instructors. |
| 7 | Recurring schedule generator | Done | Automated weekly recurring session generator across custom date ranges. Built-in conflict detection prevents room collisions and instructor double-booking (primary or co-instructor). Provides comprehensive generation audit summaries and one-click CSV attendance export. |
| 8 | Dashboard | Done | Executive dashboard featuring four primary KPI cards (Sessions Today, Bookings Created Today, Weekly No-Shows, Active Waitlisted Members), real-time booking status breakdown, and an 8-week historical attendance trend chart. |
| 9 | History you cannot rewrite | Done | Immutable `booking_history` audit ledger capturing every status transition, timestamp, and actor ID. Staff can append permanent audit notes (`POST /api/bookings/:id/notes`) viewable in an interactive timeline modal. |
| 10 | Expiring membership alerts | Done | Proactive membership alerts view highlighting memberships expiring within 7 days or already lapsed, integrated with a live navigation counter badge. Staff can dismiss alerts for current cycles; renewing expiration dates automatically reactivates monitoring for subsequent cycles. |

### Stretch Features Implemented

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| S1 | Public class schedule page | Done | Unauthenticated public timetable endpoint (`GET /api/public/schedule`) and responsive public interface (`PublicSchedule.tsx`). Displays real-time spot availability, discipline filter chips, date selector, instructor rosters, and direct authentication entry points. |
| S2 | Instructor payroll based on sessions taught | Done | Instructor payroll reporting engine (`GET /api/reports/payroll`) and management portal (`Payroll.tsx`). Calculates compensation for completed sessions taught across custom date windows. Features configurable base rates (₹50 primary / ₹35 co-instructor), executive KPI cards, itemized session audit drawers, and one-click CSV export. |
| S3 | Room utilization reporting | Done | Studio room utilization analytics (`GET /api/reports/room-utilization`) and visualization interface (`RoomUtilization.tsx`). Analyzes room occupancy percentages, booked classroom hours against customizable operational windows (e.g., 12 hours/day), member capacity fill rates, and peak usage distributions (Morning, Afternoon, Evening). |
| S4 | Online self-service booking & waitlist visibility for members | Done | Production-grade member self-service booking engine (`POST /api/public/bookings`, `PATCH /api/public/bookings/:id/cancel`, `GET /api/public/members/:email/bookings`, `POST /api/public/members/verify`). Members can directly reserve class spots online, join waitlists with real-time waitlist position tracking (#1, #2, etc.), track membership expiry validity, and self-cancel with immediate auto-promotion for waiting members. Integrated into both schedule and landing page via `MemberBookingModal.tsx` and `MemberPortalModal.tsx`. |
| S5 | Member Login & Read-Only Upcoming Sessions (Strict Privacy) | Done | Members can securely sign in via `/login` (e.g., `rahul@example.com` / `password123`) or via member self-service. Authenticated members access a dedicated, clean read-only schedule view (`MemberScheduleView.tsx` & `MemberPortalModal.tsx`) showing upcoming sessions (`date >= today`) with **Class Title**, **Date**, **Time**, **Room**, **Instructor Name**, and **Spots Remaining**. **Zero other member info is exposed**: members receive HTTP 403 on `/api/members`, `/api/bookings` is strictly scoped to one's own records, and session payloads are sanitized to exclude all other participant data. |

## How much time did you actually spend?

Approximately 8–9 hours total, allocated as follows:
- 1.5 hours: Architecture review, database schema design, and constraint modeling (co-instructor relations, alert dismissal tracking, and immutable audit history).
- 3.0 hours: Backend API development and business logic validation (schedule generator conflict detection, pagination, role-based settlement authorization, member self-service endpoints, CSV export, and analytics aggregation).
- 3.0 hours: Frontend UI engineering (responsive Bookings view, Membership Alerts center, Dashboard analytics cards & 8-week chart, recurring generator modal, member self-service booking modal, and member portal drawer).
- 1.0 hour: End-to-end integration testing, visual regression verification, and automated build verification.

## What would you do next, with another 12 hours?

1. **Automated Messaging & Notification Queue**: Integrate transactional email and SMS dispatch (e.g., Resend, Twilio) backed by a Redis/BullMQ background queue to immediately notify waitlisted members upon auto-promotion or membership expiration.
2. **Real-Time WebSocket State Synchronization**: Deploy Server-Sent Events (SSE) or WebSockets to broadcast live booking updates, capacity shifts, and check-ins across staff and instructor dashboards without requiring manual polling.
3. **Interactive Visual Calendar Grid**: Implement a full interactive weekly timetable grid (e.g., drag-and-drop rescheduling, multi-room calendar views) for effortless studio schedule planning.
4. **Member Mobile PWA & Push Notifications**: Package the member self-service experience into an installable progressive web app (PWA) with native calendar sync and push reminders 2 hours before class.

## What are you least happy with in this codebase, and why?

- **Database Round-Trip Latency for Analytics Rollups**: While the 8-week attendance aggregation query was optimized using `Promise.all`, executing multiple date-range queries against cloud-hosted PostgreSQL introduces network round-trip overhead. In an enterprise-scale production environment, this would be addressed using pre-aggregated SQL materialized views, continuous rollup tables, or Redis caching.
- **Express 5 Route Parameter Type Inference**: In Express 5, `req.params` values resolve as `string | string[]`, requiring defensive runtime parsing utilities rather than schema-inferred, end-to-end validated type definitions (e.g., via Zod or tRPC).
