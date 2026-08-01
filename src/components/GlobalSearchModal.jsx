import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguageCurrency } from '../contexts/LanguageCurrencyContext';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import {
  Search, X, Clock, Star, Mic, MicOff, SlidersHorizontal,
  Zap, ChevronRight, TrendingUp, UtensilsCrossed
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RECENT_KEY = 'fooddash_recent_searches';
const MAX_RECENT = 8;

// All searchable data
const SEARCH_DATA = [
  // Restaurants
  { type: 'restaurant', id: 'mock-1', title: 'Pearl Continental (PC) Hotel', sub: 'Mughlai · Fine Dining · Buffet', icon: '👑', route: '/restaurant/mock-1', rating: 4.9 },
  { type: 'restaurant', id: 'mock-2', title: 'Kolachi Seaside Restaurant', sub: 'Pakistani BBQ · Seafood · Do Darya', icon: '🌊', route: '/restaurant/mock-2', rating: 4.9 },
  { type: 'restaurant', id: 'mock-3', title: 'Monal Mount View', sub: 'Margalla Hilltop · Shinwari · BBQ', icon: '⛰️', route: '/restaurant/mock-3', rating: 4.9 },
  { type: 'restaurant', id: 'mock-4', title: 'Cheezious Pakistan', sub: 'Crown Crust Pizza · Bargarh · Fries', icon: '🍕', route: '/restaurant/mock-4', rating: 4.9 },
  { type: 'restaurant', id: 'mock-5', title: 'Student Biryani Karachi', sub: 'Authentic Karachi Dum Biryani', icon: '👑', route: '/restaurant/mock-5', rating: 4.8 },
  { type: 'restaurant', id: 'mock-6', title: 'Savour Foods Islamabad', sub: 'Special Chicken Pulao Kabab', icon: '⚡', route: '/restaurant/mock-6', rating: 4.9 },
  { type: 'restaurant', id: 'mock-7', title: 'Butt Karahi (Lakshmi Chowk)', sub: 'Lahori Desi Ghee Mutton Karahi', icon: '🍲', route: '/restaurant/mock-7', rating: 4.9 },
  { type: 'restaurant', id: 'mock-8', title: 'Kababjees BBQ', sub: 'Malai Boti · Highway BBQ', icon: '🍢', route: '/restaurant/mock-8', rating: 4.8 },
  // Dishes
  { type: 'dish', id: 'd-1', title: 'Cheezious Crown Crust Pizza', sub: 'Cheezious Pakistan', icon: '🍕', route: '/restaurant/mock-4', rating: 4.9 },
  { type: 'dish', id: 'd-2', title: 'Student Biryani Special Platter', sub: 'Student Biryani Karachi', icon: '👑', route: '/restaurant/mock-5', rating: 4.8 },
  { type: 'dish', id: 'd-3', title: 'Butt Desi Ghee Mutton Karahi', sub: 'Butt Karahi Lahore', icon: '🥘', route: '/restaurant/mock-7', rating: 4.9 },
  { type: 'dish', id: 'd-4', title: 'Savour Chicken Pulao Kabab', sub: 'Savour Foods Islamabad', icon: '🍗', route: '/restaurant/mock-6', rating: 4.9 },
  { type: 'dish', id: 'd-5', title: 'Kolachi Charcoal Malai Boti', sub: 'Kolachi Seaside', icon: '🍢', route: '/restaurant/mock-2', rating: 4.9 },
  // Navigation / Actions
  { type: 'action', id: 'a-1', title: 'My Orders', sub: 'View order history', icon: '📦', route: '/my-orders', rating: null },
  { type: 'action', id: 'a-2', title: 'Settings', sub: 'App preferences & Currency', icon: '⚙️', action: 'open-settings', rating: null },
  { type: 'action', id: 'a-3', title: 'Help Center', sub: 'Pakistani helpline & FAQ', icon: '❓', action: 'open-help', rating: null },
  { type: 'action', id: 'a-4', title: 'Loyalty Rewards', sub: 'Points and vouchers', icon: '🏆', action: 'open-loyalty', rating: null },
];

const FILTERS = {
  ALL: 'All',
  RESTAURANT: 'Restaurants',
  DISH: 'Dishes',
  ACTION: 'Actions',
};

const TRENDING = ['Cheezious Crown Crust', 'Student Biryani', 'Butt Karahi', 'Savour Pulao', 'Kolachi BBQ'];

function loadRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
function saveRecent(list) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT))); } catch {}
}

export default function GlobalSearchModal({ isOpen, onClose }) {
  const { isRTL } = useLanguageCurrency();
  const navigate = useNavigate();
  const inputRef = useRef();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(FILTERS.ALL);
  const [recent, setRecent] = useState(loadRecent);
  const [showFilters, setShowFilters] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Voice search
  const { isListening, transcript, isSupported, startListening, stopListening } = useVoiceSearch({
    language: 'en-US',
    onResult: (text) => setQuery(text),
  });

  useEffect(() => {
    if (transcript) setQuery(transcript);
  }, [transcript]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setFilter(FILTERS.ALL);
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Keyboard nav
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') setActiveIndex(p => p + 1);
      if (e.key === 'ArrowUp') setActiveIndex(p => Math.max(0, p - 1));
      if (e.key === 'Enter') {
        const results = getResults();
        const item = results[activeIndex];
        if (item) handleSelect(item);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, activeIndex, query, filter]);

  // Fuzzy search
  const getResults = useCallback(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return SEARCH_DATA.filter(item => {
      const matchesQuery = item.title.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q);
      const matchesFilter = filter === FILTERS.ALL ||
        (filter === FILTERS.RESTAURANT && item.type === 'restaurant') ||
        (filter === FILTERS.DISH && item.type === 'dish') ||
        (filter === FILTERS.ACTION && item.type === 'action');
      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

  const handleSelect = (item) => {
    // Save to recent
    const newRecent = [{ q: item.title, icon: item.icon, time: Date.now() }, ...recent.filter(r => r.q !== item.title)];
    setRecent(newRecent);
    saveRecent(newRecent);

    if (item.action) {
      document.dispatchEvent(new CustomEvent(item.action));
    } else if (item.route) {
      navigate(item.route);
    }
    onClose();
  };

  const clearRecent = () => { setRecent([]); saveRecent([]); };

  if (!isOpen) return null;

  const results = getResults();

  return (
    <div style={s.backdrop} onClick={onClose}>
      <div style={{ ...s.modal, direction: isRTL ? 'rtl' : 'ltr' }} onClick={e => e.stopPropagation()} className="animate-scale-in">
        {/* Search Input */}
        <div style={s.searchBar}>
          <Search size={18} color="#94A3B8" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            style={s.input}
            placeholder="Search restaurants, dishes, actions…"
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
          />
          {isSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              style={{ ...s.iconBtn, background: isListening ? '#FFF5F5' : 'none' }}
              title="Voice search (Ctrl + V)"
            >
              {isListening ? <MicOff size={16} color="#EF4444" /> : <Mic size={16} color="#94A3B8" />}
            </button>
          )}
          <button onClick={() => setShowFilters(!showFilters)} style={s.iconBtn} title="Advanced filters">
            <SlidersHorizontal size={16} color={showFilters ? '#FF6B35' : '#94A3B8'} />
          </button>
          <kbd style={s.escKey} onClick={onClose}>Esc</kbd>
        </div>

        {/* Filter pills */}
        {showFilters && (
          <div style={s.filterRow} className="animate-fade-up">
            {Object.values(FILTERS).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{ ...s.filterChip, background: filter === f ? '#FF6B35' : '#F1F5F9', color: filter === f ? '#FFFFFF' : '#475569', fontWeight: filter === f ? 800 : 600 }}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={s.body}>
          {!query && (
            <>
              {/* Trending */}
              <div style={s.sectionTitle}><TrendingUp size={13} color="#FF6B35" /> Trending in Pakistan</div>
              <div style={s.trendRow}>
                {TRENDING.map((t, i) => (
                  <button key={i} onClick={() => setQuery(t)} style={s.trendChip}>🔥 {t}</button>
                ))}
              </div>

              {/* Recent searches */}
              {recent.length > 0 && (
                <>
                  <div style={{ ...s.sectionTitle, marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span><Clock size={13} color="#64748B" /> Recent Searches</span>
                    <button onClick={clearRecent} style={s.clearBtn}>Clear all</button>
                  </div>
                  {recent.map((r, i) => (
                    <div key={i} onClick={() => setQuery(r.q)} style={s.recentItem}>
                      <span>{r.icon}</span>
                      <span style={s.recentText}>{r.q}</span>
                      <ChevronRight size={14} color="#94A3B8" />
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {/* Search Results */}
          {query && results.length === 0 && (
            <div style={s.emptyState}>
              <UtensilsCrossed size={36} color="#CBD5E1" />
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', fontWeight: 600, margin: '0.5rem 0 0' }}>No results for "{query}"</p>
            </div>
          )}

          {results.length > 0 && (
            <>
              <div style={s.sectionTitle}><Zap size={13} color="#FF6B35" /> {results.length} results</div>
              {results.map((item, i) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  style={{ ...s.resultItem, background: i === activeIndex ? '#FFF7F0' : 'transparent', border: i === activeIndex ? '1px solid #FFE0D1' : '1px solid transparent' }}
                >
                  <div style={s.resultIcon}>{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={s.resultTitle}>{item.title}</div>
                    <div style={s.resultSub}>{item.sub}</div>
                  </div>
                  {item.rating && (
                    <div style={s.ratingBadge}><Star size={10} color="#F59E0B" fill="#F59E0B" /> {item.rating}</div>
                  )}
                  <span style={{ ...s.typeBadge, background: item.type === 'restaurant' ? '#EEF2FF' : item.type === 'dish' ? '#FFF7F0' : '#F0FDF4', color: item.type === 'restaurant' ? '#6366F1' : item.type === 'dish' ? '#FF6B35' : '#10B981' }}>
                    {item.type}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div style={s.footer}>
          <span style={s.footerHint}><kbd style={s.kbd}>↑↓</kbd> navigate</span>
          <span style={s.footerHint}><kbd style={s.kbd}>Enter</kbd> select</span>
          <span style={s.footerHint}><kbd style={s.kbd}>Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}

const s = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(11,15,25,0.75)', backdropFilter: 'blur(12px)', zIndex: 99999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh' },
  modal: { width: '100%', maxWidth: '600px', background: 'var(--card-bg,#FFFFFF)', borderRadius: '20px', boxShadow: '0 32px 64px rgba(0,0,0,0.3)', border: '1.5px solid var(--border-color,#E2E8F0)', overflow: 'hidden', maxHeight: '70vh', display: 'flex', flexDirection: 'column' },
  searchBar: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0.9rem 1.25rem', borderBottom: '1px solid #F1F5F9' },
  input: { flex: 1, border: 'none', outline: 'none', fontSize: '1rem', fontWeight: 500, color: 'var(--text-main,#0F172A)', background: 'transparent', fontFamily: 'inherit' },
  iconBtn: { padding: '5px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' },
  escKey: { background: '#F1F5F9', color: '#64748B', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', border: '1px solid #E2E8F0', fontFamily: 'monospace' },
  filterRow: { display: 'flex', gap: '6px', padding: '0.5rem 1.25rem', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap' },
  filterChip: { padding: '0.3rem 0.8rem', borderRadius: '20px', border: 'none', fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s' },
  body: { padding: '0.75rem 1.25rem', overflowY: 'auto', flex: 1 },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' },
  trendRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '0.5rem' },
  trendChip: { background: '#FFF7F0', border: '1px solid #FFE0D1', color: '#FF6B35', borderRadius: '20px', padding: '0.35rem 0.8rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' },
  clearBtn: { background: 'none', border: 'none', fontSize: '0.75rem', color: '#94A3B8', cursor: 'pointer', fontWeight: 600 },
  recentItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0.5rem 0.25rem', borderRadius: '8px', cursor: 'pointer', marginBottom: '2px' },
  recentText: { flex: 1, fontSize: '0.88rem', fontWeight: 500, color: '#334155' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', gap: '0.5rem' },
  resultItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0.65rem 0.75rem', borderRadius: '12px', cursor: 'pointer', marginBottom: '4px', transition: 'all 0.15s' },
  resultIcon: { width: '36px', height: '36px', borderRadius: '10px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 },
  resultTitle: { fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main,#0F172A)' },
  resultSub: { fontSize: '0.75rem', color: '#64748B', marginTop: '1px' },
  ratingBadge: { display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', fontWeight: 800, color: '#F59E0B' },
  typeBadge: { padding: '2px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'capitalize' },
  footer: { display: 'flex', gap: '1rem', padding: '0.6rem 1.25rem', borderTop: '1px solid #F1F5F9', background: '#FAFAFA' },
  footerHint: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#94A3B8', fontWeight: 500 },
  kbd: { background: '#E2E8F0', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontFamily: 'monospace', fontWeight: 700 },
};
