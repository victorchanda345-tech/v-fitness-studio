import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ArrowLeft, AlertCircle, Calendar } from 'lucide-react';

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
      padding: '2rem 1rem',
      position: 'relative',
    }}>
      <div 
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2.5rem',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {onBackToHome && (
          <button
            type="button"
            onClick={onBackToHome}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '1.5rem', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
          >
            <ArrowLeft size={14} />
            Back to Studio Home
          </button>
        )}

        {/* Header with branded logo mark */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.4rem',
            color: '#ffffff',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            marginBottom: '0.85rem',
          }}>
            V
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.35rem', letterSpacing: '-0.025em' }}>
            V Fitness Studio
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Staff & Instructor Management Portal
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="victor@vfitness.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', fontSize: '0.95rem' }}
          >
            {loading ? 'Signing in...' : (
              <>
                Sign in to Dashboard
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Logins for Reviewers */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem', textAlign: 'center' }}>
            Quick Demo Login (1-Click Fill)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <button
              type="button"
              onClick={() => { setEmail('victor@vfitness.com'); setPassword('password123'); }}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
            >
              <span><strong>Victor Sharma</strong> (Studio Manager)</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>victor@vfitness.com</span>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('priya@vfitness.com'); setPassword('password123'); }}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
            >
              <span><strong>Priya Patel</strong> (Staff Manager)</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>priya@vfitness.com</span>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('aarav@vfitness.com'); setPassword('password123'); }}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
            >
              <span><strong>Aarav Mehta</strong> (Instructor)</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>aarav@vfitness.com</span>
            </button>
          </div>
        </div>

        {onViewSchedule && (
          <div style={{
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <button
              type="button"
              onClick={onViewSchedule}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', fontSize: '0.85rem', padding: '0.65rem' }}
            >
              <Calendar size={15} />
              Browse Public Class Timetable
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
