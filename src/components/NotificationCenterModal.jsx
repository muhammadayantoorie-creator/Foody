import React, { useState } from 'react';
import { useNotifications, NOTIF_TYPES } from '../contexts/NotificationContext';
import { useLanguageCurrency } from '../contexts/LanguageCurrencyContext';
import { Bell, X, Check, CheckCheck, Trash2, Package, Tag, Settings, Trophy, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  [NOTIF_TYPES.ORDER]: Package,
  [NOTIF_TYPES.PROMO]: Tag,
  [NOTIF_TYPES.SYSTEM]: Settings,
  [NOTIF_TYPES.LOYALTY]: Trophy,
  [NOTIF_TYPES.SECURITY]: Shield,
};

const PRIORITY_STYLES = {
  critical: { borderLeft: '4px solid #EF4444', background: '#FFF5F5' },
  high:     { borderLeft: '4px solid #F97316', background: '#FFF7F0' },
  normal:   { borderLeft: '4px solid #3B82F6', background: 'transparent' },
  low:      { borderLeft: '4px solid #CBD5E1', background: 'transparent' },
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationCenterModal({ isOpen, onClose }) {
  const { isRTL } = useLanguageCurrency();
  const { notifications, unreadCount, markRead, markAllRead, removeNotification, clearAll, categoryMeta } = useNotifications();
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeFilter);

  const handleMarkRead = (id) => {
    markRead(id);
  };

  const handleMarkAllRead = () => {
    markAllRead();
    toast.success('All notifications marked as read ✓');
  };

  const handleClearAll = () => {
    clearAll();
    toast.success('Notification history cleared');
  };

  if (!isOpen) return null;

  return (
    <div style={s.backdrop} onClick={onClose}>
      <div style={{ ...s.modal, direction: isRTL ? 'rtl' : 'ltr' }} onClick={e => e.stopPropagation()} className="animate-scale-in">
        {/* Header */}
        <div style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={s.bellWrap}>
              <Bell size={20} color="#FF6B35" />
              {unreadCount > 0 && <span style={s.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </div>
            <div>
              <h3 style={s.title}>Notification Center</h3>
              <p style={s.subtitle}>{unreadCount} unread · {notifications.length} total</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} style={s.actionBtn} title="Mark all read">
                <CheckCheck size={15} color="#10B981" />
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={handleClearAll} style={s.actionBtn} title="Clear all">
                <Trash2 size={15} color="#EF4444" />
              </button>
            )}
            <button onClick={onClose} style={s.actionBtn}><X size={16} color="#94A3B8" /></button>
          </div>
        </div>

        {/* Category filters */}
        <div style={s.filterBar}>
          <button
            onClick={() => setActiveFilter('all')}
            style={{ ...s.filterBtn, background: activeFilter === 'all' ? '#FF6B35' : '#F1F5F9', color: activeFilter === 'all' ? '#FFFFFF' : '#475569' }}
          >
            All {notifications.length > 0 && `(${notifications.length})`}
          </button>
          {Object.entries(categoryMeta).map(([type, meta]) => {
            const count = notifications.filter(n => n.type === type).length;
            if (count === 0) return null;
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                style={{ ...s.filterBtn, background: activeFilter === type ? meta.color : '#F1F5F9', color: activeFilter === type ? '#FFFFFF' : '#475569' }}
              >
                {meta.emoji} {meta.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Notification list */}
        <div style={s.list}>
          {filtered.length === 0 && (
            <div style={s.empty}>
              <Bell size={40} color="#E2E8F0" />
              <p style={{ color: '#94A3B8', fontWeight: 600, margin: '0.5rem 0 0' }}>No notifications yet</p>
              <p style={{ color: '#CBD5E1', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>You'll see order updates, promotions, and rewards here</p>
            </div>
          )}

          {filtered.map(notif => {
            const Icon = CATEGORY_ICONS[notif.type] || Bell;
            const meta = categoryMeta[notif.type];
            return (
              <div
                key={notif.id}
                style={{ ...s.notifItem, ...PRIORITY_STYLES[notif.priority || 'normal'], opacity: notif.read ? 0.65 : 1 }}
                onClick={() => handleMarkRead(notif.id)}
              >
                <div style={{ ...s.notifIcon, background: `${meta?.color}18`, color: meta?.color }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.notifTitle}>
                    {!notif.read && <span style={s.unreadDot} />}
                    {notif.title}
                  </div>
                  <div style={s.notifMsg}>{notif.message}</div>
                  <div style={s.notifTime}>{meta?.emoji} {meta?.label} · {timeAgo(notif.timestamp)}</div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); removeNotification(notif.id); }}
                  style={s.removeBtn}
                  title="Remove"
                >
                  <X size={12} color="#94A3B8" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={s.footer}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
            Desktop notifications: {Notification.permission === 'granted' ? '✅ Enabled' : '❌ Disabled'}
          </span>
          <button onClick={onClose} style={s.primaryBtn}>Close</button>
        </div>
      </div>
    </div>
  );
}

const s = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(11,15,25,0.72)', backdropFilter: 'blur(10px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' },
  modal: { width: '100%', maxWidth: '520px', background: 'var(--card-bg,#FFFFFF)', borderRadius: '24px', boxShadow: '0 32px 64px rgba(0,0,0,0.28)', border: '1.5px solid var(--border-color,#F1F5F9)', display: 'flex', flexDirection: 'column', maxHeight: '82vh', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' },
  bellWrap: { width: '40px', height: '40px', borderRadius: '12px', background: '#FFF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #FFE0D1', position: 'relative' },
  badge: { position: 'absolute', top: '-5px', right: '-5px', background: '#EF4444', color: '#FFFFFF', fontSize: '0.6rem', fontWeight: 900, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #FFFFFF' },
  title: { margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' },
  subtitle: { margin: '2px 0 0', fontSize: '0.75rem', color: '#64748B' },
  actionBtn: { background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  filterBar: { display: 'flex', gap: '6px', padding: '0.75rem 1.5rem', background: '#F8FAFC', borderBottom: '1px solid #F1F5F9', overflowX: 'auto', flexWrap: 'nowrap' },
  filterBtn: { padding: '0.3rem 0.75rem', borderRadius: '20px', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' },
  list: { overflowY: 'auto', flex: 1, padding: '0.5rem 0' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', textAlign: 'center' },
  notifItem: { display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '0.8rem 1.25rem', cursor: 'pointer', transition: 'background 0.15s', marginBottom: '2px' },
  notifIcon: { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' },
  notifTitle: { fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' },
  unreadDot: { width: '7px', height: '7px', borderRadius: '50%', background: '#FF6B35', flexShrink: 0 },
  notifMsg: { fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 },
  notifTime: { fontSize: '0.7rem', color: '#94A3B8', marginTop: '4px', fontWeight: 500 },
  removeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', flexShrink: 0 },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.5rem', borderTop: '1px solid #F1F5F9', background: '#FAFAFA' },
  primaryBtn: { padding: '0.55rem 1.25rem', background: 'linear-gradient(135deg, #FF6B35, #FF8C42)', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' },
};
