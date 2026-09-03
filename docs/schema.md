# Schema Architecture & Trade-offs

## 1. Tables, Columns, and Types

The database schema is defined in `server/src/db/schema.ts` using Drizzle ORM over PostgreSQL:

### `users`
- `id` (`serial`, PK): Auto-incrementing identifier.
- `email` (`varchar(255)`, UNIQUE, NOT NULL): User identity / login email.
- `password_hash` (`varchar(255)`, NOT NULL): bcrypt password hash.
- `name` (`varchar(255)`, NOT NULL): Display name.
- `role` (`role` enum: `'staff' | 'instructor'`, NOT NULL): System role.
- `created_at` (`timestamp`, default now()).

### `classes`
- `id` (`serial`, PK): Auto-incrementing identifier.
- `title` (`varchar(255)`, NOT NULL): Class title (e.g. "Morning Flow Yoga").
- `description` (`text`): Descriptive text.
- `discipline` (`varchar(100)`, NOT NULL): Category (Yoga, Pilates, Dance, HIIT, Spin, etc.).
- `default_duration` (`integer`, NOT NULL): Default duration in minutes.
- `default_capacity` (`integer`, NOT NULL): Default headcount capacity.
- `is_archived` (`boolean`, default false, NOT NULL): Soft-archive flag.
- `created_at` (`timestamp`, default now()).

### `sessions`
- `id` (`serial`, PK): Auto-incrementing identifier.
- `class_id` (`integer`, FK -> `classes.id` ON DELETE CASCADE, NOT NULL): Parent class.
- `date` (`date`, NOT NULL): Scheduled date (`YYYY-MM-DD`).
- `start_time` (`varchar(5)`, NOT NULL): Scheduled start (`HH:MM`).
- `duration` (`integer`, NOT NULL): Effective duration in minutes (defaults from class, overridable).
- `capacity` (`integer`, NOT NULL): Effective room capacity (defaults from class, overridable).
- `room` (`varchar(100)`, NOT NULL): Room location (e.g. "Studio A").
- `primary_instructor_id` (`integer`, FK -> `users.id`, NOT NULL): Primary assigned teacher.
- `created_at` (`timestamp`, default now()).

### `session_co_instructors`
- `id` (`serial`, PK): Auto-incrementing identifier.
- `session_id` (`integer`, FK -> `sessions.id` ON DELETE CASCADE, NOT NULL): Associated session.
- `instructor_id` (`integer`, FK -> `users.id` ON DELETE CASCADE, NOT NULL): Assigned co-instructor.
- `created_at` (`timestamp`, default now()).
- *Constraints*: Unique constraint on `(session_id, instructor_id)`.

### `members`
- `id` (`serial`, PK): Auto-incrementing identifier.
- `name` (`varchar(255)`, NOT NULL): Member full name.
- `email` (`varchar(255)`, UNIQUE, NOT NULL): Member email.
- `membership_expiry` (`date`, NOT NULL): Expiry date (`YYYY-MM-DD`).
- `dismissed_alert_expiry` (`varchar(10)`): Expiry date string for which an alert was dismissed (resets upon membership renewal).
- `created_at` (`timestamp`, default now()).

### `bookings`
- `id` (`serial`, PK): Auto-incrementing identifier.
- `session_id` (`integer`, FK -> `sessions.id` ON DELETE CASCADE, NOT NULL): Target session.
- `member_id` (`integer`, FK -> `members.id`, NOT NULL): Attending member.
- `status` (`booking_status` enum: `'booked' | 'waitlisted' | 'cancelled' | 'attended' | 'no_show'`, NOT NULL): Current lifecycle state.
- `created_at` (`timestamp`, default now()).

### `booking_history`
- `id` (`serial`, PK): Auto-incrementing identifier.
- `booking_id` (`integer`, FK -> `bookings.id` ON DELETE CASCADE, NOT NULL): Associated booking.
- `old_status` (`varchar(20)`): Previous state (`null` on creation).
- `new_status` (`varchar(20)`, NOT NULL): New state.
- `changed_by` (`integer`, FK -> `users.id`): Staff or instructor user who initiated transition.
- `note` (`text`): Staff reason or audit note.
- `created_at` (`timestamp`, default now()).

---

## 2. Relationships: One-to-Many vs Many-to-Many

- **One-to-Many:**
  - `classes` (1) ➔ `sessions` (N): A class acts as a template for recurring or scheduled sessions.
  - `sessions` (1) ➔ `bookings` (N): A session holds bookings up to its capacity plus waitlist.
  - `members` (1) ➔ `bookings` (N): A member can book multiple sessions over time.
  - `bookings` (1) ➔ `booking_history` (N): Every status transition creates an immutable log row.
  - `users` (1) ➔ `sessions` (N): A primary instructor is assigned to multiple sessions.
- **Many-to-Many (Represented or Emergent):**
  - `members` ↔ `sessions` via `bookings`: An explicit join table with lifecycle state and timestamps.
  - Co-instructors ↔ `sessions` (Goal 5): Multiple instructors per session via a join table or co-instructor mapping.

---

## 3. Database Constraints vs Application Enforced Constraints

### Enforced by the Database:
- **Relational integrity**: Foreign keys on all parent-child links (`session_id`, `class_id`, `member_id`, `booking_id`, `changed_by`).
- **Cascade deletions**: Deleting a session cascades to delete its bookings and booking history rows, ensuring no orphaned booking records.
- **Uniqueness**: Unique constraints on `users.email` and `members.email` prevent duplicate accounts at the storage level.
- **Enum safety**: PostgreSQL enum types (`role`, `booking_status`) guarantee that invalid strings cannot be written.

### Enforced by Application Code:
- **Membership validity check**: Before booking, verifying `member.membershipExpiry >= today`. We enforce this in application code because membership expiry is a dynamic date check relative to the transaction time.
- **Capacity & waitlist promotion logic**: Auto-allocating `booked` vs `waitlisted` based on active count vs `session.capacity`, and auto-promoting the earliest waitlist member upon cancellation. This multi-step state transition requires atomic transactional ordering.
- **Settlement time constraint**: Settle actions (`attended` or `no_show`) are rejected if the session's end time (`date + startTime + duration`) has not passed.
- **Role-based visibility**: Instructors are restricted at query time to only view their assigned sessions.

---

## 4. Deliberate Denormalization

- **Duration and Capacity copied to `sessions`**: Rather than solely referencing `classes.defaultDuration` and `classes.defaultCapacity`, each session stores its own `duration` and `capacity`.
  - *Rationale*: A class's default capacity may change in the future (e.g. studio changes default capacity from 12 to 15), but past and scheduled sessions must retain their original contracted room capacities. Furthermore, individual sessions may take place in smaller rooms (e.g. Studio C capacity 2).
- **`old_status` and `new_status` as text in `booking_history`**: Captured explicitly per transition to maintain an audit trail even if enum definitions evolve.

---

## 5. What Would Break First at 100x Data?

1. **Race conditions during concurrent bookings on popular classes**:
   - Currently, the count of active bookings is computed via `select count(*) where status = 'booked'`, followed by an `insert`. If 10 members book the last open spot at the exact same millisecond, multiple transactions could read `count < capacity` simultaneously.
   - *Fix at scale*: Use a PostgreSQL row-level lock (`SELECT ... FOR UPDATE` on the session row) or an atomic reservation counter with an optimistic concurrency check.
2. **Unindexed search over `bookings` and `members`**:
   - At 100x data (~100,000 bookings), text search on `member.name` and `member.email` without a trigram GIN index (`pg_trgm`) will degrade from milliseconds to sequential scans.
   - *Fix at scale*: Add B-tree indexes on `(session_id, status)`, `(date, start_time)`, and GIN index for search.
