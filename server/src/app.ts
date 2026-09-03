import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import classRoutes from './routes/classes.js';
import sessionRoutes from './routes/sessions.js';
import bookingRoutes from './routes/bookings.js';
import memberRoutes from './routes/members.js';
import dashboardRoutes from './routes/dashboard.js';
import publicRoutes from './routes/public.js';
import reportRoutes from './routes/reports.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// ── Health check ───────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ─────────────────────────────────────────────────────────────────────

app.use('/api/public', publicRoutes); // Public unauthenticated routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api', sessionRoutes);      // /api/sessions/* and /api/classes/:id/sessions
app.use('/api', bookingRoutes);      // /api/bookings/* and /api/sessions/:id/bookings

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export { app };
export default app;
