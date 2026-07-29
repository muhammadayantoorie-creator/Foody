import React, { useState } from 'react';
import { Minus, Maximize2, X, Pin } from 'lucide-react';

export default function DesktopTitlebar() {
  const isElectron = !!window.electronAPI;
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(null); // 'min' | 'max' | 'close'

  if (!isElectron) return null;

  const handleMinimize = () => window.electronAPI.minimizeWindow();
  const handleMaximize = () => window.electronAPI.maximizeWindow();
  const handleClose = () => window.electronAPI.closeWindow();
  const handleTogglePin = async () => {
    const isNowPinned = await window.electronAPI.toggleAlwaysOnTop();
    setPinned(isNowPinned);
  };

  return (
    <header style={styles.titlebar}>
      {/* Drag region */}
      <div style={styles.dragRegion}>
        {/* Logo */}
        <div style={styles.brand}>
          <div style={styles.logoCircle}>
            <span style={{ fontSize: '0.85rem' }}>🍔</span>
          </div>
          <span style={styles.appName}>FoodDash</span>
          <span style={styles.badge}>ENTERPRISE</span>
        </div>

        {/* Center live status */}
        <div style={styles.centerStatus}>
          <span style={styles.statusDot} />
          <span style={styles.statusText}>Live — All Systems Operational</span>
        </div>
      </div>

      {/* Controls (no-drag) */}
      <div style={styles.controls}>
        {/* Pin */}
        <button
          onClick={handleTogglePin}
          title={pinned ? 'Unpin window' : 'Pin always on top'}
          style={{ ...styles.btn, color: pinned ? '#818cf8' : '#475569' }}
        >
          <Pin size={13} />
        </button>

        {/* Minimize */}
        <button
          onClick={handleMinimize}
          title="Minimize"
          onMouseEnter={() => setHovered('min')}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...styles.btn,
            background: hovered === 'min' ? 'rgba(255,255,255,0.1)' : 'transparent',
          }}
        >
          <Minus size={14} />
        </button>

        {/* Maximize */}
        <button
          onClick={handleMaximize}
          title="Maximize"
          onMouseEnter={() => setHovered('max')}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...styles.btn,
            background: hovered === 'max' ? 'rgba(255,255,255,0.1)' : 'transparent',
          }}
        >
          <Maximize2 size={13} />
        </button>

        {/* Close */}
        <button
          onClick={handleClose}
          title="Close"
          onMouseEnter={() => setHovered('close')}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...styles.btn,
            ...styles.closeBtn,
            background: hovered === 'close' ? '#ef4444' : 'transparent',
            color: hovered === 'close' ? '#ffffff' : '#94a3b8',
          }}
        >
          <X size={14} />
        </button>
      </div>
    </header>
  );
}

const styles = {
  titlebar: {
    height: '40px',
    background: 'linear-gradient(90deg, #0a0f1e 0%, #0f172a 60%, #1e293b 100%)',
    display: 'flex',
    alignItems: 'center',
    userSelect: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 99999,
    backdropFilter: 'blur(12px)',
  },
  dragRegion: {
    flex: 1,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '12px',
    WebkitAppRegion: 'drag',
    gap: '0',
    justifyContent: 'space-between',
    paddingRight: '12px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoCircle: {
    width: '24px', height: '24px',
    background: 'linear-gradient(135deg, #e23744, #ff6b35)',
    borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(226,55,68,0.4)',
  },
  appName: {
    fontWeight: 800, fontSize: '0.82rem',
    color: '#f8fafc', letterSpacing: '0.3px',
    fontFamily: 'var(--font-heading)',
  },
  badge: {
    fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.07em',
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    color: '#ffffff', padding: '2px 6px', borderRadius: '4px',
    textTransform: 'uppercase',
  },
  centerStatus: {
    display: 'flex', alignItems: 'center', gap: '6px',
    position: 'absolute', left: '50%', transform: 'translateX(-50%)',
  },
  statusDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 6px rgba(34,197,94,0.8)',
    animation: 'statusBlink 2s ease-in-out infinite',
  },
  statusText: {
    fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)',
    fontFamily: 'monospace', letterSpacing: '0.02em',
  },
  controls: {
    display: 'flex',
    height: '100%',
    WebkitAppRegion: 'no-drag',
  },
  btn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    width: '46px', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
  },
  closeBtn: {
    transition: 'background 0.15s, color 0.15s',
  },
};
