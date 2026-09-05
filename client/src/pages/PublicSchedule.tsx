import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, PublicSessionItem } from '../api/client';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  LogIn, 
  AlertCircle,
  ArrowLeft,
  CalendarCheck,
  CheckCircle2
} from 'lucide-react';
import { MemberBookingModal } from '../components/MemberBookingModal';
import { MemberPortalModal } from '../components/MemberPortalModal';
import { MemberProfile, MemberSelfServiceBooking } from '../api/client';

interface PublicScheduleProps {
  onSignInClick?: () => void;
  onBackToApp?: () => void;
  onBackToHome?: () => void;
  initialRoom?: string;
  initialInstructor?: string;
  initialDiscipline?: string;
}

const formatYMD = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getFallbackSchedule = (): { sessions: PublicSessionItem[]; disciplines: string[] } => {
  const today = new Date();
  const d0 = formatYMD(today);
  const d1 = formatYMD(new Date(today.getTime() + 86400000));
  const d2 = formatYMD(new Date(today.getTime() + 86400000 * 2));
  const d3 = formatYMD(new Date(today.getTime() + 86400000 * 3));

  const fallbackSessions: PublicSessionItem[] = [
    {
      id: 101,
      classTitle: 'Morning Flow Yoga',
      description: 'Awaken your mind and body with dynamic vinyasa flow sequencing, mobility drills, and restorative breathwork.',
      discipline: 'Yoga',
      date: d0,
      startTime: '07:30',
      duration: 60,
      capacity: 15,
      room: 'Studio A',
      primaryInstructor: 'Aarav Mehta',
      coInstructors: ['Ananya Iyer'],
      spotsRemaining: 4,
      isFull: false,
      waitlistedCount: 0,
    },
    {
      id: 102,
      classTitle: 'HIIT & Strength Blast',
      description: 'High-intensity interval conditioning combining plyometrics, kettlebell circuits, and sprint intervals.',
      discipline: 'Cardio',
      date: d0,
      startTime: '10:00',
      duration: 45,
      capacity: 10,
      room: 'Studio C',
      primaryInstructor: 'Victor Chanda',
      coInstructors: ['Rohan Verma'],
      spotsRemaining: 2,
      isFull: false,
      waitlistedCount: 0,
    },
    {
      id: 103,
      classTitle: 'Core Pilates & Posture',
      description: 'Precision matwork targeting deep stabilizing core musculature, pelvic alignment, and spinal flexibility.',
      discipline: 'Pilates',
      date: d0,
      startTime: '18:00',
      duration: 50,
      capacity: 12,
      room: 'Studio B',
      primaryInstructor: 'Rohan Verma',
      coInstructors: ['Ananya Iyer'],
      spotsRemaining: 1,
      isFull: false,
      waitlistedCount: 0,
    },
    {
      id: 104,
      classTitle: 'Bhangra Cardio & Dance',
      description: 'High-energy folk dance rhythm cardio fusion featuring authentic footwork, shoulder bounces, and upbeat acoustics.',
      discipline: 'Dance',
      date: d1,
      startTime: '09:00',
      duration: 60,
      capacity: 15,
      room: 'Studio A',
      primaryInstructor: 'Priya Patel',
      coInstructors: ['Aarav Mehta'],
      spotsRemaining: 8,
      isFull: false,
      waitlistedCount: 0,
    },
    {
      id: 105,
      classTitle: 'Functional Rig & Kettlebells',
      description: 'Rogue power rack work, assault bike sprints, Concept2 rowing intervals, and turf carries.',
      discipline: 'Cardio',
      date: d1,
      startTime: '17:30',
      duration: 45,
      capacity: 10,
      room: 'Studio C',
      primaryInstructor: 'Victor Chanda',
      coInstructors: [],
      spotsRemaining: 5,
      isFull: false,
      waitlistedCount: 0,
    },
    {
      id: 106,
      classTitle: 'Restorative Vinyasa & Mobility',
      description: 'Awaken your mind and body with dynamic vinyasa flow sequencing, mobility drills, and restorative breathwork.',
      discipline: 'Yoga',
      date: d2,
      startTime: '08:00',
      duration: 60,
      capacity: 12,
      room: 'Studio B',
      primaryInstructor: 'Ananya Iyer',
      coInstructors: ['Aarav Mehta'],
      spotsRemaining: 6,
      isFull: false,
      waitlistedCount: 0,
    },
    {
      id: 107,
      classTitle: 'Athletic Conditioning Circuits',
      description: 'High-intensity interval conditioning combining plyometrics, kettlebell circuits, and sprint intervals.',
      discipline: 'Cardio',
      date: d3,
      startTime: '18:30',
      duration: 45,
      capacity: 10,
      room: 'Studio C',
      primaryInstructor: 'Victor Chanda',
      coInstructors: ['Rohan Verma'],
      spotsRemaining: 3,
      isFull: false,
      waitlistedCount: 0,
    },
    {
      id: 108,
      classTitle: 'Bhangra Rhythm & Cardio Burn',
      description: 'High-intensity rhythm dance intervals engineered for peak endurance and cardio conditioning.',
      discipline: 'Dance',
      date: d0,
      startTime: '17:00',
      duration: 50,
      capacity: 15,
      room: 'Studio A',
      primaryInstructor: 'Priya Patel',
      coInstructors: [],
      spotsRemaining: 7,
      isFull: false,
      waitlistedCount: 0,
    },
    {
      id: 109,
      classTitle: 'Classical Mat Pilates Mechanics',
      description: 'Spinal rehabilitation, posterior chain stabilization, and core postural control.',
      discipline: 'Pilates',
      date: d1,
      startTime: '11:00',
      duration: 50,
      capacity: 12,
      room: 'Studio B',
      primaryInstructor: 'Rohan Verma',
      coInstructors: [],
      spotsRemaining: 4,
      isFull: false,
      waitlistedCount: 0,
    },
    {
      id: 110,
      classTitle: 'Ashtanga Vinyasa Flow & Breath',
      description: 'Traditional alignment-focused asana sequencing, kinetic hip opening, and pranayama.',
      discipline: 'Yoga',
      date: d1,
      startTime: '07:00',
      duration: 60,
      capacity: 15,
      room: 'Studio A',
      primaryInstructor: 'Ananya Iyer',
      coInstructors: [],
      spotsRemaining: 5,
      isFull: false,
      waitlistedCount: 0,
    },
  ];

  return {
    sessions: fallbackSessions,
    disciplines: ['Cardio', 'Dance', 'Pilates', 'Yoga'],
  };
};

const getCachedSchedule = (): { sessions: PublicSessionItem[]; disciplines: string[] } => {
  try {
    const raw = localStorage.getItem('vfitness_public_schedule');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.sessions) && parsed.sessions.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return getFallbackSchedule();
};

export const normalizeRoom = (roomStr: string) => {
  const lower = (roomStr || '').toLowerCase();
  if (lower.includes('studio a') || lower.includes('main movement') || lower.includes('movement hall') || lower.includes('main studio')) return 'Studio A';
  if (lower.includes('studio b') || lower.includes('mind & core') || lower.includes('mind and core')) return 'Studio B';
  if (lower.includes('studio c') || lower.includes('functional rig') || lower.includes('hiit & functional') || lower.includes('spin arena')) return 'Studio C';
  return roomStr;
};

export const matchesInstructorName = (sessionInstructor: string, filterInstructor: string): boolean => {
  if (!filterInstructor || filterInstructor === 'all') return true;
  const fLower = filterInstructor.toLowerCase().trim();
  const sLower = (sessionInstructor || '').toLowerCase().trim();
  if (!sLower) return false;
  if (sLower === fLower) return true;
  if (sLower.includes(fLower) || fLower.includes(sLower)) return true;

  // First name match (e.g. Victor, Priya, Ananya, Rohan, Aarav)
  const fFirst = fLower.split(' ')[0];
  const sFirst = sLower.split(' ')[0];
  if (fFirst && sFirst && fFirst === sFirst) return true;

  // Cross-system name aliases (e.g. Ananya Iyer, Rohan Verma)
  if (fLower.includes('ananya') && sLower.includes('ananya')) return true;
  if (fLower.includes('verma') && sLower.includes('verma')) return true;
  if (fLower.includes('victor') && sLower.includes('victor')) return true;
  if (fLower.includes('priya') && sLower.includes('priya')) return true;
  if (fLower.includes('aarav') && sLower.includes('aarav')) return true;

  return false;
};

export const matchesDiscipline = (sessionDiscipline: string, filterDiscipline: string, classTitle?: string): boolean => {
  if (!filterDiscipline || filterDiscipline === 'all') return true;
  const sDisc = (sessionDiscipline || '').toLowerCase().trim();
  const fDisc = (filterDiscipline || '').toLowerCase().trim();
  const title = (classTitle || '').toLowerCase().trim();

  if (sDisc === fDisc) return true;
  if (sDisc && fDisc && (sDisc.includes(fDisc) || fDisc.includes(sDisc))) return true;

  // HIIT & Strength / Cardio cross-category matching
  const isHiitStrengthFilter = fDisc.includes('hiit') || fDisc.includes('strength') || fDisc.includes('cardio');
  const isHiitStrengthSession = sDisc.includes('hiit') || sDisc.includes('strength') || sDisc.includes('cardio') || title.includes('hiit') || title.includes('strength') || title.includes('circuit') || title.includes('conditioning');
  if (isHiitStrengthFilter && isHiitStrengthSession && !title.includes('dance') && !title.includes('bhangra') && sDisc !== 'dance') {
    return true;
  }

  // Bhangra & Dance
  const isDanceFilter = fDisc.includes('dance') || fDisc.includes('bhangra');
  const isDanceSession = sDisc.includes('dance') || sDisc.includes('bhangra') || title.includes('dance') || title.includes('bhangra');
  if (isDanceFilter && isDanceSession) {
    return true;
  }

  // Pilates & Core
  const isPilatesFilter = fDisc.includes('pilates') || fDisc.includes('core');
  const isPilatesSession = sDisc.includes('pilates') || sDisc.includes('core') || title.includes('pilates') || title.includes('core');
  if (isPilatesFilter && isPilatesSession) {
    return true;
  }

  // Yoga & Mobility
  const isYogaFilter = fDisc.includes('yoga') || fDisc.includes('mobility');
  const isYogaSession = sDisc.includes('yoga') || sDisc.includes('mobility') || title.includes('yoga') || title.includes('mobility');
  if (isYogaFilter && isYogaSession) {
    return true;
  }

  return false;
};

export const COACH_OPTIONS = [
  { id: 'all', label: 'All Coaches' },
  { id: 'Victor Chanda', label: 'Victor Chanda • Head Coach' },
  { id: 'Ananya Iyer', label: 'Ananya Iyer • Movement Coach' },
  { id: 'Rohan Verma', label: 'Rohan Verma • Pilates Specialist' },
  { id: 'Priya Patel', label: 'Priya Patel • Cardio & Dance Lead' },
  { id: 'Aarav Mehta', label: 'Aarav Mehta • Mobility Coach' },
];

export const PublicSchedule: React.FC<PublicScheduleProps> = ({ 
  onSignInClick, 
  onBackToApp,
  onBackToHome,
  initialRoom = 'all',
  initialInstructor = 'all',
  initialDiscipline = 'all'
}) => {
  const { user } = useAuth();
  const initialData = getCachedSchedule();
  const [sessions, setSessions] = useState<PublicSessionItem[]>(initialData.sessions);
  const [disciplines, setDisciplines] = useState<string[]>(initialData.disciplines);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Member Self-Service State
  const [selectedBookingSession, setSelectedBookingSession] = useState<PublicSessionItem | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [memberPortalOpen, setMemberPortalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentMember, setCurrentMember] = useState<MemberProfile | null>(() => {
    try {
      const saved = localStorage.getItem('vfitness_member_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [memberBookings, setMemberBookings] = useState<MemberSelfServiceBooking[]>([]);

  const loadMemberBookings = async (memberEmail: string) => {
    if (!memberEmail) {
      setMemberBookings([]);
      return;
    }
    try {
      const res = await api.getMemberOnlineBookings(memberEmail);
      setMemberBookings(res.bookings || []);
    } catch {
      setMemberBookings([]);
    }
  };

  useEffect(() => {
    if (currentMember?.email) {
      loadMemberBookings(currentMember.email);
    } else {
      setMemberBookings([]);
    }
  }, [currentMember?.email]);

  const handleMemberChange = (member: MemberProfile | null) => {
    setCurrentMember(member);
    try {
      if (member) {
        localStorage.setItem('vfitness_member_profile', JSON.stringify(member));
        loadMemberBookings(member.email);
      } else {
        localStorage.removeItem('vfitness_member_profile');
        setMemberBookings([]);
      }
    } catch {}
  };

  const refreshSchedule = async () => {
    try {
      setIsSyncing(true);
      const data = await api.getPublicSchedule();
      setSessions(data.sessions);
      setDisciplines(data.disciplines);
      try {
        localStorage.setItem('vfitness_public_schedule', JSON.stringify(data));
      } catch {}
    } catch (err) {
      console.error('Failed to refresh schedule', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Filters
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>(initialDiscipline);
  const [selectedRoom, setSelectedRoom] = useState<string>(initialRoom);
  const [selectedInstructor, setSelectedInstructor] = useState<string>(initialInstructor);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');

  // Keep filters in sync if props change
  useEffect(() => {
    if (initialDiscipline) {
      setSelectedDiscipline(initialDiscipline);
    }
  }, [initialDiscipline]);

  useEffect(() => {
    if (initialRoom) {
      setSelectedRoom(initialRoom);
    }
  }, [initialRoom]);

  useEffect(() => {
    if (initialInstructor) {
      setSelectedInstructor(initialInstructor);
    }
  }, [initialInstructor]);

  useEffect(() => {
    let isMounted = true;
    async function loadSchedule() {
      try {
        setError(null);
        const data = await api.getPublicSchedule();
        if (!isMounted) return;
        setSessions(data.sessions);
        setDisciplines(data.disciplines);
        try {
          localStorage.setItem('vfitness_public_schedule', JSON.stringify(data));
        } catch {}
      } catch (err: any) {
        if (!isMounted) return;
        // If we already have sessions showing from cache/fallback, do not overwrite screen with error
        if (sessions.length === 0) {
          setError(err.message || 'Failed to load public timetable');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsSyncing(false);
        }
      }
    }
    loadSchedule();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered sessions
  const filteredSessions = sessions.filter((s) => {
    const matchesDisc = matchesDiscipline(s.discipline, selectedDiscipline, s.classTitle);
    const matchesDate = !selectedDateFilter || s.date === selectedDateFilter;
    
    const sessionRoomNorm = normalizeRoom(s.room);
    const selectedRoomNorm = normalizeRoom(selectedRoom);
    const matchesRoom =
      selectedRoom === 'all' ||
      sessionRoomNorm.toLowerCase() === selectedRoomNorm.toLowerCase() ||
      s.room.toLowerCase().includes(selectedRoom.toLowerCase());

    const matchesInstructor =
      selectedInstructor === 'all' ||
      matchesInstructorName(s.primaryInstructor, selectedInstructor) ||
      (Array.isArray(s.coInstructors) && s.coInstructors.some((co) => matchesInstructorName(co, selectedInstructor)));

    return matchesDisc && matchesDate && matchesRoom && matchesInstructor;
  });

  // Group by date for readable agenda view
  const groupedByDate: Record<string, PublicSessionItem[]> = {};
  for (const s of filteredSessions) {
    if (!groupedByDate[s.date]) {
      groupedByDate[s.date] = [];
    }
    groupedByDate[s.date].push(s);
  }

  const sortedDates = Object.keys(groupedByDate).sort();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Top Brand Bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2.5rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            V Fitness Studio
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Public Timetable
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {onBackToHome && (
            <button onClick={onBackToHome} className="btn btn-secondary btn-sm">
              <ArrowLeft size={14} /> Back to Overview
            </button>
          )}

          {/* Member Self-Service Portal Access */}
          <button 
            type="button"
            onClick={() => setMemberPortalOpen(true)} 
            className="btn btn-secondary btn-sm"
            style={{ 
              borderColor: 'rgba(229, 36, 36, 0.45)', 
              backgroundColor: 'rgba(229, 36, 36, 0.1)',
              color: '#ffffff',
              fontWeight: 700
            }}
          >
            <CalendarCheck size={14} color="var(--crimson-primary)" />
            {currentMember ? `My Bookings (${currentMember.name.split(' ')[0]})` : 'My Bookings / Member Portal'}
          </button>

          {user ? (
            <button onClick={onBackToApp} className="btn btn-secondary btn-sm">
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
          ) : (
            <button onClick={onSignInClick} className="btn btn-primary btn-sm">
              <LogIn size={14} /> Staff Login
            </button>
          )}
        </div>
      </header>

      {/* Hero Welcome */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Explore Our Classes & Sessions
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem' }}>
          Browse our live studio timetable across yoga, pilates, HIIT, dance, and conditioning. Real-time availability updated live.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.85rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.3rem 0.85rem',
            borderRadius: '20px',
            background: isSyncing ? 'rgba(229, 36, 36, 0.14)' : 'rgba(16, 185, 129, 0.12)',
            border: `1px solid ${isSyncing ? 'rgba(229, 36, 36, 0.35)' : 'rgba(16, 185, 129, 0.28)'}`,
            fontSize: '0.8rem',
            color: isSyncing ? '#ff8585' : '#34d399',
            fontWeight: 500,
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isSyncing ? '#ff8585' : '#34d399',
              boxShadow: isSyncing ? '0 0 8px #E52424' : '0 0 8px #10b981',
            }} />
            {isSyncing ? 'Syncing latest live spot availability…' : 'Live availability synchronized'}
          </span>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Date Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Row 1: Studio Room Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, minWidth: '95px', letterSpacing: '0.04em' }}>
              STUDIO ROOM:
            </span>
            <button
              type="button"
              onClick={() => setSelectedRoom('all')}
              className={`btn ${selectedRoom === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ borderRadius: '20px', padding: '0.35rem 0.95rem', fontSize: '0.78rem' }}
            >
              All Studios (Show All)
            </button>
            {[
              { id: 'Studio A', label: 'Studio A' },
              { id: 'Studio B', label: 'Studio B' },
              { id: 'Studio C', label: 'Studio C' },
            ].map((st) => {
              const isActive = normalizeRoom(selectedRoom) === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedRoom(st.id)}
                  className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ borderRadius: '20px', padding: '0.35rem 0.95rem', fontSize: '0.78rem' }}
                >
                  {st.label}
                </button>
              );
            })}
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

          {/* Row 2: Coach / Instructor Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, minWidth: '95px', letterSpacing: '0.04em' }}>
              COACH:
            </span>
            {COACH_OPTIONS.map((co) => {
              const isActive = co.id === 'all' 
                ? selectedInstructor === 'all' 
                : (selectedInstructor !== 'all' && matchesInstructorName(co.id, selectedInstructor));
              return (
                <button
                  key={co.id}
                  type="button"
                  onClick={() => setSelectedInstructor(co.id)}
                  className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ borderRadius: '20px', padding: '0.35rem 0.95rem', fontSize: '0.78rem' }}
                >
                  {co.label}
                </button>
              );
            })}
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

          {/* Row 3: Discipline & Date Filter */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
            
            {/* Discipline Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, minWidth: '95px', letterSpacing: '0.04em' }}>
                DISCIPLINE:
              </span>
              <button
                type="button"
                onClick={() => setSelectedDiscipline('all')}
                className={`btn ${selectedDiscipline === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                style={{ borderRadius: '20px', padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
              >
                All Disciplines
              </button>
              {disciplines.map((d) => {
                const isActive = selectedDiscipline !== 'all' && matchesDiscipline(d, selectedDiscipline);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDiscipline(d)}
                    className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    style={{ borderRadius: '20px', padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>

            {/* Date Picker Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="publicDateFilter" style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'none' }}>
                Filter Date:
              </label>
              <input
                id="publicDateFilter"
                type="date"
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                style={{ width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
              />
              {selectedDateFilter && (
                <button onClick={() => setSelectedDateFilter('')} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.6rem' }}>
                  Clear
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Active Discipline Indicator Banner */}
      {selectedDiscipline !== 'all' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          borderRadius: '6px',
          backgroundColor: 'rgba(229, 36, 36, 0.08)',
          border: '1px solid rgba(229, 36, 36, 0.3)',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              backgroundColor: 'var(--crimson-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <CalendarCheck size={15} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                Showing Classes for {selectedDiscipline.toUpperCase()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                {filteredSessions.length === 0 
                  ? `No upcoming classes currently scheduled for ${selectedDiscipline} with active filters` 
                  : `Displaying ${filteredSessions.length} session${filteredSessions.length === 1 ? '' : 's'} in the ${selectedDiscipline} program`}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedDiscipline('all')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.85rem' }}
          >
            Show All Disciplines (Clear)
          </button>
        </div>
      )}

      {/* Active Studio Room Indicator Banner */}
      {selectedRoom !== 'all' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          borderRadius: '6px',
          backgroundColor: 'rgba(229, 36, 36, 0.08)',
          border: '1px solid rgba(229, 36, 36, 0.3)',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              backgroundColor: 'var(--crimson-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <MapPin size={15} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                Filtering Exclusively for {normalizeRoom(selectedRoom).toUpperCase()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                {filteredSessions.length === 0 ? 'No sessions found for this studio with current filters' : `Showing only sessions scheduled in ${selectedRoom} (${filteredSessions.length} total)`}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedRoom('all')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.85rem' }}
          >
            Show All Studios (Clear)
          </button>
        </div>
      )}

      {/* Active Coach / Instructor Indicator Banner */}
      {selectedInstructor !== 'all' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          borderRadius: '6px',
          backgroundColor: 'rgba(229, 36, 36, 0.08)',
          border: '1px solid rgba(229, 36, 36, 0.3)',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              backgroundColor: 'var(--crimson-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Users size={15} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                Classes Instructed by {selectedInstructor.toUpperCase()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                {filteredSessions.length === 0 
                  ? `No upcoming classes currently found for ${selectedInstructor} with active filters` 
                  : `Showing ${filteredSessions.length} session${filteredSessions.length === 1 ? '' : 's'} coached by ${selectedInstructor}`}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedInstructor('all')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.85rem' }}
          >
            Show All Coaches (Clear)
          </button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading live studio timetable…
        </div>
      )}

      {/* Agenda Grouped by Date */}
      {!loading && sortedDates.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {sortedDates.map((dateStr) => {
            const dateObj = new Date(`${dateStr}T12:00:00`);
            const formattedDate = dateObj.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });
            const daySessions = groupedByDate[dateStr];

            return (
              <section key={dateStr}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid var(--border-subtle)' 
                }}>
                  <Calendar size={18} color="var(--accent-primary)" />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formattedDate}</h2>
                  <span className="badge" style={{ fontSize: '0.75rem' }}>
                    {daySessions.length} session{daySessions.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
                  {daySessions.map((s) => (
                    <div 
                      key={s.id} 
                      className="glass-panel" 
                      style={{ 
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        {/* Header badges */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <span className="badge badge-booked">{s.discipline}</span>
                          {s.isFull ? (
                            <span className="badge badge-waitlisted">
                              Full ({s.waitlistedCount} waitlisted)
                            </span>
                          ) : (
                            <span className="badge badge-attended">
                              {s.spotsRemaining} spot{s.spotsRemaining === 1 ? '' : 's'} left
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>{s.classTitle}</h3>
                        {s.description && (
                          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
                            {s.description}
                          </p>
                        )}

                        {/* Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Clock size={14} color="var(--accent-cyan)" />
                            <span><strong>{s.startTime}</strong> ({s.duration} minutes)</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <MapPin size={14} color="var(--accent-amber)" />
                            <span>Room: {s.room}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Users size={14} color="var(--accent-purple)" />
                            <span>Instructor: <strong>{s.primaryInstructor}</strong></span>
                          </div>
                          {s.coInstructors.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--accent-primary)', paddingLeft: '1.25rem' }}>
                              <span>Co-taught with: {s.coInstructors.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Member Self-Service Booking Action Button */}
                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                        {(() => {
                          const mb = memberBookings.find(
                            (b) => b.sessionId === s.id && (b.status === 'booked' || b.status === 'waitlisted')
                          );
                          if (mb?.status === 'booked') {
                            return (
                              <button 
                                type="button"
                                onClick={() => {
                                  setSelectedBookingSession(s);
                                  setBookingModalOpen(true);
                                }}
                                style={{ 
                                  width: '100%', 
                                  justifyContent: 'center',
                                  padding: '0.65rem 1rem',
                                  fontWeight: 700,
                                  letterSpacing: '0.04em',
                                  textTransform: 'uppercase',
                                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                  border: '1px solid rgba(16, 185, 129, 0.4)',
                                  color: '#34d399',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.45rem',
                                  fontSize: '0.8rem'
                                }}
                              >
                                <CheckCircle2 size={15} color="#34d399" />
                                ✓ YOU ARE BOOKED (VIEW SPOT)
                              </button>
                            );
                          }
                          if (mb?.status === 'waitlisted') {
                            return (
                              <button 
                                type="button"
                                onClick={() => {
                                  setSelectedBookingSession(s);
                                  setBookingModalOpen(true);
                                }}
                                style={{ 
                                  width: '100%', 
                                  justifyContent: 'center',
                                  padding: '0.65rem 1rem',
                                  fontWeight: 700,
                                  letterSpacing: '0.04em',
                                  textTransform: 'uppercase',
                                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                  border: '1px solid rgba(245, 158, 11, 0.4)',
                                  color: '#fbbf24',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.45rem',
                                  fontSize: '0.8rem'
                                }}
                              >
                                <Users size={15} color="#fbbf24" />
                                WAITLIST #{mb.waitlistPosition || 1} (VIEW SPOT)
                              </button>
                            );
                          }
                          return (
                            <button 
                              type="button"
                              onClick={() => {
                                setSelectedBookingSession(s);
                                setBookingModalOpen(true);
                              }}
                              className={s.isFull ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'} 
                              style={{ 
                                width: '100%', 
                                justifyContent: 'center',
                                padding: '0.65rem 1rem',
                                fontWeight: 700,
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase'
                              }}
                            >
                              {s.isFull ? (
                                <>
                                  <Users size={14} /> Join Waitlist ({s.waitlistedCount} Waiting)
                                </>
                              ) : (
                                <>
                                  <CalendarCheck size={14} /> Book Class Spot ({s.spotsRemaining} Left) →
                                </>
                              )}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {!loading && sortedDates.length === 0 && (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#ffffff' }}>
            No sessions found matching your selected filters.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '1.25rem' }}>
            Try resetting your coach, studio room, discipline, or date filter to view upcoming sessions.
          </p>
          <button 
            type="button"
            onClick={() => { 
              setSelectedDiscipline('all'); 
              setSelectedDateFilter(''); 
              setSelectedRoom('all'); 
              setSelectedInstructor('all');
            }} 
            className="btn btn-primary btn-sm"
          >
            Reset All Filters (Show All Sessions)
          </button>
        </div>
      )}

      {/* Toast feedback banner */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#0D0E13',
          border: '1px solid var(--crimson-primary)',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '0.85rem 1.25rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(229, 36, 36, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          zIndex: 1200,
          animation: 'fadeIn 0.2s ease',
        }}>
          <CheckCircle2 size={18} color="var(--crimson-primary)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{toastMessage}</span>
        </div>
      )}

      {/* Member Self-Service Booking Modal */}
      <MemberBookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedBookingSession(null);
        }}
        session={selectedBookingSession}
        currentMember={currentMember}
        onMemberIdentified={handleMemberChange}
        onBookingComplete={(b) => {
          refreshSchedule();
          if (currentMember?.email) {
            loadMemberBookings(currentMember.email);
          }
          setToastMessage(
            b.status === 'booked' 
              ? 'Class spot confirmed successfully!' 
              : b.status === 'cancelled' 
              ? 'Booking cancelled successfully.' 
              : 'Added to waitlist!'
          );
          setTimeout(() => setToastMessage(null), 4000);
        }}
        onOpenMyBookings={() => {
          setBookingModalOpen(false);
          setMemberPortalOpen(true);
        }}
      />

      {/* Member Self-Service Portal (My Bookings & Cancellations) */}
      <MemberPortalModal
        isOpen={memberPortalOpen}
        onClose={() => setMemberPortalOpen(false)}
        currentMember={currentMember}
        onMemberChange={handleMemberChange}
        onBrowseClasses={() => setMemberPortalOpen(false)}
        onBookingCancelled={() => {
          refreshSchedule();
          if (currentMember?.email) {
            loadMemberBookings(currentMember.email);
          }
        }}
      />
    </div>
  );
};
