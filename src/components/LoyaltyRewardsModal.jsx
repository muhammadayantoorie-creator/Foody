import React, { useState } from 'react';
import { useLoyalty } from '../contexts/LoyaltyContext';
import { useLanguageCurrency } from '../contexts/LanguageCurrencyContext';
import { useNotifications, NOTIF_TYPES } from '../contexts/NotificationContext';
import { Trophy, Star, Zap, Calendar, Copy, Check, Gift, X, ChevronRight, Crown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoyaltyRewardsModal({ isOpen, onClose }) {
  const { isRTL } = useLanguageCurrency();
  const { loyalty, currentTier, nextTier, badges, tiers, checkIn, canCheckIn } = useLoyalty();
  const { addNotification, types } = useNotifications();
  const [copied, setCopied] = useState(false);

  const handleCheckIn = () => {
    const result = checkIn();
    if (result.success) {
      toast.success(`🎁 Daily check-in! +${result.points} points earned!`);
      addNotification({ title: 'Daily Check-in Bonus!', message: `You earned ${result.points} loyalty points for today's check-in!`, type: types.LOYALTY });
    } else {
      toast('✅ Already checked in today. Come back tomorrow!', { icon: '📅' });
    }
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(loyalty.referralCode);
    setCopied(true);
    toast.success('Referral code copied! 🎉');
    setTimeout(() => setCopied(false), 2000);
  };

  const progressToNext = nextTier
    ? Math.min(100, Math.round((loyalty.lifetimePoints / nextTier.minPoints) * 100))
    : 100;

  if (!isOpen) return null;

  return (
    <div style={s.backdrop} onClick={onClose}>
      <div style={{ ...s.modal, direction: isRTL ? 'rtl' : 'ltr' }} onClick={e => e.stopPropagation()} className="animate-scale-in">
        {/* Header */}
        <div style={{ ...s.header, background: `linear-gradient(135deg, ${currentTier.color}22, #FFF7F0)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ ...s.iconWrap, background: `${currentTier.color}22`, border: `1px solid ${currentTier.color}44` }}>
              <Trophy size={20} color={currentTier.color} />
            </div>
            <div>
              <h3 style={s.title}>{currentTier.emoji} {currentTier.name} Member</h3>
              <p style={s.subtitle}>FoodDash Loyalty Rewards · Pakistan</p>
            </div>
          </div>
          <button onClick={onClose} style={s.closeBtn}><X size={18} color="#94A3B8" /></button>
        </div>

        <div style={s.body}>
          {/* Points Card */}
          <div style={{ ...s.pointsCard, background: `linear-gradient(135deg, ${currentTier.color}, ${currentTier.color}99)` }}>
            <div>
              <div style={s.pointsLabel}>Available Points</div>
              <div style={s.pointsValue}>{loyalty.points.toLocaleString()}</div>
              <div style={s.lifetimeLabel}>Lifetime: {loyalty.lifetimePoints.toLocaleString()} pts</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={s.tierBadge}>{currentTier.emoji} {currentTier.name}</div>
              <div style={s.statsRow}>
                <span>📦 {loyalty.stats.totalOrders} orders</span>
              </div>
            </div>
          </div>

          {/* Progress to next tier */}
          {nextTier && (
            <div style={s.progressSection}>
              <div style={s.progressHeader}>
                <span style={s.progressLabel}>Progress to {nextTier.emoji} {nextTier.name}</span>
                <span style={s.progressCount}>{loyalty.lifetimePoints} / {nextTier.minPoints} pts</span>
              </div>
              <div style={s.progressBar}>
                <div style={{ ...s.progressFill, width: `${progressToNext}%`, background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier.color})` }} />
              </div>
              <div style={s.progressPerks}>
                <Crown size={12} color="#F59E0B" />
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Next: {nextTier.perks[0]}</span>
              </div>
            </div>
          )}

          {/* Daily Check-in */}
          <button
            onClick={handleCheckIn}
            style={{ ...s.checkInBtn, opacity: canCheckIn ? 1 : 0.6 }}
          >
            <Calendar size={18} color={canCheckIn ? '#FFFFFF' : '#94A3B8'} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{canCheckIn ? '🎁 Daily Check-in Available!' : '✅ Checked in today'}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>+50 points · Come back tomorrow</div>
            </div>
          </button>

          {/* Referral code */}
          <div style={s.referralBox}>
            <div style={s.referralTitle}><Gift size={14} color="#A855F7" /> Referral Code — Earn 250 pts per friend</div>
            <div style={s.referralRow}>
              <code style={s.referralCode}>{loyalty.referralCode}</code>
              <button onClick={handleCopyReferral} style={s.copyBtn}>
                {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} color="#6366F1" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Badges */}
          <div style={s.badgesSection}>
            <div style={s.sectionTitle}><Star size={13} color="#F59E0B" /> Achievement Badges</div>
            <div style={s.badgeGrid}>
              {badges.map(badge => {
                const earned = loyalty.earnedBadges.includes(badge.id);
                return (
                  <div key={badge.id} style={{ ...s.badgeCard, opacity: earned ? 1 : 0.4, border: earned ? '2px solid #FFB703' : '2px solid #E2E8F0', background: earned ? '#FFFBEB' : '#F8FAFC' }} title={badge.desc}>
                    <div style={s.badgeEmoji}>{badge.emoji}</div>
                    <div style={s.badgeName}>{badge.name}</div>
                    {earned && <div style={s.earnedCheck}><Check size={8} color="#FFFFFF" /></div>}
                    <div style={s.badgePoints}>+{badge.points}pts</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tier benefits */}
          <div style={s.tiersRow}>
            <div style={s.sectionTitle}>🏆 Tier Benefits</div>
            {tiers.map(tier => (
              <div key={tier.id} style={{ ...s.tierRow, background: currentTier.id === tier.id ? `${tier.color}12` : '#F8FAFC', border: `1.5px solid ${currentTier.id === tier.id ? tier.color : '#E2E8F0'}` }}>
                <span style={s.tierEmoji}>{tier.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: tier.color }}>{tier.name} ({tier.minPoints.toLocaleString()}+ pts)</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{tier.perks[0]}</div>
                </div>
                {currentTier.id === tier.id && <span style={{ fontSize: '0.7rem', fontWeight: 800, color: tier.color }}>CURRENT</span>}
              </div>
            ))}
          </div>
        </div>

        <div style={s.footer}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Points expire after 12 months of inactivity</span>
          <button onClick={onClose} style={s.primaryBtn}>Close</button>
        </div>
      </div>
    </div>
  );
}

const s = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(11,15,25,0.72)', backdropFilter: 'blur(10px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' },
  modal: { width: '100%', maxWidth: '500px', background: 'var(--card-bg,#FFFFFF)', borderRadius: '24px', boxShadow: '0 32px 64px rgba(0,0,0,0.28)', border: '1.5px solid var(--border-color,#F1F5F9)', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9' },
  iconWrap: { width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' },
  subtitle: { margin: '2px 0 0', fontSize: '0.75rem', color: '#64748B' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px' },
  body: { overflowY: 'auto', flex: 1, padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  pointsCard: { borderRadius: '18px', padding: '1.25rem', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
  pointsLabel: { fontSize: '0.75rem', fontWeight: 700, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.05em' },
  pointsValue: { fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em' },
  lifetimeLabel: { fontSize: '0.72rem', opacity: 0.75, marginTop: '4px' },
  tierBadge: { background: 'rgba(255,255,255,0.25)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, marginBottom: '4px', display: 'inline-block' },
  statsRow: { fontSize: '0.75rem', opacity: 0.85 },
  progressSection: { display: 'flex', flexDirection: 'column', gap: '6px' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: '0.8rem', fontWeight: 700, color: '#334155' },
  progressCount: { fontSize: '0.75rem', color: '#64748B', fontWeight: 600 },
  progressBar: { height: '10px', background: '#E2E8F0', borderRadius: '20px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '20px', transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' },
  progressPerks: { display: 'flex', alignItems: 'center', gap: '5px' },
  checkInBtn: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', background: 'linear-gradient(135deg, #A855F7, #7C3AED)', color: '#FFFFFF', border: 'none', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(168,85,247,0.35)', transition: 'all 0.2s', width: '100%' },
  referralBox: { background: '#F5F3FF', border: '1.5px solid #DDD6FE', borderRadius: '14px', padding: '1rem' },
  referralTitle: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 800, color: '#7C3AED', marginBottom: '0.5rem' },
  referralRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  referralCode: { flex: 1, background: '#FFFFFF', border: '1px solid #C4B5FD', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.9rem', fontWeight: 800, color: '#5B21B6', letterSpacing: '0.05em' },
  copyBtn: { display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 0.85rem', background: '#FFFFFF', border: '1px solid #C4B5FD', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', color: '#6366F1' },
  badgesSection: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' },
  badgeGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' },
  badgeCard: { borderRadius: '12px', padding: '0.6rem 0.4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', position: 'relative', transition: 'all 0.2s', cursor: 'default' },
  badgeEmoji: { fontSize: '1.5rem' },
  badgeName: { fontSize: '0.62rem', fontWeight: 800, color: '#334155', textAlign: 'center', lineHeight: 1.2 },
  earnedCheck: { position: 'absolute', top: '4px', right: '4px', background: '#10B981', width: '14px', height: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badgePoints: { fontSize: '0.6rem', color: '#F59E0B', fontWeight: 800 },
  tiersRow: { display: 'flex', flexDirection: 'column', gap: '6px' },
  tierRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0.65rem 0.875rem', borderRadius: '12px', transition: 'all 0.2s' },
  tierEmoji: { fontSize: '1.25rem', flexShrink: 0 },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.5rem', borderTop: '1px solid #F1F5F9', background: '#FAFAFA' },
  primaryBtn: { padding: '0.55rem 1.25rem', background: 'linear-gradient(135deg, #FF6B35, #FF8C42)', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' },
};
