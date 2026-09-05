# Database Schema Architecture & Scalability

This document details the PostgreSQL relational data model designed for V Fitness Studio via Drizzle ORM, explaining table structures, relational cardinalities, constraint enforcement boundaries, denormalization trade-offs, and horizontal scalability considerations at 100x data scale.

---

## 1. Tables, Columns, and Data Types

The database comprises 7 relational tables defined in `server/src/db/schema.ts`:

### 1. `users` Table
Stores authenticated studio staff and instructors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `serial` | PRIMARY KEY | Unique auto-incrementing user identifier |
| `email` | `varchar(255)` | UNIQUE, NOT NULL | Staff / Instructor login email |
| `password_hash` | `varchar(255)` | NOT NULL | bcrypt hashed password |
| `name` | `varchar(255)` | NOT NULL | User's full name |
| `role` | `role` enum | NOT NULL | Enum: `'staff'` or `'instructor'` |
| `created_at` | `timestamp` | NOT NULL, DEFAULT now() | Account creation timestamp |

### 2. `classes` Table
Represents studio class offerings (templates for scheduled sessions).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `serial` | PRIMARY KEY | Unique auto-incrementing class identifier |
| `title` | `varchar(255)` | NOT NULL | Class title (e.g. "Morning Flow Yoga") |
| `description` | `text` | NULLABLE | Detailed class overview and workout focus |
| `discipline` | `varchar(100)` | NOT NULL | Category (e.g. Yoga, Pilates, HIIT, Dance, Spin) |
| `default_duration` | `integer` | NOT NULL | Default session duration in minutes |
| `default_capacity` | `integer` | NOT NULL | Default room headcount capacity |
| `is_archived` | `boolean` | NOT NULL, DEFAULT false | Soft-archive flag (hides from active lists) |
| `created_at` | `timestamp` | NOT NULL, DEFAULT now() | Class creation timestamp |

### 3. `sessions` Table
Specific dated occurrences of a class scheduled in a room with an assigned instructor.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `serial` | PRIMARY KEY | Unique auto-incrementing session identifier |
| `class_id` | `integer` | NOT NULL, FK -> `classes.id` ON DELETE CASCADE | Parent class reference |
| `date` | `date` | NOT NULL | Scheduled calendar date (`YYYY-MM-DD`) |
| `start_time` | `varchar(5)` | NOT NULL | Scheduled start time in 24h format (`HH:MM`) |
| `duration` | `integer` | NOT NULL | Session duration in minutes (overridable) |
| `capacity` | `integer` | NOT NULL | Room headcount limit (overridable) |
| `room` | `varchar(100)` | NOT NULL | Room identifier (e.g. "Studio A", "Studio B") |
| `primary_instructor_id` | `integer` | NOT NULL, FK -> `users.id` | Assigned lead instructor |
| `created_at` | `timestamp` | NOT NULL, DEFAULT now() | Session creation timestamp |

### 4. `session_co_instructors` Table
Associative join table supporting multi-instructor assignments (Goal 5).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `serial` | PRIMARY KEY | Unique auto-incrementing identifier |
| `session_id` | `integer` | NOT NULL, FK -> `sessions.id` ON DELETE CASCADE | Target session |
| `instructor_id` | `integer` | NOT NULL, FK -> `users.id` ON DELETE CASCADE | Assigned co-instructor |
| `created_at` | `timestamp` | NOT NULL, DEFAULT now() | Assignment timestamp |
| *Composite* | UNIQUE | `UNIQUE(session_id, instructor_id)` | Prevents duplicate co-instructor assignments |

### 5. `members` Table
Tracks studio members and their membership validity.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `serial` | PRIMARY KEY | Unique auto-incrementing member identifier |
| `name` | `varchar(255)` | NOT NULL | Member's full name |
| `email` | `varchar(255)` | UNIQUE, NOT NULL | Member's email address |
| `membership_expiry` | `date` | NOT NULL | Current membership expiration date |
| `dismissed_alert_expiry` | `varchar(10)` | NULLABLE | Date string for which an alert was dismissed |
| `created_at` | `timestamp` | NOT NULL, DEFAULT now() | Member registration timestamp |

### 6. `bookings` Table
Tracks reservations, waitlists, cancellations, and completed attendances.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `serial` | PRIMARY KEY | Unique auto-incrementing booking identifier |
| `session_id` | `integer` | NOT NULL, FK -> `sessions.id` ON DELETE CASCADE | Associated session |
| `member_id` | `integer` | NOT NULL, FK -> `members.id` | Attending member |
| `status` | `booking_status` enum | NOT NULL | Enum: `'booked' \| 'waitlisted' \| 'cancelled' \| 'attended' \| 'no_show'` |
| `created_at` | `timestamp` | NOT NULL, DEFAULT now() | Booking timestamp (used for waitlist ordering) |

### 7. `booking_history` Table
Immutable audit log recording every booking status transition and staff note (Goal 9).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `serial` | PRIMARY KEY | Unique auto-incrementing log identifier |
| `booking_id` | `integer` | NOT NULL, FK -> `bookings.id` ON DELETE CASCADE | Associated booking |
| `old_status` | `varchar(20)` | NULLABLE | Previous status (`null` upon initial booking) |
| `new_status` | `varchar(20)` | NOT NULL | Target status after transition |
| `changed_by` | `integer` | NULLABLE, FK -> `users.id` | User who initiated transition (`null` if system auto-promoted) |
| `note` | `text` | NULLABLE | Staff explanation or system audit note |
| `created_at` | `timestamp` | NOT NULL, DEFAULT now() | Timestamp when transition occurred |

---

## 2. Relationships: One-to-Many vs Many-to-Many

### One-to-Many (1:N)
- `classes` (1) ➔ `sessions` (N): One class serves as the template for numerous recurring sessions over time.
- `sessions` (1) ➔ `bookings` (N): A session holds multiple bookings up to capacity plus waitlists.
- `members` (1) ➔ `bookings` (N): A member creates multiple bookings across different sessions.
- `bookings` (1) ➔ `booking_history` (N): Every status transition generates an immutable history record.
- `users` (1) ➔ `sessions` (N): A primary instructor is assigned to lead multiple sessions.
- `users` (1) ➔ `booking_history` (N): A staff member or instructor can initiate multiple booking status transitions.

### Many-to-Many (M:N)
- `members` ↔ `sessions` (via `bookings`): A member can attend multiple sessions, and a session hosts multiple members. Modeled via the `bookings` table with an explicit lifecycle status enum.
- `instructors` ↔ `sessions` (via `session_co_instructors`): An instructor can assist with multiple sessions, and a session can have multiple co-instructors alongside the lead instructor. Modeled via `session_co_instructors` with a `UNIQUE(session_id, instructor_id)` constraint.

---

## 3. Database Constraints vs Application-Level Constraints

| Rule / Constraint | Enforced By | Implementation Mechanism & Rationale |
|-------------------|-------------|--------------------------------------|
| **Relational Integrity** | Database | Foreign keys on all parent-child relationships with `ON DELETE CASCADE`. |
| **Email Uniqueness** | Database | `UNIQUE` constraints on `users.email` and `members.email` prevent duplicate accounts at the storage level. |
| **Enum Value Safety** | Database | Native PostgreSQL enums (`role`, `booking_status`) guarantee invalid string values cannot be inserted. |
| **Co-Instructor Uniqueness** | Database | `UNIQUE(session_id, instructor_id)` prevents assigning the same instructor twice to a single session. |
| **Membership Validity** | Application | Evaluated dynamically: `member.membershipExpiry >= today`. Enforced in application logic because expiration is a temporal check relative to the transaction timestamp. |
| **Capacity & Waitlist Allocation** | Application | Count of active `booked` records is evaluated against `session.capacity`. If count `< capacity`, status is `booked`; otherwise queued as `waitlisted`. |
| **Waitlist Auto-Promotion** | Application | When a `booked` reservation is cancelled, the server queries `WHERE session_id = ? AND status = 'waitlisted' ORDER BY created_at ASC LIMIT 1` and promotes that booking within the transaction. |
| **Attendance Settlement Timing** | Application | Settle transitions (`attended`, `no_show`) are rejected unless the scheduled session end time (`date + startTime + duration`) has elapsed. |
| **Role-Based Visibility** | Application | Instructors are restricted at query time to only view sessions where they are the primary instructor or an assigned co-instructor. |

---

## 4. Deliberate Denormalization & Architectural Trade-offs

1. **Duration & Capacity Copied from `classes` to `sessions`**:
   - *Design*: `sessions` explicitly persists `duration` and `capacity` columns rather than reading solely from parent `classes`.
   - *Rationale*: A class's default capacity may be modified in the future (e.g. increasing default capacity from 10 to 12). Existing scheduled sessions and historical records must preserve their contracted room capacity and duration. Furthermore, individual sessions scheduled in different rooms (e.g. Studio C vs Studio A) require specific capacity overrides.
2. **Text Representation in `booking_history` (`old_status` and `new_status`)**:
   - *Design*: Stored as `varchar(20)` rather than linking directly to the PostgreSQL enum type.
   - *Rationale*: Allows historical audit records to remain immutable and readable even if enum types are altered or expanded in future migrations.
3. **`dismissed_alert_expiry` Stored Directly on `members`**:
   - *Design*: Storing the dismissed date string directly on the member record rather than in a separate dismissal log table.
   - *Rationale*: Avoids an extra table join during high-frequency alert queries. When a staff member updates a member's expiry date, resetting this column automatically causes alerts to resurface for the new cycle without requiring background sync jobs.

---

## 5. Scalability Analysis: What Breaks First at 100x Data?

At 100x data scale (~10,000 classes, ~100,000 sessions, ~1,000,000 bookings):

### 1. Concurrent Booking Race Conditions (Immediate Bottleneck)
- **Vulnerability**: Currently, capacity verification performs a `SELECT count(*)` followed by an `INSERT`. Under heavy concurrency (e.g., 50 members attempting to reserve the last open spot on a popular class simultaneously), multiple concurrent transactions could read `count < capacity` and oversubscribe the room.
- **Solution at Scale**:
  - Implement PostgreSQL row-level locking (`SELECT id FROM sessions WHERE id = ? FOR UPDATE`).
  - Or maintain an atomic integer column `active_bookings_count` on `sessions` updated via `UPDATE sessions SET active_bookings_count = active_bookings_count + 1 WHERE id = ? AND active_bookings_count < capacity`.

### 2. Unindexed Search & Full Table Scans
- **Vulnerability**: Server-side text search on `member.name` and `member.email` (`ILIKE '%query%'`) will degrade from milliseconds to sequential disk scans over 1,000,000 rows.
- **Solution at Scale**:
  - Add trigram GIN indexes (`CREATE INDEX members_search_gin ON members USING gin (name gin_trgm_ops, email gin_trgm_ops);`).
  - Add composite B-tree indexes: `CREATE INDEX idx_bookings_session_status ON bookings(session_id, status);` and `CREATE INDEX idx_sessions_date_time ON sessions(date, start_time);`.

### 3. Historical 8-Week Trend Aggregation Overhead
- **Vulnerability**: Running 8 separate date-range joins on every dashboard load across millions of booking rows will strain database CPU and increase response latency.
- **Solution at Scale**:
  - Create a PostgreSQL Materialized View (`weekly_attendance_summary`) refreshed hourly, or an automated daily rollup table storing pre-computed attendance metrics per class and week.
