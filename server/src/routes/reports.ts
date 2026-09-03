import { Router } from 'express';
import { eq, and, gte, lte, asc, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { sessions, users, sessionCoInstructors } from '../db/schema.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();

// Reports are restricted to studio staff
router.use(authenticate);
router.use(requireRole('staff'));

// ── GET /api/reports/payroll ──────────────────────────────────────────────────
// Calculates instructor payroll based on completed/taught sessions

router.get(
  '/payroll',
  asyncHandler(async (req, res) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Default to first day of current month up to today
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const defaultStartStr = firstDayOfMonth.toISOString().split('T')[0];

    const startDate = (req.query.startDate as string) || defaultStartStr;
    const endDate = (req.query.endDate as string) || todayStr;
    const primaryRate = parseFloat(req.query.primaryRate as string) || 50; // $50 default per session
    const coRate = parseFloat(req.query.coRate as string) || 35;          // $35 default per session

    // Fetch past sessions in range
    const pastSessions = await db.query.sessions.findMany({
      where: and(gte(sessions.date, startDate), lte(sessions.date, endDate)),
      with: {
        class: { columns: { title: true, discipline: true } },
        primaryInstructor: { columns: { id: true, name: true, email: true } },
        coInstructors: {
          with: {
            instructor: { columns: { id: true, name: true, email: true } },
          },
        },
        bookings: {
          columns: { status: true },
        },
      },
      orderBy: (s, { asc }) => [asc(s.date), asc(s.startTime)],
    });

    // Filter to only sessions that have finished
    const finishedSessions = pastSessions.filter((s) => {
      const sessionEnd = new Date(`${s.date}T${s.startTime}:00`).getTime() + s.duration * 60_000;
      return sessionEnd <= new Date().getTime();
    });

    // Get all instructors
    const allInstructors = await db.query.users.findMany({
      where: eq(users.role, 'instructor'),
      columns: { id: true, name: true, email: true },
      orderBy: (u, { asc }) => [asc(u.name)],
    });

    // Compute payroll per instructor
    const instructorPayroll = allInstructors.map((inst) => {
      const primarySessions: Array<{
        sessionId: number;
        date: string;
        startTime: string;
        duration: number;
        classTitle: string;
        room: string;
        attendedCount: number;
        role: 'primary';
        payout: number;
      }> = [];

      const coSessions: Array<{
        sessionId: number;
        date: string;
        startTime: string;
        duration: number;
        classTitle: string;
        room: string;
        attendedCount: number;
        role: 'co-instructor';
        payout: number;
      }> = [];

      for (const s of finishedSessions) {
        const attended = s.bookings.filter((b) => b.status === 'attended').length;

        if (s.primaryInstructorId === inst.id) {
          primarySessions.push({
            sessionId: s.id,
            date: s.date,
            startTime: s.startTime,
            duration: s.duration,
            classTitle: s.class?.title || 'Class',
            room: s.room,
            attendedCount: attended,
            role: 'primary',
            payout: primaryRate,
          });
        } else if (s.coInstructors.some((ci) => ci.instructor.id === inst.id)) {
          coSessions.push({
            sessionId: s.id,
            date: s.date,
            startTime: s.startTime,
            duration: s.duration,
            classTitle: s.class?.title || 'Class',
            room: s.room,
            attendedCount: attended,
            role: 'co-instructor',
            payout: coRate,
          });
        }
      }

      const totalPrimaryDuration = primarySessions.reduce((acc, s) => acc + s.duration, 0);
      const totalCoDuration = coSessions.reduce((acc, s) => acc + s.duration, 0);
      const totalDurationMins = totalPrimaryDuration + totalCoDuration;

      const primaryEarnings = primarySessions.length * primaryRate;
      const coEarnings = coSessions.length * coRate;
      const totalEarnings = primaryEarnings + coEarnings;

      return {
        instructorId: inst.id,
        instructorName: inst.name,
        instructorEmail: inst.email,
        primaryCount: primarySessions.length,
        primaryEarnings,
        coCount: coSessions.length,
        coEarnings,
        totalSessions: primarySessions.length + coSessions.length,
        totalHoursTaught: parseFloat((totalDurationMins / 60).toFixed(1)),
        totalEarnings,
        sessions: [...primarySessions, ...coSessions].sort((a, b) => a.date.localeCompare(b.date)),
      };
    });

    const totalStudioPayroll = instructorPayroll.reduce((acc, i) => acc + i.totalEarnings, 0);
    const totalSessionsTaught = instructorPayroll.reduce((acc, i) => acc + i.totalSessions, 0);
    const totalHoursTaught = parseFloat(
      instructorPayroll.reduce((acc, i) => acc + i.totalHoursTaught, 0).toFixed(1),
    );
    const activeInstructors = instructorPayroll.filter((i) => i.totalSessions > 0).length;

    return res.json({
      dateRange: { startDate, endDate },
      rates: { primaryRate, coRate },
      summary: {
        totalStudioPayroll,
        totalSessionsTaught,
        totalHoursTaught,
        activeInstructors,
      },
      instructors: instructorPayroll,
    });
  }),
);

// ── GET /api/reports/room-utilization ──────────────────────────────────────────
// Analyzes studio room capacity, booked hours, fill rates, and peak times

router.get(
  '/room-utilization',
  asyncHandler(async (req, res) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Default to last 30 days
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const defaultStartStr = thirtyDaysAgo.toISOString().split('T')[0];

    const startDate = (req.query.startDate as string) || defaultStartStr;
    const endDate = (req.query.endDate as string) || todayStr;
    const operatingHoursPerDay = parseFloat(req.query.operatingHours as string) || 12; // 8 AM to 8 PM = 12h

    // Calculate calendar days in range (inclusive)
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();
    const daysInRange = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1);

    // Available operational minutes per room across the date range
    const availableMinutesPerRoom = daysInRange * operatingHoursPerDay * 60;

    // Fetch sessions in range
    const sessionsList = await db.query.sessions.findMany({
      where: and(gte(sessions.date, startDate), lte(sessions.date, endDate)),
      with: {
        class: { columns: { title: true, discipline: true } },
        bookings: { columns: { status: true } },
      },
    });

    // Group sessions by room
    const roomMap: Record<
      string,
      {
        room: string;
        sessionsCount: number;
        bookedMinutes: number;
        totalCapacity: number;
        totalBookedAttended: number;
        peakTimes: {
          morningCount: number;   // < 12:00
          afternoonCount: number; // 12:00 - 17:00
          eveningCount: number;   // >= 17:00
        };
      }
    > = {};

    // Standard known studio rooms + any dynamically created rooms
    const knownRooms = ['Studio A', 'Studio B', 'Rooftop', 'Main Hall'];
    for (const r of knownRooms) {
      roomMap[r] = {
        room: r,
        sessionsCount: 0,
        bookedMinutes: 0,
        totalCapacity: 0,
        totalBookedAttended: 0,
        peakTimes: { morningCount: 0, afternoonCount: 0, eveningCount: 0 },
      };
    }

    for (const s of sessionsList) {
      if (!roomMap[s.room]) {
        roomMap[s.room] = {
          room: s.room,
          sessionsCount: 0,
          bookedMinutes: 0,
          totalCapacity: 0,
          totalBookedAttended: 0,
          peakTimes: { morningCount: 0, afternoonCount: 0, eveningCount: 0 },
        };
      }

      const rData = roomMap[s.room];
      rData.sessionsCount++;
      rData.bookedMinutes += s.duration;
      rData.totalCapacity += s.capacity;

      // Count booked & attended members
      const activeBookings = s.bookings.filter(
        (b) => b.status === 'booked' || b.status === 'attended',
      ).length;
      rData.totalBookedAttended += activeBookings;

      // Peak hour categorization
      const hour = parseInt(s.startTime.split(':')[0], 10);
      if (hour < 12) {
        rData.peakTimes.morningCount++;
      } else if (hour < 17) {
        rData.peakTimes.afternoonCount++;
      } else {
        rData.peakTimes.eveningCount++;
      }
    }

    // Compute metrics per room
    const roomsReport = Object.values(roomMap).map((r) => {
      const bookedHours = parseFloat((r.bookedMinutes / 60).toFixed(1));
      const operatingHours = parseFloat((availableMinutesPerRoom / 60).toFixed(1));
      const utilizationRate = parseFloat(
        Math.min(100, (r.bookedMinutes / availableMinutesPerRoom) * 100).toFixed(1),
      );

      const fillRate =
        r.totalCapacity > 0
          ? parseFloat(((r.totalBookedAttended / r.totalCapacity) * 100).toFixed(1))
          : 0;

      return {
        room: r.room,
        sessionsCount: r.sessionsCount,
        bookedHours,
        operatingHours,
        utilizationRate,
        fillRate,
        peakTimes: r.peakTimes,
      };
    });

    // Studio-wide metrics
    const totalBookedMinutes = roomsReport.reduce((acc, r) => acc + r.bookedHours * 60, 0);
    const totalOperatingMinutes = roomsReport.length * availableMinutesPerRoom;
    const overallUtilizationRate = parseFloat(
      Math.min(100, (totalBookedMinutes / (totalOperatingMinutes || 1)) * 100).toFixed(1),
    );

    return res.json({
      dateRange: { startDate, endDate, daysInRange },
      operatingWindow: { hoursPerDay: operatingHoursPerDay },
      summary: {
        totalRooms: roomsReport.length,
        overallUtilizationRate,
        totalBookedHours: parseFloat((totalBookedMinutes / 60).toFixed(1)),
        totalOperatingHours: parseFloat((totalOperatingMinutes / 60).toFixed(1)),
        totalSessionsHosted: sessionsList.length,
      },
      rooms: roomsReport,
    });
  }),
);

export default router;
