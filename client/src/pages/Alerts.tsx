import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, MemberItem } from '../api/client';
import { Modal } from '../components/Modal';
import { 
  AlertTriangle, 
  XCircle, 
  Calendar, 
  Mail, 
  User, 
  Check, 
  Edit3, 
  RefreshCw,
  BellOff,
  AlertCircle
} from 'lucide-react';

interface AlertsProps {
  onAlertsCountChange?: (count: number) => void;
}

export const Alerts: React.FC<AlertsProps> = ({ onAlertsCountChange }) => {
  const { isStaff } = useAuth();
  const [alerts, setAlerts] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Renew modal
  const [renewingMember, setRenewingMember] = useState<MemberItem | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState('');

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getExpiringAlerts();
      setAlerts(res.members);
      if (onAlertsCountChange) {
        onAlertsCountChange(res.count);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load membership alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleDismiss = async (member: MemberItem) => {
    try {
      await api.dismissAlert(member.id);
      setSuccessMsg(`Alert dismissed for ${member.name}. It will not reappear unless their membership is renewed and later expires again.`);
      loadAlerts();
    } catch (err: any) {
      setError(err.message || 'Failed to dismiss alert');
    }
  };

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewingMember || !newExpiryDate) return;
    try {
      await api.updateMember(renewingMember.id, { membershipExpiry: newExpiryDate });
      setSuccessMsg(`Membership renewed for ${renewingMember.name} until ${newExpiryDate}.`);
      setRenewingMember(null);
      loadAlerts();
    } catch (err: any) {
      setError(err.message || 'Failed to renew membership');
    }
  };

  const openRenewModal = (m: MemberItem) => {
    setRenewingMember(m);
    // Default to +3 months from today
    const d = new Date();
    d.setDate(d.getDate() + 90);
    setNewExpiryDate(d.toISOString().split('T')[0]);
  };

  if (!isStaff) {
    return (
      <div className="alert alert-error" style={{ margin: '3rem auto', maxWidth: '600px' }}>
        <AlertCircle size={18} />
        <span>Access restricted: Only studio staff can view membership alerts.</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '2rem' }}>Membership Expiry Alerts</h1>
            <span className="badge badge-no_show" style={{ fontSize: '0.9rem', padding: '0.25rem 0.65rem' }}>
              {alerts.length} Active
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Track members whose access has lapsed or will expire within the next 7 days.
          </p>
        </div>

        <button onClick={loadAlerts} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Membership policy explanation box */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '1.25rem', 
          marginBottom: '2rem', 
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}
      >
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Membership Expiry Policy:
        </div>
        <div>
          Members listed below are blocked from creating new bookings if expired. You can dismiss an alert after contacting the member. If you subsequently renew their expiry to a later date and that new date eventually reaches the 7-day window, the alert will automatically re-appear.
        </div>
      </div>

      {/* Alerts Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Contact Email</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((m) => {
              const diffDays = m.diffDays ?? 0;
              const isPast = diffDays < 0;

              return (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                      <User size={15} color="var(--accent-primary)" />
                      {m.name}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                      <Mail size={13} />
                      {m.email}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={13} color="var(--text-muted)" />
                      <strong>{m.membershipExpiry}</strong>
                    </div>
                  </td>
                  <td>
                    {isPast ? (
                      <span className="badge badge-no_show" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <XCircle size={13} /> Expired {Math.abs(diffDays)} day{Math.abs(diffDays) === 1 ? '' : 's'} ago
                      </span>
                    ) : (
                      <span className="badge badge-waitlisted" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <AlertTriangle size={13} /> Expires in {diffDays} day{diffDays === 1 ? '' : 's'}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        onClick={() => openRenewModal(m)}
                        className="btn btn-primary btn-sm"
                        title="Set new expiry date"
                      >
                        <Edit3 size={13} /> Renew Expiry
                      </button>
                      <button
                        onClick={() => handleDismiss(m)}
                        className="btn btn-secondary btn-sm"
                        title="Dismiss alert for this expiry date"
                      >
                        <BellOff size={13} /> Dismiss
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {alerts.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  {loading ? 'Checking for alerts…' : 'No expiring or expired memberships requiring attention.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Renew Expiry Modal */}
      <Modal
        isOpen={renewingMember !== null}
        onClose={() => setRenewingMember(null)}
        title={`Renew Membership: ${renewingMember?.name}`}
      >
        <form onSubmit={handleRenew} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Expiry</label>
            <div style={{ fontWeight: 600, fontSize: '1rem', marginTop: '0.2rem' }}>
              {renewingMember?.membershipExpiry}
            </div>
          </div>

          <div>
            <label htmlFor="renewDate">New Membership Expiry Date</label>
            <input
              id="renewDate"
              type="date"
              required
              value={newExpiryDate}
              onChange={(e) => setNewExpiryDate(e.target.value)}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Selecting a future date will clear any dismissed status and permit the member to book classes again.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setRenewingMember(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Renewal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
