import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Zap, Clock, Search, Settings, HelpCircle, Globe, DollarSign, Bot, User, BarChart3 } from 'lucide-react';
import { useLanguageCurrency } from '../contexts/LanguageCurrencyContext';

export default function DesktopStatusBar({ onOpenCommand, onOpenSettings, onOpenShortcuts, onOpenAi, onOpenProfile, onOpenAnalytics, onOpenHelp }) {
  const isElectron = !!window.electronAPI;
  const { language, toggleLanguage, currency, toggleCurrency, formatPKRDate } = useLanguageCurrency();

  const [online, setOnline] = useState(navigator.onLine);
  const [latency, setLatency] = useState(14);
  const [printerStatus, setPrinterStatus] = useState('POS Standby');
  const [printerReady, setPrinterReady] = useState(true);
  const [time, setTime] = useState(new Date());
  const [memory, setMemory] = useState(null);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Live ping simulation
    const pingInterval = setInterval(() => {
      setLatency(Math.floor(8 + Math.random() * 16));
    }, 4000);

    // Live clock
    const clockInterval = setInterval(() => setTime(new Date()), 1000);

    // Memory usage
    const memInterval = setInterval(() => {
      if (performance.memory) {
        const used = Math.round(performance.memory.usedJSHeapSize / 1048576);
        setMemory(used);
      }
    }, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(pingInterval);
      clearInterval(clockInterval);
      clearInterval(memInterval);
    };
  }, []);

  const pktTimeStr = time.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Karachi' });

  return (
    <footer style={styles.statusBar}>
      {/* Left: connection status & system health */}
      <div style={styles.group}>
        {online
          ? <Wifi size={11} color="#22c55e" />
          : <WifiOff size={11} color="#ef4444" />
        }
        <span style={{ ...styles.text, color: online ? '#4ade80' : '#f87171' }}>
          {online ? 'Online (PK Fleet)' : 'Offline (Local Cache)'}
        </span>

        <span style={styles.sep}>·</span>

        <Zap size={10} color={latency < 20 ? '#22c55e' : '#f59e0b'} />
        <span style={{ ...styles.text, color: latency < 20 ? '#4ade80' : '#fbbf24' }}>
          {latency}ms
        </span>

        {memory !== null && (
          <>
            <span style={styles.sep}>·</span>
            <span style={styles.text}>RAM: {memory} MB</span>
          </>
        )}

        <span style={styles.sep}>·</span>
        <span style={styles.badgePKR}>🇵🇰 PKR Enterprise</span>
      </div>

      {/* Right: Quick Command Triggers + Language + Currency + Clock */}
      <div style={styles.group}>
        {/* Command Palette Trigger */}
        <button onClick={onOpenCommand} style={styles.btnTrigger} title="Open Command Palette (Ctrl + K)">
          <Search size={10} color="#FF6B35" />
          <span style={styles.hotkey}>Ctrl + K</span>
        </button>

        <span style={styles.sep}>·</span>

        {/* Currency Toggle */}
        <button onClick={toggleCurrency} style={styles.btnTrigger} title="Toggle Currency (PKR / USD)">
          <DollarSign size={10} color="#F59E0B" />
          <span>{currency}</span>
        </button>

        <span style={styles.sep}>·</span>

        {/* Language Toggle */}
        <button onClick={toggleLanguage} style={styles.btnTrigger} title="Toggle Language (English / اردو)">
          <Globe size={10} color="#EC4899" />
          <span>{language === 'en' ? 'EN' : 'اردو'}</span>
        </button>

        <span style={styles.sep}>·</span>

        {/* Settings Trigger */}
        <button onClick={onOpenSettings} style={styles.btnTrigger} title="Open System Settings (Ctrl + S)">
          <Settings size={10} color="#3B82F6" />
        </button>

        <span style={styles.sep}>·</span>

        {/* Shortcuts Trigger */}
        <button onClick={onOpenShortcuts} style={styles.btnTrigger} title="Keyboard Shortcuts (?)">
          <HelpCircle size={10} color="#8B5CF6" />
        </button>

        <span style={styles.sep}>·</span>

        {/* AI Assistant Trigger */}
        <button onClick={onOpenAi} style={styles.btnTrigger} title="AI Food Assistant (Ctrl + N)">
          <Bot size={10} color="#EC4899" />
          <span style={{ ...styles.text, color: '#EC4899' }}>AI</span>
        </button>

        <span style={styles.sep}>·</span>

        {/* Profile Trigger */}
        <button onClick={onOpenProfile} style={styles.btnTrigger} title="My Profile & Security">
          <User size={10} color="#34D399" />
        </button>

        <span style={styles.sep}>·</span>

        {/* Analytics Trigger */}
        <button onClick={onOpenAnalytics} style={styles.btnTrigger} title="Analytics & Reports (Ctrl + A)">
          <BarChart3 size={10} color="#FF6B35" />
        </button>

        <span style={styles.sep}>·</span>

        {/* Help Center */}
        <button onClick={onOpenHelp} style={styles.btnTrigger} title="Help Center & Support (F1)">
          <HelpCircle size={10} color="#F59E0B" />
          <span style={{ ...styles.text, color: '#F59E0B' }}>Help</span>
        </button>

        <span style={styles.sep}>·</span>

        <Clock size={11} color="#94a3b8" />
        <span style={{ ...styles.text, color: '#E2E8F0', fontWeight: 600 }}>{pktTimeStr} PKT</span>
      </div>
    </footer>
  );
}

const styles = {
  statusBar: {
    height: '26px',
    background: 'linear-gradient(90deg, #06090F 0%, #0A0F1E 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 14px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace',
    userSelect: 'none',
    zIndex: 9990,
  },
  group: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  text: {
    color: '#64748B',
    fontSize: '0.68rem',
    letterSpacing: '0.02em',
  },
  sep: {
    color: '#1E293B',
    fontSize: '0.75rem',
    margin: '0 1px',
  },
  badgePKR: {
    background: 'rgba(34, 197, 94, 0.15)',
    color: '#4ADE80',
    padding: '1px 6px',
    borderRadius: '4px',
    fontSize: '0.62rem',
    fontWeight: 700,
    border: '1px solid rgba(34, 197, 94, 0.3)',
  },
  btnTrigger: {
    background: 'transparent',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '0.65rem',
    padding: '2px 4px',
    borderRadius: '4px',
    transition: 'all 0.15s ease',
  },
  hotkey: {
    background: '#1E293B',
    color: '#FF6B35',
    padding: '1px 5px',
    borderRadius: '3px',
    fontSize: '0.62rem',
    fontWeight: 700,
    border: '1px solid rgba(255,107,53,0.2)',
  },
};
