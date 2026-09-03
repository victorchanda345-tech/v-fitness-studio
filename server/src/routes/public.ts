import { Router } from 'express';
import { eq, and, gte, lte, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { sessions, classes, bookings } from '../db/schema.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();

// ── GET /api/public/schedule ──────────────────────────────────────────────────
// Unauthenticated public timetable for prospective and current members

router.get(
  '/schedule',
  asyncHandler(async (req, res) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Default to a 14-day window if no dates specified
    const in14Days = new Date(today);
    in14Days.setDate(today.getDate() + 14);
    const in14DaysStr = in14Days.toISOString().split('T')[0];

    const startDate = (req.query.startDate as string) || todayStr;
    const endDate = (req.query.endDate as string) || in14DaysStr;
    const disciplineFilter = req.query.discipline as string | undefined;

    // Fetch sessions in range with class, primary instructor, and co-instructors
    const sessionList = await db.query.sessions.findMany({
      where: and(gte(sessions.date, startDate), lte(sessions.date, endDate)),
      with: {
        class: {
          columns: { id: true, title: true, description: true, discipline: true, isArchived: true },
        },
        primaryInstructor: {
          columns: { name: true },
        },
        coInstructors: {
          with: {
            instructor: { columns: { name: true } },
          },
        },
        bookings: {
          columns: { status: true },
        },
      },
      orderBy: (s, { asc }) => [asc(s.date), asc(s.startTime)],
    });

    // Filter out archived classes and optional discipline
    const publicSessions = sessionList
      .filter((s) => s.class && !s.class.isArchived)
      .filter((s) => !disciplineFilter || s.class.discipline.toLowerCase() === disciplineFilter.toLowerCase())
      .map((s) => {
        const bookedCount = s.bookings.filter((b) => b.status === 'booked').length;
        const waitlistedCount = s.bookings.filter((b) => b.status === 'waitlisted').length;
        const spotsRemaining = Math.max(0, s.capacity - bookedCount);

        return {
          id: s.id,
          classTitle: s.class.title,
          description: s.class.description,
          discipline: s.class.discipline,
          date: s.date,
          startTime: s.startTime,
          duration: s.duration,
          capacity: s.capacity,
          room: s.room,
          primaryInstructor: s.primaryInstructor?.name || 'Studio Instructor',
          coInstructors: s.coInstructors.map((ci) => ci.instructor.name),
          spotsRemaining,
          isFull: spotsRemaining === 0,
          waitlistedCount,
        };
      });

    // Collect available disciplines for quick filter buttons
    const disciplines = Array.from(new Set(publicSessions.map((s) => s.discipline))).sort();

    return res.json({
      startDate,
      endDate,
      total: publicSessions.length,
      disciplines,
      sessions: publicSessions,
    });
  }),
);

export default router;
