import React, { useMemo } from 'react';
import { useLoyalty } from '../contexts/LoyaltyContext';
import { useLanguageCurrency } from '../contexts/LanguageCurrencyContext';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Sparkles, X, TrendingUp, Clock, Star, Award, Zap, Brain } from 'lucide-react';

// Mock smart data
const WEEKLY_SPENDING = [
  { day: 'Mon', amount: 450, orders: 2 },
  { day: 'Tue', amount: 890, orders: 3 },
  { day: 'Wed', amount: 320, orders: 1 },
  { day: 'Thu', amount: 1240, orders: 5 },
  { day: 'Fri', amount: 2100, orders: 8 },
  { day: 'Sat', amount: 1850, orders: 7 },
  { day: 'Sun', amount: 980, orders: 4 },
];

const CUISINE_DIST = [
  { name: 'Burgers', value: 38, color: '#FF6B35' },
  { name: 'Pizza', value: 27, color: '#F59E0B' },
  { name: 'Desi', value: 22, color: '#10B981' },
  { name: 'Sushi', value: 13, color: '#8B5CF6' },
];

const PEAK_HOURS = [
  { hour: '8am', score: 20 }, { hour: '10am', score: 35 }, { hour: '12pm', score: 80 },
  { hour: '2pm', score: 55 }, { hour: '4pm', score: 40 }, { hour: '6pm', score: 70 },
  { hour: '8pm', score: 95 }, { hour: '10pm', score: 75 }, { hour: '12am', score: 30 },
];

const AI_INSIGHTS = [
  { icon: '🍔', text: 'You order Burgers 38% of the time — highest in your area!', type: 'info' },
  { icon: '🕗', text: 'Your peak ordering time is 8–10 PM. Consider scheduling orders for faster delivery.', type: 'tip' },
  { icon: '💰', text: 'You save an average of Rs. 340/week using discount codes. Keep it up!', type: 'success' },
  { icon: '🔥', text: 'Your order streak is growing! Order tomorrow to keep the streak alive.', type: 'alert' },
  { icon: '🎯', text: 'You\'re 250 pts away from Gold tier — place 3 more orders this week!', type: 'goal' },
];

function getProductivityScore(stats) {
  let score = 40; // base
  if (stats.totalOrders >= 1) score += 10;
  if (stats.totalOrders >= 5) score += 15;
  if (stats.totalOrders >= 10) score += 15;
  if (stats.streak >= 3) score += 10;
  if (stats.reviews >= 2) score += 10;
  return Math.min(100, score);
}

export default function SmartInsightsModal({ isOpen, onClose }) {
  const { isRTL, formatPrice } = useLanguageCurrency();
  const { loyalty } = useLoyalty();

  const prodScore = useMemo(() => getProductivityScore(loyalty.stats), [loyalty.stats]);

  const scoreColor = prodScore >= 80 ? '#10B981' : prodScore >= 50 ? '#F59E0B' : '#EF4444';
  const scoreLabel = prodScore >= 80 ? 'Excellent Foodie!' : prodScore >= 50 ? 'Good Engagement' : 'Getting Started';

  if (!isOpen) return null;

  return (
    <div style={s.backdrop} onClick={onClose}>
      <div style={{ ...s.modal, direction: isRTL ? 'rtl' : 'ltr' }} onClick={e => e.stopPropagation()} className="animate-scale-in">
        {/* Header */}
        <div style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={s.iconWrap}><Brain size={20} color="#8B5CF6" /></div>
            <div>
              <h3 style={s.title}>Smart Insights</h3>
              <p style={s.subtitle}>AI-powered analytics about your food habits</p>
            </div>
          </div>
          <button onClick={onClose} style={s.closeBtn}><X size={18} color="#94A3B8" /></button>
        </div>

        <div style={s.body}>
          {/* Productivity Score */}
          <div style={s.scoreCard}>
            <div style={{ flex: 1 }}>
              <div style={s.scoreLabel}>Foodie Score</div>
              <div style={{ ...s.scoreValue, color: scoreColor }}>{prodScore}</div>
              <div style={{ ...s.scoreBadge, background: `${scoreColor}18`, color: scoreColor }}>{scoreLabel}</div>
            </div>
            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
              {/* Circular progress */}
              <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="40" cy="40" r="32" fill="none" stroke="#E2E8F0" strokeWidth="8" />
                <circle cx="40" cy="40" r="32" fill="none" stroke={scoreColor} strokeWidth="8"
                  strokeDasharray={`${(prodScore / 100) * 201} 201`}
                  strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 900, color: scoreColor }}>
                {prodScore}
              </div>
            </div>
          </div>

          {/* KPI Strip */}
          <div style={s.kpiRow}>
            {[
              { label: 'Total Orders', value: loyalty.stats.totalOrders || 0, icon: '📦', color: '#FF6B35' },
              { label: 'Streak Days', value: loyalty.stats.streak || 0, icon: '🔥', color: '#F97316' },
              { label: 'Points Earned', value: loyalty.lifetimePoints, icon: '⭐', color: '#F59E0B' },
            ].map((kpi, i) => (
              <div key={i} style={{ ...s.kpiCard, borderTop: `3px solid ${kpi.color}` }}>
                <div style={s.kpiIcon}>{kpi.icon}</div>
                <div style={{ ...s.kpiValue, color: kpi.color }}>{kpi.value.toLocaleString()}</div>
                <div style={s.kpiLabel}>{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Weekly spending chart */}
          <div style={s.chartCard}>
            <div style={s.chartTitle}><TrendingUp size={14} color="#FF6B35" /> Weekly Spending (PKR)</div>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={WEEKLY_SPENDING} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip formatter={(v) => [`Rs. ${v}`, 'Spending']} contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.78rem' }} />
                <Area type="monotone" dataKey="amount" stroke="#FF6B35" strokeWidth={2} fill="url(#spendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Peak hours + cuisine split */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={s.chartCard}>
              <div style={s.chartTitle}><Clock size={13} color="#3B82F6" /> Peak Order Hours</div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={PEAK_HOURS} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <XAxis dataKey="hour" tick={{ fontSize: 8, fill: '#94A3B8' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={s.chartCard}>
              <div style={s.chartTitle}><Star size={13} color="#A855F7" /> Cuisine Split</div>
              <ResponsiveContainer width="100%" height={100}>
                <PieChart>
                  <Pie data={CUISINE_DIST} cx="50%" cy="50%" outerRadius={42} dataKey="value" label={({ name, value }) => `${value}%`} labelLine={false}
                    style={{ fontSize: '8px' }}>
                    {CUISINE_DIST.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ borderRadius: '8px', fontSize: '0.72rem' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={s.legendRow}>
                {CUISINE_DIST.map((d, i) => (
                  <span key={i} style={s.legendItem}><span style={{ ...s.legendDot, background: d.color }} />{d.name}</span>
                ))}
              </div>
            </div>
          </div>

          {/* AI Insights List */}
          <div style={s.insightsSection}>
            <div style={s.chartTitle}><Sparkles size={14} color="#8B5CF6" /> AI Recommendations</div>
            {AI_INSIGHTS.map((insight, i) => (
              <div key={i} style={s.insightItem} className="animate-fade-up">
                <span style={s.insightIcon}>{insight.icon}</span>
                <span style={s.insightText}>{insight.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={s.footer}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>AI insights update every 24h · FoodDash Intelligence</span>
          <button onClick={onClose} style={s.primaryBtn}>Close</button>
        </div>
      </div>
    </div>
  );
}

const s = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(11,15,25,0.72)', backdropFilter: 'blur(10px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' },
  modal: { width: '100%', maxWidth: '560px', background: 'var(--card-bg,#FFFFFF)', borderRadius: '24px', boxShadow: '0 32px 64px rgba(0,0,0,0.28)', border: '1.5px solid var(--border-color,#F1F5F9)', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' },
  iconWrap: { width: '40px', height: '40px', borderRadius: '12px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #DDD6FE' },
  title: { margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' },
  subtitle: { margin: '2px 0 0', fontSize: '0.75rem', color: '#64748B' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px' },
  body: { overflowY: 'auto', flex: 1, padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  scoreCard: { display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)', borderRadius: '18px', padding: '1.25rem', border: '1px solid #DDD6FE' },
  scoreLabel: { fontSize: '0.72rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' },
  scoreValue: { fontSize: '3rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em' },
  scoreBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, marginTop: '6px' },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' },
  kpiCard: { background: '#F8FAFC', borderRadius: '14px', padding: '0.85rem 0.75rem', border: '1px solid #E2E8F0', textAlign: 'center' },
  kpiIcon: { fontSize: '1.4rem', marginBottom: '4px' },
  kpiValue: { fontSize: '1.5rem', fontWeight: 900, lineHeight: 1 },
  kpiLabel: { fontSize: '0.68rem', color: '#64748B', fontWeight: 600, marginTop: '2px' },
  chartCard: { background: '#F8FAFC', borderRadius: '16px', padding: '0.875rem', border: '1px solid #E2E8F0' },
  chartTitle: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.04em' },
  legendRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px', justifyContent: 'center' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: '#64748B', fontWeight: 600 },
  legendDot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
  insightsSection: { display: 'flex', flexDirection: 'column', gap: '8px' },
  insightItem: { display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '0.75rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' },
  insightIcon: { fontSize: '1.1rem', flexShrink: 0 },
  insightText: { fontSize: '0.82rem', color: '#334155', lineHeight: 1.5, fontWeight: 500 },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.5rem', borderTop: '1px solid #F1F5F9', background: '#FAFAFA' },
  primaryBtn: { padding: '0.55rem 1.25rem', background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' },
};
