import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  api, 
  BookingItem, 
  ClassItem, 
  SessionItem,
  BookingHistoryItem 
} from '../api/client';
import { Modal } from '../components/Modal';
import { 
  Search, 
  ArrowUpDown, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  History, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  Eye,
  Plus,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface BookingsProps {
  onNavigateToSession: (sessionId: number) => void;
}

export const Bookings: React.FC<BookingsProps> = ({ onNavigateToSession }) => {
  const { isStaff } = useAuth();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [classesList, setClassesList] = useState<ClassItem[]>([]);
  const [sessionsList, setSessionsList] = useState<SessionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters (Goal 6: filters for class, session, and status)
  const [search, setSearch] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'status' | 'session' | 'name'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // History timeline modal
  const [historyBooking, setHistoryBooking] = useState<BookingItem | null>(null);
  const [historyLogs, setHistoryLogs] = useState<BookingHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  // Load classes and sessions for filter dropdowns
  useEffect(() => {
    async function loadFilterData() {
      try {
        const [cls, sess] = await Promise.all([
          api.getClasses(true),
          api.getSessions(),
        ]);
        setClassesList(cls);
        setSessionsList(sess);
      } catch (err) {
        console.error('Failed to load filter options', err);
      }
    }
    loadFilterData();
  }, []);

  // Filter available sessions based on selected class
  const availableSessionsForFilter = selectedClassId !== 'all'
    ? sessionsList.filter((s) => s.classId === Number(selectedClassId))
    : sessionsList;

  // Fetch bookings whenever filters change (server-side query)
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.findBookings({
        search: search.trim() || undefined,
        classId: selectedClassId !== 'all' ? Number(selectedClassId) : undefined,
        sessionId: selectedSessionId !== 'all' ? Number(selectedSessionId) : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        sortBy,
        sortOrder,
        page,
        limit,
      });
      setBookings(res.bookings);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [search, selectedClassId, selectedSessionId, selectedStatus, sortBy, sortOrder, page]);

  // Reset to page 1 when search or filters change
  const handleFilterChange = (setter: (val: any) => void, val: any) => {
    setter(val);
    setPage(1);
  };

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedSessionId('all');
    setPage(1);
  };

  const handleSortClick = (field: 'createdAt' | 'status' | 'session' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(field === 'createdAt' ? 'desc' : 'asc');
    }
    setPage(1);
  };

  // Open history timeline
  const openHistory = async (b: BookingItem) => {
    setHistoryBooking(b);
    setHistoryLoading(true);
    setNewNote('');
    setNoteSuccess(false);
    try {
      const logs = await api.getBookingHistory(b.id);
      setHistoryLogs(logs);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch timeline');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Add note to timeline
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!historyBooking || !newNote.trim()) return;
    setNoteSubmitting(true);
    try {
      const log = await api.addBookingNote(historyBooking.id, newNote.trim());
      setHistoryLogs((prev) => [...prev, log]);
      setNewNote('');
      setNoteSuccess(true);
      setTimeout(() => setNoteSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to append note');
    } finally {
      setNoteSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'booked':
        return <span className="badge badge-booked">Booked</span>;
      case 'waitlisted':
        return <span className="badge badge-waitlisted">Waitlisted</span>;
      case 'cancelled':
        return <span className="badge badge-cancelled">Cancelled</span>;
      case 'attended':
        return <span className="badge badge-attended">Attended</span>;
      case 'no_show':
        return <span className="badge badge-no_show">No Show</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>All Bookings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {isStaff
            ? 'Search, filter, and inspect bookings across every session in the studio.'
            : 'Find and manage bookings for your assigned class sessions.'}
        </p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '1.25rem', 
          marginBottom: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'end',
        }}
      >
        {/* Search */}
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>
            Search Member
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Name or email…"
              value={search}
              onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              style={{ paddingLeft: '2.4rem' }}
            />
            <Search 
              size={15} 
              color="var(--text-muted)" 
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} 
            />
          </div>
        </div>

        {/* Class Filter */}
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>
            Class
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => handleClassChange(e.target.value)}
          >
            <option value="all">All Classes</option>
            {classesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.discipline})
              </option>
            ))}
          </select>
        </div>

        {/* Session Filter (Goal 6: filters for class, session and status) */}
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>
            Session
          </label>
          <select
            value={selectedSessionId}
            onChange={(e) => handleFilterChange(setSelectedSessionId, e.target.value)}
          >
            <option value="all">
              {selectedClassId !== 'all' ? 'All Sessions for Class' : 'All Sessions'}
            </option>
            {availableSessionsForFilter.map((s) => (
              <option key={s.id} value={s.id}>
                {s.date} @ {s.startTime} — {s.class?.title || `Class #${s.classId}`} ({s.room})
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => handleFilterChange(setSelectedStatus, e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="booked">Booked</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="attended">Attended</option>
            <option value="no_show">No Show</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>
            Sort By
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              value={sortBy}
              onChange={(e) => handleFilterChange(setSortBy, e.target.value as any)}
              style={{ flex: 1 }}
            >
              <option value="createdAt">Booked Time</option>
              <option value="status">Status</option>
              <option value="session">Session Date</option>
              <option value="name">Member Name</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="btn btn-secondary"
              title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              style={{ padding: '0.65rem 0.85rem' }}
            >
              <ArrowUpDown size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th 
                onClick={() => handleSortClick('name')} 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by Member Name"
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  Member
                  {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}
                </div>
              </th>
              <th>Class & Room</th>
              <th 
                onClick={() => handleSortClick('session')} 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by Session Time"
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  Session Time
                  {sortBy === 'session' && (sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}
                </div>
              </th>
              <th 
                onClick={() => handleSortClick('status')} 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by Status"
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  Status
                  {sortBy === 'status' && (sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}
                </div>
              </th>
              <th 
                onClick={() => handleSortClick('createdAt')} 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by Booked Date"
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  Booked Date
                  {sortBy === 'createdAt' && (sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}
                </div>
              </th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <User size={15} color="var(--accent-primary)" />
                    {b.member?.name || 'Unknown'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Mail size={12} />
                    {b.member?.email}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{b.session?.class?.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {b.session?.class?.discipline} • Room: {b.session?.room}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                    <Calendar size={13} color="var(--text-muted)" />
                    {b.session?.date}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Clock size={12} />
                    {b.session?.startTime} ({b.session?.duration} mins)
                  </div>
                </td>
                <td>{getStatusBadge(b.status)}</td>
                <td>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(b.createdAt).toLocaleDateString()}{' '}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                    <button
                      onClick={() => openHistory(b)}
                      className="btn btn-secondary btn-sm"
                      title="View immutable timeline"
                    >
                      <History size={13} /> Timeline
                    </button>
                    <button
                      onClick={() => onNavigateToSession(b.sessionId)}
                      className="btn btn-primary btn-sm"
                      title="Open full session"
                    >
                      <Eye size={13} /> Session
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                  {loading ? 'Fetching bookings…' : 'No bookings found matching the current search and filters.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginTop: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
        }}
      >
        <div>
          Showing {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} matches
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="btn btn-secondary btn-sm"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span style={{ padding: '0 0.5rem', fontWeight: 600 }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="btn btn-secondary btn-sm"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Immutable History Timeline Modal (Goal 9) */}
      <Modal
        isOpen={historyBooking !== null}
        onClose={() => setHistoryBooking(null)}
        title={`Audit Timeline: Booking #${historyBooking?.id}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {historyBooking && (
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                Member: {historyBooking.member?.name} ({historyBooking.member?.email})
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Session: {historyBooking.session?.class?.title} on {historyBooking.session?.date} at {historyBooking.session?.startTime}
              </div>
            </div>
          )}

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <strong>Audit Log:</strong> This audit trail is strictly immutable. No entry can be edited or deleted.
          </div>

          {historyLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Loading timeline…
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '350px', overflowY: 'auto' }}>
              {historyLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderLeft: '3px solid var(--accent-primary)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {log.oldStatus
                        ? log.oldStatus === log.newStatus
                          ? `Staff Note (${log.newStatus})`
                          : `${log.oldStatus} -> ${log.newStatus}`
                        : `Created as ${log.newStatus}`}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {log.note && (
                    <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '0.25rem' }}>
                      "{log.note}"
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Actor: {log.changedByUser?.name || 'System / Auto'} {log.changedByUser?.email ? `(${log.changedByUser.email})` : log.changedByUser?.role ? `(${log.changedByUser.role})` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add note to timeline form (Staff only) */}
          {isStaff && (
            <form onSubmit={handleAddNote} style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <label htmlFor="timelineNote" style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Add Permanent Note to Timeline
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  id="timelineNote"
                  type="text"
                  placeholder="e.g. Member notified via front desk desk call..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  disabled={noteSubmitting || !newNote.trim()}
                  className="btn btn-primary btn-sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Plus size={14} /> Add Note
                </button>
              </div>
              {noteSuccess && (
                <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.35rem' }}>
                  Note appended to audit timeline.
                </div>
              )}
            </form>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button onClick={() => setHistoryBooking(null)} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
