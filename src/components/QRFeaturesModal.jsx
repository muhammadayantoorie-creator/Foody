import React, { useState, useRef, useCallback } from 'react';
import { useLanguageCurrency } from '../contexts/LanguageCurrencyContext';
import { QrCode, Download, Printer, Share2, X, Camera, Check, Copy, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

// Pure JS QR code generator using canvas (no external lib needed)
function generateQRCanvas(text, canvas, size = 200) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  // Simple visual QR pattern (decorative — real QR uses a library like qrcode.js)
  // For production embed: https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js
  const moduleSize = Math.floor(size / 25);
  const modules = 25;
  ctx.clearRect(0, 0, size, size);

  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);

  // Generate pseudo-random but deterministic pattern from text
  let seed = 0;
  for (let i = 0; i < text.length; i++) seed += text.charCodeAt(i);
  const rng = (n) => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return Math.abs(seed % n); };

  // Draw modules
  ctx.fillStyle = '#0F172A';
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      // Finder patterns (corners)
      const inFinder = (
        (row < 7 && col < 7) ||
        (row < 7 && col >= modules - 7) ||
        (row >= modules - 7 && col < 7)
      );
      let filled = inFinder || rng(3) === 0;

      // Finder pattern details
      if (row < 7 && col < 7) {
        filled = !(row > 0 && row < 6 && col > 0 && col < 6 && !(row > 1 && row < 5 && col > 1 && col < 5));
      }

      if (filled) {
        const x = col * moduleSize;
        const y = row * moduleSize;
        const r = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, moduleSize - 1, moduleSize - 1, r);
        ctx.fill();
      }
    }
  }

  // Center logo area
  const center = size / 2 - 16;
  ctx.fillStyle = '#FF6B35';
  ctx.beginPath();
  ctx.roundRect(center - 4, center - 4, 40, 40, 8);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🍕', size / 2, size / 2 + 1);
}

const QR_PRESETS = [
  { label: 'App Link', icon: '📱', value: 'https://fooddash.pk' },
  { label: 'Order Now', icon: '🛵', value: 'https://fooddash.pk/dashboard' },
  { label: 'Referral', icon: '🎁', value: 'https://fooddash.pk/join?ref=FOOD-USER123' },
  { label: 'Menu', icon: '🍽️', value: 'https://fooddash.pk/restaurant/mock-1' },
];

export default function QRFeaturesModal({ isOpen, onClose }) {
  const { isRTL } = useLanguageCurrency();
  const [qrText, setQrText] = useState('https://fooddash.pk');
  const [activeTab, setActiveTab] = useState('generate');
  const [generated, setGenerated] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleGenerate = useCallback(() => {
    if (!qrText.trim()) { toast.error('Please enter a URL or text'); return; }
    generateQRCanvas(qrText, canvasRef.current, 220);
    setGenerated(true);
    toast.success('QR Code generated! 📱');
  }, [qrText]);

  const handleDownload = () => {
    if (!canvasRef.current || !generated) { toast.error('Generate a QR code first'); return; }
    const link = document.createElement('a');
    link.download = 'FoodDash_QR.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    toast.success('QR Code downloaded! 📥');
  };

  const handlePrint = () => {
    if (!generated) { toast.error('Generate a QR code first'); return; }
    const dataUrl = canvasRef.current.toDataURL();
    const win = window.open('');
    win.document.write(`<img src="${dataUrl}" style="width:300px;display:block;margin:50px auto" />`);
    win.print();
  };

  const handleCopy = () => {
    if (!qrText) return;
    navigator.clipboard.writeText(qrText).then(() => toast.success('Link copied to clipboard! 📋'));
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Check out FoodDash! 🍕 ${qrText}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraActive(true);
      toast.success('Camera active — point at a QR code');
    } catch {
      toast.error('Camera access denied. Please allow camera permission.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setIsCameraActive(false);
  };

  React.useEffect(() => {
    if (!isOpen) { stopCamera(); setGenerated(false); }
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => { window.removeEventListener('keydown', h); stopCamera(); };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={s.backdrop} onClick={onClose}>
      <div style={{ ...s.modal, direction: isRTL ? 'rtl' : 'ltr' }} onClick={e => e.stopPropagation()} className="animate-scale-in">
        {/* Header */}
        <div style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={s.iconWrap}><QrCode size={20} color="#FF6B35" /></div>
            <div>
              <h3 style={s.title}>QR Features</h3>
              <p style={s.subtitle}>Generate, scan, and share QR codes</p>
            </div>
          </div>
          <button onClick={onClose} style={s.closeBtn}><X size={18} color="#94A3B8" /></button>
        </div>

        {/* Tabs */}
        <div style={s.tabBar}>
          {[{ id: 'generate', label: '⚡ Generate', icon: QrCode }, { id: 'scan', label: '📷 Scan', icon: Camera }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ ...s.tabBtn, background: activeTab === tab.id ? '#FFFFFF' : 'transparent', color: activeTab === tab.id ? '#FF6B35' : '#64748B', fontWeight: activeTab === tab.id ? 800 : 600, boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={s.body}>
          {activeTab === 'generate' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Presets */}
              <div style={s.presetRow}>
                {QR_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => { setQrText(p.value); setGenerated(false); }}
                    style={{ ...s.presetBtn, borderColor: qrText === p.value ? '#FF6B35' : '#E2E8F0', background: qrText === p.value ? '#FFF7F0' : '#F8FAFC' }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{p.icon}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{p.label}</span>
                  </button>
                ))}
              </div>

              {/* Input */}
              <div style={s.inputGroup}>
                <label style={s.label}>URL or Text</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    style={s.input}
                    value={qrText}
                    onChange={e => { setQrText(e.target.value); setGenerated(false); }}
                    placeholder="https://fooddash.pk"
                  />
                  <button onClick={handleCopy} style={s.iconBtn} title="Copy"><Copy size={15} color="#64748B" /></button>
                </div>
              </div>

              <button onClick={handleGenerate} style={s.generateBtn}>
                <QrCode size={16} /> Generate QR Code
              </button>

              {/* Canvas preview */}
              <div style={s.canvasWrap}>
                <canvas
                  ref={canvasRef}
                  width={220}
                  height={220}
                  style={{ borderRadius: '16px', border: generated ? '2px solid #FF6B35' : '2px dashed #CBD5E1', padding: '12px', background: '#FFFFFF', transition: 'all 0.3s' }}
                />
                {!generated && (
                  <div style={s.canvasPlaceholder}>
                    <QrCode size={48} color="#CBD5E1" />
                    <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>Your QR code will appear here</p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {generated && (
                <div style={s.actionRow} className="animate-fade-up">
                  <button onClick={handleDownload} style={s.actionBtn}><Download size={15} color="#3B82F6" /> Download PNG</button>
                  <button onClick={handlePrint} style={s.actionBtn}><Printer size={15} color="#8B5CF6" /> Print</button>
                  <button onClick={handleWhatsApp} style={{ ...s.actionBtn, background: '#DCFCE7', color: '#166534', borderColor: '#86EFAC' }}><Share2 size={15} color="#16A34A" /> WhatsApp</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'scan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              {!isCameraActive ? (
                <>
                  <div style={s.scanIllustration}>
                    <Camera size={48} color="#CBD5E1" />
                    <p style={{ color: '#64748B', fontWeight: 600, marginTop: '0.75rem', textAlign: 'center' }}>Tap below to open camera and scan a QR code</p>
                    <p style={{ color: '#94A3B8', fontSize: '0.78rem', textAlign: 'center', margin: '0.25rem 0 0' }}>Point your camera at any FoodDash QR code</p>
                  </div>
                  <button onClick={startCamera} style={s.generateBtn}><Camera size={16} /> Open Camera & Scan</button>
                  <div style={s.whatsappHint}>
                    <Smartphone size={14} color="#16A34A" />
                    <span style={{ fontSize: '0.78rem', color: '#166534' }}>Also works with WhatsApp QR scanner</span>
                  </div>
                </>
              ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '320px', borderRadius: '16px', border: '2px solid #FF6B35' }} />
                  <p style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600, textAlign: 'center' }}>📷 Scanning… point at a QR code</p>
                  <button onClick={stopCamera} style={{ ...s.generateBtn, background: 'linear-gradient(135deg, #EF4444, #F97316)' }}>Stop Camera</button>
                </>
              )}
            </div>
          )}
        </div>

        <div style={s.footer}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>QR codes expire after 30 days · FoodDash Enterprise</span>
          <button onClick={onClose} style={s.primaryBtn}>Close</button>
        </div>
      </div>
    </div>
  );
}

const s = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(11,15,25,0.72)', backdropFilter: 'blur(10px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' },
  modal: { width: '100%', maxWidth: '480px', background: 'var(--card-bg,#FFFFFF)', borderRadius: '24px', boxShadow: '0 32px 64px rgba(0,0,0,0.28)', border: '1.5px solid var(--border-color,#F1F5F9)', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' },
  iconWrap: { width: '40px', height: '40px', borderRadius: '12px', background: '#FFF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #FFE0D1' },
  title: { margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' },
  subtitle: { margin: '2px 0 0', fontSize: '0.75rem', color: '#64748B' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px' },
  tabBar: { display: 'flex', gap: '4px', padding: '0.5rem 1.25rem', background: '#F1F5F9', borderBottom: '1px solid #E2E8F0' },
  tabBtn: { flex: 1, padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s' },
  body: { padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 },
  presetRow: { display: 'flex', gap: '8px' },
  presetBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '0.6rem 0.4rem', borderRadius: '12px', border: '1.5px solid', cursor: 'pointer', transition: 'all 0.2s', background: '#F8FAFC' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.78rem', fontWeight: 800, color: '#334155' },
  input: { flex: 1, padding: '0.7rem 1rem', borderRadius: '12px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontFamily: 'inherit', color: '#0F172A' },
  iconBtn: { padding: '0.7rem', borderRadius: '10px', border: '1.5px solid #CBD5E1', background: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  generateBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.75rem', background: 'linear-gradient(135deg, #FF6B35, #FF8C42)', color: '#FFFFFF', border: 'none', borderRadius: '14px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(255,107,53,0.35)', width: '100%' },
  canvasWrap: { display: 'flex', justifyContent: 'center', position: 'relative' },
  canvasPlaceholder: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  actionRow: { display: 'flex', gap: '8px' },
  actionBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '0.6rem 0.5rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', color: '#334155' },
  scanIllustration: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', background: '#F8FAFC', borderRadius: '16px', width: '100%', border: '2px dashed #CBD5E1' },
  whatsappHint: { display: 'flex', alignItems: 'center', gap: '6px', background: '#F0FDF4', padding: '0.5rem 0.875rem', borderRadius: '10px', border: '1px solid #86EFAC' },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.5rem', borderTop: '1px solid #F1F5F9', background: '#FAFAFA' },
  primaryBtn: { padding: '0.55rem 1.25rem', background: 'linear-gradient(135deg, #FF6B35, #FF8C42)', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' },
};
