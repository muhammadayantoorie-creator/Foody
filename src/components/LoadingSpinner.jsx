import React from 'react';

/* ── Inline spinner ─────────────────────────────────────────── */
export function InlineSpinner({ size = 20, color = 'var(--primary)' }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size,
      height: size,
      border: `2.5px solid rgba(255,255,255,0.2)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      verticalAlign: 'middle',
      flexShrink: 0,
    }} />
  );
}

/* ── Full page enterprise loader with WebGL-inspired animation ─ */
export function PageSpinner({ message = 'Loading...' }) {
  return (
    <div style={s.overlay}>
      <div style={s.spinnerBox}>
        <div style={s.ringOuter}>
          <div style={s.ringInner} />
          <div style={s.centerEmoji}>🍔</div>
        </div>
        <div style={s.labelWrap}>
          <p style={s.msg}>{message}</p>
          <div style={s.dotRow}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ ...s.dot, animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulseOrb {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.12); opacity: 0.85; }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scaleY(0.4); }
          40% { transform: scaleY(1); }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

/* ── Error Banner ───────────────────────────────────────────── */
export function ErrorBanner({ message, onRetry }) {
  return (
    <div style={s.errorBanner}>
      <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <strong style={{ display: 'block', color: 'var(--primary-dark)', marginBottom: '0.2rem', fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>
          Unable to load data
        </strong>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
          {message || 'An unexpected error occurred. Please try again.'}
        </span>
      </div>
      {onRetry && (
        <button onClick={onRetry} style={s.retryBtn} className="animate-pulse-glow">
          ↻ Retry
        </button>
      )}
    </div>
  );
}

/* ── Section Skeleton Loader (shimmer cards) ────────────────── */
export function SectionSpinner({ message = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', padding: '1.5rem 0' }}>
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <InlineSpinner size={16} /> {message}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            borderRadius: '20px', border: '1px solid var(--border-light)', overflow: 'hidden',
            background: 'var(--surface-card)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}>
            {/* Image area */}
            <div className="shimmer-bg" style={{ height: '180px' }} />
            {/* Content */}
            <div style={{ padding: '1rem 1.1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <div className="shimmer-bg" style={{ height: '20px', width: '70%', borderRadius: '6px' }} />
              <div className="shimmer-bg" style={{ height: '14px', width: '50%', borderRadius: '4px' }} />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                <div className="shimmer-bg" style={{ height: '12px', width: '30%', borderRadius: '4px' }} />
                <div className="shimmer-bg" style={{ height: '12px', width: '25%', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(16px)',
    zIndex: 9999, animation: 'fadeIn 0.3s ease forwards',
  },
  spinnerBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' },
  ringOuter: {
    position: 'relative', width: '90px', height: '90px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  ringInner: {
    position: 'absolute', inset: 0,
    border: '3px solid rgba(226,55,68,0.2)',
    borderTopColor: '#e23744', borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  centerEmoji: {
    fontSize: '2.2rem',
    animation: 'pulseOrb 2.5s ease-in-out infinite',
    position: 'relative', zIndex: 1,
  },
  labelWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' },
  msg: { margin: 0, color: '#e2e8f0', fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-heading)' },
  dotRow: { display: 'flex', gap: '5px', alignItems: 'flex-end', height: '20px' },
  dot: {
    width: '5px', height: '16px', background: '#e23744', borderRadius: '3px',
    animation: 'dotBounce 1.2s ease-in-out infinite',
  },
  errorBanner: {
    background: 'var(--danger-bg)', border: '1.5px solid rgba(226,55,68,0.2)',
    borderRadius: '16px', padding: '1.2rem 1.4rem',
    display: 'flex', alignItems: 'flex-start', gap: '1rem',
    margin: '1.5rem 0',
  },
  retryBtn: {
    flexShrink: 0, padding: '0.6rem 1.2rem', background: 'var(--primary)', color: 'white',
    border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem',
    boxShadow: '0 4px 12px rgba(226,55,68,0.3)',
  },
};
