import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Check, 
  Menu, 
  X, 
  Lock,
  Clock,
  BookOpen,
  Users,
  CalendarCheck
} from 'lucide-react';
import { ArticleModal, EditorialArticle } from '../components/ArticleModal';
import { MemberPortalModal } from '../components/MemberPortalModal';
import { MemberProfile } from '../api/client';

interface LandingProps {
  onOpenTimetable: (studioRoom?: string, instructor?: string, discipline?: string) => void;
  onOpenLogin: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onOpenTimetable, onOpenLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<EditorialArticle | null>(null);
  const [memberPortalOpen, setMemberPortalOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<MemberProfile | null>(() => {
    try {
      const saved = localStorage.getItem('vfitness_member_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleMemberChange = (member: MemberProfile | null) => {
    setCurrentMember(member);
    try {
      if (member) {
        localStorage.setItem('vfitness_member_profile', JSON.stringify(member));
      } else {
        localStorage.removeItem('vfitness_member_profile');
      }
    } catch {}
  };

  const openAllTimetable = () => onOpenTimetable();

  const programs = [
    {
      number: '01',
      title: 'HIIT & STRENGTH',
      tag: 'METABOLIC POWER',
      discipline: 'HIIT & Strength',
      description: 'Explosive functional circuits combining barbell power, kettlebells, and cardio intervals to maximize EPOC calorie burn and stamina.',
      duration: '45 mins',
      image: '/images/program-hiit.jpg',
      isFeatured: false
    },
    {
      number: '02',
      title: 'PILATES CORE',
      tag: 'POSTURE & CONTROL',
      discipline: 'Pilates',
      description: 'Controlled mat-based conditioning targeting the deep core, pelvic alignment, and spine stabilization without joint compression.',
      duration: '50 mins',
      image: '/images/program-pilates.jpg',
      isFeatured: false
    },
    {
      number: '03',
      title: 'YOGA & MOBILITY',
      tag: 'ATHLETIC RECOVERY',
      discipline: 'Yoga',
      description: 'Dynamic vinyasa flows and functional joint mobility designed to lubricate tissue, expand range of motion, and sharpen mental focus.',
      duration: '60 mins',
      image: '/images/program-yoga.jpg',
      isFeatured: false
    },
    {
      number: '04',
      title: 'BHANGRA CARDIO',
      tag: 'HIGH-ENERGY DANCE',
      discipline: 'Dance',
      description: 'Electrifying music-driven dance workout fusing athletic tempo and rhythmic cardio conditioning for an exhilarating sweat session.',
      duration: '50 mins',
      image: '/images/program-bhangra.jpg',
      isFeatured: false
    }
  ];

  const editorialArticles: EditorialArticle[] = [
    {
      id: 'strength-principles',
      badge: 'TRAINING',
      tagline: 'BIOMECHANICS & NEUROMUSCULAR DRIVE',
      title: '5 Principles Every Athlete Must Master for Peak Strength',
      description: 'Mastering progressive overload, bar path acceleration, and compound movement mechanics under tension.',
      image: '/images/photo-strength.jpg',
      room: 'Studio C',
      readTime: '4 MIN READ',
      author: 'Victor Chanda',
      authorRole: 'Head Strength Coach & Studio Founder',
      authorInitials: 'VC',
      publishDate: 'V Fitness Research Lab',
      sections: [
        {
          heading: '1. Progressive Overload Beyond Just Adding Weight',
          body: [
            'Progressive overload is commonly misunderstood as simply adding iron plates to the barbell week after week. In advanced athletic conditioning, forced linear progression inevitably leads to structural stagnation or connective tissue wear.',
            'True progressive overload encompasses four distinct mechanical vectors: increasing time-under-tension (such as enforced 3-second eccentric descents), tightening intra-set rest intervals to train phosphocreatine resynthesis, elevating functional range of motion under tension, and executing higher mechanical volume with zero breakdown in movement mechanics.'
          ],
          quote: 'Strength is not an ego metric — it is the coordinated mastery of neuromuscular tension under unforgiving load.'
        },
        {
          heading: '2. Bar Path Optimization & Moment Arm Elimination',
          body: [
            'Every millimeter a barbell drifts away from your anatomical center of mass creates an artificial moment arm. This multiplies rotational shear stress on vulnerable passive ligaments while bleeding kinetic force that should be driving the weight upward.',
            'In our Studio C functional rig, we utilize bar velocity feedback and kinetic video analysis. Whether executing a conventional pull or a high-bar back squat, keeping the bar path strictly perpendicular over the midfoot maximizes work efficiency and protects the axial skeleton.'
          ]
        },
        {
          heading: '3. Maximal Concentric Intent Across All Percentages',
          body: [
            'Moving the barbell with maximal explosive intent during the concentric ascent — even when handling warm-up loads of 60% 1RM — recruits high-threshold Type IIx fast-twitch motor units.',
            'If you move a light weight slowly, you train your nervous system to fire lethargically. Aggressively driving through the floor on every repetition programs high-velocity motor recruitment patterns that translate directly to personal records when maxing out.'
          ]
        },
        {
          heading: '4. Joint Centration & Kinetic Torsional Torque',
          body: [
            'Stabilizing joints before initiating movement is the foundation of injury prevention. In the squat, athletes must externally rotate the femurs into the acetabulum ("screwing your feet into the platform") to activate the gluteus medius and stabilize the pelvis.',
            'Similarly, during heavy pressing, athletes must actively "break the bar" to engage the latissimus dorsi, packing the scapulae and centrating the humeral head in the glenoid fossa.'
          ]
        },
        {
          heading: '5. Systemic Recovery as a Non-Negotiable Training Variable',
          body: [
            'You do not adapt inside the gym; you induce microtrauma. Systemic muscular supercompensation and myofibrillar repair occur during deep stage-3 non-REM slow-wave sleep and strategic metabolic replenishment.',
            'When weekly tonnage outpaces autonomic recovery, sympathetic nervous system overdrive elevates cortisol, impairs immune function, and degrades joint lubrication. Planned deload weeks every 5th to 6th cycle are not a sign of weakness — they are the mark of an elite athlete.'
          ]
        }
      ],
      keyTakeaways: [
        'Record working sets from the side profile to audit vertical bar path alignment over the midfoot.',
        'Enforce a strict 2-3 second eccentric descent on every compound lift to develop kinetic control.',
        'Apply maximal concentric drive on all working reps regardless of bar percentage.',
        'Protect joint capsules by establishing external rotational torque at the hips and shoulders before lifting.',
        'Treat 8 hours of restorative sleep as an equally critical training variable as your heaviest set.'
      ],
      relatedClassTitle: 'HIIT & STRENGTH',
      relatedClassCta: 'VIEW STRENGTH SESSIONS'
    },
    {
      id: 'nutrition-timing',
      badge: 'NUTRITION',
      tagline: 'PERI-WORKOUT FUELING & RECOVERY',
      title: 'What to Eat Before and After Training for Maximum Performance',
      description: 'Optimizing macronutrient timing, cellular hydration, and post-session glycogen replenishment for clean recovery.',
      image: '/images/photo-nutrition.jpg',
      room: 'V Nutrition Bar',
      readTime: '5 MIN READ',
      author: 'Priya Patel',
      authorRole: 'Performance Nutrition Specialist',
      authorInitials: 'PP',
      publishDate: 'V Fitness Clinical Nutrition',
      sections: [
        {
          heading: '1. The Pre-Training Glycogen Saturation Window (90–120 Mins)',
          body: [
            'Attempting high-intensity metabolic work or heavy compound lifting with depleted glycogen reserves accelerates muscle catabolism and triggers early central fatigue.',
            'Between 90 and 120 minutes prior to your training session, consume a low-to-moderate glycemic meal designed for clean gastric emptying. Focus on 45–60 grams of complex carbohydrates paired with 25–30 grams of lean, bioavailable protein.'
          ],
          bulletPoints: [
            'Ideal Carb Sources: Rolled oats, jasmine rice, sweet potato mash, or sourdough bread.',
            'Ideal Protein Sources: Grilled chicken breast, pasture-raised egg whites, or high-protein paneer.',
            'Keep dietary fats below 10g and avoid heavy raw cruciferous vegetables to eliminate gastric sluggishness.'
          ]
        },
        {
          heading: '2. The 20-Minute Pre-Ignition Fuel & Osmotic Hydration',
          body: [
            'If you train at 6:00 AM or more than 3 hours after a whole-food meal, your circulating blood glucose will be low. 15 to 20 minutes prior to warm-up, ingest 20–25 grams of fast-acting simple carbohydrates.',
            'A ripe banana with a pinch of Himalayan pink salt or two Medjool dates provides instant glucose for ATP production without triggering insulin crashes. Combine with 400ml of water and 300mg of sodium to optimize blood plasma volume.'
          ],
          quote: 'Hydration is not merely water intake — it is intracellular osmotic pressure regulated by essential sodium, potassium, and magnesium ions.'
        },
        {
          heading: '3. Intra-Session Electrolyte Preservation',
          body: [
            'In our climate-controlled studios, sweat rates during 50-minute HIIT or Bhangra Cardio sessions routinely exceed 1 liter per hour. Drinking un-mineralized plain water dilutes serum electrolytes, causing cellular hyponatremia and muscular cramping.',
            'Sip 750ml of water containing 500mg sodium, 200mg potassium, and essential branched-chain amino acids (BCAAs) throughout intense sessions to preserve muscular pump and delay perceived exertion.'
          ]
        },
        {
          heading: '4. The Post-Workout Anabolic Rebound (Within 45 Mins)',
          body: [
            'Directly following training, muscle cell membranes exhibit heightened GLUT4 glucose transporter activity and elevated ribosomal protein synthesis sensitivity. This is the optimal window to initiate cellular repair.',
            'Consume 30–35 grams of rapid-digesting protein containing at least 3 grams of the essential amino acid leucine to turn on the mTOR molecular switch. Pair with 50–70 grams of high-glycemic carbohydrates to trigger an insulin spike, rapidly driving amino acids into depleted muscle tissue.'
          ],
          bulletPoints: [
            'Stop by the V Nutrition Bar for a cold-pressed whey isolate shake with blended dates and blueberries.',
            'Plant-based athletes: Pair organic pea and brown rice protein with tart cherry juice for antioxidant recovery.',
            'Continue rehydrating until your urine is pale straw in color over the subsequent 4 hours.'
          ]
        }
      ],
      keyTakeaways: [
        'Fuel 90-120 minutes out with complex carbs and lean protein, keeping dietary fats low.',
        'Ingest 20-25g of rapid simple carbs (dates, ripe banana) 20 minutes before training.',
        'Add 500mg sodium to your intra-workout water bottle to maintain cellular osmotic pressure.',
        'Deliver 30-35g of high-leucine protein within 45 minutes of completing your final set.',
        'Utilize tart cherry extract or cold-pressed juices to reduce delayed onset muscle soreness (DOMS).'
      ],
      relatedClassTitle: 'V NUTRITION BAR & RECOVERY LOUNGE',
      relatedClassCta: 'EXPLORE STUDIO AMENITIES'
    },
    {
      id: 'relentless-consistency',
      badge: 'MINDSET',
      tagline: 'BEHAVIORAL PSYCHOLOGY & HABIT LOOPS',
      title: 'How to Stay Relentlessly Consistent When Motivation Runs Out',
      description: 'Building unbreakable training systems, habit loops, and mental resilience when physical fatigue sets in.',
      image: '/images/photo-mindset.jpg',
      room: 'Studio B',
      readTime: '4 MIN READ',
      author: 'Aarav Mehta',
      authorRole: 'Athletic Mindset & Mobility Coach',
      authorInitials: 'AM',
      publishDate: 'V Fitness Performance Mindset',
      sections: [
        {
          heading: '1. Motivation is an Unreliable Emotion; Systems are Permanent',
          body: [
            'Motivation is a neurochemical spike driven by novelty — a new pair of lifting shoes, a compelling video, or an ambitious resolution. But dopamine is inherently homeostatic; it inevitably returns to baseline when you face an exhausting workday or broken sleep.',
            'Elite performers do not wait to "feel motivated." They build behavioral systems where discipline replaces emotional whim. When training is embedded into your calendar as a non-negotiable professional meeting with yourself, decision fatigue disappears.'
          ],
          quote: 'You do not rise to the level of your goals. You fall to the level of your training systems.'
        },
        {
          heading: '2. The 2-Minute Friction Reduction Architecture',
          body: [
            'Behavioral friction is the primary barrier to sustainable fitness habits. If you wake up and have to find your clean workout apparel, locate your studio pass, and decide what workout to perform, your brain will choose the path of least resistance.',
            'Eliminate every friction point before bedtime: pack your studio gym bag, lay out your shoes, and reserve your spot in the V Fitness Studio timetable 7 days in advance. When the friction to show up is lower than the friction to cancel, consistency becomes automatic.'
          ]
        },
        {
          heading: '3. Minimum Viable Workouts & The Unbroken Chain',
          body: [
            'One of the most destructive mental traps is the all-or-nothing dichotomy: "If I cannot do my full 60-minute heavy session, I will just skip today." This breaks the neurological habit loop.',
            'On days when your energy or schedule is at 30%, showing up to complete 25 minutes of restorative mobility and controlled core work in Studio B preserves your athletic identity. You cast a vote for your consistency, keeping the momentum intact.'
          ]
        },
        {
          heading: '4. The Psychology of the Studio Cohort',
          body: [
            'Human beings are evolutionary pack animals. When you train alone in a generic gym with headphones on, skipping a session carries zero social consequence. Nobody noticed you were missing.',
            'In our studio classes, your coaches and lane partners know your name. When you miss a class, your absence is felt. Training inside a dedicated community transforms solitary suffering into shared athletic triumph.'
          ]
        }
      ],
      keyTakeaways: [
        'Never rely on emotional motivation; calendarize your studio appointments 7 days in advance.',
        'Pack your gym bag and prep hydration the night before to eliminate morning decision friction.',
        'Adopt the Minimum Viable Workout mentality: 20 minutes of movement beats 0 minutes every time.',
        'Leverage the community cohort effect: training alongside peers increases long-term adherence by 84%.',
        'Shift your mindset from "I have to exercise" to "I am an athlete who respects my body."'
      ],
      relatedClassTitle: 'YOGA & MOBILITY',
      relatedClassCta: 'VIEW MOBILITY SESSIONS'
    }
  ];

  const studios = [
    {
      name: 'Studio A',
      type: 'Main Movement Hall',
      capacity: 'CAPACITY: 15 SPOTS',
      specs: 'Shock-absorbing sprung bamboo flooring, 360° surround audio system, full-length mirror wall.'
    },
    {
      name: 'Studio B',
      type: 'Mind & Core Studio',
      capacity: 'CAPACITY: 12 SPOTS',
      specs: 'Acoustic soundproofing, dimmable amber circadian lighting, eco-cork mats & high-density foam rollers.'
    },
    {
      name: 'Studio C',
      type: 'HIIT & Functional Rig',
      capacity: 'CAPACITY: 10 SPOTS',
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
      name: 'Ananya Iyer',
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
              onClick={() => setMemberPortalOpen(true)}
              className="btn-athletic-outline"
              style={{ padding: '0.65rem 1rem', fontSize: '0.8rem', borderColor: 'rgba(229, 36, 36, 0.4)' }}
            >
              <CalendarCheck size={13} color="var(--crimson-primary)" />
              {currentMember ? `MY BOOKINGS (${currentMember.name.split(' ')[0]})` : 'MY BOOKINGS'}
            </button>
            <button 
              onClick={onOpenLogin}
              className="btn-athletic-outline"
              style={{ padding: '0.65rem 1rem', fontSize: '0.8rem' }}
            >
              <Lock size={13} />
              STAFF PORTAL
            </button>
            <button 
              onClick={openAllTimetable}
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
              <button onClick={() => { setMobileMenuOpen(false); setMemberPortalOpen(true); }} className="btn-athletic-outline" style={{ width: '100%', borderColor: 'rgba(229, 36, 36, 0.4)' }}>
                <CalendarCheck size={14} color="var(--crimson-primary)" /> MY BOOKINGS / MEMBER PORTAL
              </button>
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
          V FITNESS STUDIO
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
                onClick={openAllTimetable}
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
                loading="eager"
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

          <div>
            <button 
              onClick={openAllTimetable}
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
                    type="button"
                    onClick={() => onOpenTimetable(undefined, undefined, prog.discipline)}
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
              onClick={openAllTimetable}
              className="btn-athletic-outline"
              style={{ fontSize: '0.8rem', padding: '0.65rem 1.25rem' }}
            >
              EXPLORE SCHEDULE →
            </button>
          </div>

          {/* 3-Photo Grid (Interactive Editorial Articles) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem'
          }}>
            {editorialArticles.map((article) => (
              <div 
                key={article.id}
                className="photo-card"
                onClick={() => setSelectedArticle(article)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedArticle(article);
                  }
                }}
                style={{
                  cursor: 'pointer'
                }}
              >
                <div className="photo-card-img-wrap">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="photo-card-img"
                    loading="lazy"
                  />
                  <div style={{
                    position: 'absolute',
                    top: '0.85rem',
                    right: '0.85rem',
                    backgroundColor: 'rgba(7, 8, 11, 0.78)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '4px',
                    padding: '0.25rem 0.6rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.85)',
                    letterSpacing: '0.04em'
                  }}>
                    <Clock size={11} color="var(--crimson-primary)" />
                    {article.readTime}
                  </div>
                </div>
                
                <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span className="photo-card-badge">
                        {article.badge}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.45)', fontWeight: 600 }}>
                        {article.room}
                      </span>
                    </div>

                    <h3 className="photo-card-title" style={{ marginBottom: '0.45rem' }}>
                      {article.title}
                    </h3>

                    <div style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontWeight: 600,
                      marginBottom: '0.85rem'
                    }}>
                      By {article.author} • {article.authorRole}
                    </div>

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
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <BookOpen size={13} color="var(--crimson-primary)" />
                      Complete Guide
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedArticle(article);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        color: 'var(--crimson-primary)',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'transform 0.2s ease, color 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = 'var(--crimson-primary)';
                      }}
                    >
                      READ MORE →
                    </button>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="font-display" style={{ fontSize: '1.8rem', color: '#ffffff' }}>
                  {st.name}
                </span>
                <span style={{
                  backgroundColor: 'rgba(229, 36, 36, 0.15)',
                  color: 'var(--crimson-primary)',
                  border: '1px solid rgba(229, 36, 36, 0.3)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '3px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <Users size={12} color="var(--crimson-primary)" />
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
                type="button"
                onClick={() => onOpenTimetable(st.name)}
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
                  gap: '0.4rem',
                  transition: 'color 0.2s ease, transform 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = 'var(--crimson-primary)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                VIEW {st.name.toUpperCase()} TIMETABLE →
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
                  type="button"
                  onClick={() => onOpenTimetable(undefined, ins.name)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '4px',
                    color: '#ffffff',
                    padding: '0.65rem 1rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--crimson-primary)';
                    e.currentTarget.style.color = 'var(--crimson-primary)';
                    e.currentTarget.style.backgroundColor = 'rgba(229, 36, 36, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  VIEW {ins.name.toUpperCase()} SESSIONS →
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
                onClick={openAllTimetable}
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
                onClick={openAllTimetable}
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
              onClick={openAllTimetable}
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

      {/* ── Editorial Article Reader Modal ────────────────────────────────────── */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onBookClass={() => {
            const articleId = selectedArticle.id;
            setSelectedArticle(null);
            if (articleId === 'strength-principles' || articleId === 'biomechanics-lifting') {
              onOpenTimetable('Studio C', 'Victor Chanda');
            } else if (articleId === 'relentless-consistency') {
              onOpenTimetable('Studio B', 'Aarav Mehta');
            } else if (articleId === 'nutrition-timing') {
              onOpenTimetable('Studio A', 'Priya Patel');
            } else {
              onOpenTimetable();
            }
          }}
        />
      )}

      {/* ── Member Self-Service Portal Modal ──────────────────────────────────── */}
      <MemberPortalModal
        isOpen={memberPortalOpen}
        onClose={() => setMemberPortalOpen(false)}
        currentMember={currentMember}
        onMemberChange={handleMemberChange}
        onBrowseClasses={() => {
          setMemberPortalOpen(false);
          openAllTimetable();
        }}
      />

    </div>
  );
};
