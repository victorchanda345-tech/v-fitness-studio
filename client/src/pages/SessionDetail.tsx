import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  api, 
  SessionItem, 
  BookingItem, 
  MemberItem, 
  BookingHistoryItem,
  User 
} from '../api/client';
import { Modal } from '../components/Modal';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  XCircle, 
  History, 
  Ban, 
  AlertCircle,
  Info,
  Download,
  UserPlus,
  Edit3,
  Trash2
} from 'lucide-react';

interface SessionDetailProps {
  sessionId: number;
  onBack: () => void;
}

export const SessionDetail: React.FC<SessionDetailProps> = ({ sessionId, onBack }) => {
  const { user, isStaff } = useAuth();
  const [session, setSession] = useState<SessionItem | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | ''>('');
  const [bookingNote, setBookingNote] = useState('');

  // Co-instructor modal (Goal 5)
  const [isAddCoOpen, setIsAddCoOpen] = useState(false);
  const [selectedCoId, setSelectedCoId] = useState<number | ''>('');

  // History timeline modal (Goal 9)
  const [historyModalBooking, setHistoryModalBooking] = useState<BookingItem | null>(null);
  const [historyLogs, setHistoryLogs] = useState<BookingHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [newTimelineNote, setNewTimelineNote] = useState('');
  const [timelineNoteLoading, setTimelineNoteLoading] = useState(false);

  // Edit session modal (Goal 3)
  const [isEditSessionOpen, setIsEditSessionOpen] = useState(false);
  const [editSessionForm, setEditSessionForm] = useState({
    date: '',
    startTime: '',
    duration: 60,
    capacity: 12,
    room: '',
    primaryInstructorId: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessionData, bookingsData] = await Promise.all([
        api.getSession(sessionId),
        api.getSessionBookings(sessionId),
      ]);
      setSession(sessionData);
      setBookings(bookingsData);

      if (isStaff) {
        const [membersData, instData] = await Promise.all([
          api.getMembers(),
          api.getInstructors(),
        ]);
        setMembers(membersData);
        setInstructors(instData);
        if (membersData.length > 0 && selectedMemberId === '') {
          setSelectedMemberId(membersData[0].id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sessionId]);

  // Check if session scheduled time has arrived or passed (Goal 4)
  const isScheduledTimePassed = (): boolean => {
    if (!session) return false;
    const sessionStart = new Date(`${session.date}T${session.startTime}:00`);
    return new Date() >= sessionStart;
  };

  // Check if session has completely finished
  const isSessionEnded = (): boolean => {
    if (!session) return false;
    const sessionStart = new Date(`${session.date}T${session.startTime}:00`);
    const sessionEnd = new Date(sessionStart.getTime() + session.duration * 60_000);
    return new Date() > sessionEnd;
  };

  // Check if current user is an assigned instructor (primary or co)
  const isAssignedInstructor = 
    user?.role === 'instructor' && 
    (session?.primaryInstructorId === user.id || 
     session?.coInstructors?.some((ci) => ci.id === user.id));

  // Can user settle bookings? (Staff or Assigned Instructor)
  const canSettle = isStaff || isAssignedInstructor;

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;
    setError(null);
    setSuccessMsg(null);

    try {
      const newBooking = await api.createBooking(
        sessionId,
        Number(selectedMemberId),
        bookingNote || undefined,
      );
      setIsAddBookingOpen(false);
      setBookingNote('');
      setSuccessMsg(`Booking created successfully (${newBooking.status.toUpperCase()})`);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    }
  };

  const handleCancelBooking = async (booking: BookingItem) => {
    const reason = window.prompt(`Cancel booking for ${booking.member?.name}? Reason/Note (optional):`);
    if (reason === null) return;

    setError(null);
    setSuccessMsg(null);
    try {
      const res = await api.cancelBooking(booking.id, reason || undefined);
      if (res.promoted) {
        setSuccessMsg(`Booking cancelled. Waitlisted member auto-promoted to BOOKED!`);
      } else {
        setSuccessMsg('Booking cancelled successfully.');
      }
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking');
    }
  };

  const handleSettle = async (booking: BookingItem, status: 'attended' | 'no_show') => {
    setError(null);
    setSuccessMsg(null);
    try {
      await api.settleBooking(booking.id, status);
      setSuccessMsg(`Booking settled as ${status.toUpperCase()}`);
      loadData();
    } catch (err: any) {
      setError(err.message || `Failed to settle as ${status}`);
    }
  };

  // Co-instructor handlers (Goal 5)
  const handleAddCoInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoId) return;
    setError(null);
    try {
      await api.addCoInstructor(sessionId, Number(selectedCoId));
      setIsAddCoOpen(false);
      setSelectedCoId('');
      setSuccessMsg('Co-instructor assigned to session');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to add co-instructor');
    }
  };

  const handleRemoveCoInstructor = async (instructorId: number, instructorName: string) => {
    if (!window.confirm(`Remove ${instructorName} as co-instructor from this session?`)) {
      return;
    }
    setError(null);
    try {
      await api.removeCoInstructor(sessionId, instructorId);
      setSuccessMsg(`${instructorName} removed as co-instructor`);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to remove co-instructor');
    }
  };

  // CSV Export handler (Goal 7)
  const handleExportCsv = async () => {
    try {
      await api.downloadSessionCsv(sessionId);
    } catch (err: any) {
      setError(err.message || 'Failed to export CSV');
    }
  };

  // History timeline modal (Goal 9)
  const openHistory = async (booking: BookingItem) => {
    setHistoryModalBooking(booking);
    setHistoryLoading(true);
    setNewTimelineNote('');
    try {
      const logs = await api.getBookingHistory(booking.id);
      setHistoryLogs(logs);
    } catch (err: any) {
      setError(err.message || 'Failed to load booking timeline');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleAddTimelineNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!historyModalBooking || !newTimelineNote.trim()) return;
    setTimelineNoteLoading(true);
    try {
      const added = await api.addBookingNote(historyModalBooking.id, newTimelineNote.trim());
      setHistoryLogs((prev) => [...prev, added]);
      setNewTimelineNote('');
    } catch (err: any) {
      setError(err.message || 'Failed to add timeline note');
    } finally {
      setTimelineNoteLoading(false);
    }
  };

  // Edit / Delete session handlers (Goal 3)
  const openEditSession = () => {
    if (!session) return;
    setEditSessionForm({
      date: session.date,
      startTime: session.startTime,
      duration: session.duration,
      capacity: session.capacity,
      room: session.room,
      primaryInstructorId: session.primaryInstructorId,
    });
    setIsEditSessionOpen(true);
  };

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.updateSession(sessionId, editSessionForm);
      setIsEditSessionOpen(false);
      setSuccessMsg('Session updated successfully.');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update session');
    }
  };

  const handleDeleteSession = async () => {
    if (!window.confirm('Are you sure you want to delete this session? All attendee bookings will also be deleted.')) {
      return;
    }
    setError(null);
    try {
      await api.deleteSession(sessionId);
      onBack();
    } catch (err: any) {
      setError(err.message || 'Failed to delete session');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Loading session details…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="alert alert-error" style={{ margin: '2rem auto', maxWidth: '600px' }}>
        <AlertCircle size={18} />
        <span>Session not found or access denied</span>
      </div>
    );
  }

  const bookedCount = bookings.filter((b) => b.status === 'booked').length;
  const waitlistedCount = bookings.filter((b) => b.status === 'waitlisted').length;
  const isScheduledPassed = isScheduledTimePassed();
  const sessionEnded = isSessionEnded();

  // Filter available instructors for adding as co-instructor
  const availableCoInstructors = instructors.filter(
    (inst) =>
      inst.id !== session.primaryInstructorId &&
      !session.coInstructors?.some((ci) => ci.id === inst.id),
  );

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0', maxWidth: '1280px', margin: '0 auto' }}>
      <button onClick={onBack} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Session Hero Banner */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-booked">{session.class?.discipline}</span>
              {sessionEnded ? (
                <span className="badge badge-attended">Session Completed</span>
              ) : isScheduledPassed ? (
                <span className="badge badge-booked">In Progress</span>
              ) : (
                <span className="badge badge-waitlisted">Upcoming</span>
              )}
            </div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {session.class?.title}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={16} color="var(--accent-primary)" />
                <strong>{session.date}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} color="var(--accent-cyan)" />
                <strong>{session.startTime}</strong> ({session.duration} mins)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} color="var(--accent-amber)" />
                {session.room}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={16} color="var(--accent-purple)" />
                Primary Instructor: <strong>{session.primaryInstructor?.name}</strong>
              </div>
            </div>

            {/* Co-Instructors List (Goal 5) */}
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Co-Instructors:
              </span>
              {session.coInstructors && session.coInstructors.length > 0 ? (
                session.coInstructors.map((ci) => (
                  <span 
                    key={ci.id}
                    className="badge badge-instructor"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.6rem' }}
                  >
                    <Users size={12} />
                    {ci.name}
                    {isStaff && (
                      <button
                        onClick={() => handleRemoveCoInstructor(ci.id, ci.name)}
                        title="Remove co-instructor"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#f43f5e',
                          cursor: 'pointer',
                          marginLeft: '0.25rem',
                          padding: 0,
                          fontSize: '0.9rem',
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None assigned</span>
              )}

              {isStaff && availableCoInstructors.length > 0 && (
                <button
                  onClick={() => setIsAddCoOpen(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                >
                  <UserPlus size={12} /> Add Co-Instructor
                </button>
              )}
            </div>

            {/* Staff Session Controls (Goal 3) */}
            {isStaff && (
              <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  onClick={openEditSession}
                  className="btn btn-secondary btn-sm"
                  title="Edit session details (date, time, duration, capacity, room, instructor)"
                >
                  <Edit3 size={14} /> Edit Session
                </button>
                <button
                  onClick={handleDeleteSession}
                  className="btn btn-danger btn-sm"
                  title="Delete this session"
                >
                  <Trash2 size={14} /> Delete Session
                </button>
              </div>
            )}
          </div>

          {/* Capacity Stats Card */}
          <div style={{
            display: 'flex',
            gap: '1.25rem',
            padding: '1rem 1.5rem',
            background: 'rgba(15, 23, 42, 0.7)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Booked</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>
                {bookedCount} / {session.capacity}
              </div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Waitlist</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>
                {waitlistedCount}
              </div>
            </div>
          </div>
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
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Bookings Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <h2>Attendee Roster & Bookings ({bookings.length})</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleExportCsv} className="btn btn-secondary btn-sm" title="Export session attendance as CSV">
            <Download size={14} /> Export CSV
          </button>
          {isStaff && (
            <button onClick={() => setIsAddBookingOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={16} /> Add Member Booking
            </button>
          )}
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Booked At</th>
              <th style={{ textAlign: 'right' }}>Lifecycle Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{b.member?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Expiry: {b.member?.membershipExpiry}
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{b.member?.email}</td>
                <td>
                  <span className={`badge badge-${b.status}`}>
                    {b.status.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                    {/* Settle buttons (Allowed for staff and assigned instructors after session scheduled time has passed) */}
                    {canSettle && b.status === 'booked' && (
                      <>
                        <button
                          onClick={() => handleSettle(b, 'attended')}
                          disabled={!isScheduledPassed}
                          className="btn btn-success btn-sm"
                          title={isScheduledPassed ? 'Mark Attended' : `Cannot settle until session scheduled time (${session.startTime})`}
                        >
                          <CheckCircle2 size={13} /> Attended
                        </button>
                        <button
                          onClick={() => handleSettle(b, 'no_show')}
                          disabled={!isScheduledPassed}
                          className="btn btn-danger btn-sm"
                          title={isScheduledPassed ? 'Mark No-Show' : `Cannot settle until session scheduled time (${session.startTime})`}
                        >
                          <XCircle size={13} /> No Show
                        </button>
                      </>
                    )}

                    {/* Cancel button (allowed for staff on booked and waitlisted) */}
                    {isStaff && (b.status === 'booked' || b.status === 'waitlisted') && (
                      <button
                        onClick={() => handleCancelBooking(b)}
                        className="btn btn-secondary btn-sm"
                        title="Cancel booking (auto-promotes waitlist if booked)"
                      >
                        <Ban size={13} color="#f43f5e" /> Cancel
                      </button>
                    )}

                    {/* Audit History Timeline button */}
                    <button
                      onClick={() => openHistory(b)}
                      className="btn btn-secondary btn-sm"
                      title="View immutable booking history"
                    >
                      <History size={13} /> Timeline
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                  No bookings yet for this session.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Booking Modal */}
      <Modal
        isOpen={isAddBookingOpen}
        onClose={() => setIsAddBookingOpen(false)}
        title="Add Member to Session"
      >
        <form onSubmit={handleCreateBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="memberSelect">Select Member</label>
            <select
              id="memberSelect"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(Number(e.target.value))}
              required
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email}) — Expiry: {m.membershipExpiry}
                </option>
              ))}
            </select>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Info size={12} /> Expired members are automatically rejected by server rules.
            </div>
          </div>

          <div>
            <label htmlFor="note">Initial Note (optional)</label>
            <input
              id="note"
              type="text"
              value={bookingNote}
              onChange={(e) => setBookingNote(e.target.value)}
              placeholder="e.g. Phone sign-up, front desk request"
            />
          </div>

          <div style={{
            padding: '0.75rem',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.825rem',
            color: 'var(--text-secondary)',
          }}>
            {bookedCount < session.capacity ? (
              <span style={{ color: '#34d399' }}>
                Capacity available ({session.capacity - bookedCount} spots remaining). Will be <strong>BOOKED</strong> directly.
              </span>
            ) : (
              <span style={{ color: '#fbbf24' }}>
                Session is full ({bookedCount}/{session.capacity}). Booking will be placed as <strong>WAITLISTED</strong>.
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsAddBookingOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Booking
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Co-Instructor Modal (Goal 5) */}
      <Modal
        isOpen={isAddCoOpen}
        onClose={() => setIsAddCoOpen(false)}
        title="Assign Co-Instructor"
      >
        <form onSubmit={handleAddCoInstructor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="coSelect">Select Instructor</label>
            <select
              id="coSelect"
              value={selectedCoId}
              onChange={(e) => setSelectedCoId(Number(e.target.value))}
              required
            >
              <option value="">Choose an instructor…</option>
              {availableCoInstructors.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.email})
                </option>
              ))}
            </select>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Co-instructors can view this session on their roster and record attendance.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsAddCoOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={!selectedCoId} className="btn btn-primary">
              Assign Co-Instructor
            </button>
          </div>
        </form>
      </Modal>

      {/* Booking History Timeline Modal (Goal 9: History you cannot rewrite) */}
      <Modal
        isOpen={historyModalBooking !== null}
        onClose={() => setHistoryModalBooking(null)}
        title={`Audit Timeline — ${historyModalBooking?.member?.name}`}
      >
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Immutable audit record of all status transitions and staff notes.
          </div>

          {historyLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Loading timeline…
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '300px', overflowY: 'auto' }}>
              {historyLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '0.85rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '3px solid var(--accent-primary)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {log.oldStatus ? `${log.oldStatus} -> ${log.newStatus}` : `Created as ${log.newStatus}`}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {log.note && (
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '0.35rem' }}>
                      "{log.note}"
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Actor: {log.changedByUser?.name || 'System / Auto'} ({log.changedByUser?.role || 'engine'})
                  </div>
                </div>
              ))}
              {historyLogs.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
                  No history records found.
                </div>
              )}
            </div>
          )}

          {/* Add Note to Timeline Form (Staff only) */}
          {isStaff && (
            <form onSubmit={handleAddTimelineNote} style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <label htmlFor="timelineNote" style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Add Permanent Note to Timeline
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  id="timelineNote"
                  type="text"
                  placeholder="e.g. Member called front desk, excused absence…"
                  value={newTimelineNote}
                  onChange={(e) => setNewTimelineNote(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  disabled={timelineNoteLoading || !newTimelineNote.trim()}
                  className="btn btn-primary btn-sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Plus size={14} /> Add Note
                </button>
              </div>
            </form>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setHistoryModalBooking(null)}
              className="btn btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Session Modal (Goal 3) */}
      <Modal
        isOpen={isEditSessionOpen}
        onClose={() => setIsEditSessionOpen(false)}
        title={`Edit Session — ${session.class?.title || 'Class'}`}
      >
        <form onSubmit={handleUpdateSession} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            fontSize: '0.825rem',
            color: 'var(--text-secondary)',
          }}>
            Modify any attribute for this session. Duration and capacity can be customized per session.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="sDate">Session Date</label>
              <input
                id="sDate"
                type="date"
                required
                value={editSessionForm.date}
                onChange={(e) => setEditSessionForm({ ...editSessionForm, date: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="sStartTime">Start Time</label>
              <input
                id="sStartTime"
                type="time"
                required
                value={editSessionForm.startTime}
                onChange={(e) => setEditSessionForm({ ...editSessionForm, startTime: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="sDuration">
                Duration (minutes) {session.class?.defaultDuration ? (
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                    (Class default: {session.class.defaultDuration}m)
                  </span>
                ) : null}
              </label>
              <input
                id="sDuration"
                type="number"
                min="10"
                max="240"
                required
                value={editSessionForm.duration}
                onChange={(e) => setEditSessionForm({ ...editSessionForm, duration: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <div>
              <label htmlFor="sCapacity">
                Capacity (spots) {session.class?.defaultCapacity ? (
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-purple)' }}>
                    (Class default: {session.class.defaultCapacity})
                  </span>
                ) : null}
              </label>
              <input
                id="sCapacity"
                type="number"
                min="1"
                max="100"
                required
                value={editSessionForm.capacity}
                onChange={(e) => setEditSessionForm({ ...editSessionForm, capacity: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="sRoom">Room / Studio</label>
            <input
              id="sRoom"
              type="text"
              required
              value={editSessionForm.room}
              onChange={(e) => setEditSessionForm({ ...editSessionForm, room: e.target.value })}
              placeholder="e.g. Studio A, Studio B"
            />
          </div>

          <div>
            <label htmlFor="sInstructor">Primary Instructor</label>
            <select
              id="sInstructor"
              required
              value={editSessionForm.primaryInstructorId || ''}
              onChange={(e) => setEditSessionForm({ ...editSessionForm, primaryInstructorId: parseInt(e.target.value, 10) })}
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
              onClick={() => setIsEditSessionOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
