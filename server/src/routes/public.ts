import { Router } from 'express';
import { eq, and, gte, lte, asc, desc, inArray, count, lt } from 'drizzle-orm';
import { db } from '../db/index.js';
import { sessions, classes, bookings, members, bookingHistory } from '../db/schema.js';
import { asyncHandler, errorResponse, getIdParam } from '../utils/errors.js';

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

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return formatYMD(d);
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

// ── POST /api/public/members/verify ───────────────────────────────────────────
// Member verification and instant self-service registration.
router.post(
  '/members/verify',
  asyncHandler(async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const name = req.body.name ? String(req.body.name).trim() : undefined;

    if (!email) {
      return errorResponse(res, 400, 'Member email address is required');
    }

    let member = await db.query.members.findFirst({
      where: eq(members.email, email),
    });

    if (!member) {
      if (!name) {
        return res.json({
          exists: false,
          message: 'No existing member found with this email. Enter your full name to instantly register your online membership.',
        });
      }

      // Automatically register newcomer with complimentary 30-day active trial
      const [created] = await db
        .insert(members)
        .values({
          name,
          email,
          membershipExpiry: daysFromNow(30),
        })
        .returning();
      member = created;
    }

    const todayStr = formatYMD(new Date());
    const isExpired = member.membershipExpiry < todayStr;
    const expiryDate = new Date(member.membershipExpiry);
    const daysRemaining = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return res.json({
      exists: true,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        membershipExpiry: member.membershipExpiry,
        isExpired,
        daysRemaining,
      },
    });
  }),
);

// ── GET /api/public/members/:email/bookings ───────────────────────────────────
// Member self-service bookings list with dynamic waitlist position tracking.
router.get(
  '/members/:email/bookings',
  asyncHandler(async (req, res) => {
    const email = String(req.params.email || '').trim().toLowerCase();
    if (!email) return errorResponse(res, 400, 'Email address is required');

    const member = await db.query.members.findFirst({
      where: eq(members.email, email),
    });

    if (!member) {
      return errorResponse(res, 404, 'Member profile not found');
    }

    const todayStr = formatYMD(new Date());
    const isExpired = member.membershipExpiry < todayStr;
    const expiryDate = new Date(member.membershipExpiry);
    const daysRemaining = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const memberBookings = await db.query.bookings.findMany({
      where: eq(bookings.memberId, member.id),
      with: {
        session: {
          with: {
            class: true,
            primaryInstructor: { columns: { name: true } },
          },
        },
      },
      orderBy: (b, { desc }) => [desc(b.createdAt)],
    });

    // Compute waitlist positions dynamically for all waitlisted bookings
    const formatted = await Promise.all(
      memberBookings.map(async (b) => {
        let waitlistPosition: number | undefined;
        if (b.status === 'waitlisted') {
          const [{ value: earlierCount }] = await db
            .select({ value: count() })
            .from(bookings)
            .where(
              and(
                eq(bookings.sessionId, b.sessionId),
                eq(bookings.status, 'waitlisted'),
                lt(bookings.createdAt, b.createdAt),
              ),
            );
          waitlistPosition = Number(earlierCount) + 1;
        }

        return {
          id: b.id,
          sessionId: b.sessionId,
          status: b.status,
          createdAt: b.createdAt.toISOString(),
          waitlistPosition,
          session: {
            id: b.session.id,
            classTitle: b.session.class.title,
            discipline: b.session.class.discipline,
            date: b.session.date,
            startTime: b.session.startTime,
            duration: b.session.duration,
            room: b.session.room,
            primaryInstructor: b.session.primaryInstructor?.name || 'Studio Instructor',
          },
        };
      }),
    );

    return res.json({
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        membershipExpiry: member.membershipExpiry,
        isExpired,
        daysRemaining,
      },
      bookings: formatted,
    });
  }),
);

// ── POST /api/public/bookings ─────────────────────────────────────────────────
// Member self-service booking creation.
// Enforces membership expiry rules, duplicate check, capacity, and auto-waitlist.
router.post(
  '/bookings',
  asyncHandler(async (req, res) => {
    const sessionId = Number(req.body.sessionId);
    const email = String(req.body.email || '').trim().toLowerCase();
    const name = req.body.name ? String(req.body.name).trim() : undefined;

    if (!sessionId || isNaN(sessionId)) {
      return errorResponse(res, 400, 'Valid sessionId is required');
    }
    if (!email) {
      return errorResponse(res, 400, 'Member email address is required');
    }

    // 1. Verify session exists
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
      with: {
        class: true,
        primaryInstructor: { columns: { name: true } },
      },
    });
    if (!session) return errorResponse(res, 404, 'Class session not found');

    // 2. Lookup or create member
    let member = await db.query.members.findFirst({
      where: eq(members.email, email),
    });

    if (!member) {
      if (!name) {
        return errorResponse(res, 400, 'Member not registered. Please provide your full name to create an account.');
      }
      const [created] = await db
        .insert(members)
        .values({
          name,
          email,
          membershipExpiry: daysFromNow(30),
        })
        .returning();
      member = created;
    }

    // 3. Strict membership expiry verification (Goal 4 & Goal 10)
    const todayStr = formatYMD(new Date());
    if (member.membershipExpiry < todayStr) {
      return errorResponse(
        res,
        400,
        `Cannot book session: Your membership expired on ${member.membershipExpiry}. Please renew with the studio front desk before booking.`,
      );
    }

    // 4. Duplicate booking check (Prevent multiple active bookings for same member & session)
    const existingBooking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.sessionId, sessionId),
        eq(bookings.memberId, member.id),
        inArray(bookings.status, ['booked', 'waitlisted']),
      ),
    });
    if (existingBooking) {
      return errorResponse(
        res,
        400,
        `You already have an active booking (${existingBooking.status.toUpperCase()}) for this session.`,
      );
    }

    // 5. Check session capacity to decide status (booked vs waitlisted)
    const [{ value: occupiedCount }] = await db
      .select({ value: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.sessionId, sessionId),
          inArray(bookings.status, ['booked', 'attended', 'no_show']),
        ),
      );

    const isFull = Number(occupiedCount) >= session.capacity;
    const status = isFull ? 'waitlisted' : 'booked';

    // 6. Create booking
    const [newBooking] = await db
      .insert(bookings)
      .values({
        sessionId,
        memberId: member.id,
        status,
      })
      .returning();

    // 7. Calculate waitlist position if waitlisted
    let waitlistPosition: number | undefined;
    if (status === 'waitlisted') {
      const [{ value: waitlistTotal }] = await db
        .select({ value: count() })
        .from(bookings)
        .where(
          and(
            eq(bookings.sessionId, sessionId),
            eq(bookings.status, 'waitlisted'),
          ),
        );
      waitlistPosition = Number(waitlistTotal);
    }

    // 8. Create immutable audit log entry
    await db.insert(bookingHistory).values({
      bookingId: newBooking.id,
      oldStatus: null,
      newStatus: status,
      changedBy: null,
      note: status === 'booked'
        ? `Online self-service booking confirmed for ${member.name} (${member.email})`
        : `Online self-service waitlist entry (Position #${waitlistPosition}) for ${member.name} (${member.email})`,
    });

    // Invalidate timetable cache so public spots reflect immediately
    scheduleCache.clear();

    return res.status(201).json({
      success: true,
      booking: {
        id: newBooking.id,
        sessionId: newBooking.sessionId,
        status: newBooking.status,
        createdAt: newBooking.createdAt.toISOString(),
        waitlistPosition,
        session: {
          id: session.id,
          classTitle: session.class.title,
          discipline: session.class.discipline,
          date: session.date,
          startTime: session.startTime,
          duration: session.duration,
          room: session.room,
          primaryInstructor: session.primaryInstructor?.name || 'Studio Instructor',
        },
        member: {
          id: member.id,
          name: member.name,
          email: member.email,
          membershipExpiry: member.membershipExpiry,
        },
      },
      message: status === 'booked'
        ? 'Class spot confirmed successfully!'
        : `Class is currently full. You have been added to the waitlist at Position #${waitlistPosition}.`,
    });
  }),
);

// ── PATCH /api/public/bookings/:id/cancel ─────────────────────────────────────
// Member self-service cancellation with automatic waitlist auto-promotion.
router.patch(
  '/bookings/:id/cancel',
  asyncHandler(async (req, res) => {
    const id = getIdParam(req.params.id);
    const email = String(req.body.email || '').trim().toLowerCase();

    if (isNaN(id)) return errorResponse(res, 400, 'Invalid booking ID');
    if (!email) return errorResponse(res, 400, 'Member email is required for cancellation verification');

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, id),
      with: {
        member: true,
        session: {
          with: { class: true },
        },
      },
    });

    if (!booking) return errorResponse(res, 404, 'Booking not found');

    // Security verify that this booking belongs to the caller
    if (booking.member.email.toLowerCase() !== email) {
      return errorResponse(res, 403, 'Unauthorized: you can only cancel your own bookings');
    }

    if (booking.status === 'cancelled') {
      return errorResponse(res, 400, 'This booking has already been cancelled.');
    }

    if (booking.status === 'attended' || booking.status === 'no_show') {
      return errorResponse(res, 400, `Cannot cancel an already completed session (${booking.status}).`);
    }

    const previousStatus = booking.status;

    // 1. Mark booking as cancelled
    const [cancelledBooking] = await db
      .update(bookings)
      .set({ status: 'cancelled' })
      .where(eq(bookings.id, id))
      .returning();

    // 2. Record cancellation in immutable history
    await db.insert(bookingHistory).values({
      bookingId: id,
      oldStatus: previousStatus,
      newStatus: 'cancelled',
      changedBy: null,
      note: `Online self-service cancellation by member ${booking.member.name}`,
    });

    // 3. Goal 4 Auto-Promotion: If cancelled booking held a spot, auto-promote next waitlisted
    let promotedMemberName: string | null = null;
    if (previousStatus === 'booked') {
      const nextWaitlisted = await db.query.bookings.findFirst({
        where: and(
          eq(bookings.sessionId, booking.sessionId),
          eq(bookings.status, 'waitlisted'),
        ),
        orderBy: (b, { asc }) => [asc(b.createdAt)],
        with: { member: true },
      });

      if (nextWaitlisted) {
        await db
          .update(bookings)
          .set({ status: 'booked' })
          .where(eq(bookings.id, nextWaitlisted.id));

        await db.insert(bookingHistory).values({
          bookingId: nextWaitlisted.id,
          oldStatus: 'waitlisted',
          newStatus: 'booked',
          changedBy: null,
          note: `Auto-promoted from waitlist following member self-service cancellation of booking #${id}`,
        });

        promotedMemberName = nextWaitlisted.member.name;
      }
    }

    // Invalidate schedule cache
    scheduleCache.clear();

    return res.json({
      success: true,
      booking: cancelledBooking,
      promotedMemberName,
      message: promotedMemberName
        ? `Booking cancelled. Next waitlisted member (${promotedMemberName}) was automatically promoted to a confirmed spot.`
        : 'Booking cancelled successfully.',
    });
  }),
);

export default router;
