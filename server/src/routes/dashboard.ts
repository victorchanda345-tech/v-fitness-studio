import { Router } from 'express';
import { eq, and, gte, lte, or, inArray, count, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  sessions,
  bookings,
  classes,
  sessionCoInstructors,
} from '../db/schema.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();
router.use(authenticate);

// ── GET /api/dashboard/stats (Goal 8: A Dashboard) ─────────────────────────────

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Start of today (UTC or local)
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    // Monday of current week
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday
    const distanceToMonday = (currentDay + 6) % 7;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - distanceToMonday);
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    // Instructor filter if applicable
    let instructorSessionIds: number[] | null = null;
    if (req.user!.role === 'instructor') {
      const coRecords = await db
        .select({ sessionId: sessionCoInstructors.sessionId })
        .from(sessionCoInstructors)
        .where(eq(sessionCoInstructors.instructorId, req.user!.userId));
      const coIds = coRecords.map((r) => r.sessionId);

      const mySessions = await db
        .select({ id: sessions.id })
        .from(sessions)
        .where(
          coIds.length > 0
            ? or(eq(sessions.primaryInstructorId, req.user!.userId), inArray(sessions.id, coIds))
            : eq(sessions.primaryInstructorId, req.user!.userId),
        );
      instructorSessionIds = mySessions.map((s) => s.id);
    }

    // 1. Sessions Today
    let sessionsTodayCount = 0;
    if (instructorSessionIds !== null) {
      if (instructorSessionIds.length > 0) {
        const [{ value }] = await db
          .select({ value: count() })
          .from(sessions)
          .where(
            and(eq(sessions.date, todayStr), inArray(sessions.id, instructorSessionIds)),
          );
        sessionsTodayCount = Number(value);
      }
    } else {
      const [{ value }] = await db
        .select({ value: count() })
        .from(sessions)
        .where(eq(sessions.date, todayStr));
      sessionsTodayCount = Number(value);
    }

    // 2. Bookings Made Today
    let bookingsTodayCount = 0;
    if (instructorSessionIds !== null) {
      if (instructorSessionIds.length > 0) {
        const [{ value }] = await db
          .select({ value: count() })
          .from(bookings)
          .where(
            and(
              gte(bookings.createdAt, todayStart),
              inArray(bookings.sessionId, instructorSessionIds),
            ),
          );
        bookingsTodayCount = Number(value);
      }
    } else {
      const [{ value }] = await db
        .select({ value: count() })
        .from(bookings)
        .where(gte(bookings.createdAt, todayStart));
      bookingsTodayCount = Number(value);
    }

    // 3. No-Shows This Week
    let noShowsThisWeekCount = 0;
    const noShowCondition = [
      eq(bookings.status, 'no_show'),
      gte(sessions.date, weekStartStr),
      lte(sessions.date, weekEndStr),
    ];
    if (instructorSessionIds !== null) {
      if (instructorSessionIds.length > 0) {
        noShowCondition.push(inArray(bookings.sessionId, instructorSessionIds));
      } else {
        noShowCondition.push(eq(bookings.id, -1)); // force 0 if no sessions
      }
    }
    const [{ value: noShowsVal }] = await db
      .select({ value: count() })
      .from(bookings)
      .innerJoin(sessions, eq(bookings.sessionId, sessions.id))
      .where(and(...noShowCondition));
    noShowsThisWeekCount = Number(noShowsVal);

    // 4. Members Currently Waitlisted
    let waitlistedCount = 0;
    const waitlistCondition = [eq(bookings.status, 'waitlisted')];
    if (instructorSessionIds !== null) {
      if (instructorSessionIds.length > 0) {
        waitlistCondition.push(inArray(bookings.sessionId, instructorSessionIds));
      } else {
        waitlistCondition.push(eq(bookings.id, -1));
      }
    }
    const [{ value: waitlistVal }] = await db
      .select({ value: count() })
      .from(bookings)
      .where(and(...waitlistCondition));
    waitlistedCount = Number(waitlistVal);

    // 5. Bookings Breakdown by Status
    const statusCounts = {
      booked: 0,
      waitlisted: 0,
      cancelled: 0,
      attended: 0,
      no_show: 0,
    };
    const allBookingsQuery = await db
      .select({ status: bookings.status, count: count() })
      .from(bookings)
      .where(
        instructorSessionIds !== null
          ? instructorSessionIds.length > 0
            ? inArray(bookings.sessionId, instructorSessionIds)
            : eq(bookings.id, -1)
          : undefined,
      )
      .groupBy(bookings.status);

    for (const row of allBookingsQuery) {
      if (row.status in statusCounts) {
        statusCounts[row.status as keyof typeof statusCounts] = Number(row.count);
      }
    }

    // 6. Bookings Breakdown by Class
    // 6. Bookings Breakdown by Class (Optimized with a single grouped query)
    const allClasses = await db.query.classes.findMany({
      columns: { id: true, title: true, discipline: true, isArchived: true },
      orderBy: (c, { asc }) => [asc(c.title)],
    });

    const classConditions = [];
    if (instructorSessionIds !== null) {
      if (instructorSessionIds.length > 0) {
        classConditions.push(inArray(sessions.id, instructorSessionIds));
      } else {
        classConditions.push(eq(sessions.id, -1));
      }
    }

    const classStatusCounts = await db
      .select({
        classId: sessions.classId,
        status: bookings.status,
        cnt: count(),
      })
      .from(bookings)
      .innerJoin(sessions, eq(bookings.sessionId, sessions.id))
      .where(classConditions.length > 0 ? and(...classConditions) : undefined)
      .groupBy(sessions.classId, bookings.status);

    const classStatsMap: Record<number, { total: number; attended: number; waitlisted: number }> = {};
    for (const row of classStatusCounts) {
      if (!classStatsMap[row.classId]) {
        classStatsMap[row.classId] = { total: 0, attended: 0, waitlisted: 0 };
      }
      const c = Number(row.cnt);
      classStatsMap[row.classId].total += c;
      if (row.status === 'attended') classStatsMap[row.classId].attended += c;
      if (row.status === 'waitlisted') classStatsMap[row.classId].waitlisted += c;
    }

    const byClassList = allClasses.map((c) => ({
      classId: c.id,
      title: c.title,
      discipline: c.discipline,
      isArchived: c.isArchived,
      totalBookings: classStatsMap[c.id]?.total || 0,
      attendedCount: classStatsMap[c.id]?.attended || 0,
      waitlistedCount: classStatsMap[c.id]?.waitlisted || 0,
    }));

    // 7. Attendance per week over the last 8 weeks (Optimized with parallel Promise.all)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weekIndices = [7, 6, 5, 4, 3, 2, 1, 0];

    const eightWeeksData = await Promise.all(
      weekIndices.map(async (i) => {
        const wStart = new Date(weekStart);
        wStart.setDate(weekStart.getDate() - i * 7);
        const wEnd = new Date(wStart);
        wEnd.setDate(wStart.getDate() + 6);

        const wStartStr = wStart.toISOString().split('T')[0];
        const wEndStr = wEnd.toISOString().split('T')[0];

        const weekCond = [
          gte(sessions.date, wStartStr),
          lte(sessions.date, wEndStr),
        ];
        if (instructorSessionIds !== null) {
          if (instructorSessionIds.length > 0) {
            weekCond.push(inArray(sessions.id, instructorSessionIds));
          } else {
            weekCond.push(eq(sessions.id, -1));
          }
        }

        const [totals, attendeds, noShows] = await Promise.all([
          db
            .select({ value: count() })
            .from(bookings)
            .innerJoin(sessions, eq(bookings.sessionId, sessions.id))
            .where(and(...weekCond)),
          db
            .select({ value: count() })
            .from(bookings)
            .innerJoin(sessions, eq(bookings.sessionId, sessions.id))
            .where(and(...weekCond, eq(bookings.status, 'attended'))),
          db
            .select({ value: count() })
            .from(bookings)
            .innerJoin(sessions, eq(bookings.sessionId, sessions.id))
            .where(and(...weekCond, eq(bookings.status, 'no_show'))),
        ]);

        const label = `${monthNames[wStart.getMonth()]} ${wStart.getDate()} – ${monthNames[wEnd.getMonth()]} ${wEnd.getDate()}`;

        return {
          weekLabel: label,
          startDate: wStartStr,
          endDate: wEndStr,
          attended: Number(attendeds[0].value),
          noShow: Number(noShows[0].value),
          total: Number(totals[0].value),
        };
      }),
    );

    return res.json({
      headline: {
        sessionsToday: sessionsTodayCount,
        bookingsMadeToday: bookingsTodayCount,
        noShowsThisWeek: noShowsThisWeekCount,
        membersWaitlisted: waitlistedCount,
      },
      byStatus: statusCounts,
      byClass: byClassList,
      weeklyAttendance: eightWeeksData,
    });
  }),
);

export default router;
