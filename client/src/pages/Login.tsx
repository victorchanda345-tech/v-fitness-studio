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

        {/* Header without logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
            V Fitness Studio
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Sign in to access studio management
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
              placeholder="name@studio.com"
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
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem' }}
          >
            {loading ? 'Signing in...' : (
              <>
                Sign in
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {onViewSchedule && (
          <div style={{
            marginTop: '1.75rem',
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
