import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Classes } from './pages/Classes';
import { ClassDetail } from './pages/ClassDetail';
import { Sessions } from './pages/Sessions';
import { SessionDetail } from './pages/SessionDetail';
import { Members } from './pages/Members';
import { Bookings } from './pages/Bookings';
import { Alerts } from './pages/Alerts';
import { PublicSchedule } from './pages/PublicSchedule';
import { Payroll } from './pages/Payroll';
import { RoomUtilization } from './pages/RoomUtilization';
import { Instructors } from './pages/Instructors';
import { Landing } from './pages/Landing';
import { api } from './api/client';

type PublicView = 'landing' | 'timetable' | 'login';

const MainApp: React.FC = () => {
  const { user, isLoading, isStaff } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [alertsCount, setAlertsCount] = useState<number>(0);
  const [publicView, setPublicView] = useState<PublicView>('landing');

  // Pre-warm public timetable in background and wake up server
  useEffect(() => {
    api.getPublicSchedule()
      .then((data) => {
        try {
          localStorage.setItem('vfitness_public_schedule', JSON.stringify(data));
        } catch {}
      })
      .catch(() => {});
  }, []);

  // Load active alerts count for staff
  useEffect(() => {
    if (user && isStaff) {
      api.getExpiringAlerts()
        .then((res) => setAlertsCount(res.count))
        .catch((err) => console.error('Failed to fetch alerts count', err));
    }
  }, [user, isStaff, activeTab]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
      }}>
        Initializing V Fitness Studio…
      </div>
    );
  }

  // Public visitor routing (Landing page, Public Timetable, Staff/Instructor Login)
  if (!user) {
    if (publicView === 'timetable') {
      return (
        <PublicSchedule 
          onSignInClick={() => setPublicView('login')} 
          onBackToHome={() => setPublicView('landing')}
        />
      );
    }

    if (publicView === 'login') {
      return (
        <Login 
          onViewSchedule={() => setPublicView('timetable')} 
          onBackToHome={() => setPublicView('landing')}
        />
      );
    }

    return (
      <Landing 
        onOpenTimetable={() => setPublicView('timetable')}
        onOpenLogin={() => setPublicView('login')}
      />
    );
  }

  const handleNavigate = (tab: string, contextId?: number) => {
    if (tab === 'class-detail' && contextId) {
      setSelectedClassId(contextId);
      setActiveTab('class-detail');
    } else if (tab === 'session-detail' && contextId) {
      setSelectedSessionId(contextId);
      setActiveTab('session-detail');
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        alertsCount={alertsCount} 
      />
      
      <main style={{ flex: 1, padding: '0 1.5rem 3rem 1.5rem' }}>
        {activeTab === 'dashboard' && (
          <Dashboard onNavigate={handleNavigate} />
        )}

        {activeTab === 'classes' && (
          <Classes onNavigate={handleNavigate} />
        )}

        {activeTab === 'class-detail' && selectedClassId && (
          <ClassDetail
            classId={selectedClassId}
            onBack={() => setActiveTab('classes')}
            onNavigateToSession={(sessionId) => {
              setSelectedSessionId(sessionId);
              setActiveTab('session-detail');
            }}
          />
        )}

        {activeTab === 'sessions' && (
          <Sessions
            onNavigateToSession={(sessionId) => {
              setSelectedSessionId(sessionId);
              setActiveTab('session-detail');
            }}
          />
        )}

        {/* Bookings View (Goal 6) */}
        {activeTab === 'bookings' && (
          <Bookings
            onNavigateToSession={(sessionId) => {
              setSelectedSessionId(sessionId);
              setActiveTab('session-detail');
            }}
          />
        )}

        {/* Membership Alerts View (Goal 10) */}
        {activeTab === 'alerts' && (
          <Alerts 
            onAlertsCountChange={(count) => setAlertsCount(count)} 
          />
        )}

        {/* Instructor Payroll Reporting (Stretch Feature) */}
        {activeTab === 'payroll' && (
          <Payroll />
        )}

        {/* Room Utilization Reporting (Stretch Feature) */}
        {activeTab === 'rooms' && (
          <RoomUtilization />
        )}

        {/* Public Timetable View (Stretch Feature) */}
        {activeTab === 'public-schedule' && (
          <PublicSchedule 
            onBackToApp={() => setActiveTab('dashboard')} 
          />
        )}

        {activeTab === 'session-detail' && selectedSessionId && (
          <SessionDetail
            sessionId={selectedSessionId}
            onBack={() => {
              if (selectedClassId) {
                setActiveTab('class-detail');
              } else {
                setActiveTab('sessions');
              }
            }}
          />
        )}

        {activeTab === 'members' && <Members />}
        {activeTab === 'instructors' && <Instructors />}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
