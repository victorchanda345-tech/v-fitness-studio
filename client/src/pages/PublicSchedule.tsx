import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, PublicSessionItem } from '../api/client';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  LogIn, 
  ChevronRight, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

interface PublicScheduleProps {
  onSignInClick?: () => void;
  onBackToApp?: () => void;
  onBackToHome?: () => void;
}

export const PublicSchedule: React.FC<PublicScheduleProps> = ({ 
  onSignInClick, 
  onBackToApp,
  onBackToHome 
}) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<PublicSessionItem[]>([]);
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');

  useEffect(() => {
    async function loadSchedule() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getPublicSchedule();
        setSessions(data.sessions);
        setDisciplines(data.disciplines);
      } catch (err: any) {
        setError(err.message || 'Failed to load public timetable');
      } finally {
        setLoading(false);
      }
    }
    loadSchedule();
  }, []);

  // Filtered sessions
  const filteredSessions = sessions.filter((s) => {
    const matchesDiscipline =
      selectedDiscipline === 'all' || s.discipline.toLowerCase() === selectedDiscipline.toLowerCase();
    const matchesDate = !selectedDateFilter || s.date === selectedDateFilter;
    return matchesDiscipline && matchesDate;
  });

  // Group by date for readable agenda view
  const groupedByDate: Record<string, PublicSessionItem[]> = {};
  for (const s of filteredSessions) {
    if (!groupedByDate[s.date]) {
      groupedByDate[s.date] = [];
    }
    groupedByDate[s.date].push(s);
  }

  const sortedDates = Object.keys(groupedByDate).sort();

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Top Brand Bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2.5rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            V Fitness Studio
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Public Timetable
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {onBackToHome && (
            <button onClick={onBackToHome} className="btn btn-secondary btn-sm">
              <ArrowLeft size={14} /> Back to Overview
            </button>
          )}
          {user ? (
            <button onClick={onBackToApp} className="btn btn-secondary btn-sm">
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
          ) : (
            <button onClick={onSignInClick} className="btn btn-primary btn-sm">
              <LogIn size={14} /> Staff / Instructor Login
            </button>
          )}
        </div>
      </header>

      {/* Hero Welcome */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Explore Our Classes & Sessions
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem' }}>
          Browse our live studio timetable across yoga, pilates, HIIT, dance, and conditioning. Real-time availability updated live.
        </p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Date Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
          
          {/* Discipline Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.25rem' }}>
              DISCIPLINE:
            </span>
            <button
              onClick={() => setSelectedDiscipline('all')}
              className={`btn ${selectedDiscipline === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ borderRadius: '20px', padding: '0.35rem 0.85rem' }}
            >
              All Disciplines
            </button>
            {disciplines.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDiscipline(d)}
                className={`btn ${selectedDiscipline.toLowerCase() === d.toLowerCase() ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                style={{ borderRadius: '20px', padding: '0.35rem 0.85rem' }}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Date Picker Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="publicDateFilter" style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'none' }}>
              Filter Date:
            </label>
            <input
              id="publicDateFilter"
              type="date"
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              style={{ width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
            />
            {selectedDateFilter && (
              <button onClick={() => setSelectedDateFilter('')} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.6rem' }}>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading live studio timetable…
        </div>
      )}

      {/* Agenda Grouped by Date */}
      {!loading && sortedDates.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {sortedDates.map((dateStr) => {
            const dateObj = new Date(`${dateStr}T12:00:00`);
            const formattedDate = dateObj.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });
            const daySessions = groupedByDate[dateStr];

            return (
              <section key={dateStr}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid var(--border-subtle)' 
                }}>
                  <Calendar size={18} color="var(--accent-primary)" />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formattedDate}</h2>
                  <span className="badge" style={{ fontSize: '0.75rem' }}>
                    {daySessions.length} session{daySessions.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
                  {daySessions.map((s) => (
                    <div 
                      key={s.id} 
                      className="glass-panel" 
                      style={{ 
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        {/* Header badges */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <span className="badge badge-booked">{s.discipline}</span>
                          {s.isFull ? (
                            <span className="badge badge-waitlisted">
                              Full ({s.waitlistedCount} waitlisted)
                            </span>
                          ) : (
                            <span className="badge badge-attended">
                              {s.spotsRemaining} spot{s.spotsRemaining === 1 ? '' : 's'} left
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>{s.classTitle}</h3>
                        {s.description && (
                          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
                            {s.description}
                          </p>
                        )}

                        {/* Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Clock size={14} color="var(--accent-cyan)" />
                            <span><strong>{s.startTime}</strong> ({s.duration} minutes)</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <MapPin size={14} color="var(--accent-amber)" />
                            <span>Room: {s.room}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Users size={14} color="var(--accent-purple)" />
                            <span>Instructor: <strong>{s.primaryInstructor}</strong></span>
                          </div>
                          {s.coInstructors.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--accent-primary)', paddingLeft: '1.25rem' }}>
                              <span>Co-taught with: {s.coInstructors.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                        {user ? (
                          <button onClick={onBackToApp} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                            Manage Booking in StudioPulse <ChevronRight size={14} />
                          </button>
                        ) : (
                          <button onClick={onSignInClick} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                            Sign In to Reserve a Spot <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {!loading && sortedDates.length === 0 && (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No sessions found matching your filter.</p>
          <button 
            onClick={() => { setSelectedDiscipline('all'); setSelectedDateFilter(''); }} 
            className="btn btn-secondary btn-sm"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
