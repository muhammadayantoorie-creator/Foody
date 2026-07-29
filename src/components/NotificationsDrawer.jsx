import React from 'react';
import { Bell, X, CheckCircle2, Truck, Tag, Sparkles } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'Order Delivered!',
    desc: 'Your Double Bacon Smash Burger from Artisan Burger Co. has been delivered.',
    time: '2 mins ago',
    icon: CheckCircle2,
    color: '#2EC4B6',
    unread: true,
  },
  {
    id: 2,
    title: 'Rider Assigned 🛵',
    desc: 'Marcus Vance is heading to Pizza Napoli to pick up your Margherita Pizza.',
    time: '15 mins ago',
    icon: Truck,
    color: '#FF6B35',
    unread: true,
  },
  {
    id: 3,
    title: 'Exclusive 20% OFF Drop',
    desc: 'Use promo code FOODDASH10 on all orders above $20 today.',
    time: '1 hour ago',
    icon: Tag,
    color: '#FFB703',
    unread: false,
  },
];

export default function NotificationsDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={s.overlay}>
      <div style={s.backdrop} onClick={onClose} />
      <div style={s.drawer} className="animate-fade-up">
        <div style={s.header}>
          <div style={s.titleGroup}>
            <Bell size={20} color="#FF6B35" />
            <h3 style={s.title}>Notifications</h3>
            <span style={s.badge}>2 New</span>
          </div>
          <button style={s.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={s.list}>
          {NOTIFICATIONS.map(n => {
            const Icon = n.icon;
            return (
              <div key={n.id} style={{ ...s.item, background: n.unread ? 'rgba(255,107,53,0.04)' : '#FFFFFF' }}>
                <div style={{ ...s.iconCircle, background: `${n.color}15`, color: n.color }}>
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={s.itemTitleRow}>
                    <span style={s.itemTitle}>{n.title}</span>
                    <span style={s.itemTime}>{n.time}</span>
                  </div>
                  <p style={s.itemDesc}>{n.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 99999,
    display: 'flex', justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
  },
  drawer: {
    position: 'relative', zIndex: 10, width: '380px', height: '100%',
    background: '#FFFFFF', boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
    display: 'flex', flexDirection: 'column', padding: '1.5rem',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9', marginBottom: '1rem',
  },
  titleGroup: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  title: { margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0B0F19', fontFamily: 'var(--font-heading)' },
  badge: { fontSize: '0.7rem', fontWeight: 800, background: '#FF6B35', color: '#fff', padding: '2px 8px', borderRadius: '10px' },
  closeBtn: { background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '4px', cursor: 'pointer' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.8rem', overflowY: 'auto' },
  item: { display: 'flex', gap: '0.8rem', padding: '0.9rem', borderRadius: '14px', border: '1px solid #F1F5F9' },
  iconCircle: { width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' },
  itemTitle: { fontSize: '0.88rem', fontWeight: 800, color: '#0B0F19' },
  itemTime: { fontSize: '0.7rem', color: '#94A3B8' },
  itemDesc: { margin: 0, fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 },
};
