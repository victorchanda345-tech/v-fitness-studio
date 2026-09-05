import { Router } from 'express';
import { eq, and, or, inArray, asc, gte } from 'drizzle-orm';
import { db } from '../db/index.js';
import { sessions, classes, users, sessionCoInstructors, bookings, bookingHistory } from '../db/schema.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { asyncHandler, errorResponse, getIdParam } from '../utils/errors.js';

const router = Router();

// All session routes require authentication
router.use(authenticate);

// ── Helper: Helper to parse time to minutes from midnight ─────────────────────
function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ── GET /api/classes/:classId/sessions ─────────────────────────────────────────

router.get(
  '/classes/:classId/sessions',
  asyncHandler(async (req, res) => {
    const classId = getIdParam(req.params.classId);
    if (isNaN(classId)) return errorResponse(res, 400, 'Invalid class ID');

    if (req.user!.role === 'member') {
      const sessionList = await db.query.sessions.findMany({
        where: eq(sessions.classId, classId),
        with: {
          primaryInstructor: { columns: { id: true, name: true } },
          coInstructors: {
            with: {
              instructor: { columns: { id: true, name: true } },
            },
          },
          class: { columns: { id: true, title: true, discipline: true } },
          bookings: {
            columns: { status: true, memberId: true },
          },
        },
        orderBy: (s, { asc }) => [asc(s.date), asc(s.startTime)],
      });

      const memberSessions = sessionList.map((s) => {
        const bookedCount = s.bookings.filter((b) => b.status === 'booked').length;
        const spotsRemaining = Math.max(0, s.capacity - bookedCount);
        const myBooking = s.bookings.find((b) => b.memberId === req.user!.userId);

        return {
          id: s.id,
          classId: s.class.id,
          classTitle: s.class.title,
          date: s.date,
          time: s.startTime,
          startTime: s.startTime,
          duration: s.duration,
          room: s.room,
          instructorName: s.primaryInstructor?.name || 'Studio Instructor',
          primaryInstructor: s.primaryInstructor,
          coInstructors: s.coInstructors.map((ci) => ci.instructor),
          capacity: s.capacity,
          spotsRemaining,
          isFull: spotsRemaining === 0,
          myBookingStatus: myBooking ? myBooking.status : null,
          class: s.class,
        };
      });

      return res.json(memberSessions);
    }

    let sessionList;
    if (req.user!.role === 'instructor') {
      // Find session IDs where user is co-instructor
      const coRecords = await db
        .select({ sessionId: sessionCoInstructors.sessionId })
        .from(sessionCoInstructors)
        .where(eq(sessionCoInstructors.instructorId, req.user!.userId));
      const coIds = coRecords.map((r) => r.sessionId);

      const conditions = [
        eq(sessions.classId, classId),
        coIds.length > 0
          ? or(eq(sessions.primaryInstructorId, req.user!.userId), inArray(sessions.id, coIds))
          : eq(sessions.primaryInstructorId, req.user!.userId),
      ];

      sessionList = await db.query.sessions.findMany({
        where: and(...conditions),
        with: {
          primaryInstructor: { columns: { id: true, name: true, email: true } },
          coInstructors: {
            with: {
              instructor: { columns: { id: true, name: true, email: true } },
            },
          },
          class: { columns: { id: true, title: true, discipline: true } },
        },
        orderBy: (s, { asc }) => [asc(s.date), asc(s.startTime)],
      });
    } else {
      sessionList = await db.query.sessions.findMany({
        where: eq(sessions.classId, classId),
        with: {
          primaryInstructor: { columns: { id: true, name: true, email: true } },
          coInstructors: {
            with: {
              instructor: { columns: { id: true, name: true, email: true } },
            },
          },
          class: { columns: { id: true, title: true, discipline: true } },
        },
        orderBy: (s, { asc }) => [asc(s.date), asc(s.startTime)],
      });
    }

    const formatted = sessionList.map((s) => ({
      ...s,
      coInstructors: s.coInstructors.map((ci) => ci.instructor),
    }));

    return res.json(formatted);
  }),
);

// ── GET /api/sessions ──────────────────────────────────────────────────────────
// List all sessions (instructors see sessions where primary or co-instructor; members see read-only upcoming sessions)

router.get(
  '/sessions',
  asyncHandler(async (req, res) => {
    // 1. Role: member -> read-only upcoming sessions, strictly no other member info
    if (req.user!.role === 'member') {
      const todayStr = new Date().toISOString().split('T')[0];

      const sessionList = await db.query.sessions.findMany({
        where: gte(sessions.date, todayStr),
        with: {
          class: {
            columns: { id: true, title: true, description: true, discipline: true, isArchived: true },
          },
          primaryInstructor: {
            columns: { id: true, name: true },
          },
          coInstructors: {
            with: {
              instructor: { columns: { id: true, name: true } },
            },
          },
          bookings: {
            columns: { status: true, memberId: true },
          },
        },
        orderBy: (s, { asc }) => [asc(s.date), asc(s.startTime)],
      });

      const memberSessions = sessionList
        .filter((s) => s.class && !s.class.isArchived)
        .map((s) => {
          const bookedCount = s.bookings.filter((b) => b.status === 'booked').length;
          const waitlistedCount = s.bookings.filter((b) => b.status === 'waitlisted').length;
          const spotsRemaining = Math.max(0, s.capacity - bookedCount);
          const myBooking = s.bookings.find((b) => b.memberId === req.user!.userId);

          return {
            id: s.id,
            classId: s.class.id,
            classTitle: s.class.title,
            title: s.class.title,
            description: s.class.description,
            discipline: s.class.discipline,
            date: s.date,
            time: s.startTime,
            startTime: s.startTime,
            duration: s.duration,
            room: s.room,
            instructorName: s.primaryInstructor?.name || 'Studio Instructor',
            primaryInstructor: { id: s.primaryInstructor?.id, name: s.primaryInstructor?.name || 'Studio Instructor' },
            coInstructors: s.coInstructors.map((ci) => ({ id: ci.instructor.id, name: ci.instructor.name })),
            capacity: s.capacity,
            spotsRemaining,
            isFull: spotsRemaining === 0,
            waitlistedCount,
            myBookingStatus: myBooking ? myBooking.status : null,
            class: {
              id: s.class.id,
              title: s.class.title,
              discipline: s.class.discipline,
            },
            // STRICT PRIVACY: under no circumstances include any other member's info
          };
        });

      return res.json(memberSessions);
    }

    let sessionList;
    if (req.user!.role === 'instructor') {
      const coRecords = await db
        .select({ sessionId: sessionCoInstructors.sessionId })
        .from(sessionCoInstructors)
        .where(eq(sessionCoInstructors.instructorId, req.user!.userId));
      const coIds = coRecords.map((r) => r.sessionId);

      const condition =
        coIds.length > 0
          ? or(eq(sessions.primaryInstructorId, req.user!.userId), inArray(sessions.id, coIds))
          : eq(sessions.primaryInstructorId, req.user!.userId);

      sessionList = await db.query.sessions.findMany({
        where: condition,
        with: {
          primaryInstructor: { columns: { id: true, name: true, email: true } },
          coInstructors: {
            with: {
              instructor: { columns: { id: true, name: true, email: true } },
            },
          },
          class: { columns: { id: true, title: true, discipline: true } },
        },
        orderBy: (s, { asc }) => [asc(s.date), asc(s.startTime)],
      });
    } else {
      sessionList = await db.query.sessions.findMany({
        with: {
          primaryInstructor: { columns: { id: true, name: true, email: true } },
          coInstructors: {
            with: {
              instructor: { columns: { id: true, name: true, email: true } },
            },
          },
          class: { columns: { id: true, title: true, discipline: true } },
        },
        orderBy: (s, { asc }) => [asc(s.date), asc(s.startTime)],
      });
    }

    const formatted = sessionList.map((s) => ({
      ...s,
      coInstructors: s.coInstructors.map((ci) => ci.instructor),
    }));

    return res.json(formatted);
  }),
);

// ── GET /api/sessions/:id ──────────────────────────────────────────────────────

router.get(
  '/sessions/:id',
  asyncHandler(async (req, res) => {
    const id = getIdParam(req.params.id);
    if (isNaN(id)) return errorResponse(res, 400, 'Invalid session ID');

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, id),
      with: {
        primaryInstructor: { columns: { id: true, name: true, email: true } },
        coInstructors: {
          with: {
            instructor: { columns: { id: true, name: true, email: true } },
          },
        },
        class: true,
        bookings: {
          with: {
            member: true,
          },
          orderBy: (b, { asc }) => [asc(b.createdAt)],
        },
      },
    });

    if (!session) return errorResponse(res, 404, 'Session not found');

    const coInstructorList = session.coInstructors.map((ci) => ci.instructor);

    // If requester is a member: strictly protect other members' privacy!
    if (req.user!.role === 'member') {
      const bookedCount = session.bookings.filter((b) => b.status === 'booked').length;
      const waitlistedCount = session.bookings.filter((b) => b.status === 'waitlisted').length;
      const spotsRemaining = Math.max(0, session.capacity - bookedCount);
      const myBooking = session.bookings.find((b) => b.memberId === req.user!.userId);

      return res.json({
        id: session.id,
        classId: session.classId,
        classTitle: session.class.title,
        title: session.class.title,
        description: session.class.description,
        discipline: session.class.discipline,
        date: session.date,
        time: session.startTime,
        startTime: session.startTime,
        duration: session.duration,
        capacity: session.capacity,
        room: session.room,
        instructorName: session.primaryInstructor?.name || 'Studio Instructor',
        primaryInstructor: session.primaryInstructor ? { id: session.primaryInstructor.id, name: session.primaryInstructor.name } : null,
        coInstructors: coInstructorList.map(ci => ({ id: ci.id, name: ci.name })),
        spotsRemaining,
        isFull: spotsRemaining === 0,
        waitlistedCount,
        myBookingStatus: myBooking ? myBooking.status : null,
        class: session.class,
        // STRICT PRIVACY: under no circumstances leak other members' details
        bookings: myBooking ? [{ id: myBooking.id, status: myBooking.status, createdAt: myBooking.createdAt }] : [],
      });
    }

    // Instructors can only view sessions they teach (primary or co-instructor)
    if (req.user!.role === 'instructor') {
      const isPrimary = session.primaryInstructorId === req.user!.userId;
      const isCo = coInstructorList.some((inst) => inst.id === req.user!.userId);
      if (!isPrimary && !isCo) {
        return errorResponse(res, 403, 'You can only view sessions you are assigned to');
      }
    }

    return res.json({
      ...session,
      coInstructors: coInstructorList,
    });
  }),
);

// ── POST /api/classes/:classId/sessions ────────────────────────────────────────

router.post(
  '/classes/:classId/sessions',
  requireRole('staff'),
  asyncHandler(async (req, res) => {
    const classId = getIdParam(req.params.classId);
    if (isNaN(classId)) return errorResponse(res, 400, 'Invalid class ID');

    const cls = await db.query.classes.findFirst({
      where: eq(classes.id, classId),
    });
    if (!cls) return errorResponse(res, 404, 'Class not found');

    const { date, startTime, duration, capacity, room, primaryInstructorId } = req.body;

    if (!date || !startTime || !room || !primaryInstructorId) {
      return errorResponse(res, 400, 'date, startTime, room and primaryInstructorId are required');
    }

    const instructor = await db.query.users.findFirst({
      where: eq(users.id, Number(primaryInstructorId)),
    });
    if (!instructor) return errorResponse(res, 404, 'Instructor not found');
    if (instructor.role !== 'instructor') {
      return errorResponse(res, 400, 'Selected user is not an instructor');
    }

    const sessionDuration =
      duration !== undefined && duration !== null && String(duration).trim() !== '' && Number(duration) > 0
        ? Number(duration)
        : cls.defaultDuration;

    const sessionCapacity =
      capacity !== undefined && capacity !== null && String(capacity).trim() !== '' && Number(capacity) > 0
        ? Number(capacity)
        : cls.defaultCapacity;

    const [created] = await db
      .insert(sessions)
      .values({
        classId,
        date,
        startTime,
        duration: sessionDuration,
        capacity: sessionCapacity,
        room: room.trim(),
        primaryInstructorId: Number(primaryInstructorId),
      })
      .returning();

    return res.status(201).json(created);
  }),
);

// ── PUT /api/sessions/:id ──────────────────────────────────────────────────────

router.put(
  '/sessions/:id',
  requireRole('staff'),
  asyncHandler(async (req, res) => {
    const id = getIdParam(req.params.id);
    if (isNaN(id)) return errorResponse(res, 400, 'Invalid session ID');

    const { date, startTime, duration, capacity, room, primaryInstructorId } = req.body;

    if (primaryInstructorId !== undefined) {
      const instructor = await db.query.users.findFirst({
        where: eq(users.id, Number(primaryInstructorId)),
      });
      if (!instructor) return errorResponse(res, 404, 'Instructor not found');
      if (instructor.role !== 'instructor') {
        return errorResponse(res, 400, 'Selected user is not an instructor');
      }

      // If the new primary instructor was previously assigned as a co-instructor on this session, remove that record
      await db
        .delete(sessionCoInstructors)
        .where(
          and(
            eq(sessionCoInstructors.sessionId, id),
            eq(sessionCoInstructors.instructorId, Number(primaryInstructorId)),
          ),
        );
    }

    const [updated] = await db
      .update(sessions)
      .set({
        ...(date !== undefined && { date }),
        ...(startTime !== undefined && { startTime }),
        ...(duration !== undefined && { duration: Number(duration) }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
        ...(room !== undefined && { room: room.trim() }),
        ...(primaryInstructorId !== undefined && {
          primaryInstructorId: Number(primaryInstructorId),
        }),
      })
      .where(eq(sessions.id, id))
      .returning();

    if (!updated) return errorResponse(res, 404, 'Session not found');
    return res.json(updated);
  }),
);

// ── DELETE /api/sessions/:id ───────────────────────────────────────────────────

router.delete(
  '/sessions/:id',
  requireRole('staff'),
  asyncHandler(async (req, res) => {
    const id = getIdParam(req.params.id);
    if (isNaN(id)) return errorResponse(res, 400, 'Invalid session ID');

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, id),
    });
    if (!session) return errorResponse(res, 404, 'Session not found');

    // Clean up dependent bookings and booking history defensively
    const sessionBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.sessionId, id));

    if (sessionBookings.length > 0) {
      const bookingIds = sessionBookings.map((b) => b.id);
      await db.delete(bookingHistory).where(inArray(bookingHistory.bookingId, bookingIds));
      await db.delete(bookings).where(eq(bookings.sessionId, id));
    }

    // Clean up co-instructors
    await db.delete(sessionCoInstructors).where(eq(sessionCoInstructors.sessionId, id));

    const [deleted] = await db
      .delete(sessions)
      .where(eq(sessions.id, id))
      .returning();

    return res.json({ message: 'Session deleted successfully', session: deleted });
  }),
);

// ── POST /api/sessions/:id/co-instructors (Goal 5) ─────────────────────────────
// Only studio staff can add a co-instructor

router.post(
  '/sessions/:id/co-instructors',
  requireRole('staff'),
  asyncHandler(async (req, res) => {
    const sessionId = getIdParam(req.params.id);
    if (isNaN(sessionId)) return errorResponse(res, 400, 'Invalid session ID');

    const { instructorId } = req.body;
    if (!instructorId) return errorResponse(res, 400, 'instructorId is required');

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
    });
    if (!session) return errorResponse(res, 404, 'Session not found');

    const instructor = await db.query.users.findFirst({
      where: eq(users.id, Number(instructorId)),
    });
    if (!instructor) return errorResponse(res, 404, 'Instructor not found');
    if (instructor.role !== 'instructor') {
      return errorResponse(res, 400, 'User must have instructor role');
    }

    if (session.primaryInstructorId === Number(instructorId)) {
      return errorResponse(res, 400, 'This user is already the primary instructor for this session');
    }

    // Check if already a co-instructor
    const existing = await db.query.sessionCoInstructors.findFirst({
      where: and(
        eq(sessionCoInstructors.sessionId, sessionId),
        eq(sessionCoInstructors.instructorId, Number(instructorId)),
      ),
    });
    if (existing) {
      return errorResponse(res, 400, 'Instructor is already a co-instructor on this session');
    }

    const [created] = await db
      .insert(sessionCoInstructors)
      .values({
        sessionId,
        instructorId: Number(instructorId),
      })
      .returning();

    return res.status(201).json({
      message: 'Co-instructor added successfully',
      coInstructor: { id: instructor.id, name: instructor.name, email: instructor.email },
      record: created,
    });
  }),
);

// ── DELETE /api/sessions/:id/co-instructors/:instructorId (Goal 5) ─────────────
// Only studio staff can remove a co-instructor

router.delete(
  '/sessions/:id/co-instructors/:instructorId',
  requireRole('staff'),
  asyncHandler(async (req, res) => {
    const sessionId = getIdParam(req.params.id);
    const instructorId = getIdParam(req.params.instructorId);
    if (isNaN(sessionId) || isNaN(instructorId)) {
      return errorResponse(res, 400, 'Invalid session ID or instructor ID');
    }

    const [deleted] = await db
      .delete(sessionCoInstructors)
      .where(
        and(
          eq(sessionCoInstructors.sessionId, sessionId),
          eq(sessionCoInstructors.instructorId, instructorId),
        ),
      )
      .returning();

    if (!deleted) {
      return errorResponse(res, 404, 'Co-instructor assignment not found');
    }

    return res.json({ message: 'Co-instructor removed successfully' });
  }),
);

// ── POST /api/classes/:classId/generate-schedule (Goal 7) ──────────────────────
// Bulk-generate recurring weekly sessions across a date range with conflict checking

router.post(
  '/classes/:classId/generate-schedule',
  requireRole('staff'),
  asyncHandler(async (req, res) => {
    const classId = getIdParam(req.params.classId);
    if (isNaN(classId)) return errorResponse(res, 400, 'Invalid class ID');

    const cls = await db.query.classes.findFirst({
      where: eq(classes.id, classId),
    });
    if (!cls) return errorResponse(res, 404, 'Class not found');

    const {
      startDate,       // "YYYY-MM-DD"
      endDate,         // "YYYY-MM-DD"
      dayOfWeek,       // 0-6 (0 = Sunday, 1 = Monday, etc.)
      startTime,       // "HH:MM"
      duration,        // minutes (optional, defaults to class default)
      capacity,        // optional, defaults to class default
      room,            // "Studio A"
      primaryInstructorId,
    } = req.body;

    if (!startDate || !endDate || dayOfWeek === undefined || !startTime || !room || !primaryInstructorId) {
      return errorResponse(
        res,
        400,
        'startDate, endDate, dayOfWeek, startTime, room, and primaryInstructorId are required',
      );
    }

    const instructor = await db.query.users.findFirst({
      where: eq(users.id, Number(primaryInstructorId)),
    });
    if (!instructor || instructor.role !== 'instructor') {
      return errorResponse(res, 400, 'Invalid instructor selected');
    }

    const sessionDuration = duration ? Number(duration) : cls.defaultDuration;
    const sessionCapacity = capacity ? Number(capacity) : cls.defaultCapacity;
    const targetDay = Number(dayOfWeek);

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + sessionDuration;

    // Generate list of dates matching dayOfWeek between startDate and endDate
    const candidateDates: string[] = [];
    const [sY, sM, sD] = startDate.split('-').map(Number);
    const [eY, eM, eD] = endDate.split('-').map(Number);
    const current = new Date(sY, sM - 1, sD, 12, 0, 0); // midday avoids any timezone/DST shift
    const end = new Date(eY, eM - 1, eD, 12, 0, 0);

    if (current > end) {
      return errorResponse(res, 400, 'startDate must be before or equal to endDate');
    }

    while (current <= end) {
      if (current.getDay() === targetDay) {
        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, '0');
        const d = String(current.getDate()).padStart(2, '0');
        candidateDates.push(`${y}-${m}-${d}`);
      }
      current.setDate(current.getDate() + 1);
    }

    if (candidateDates.length === 0) {
      return errorResponse(res, 400, 'No dates matched the chosen day of week in the given date range');
    }

    const created: any[] = [];
    const skipped: Array<{ date: string; reason: string }> = [];

    // Check conflicts for each candidate date
    for (const dateStr of candidateDates) {
      // Query existing sessions on this date
      const existingOnDate = await db.query.sessions.findMany({
        where: eq(sessions.date, dateStr),
        with: {
          class: { columns: { title: true } },
          primaryInstructor: { columns: { name: true } },
          coInstructors: true,
        },
      });

      const conflicts: string[] = [];

      for (const ex of existingOnDate) {
        const exStart = timeToMinutes(ex.startTime);
        const exEnd = exStart + ex.duration;

        // Overlap condition: startA < endB and startB < endA
        const isOverlapping = startMinutes < exEnd && exStart < endMinutes;

        if (isOverlapping) {
          const timeRange = `${ex.startTime} - ${minutesToTime(exEnd)}`;

          // 1. Room conflict
          if (ex.room.trim().toLowerCase() === room.trim().toLowerCase()) {
            conflicts.push(
              `Room '${room}' is already booked by "${ex.class?.title}" (${timeRange})`,
            );
          }

          // 2. Instructor conflict (primary or co-instructor)
          const isPrimaryConflict = ex.primaryInstructorId === Number(primaryInstructorId);
          const isCoConflict = ex.coInstructors.some(
            (ci) => ci.instructorId === Number(primaryInstructorId),
          );

          if (isPrimaryConflict || isCoConflict) {
            conflicts.push(
              `Instructor ${instructor.name} is already booked for "${ex.class?.title}" (${timeRange})`,
            );
          }
        }
      }

      if (conflicts.length > 0) {
        skipped.push({
          date: dateStr,
          reason: conflicts.join('; '),
        });
      } else {
        // Create session
        const [newSession] = await db
          .insert(sessions)
          .values({
            classId,
            date: dateStr,
            startTime,
            duration: sessionDuration,
            capacity: sessionCapacity,
            room,
            primaryInstructorId: Number(primaryInstructorId),
          })
          .returning();

        created.push(newSession);
      }
    }

    return res.status(201).json({
      summary: {
        totalCandidate: candidateDates.length,
        createdCount: created.length,
        skippedCount: skipped.length,
      },
      created,
      skipped,
    });
  }),
);

// ── GET /api/sessions/:id/export-csv (Goal 7) ──────────────────────────────────
// Export a session's attendance roster as a CSV file

router.get(
  '/sessions/:id/export-csv',
  asyncHandler(async (req, res) => {
    const sessionId = getIdParam(req.params.id);
    if (isNaN(sessionId)) return errorResponse(res, 400, 'Invalid session ID');

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
      with: {
        class: true,
        primaryInstructor: true,
        coInstructors: {
          with: { instructor: true },
        },
        bookings: {
          with: {
            member: true,
            history: {
              with: { changedByUser: true },
              orderBy: (h, { desc }) => [desc(h.createdAt)],
            },
          },
          orderBy: (b, { asc }) => [asc(b.createdAt)],
        },
      },
    });

    if (!session) return errorResponse(res, 404, 'Session not found');

    // Access check for instructor
    if (req.user!.role === 'instructor') {
      const isPrimary = session.primaryInstructorId === req.user!.userId;
      const isCo = session.coInstructors.some((ci) => ci.instructorId === req.user!.userId);
      if (!isPrimary && !isCo) {
        return errorResponse(res, 403, 'Access denied to this session');
      }
    }

    // Generate CSV
    const headers = [
      'Booking ID',
      'Member Name',
      'Member Email',
      'Membership Expiry',
      'Status',
      'Booked Date/Time',
      'Latest Audit Note',
      'Last Updated By',
    ];

    const escapeCsv = (val: any): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = session.bookings.map((b) => {
      const latestHistory = b.history?.[0];
      return [
        escapeCsv(b.id),
        escapeCsv(b.member?.name || 'Unknown'),
        escapeCsv(b.member?.email || ''),
        escapeCsv(b.member?.membershipExpiry || ''),
        escapeCsv(b.status.toUpperCase()),
        escapeCsv(b.createdAt),
        escapeCsv(latestHistory?.note || ''),
        escapeCsv(latestHistory?.changedByUser?.name || ''),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="session-${sessionId}-${session.date}-attendance.csv"`,
    );

    return res.status(200).send(csvContent);
  }),
);

export default router;
