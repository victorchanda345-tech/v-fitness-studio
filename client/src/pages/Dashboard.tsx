import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, DashboardStats, SessionItem } from '../api/client';
import { 
  Calendar, 
  Users, 
  Clock, 
  MapPin, 
  ArrowRight, 
  TrendingUp, 
  AlertCircle, 
  UserX, 
  CalendarCheck, 
  BarChart3, 
  Layers
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string, contextId?: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, isStaff } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [statsData, allSessions] = await Promise.all([
          api.getDashboardStats(),
          api.getSessions(),
        ]);
        setStats(statsData);
        setSessions(allSessions);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatYMD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayStr = formatYMD(new Date());
  const todaySessions = sessions.filter((s) => s.date === todayStr);

  // Maximum attendance in 8 weeks for scaling chart bars
  const maxWeeklyAttendance = stats
    ? Math.max(...stats.weeklyAttendance.map((w) => w.attended), 1)
    : 1;

  const totalStatusBookings = stats
    ? Object.values(stats.byStatus).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div style={{
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
            Hello, {user?.name}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isStaff 
              ? 'Real-time studio operations, booking analytics, and today’s schedule.' 
              : 'Your assigned sessions, roster overview, and teaching schedule.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => onNavigate('bookings')} 
            className="btn btn-secondary"
          >
            <CalendarCheck size={16} /> All Bookings
          </button>
          {isStaff && (
            <button 
              onClick={() => onNavigate('classes')} 
              className="btn btn-primary"
            >
              Manage Classes
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Headline Numbers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem',
      }}>
        {/* 1. Sessions Today */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Sessions Today
            </span>
            <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
              <Calendar size={16} color="var(--text-secondary)" />
            </div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {stats ? stats.headline.sessionsToday : todaySessions.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Scheduled for {todayStr}
          </div>
        </div>

        {/* 2. Bookings Made Today */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Bookings Made Today
            </span>
            <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
              <TrendingUp size={16} color="var(--text-secondary)" />
            </div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {stats ? stats.headline.bookingsMadeToday : 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Created within last 24h
          </div>
        </div>

        {/* 3. No-Shows This Week */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              No-Shows This Week
            </span>
            <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
              <UserX size={16} color="var(--text-secondary)" />
            </div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {stats ? stats.headline.noShowsThisWeek : 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Settled no-shows this calendar week
          </div>
        </div>

        {/* 4. Members Currently Waitlisted */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Currently Waitlisted
            </span>
            <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
              <Users size={16} color="var(--text-secondary)" />
            </div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {stats ? stats.headline.membersWaitlisted : 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Awaiting spot promotion
          </div>
        </div>
      </div>

      {/* ── 8-Week Attendance Chart (Goal 8 Requirement) ──────────────────── */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.25rem' }}>Weekly Attendance (Last 8 Weeks)</h2>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Count of attended members participating in class sessions per weekly cycle
            </p>
          </div>
        </div>

        {loading || !stats ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading attendance trends…
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Bars container */}
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(8, 1fr)', 
                gap: '0.85rem', 
                height: '180px', 
                alignItems: 'end',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid var(--border-subtle)'
              }}
            >
              {stats.weeklyAttendance.map((w, idx) => {
                const heightPercent = maxWeeklyAttendance > 0 
                  ? Math.max(8, Math.round((w.attended / maxWeeklyAttendance) * 100)) 
                  : 8;
                
                return (
                  <div 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      height: '100%', 
                      justifyContent: 'flex-end',
                      position: 'relative',
                    }}
                    title={`${w.weekLabel}: ${w.attended} attended (${w.total} total bookings)`}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem', color: w.attended > 0 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                      {w.attended}
                    </div>
                    <div 
                      style={{ 
                        width: '100%', 
                        maxWidth: '44px',
                        height: `${heightPercent}%`, 
                        borderRadius: '6px 6px 0 0',
                        background: w.attended > 0 
                          ? 'linear-gradient(180deg, #E52424 0%, #991B1B 100%)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        boxShadow: w.attended > 0 ? '0 0 12px rgba(229, 36, 36, 0.4)' : 'none',
                        transition: 'height 0.4s ease',
                      }} 
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '0.85rem', textAlign: 'center' }}>
              {stats.weeklyAttendance.map((w, idx) => (
                <div key={idx} style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {w.weekLabel.split('–')[0].trim()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bookings Breakdown by Status & Class (Goal 8 Requirement) ─────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* Status Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="var(--accent-cyan)" /> Bookings by Status
          </h2>

          {stats && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Progress bar */}
              <div style={{ height: '10px', borderRadius: '5px', display: 'flex', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                <div style={{ width: `${(stats.byStatus.booked / (totalStatusBookings || 1)) * 100}%`, background: '#3b82f6' }} title="Booked" />
                <div style={{ width: `${(stats.byStatus.attended / (totalStatusBookings || 1)) * 100}%`, background: '#10b981' }} title="Attended" />
                <div style={{ width: `${(stats.byStatus.waitlisted / (totalStatusBookings || 1)) * 100}%`, background: '#f59e0b' }} title="Waitlisted" />
                <div style={{ width: `${(stats.byStatus.no_show / (totalStatusBookings || 1)) * 100}%`, background: '#f43f5e' }} title="No Show" />
                <div style={{ width: `${(stats.byStatus.cancelled / (totalStatusBookings || 1)) * 100}%`, background: '#6b7280' }} title="Cancelled" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Booked</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#60a5fa' }}>{stats.byStatus.booked}</div>
                </div>
                <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Attended</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399' }}>{stats.byStatus.attended}</div>
                </div>
                <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Waitlisted</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24' }}>{stats.byStatus.waitlisted}</div>
                </div>
                <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>No Show</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fb7185' }}>{stats.byStatus.no_show}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Class Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={18} color="var(--crimson-primary)" /> Bookings by Class
          </h2>

          <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
            {stats && stats.byClass.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {stats.byClass.map((c) => (
                  <div 
                    key={c.classId}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.discipline}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {c.totalBookings} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>bookings</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {c.attendedCount} attended • {c.waitlistedCount} waitlisted
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                No class booking data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Today's Classes Section ───────────────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2>Today's Class Schedule ({todaySessions.length})</h2>
          <button onClick={() => onNavigate('sessions')} className="btn btn-secondary btn-sm">
            View Full Schedule <ArrowRight size={14} />
          </button>
        </div>

        {todaySessions.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No sessions scheduled for today ({todayStr}).
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {todaySessions.map((session) => (
              <div 
                key={session.id} 
                className="glass-panel" 
                style={{ 
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="badge badge-booked">Today</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Cap: {session.capacity}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>
                    {session.class?.title || 'Class Session'}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                    Discipline: <strong>{session.class?.discipline}</strong>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={14} color="var(--accent-cyan)" />
                      <span>{session.startTime} ({session.duration} mins)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} color="var(--accent-amber)" />
                      <span>{session.room}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Users size={14} color="var(--accent-purple)" />
                      <span>Instructor: {session.primaryInstructor?.name}</span>
                    </div>
                    {session.coInstructors && session.coInstructors.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)' }}>
                        <Users size={14} />
                        <span>Co-Instructors: {session.coInstructors.map((c) => c.name).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('session-detail', session.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  Manage Bookings <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
