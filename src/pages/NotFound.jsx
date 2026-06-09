import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={S.page}>
      {/* Animated background */}
      <div style={S.bgCircle1} />
      <div style={S.bgCircle2} />

      <div style={S.card} className="animate-scale-in">
        <div style={S.emojiStack}>
          <span style={S.mainEmoji}>🍕</span>
          <span style={S.badgeEmoji}>❓</span>
        </div>

        <h1 style={S.code}>404</h1>
        <h2 style={S.title}>Page Not Found</h2>
        <p style={S.desc}>
          Oops! This page seems to have gone missing — just like the last slice of pizza. 
          Let's get you back to the good stuff.
        </p>

        <div style={S.actions}>
          <button onClick={() => navigate('/dashboard')} style={S.primaryBtn}>
            🏠 Back to Dashboard
          </button>
          <button onClick={() => navigate(-1)} style={S.secondaryBtn}>
            ← Go Back
          </button>
        </div>

        <p style={S.hint}>
          Or try browsing{' '}
          <span
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}
            onClick={() => navigate('/dashboard')}
          >
            our restaurants
          </span>
          {' '}to find something delicious.
        </p>
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--background)',
    fontFamily: 'var(--font-body)',
    position: 'relative',
    overflow: 'hidden',
    padding: '2rem',
  },
  bgCircle1: {
    position: 'absolute',
    width: '600px', height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(226,55,68,0.06) 0%, transparent 70%)',
    top: '-200px', right: '-200px',
    pointerEvents: 'none',
  },
  bgCircle2: {
    position: 'absolute',
    width: '400px', height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(226,55,68,0.04) 0%, transparent 70%)',
    bottom: '-100px', left: '-100px',
    pointerEvents: 'none',
  },
  card: {
    background: 'white',
    borderRadius: '24px',
    padding: '3.5rem 3rem',
    textAlign: 'center',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
    border: '1px solid var(--border-light)',
    position: 'relative',
    zIndex: 1,
  },
  emojiStack: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '1rem',
  },
  mainEmoji: {
    fontSize: '5rem',
    display: 'block',
    animation: 'float 3s ease-in-out infinite',
  },
  badgeEmoji: {
    position: 'absolute',
    bottom: '4px', right: '-8px',
    fontSize: '2rem',
    background: 'white',
    borderRadius: '50%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '2.4rem', height: '2.4rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  code: {
    fontSize: '6rem',
    fontWeight: 900,
    fontFamily: 'var(--font-heading)',
    background: 'linear-gradient(135deg, #E23744, #FF6B35)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: '0 0 0.3rem',
    lineHeight: 1,
    letterSpacing: '-0.05em',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    margin: '0 0 1rem',
    fontFamily: 'var(--font-heading)',
  },
  desc: {
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
    lineHeight: 1.65,
    margin: '0 0 2rem',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
  },
  primaryBtn: {
    background: 'linear-gradient(135deg, #E23744, #CB202D)',
    color: 'white',
    border: 'none',
    padding: '0.85rem 1.8rem',
    borderRadius: '12px',
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(226,55,68,0.3)',
    letterSpacing: '0.01em',
  },
  secondaryBtn: {
    background: '#F5F5F7',
    color: 'var(--text-secondary)',
    border: '1.5px solid var(--border)',
    padding: '0.85rem 1.5rem',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  hint: {
    color: 'var(--text-muted)',
    fontSize: '0.83rem',
    margin: 0,
  },
};
