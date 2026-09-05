import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, RoomUtilizationReport, RoomUtilizationItem } from '../api/client';
import { 
  Building2, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Sun, 
  Sunset, 
  Moon, 
  AlertCircle,
  RefreshCw,
  Info
} from 'lucide-react';

export const RoomUtilization: React.FC = () => {
  const { isStaff } = useAuth();
  const [report, setReport] = useState<RoomUtilizationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(thirtyDaysAgoStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [operatingHours, setOperatingHours] = useState(12);

  const loadUtilization = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getRoomUtilizationReport({
        startDate,
        endDate,
        operatingHours,
      });
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load room utilization report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUtilization();
  }, []);

  if (!isStaff) {
    return (
      <div className="alert alert-error" style={{ margin: '3rem auto', maxWidth: '600px' }}>
        <AlertCircle size={18} />
        <span>Access restricted: Only studio staff can view room utilization analytics.</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Room Utilization Reporting</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Track room occupancy, utilization rates against daily operating capacity, and peak-hour distribution.
          </p>
        </div>

        <button onClick={loadUtilization} className="btn btn-primary btn-sm">
          <RefreshCw size={14} /> Refresh Report
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Parameters */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label htmlFor="uStartDate" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Start Date</label>
            <input
              id="uStartDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="uEndDate" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>End Date</label>
            <input
              id="uEndDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="uOperatingHours" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Operating Window (hours/day)
            </label>
            <input
              id="uOperatingHours"
              type="number"
              min="4"
              max="24"
              value={operatingHours}
              onChange={(e) => setOperatingHours(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {report && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Studio Utilization
              </span>
              <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                <TrendingUp size={16} color="var(--text-secondary)" />
              </div>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {report.summary.overallUtilizationRate}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Across {report.summary.totalRooms} rooms over {report.dateRange.daysInRange} days
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Booked Room Time
              </span>
              <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                <Clock size={16} color="var(--text-secondary)" />
              </div>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {report.summary.totalBookedHours} <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>hrs</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Out of {report.summary.totalOperatingHours} available operating hrs
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Sessions Hosted
              </span>
              <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                <Calendar size={16} color="var(--text-secondary)" />
              </div>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {report.summary.totalSessionsHosted}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Scheduled in date window
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Studio Rooms
              </span>
              <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                <Building2 size={16} color="var(--text-secondary)" />
              </div>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {report.summary.totalRooms}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Configured facilities & studios
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Computing room utilization metrics…
        </div>
      )}

      {/* Room Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {report?.rooms.map((room: RoomUtilizationItem) => {
          return (
            <div 
              key={room.room} 
              className="glass-panel" 
              style={{ 
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.5rem',
              }}
            >
              <div>
                {/* Room Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 size={18} color="var(--accent-primary)" />
                    <h2 style={{ fontSize: '1.25rem' }}>{room.room}</h2>
                  </div>
                  <span className="badge badge-booked" style={{ fontSize: '0.85rem' }}>
                    {room.sessionsCount} sessions
                  </span>
                </div>

                {/* Utilization Meter */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Operating Utilization</span>
                    <strong>{room.utilizationRate}%</strong>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${Math.min(100, room.utilizationRate)}%`,
                        background: room.utilizationRate > 60 
                          ? 'linear-gradient(90deg, #E52424, #B91C1C)' 
                          : 'linear-gradient(90deg, #10b981, #E52424)',
                        borderRadius: '4px' 
                      }} 
                    />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    {room.bookedHours} hrs booked / {room.operatingHours} operational hrs
                  </div>
                </div>

                {/* Capacity Fill Rate */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Member Capacity Fill Rate</span>
                    <strong>{room.fillRate}%</strong>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${Math.min(100, room.fillRate)}%`,
                        background: room.fillRate > 70 ? '#10b981' : '#f59e0b',
                        borderRadius: '4px' 
                      }} 
                    />
                  </div>
                </div>

                {/* Peak Hours Breakdown */}
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Peak Usage Distribution:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                    <div style={{ padding: '0.6rem 0.4rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.2rem' }}>
                        <Sun size={14} color="#f59e0b" />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Morning</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{room.peakTimes.morningCount}</div>
                    </div>

                    <div style={{ padding: '0.6rem 0.4rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.2rem' }}>
                        <Sunset size={14} color="#E52424" />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Afternoon</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{room.peakTimes.afternoonCount}</div>
                    </div>

                    <div style={{ padding: '0.6rem 0.4rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.2rem' }}>
                        <Moon size={14} color="#8b5cf6" />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Evening</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{room.peakTimes.eveningCount}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operational insight */}
              <div style={{ 
                padding: '0.75rem', 
                borderRadius: '6px', 
                background: 'var(--bg-secondary)', 
                border: '1px solid var(--border-subtle)',
                fontSize: '0.775rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <Info size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                <span>
                  {room.sessionsCount === 0 
                    ? 'Room has open availability across all operational time blocks.' 
                    : room.utilizationRate > 60
                    ? 'High utilization room; ideal for primary recurring schedules.'
                    : 'Good headroom available for adding new recurring sessions or workshops.'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
