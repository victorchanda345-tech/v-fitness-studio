import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ArrowLeft, AlertCircle, Calendar } from 'lucide-react';

interface LoginProps {
  onViewSchedule?: () => void;
  onBackToHome?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onViewSchedule, onBackToHome }) => {
  const { login } = useAuth();
  const [portalMode, setPortalMode] = useState<'staff' | 'member'>('staff');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = (mode: 'staff' | 'member') => {
    setPortalMode(mode);
    setError(null);
    if (mode === 'member') {
      setEmail('rahul@example.com');
      setPassword('password123');
    } else {
      setEmail('admin@vfitness.com');
      setPassword('admin123');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1rem',
      position: 'relative',
      backgroundColor: '#07080B',
      backgroundImage: `
        radial-gradient(circle at 50% 25%, rgba(229, 36, 36, 0.3) 0%, rgba(180, 20, 20, 0.08) 45%, transparent 75%),
        radial-gradient(circle at 10% 80%, rgba(229, 36, 36, 0.06) 0%, transparent 40%)
      `,
      overflow: 'hidden'
    }}>
      {/* Background Watermark matching landing page */}
      <div style={{
        position: 'absolute',
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(5rem, 16vw, 16rem)',
        fontWeight: 900,
        color: 'rgba(255, 255, 255, 0.025)',
        textTransform: 'uppercase',
        letterSpacing: '-0.01em',
        pointerEvents: 'none',
        zIndex: 1,
        top: '12%',
        left: '50%',
        transform: 'translateX(-50%)',
        whiteSpace: 'nowrap',
        userSelect: 'none'
      }}>
        V FITNESS STUDIO
      </div>

      <div 
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '2.5rem 2.25rem',
          backgroundColor: 'rgba(13, 14, 18, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(229, 36, 36, 0.3)',
          borderRadius: '12px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(229, 36, 36, 0.15)',
          position: 'relative',
          zIndex: 2
        }}
      >
        {onBackToHome && (
          <button
            type="button"
            onClick={onBackToHome}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '4px',
              color: 'rgba(255, 255, 255, 0.75)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '0.4rem 0.85rem',
              cursor: 'pointer',
              marginBottom: '1.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--crimson-primary)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
            }}
          >
            <ArrowLeft size={13} />
            Back to Studio Home
          </button>
        )}

        {/* Studio Branding & Portal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.85rem',
            marginBottom: '0.65rem'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #E52424 0%, #991B1B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.5rem',
              fontFamily: 'var(--font-display)',
              color: '#ffffff',
              boxShadow: '0 6px 20px rgba(229, 36, 36, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              flexShrink: 0
            }}>
              V
            </div>

            <div style={{ textAlign: 'left' }}>
              <div className="font-display" style={{
                fontSize: '1.85rem',
                color: '#ffffff',
                letterSpacing: '0.02em',
                lineHeight: 1
              }}>
                V FITNESS STUDIO
              </div>
              <div style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--crimson-primary)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginTop: '0.2rem'
              }}>
                {portalMode === 'member' ? 'MEMBER PORTAL' : 'STAFF & INSTRUCTOR PORTAL'}
              </div>
            </div>
          </div>

          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            {portalMode === 'member' 
              ? 'Sign in to view upcoming sessions and your private bookings'
              : 'Secure operations access for studio staff & instructors'}
          </p>
        </div>

        {/* Portal Mode Switcher (Staff vs Member) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          backgroundColor: 'rgba(7, 8, 11, 0.7)',
          padding: '0.35rem',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '1.5rem'
        }}>
          <button
            type="button"
            onClick={() => handleSwitchMode('staff')}
            style={{
              padding: '0.6rem 0.5rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              transition: 'all 0.2s ease',
              backgroundColor: portalMode === 'staff' ? 'var(--crimson-primary)' : 'transparent',
              color: portalMode === 'staff' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
              boxShadow: portalMode === 'staff' ? '0 2px 10px rgba(229, 36, 36, 0.4)' : 'none'
            }}
          >
            Staff &amp; Instructors
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('member')}
            style={{
              padding: '0.6rem 0.5rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              transition: 'all 0.2s ease',
              backgroundColor: portalMode === 'member' ? 'var(--crimson-primary)' : 'transparent',
              color: portalMode === 'member' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
              boxShadow: portalMode === 'member' ? '0 2px 10px rgba(229, 36, 36, 0.4)' : 'none'
            }}
          >
            Member Sign-In
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem', backgroundColor: 'rgba(229, 36, 36, 0.15)', borderColor: 'rgba(229, 36, 36, 0.4)', color: '#fca5a5' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '0.45rem' }}>
              {portalMode === 'member' ? 'Member Email Address' : 'Staff & Instructor Email Address'}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={portalMode === 'member' ? 'e.g. rahul@example.com' : 'name@vfitness.com'}
              required
              autoComplete="email"
              style={{
                backgroundColor: 'rgba(7, 8, 11, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                color: '#ffffff',
                padding: '0.75rem 0.95rem',
                fontSize: '0.9rem',
                width: '100%'
              }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '0.45rem' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={portalMode === 'member' ? 'Enter password (e.g. password123)' : 'Enter your password'}
              required
              autoComplete="current-password"
              style={{
                backgroundColor: 'rgba(7, 8, 11, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                color: '#ffffff',
                padding: '0.75rem 0.95rem',
                fontSize: '0.9rem',
                width: '100%'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn-crimson"
            disabled={loading}
            style={{ width: '100%', padding: '0.9rem', marginTop: '0.35rem', fontSize: '0.9rem', justifyContent: 'center' }}
          >
            {loading ? 'AUTHENTICATING...' : (
              <>
                {portalMode === 'member' ? 'SIGN IN AS MEMBER' : 'SIGN IN TO DASHBOARD'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {onViewSchedule && (
          <div style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <button
              type="button"
              onClick={onViewSchedule}
              className="btn-athletic-outline"
              style={{ width: '100%', fontSize: '0.8rem', padding: '0.65rem', justifyContent: 'center' }}
            >
              <Calendar size={14} />
              BROWSE PUBLIC CLASS TIMETABLE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
