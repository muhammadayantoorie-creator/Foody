import React, { useState } from 'react';
import { useLanguageCurrency } from '../contexts/LanguageCurrencyContext';
import toast from 'react-hot-toast';
import {
  HelpCircle, MessageSquare, Bug, Lightbulb, PhoneCall, Mail, Search,
  ChevronDown, ChevronUp, Send, CheckCircle2, X
} from 'lucide-react';

export default function HelpCenterModal({ isOpen, onClose }) {
  const { isRTL } = useLanguageCurrency();
  const [activeTab, setActiveTab] = useState('faq');

  // Bug Report Form State
  const [bugTitle, setBugTitle] = useState('');
  const [bugDesc, setBugDesc] = useState('');
  const [bugCategory, setBugCategory] = useState('UI Glitch');

  // Feature Request Form State
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDesc, setFeatureDesc] = useState('');

  // FAQ Expand Accordion State
  const [expandedFaq, setExpandedFaq] = useState(0);

  const FAQS = [
    { q: 'How does 15-minute express food delivery work in Pakistan?', a: 'Our intelligent fleet algorithm dispatches nearest riders in Lahore, Karachi, and Islamabad within 60 seconds of order placement. Food is kept in heated thermal bags for maximum freshness.' },
    { q: 'Which local Pakistani payment gateways are supported?', a: 'We natively support JazzCash, EasyPaisa, SadaPay, NayaPay, State Bank Raast Instant IBAN, and PKR Cash on Delivery (COD).' },
    { q: 'What happens if my order is delayed or items are missing?', a: 'Our 24/7 enterprise support team automatically refunds or resends items within 5 minutes. You can also track your rider via sub-meter live GPS radar.' },
    { q: 'How do I request a tax invoice or GST receipt?', a: 'All orders generate a digital PDF receipt containing 13% GST breakdown which can be exported anytime from the My Orders section or Settings modal.' },
  ];

  if (!isOpen) return null;

  const handleSubmitBug = (e) => {
    e.preventDefault();
    if (!bugTitle.trim()) { toast.error('Please enter a bug title.'); return; }
    const ticketId = 'TICKET-PK-' + Math.floor(100000 + Math.random() * 900000);
    toast.success(`Bug report submitted! Support Ticket #${ticketId} created. 🐛`);
    setBugTitle('');
    setBugDesc('');
  };

  const handleSubmitFeature = (e) => {
    e.preventDefault();
    if (!featureTitle.trim()) { toast.error('Please enter a feature title.'); return; }
    toast.success('Thank you! Feature suggestion logged with Product Team. 💡');
    setFeatureTitle('');
    setFeatureDesc('');
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
              <HelpCircle size={22} color="#FF6B35" />
            </div>
            <div>
              <h3 style={styles.title}>
                {isRTL ? 'ہیلپ سینٹر اور سپورٹ' : 'Enterprise Help Center & Support'}
              </h3>
              <p style={styles.subtitle}>Documentation, FAQs, Bug Reporting, & Feature Requests</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Close (Esc)">
            <X size={18} color="#94A3B8" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={styles.tabBar}>
          {[
            { id: 'faq', label: isRTL ? 'سوال و جواب' : 'Knowledge Base & FAQ', icon: <MessageSquare size={15} /> },
            { id: 'bug', label: isRTL ? 'بگ رپورٹ کریں' : 'Report a Bug', icon: <Bug size={15} /> },
            { id: 'feature', label: isRTL ? 'تجویز دیں' : 'Feature Request', icon: <Lightbulb size={15} /> },
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
          {/* TAB 1: FAQ */}
          {activeTab === 'faq' && (
            <div style={styles.sectionWrap}>
              <div style={styles.contactBanner}>
                <PhoneCall size={20} color="#FF6B35" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>Need Direct Helpline Assistance in Pakistan?</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Call toll-free: <strong>0800-FOOD-DASH</strong> or email <strong>support@fooddash.pk</strong></div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {FAQS.map((faq, i) => {
                  const isExp = expandedFaq === i;
                  return (
                    <div
                      key={i}
                      onClick={() => setExpandedFaq(isExp ? -1 : i)}
                      style={{
                        ...styles.faqCard,
                        borderColor: isExp ? '#FF6B35' : '#E2E8F0',
                        background: isExp ? '#FFF7F0' : '#F8FAFC',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ ...styles.faqQuestion, color: isExp ? '#FF6B35' : '#0F172A' }}>{faq.q}</h4>
                        {isExp ? <ChevronUp size={18} color="#FF6B35" /> : <ChevronDown size={18} color="#94A3B8" />}
                      </div>
                      {isExp && (
                        <p style={styles.faqAnswer} className="animate-fade-up">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: REPORT A BUG */}
          {activeTab === 'bug' && (
            <form onSubmit={handleSubmitBug} style={styles.sectionWrap}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Issue Category</label>
                <select
                  value={bugCategory}
                  onChange={e => setBugCategory(e.target.value)}
                  style={styles.input}
                >
                  <option>UI Glitch / Layout</option>
                  <option>Payment Gateway Issue (JazzCash/EasyPaisa)</option>
                  <option>Cart / Menu Problem</option>
                  <option>GPS Radar Tracking Delay</option>
                  <option>Other Technical Issue</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Summary Title *</label>
                <input
                  type="text"
                  placeholder="e.g. JazzCash payment modal did not show OTP"
                  value={bugTitle}
                  onChange={e => setBugTitle(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Detailed Description & Steps to Reproduce</label>
                <textarea
                  rows={4}
                  placeholder="Describe what happened and how to reproduce the issue…"
                  value={bugDesc}
                  onChange={e => setBugDesc(e.target.value)}
                  style={styles.input}
                />
              </div>

              <button type="submit" style={styles.primaryBtn}>
                <Send size={16} /> Submit Bug Report & Create Ticket
              </button>
            </form>
          )}

          {/* TAB 3: FEATURE REQUEST */}
          {activeTab === 'feature' && (
            <form onSubmit={handleSubmitFeature} style={styles.sectionWrap}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Feature Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Add Raast QR code scanning at checkout"
                  value={featureTitle}
                  onChange={e => setFeatureTitle(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Why would this feature help your workflow?</label>
                <textarea
                  rows={4}
                  placeholder="Explain how this new feature improves your experience…"
                  value={featureDesc}
                  onChange={e => setFeatureDesc(e.target.value)}
                  style={styles.input}
                />
              </div>

              <button type="submit" style={styles.primaryBtn}>
                <Lightbulb size={16} /> Submit Feature Suggestion
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
            FoodDash Support Hotline: 0800-FOOD-DASH
          </span>
          <button onClick={onClose} style={styles.primaryBtn}>
            Close (Esc)
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
  sectionWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  contactBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.25rem',
    background: '#FFF7F0',
    border: '1px solid #FFE0D1',
    borderRadius: '16px',
    marginBottom: '0.5rem',
  },
  faqCard: {
    padding: '1rem 1.25rem',
    borderRadius: '16px',
    border: '1.5px solid #E2E8F0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  faqQuestion: {
    margin: 0,
    fontSize: '0.92rem',
    fontWeight: 800,
  },
  faqAnswer: {
    margin: '0.75rem 0 0',
    fontSize: '0.85rem',
    color: '#475569',
    lineHeight: 1.6,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 800,
    color: '#334155',
  },
  input: {
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: '1.5px solid #CBD5E1',
    outline: 'none',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    color: '#0F172A',
    background: '#FFFFFF',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '0.7rem 1.5rem',
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
