import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, members, sessionCoInstructors, sessions } from '../db/schema.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { asyncHandler, errorResponse, getIdParam } from '../utils/errors.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// ── POST /api/auth/login ───────────────────────────────────────────────────────

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required');
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // 1. First check staff and instructors in users table
    const user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    if (user) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return errorResponse(res, 401, 'Invalid email or password');
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' },
      );

      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    }

    // 2. If not a staff/instructor, check members table
    const member = await db.query.members.findFirst({
      where: eq(members.email, normalizedEmail),
    });

    if (member) {
      const token = jwt.sign(
        { userId: member.id, memberId: member.id, role: 'member' },
        JWT_SECRET,
        { expiresIn: '24h' },
      );

      return res.json({
        token,
        user: {
          id: member.id,
          email: member.email,
          name: member.name,
          role: 'member',
          membershipExpiry: member.membershipExpiry,
        },
      });
    }

    return errorResponse(res, 401, 'Invalid email or password');
  }),
);

// ── GET /api/auth/me ───────────────────────────────────────────────────────────

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    if (req.user!.role === 'member') {
      const member = await db.query.members.findFirst({
        where: eq(members.id, req.user!.userId),
        columns: { id: true, email: true, name: true, membershipExpiry: true },
      });

      if (!member) {
        return errorResponse(res, 404, 'Member not found');
      }

      return res.json({
        ...member,
        role: 'member',
      });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user!.userId),
      columns: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    return res.json(user);
  }),
);

// ── GET /api/auth/instructors ──────────────────────────────────────────────────
// Returns all users with role 'instructor' for scheduling and assignments

router.get(
  '/instructors',
  authenticate,
  asyncHandler(async (_req, res) => {
    const instructorList = await db.query.users.findMany({
      where: eq(users.role, 'instructor'),
      columns: { id: true, email: true, name: true, role: true },
      orderBy: (u, { asc }) => [asc(u.name)],
    });

    // Also attach primary sessions count for each instructor
    const enriched = await Promise.all(
      instructorList.map(async (inst) => {
        const assigned = await db.query.sessions.findMany({
          where: eq(sessions.primaryInstructorId, inst.id),
          columns: { id: true },
        });
        return {
          ...inst,
          assignedSessionsCount: assigned.length,
        };
      }),
    );

    return res.json(enriched);
  }),
);

// ── POST /api/auth/instructors ─────────────────────────────────────────────────
// Allows staff to add a new instructor

router.post(
  '/instructors',
  authenticate,
  requireRole('staff'),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return errorResponse(res, 400, 'Instructor name is required');
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return errorResponse(res, 400, 'A valid email address is required');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters long');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    if (existing) {
      return errorResponse(res, 400, `An account with email "${normalizedEmail}" already exists`);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [created] = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'instructor',
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    return res.status(201).json({
      ...created,
      assignedSessionsCount: 0,
    });
  }),
);

// ── DELETE /api/auth/instructors/:id ───────────────────────────────────────────
// Allows staff to remove an instructor (with safety checks against active sessions)

router.delete(
  '/instructors/:id',
  authenticate,
  requireRole('staff'),
  asyncHandler(async (req, res) => {
    const instructorId = getIdParam(req.params.id);

    if (isNaN(instructorId)) {
      return errorResponse(res, 400, 'Invalid instructor ID');
    }

    const instructor = await db.query.users.findFirst({
      where: eq(users.id, instructorId),
    });

    if (!instructor) {
      return errorResponse(res, 404, 'Instructor not found');
    }

    if (instructor.role !== 'instructor') {
      return errorResponse(res, 400, 'Target user is not an instructor');
    }

    // Safety check: Is this instructor assigned as primary instructor to any session?
    const assignedSessions = await db.query.sessions.findMany({
      where: eq(sessions.primaryInstructorId, instructorId),
      columns: { id: true, date: true, startTime: true },
    });

    if (assignedSessions.length > 0) {
      return errorResponse(
        res,
        400,
        `Cannot remove instructor "${instructor.name}" because they are assigned to ${assignedSessions.length} session(s). Please reassign or delete their sessions first.`,
      );
    }

    // Delete co-instructor assignments if any
    await db
      .delete(sessionCoInstructors)
      .where(eq(sessionCoInstructors.instructorId, instructorId));

    // Delete user
    await db.delete(users).where(eq(users.id, instructorId));

    return res.json({
      success: true,
      message: `Instructor "${instructor.name}" has been removed successfully.`,
    });
  }),
);

export default router;
