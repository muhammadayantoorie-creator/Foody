import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { Home, ArrowLeft, Compass } from 'lucide-react';

function NotFoundCanvas() {
  const mountRef = useRef(null);
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 8;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const pl = new THREE.PointLight(0xe23744, 4, 20);
    pl.position.set(4, 4, 4);
    scene.add(pl);

    const torusGeo = new THREE.TorusGeometry(3, 0.3, 10, 60);
    const torusMat = new THREE.MeshStandardMaterial({ color: 0xe23744, roughness: 0.3, metalness: 0.5, wireframe: true });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    scene.add(torus);

    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(80 * 3);
    for (let i = 0; i < 80 * 3; i++) pPos[i] = (Math.random() - 0.5) * 18;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xff6b35, size: 0.08, transparent: true, opacity: 0.7 })));

    const clock = new THREE.Clock();
    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      torus.rotation.x = t * 0.4;
      torus.rotation.y = t * 0.25;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />;
}

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={S.page}>
      <NotFoundCanvas />

      <div style={S.card} className="animate-scale-in">
        <div style={S.codeWrap}>
          <span style={S.code}>4</span>
          <div style={S.plateEmoji}>
            <span style={{ fontSize: '3rem', animation: 'float 3s ease-in-out infinite', display: 'block' }}>🍕</span>
          </div>
          <span style={S.code}>4</span>
        </div>

        <h2 style={S.title}>Oops! This page went missing</h2>
        <p style={S.desc}>
          Looks like this slice of the internet got delivered to the wrong address.
          Let's get you back to the good stuff.
        </p>

        <div style={S.actions}>
          <button onClick={() => navigate('/dashboard')} style={S.primaryBtn}>
            <Home size={18} />
            <span>Back to Dashboard</span>
          </button>
          <button onClick={() => navigate(-1)} style={S.secondaryBtn}>
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </button>
        </div>

        <button onClick={() => navigate('/dashboard')} style={S.exploreBtn}>
          <Compass size={14} />
          <span>Browse all restaurants</span>
        </button>
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    fontFamily: 'var(--font-body)', position: 'relative', overflow: 'hidden', padding: '2rem',
  },
  card: {
    position: 'relative', zIndex: 10,
    background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '28px',
    padding: '3.5rem 3rem', textAlign: 'center', maxWidth: '500px', width: '100%',
    boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
  },
  codeWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' },
  code: {
    fontSize: '7rem', fontWeight: 900, fontFamily: 'var(--font-heading)',
    background: 'linear-gradient(135deg, #e23744, #ff6b35)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    lineHeight: 1, letterSpacing: '-0.05em',
  },
  plateEmoji: { width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: {
    fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1rem', fontFamily: 'var(--font-heading)',
  },
  desc: { color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.65, margin: '0 0 2rem' },
  actions: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' },
  primaryBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'linear-gradient(135deg, #E23744, #CB202D)', color: 'white',
    border: 'none', padding: '0.9rem 1.8rem', borderRadius: '14px',
    fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(226,55,68,0.4)',
  },
  secondaryBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(255,255,255,0.15)', padding: '0.9rem 1.5rem',
    borderRadius: '14px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
    backdropFilter: 'blur(8px)',
  },
  exploreBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)',
    fontSize: '0.83rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
    marginTop: '0.5rem',
  },
};
