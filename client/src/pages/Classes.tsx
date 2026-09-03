import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, ClassItem } from '../api/client';
import { Modal } from '../components/Modal';
import { 
  Plus, 
  Clock, 
  Users, 
  Archive, 
  RotateCcw, 
  Edit3, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface ClassesProps {
  onNavigate: (tab: string, contextId?: number) => void;
}

export const Classes: React.FC<ClassesProps> = ({ onNavigate }) => {
  const { isStaff } = useAuth();
  const [classesList, setClassesList] = useState<ClassItem[]>([]);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discipline: 'Yoga',
    defaultDuration: 60,
    defaultCapacity: 12,
  });

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await api.getClasses(includeArchived);
      setClassesList(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [includeArchived]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createClass(formData);
      setIsCreateOpen(false);
      setFormData({
        title: '',
        description: '',
        discipline: 'Yoga',
        defaultDuration: 60,
        defaultCapacity: 12,
      });
      loadClasses();
    } catch (err: any) {
      setError(err.message || 'Failed to create class');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    try {
      await api.updateClass(editingClass.id, formData);
      setEditingClass(null);
      loadClasses();
    } catch (err: any) {
      setError(err.message || 'Failed to update class');
    }
  };

  const handleArchiveToggle = async (id: number) => {
    try {
      await api.archiveClass(id);
      loadClasses();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle archive status');
    }
  };

  const openEditModal = (c: ClassItem) => {
    setEditingClass(c);
    setFormData({
      title: c.title,
      description: c.description || '',
      discipline: c.discipline,
      defaultDuration: c.defaultDuration,
      defaultCapacity: c.defaultCapacity,
    });
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
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Class Catalog</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Studio programs, disciplines, and default session templates
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            margin: 0, 
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
          }}>
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
              style={{ width: 'auto' }}
            />
            Show archived classes
          </label>

          {isStaff && (
            <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
              <Plus size={16} /> New Class
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Class Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading classes…
        </div>
      ) : classesList.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No classes found. {includeArchived ? '' : 'Try checking "Show archived classes" or create a new one.'}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}>
          {classesList.map((c) => (
            <div
              key={c.id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: c.isArchived ? 0.65 : 1,
                border: c.isArchived ? '1px dashed var(--border-subtle)' : '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className="badge badge-booked" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                    {c.discipline}
                  </span>
                  {c.isArchived && (
                    <span className="badge badge-cancelled">
                      Archived
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{c.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', minHeight: '2.6em' }}>
                  {c.description || 'No description provided.'}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  fontSize: '0.825rem',
                  color: 'var(--text-secondary)',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={14} color="var(--accent-cyan)" />
                    <span>{c.defaultDuration} mins default</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Users size={14} color="var(--accent-purple)" />
                    <span>Cap: {c.defaultCapacity} spots</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{
                marginTop: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <button
                  onClick={() => onNavigate('class-detail', c.id)}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  View Sessions <ArrowRight size={14} />
                </button>

                {isStaff && (
                  <>
                    <button
                      onClick={() => openEditModal(c)}
                      className="btn btn-secondary btn-sm"
                      title="Edit class"
                      style={{ padding: '0.5rem' }}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleArchiveToggle(c.id)}
                      className="btn btn-secondary btn-sm"
                      title={c.isArchived ? 'Restore class' : 'Archive class'}
                      style={{ padding: '0.5rem' }}
                    >
                      {c.isArchived ? <RotateCcw size={14} color="#10b981" /> : <Archive size={14} color="#f43f5e" />}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isCreateOpen || editingClass !== null}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingClass(null);
        }}
        title={editingClass ? 'Edit Class' : 'Create New Class'}
      >
        <form onSubmit={editingClass ? handleUpdate : handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="title">Class Title</label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Vinyasa Power Flow"
            />
          </div>

          <div>
            <label htmlFor="discipline">Discipline</label>
            <select
              id="discipline"
              value={formData.discipline}
              onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
            >
              <option value="Yoga">Yoga</option>
              <option value="Pilates">Pilates</option>
              <option value="Dance">Dance</option>
              <option value="HIIT">HIIT</option>
              <option value="Spin">Spin</option>
              <option value="Barre">Barre</option>
              <option value="Boxing">Boxing</option>
            </select>
          </div>

          <div>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the workout intensity, target audience, and expectations…"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="duration">Default Duration (mins)</label>
              <input
                id="duration"
                type="number"
                min="10"
                max="240"
                required
                value={formData.defaultDuration}
                onChange={(e) => setFormData({ ...formData, defaultDuration: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <div>
              <label htmlFor="capacity">Default Capacity</label>
              <input
                id="capacity"
                type="number"
                min="1"
                max="100"
                required
                value={formData.defaultCapacity}
                onChange={(e) => setFormData({ ...formData, defaultCapacity: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingClass(null);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingClass ? 'Save Changes' : 'Create Class'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
