import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { SectionSpinner, ErrorBanner } from '../components/LoadingSpinner';
import { useIsMobile } from '../hooks/useIsMobile';
import Food3DHeroCanvas from '../components/Food3DHeroCanvas';
import TiltCard from '../components/TiltCard';
import { Search, Sparkles, MapPin, Star, Flame, SlidersHorizontal, Filter, ShieldCheck } from 'lucide-react';

const CATEGORIES = [
  { name: 'All', icon: '🍽️' },
  { name: 'Pizza', icon: '🍕' },
  { name: 'Burger', icon: '🍔' },
  { name: 'Sushi', icon: '🍣' },
  { name: 'Healthy', icon: '🥗' },
  { name: 'Dessert', icon: '🍰' },
  { name: 'Indian', icon: '🍛' },
  { name: 'Chinese', icon: '🥡' },
  { name: 'Mexican', icon: '🌮' },
];

const PROMOS = [
  { title: '50% OFF', subtitle: 'On your first order', bg: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)', icon: '🎉' },
  { title: 'FREE DELIVERY', subtitle: 'Orders above $20', bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', icon: '🛵' },
  { title: 'TRENDING', subtitle: 'Top rated spots', bg: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', icon: '🔥' },
];

export default function Dashboard() {
  const { user, role, signOut } = useAuth();
  const { getCartCount, toggleSidebar } = useCart();
  const navigate = useNavigate();
  const m = useIsMobile();

  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [restaurantsError, setRestaurantsError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Interactive Filters
  const [filterRating4, setFilterRating4] = useState(false);
  const [filterFastDelivery, setFilterFastDelivery] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  // Sticky navbar state
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (role === 'Customer') {
      fetchRestaurants();
    } else if (role === 'Admin') {
      navigate('/admin', { replace: true });
    } else if (role === 'Delivery Rider') {
      navigate('/rider', { replace: true });
    }
  }, [role, navigate]);

  const fetchRestaurants = async () => {
    setLoadingRestaurants(true);
    setRestaurantsError('');
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true);

    if (error) {
      setRestaurantsError(error.message || 'Failed to load restaurants.');
    } else {
      setRestaurants(data || []);
    }
    setLoadingRestaurants(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Filtering & Sorting Logic
  let filtered = restaurants.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = r.name.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (r.cuisine && r.cuisine.toLowerCase().includes(q));
    
    const matchesCat = selectedCategory === 'All' ||
      r.name.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (r.cuisine && r.cuisine.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (r.description && r.description.toLowerCase().includes(selectedCategory.toLowerCase()));
      
    const matchesRating = !filterRating4 || (r.rating && parseFloat(r.rating) >= 4.0);
    
    const delTimeNum = r.delivery_time ? parseInt(r.delivery_time.replace(/[^0-9]/g, '')) : 45;
    const matchesFast = !filterFastDelivery || delTimeNum <= 30;

    return matchesSearch && matchesCat && matchesRating && matchesFast;
  });

  if (sortBy === 'rating') {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === 'delivery_time') {
    filtered.sort((a, b) => {
      const timeA = a.delivery_time ? parseInt(a.delivery_time.replace(/[^0-9]/g, '')) : 999;
      const timeB = b.delivery_time ? parseInt(b.delivery_time.replace(/[^0-9]/g, '')) : 999;
      return timeA - timeB;
    });
  }

  const cartCount = getCartCount();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', fontFamily: 'var(--font-body)' }} className="page-enter">
      {/* ─── Sticky Navbar ─── */}
      <nav style={{
        ...styles.nav,
        ...(scrolled ? styles.navScrolled : {}),
      }}>
        <div style={styles.navInner}>
          <div style={styles.navLeft} onClick={() => navigate('/dashboard')}>
            <div style={{
              width: '38px', height: '38px',
              background: 'linear-gradient(135deg, #e23744, #ff6b35)',
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: scrolled ? '0 4px 12px rgba(226,55,68,0.4)' : '0 4px 16px rgba(226,55,68,0.6)',
              transition: 'all 0.3s', flexShrink: 0,
            }}>
              <span style={{ fontSize: '1.2rem' }}>🍔</span>
            </div>
            <h1 style={{ ...styles.brandName, color: scrolled ? 'var(--primary)' : '#ffffff' }}>FoodDash</h1>
            <span style={{
              fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.07em',
              background: scrolled ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'rgba(255,255,255,0.2)',
              color: '#fff', padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase',
              backdropFilter: 'blur(8px)',
            }}>Enterprise</span>
          </div>

          <div style={styles.navRight}>
            {/* Live indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: scrolled ? '#f0fdf4' : 'rgba(34,197,94,0.15)', borderRadius: '20px', border: `1px solid ${scrolled ? '#bbf7d0' : 'rgba(34,197,94,0.3)'}` }} className="hide-mobile">
              <span className="status-dot-live" />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: scrolled ? '#15803d' : '#4ade80' }}>LIVE</span>
            </div>

            <button
              onClick={() => navigate('/my-orders')}
              style={{ ...styles.navBtn, color: scrolled ? 'var(--text-secondary)' : 'rgba(255,255,255,0.9)', background: scrolled ? '#f8fafc' : 'rgba(255,255,255,0.12)', border: `1px solid ${scrolled ? '#e2e8f0' : 'rgba(255,255,255,0.2)'}`, borderRadius: '10px', padding: '0.45rem 0.9rem' }}
            >
              📦 <span className="hide-mobile">My Orders</span>
            </button>

            <button onClick={toggleSidebar} style={{ ...styles.cartBtnNav, background: 'linear-gradient(135deg, #e23744, #CB202D)', borderRadius: '12px', width: 'auto', padding: '0 14px', gap: '6px', fontSize: '0.88rem', fontWeight: 700 }}>
              🛒
              {cartCount > 0 && (
                <span style={{ ...styles.cartBadge, position: 'relative', top: 'unset', right: 'unset', background: 'rgba(255,255,255,0.25)', border: 'none' }}>{cartCount}</span>
              )}
              <span className="hide-mobile">Cart</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '4px 8px 4px 4px', background: scrolled ? '#f8fafc' : 'rgba(255,255,255,0.12)', borderRadius: '12px', border: `1px solid ${scrolled ? '#e2e8f0' : 'rgba(255,255,255,0.2)'}` }}>
              <div style={{ ...styles.avatar, boxShadow: 'none' }}>{user?.email?.[0]?.toUpperCase()}</div>
              <button
                onClick={handleLogout}
                style={{ ...styles.logoutBtn, color: scrolled ? 'var(--text-secondary)' : 'rgba(255,255,255,0.85)', fontSize: '0.82rem' }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section with 3D WebGL Canvas ─── */}
      <header style={{ ...styles.heroBanner, position: 'relative', overflow: 'hidden' }} ref={headerRef}>
        <Food3DHeroCanvas />
        <div style={styles.heroOverlay} />
        <div style={{ ...styles.heroContent, position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', borderRadius: '20px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.25)' }}>
            <Sparkles size={16} color="#F5A623" />
            <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>FUTURISTIC 3D DINING</span>
          </div>
          <h2 style={styles.heroTitle} className="animate-hero-text">FoodDash Enterprise</h2>
          <p style={styles.heroSubtitle} className="animate-fade-up stagger-1">
            Discover culinary excellence with real-time 3D experience
          </p>
          
          {/* Search Container */}
          <div style={m ? styles.searchContainerMobile : styles.searchContainer} className="zomato-search animate-fade-up stagger-2">
            <div style={styles.searchLocSection}>
              <MapPin size={18} color="var(--primary)" />
              <span style={styles.locText}>Delhi NCR</span>
              <span style={styles.locChevron}>▾</span>
            </div>
            <div style={styles.searchDivider} />
            <div style={styles.searchInputSection}>
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search for restaurant, cuisine or a dish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>
        </div>
      </header>

      <main style={m ? styles.mainMobile : styles.main}>
        {/* ─── Promo Banners ─── */}
        <div style={m ? styles.promoRowMobile : styles.promoRow}>
          {PROMOS.map((p, i) => (
            <div
              key={i}
              style={{ ...styles.promoCard, background: p.bg, boxShadow: '0 12px 32px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.15)' }}
              className={`promo-shine hover-lift-premium animate-fade-up stagger-${i + 1}`}
            >
              <div>
                <p style={styles.promoTitle}>{p.title}</p>
                <p style={styles.promoSub}>{p.subtitle}</p>
                <div style={{ marginTop: '0.6rem', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '3px 10px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>Claim Now →</span>
                </div>
              </div>
              <span style={{ ...styles.promoIcon, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>{p.icon}</span>
            </div>
          ))}
        </div>

        {/* ─── Inspiration Categories ─── */}
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionLabel}>Inspiration for your first order</h3>
        </div>

        <div style={styles.catScroll} className="no-scrollbar">
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                style={{
                  ...styles.catPill,
                  ...(isActive ? styles.catPillActive : {}),
                }}
              >
                <div style={{
                  ...styles.catIconWrap,
                  ...(isActive ? styles.catIconWrapActive : {}),
                }}>
                  <span style={styles.catIcon}>{cat.icon}</span>
                </div>
                <span style={{
                  ...styles.catText,
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                }}>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* ─── Interactive Filters ─── */}
        <div style={styles.filtersRow}>
          <button
            onClick={() => setFilterRating4(!filterRating4)}
            className={`filter-pill ${filterRating4 ? 'active' : ''}`}
          >
            ★ Rating 4.0+
          </button>

          <button
            onClick={() => setFilterFastDelivery(!filterFastDelivery)}
            className={`filter-pill ${filterFastDelivery ? 'active' : ''}`}
          >
            ⚡ Fast Delivery
          </button>

          <div style={styles.sortDropdown}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.sortSelect}
            >
              <option value="default">Relevance</option>
              <option value="rating">Rating ↓</option>
              <option value="delivery_time">Delivery Time ↑</option>
            </select>
          </div>
        </div>

        {/* ─── Restaurant Listing Grid ─── */}
        <div style={styles.gridHeader}>
          <h3 style={styles.sectionLabel}>
            {selectedCategory === 'All' ? 'Best Food in Your Area' : `${selectedCategory} Specials`}
          </h3>
          <span style={styles.resultCount}>{filtered.length} delivery outlets</span>
        </div>

        {restaurantsError && (
          <div style={{
            background: 'linear-gradient(135deg, #FFF2F3 0%, #FFFAF7 100%)',
            border: '1.5px solid rgba(226,55,68,0.25)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            margin: '1rem 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2.2rem' }}>🔌</span>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
                  Supabase Setup Required
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {restaurantsError.includes('API key') || restaurantsError.includes('401') || restaurantsError.includes('403')
                    ? 'Your Supabase API key is invalid. Follow the steps below to fix this.'
                    : restaurantsError.includes('relation') || restaurantsError.includes('does not exist')
                    ? 'Database tables not found. You need to run the schema SQL in Supabase.'
                    : restaurantsError}
                </p>
              </div>
              <button onClick={fetchRestaurants} style={{
                marginLeft: 'auto', flexShrink: 0,
                padding: '0.6rem 1.2rem', background: 'var(--primary)', color: 'white',
                border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                fontWeight: 800, fontSize: '0.85rem',
              }}>
                ↻ Retry
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.8rem' }}>
              {[
                { step: '1', title: 'Get your Supabase Anon Key', desc: 'Go to supabase.com → Your Project → Settings → API → copy the anon public key (starts with eyJ...)' },
                { step: '2', title: 'Update .env file', desc: 'In react-frontend/.env, set VITE_SUPABASE_ANON_KEY=eyJ... (the long JWT key)' },
                { step: '3', title: 'Run Schema SQL', desc: 'In Supabase SQL Editor, run COMPLETE_SCHEMA.sql then COMPLETE_RLS.sql (files in react-frontend/)' },
                { step: '4', title: 'Restart Dev Server', desc: 'Stop the server (Ctrl+C) and run npm run dev again to reload the env variables' },
              ].map(item => (
                <div key={item.step} style={{
                  background: 'white', borderRadius: 'var(--radius-md)',
                  padding: '1rem', border: '1px solid var(--border-light)',
                  display: 'flex', gap: '0.75rem',
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'var(--primary)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.8rem', flexShrink: 0,
                  }}>{item.step}</div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>{item.title}</p>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loadingRestaurants ? (
          <SectionSpinner message="Fetching local culinary highlights..." />
        ) : (
          <div style={m ? styles.gridMobile : styles.grid}>
            {filtered.map((r, i) => (
              <TiltCard
                key={r.id}
                style={styles.card}
                className={`card-premium animate-fade-up stagger-${Math.min(i + 1, 6)}`}
                onClick={() => navigate(`/restaurant/${r.id}`)}
              >
                {/* Card Image */}
                <div style={styles.cardImgWrap}>
                  {r.image_url ? (
                    <img src={r.image_url} alt={r.name} style={styles.cardImg} className="card-img-inner" />
                  ) : (
                    <div style={styles.cardImgPlaceholder}>
                      <span style={{ fontSize: '3.5rem' }}>🍽️</span>
                    </div>
                  )}
                  
                  {/* Gradient overlay at bottom of image */}
                  <div style={styles.cardImgGradient} />
                  
                  {/* Promoted badge (random) */}
                  {i % 3 === 0 && (
                    <div style={styles.promotedBadge}>Promoted</div>
                  )}

                  {/* Offer tag at bottom-left */}
                  <div style={styles.cardOfferArea}>
                    <span className="offer-tag">🏷️ 15% OFF up to $75</span>
                  </div>

                  {/* Delivery time at bottom-right */}
                  <div style={styles.cardTimeArea}>
                    <span style={styles.deliveryBadge}>
                      {r.delivery_time || '30 min'}
                    </span>
                  </div>
                </div>

                {/* Card Details */}
                <div style={styles.cardBody}>
                  <div style={styles.cardTitleRow}>
                    <h4 style={styles.cardTitle}>{r.name}</h4>
                    <span style={{
                      ...styles.ratingBadge,
                      background: r.rating >= 4 ? '#1BA672' : r.rating >= 3 ? '#DB7C0E' : '#E23744',
                    }}>
                      {r.rating ? `${r.rating} ★` : 'New ★'}
                    </span>
                  </div>

                  <p style={styles.cardCuisine}>
                    {r.cuisine || 'North Indian, Fast Food'}
                  </p>

                  <div style={styles.cardMetaRow}>
                    <span style={styles.cardMeta}>{r.price_range ? `${r.price_range} for two` : '₹₹ for two'}</span>
                    <span style={styles.metaDot}>·</span>
                    <span style={styles.cardMeta}>{r.delivery_time || '30 min'}</span>
                  </div>

                  <div style={styles.cardFooterDivider} />
                  
                  <div style={styles.cardFooterText}>
                    <span style={styles.safeIcon}>
                      <ShieldCheck size={14} color="#1ba672" />
                    </span>
                    <span>Follows all Max Safety guidelines</span>
                  </div>
                </div>
              </TiltCard>
            ))}

            {filtered.length === 0 && !loadingRestaurants && (
              <div style={styles.emptyState}>
                <span style={{ fontSize: '4.5rem', marginBottom: '1rem', display: 'block' }}>🔍</span>
                <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-main)', fontSize: '1.4rem' }}>No matching kitchens found</h3>
                <p style={{ color: 'var(--text-muted)', margin: '0 0 1.5rem', maxWidth: '360px', marginInline: 'auto' }}>
                  We couldn't find any listings matching your active filters. Try resetting!
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setFilterRating4(false);
                    setFilterFastDelivery(false);
                    setSortBy('default');
                  }}
                  style={styles.resetBtn}
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── Footer ─── */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div className="footer-grid">
            {/* Brand Column */}
            <div>
              <div style={styles.footerBrandRow}>
                <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #e23744, #ff6b35)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(226,55,68,0.4)', flexShrink: 0 }}>
                  <span style={{ fontSize: '1.3rem' }}>🍔</span>
                </div>
                <span style={styles.footerBrandName}>FoodDash</span>
                <span style={{ fontSize: '0.58rem', fontWeight: 800, background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff', padding: '2px 7px', borderRadius: '4px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Enterprise</span>
              </div>
              <p style={styles.footerDesc}>
                Discover the best food & drinks in your city. Fast delivery with live GPS tracking from your favourite restaurants.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                {['App Store', 'Google Play'].map(s => (
                  <div key={s} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>{s}</div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={styles.footerHeading}>Quick Links</h4>
              {['Dashboard', 'My Orders', 'Track Order', 'Search Restaurants'].map(l => (
                <p key={l} style={styles.footerLink}>→ {l}</p>
              ))}
            </div>

            {/* Support */}
            <div>
              <h4 style={styles.footerHeading}>Support</h4>
              {['Help Center', 'Contact Us', 'FAQs', 'Report Issue'].map(l => (
                <p key={l} style={styles.footerLink}>→ {l}</p>
              ))}
            </div>

            {/* Legal */}
            <div>
              <h4 style={styles.footerHeading}>Legal</h4>
              {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Refund Policy'].map(l => (
                <p key={l} style={styles.footerLink}>→ {l}</p>
              ))}
            </div>
          </div>

          {/* Newsletter strip */}
          <div style={{ margin: '2.5rem 0 2rem', padding: '1.5rem 2rem', background: 'rgba(226,55,68,0.08)', borderRadius: '16px', border: '1px solid rgba(226,55,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.05rem', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>🔔 Get exclusive offers in your inbox</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>Join 50,000+ food lovers and never miss a deal.</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <input placeholder="your@email.com" style={{ padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.88rem', outline: 'none', fontFamily: 'var(--font-body)', minWidth: '200px' }} />
              <button style={{ padding: '0.65rem 1.2rem', background: 'linear-gradient(135deg,#e23744,#CB202D)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(226,55,68,0.4)', whiteSpace: 'nowrap' }}>Subscribe</button>
            </div>
          </div>

          <div style={{ ...styles.footerBottom, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <p style={styles.footerCopyright}>
              © 2026 FoodDash Enterprise. All rights reserved.
            </p>
            <p style={{ ...styles.footerCopyright, margin: 0 }}>Built with ❤️ · Powered by Supabase & Stripe</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Style System ─── */
const styles = {
  /* ── Nav ──────────────────────────────── */
  nav: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 200,
    padding: '0',
    transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
    background: 'transparent',
  },
  navScrolled: {
    background: 'rgba(255, 255, 255, 0.97)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
    borderBottom: '1px solid rgba(232, 232, 238, 0.8)',
  },
  navInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.9rem 2rem',
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    cursor: 'pointer',
  },
  brandIcon: { fontSize: '1.8rem' },
  brandName: {
    margin: 0,
    fontSize: '1.6rem',
    fontWeight: 900,
    fontFamily: 'var(--font-heading)',
    letterSpacing: '-0.03em',
    transition: 'color 0.3s',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
  },
  navBtn: {
    background: 'none',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.45rem 0.8rem',
    borderRadius: 'var(--radius-full)',
    transition: 'all 0.2s',
  },
  cartBtnNav: {
    position: 'relative',
    background: '#E23744',
    color: '#ffffff',
    border: 'none',
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    boxShadow: '0 4px 14px rgba(226, 55, 68, 0.4)',
  },
  cartBadge: {
    position: 'absolute',
    top: '-3px',
    right: '-3px',
    background: '#1C1C2E',
    color: '#ffffff',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    fontSize: '0.65rem',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid white',
  },
  userPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #E23744, #FF6B35)',
    color: '#ffffff',
    fontWeight: 800,
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    padding: '0.35rem 0.6rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.78rem',
    fontWeight: 600,
    transition: 'color 0.3s',
  },

  /* ── Hero ─────────────────────────────── */
  heroBanner: {
    height: '420px',
    backgroundImage: `url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.5) 100%)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    width: '100%',
    maxWidth: '680px',
    padding: '0 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: '4rem',
    fontWeight: 900,
    color: '#ffffff',
    margin: 0,
    fontFamily: 'var(--font-heading)',
    letterSpacing: '-0.05em',
  },
  heroSubtitle: {
    fontSize: '1.35rem',
    color: 'rgba(255,255,255,0.92)',
    margin: '0.6rem 0 2rem',
    fontWeight: 400,
    letterSpacing: '-0.01em',
  },

  /* ── Search ──────────────────────────── */
  searchContainer: {
    background: '#ffffff',
    borderRadius: 'var(--radius-xl)',
    width: '100%',
    padding: '0.6rem',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
    transition: 'all 0.3s',
  },
  searchContainerMobile: {
    background: '#ffffff',
    borderRadius: 'var(--radius-md)',
    width: '100%',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
  },
  searchLocSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.5rem 0.8rem',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background 0.2s',
  },
  searchLocIcon: { color: '#E23744', fontSize: '1.1rem' },
  locText: {
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  locChevron: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    marginLeft: '0.1rem',
  },
  searchDivider: {
    width: '1px',
    height: '28px',
    background: 'var(--border)',
    margin: '0 0.3rem',
    flexShrink: 0,
  },
  searchInputSection: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    padding: '0.3rem 0.6rem',
  },
  searchIcon: { color: 'var(--text-muted)', fontSize: '1rem', marginRight: '0.5rem', flexShrink: 0 },
  searchInput: {
    flex: 1,
    border: 'none',
    fontSize: '0.92rem',
    color: 'var(--text-main)',
    width: '100%',
    background: 'transparent',
    outline: 'none',
  },

  /* ── Main ─────────────────────────────── */
  main: { maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 3rem' },
  mainMobile: { maxWidth: '1200px', margin: '0 auto', padding: '0 1rem 2rem' },

  /* ── Promos ──────────────────────────── */
  promoRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.2rem',
    margin: '-3rem auto 2.5rem',
    position: 'relative',
    zIndex: 30,
  },
  promoRowMobile: {
    display: 'flex',
    gap: '1rem',
    overflowX: 'auto',
    margin: '-2rem auto 2rem',
    position: 'relative',
    zIndex: 30,
    paddingBottom: '0.5rem',
  },
  promoCard: {
    borderRadius: 'var(--radius-xl)',
    padding: '1.6rem 1.8rem',
    color: '#ffffff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    transition: 'transform 0.3s, box-shadow 0.3s',
    minWidth: '260px',
  },
  promoTitle: { margin: '0 0 0.15rem', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' },
  promoSub: { margin: 0, fontSize: '0.85rem', opacity: 0.9 },
  promoIcon: { fontSize: '2.4rem' },

  /* ── Section Header ──────────────────── */
  sectionHeader: {
    marginBottom: '0.8rem',
  },
  sectionLabel: {
    fontSize: '1.5rem',
    fontWeight: 700,
    margin: 0,
    color: 'var(--text-main)',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '-0.02em',
  },

  /* ── Categories ──────────────────────── */
  catScroll: {
    display: 'flex',
    gap: '1.2rem',
    overflowX: 'auto',
    paddingBottom: '1rem',
    margin: '0 0 1.5rem',
  },
  catPill: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.6rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
    padding: '0.5rem',
    transition: 'all 0.2s',
  },
  catIconWrap: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#F8F8FB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid var(--border)',
    transition: 'all 0.25s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  catIconWrapActive: {
    borderColor: '#E23744',
    background: 'rgba(226, 55, 68, 0.06)',
    boxShadow: '0 4px 16px rgba(226, 55, 68, 0.15)',
    transform: 'scale(1.05)',
  },
  catIcon: { fontSize: '2rem' },
  catText: {
    fontSize: '0.78rem',
    transition: 'all 0.2s',
  },

  /* ── Filters ─────────────────────────── */
  filtersRow: {
    display: 'flex',
    gap: '0.6rem',
    alignItems: 'center',
    margin: '0 0 2rem',
    flexWrap: 'wrap',
  },
  sortDropdown: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginLeft: 'auto',
    background: '#ffffff',
    border: '1.5px solid var(--border)',
    padding: '0.45rem 0.9rem',
    borderRadius: 'var(--radius-full)',
  },
  sortSelect: {
    border: 'none',
    background: 'transparent',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    outline: 'none',
  },

  /* ── Grid Header ─────────────────────── */
  gridHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '1.2rem',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '0.8rem',
  },
  resultCount: {
    color: 'var(--text-muted)',
    fontSize: '0.88rem',
    fontWeight: 500,
  },

  /* ── Grid ─────────────────────────────── */
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '1.8rem',
  },
  gridMobile: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.2rem',
  },

  /* ── Card ─────────────────────────────── */
  card: {
    background: '#ffffff',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    cursor: 'pointer',
    border: '1px solid var(--border-light)',
  },
  cardImgWrap: {
    position: 'relative',
    overflow: 'hidden',
    height: '210px',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  cardImgPlaceholder: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #f0f0f5, #e8e8ef)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImgGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.55))',
    pointerEvents: 'none',
  },
  promotedBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(8px)',
    color: '#ffffff',
    padding: '3px 10px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.68rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    zIndex: 5,
  },
  cardOfferArea: {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    zIndex: 10,
  },
  cardTimeArea: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    zIndex: 10,
  },
  deliveryBadge: {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(8px)',
    color: 'var(--text-main)',
    padding: '4px 10px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.75rem',
    fontWeight: 700,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },

  /* ── Card Body ───────────────────────── */
  cardBody: { padding: '1rem 1.3rem 1.2rem' },
  cardTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.15rem',
    gap: '0.5rem',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '-0.01em',
    lineHeight: 1.3,
  },
  ratingBadge: {
    padding: '2px 8px',
    borderRadius: 'var(--radius-xs)',
    fontSize: '0.78rem',
    fontWeight: 800,
    flexShrink: 0,
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  cardCuisine: {
    margin: '0 0 0.4rem',
    color: 'var(--text-muted)',
    fontSize: '0.82rem',
    lineHeight: 1.4,
  },
  cardMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.6rem',
  },
  cardMeta: { fontWeight: 500 },
  metaDot: { color: 'var(--border-strong)' },
  cardFooterDivider: {
    height: '1px',
    background: 'var(--border)',
    margin: '0.6rem 0',
  },
  cardFooterText: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  safeIcon: {
    display: 'flex',
    alignItems: 'center',
  },

  /* ── Empty State ─────────────────────── */
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '4rem 2rem',
    background: '#ffffff',
    borderRadius: 'var(--radius-lg)',
    border: '1px dashed var(--border-strong)',
  },
  resetBtn: {
    background: 'linear-gradient(135deg, #E23744, #CB202D)',
    color: '#ffffff',
    border: 'none',
    padding: '0.7rem 1.6rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.9rem',
    fontWeight: 700,
    boxShadow: '0 6px 20px rgba(226, 55, 68, 0.3)',
    cursor: 'pointer',
  },

  /* ── Footer ──────────────────────────── */
  footer: {
    background: '#1C1C2E',
    padding: '4rem 2rem 2rem',
    marginTop: '4rem',
  },
  footerInner: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  footerBrandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  footerBrandName: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.6rem',
    fontWeight: 900,
    color: '#ffffff',
  },
  footerDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.88rem',
    margin: '0 0 1.5rem',
    maxWidth: '340px',
    lineHeight: 1.6,
  },
  socialRow: {
    display: 'flex',
    gap: '0.6rem',
  },
  socialIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  footerHeading: {
    color: '#ffffff',
    fontSize: '0.88rem',
    fontWeight: 700,
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  footerLink: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.85rem',
    marginBottom: '0.65rem',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  footerBottom: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    marginTop: '3rem',
    paddingTop: '1.5rem',
    textAlign: 'center',
  },
  footerCopyright: {
    margin: 0,
    color: 'rgba(255,255,255,0.35)',
    fontSize: '0.78rem',
  },
};
