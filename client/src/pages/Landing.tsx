import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Check, 
  Menu, 
  X, 
  Lock
} from 'lucide-react';

interface LandingProps {
  onOpenTimetable: () => void;
  onOpenLogin: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onOpenTimetable, onOpenLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const programs = [
    {
      number: '01',
      title: 'HIIT & STRENGTH',
      tag: 'METABOLIC POWER',
      description: 'Explosive functional circuits combining barbell power, kettlebells, and cardio intervals to maximize EPOC calorie burn and stamina.',
      room: 'Studio C',
      duration: '45 mins',
      image: '/images/program-hiit.jpg',
      isFeatured: false
    },
    {
      number: '02',
      title: 'PILATES CORE',
      tag: 'POSTURE & CONTROL',
      description: 'Controlled mat-based conditioning targeting the deep core, pelvic alignment, and spine stabilization without joint compression.',
      room: 'Studio B',
      duration: '50 mins',
      image: '/images/program-pilates.jpg',
      isFeatured: false
    },
    {
      number: '03',
      title: 'YOGA & MOBILITY',
      tag: 'ATHLETIC RECOVERY',
      description: 'Dynamic vinyasa flows and functional joint mobility designed to lubricate tissue, expand range of motion, and sharpen mental focus.',
      room: 'Studio B',
      duration: '60 mins',
      image: '/images/program-yoga.jpg',
      isFeatured: true
    },
    {
      number: '04',
      title: 'BHANGRA CARDIO',
      tag: 'HIGH-ENERGY DANCE',
      description: 'Electrifying music-driven dance workout fusing athletic tempo and rhythmic cardio conditioning for an exhilarating sweat session.',
      room: 'Studio A',
      duration: '50 mins',
      image: '/images/program-bhangra.jpg',
      isFeatured: false
    }
  ];

  const editorialArticles = [
    {
      badge: 'TRAINING',
      title: '5 Principles Every Athlete Must Master for Peak Strength',
      description: 'Mastering progressive overload, bar path acceleration, and compound movement mechanics under tension.',
      image: '/images/photo-strength.jpg',
      room: 'Studio C'
    },
    {
      badge: 'NUTRITION',
      title: 'What to Eat Before and After Training for Maximum Performance',
      description: 'Optimizing macronutrient timing, cellular hydration, and post-session glycogen replenishment for clean recovery.',
      image: '/images/photo-nutrition.jpg',
      room: 'Nutrition Bar'
    },
    {
      badge: 'MINDSET',
      title: 'How to Stay Relentlessly Consistent When Motivation Runs Out',
      description: 'Building unbreakable training systems, habit loops, and mental resilience when physical fatigue sets in.',
      image: '/images/photo-mindset.jpg',
      room: 'Studio B'
    }
  ];

  const studios = [
    {
      name: 'Studio A',
      type: 'Main Movement Hall',
      capacity: '15 Athletes',
      specs: 'Shock-absorbing sprung bamboo flooring, 360° surround audio system, full-length mirror wall.'
    },
    {
      name: 'Studio B',
      type: 'Mind & Core Studio',
      capacity: '12 Athletes',
      specs: 'Acoustic soundproofing, dimmable amber circadian lighting, eco-cork mats & high-density foam rollers.'
    },
    {
      name: 'Studio C',
      type: 'HIIT & Functional Rig',
      capacity: '10 Athletes',
      specs: 'Heavy-duty Rogue power racks, competition kettlebells, Concept2 rowers, assault bikes & turf track.'
    }
  ];

  const instructors = [
    {
      name: 'Victor Chanda',
      role: 'Founder & Head Coach',
      specialty: 'Strength & Conditioning, Functional HIIT, Program Architecture',
      experience: '10+ yrs coaching competitive athletes & professionals'
    },
    {
      name: 'Ananya Roy',
      role: 'Senior Movement Coach',
      specialty: 'Ashtanga Vinyasa, Mobility & Breathwork Mechanics',
      experience: '500-hr RYT certified, international retreat instructor'
    },
    {
      name: 'Rahul Verma',
      role: 'Pilates Specialist',
      specialty: 'Classical Mat Pilates, Spinal Rehabilitation & Posture',
      experience: 'PMA Certified, biomechanics consultant'
    },
    {
      name: 'Priya Patel',
      role: 'Rhythm & Cardio Lead',
      specialty: 'Bhangra Cardio, Dance Conditioning & Endurance',
      experience: 'National dance champion, certified aerobics master'
    }
  ];

  const pricingTiers = [
    {
      name: 'Single Session',
      price: '₹600',
      period: 'per class',
      desc: 'Perfect for travelers and trying out our signature classes with zero commitment.',
      features: ['Access to any single group session', 'Studio locker & towel service included', 'Complimentary electrolyte station', 'Valid for 14 days from booking'],
      isFeatured: false
    },
    {
      name: '10-Class Pack',
      price: '₹5,200',
      period: '10 sessions',
      desc: 'Our most popular option for consistent weekly training across all studio disciplines.',
      features: ['Book any 10 classes across all 3 studios', 'Priority waitlist access on peak slots', 'Includes Yoga, HIIT, Pilates & Dance', 'Valid for 90 days with flexible rollover'],
      isFeatured: true
    },
    {
      name: 'Unlimited Monthly',
      price: '₹8,500',
      period: 'per month',
      desc: 'Unrestricted daily access for athletes committed to total body transformation.',
      features: ['Unlimited bookings across every session', 'Free 1-on-1 movement assessment with Victor', 'Complimentary guest pass every month', 'Instant booking up to 14 days in advance'],
      isFeatured: false
    }
  ];

  return (
    <div style={{ backgroundColor: '#07080B', color: '#f8fafc', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* ── Top Navigation Bar ─────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(7, 8, 11, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0.85rem 1.5rem'
      }}>
        <div style={{
          maxWidth: '1320px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{
              width: '10px',
              height: '10px',
              backgroundColor: 'var(--crimson-primary)',
              display: 'inline-block'
            }}></span>
            <span className="font-display" style={{
              fontSize: '1.5rem',
              fontWeight: 900,
              letterSpacing: '0.04em',
              color: '#ffffff'
            }}>
              V FITNESS <span style={{ color: 'var(--crimson-primary)' }}>STUDIO</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
            <a href="#programs" style={{ fontSize: '0.825rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.75)', transition: 'color 0.2s' }}>
              PROGRAMS
            </a>
            <a href="#mindset" style={{ fontSize: '0.825rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.75)', transition: 'color 0.2s' }}>
              MINDSET
            </a>
            <a href="#studios" style={{ fontSize: '0.825rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.75)', transition: 'color 0.2s' }}>
              STUDIOS
            </a>
            <a href="#trainers" style={{ fontSize: '0.825rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.75)', transition: 'color 0.2s' }}>
              TRAINERS
            </a>
            <a href="#pricing" style={{ fontSize: '0.825rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.75)', transition: 'color 0.2s' }}>
              PRICING
            </a>
            <a href="#contact" style={{ fontSize: '0.825rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.75)', transition: 'color 0.2s' }}>
              CONTACT
            </a>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="desktop-user-info">
            <button 
              onClick={onOpenLogin}
              className="btn-athletic-outline"
              style={{ padding: '0.65rem 1rem', fontSize: '0.8rem' }}
            >
              <Lock size={13} />
              STAFF PORTAL
            </button>
            <button 
              onClick={onOpenTimetable}
              className="btn-crimson"
              style={{ padding: '0.65rem 1.35rem', fontSize: '0.8rem' }}
            >
              BOOK A CLASS →
            </button>
          </div>

          {/* Mobile menu trigger */}
          <button 
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            padding: '1.25rem 0',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            marginTop: '0.75rem'
          }}>
            <a href="#programs" onClick={() => setMobileMenuOpen(false)} style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase' }}>Programs</a>
            <a href="#mindset" onClick={() => setMobileMenuOpen(false)} style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase' }}>Mindset & Tips</a>
            <a href="#studios" onClick={() => setMobileMenuOpen(false)} style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase' }}>Studios</a>
            <a href="#trainers" onClick={() => setMobileMenuOpen(false)} style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase' }}>Instructors</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase' }}>Pricing</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase' }}>Contact</a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={() => { setMobileMenuOpen(false); onOpenTimetable(); }} className="btn-crimson" style={{ width: '100%' }}>
                BOOK A CLASS →
              </button>
              <button onClick={() => { setMobileMenuOpen(false); onOpenLogin(); }} className="btn-athletic-outline" style={{ width: '100%' }}>
                STAFF LOGIN
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero Section (Matches Marcus Reid Reference Exactly) ───────────────── */}
      <section className="hero-banner" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', position: 'relative' }}>
        
        {/* Giant Background Watermark Text */}
        <div className="hero-watermark">
          VICTOR CHANDA
        </div>

        <div style={{
          maxWidth: '1320px',
          margin: '0 auto',
          padding: '4.5rem 1.5rem 3rem',
          width: '100%',
          position: 'relative',
          zIndex: 2,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'center'
        }}>
          
          {/* Left Hero Column */}
          <div style={{ maxWidth: '620px' }}>
            <div className="eyebrow-red">
              <span className="eyebrow-square"></span>
              HEAD COACH & FOUNDER — VICTOR CHANDA
            </div>

            <h1 className="font-display" style={{
              fontSize: 'clamp(3.5rem, 7.5vw, 6.2rem)',
              lineHeight: 0.92,
              color: '#ffffff',
              marginBottom: '1.5rem',
              letterSpacing: '-0.01em'
            }}>
              FORGE YOUR<br />
              BEST SELF
            </h1>

            <p style={{
              color: 'rgba(255, 255, 255, 0.72)',
              fontSize: '1.05rem',
              lineHeight: 1.6,
              marginBottom: '2.5rem',
              maxWidth: '520px'
            }}>
              Boutique athletic conditioning engineered around your body — your goals, your pace, your results. 
              Small-group sessions, precision pilates, dynamic yoga, and high-intensity strength training in Bengaluru.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem' }}>
              <button 
                onClick={onOpenTimetable}
                className="btn-crimson"
                style={{ padding: '1rem 2.2rem', fontSize: '0.95rem' }}
              >
                BOOK A SESSION →
              </button>
              <a 
                href="#programs" 
                className="btn-athletic-outline"
                style={{ padding: '0.95rem 1.8rem', fontSize: '0.95rem' }}
              >
                VIEW PROGRAMS
              </a>
            </div>
          </div>

          {/* Right Hero Column: Trainer Portrait + Floating Glass Stat Cards */}
          <div style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            minHeight: '480px'
          }}>
            
            {/* Trainer Portrait Photo */}
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '460px',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(229, 36, 36, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <img 
                src="/images/hero-trainer.jpg" 
                alt="Victor Chanda - Head Coach" 
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  objectFit: 'cover'
                }}
              />
            </div>

            {/* Overlapping Floating Stat Cards (Exact match to Marcus Reid reference) */}
            <div style={{
              position: 'absolute',
              bottom: '25px',
              right: '-10px',
              display: 'flex',
              gap: '1rem',
              maxWidth: '420px',
              zIndex: 3
            }}>
              {/* Stat 1: 100% */}
              <div className="stat-glass-card" style={{ flex: 1 }}>
                <div className="font-display" style={{
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: 1
                }}>
                  100%
                </div>
                <div style={{
                  fontSize: '0.78rem',
                  color: 'rgba(255, 255, 255, 0.75)',
                  marginTop: '0.35rem',
                  lineHeight: 1.35
                }}>
                  <strong style={{ color: '#ffffff', display: 'block' }}>Session Quality</strong>
                  Tailored coaching built around your individual goals.
                </div>
              </div>

              {/* Stat 2: 500+ */}
              <div className="stat-glass-card" style={{ flex: 1 }}>
                <div className="font-display" style={{
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: 1
                }}>
                  500+
                </div>
                <div style={{
                  fontSize: '0.78rem',
                  color: 'rgba(255, 255, 255, 0.75)',
                  marginTop: '0.35rem',
                  lineHeight: 1.35
                }}>
                  <strong style={{ color: '#ffffff', display: 'block' }}>Active Bookings</strong>
                  Real athletes, measurable results from day one.
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── Section 2: PROGRAMS BUILT TO WIN (4-Card Numbered Grid) ─────────────── */}
      <section id="programs" style={{ padding: '6rem 1.5rem', maxWidth: '1320px', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '3.5rem',
          gap: '1.5rem'
        }}>
          <div>
            <div className="eyebrow-red">
              <span className="eyebrow-square"></span>
              WHAT WE OFFER
            </div>
            <h2 className="font-display" style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
              color: '#ffffff',
              lineHeight: 0.95
            }}>
              PROGRAMS<br />
              BUILT TO WIN
            </h2>
          </div>

          <div style={{ maxWidth: '440px', textAlign: 'right' }}>
            <p style={{
              color: 'rgba(255, 255, 255, 0.65)',
              fontSize: '0.95rem',
              lineHeight: 1.5,
              marginBottom: '1rem',
              textAlign: 'left'
            }}>
              Every class is engineered with one goal in mind — getting you the physical and mental adaptation you came for. No fluff, no filler.
            </p>
            <button 
              onClick={onOpenTimetable}
              className="btn-crimson"
              style={{ fontSize: '0.825rem', padding: '0.65rem 1.25rem' }}
            >
              VIEW ALL SESSIONS →
            </button>
          </div>
        </div>

        {/* 4-Card Programs Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {programs.map((prog) => (
            <div 
              key={prog.number}
              className={`program-card ${prog.isFeatured ? 'program-card-featured' : ''}`}
            >
              {/* Photo Banner */}
              <div className="program-img-wrap">
                <img 
                  src={prog.image} 
                  alt={prog.title}
                  className="program-img"
                  loading="lazy"
                />
                <div className="program-number-chip">
                  {prog.number}
                </div>
                <div className="program-duration-chip">
                  {prog.duration}
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '40px',
                  background: 'linear-gradient(to top, #0D0E12, transparent)'
                }}></div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.4rem'
                  }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--crimson-primary)'
                    }}>
                      {prog.tag}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.45)', fontWeight: 600 }}>
                      {prog.room}
                    </span>
                  </div>

                  <h3 className="font-display" style={{
                    fontSize: '1.75rem',
                    color: '#ffffff',
                    marginBottom: '0.65rem',
                    lineHeight: 1.15
                  }}>
                    {prog.title}
                  </h3>

                  <p style={{
                    color: 'rgba(255, 255, 255, 0.65)',
                    fontSize: '0.85rem',
                    lineHeight: 1.55,
                    marginBottom: '1.5rem'
                  }}>
                    {prog.description}
                  </p>
                </div>

                <div style={{
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: '0.725rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}>
                    ALL FITNESS LEVELS
                  </span>
                  <button
                    onClick={onOpenTimetable}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      color: 'var(--crimson-primary)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    BOOK CLASS →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ── Section 3: FORGE YOUR MINDSET (3 Photographic Editorial Cards) ──────── */}
      <section id="mindset" style={{
        padding: '6rem 1.5rem',
        backgroundColor: '#050608',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '3.5rem',
            gap: '1.5rem'
          }}>
            <div>
              <div className="eyebrow-red">
                <span className="eyebrow-square"></span>
                KNOWLEDGE & STUDIO CULTURE
              </div>
              <h2 className="font-display" style={{
                fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
                color: '#ffffff',
                lineHeight: 0.95
              }}>
                FORGE YOUR<br />
                MINDSET
              </h2>
            </div>

            <button 
              onClick={onOpenTimetable}
              className="btn-athletic-outline"
              style={{ fontSize: '0.8rem', padding: '0.65rem 1.25rem' }}
            >
              EXPLORE SCHEDULE →
            </button>
          </div>

          {/* 3-Photo Grid (Matches the 3 photographic cards in reference) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem'
          }}>
            {editorialArticles.map((article, idx) => (
              <div 
                key={idx}
                className="photo-card"
                onClick={onOpenTimetable}
              >
                <div className="photo-card-img-wrap">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="photo-card-img"
                  />
                </div>
                
                <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <span className="photo-card-badge">
                      {article.badge}
                    </span>
                    <h3 className="photo-card-title" style={{ marginBottom: '0.75rem' }}>
                      {article.title}
                    </h3>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.65)',
                      fontSize: '0.85rem',
                      lineHeight: 1.55
                    }}>
                      {article.description}
                    </p>
                  </div>

                  <div style={{
                    marginTop: '1.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.5)'
                  }}>
                    <span>V Fitness Studio • {article.room}</span>
                    <span style={{ color: 'var(--crimson-primary)', fontWeight: 700 }}>READ MORE →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Section 4: STUDIO SPACES & SPECIFICATIONS ──────────────────────────── */}
      <section id="studios" style={{ padding: '6rem 1.5rem', maxWidth: '1320px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <div className="eyebrow-red">
            <span className="eyebrow-square"></span>
            ENGINEERED FACILITIES
          </div>
          <h2 className="font-display" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', color: '#ffffff' }}>
            STUDIO SPACES BUILT FOR PERFORMANCE
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {studios.map((st, i) => (
            <div key={i} style={{
              backgroundColor: '#0D0E12',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '2rem 1.75rem',
              transition: 'border-color 0.2s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span className="font-display" style={{ fontSize: '1.8rem', color: '#ffffff' }}>
                  {st.name}
                </span>
                <span style={{
                  backgroundColor: 'rgba(229, 36, 36, 0.15)',
                  color: 'var(--crimson-primary)',
                  border: '1px solid rgba(229, 36, 36, 0.3)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '3px',
                  fontSize: '0.725rem',
                  fontWeight: 700
                }}>
                  {st.capacity}
                </span>
              </div>

              <div style={{ color: 'var(--crimson-primary)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                {st.type}
              </div>

              <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.875rem', lineHeight: 1.55, marginBottom: '1.5rem' }}>
                {st.specs}
              </p>

              <button 
                onClick={onOpenTimetable}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                VIEW STUDIO TIMETABLE →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 5: COACHING STAFF ──────────────────────────────────────────── */}
      <section id="trainers" style={{
        padding: '6rem 1.5rem',
        backgroundColor: '#050608',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '3.5rem' }}>
            <div className="eyebrow-red">
              <span className="eyebrow-square"></span>
              EXPERT COACHING ROSTER
            </div>
            <h2 className="font-display" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', color: '#ffffff' }}>
              TRAIN WITH INDUSTRY LEADERS
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {instructors.map((ins, i) => (
              <div key={i} style={{
                backgroundColor: '#0D0E12',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '2rem 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '4px',
                      backgroundColor: i === 0 ? 'var(--crimson-primary)' : '#181A20',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.35rem',
                      color: '#ffffff',
                      fontWeight: 800
                    }}>
                      {ins.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-display" style={{ fontSize: '1.35rem', color: '#ffffff', lineHeight: 1.1 }}>
                        {ins.name}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--crimson-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {ins.role}
                      </span>
                    </div>
                  </div>

                  <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.4 }}>
                    {ins.specialty}
                  </p>

                  <p style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                    {ins.experience}
                  </p>
                </div>

                <button 
                  onClick={onOpenTimetable}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '4px',
                    color: '#ffffff',
                    padding: '0.6rem 1rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--crimson-primary)')}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
                >
                  VIEW SESSIONS →
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Section 6: PRICING & MEMBERSHIP TIERS ───────────────────────────────── */}
      <section id="pricing" style={{ padding: '6rem 1.5rem', maxWidth: '1320px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 4rem' }}>
          <div className="eyebrow-red" style={{ justifyContent: 'center' }}>
            <span className="eyebrow-square"></span>
            TRANSPARENT MEMBERSHIPS
          </div>
          <h2 className="font-display" style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4rem)', color: '#ffffff', lineHeight: 1 }}>
            MEMBERSHIP PLANS BUILT FOR COMMITMENT
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.95rem', marginTop: '1rem', lineHeight: 1.5 }}>
            Zero joining fees. Instant booking through our live schedule portal. Choose the tier that matches your weekly cadence.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          alignItems: 'stretch'
        }}>
          {pricingTiers.map((tier, idx) => (
            <div 
              key={idx}
              style={{
                backgroundColor: tier.isFeatured ? '#111319' : '#0D0E12',
                border: tier.isFeatured ? '2px solid var(--crimson-primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '2.5rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: tier.isFeatured ? '0 16px 40px rgba(229, 36, 36, 0.25)' : 'none'
              }}
            >
              {tier.isFeatured && (
                <span style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'var(--crimson-primary)',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '0.3rem 0.9rem',
                  borderRadius: '3px',
                  boxShadow: '0 4px 12px rgba(229, 36, 36, 0.5)'
                }}>
                  MOST POPULAR
                </span>
              )}

              <div>
                <h3 className="font-display" style={{ fontSize: '1.75rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                  {tier.name}
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', lineHeight: 1.45, marginBottom: '1.75rem' }}>
                  {tier.desc}
                </p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '2rem' }}>
                  <span className="font-display" style={{
                    fontSize: '3rem',
                    fontWeight: 900,
                    color: tier.isFeatured ? 'var(--crimson-primary)' : '#ffffff',
                    lineHeight: 1
                  }}>
                    {tier.price}
                  </span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    / {tier.period}
                  </span>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {tier.features.map((feat, fi) => (
                      <li key={fi} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                        <Check size={15} color="var(--crimson-primary)" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button 
                onClick={onOpenTimetable}
                className={tier.isFeatured ? 'btn-crimson' : 'btn-athletic-outline'}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                SELECT PLAN →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 7: LOCATION & STUDIO CONTACT ─────────────────────────────────── */}
      <section id="contact" style={{
        padding: '6rem 1.5rem',
        backgroundColor: '#050608',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{
          maxWidth: '1320px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3.5rem',
          alignItems: 'center'
        }}>
          <div>
            <div className="eyebrow-red">
              <span className="eyebrow-square"></span>
              VISIT OUR FACILITY
            </div>
            <h2 className="font-display" style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
              color: '#ffffff',
              lineHeight: 0.95,
              marginBottom: '1.5rem'
            }}>
              READY TO<br />
              STEP IN?
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '480px' }}>
              Located in the heart of Bengaluru. Experience our signature dark-aesthetic athletic suites, private locker facilities, and elite sound-engineered studios.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ padding: '0.6rem', backgroundColor: '#111319', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', color: 'var(--crimson-primary)' }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.2rem' }}>Studio Location</h4>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                    100ft Road, Indiranagar, Bengaluru, Karnataka 560038
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ padding: '0.6rem', backgroundColor: '#111319', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', color: 'var(--crimson-primary)' }}>
                  <Phone size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.2rem' }}>Phone Support</h4>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                    +91 9064074801 (Mon–Sun 6:00 AM – 9:00 PM)
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ padding: '0.6rem', backgroundColor: '#111319', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', color: 'var(--crimson-primary)' }}>
                  <Mail size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.2rem' }}>Email Enquiries</h4>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                    victorchanda1101@gmail.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#0D0E12',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '2.5rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
          }}>
            <h3 className="font-display" style={{ fontSize: '1.75rem', color: '#ffffff', marginBottom: '0.5rem' }}>
              BOOK YOUR TRIAL SESSION
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '2rem' }}>
              Browse real-time seat availability across all upcoming sessions today and this week. Instant booking confirmation without phone calls.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button 
                onClick={onOpenTimetable}
                className="btn-crimson"
                style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
              >
                OPEN LIVE TIMETABLE →
              </button>

              <button 
                onClick={onOpenLogin}
                className="btn-athletic-outline"
                style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}
              >
                <Lock size={14} />
                STAFF & INSTRUCTOR PORTAL
              </button>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              <span>✓ Instant confirmation</span>
              <span>✓ Free cancellation up to 2h</span>
              <span>✓ Towels provided</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer style={{
        padding: '3rem 1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: '#030406'
      }}>
        <div style={{
          maxWidth: '1320px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--crimson-primary)', display: 'inline-block' }}></span>
            <span className="font-display" style={{ fontSize: '1.25rem', color: '#ffffff', letterSpacing: '0.04em' }}>
              V FITNESS STUDIO
            </span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>
            © {new Date().getFullYear()} V Fitness Studio • Managed by Victor Chanda • Bengaluru, India
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button 
              onClick={onOpenLogin}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                cursor: 'pointer'
              }}
            >
              STAFF PORTAL
            </button>
            <button 
              onClick={onOpenTimetable}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--crimson-primary)',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                cursor: 'pointer'
              }}
            >
              TIMETABLE →
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};
