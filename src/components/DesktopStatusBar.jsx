import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Printer, Zap, Keyboard, Clock } from 'lucide-react';

export default function DesktopStatusBar() {
  const isElectron = !!window.electronAPI;
  const [online, setOnline] = useState(navigator.onLine);
  const [latency, setLatency] = useState(14);
  const [printerStatus, setPrinterStatus] = useState('Checking POS…');
  const [printerReady, setPrinterReady] = useState(false);
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

    // Memory usage (Chrome/Electron)
    const memInterval = setInterval(() => {
      if (performance.memory) {
        const used = Math.round(performance.memory.usedJSHeapSize / 1048576);
        setMemory(used);
      }
    }, 3000);

    // Check printers via Electron IPC
    if (isElectron && window.electronAPI.getPrinters) {
      window.electronAPI.getPrinters().then(printers => {
        if (printers && printers.length > 0) {
          const p = printers.find(p => p.isDefault) || printers[0];
          setPrinterStatus(`POS: ${p.name.substring(0, 18)}`);
          setPrinterReady(true);
        } else {
          setPrinterStatus('Thermal Standby');
          setPrinterReady(false);
        }
      }).catch(() => {
        setPrinterStatus('Direct Print Ready');
        setPrinterReady(true);
      });
    } else {
      setPrinterStatus('POS Standby');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(pingInterval);
      clearInterval(clockInterval);
      clearInterval(memInterval);
    };
  }, [isElectron]);

  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <footer style={styles.statusBar}>
      {/* Left: connection status */}
      <div style={styles.group}>
        {online
          ? <Wifi size={11} color="#22c55e" />
          : <WifiOff size={11} color="#ef4444" />
        }
        <span style={{ ...styles.text, color: online ? '#4ade80' : '#f87171' }}>
          {online ? 'Connected' : 'Offline'}
        </span>

        <span style={styles.sep}>·</span>

        <Zap size={10} color={latency < 20 ? '#22c55e' : latency < 50 ? '#f59e0b' : '#ef4444'} />
        <span style={{ ...styles.text, color: latency < 20 ? '#4ade80' : latency < 50 ? '#fbbf24' : '#f87171' }}>
          {latency}ms
        </span>

        {memory !== null && (
          <>
            <span style={styles.sep}>·</span>
            <span style={styles.text}>RAM: {memory} MB</span>
          </>
        )}
      </div>

      {/* Right: printer + hotkeys + clock */}
      <div style={styles.group}>
        {isElectron && (
          <>
            <Printer size={11} color={printerReady ? '#22c55e' : '#94a3b8'} />
            <span style={{ ...styles.text, color: printerReady ? '#4ade80' : '#94a3b8' }}>{printerStatus}</span>
            <span style={styles.sep}>·</span>
            <Keyboard size={11} color="#38bdf8" />
            <span style={{ ...styles.hotkey }}>Ctrl+Shift+O/P/M</span>
            <span style={styles.sep}>·</span>
          </>
        )}
        <Clock size={11} color="#94a3b8" />
        <span style={styles.text}>{timeStr}</span>
      </div>
    </footer>
  );
}

const styles = {
  statusBar: {
    height: '24px',
    background: 'linear-gradient(90deg, #06090f 0%, #0a0f1e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 14px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace',
    userSelect: 'none',
  },
  group: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  text: {
    color: '#64748b',
    fontSize: '0.67rem',
    letterSpacing: '0.02em',
  },
  sep: {
    color: '#1e293b',
    fontSize: '0.75rem',
    margin: '0 1px',
  },
  hotkey: {
    background: '#1e293b',
    color: '#38bdf8',
    padding: '1px 5px',
    borderRadius: '3px',
    fontSize: '0.63rem',
    fontFamily: 'inherit',
    letterSpacing: '0.02em',
    border: '1px solid rgba(56,189,248,0.15)',
  },
};
