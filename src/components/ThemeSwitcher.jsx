import React, { useEffect, useRef } from 'react';
import { useTheme, THEMES } from '../contexts/ThemeContext';
import { Moon, Sun, Check } from 'lucide-react';

export default function ThemeSwitcher({ isOpen, onClose }) {
  const { isDark, toggleDark, currentTheme, selectTheme, themes } = useTheme();
  const ref = useRef();

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={s.backdrop} onClick={onClose}>
      <div style={s.panel} ref={ref} onClick={e => e.stopPropagation()} className="animate-scale-in">
        {/* Header */}
        <div style={s.header}>
          <span style={s.title}>🎨 Appearance</span>
          <div style={s.darkToggleRow}>
            <span style={s.modeLabel}>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            <button onClick={toggleDark} style={{ ...s.modeBtn, background: isDark ? '#FF6B35' : '#CBD5E1' }} title="Toggle Dark/Light (Ctrl+D)">
              <div style={{ ...s.modeKnob, transform: isDark ? 'translateX(20px)' : 'translateX(2px)' }}>
                {isDark ? <Moon size={10} color="#FFFFFF" /> : <Sun size={10} color="#64748B" />}
              </div>
            </button>
          </div>
        </div>

        {/* Theme Grid */}
        <div style={s.sectionTitle}>Colour Theme</div>
        <div style={s.themeGrid}>
          {Object.values(themes).map(theme => (
            <button
              key={theme.id}
              onClick={() => selectTheme(theme.id)}
              style={{
                ...s.themeCard,
                border: currentTheme === theme.id ? `2.5px solid ${theme.primary}` : '2px solid transparent',
                boxShadow: currentTheme === theme.id ? `0 0 0 4px ${theme.primary}22` : 'none',
              }}
              title={theme.name}
            >
              <div style={{ ...s.themeOrb, background: theme.primaryGrad }} />
              <span style={s.themeLabel}>{theme.emoji}</span>
              {currentTheme === theme.id && (
                <div style={{ ...s.checkMark, background: theme.primary }}>
                  <Check size={10} color="#FFFFFF" />
                </div>
              )}
            </button>
          ))}
        </div>
        <div style={s.themeNames}>
          <span style={s.activeThemeName}>{themes[currentTheme]?.emoji} {themes[currentTheme]?.name}</span>
        </div>
      </div>
    </div>
  );
}

const s = {
  backdrop: {
    position: 'fixed', inset: 0, zIndex: 100000,
    background: 'transparent',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
    padding: '40px 24px',
  },
  panel: {
    width: '280px',
    background: 'var(--card-bg, #FFFFFF)',
    borderRadius: '20px',
    boxShadow: '0 24px 48px rgba(0,0,0,0.22)',
    border: '1px solid var(--border-color, #E2E8F0)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 1.25rem 0.75rem',
    borderBottom: '1px solid var(--border-color, #F1F5F9)',
  },
  title: { fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main, #0F172A)' },
  darkToggleRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  modeLabel: { fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #64748B)' },
  modeBtn: {
    width: '44px', height: '24px', borderRadius: '12px', border: 'none',
    cursor: 'pointer', position: 'relative', transition: 'background 0.3s',
    display: 'flex', alignItems: 'center', padding: '2px',
  },
  modeKnob: {
    width: '20px', height: '20px', borderRadius: '50%', background: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
  },
  sectionTitle: {
    fontSize: '0.73rem', fontWeight: 800, color: 'var(--text-muted, #94A3B8)',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    padding: '0.85rem 1.25rem 0.5rem',
  },
  themeGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '8px', padding: '0 1.25rem',
  },
  themeCard: {
    width: '36px', height: '36px', borderRadius: '10px',
    background: 'var(--bg-muted, #F8FAFC)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', gap: '2px', position: 'relative',
    transition: 'all 0.2s',
  },
  themeOrb: {
    width: '16px', height: '16px', borderRadius: '50%',
    border: '1.5px solid rgba(255,255,255,0.5)',
  },
  themeLabel: { fontSize: '0.6rem' },
  checkMark: {
    position: 'absolute', top: '-4px', right: '-4px',
    width: '14px', height: '14px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1.5px solid #FFFFFF',
  },
  themeNames: {
    padding: '0.5rem 1.25rem 1rem', textAlign: 'center',
  },
  activeThemeName: { fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main, #0F172A)' },
};
