import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, SessionItem } from '../api/client';
import { 
  Clock, 
  MapPin, 
  Users, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';

interface SessionsProps {
  onNavigateToSession: (sessionId: number) => void;
}

export const Sessions: React.FC<SessionsProps> = ({ onNavigateToSession }) => {
  const { user, isStaff } = useAuth();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'primary' | 'co'>('all');

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await api.getSessions();
      setSessions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const primaryCount = sessions.filter((s) => s.primaryInstructorId === user?.id).length;
  const coCount = sessions.filter((s) => s.coInstructors?.some((ci) => ci.id === user?.id)).length;

  const filteredSessions = sessions.filter((s) => {
    if (dateFilter && s.date !== dateFilter) return false;
    if (!isStaff) {
      if (roleFilter === 'primary' && s.primaryInstructorId !== user?.id) return false;
      if (roleFilter === 'co' && !s.coInstructors?.some((ci) => ci.id === user?.id)) return false;
    }
    return true;
  });

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
            {isStaff ? 'All Studio Sessions' : 'My Teaching Schedule'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isStaff 
              ? 'View all scheduled sessions across instructors and rooms' 
              : 'Unified list of sessions where you are assigned as the primary instructor or co-instructor'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {!isStaff && (
            <div style={{ display: 'inline-flex', background: 'rgba(15, 23, 42, 0.6)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                className={`btn btn-sm ${roleFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
              >
                All Assigned ({sessions.length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('primary')}
                className={`btn btn-sm ${roleFilter === 'primary' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
              >
                Primary ({primaryCount})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('co')}
                className={`btn btn-sm ${roleFilter === 'co' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
              >
                Co-Instructor ({coCount})
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label htmlFor="filterDate" style={{ margin: 0, textTransform: 'none', color: 'var(--text-secondary)' }}>
              Date:
            </label>
            <input
              id="filterDate"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ width: 'auto' }}
            />
            {dateFilter && (
              <button onClick={() => setDateFilter('')} className="btn btn-secondary btn-sm">
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Sessions Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Class & Discipline</th>
              <th>Room</th>
              <th>Instructor(s)</th>
              {!isStaff && <th>Your Assignment</th>}
              <th>Capacity</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.map((s) => {
              const isPrimary = s.primaryInstructorId === user?.id;
              const isCo = s.coInstructors?.some((ci) => ci.id === user?.id);

              return (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.date}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} /> {s.startTime} ({s.duration}m)
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.class?.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.class?.discipline}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={13} color="var(--accent-amber)" />
                      {s.room}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Users size={13} color="var(--accent-purple)" />
                        <strong>{s.primaryInstructor?.name || `Instructor #${s.primaryInstructorId}`}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Primary)</span>
                      </div>
                      {s.coInstructors && s.coInstructors.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '1.1rem' }}>
                          Co: {s.coInstructors.map((ci) => ci.name).join(', ')}
                        </div>
                      )}
                    </div>
                  </td>
                  {!isStaff && (
                    <td>
                      {isPrimary ? (
                        <span className="badge badge-booked">Primary</span>
                      ) : isCo ? (
                        <span className="badge badge-instructor">Co-Instructor</span>
                      ) : (
                        <span className="badge">Viewer</span>
                      )}
                    </td>
                  )}
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {s.capacity} spots
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => onNavigateToSession(s.id)}
                      className="btn btn-primary btn-sm"
                    >
                      View Bookings <ArrowRight size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredSessions.length === 0 && (
              <tr>
                <td colSpan={isStaff ? 6 : 7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                  {loading ? 'Loading sessions…' : 'No sessions found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
