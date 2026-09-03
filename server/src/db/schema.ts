import { pgTable, serial, varchar, text, integer, boolean, timestamp, date, pgEnum, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── Enums ──────────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum('role', ['staff', 'instructor']);

export const bookingStatusEnum = pgEnum('booking_status', [
  'booked',
  'waitlisted',
  'cancelled',
  'attended',
  'no_show',
]);

// ── Users (staff + instructors) ────────────────────────────────────────────────

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: roleEnum('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Classes ────────────────────────────────────────────────────────────────────

export const classes = pgTable('classes', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  discipline: varchar('discipline', { length: 100 }).notNull(),
  defaultDuration: integer('default_duration').notNull(), // minutes
  defaultCapacity: integer('default_capacity').notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Sessions (inside classes) ──────────────────────────────────────────────────

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  classId: integer('class_id')
    .references(() => classes.id, { onDelete: 'cascade' })
    .notNull(),
  date: date('date').notNull(),                           // "YYYY-MM-DD"
  startTime: varchar('start_time', { length: 5 }).notNull(), // "HH:MM"
  duration: integer('duration').notNull(),                 // minutes
  capacity: integer('capacity').notNull(),
  room: varchar('room', { length: 100 }).notNull(),
  primaryInstructorId: integer('primary_instructor_id')
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Session Co-Instructors (Goal 5: Many-to-Many) ──────────────────────────────

export const sessionCoInstructors = pgTable(
  'session_co_instructors',
  {
    id: serial('id').primaryKey(),
    sessionId: integer('session_id')
      .references(() => sessions.id, { onDelete: 'cascade' })
      .notNull(),
    instructorId: integer('instructor_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    unique('session_instructor_unique').on(t.sessionId, t.instructorId),
  ],
);

// ── Members ────────────────────────────────────────────────────────────────────

export const members = pgTable('members', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  membershipExpiry: date('membership_expiry').notNull(),
  dismissedAlertExpiry: date('dismissed_alert_expiry'), // tracks alert dismissal per expiry date
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Bookings ───────────────────────────────────────────────────────────────────

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull(),
  memberId: integer('member_id')
    .references(() => members.id)
    .notNull(),
  status: bookingStatusEnum('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Booking History (immutable audit log) ──────────────────────────────────────

export const bookingHistory = pgTable('booking_history', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id')
    .references(() => bookings.id, { onDelete: 'cascade' })
    .notNull(),
  oldStatus: varchar('old_status', { length: 20 }),       // null on creation
  newStatus: varchar('new_status', { length: 20 }).notNull(),
  changedBy: integer('changed_by').references(() => users.id),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Relations ──────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  primarySessions: many(sessions),
  coInstructorSessions: many(sessionCoInstructors),
}));

export const classesRelations = relations(classes, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  class: one(classes, {
    fields: [sessions.classId],
    references: [classes.id],
  }),
  primaryInstructor: one(users, {
    fields: [sessions.primaryInstructorId],
    references: [users.id],
  }),
  coInstructors: many(sessionCoInstructors),
  bookings: many(bookings),
}));

export const sessionCoInstructorsRelations = relations(sessionCoInstructors, ({ one }) => ({
  session: one(sessions, {
    fields: [sessionCoInstructors.sessionId],
    references: [sessions.id],
  }),
  instructor: one(users, {
    fields: [sessionCoInstructors.instructorId],
    references: [users.id],
  }),
}));

export const membersRelations = relations(members, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  session: one(sessions, {
    fields: [bookings.sessionId],
    references: [sessions.id],
  }),
  member: one(members, {
    fields: [bookings.memberId],
    references: [members.id],
  }),
  history: many(bookingHistory),
}));

export const bookingHistoryRelations = relations(bookingHistory, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingHistory.bookingId],
    references: [bookings.id],
  }),
  changedByUser: one(users, {
    fields: [bookingHistory.changedBy],
    references: [users.id],
  }),
}));

