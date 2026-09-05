import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck
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

const DEMO_MEMBERS = [
  { name: 'Rahul Sharma', email: 'rahul@example.com', badge: 'Active (90d)' },
  { name: 'Sneha Rao', email: 'sneha@example.com', badge: 'Active (60d)' },
  { name: 'Arjun Nair', email: 'arjun@example.com', badge: 'Expiring (5d)' },
  { name: 'Amitabh Sen', email: 'amitabh@example.com', badge: 'Expired (-10d)' },
];

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
      if (currentMember) {
        setEmail(currentMember.email);
        setName(currentMember.name);
      }
    }
  }, [isOpen, session, currentMember]);

  if (!isOpen || !session) return null;

  const handleSelectDemo = (demo: typeof DEMO_MEMBERS[0]) => {
    setEmail(demo.email);
    setName(demo.name);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      if (errMsg.toLowerCase().includes('not registered') || errMsg.toLowerCase().includes('provide your full name')) {
        setIsNewMember(true);
        setError('New to V Fitness Studio? Please enter your full name below to activate your member access.');
      } else {
        setError(errMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isFull = session.spotsRemaining === 0;

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
          maxWidth: '560px',
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
              <Sparkles size={13} />
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
                  VIEW MY BOOKINGS →
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
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit}>

              {/* Demo Member Quick Select */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.65)',
                  marginBottom: '0.5rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  <ShieldCheck size={13} color="var(--crimson-primary)" />
                  QUICK SELECT ACTIVE MEMBER (OR TYPE CUSTOM):
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {DEMO_MEMBERS.map((demo) => {
                    const isSelected = email.toLowerCase() === demo.email.toLowerCase();
                    return (
                      <button
                        key={demo.email}
                        type="button"
                        onClick={() => handleSelectDemo(demo)}
                        style={{
                          backgroundColor: isSelected ? 'rgba(229, 36, 36, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                          border: isSelected ? '1px solid var(--crimson-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                          color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                          borderRadius: '4px',
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.725rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <span>{demo.name}</span>
                        <span style={{
                          fontSize: '0.65rem',
                          opacity: 0.75,
                          color: demo.badge.includes('Expired') ? '#f43f5e' : demo.badge.includes('Expiring') ? '#f59e0b' : '#10b981',
                        }}>
                          ({demo.badge})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

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
                  <label htmlFor="member-email" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.4rem' }}>
                    Member Email Address *
                  </label>
                  <input
                    id="member-email"
                    type="email"
                    required
                    placeholder="e.g. rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  {submitting ? 'RESERVING SPOT…' : isFull ? 'JOIN WAITLIST →' : 'CONFIRM CLASS SPOT →'}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
