import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import {
  users,
  classes,
  sessions,
  members,
  bookings,
  bookingHistory,
} from './schema.js';

// ── Connect ────────────────────────────────────────────────────────────────────

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

// ── Helpers ────────────────────────────────────────────────────────────────────

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function formatTime(h: number, m: number = 0): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ── Seed ───────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seeding V Fitness Studio database with Indian names…');

  // Clear existing tables in reverse dependency order
  await db.delete(bookingHistory);
  await db.delete(bookings);
  await db.delete(schema.sessionCoInstructors);
  await db.delete(sessions);
  await db.delete(classes);
  await db.delete(members);
  await db.delete(users);

  // ── 1. Users (Managers & Instructors with Indian Names) ──────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);

  const [
    staffVictor, 
    staffPriya, 
    instrAarav, 
    instrAnanya, 
    instrRohan,
    staffAliasAlice,
    instrAliasCarla,
    instrAliasDave
  ] = await db
    .insert(users)
    .values([
      // Primary Manager Victor & Staff Priya
      { email: 'victor@vfitness.com', passwordHash, name: 'Victor Sharma', role: 'staff' },
      { email: 'priya@vfitness.com', passwordHash, name: 'Priya Patel', role: 'staff' },
      
      // Fitness Instructors
      { email: 'aarav@vfitness.com', passwordHash, name: 'Aarav Mehta', role: 'instructor' },
      { email: 'ananya@vfitness.com', passwordHash, name: 'Ananya Iyer', role: 'instructor' },
      { email: 'rohan@vfitness.com', passwordHash, name: 'Rohan Verma', role: 'instructor' },

      // Legacy compatibility logins (also mapped to Victor & instructors)
      { email: 'alice@studio.com', passwordHash, name: 'Victor Sharma', role: 'staff' },
      { email: 'carla@studio.com', passwordHash, name: 'Aarav Mehta', role: 'instructor' },
      { email: 'dave@studio.com', passwordHash, name: 'Ananya Iyer', role: 'instructor' },
    ])
    .returning();

  console.log('  ✓ 8 users created (Staff & Instructors)');

  // ── 2. Classes ───────────────────────────────────────────────────────────────
  const [yoga, pilates, dance, hiit, spin] = await db
    .insert(classes)
    .values([
      {
        title: 'Morning Flow Yoga',
        description: 'A gentle, energising start to the day with traditional sun salutations and standing flows.',
        discipline: 'Yoga',
        defaultDuration: 60,
        defaultCapacity: 12,
      },
      {
        title: 'Core Pilates',
        description: 'Mat-based Pilates focusing on core strength, posture, and spinal alignment.',
        discipline: 'Pilates',
        defaultDuration: 45,
        defaultCapacity: 10,
      },
      {
        title: 'Bhangra Cardio & Dance',
        description: 'High-energy rhythmic cardio routines designed to burn calories and build stamina.',
        discipline: 'Dance',
        defaultDuration: 50,
        defaultCapacity: 15,
      },
      {
        title: 'HIIT Blast',
        description: 'High-intensity interval training mixing explosive bodyweight movements with short recovery.',
        discipline: 'HIIT',
        defaultDuration: 30,
        defaultCapacity: 20,
      },
      {
        title: 'Spin & Sweat',
        description: 'Indoor cycling class with resistance intervals and upbeat driving tracks.',
        discipline: 'Spin',
        defaultDuration: 45,
        defaultCapacity: 8,
        isArchived: true, // archived class for testing
      },
    ])
    .returning();

  console.log('  ✓ 5 classes created (1 archived)');

  // ── 3. Sessions ──────────────────────────────────────────────────────────────
  const sessionValues = [
    // Past sessions (for settled bookings)
    { classId: yoga.id, date: daysFromNow(-3), startTime: formatTime(7), duration: 60, capacity: 12, room: 'Studio A', primaryInstructorId: instrAarav.id },
    { classId: hiit.id, date: daysFromNow(-2), startTime: formatTime(18), duration: 30, capacity: 20, room: 'Studio B', primaryInstructorId: instrAnanya.id },
    { classId: pilates.id, date: daysFromNow(-1), startTime: formatTime(10), duration: 45, capacity: 10, room: 'Studio A', primaryInstructorId: instrRohan.id },

    // Today's sessions
    { classId: yoga.id, date: daysFromNow(0), startTime: formatTime(7), duration: 60, capacity: 12, room: 'Studio A', primaryInstructorId: instrAarav.id },
    { classId: dance.id, date: daysFromNow(0), startTime: formatTime(12), duration: 50, capacity: 15, room: 'Studio B', primaryInstructorId: instrAnanya.id },
    { classId: hiit.id, date: daysFromNow(0), startTime: formatTime(18), duration: 30, capacity: 20, room: 'Studio B', primaryInstructorId: instrRohan.id },

    // Future sessions
    { classId: yoga.id, date: daysFromNow(1), startTime: formatTime(7), duration: 60, capacity: 12, room: 'Studio A', primaryInstructorId: instrAarav.id },
    { classId: pilates.id, date: daysFromNow(1), startTime: formatTime(10), duration: 45, capacity: 10, room: 'Studio A', primaryInstructorId: instrAarav.id },
    { classId: dance.id, date: daysFromNow(2), startTime: formatTime(12), duration: 50, capacity: 15, room: 'Studio B', primaryInstructorId: instrAnanya.id },
    { classId: hiit.id, date: daysFromNow(3), startTime: formatTime(18), duration: 30, capacity: 20, room: 'Studio B', primaryInstructorId: instrAnanya.id },
    { classId: yoga.id, date: daysFromNow(5), startTime: formatTime(7), duration: 60, capacity: 12, room: 'Studio A', primaryInstructorId: instrRohan.id },
    { classId: pilates.id, date: daysFromNow(7), startTime: formatTime(10), duration: 45, capacity: 10, room: 'Studio A', primaryInstructorId: instrAarav.id },

    // A small-capacity session (for testing waitlisting)
    { classId: yoga.id, date: daysFromNow(4), startTime: formatTime(9), duration: 60, capacity: 2, room: 'Studio C', primaryInstructorId: instrAarav.id },
  ];

  const createdSessions = await db.insert(sessions).values(sessionValues).returning();
  console.log(`  ✓ ${createdSessions.length} sessions created`);

  // ── 4. Members (Indian Names) ───────────────────────────────────────────────
  const memberValues = [
    { name: 'Rahul Sharma', email: 'rahul@example.com', membershipExpiry: daysFromNow(90) },
    { name: 'Sneha Rao', email: 'sneha@example.com', membershipExpiry: daysFromNow(60) },
    { name: 'Kavita Desai', email: 'kavita@example.com', membershipExpiry: daysFromNow(30) },
    { name: 'Arjun Nair', email: 'arjun@example.com', membershipExpiry: daysFromNow(5) },   // expiring soon
    { name: 'Pooja Gupta', email: 'pooja@example.com', membershipExpiry: daysFromNow(3) },     // expiring very soon
    { name: 'Amitabh Sen', email: 'amitabh@example.com', membershipExpiry: daysFromNow(-10) }, // expired
    { name: 'Deepika Reddy', email: 'deepika@example.com', membershipExpiry: daysFromNow(-30) },  // expired
    { name: 'Kunal Kapoor', email: 'kunal@example.com', membershipExpiry: daysFromNow(120) },
  ];

  const createdMembers = await db.insert(members).values(memberValues).returning();
  console.log(`  ✓ ${createdMembers.length} members created`);

  // ── 5. Bookings + History ────────────────────────────────────────────────────

  // Helper to create a booking with its initial history entry
  async function createBooking(
    sessionId: number,
    memberId: number,
    status: 'booked' | 'waitlisted' | 'cancelled' | 'attended' | 'no_show',
    finalStatus?: 'attended' | 'no_show' | 'cancelled',
  ) {
    const initialStatus = finalStatus ? 'booked' : status;
    const [booking] = await db
      .insert(bookings)
      .values({ sessionId, memberId, status: finalStatus || status })
      .returning();

    // Initial history entry
    await db.insert(bookingHistory).values({
      bookingId: booking.id,
      oldStatus: null,
      newStatus: initialStatus === 'booked' ? 'booked' : status,
      changedBy: staffVictor.id,
      note: `Booking created – ${initialStatus === 'booked' ? 'booked' : status}`,
    });

    // Settlement history entry if the booking was settled
    if (finalStatus && (finalStatus === 'attended' || finalStatus === 'no_show')) {
      await db.insert(bookingHistory).values({
        bookingId: booking.id,
        oldStatus: 'booked',
        newStatus: finalStatus,
        changedBy: staffVictor.id,
        note: `Marked as ${finalStatus}`,
      });
    }

    if (finalStatus === 'cancelled') {
      await db.insert(bookingHistory).values({
        bookingId: booking.id,
        oldStatus: 'booked',
        newStatus: 'cancelled',
        changedBy: staffVictor.id,
        note: 'Booking cancelled by studio management',
      });
    }

    return booking;
  }

  const [rahul, sneha, kavita, arjun, pooja, amitabh, deepika, kunal] = createdMembers;
  const [pastYoga, pastHiit, pastPilates, todayYoga, todayDance, todayHiit, ...futureSessions] = createdSessions;
  const smallSession = createdSessions[createdSessions.length - 1]; // capacity 2

  // Past sessions — settled bookings
  await createBooking(pastYoga.id, rahul.id, 'booked', 'attended');
  await createBooking(pastYoga.id, sneha.id, 'booked', 'attended');
  await createBooking(pastYoga.id, kavita.id, 'booked', 'no_show');
  await createBooking(pastHiit.id, arjun.id, 'booked', 'attended');
  await createBooking(pastHiit.id, pooja.id, 'booked', 'attended');
  await createBooking(pastHiit.id, kunal.id, 'booked', 'no_show');
  await createBooking(pastPilates.id, rahul.id, 'booked', 'attended');
  await createBooking(pastPilates.id, sneha.id, 'booked', 'cancelled');

  // Today's sessions — active bookings
  await createBooking(todayYoga.id, rahul.id, 'booked');
  await createBooking(todayYoga.id, kavita.id, 'booked');
  await createBooking(todayYoga.id, arjun.id, 'booked');
  await createBooking(todayDance.id, pooja.id, 'booked');
  await createBooking(todayDance.id, kunal.id, 'booked');
  await createBooking(todayHiit.id, sneha.id, 'booked');

  // Future sessions — active bookings
  await createBooking(futureSessions[0].id, rahul.id, 'booked');
  await createBooking(futureSessions[0].id, kavita.id, 'booked');
  await createBooking(futureSessions[1].id, sneha.id, 'booked');

  // Small capacity session — test waitlisting
  await createBooking(smallSession.id, rahul.id, 'booked');
  await createBooking(smallSession.id, sneha.id, 'booked');      // fills capacity
  await createBooking(smallSession.id, kavita.id, 'waitlisted'); // waitlisted
  await createBooking(smallSession.id, arjun.id, 'waitlisted');   // waitlisted

  console.log('  ✓ ~22 bookings with history created');

  // ── Done ─────────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed complete!\n');
  console.log('V Fitness Studio Credentials:');
  console.log('  Manager:    victor@vfitness.com (Victor Sharma) / password123');
  console.log('  Manager:    priya@vfitness.com  (Priya Patel)   / password123');
  console.log('  Instructor: aarav@vfitness.com  (Aarav Mehta)   / password123');
  console.log('  Instructor: ananya@vfitness.com (Ananya Iyer)   / password123');
  console.log('  Instructor: rohan@vfitness.com  (Rohan Verma)   / password123');
  console.log('  Legacy:     alice@studio.com (Victor Sharma)    / password123');

  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
