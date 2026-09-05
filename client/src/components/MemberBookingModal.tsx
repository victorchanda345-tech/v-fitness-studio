import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  CalendarCheck
} from 'lucide-react';
import { 
  api, 
  PublicSessionItem, 
  MemberProfile, 
  MemberSelfServiceBooking 
} from '../api/client';

interface MemberBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: PublicSessionItem | null;
  currentMember: MemberProfile | null;
  onMemberIdentified: (member: MemberProfile) => void;
  onBookingComplete: (booking: MemberSelfServiceBooking) => void;
  onOpenMyBookings: () => void;
}

export const MemberBookingModal: React.FC<MemberBookingModalProps> = ({
  isOpen,
  onClose,
  session,
  currentMember,
  onMemberIdentified,
  onBookingComplete,
  onOpenMyBookings,
}) => {
  const [email, setEmail] = useState(currentMember?.email || '');
  const [name, setName] = useState(currentMember?.name || '');
  const [isNewMember, setIsNewMember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<MemberSelfServiceBooking | null>(null);
  const [existingBooking, setExistingBooking] = useState<MemberSelfServiceBooking | null>(null);
  const [cancellingExisting, setCancellingExisting] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  const checkExistingBooking = async (emailToCheck: string) => {
    if (!emailToCheck || !session) return;
    try {
      const res = await api.getMemberOnlineBookings(emailToCheck);
      const found = res.bookings?.find(
        (b) => b.sessionId === session.id && (b.status === 'booked' || b.status === 'waitlisted')
      );
      if (found) {
        setExistingBooking(found);
      }
    } catch {
      // Ignore lookup failure
    }
  };

  useEffect(() => {
    if (currentMember) {
      setEmail(currentMember.email);
      setName(currentMember.name);
    }
  }, [currentMember]);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessBooking(null);
      setExistingBooking(null);
      setCancelMessage(null);
      if (currentMember?.email) {
        setEmail(currentMember.email);
        setName(currentMember.name);
        checkExistingBooking(currentMember.email);
      }
    }
  }, [isOpen, session, currentMember]);

  if (!isOpen || !session) return null;

  const handleEmailBlur = () => {
    const clean = email.trim().toLowerCase();
    if (clean && !existingBooking) {
      checkExistingBooking(clean);
    }
  };

  const handleCancelExistingSpot = async () => {
    if (!existingBooking) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;
    if (!window.confirm('Are you sure you want to cancel your reservation for this class session?')) return;

    try {
      setCancellingExisting(true);
      setError(null);
      await api.cancelMemberOnlineBooking(existingBooking.id, cleanEmail);
      setExistingBooking(null);
      setCancelMessage('Your reservation for this session was cancelled. The spot has been released.');
      onBookingComplete({
        ...existingBooking,
        status: 'cancelled',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to cancel spot');
    } finally {
      setCancellingExisting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCancelMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createMemberOnlineBooking({
        sessionId: session.id,
        email: cleanEmail,
        name: name.trim() ? name.trim() : undefined,
      });

      if (res.booking.member) {
        onMemberIdentified({
          id: res.booking.member.id,
          name: res.booking.member.name,
          email: res.booking.member.email,
          membershipExpiry: res.booking.member.membershipExpiry,
          isExpired: false,
          daysRemaining: 30,
        });
      }

      setSuccessBooking(res.booking);
      onBookingComplete(res.booking);
    } catch (err: any) {
      const errMsg = err.message || 'Failed to complete booking';
      if (errMsg.toLowerCase().includes('already have an active booking')) {
        setError(null);
        await checkExistingBooking(cleanEmail);
        // Fallback active booking object so the user sees the friendly confirmation view immediately
        setExistingBooking((prev) => prev || {
          id: 0,
          sessionId: session.id,
          status: errMsg.includes('WAITLISTED') ? 'waitlisted' : 'booked',
          createdAt: new Date().toISOString(),
          session: {
            id: session.id,
            classTitle: session.classTitle,
            discipline: session.discipline,
            date: session.date,
            startTime: session.startTime,
            duration: session.duration,
            room: session.room,
            primaryInstructor: session.primaryInstructor,
          }
        });
      } else if (errMsg.toLowerCase().includes('not registered') || errMsg.toLowerCase().includes('provide your full name')) {
        setIsNewMember(true);
        setError('New to V Fitness Studio? Please enter your full name below to activate your member access.');
      } else {
        setError(errMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  const isFull = session.spotsRemaining === 0;

  return createPortal(
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        backgroundColor: 'rgba(5, 6, 9, 0.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        boxSizing: 'border-box',
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#0D0E13',
          border: '1px solid rgba(229, 36, 36, 0.35)',
          borderRadius: '12px',
          boxShadow: '0 25px 65px rgba(0, 0, 0, 0.95), 0 0 35px rgba(229, 36, 36, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
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
              MEMBER SELF-SERVICE BOOKING
            </div>
            <h3 className="font-display" style={{ fontSize: '1.45rem', color: '#ffffff', letterSpacing: '0.02em' }}>
              {isFull ? 'JOIN CLASS WAITLIST' : 'RESERVE CLASS SPOT'}
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
              transition: 'background-color 0.15s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>

          {/* Session Summary Card */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '1.15rem 1.25rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                {session.classTitle}
              </h4>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '0.25rem 0.6rem',
                borderRadius: '4px',
                backgroundColor: isFull ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: isFull ? '#fbbf24' : '#34d399',
                border: isFull ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
              }}>
                {isFull ? `WAITLIST (${session.waitlistedCount})` : `${session.spotsRemaining} SPOTS OPEN`}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0.65rem',
              fontSize: '0.82rem',
              color: 'rgba(255, 255, 255, 0.75)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Calendar size={14} color="var(--crimson-primary)" />
                <span>{session.date}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Clock size={14} color="var(--crimson-primary)" />
                <span>{session.startTime} ({session.duration} mins)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <MapPin size={14} color="var(--crimson-primary)" />
                <span>{session.room}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <User size={14} color="var(--crimson-primary)" />
                <span>Coach {session.primaryInstructor}</span>
              </div>
            </div>
          </div>

          {/* Success Screen */}
          {successBooking ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: successBooking.status === 'booked' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                border: successBooking.status === 'booked' ? '1px solid #10b981' : '1px solid #f59e0b',
                color: successBooking.status === 'booked' ? '#10b981' : '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}>
                {successBooking.status === 'booked' ? <CheckCircle2 size={36} /> : <Users size={32} />}
              </div>

              <h4 className="font-display" style={{ fontSize: '1.65rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                {successBooking.status === 'booked' ? 'BOOKING CONFIRMED!' : 'ADDED TO WAITLIST!'}
              </h4>

              <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                {successBooking.status === 'booked'
                  ? `Your spot in ${session.classTitle} on ${session.date} at ${session.startTime} is secured.`
                  : `You are currently at Position #${successBooking.waitlistPosition || 1} on the waitlist. If a spot opens up, you will be automatically promoted.`}
              </p>

              <div style={{
                backgroundColor: '#111319',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.75rem',
                fontSize: '0.85rem',
                textAlign: 'left',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Member Name:</span>
                  <span style={{ color: '#ffffff', fontWeight: 700 }}>{name || email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Studio Space:</span>
                  <span style={{ color: '#ffffff', fontWeight: 700 }}>{session.room}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Status:</span>
                  <span style={{
                    color: successBooking.status === 'booked' ? '#34d399' : '#fbbf24',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  }}>
                    {successBooking.status === 'booked' ? '✓ CONFIRMED SPOT' : `WAITLIST POSITION #${successBooking.waitlistPosition || 1}`}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenMyBookings();
                  }}
                  className="btn-crimson"
                  style={{ padding: '0.75rem 1.5rem', fontSize: '0.85rem' }}
                >
                  VIEW MY BOOKINGS
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-athletic-outline"
                  style={{ padding: '0.75rem 1.5rem', fontSize: '0.85rem' }}
                >
                  CLOSE
                </button>
              </div>
            </div>
          ) : existingBooking ? (
            /* Active Reservation Screen (when member already booked) */
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: existingBooking.status === 'booked' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                border: existingBooking.status === 'booked' ? '1px solid #10b981' : '1px solid #f59e0b',
                color: existingBooking.status === 'booked' ? '#10b981' : '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}>
                {existingBooking.status === 'booked' ? <CheckCircle2 size={36} /> : <Users size={32} />}
              </div>

              <h4 className="font-display" style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '0.45rem' }}>
                {existingBooking.status === 'booked' ? 'YOU ALREADY HAVE A CONFIRMED SPOT!' : 'YOU ARE ON THE WAITLIST!'}
              </h4>

              <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                {existingBooking.status === 'booked'
                  ? `You already hold a confirmed reservation for ${session.classTitle} on ${session.date} at ${session.startTime}. Your spot is secured and ready!`
                  : `You are already registered on the waitlist for ${session.classTitle} on ${session.date}. If a spot opens up, you will be promoted automatically.`}
              </p>

              <div style={{
                backgroundColor: '#111319',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.75rem',
                fontSize: '0.85rem',
                textAlign: 'left',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Member Email:</span>
                  <span style={{ color: '#ffffff', fontWeight: 700 }}>{email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Studio Space:</span>
                  <span style={{ color: '#ffffff', fontWeight: 700 }}>{session.room}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Coach:</span>
                  <span style={{ color: '#ffffff', fontWeight: 700 }}>{session.primaryInstructor}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Reservation Status:</span>
                  <span style={{
                    color: existingBooking.status === 'booked' ? '#34d399' : '#fbbf24',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  }}>
                    {existingBooking.status === 'booked' ? '✓ CONFIRMED SPOT' : `WAITLIST POSITION #${existingBooking.waitlistPosition || 1}`}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenMyBookings();
                  }}
                  className="btn-crimson"
                  style={{ padding: '0.75rem 1.4rem', fontSize: '0.85rem' }}
                >
                  VIEW IN MY BOOKINGS
                </button>
                {existingBooking.id > 0 && (
                  <button
                    type="button"
                    disabled={cancellingExisting}
                    onClick={handleCancelExistingSpot}
                    className="btn-athletic-outline"
                    style={{
                      padding: '0.75rem 1.25rem',
                      fontSize: '0.85rem',
                      color: '#f87171',
                      borderColor: 'rgba(239, 68, 68, 0.35)',
                    }}
                  >
                    {cancellingExisting ? 'CANCELLING SPOT…' : 'CANCEL THIS SPOT'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-athletic-outline"
                  style={{ padding: '0.75rem 1.25rem', fontSize: '0.85rem' }}
                >
                  CLOSE
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit}>

              {/* Feedback Alert for Cancellations */}
              {cancelMessage && (
                <div style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#a7f3d0',
                  padding: '0.85rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                }}>
                  <CheckCircle2 size={18} color="#34d399" />
                  <span>{cancelMessage}</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div style={{
                  backgroundColor: 'rgba(229, 36, 36, 0.12)',
                  border: '1px solid rgba(229, 36, 36, 0.35)',
                  color: '#fca5a5',
                  padding: '0.85rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  lineHeight: 1.45,
                }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label htmlFor="member-email" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Member Email Address *
                    </label>
                  </div>
                  <input
                    id="member-email"
                    type="email"
                    required
                    placeholder="e.g. rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={handleEmailBlur}
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
                  {/* Quick Select Chips for Quick Testing */}
                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.4)' }}>Quick select:</span>
                    {['victorchanda345@gmail.com', 'rahul@example.com', 'sneha@example.com'].map((mEmail) => (
                      <button
                        key={mEmail}
                        type="button"
                        onClick={() => {
                          setEmail(mEmail);
                          checkExistingBooking(mEmail);
                        }}
                        style={{
                          background: email.toLowerCase() === mEmail.toLowerCase() ? 'rgba(229, 36, 36, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          border: email.toLowerCase() === mEmail.toLowerCase() ? '1px solid var(--crimson-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '4px',
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.7rem',
                          color: email.toLowerCase() === mEmail.toLowerCase() ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                          cursor: 'pointer',
                        }}
                      >
                        {mEmail.split('@')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {(isNewMember || !currentMember) && (
                  <div>
                    <label htmlFor="member-name" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.4rem' }}>
                      Full Name {isNewMember ? '(Required for Instant Registration)' : '(Optional)'}
                    </label>
                    <input
                      id="member-name"
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                )}
              </div>

              {/* Policy notes */}
              <div style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.5)',
                lineHeight: 1.45,
                marginBottom: '1.5rem',
                padding: '0.75rem 0.9rem',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <div>✓ <strong>Active Membership Required:</strong> Expired memberships cannot reserve sessions.</div>
                <div>✓ <strong>Waitlist Guarantee:</strong> If a confirmed member cancels, the spot auto-promotes sequentially.</div>
                <div>✓ <strong>Free Cancellation:</strong> You can self-cancel your spot online up to 2 hours before start.</div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-athletic-outline"
                  style={{ flex: 1, padding: '0.85rem', justifyContent: 'center' }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-crimson"
                  style={{ flex: 2, padding: '0.85rem', justifyContent: 'center', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'RESERVING SPOT...' : isFull ? 'JOIN WAITLIST' : 'CONFIRM CLASS SPOT'}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
};
