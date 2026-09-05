import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User as UserIcon, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  RefreshCw,
  CalendarCheck,
  XCircle
} from 'lucide-react';
import { 
  api, 
  MemberUpcomingSession, 
  MemberSelfServiceBooking 
} from '../api/client';

interface MemberScheduleViewProps {
  initialTab?: 'sessions' | 'bookings';
}

export const MemberScheduleView: React.FC<MemberScheduleViewProps> = ({ initialTab = 'sessions' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'sessions' | 'bookings'>(initialTab);
  const [sessions, setSessions] = useState<MemberUpcomingSession[]>([]);
  const [bookings, setBookings] = useState<MemberSelfServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setMessage(null);

      // 1. Fetch read-only upcoming sessions list (class title, date, time, room, instructor name, spots remaining)
      const sessionsData = await api.getMemberUpcomingSessions(user.email);
      setSessions(sessionsData.sessions || []);

      // 2. Fetch member's personal bookings
      const bookingsData = await api.getMemberOnlineBookings(user.email);
      setBookings(bookingsData.bookings || []);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to load upcoming sessions schedule.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleBookSession = async (session: MemberUpcomingSession) => {
    if (!user) return;
    try {
      setActionLoadingId(session.id);
      setMessage(null);
      const res = await api.createMemberOnlineBooking({
        sessionId: session.id,
        email: user.email,
        name: user.name,
      });

      setMessage({
        type: 'success',
        text: res.message || `Successfully booked "${session.classTitle}".`,
      });

      await loadData();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to book session.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      setActionLoadingId(bookingId);
      setMessage(null);
      const res = await api.cancelMemberOnlineBooking(bookingId, user.email);

      setMessage({
        type: 'success',
        text: res.message || 'Booking cancelled successfully.',
      });

      await loadData();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to cancel booking.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const disciplines = Array.from(new Set(sessions.map((s) => s.discipline))).sort();

  const filteredSessions = sessions.filter((s) => {
    const matchesDiscipline =
      selectedDiscipline === 'all' ||
      s.discipline.toLowerCase() === selectedDiscipline.toLowerCase();

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.classTitle.toLowerCase().includes(q) ||
      s.instructorName.toLowerCase().includes(q) ||
      s.room.toLowerCase().includes(q) ||
      s.discipline.toLowerCase().includes(q);

    return matchesDiscipline && matchesSearch;
  });

  const activeBookings = bookings.filter(
    (b) => b.status === 'booked' || b.status === 'waitlisted'
  );
  const pastBookings = bookings.filter(
    (b) => b.status !== 'booked' && b.status !== 'waitlisted'
  );

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 0 3rem 0' }}>
      {/* Top Banner: Member Welcome & Membership Status */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(229, 36, 36, 0.12) 0%, rgba(13, 14, 18, 0.95) 100%)',
        border: '1px solid rgba(229, 36, 36, 0.3)',
        borderRadius: '12px',
        padding: '1.75rem 2rem',
        marginBottom: '1.75rem',
        position: 'relative',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <span style={{
                background: 'var(--crimson-primary)',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px'
              }}>
                MEMBER ACCESS
              </span>
              <span style={{
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#4ade80',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '4px'
              }}>
                Active Membership
              </span>
            </div>

            <h1 className="font-display" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)', color: '#ffffff', margin: '0 0 0.35rem 0', lineHeight: 1.15 }}>
              WELCOME, {user?.name.toUpperCase()}
            </h1>

            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.88rem', margin: 0 }}>
              Member Account: <strong style={{ color: '#ffffff' }}>{user?.email}</strong>
              {user?.membershipExpiry && (
                <span style={{ marginLeft: '1rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                  • Valid until: <span style={{ color: '#ffffff' }}>{user.membershipExpiry}</span>
                </span>
              )}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={loadData}
              disabled={loading}
              className="btn-athletic-outline"
              style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }}
              title="Refresh schedule"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              REFRESH
            </button>
          </div>
        </div>

        {/* Strict Privacy Guarantee Badge */}
        <div style={{
          marginTop: '1.25rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.8)',
          lineHeight: 1.5
        }}>
          <ShieldCheck size={18} style={{ color: '#4ade80', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#ffffff' }}>Strict Member Privacy Protected:</strong> You are viewing a read-only list of upcoming studio sessions with class title, scheduled date &amp; time, room, instructor name, and spots remaining. Under strict privacy policy, attendee rosters and other members' information are confidential and never displayed.
          </div>
        </div>
      </div>

      {/* Alert / Notification message */}
      {message && (
        <div 
          className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}
          style={{ 
            marginBottom: '1.5rem',
            backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(229, 36, 36, 0.15)',
            borderColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(229, 36, 36, 0.4)',
            color: message.type === 'success' ? '#86efac' : '#fca5a5'
          }}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '1.75rem',
        paddingBottom: '0.5rem',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: activeTab === 'sessions' ? 'var(--crimson-primary)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'sessions' ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'sessions' ? '0 4px 15px rgba(229, 36, 36, 0.35)' : 'none'
            }}
          >
            <Calendar size={16} />
            Upcoming Sessions ({sessions.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: activeTab === 'bookings' ? 'var(--crimson-primary)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'bookings' ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'bookings' ? '0 4px 15px rgba(229, 36, 36, 0.35)' : 'none'
            }}
          >
            <CalendarCheck size={16} />
            My Bookings ({activeBookings.length})
          </button>
        </div>

        {activeTab === 'sessions' && (
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flex: '1 1 300px', maxWidth: '420px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search class, instructor, room..."
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(13, 14, 18, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  padding: '0.55rem 0.85rem 0.55rem 2.35rem',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: READ-ONLY UPCOMING SESSIONS LIST */}
      {activeTab === 'sessions' && (
        <div>
          {/* Discipline Filters */}
          {disciplines.length > 0 && (
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setSelectedDiscipline('all')}
                style={{
                  padding: '0.35rem 0.8rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  border: selectedDiscipline === 'all' ? '1px solid var(--crimson-primary)' : '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: selectedDiscipline === 'all' ? 'rgba(229, 36, 36, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  color: selectedDiscipline === 'all' ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                All Disciplines
              </button>
              {disciplines.map((disc) => (
                <button
                  key={disc}
                  type="button"
                  onClick={() => setSelectedDiscipline(disc)}
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    border: selectedDiscipline === disc ? '1px solid var(--crimson-primary)' : '1px solid rgba(255, 255, 255, 0.12)',
                    backgroundColor: selectedDiscipline === disc ? 'rgba(229, 36, 36, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    color: selectedDiscipline === disc ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {disc}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 1rem auto' }} />
              <div>Loading upcoming studio sessions…</div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: 'rgba(13, 14, 18, 0.6)',
              borderRadius: '12px',
              border: '1px dashed rgba(255, 255, 255, 0.12)',
              color: 'rgba(255, 255, 255, 0.6)'
            }}>
              <Calendar size={36} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                No Upcoming Sessions Found
              </div>
              <div>Try adjusting your search query or discipline filter.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
              {filteredSessions.map((session) => {
                const spotsLeft = session.spotsRemaining;
                const isFull = session.isFull || spotsLeft <= 0;
                const myStatus = session.myBookingStatus;

                return (
                  <div
                    key={session.id}
                    style={{
                      backgroundColor: 'rgba(13, 14, 18, 0.88)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: myStatus === 'booked' 
                        ? '1px solid rgba(34, 197, 94, 0.5)' 
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '1.35rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
                      transition: 'transform 0.2s ease, border-color 0.2s ease',
                    }}
                  >
                    {/* Header: Title & Discipline */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.65rem' }}>
                        <div>
                          <span style={{
                            display: 'inline-block',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: 'var(--crimson-primary)',
                            marginBottom: '0.25rem'
                          }}>
                            {session.discipline}
                          </span>
                          <h3 style={{
                            fontSize: '1.2rem',
                            fontWeight: 800,
                            color: '#ffffff',
                            margin: 0,
                            lineHeight: 1.2
                          }}>
                            {session.classTitle}
                          </h3>
                        </div>

                        {/* Status Badge */}
                        {myStatus === 'booked' ? (
                          <span style={{
                            backgroundColor: 'rgba(34, 197, 94, 0.15)',
                            color: '#4ade80',
                            border: '1px solid rgba(34, 197, 94, 0.35)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            flexShrink: 0
                          }}>
                            BOOKED
                          </span>
                        ) : myStatus === 'waitlisted' ? (
                          <span style={{
                            backgroundColor: 'rgba(234, 179, 8, 0.15)',
                            color: '#facc15',
                            border: '1px solid rgba(234, 179, 8, 0.35)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            flexShrink: 0
                          }}>
                            WAITLISTED
                          </span>
                        ) : null}
                      </div>

                      {session.description && (
                        <p style={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.8rem',
                          lineHeight: 1.45,
                          margin: '0 0 1rem 0',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {session.description}
                        </p>
                      )}

                      {/* Required Session Meta Fields */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.75rem',
                        backgroundColor: 'rgba(7, 8, 11, 0.65)',
                        padding: '0.85rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        marginBottom: '1rem'
                      }}>
                        {/* Date */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Calendar size={14} style={{ color: 'var(--crimson-primary)', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.45)', textTransform: 'uppercase', fontWeight: 700 }}>
                              Date
                            </div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                              {session.date}
                            </div>
                          </div>
                        </div>

                        {/* Time */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={14} style={{ color: 'var(--crimson-primary)', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.45)', textTransform: 'uppercase', fontWeight: 700 }}>
                              Time
                            </div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                              {session.time || session.startTime} ({session.duration}m)
                            </div>
                          </div>
                        </div>

                        {/* Room */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <MapPin size={14} style={{ color: 'var(--crimson-primary)', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.45)', textTransform: 'uppercase', fontWeight: 700 }}>
                              Room
                            </div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                              {session.room}
                            </div>
                          </div>
                        </div>

                        {/* Instructor Name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <UserIcon size={14} style={{ color: 'var(--crimson-primary)', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.45)', textTransform: 'uppercase', fontWeight: 700 }}>
                              Instructor
                            </div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {session.instructorName}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Spots Remaining & Action Footer */}
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.65rem',
                        fontSize: '0.78rem'
                      }}>
                        <span style={{ color: 'rgba(255, 255, 255, 0.65)', fontWeight: 600 }}>
                          Spots Remaining:
                        </span>

                        <span style={{
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          color: isFull ? '#f87171' : spotsLeft <= 3 ? '#fbbf24' : '#4ade80',
                        }}>
                          {isFull ? '0 SPOTS LEFT (FULL)' : `${spotsLeft} of ${session.capacity} spots left`}
                        </span>
                      </div>

                      {/* Capacity Progress Bar */}
                      <div style={{
                        width: '100%',
                        height: '5px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '999px',
                        overflow: 'hidden',
                        marginBottom: '1rem'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(100, Math.round(((session.capacity - spotsLeft) / session.capacity) * 100))}%`,
                          backgroundColor: isFull ? '#ef4444' : spotsLeft <= 3 ? '#f59e0b' : 'var(--crimson-primary)',
                          borderRadius: '999px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>

                      {/* Action Button */}
                      {myStatus === 'booked' ? (
                        <div style={{
                          width: '100%',
                          padding: '0.65rem',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          borderRadius: '6px',
                          color: '#4ade80',
                          textAlign: 'center',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem'
                        }}>
                          <CheckCircle2 size={15} />
                          YOU ARE BOOKED IN THIS SESSION
                        </div>
                      ) : myStatus === 'waitlisted' ? (
                        <div style={{
                          width: '100%',
                          padding: '0.65rem',
                          backgroundColor: 'rgba(234, 179, 8, 0.1)',
                          border: '1px solid rgba(234, 179, 8, 0.3)',
                          borderRadius: '6px',
                          color: '#facc15',
                          textAlign: 'center',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem'
                        }}>
                          <Clock size={15} />
                          ON WAITLIST FOR AUTO-PROMOTION
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBookSession(session)}
                          disabled={actionLoadingId === session.id}
                          className={isFull ? 'btn-athletic-outline' : 'btn-crimson'}
                          style={{
                            width: '100%',
                            padding: '0.65rem',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            letterSpacing: '0.06em',
                            justifyContent: 'center',
                            borderRadius: '6px'
                          }}
                        >
                          {actionLoadingId === session.id ? (
                            'PROCESSING...'
                          ) : isFull ? (
                            'JOIN SESSION WAITLIST'
                          ) : (
                            'BOOK MY SPOT'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY BOOKINGS (CONFIDENTIAL SELF-SERVICE) */}
      {activeTab === 'bookings' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 className="font-display" style={{ fontSize: '1.35rem', color: '#ffffff', margin: '0 0 0.35rem 0' }}>
              ACTIVE CLASS RESERVATIONS
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.85rem', margin: 0 }}>
              Your personal class bookings and waitlist positions. Cancellations instantly auto-promote the next waitlisted member.
            </p>
          </div>

          {activeBookings.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: 'rgba(13, 14, 18, 0.6)',
              borderRadius: '12px',
              border: '1px dashed rgba(255, 255, 255, 0.12)',
              color: 'rgba(255, 255, 255, 0.6)'
            }}>
              <CalendarCheck size={36} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                No Active Reservations
              </div>
              <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem' }}>
                You haven't booked any upcoming sessions yet.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('sessions')}
                className="btn-crimson"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.8rem' }}
              >
                BROWSE UPCOMING SESSIONS
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeBookings.map((b) => {
                const isWaitlisted = b.status === 'waitlisted';

                return (
                  <div
                    key={b.id}
                    style={{
                      backgroundColor: 'rgba(13, 14, 18, 0.88)',
                      border: isWaitlisted 
                        ? '1px solid rgba(234, 179, 8, 0.3)' 
                        : '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '10px',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1.25rem',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <div style={{ flex: '1 1 300px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span style={{
                          backgroundColor: isWaitlisted ? 'rgba(234, 179, 8, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                          color: isWaitlisted ? '#facc15' : '#4ade80',
                          border: isWaitlisted ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
                          padding: '0.15rem 0.55rem',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em'
                        }}>
                          {isWaitlisted ? `WAITLIST #${b.waitlistPosition || 1}` : 'CONFIRMED BOOKING'}
                        </span>
                        <span style={{ color: 'var(--crimson-primary)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                          {b.session.discipline}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
                        {b.session.classTitle}
                      </h3>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={13} style={{ color: 'var(--crimson-primary)' }} />
                          {b.session.date}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={13} style={{ color: 'var(--crimson-primary)' }} />
                          {b.session.startTime} ({b.session.duration} min)
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MapPin size={13} style={{ color: 'var(--crimson-primary)' }} />
                          {b.session.room}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <UserIcon size={13} style={{ color: 'var(--crimson-primary)' }} />
                          {b.session.primaryInstructor}
                        </span>
                      </div>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(b.id)}
                        disabled={actionLoadingId === b.id}
                        style={{
                          backgroundColor: 'rgba(229, 36, 36, 0.12)',
                          border: '1px solid rgba(229, 36, 36, 0.4)',
                          color: '#f87171',
                          padding: '0.6rem 1rem',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--crimson-primary)';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(229, 36, 36, 0.12)';
                          e.currentTarget.style.color = '#f87171';
                        }}
                      >
                        <XCircle size={14} />
                        {actionLoadingId === b.id ? 'CANCELLING...' : 'CANCEL RESERVATION'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Past/Settled Booking History */}
          {pastBookings.length > 0 && (
            <div style={{ marginTop: '2.5rem' }}>
              <h3 className="font-display" style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.65)', marginBottom: '0.85rem' }}>
                PAST / CANCELLED ATTENDANCE
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {pastBookings.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      backgroundColor: 'rgba(13, 14, 18, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '6px',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      color: 'rgba(255, 255, 255, 0.6)'
                    }}
                  >
                    <div>
                      <strong style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{b.session.classTitle}</strong>
                      <span style={{ marginLeft: '0.75rem' }}>{b.session.date} at {b.session.startTime}</span>
                    </div>
                    <span style={{
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '3px',
                      backgroundColor: b.status === 'attended' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                      color: b.status === 'attended' ? '#4ade80' : 'rgba(255, 255, 255, 0.5)'
                    }}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
