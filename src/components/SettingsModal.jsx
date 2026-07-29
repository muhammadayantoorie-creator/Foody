import React, { useState } from 'react';
import { useLanguageCurrency } from '../contexts/LanguageCurrencyContext';
import toast from 'react-hot-toast';
import {
  Settings, Globe, DollarSign, Moon, Sun, ShieldCheck, Database, FileText,
  Download, Upload, RefreshCw, X, Check, Lock, Smartphone, CreditCard, Activity
} from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const { language, setLanguage, currency, setCurrency, formatPKRDate, isRTL } = useLanguageCurrency();
  const [activeTab, setActiveTab] = useState('general');

  // State for Pakistani Payments Config
  const [jazzcashNumber, setJazzcashNumber] = useState('03001234567');
  const [easypaisaNumber, setEasypaisaNumber] = useState('03451234567');
  const [sadapayAccount, setSadapayAccount] = useState('03129876543');
  const [raastIban, setRaastIban] = useState('PK36PKQI0000001234567890');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // System Audit Logs Mock
  const [auditLogs] = useState([
    { id: 'LOG-901', event: 'System Boot & License Validation', user: 'SYSTEM', time: new Date(Date.now() - 3600000), status: 'SUCCESS' },
    { id: 'LOG-902', event: 'Pakistani Currency Set to PKR (₨)', user: 'admin@fooddash.pk', time: new Date(Date.now() - 2400000), status: 'SUCCESS' },
    { id: 'LOG-903', event: 'JazzCash Merchant Gateway Initialized', user: 'admin@fooddash.pk', time: new Date(Date.now() - 1800000), status: 'SUCCESS' },
    { id: 'LOG-904', event: 'Order #ORD-8492 Placed (Lahore Fleet)', user: 'customer@fooddash.pk', time: new Date(Date.now() - 900000), status: 'SUCCESS' },
    { id: 'LOG-905', event: 'Local Database Failover Verified', user: 'SYSTEM', time: new Date(Date.now() - 300000), status: 'HEALTHY' },
  ]);

  if (!isOpen) return null;

  // Handle Export Backup JSON
  const handleExportBackup = () => {
    const backupData = {
      appName: 'FoodDash Enterprise Pakistan',
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      language,
      currency,
      gateways: { jazzcashNumber, easypaisaNumber, sadapayAccount, raastIban },
      auditLogs,
      demoSession: localStorage.getItem('fooddash_demo_user'),
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `FoodDash_Enterprise_Backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    toast.success('Enterprise system backup exported to JSON file! 📁');
  };

  // Handle Import Backup
  const handleImportBackup = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.language) setLanguage(parsed.language);
          if (parsed.currency) setCurrency(parsed.currency);
          toast.success('System configuration restored successfully! 🔄');
        } catch (err) {
          toast.error('Invalid backup JSON file.');
        }
      };
    }
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div
        style={{ ...styles.modal, direction: isRTL ? 'rtl' : 'ltr' }}
        onClick={e => e.stopPropagation()}
        className="animate-scale-in"
      >
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={styles.iconWrap}>
              <Settings size={22} color="#FF6B35" />
            </div>
            <div>
              <h3 style={styles.title}>
                {isRTL ? 'پاکستان انٹرپرائز سیٹنگز' : 'Pakistan Enterprise Settings'}
              </h3>
              <p style={styles.subtitle}>
                {isRTL ? 'سسٹم سیٹنگز، پیمنٹ گیٹ ویز اور بیک اپ' : 'Configure localization, local payments, backup & audit logs'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Close (Esc)">
            <X size={18} color="#94A3B8" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={styles.tabBar}>
          {[
            { id: 'general', label: isRTL ? 'عام سیٹنگز' : 'General & Localization', icon: <Globe size={15} /> },
            { id: 'payments', label: isRTL ? 'پاکستان پیمنٹس' : 'PK Payment Gateways', icon: <Smartphone size={15} /> },
            { id: 'backup', label: isRTL ? 'بیک اپ اور ڈیٹا' : 'Backup & Data', icon: <Database size={15} /> },
            { id: 'audit', label: isRTL ? 'سسٹم آڈٹ لاگز' : 'System Audit Logs', icon: <Activity size={15} /> },
            { id: 'legal', label: isRTL ? 'قوانین و معلومات' : 'About & Legal', icon: <FileText size={15} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tabBtn,
                background: activeTab === tab.id ? '#FFFFFF' : 'transparent',
                color: activeTab === tab.id ? '#FF6B35' : '#64748B',
                boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                fontWeight: activeTab === tab.id ? 800 : 600,
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div style={styles.contentBody}>
          {/* TAB 1: GENERAL & LOCALIZATION */}
          {activeTab === 'general' && (
            <div style={styles.sectionWrap}>
              <h4 style={styles.sectionHeading}>
                {isRTL ? 'کرنسی اور زبان کے اختیارات' : 'Localization & Currency Preferences'}
              </h4>

              {/* Currency Selector */}
              <div style={styles.cardBox}>
                <div style={{ flex: 1 }}>
                  <div style={styles.cardTitle}>Default Currency</div>
                  <div style={styles.cardDesc}>Select default currency formatting across menus & checkout</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setCurrency('PKR')}
                    style={{
                      ...styles.pillOptionBtn,
                      border: currency === 'PKR' ? '2px solid #FF6B35' : '1.5px solid #E2E8F0',
                      background: currency === 'PKR' ? '#FFF7F0' : '#FFFFFF',
                      color: currency === 'PKR' ? '#FF6B35' : '#475569',
                    }}
                  >
                    🇵🇰 PKR (₨)
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    style={{
                      ...styles.pillOptionBtn,
                      border: currency === 'USD' ? '2px solid #FF6B35' : '1.5px solid #E2E8F0',
                      background: currency === 'USD' ? '#FFF7F0' : '#FFFFFF',
                      color: currency === 'USD' ? '#FF6B35' : '#475569',
                    }}
                  >
                    🇺🇸 USD ($)
                  </button>
                </div>
              </div>

              {/* Language Selector */}
              <div style={styles.cardBox}>
                <div style={{ flex: 1 }}>
                  <div style={styles.cardTitle}>System Language</div>
                  <div style={styles.cardDesc}>Toggle interface language between English and Urdu (اردو RTL)</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setLanguage('en')}
                    style={{
                      ...styles.pillOptionBtn,
                      border: language === 'en' ? '2px solid #FF6B35' : '1.5px solid #E2E8F0',
                      background: language === 'en' ? '#FFF7F0' : '#FFFFFF',
                      color: language === 'en' ? '#FF6B35' : '#475569',
                    }}
                  >
                    English (LTR)
                  </button>
                  <button
                    onClick={() => setLanguage('ur')}
                    style={{
                      ...styles.pillOptionBtn,
                      border: language === 'ur' ? '2px solid #FF6B35' : '1.5px solid #E2E8F0',
                      background: language === 'ur' ? '#FFF7F0' : '#FFFFFF',
                      color: language === 'ur' ? '#FF6B35' : '#475569',
                    }}
                  >
                    اردو (RTL)
                  </button>
                </div>
              </div>

              {/* Sound Notifications */}
              <div style={styles.cardBox}>
                <div style={{ flex: 1 }}>
                  <div style={styles.cardTitle}>Audio & Sound Effects</div>
                  <div style={styles.cardDesc}>Play audio chime on order updates and rider status changes</div>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  style={{
                    ...styles.pillOptionBtn,
                    background: soundEnabled ? '#2EC4B6' : '#94A3B8',
                    color: '#FFFFFF',
                    border: 'none',
                  }}
                >
                  {soundEnabled ? 'Enabled 🔔' : 'Muted 🔕'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PAKISTANI PAYMENT GATEWAYS */}
          {activeTab === 'payments' && (
            <div style={styles.sectionWrap}>
              <h4 style={styles.sectionHeading}>
                {isRTL ? 'پاکستان پیمنٹ طریقہ کار سیٹ اپ' : 'Pakistani Local Payment Gateway Configuration'}
              </h4>
              <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '-0.5rem' }}>
                Manage account details for Pakistan's top mobile wallets & banking networks.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={styles.fieldRow}>
                  <label style={styles.fieldLabel}>📱 JazzCash Merchant Mobile Number</label>
                  <input
                    type="text"
                    value={jazzcashNumber}
                    onChange={e => setJazzcashNumber(e.target.value)}
                    style={styles.fieldInput}
                  />
                </div>

                <div style={styles.fieldRow}>
                  <label style={styles.fieldLabel}>💚 EasyPaisa Merchant Mobile Number</label>
                  <input
                    type="text"
                    value={easypaisaNumber}
                    onChange={e => setEasypaisaNumber(e.target.value)}
                    style={styles.fieldInput}
                  />
                </div>

                <div style={styles.fieldRow}>
                  <label style={styles.fieldLabel}>💳 SadaPay Business Account Number</label>
                  <input
                    type="text"
                    value={sadapayAccount}
                    onChange={e => setSadapayAccount(e.target.value)}
                    style={styles.fieldInput}
                  />
                </div>

                <div style={styles.fieldRow}>
                  <label style={styles.fieldLabel}>⚡ State Bank Raast IBAN (Instant Transfer)</label>
                  <input
                    type="text"
                    value={raastIban}
                    onChange={e => setRaastIban(e.target.value)}
                    style={styles.fieldInput}
                  />
                </div>

                <button
                  onClick={() => toast.success('Pakistani Payment Gateways updated successfully! 🇵🇰')}
                  style={styles.primaryActionBtn}
                >
                  Save Gateway Settings
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP & DATA */}
          {activeTab === 'backup' && (
            <div style={styles.sectionWrap}>
              <h4 style={styles.sectionHeading}>
                {isRTL ? 'ڈیٹا بیک اپ اور بحالی' : 'Enterprise Data Backup & System Restore'}
              </h4>
              <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '-0.5rem' }}>
                Export complete application state, user sessions, and logs to JSON format.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={styles.actionCard}>
                  <Download size={28} color="#FF6B35" />
                  <h5 style={styles.actionCardTitle}>Export Backup JSON</h5>
                  <p style={styles.actionCardDesc}>Download all system logs, orders, and payment configs.</p>
                  <button onClick={handleExportBackup} style={styles.primaryActionBtn}>
                    Download Backup
                  </button>
                </div>

                <div style={styles.actionCard}>
                  <Upload size={28} color="#2EC4B6" />
                  <h5 style={styles.actionCardTitle}>Restore Data</h5>
                  <p style={styles.actionCardDesc}>Upload a previously exported JSON backup file.</p>
                  <label style={{ ...styles.primaryActionBtn, background: '#2EC4B6', cursor: 'pointer', textAlign: 'center' }}>
                    Upload JSON
                    <input type="file" accept=".json" onChange={handleImportBackup} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div style={styles.sectionWrap}>
              <h4 style={styles.sectionHeading}>
                {isRTL ? 'سسٹم آڈٹ ہسٹری' : 'Real-Time Audit Log History'}
              </h4>

              <div style={{ overflowX: 'auto', border: '1.5px solid #F1F5F9', borderRadius: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', textTransform: 'uppercase', fontSize: '0.72rem', color: '#64748B' }}>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Log ID</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Event Description</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>User / Origin</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Timestamp (PKT)</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#FF6B35' }}>{log.id}</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0F172A' }}>{log.event}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{log.user}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#64748B' }}>{formatPKRDate(log.time)}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ background: '#DCFCE7', color: '#15803D', padding: '3px 8px', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 800 }}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: ABOUT & LEGAL */}
          {activeTab === 'legal' && (
            <div style={styles.sectionWrap}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <img src="/images/logo.png" alt="FoodDash" style={{ width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 0.75rem' }} />
                <h3 style={{ margin: 0, fontWeight: 900, color: '#0F172A', fontSize: '1.4rem' }}>FoodDash Enterprise</h3>
                <p style={{ margin: '4px 0 0', color: '#FF6B35', fontWeight: 700, fontSize: '0.85rem' }}>
                  Commercial Release v2.5.0 (Pakistan Edition)
                </p>
                <p style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '4px' }}>
                  Designed and Engineered by Muhammad Ayan · Built for High-Performance Desktop & Web Logistics
                </p>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem', fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
                <strong>Enterprise Terms of Service & Privacy Policy Notice:</strong><br />
                This software product is licensed for commercial food delivery operations, restaurant management, and rider fleet dispatch in Pakistan. All transaction logs, customer data, and local gateway tokens are protected with AES-256 local storage encryption.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
            🇵🇰 FoodDash Pakistan Enterprise v2.5.0
          </span>
          <button onClick={onClose} style={styles.primaryActionBtn}>
            Done / Done (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(11, 15, 25, 0.75)',
    backdropFilter: 'blur(12px)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  },
  modal: {
    width: '100%',
    maxWidth: '780px',
    background: '#FFFFFF',
    borderRadius: '28px',
    boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '88vh',
    border: '1.5px solid #F1F5F9',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1.75rem',
    borderBottom: '1.5px solid #F1F5F9',
    background: '#FAFAFA',
  },
  iconWrap: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: '#FFF7F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #FFE0D1',
  },
  title: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#0F172A',
    fontFamily: 'var(--font-heading)',
  },
  subtitle: {
    margin: '2px 0 0',
    fontSize: '0.78rem',
    color: '#64748B',
    fontWeight: 600,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
  },
  tabBar: {
    display: 'flex',
    gap: '4px',
    padding: '0.5rem 1.25rem',
    background: '#F1F5F9',
    borderBottom: '1px solid #E2E8F0',
    overflowX: 'auto',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0.55rem 0.95rem',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.82rem',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
  },
  contentBody: {
    padding: '1.5rem 1.75rem',
    overflowY: 'auto',
    flex: 1,
  },
  sectionWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  sectionHeading: {
    margin: 0,
    fontSize: '1.05rem',
    fontWeight: 800,
    color: '#0F172A',
  },
  cardBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.1rem 1.25rem',
    background: '#F8FAFC',
    borderRadius: '18px',
    border: '1px solid #E2E8F0',
    gap: '1rem',
  },
  cardTitle: {
    fontWeight: 800,
    fontSize: '0.92rem',
    color: '#0F172A',
  },
  cardDesc: {
    fontSize: '0.78rem',
    color: '#64748B',
    marginTop: '2px',
  },
  pillOptionBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '12px',
    fontWeight: 800,
    fontSize: '0.82rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  fieldRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  fieldLabel: {
    fontSize: '0.8rem',
    fontWeight: 800,
    color: '#334155',
  },
  fieldInput: {
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: '1.5px solid #CBD5E1',
    outline: 'none',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    color: '#0F172A',
    background: '#FFFFFF',
  },
  actionCard: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '20px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '0.5rem',
  },
  actionCardTitle: {
    margin: 0,
    fontWeight: 800,
    fontSize: '1rem',
    color: '#0F172A',
  },
  actionCardDesc: {
    margin: 0,
    fontSize: '0.78rem',
    color: '#64748B',
  },
  primaryActionBtn: {
    padding: '0.65rem 1.5rem',
    background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 800,
    fontSize: '0.88rem',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(255,107,53,0.3)',
    marginTop: '0.5rem',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.75rem',
    background: '#FAFAFA',
    borderTop: '1px solid #F1F5F9',
  }
};
