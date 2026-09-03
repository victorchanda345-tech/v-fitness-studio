import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, MemberItem } from '../api/client';
import { Modal } from '../components/Modal';
import { 
  Plus, 
  Search, 
  Edit3, 
  Calendar, 
  Mail, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  AlertCircle 
} from 'lucide-react';

export const Members: React.FC = () => {
  const { isStaff } = useAuth();
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    membershipExpiry: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
  });

  const loadMembers = async (query?: string) => {
    try {
      setLoading(true);
      const data = await api.getMembers(query);
      setMembers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers(search);
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMember(formData);
      setIsCreateOpen(false);
      setFormData({
        name: '',
        email: '',
        membershipExpiry: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      });
      loadMembers(search);
    } catch (err: any) {
      setError(err.message || 'Failed to create member');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      await api.updateMember(editingMember.id, formData);
      setEditingMember(null);
      loadMembers(search);
    } catch (err: any) {
      setError(err.message || 'Failed to update member');
    }
  };

  const openEdit = (m: MemberItem) => {
    setEditingMember(m);
    setFormData({
      name: m.name,
      email: m.email,
      membershipExpiry: m.membershipExpiry,
    });
  };

  // Helper to determine expiry status
  const getExpiryStatus = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: 'Expired',
        color: '#f43f5e',
        badgeClass: 'badge-no_show',
        icon: <XCircle size={13} />,
      };
    } else if (diffDays <= 7) {
      return {
        label: `Expiring (${diffDays}d)`,
        color: '#f59e0b',
        badgeClass: 'badge-waitlisted',
        icon: <AlertTriangle size={13} />,
      };
    } else {
      return {
        label: 'Active',
        color: '#10b981',
        badgeClass: 'badge-booked',
        icon: <CheckCircle2 size={13} />,
      };
    }
  };

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
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Member Directory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Track client profiles, active memberships, and expiry dates
          </p>
        </div>

        {isStaff && (
          <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
            <Plus size={16} /> Add Member
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Search Input */}
      <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '420px' }}>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '2.5rem' }}
        />
        <Search
          size={16}
          color="var(--text-muted)"
          style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
        />
      </div>

      {/* Members Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Membership Expiry</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const status = getExpiryStatus(m.membershipExpiry);
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
                      {m.membershipExpiry}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${status.badgeClass}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      {status.icon}
                      {status.label}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {isStaff && (
                      <button
                        onClick={() => openEdit(m)}
                        className="btn btn-secondary btn-sm"
                        title="Edit member or renew expiry"
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {members.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                  {loading ? 'Searching members…' : 'No members found matching your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isCreateOpen || editingMember !== null}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingMember(null);
        }}
        title={editingMember ? 'Edit Member Details' : 'Add New Member'}
      >
        <form onSubmit={editingMember ? handleUpdate : handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="mName">Full Name</label>
            <input
              id="mName"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Jordan Smith"
            />
          </div>

          <div>
            <label htmlFor="mEmail">Email Address</label>
            <input
              id="mEmail"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jordan@example.com"
            />
          </div>

          <div>
            <label htmlFor="mExpiry">Membership Expiry Date</label>
            <input
              id="mExpiry"
              type="date"
              required
              value={formData.membershipExpiry}
              onChange={(e) => setFormData({ ...formData, membershipExpiry: e.target.value })}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              Setting a future date enables booking; past dates block new bookings by server rule.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingMember(null);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingMember ? 'Save Changes' : 'Create Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
