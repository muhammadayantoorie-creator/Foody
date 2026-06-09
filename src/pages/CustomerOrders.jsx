import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import OrderTracking from '../components/OrderTracking';
import { PageSpinner, ErrorBanner } from '../components/LoadingSpinner';

const STATUS_CONFIG = {
  Pending:    { color: 'var(--warning)', bg: 'var(--warning-light)', icon: '📋' },
  Preparing:  { color: 'var(--info)', bg: 'var(--info-light)', icon: '👨‍🍳' },
  'Picked Up':{ color: 'var(--purple)', bg: 'var(--purple-light)', icon: '🛵' },
  Delivered:  { color: 'var(--success)', bg: 'var(--success-light)', icon: '✅' },
  Cancelled:  { color: 'var(--danger)', bg: 'var(--danger-light)', icon: '❌' },
};

export default function CustomerOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'past'

  // Review state
  const [reviewingOrder, setReviewingOrder] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchOrders();

    // Real-time updates for order status changes
    const channel = supabase
      .channel('customer-orders-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` }, (payload) => {
        setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
        const cfg = STATUS_CONFIG[payload.new.status];
        if (cfg) toast(`${cfg.icon} Order status updated: ${payload.new.status}`, { icon: cfg.icon });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user.id]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`*, restaurants(name, image_url), order_items(quantity, price, food_items(name, image_url))`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    const { error } = await supabase
      .from('orders')
      .update({ status: 'Cancelled' })
      .eq('id', orderId)
      .eq('user_id', user.id)  // Security: ensure user owns the order
      .eq('status', 'Pending'); // Safety: only cancel Pending orders
    if (error) {
      toast.error('Failed to cancel order. Please try again.');
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
      toast.success('Order cancelled successfully.');
    }
  };

  const submitReview = async () => {
    if (!reviewingOrder) return;
    try {
      const { error } = await supabase.from('reviews').insert({
        user_id: user.id,
        restaurant_id: reviewingOrder.restaurant_id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      if (error) throw error;
      toast.success('Review submitted! Thank you 🌟');
      setReviewingOrder(null);
      setReviewData({ rating: 5, comment: '' });
    } catch (err) {
      toast.error('Failed to submit review.');
    }
  };

  const activeOrders = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['Delivered', 'Cancelled'].includes(o.status));

  return (
    <div style={styles.container}>
      {/* Navbar Header */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
            <span style={{ marginRight: '0.4rem' }}>←</span> Dashboard
          </button>
          <div style={styles.navBrand} onClick={() => navigate('/dashboard')} className="cursor-pointer">
            <span style={{ fontSize:'1.4rem' }}>🍕</span>
            <span style={styles.brandTxt}>FoodDash</span>
          </div>
          <div style={{ width: '90px' }} />
        </div>
      </nav>

      <main style={styles.main}>
        {loading ? (
          <PageSpinner message="Loading your orders..." />
        ) : error ? (
          <ErrorBanner message={error} onRetry={fetchOrders} />
        ) : orders.length === 0 ? (
          <div style={styles.emptyState} className="glass-panel animate-fade-up">
            <span style={{ fontSize: '5rem', display: 'block', marginBottom: '1.2rem', animation: 'float 3s infinite' }}>🍽️</span>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: 800 }}>No orders yet</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.92rem' }}>Start exploring restaurants and place your first order!</p>
            <button onClick={() => navigate('/dashboard')} style={styles.primaryBtn} className="animate-pulse-glow">
              Explore Restaurants
            </button>
          </div>
        ) : (
          <div className="animate-fade-up">
            {/* Custom Tabbed Navigation */}
            <div style={styles.tabContainer}>
              <button 
                onClick={() => setActiveTab('active')}
                style={{
                  ...styles.tabButton,
                  color: activeTab === 'active' ? 'var(--primary)' : 'var(--text-secondary)',
                  borderBottom: activeTab === 'active' ? '3px solid var(--primary)' : '3px solid transparent',
                  fontWeight: activeTab === 'active' ? 800 : 500
                }}
              >
                Active Orders ({activeOrders.length})
              </button>
              <button 
                onClick={() => setActiveTab('past')}
                style={{
                  ...styles.tabButton,
                  color: activeTab === 'past' ? 'var(--primary)' : 'var(--text-secondary)',
                  borderBottom: activeTab === 'past' ? '3px solid var(--primary)' : '3px solid transparent',
                  fontWeight: activeTab === 'past' ? 800 : 500
                }}
              >
                Order History ({pastOrders.length})
              </button>
            </div>

            {/* Tab Content */}
            <div style={{ marginTop: '1.5rem' }}>
              {activeTab === 'active' ? (
                activeOrders.length === 0 ? (
                  <div style={styles.emptyTabBox}>
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>🔔</span>
                    <h3 style={{ color: 'var(--text-main)', margin: '0 0 0.2rem 0', fontWeight: 800 }}>No active orders</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.88rem' }}>You don't have any orders currently in progress.</p>
                  </div>
                ) : (
                  <div style={styles.ordersList}>
                    {activeOrders.map(order => (
                      <OrderCard 
                        key={order.id} 
                        order={order} 
                        expanded={expandedOrder === order.id} 
                        onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)} 
                        onTrack={() => setTrackingOrderId(order.id)} 
                        onCancel={cancelOrder} 
                        reviewingOrder={reviewingOrder} 
                        reviewData={reviewData} 
                        setReviewingOrder={setReviewingOrder} 
                        setReviewData={setReviewData} 
                        submitReview={submitReview} 
                        navigate={navigate} 
                      />
                    ))}
                  </div>
                )
              ) : (
                pastOrders.length === 0 ? (
                  <div style={styles.emptyTabBox}>
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>📦</span>
                    <h3 style={{ color: 'var(--text-main)', margin: '0 0 0.2rem 0', fontWeight: 800 }}>No past orders</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.88rem' }}>Your past order history is empty.</p>
                  </div>
                ) : (
                  <div style={styles.ordersList}>
                    {pastOrders.map(order => (
                      <OrderCard 
                        key={order.id} 
                        order={order} 
                        expanded={expandedOrder === order.id} 
                        onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)} 
                        onTrack={() => setTrackingOrderId(order.id)} 
                        onCancel={cancelOrder} 
                        reviewingOrder={reviewingOrder} 
                        reviewData={reviewData} 
                        setReviewingOrder={setReviewingOrder} 
                        setReviewData={setReviewData} 
                        submitReview={submitReview} 
                        navigate={navigate} 
                      />
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </main>

      {/* Order Tracking Modal */}
      {trackingOrderId && (
        <OrderTracking orderId={trackingOrderId} onClose={() => setTrackingOrderId(null)} />
      )}
    </div>
  );
}

function OrderCard({ order, expanded, onToggle, onTrack, onCancel, reviewingOrder, reviewData, setReviewingOrder, setReviewData, submitReview, navigate }) {
  const cfg = STATUS_CONFIG[order.status] || { color: 'var(--text-muted)', bg: 'var(--border)', icon: '❓' };
  const isActive = !['Delivered', 'Cancelled'].includes(order.status);

  return (
    <div style={styles.orderCard} className="animate-fade-up">
      {/* Card Header */}
      <div style={styles.cardTop} onClick={onToggle}>
        <div style={styles.restInfo}>
          {order.restaurants?.image_url ? (
            <img src={order.restaurants.image_url} alt="" style={styles.restThumb} />
          ) : (
            <div style={{ ...styles.restThumb, background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: '1px solid var(--border)' }}>🍽️</div>
          )}
          <div>
            <h3 style={styles.restName}>{order.restaurants?.name || 'Unknown Restaurant'}</h3>
            <p style={styles.orderDate}>
              📅 {new Date(order.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        <div style={styles.cardRight}>
          <span style={{ ...styles.statusBadge, color: cfg.color, background: cfg.bg }}>
            {cfg.icon} {order.status}
          </span>
          <p style={styles.orderTotal}>${Number(order.total_amount).toFixed(2)}</p>
          <span style={{ 
            fontSize: '1.2rem', 
            color: 'var(--text-muted)', 
            transition: 'transform 0.3s var(--ease-smooth)', 
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', 
            display: 'inline-block',
            lineHeight: 1
          }}>⌄</span>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={styles.cardExpanded} className="animate-slide-down">
          {/* Items */}
          <div style={styles.itemsList}>
            {order.order_items?.map((item, idx) => (
              <div key={idx} style={styles.itemRow}>
                {item.food_items?.image_url ? (
                  <img src={item.food_items.image_url} alt="" style={styles.itemImg} />
                ) : (
                  <div style={{ ...styles.itemImg, background: 'var(--surface-solid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: '1px solid var(--border)' }}>🍲</div>
                )}
                <span style={{ flex: 1, color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>
                  {item.food_items?.name || 'Food Item'}
                </span>
                <span style={styles.qtyTag}>×{item.quantity}</span>
                <span style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {order.delivery_address && (
            <p style={styles.addressLine}>
              <strong style={{ color: 'var(--text-secondary)' }}>📍 Delivery Address:</strong> {order.delivery_address}
            </p>
          )}

          {/* Action Buttons */}
          <div style={styles.actionRow}>
            {isActive && (
              <button onClick={() => navigate(`/track/${order.id}`)} style={styles.trackBtn} className="animate-pulse-glow">
                🛵 Live Tracking
              </button>
            )}
            {order.status === 'Pending' && (
              <button onClick={() => onCancel(order.id)} style={styles.cancelOrderBtn}>
                ✕ Cancel Order
              </button>
            )}
            {order.status === 'Delivered' && !reviewingOrder && (
              <button onClick={() => setReviewingOrder(order)} style={styles.reviewBtn} className="animate-pulse-glow">
                ⭐ Leave Review
              </button>
            )}
          </div>

          {/* Review Form */}
          {reviewingOrder?.id === order.id && (
            <div style={styles.reviewBox} className="glass-panel animate-slide-down">
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>How was the food?</h4>
              
              <div style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setReviewData({ ...reviewData, rating: n })}
                    style={{ ...styles.starBtn, color: n <= reviewData.rating ? 'var(--gold)' : 'var(--border-strong)' }}
                  >★</button>
                ))}
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 700, marginLeft: '0.5rem' }}>
                  {reviewData.rating === 5 ? 'Excellent! 😍' : reviewData.rating === 4 ? 'Very Good! 🙂' : reviewData.rating === 3 ? 'Good! 😐' : reviewData.rating === 2 ? 'Fair 🙁' : 'Poor 😞'}
                </span>
              </div>
              
              <textarea
                rows="3"
                placeholder="Share your thoughts about the taste, quality, and packaging…"
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                style={styles.reviewInput}
              />
              
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
                <button onClick={submitReview} style={styles.submitBtn}>Submit Review</button>
                <button onClick={() => setReviewingOrder(null)} style={styles.cancelBtn}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'var(--background)', fontFamily: 'var(--font-body)', paddingBottom: '5rem' },
  nav: {
    position: 'sticky', top: 0, zIndex: 200,
    background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
    height: '72px',
  },
  navInner: {
    maxWidth: '1200px', margin: '0 auto',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.8rem 1.5rem',
    height: '100%',
  },
  backBtn: {
    background: 'transparent', border: '1px solid var(--border-strong)',
    padding: '0.5rem 1.1rem', borderRadius: 'var(--radius-md)',
    color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center',
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' },
  brandTxt: { fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--primary)', fontSize: '1.4rem', letterSpacing: '-0.03em' },

  main: { padding: '2.5rem 1.5rem', maxWidth: '820px', margin: '0 auto' },
  emptyState: { textAlign: 'center', padding: '5rem 2rem', background: 'var(--surface-solid)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  primaryBtn: { padding: '0.9rem 2.2rem', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '0.95rem', fontWeight: '800', cursor: 'pointer', boxShadow: 'var(--shadow-primary)' },
  
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid var(--border-strong)',
    gap: '2rem',
    marginBottom: '1.5rem',
  },
  tabButton: {
    background: 'none',
    border: 'none',
    padding: '0.8rem 0',
    fontSize: '0.98rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  emptyTabBox: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'var(--surface-solid)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
    color: 'var(--text-muted)'
  },
  
  ordersList: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  orderCard: { background: 'var(--surface-solid)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', border: '1px solid var(--border)', transition: 'all 0.3s' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.4rem 1.6rem', cursor: 'pointer' },
  restInfo: { display: 'flex', gap: '1.2rem', alignItems: 'center' },
  restThumb: { width: '56px', height: '56px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xs)' },
  restName: { margin: '0 0 0.2rem 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' },
  orderDate: { margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' },
  statusBadge: { padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '5px', letterSpacing: '0.02em' },
  orderTotal: { margin: 0, fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' },
  
  cardExpanded: { borderTop: '1px solid var(--border-light)', padding: '1.5rem', background: '#FAF9F6' },
  itemsList: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1.2rem', background: 'var(--surface-solid)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' },
  itemImg: { width: '40px', height: '40px', borderRadius: 'var(--radius-xs)', objectFit: 'cover', border: '1px solid var(--border-light)' },
  qtyTag: { background: 'var(--background)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-xs)', padding: '2px 8px', fontSize: '0.78rem', fontWeight: '700', border: '1px solid var(--border)' },
  addressLine: { margin: '0 0 1.25rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '0.9rem 1.2rem', background: 'var(--surface-solid)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', lineHeight: '1.5' },
  
  actionRow: { display: 'flex', gap: '0.8rem', marginTop: '0.5rem', flexWrap: 'wrap' },
  trackBtn: { padding: '0.65rem 1.5rem', background: 'var(--secondary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '800', cursor: 'pointer', fontSize: '0.88rem' },
  cancelOrderBtn: { padding: '0.65rem 1.5rem', background: 'var(--danger-bg)', color: 'var(--danger)', border: '1.5px solid var(--danger)', borderRadius: 'var(--radius-md)', fontWeight: '800', cursor: 'pointer', fontSize: '0.88rem' },
  reviewBtn: { padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg, var(--gold) 0%, #E69500 100%)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '800', cursor: 'pointer', fontSize: '0.88rem', boxShadow: '0 4px 12px rgba(245, 166, 35, 0.2)' },
  
  reviewBox: { marginTop: '1.25rem', padding: '1.5rem', background: 'var(--surface-solid)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' },
  starsRow: { display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' },
  starBtn: { background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', padding: 0, lineHeight: 1, transition: 'transform 0.1s' },
  reviewInput: { width: '100%', padding: '0.9rem 1.1rem', border: '1.5px solid var(--border-strong)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)', fontSize: '0.92rem', resize: 'vertical', boxSizing: 'border-box', background: 'var(--surface-solid)', outline: 'none' },
  submitBtn: { padding: '0.7rem 1.6rem', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '800', cursor: 'pointer', boxShadow: 'var(--shadow-primary)' },
  cancelBtn: { padding: '0.7rem 1.6rem', background: 'none', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)', fontWeight: '700', cursor: 'pointer' },
};
