import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguageCurrency } from '../contexts/LanguageCurrencyContext';
import toast from 'react-hot-toast';
import {
  User, ShieldCheck, Key, Lock, Smartphone, Camera, Save, LogOut,
  Clock, Activity, MapPin, Check, X, AlertTriangle, QrCode
} from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose }) {
  const { user, role, signOut } = useAuth();
  const { formatPKRDate, isRTL } = useLanguageCurrency();

  const [activeTab, setActiveTab] = useState('profile');

  // Edit Profile Form State
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || 'Muhammad Ayan');
  const [phone, setPhone] = useState('+92 300 1234567');
  const [city, setCity] = useState('Lahore, Punjab');
  const [avatarUrl, setAvatarUrl] = useState('/images/logo.png');

  // Security Form State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Login History Mock Data
  const [loginHistory] = useState([
    { id: 'SESS-101', device: 'Windows Desktop App (Electron)', location: 'Lahore, PK', ip: '103.255.4.12', time: new Date(Date.now() - 1200000), current: true },
    { id: 'SESS-102', device: 'Chrome Browser (Vite SPA)', location: 'Islamabad, PK', ip: '182.180.12.89', time: new Date(Date.now() - 86400000), current: false },
    { id: 'SESS-103', device: 'iOS App (iPhone 15 Pro)', location: 'Karachi, PK', ip: '119.160.45.2', time: new Date(Date.now() - 172800000), current: false },
  ]);

  if (!isOpen) return null;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    toast.success('Profile information updated successfully! 👤');
  };

  const handleToggle2FA = () => {
    if (!twoFactorEnabled) {
      setShowQrModal(true);
    } else {
      setTwoFactorEnabled(false);
      toast.success('Two-Factor Authentication disabled.');
    }
  };

  const handleVerifyOtp = () => {
    if (otpCode.length === 6) {
      setTwoFactorEnabled(true);
      setShowQrModal(false);
      setOtpCode('');
      toast.success('2FA Two-Factor Security successfully activated! 🔐');
    } else {
      toast.error('Please enter a valid 6-digit OTP code.');
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={styles.avatarWrap}>
              <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={styles.title}>{fullName}</h3>
                <span style={styles.roleBadge}>{role || 'Customer'}</span>
              </div>
              <p style={styles.subtitle}>{user?.email || 'customer@fooddash.pk'}</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Close (Esc)">
            <X size={18} color="#94A3B8" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={styles.tabBar}>
          {[
            { id: 'profile', label: isRTL ? 'پروفائل سیٹنگز' : 'Edit Profile', icon: <User size={15} /> },
            { id: 'security', label: isRTL ? 'سیکیورٹی اور 2FA' : 'Security & 2FA', icon: <ShieldCheck size={15} /> },
            { id: 'sessions', label: isRTL ? 'لاگ ان ہسٹری' : 'Login Sessions', icon: <Clock size={15} /> },
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

        {/* Body Content */}
        <div style={styles.contentBody}>
          {/* TAB 1: EDIT PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} style={styles.formWrap}>
              <div style={styles.avatarSection}>
                <img src={avatarUrl} alt="Avatar Large" style={styles.largeAvatar} />
                <button
                  type="button"
                  onClick={() => toast.success('Profile picture updated!')}
                  style={styles.uploadBtn}
                >
                  <Camera size={14} /> Upload Picture
                </button>
              </div>

              <div style={styles.fieldGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Email Address (Read-only)</label>
                  <input
                    type="email"
                    value={user?.email || 'customer@fooddash.pk'}
                    disabled
                    style={{ ...styles.input, background: '#F1F5F9', color: '#64748B' }}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Phone Number (Pakistan)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Default City & Region</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <button type="submit" style={styles.primaryBtn}>
                <Save size={16} /> Save Profile Changes
              </button>
            </form>
          )}

          {/* TAB 2: SECURITY & 2FA */}
          {activeTab === 'security' && (
            <div style={styles.sectionWrap}>
              <div style={styles.cardBox}>
                <div>
                  <div style={styles.cardTitle}>Two-Factor Authentication (2FA)</div>
                  <div style={styles.cardDesc}>Protect your account with Google Authenticator OTP codes</div>
                </div>
                <button
                  onClick={handleToggle2FA}
                  style={{
                    ...styles.pillBtn,
                    background: twoFactorEnabled ? '#10B981' : '#E2E8F0',
                    color: twoFactorEnabled ? '#FFFFFF' : '#475569',
                  }}
                >
                  {twoFactorEnabled ? '2FA Enabled 🛡️' : 'Enable 2FA'}
                </button>
              </div>

              {/* 2FA QR Code Verification Modal / Sub-card */}
              {showQrModal && (
                <div style={styles.qrCard} className="animate-fade-up">
                  <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                    Scan QR Code with Authenticator App
                  </div>
                  <div style={styles.qrPlaceholder}>
                    <QrCode size={120} color="#0F172A" />
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.5rem 0' }}>
                    Secret Key: <code style={{ background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px' }}>PKFD 8492 X92A</code>
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      style={{ ...styles.input, width: '160px', textAlign: 'center', fontWeight: 800 }}
                    />
                    <button onClick={handleVerifyOtp} style={styles.primaryBtn}>Verify OTP</button>
                  </div>
                </div>
              )}

              {/* Change Password Subform */}
              <div style={{ ...styles.cardBox, flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={styles.cardTitle}>Change Account Password</div>
                <div style={styles.fieldGrid}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Current Password</label>
                    <input type="password" placeholder="••••••••" style={styles.input} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>New Password</label>
                    <input type="password" placeholder="••••••••" style={styles.input} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success('Password updated successfully!')}
                  style={{ ...styles.primaryBtn, width: 'fit-content', marginTop: '0.5rem' }}
                >
                  Update Password
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: LOGIN SESSIONS */}
          {activeTab === 'sessions' && (
            <div style={styles.sectionWrap}>
              <h4 style={styles.sectionHeading}>Active Sessions & Login History</h4>
              <div style={{ overflowX: 'auto', border: '1.5px solid #F1F5F9', borderRadius: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', textTransform: 'uppercase', fontSize: '0.72rem', color: '#64748B' }}>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Device & Client</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Location</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>IP Address</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Last Active</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginHistory.map(sess => (
                      <tr key={sess.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0F172A' }}>
                          {sess.device} {sess.current && <span style={styles.currentBadge}>Current</span>}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{sess.location}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#64748B', fontFamily: 'monospace' }}>{sess.ip}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#64748B' }}>{formatPKRDate(sess.time)}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {!sess.current && (
                            <button onClick={() => toast.success('Session terminated.')} style={styles.revokeBtn}>
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button onClick={signOut} style={styles.logoutBtn}>
            <LogOut size={15} /> Sign Out of Account
          </button>
          <button onClick={onClose} style={styles.primaryBtn}>
            Done (Esc)
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
    maxWidth: '720px',
    background: '#FFFFFF',
    borderRadius: '28px',
    boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '85vh',
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
  avatarWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '2px solid #FF6B35',
    overflow: 'hidden',
  },
  title: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: 800,
    color: '#0F172A',
    fontFamily: 'var(--font-heading)',
  },
  roleBadge: {
    fontSize: '0.65rem',
    fontWeight: 800,
    background: '#FFF7F0',
    color: '#FF6B35',
    border: '1px solid #FFE0D1',
    padding: '2px 8px',
    borderRadius: '50px',
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
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0.55rem 1rem',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.82rem',
    transition: 'all 0.2s ease',
  },
  contentBody: {
    padding: '1.5rem 1.75rem',
    overflowY: 'auto',
    flex: 1,
  },
  formWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  largeAvatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #E2E8F0',
  },
  uploadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    border: '1.5px solid #CBD5E1',
    background: '#FFFFFF',
    color: '#334155',
    fontWeight: 700,
    fontSize: '0.82rem',
    cursor: 'pointer',
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#475569',
  },
  input: {
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: '1.5px solid #CBD5E1',
    outline: 'none',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    color: '#0F172A',
  },
  sectionWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
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
  pillBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '12px',
    fontWeight: 800,
    fontSize: '0.82rem',
    border: 'none',
    cursor: 'pointer',
  },
  qrCard: {
    background: '#F8FAFC',
    border: '1.5px solid #E2E8F0',
    borderRadius: '20px',
    padding: '1.25rem',
    textAlign: 'center',
  },
  qrPlaceholder: {
    display: 'inline-flex',
    padding: '1rem',
    background: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #CBD5E1',
  },
  currentBadge: {
    background: '#DCFCE7',
    color: '#15803D',
    fontSize: '0.68rem',
    padding: '2px 6px',
    borderRadius: '4px',
    marginLeft: '6px',
  },
  revokeBtn: {
    padding: '3px 8px',
    background: '#FEE2E2',
    color: '#DC2626',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0.65rem 1.4rem',
    background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 800,
    fontSize: '0.88rem',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(255,107,53,0.3)',
  },
  logoutBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0.6rem 1rem',
    background: '#FEE2E2',
    color: '#DC2626',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 700,
    fontSize: '0.82rem',
    cursor: 'pointer',
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
