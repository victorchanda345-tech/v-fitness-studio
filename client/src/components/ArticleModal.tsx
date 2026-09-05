import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, Calendar, CheckCircle2 } from 'lucide-react';

export interface ArticleSection {
  heading?: string;
  body: string[];
  quote?: string;
  bulletPoints?: string[];
}

export interface EditorialArticle {
  id: string;
  badge: 'TRAINING' | 'NUTRITION' | 'MINDSET';
  tagline: string;
  title: string;
  description: string;
  image: string;
  room: string;
  readTime: string;
  author: string;
  authorRole: string;
  authorInitials: string;
  publishDate: string;
  sections: ArticleSection[];
  keyTakeaways: string[];
  relatedClassTitle: string;
  relatedClassCta?: string;
}

interface ArticleModalProps {
  article: EditorialArticle;
  onClose: () => void;
  onBookClass?: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  // Lock body scroll while modal is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        backgroundColor: 'rgba(5, 6, 8, 0.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#0D0E13',
          border: '1px solid rgba(229, 36, 36, 0.28)',
          borderRadius: '10px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.9), 0 0 30px rgba(229, 36, 36, 0.12)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div style={{
          padding: '1rem 1.75rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(13, 14, 19, 0.95)',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              backgroundColor: 'var(--crimson-primary)',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '0.2rem 0.6rem',
              borderRadius: '3px'
            }}>
              {article.badge}
            </span>
            <span style={{
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.5)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              KNOWLEDGE &amp; CULTURE • {article.room}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close article"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              color: 'rgba(255, 255, 255, 0.7)',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(229, 36, 36, 0.15)';
              e.currentTarget.style.borderColor = 'var(--crimson-primary)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Article Content */}
        <div style={{
          padding: '2rem 2.25rem',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Article Header & Tagline */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: 'var(--crimson-primary)',
              textTransform: 'uppercase',
              marginBottom: '0.45rem'
            }}>
              {article.tagline}
            </div>

            <h1 className="font-display" style={{
              fontSize: 'clamp(1.85rem, 3.5vw, 2.5rem)',
              color: '#ffffff',
              lineHeight: 1.12,
              marginBottom: '1rem',
              letterSpacing: '0.01em'
            }}>
              {article.title}
            </h1>

            {/* Author Meta Row */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              paddingBottom: '1.25rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E52424 0%, #7F1D1D 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  letterSpacing: '0.04em',
                  boxShadow: '0 4px 14px rgba(229, 36, 36, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  {article.authorInitials}
                </div>

                <div>
                  <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem' }}>
                    {article.author}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.78rem' }}>
                    {article.authorRole}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                fontSize: '0.78rem',
                color: 'rgba(255, 255, 255, 0.55)'
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={14} color="var(--crimson-primary)" />
                  {article.readTime}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} color="var(--crimson-primary)" />
                  {article.publishDate}
                </span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '280px',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <img 
              src={article.image} 
              alt={article.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(13, 14, 19, 0.75) 0%, transparent 60%)'
            }} />
          </div>

          {/* Lead Paragraph */}
          <div style={{
            fontSize: '1.05rem',
            lineHeight: 1.68,
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 500,
            marginBottom: '2rem',
            paddingLeft: '1.25rem',
            borderLeft: '3px solid var(--crimson-primary)'
          }}>
            {article.description}
          </div>

          {/* Article Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {article.sections.map((sec, sIdx) => (
              <div key={sIdx}>
                {sec.heading && (
                  <h2 style={{
                    fontSize: '1.3rem',
                    color: '#ffffff',
                    fontWeight: 800,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    marginBottom: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: 'var(--crimson-primary)',
                      display: 'inline-block'
                    }} />
                    {sec.heading}
                  </h2>
                )}

                {sec.body.map((p, pIdx) => (
                  <p key={pIdx} style={{
                    fontSize: '0.92rem',
                    lineHeight: 1.72,
                    color: 'rgba(255, 255, 255, 0.78)',
                    marginBottom: pIdx === sec.body.length - 1 && !sec.quote && !sec.bulletPoints ? 0 : '1rem'
                  }}>
                    {p}
                  </p>
                ))}

                {sec.quote && (
                  <div style={{
                    margin: '1.25rem 0',
                    padding: '1.25rem 1.5rem',
                    backgroundColor: 'rgba(229, 36, 36, 0.06)',
                    borderLeft: '3px solid var(--crimson-primary)',
                    borderRadius: '0 6px 6px 0',
                    fontStyle: 'italic',
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontSize: '0.95rem',
                    lineHeight: 1.6
                  }}>
                    "{sec.quote}"
                  </div>
                )}

                {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                  <ul style={{
                    margin: '1rem 0 0 0',
                    paddingLeft: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    {sec.bulletPoints.map((bp, bpIdx) => (
                      <li key={bpIdx} style={{
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        color: 'rgba(255, 255, 255, 0.75)'
                      }}>
                        {bp}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Coach's Key Takeaways Card */}
          {article.keyTakeaways && article.keyTakeaways.length > 0 && (
            <div style={{
              marginTop: '2.5rem',
              backgroundColor: 'rgba(229, 36, 36, 0.05)',
              border: '1px solid rgba(229, 36, 36, 0.25)',
              borderRadius: '8px',
              padding: '1.5rem 1.75rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <CheckCircle2 size={18} color="var(--crimson-primary)" />
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#ffffff'
                }}>
                  MASTER COACH'S ACTIONABLE PROTOCOL
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {article.keyTakeaways.map((item, tIdx) => (
                  <div key={tIdx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    fontSize: '0.88rem',
                    lineHeight: 1.55,
                    color: 'rgba(255, 255, 255, 0.85)'
                  }}>
                    <span style={{
                      color: 'var(--crimson-primary)',
                      fontWeight: 900,
                      marginTop: '0.05rem',
                      userSelect: 'none'
                    }}>
                      ✓
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom CTA Bar */}
        <div style={{
          padding: '1.25rem 2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#090A0E',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          zIndex: 10
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              RECOMMENDED DISCIPLINE
            </div>
            <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 700 }}>
              {article.relatedClassTitle}
            </div>
          </div>

          <div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '5px',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '0.65rem 1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--crimson-primary)';
                e.currentTarget.style.borderColor = 'var(--crimson-primary)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.color = '#ffffff';
              }}
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
