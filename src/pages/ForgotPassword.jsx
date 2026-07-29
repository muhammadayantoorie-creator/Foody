import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { InlineSpinner } from '../components/LoadingSpinner';
import * as THREE from 'three';
import { Mail, ArrowLeft, CheckCircle, Lock } from 'lucide-react';

function ForgotCanvas() {
  const mountRef = useRef(null);
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 10;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const light1 = new THREE.PointLight(0x6366f1, 5, 25); light1.position.set(5, 5, 5); scene.add(light1);
    const light2 = new THREE.PointLight(0xa855f7, 4, 20); light2.position.set(-5, -4, 5); scene.add(light2);

    // Lock icon geometry: torus + cylinder
    const lockBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 2.2, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.3, metalness: 0.6 })
    );
    const lockShackle = new THREE.Mesh(
      new THREE.TorusGeometry(0.9, 0.18, 10, 40, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.3, metalness: 0.7 })
    );
    lockShackle.position.y = 1.4;
    lockShackle.rotation.z = Math.PI;

    const lockGroup = new THREE.Group();
    lockGroup.add(lockBody);
    lockGroup.add(lockShackle);
    scene.add(lockGroup);

    // Surrounding particles
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(100 * 3);
    for (let i = 0; i < 300; i++) pPos[i] = (Math.random() - 0.5) * 20;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x818cf8, size: 0.08, transparent: true, opacity: 0.6 }));
    scene.add(particles);

    let mx = 0, my = 0, tx = 0, ty = 0;
    const onMouse = (e) => {
      const r = container.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse);
    const clock = new THREE.Clock();
    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      tx += (mx - tx) * 0.04; ty += (my - ty) * 0.04;
      camera.position.x = tx * 1.5; camera.position.y = -ty;
      camera.lookAt(scene.position);
      lockGroup.rotation.y = Math.sin(t * 0.5) * 0.3;
      lockGroup.position.y = Math.sin(t * 1.2) * 0.15;
      particles.rotation.y = t * 0.02;
      renderer.render(scene, camera);
    };
    animate();
    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);
  return <div ref={mountRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }} />;
}

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage('Check your inbox — a secure reset link has been sent.');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={S.page}>
      {/* Left: 3D Canvas */}
      <div style={S.leftPanel} className="auth-left-panel">
        <ForgotCanvas />
        <div style={S.leftOverlay} />
        <div style={S.leftContent}>
          <div style={S.logoRow} className="animate-fade-up">
            <div style={S.logoIconWrap}><span style={{ fontSize: '1.5rem' }}>🍔</span></div>
            <h1 style={S.brand}>FoodDash</h1>
            <span style={S.enterpriseBadge}>ENTERPRISE</span>
          </div>
          <h2 style={S.heroText} className="animate-hero-text">
            Secure<br />
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Account</span><br />
            Recovery
          </h2>
          <p style={S.heroSub} className="animate-fade-up stagger-2">
            Enter your registered email address and we'll send you a secure link to restore your enterprise access.
          </p>
          <div style={S.securityRow} className="animate-fade-up stagger-3">
            {[
              { icon: '🔐', text: 'End-to-end encrypted' },
              { icon: '⏱️', text: 'Link expires in 1 hour' },
              { icon: '📧', text: 'Verified email only' },
            ].map((b, i) => (
              <div key={i} style={S.securityBadge}>
                <span style={{ fontSize: '0.9rem' }}>{b.icon}</span>
                <span style={S.securityText}>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div style={S.rightPanel}>
        <div style={S.formCard} className="animate-scale-in">
          <div style={S.iconCircle}>
            <Lock size={28} color="#6366f1" />
          </div>

          <h2 style={S.formTitle}>Reset your password</h2>
          <p style={S.formSub}>Enter your email address and we'll send you a recovery link</p>

          {error && (
            <div style={S.errorBox} className="animate-slide-down">
              <span>⚠️</span> {error}
            </div>
          )}

          {message ? (
            <div style={S.successCard} className="animate-scale-in">
              <CheckCircle size={40} color="#1BA672" style={{ marginBottom: '0.8rem' }} />
              <h3 style={S.successTitle}>Email Sent!</h3>
              <p style={S.successDesc}>{message}</p>
              <p style={S.successHint}>Didn't get it? Check your spam folder or try again.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={S.form}>
              <div style={S.fieldGroup}>
                <label style={S.label}>Email Address</label>
                <div style={{ ...S.inputWrap, ...(focused ? S.inputWrapFocused : {}) }}>
                  <Mail size={16} color={focused ? '#6366f1' : '#94a3b8'} style={{ position: 'absolute', left: 14, transition: 'color 0.2s' }} />
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    required
                    style={S.input}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ ...S.submitBtn, opacity: loading ? 0.85 : 1 }}
              >
                {loading
                  ? <><InlineSpinner size={18} color="white" /> Sending secure link...</>
                  : <><Mail size={16} /><span>Send Reset Link</span></>
                }
              </button>
            </form>
          )}

          <div style={S.backRow}>
            <Link to="/login" style={S.backLink}>
              <ArrowLeft size={15} />
              <span>Back to Sign In</span>
            </Link>
            <Link to="/signup" style={S.signupLink}>Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-body)', background: '#0f172a' },

  leftPanel: {
    flex: '1 0 48%', position: 'relative', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
  },
  leftOverlay: {
    position: 'absolute', inset: 0, zIndex: 2,
    background: 'linear-gradient(160deg, rgba(99,102,241,0.1) 0%, transparent 50%, rgba(168,85,247,0.08) 100%)',
  },
  leftContent: { maxWidth: '400px', position: 'relative', zIndex: 10 },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2.5rem' },
  logoIconWrap: {
    width: '44px', height: '44px',
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(99,102,241,0.4)',
  },
  brand: { margin: 0, color: '#ffffff', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em', fontFamily: 'var(--font-heading)' },
  enterpriseBadge: {
    fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.08em',
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    color: '#fff', padding: '3px 8px', borderRadius: '4px',
  },
  heroText: {
    color: '#ffffff', fontSize: '2.8rem', fontWeight: 900, margin: '0 0 1rem',
    lineHeight: 1.1, letterSpacing: '-0.04em', fontFamily: 'var(--font-heading)',
  },
  heroSub: { color: 'rgba(255,255,255,0.6)', fontSize: '1rem', margin: '0 0 2rem', lineHeight: 1.7 },
  securityRow: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  securityBadge: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '8px 14px',
  },
  securityText: { color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', fontWeight: 600 },

  rightPanel: {
    flex: '1 0 52%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem', background: '#f8fafc', overflowY: 'auto',
  },
  formCard: {
    width: '100%', maxWidth: '440px', background: '#ffffff', borderRadius: '24px',
    padding: '2.8rem', boxShadow: '0 24px 64px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column', alignItems: 'stretch',
  },
  iconCircle: {
    width: '72px', height: '72px',
    background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
    borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '1.5rem', border: '1px solid #c7d2fe',
    boxShadow: '0 8px 24px rgba(99,102,241,0.15)',
    alignSelf: 'flex-start',
  },
  formTitle: { margin: '0 0 0.3rem', fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)' },
  formSub: { margin: '0 0 1.6rem', color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5 },

  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
    padding: '0.8rem 1rem', borderRadius: '12px', fontSize: '0.88rem',
    marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500,
  },

  successCard: {
    textAlign: 'center', padding: '1.5rem',
    background: '#f0fdf4', borderRadius: '16px', border: '1px solid #bbf7d0',
    display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem',
  },
  successTitle: { fontSize: '1.3rem', fontWeight: 800, color: '#15803d', margin: '0 0 0.5rem', fontFamily: 'var(--font-heading)' },
  successDesc: { color: '#166534', fontSize: '0.9rem', margin: '0 0 0.8rem', lineHeight: 1.6 },
  successHint: { color: '#4ade80', fontSize: '0.78rem', margin: 0, fontStyle: 'italic' },

  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' },
  inputWrap: {
    position: 'relative', display: 'flex', alignItems: 'center',
    border: '1.5px solid #e2e8f0', borderRadius: '12px',
    background: '#f8fafc', transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputWrapFocused: {
    borderColor: '#6366f1', boxShadow: '0 0 0 3px rgba(99,102,241,0.12)', background: '#ffffff',
  },
  input: {
    padding: '0.9rem 1rem 0.9rem 2.8rem', border: 'none', background: 'transparent',
    outline: 'none', fontSize: '0.95rem', width: '100%', fontFamily: 'var(--font-body)', color: '#0f172a',
  },
  submitBtn: {
    padding: '1rem', background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    color: 'white', border: 'none', borderRadius: '14px', fontSize: '0.95rem',
    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '0.5rem',
    boxShadow: '0 8px 24px rgba(99,102,241,0.35)', transition: 'all 0.3s',
  },

  backRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid #f1f5f9',
  },
  backLink: {
    display: 'flex', alignItems: 'center', gap: '6px',
    color: '#64748b', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none',
  },
  signupLink: {
    color: '#6366f1', fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none',
  },
};
