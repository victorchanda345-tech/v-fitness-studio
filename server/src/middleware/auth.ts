import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AuthUser {
  userId: number;
  role: 'staff' | 'instructor';
}

// Augment Express Request so req.user is typed everywhere
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// ── Middleware ──────────────────────────────────────────────────────────────────

/**
 * Verifies the Bearer token in the Authorization header and sets `req.user`.
 * Returns 401 if the token is missing, malformed, or expired.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Gate that rejects requests whose authenticated role is not in `roles`.
 * Must be placed after `authenticate`.
 */
export function requireRole(...roles: Array<'staff' | 'instructor'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: `This action requires one of the following roles: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
}
