import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { InlineSpinner } from '../components/LoadingSpinner';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage('Check your inbox for further instructions.');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={S.page}>
      {/* Left Panel — Hero Visual */}
      <div style={S.leftPanel}>
        {/* Background image */}
        <div style={S.leftBgImg} />
        <div style={S.leftOverlay} />

        <div style={S.leftContent}>
          <div style={S.logoRow} className="animate-fade-up">
            <span style={{ fontSize: '2.2rem' }}>🍕</span>
            <h1 style={S.brand}>FoodDash</h1>
          </div>

          <h2 style={S.heroText} className="animate-hero-text">
            Don't worry,<br />we've got you.
          </h2>
          <p style={S.heroSub} className="animate-fade-up stagger-2">
            Just enter your registered email address, and we will send you a secure link to reset your password and get you back to ordering delicious meals.
          </p>

          {/* Floating food emojis */}
          <div style={S.floatingFoods}>
            {['🍩', '🍪', '🥨', '🥐', '🥯', '🥞'].map((f, i) => (
              <span
                key={i}
                className="animate-float"
                style={{
                  fontSize: `${1.6 + Math.random() * 1.2}rem`,
                  animationDelay: `${i * 0.5}s`,
                  opacity: 0.6 + Math.random() * 0.3,
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Reset Form */}
      <div style={S.rightPanel}>
        <div style={S.formCard} className="animate-scale-in">
          {/* Mobile logo */}
          <div style={S.mobileLogo}>
            <span style={{ fontSize: '1.8rem' }}>🍕</span>
            <span style={S.mobileLogoText}>FoodDash</span>
          </div>

          <h2 style={S.formTitle}>Reset password</h2>
          <p style={S.formSub}>Enter your email address to recover your account</p>

          {error && (
            <div style={S.errorBox} className="animate-slide-down">
              <span style={S.errorIcon}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div style={S.successBox} className="animate-slide-down">
              <span style={S.successIcon}>✅</span>
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={S.form}>
            <div style={S.fieldGroup}>
              <label style={S.label}>Email address</label>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>✉️</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={S.input}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={S.submitBtn}>
              {loading ? (
                <>
                  <InlineSpinner size={18} color="var(--text-on-primary)" />
                  <span>Sending reset link...</span>
                </>
              ) : (
                <span>Send Reset Link →</span>
              )}
            </button>
          </form>

          <div style={S.divider}>
            <div style={S.dividerLine} />
            <div style={S.dividerText}>or</div>
            <div style={S.dividerLine} />
          </div>

          <Link to="/login" style={S.loginBtn}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { 
    display: 'flex', 
    minHeight: '100vh', 
    background: 'var(--background)',
    fontFamily: 'var(--font-body)',
  },

  /* ── Left Panel ──────────────────────────── */
  leftPanel: {
    flex: '1 0 48%',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
  },
  leftBgImg: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url('https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'brightness(0.35)',
  },
  leftOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(160deg, rgba(28, 28, 46, 0.85) 0%, rgba(226, 55, 68, 0.25) 50%, rgba(28, 28, 46, 0.9) 100%)',
  },
  leftContent: {
    maxWidth: '440px',
    position: 'relative',
    zIndex: 1,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '2.5rem',
  },
  brand: {
    margin: 0,
    color: '#ffffff',
    fontSize: '1.7rem',
    fontWeight: 900,
    letterSpacing: '-0.03em',
    fontFamily: 'var(--font-heading)',
  },
  heroText: {
    color: '#ffffff',
    fontSize: '2.8rem',
    fontWeight: 900,
    margin: '0 0 1rem',
    lineHeight: 1.1,
    letterSpacing: '-0.04em',
    fontFamily: 'var(--font-heading)',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: '1.05rem',
    margin: '0 0 2.2rem',
    lineHeight: 1.7,
  },
  floatingFoods: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
  },

  /* ── Right Panel ─────────────────────────── */
  rightPanel: {
    flex: '1 0 52%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'var(--background)',
    overflowY: 'auto',
  },
  formCard: {
    width: '100%',
    maxWidth: '440px',
    background: '#ffffff',
    borderRadius: '20px',
    padding: '2.5rem',
    boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
    border: '1px solid var(--border-light)',
  },
  mobileLogo: {
    display: 'none',
    alignItems: 'center',
    gap: '0.4rem',
    marginBottom: '1.8rem',
  },
  mobileLogoText: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.5rem',
    fontWeight: 900,
    color: 'var(--primary)',
  },
  formTitle: {
    margin: '0 0 0.3rem',
    fontSize: '1.75rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    fontFamily: 'var(--font-heading)',
  },
  formSub: {
    margin: '0 0 1.8rem',
    color: 'var(--text-muted)',
    fontSize: '0.92rem',
    lineHeight: 1.5,
  },

  /* ── Status Boxes ─────────────────────────── */
  errorBox: {
    background: '#FFF2F3',
    border: '1px solid rgba(226, 55, 68, 0.2)',
    color: 'var(--primary-dark)',
    padding: '0.8rem 1rem',
    borderRadius: '12px',
    fontSize: '0.88rem',
    marginBottom: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 500,
  },
  errorIcon: { fontSize: '1rem', flexShrink: 0 },
  
  successBox: {
    background: 'var(--success-bg)',
    border: '1px solid rgba(27, 166, 114, 0.2)',
    color: 'var(--success-dark)',
    padding: '0.8rem 1rem',
    borderRadius: '12px',
    fontSize: '0.88rem',
    marginBottom: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 500,
  },
  successIcon: { fontSize: '1rem', flexShrink: 0 },

  /* ── Form ─────────────────────────────────── */
  form: { display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    fontSize: '0.9rem',
    opacity: 0.5,
    pointerEvents: 'none',
  },
  input: {
    padding: '0.85rem 1rem 0.85rem 2.6rem',
    borderRadius: '12px',
    border: '1.5px solid var(--border)',
    fontSize: '0.95rem',
    background: '#FAFAFA',
    width: '100%',
    fontFamily: 'var(--font-body)',
    color: 'var(--text-main)',
    transition: 'all 0.25s',
  },
  submitBtn: {
    padding: '0.95rem',
    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    boxShadow: 'var(--shadow-primary)',
    marginTop: '0.3rem',
    letterSpacing: '0.01em',
    transition: 'all 0.3s',
  },

  /* ── Divider ──────────────────────────────── */
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    margin: '1.5rem 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'var(--border)',
  },
  dividerText: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    whiteSpace: 'nowrap',
    fontWeight: 500,
  },

  /* ── Back to Login Button ────────────────── */
  loginBtn: {
    display: 'block',
    textAlign: 'center',
    padding: '0.85rem',
    border: '1.5px solid var(--border)',
    borderRadius: '12px',
    color: 'var(--text-main)',
    fontWeight: 600,
    fontSize: '0.95rem',
    transition: 'all 0.25s',
    background: '#FAFAFA',
    textDecoration: 'none',
  },
};
