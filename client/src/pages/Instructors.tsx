import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, InstructorItem } from '../api/client';
import { Modal } from '../components/Modal';
import { 
  UserPlus, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Calendar,
  ShieldAlert
} from 'lucide-react';

export const Instructors: React.FC = () => {
  const { isStaff } = useAuth();
  const [instructors, setInstructors] = useState<InstructorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Add instructor modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Delete confirmation modal state
  const [deletingInstructor, setDeletingInstructor] = useState<InstructorItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchInstructors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getInstructors();
      setInstructors(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load instructors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const handleAddInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddSubmitting(true);
    try {
      await api.createInstructor({
        name: addName.trim(),
        email: addEmail.trim(),
        password: addPassword,
      });
      setIsAddOpen(false);
      setAddName('');
      setAddEmail('');
      setAddPassword('');
      setSuccessMsg(`Instructor "${addName.trim()}" added successfully.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchInstructors();
    } catch (err: any) {
      setAddError(err.message || 'Failed to add instructor');
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleDeleteInstructor = async () => {
    if (!deletingInstructor) return;
    setDeleteError(null);
    setDeleteSubmitting(true);
    try {
      await api.deleteInstructor(deletingInstructor.id);
      const name = deletingInstructor.name;
      setDeletingInstructor(null);
      setSuccessMsg(`Instructor "${name}" has been removed.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchInstructors();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to remove instructor');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (!isStaff) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', margin: '2rem auto', maxWidth: '600px' }}>
        <ShieldAlert size={32} color="var(--accent-rose)" style={{ marginBottom: '1rem' }} />
        <h3>Access Restricted</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Only studio management staff can manage the instructor roster.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
            Instructor Roster
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage certified fitness instructors, view teaching assignments, and invite new trainers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={fetchInstructors} 
            className="btn btn-secondary"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button 
            onClick={() => {
              setAddError(null);
              setIsAddOpen(true);
            }} 
            className="btn btn-primary"
          >
            <UserPlus size={16} />
            Add Instructor
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Instructors Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Instructor Name</th>
              <th>Contact Email</th>
              <th>Assigned Sessions</th>
              <th>Role</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {instructors.map((inst) => (
              <tr key={inst.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{inst.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID #{inst.id}</div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {inst.email}
                </td>
                <td>
                  <span className="badge badge-attended" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={12} />
                    {inst.assignedSessionsCount ?? 0} class{(inst.assignedSessionsCount ?? 0) === 1 ? '' : 'es'}
                  </span>
                </td>
                <td>
                  <span className="badge badge-instructor">
                    {inst.role}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => {
                      setDeleteError(null);
                      setDeletingInstructor(inst);
                    }}
                    className="btn btn-danger btn-sm"
                    title="Remove instructor"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </td>
              </tr>
            ))}

            {instructors.length === 0 && !loading && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No instructors found. Click "Add Instructor" to register a new trainer.
                </td>
              </tr>
            )}

            {loading && instructors.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading instructor directory…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Instructor Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register New Instructor"
      >
        <form onSubmit={handleAddInstructor} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {addError && (
            <div className="alert alert-error" style={{ margin: 0 }}>
              <AlertCircle size={16} />
              <span>{addError}</span>
            </div>
          )}

          <div>
            <label htmlFor="instName">Full Name</label>
            <input
              id="instName"
              type="text"
              required
              placeholder="e.g. Aarav Mehta"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="instEmail">Email Address</label>
            <input
              id="instEmail"
              type="email"
              required
              placeholder="e.g. aarav@vfitness.com"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="instPassword">Temporary Password (min. 6 characters)</label>
            <input
              id="instPassword"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={addPassword}
              onChange={(e) => setAddPassword(e.target.value)}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              The instructor can use this password to sign into their teaching portal.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addSubmitting}
              className="btn btn-primary"
            >
              {addSubmitting ? 'Saving…' : 'Register Instructor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Instructor Confirmation Modal */}
      <Modal
        isOpen={deletingInstructor !== null}
        onClose={() => setDeletingInstructor(null)}
        title={`Remove Instructor: ${deletingInstructor?.name}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {deleteError && (
            <div className="alert alert-error" style={{ margin: 0 }}>
              <AlertCircle size={16} />
              <span>{deleteError}</span>
            </div>
          )}

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Are you sure you want to remove <strong>{deletingInstructor?.name}</strong> ({deletingInstructor?.email}) from the instructor roster?
          </p>

          {(deletingInstructor?.assignedSessionsCount ?? 0) > 0 && (
            <div style={{
              padding: '0.85rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: '#fca5a5'
            }}>
              <strong>Warning:</strong> This instructor is currently assigned to{' '}
              {deletingInstructor?.assignedSessionsCount} class session(s). You must reassign or remove their sessions before deleting this account.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setDeletingInstructor(null)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteInstructor}
              disabled={deleteSubmitting}
              className="btn btn-danger"
            >
              {deleteSubmitting ? 'Removing…' : 'Confirm Removal'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
