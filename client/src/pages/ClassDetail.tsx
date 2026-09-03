import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  api, 
  ClassItem, 
  SessionItem, 
  User, 
  ScheduleGenerationResult 
} from '../api/client';
import { Modal } from '../components/Modal';
import { 
  ArrowLeft, 
  Plus, 
  Clock, 
  MapPin, 
  Users, 
  Trash2, 
  Edit3, 
  AlertCircle,
  Repeat,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface ClassDetailProps {
  classId: number;
  onBack: () => void;
  onNavigateToSession: (sessionId: number) => void;
}

export const ClassDetail: React.FC<ClassDetailProps> = ({
  classId,
  onBack,
  onNavigateToSession,
}) => {
  const { isStaff } = useAuth();
  const [cls, setCls] = useState<ClassItem | null>(null);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionItem | null>(null);

  // Recurring schedule generator modal states (Goal 7)
  const [isRecurringOpen, setIsRecurringOpen] = useState(false);
  const [recurringResult, setRecurringResult] = useState<ScheduleGenerationResult | null>(null);
  const [generatorLoading, setGeneratorLoading] = useState(false);

  // Today + 4 weeks default for recurring schedule
  const todayStr = new Date().toISOString().split('T')[0];
  const fourWeeksLater = new Date();
  fourWeeksLater.setDate(fourWeeksLater.getDate() + 28);
  const fourWeeksLaterStr = fourWeeksLater.toISOString().split('T')[0];

  // Recurring generator form
  const [recurringForm, setRecurringForm] = useState({
    startDate: todayStr,
    endDate: fourWeeksLaterStr,
    dayOfWeek: 1, // Monday default
    startTime: '09:00',
    duration: 60,
    capacity: 12,
    room: 'Studio A',
    primaryInstructorId: 0,
  });

  // Single session form state
  const [sessionForm, setSessionForm] = useState({
    date: todayStr,
    startTime: '09:00',
    duration: 60,
    capacity: 12,
    room: 'Studio A',
    primaryInstructorId: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [classData, sessionData, instructorList] = await Promise.all([
        api.getClass(classId),
        api.getClassSessions(classId),
        api.getInstructors().catch(() => []),
      ]);
      setCls(classData);
      setSessions(sessionData);
      setInstructors(instructorList);

      const defaultInstId = instructorList.length > 0 ? instructorList[0].id : 0;

      // Pre-populate session form defaults from class
      setSessionForm((prev) => ({
        ...prev,
        duration: classData.defaultDuration,
        capacity: classData.defaultCapacity,
        primaryInstructorId: prev.primaryInstructorId || defaultInstId,
      }));

      // Pre-populate recurring generator form defaults from class
      setRecurringForm((prev) => ({
        ...prev,
        duration: classData.defaultDuration,
        capacity: classData.defaultCapacity,
        primaryInstructorId: prev.primaryInstructorId || defaultInstId,
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load class details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [classId]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSession(classId, sessionForm);
      setIsCreateOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule session');
    }
  };

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;
    try {
      await api.updateSession(editingSession.id, sessionForm);
      setEditingSession(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update session');
    }
  };

  const handleDeleteSession = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this session? Existing bookings will also be removed.')) {
      return;
    }
    try {
      await api.deleteSession(id);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete session');
    }
  };

  // Generate recurring schedule (Goal 7)
  const handleGenerateRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratorLoading(true);
    setError(null);
    try {
      const result = await api.generateRecurringSchedule(classId, recurringForm);
      setIsRecurringOpen(false);
      setRecurringResult(result);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to generate recurring schedule');
    } finally {
      setGeneratorLoading(false);
    }
  };

  const openEdit = (s: SessionItem) => {
    setEditingSession(s);
    setSessionForm({
      date: s.date,
      startTime: s.startTime,
      duration: s.duration,
      capacity: s.capacity,
      room: s.room,
      primaryInstructorId: s.primaryInstructorId,
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Loading class details…
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="alert alert-error" style={{ margin: '2rem auto', maxWidth: '600px' }}>
        <AlertCircle size={18} />
        <span>Class not found</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0', maxWidth: '1280px', margin: '0 auto' }}>
      <button onClick={onBack} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Classes
      </button>

      {/* Class Info Header */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-booked">{cls.discipline}</span>
          {cls.isArchived && <span className="badge badge-no_show">Archived</span>}
        </div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>{cls.title}</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '800px', marginBottom: '1.5rem' }}>
          {cls.description || 'No description provided.'}
        </p>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <Clock size={16} color="var(--accent-cyan)" />
            <span>Default: <strong>{cls.defaultDuration} mins</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <Users size={16} color="var(--accent-purple)" />
            <span>Default Capacity: <strong>{cls.defaultCapacity} spots</strong></span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Sessions Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem',
      }}>
        <h2>Scheduled Sessions ({sessions.length})</h2>
        {isStaff && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => setIsRecurringOpen(true)} 
              className="btn btn-secondary btn-sm"
              title="Bulk-generate weekly recurring schedule with conflict detection"
            >
              <Repeat size={14} /> Recurring Generator
            </button>
            <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={16} /> Schedule Session
            </button>
          </div>
        )}
      </div>

      {/* Sessions Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Duration</th>
              <th>Room</th>
              <th>Instructor</th>
              <th>Capacity</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{s.date}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={12} /> {s.startTime}
                  </div>
                </td>
                <td>{s.duration} mins</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={13} color="var(--accent-amber)" />
                    {s.room}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Users size={13} color="var(--accent-purple)" />
                    {s.primaryInstructor?.name || `Instructor #${s.primaryInstructorId}`}
                  </div>
                </td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {s.capacity} spots
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                    <button
                      onClick={() => onNavigateToSession(s.id)}
                      className="btn btn-primary btn-sm"
                    >
                      Bookings
                    </button>
                    {isStaff && (
                      <>
                        <button
                          onClick={() => openEdit(s)}
                          className="btn btn-secondary btn-sm"
                          title="Edit session"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteSession(s.id)}
                          className="btn btn-danger btn-sm"
                          title="Delete session"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                  No sessions scheduled yet. Click "Schedule Session" or "Recurring Generator" above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Session Create / Edit Modal */}
      <Modal
        isOpen={isCreateOpen || editingSession !== null}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingSession(null);
        }}
        title={editingSession ? 'Edit Session' : `Schedule Session — ${cls.title}`}
      >
        <form onSubmit={editingSession ? handleUpdateSession : handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="date">Session Date</label>
              <input
                id="date"
                type="date"
                required
                value={sessionForm.date}
                onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="startTime">Start Time</label>
              <input
                id="startTime"
                type="time"
                required
                value={sessionForm.startTime}
                onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="duration">Duration (minutes)</label>
              <input
                id="duration"
                type="number"
                min="10"
                max="240"
                required
                value={sessionForm.duration}
                onChange={(e) => setSessionForm({ ...sessionForm, duration: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <div>
              <label htmlFor="capacity">Capacity (spots)</label>
              <input
                id="capacity"
                type="number"
                min="1"
                max="100"
                required
                value={sessionForm.capacity}
                onChange={(e) => setSessionForm({ ...sessionForm, capacity: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="room">Room / Studio</label>
            <input
              id="room"
              type="text"
              required
              value={sessionForm.room}
              onChange={(e) => setSessionForm({ ...sessionForm, room: e.target.value })}
              placeholder="e.g. Studio A, Studio B, Main Hall"
            />
          </div>

          <div>
            <label htmlFor="instructor">Primary Instructor</label>
            <select
              id="instructor"
              value={sessionForm.primaryInstructorId}
              onChange={(e) => setSessionForm({ ...sessionForm, primaryInstructorId: parseInt(e.target.value, 10) })}
            >
              {instructors.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.email})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingSession(null);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingSession ? 'Save Changes' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Recurring Schedule Generator Modal (Goal 7) */}
      <Modal
        isOpen={isRecurringOpen}
        onClose={() => setIsRecurringOpen(false)}
        title={`Generate Recurring Weekly Schedule — ${cls.title}`}
      >
        <form onSubmit={handleGenerateRecurring} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Automatically create weekly sessions over a date range. Sessions with room or instructor conflicts will be reported and skipped without stopping the batch.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="rStartDate">Start Date</label>
              <input
                id="rStartDate"
                type="date"
                required
                value={recurringForm.startDate}
                onChange={(e) => setRecurringForm({ ...recurringForm, startDate: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="rEndDate">End Date</label>
              <input
                id="rEndDate"
                type="date"
                required
                value={recurringForm.endDate}
                onChange={(e) => setRecurringForm({ ...recurringForm, endDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="rDay">Repeat Every</label>
              <select
                id="rDay"
                value={recurringForm.dayOfWeek}
                onChange={(e) => setRecurringForm({ ...recurringForm, dayOfWeek: Number(e.target.value) })}
              >
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
                <option value={0}>Sunday</option>
              </select>
            </div>
            <div>
              <label htmlFor="rTime">Start Time</label>
              <input
                id="rTime"
                type="time"
                required
                value={recurringForm.startTime}
                onChange={(e) => setRecurringForm({ ...recurringForm, startTime: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="rRoom">Room</label>
              <input
                id="rRoom"
                type="text"
                required
                value={recurringForm.room}
                onChange={(e) => setRecurringForm({ ...recurringForm, room: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="rInstructor">Primary Instructor</label>
              <select
                id="rInstructor"
                value={recurringForm.primaryInstructorId}
                onChange={(e) => setRecurringForm({ ...recurringForm, primaryInstructorId: Number(e.target.value) })}
              >
                {instructors.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsRecurringOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={generatorLoading} className="btn btn-primary">
              {generatorLoading ? 'Generating…' : 'Generate Sessions'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Generator Results Report Modal (Goal 7) */}
      <Modal
        isOpen={recurringResult !== null}
        onClose={() => setRecurringResult(null)}
        title="Recurring Generation Results"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {recurringResult && (
            <>
              {/* Summary Badges */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Created Sessions</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>
                    {recurringResult.summary.createdCount}
                  </div>
                </div>
                <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Skipped (Conflicts)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>
                    {recurringResult.summary.skippedCount}
                  </div>
                </div>
              </div>

              {/* Skipped Conflicts Details */}
              {recurringResult.skipped.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '0.95rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <AlertTriangle size={15} /> Skipped Due to Overlapping Windows:
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                    {recurringResult.skipped.map((sk, idx) => (
                      <div key={idx} style={{ padding: '0.65rem 0.85rem', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.08)', fontSize: '0.8rem' }}>
                        <strong>{sk.date}</strong>: {sk.reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Created Sessions List */}
              {recurringResult.created.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '0.95rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <CheckCircle2 size={15} /> Successfully Created:
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '120px', overflowY: 'auto' }}>
                    {recurringResult.created.map((cr) => (
                      <span key={cr.id} className="badge badge-booked" style={{ fontSize: '0.75rem' }}>
                        {cr.date} at {cr.startTime}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button onClick={() => setRecurringResult(null)} className="btn btn-primary">
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
