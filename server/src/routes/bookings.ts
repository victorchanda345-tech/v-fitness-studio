import { Router } from 'express';
import { eq, and, or, asc, desc, count, ilike, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  bookings,
  bookingHistory,
  sessions,
  members,
  classes,
  sessionCoInstructors,
  users,
} from '../db/schema.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { asyncHandler, errorResponse, getIdParam } from '../utils/errors.js';

const router = Router();

router.use(authenticate);

// ── Helper: has the session's scheduled time passed? ───────────────────────────

function hasSessionPassed(sessionDate: string, startTime: string): boolean {
  const sessionStart = new Date(`${sessionDate}T${startTime}:00`);
  return new Date() >= sessionStart;
}

// ── GET /api/bookings (Goal 6: Finding Bookings) ────────────────────────────────
// Server-side search over member name/email, filters for class/session/status,
// sorting by booked time, status, or session, with pagination.
// Scoped by role: instructors only see bookings for sessions they teach.

router.get(
  '/bookings',
  asyncHandler(async (req, res) => {
    const search = req.query.search as string | undefined;
    const classIdParam = req.query.classId ? Number(req.query.classId) : undefined;
    const sessionIdParam = req.query.sessionId ? Number(req.query.sessionId) : undefined;
    const statusParam = req.query.status as string | undefined;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 15));
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    // 1. Role scoping
    if (req.user!.role === 'instructor') {
      const coRecords = await db
        .select({ sessionId: sessionCoInstructors.sessionId })
        .from(sessionCoInstructors)
        .where(eq(sessionCoInstructors.instructorId, req.user!.userId));
      const coSessionIds = coRecords.map((r) => r.sessionId);

      if (coSessionIds.length > 0) {
        conditions.push(
          or(eq(sessions.primaryInstructorId, req.user!.userId), inArray(sessions.id, coSessionIds)),
        );
      } else {
        conditions.push(eq(sessions.primaryInstructorId, req.user!.userId));
      }
    }

    // 2. Search over member name & email
    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      conditions.push(or(ilike(members.name, term), ilike(members.email, term)));
    }

    // 3. Filters
    if (classIdParam && !isNaN(classIdParam)) {
      conditions.push(eq(classes.id, classIdParam));
    }
    if (sessionIdParam && !isNaN(sessionIdParam)) {
      conditions.push(eq(sessions.id, sessionIdParam));
    }
    if (statusParam && statusParam !== 'all') {
      conditions.push(eq(bookings.status, statusParam as any));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 4. Count total matches
    const [{ value: totalCount }] = await db
      .select({ value: count() })
      .from(bookings)
      .innerJoin(members, eq(bookings.memberId, members.id))
      .innerJoin(sessions, eq(bookings.sessionId, sessions.id))
      .innerJoin(classes, eq(sessions.classId, classes.id))
      .where(whereClause);

    // 5. Order expression
    let orderClause: any[];
    if (sortBy === 'status') {
      orderClause = [sortOrder === 'asc' ? asc(bookings.status) : desc(bookings.status)];
    } else if (sortBy === 'session') {
      orderClause =
        sortOrder === 'asc'
          ? [asc(sessions.date), asc(sessions.startTime)]
          : [desc(sessions.date), desc(sessions.startTime)];
    } else {
      orderClause = [sortOrder === 'asc' ? asc(bookings.createdAt) : desc(bookings.createdAt)];
    }

    // 6. Execute paginated query
    const rows = await db
      .select({
        id: bookings.id,
        sessionId: bookings.sessionId,
        memberId: bookings.memberId,
        status: bookings.status,
        createdAt: bookings.createdAt,
        memberName: members.name,
        memberEmail: members.email,
        memberExpiry: members.membershipExpiry,
        sessionDate: sessions.date,
        sessionStartTime: sessions.startTime,
        sessionDuration: sessions.duration,
        sessionCapacity: sessions.capacity,
        sessionRoom: sessions.room,
        classId: classes.id,
        classTitle: classes.title,
        classDiscipline: classes.discipline,
      })
      .from(bookings)
      .innerJoin(members, eq(bookings.memberId, members.id))
      .innerJoin(sessions, eq(bookings.sessionId, sessions.id))
      .innerJoin(classes, eq(sessions.classId, classes.id))
      .where(whereClause)
      .orderBy(...orderClause)
      .limit(limit)
      .offset(offset);

    const formattedBookings = rows.map((r) => ({
      id: r.id,
      sessionId: r.sessionId,
      memberId: r.memberId,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      member: {
        id: r.memberId,
        name: r.memberName,
        email: r.memberEmail,
        membershipExpiry: r.memberExpiry,
      },
      session: {
        id: r.sessionId,
        classId: r.classId,
        date: r.sessionDate,
        startTime: r.sessionStartTime,
        duration: r.sessionDuration,
        capacity: r.sessionCapacity,
        room: r.sessionRoom,
        class: {
          id: r.classId,
          title: r.classTitle,
          discipline: r.classDiscipline,
        },
      },
    }));

    return res.json({
      bookings: formattedBookings,
      total: Number(totalCount),
      page,
      limit,
      totalPages: Math.ceil(Number(totalCount) / limit) || 1,
    });
  }),
);

// ── POST /api/sessions/:sessionId/bookings ─────────────────────────────────────
// Creates a booking. Auto-assigns "booked" if capacity remains, else "waitlisted".

router.post(
  '/sessions/:sessionId/bookings',
  requireRole('staff'),
  asyncHandler(async (req, res) => {
    const sessionId = getIdParam(req.params.sessionId);
    if (isNaN(sessionId)) return errorResponse(res, 400, 'Invalid session ID');

    const { memberId, note } = req.body;
    if (!memberId) return errorResponse(res, 400, 'memberId is required');

    // 1. Verify session exists
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
    });
    if (!session) return errorResponse(res, 404, 'Session not found');

    // 2. Verify member exists
    const member = await db.query.members.findFirst({
      where: eq(members.id, Number(memberId)),
    });
    if (!member) return errorResponse(res, 404, 'Member not found');

    // 3. Check membership expiry
    const today = new Date().toISOString().split('T')[0];
    if (member.membershipExpiry < today) {
      return errorResponse(
        res,
        400,
        `Cannot create booking: ${member.name}'s membership expired on ${member.membershipExpiry}`,
      );
    }

    // 4. Check if member already has an active booking for this session
    const existingBooking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.sessionId, sessionId),
        eq(bookings.memberId, Number(memberId)),
      ),
    });
    if (existingBooking && (existingBooking.status === 'booked' || existingBooking.status === 'waitlisted')) {
      return errorResponse(
        res,
        400,
        `${member.name} already has an active booking (${existingBooking.status}) for this session`,
      );
    }

    // 5. Count current occupied spots (booked, attended, or no_show) to decide status
    const [{ value: bookedCount }] = await db
      .select({ value: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.sessionId, sessionId),
          inArray(bookings.status, ['booked', 'attended', 'no_show']),
        ),
      );

    const status = Number(bookedCount) < session.capacity ? 'booked' : 'waitlisted';

    // 6. Create the booking
    const [created] = await db
      .insert(bookings)
      .values({
        sessionId,
        memberId: Number(memberId),
        status,
      })
      .returning();

    // 7. Create history entry
    await db.insert(bookingHistory).values({
      bookingId: created.id,
      oldStatus: null,
      newStatus: status,
      changedBy: req.user!.userId,
      note: note || `Booking created – ${status}`,
    });

    return res.status(201).json(created);
  }),
);

// ── PATCH /api/bookings/:id/cancel ─────────────────────────────────────────────
// Cancels a booked or waitlisted booking. If it was booked, auto-promotes the
// earliest waitlisted booking on the same session.

router.patch(
  '/bookings/:id/cancel',
  requireRole('staff'),
  asyncHandler(async (req, res) => {
    const id = getIdParam(req.params.id);
    if (isNaN(id)) return errorResponse(res, 400, 'Invalid booking ID');

    const { note } = req.body;

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, id),
    });
    if (!booking) return errorResponse(res, 404, 'Booking not found');

    if (booking.status === 'cancelled') {
      return errorResponse(
        res,
        400,
        'This booking has already been cancelled.',
      );
    }

    if (booking.status === 'attended' || booking.status === 'no_show') {
      return errorResponse(
        res,
        400,
        `Cannot cancel a booking that has already been settled as "${booking.status}".`,
      );
    }

    if (booking.status !== 'booked' && booking.status !== 'waitlisted') {
      return errorResponse(
        res,
        400,
        `Cannot cancel a booking with status "${booking.status}". Only booked or waitlisted bookings can be cancelled.`,
      );
    }

    const previousStatus = booking.status;

    // Cancel the booking
    const [cancelled] = await db
      .update(bookings)
      .set({ status: 'cancelled' })
      .where(eq(bookings.id, id))
      .returning();

    // Create history entry for the cancellation
    await db.insert(bookingHistory).values({
      bookingId: id,
      oldStatus: previousStatus,
      newStatus: 'cancelled',
      changedBy: req.user!.userId,
      note: note || 'Booking cancelled',
    });

    // If the cancelled booking was "booked", promote the earliest waitlisted
    let promoted = null;
    if (previousStatus === 'booked') {
      const nextWaitlisted = await db.query.bookings.findFirst({
        where: and(
          eq(bookings.sessionId, booking.sessionId),
          eq(bookings.status, 'waitlisted'),
        ),
        orderBy: (b, { asc }) => [asc(b.createdAt)],
      });

      if (nextWaitlisted) {
        const [promotedBooking] = await db
          .update(bookings)
          .set({ status: 'booked' })
          .where(eq(bookings.id, nextWaitlisted.id))
          .returning();

        await db.insert(bookingHistory).values({
          bookingId: nextWaitlisted.id,
          oldStatus: 'waitlisted',
          newStatus: 'booked',
          changedBy: req.user!.userId,
          note: 'Auto-promoted from waitlist after cancellation',
        });

        promoted = promotedBooking;
      }
    }

    return res.json({ cancelled, promoted });
  }),
);

// ── PATCH /api/bookings/:id/settle (Goals 1 & 4) ────────────────────────────────
// Marks a booked booking as attended or no_show. Only allowed after the session
// has passed. Allowed for staff OR assigned instructors (primary or co-instructor).

router.patch(
  '/bookings/:id/settle',
  asyncHandler(async (req, res) => {
    const id = getIdParam(req.params.id);
    if (isNaN(id)) return errorResponse(res, 400, 'Invalid booking ID');

    const { status: newStatus, note } = req.body;

    if (newStatus !== 'attended' && newStatus !== 'no_show') {
      return errorResponse(res, 400, 'Status must be "attended" or "no_show"');
    }

    // Fetch booking with session info and co-instructors
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, id),
      with: {
        session: {
          with: {
            coInstructors: true,
          },
        },
      },
    });
    if (!booking) return errorResponse(res, 404, 'Booking not found');

    // Permission check: staff can settle anything; instructors can only settle sessions they teach
    if (req.user!.role === 'instructor') {
      const isPrimary = booking.session.primaryInstructorId === req.user!.userId;
      const isCo = booking.session.coInstructors.some(
        (ci) => ci.instructorId === req.user!.userId,
      );
      if (!isPrimary && !isCo) {
        return errorResponse(res, 403, 'You can only settle attendance for sessions you teach');
      }
    }

    if (booking.status === 'attended' || booking.status === 'no_show') {
      return errorResponse(
        res,
        400,
        `Cannot settle booking: this booking has already been settled as "${booking.status}". Settled bookings cannot be modified.`,
      );
    }

    if (booking.status === 'cancelled') {
      return errorResponse(
        res,
        400,
        'Cannot settle a cancelled booking.',
      );
    }

    if (booking.status === 'waitlisted') {
      return errorResponse(
        res,
        400,
        'Cannot settle a waitlisted booking. Only confirmed booked bookings can be settled as attended or no_show.',
      );
    }

    if (booking.status !== 'booked') {
      return errorResponse(
        res,
        400,
        `Cannot settle a booking with status "${booking.status}". Only booked bookings can be settled as attended or no_show.`,
      );
    }

    // Check that the session scheduled time has arrived/passed
    if (!hasSessionPassed(booking.session.date, booking.session.startTime)) {
      return errorResponse(
        res,
        400,
        `Cannot settle this booking yet — the session's scheduled time (${booking.session.date} at ${booking.session.startTime}) has not arrived.`,
      );
    }

    const [settled] = await db
      .update(bookings)
      .set({ status: newStatus })
      .where(eq(bookings.id, id))
      .returning();

    await db.insert(bookingHistory).values({
      bookingId: id,
      oldStatus: 'booked',
      newStatus,
      changedBy: req.user!.userId,
      note: note || `Marked as ${newStatus}`,
    });

    return res.json(settled);
  }),
);

// ── POST /api/bookings/:id/notes (Goal 9: History you cannot rewrite) ───────────
// Studio staff can add notes to a booking's immutable audit timeline

router.post(
  '/bookings/:id/notes',
  requireRole('staff'),
  asyncHandler(async (req, res) => {
    const id = getIdParam(req.params.id);
    if (isNaN(id)) return errorResponse(res, 400, 'Invalid booking ID');

    const { note } = req.body;
    if (!note || note.trim() === '') {
      return errorResponse(res, 400, 'note is required');
    }

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, id),
    });
    if (!booking) return errorResponse(res, 404, 'Booking not found');

    const [newHistory] = await db
      .insert(bookingHistory)
      .values({
        bookingId: id,
        oldStatus: booking.status,
        newStatus: booking.status,
        changedBy: req.user!.userId,
        note: note.trim(),
      })
      .returning();

    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user!.userId),
      columns: { id: true, name: true, role: true },
    });

    return res.status(201).json({
      ...newHistory,
      changedByUser: user,
    });
  }),
);

// ── GET /api/bookings/:id/history ──────────────────────────────────────────────
// Returns the immutable timeline for a booking.

router.get(
  '/bookings/:id/history',
  asyncHandler(async (req, res) => {
    const id = getIdParam(req.params.id);
    if (isNaN(id)) return errorResponse(res, 400, 'Invalid booking ID');

    const history = await db.query.bookingHistory.findMany({
      where: eq(bookingHistory.bookingId, id),
      with: {
        changedByUser: { columns: { id: true, name: true, role: true } },
      },
      orderBy: (h, { asc }) => [asc(h.createdAt)],
    });

    return res.json(history);
  }),
);

// ── GET /api/sessions/:sessionId/bookings ──────────────────────────────────────
// List all bookings for a session.

router.get(
  '/sessions/:sessionId/bookings',
  asyncHandler(async (req, res) => {
    const sessionId = getIdParam(req.params.sessionId);
    if (isNaN(sessionId)) return errorResponse(res, 400, 'Invalid session ID');

    const result = await db.query.bookings.findMany({
      where: eq(bookings.sessionId, sessionId),
      with: {
        member: true,
      },
      orderBy: (b, { asc }) => [asc(b.createdAt)],
    });

    return res.json(result);
  }),
);

export default router;
