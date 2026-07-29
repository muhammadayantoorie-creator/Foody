import React, { useState, useEffect } from 'react';

export default function BrandSplashScreen({ onComplete }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Show splash screen for 1.8 seconds on initial load
    const timer1 = setTimeout(() => {
      setFading(true);
    }, 1500);

    const timer2 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      background: '#0B0F19',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justify: 'center',
      gap: '1.5rem',
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.4s ease-out',
      pointerEvents: fading ? 'none' : 'auto',
    }}>
      {/* Glowing Logo Circle */}
      <div style={{
        position: 'relative',
        width: '90px',
        height: '90px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
        display: 'flex',
        alignItems: 'center',
        justify: 'center',
        boxShadow: '0 0 60px rgba(255,107,53,0.6)',
        animation: 'splashPulse 1.5s ease-in-out infinite',
      }}>
        <img
          src="/images/logo.png"
          alt="FoodDash"
          style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover' }}
        />
      </div>

      {/* Brand Title */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          margin: 0,
          color: '#FFFFFF',
          fontSize: '2rem',
          fontWeight: 900,
          fontFamily: 'var(--font-heading)',
          letterSpacing: '-0.03em',
        }}>
          FoodDash <span style={{ color: '#FF6B35' }}>Enterprise</span>
        </h1>
        <p style={{
          margin: '0.4rem 0 0 0',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '0.82rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          3D Food Logistics & Express Delivery
        </p>
      </div>

      {/* Loading bar */}
      <div style={{
        width: '140px',
        height: '3px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '2px',
        overflow: 'hidden',
        marginTop: '1rem',
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #FF6B35, #FFB703, #2EC4B6)',
          animation: 'splashBar 1.5s ease-in-out forwards',
        }} />
      </div>

      <style>{`
        @keyframes splashPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(255,107,53,0.5); }
          50% { transform: scale(1.06); box-shadow: 0 0 70px rgba(255,107,53,0.8); }
        }
        @keyframes splashBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
