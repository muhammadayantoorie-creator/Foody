import React from 'react';
import { useLanguageCurrency } from '../contexts/LanguageCurrencyContext';
import { Keyboard, X, Command, Search, ShoppingBag, Shield, Truck, Moon, Globe, Settings } from 'lucide-react';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  const { isRTL } = useLanguageCurrency();

  if (!isOpen) return null;

  const SHORTCUT_GROUPS = [
    {
      groupTitle: isRTL ? 'عام نیویگیشن' : 'Global Navigation & Search',
      items: [
        { keyCombo: ['Ctrl', 'K'], label: isRTL ? 'کمانڈ پیلیٹ کھولیں' : 'Open Command Palette' },
        { keyCombo: ['Ctrl', 'B'], label: isRTL ? 'شاپنگ کارٹ ڈراور کھولیں' : 'Toggle Shopping Cart Drawer' },
        { keyCombo: ['Ctrl', 'M'], label: isRTL ? 'میرے آرڈرز پر جائیں' : 'Go to My Orders & History' },
        { keyCombo: ['Ctrl', 'S'], label: isRTL ? 'سسٹم سیٹنگز کھولیں' : 'Open Enterprise System Settings' },
      ]
    },
    {
      groupTitle: isRTL ? 'سسٹم اینڈ ڈسپلے شارٹ کٹس' : 'Display & Localization',
      items: [
        { keyCombo: ['Ctrl', 'Shift', 'D'], label: isRTL ? 'ڈارک / لائٹ موڈ تبدیل کریں' : 'Toggle Dark Mode / Light Mode' },
        { keyCombo: ['Ctrl', 'Shift', 'U'], label: isRTL ? 'اردو / انگلش زبان تبدیل کریں' : 'Toggle Language (Urdu / English RTL)' },
        { keyCombo: ['Ctrl', 'Shift', 'C'], label: isRTL ? 'کرنسی (روپے / ڈالر) تبدیل کریں' : 'Toggle Currency (PKR ₨ / USD $)' },
        { keyCombo: ['?'], label: isRTL ? 'کی بورڈ شارٹ کٹس شیٹ' : 'Show Keyboard Shortcuts Cheat Sheet' },
        { keyCombo: ['Esc'], label: isRTL ? 'کوئی بھی ونڈو یا مینو بند کریں' : 'Close active modal / drawer' },
      ]
    },
    {
      groupTitle: isRTL ? 'پورٹلز شارٹ کٹس' : 'Enterprise Role Portals',
      items: [
        { keyCombo: ['Alt', 'A'], label: isRTL ? 'ایڈمن کنٹرول سینٹر' : 'Open Admin Operations Center' },
        { keyCombo: ['Alt', 'R'], label: isRTL ? 'ڈلیوری رائڈر پورٹل' : 'Open Delivery Rider Fleet Portal' },
        { keyCombo: ['Alt', 'H'], label: isRTL ? 'ہوم کسٹمر ڈیش بورڈ' : 'Go to Customer Dashboard' },
      ]
    }
  ];

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div
        style={{ ...styles.modal, direction: isRTL ? 'rtl' : 'ltr' }}
        onClick={e => e.stopPropagation()}
        className="animate-scale-in"
      >
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitleRow}>
            <div style={styles.iconWrap}>
              <Keyboard size={20} color="#FF6B35" />
            </div>
            <div>
              <h3 style={styles.title}>
                {isRTL ? 'کی بورڈ شارٹ کٹس (ڈیسک ٹاپ)' : 'Desktop Keyboard Shortcuts'}
              </h3>
              <p style={styles.subtitle}>
                {isRTL ? 'سسٹم کے تمام ڈیسک ٹاپ شارٹ کٹس' : 'Master your enterprise workflow with instant keys'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Close (Esc)">
            <X size={18} color="#94A3B8" />
          </button>
        </div>

        {/* Shortcut Groups Body */}
        <div style={styles.body}>
          {SHORTCUT_GROUPS.map((grp, gIdx) => (
            <div key={gIdx} style={styles.groupCard}>
              <div style={styles.groupTitle}>{grp.groupTitle}</div>
              <div style={styles.itemList}>
                {grp.items.map((item, iIdx) => (
                  <div key={iIdx} style={styles.shortcutRow}>
                    <span style={styles.itemLabel}>{item.label}</span>
                    <div style={styles.comboWrap}>
                      {item.keyCombo.map((k, kIdx) => (
                        <span key={kIdx} style={styles.keyBadge}>{k}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <span>💡 Press <strong style={{ color: '#FF6B35' }}>?</strong> or <strong style={{ color: '#FF6B35' }}>Ctrl + K</strong> anytime on desktop to trigger commands</span>
          <button onClick={onClose} style={styles.gotItBtn}>
            {isRTL ? 'سمجھ گیا' : 'Got it'}
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
    maxWidth: '620px',
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
    padding: '1.25rem 1.5rem',
    borderBottom: '1.5px solid #F1F5F9',
    background: '#FAFAFA',
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
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
    fontSize: '1.15rem',
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
  body: {
    overflowY: 'auto',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  groupCard: {
    background: '#F8FAFC',
    borderRadius: '18px',
    padding: '1rem 1.25rem',
    border: '1px solid #E2E8F0',
  },
  groupTitle: {
    fontSize: '0.78rem',
    fontWeight: 800,
    color: '#FF6B35',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '0.75rem',
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  shortcutRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.88rem',
    color: '#334155',
    fontWeight: 600,
  },
  itemLabel: {
    color: '#1E293B',
  },
  comboWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  keyBadge: {
    background: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '6px',
    padding: '2px 8px',
    fontSize: '0.72rem',
    fontWeight: 800,
    color: '#0F172A',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.5rem',
    background: '#FAFAFA',
    borderTop: '1px solid #F1F5F9',
    fontSize: '0.8rem',
    color: '#64748B',
    fontWeight: 600,
  },
  gotItBtn: {
    padding: '0.5rem 1.25rem',
    background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(255, 107, 53, 0.3)',
  }
};
