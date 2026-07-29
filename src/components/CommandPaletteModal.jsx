import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageCurrency } from '../contexts/LanguageCurrencyContext';
import { useCart } from '../contexts/CartContext';
import {
  Search, Command, Moon, Sun, Globe, DollarSign, ArrowRight,
  ShoppingBag, Shield, Truck, Settings, HelpCircle, FileText, Download, X
} from 'lucide-react';

export default function CommandPaletteModal({ isOpen, onClose, onOpenSettings, onOpenShortcuts }) {
  const navigate = useNavigate();
  const { language, toggleLanguage, currency, toggleCurrency, t, isRTL } = useLanguageCurrency();
  const { toggleSidebar } = useCart();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Command palette items
  const COMMAND_ITEMS = [
    {
      category: 'Navigation',
      id: 'nav-home',
      title: isRTL ? 'ہوم اسکرین' : 'Go to Home / Dashboard',
      shortcut: 'G H',
      icon: <Search size={16} color="#FF6B35" />,
      action: () => { navigate('/dashboard'); onClose(); }
    },
    {
      category: 'Navigation',
      id: 'nav-orders',
      title: isRTL ? 'میرے تمام آرڈرز' : 'My Orders & Real-Time Tracking',
      shortcut: 'G O',
      icon: <ShoppingBag size={16} color="#2EC4B6" />,
      action: () => { navigate('/my-orders'); onClose(); }
    },
    {
      category: 'Navigation',
      id: 'nav-cart',
      title: isRTL ? 'شاپنگ کارٹ کھولیں' : 'Open Shopping Cart Drawer',
      shortcut: 'Ctrl + B',
      icon: <ShoppingBag size={16} color="#FFB703" />,
      action: () => { toggleSidebar(); onClose(); }
    },
    {
      category: 'Navigation',
      id: 'nav-admin',
      title: isRTL ? 'ایڈمن پورٹل' : 'Go to Admin Operations Center',
      shortcut: 'G A',
      icon: <Shield size={16} color="#6366F1" />,
      action: () => { navigate('/admin'); onClose(); }
    },
    {
      category: 'Navigation',
      id: 'nav-rider',
      title: isRTL ? 'رائڈر پورٹل' : 'Go to Delivery Rider Portal',
      shortcut: 'G R',
      icon: <Truck size={16} color="#10B981" />,
      action: () => { navigate('/rider'); onClose(); }
    },
    {
      category: 'Pakistan Enterprise Settings',
      id: 'act-lang',
      title: language === 'en' ? 'زبان تبدیل کریں (Switch to Urdu اردو)' : 'Switch Language to English',
      shortcut: 'Ctrl + Shift + U',
      icon: <Globe size={16} color="#EC4899" />,
      action: () => { toggleLanguage(); onClose(); }
    },
    {
      category: 'Pakistan Enterprise Settings',
      id: 'act-curr',
      title: currency === 'PKR' ? 'Switch Currency to USD ($)' : 'کرنسی تبدیل کریں (Switch to Pakistani Rupee PKR ₨)',
      shortcut: 'Ctrl + Shift + C',
      icon: <DollarSign size={16} color="#F59E0B" />,
      action: () => { toggleCurrency(); onClose(); }
    },
    {
      category: 'Pakistan Enterprise Settings',
      id: 'act-settings',
      title: isRTL ? 'سسٹم سیٹنگز اور بیک اپ' : 'Open System Settings & Data Backup',
      shortcut: 'Ctrl + S',
      icon: <Settings size={16} color="#3B82F6" />,
      action: () => { onClose(); if (onOpenSettings) onOpenSettings(); }
    },
    {
      category: 'Pakistan Enterprise Settings',
      id: 'act-shortcuts',
      title: isRTL ? 'کی بورڈ شارٹ کٹس دیکھیں' : 'View Keyboard Shortcuts Sheet',
      shortcut: '?',
      icon: <HelpCircle size={16} color="#8B5CF6" />,
      action: () => { onClose(); if (onOpenShortcuts) onOpenShortcuts(); }
    },
    {
      category: 'Popular Pakistan Cuisine',
      id: 'food-biryani',
      title: isRTL ? 'شاہی چکن بریانی' : 'Shahi Chicken Biryani & Karahi',
      shortcut: 'Food',
      icon: <Search size={16} color="#FF6B35" />,
      action: () => { navigate('/dashboard'); onClose(); }
    },
    {
      category: 'Popular Pakistan Cuisine',
      id: 'food-burger',
      title: isRTL ? 'گورمے زنگر اور اسمیش برگر' : 'Gourmet Zinger & Smash Burgers',
      shortcut: 'Food',
      icon: <Search size={16} color="#FF6B35" />,
      action: () => { navigate('/dashboard'); onClose(); }
    },
    {
      category: 'Popular Pakistan Cuisine',
      id: 'food-pizza',
      title: isRTL ? 'وُڈ فائرڈ پزا اور پاستا' : 'Wood-Fired Pizza & Crusts',
      shortcut: 'Food',
      icon: <Search size={16} color="#FF6B35" />,
      action: () => { navigate('/dashboard'); onClose(); }
    }
  ];

  const filteredItems = COMMAND_ITEMS.filter(item => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.shortcut && item.shortcut.toLowerCase().includes(q))
    );
  });

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div
        style={{ ...styles.paletteModal, direction: isRTL ? 'rtl' : 'ltr' }}
        onClick={e => e.stopPropagation()}
        className="animate-scale-in"
      >
        {/* Search Input Header */}
        <div style={styles.header}>
          <Search size={20} color="#94A3B8" style={{ margin: '0 0.5rem' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            style={styles.searchInput}
          />
          <button onClick={onClose} style={styles.closeBtn} title="Close (Esc)">
            <X size={18} color="#94A3B8" />
          </button>
        </div>

        {/* Results List */}
        <div style={styles.listWrap}>
          {filteredItems.length === 0 ? (
            <div style={styles.emptyState}>
              <Search size={32} color="#94A3B8" />
              <p style={{ margin: '0.8rem 0 0', fontWeight: 600, color: '#64748B' }}>
                {isRTL ? 'کوئی نیتجہ نہیں ملا' : `No commands found for "${query}"`}
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    ...styles.itemRow,
                    background: isSelected ? 'rgba(255, 107, 53, 0.12)' : 'transparent',
                    borderLeft: isSelected && !isRTL ? '3px solid #FF6B35' : '3px solid transparent',
                    borderRight: isSelected && isRTL ? '3px solid #FF6B35' : '3px solid transparent',
                  }}
                >
                  <div style={styles.itemIcon}>{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...styles.itemTitle, color: isSelected ? '#FF6B35' : '#0F172A' }}>
                      {item.title}
                    </div>
                    <div style={styles.itemCategory}>{item.category}</div>
                  </div>
                  {item.shortcut && (
                    <span style={styles.shortcutBadge}>{item.shortcut}</span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div style={styles.footer}>
          <div style={styles.footerKeyHint}>
            <span style={styles.kbd}>↑</span>
            <span style={styles.kbd}>↓</span>
            <span>{isRTL ? 'نیویگیٹ کریں' : 'Navigate'}</span>
          </div>
          <div style={styles.footerKeyHint}>
            <span style={styles.kbd}>↵</span>
            <span>{isRTL ? 'منتخب کریں' : 'Select'}</span>
          </div>
          <div style={styles.footerKeyHint}>
            <span style={styles.kbd}>Esc</span>
            <span>{isRTL ? 'بند کریں' : 'Close'}</span>
          </div>
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
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '6vh',
  },
  paletteModal: {
    width: '90%',
    maxWidth: '640px',
    background: '#FFFFFF',
    borderRadius: '24px',
    boxShadow: '0 24px 64px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '80vh',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    borderBottom: '1.5px solid #F1F5F9',
    background: '#FAFAFA',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#0F172A',
    fontFamily: 'inherit',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
  },
  listWrap: {
    overflowY: 'auto',
    maxHeight: '420px',
    padding: '0.5rem 0',
  },
  emptyState: {
    padding: '3rem 1.5rem',
    textAlign: 'center',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.9rem',
    padding: '0.85rem 1.25rem',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  itemIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: '#F8FAFC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #E2E8F0',
    flexShrink: 0,
  },
  itemTitle: {
    fontSize: '0.95rem',
    fontWeight: 700,
  },
  itemCategory: {
    fontSize: '0.72rem',
    color: '#94A3B8',
    fontWeight: 600,
    marginTop: '2px',
  },
  shortcutBadge: {
    fontSize: '0.72rem',
    fontWeight: 700,
    background: '#F1F5F9',
    color: '#64748B',
    padding: '3px 8px',
    borderRadius: '6px',
    border: '1px solid #E2E8F0',
    letterSpacing: '0.04em',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '0.75rem 1.25rem',
    background: '#F8FAFC',
    borderTop: '1px solid #F1F5F9',
    fontSize: '0.78rem',
    color: '#64748B',
    fontWeight: 600,
  },
  footerKeyHint: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  kbd: {
    background: '#FFFFFF',
    border: '1px solid #CBD5E1',
    borderRadius: '4px',
    padding: '1px 5px',
    fontSize: '0.7rem',
    fontWeight: 800,
    color: '#334155',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  }
};
