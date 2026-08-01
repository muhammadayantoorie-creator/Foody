import React, { useState, useEffect, useRef } from 'react';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { useLanguageCurrency } from '../contexts/LanguageCurrencyContext';
import toast from 'react-hot-toast';
import { Mic, MicOff, Volume2, VolumeX, Globe, X, Zap } from 'lucide-react';

const VOICE_COMMANDS = [
  { cmd: '"Search [dish name]"', desc: 'Find food', icon: '🔍' },
  { cmd: '"Go to orders"', desc: 'View my orders', icon: '📦' },
  { cmd: '"Open cart"', desc: 'Open shopping cart', icon: '🛒' },
  { cmd: '"Go home"', desc: 'Dashboard', icon: '🏠' },
  { cmd: '"Checkout"', desc: 'Proceed to checkout', icon: '💳' },
  { cmd: '"Dark mode"', desc: 'Toggle dark mode', icon: '🌙' },
  { cmd: '"Open settings"', desc: 'Open settings', icon: '⚙️' },
  { cmd: '"Open help"', desc: 'Open help center', icon: '❓' },
];

const URDU_COMMANDS = [
  { cmd: '"آرڈر"', desc: 'میرے آرڈرز', icon: '📦' },
  { cmd: '"کارٹ"', desc: 'شاپنگ کارٹ', icon: '🛒' },
  { cmd: '"ہوم"', desc: 'ڈیش بورڈ', icon: '🏠' },
  { cmd: '"چیک آؤٹ"', desc: 'ادائیگی', icon: '💳' },
];

export default function VoiceAssistantModal({ isOpen, onClose, onSearchResult }) {
  const { isRTL } = useLanguageCurrency();
  const [voiceLang, setVoiceLang] = useState('en-US');
  const [isMuted, setIsMuted] = useState(false);
  const [history, setHistory] = useState([]);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  const { isListening, transcript, error, isSupported, startListening, stopListening, speak, stopSpeaking } = useVoiceSearch({
    language: voiceLang,
    onResult: (text) => {
      setHistory(prev => [{ text, type: 'search', time: new Date() }, ...prev.slice(0, 9)]);
      if (onSearchResult) onSearchResult(text);
      if (!isMuted) speak(`Searching for ${text}`, voiceLang);
    },
    onCommand: (cmd, raw) => {
      setHistory(prev => [{ text: raw, type: 'command', cmd, time: new Date() }, ...prev.slice(0, 9)]);
      if (!isMuted) speak(`Executing ${cmd}`, voiceLang);
      toast.success(`🎙️ Command: "${cmd}"`);
    },
  });

  // Animated waveform on canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let phase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 32;
      const barW = canvas.width / bars - 2;
      for (let i = 0; i < bars; i++) {
        const amp = isListening
          ? (Math.sin(phase + i * 0.4) * 0.5 + 0.5) * 40 + 4
          : 4;
        const x = i * (barW + 2);
        const h = amp;
        const y = (canvas.height - h) / 2;
        const alpha = isListening ? 0.7 + Math.sin(phase + i * 0.3) * 0.3 : 0.3;
        ctx.fillStyle = `rgba(255,107,53,${alpha})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, h, 3);
        ctx.fill();
      }
      phase += 0.08;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isOpen, isListening]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={s.backdrop} onClick={onClose}>
      <div style={{ ...s.modal, direction: isRTL ? 'rtl' : 'ltr' }} onClick={e => e.stopPropagation()} className="animate-scale-in">
        {/* Header */}
        <div style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={s.iconWrap}><Mic size={20} color="#FF6B35" /></div>
            <div>
              <h3 style={s.title}>Voice Assistant</h3>
              <p style={s.subtitle}>Speak to search, navigate, or give commands</p>
            </div>
          </div>
          <button onClick={onClose} style={s.closeBtn}><X size={18} color="#94A3B8" /></button>
        </div>

        {/* Language & Controls */}
        <div style={s.controls}>
          <div style={s.langSwitch}>
            <Globe size={14} color="#64748B" />
            <span style={s.langLabel}>Language:</span>
            <button
              onClick={() => setVoiceLang(voiceLang === 'en-US' ? 'ur-PK' : 'en-US')}
              style={{ ...s.langBtn, background: voiceLang === 'ur-PK' ? '#FFF7F0' : '#F1F5F9', color: voiceLang === 'ur-PK' ? '#FF6B35' : '#334155' }}
            >
              {voiceLang === 'ur-PK' ? '🇵🇰 اردو' : '🇬🇧 English'}
            </button>
          </div>
          <button onClick={() => setIsMuted(!isMuted)} style={s.muteBtn} title={isMuted ? 'Unmute responses' : 'Mute responses'}>
            {isMuted ? <VolumeX size={16} color="#94A3B8" /> : <Volume2 size={16} color="#FF6B35" />}
          </button>
        </div>

        {/* Waveform visualizer */}
        <div style={s.visualizerWrap}>
          <canvas ref={canvasRef} width={340} height={70} style={{ width: '100%', height: '70px', borderRadius: '12px' }} />
          {!isSupported && (
            <div style={s.unsupported}>⚠️ Voice recognition requires Google Chrome or Edge</div>
          )}
        </div>

        {/* Big mic button */}
        <div style={s.micContainer}>
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!isSupported}
            style={{
              ...s.micBtn,
              background: isListening ? 'linear-gradient(135deg, #EF4444, #F97316)' : 'linear-gradient(135deg, #FF6B35, #FF8C42)',
              boxShadow: isListening ? '0 0 0 12px rgba(239,68,68,0.15), 0 8px 24px rgba(239,68,68,0.4)' : '0 8px 24px rgba(255,107,53,0.4)',
              animation: isListening ? 'pulse 1.5s infinite' : 'none',
            }}
          >
            {isListening ? <MicOff size={28} color="#FFFFFF" /> : <Mic size={28} color="#FFFFFF" />}
          </button>
          <div style={s.micStatus}>
            {isListening ? (
              <span style={{ color: '#EF4444', fontWeight: 800, fontSize: '0.88rem' }}>● Listening…</span>
            ) : (
              <span style={{ color: '#64748B', fontWeight: 600, fontSize: '0.85rem' }}>Tap to speak</span>
            )}
          </div>
          {transcript && (
            <div style={s.transcriptBubble} className="animate-fade-up">
              "{transcript}"
            </div>
          )}
          {error && (
            <div style={{ ...s.transcriptBubble, background: '#FFF5F5', border: '1px solid #FCA5A5', color: '#DC2626' }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Commands reference */}
        <div style={s.cmdSection}>
          <div style={s.cmdTitle}><Zap size={13} color="#FF6B35" /> {voiceLang === 'ur-PK' ? 'اردو کمانڈز' : 'Voice Commands'}</div>
          <div style={s.cmdGrid}>
            {(voiceLang === 'ur-PK' ? URDU_COMMANDS : VOICE_COMMANDS).map((c, i) => (
              <div key={i} style={s.cmdChip}>
                <span style={s.cmdIcon}>{c.icon}</span>
                <div>
                  <div style={s.cmdText}>{c.cmd}</div>
                  <div style={s.cmdDesc}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div style={s.historySection}>
            <div style={s.cmdTitle}>Recent Voice Actions</div>
            {history.slice(0, 5).map((h, i) => (
              <div key={i} style={s.historyItem}>
                <span style={{ fontSize: '0.75rem' }}>{h.type === 'command' ? '⚡' : '🔍'}</span>
                <span style={s.historyText}>{h.text}</span>
                <span style={s.historyTime}>{new Date(h.time).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(11,15,25,0.7)', backdropFilter: 'blur(10px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' },
  modal: { width: '100%', maxWidth: '480px', background: 'var(--card-bg, #FFFFFF)', borderRadius: '28px', boxShadow: '0 32px 64px rgba(0,0,0,0.3)', border: '1.5px solid var(--border-color, #F1F5F9)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '88vh' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' },
  iconWrap: { width: '40px', height: '40px', borderRadius: '12px', background: '#FFF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #FFE0D1' },
  title: { margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' },
  subtitle: { margin: '2px 0 0', fontSize: '0.75rem', color: '#64748B', fontWeight: 500 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px' },
  controls: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' },
  langSwitch: { display: 'flex', alignItems: 'center', gap: '6px' },
  langLabel: { fontSize: '0.78rem', fontWeight: 600, color: '#64748B' },
  langBtn: { padding: '0.35rem 0.75rem', borderRadius: '20px', border: '1px solid #E2E8F0', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' },
  muteBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px' },
  visualizerWrap: { padding: '0.75rem 1.5rem 0', position: 'relative' },
  unsupported: { background: '#FFF5F5', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '0.5rem 0.75rem', fontSize: '0.78rem', color: '#DC2626', marginTop: '0.5rem' },
  micContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 1.5rem' },
  micBtn: { width: '72px', height: '72px', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', outline: 'none' },
  micStatus: { textAlign: 'center' },
  transcriptBubble: { background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '12px', padding: '0.6rem 1rem', fontSize: '0.9rem', fontStyle: 'italic', color: '#166534', textAlign: 'center', maxWidth: '320px' },
  cmdSection: { padding: '0 1.5rem 0.75rem', overflowY: 'auto', flex: 1 },
  cmdTitle: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' },
  cmdGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' },
  cmdChip: { display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', borderRadius: '10px', padding: '0.5rem 0.65rem', border: '1px solid #E2E8F0' },
  cmdIcon: { fontSize: '1rem', flexShrink: 0 },
  cmdText: { fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', fontFamily: 'monospace' },
  cmdDesc: { fontSize: '0.65rem', color: '#64748B' },
  historySection: { padding: '0 1.5rem 1rem' },
  historyItem: { display: 'flex', alignItems: 'center', gap: '8px', padding: '0.4rem 0', borderBottom: '1px solid #F1F5F9' },
  historyText: { flex: 1, fontSize: '0.82rem', color: '#334155', fontWeight: 500 },
  historyTime: { fontSize: '0.68rem', color: '#94A3B8' },
};
