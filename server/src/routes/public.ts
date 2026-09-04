import { Router } from 'express';
import { eq, and, gte, lte, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { sessions, classes, bookings } from '../db/schema.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();

interface CacheEntry {
  data: any;
  cachedAt: number;
}

const scheduleCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

function formatYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ── GET /api/public/schedule ──────────────────────────────────────────────────
// Unauthenticated public timetable for prospective and current members.
// Cached in-memory and on Edge CDN for high performance.

router.get(
  '/schedule',
  asyncHandler(async (req, res) => {
    const today = new Date();
    const todayStr = formatYMD(today);

    // Default to a 14-day window if no dates specified
    const in14Days = new Date(today);
    in14Days.setDate(today.getDate() + 14);
    const in14DaysStr = formatYMD(in14Days);

    const startDate = (req.query.startDate as string) || todayStr;
    const endDate = (req.query.endDate as string) || in14DaysStr;
    const disciplineFilter = req.query.discipline as string | undefined;

    const cacheKey = `${startDate}:${endDate}:${disciplineFilter || 'all'}`;
    const cached = scheduleCache.get(cacheKey);

    // Serve from in-memory cache if fresh
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300');
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached.data);
    }

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

    const responsePayload = {
      startDate,
      endDate,
      total: publicSessions.length,
      disciplines,
      sessions: publicSessions,
    };

    // Store in cache
    scheduleCache.set(cacheKey, { data: responsePayload, cachedAt: Date.now() });

    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300');
    res.setHeader('X-Cache', 'MISS');
    return res.json(responsePayload);
  }),
);

export default router;
