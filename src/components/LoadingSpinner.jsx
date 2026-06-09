import React from 'react';

/* ── Inline spinner (small) ────────────────────────────────── */
export function InlineSpinner({ size = 20, color = 'var(--primary)' }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size,
      height: size,
      border: `2.5px solid var(--border)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      verticalAlign: 'middle',
      flexShrink: 0,
    }} />
  );
}

/* ── Full-page loading screen with orbiting food emojis ────── */
export function PageSpinner({ message = 'Loading...' }) {
  return (
    <div style={s.overlay}>
      <div style={s.spinnerBox}>
        <div style={s.brandOrbit}>
          <span style={s.centerEmoji}>🍕</span>
          <div style={s.orbitItem1}>🍔</div>
          <div style={s.orbitItem2}>🍣</div>
          <div style={s.orbitItem3}>🧁</div>
        </div>
        <p style={s.msg}>{message}</p>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(45px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(45px) rotate(-360deg); }
        }
        @keyframes pulseLogo {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

/* ── Error banner ──────────────────────────────────────────── */
export function ErrorBanner({ message, onRetry }) {
  return (
    <div style={s.errorBanner}>
      <span style={{ fontSize: '1.8rem', marginRight: '0.2rem' }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <strong style={{ display: 'block', color: 'var(--primary-dark)', marginBottom: '0.2rem', fontFamily: 'var(--font-heading)', fontSize: '1.05rem' }}>Unable to load data</strong>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>{message || 'An unexpected error occurred. Please try again.'}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} style={s.retryBtn} className="animate-pulse-glow">
          Retry
        </button>
      )}
    </div>
  );
}

/* ── Section loader (shimmer card skeletons) ───────────────── */
export function SectionSpinner({ message = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', padding: '1.5rem 0' }}>
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.01em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <InlineSpinner size={16} /> {message}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: '220px', borderRadius: '16px', border: '1px solid var(--border-light)', overflow: 'hidden', background: '#fff', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div className="shimmer-bg" style={{ flex: 1, borderRadius: '12px' }} />
            <div className="shimmer-bg" style={{ height: '18px', width: '60%', borderRadius: '4px' }} />
            <div className="shimmer-bg" style={{ height: '12px', width: '40%', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed', inset: 0,
    display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center',
    background: 'var(--surface-elevated)', backdropFilter: 'blur(10px)',
    zIndex: 9999,
    animation: 'fadeIn 0.25s ease forwards',
  },
  spinnerBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
  brandOrbit: {
    position: 'relative',
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.5rem',
  },
  centerEmoji: {
    fontSize: '2.5rem',
    zIndex: 2,
    animation: 'pulseLogo 2s infinite ease-in-out',
    userSelect: 'none',
  },
  orbitItem1: {
    position: 'absolute',
    fontSize: '1.35rem',
    zIndex: 1,
    animation: 'orbit 3s infinite linear',
    userSelect: 'none',
  },
  orbitItem2: {
    position: 'absolute',
    fontSize: '1.35rem',
    zIndex: 1,
    animation: 'orbit 3s infinite linear',
    animationDelay: '-1s',
    userSelect: 'none',
  },
  orbitItem3: {
    position: 'absolute',
    fontSize: '1.35rem',
    zIndex: 1,
    animation: 'orbit 3s infinite linear',
    animationDelay: '-2s',
    userSelect: 'none',
  },
  msg: { margin: 0, color: 'var(--text-main)', fontSize: '1rem', fontWeight: '800', letterSpacing: '0.01em', fontFamily: 'var(--font-heading)' },
  errorBanner: {
    display: 'flex', alignItems: 'center', gap: '1.25rem',
    background: 'var(--danger-bg)', border: '1px solid rgba(226, 55, 68, 0.15)', borderRadius: 'var(--radius-md)',
    padding: '1.2rem 1.5rem', margin: '1rem 0',
    animation: 'fadeIn 0.3s ease',
  },
  retryBtn: {
    padding: '0.55rem 1.25rem', background: 'var(--primary)', color: 'white',
    border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer',
    fontWeight: '800', fontSize: '0.85rem', whiteSpace: 'nowrap',
    boxShadow: 'var(--shadow-primary)',
  },
};
