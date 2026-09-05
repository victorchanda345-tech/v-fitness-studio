import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Layers, 
  Users, 
  LogOut, 
  LayoutDashboard,
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
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(7, 8, 11, 0.94)',
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
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #E52424 0%, #991B1B 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.1rem',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(229, 36, 36, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
          }}>
            V
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
              V Fitness Studio
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
              Studio Operations
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="desktop-nav nav-pill-group">
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`nav-pill-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={15} />
            Dashboard
          </button>

          <button
            onClick={() => handleNavClick('classes')}
            className={`nav-pill-item ${activeTab === 'classes' ? 'active' : ''}`}
          >
            <Layers size={15} />
            Classes
          </button>

          <button
            onClick={() => handleNavClick('sessions')}
            className={`nav-pill-item ${activeTab === 'sessions' ? 'active' : ''}`}
          >
            <Calendar size={15} />
            {isStaff ? 'All Sessions' : 'My Sessions'}
          </button>

          <button
            onClick={() => handleNavClick('bookings')}
            className={`nav-pill-item ${activeTab === 'bookings' ? 'active' : ''}`}
          >
            <CalendarCheck size={15} />
            Bookings
          </button>

          {isStaff && (
            <>
              <button
                onClick={() => handleNavClick('members')}
                className={`nav-pill-item ${activeTab === 'members' ? 'active' : ''}`}
              >
                <Users size={15} />
                Members
              </button>

              <button
                onClick={() => handleNavClick('instructors')}
                className={`nav-pill-item ${activeTab === 'instructors' ? 'active' : ''}`}
                title="Manage Instructors"
              >
                <UserPlus size={15} />
                Instructors
              </button>
            </>
          )}

          {/* Alerts Tab with live badge */}
          {isStaff && (
            <button
              onClick={() => handleNavClick('alerts')}
              className={`nav-pill-item ${activeTab === 'alerts' ? 'active' : ''}`}
              style={{ position: 'relative' }}
            >
              <Bell size={15} />
              Alerts
              {alertsCount > 0 && (
                <span 
                  style={{ 
                    background: '#ef4444',
                    color: '#ffffff',
                    borderRadius: '999px', 
                    padding: '0.1rem 0.45rem', 
                    fontSize: '0.675rem',
                    marginLeft: '0.2rem',
                    fontWeight: 700,
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
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
                className={`nav-pill-item ${activeTab === 'payroll' ? 'active' : ''}`}
                title="Instructor Payroll Reporting"
              >
                <Receipt size={15} />
                Payroll
              </button>

              <button
                onClick={() => handleNavClick('rooms')}
                className={`nav-pill-item ${activeTab === 'rooms' ? 'active' : ''}`}
                title="Room Utilization Reporting"
              >
                <Building2 size={15} />
                Rooms
              </button>
            </>
          )}

          {/* Public Timetable Link */}
          <button
            onClick={() => handleNavClick('public-schedule')}
            className={`nav-pill-item ${activeTab === 'public-schedule' ? 'active' : ''}`}
            title="Public Class Schedule"
          >
            <Globe size={15} />
            Timetable
          </button>
        </nav>

        {/* Desktop User Info & Sign out */}
        <div className="desktop-user-info" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.35rem 0.65rem 0.35rem 0.35rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: user?.role === 'staff' 
                ? 'linear-gradient(135deg, #E52424 0%, #991B1B 100%)'
                : 'linear-gradient(135deg, #4B5563 0%, #1F2937 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}>
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.15, paddingRight: '0.25rem' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'capitalize', fontWeight: 500 }}>
                {user?.role}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            title="Sign out"
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-full)' }}
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
