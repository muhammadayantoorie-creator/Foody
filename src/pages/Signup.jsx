import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { InlineSpinner } from '../components/LoadingSpinner';
import * as THREE from 'three';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, ArrowRight, ShoppingCart, Settings, Bike } from 'lucide-react';

function SignupHeroCanvas() {
  const mountRef = useRef(null);
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 14;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light1 = new THREE.PointLight(0x1ba672, 5, 30); light1.position.set(6, 6, 6); scene.add(light1);
    const light2 = new THREE.PointLight(0xff6b35, 4, 25); light2.position.set(-6, -4, 8); scene.add(light2);
    const light3 = new THREE.PointLight(0x6366f1, 3, 20); light3.position.set(0, -8, 4); scene.add(light3);

    const shapes = [
      new THREE.TorusKnotGeometry(1.4, 0.4, 80, 12),
      new THREE.IcosahedronGeometry(1.2, 1),
      new THREE.OctahedronGeometry(1.0),
      new THREE.SphereGeometry(0.9, 20, 20),
      new THREE.DodecahedronGeometry(1.1),
    ];
    const colors = [0x1ba672, 0x6366f1, 0xff6b35, 0xf5a623, 0xe23744];
    const meshes = shapes.map((geo, i) => {
      const mat = new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.2, metalness: 0.55, wireframe: i < 2 });
      const mesh = new THREE.Mesh(geo, mat);
      const a = (i / shapes.length) * Math.PI * 2;
      mesh.position.set(Math.cos(a) * 8, Math.sin(a) * 5, (Math.random() - 0.5) * 5);
      scene.add(mesh);
      return { mesh, rx: (Math.random() - 0.5) * 0.01, ry: (Math.random() - 0.5) * 0.01, fo: Math.random() * Math.PI * 2 };
    });

    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(120 * 3);
    for (let i = 0; i < 120 * 3; i++) pPos[i] = (Math.random() - 0.5) * 28;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.1, transparent: true, opacity: 0.5 }));
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
      camera.position.x = tx * 2; camera.position.y = -ty * 1.5;
      camera.lookAt(scene.position);
      meshes.forEach(({ mesh, rx, ry, fo }) => {
        mesh.rotation.x += rx; mesh.rotation.y += ry;
        mesh.position.y += Math.sin(t * 1.8 + fo) * 0.003;
      });
      particles.rotation.x = t * 0.01;
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

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState('Customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [focused, setFocused] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (!fullName.trim()) { setError('Full name is required.'); return; }
    setLoading(true);
    try {
      await signUp(email, password, role, fullName.trim());
      setMessage('Account created! Check your email to confirm, then sign in.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) { setError(err.message); }
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
    { value: 'Customer', icon: <ShoppingCart size={22} />, label: 'Customer', desc: 'Order food' },
    { value: 'Admin', icon: <Settings size={22} />, label: 'Admin', desc: 'Manage platform' },
    { value: 'Delivery Rider', icon: <Bike size={22} />, label: 'Rider', desc: 'Deliver orders' },
  ];

  const inputWrap = (field) => ({
    ...S.inputWrap,
    ...(focused === field ? S.inputWrapFocused : {}),
  });

  return (
    <div style={S.page}>
      {/* Left branding panel */}
      <div style={S.leftPanel} className="auth-left-panel">
        <SignupHeroCanvas />
        <div style={S.leftOverlay} />
        <div style={S.leftContent}>
          <div style={S.logoRow} className="animate-fade-up">
            <img src="/images/logo.png" alt="FoodDash Logo" style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 8px 20px rgba(27,166,114,0.4)', flexShrink: 0 }} />
            <h1 style={S.brand}>FoodDash</h1>
            <span style={S.enterpriseBadge}>ENTERPRISE</span>
          </div>
          <h2 style={S.heroText} className="animate-hero-text">
            Your<br />
            <span style={{ background: 'linear-gradient(135deg, #1ba672, #38ef7d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Food Journey</span><br />
            Starts Here
          </h2>
          <p style={S.heroSub} className="animate-fade-up stagger-2">
            Join thousands of customers, admins, and riders on our enterprise delivery network.
          </p>
          <div style={S.statsRow} className="animate-fade-up stagger-3">
            {[
              { num: '50K+', label: 'Customers' },
              { num: '2K+', label: 'Restaurants' },
              { num: '20 min', label: 'Avg Delivery' },
            ].map((s, i) => (
              <div key={i} style={S.statCard}>
                <div style={S.statNum}>{s.num}</div>
                <div style={S.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={S.rightPanel}>
        <div style={S.card} className="animate-scale-in">
          <div style={S.formHeader}>
            <h2 style={S.title}>Create your account</h2>
            <p style={S.subtitle}>Join FoodDash Enterprise and start ordering 🎉</p>
          </div>

          {error && <div style={S.errorBox} className="animate-slide-down"><span>⚠️</span> {error}</div>}
          {message && (
            <div style={S.successBox} className="animate-slide-down">
              <CheckCircle size={18} color="#1BA672" /><span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={S.form}>
            {/* Full Name */}
            <div style={S.fieldGroup}>
              <label style={S.label}>Full Name</label>
              <div style={inputWrap('name')}>
                <User size={16} color={focused === 'name' ? 'var(--primary)' : '#94a3b8'} style={{ position: 'absolute', left: 14 }} />
                <input type="text" placeholder="Ali Khan" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} required style={S.input} />
              </div>
            </div>

            {/* Email */}
            <div style={S.fieldGroup}>
              <label style={S.label}>Email Address</label>
              <div style={inputWrap('email')}>
                <Mail size={16} color={focused === 'email' ? 'var(--primary)' : '#94a3b8'} style={{ position: 'absolute', left: 14 }} />
                <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} required style={S.input} />
              </div>
            </div>

            {/* Password */}
            <div style={S.fieldGroup}>
              <label style={S.label}>Password</label>
              <div style={inputWrap('password')}>
                <Lock size={16} color={focused === 'password' ? 'var(--primary)' : '#94a3b8'} style={{ position: 'absolute', left: 14 }} />
                <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" value={password}
                  onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} required style={S.input} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={S.eyeBtn}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {password && (
                <div style={S.strengthWrap}>
                  <div style={S.strengthTrack}>
                    <div style={{ ...S.strengthFill, width: `${strength.level * 25}%`, background: strength.color }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={S.fieldGroup}>
              <label style={S.label}>Confirm Password</label>
              <div style={inputWrap('confirm')}>
                <Lock size={16} color={focused === 'confirm' ? 'var(--primary)' : '#94a3b8'} style={{ position: 'absolute', left: 14 }} />
                <input type="password" placeholder="Re-enter password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)} required style={S.input} />
                {confirmPassword && (
                  <span style={{ position: 'absolute', right: 14, color: password === confirmPassword ? '#1BA672' : '#E23744' }}>
                    {password === confirmPassword ? <CheckCircle size={16} /> : '✕'}
                  </span>
                )}
              </div>
            </div>

            {/* Role selector */}
            <div style={S.fieldGroup}>
              <label style={S.label}>Join as...</label>
              <div style={S.roleGrid}>
                {roles.map(r => {
                  const isActive = role === r.value;
                  return (
                    <button type="button" key={r.value} onClick={() => setRole(r.value)}
                      style={{ ...S.roleCard, ...(isActive ? S.roleCardActive : {}) }}>
                      <span style={{ color: isActive ? 'white' : '#64748b', transition: 'color 0.2s' }}>{r.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: isActive ? 'white' : 'var(--text-main)' }}>{r.label}</span>
                      <span style={{ fontSize: '0.68rem', color: isActive ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)', lineHeight: 1.3, textAlign: 'center' }}>{r.desc}</span>
                      {isActive && <span style={S.roleCheck}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ ...S.button, opacity: loading ? 0.85 : 1 }} className="animate-pulse-glow">
              {loading
                ? <><InlineSpinner size={18} color="white" /> Creating account...</>
                : <><span>Create Enterprise Account</span><ArrowRight size={18} /></>
              }
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
  page: { display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-body)', background: '#0f172a' },

  leftPanel: {
    flex: '1 0 42%', position: 'relative', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
  },
  leftOverlay: {
    position: 'absolute', inset: 0, zIndex: 2,
    background: 'linear-gradient(160deg, rgba(27,166,114,0.08) 0%, transparent 50%, rgba(99,102,241,0.08) 100%)',
  },
  leftContent: { maxWidth: '420px', position: 'relative', zIndex: 10 },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2.5rem' },
  logoIconWrap: {
    width: '44px', height: '44px',
    background: 'linear-gradient(135deg, #1ba672, #38ef7d)',
    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(27,166,114,0.4)',
  },
  brand: { margin: 0, color: '#ffffff', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em', fontFamily: 'var(--font-heading)' },
  enterpriseBadge: {
    fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.08em',
    background: 'linear-gradient(135deg, #1ba672, #6366f1)',
    color: '#fff', padding: '3px 8px', borderRadius: '4px',
  },
  heroText: {
    color: '#ffffff', fontSize: '2.8rem', fontWeight: 900, margin: '0 0 1rem',
    lineHeight: 1.1, letterSpacing: '-0.04em', fontFamily: 'var(--font-heading)',
  },
  heroSub: { color: 'rgba(255,255,255,0.6)', fontSize: '1rem', margin: '0 0 2rem', lineHeight: 1.7 },
  statsRow: { display: 'flex', gap: '1rem' },
  statCard: {
    flex: 1, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
    padding: '1rem', textAlign: 'center',
  },
  statNum: { color: '#ffffff', fontSize: '1.3rem', fontWeight: 900, fontFamily: 'var(--font-heading)' },
  statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 600, marginTop: '2px' },

  rightPanel: {
    flex: '1 0 58%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem', background: '#f8fafc', overflowY: 'auto',
  },
  card: {
    width: '100%', maxWidth: '480px', background: '#ffffff', borderRadius: '24px',
    padding: '2.4rem', boxShadow: '0 24px 64px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0', margin: '1rem 0',
  },
  formHeader: { marginBottom: '1.6rem' },
  title: { margin: '0 0 0.3rem', fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)' },
  subtitle: { margin: 0, color: '#64748b', fontSize: '0.9rem' },

  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
    padding: '0.8rem 1rem', borderRadius: '12px', fontSize: '0.88rem',
    marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500,
  },
  successBox: {
    background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d',
    padding: '0.8rem 1rem', borderRadius: '12px', fontSize: '0.88rem',
    marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500,
  },

  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  label: { fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' },
  inputWrap: {
    position: 'relative', display: 'flex', alignItems: 'center',
    border: '1.5px solid #e2e8f0', borderRadius: '12px',
    background: '#f8fafc', transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputWrapFocused: {
    borderColor: 'var(--primary)', boxShadow: '0 0 0 3px rgba(226,55,68,0.1)', background: '#ffffff',
  },
  input: {
    padding: '0.85rem 1rem 0.85rem 2.8rem', border: 'none', background: 'transparent',
    outline: 'none', fontSize: '0.93rem', width: '100%', fontFamily: 'var(--font-body)', color: '#0f172a',
  },
  eyeBtn: {
    position: 'absolute', right: '12px', background: 'none', border: 'none',
    color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center',
  },
  strengthWrap: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' },
  strengthTrack: { flex: 1, height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: '2px', transition: 'width 0.4s, background 0.4s' },

  roleGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginTop: '0.3rem' },
  roleCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
    padding: '0.9rem 0.4rem', borderRadius: '14px', border: '1.5px solid #e2e8f0',
    background: '#f8fafc', cursor: 'pointer', transition: 'all 0.25s',
    position: 'relative', overflow: 'hidden',
  },
  roleCardActive: {
    background: 'linear-gradient(135deg, #E23744, #FF6B35)',
    border: '1.5px solid transparent', color: 'white',
    boxShadow: '0 8px 24px rgba(226, 55, 68, 0.35)', transform: 'scale(1.03)',
  },
  roleCheck: {
    position: 'absolute', top: '6px', right: '8px',
    width: '18px', height: '18px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.3)', color: 'white',
    fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  button: {
    padding: '1rem', background: 'linear-gradient(135deg, #E23744, #CB202D)',
    color: 'white', border: 'none', borderRadius: '14px', fontSize: '0.95rem',
    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    boxShadow: '0 8px 24px rgba(226, 55, 68, 0.35)', marginTop: '0.3rem', transition: 'all 0.3s',
  },
  footerText: { marginTop: '1.5rem', textAlign: 'center', fontSize: '0.88rem', color: '#64748b' },
  link: { color: 'var(--primary)', fontWeight: 700 },
};
