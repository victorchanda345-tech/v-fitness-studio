import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  RefreshCw,
  LogOut,
  Users,
  CalendarCheck
} from 'lucide-react';
import { 
  api, 
  MemberProfile, 
  MemberSelfServiceBooking 
} from '../api/client';

interface MemberPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMember: MemberProfile | null;
  onMemberChange: (member: MemberProfile | null) => void;
  onBrowseClasses: () => void;
  onBookingCancelled?: () => void;
}

export const MemberPortalModal: React.FC<MemberPortalModalProps> = ({
  isOpen,
  onClose,
  currentMember,
  onMemberChange,
  onBrowseClasses,
  onBookingCancelled,
}) => {
  const [emailInput, setEmailInput] = useState(currentMember?.email || '');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [bookings, setBookings] = useState<MemberSelfServiceBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadBookings = async (emailToFetch: string) => {
    try {
      setLoading(true);
      setMessage(null);
      const res = await api.getMemberOnlineBookings(emailToFetch);
      onMemberChange(res.member);
      setBookings(res.bookings || []);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load member profile.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentMember?.email) {
      loadBookings(currentMember.email);
    }
  }, [isOpen, currentMember?.email]);

  if (!isOpen) return null;

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    loadBookings(emailInput.trim().toLowerCase());
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!currentMember?.email) return;
    if (!window.confirm('Are you sure you want to cancel this class booking?')) return;

    try {
      setCancellingId(bookingId);
      setMessage(null);
      const res = await api.cancelMemberOnlineBooking(bookingId, currentMember.email);
      setMessage({ 
        type: 'success', 
        text: res.message || 'Booking cancelled successfully.' 
      });
      // Reload bookings to reflect cancellation and promotions
      await loadBookings(currentMember.email);
      onBookingCancelled?.();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to cancel booking.' });
    } finally {
      setCancellingId(null);
    }
  };

  const upcomingBookings = bookings.filter(b => b.status === 'booked' || b.status === 'waitlisted');
  const pastBookings = bookings.filter(b => b.status !== 'booked' && b.status !== 'waitlisted');

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1100,
      backgroundColor: 'rgba(5, 6, 9, 0.86)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div 
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#0D0E13',
          border: '1px solid rgba(229, 36, 36, 0.35)',
          borderRadius: '12px',
          boxShadow: '0 25px 65px rgba(0, 0, 0, 0.9), 0 0 35px rgba(229, 36, 36, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(13, 14, 19, 0.95)',
        }}>
          <div>
            <div style={{
              fontSize: '0.725rem',
              fontWeight: 800,
              color: 'var(--crimson-primary)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '0.2rem',
            }}>
              <CalendarCheck size={13} />
              ONLINE MEMBER PORTAL
            </div>
            <h3 className="font-display" style={{ fontSize: '1.45rem', color: '#ffffff', letterSpacing: '0.02em' }}>
              MY BOOKINGS & MEMBERSHIP
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              color: '#ffffff',
              padding: '0.45rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>

          {/* If No Member Identified Yet */}
          {!currentMember ? (
            <div>
              <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Enter your member email address to view your booked class schedule, track waitlist status, or manage cancellations.
              </p>

              <form onSubmit={handleVerifySubmit}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="portal-email" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.4rem' }}>
                    Email Address
                  </label>
                  <input
                    id="portal-email"
                    type="email"
                    required
                    placeholder="e.g. rahul@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#14161F',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '6px',
                      padding: '0.75rem 1rem',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-crimson"
                  style={{ width: '100%', padding: '0.85rem', justifyContent: 'center' }}
                >
                  {loading ? 'LOOKING UP PROFILE…' : 'ACCESS MEMBER PORTAL →'}
                </button>
              </form>
            </div>
          ) : (
            /* Active Member View */
            <div>
              {/* Member Profile Banner */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '1.15rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                      {currentMember.name}
                    </h4>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      backgroundColor: currentMember.isExpired ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: currentMember.isExpired ? '#fb7185' : '#34d399',
                      border: currentMember.isExpired ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                    }}>
                      {currentMember.isExpired ? 'MEMBERSHIP EXPIRED' : 'ACTIVE MEMBER'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    {currentMember.email} • Expiry: <strong>{currentMember.membershipExpiry}</strong>{' '}
                    {!currentMember.isExpired && `(${currentMember.daysRemaining} days remaining)`}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => loadBookings(currentMember.email)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '4px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      padding: '0.4rem 0.65rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <RefreshCw size={12} />
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onMemberChange(null);
                      setBookings([]);
                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '4px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      padding: '0.4rem 0.65rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <LogOut size={12} />
                    Switch
                  </button>
                </div>
              </div>

              {/* Feedback Message */}
              {message && (
                <div style={{
                  backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(229, 36, 36, 0.12)',
                  border: message.type === 'success' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(229, 36, 36, 0.35)',
                  color: message.type === 'success' ? '#a7f3d0' : '#fca5a5',
                  padding: '0.85rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                }}>
                  {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Tab navigation */}
              <div style={{
                display: 'flex',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '1.25rem',
                gap: '1rem',
              }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('upcoming')}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === 'upcoming' ? '2px solid var(--crimson-primary)' : '2px solid transparent',
                    color: activeTab === 'upcoming' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    padding: '0.65rem 0.25rem',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <span>Upcoming Sessions</span>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '999px',
                    backgroundColor: activeTab === 'upcoming' ? 'var(--crimson-primary)' : 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                  }}>
                    {upcomingBookings.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === 'history' ? '2px solid var(--crimson-primary)' : '2px solid transparent',
                    color: activeTab === 'history' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    padding: '0.65rem 0.25rem',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <span>Past & Cancelled</span>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}>
                    {pastBookings.length}
                  </span>
                </button>
              </div>

              {/* Bookings List */}
              {activeTab === 'upcoming' ? (
                upcomingBookings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                      color: 'rgba(255, 255, 255, 0.4)',
                    }}>
                      <Calendar size={24} />
                    </div>
                    <h5 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '0.35rem' }}>No Active Bookings</h5>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                      You haven't reserved any upcoming studio sessions yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onBrowseClasses();
                      }}
                      className="btn-crimson"
                      style={{ padding: '0.65rem 1.25rem', fontSize: '0.825rem' }}
                    >
                      BROWSE CLASS SCHEDULE →
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {upcomingBookings.map((b) => (
                      <div
                        key={b.id}
                        style={{
                          backgroundColor: '#111319',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                          padding: '1.15rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.85rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <span style={{
                                fontSize: '0.675rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '3px',
                                backgroundColor: 'rgba(229, 36, 36, 0.15)',
                                color: 'var(--crimson-primary)',
                                border: '1px solid rgba(229, 36, 36, 0.3)',
                              }}>
                                {b.session.discipline}
                              </span>
                              <h5 style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: 800 }}>
                                {b.session.classTitle}
                              </h5>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <Calendar size={13} color="var(--crimson-primary)" />
                                {b.session.date}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <Clock size={13} color="var(--crimson-primary)" />
                                {b.session.startTime} ({b.session.duration} mins)
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <MapPin size={13} color="var(--crimson-primary)" />
                                {b.session.room}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <User size={13} color="var(--crimson-primary)" />
                                Coach {b.session.primaryInstructor}
                              </span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div style={{ textAlign: 'right' }}>
                            <span style={{
                              fontSize: '0.725rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '4px',
                              backgroundColor: b.status === 'booked' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: b.status === 'booked' ? '#34d399' : '#fbbf24',
                              border: b.status === 'booked' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(245, 158, 11, 0.35)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                            }}>
                              {b.status === 'booked' ? (
                                <>✓ CONFIRMED SPOT</>
                              ) : (
                                <><Users size={12} /> WAITLIST #{b.waitlistPosition || 1}</>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Cancellation Action */}
                        <div style={{
                          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                          paddingTop: '0.65rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                          <span style={{ fontSize: '0.725rem', color: 'rgba(255, 255, 255, 0.45)' }}>
                            Booked on {new Date(b.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            type="button"
                            disabled={cancellingId === b.id}
                            onClick={() => handleCancelBooking(b.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#f87171',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              transition: 'background-color 0.15s ease',
                              opacity: cancellingId === b.id ? 0.5 : 1,
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Trash2 size={13} />
                            {cancellingId === b.id ? 'Cancelling…' : 'Cancel Booking'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                /* History Tab */
                pastBookings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem' }}>
                    No past or cancelled bookings on record.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {pastBookings.map((b) => (
                      <div
                        key={b.id}
                        style={{
                          backgroundColor: '#111319',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '6px',
                          padding: '0.85rem 1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem', marginBottom: '0.15rem' }}>
                            {b.session.classTitle}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                            {b.session.date} • {b.session.startTime} • {b.session.room}
                          </div>
                        </div>

                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '3px',
                          backgroundColor: b.status === 'attended' 
                            ? 'rgba(16, 185, 129, 0.1)' 
                            : b.status === 'no_show' 
                            ? 'rgba(244, 63, 94, 0.1)' 
                            : 'rgba(255, 255, 255, 0.06)',
                          color: b.status === 'attended' 
                            ? '#34d399' 
                            : b.status === 'no_show' 
                            ? '#fb7185' 
                            : 'rgba(255, 255, 255, 0.5)',
                        }}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
