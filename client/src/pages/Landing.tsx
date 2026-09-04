import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Phone, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Activity, 
  Zap, 
  Menu, 
  X, 
  Lock, 
  ChevronRight
} from 'lucide-react';

interface LandingProps {
  onOpenTimetable: () => void;
  onOpenLogin: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onOpenTimetable, onOpenLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDisciplineFilter, setSelectedDisciplineFilter] = useState<string>('all');

  const classesList = [
    {
      id: 'yoga',
      title: 'Morning Flow Yoga',
      discipline: 'Yoga',
      duration: '60 mins',
      capacity: '12 members',
      room: 'Studio A',
      level: 'All Levels',
      focus: 'Mindfulness & Flexibility',
      description:
        'A mindful and invigorating vinyasa sequence combining dynamic sun salutations, focused standing balances, and deep restorative breathwork. Designed to open tight joints, build functional flexibility, and center your mental focus for the day.',
      benefits: ['Spinal mobility & joint lubrication', 'Stress reduction through focused pranayama', 'Core stability and posture alignment'],
    },
    {
      id: 'pilates',
      title: 'Core Pilates',
      discipline: 'Pilates',
      duration: '45 mins',
      capacity: '10 members',
      room: 'Studio A',
      level: 'Intermediate',
      focus: 'Core Stability & Posture',
      description:
        'Mat-based conditioning that targets deep stabilizing muscle groups of the abdomen, pelvic floor, and lower back. Emphasizes slow, controlled micro-movements, breath control, and muscular endurance without joint impact.',
      benefits: ['Eliminates lower back stiffness', 'Tones abdominal and pelvic muscles', 'Corrects slouching and rounded shoulders'],
    },
    {
      id: 'dance',
      title: 'Bhangra Cardio & Dance',
      discipline: 'Dance',
      duration: '50 mins',
      capacity: '15 members',
      room: 'Studio B',
      level: 'All Levels',
      focus: 'Cardiovascular Endurance',
      description:
        'High-energy, rhythm-driven fitness fusing traditional folk Bhangra choreography with modern aerobic intervals. Fast-paced beats, energetic arm and leg movements, and continuous motion deliver an exhilarating workout that burns 500+ calories.',
      benefits: ['Burns 500+ calories per session', 'Elevates cardiovascular capacity', 'Boosts coordination and stamina'],
    },
    {
      id: 'hiit',
      title: 'HIIT Blast',
      discipline: 'HIIT',
      duration: '30 mins',
      capacity: '20 members',
      room: 'Studio B',
      level: 'Advanced',
      focus: 'Metabolic Conditioning',
      description:
        'Time-efficient interval training utilizing bodyweight power movements, plyometrics, and athletic agility drills. Short bursts of maximal effort paired with calculated active recoveries maximize calorie afterburn (EPOC).',
      benefits: ['Prolonged post-exercise calorie burn', 'Builds lean athletic strength', 'Quick, high-efficiency 30-minute format'],
    },
    {
      id: 'spin',
      title: 'Spin & Sweat',
      discipline: 'Spin',
      duration: '45 mins',
      capacity: '8 members',
      room: 'Studio C',
      level: 'All Levels',
      focus: 'Leg Power & Stamina',
      description:
        'Rhythm-based indoor cycling engineered for endurance and power. Experience varied cadence drills, seated cadence pushes, steep standing climbs, and intense interval sprints synced to motivating acoustics.',
      benefits: ['Zero-impact high-calorie cardio', 'Strengthens quads, glutes, and calves', 'Acoustic-driven group motivation'],
    },
  ];

  const trainers = [
    {
      name: 'Victor Chanda',
      role: 'Head Strength Coach & Studio Manager',
      discipline: 'Strength & Conditioning, Athletic HIIT',
      bio: 'Over 12 years of coaching experience in sports performance and functional movement. Victor leads our curriculum and ensures strict safety standards across all studio workouts.',
      badge: 'Head of Operations',
    },
    {
      name: 'Aarav Mehta',
      role: 'Senior Yoga & Breathwork Master',
      discipline: 'Vinyasa, Hatha, Pranayama',
      bio: 'Certified in traditional yoga traditions with a modern anatomical focus. Aarav specializes in postural correction, mobility enhancement, and breath-directed movement.',
      badge: 'Yoga Master',
    },
    {
      name: 'Ananya Iyer',
      role: 'Lead Pilates & Movement Specialist',
      discipline: 'Mat Pilates, Core Toning, Mobility',
      bio: 'Certified movement practitioner focusing on rehabilitative core stability, biomechanics, and pelvic alignment to develop resilient, balanced movement patterns.',
      badge: 'Movement Lead',
    },
    {
      name: 'Rohan Verma',
      role: 'High-Intensity Athletic Trainer',
      discipline: 'HIIT, Kettlebell Conditioning, Spin',
      bio: 'Former collegiate athlete and metabolic conditioning coach. Rohan drives intense, high-energy sessions that maximize functional stamina and calorie afterburn.',
      badge: 'HIIT Specialist',
    },
  ];

  const pricingTiers = [
    {
      name: 'Single Drop-In Pass',
      price: '₹600',
      period: 'per session',
      description: 'Ideal for trial classes, visiting travelers, and flexible schedules.',
      features: [
        'Access to any scheduled session',
        'Complimentary towel & locker access',
        'Automatic waitlist inclusion',
        'No commitment or sign-up fees',
      ],
      highlight: false,
      btnText: 'View Schedule to Book',
    },
    {
      name: '10-Class Flexi Pack',
      price: '₹5,000',
      period: 'valid for 90 days',
      description: 'Our most popular option for members attending 1–2 classes weekly.',
      features: [
        '₹500 per class (Save ₹1,000)',
        'Valid across all class disciplines',
        'Shareable with 1 family member',
        'Full 90-day booking flexibility',
        'Complimentary mat & prop rentals',
      ],
      highlight: true,
      badge: 'Most Popular',
      btnText: 'Explore Timetable',
    },
    {
      name: 'Unlimited Monthly Pass',
      price: '₹8,500',
      period: 'per month',
      description: 'Complete freedom for dedicated daily fitness enthusiasts.',
      features: [
        'Unlimited sessions across all studios',
        'Priority booking window (7 days ahead)',
        '1 complimentary guest pass each month',
        'Exclusive weekend masterclasses',
        'Personal locker reservation',
      ],
      highlight: false,
      btnText: 'Join Unlimited',
    },
  ];

  const filteredClasses = selectedDisciplineFilter === 'all'
    ? classesList
    : classesList.filter(c => c.discipline.toLowerCase() === selectedDisciplineFilter.toLowerCase());

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* ── Top Navigation Bar ────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(11, 15, 23, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Brand */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '11px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}>
              V
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
                V Fitness Studio
              </div>
              <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Boutique Movement & Fitness
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
            <button 
              onClick={() => scrollToSection('classes')} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.15s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              Classes
            </button>
            <button 
              onClick={() => scrollToSection('trainers')} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.15s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              Trainers
            </button>
            <button 
              onClick={() => scrollToSection('studio')} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.15s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              Studio
            </button>
            <button 
              onClick={() => scrollToSection('memberships')} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.15s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              Memberships
            </button>
            <button 
              onClick={() => scrollToSection('contact')} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.15s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              Location
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="desktop-user-info" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={onOpenTimetable} 
              className="btn btn-primary btn-sm"
              style={{ padding: '0.55rem 1.15rem', fontWeight: 600 }}
            >
              <Calendar size={15} />
              Timetable
            </button>
            <button 
              onClick={onOpenLogin} 
              className="btn btn-secondary btn-sm"
              title="Staff and Instructor Portal"
              style={{ padding: '0.55rem 0.95rem' }}
            >
              <Lock size={14} />
              Staff Login
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <button onClick={() => scrollToSection('classes')} className="btn btn-secondary">
              Classes & Disciplines
            </button>
            <button onClick={() => scrollToSection('trainers')} className="btn btn-secondary">
              Our Master Trainers
            </button>
            <button onClick={() => scrollToSection('studio')} className="btn btn-secondary">
              Studio Amenities
            </button>
            <button onClick={() => scrollToSection('memberships')} className="btn btn-secondary">
              Passes & Memberships
            </button>
            <button onClick={() => scrollToSection('contact')} className="btn btn-secondary">
              Location & Hours
            </button>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTimetable();
              }} 
              className="btn btn-primary"
              style={{ justifyContent: 'center', marginTop: '0.5rem' }}
            >
              <Calendar size={16} />
              Browse Live Timetable
            </button>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }} 
              className="btn btn-secondary"
              style={{ justifyContent: 'center' }}
            >
              <Lock size={16} />
              Staff & Instructor Login
            </button>
          </div>
        )}
      </header>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section style={{
        padding: '5.5rem 1.5rem 4.5rem',
        maxWidth: '1240px',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Ambient Top Glow Orb */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            marginBottom: '2rem',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}>
            <span className="pulse-indicator" />
            <span style={{ color: '#ffffff' }}>LIVE OPERATIONS</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span>Small-Group Classes Capped at 8–20 Members</span>
          </div>

          <h1 className="text-gradient" style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 4.4rem)',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            lineHeight: 1.12,
            marginBottom: '1.5rem',
            maxWidth: '980px',
            margin: '0 auto 1.5rem',
          }}>
            Transform Your Body, Elevate Your Mind at V Fitness Studio
          </h1>

          <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '760px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}>
            Small-group fitness engineered for real progress. Experience expert-led Yoga, Pilates, Bhangra Cardio, and HIIT in state-of-the-art acoustic studios with strictly capped capacities.
          </p>

        {/* Hero CTAs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '4rem',
        }}>
          <button 
            onClick={onOpenTimetable}
            className="btn btn-primary"
            style={{ padding: '0.85rem 1.85rem', fontSize: '1rem', fontWeight: 600 }}
          >
            <Calendar size={18} />
            View Live Class Timetable
            <ArrowRight size={18} />
          </button>
          <button 
            onClick={() => scrollToSection('classes')}
            className="btn btn-secondary"
            style={{ padding: '0.85rem 1.85rem', fontSize: '1rem', fontWeight: 500 }}
          >
            Explore Class Disciplines
          </button>
        </div>

        {/* Studio Highlights Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          textAlign: 'left',
        }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              15+
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Weekly Sessions</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Morning, noon, and evening options across 5 disciplines</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              3 Studios
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Dedicated Studio Rooms</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Studio A (Mind-Body), Studio B (Cardio), Studio C (Cycling)</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Strict Cap
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Guaranteed Capacity Limits</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Zero overcrowding with real-time automated waitlists</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              100%
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Certified Trainers</div>
          </div>
        </div>
      </div>
    </section>

      {/* ── Classes Section ───────────────────────────────────────────────── */}
      <section id="classes" style={{
        padding: '5rem 1.5rem',
        maxWidth: '1240px',
        margin: '0 auto',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Class Curriculum
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.25rem' }}>
              Crafted Disciplines for Every Goal
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '600px' }}>
              Each format is intentionally programmed with verified capacities so instructors can provide direct postural adjustments and form guidance.
            </p>
          </div>

          {/* Discipline filter chips */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['all', 'yoga', 'pilates', 'dance', 'hiit', 'spin'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDisciplineFilter(d)}
                className={`btn ${selectedDisciplineFilter === d ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                style={{ textTransform: 'capitalize' }}
              >
                {d === 'all' ? 'All Formats' : d}
              </button>
            ))}
          </div>
        </div>

        {/* Classes Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem',
        }}>
          {filteredClasses.map((c) => (
            <div 
              key={c.id} 
              className="glass-panel" 
              style={{ 
                padding: '2rem', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="badge badge-booked">{c.discipline}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.level}</span>
                </div>

                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                  {c.title}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={14} /> {c.duration}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Users size={14} /> {c.capacity} max
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={14} /> {c.room}
                  </span>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {c.description}
                </p>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Key Focus & Outcomes:
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {c.benefits.map((b, idx) => (
                      <li key={idx} style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Check size={14} color="#10b981" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={onOpenTimetable}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'space-between', marginTop: '1rem' }}
              >
                <span>View Scheduled Times</span>
                <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Master Trainers Section ───────────────────────────────────────── */}
      <section id="trainers" style={{
        padding: '5rem 1.5rem',
        maxWidth: '1240px',
        margin: '0 auto',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Expert Coaching
          </span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.25rem' }}>
            Meet Your Master Trainers
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0.5rem auto 0' }}>
            Our certified coaching staff brings years of elite instruction, functional movement expertise, and individual attention to every class.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '1.5rem',
        }}>
          {trainers.map((t, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="badge badge-staff">{t.badge}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Certified Coach</span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                {t.name}
              </h3>
              <div style={{ fontSize: '0.825rem', color: 'var(--accent-primary)', fontWeight: 500, marginBottom: '0.75rem' }}>
                {t.role}
              </div>

              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Specialties: {t.discipline}
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {t.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Studio Amenities Section ──────────────────────────────────────── */}
      <section id="studio" style={{
        padding: '5rem 1.5rem',
        maxWidth: '1240px',
        margin: '0 auto',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            The Facility
          </span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.25rem' }}>
            Designed for Optimal Performance & Focus
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0.5rem auto 0' }}>
            Purpose-built spaces designed to minimize distractions and protect joint health during high-intensity and restorative workouts.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
              <ShieldCheck size={20} color="var(--text-secondary)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Sprung Hardwood Flooring
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Studios A & B feature dual-layer shock-absorbing sprung floors that reduce joint impact by up to 60%, essential for high-repetition jumps, dance steps, and intense plyometrics.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
              <Activity size={20} color="var(--text-secondary)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Guaranteed Spot Control
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              No jostling for space or finding classes overcrowded. Every reservation guarantees a dedicated mat or bike position with automated waitlist promotions if a spot opens up.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
              <Zap size={20} color="var(--text-secondary)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Acoustic & Climate Engineering
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Each studio room maintains isolated sound insulation and dedicated HEPA-filtered climate systems, allowing calm meditation in Studio A alongside upbeat cardio in Studio B.
            </p>
          </div>
        </div>
      </section>

      {/* ── Memberships Section ───────────────────────────────────────────── */}
      <section id="memberships" style={{
        padding: '5rem 1.5rem',
        maxWidth: '1240px',
        margin: '0 auto',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pricing & Passes
          </span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.25rem' }}>
            Simple, Transparent Memberships
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0.5rem auto 0' }}>
            No hidden maintenance fees or complicated cancellation procedures. Choose the cadence that fits your training routine.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignItems: 'stretch',
        }}>
          {pricingTiers.map((t, idx) => (
            <div 
              key={idx} 
              className="glass-panel" 
              style={{ 
                padding: '2.25rem', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                border: t.highlight ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid var(--border-subtle)',
                background: t.highlight ? 'rgba(18, 24, 38, 0.95)' : 'var(--bg-card)',
                position: 'relative',
              }}
            >
              {t.badge && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '24px',
                  background: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                }}>
                  {t.badge}
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {t.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  {t.description}
                </p>

                <div style={{ marginBottom: '1.75rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {t.price}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>
                    / {t.period}
                  </span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '0.775rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    What's Included:
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {t.features.map((f, fIdx) => (
                      <li key={fIdx} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Check size={16} color="#10b981" style={{ flexShrink: 0 }} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={onOpenTimetable}
                className={`btn ${t.highlight ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%', padding: '0.75rem', fontWeight: 600 }}
              >
                {t.btnText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Location & Contact Section ────────────────────────────────────── */}
      <section id="contact" style={{
        padding: '5rem 1.5rem',
        maxWidth: '1240px',
        margin: '0 auto',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'center',
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Visit V Fitness Studio
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.25rem', marginBottom: '1rem' }}>
              Located in the Heart of Indiranagar
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
              Our modern studio facility is conveniently accessible with dedicated on-site parking, changing rooms with showers, and secure day lockers.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                  <MapPin size={18} color="var(--text-secondary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Studio Address</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    4th Floor, Horizon Tower, 100ft Road, Indiranagar, Bengaluru 560038
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                  <Clock size={18} color="var(--text-secondary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Operating Hours</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    Monday – Sunday: 6:00 AM – 9:00 PM
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                  <Phone size={18} color="var(--text-secondary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Direct Inquiries</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    +91 9064074801 / victorchanda1101@gmail.com
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Ready for Your First Class?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              Check live spot availability across all upcoming sessions today and through next week. No advance payment required to view times and trainer assignments.
            </p>
            <button
              onClick={onOpenTimetable}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 600, justifyContent: 'center' }}
            >
              <Calendar size={18} />
              Open Live Class Timetable
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
        padding: '3rem 1.5rem 2rem',
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
              V Fitness Studio
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Professional Boutique Fitness, Movement & Athletic Training
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={onOpenTimetable} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Live Timetable
            </button>
            <button 
              onClick={() => scrollToSection('classes')} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Classes
            </button>
            <button 
              onClick={() => scrollToSection('trainers')} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Trainers
            </button>
            <button 
              onClick={onOpenLogin} 
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
            >
              Staff Portal Login
            </button>
          </div>
        </div>

        <div style={{
          maxWidth: '1240px',
          margin: '2rem auto 0',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <div>Copyright © 2026 V Fitness Studio. All rights reserved.</div>
          <div>Strict Capacity Control & Instant Waitlist Architecture</div>
        </div>
      </footer>
    </div>
  );
};
