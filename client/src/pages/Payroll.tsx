import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, PayrollReport, InstructorPayrollItem } from '../api/client';
import { 
  Receipt, 
  Calendar, 
  Clock, 
  Users, 
  Download, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  FileText
} from 'lucide-react';

export const Payroll: React.FC = () => {
  const { isStaff } = useAuth();
  const [report, setReport] = useState<PayrollReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form filters
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const firstDayStr = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [primaryRate, setPrimaryRate] = useState(50);
  const [coRate, setCoRate] = useState(35);

  // Expanded instructor accordions
  const [expandedInstructors, setExpandedInstructors] = useState<Record<number, boolean>>({});

  const loadPayroll = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getPayrollReport({
        startDate,
        endDate,
        primaryRate,
        coRate,
      });
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate payroll report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayroll();
  }, []);

  const toggleExpand = (instructorId: number) => {
    setExpandedInstructors((prev) => ({
      ...prev,
      [instructorId]: !prev[instructorId],
    }));
  };

  // Export payroll as CSV
  const handleExportCsv = () => {
    if (!report) return;
    const headers = [
      'Instructor Name',
      'Email',
      'Primary Sessions',
      'Primary Earnings (₹)',
      'Co-Instructor Sessions',
      'Co-Instructor Earnings (₹)',
      'Total Sessions',
      'Total Hours Taught',
      'Total Earnings (₹)',
    ];

    const rows = report.instructors.map((i) => [
      `"${i.instructorName}"`,
      `"${i.instructorEmail}"`,
      i.primaryCount,
      i.primaryEarnings.toFixed(2),
      i.coCount,
      i.coEarnings.toFixed(2),
      i.totalSessions,
      i.totalHoursTaught,
      i.totalEarnings.toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-${report.dateRange.startDate}-to-${report.dateRange.endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (!isStaff) {
    return (
      <div className="alert alert-error" style={{ margin: '3rem auto', maxWidth: '600px' }}>
        <AlertCircle size={18} />
        <span>Access restricted: Only studio staff can access instructor payroll reports.</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Instructor Payroll Reporting</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Calculate instructor earnings based on finished sessions taught, differentiating primary and co-instructor rates.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleExportCsv} disabled={!report || loading} className="btn btn-secondary btn-sm">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={loadPayroll} className="btn btn-primary btn-sm">
            <RefreshCw size={14} /> Recalculate
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Rate Configuration Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FileText size={16} color="var(--accent-primary)" /> Pay Period & Compensation Rates
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label htmlFor="pStartDate" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Start Date</label>
            <input
              id="pStartDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="pEndDate" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>End Date</label>
            <input
              id="pEndDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="pRate" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Primary Rate (₹ / session)</label>
            <input
              id="pRate"
              type="number"
              min="0"
              step="5"
              value={primaryRate}
              onChange={(e) => setPrimaryRate(Number(e.target.value))}
            />
          </div>

          <div>
            <label htmlFor="coRate" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Co-Instructor Rate (₹ / session)</label>
            <input
              id="coRate"
              type="number"
              min="0"
              step="5"
              value={coRate}
              onChange={(e) => setCoRate(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Headline KPI Cards */}
      {report && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Payroll Expense
              </span>
              <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                <Receipt size={16} color="var(--text-secondary)" />
              </div>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ₹{report.summary.totalStudioPayroll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Pay period {report.dateRange.startDate} to {report.dateRange.endDate}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Sessions Taught
              </span>
              <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                <Calendar size={16} color="var(--text-secondary)" />
              </div>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {report.summary.totalSessionsTaught}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Finished classes in window
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Teaching Hours
              </span>
              <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                <Clock size={16} color="var(--text-secondary)" />
              </div>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {report.summary.totalHoursTaught} <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>hrs</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Studio classroom instruction time
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Active Instructors
              </span>
              <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                <Users size={16} color="var(--text-secondary)" />
              </div>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {report.summary.activeInstructors} / {report.instructors.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Instructors with taught sessions
            </div>
          </div>
        </div>
      )}

      {/* Instructor Breakdown Table */}
      <div className="table-container" style={{ marginBottom: '2rem' }}>
        <table>
          <thead>
            <tr>
              <th>Instructor</th>
              <th>Primary Sessions</th>
              <th>Co-Instructor Sessions</th>
              <th>Total Hours</th>
              <th style={{ textAlign: 'right' }}>Total Payout</th>
              <th style={{ textAlign: 'center' }}>Itemized Audit</th>
            </tr>
          </thead>
          <tbody>
            {report?.instructors.map((inst: InstructorPayrollItem) => {
              const isExpanded = expandedInstructors[inst.instructorId];

              return (
                <React.Fragment key={inst.instructorId}>
                  <tr>
                    <td>
                      <div style={{ fontWeight: 600 }}>{inst.instructorName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inst.instructorEmail}</div>
                    </td>
                    <td>
                      <div><strong>{inst.primaryCount}</strong> sessions</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        ₹{inst.primaryEarnings.toFixed(2)} (@ ₹{report.rates.primaryRate}/ea)
                      </div>
                    </td>
                    <td>
                      <div><strong>{inst.coCount}</strong> sessions</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        ₹{inst.coEarnings.toFixed(2)} (@ ₹{report.rates.coRate}/ea)
                      </div>
                    </td>
                    <td>
                      <strong>{inst.totalHoursTaught} hrs</strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                        ₹{inst.totalEarnings.toFixed(2)}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => toggleExpand(inst.instructorId)}
                        className="btn btn-secondary btn-sm"
                        disabled={inst.sessions.length === 0}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {inst.sessions.length} session{inst.sessions.length === 1 ? '' : 's'}
                      </button>
                    </td>
                  </tr>

                  {/* Expandable itemized sessions row */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={6} style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '1rem 1.5rem' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                          Itemized Sessions Taught by {inst.instructorName}:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                          {inst.sessions.map((s, idx) => (
                            <div 
                              key={idx}
                              style={{
                                padding: '0.75rem',
                                borderRadius: '6px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid var(--border-subtle)',
                                fontSize: '0.8rem',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: 600 }}>{s.classTitle}</span>
                                <span className={s.role === 'primary' ? 'badge badge-booked' : 'badge badge-instructor'}>
                                  {s.role}
                                </span>
                              </div>
                              <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                {s.date} at {s.startTime} ({s.duration} mins) • Room: {s.room}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                <span>{s.attendedCount} attended</span>
                                <strong style={{ color: '#34d399' }}>+₹{s.payout.toFixed(2)}</strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {(!report || report.instructors.length === 0) && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                  {loading ? 'Computing payroll records…' : 'No instructors found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
