import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { SectionSpinner } from '../components/LoadingSpinner';
import { useIsMobile } from '../hooks/useIsMobile';
import Food3DHeroCanvas from '../components/Food3DHeroCanvas';
import TiltCard from '../components/TiltCard';
import toast from 'react-hot-toast';
import {
  Search, Sparkles, MapPin, Star, Flame, SlidersHorizontal, Filter, ShieldCheck,
  Zap, Clock, Heart, Mic, MicOff, CheckCircle2, Truck, Navigation, PhoneCall,
  Smartphone, QrCode, ArrowRight, ChevronRight, Award, User, LogOut, ShoppingBag,
  TrendingUp, ThumbsUp, RefreshCw, Send, Check
} from 'lucide-react';

/* ─── Design Tokens (Apple / Stripe / Linear / FoodDash Enterprise) ─── */
const BRAND = {
  primary: '#FF6B35',
  primaryGrad: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
  primaryGlow: '0 10px 30px rgba(255, 107, 53, 0.38)',
  secondary: '#FFB703',
  accent: '#2EC4B6',
  darkBg: '#0B0F19',
  glassBg: 'rgba(255, 255, 255, 0.82)',
  glassBorder: 'rgba(255, 255, 255, 0.35)',
};

const CATEGORIES = [
  { id: 'All', name: 'All Dishes', icon: '🍽️', count: '120+' },
  { id: 'Pizza', name: 'Neapolitan Pizza', icon: '🍕', count: '45+' },
  { id: 'Burger', name: 'Gourmet Burgers', icon: '🍔', count: '38+' },
  { id: 'Sushi', name: 'Sushi & Omakase', icon: '🍣', count: '29+' },
  { id: 'Chinese', name: 'Dim Sum & Chinese', icon: '🥡', count: '32+' },
  { id: 'BBQ', name: 'Smokey BBQ', icon: '🍖', count: '18+' },
  { id: 'Dessert', name: 'Artisanal Desserts', icon: '🍰', count: '24+' },
  { id: 'Coffee', name: 'Specialty Coffee', icon: '☕', count: '15+' },
  { id: 'Healthy', name: 'Organic & Salads', icon: '🥗', count: '22+' },
  { id: 'Seafood', name: 'Ocean Seafood', icon: '🦞', count: '19+' },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Hyper-Fast 15-Min Delivery',
    desc: 'Powered by predictive routing algorithms that dispatch nearest riders in real-time.',
    badge: '🚀 Flash Speed',
    color: '#FF6B35',
  },
  {
    icon: ShieldCheck,
    title: '100% Organic & Farm Fresh',
    desc: 'Partnered with certified local farms to ensure 0-preservative, fresh ingredients.',
    badge: '🌱 Max Quality',
    color: '#2EC4B6',
  },
  {
    icon: LockIcon,
    title: 'Bank-Grade Safe Payments',
    desc: 'PCI-DSS Level 1 compliant processing with Apple Pay, Stripe, and encrypted cards.',
    badge: '🔒 256-Bit SSL',
    color: '#3B82F6',
  },
  {
    icon: Navigation,
    title: 'Real-Time GPS Live Radar',
    desc: 'Track your delivery rider on an interactive map with turn-by-turn live countdown.',
    badge: '📍 Sub-meter Precision',
    color: '#FFB703',
  },
  {
    icon: Sparkles,
    title: 'AI Flavor Recommendation',
    desc: 'Smart neural engine recommends dishes tailored to your personal taste profile.',
    badge: '🤖 Smart AI',
    color: '#A855F7',
  },
  {
    icon: PhoneCall,
    title: '24/7 Priority Concierge Support',
    desc: 'Instant human chat support resolve any order query in under 30 seconds.',
    badge: '💬 24/7 Live',
    color: '#EC4899',
  },
];

function LockIcon(props) {
  return (
    <svg width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke={props.color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
}

const MOCK_RESTAURANTS = [
  {
    id: 'mock-1',
    name: 'The Artisan Burger Co.',
    cuisine: 'American · Gourmet Burgers · Shakes',
    rating: 4.9,
    reviewsCount: '2.4k',
    delivery_time: '15-25 min',
    price_range: '$$$',
    address: '452 Broadway, SoHo, NY',
    image_url: '/images/burger.png',
    discount: '20% OFF UP TO $10',
    distance: '0.8 mi',
    is_active: true,
    tag: '🔥 #1 Popular'
  },
  {
    id: 'mock-2',
    name: 'Pizza Napoli & Trattoria',
    cuisine: 'Italian · Wood-Fired Pizza · Pasta',
    rating: 4.9,
    reviewsCount: '3.1k',
    delivery_time: '20-30 min',
    price_range: '$$',
    address: '128 Mulberry St, Little Italy, NY',
    image_url: '/images/pizza.png',
    discount: 'FREE TRUFFLE DIP',
    distance: '1.2 mi',
    is_active: true,
    tag: '⭐ Chef Choice'
  },
  {
    id: 'mock-3',
    name: 'Sakura Sushi & Omakase Bar',
    cuisine: 'Japanese · Sushi · Sashimi · Omakase',
    rating: 4.9,
    reviewsCount: '1.8k',
    delivery_time: '25-35 min',
    price_range: '$$$$',
    address: '789 5th Ave, Midtown, NY',
    image_url: '/images/sushi.png',
    discount: '$5 OFF $30',
    distance: '1.5 mi',
    is_active: true,
    tag: '👑 Michelin Rated'
  },
  {
    id: 'mock-4',
    name: 'Taco Fiesta & Cantina',
    cuisine: 'Mexican · Birria Tacos · Churros',
    rating: 4.8,
    reviewsCount: '1.2k',
    delivery_time: '15-20 min',
    price_range: '$',
    address: '321 7th Ave, Chelsea, NY',
    image_url: '/images/taco.png',
    discount: 'BUY 1 GET 1 TACO',
    distance: '0.5 mi',
    is_active: true,
    tag: '⚡ Ultra Fast'
  },
  {
    id: 'mock-5',
    name: 'Golden Dragon Palace',
    cuisine: 'Chinese · Dim Sum · Dumplings',
    rating: 4.7,
    reviewsCount: '980',
    delivery_time: '25-35 min',
    price_range: '$$',
    address: '56 Mott St, Chinatown, NY',
    image_url: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=800&q=80',
    discount: '15% OFF ORDERS $25+',
    distance: '1.9 mi',
    is_active: true,
    tag: '🥡 Trending'
  },
  {
    id: 'mock-6',
    name: 'Taj Mahal Indian Kitchen',
    cuisine: 'Indian · Tandoori · Butter Chicken',
    rating: 4.8,
    reviewsCount: '2.1k',
    delivery_time: '30-40 min',
    price_range: '$$',
    address: '102 Lexington Ave, Gramercy, NY',
    image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    discount: 'FREE NAAN BREAD',
    distance: '2.1 mi',
    is_active: true,
    tag: '🍛 Top Flavor'
  }
];

const REVIEWS = [
  {
    name: 'Sophia Montgomery',
    role: 'Product Designer at Stripe',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    text: 'FoodDash changed how our entire design studio orders lunch. The 3D UI is gorgeous and delivery arrives in under 20 mins hot every single time!',
    rating: 5,
    restaurant: 'The Artisan Burger Co.',
  },
  {
    name: 'Alexander Chen',
    role: 'VP of Engineering',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    text: 'The live GPS rider tracking is pinpoint accurate. Being able to watch my sushi order arrive step-by-step is an unmatched experience.',
    rating: 5,
    restaurant: 'Sakura Sushi Bar',
  },
  {
    name: 'Elena Rostova',
    role: 'Food & Lifestyle Critic',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    text: 'Crisp Neapolitan pizzas delivered with zero soggy crust. The packaging insulation & real-time updates are true 10/10 startup design quality.',
    rating: 5,
    restaurant: 'Pizza Napoli',
  },
];

const STATS = [
  { label: 'Happy Feast Orders', value: '50K+', icon: Flame },
  { label: 'Metropolitan Cities', value: '120+', icon: MapPin },
  { label: 'Curated Restaurants', value: '500+', icon: Award },
  { label: 'Customer Delight', value: '98%', icon: Heart },
];

const STEPS = [
  { num: '01', title: 'Curate Your Order', desc: 'Explore 3D menus from top-rated artisanal kitchens near you.', icon: Search },
  { num: '02', title: 'Instant Encrypted Pay', desc: 'Seamless 1-click checkout with Apple Pay, Stripe, or Card.', icon: ShieldCheck },
  { num: '03', title: 'Live GPS Radar', desc: 'Track your rider on an interactive map with turn-by-turn updates.', icon: Navigation },
  { num: '04', title: 'Hot Doorstep Delivery', desc: 'Unpack piping hot, eco-friendly temperature sealed meals.', icon: Truck },
];

export default function Dashboard() {
  const { user, role, signOut } = useAuth();
  const { getCartCount, toggleSidebar } = useCart();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Scroll Progress Bar
  const [scrollProgress, setScrollProgress] = useState(0);

  // States
  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isListening, setIsListening] = useState(false);
  const [likedMap, setLikedMap] = useState({});
  const [scrolled, setScrolled] = useState(false);

  // Filters
  const [filterRating4, setFilterRating4] = useState(false);
  const [filterFastDelivery, setFilterFastDelivery] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress((currentScroll / (totalScroll || 1)) * 100);
      setScrolled(currentScroll > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Role routing check
  useEffect(() => {
    if (role === 'Admin') {
      navigate('/admin', { replace: true });
    } else if (role === 'Delivery Rider') {
      navigate('/rider', { replace: true });
    } else {
      fetchRestaurants();
    }
  }, [role, navigate]);

  const fetchRestaurants = async () => {
    setLoadingRestaurants(true);
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true);

      if (error || !data || data.length === 0) {
        setRestaurants(MOCK_RESTAURANTS);
      } else {
        setRestaurants(data);
      }
    } catch (err) {
      setRestaurants(MOCK_RESTAURANTS);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const toggleVoiceSearch = () => {
    if (isListening) {
      setIsListening(false);
      toast('Voice search stopped.', { icon: '🎙️' });
    } else {
      setIsListening(true);
      toast.success('Listening for your food craving… Try saying "Pizza" or "Burgers"');
      setTimeout(() => {
        setSearchQuery('Burger');
        setIsListening(false);
        toast.success('Search set to "Burger" 🍔');
      }, 3000);
    }
  };

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setLikedMap(prev => {
      const next = !prev[id];
      toast(next ? 'Added to your favorites ❤️' : 'Removed from favorites', { icon: next ? '❤️' : '🤍' });
      return { ...prev, [id]: next };
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
      toast.success('Signed out successfully.');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setNewsletterSubscribed(true);
    toast.success('🎉 Welcome to FoodDash Enterprise! Check your inbox for 20% off.');
  };

  // Filter & Sort Logic
  let filtered = restaurants.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = r.name.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (r.cuisine && r.cuisine.toLowerCase().includes(q));
    
    const matchesCat = selectedCategory === 'All' ||
      r.name.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (r.cuisine && r.cuisine.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (r.description && r.description.toLowerCase().includes(selectedCategory.toLowerCase()));
      
    const matchesRating = !filterRating4 || (r.rating && parseFloat(r.rating) >= 4.5);
    
    const delTimeNum = r.delivery_time ? parseInt(r.delivery_time.replace(/[^0-9]/g, '')) : 45;
    const matchesFast = !filterFastDelivery || delTimeNum <= 25;

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
    <div style={styles.pageWrap} className="page-enter">
      {/* ── Top Scroll Progress Bar ── */}
      <div style={{ ...styles.scrollProgressBar, width: `${scrollProgress}%` }} />

      {/* ── Floating Background Orbs & Ambient Particle Glows ── */}
      <div style={styles.ambientBlob1} />
      <div style={styles.ambientBlob2} />
      <div style={styles.ambientBlob3} />

      {/* ── 1. STICKY GLASS NAVBAR ── */}
      <nav style={{ ...styles.navbar, ...(scrolled ? styles.navbarScrolled : {}) }}>
        <div style={styles.navInner}>
          {/* Brand */}
          <div style={styles.brandGroup} onClick={() => navigate('/dashboard')}>
            <img src="/images/logo.png" alt="FoodDash" style={styles.brandLogoImg} />
            <div>
              <div style={styles.brandTitleRow}>
                <span style={styles.brandTitle}>FoodDash</span>
                <span style={styles.brandBadge}>ENTERPRISE</span>
              </div>
              <span style={styles.brandSub}>Smarter Food Logistics</span>
            </div>
          </div>

          {/* Center Links */}
          <div style={styles.navLinksCenter} className="hide-mobile">
            <a href="#hero" style={styles.navLinkActive}>Home</a>
            <a href="#categories" style={styles.navLink}>Categories</a>
            <a href="#restaurants" style={styles.navLink}>Restaurants</a>
            <a href="#features" style={styles.navLink}>Features</a>
            <a href="#how-it-works" style={styles.navLink}>How It Works</a>
            <a href="#reviews" style={styles.navLink}>Reviews</a>
          </div>

          {/* Right Actions */}
          <div style={styles.navRightGroup}>
            {/* Live radar badge */}
            <div style={styles.liveRadarBadge} className="hide-mobile">
              <span className="status-dot-live" />
              <span style={styles.liveRadarTxt}>LIVE SYSTEM</span>
            </div>

            {/* My Orders Button */}
            {user && (
              <button onClick={() => navigate('/my-orders')} style={styles.navGhostBtn}>
                📦 <span className="hide-mobile">Orders</span>
              </button>
            )}

            {/* Cart Button */}
            <button onClick={toggleSidebar} style={styles.navCartBtn}>
              <ShoppingBag size={18} />
              <span className="hide-mobile">Cart</span>
              {cartCount > 0 && <span style={styles.cartBadgeNum}>{cartCount}</span>}
            </button>

            {/* User Profile or Login */}
            {user ? (
              <div style={styles.userMenuPill}>
                <div style={styles.userAvatarCircle}>{user.email?.[0]?.toUpperCase() || 'U'}</div>
                <button onClick={handleLogout} title="Sign Out" style={styles.logoutIconButton}>
                  <LogOut size={16} color="rgba(255,255,255,0.7)" />
                </button>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} style={styles.navLoginBtn}>
                Sign In
              </button>
            )}

            {/* Order Now CTA */}
            <button onClick={() => {
              const el = document.getElementById('restaurants');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} style={styles.navCtaBtn}>
              Order Now <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── 2. HERO SECTION (3D WEBGL + ENTERPRISE TEXT + FLOATING SMARTPHONE) ── */}
      <section id="hero" style={styles.heroSection}>
        <Food3DHeroCanvas />

        <div style={styles.heroContainer}>
          {/* Left Column: Text & Trust */}
          <div style={styles.heroLeft}>
            {/* Tagline Badge */}
            <div style={styles.heroTagBadge}>
              <Sparkles size={14} color="#FF6B35" />
              <span>NEXT-GEN 3D FOOD LOGISTICS PLATFORM</span>
            </div>

            <h1 style={styles.heroHeading}>
              Food Delivered <br />
              <span style={styles.heroHeadingGradient}>Smarter, Faster</span> <br />
              & Fresher.
            </h1>

            <p style={styles.heroSubheading}>
              Experience hyper-local culinary delivery with real-time 3D rider tracking, 
              15-minute express delivery, and farm-fresh artisanal dishes curated by top chefs.
            </p>

            {/* CTA Buttons */}
            <div style={styles.heroCtaRow}>
              <button
                onClick={() => {
                  const el = document.getElementById('restaurants');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={styles.heroPrimaryBtn}
              >
                <span>Order Now</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('categories');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={styles.heroSecondaryBtn}
              >
                <Sparkles size={18} color="#FF6B35" />
                <span>Explore Menu</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div style={styles.heroTrustGrid}>
              <div style={styles.trustItem}>
                <div style={styles.avatarStack}>
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="User" style={styles.stackAvatar} />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="User" style={styles.stackAvatar} />
                  <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80" alt="User" style={styles.stackAvatar} />
                </div>
                <div>
                  <div style={styles.trustTitle}>50K+ Active Foodies</div>
                  <div style={styles.trustSub}>Satisfied everyday users</div>
                </div>
              </div>

              <div style={styles.trustDivider} />

              <div style={styles.trustItem}>
                <div style={styles.trustIconCircle}>
                  <Award size={20} color="#FFB703" />
                </div>
                <div>
                  <div style={styles.trustTitle}>500+ Top Kitchens</div>
                  <div style={styles.trustSub}>Curated gourmet spots</div>
                </div>
              </div>

              <div style={styles.trustDivider} />

              <div style={styles.trustItem}>
                <div style={styles.trustIconCircle}>
                  <Star size={20} color="#FF6B35" fill="#FF6B35" />
                </div>
                <div>
                  <div style={styles.trustTitle}>4.9 ★ Rating</div>
                  <div style={styles.trustSub}>Over 120,000+ reviews</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Floating 3D Mobile Phone & Food Badges */}
          <div style={styles.heroRight}>
            <div style={styles.phoneStage}>
              {/* Outer 3D Phone Shell */}
              <div style={styles.phoneMockup}>
                {/* Notch */}
                <div style={styles.phoneNotch} />
                
                {/* Screen Content */}
                <div style={styles.phoneScreen}>
                  {/* Top Phone Header */}
                  <div style={styles.phoneHeader}>
                    <img src="/images/logo.png" alt="FoodDash" style={{ width: '22px', height: '22px', borderRadius: '6px' }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>FoodDash Live</span>
                    <span style={{ fontSize: '0.65rem', color: '#2EC4B6', background: 'rgba(46,196,182,0.18)', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>GPS ON</span>
                  </div>

                  {/* Phone Live Rider Map Card */}
                  <div style={styles.phoneMapCard}>
                    <div style={styles.phoneMapHeader}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="status-dot-live" />
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff' }}>Rider En Route</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FFB703' }}>14 mins</span>
                    </div>

                    <div style={styles.phoneProgressTrack}>
                      <div style={{ ...styles.phoneProgressBar, width: '65%' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
                      <div style={styles.phoneRiderAvatar}>🛵</div>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>Marcus Vance</div>
                        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)' }}>Delivering your Artisan Burger</div>
                      </div>
                    </div>
                  </div>

                  {/* Food Card 1 Inside Phone */}
                  <div style={styles.phoneFoodCard}>
                    <img src="/images/burger.png" alt="Burger" style={styles.phoneFoodImg} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff' }}>Double Bacon Smash</div>
                      <div style={{ fontSize: '0.7rem', color: '#2EC4B6', fontWeight: 700 }}>$14.99 · 4.9 ★</div>
                    </div>
                    <button style={styles.phoneAddBtn}>+</button>
                  </div>

                  {/* Food Card 2 Inside Phone */}
                  <div style={styles.phoneFoodCard}>
                    <img src="/images/pizza.png" alt="Pizza" style={styles.phoneFoodImg} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff' }}>Margherita DOC</div>
                      <div style={{ fontSize: '0.7rem', color: '#2EC4B6', fontWeight: 700 }}>$18.00 · 4.9 ★</div>
                    </div>
                    <button style={styles.phoneAddBtn}>+</button>
                  </div>
                </div>
              </div>

              {/* Floating 3D Badge 1: Burger */}
              <div style={{ ...styles.floating3dBadge, top: '-20px', left: '-40px', animation: 'float 4s ease-in-out infinite' }}>
                <img src="/images/burger.png" alt="Burger" style={styles.floatBadgeImg} />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#fff' }}>Smash Burger</div>
                  <div style={{ fontSize: '0.68rem', color: '#FFB703', fontWeight: 700 }}>🔥 20% OFF</div>
                </div>
              </div>

              {/* Floating 3D Badge 2: Pizza */}
              <div style={{ ...styles.floating3dBadge, bottom: '40px', right: '-45px', animation: 'float 5s ease-in-out infinite 1s' }}>
                <img src="/images/pizza.png" alt="Pizza" style={styles.floatBadgeImg} />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#fff' }}>Wood-Fired Pizza</div>
                  <div style={{ fontSize: '0.68rem', color: '#2EC4B6', fontWeight: 700 }}>⚡ 18 min delivery</div>
                </div>
              </div>

              {/* Floating 3D Badge 3: Discount Pill */}
              <div style={{ ...styles.floating3dPill, top: '40%', left: '-55px', animation: 'float 4.5s ease-in-out infinite 0.5s' }}>
                <Flame size={16} color="#FF6B35" />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>50K+ Meals Served Today</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. SMART SEARCH BAR & CUISINE DISCOVERY ── */}
      <section id="search" style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <div style={styles.searchGlassCard}>
            <div style={styles.searchInputRow}>
              <Search size={22} color="#FF6B35" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search food cravings, top restaurants, or cuisines (e.g. Burger, Pizza, Sushi)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={styles.clearSearchBtn}>✕</button>
              )}

              {/* Voice Search Button */}
              <button onClick={toggleVoiceSearch} style={{ ...styles.voiceSearchBtn, background: isListening ? 'rgba(239,68,68,0.2)' : 'rgba(255,107,53,0.1)' }}>
                {isListening ? <MicOff size={18} color="#ef4444" /> : <Mic size={18} color="#FF6B35" />}
              </button>
            </div>

            {/* Quick Filter Chips */}
            <div style={styles.filterRow}>
              <span style={styles.filterLabel}>Quick Filters:</span>
              
              <button
                onClick={() => setFilterRating4(!filterRating4)}
                style={{ ...styles.filterChip, ...(filterRating4 ? styles.filterChipActive : {}) }}
              >
                <Star size={14} color={filterRating4 ? '#fff' : '#FFB703'} fill={filterRating4 ? '#fff' : '#FFB703'} />
                <span>4.5+ Top Rated</span>
              </button>

              <button
                onClick={() => setFilterFastDelivery(!filterFastDelivery)}
                style={{ ...styles.filterChip, ...(filterFastDelivery ? styles.filterChipActive : {}) }}
              >
                <Zap size={14} color={filterFastDelivery ? '#fff' : '#FF6B35'} />
                <span>Under 25 Mins</span>
              </button>

              <div style={styles.sortDropdownWrap}>
                <SlidersHorizontal size={14} color="#8F9BB3" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={styles.sortSelect}
                >
                  <option value="default">Sort: Recommended</option>
                  <option value="rating">Sort by Rating (Highest)</option>
                  <option value="delivery_time">Sort by Delivery Time</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. POPULAR CATEGORIES SECTION (CIRCULAR INTERACTIVE CARDS) ── */}
      <section id="categories" style={styles.sectionWrap}>
        <div style={styles.sectionHeader}>
          <div>
            <div style={styles.sectionBadge}>
              <Flame size={14} color="#FF6B35" />
              <span>EXPLORE BY CATEGORY</span>
            </div>
            <h2 style={styles.sectionTitle}>What Are You Craving Today?</h2>
          </div>
          <p style={styles.sectionSubtitle}>Handpicked categories from world-class artisan chefs</p>
        </div>

        <div style={styles.categoriesTrack}>
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  ...styles.categoryCircleCard,
                  ...(isSelected ? styles.categoryCircleCardActive : {}),
                }}
              >
                <div style={styles.categoryIconWrap}>{cat.icon}</div>
                <span style={styles.categoryName}>{cat.name}</span>
                <span style={styles.categoryCount}>{cat.count}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 5. FEATURE CARDS SECTION (ENTERPRISE GLASS CARDS) ── */}
      <section id="features" style={{ ...styles.sectionWrap, background: '#0B0F19', borderRadius: '32px', padding: '4rem 2rem' }}>
        <div style={styles.sectionHeaderCenter}>
          <div style={{ ...styles.sectionBadge, background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)' }}>
            <Award size={14} color="#FF6B35" />
            <span style={{ color: '#FF6B35' }}>WHY FOODDASH ENTERPRISE</span>
          </div>
          <h2 style={{ ...styles.sectionTitle, color: '#FFFFFF' }}>Engineering The Future of Dining</h2>
          <p style={{ ...styles.sectionSubtitle, color: 'rgba(255,255,255,0.6)' }}>Built on cutting-edge technology for precision, speed, and safety</p>
        </div>

        <div style={styles.featureGrid}>
          {FEATURES.map((feat, idx) => {
            const IconComponent = feat.icon;
            return (
              <div key={idx} style={styles.featureGlassCard} className="hover-lift">
                <div style={{ ...styles.featureIconBox, background: `rgba(${parseInt(feat.color.slice(1,3),16)},${parseInt(feat.color.slice(3,5),16)},${parseInt(feat.color.slice(5,7),16)},0.15)`, border: `1px solid ${feat.color}40` }}>
                  <IconComponent size={24} color={feat.color} />
                </div>
                <span style={{ ...styles.featureBadge, color: feat.color, background: `rgba(${parseInt(feat.color.slice(1,3),16)},${parseInt(feat.color.slice(3,5),16)},${parseInt(feat.color.slice(5,7),16)},0.12)` }}>
                  {feat.badge}
                </span>
                <h3 style={styles.featureCardTitle}>{feat.title}</h3>
                <p style={styles.featureCardDesc}>{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 6. POPULAR RESTAURANTS SHOWCASE (3D TILT CARDS) ── */}
      <section id="restaurants" style={styles.sectionWrap}>
        <div style={styles.sectionHeaderBetween}>
          <div>
            <div style={styles.sectionBadge}>
              <Star size={14} color="#FFB703" fill="#FFB703" />
              <span>POPULAR KITCHENS</span>
            </div>
            <h2 style={styles.sectionTitle}>Featured Partner Restaurants</h2>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              setFilterRating4(false);
              setFilterFastDelivery(false);
            }}
            style={styles.viewAllBtn}
          >
            Reset Filters <RefreshCw size={14} />
          </button>
        </div>

        {loadingRestaurants ? (
          <SectionSpinner message="Loading gourmet restaurants..." />
        ) : (
          <div style={styles.restaurantGrid}>
            {filtered.map((r, i) => (
              <TiltCard
                key={r.id}
                style={styles.restaurantCard}
                onClick={() => navigate(`/restaurant/${r.id}`)}
              >
                {/* Image Container */}
                <div style={styles.cardImageContainer}>
                  <img src={r.image_url || '/images/burger.png'} alt={r.name} style={styles.cardImage} />
                  <div style={styles.cardOverlayGradient} />

                  {/* Like Button */}
                  <button
                    onClick={(e) => toggleFavorite(r.id, e)}
                    style={styles.favoriteBtn}
                  >
                    <Heart size={16} color={likedMap[r.id] ? '#ef4444' : '#ffffff'} fill={likedMap[r.id] ? '#ef4444' : 'none'} />
                  </button>

                  {/* Promo Tag */}
                  {r.discount && (
                    <div style={styles.promoTag}>
                      <Flame size={12} color="#fff" />
                      <span>{r.discount}</span>
                    </div>
                  )}

                  {/* Distance Chip */}
                  <div style={styles.distanceChip}>
                    <MapPin size={11} color="#fff" />
                    <span>{r.distance || '1.0 mi'}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div style={styles.cardBodyContent}>
                  <div style={styles.cardHeaderRow}>
                    <h3 style={styles.cardTitle}>{r.name}</h3>
                    <div style={styles.ratingBadge}>
                      <Star size={12} color="#fff" fill="#fff" />
                      <span>{r.rating ? Number(r.rating).toFixed(1) : '4.9'}</span>
                    </div>
                  </div>

                  <p style={styles.cardCuisine}>{r.cuisine || 'Gourmet Food · Fast Delivery'}</p>

                  <div style={styles.cardFooterMeta}>
                    <div style={styles.metaTime}>
                      <Clock size={13} color="#FF6B35" />
                      <span>{r.delivery_time || '20 min'}</span>
                    </div>

                    <div style={styles.metaPrice}>{r.price_range || '$$'} for two</div>

                    <button style={styles.orderCardBtn}>
                      Order <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        )}
      </section>

      {/* ── 7. HOW IT WORKS TIMELINE ── */}
      <section id="how-it-works" style={styles.sectionWrap}>
        <div style={styles.sectionHeaderCenter}>
          <div style={styles.sectionBadge}>
            <TrendingUp size={14} color="#FF6B35" />
            <span>SIMPLE 4-STEP PROCESS</span>
          </div>
          <h2 style={styles.sectionTitle}>How FoodDash Works</h2>
          <p style={styles.sectionSubtitle}>From craving to doorstep in 4 seamless, automated steps</p>
        </div>

        <div style={styles.stepsGrid}>
          {STEPS.map((s, idx) => {
            const StepIcon = s.icon;
            return (
              <div key={idx} style={styles.stepCard} className="hover-lift">
                <div style={styles.stepNumBadge}>{s.num}</div>
                <div style={styles.stepIconBox}>
                  <StepIcon size={26} color="#FF6B35" />
                </div>
                <h3 style={styles.stepTitle}>{s.title}</h3>
                <p style={styles.stepDesc}>{s.desc}</p>
                {idx < STEPS.length - 1 && <div style={styles.stepArrow} className="hide-mobile">→</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 8. LIVE ORDER TRACKER INTERACTIVE PREVIEW ── */}
      <section style={styles.sectionWrap}>
        <div style={styles.trackerGlassContainer}>
          <div style={styles.trackerGrid}>
            <div>
              <div style={{ ...styles.sectionBadge, background: 'rgba(46,196,182,0.15)', border: '1px solid rgba(46,196,182,0.3)' }}>
                <Navigation size={14} color="#2EC4B6" />
                <span style={{ color: '#2EC4B6' }}>LIVE RADAR MOCKUP</span>
              </div>
              <h2 style={{ ...styles.sectionTitle, color: '#fff', fontSize: '2.2rem' }}>
                Track Your Meal in <br />
                <span style={{ color: '#FFB703' }}>Sub-Meter Real Time</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Watch your delivery rider navigate straight to your address with zero lag, 
                temperature sensor readouts, and automated push notifications.
              </p>

              <div style={styles.trackerStepList}>
                {[
                  { title: 'Order Confirmed', status: 'Completed', icon: CheckCircle2, time: '12:40 PM' },
                  { title: 'Kitchen Preparing', status: 'Completed', icon: Flame, time: '12:44 PM' },
                  { title: 'Rider Picked Up', status: 'In Progress', icon: Truck, time: '12:50 PM' },
                  { title: 'Arriving at Doorstep', status: 'Pending', icon: MapPin, time: 'ETA 1:02 PM' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  const isDone = item.status === 'Completed';
                  const isInProgress = item.status === 'In Progress';
                  return (
                    <div key={i} style={styles.trackerStepRow}>
                      <div style={{ ...styles.trackerIconCircle, background: isDone ? '#2EC4B6' : isInProgress ? '#FFB703' : 'rgba(255,255,255,0.1)', color: isDone || isInProgress ? '#000' : '#fff' }}>
                        <Icon size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>{item.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{item.time}</div>
                      </div>
                      {isInProgress && <span style={styles.livePulsePill}>LIVE</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Map Visual */}
            <div style={styles.mapVisualCard}>
              <div style={styles.mapVisualHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src="/images/logo.png" alt="Rider" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>Order #FD-9842</div>
                    <div style={{ fontSize: '0.72rem', color: '#2EC4B6' }}>On time · 12 min arrival</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FFB703' }}>72°F</div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' }}>Thermal Box Temp</div>
                </div>
              </div>

              {/* Map Route Graphic */}
              <div style={styles.mapCanvasBox}>
                <div style={styles.mapGridPattern} />
                {/* Rider Pin */}
                <div style={styles.mapRiderPin} className="animate-pulse-glow">
                  🛵
                </div>
                {/* Destination Pin */}
                <div style={styles.mapDestPin}>
                  📍
                </div>
                {/* Dotted Route Line */}
                <svg style={styles.mapRouteSvg}>
                  <path d="M 50 140 Q 150 50 250 120" stroke="#FF6B35" strokeWidth="4" strokeDasharray="6,6" fill="none" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. CUSTOMER REVIEWS CAROUSEL ── */}
      <section id="reviews" style={styles.sectionWrap}>
        <div style={styles.sectionHeaderCenter}>
          <div style={styles.sectionBadge}>
            <Heart size={14} color="#FF6B35" fill="#FF6B35" />
            <span>LOVED BY THOUSANDS</span>
          </div>
          <h2 style={styles.sectionTitle}>What Foodies Say About Us</h2>
          <p style={styles.sectionSubtitle}>Verified reviews from food lovers and tech leaders</p>
        </div>

        <div style={styles.reviewsGrid}>
          {REVIEWS.map((rev, idx) => (
            <div key={idx} style={styles.reviewGlassCard} className="hover-lift">
              <div style={styles.reviewStarsRow}>
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} size={16} color="#FFB703" fill="#FFB703" />
                ))}
              </div>
              <p style={styles.reviewText}>"{rev.text}"</p>
              <div style={styles.reviewUserRow}>
                <img src={rev.avatar} alt={rev.name} style={styles.reviewAvatar} />
                <div>
                  <div style={styles.reviewName}>{rev.name}</div>
                  <div style={styles.reviewRole}>{rev.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 10. DOWNLOAD MOBILE APP SHOWCASE ── */}
      <section style={styles.sectionWrap}>
        <div style={styles.appDownloadCard}>
          <div style={styles.appDownloadGrid}>
            <div>
              <div style={styles.sectionBadge}>
                <Smartphone size={14} color="#FF6B35" />
                <span>MOBILE APP EXPERIENCE</span>
              </div>
              <h2 style={{ ...styles.sectionTitle, fontSize: '2.4rem' }}>
                Get The Full Experience <br />
                On iOS & Android
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Order with 1-tap Apple Pay, track live riders on Lock Screen Live Activities, 
                and receive exclusive daily 30% discount coupons.
              </p>

              <div style={styles.storeButtonsRow}>
                <div style={styles.storeBtn}>
                  <span style={{ fontSize: '1.5rem' }}>🍏</span>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Download on</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>App Store</div>
                  </div>
                </div>

                <div style={styles.storeBtn}>
                  <span style={{ fontSize: '1.5rem' }}>🤖</span>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Get it on</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>Google Play</div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Card */}
            <div style={styles.qrCodeCard}>
              <div style={styles.qrCodeBox}>
                <QrCode size={110} color="#0B0F19" />
              </div>
              <p style={{ margin: '0.8rem 0 0', fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                Scan to Install App
              </p>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                Camera scan auto-opens store
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. LIVE ANIMATED STATISTICS COUNTERS ── */}
      <section style={styles.sectionWrap}>
        <div style={styles.statsStrip}>
          {STATS.map((st, i) => {
            const StatIcon = st.icon;
            return (
              <div key={i} style={styles.statBox}>
                <div style={styles.statIconWrap}>
                  <StatIcon size={24} color="#FF6B35" />
                </div>
                <div style={styles.statValNum}>{st.value}</div>
                <div style={styles.statValLabel}>{st.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 12. ENTERPRISE FOOTER ── */}
      <footer style={styles.footerWrap}>
        <div style={styles.footerContainer}>
          <div style={styles.footerMainGrid}>
            {/* Column 1: Brand */}
            <div>
              <div style={styles.footerBrandRow}>
                <img src="/images/logo.png" alt="FoodDash" style={styles.footerLogoImg} />
                <span style={styles.footerBrandName}>FoodDash</span>
                <span style={styles.footerBrandBadge}>ENTERPRISE</span>
              </div>
              <p style={styles.footerDescText}>
                The world's most advanced 3D food delivery and logistics application. 
                Delivering culinary bliss to 50K+ customers daily.
              </p>
              <div style={styles.socialIconsRow}>
                {['🌐', '🐦', '📸', '💼', '▶️'].map((soc, idx) => (
                  <div key={idx} style={styles.socialCircle}>{soc}</div>
                ))}
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 style={styles.footerHead}>Explore</h4>
              {['Home', 'Categories', 'Top Restaurants', 'Offers & Discounts', 'Live Order Radar', 'Mobile App'].map(l => (
                <p key={l} style={styles.footerLinkItem}>→ {l}</p>
              ))}
            </div>

            {/* Column 3: Company */}
            <div>
              <h4 style={styles.footerHead}>Company</h4>
              {['About Us', 'Careers', 'Partner Kitchens', 'Rider Network', 'Press Kit', 'Contact Support'].map(l => (
                <p key={l} style={styles.footerLinkItem}>→ {l}</p>
              ))}
            </div>

            {/* Column 4: Newsletter */}
            <div>
              <h4 style={styles.footerHead}>Newsletter</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Subscribe for exclusive 30% discount drops and culinary updates.
              </p>
              {newsletterSubscribed ? (
                <div style={styles.newsletterSuccessBadge}>
                  <Check size={16} color="#2EC4B6" />
                  <span>Subscribed! Check your inbox for $10 off.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} style={styles.newsletterForm}>
                  <input
                    type="email"
                    placeholder="Enter your email..."
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    style={styles.newsletterInput}
                  />
                  <button type="submit" style={styles.newsletterBtn}>
                    <Send size={15} />
                  </button>
                </form>
              )}
            </div>
          </div>

          <div style={styles.footerBottomRow}>
            <div style={styles.footerCopyrightText}>
              © 2026 FoodDash Enterprise Inc. All rights reserved. Designed by Muhammad Ayan.
            </div>
            <div style={styles.footerLegalRow}>
              <span>Privacy Policy</span> · <span>Terms of Service</span> · <span>Cookie Policy</span> · <span>Security Audit</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── MILLION DOLLAR STARTUP STYLES ─── */
const styles = {
  pageWrap: {
    minHeight: '100vh',
    background: '#FFFFFF',
    color: '#0B0F19',
    fontFamily: 'var(--font-body)',
    position: 'relative',
    overflowX: 'hidden',
  },

  scrollProgressBar: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #FF6B35, #FFB703, #2EC4B6)',
    zIndex: 999999,
    transition: 'width 0.1s ease-out',
  },

  /* Background Ambient Blobs */
  ambientBlob1: {
    position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px',
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.12) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0, filter: 'blur(60px)',
  },
  ambientBlob2: {
    position: 'absolute', top: '800px', left: '-150px', width: '600px', height: '600px',
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,196,182,0.1) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0, filter: 'blur(70px)',
  },
  ambientBlob3: {
    position: 'absolute', top: '2200px', right: '-100px', width: '550px', height: '550px',
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,183,3,0.12) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0, filter: 'blur(65px)',
  },

  /* 1. Navbar */
  navbar: {
    position: 'fixed', top: 0, left: 0, right: 0,
    zIndex: 9999,
    padding: '0.8rem 0',
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    transition: 'all 0.3s ease',
  },
  navbarScrolled: {
    background: 'rgba(255, 255, 255, 0.95)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
  },
  navInner: {
    maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  brandGroup: { display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' },
  brandLogoImg: { width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 14px rgba(255,107,53,0.4)' },
  brandTitleRow: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  brandTitle: { fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0B0F19', letterSpacing: '-0.03em' },
  brandBadge: { fontSize: '0.58rem', fontWeight: 800, background: 'linear-gradient(135deg, #FF6B35, #FF8C42)', color: '#fff', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.06em' },
  brandSub: { fontSize: '0.68rem', color: '#8F9BB3', fontWeight: 600, display: 'block' },
  navLinksCenter: { display: 'flex', alignItems: 'center', gap: '1.8rem' },
  navLink: { color: '#475569', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' },
  navLinkActive: { color: '#FF6B35', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none' },
  navRightGroup: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  liveRadarBadge: { display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '20px' },
  liveRadarTxt: { fontSize: '0.68rem', fontWeight: 800, color: '#15803D' },
  navGhostBtn: { padding: '0.55rem 0.9rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', color: '#0B0F19' },
  navCartBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '0.55rem 1rem', background: '#0B0F19', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' },
  cartBadgeNum: { background: '#FF6B35', color: '#fff', borderRadius: '50%', padding: '2px 7px', fontSize: '0.72rem', fontWeight: 800 },
  userMenuPill: { display: 'flex', alignItems: 'center', gap: '6px', background: '#0B0F19', padding: '4px 8px 4px 4px', borderRadius: '20px' },
  userAvatarCircle: { width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B35, #FFB703)', color: '#fff', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoutIconButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' },
  navLoginBtn: { padding: '0.55rem 1rem', background: '#F1F5F9', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', color: '#0B0F19' },
  navCtaBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.2rem', background: BRAND.primaryGrad, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', boxShadow: BRAND.primaryGlow },

  /* 2. Hero */
  heroSection: { position: 'relative', minHeight: '88vh', paddingTop: '100px', display: 'flex', alignItems: 'center', overflow: 'hidden' },
  heroContainer: { maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '3rem', width: '100%', alignItems: 'center', position: 'relative', zIndex: 10 },
  heroLeft: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  heroTagBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, color: '#FF6B35', width: 'fit-content' },
  heroHeading: { fontSize: '3.6rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0B0F19', lineHeight: 1.08, letterSpacing: '-0.04em', margin: 0 },
  heroHeadingGradient: { background: 'linear-gradient(135deg, #FF6B35 0%, #FFB703 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSubheading: { fontSize: '1.1rem', color: '#64748B', lineHeight: 1.6, margin: 0, maxWidth: '520px' },
  heroCtaRow: { display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' },
  heroPrimaryBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '1rem 2.2rem', background: BRAND.primaryGrad, color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 12px 32px rgba(255,107,53,0.4)' },
  heroSecondaryBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '1rem 1.8rem', background: '#FFFFFF', color: '#0B0F19', border: '2px solid #F1F5F9', borderRadius: '16px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' },
  heroTrustGrid: { display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap' },
  trustItem: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  avatarStack: { display: 'flex', alignItems: 'center' },
  stackAvatar: { width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #fff', marginLeft: '-10px', objectFit: 'cover' },
  trustTitle: { fontSize: '0.9rem', fontWeight: 800, color: '#0B0F19' },
  trustSub: { fontSize: '0.75rem', color: '#94A3B8' },
  trustDivider: { width: '1px', height: '30px', background: '#E2E8F0' },
  trustIconCircle: { width: '38px', height: '38px', borderRadius: '50%', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  /* Phone Mockup */
  heroRight: { display: 'flex', justifyContent: 'center', position: 'relative' },
  phoneStage: { position: 'relative', width: '320px', height: '580px' },
  phoneMockup: { width: '320px', height: '580px', background: '#0F172A', borderRadius: '44px', border: '10px solid #1E293B', boxShadow: '0 32px 64px rgba(0,0,0,0.3)', padding: '12px', position: 'relative', overflow: 'hidden' },
  phoneNotch: { width: '120px', height: '22px', background: '#1E293B', borderRadius: '0 0 16px 16px', margin: '0 auto 12px', zIndex: 10, position: 'relative' },
  phoneScreen: { display: 'flex', flexDirection: 'column', gap: '0.8rem', height: '100%' },
  phoneHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.06)', borderRadius: '12px' },
  phoneMapCard: { background: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '0.8rem', backdropFilter: 'blur(10px)' },
  phoneMapHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  phoneProgressTrack: { width: '100%', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', marginTop: '0.5rem' },
  phoneProgressBar: { height: '100%', background: 'linear-gradient(90deg, #FF6B35, #FFB703)', borderRadius: '2px' },
  phoneRiderAvatar: { width: '32px', height: '32px', borderRadius: '50%', background: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' },
  phoneFoodCard: { display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'rgba(255,255,255,0.06)', padding: '0.6rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' },
  phoneFoodImg: { width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' },
  phoneAddBtn: { width: '28px', height: '28px', borderRadius: '8px', background: '#FF6B35', border: 'none', color: '#fff', fontWeight: 900, cursor: 'pointer' },

  /* Floating 3D Badges */
  floating3dBadge: { position: 'absolute', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1rem', background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(16px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', zIndex: 20 },
  floatBadgeImg: { width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover' },
  floating3dPill: { position: 'absolute', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1rem', background: '#0F172A', borderRadius: '30px', border: '1px solid #FF6B35', boxShadow: '0 12px 30px rgba(255,107,53,0.3)', zIndex: 20 },

  /* 3. Search */
  searchSection: { maxWidth: '1280px', margin: '-40px auto 2rem', padding: '0 1.5rem', position: 'relative', zIndex: 30 },
  searchGlassCard: { background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '1.25rem 1.5rem', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 20px 48px rgba(0,0,0,0.08)' },
  searchInputRow: { display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem 0.8rem', background: '#F8FAFC', borderRadius: '16px', border: '1.5px solid #E2E8F0' },
  searchInput: { flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem', color: '#0B0F19', fontFamily: 'var(--font-body)', fontWeight: 500 },
  clearSearchBtn: { background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.9rem' },
  voiceSearchBtn: { border: 'none', borderRadius: '12px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  filterRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' },
  filterLabel: { fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' },
  filterChip: { display: 'flex', alignItems: 'center', gap: '6px', padding: '0.45rem 0.9rem', borderRadius: '20px', border: '1.5px solid #E2E8F0', background: '#fff', color: '#475569', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' },
  filterChipActive: { background: '#FF6B35', color: '#fff', borderColor: '#FF6B35' },
  sortDropdownWrap: { display: 'flex', alignItems: 'center', gap: '6px', padding: '0.4rem 0.8rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', marginLeft: 'auto' },
  sortSelect: { border: 'none', background: 'transparent', outline: 'none', fontSize: '0.82rem', fontWeight: 700, color: '#475569', cursor: 'pointer' },

  /* General Section Headers */
  sectionWrap: { maxWidth: '1280px', margin: '4rem auto', padding: '0 1.5rem' },
  sectionHeader: { marginBottom: '2rem' },
  sectionHeaderCenter: { textAlign: 'center', marginBottom: '3rem', maxWidth: '640px', marginInline: 'auto' },
  sectionHeaderBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
  sectionBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'rgba(255,107,53,0.08)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, color: '#FF6B35', marginBottom: '0.5rem' },
  sectionTitle: { fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0B0F19', letterSpacing: '-0.03em', margin: 0 },
  sectionSubtitle: { fontSize: '1rem', color: '#64748B', margin: '0.5rem 0 0 0' },

  /* 4. Categories */
  categoriesTrack: { display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' },
  categoryCircleCard: { minWidth: '110px', padding: '1.25rem 0.8rem', background: '#FFFFFF', border: '1.5px solid #F1F5F9', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' },
  categoryCircleCardActive: { background: 'linear-gradient(135deg, #FF6B35, #FF8C42)', color: '#fff', borderColor: '#FF6B35', boxShadow: '0 10px 25px rgba(255,107,53,0.35)', transform: 'scale(1.05)' },
  categoryIconWrap: { fontSize: '2rem', marginBottom: '2px' },
  categoryName: { fontSize: '0.82rem', fontWeight: 800, textAlign: 'center' },
  categoryCount: { fontSize: '0.68rem', opacity: 0.75, fontWeight: 700 },

  /* 5. Features Grid */
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' },
  featureGlassCard: { background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  featureIconBox: { width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  featureBadge: { fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', width: 'fit-content' },
  featureCardTitle: { fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: 0 },
  featureCardDesc: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0 },

  /* 6. Restaurants Grid */
  viewAllBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.2rem', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' },
  restaurantGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.75rem' },
  restaurantCard: { background: '#FFFFFF', borderRadius: '24px', border: '1.5px solid #F1F5F9', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.3s ease' },
  cardImageContainer: { position: 'relative', height: '200px', overflow: 'hidden' },
  cardImage: { width: '100%', height: '100%', objectFit: 'cover' },
  cardOverlayGradient: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' },
  favoriteBtn: { position: 'absolute', top: '12px', right: '12px', width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  promoTag: { position: 'absolute', bottom: '12px', left: '12px', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#FF6B35', color: '#fff', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 800 },
  distanceChip: { position: 'absolute', top: '12px', left: '12px', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', color: '#fff', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700 },
  cardBodyContent: { padding: '1.25rem' },
  cardHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' },
  cardTitle: { fontSize: '1.15rem', fontWeight: 900, color: '#0B0F19', margin: 0, fontFamily: 'var(--font-heading)' },
  ratingBadge: { display: 'flex', alignItems: 'center', gap: '4px', background: '#2EC4B6', color: '#fff', padding: '3px 8px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800 },
  cardCuisine: { fontSize: '0.85rem', color: '#64748B', margin: '0 0 1rem 0' },
  cardFooterMeta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '0.9rem' },
  metaTime: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 700, color: '#0B0F19' },
  metaPrice: { fontSize: '0.82rem', color: '#64748B', fontWeight: 600 },
  orderCardBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '0.45rem 0.9rem', background: '#FF6B35', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' },

  /* 7. Steps */
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', position: 'relative' },
  stepCard: { background: '#F8FAFC', borderRadius: '24px', padding: '2rem 1.5rem', border: '1.5px solid #E2E8F0', position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  stepNumBadge: { fontSize: '0.75rem', fontWeight: 900, color: '#FF6B35', background: 'rgba(255,107,53,0.1)', padding: '2px 8px', borderRadius: '6px', width: 'fit-content' },
  stepIconBox: { width: '56px', height: '56px', borderRadius: '16px', background: '#FFFFFF', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  stepTitle: { fontSize: '1.15rem', fontWeight: 800, color: '#0B0F19', margin: 0 },
  stepDesc: { fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 },
  stepArrow: { position: 'absolute', right: '-15px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.5rem', color: '#CBD5E1', fontWeight: 900, zIndex: 10 },

  /* 8. Live Tracker Container */
  trackerGlassContainer: { background: '#0B0F19', borderRadius: '32px', padding: '3.5rem 2.5rem', boxShadow: '0 32px 64px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' },
  trackerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' },
  trackerStepList: { display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' },
  trackerStepRow: { display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.9rem 1.2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' },
  trackerIconCircle: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  livePulsePill: { fontSize: '0.65rem', fontWeight: 800, background: '#FFB703', color: '#000', padding: '2px 8px', borderRadius: '10px' },
  mapVisualCard: { background: '#1E293B', borderRadius: '24px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)' },
  mapVisualHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  mapCanvasBox: { height: '220px', background: '#0F172A', borderRadius: '16px', position: 'relative', overflow: 'hidden' },
  mapGridPattern: { position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' },
  mapRiderPin: { position: 'absolute', top: '40%', left: '30%', fontSize: '1.8rem', zIndex: 10 },
  mapDestPin: { position: 'absolute', top: '65%', left: '75%', fontSize: '1.8rem', zIndex: 10 },
  mapRouteSvg: { position: 'absolute', inset: 0, width: '100%', height: '100%' },

  /* 9. Reviews */
  reviewsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' },
  reviewGlassCard: { background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '24px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  reviewStarsRow: { display: 'flex', gap: '4px' },
  reviewText: { fontSize: '0.95rem', color: '#334155', lineHeight: 1.6, fontStyle: 'italic', margin: 0 },
  reviewUserRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 'auto' },
  reviewAvatar: { width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' },
  reviewName: { fontSize: '0.92rem', fontWeight: 800, color: '#0B0F19' },
  reviewRole: { fontSize: '0.75rem', color: '#64748B' },

  /* 10. App Download */
  appDownloadCard: { background: 'linear-gradient(135deg, #FFFBEB 0%, #EFF6FF 100%)', borderRadius: '32px', padding: '3.5rem 2.5rem', border: '1.5px solid #FEF3C7' },
  appDownloadGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' },
  storeButtonsRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  storeBtn: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.4rem', background: '#0B0F19', color: '#fff', borderRadius: '16px', cursor: 'pointer' },
  qrCodeCard: { background: '#FFFFFF', borderRadius: '24px', padding: '1.75rem', textAlign: 'center', boxShadow: '0 12px 32px rgba(0,0,0,0.06)', width: 'fit-content', margin: '0 auto' },
  qrCodeBox: { padding: '1rem', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1', display: 'inline-block' },

  /* 11. Stats Strip */
  statsStrip: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', background: '#0B0F19', borderRadius: '28px', padding: '2.5rem 2rem' },
  statBox: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statIconWrap: { width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,107,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' },
  statValNum: { fontSize: '2.4rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'var(--font-heading)' },
  statValLabel: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 },

  /* 12. Footer */
  footerWrap: { background: '#0B0F19', color: '#FFFFFF', paddingTop: '4rem', paddingBottom: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' },
  footerContainer: { maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' },
  footerMainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' },
  footerBrandRow: { display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' },
  footerLogoImg: { width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover' },
  footerBrandName: { fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#FFFFFF' },
  footerBrandBadge: { fontSize: '0.58rem', fontWeight: 800, background: '#FF6B35', color: '#fff', padding: '2px 6px', borderRadius: '4px' },
  footerDescText: { color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', lineHeight: 1.6 },
  socialIconsRow: { display: 'flex', gap: '0.5rem', marginTop: '1.25rem' },
  socialCircle: { width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', cursor: 'pointer' },
  footerHead: { fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.25rem' },
  footerLinkItem: { color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', margin: '0 0 0.6rem 0', cursor: 'pointer', transition: 'color 0.2s' },
  newsletterForm: { display: 'flex', gap: '0.5rem' },
  newsletterInput: { flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', outline: 'none', fontSize: '0.88rem' },
  newsletterBtn: { padding: '0.75rem 1rem', background: '#FF6B35', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 800 },
  newsletterSuccessBadge: { display: 'flex', alignItems: 'center', gap: '6px', padding: '0.75rem', background: 'rgba(46,196,182,0.15)', border: '1px solid rgba(46,196,182,0.3)', borderRadius: '12px', color: '#2EC4B6', fontSize: '0.82rem', fontWeight: 700 },
  footerBottomRow: { borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  footerCopyrightText: { color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem' },
  footerLegalRow: { color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem' },
};
