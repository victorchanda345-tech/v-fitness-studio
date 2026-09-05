import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ArrowLeft, AlertCircle, Calendar, UserCheck } from 'lucide-react';

interface LoginProps {
  onViewSchedule?: () => void;
  onBackToHome?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onViewSchedule, onBackToHome }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    { role: 'Studio Manager', name: 'Victor Chanda', email: 'victor@vfitness.com', pass: 'password123' },
    { role: 'Staff Manager', name: 'Priya Patel', email: 'priya@vfitness.com', pass: 'password123' },
    { role: 'Instructor', name: 'Aarav Mehta', email: 'aarav@vfitness.com', pass: 'password123' },
    { role: 'Instructor', name: 'Ananya Iyer', email: 'ananya@vfitness.com', pass: 'password123' },
    { role: 'Instructor', name: 'Rohan Verma', email: 'rohan@vfitness.com', pass: 'password123' },
  ];

  const handleSelectDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

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
        VICTOR CHANDA
      </div>

      <div 
        style={{
          width: '100%',
          maxWidth: '460px',
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
              marginBottom: '1.75rem',
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

        {/* Header with branded crimson logo mark */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #E52424 0%, #991B1B 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.6rem',
            fontFamily: 'var(--font-display)',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(229, 36, 36, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            marginBottom: '1rem',
          }}>
            V
          </div>

          <div className="eyebrow-red" style={{ justifyContent: 'center', marginBottom: '0.35rem' }}>
            <span className="eyebrow-square"></span>
            STAFF & INSTRUCTOR PORTAL
          </div>

          <h1 className="font-display" style={{
            fontSize: '2.2rem',
            color: '#ffffff',
            letterSpacing: '0.02em',
            lineHeight: 1.05,
            marginBottom: '0.35rem'
          }}>
            V FITNESS STUDIO
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>
            Secure operations access for studio staff & instructors
          </p>
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
              Staff Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@vfitness.com"
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
              placeholder="Enter your password"
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
                SIGN IN TO DASHBOARD
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Role Fillers */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--crimson-primary)',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <UserCheck size={14} />
            ONE-CLICK DEMO ACCESS
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {demoAccounts.map((acc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectDemo(acc.email, acc.pass)}
                style={{
                  background: email === acc.email ? 'rgba(229, 36, 36, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${email === acc.email ? 'var(--crimson-primary)' : 'rgba(255, 255, 255, 0.1)'}`,
                  color: email === acc.email ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                  borderRadius: '4px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left'
                }}
              >
                <strong style={{ color: email === acc.email ? '#ffffff' : '#fff' }}>{acc.name}</strong>
                <span style={{ color: 'rgba(255, 255, 255, 0.45)', marginLeft: '0.35rem', fontSize: '0.675rem' }}>({acc.role})</span>
              </button>
            ))}
          </div>
        </div>

        {onViewSchedule && (
          <div style={{
            marginTop: '1.5rem',
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
