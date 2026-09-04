// ── Types ──────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'staff' | 'instructor';
}

export interface InstructorItem extends User {
  assignedSessionsCount?: number;
}

export interface ClassItem {
  id: number;
  title: string;
  description: string | null;
  discipline: string;
  defaultDuration: number;
  defaultCapacity: number;
  isArchived: boolean;
  createdAt: string;
  sessions?: SessionItem[];
}

export interface CoInstructor {
  id: number;
  name: string;
  email: string;
}

export interface SessionItem {
  id: number;
  classId: number;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:MM"
  duration: number;   // minutes
  capacity: number;
  room: string;
  primaryInstructorId: number;
  createdAt: string;
  class?: {
    id: number;
    title: string;
    discipline: string;
    defaultDuration?: number;
    defaultCapacity?: number;
  };
  primaryInstructor?: { id: number; name: string; email: string };
  coInstructors?: CoInstructor[];
  bookings?: BookingItem[];
}

export interface MemberItem {
  id: number;
  name: string;
  email: string;
  membershipExpiry: string; // "YYYY-MM-DD"
  dismissedAlertExpiry?: string | null;
  diffDays?: number;
  isExpired?: boolean;
  createdAt: string;
  bookings?: Array<BookingItem & { session?: { class?: { title: string } } }>;
}

export type BookingStatus = 'booked' | 'waitlisted' | 'cancelled' | 'attended' | 'no_show';

export interface BookingItem {
  id: number;
  sessionId: number;
  memberId: number;
  status: BookingStatus;
  createdAt: string;
  member?: MemberItem;
  session?: SessionItem;
}

export interface BookingHistoryItem {
  id: number;
  bookingId: number;
  oldStatus: string | null;
  newStatus: string;
  changedBy: number | null;
  note: string | null;
  createdAt: string;
  changedByUser?: { id: number; name: string; role: string } | null;
}

export interface BookingsQueryParams {
  search?: string;
  classId?: number;
  sessionId?: number;
  status?: string;
  sortBy?: 'createdAt' | 'status' | 'session';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedBookings {
  bookings: BookingItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  headline: {
    sessionsToday: number;
    bookingsMadeToday: number;
    noShowsThisWeek: number;
    membersWaitlisted: number;
  };
  byStatus: {
    booked: number;
    waitlisted: number;
    cancelled: number;
    attended: number;
    no_show: number;
  };
  byClass: Array<{
    classId: number;
    title: string;
    discipline: string;
    isArchived: boolean;
    totalBookings: number;
    attendedCount: number;
    waitlistedCount: number;
  }>;
  weeklyAttendance: Array<{
    weekLabel: string;
    startDate: string;
    endDate: string;
    attended: number;
    noShow: number;
    total: number;
  }>;
}

export interface ScheduleGenerationParams {
  startDate: string;
  endDate: string;
  dayOfWeek: number;
  startTime: string;
  duration?: number;
  capacity?: number;
  room: string;
  primaryInstructorId: number;
}

export interface ScheduleGenerationResult {
  summary: {
    totalCandidate: number;
    createdCount: number;
    skippedCount: number;
  };
  created: SessionItem[];
  skipped: Array<{ date: string; reason: string }>;
}

export interface AlertsResponse {
  count: number;
  members: MemberItem[];
}

export interface PublicSessionItem {
  id: number;
  classTitle: string;
  description: string | null;
  discipline: string;
  date: string;
  startTime: string;
  duration: number;
  capacity: number;
  room: string;
  primaryInstructor: string;
  coInstructors: string[];
  spotsRemaining: number;
  isFull: boolean;
  waitlistedCount: number;
}

export interface PublicScheduleResponse {
  startDate: string;
  endDate: string;
  total: number;
  disciplines: string[];
  sessions: PublicSessionItem[];
}

export interface InstructorPayrollItem {
  instructorId: number;
  instructorName: string;
  instructorEmail: string;
  primaryCount: number;
  primaryEarnings: number;
  coCount: number;
  coEarnings: number;
  totalSessions: number;
  totalHoursTaught: number;
  totalEarnings: number;
  sessions: Array<{
    sessionId: number;
    date: string;
    startTime: string;
    duration: number;
    classTitle: string;
    room: string;
    attendedCount: number;
    role: 'primary' | 'co-instructor';
    payout: number;
  }>;
}

export interface PayrollReport {
  dateRange: { startDate: string; endDate: string };
  rates: { primaryRate: number; coRate: number };
  summary: {
    totalStudioPayroll: number;
    totalSessionsTaught: number;
    totalHoursTaught: number;
    activeInstructors: number;
  };
  instructors: InstructorPayrollItem[];
}

export interface RoomUtilizationItem {
  room: string;
  sessionsCount: number;
  bookedHours: number;
  operatingHours: number;
  utilizationRate: number;
  fillRate: number;
  peakTimes: {
    morningCount: number;
    afternoonCount: number;
    eveningCount: number;
  };
}

export interface RoomUtilizationReport {
  dateRange: { startDate: string; endDate: string; daysInRange: number };
  operatingWindow: { hoursPerDay: number };
  summary: {
    totalRooms: number;
    overallUtilizationRate: number;
    totalBookedHours: number;
    totalOperatingHours: number;
    totalSessionsHosted: number;
  };
  rooms: RoomUtilizationItem[];
}

// ── Base Fetch Wrapper ─────────────────────────────────────────────────────────

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)
  ? `${(import.meta.env.VITE_API_URL as string).replace(/\/$/, '')}/api`
  : '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error || `Request failed with status ${res.status}`, res.status);
  }

  return data as T;
}

// ── API Surface ────────────────────────────────────────────────────────────────

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request<User>('/auth/me'),

  getInstructors: () => request<InstructorItem[]>('/auth/instructors'),

  createInstructor: (data: { name: string; email: string; password: string }) =>
    request<InstructorItem>('/auth/instructors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteInstructor: (id: number) =>
    request<{ success: boolean; message: string }>(`/auth/instructors/${id}`, {
      method: 'DELETE',
    }),

  // Classes
  getClasses: (includeArchived = false) =>
    request<ClassItem[]>(`/classes${includeArchived ? '?include_archived=true' : ''}`),

  getClass: (id: number) => request<ClassItem>(`/classes/${id}`),

  createClass: (data: {
    title: string;
    description?: string;
    discipline: string;
    defaultDuration: number;
    defaultCapacity: number;
  }) =>
    request<ClassItem>('/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateClass: (
    id: number,
    data: Partial<{
      title: string;
      description: string;
      discipline: string;
      defaultDuration: number;
      defaultCapacity: number;
    }>,
  ) =>
    request<ClassItem>(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  archiveClass: (id: number) =>
    request<ClassItem>(`/classes/${id}/archive`, { method: 'PATCH' }),

  // Sessions
  getSessions: () => request<SessionItem[]>('/sessions'),

  getClassSessions: (classId: number) =>
    request<SessionItem[]>(`/classes/${classId}/sessions`),

  getSession: (id: number) => request<SessionItem>(`/sessions/${id}`),

  createSession: (
    classId: number,
    data: {
      date: string;
      startTime: string;
      duration?: number;
      capacity?: number;
      room: string;
      primaryInstructorId: number;
    },
  ) =>
    request<SessionItem>(`/classes/${classId}/sessions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSession: (
    id: number,
    data: Partial<{
      date: string;
      startTime: string;
      duration: number;
      capacity: number;
      room: string;
      primaryInstructorId: number;
    }>,
  ) =>
    request<SessionItem>(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteSession: (id: number) =>
    request<{ message: string; session: SessionItem }>(`/sessions/${id}`, {
      method: 'DELETE',
    }),

  // Co-instructors (Goal 5)
  addCoInstructor: (sessionId: number, instructorId: number) =>
    request<{ message: string; coInstructor: CoInstructor }>(
      `/sessions/${sessionId}/co-instructors`,
      {
        method: 'POST',
        body: JSON.stringify({ instructorId }),
      },
    ),

  removeCoInstructor: (sessionId: number, instructorId: number) =>
    request<{ message: string }>(`/sessions/${sessionId}/co-instructors/${instructorId}`, {
      method: 'DELETE',
    }),

  // Recurring schedule generator (Goal 7)
  generateRecurringSchedule: (classId: number, params: ScheduleGenerationParams) =>
    request<ScheduleGenerationResult>(`/classes/${classId}/generate-schedule`, {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  // CSV Attendance Export (Goal 7)
  downloadSessionCsv: async (sessionId: number) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/export-csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      throw new Error('Failed to export session CSV');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${sessionId}-attendance.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // Bookings (Goal 6)
  findBookings: (params: BookingsQueryParams = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.classId) query.set('classId', String(params.classId));
    if (params.sessionId) query.set('sessionId', String(params.sessionId));
    if (params.status) query.set('status', params.status);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return request<PaginatedBookings>(`/bookings${qs ? `?${qs}` : ''}`);
  },

  getSessionBookings: (sessionId: number) =>
    request<BookingItem[]>(`/sessions/${sessionId}/bookings`),

  createBooking: (sessionId: number, memberId: number, note?: string) =>
    request<BookingItem>(`/sessions/${sessionId}/bookings`, {
      method: 'POST',
      body: JSON.stringify({ memberId, note }),
    }),

  cancelBooking: (id: number, note?: string) =>
    request<{ cancelled: BookingItem; promoted: BookingItem | null }>(
      `/bookings/${id}/cancel`,
      {
        method: 'PATCH',
        body: JSON.stringify({ note }),
      },
    ),

  settleBooking: (id: number, status: 'attended' | 'no_show', note?: string) =>
    request<BookingItem>(`/bookings/${id}/settle`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    }),

  getBookingHistory: (id: number) =>
    request<BookingHistoryItem[]>(`/bookings/${id}/history`),

  // Add notes to timeline (Goal 9)
  addBookingNote: (id: number, note: string) =>
    request<BookingHistoryItem>(`/bookings/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),

  // Members & Alerts (Goal 10)
  getMembers: (search?: string) =>
    request<MemberItem[]>(`/members${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  getMember: (id: number) => request<MemberItem>(`/members/${id}`),

  createMember: (data: { name: string; email: string; membershipExpiry: string }) =>
    request<MemberItem>('/members', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMember: (
    id: number,
    data: Partial<{ name: string; email: string; membershipExpiry: string }>,
  ) =>
    request<MemberItem>(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getExpiringAlerts: () => request<AlertsResponse>('/members/alerts'),

  dismissAlert: (memberId: number) =>
    request<{ message: string }>(`/members/${memberId}/dismiss-alert`, {
      method: 'POST',
    }),

  // Dashboard (Goal 8)
  getDashboardStats: () => request<DashboardStats>('/dashboard/stats'),

  // Public Timetable (Stretch Feature)
  getPublicSchedule: (startDate?: string, endDate?: string, discipline?: string) => {
    const q = new URLSearchParams();
    if (startDate) q.set('startDate', startDate);
    if (endDate) q.set('endDate', endDate);
    if (discipline) q.set('discipline', discipline);
    const qs = q.toString();
    return request<PublicScheduleResponse>(`/public/schedule${qs ? `?${qs}` : ''}`);
  },

  // Instructor Payroll Report (Stretch Feature)
  getPayrollReport: (params?: {
    startDate?: string;
    endDate?: string;
    primaryRate?: number;
    coRate?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.startDate) q.set('startDate', params.startDate);
    if (params?.endDate) q.set('endDate', params.endDate);
    if (params?.primaryRate !== undefined) q.set('primaryRate', String(params.primaryRate));
    if (params?.coRate !== undefined) q.set('coRate', String(params.coRate));
    const qs = q.toString();
    return request<PayrollReport>(`/reports/payroll${qs ? `?${qs}` : ''}`);
  },

  // Room Utilization Report (Stretch Feature)
  getRoomUtilizationReport: (params?: {
    startDate?: string;
    endDate?: string;
    operatingHours?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.startDate) q.set('startDate', params.startDate);
    if (params?.endDate) q.set('endDate', params.endDate);
    if (params?.operatingHours !== undefined) q.set('operatingHours', String(params.operatingHours));
    const qs = q.toString();
    return request<RoomUtilizationReport>(`/reports/room-utilization${qs ? `?${qs}` : ''}`);
  },
};
