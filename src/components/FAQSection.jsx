import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

const FAQS = [
  {
    q: "How fast is FoodDash Express delivery?",
    a: "Our average delivery time is 15 to 25 minutes. Our AI dispatch algorithm automatically assigns your order to the nearest available delivery rider as soon as the kitchen begins preparation."
  },
  {
    q: "Can I track my delivery rider in real time?",
    a: "Yes! FoodDash provides an interactive live GPS radar map. You can watch your rider navigate in real time with sub-meter accuracy, along with live thermal box temperature readouts and ETA countdowns."
  },
  {
    q: "What payment methods are supported?",
    a: "We support Apple Pay, Google Pay, Visa, Mastercard, American Express, Stripe 256-bit encrypted checkout, and Cash on Delivery."
  },
  {
    q: "How does FoodDash ensure max safety and food quality?",
    a: "All partner restaurants strictly adhere to certified Max Safety protocols. Dishes are packed in eco-friendly, tamper-evident thermal-insulated packaging to preserve heat and freshness."
  },
  {
    q: "Can I filter by dietary preferences like Veg Only or Organic?",
    a: "Yes! Use our quick search filter bar to toggle Veg Only, Gluten-Free, Vegan, or Organic items instantly with one tap."
  },
  {
    q: "What is the FoodDash On-Time Delivery Guarantee?",
    a: "If your order arrives past the estimated time window due to traffic or weather delays, our automated system credits $5 to your FoodDash wallet for your next order."
  }
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? -1 : idx);
  };

  return (
    <section id="faq" style={s.section}>
      <div style={s.headerCenter}>
        <div style={s.badge}>
          <HelpCircle size={14} color="#FF6B35" />
          <span>FREQUENTLY ASKED QUESTIONS</span>
        </div>
        <h2 style={s.title}>Got Questions? We Have Answers</h2>
        <p style={s.subtitle}>Everything you need to know about FoodDash Enterprise delivery service</p>
      </div>

      <div style={s.faqGrid}>
        {FAQS.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              style={{
                ...s.faqCard,
                ...(isOpen ? s.faqCardOpen : {}),
              }}
              onClick={() => toggle(idx)}
              className="hover-lift"
            >
              <div style={s.questionRow}>
                <h3 style={s.questionText}>{item.q}</h3>
                <div style={{ ...s.iconWrap, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <ChevronDown size={18} color={isOpen ? '#FF6B35' : '#64748B'} />
                </div>
              </div>

              {isOpen && (
                <div style={s.answerWrap}>
                  <p style={s.answerText}>{item.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

const s = {
  section: {
    maxWidth: '1000px',
    margin: '4rem auto',
    padding: '0 1.5rem',
  },
  headerCenter: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    background: 'rgba(255,107,53,0.08)',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 800,
    color: '#FF6B35',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: 900,
    fontFamily: 'var(--font-heading)',
    color: '#0B0F19',
    margin: 0,
    letterSpacing: '-0.03em',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#64748B',
    margin: '0.5rem 0 0 0',
  },
  faqGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  faqCard: {
    background: '#FFFFFF',
    border: '1.5px solid #F1F5F9',
    borderRadius: '20px',
    padding: '1.25rem 1.5rem',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
  },
  faqCardOpen: {
    borderColor: '#FF6B35',
    boxShadow: '0 8px 24px rgba(255,107,53,0.12)',
    background: '#FFFDFB',
  },
  questionRow: {
    display: 'flex',
    justify: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  questionText: {
    fontSize: '1.05rem',
    fontWeight: 800,
    color: '#0B0F19',
    margin: 0,
    fontFamily: 'var(--font-heading)',
  },
  iconWrap: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#F8FAFC',
    display: 'flex',
    alignItems: 'center',
    justify: 'center',
    transition: 'transform 0.3s ease',
    flexShrink: 0,
  },
  answerWrap: {
    marginTop: '0.85rem',
    paddingTop: '0.85rem',
    borderTop: '1px solid #F1F5F9',
  },
  answerText: {
    fontSize: '0.92rem',
    color: '#475569',
    lineHeight: 1.6,
    margin: 0,
  },
};
