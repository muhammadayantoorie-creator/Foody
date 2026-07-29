import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { InlineSpinner } from '../components/LoadingSpinner';
import * as THREE from 'three';
import { Mail, Lock, Eye, EyeOff, Zap, MapPin, BadgeCheck, ArrowRight } from 'lucide-react';

function LoginHeroCanvas() {
  const mountRef = useRef(null);
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 12;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const red = new THREE.PointLight(0xe23744, 5, 30);
    red.position.set(5, 8, 5);
    scene.add(red);
    const orange = new THREE.PointLight(0xff6b35, 4, 25);
    orange.position.set(-6, -5, 6);
    scene.add(orange);

    const geos = [
      new THREE.TorusGeometry(1.8, 0.5, 12, 80),
      new THREE.OctahedronGeometry(1.2, 0),
      new THREE.IcosahedronGeometry(1.0, 1),
      new THREE.DodecahedronGeometry(1.1, 0),
      new THREE.SphereGeometry(0.9, 24, 24),
    ];
    const colors = [0xe23744, 0xff6b35, 0xf5a623, 0x1ba672, 0x7c3aed];
    const meshes = geos.map((geo, i) => {
      const mat = new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.25, metalness: 0.5, wireframe: i % 2 === 0 });
      const mesh = new THREE.Mesh(geo, mat);
      const a = (i / geos.length) * Math.PI * 2;
      mesh.position.set(Math.cos(a) * 7, Math.sin(a) * 4, (Math.random() - 0.5) * 4);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      scene.add(mesh);
      return { mesh, rx: (Math.random() - 0.5) * 0.012, ry: (Math.random() - 0.5) * 0.012, fo: Math.random() * Math.PI * 2 };
    });

    // Particle field
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(150 * 3);
    for (let i = 0; i < 150 * 3; i++) pPos[i] = (Math.random() - 0.5) * 30;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    const onMouse = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / container.clientWidth - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / container.clientHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse);

    const clock = new THREE.Clock();
    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;
      camera.position.x = targetX * 2;
      camera.position.y = -targetY * 1.5;
      camera.lookAt(scene.position);
      meshes.forEach(({ mesh, rx, ry, fo }) => {
        mesh.rotation.x += rx;
        mesh.rotation.y += ry;
        mesh.position.y += Math.sin(t * 2 + fo) * 0.003;
      });
      particles.rotation.y = t * 0.015;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container) return;
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

export default function Login() {
  const { signIn, user, role } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const justSignedIn = useRef(false);

  useEffect(() => {
    if (justSignedIn.current && user && role) {
      justSignedIn.current = false;
      if (role === 'Admin') navigate('/admin');
      else if (role === 'Delivery Rider') navigate('/rider');
      else navigate('/dashboard');
    }
  }, [user, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      justSignedIn.current = true;
      await signIn(email, password);
    } catch (err) {
      justSignedIn.current = false;
      let msg = err.message || 'Login failed. Check your credentials.';
      if (msg.toLowerCase().includes('invalid login credentials')) msg = 'Incorrect email or password. Please try again.';
      else if (msg.toLowerCase().includes('email not confirmed')) msg = 'Please check your inbox and confirm your email before signing in.';
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <div style={S.page}>
      {/* Left Panel — 3D Hero Visual */}
      <div style={S.leftPanel} className="auth-left-panel">
        <LoginHeroCanvas />
        <div style={S.leftOverlay} />
        <div style={S.leftContent}>
          <div style={S.logoRow} className="animate-fade-up">
            <img src="/images/logo.png" alt="FoodDash Logo" style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 8px 20px rgba(226,55,68,0.4)', flexShrink: 0 }} />
            <h1 style={S.brand}>FoodDash</h1>
            <span style={S.enterpriseBadge}>ENTERPRISE</span>
          </div>

          <h2 style={S.heroText} className="animate-hero-text">
            Culinary<br />
            <span style={{ background: 'linear-gradient(135deg, #ff6b35, #f5a623)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Excellence</span><br />
            Delivered
          </h2>
          <p style={S.heroSub} className="animate-fade-up stagger-2">
            Order from hundreds of top restaurants with live 3D tracking and lightning-fast delivery.
          </p>

          <div style={S.trustRow} className="animate-fade-up stagger-3">
            {[
              { icon: <Zap size={14} color="#f5a623" />, text: '20-min delivery' },
              { icon: <MapPin size={14} color="#e23744" />, text: 'Live GPS tracking' },
              { icon: <BadgeCheck size={14} color="#1ba672" />, text: 'Verified restaurants' },
            ].map((b, i) => (
              <div key={i} style={S.trustBadge}>
                {b.icon}
                <span style={S.trustText}>{b.text}</span>
              </div>
            ))}
          </div>

          {/* Animated stat cards */}
          <div style={S.statsRow} className="animate-fade-up stagger-4">
            {[
              { num: '50K+', label: 'Happy Customers' },
              { num: '2K+', label: 'Restaurants' },
              { num: '4.9★', label: 'App Rating' },
            ].map((stat, i) => (
              <div key={i} style={S.statCard}>
                <div style={S.statNum}>{stat.num}</div>
                <div style={S.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div style={S.rightPanel}>
        <div style={S.formCard} className="animate-scale-in">
          {/* Mobile logo */}
          <div style={S.mobileLogo}>
            <span style={{ fontSize: '1.8rem' }}>🍔</span>
            <span style={S.mobileLogoText}>FoodDash Enterprise</span>
          </div>

          <div style={S.formHeader}>
            <h2 style={S.formTitle}>Welcome back 👋</h2>
            <p style={S.formSub}>Sign in to your enterprise account</p>
          </div>

          {error && (
            <div style={S.errorBox} className="animate-slide-down">
              <span style={S.errorIcon}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={S.form}>
            {/* Email Field */}
            <div style={S.fieldGroup}>
              <label style={S.label}>Email Address</label>
              <div style={{ ...S.inputWrap, ...(focusedField === 'email' ? S.inputWrapFocused : {}) }}>
                <Mail size={16} color={focusedField === 'email' ? 'var(--primary)' : '#94a3b8'} style={{ position: 'absolute', left: '14px', transition: 'color 0.2s' }} />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={S.input}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={S.fieldGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={S.label}>Password</label>
                <Link to="/forgot-password" style={S.forgotLink}>Forgot password?</Link>
              </div>
              <div style={{ ...S.inputWrap, ...(focusedField === 'password' ? S.inputWrapFocused : {}) }}>
                <Lock size={16} color={focusedField === 'password' ? 'var(--primary)' : '#94a3b8'} style={{ position: 'absolute', left: '14px', transition: 'color 0.2s' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={S.input}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={S.eyeBtn} aria-label="Toggle password visibility">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ ...S.submitBtn, opacity: loading ? 0.85 : 1 }} className={!loading ? 'animate-pulse-glow' : ''}>
              {loading
                ? <><InlineSpinner size={18} color="white" /> Signing in...</>
                : <><span>Sign In to Enterprise Suite</span><ArrowRight size={18} /></>
              }
            </button>
          </form>

          <div style={S.divider}>
            <span style={S.dividerLine} />
            <span style={S.dividerText}>New to FoodDash?</span>
            <span style={S.dividerLine} />
          </div>

          <Link to="/signup" style={S.signupBtn}>
            Create Enterprise Account
          </Link>

          <p style={S.footerNote}>
            By signing in, you agree to our{' '}
            <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Terms</span>
            {' '}and{' '}
            <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-body)', background: '#0f172a' },

  leftPanel: {
    flex: '1 0 50%',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
  },
  leftOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(160deg, rgba(226,55,68,0.1) 0%, transparent 50%, rgba(124,58,237,0.08) 100%)',
    zIndex: 2,
  },
  leftContent: { maxWidth: '440px', position: 'relative', zIndex: 10 },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2.5rem' },
  logoIconWrap: {
    width: '44px', height: '44px',
    background: 'linear-gradient(135deg, #e23744, #ff6b35)',
    borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(226,55,68,0.4)',
  },
  brand: { margin: 0, color: '#ffffff', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em', fontFamily: 'var(--font-heading)' },
  enterpriseBadge: {
    fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.08em',
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    color: '#fff', padding: '3px 8px', borderRadius: '4px',
  },
  heroText: {
    color: '#ffffff', fontSize: '3rem', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.1,
    letterSpacing: '-0.04em', fontFamily: 'var(--font-heading)',
  },
  heroSub: { color: 'rgba(255,255,255,0.6)', fontSize: '1rem', margin: '0 0 2rem', lineHeight: 1.7 },
  trustRow: { display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '2rem' },
  trustBadge: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50px',
    padding: '6px 12px',
  },
  trustText: { color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', fontWeight: 600 },
  statsRow: { display: 'flex', gap: '1rem' },
  statCard: {
    flex: 1, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
    padding: '1rem', textAlign: 'center',
  },
  statNum: { color: '#ffffff', fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-heading)' },
  statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontWeight: 600, marginTop: '2px' },

  /* Right Panel */
  rightPanel: {
    flex: '1 0 50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem', background: '#f8fafc', overflowY: 'auto',
  },
  formCard: {
    width: '100%', maxWidth: '460px',
    background: '#ffffff', borderRadius: '24px', padding: '2.8rem',
    boxShadow: '0 24px 64px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
  },
  mobileLogo: { display: 'none', alignItems: 'center', gap: '0.4rem', marginBottom: '1.8rem' },
  mobileLogoText: { fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)' },
  formHeader: { marginBottom: '1.8rem' },
  formTitle: { margin: '0 0 0.3rem', fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)' },
  formSub: { margin: 0, color: '#64748b', fontSize: '0.92rem' },

  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
    padding: '0.8rem 1rem', borderRadius: '12px', fontSize: '0.88rem',
    marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500,
  },
  errorIcon: { fontSize: '1rem', flexShrink: 0 },

  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' },
  inputWrap: {
    position: 'relative', display: 'flex', alignItems: 'center',
    border: '1.5px solid #e2e8f0', borderRadius: '12px',
    background: '#f8fafc', transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputWrapFocused: {
    borderColor: 'var(--primary)',
    boxShadow: '0 0 0 3px rgba(226,55,68,0.1)',
    background: '#ffffff',
  },
  input: {
    padding: '0.9rem 1rem 0.9rem 2.8rem',
    border: 'none', background: 'transparent', outline: 'none',
    fontSize: '0.95rem', width: '100%', fontFamily: 'var(--font-body)', color: '#0f172a',
  },
  eyeBtn: {
    position: 'absolute', right: '12px', background: 'none', border: 'none',
    color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center',
  },
  submitBtn: {
    padding: '1rem', background: 'linear-gradient(135deg, #E23744, #CB202D)',
    color: 'white', border: 'none', borderRadius: '14px', fontSize: '0.95rem',
    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '0.5rem',
    boxShadow: '0 8px 24px rgba(226,55,68,0.35)', letterSpacing: '0.01em',
    transition: 'all 0.3s', marginTop: '0.3rem',
  },
  forgotLink: { color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 },
  divider: { display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '1.5rem 0' },
  dividerLine: { flex: 1, height: '1px', background: '#e2e8f0' },
  dividerText: { color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap', fontWeight: 500 },
  signupBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0.9rem', border: '1.5px solid #e2e8f0', borderRadius: '14px',
    color: '#334155', fontWeight: 600, fontSize: '0.95rem', transition: 'all 0.25s', background: '#f8fafc',
    textDecoration: 'none',
  },
  footerNote: { textAlign: 'center', color: '#94a3b8', fontSize: '0.76rem', margin: '1.2rem 0 0', lineHeight: 1.6 },
};
