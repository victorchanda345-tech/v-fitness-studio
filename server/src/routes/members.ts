import { Router } from 'express';
import { eq, ilike, or, lte } from 'drizzle-orm';
import { db } from '../db/index.js';
import { members } from '../db/schema.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { asyncHandler, errorResponse, getIdParam } from '../utils/errors.js';

const router = Router();

router.use(authenticate);

// ── GET /api/members ───────────────────────────────────────────────────────────
// List all members with optional search by name or email (staff & instructors only).

router.get(
  '/',
  requireRole('staff', 'instructor'),
  asyncHandler(async (req, res) => {
    const search = req.query.search as string | undefined;

    let result;
    if (search) {
      result = await db.query.members.findMany({
        where: or(
          ilike(members.name, `%${search}%`),
          ilike(members.email, `%${search}%`),
        ),
        orderBy: (m, { asc }) => [asc(m.name)],
      });
    } else {
      result = await db.query.members.findMany({
        orderBy: (m, { asc }) => [asc(m.name)],
      });
    }

    return res.json(result);
  }),
);

// ── GET /api/members/alerts (Goal 10: Expiring membership alerts) ─────────────
// Returns members whose expiry date is in <= 7 days or past, unless dismissed

router.get(
  '/alerts',
  requireRole('staff'),
  asyncHandler(async (_req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const in7Days = new Date(today);
    in7Days.setDate(today.getDate() + 7);
    const thresholdStr = in7Days.toISOString().split('T')[0];

    // Find members whose expiry is <= threshold
    const candidates = await db.query.members.findMany({
      where: lte(members.membershipExpiry, thresholdStr),
      orderBy: (m, { asc }) => [asc(m.membershipExpiry)],
    });

    // Filter out those where alert was dismissed for their current expiry date
    const activeAlerts = candidates
      .filter((m) => !m.dismissedAlertExpiry || m.dismissedAlertExpiry !== m.membershipExpiry)
      .map((m) => {
        const expiry = new Date(m.membershipExpiry);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          ...m,
          diffDays,
          isExpired: diffDays < 0,
        };
      });

    return res.json({
      count: activeAlerts.length,
      members: activeAlerts,
    });
  }),
);

// ── GET /api/members/:id ───────────────────────────────────────────────────────

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = getIdParam(req.params.id);
    if (isNaN(id)) return errorResponse(res, 400, 'Invalid member ID');

    // Strict Member Privacy: A member can only view their own profile
    if (req.user!.role === 'member' && req.user!.userId !== id) {
      return errorResponse(res, 403, 'Access forbidden: you can only view your own member profile');
    }

    const member = await db.query.members.findFirst({
      where: eq(members.id, id),
      with: {
        bookings: {
          with: {
            session: {
              with: {
                class: { columns: { id: true, title: true } },
              },
            },
          },
          orderBy: (b, { desc }) => [desc(b.createdAt)],
        },
      },
    });

    if (!member) return errorResponse(res, 404, 'Member not found');
    return res.json(member);
  }),
);

// ── POST /api/members ──────────────────────────────────────────────────────────

router.post(
  '/',
  requireRole('staff'),
  asyncHandler(async (req, res) => {
    const { name, email, membershipExpiry } = req.body;

    if (!name || !email || !membershipExpiry) {
      return errorResponse(res, 400, 'name, email and membershipExpiry are required');
    }

    // Check for duplicate email
    const existing = await db.query.members.findFirst({
      where: eq(members.email, email),
    });
    if (existing) {
      return errorResponse(res, 409, 'A member with this email already exists');
    }

    const [created] = await db
      .insert(members)
      .values({ name, email, membershipExpiry })
      .returning();

    return res.status(201).json(created);
  }),
);


// ── POST /api/members/:id/dismiss-alert (Goal 10) ──────────────────────────────
// Dismisses the alert for this member's current expiry date

router.post(
  '/:id/dismiss-alert',
  requireRole('staff'),
  asyncHandler(async (req, res) => {
    const id = getIdParam(req.params.id);
    if (isNaN(id)) return errorResponse(res, 400, 'Invalid member ID');

    const member = await db.query.members.findFirst({
      where: eq(members.id, id),
    });
    if (!member) return errorResponse(res, 404, 'Member not found');

    const [updated] = await db
      .update(members)
      .set({ dismissedAlertExpiry: member.membershipExpiry })
      .where(eq(members.id, id))
      .returning();

    return res.json({ message: 'Alert dismissed for current expiry date', member: updated });
  }),
);

// ── PUT /api/members/:id ───────────────────────────────────────────────────────

router.put(
  '/:id',
  requireRole('staff'),
  asyncHandler(async (req, res) => {
    const id = getIdParam(req.params.id);
    if (isNaN(id)) return errorResponse(res, 400, 'Invalid member ID');

    const { name, email, membershipExpiry } = req.body;

    const existing = await db.query.members.findFirst({
      where: eq(members.id, id),
    });
    if (!existing) return errorResponse(res, 404, 'Member not found');

    // If expiry date changed, reset dismissedAlertExpiry so the new date triggers alerts if needed
    const expiryChanged = membershipExpiry && membershipExpiry !== existing.membershipExpiry;

    const [updated] = await db
      .update(members)
      .set({
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(membershipExpiry !== undefined && { membershipExpiry }),
        ...(expiryChanged && { dismissedAlertExpiry: null }),
      })
      .where(eq(members.id, id))
      .returning();

    return res.json(updated);
  }),
);

export default router;
