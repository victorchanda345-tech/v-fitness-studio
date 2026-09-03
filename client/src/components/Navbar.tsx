import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Layers, 
  Users, 
  LogOut, 
  LayoutDashboard,
  ShieldAlert,
  UserCheck,
  CalendarCheck,
  Bell,
  Receipt,
  Building2,
  Globe,
  Menu,
  X,
  UserPlus
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  alertsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, alertsCount = 0 }) => {
  const { user, logout, isStaff } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(10, 14, 23, 0.9)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}>
        {/* Brand */}
        <div 
          onClick={() => handleNavClick('dashboard')}
          style={{ 
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            V Fitness Studio
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Management
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="desktop-nav">
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>

          <button
            onClick={() => handleNavClick('classes')}
            className={`btn ${activeTab === 'classes' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <Layers size={16} />
            Classes
          </button>

          <button
            onClick={() => handleNavClick('sessions')}
            className={`btn ${activeTab === 'sessions' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <Calendar size={16} />
            {isStaff ? 'All Sessions' : 'My Sessions'}
          </button>

          <button
            onClick={() => handleNavClick('bookings')}
            className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <CalendarCheck size={16} />
            Bookings
          </button>

          {isStaff && (
            <>
              <button
                onClick={() => handleNavClick('members')}
                className={`btn ${activeTab === 'members' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              >
                <Users size={16} />
                Members
              </button>

              <button
                onClick={() => handleNavClick('instructors')}
                className={`btn ${activeTab === 'instructors' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                title="Manage Instructors"
              >
                <UserPlus size={16} />
                Instructors
              </button>
            </>
          )}

          {/* Alerts Tab with live badge */}
          {isStaff && (
            <button
              onClick={() => handleNavClick('alerts')}
              className={`btn ${activeTab === 'alerts' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ position: 'relative' }}
            >
              <Bell size={16} />
              Alerts
              {alertsCount > 0 && (
                <span 
                  className="badge badge-no_show" 
                  style={{ 
                    borderRadius: '10px', 
                    padding: '0.1rem 0.45rem', 
                    fontSize: '0.7rem',
                    marginLeft: '0.25rem',
                    fontWeight: 700,
                  }}
                >
                  {alertsCount}
                </span>
              )}
            </button>
          )}

          {/* Reports: Payroll & Rooms (Staff only) */}
          {isStaff && (
            <>
              <button
                onClick={() => handleNavClick('payroll')}
                className={`btn ${activeTab === 'payroll' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                title="Instructor Payroll Reporting"
              >
                <Receipt size={16} />
                Payroll
              </button>

              <button
                onClick={() => handleNavClick('rooms')}
                className={`btn ${activeTab === 'rooms' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                title="Room Utilization Reporting"
              >
                <Building2 size={16} />
                Rooms
              </button>
            </>
          )}

          {/* Public Timetable Link */}
          <button
            onClick={() => handleNavClick('public-schedule')}
            className={`btn ${activeTab === 'public-schedule' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            title="Public Class Schedule"
          >
            <Globe size={16} />
            Public Timetable
          </button>
        </nav>

        {/* Desktop User Info & Sign out */}
        <div className="desktop-user-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end', marginTop: '2px' }}>
              <span className={`badge ${user?.role === 'staff' ? 'badge-staff' : 'badge-instructor'}`}>
                {user?.role === 'staff' ? <ShieldAlert size={11} /> : <UserCheck size={11} />}
                {user?.role}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            title="Sign out"
            style={{ padding: '0.5rem' }}
          >
            <LogOut size={16} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Dynamic Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button
            onClick={() => handleNavClick('classes')}
            className={`btn ${activeTab === 'classes' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Layers size={18} />
            Classes
          </button>

          <button
            onClick={() => handleNavClick('sessions')}
            className={`btn ${activeTab === 'sessions' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Calendar size={18} />
            {isStaff ? 'All Sessions' : 'My Sessions'}
          </button>

          <button
            onClick={() => handleNavClick('bookings')}
            className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <CalendarCheck size={18} />
            Bookings
          </button>

          {isStaff && (
            <>
              <button
                onClick={() => handleNavClick('members')}
                className={`btn ${activeTab === 'members' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Users size={18} />
                Members
              </button>

              <button
                onClick={() => handleNavClick('instructors')}
                className={`btn ${activeTab === 'instructors' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <UserPlus size={18} />
                Instructors
              </button>

              <button
                onClick={() => handleNavClick('alerts')}
                className={`btn ${activeTab === 'alerts' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Bell size={18} />
                  Alerts
                </span>
                {alertsCount > 0 && (
                  <span className="badge badge-no_show" style={{ borderRadius: '10px' }}>
                    {alertsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('payroll')}
                className={`btn ${activeTab === 'payroll' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Receipt size={18} />
                Payroll
              </button>

              <button
                onClick={() => handleNavClick('rooms')}
                className={`btn ${activeTab === 'rooms' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Building2 size={18} />
                Rooms
              </button>
            </>
          )}

          <button
            onClick={() => handleNavClick('public-schedule')}
            className={`btn ${activeTab === 'public-schedule' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Globe size={18} />
            Public Timetable
          </button>

          {/* Mobile User & Logout Footer */}
          <div className="mobile-user-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
              </div>
              <span className={`badge ${user?.role === 'staff' ? 'badge-staff' : 'badge-instructor'}`}>
                {user?.role}
              </span>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="btn btn-secondary"
              style={{ justifyContent: 'center' }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
