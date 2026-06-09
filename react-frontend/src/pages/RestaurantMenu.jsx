import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { PageSpinner } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function RestaurantMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { cartItems, addToCart, updateQuantity, removeFromCart, getCartCount, getCartTotal, toggleSidebar } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  const sectionRefs = useRef({});
  const observerRef = useRef(null);
  const isScrollingToRef = useRef(false);

  useEffect(() => { fetchRestaurantAndMenu(); }, [id]);

  const fetchRestaurantAndMenu = async () => {
    setLoading(true);
    setError('');
    const { data: restData, error: restError } = await supabase
      .from('restaurants').select('*').eq('id', id).single();
    if (restError) { setError(restError.message); setLoading(false); return; }
    setRestaurant(restData);

    const { data: foodData, error: foodError } = await supabase
      .from('food_items').select('*').eq('restaurant_id', id).eq('is_available', true).order('category');
    if (foodError) { setError(foodError.message); }
    else { setFoodItems(foodData || []); }
    setLoading(false);
  };

  // Group items by category
  const filteredItems = foodItems.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchSearch = item.name.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q));
    const matchVeg = !vegOnly || item.is_veg === true;
    return matchSearch && matchVeg;
  });

  const categories = [...new Set(filteredItems.map(i => i.category || 'Other'))];
  const groupedItems = categories.reduce((acc, cat) => {
    acc[cat] = filteredItems.filter(i => (i.category || 'Other') === cat);
    return acc;
  }, {});

  // Intersection Observer for active category highlighting
  useEffect(() => {
    if (categories.length === 0) return;
    if (!activeCategory && categories.length > 0) setActiveCategory(categories[0]);

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      entries => {
        if (isScrollingToRef.current) return;
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveCategory(entry.target.dataset.category);
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    categories.forEach(cat => {
      const el = sectionRefs.current[cat];
      if (el) observerRef.current.observe(el);
    });

    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, [filteredItems, vegOnly, searchQuery]);

  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    isScrollingToRef.current = true;
    const el = sectionRefs.current[cat];
    if (el) {
      const offset = 160; // navbar + filter bar
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setTimeout(() => { isScrollingToRef.current = false; }, 1000);
  };

  // Cart helpers
  const getItemQty = (itemId) => {
    const found = cartItems.find(i => i.id === itemId);
    return found ? found.quantity : 0;
  };

  const handleIncrease = (item) => {
    addToCart(item, id);
  };

  const handleDecrease = (item) => {
    const qty = getItemQty(item.id);
    if (qty <= 1) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, qty - 1);
    }
  };

  if (loading) return <PageSpinner message="Loading menu..." />;

  if (error) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1.5rem', padding: '2rem', background: 'var(--background)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Failed to Load Menu</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '400px' }}>{error}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={fetchRestaurantAndMenu} style={S.retryBtn}>↻ Retry</button>
          <button onClick={() => navigate('/dashboard')} style={S.backFallback}>← Dashboard</button>
        </div>
      </div>
    </div>
  );

  if (!restaurant) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1.5rem', background: 'var(--background)' }}>
      <span style={{ fontSize: '4rem' }}>🍽️</span>
      <h2 style={{ color: 'var(--text-main)', fontWeight: 800 }}>Restaurant not found</h2>
      <button onClick={() => navigate('/dashboard')} style={S.backFallback}>← Back to Dashboard</button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', fontFamily: 'var(--font-body)' }}>

      {/* ── Navbar ── */}
      <nav style={S.nav}>
        <div style={S.navInner}>
          <button onClick={() => navigate('/dashboard')} style={S.backBtn}>
            ← Back
          </button>
          <div style={S.navBrand} onClick={() => navigate('/dashboard')}>
            <span style={{ fontSize: '1.4rem' }}>🍕</span>
            <span style={S.brandTxt}>FoodDash</span>
          </div>
          {role === 'Customer' ? (
            <button onClick={toggleSidebar} style={S.cartBtn}>
              <span>🛒</span>
              <span>Cart</span>
              <span style={S.cartCount}>{getCartCount()}</span>
            </button>
          ) : (
            <div style={{ width: '90px' }} />
          )}
        </div>
      </nav>

      {/* ── Hero Banner ── */}
      <div style={S.hero}>
        <img
          src={restaurant.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'}
          alt={restaurant.name}
          style={S.heroImg}
        />
        <div style={S.heroOverlay}>
          <div style={S.heroContent}>
            <div style={S.heroMainInfo}>
              <h1 style={S.heroTitle}>{restaurant.name}</h1>
              <p style={S.heroDesc}>{restaurant.cuisine || 'North Indian • Chinese • Italian'}</p>
              {restaurant.address && <p style={S.heroAddr}>📍 {restaurant.address}</p>}
              <div style={S.heroMetaRow}>
                <span style={S.tagBadge}>⏱ {restaurant.delivery_time || '30-45 mins'}</span>
                <span style={S.tagBadge}>💰 {restaurant.price_range || '$20'} for two</span>
                <span style={S.tagBadge}>🛵 Free Delivery</span>
              </div>
            </div>
            <div style={S.heroRatingCard}>
              <div style={{ background: restaurant.rating >= 4 ? '#1BA672' : restaurant.rating >= 3 ? '#DB7C0E' : '#E23744', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                <span style={{ color: 'white', fontWeight: 900, fontSize: '1.2rem' }}>★ {restaurant.rating ? restaurant.rating.toFixed(1) : 'New'}</span>
              </div>
              <div style={{ marginLeft: '0.75rem' }}>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>1K+</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem' }}>Ratings</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div style={S.filterBar}>
        <div style={S.filterBarInner}>
          <div style={S.searchBox}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flexShrink: 0 }}>🔍</span>
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={S.menuSearchInput}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', padding: '0 4px' }}>✕</button>
            )}
          </div>

          <div style={S.vegToggleWrap}>
            <div
              style={{
                ...S.vegDot,
                border: `2px solid ${vegOnly ? '#1BA672' : '#ccc'}`,
              }}
              onClick={() => setVegOnly(!vegOnly)}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1BA672' }} />
            </div>
            <span
              style={{ fontSize: '0.85rem', fontWeight: 700, color: vegOnly ? '#1BA672' : 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setVegOnly(!vegOnly)}
            >
              Veg Only
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div style={S.twoCol} className="menu-two-col">

        {/* ── Left: Category Navigator ── */}
        <aside style={S.catNav} className="menu-cat-nav">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => scrollToCategory(cat)}
              style={{
                ...S.catNavItem,
                ...(activeCategory === cat ? S.catNavItemActive : {}),
              }}
            >
              <span style={{ fontSize: '0.82rem', fontWeight: activeCategory === cat ? 800 : 500, color: activeCategory === cat ? 'var(--primary)' : 'var(--text-secondary)' }}>
                {cat}
              </span>
              <span style={{ fontSize: '0.72rem', color: activeCategory === cat ? 'var(--primary)' : 'var(--text-muted)', marginTop: '2px' }}>
                {(groupedItems[cat] || []).length}
              </span>
            </button>
          ))}
        </aside>

        {/* ── Right: Menu Sections ── */}
        <main style={S.menuMain}>
          {filteredItems.length === 0 ? (
            <div style={S.emptyMenu}>
              <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🍽️</span>
              <h3 style={{ margin: '0.5rem 0', color: 'var(--text-main)', fontWeight: 800 }}>No items found</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Try adjusting your search or filter</p>
              <button onClick={() => { setSearchQuery(''); setVegOnly(false); }} style={{ ...S.retryBtn, marginTop: '1.5rem' }}>Reset Filters</button>
            </div>
          ) : (
            categories.map(cat => (
              <div
                key={cat}
                ref={el => { if (el) sectionRefs.current[cat] = el; }}
                data-category={cat}
                style={S.catSection}
              >
                {/* Category Header */}
                <div style={S.catHeader}>
                  <h2 style={S.catTitle}>{cat}</h2>
                  <span style={S.catCount}>{(groupedItems[cat] || []).length} items</span>
                </div>

                {/* Items in this category */}
                <div style={S.itemsList}>
                  {(groupedItems[cat] || []).map((item, idx) => {
                    const qty = getItemQty(item.id);
                    const isBestseller = (item.id?.charCodeAt?.(0) || idx) % 3 === 0;

                    return (
                      <div key={item.id} style={S.menuItemRow} className="menu-item-row">

                        {/* Left: Text Details */}
                        <div style={S.itemDetailsCol}>
                          {/* Veg / Non-veg indicator */}
                          <div style={S.vegNonVegRow}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px',
                              border: `2px solid ${item.is_veg ? '#1BA672' : '#E23744'}`,
                              borderRadius: '4px',
                              lineHeight: 0,
                            }}>
                              <span style={{
                                display: 'inline-block',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: item.is_veg ? '#1BA672' : '#E23744',
                              }} />
                            </span>
                            <span style={{
                              fontSize: '0.67rem', fontWeight: 800,
                              color: item.is_veg ? '#1BA672' : '#E23744',
                              letterSpacing: '0.04em', marginLeft: '0.35rem',
                            }}>
                              {item.is_veg ? 'VEG' : 'NON-VEG'}
                            </span>
                            {isBestseller && (
                              <span style={S.bestsellerBadge}>🔥 Bestseller</span>
                            )}
                          </div>

                          <h3 style={S.itemName}>{item.name}</h3>
                          <p style={S.itemPrice}>${Number(item.price).toFixed(2)}</p>
                          <p style={S.itemDesc}>{item.description || 'Fresh, flavorful and hot dish prepared for your order.'}</p>
                        </div>

                        {/* Right: Image + Add/Quantity button */}
                        <div style={S.itemActionCol} className="menu-item-action-col">
                          <div style={S.itemImgWrap}>
                            <img
                              src={item.image_url || `https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=60`}
                              alt={item.name}
                              style={S.itemImg}
                              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=60'; }}
                            />

                            {/* ADD / Quantity control */}
                            {role === 'Customer' && (
                              qty === 0 ? (
                                <button
                                  onClick={() => handleIncrease(item)}
                                  style={S.addBtn}
                                >
                                  ADD +
                                </button>
                              ) : (
                                <div style={S.qtyControl}>
                                  <button onClick={() => handleDecrease(item)} style={S.qtyBtn}>−</button>
                                  <span style={S.qtyNum}>{qty}</span>
                                  <button onClick={() => handleIncrease(item)} style={S.qtyBtnPlus}>+</button>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {/* Bottom padding to allow scrolling to last section */}
          <div style={{ height: '12rem' }} />
        </main>
      </div>

      {/* ── Sticky Cart Footer (Customer only) ── */}
      {role === 'Customer' && getCartCount() > 0 && (
        <div style={S.stickyCart} className="sticky-cart-bar">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1rem', fontWeight: 800 }}>🛒 {getCartCount()} Item{getCartCount() > 1 ? 's' : ''}</span>
            <span style={{ fontSize: '0.78rem', opacity: 0.75, marginTop: '2px' }}>Extra charges may apply</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#86efac' }}>${getCartTotal().toFixed(2)}</span>
            <button onClick={toggleSidebar} style={S.viewCartBtn}>
              View Cart →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  /* ── Nav ── */
  nav: {
    position: 'sticky', top: 0, zIndex: 300,
    background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid #e8e8ee',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    height: '60px',
  },
  navInner: {
    maxWidth: '1200px', margin: '0 auto',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 1.5rem', height: '100%',
  },
  backBtn: {
    background: 'transparent', border: '1px solid #ddd',
    padding: '0.45rem 1rem', borderRadius: '8px',
    color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' },
  brandTxt: { fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--primary)', fontSize: '1.3rem', letterSpacing: '-0.03em' },
  cartBtn: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    background: 'var(--primary)', color: 'white',
    border: 'none', padding: '0.5rem 1.1rem',
    borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(226,55,68,0.3)',
  },
  cartCount: {
    background: 'white', color: 'var(--primary)',
    width: '20px', height: '20px', borderRadius: '50%',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.72rem', fontWeight: 800,
  },

  /* ── Hero ── */
  hero: { position: 'relative', height: '340px', overflow: 'hidden', background: '#1C1C2E' },
  heroImg: { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 },
  heroOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.1) 100%)',
    display: 'flex', alignItems: 'flex-end', padding: '2.5rem 1.5rem',
  },
  heroContent: {
    maxWidth: '1200px', width: '100%', margin: '0 auto',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    flexWrap: 'wrap', gap: '1.5rem',
  },
  heroMainInfo: { flex: 1, minWidth: '240px' },
  heroTitle: { color: 'white', fontSize: '2.5rem', fontWeight: 900, margin: '0 0 0.4rem', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' },
  heroDesc: { color: 'rgba(255,255,255,0.85)', fontSize: '1rem', fontWeight: 500, margin: '0 0 0.5rem' },
  heroAddr: { color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', margin: '0 0 0.8rem' },
  heroMetaRow: { display: 'flex', gap: '0.6rem', flexWrap: 'wrap' },
  tagBadge: {
    background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', color: 'white',
    padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  heroRatingCard: { display: 'flex', alignItems: 'center' },

  /* ── Filter bar ── */
  filterBar: {
    position: 'sticky', top: '60px', zIndex: 200,
    background: 'white',
    borderBottom: '1px solid #eee',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  },
  filterBarInner: {
    maxWidth: '1200px', margin: '0 auto',
    display: 'flex', alignItems: 'center', gap: '1.5rem',
    padding: '0.75rem 1.5rem', flexWrap: 'wrap',
  },
  searchBox: {
    display: 'flex', alignItems: 'center', background: '#F5F5F7',
    padding: '0.5rem 1rem', borderRadius: '8px', flex: '1', maxWidth: '380px',
    gap: '0.4rem', border: '1px solid #E8E8EE',
  },
  menuSearchInput: {
    border: 'none', background: 'transparent', width: '100%', fontSize: '0.88rem',
    color: 'var(--text-main)', outline: 'none',
  },
  vegToggleWrap: { display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' },
  vegDot: {
    width: '22px', height: '22px', borderRadius: '4px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'border-color 0.2s',
  },

  /* ── Two Column Layout ── */
  twoCol: {
    maxWidth: '1200px', margin: '0 auto', padding: '1.5rem',
    display: 'flex', gap: '1.5rem', alignItems: 'flex-start',
  },

  /* ── Category Navigator (Left) ── */
  catNav: {
    width: '180px', flexShrink: 0,
    position: 'sticky', top: '120px',
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #eee',
    maxHeight: 'calc(100vh - 140px)',
    overflowY: 'auto',
  },
  catNavItem: {
    width: '100%', background: 'none', border: 'none',
    padding: '0.85rem 1rem', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
    borderLeft: '3px solid transparent',
    textAlign: 'left',
    borderBottom: '1px solid #f0f0f0',
    transition: 'all 0.15s',
  },
  catNavItemActive: {
    background: '#FFF0F0',
    borderLeftColor: 'var(--primary)',
    borderBottom: '1px solid #f0f0f0',
  },

  /* ── Menu Main (Right) ── */
  menuMain: { flex: 1, minWidth: 0 },

  catSection: { marginBottom: '2rem' },
  catHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '1rem', paddingBottom: '0.6rem',
    borderBottom: '2px solid #eee',
  },
  catTitle: { margin: 0, fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.01em' },
  catCount: { fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 },

  itemsList: { display: 'flex', flexDirection: 'column', gap: '1px' },

  menuItemRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'white', padding: '1.5rem 1.5rem',
    gap: '1.5rem', borderBottom: '1px solid #F5F5F5',
    transition: 'background 0.15s',
  },

  /* ── Item Details (Left Side) ── */
  itemDetailsCol: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  vegNonVegRow: { display: 'flex', alignItems: 'center', marginBottom: '0.5rem' },
  bestsellerBadge: {
    marginLeft: '0.6rem',
    background: '#FFF5E0', color: '#DB7C0E',
    border: '1px solid rgba(219,124,14,0.2)',
    padding: '2px 7px', borderRadius: '4px',
    fontSize: '0.68rem', fontWeight: 700,
  },
  itemName: { fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.2rem', fontFamily: 'var(--font-heading)' },
  itemPrice: { fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' },
  itemDesc: { fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.55', margin: 0, maxWidth: '500px' },

  /* ── Item Action (Right Side) ── */
  itemActionCol: { flexShrink: 0 },
  itemImgWrap: { position: 'relative', width: '130px', height: '130px' },
  itemImg: { width: '130px', height: '130px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },

  addBtn: {
    position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)',
    background: 'white', color: 'var(--primary)', border: '1.5px solid var(--primary)',
    borderRadius: '8px', padding: '0.42rem 1rem',
    fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer',
    width: '90px', textAlign: 'center', zIndex: 10,
    boxShadow: '0 4px 12px rgba(226,55,68,0.2)',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },

  qtyControl: {
    position: 'absolute', bottom: '-14px', left: '50%', transform: 'translateX(-50%)',
    display: 'flex', alignItems: 'center', background: 'var(--primary)',
    borderRadius: '8px', overflow: 'hidden', zIndex: 10,
    boxShadow: '0 4px 12px rgba(226,55,68,0.35)',
    width: '96px',
  },
  qtyBtn: {
    background: 'transparent', border: 'none', color: 'white',
    width: '30px', height: '32px', fontSize: '1.1rem', fontWeight: 700,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnPlus: {
    background: 'transparent', border: 'none', color: 'white',
    width: '30px', height: '32px', fontSize: '1.1rem', fontWeight: 700,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  qtyNum: {
    flex: 1, textAlign: 'center', color: 'white',
    fontWeight: 800, fontSize: '0.88rem',
  },

  emptyMenu: {
    textAlign: 'center', padding: '5rem 2rem',
    background: 'white', borderRadius: '16px', border: '1px solid #eee',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },

  /* ── Sticky Cart ── */
  stickyCart: {
    position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #1C1C2E 0%, #2D2D40 100%)', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 1.8rem', borderRadius: '16px',
    boxShadow: '0 16px 48px rgba(0,0,0,0.4)', zIndex: 500,
    minWidth: '360px',
    border: '1px solid rgba(255,255,255,0.08)',
    animation: 'slideUpCart 0.4s ease forwards',
  },
  viewCartBtn: {
    background: 'var(--primary)', color: 'white',
    border: 'none', padding: '0.6rem 1.4rem',
    borderRadius: '8px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(226,55,68,0.4)',
  },

  retryBtn: {
    padding: '0.7rem 1.5rem', background: 'var(--primary)', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700,
    boxShadow: '0 4px 12px rgba(226,55,68,0.3)',
  },
  backFallback: {
    padding: '0.7rem 1.5rem', background: 'white', color: 'var(--text-main)',
    border: '1.5px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
  },
};
