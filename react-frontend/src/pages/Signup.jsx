import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { InlineSpinner } from '../components/LoadingSpinner';

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, role, fullName.trim());
      setMessage('Account created! Check your email to confirm, then sign in.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    if (password.length < 6) return { level: 1, label: 'Weak', color: '#E23744' };
    if (password.length < 8) return { level: 2, label: 'Fair', color: '#DB7C0E' };
    if (/(?=.*[A-Z])(?=.*[0-9])/.test(password)) return { level: 4, label: 'Strong', color: '#1BA672' };
    return { level: 3, label: 'Good', color: '#F5A623' };
  };

  const strength = getPasswordStrength();

  const roles = [
    { value: 'Customer', icon: '🛒', label: 'Customer', desc: 'Browse menus & order food' },
    { value: 'Admin', icon: '⚙️', label: 'Admin', desc: 'Manage the platform' },
    { value: 'Delivery Rider', icon: '🛵', label: 'Rider', desc: 'Deliver orders fast' },
  ];

  return (
    <div style={S.page}>
      {/* Left branding panel */}
      <div style={S.leftPanel}>
        <div style={S.leftBgImg} />
        <div style={S.leftOverlay} />
        <div style={S.leftContent}>
          <div style={S.logoRow} className="animate-fade-up">
            <span style={{ fontSize: '2.2rem' }}>🍕</span>
            <h1 style={S.brand}>FoodDash</h1>
          </div>
          <h2 style={S.heroText} className="animate-hero-text">
            Your food journey<br />starts here
          </h2>
          <p style={S.heroSub} className="animate-fade-up stagger-2">
            Join thousands of customers already ordering their favourite meals. Fast delivery, real-time tracking, and a premium dining experience.
          </p>
          <div style={S.statsRow} className="animate-fade-up stagger-3">
            {[
              { num: '10K+', label: 'Happy Customers' },
              { num: '500+', label: 'Restaurants' },
              { num: '30m', label: 'Avg Delivery' },
            ].map(s => (
              <div key={s.label} style={S.statItem}>
                <span style={S.statNum}>{s.num}</span>
                <span style={S.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={S.rightPanel}>
        <div style={S.card} className="animate-scale-in">
          <h2 style={S.title}>Create your account</h2>
          <p style={S.subtitle}>Join FoodDash and start ordering 🎉</p>

          {error && (
            <div style={S.errorBox} className="animate-slide-down">
              <span>⚠️</span> {error}
            </div>
          )}
          {message && (
            <div style={S.successBox} className="animate-slide-down">
              <span>✅</span> {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={S.form}>
            {/* Full Name */}
            <div style={S.fieldGroup}>
              <label style={S.label}>Full Name</label>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>👤</span>
                <input
                  type="text"
                  placeholder="Ali Khan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  style={S.input}
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div style={S.fieldGroup}>
              <label style={S.label}>Password</label>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>🔒</span>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={S.input}
                />
              </div>
              {/* Password strength indicator */}
              {password && (
                <div style={S.strengthWrap}>
                  <div style={S.strengthTrack}>
                    <div style={{ ...S.strengthFill, width: `${strength.level * 25}%`, background: strength.color }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={S.fieldGroup}>
              <label style={S.label}>Confirm Password</label>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>🔒</span>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={S.input}
                />
                {confirmPassword && (
                  <span style={{ position: 'absolute', right: '14px', fontSize: '0.9rem' }}>
                    {password === confirmPassword ? '✅' : '❌'}
                  </span>
                )}
              </div>
            </div>

            {/* Role selector */}
            <div style={S.fieldGroup}>
              <label style={S.label}>I want to join as...</label>
              <div style={S.roleGrid}>
                {roles.map(r => {
                  const isActive = role === r.value;
                  return (
                    <button
                      type="button"
                      key={r.value}
                      onClick={() => setRole(r.value)}
                      style={{
                        ...S.roleCard,
                        ...(isActive ? S.roleCardActive : {}),
                      }}
                    >
                      <span style={{ fontSize: '1.6rem', transition: 'transform 0.2s', transform: isActive ? 'scale(1.15)' : 'scale(1)' }}>{r.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isActive ? 'white' : 'var(--text-main)' }}>{r.label}</span>
                      <span style={{ fontSize: '0.7rem', color: isActive ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)', lineHeight: 1.3 }}>{r.desc}</span>
                      {isActive && (
                        <span style={S.roleCheck}>✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ ...S.button, opacity: loading ? 0.85 : 1 }}>
              {loading ? <><InlineSpinner size={18} color="var(--text-on-primary)" /> Creating account...</> : 'Create Account →'}
            </button>
          </form>

          <p style={S.footerText}>
            Already have an account?{' '}
            <Link to="/login" style={S.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-body)' },
  
  /* ── Left Panel ──────────────────────────── */
  leftPanel: {
    flex: '1 0 42%',
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
    backgroundImage: `url('https://images.unsplash.com/photo-1543353071-087092ec169a?auto=format&fit=crop&w=1200&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'brightness(0.3)',
  },
  leftOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(160deg, rgba(28, 28, 46, 0.88) 0%, rgba(226, 55, 68, 0.2) 50%, rgba(28, 28, 46, 0.92) 100%)',
  },
  leftContent: {
    maxWidth: '420px',
    position: 'relative',
    zIndex: 1,
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' },
  brand: { margin: 0, color: 'white', fontSize: '1.7rem', fontWeight: 900, letterSpacing: '-0.03em', fontFamily: 'var(--font-heading)' },
  heroText: {
    color: 'white', fontSize: '2.6rem', fontWeight: 900,
    margin: '0 0 1rem', lineHeight: 1.1, letterSpacing: '-0.04em', fontFamily: 'var(--font-heading)',
  },
  heroSub: { color: 'rgba(255,255,255,0.6)', fontSize: '1rem', margin: '0 0 2.5rem', lineHeight: 1.7 },
  statsRow: {
    display: 'flex',
    gap: '1.5rem',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statNum: {
    color: '#ffffff',
    fontSize: '1.5rem',
    fontWeight: 900,
    fontFamily: 'var(--font-heading)',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: '0.72rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  /* ── Right Panel ─────────────────────────── */
  rightPanel: {
    flex: '1 0 58%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem', background: 'var(--background)', overflowY: 'auto',
  },
  card: {
    width: '100%', maxWidth: '460px', background: '#ffffff', borderRadius: '20px',
    padding: '2.2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
    border: '1px solid var(--border-light)', margin: '1rem 0',
  },
  title: { margin: '0 0 0.3rem', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' },
  subtitle: { margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.92rem' },

  errorBox: {
    background: '#FFF2F3', border: '1px solid rgba(226, 55, 68, 0.2)',
    color: 'var(--primary-dark)', padding: '0.75rem 1rem', borderRadius: '12px',
    fontSize: '0.88rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500,
  },
  successBox: {
    background: 'var(--success-bg)', border: '1px solid rgba(27, 166, 114, 0.2)',
    color: 'var(--success-dark)', padding: '0.75rem 1rem', borderRadius: '12px',
    fontSize: '0.88rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500,
  },

  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  label: { fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '14px', fontSize: '0.85rem', opacity: 0.5, pointerEvents: 'none' },
  input: {
    padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '12px',
    border: '1.5px solid var(--border)',
    fontSize: '0.93rem', background: '#FAFAFA', width: '100%',
    fontFamily: 'var(--font-body)', color: 'var(--text-main)', boxSizing: 'border-box',
  },

  strengthWrap: {
    display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem',
  },
  strengthTrack: {
    flex: 1, height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden',
  },
  strengthFill: {
    height: '100%', borderRadius: '2px', transition: 'width 0.3s, background 0.3s',
  },

  roleGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginTop: '0.3rem' },
  roleCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
    padding: '0.9rem 0.4rem', borderRadius: '14px', border: '1.5px solid var(--border)',
    background: '#FAFAFA', cursor: 'pointer', transition: 'all 0.25s',
    position: 'relative', overflow: 'hidden',
  },
  roleCardActive: {
    background: 'linear-gradient(135deg, #E23744, #FF6B35)',
    border: '1.5px solid transparent', color: 'white',
    boxShadow: '0 8px 24px rgba(226, 55, 68, 0.35)',
    transform: 'scale(1.03)',
  },
  roleCheck: {
    position: 'absolute', top: '6px', right: '8px',
    width: '18px', height: '18px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.3)',
    color: 'white', fontSize: '0.65rem', fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  button: {
    padding: '0.9rem', background: 'linear-gradient(135deg, #E23744, #CB202D)',
    color: 'white', border: 'none', borderRadius: '12px',
    fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    boxShadow: '0 8px 24px rgba(226, 55, 68, 0.35)', marginTop: '0.3rem',
  },
  footerText: { marginTop: '1.5rem', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' },
  link: { color: 'var(--primary)', fontWeight: 700 },
};
