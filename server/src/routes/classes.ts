import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { classes } from '../db/schema.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { asyncHandler, errorResponse, getIdParam } from '../utils/errors.js';

const router = Router();

// All class routes require authentication
router.use(authenticate);

// ── GET /api/classes ───────────────────────────────────────────────────────────
// Returns all classes. By default hides archived; pass ?include_archived=true.

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const includeArchived = req.query.include_archived === 'true';

    let result;
    if (includeArchived) {
      result = await db.query.classes.findMany({
        orderBy: (c, { desc }) => [desc(c.createdAt)],
      });
    } else {
      result = await db.query.classes.findMany({
        where: eq(classes.isArchived, false),
        orderBy: (c, { desc }) => [desc(c.createdAt)],
      });
    }

    return res.json(result);
  }),
);

// ── GET /api/classes/:id ───────────────────────────────────────────────────────

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = getIdParam(req.params.id);
    if (isNaN(id)) return errorResponse(res, 400, 'Invalid class ID');

    const cls = await db.query.classes.findFirst({
      where: eq(classes.id, id),
      with: {
        sessions: {
          with: {
            primaryInstructor: {
              columns: { id: true, name: true, email: true },
            },
          },
          orderBy: (s, { asc }) => [asc(s.date), asc(s.startTime)],
        },
      },
    });

    if (!cls) return errorResponse(res, 404, 'Class not found');
    return res.json(cls);
  }),
);

// ── POST /api/classes ──────────────────────────────────────────────────────────

router.post(
  '/',
  requireRole('staff'),
  asyncHandler(async (req, res) => {
    const { title, description, discipline, defaultDuration, defaultCapacity } = req.body;

    if (!title || !discipline || !defaultDuration || !defaultCapacity) {
      return errorResponse(
        res,
        400,
        'title, discipline, defaultDuration and defaultCapacity are required',
      );
    }

    const [created] = await db
      .insert(classes)
      .values({
        title,
        description: description || null,
        discipline,
        defaultDuration: Number(defaultDuration),
        defaultCapacity: Number(defaultCapacity),
      })
      .returning();

    return res.status(201).json(created);
  }),
);

// ── PUT /api/classes/:id ───────────────────────────────────────────────────────

router.put(
  '/:id',
  requireRole('staff'),
  asyncHandler(async (req, res) => {
    const id = getIdParam(req.params.id);
    if (isNaN(id)) return errorResponse(res, 400, 'Invalid class ID');

    const { title, description, discipline, defaultDuration, defaultCapacity } = req.body;

    const [updated] = await db
      .update(classes)
      .set({
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(discipline !== undefined && { discipline }),
        ...(defaultDuration !== undefined && { defaultDuration: Number(defaultDuration) }),
        ...(defaultCapacity !== undefined && { defaultCapacity: Number(defaultCapacity) }),
      })
      .where(eq(classes.id, id))
      .returning();

    if (!updated) return errorResponse(res, 404, 'Class not found');
    return res.json(updated);
  }),
);

// ── PATCH /api/classes/:id/archive ─────────────────────────────────────────────
// Toggles the archived state.

router.patch(
  '/:id/archive',
  requireRole('staff'),
  asyncHandler(async (req, res) => {
    const id = getIdParam(req.params.id);
    if (isNaN(id)) return errorResponse(res, 400, 'Invalid class ID');

    // Fetch current state
    const existing = await db.query.classes.findFirst({
      where: eq(classes.id, id),
    });
    if (!existing) return errorResponse(res, 404, 'Class not found');

    const [updated] = await db
      .update(classes)
      .set({ isArchived: !existing.isArchived })
      .where(eq(classes.id, id))
      .returning();

    return res.json(updated);
  }),
);

export default router;
