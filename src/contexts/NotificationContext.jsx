import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const NotificationContext = createContext();

let _nextId = 1;

// Notification categories
export const NOTIF_TYPES = {
  ORDER: 'order',
  PROMO: 'promo',
  SYSTEM: 'system',
  LOYALTY: 'loyalty',
  SECURITY: 'security',
};

const CATEGORY_META = {
  [NOTIF_TYPES.ORDER]: { label: 'Orders', emoji: '🛵', color: '#FF6B35' },
  [NOTIF_TYPES.PROMO]: { label: 'Promotions', emoji: '🎁', color: '#F59E0B' },
  [NOTIF_TYPES.SYSTEM]: { label: 'System', emoji: '⚙️', color: '#3B82F6' },
  [NOTIF_TYPES.LOYALTY]: { label: 'Rewards', emoji: '🏆', color: '#A855F7' },
  [NOTIF_TYPES.SECURITY]: { label: 'Security', emoji: '🔒', color: '#EF4444' },
};

function loadSaved() {
  try {
    const raw = localStorage.getItem('fooddash_notifications');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(loadSaved);
  const [isOpen, setIsOpen] = useState(false);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('fooddash_notifications', JSON.stringify(notifications.slice(0, 50)));
    } catch {}
  }, [notifications]);

  // Request desktop permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const addNotification = useCallback(({ title, message, type = NOTIF_TYPES.SYSTEM, priority = 'normal', action = null }) => {
    const notif = {
      id: _nextId++,
      title,
      message,
      type,
      priority, // 'low' | 'normal' | 'high' | 'critical'
      action,
      read: false,
      timestamp: new Date().toISOString(),
    };

    setNotifications(prev => [notif, ...prev]);

    // Desktop push notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const meta = CATEGORY_META[type] || CATEGORY_META[NOTIF_TYPES.SYSTEM];
        new Notification(`${meta.emoji} ${title}`, {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: String(notif.id),
        });
      } catch {}
    }

    return notif.id;
  }, []);

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isOpen,
      setIsOpen,
      addNotification,
      markRead,
      markAllRead,
      removeNotification,
      clearAll,
      categoryMeta: CATEGORY_META,
      types: NOTIF_TYPES,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
