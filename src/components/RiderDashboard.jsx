import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const STATUS_FLOW = { Preparing: 'Picked Up', 'Picked Up': 'Delivered' };
const STATUS_STYLE = {
  Pending:    { color: 'var(--warning)', bg: 'var(--warning-light)', icon: '📋' },
  Preparing:  { color: 'var(--info)', bg: 'var(--info-light)', icon: '👨‍🍳' },
  'Picked Up':{ color: 'var(--purple)', bg: 'var(--purple-light)', icon: '🛵' },
  Delivered:  { color: 'var(--success)', bg: 'var(--success-light)', icon: '✅' },
};

export default function RiderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('available');
  const [available, setAvailable] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [completedToday, setCompletedToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [currentLocation, setCurrentLocation] = useState([40.7128, -74.0060]);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => console.error("Error getting location:", err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Available orders: Pending and not yet claimed
      const { data: avail } = await supabase
        .from('orders')
        .select('*, restaurants(name, image_url, address)')
        .eq('status', 'Pending')
        .order('created_at', { ascending: true });

      // My active deliveries
      const { data: active } = await supabase
        .from('delivery_tracking')
        .select('*, orders(*, restaurants(name, image_url, address))')
        .eq('rider_id', user.id)
        .in('status', ['Preparing', 'Picked Up'])
        .order('created_at', { ascending: false });

      // Today's completed deliveries
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: done } = await supabase
        .from('delivery_tracking')
        .select('*, orders(total_amount, restaurants(name))')
        .eq('rider_id', user.id)
        .eq('status', 'Delivered')
        .gte('updated_at', today.toISOString());

      setAvailable(avail || []);
      setMyDeliveries(active || []);
      setCompletedToday(done || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchOrders();

    // Real-time: listen for new Pending orders
    const ch = supabase
      .channel('rider-live-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.new.status === 'Pending') {
            fetchOrders();
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(ch);
  }, [fetchOrders]);

  const handleAccept = async (order) => {
    setUpdatingId(order.id);
    try {
      // Create delivery tracking record
      const { error: trackErr } = await supabase.from('delivery_tracking').insert({
        order_id: order.id,
        rider_id: user.id,
        status: 'Preparing',
        location: 'Restaurant',
      });
      if (trackErr) throw trackErr;

      // Update order status
      const { error: orderErr } = await supabase
        .from('orders')
        .update({ status: 'Preparing' })
        .eq('id', order.id);
      if (orderErr) throw orderErr;

      toast.success(`Order from ${order.restaurants?.name} accepted!`);
      setTab('active');
      await fetchOrders();
    } catch (err) {
      toast.error('Failed to accept order. It may have been taken.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateStatus = async (tracking) => {
    const nextStatus = STATUS_FLOW[tracking.status];
    if (!nextStatus) return;
    setUpdatingId(tracking.id);
    try {
      await supabase.from('delivery_tracking')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', tracking.id);

      await supabase.from('orders')
        .update({ status: nextStatus })
        .eq('id', tracking.order_id);

      // Trigger email notification via backend
      try {
        // Fetch customer email to notify
        const { data: orderData } = await supabase
          .from('orders')
          .select('users:user_id(email)')
          .eq('id', tracking.order_id)
          .single();

        if (orderData?.users?.email) {
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4242'}/order-status-update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: tracking.order_id,
              customerEmail: orderData.users.email,
              status: nextStatus,
              restaurantName: tracking.orders?.restaurants?.name || 'the restaurant',
            }),
          });
        }
      } catch (err) {
        console.error('Failed to trigger email notification', err);
      }

      const icon = nextStatus === 'Delivered' ? '✅' : '🛵';
      toast.success(`${icon} Marked as ${nextStatus}`);
      await fetchOrders();
    } catch (err) {
      toast.error('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Stats
  const todayEarnings = completedToday.reduce(
    (sum, d) => sum + (Number(d.orders?.total_amount) || 0) * 0.15, 0
  );

  if (loading) return (
    <div style={s.page}>
      <div style={s.loadWrap}>
        <div style={s.spinner} />
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading deliveries…</p>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <style>
        {`
          .mobile-bottom-nav {
            display: flex;
            gap: 0.5rem;
            background: var(--surface);
            padding: 0.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }
          @media (max-width: 768px) {
            .mobile-bottom-nav {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              border-radius: 20px 20px 0 0;
              padding: 0.8rem 0.5rem 1.5rem 0.5rem;
              box-shadow: 0 -4px 15px rgba(0,0,0,0.1);
              z-index: 1000;
              justify-content: space-around;
            }
            .main-content {
              padding-bottom: 5rem !important;
            }
          }
        `}
      </style>
      
      {/* Header */}
      <header style={s.header}>
        <div>
          <h1 style={s.headerTitle}>🛵 Rider Dashboard</h1>
          <p style={s.headerSub}>Welcome back, {user.email?.split('@')[0]}</p>
        </div>
        <button style={s.refreshBtn} onClick={fetchOrders}>↻ Refresh</button>
      </header>

      <main style={s.main} className="main-content">

        {/* Stats Row */}
        <div style={s.statsGrid}>
          <StatCard icon="📦" label="Available" value={available.length} color="var(--info)" />
          <StatCard icon="🛵" label="Active" value={myDeliveries.length} color="var(--purple)" />
          <StatCard icon="✅" label="Done Today" value={completedToday.length} color="var(--success)" />
          <StatCard icon="💰" label="Earnings Today" value={`$${todayEarnings.toFixed(2)}`} color="var(--warning)" />
        </div>

        {/* Tab Switcher */}
        <div className="mobile-bottom-nav">
          {[
            { key: 'available', label: `📋`, sub: `Available (${available.length})` },
            { key: 'active',    label: `🛵`, sub: `Active (${myDeliveries.length})` },
            { key: 'history',   label: `✅`, sub: `Today (${completedToday.length})` },
          ].map(t => (
            <button
              key={t.key}
              style={{ ...s.tab, ...(tab === t.key ? s.tabActive : {}) }}
              onClick={() => setTab(t.key)}
            >
              <span style={{ fontSize: '1.2rem' }}>{t.label}</span>
              <span style={{ fontSize: '0.7rem', marginTop: '2px' }}>{t.sub}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'available' && (
          <div style={s.cardGrid}>
            {available.length === 0 ? (
              <EmptyState icon="🕐" text="No new orders right now. Check back soon!" />
            ) : available.map(order => (
              <div key={order.id} style={s.orderCard}>
                <div style={s.cardTop}>
                  {order.restaurants?.image_url
                    ? <img src={order.restaurants.image_url} alt="" style={s.restImg} />
                    : <div style={{ ...s.restImg, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🍴</div>
                  }
                  <div style={{ flex: 1 }}>
                    <p style={s.restName}>{order.restaurants?.name}</p>
                    <p style={s.restAddr}>📍 {order.restaurants?.address || 'Address on file'}</p>
                  </div>
                  <span style={s.amountBadge}>${Number(order.total_amount).toFixed(2)}</span>
                </div>
                <div style={s.deliveryAddr}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Deliver to:</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginLeft: '0.4rem' }}>
                    {order.delivery_address?.slice(0, 60)}{order.delivery_address?.length > 60 ? '…' : ''}
                  </span>
                </div>
                <div style={s.cardMeta}>
                  <span style={s.timeAgo}>🕐 {timeAgo(order.created_at)}</span>
                  <span style={s.estimateBadge}>💰 ~${(Number(order.total_amount) * 0.15).toFixed(2)} earn</span>
                </div>
                <button
                  style={{ ...s.acceptBtn, opacity: updatingId === order.id ? 0.7 : 1 }}
                  onClick={() => handleAccept(order)}
                  disabled={updatingId === order.id}
                >
                  {updatingId === order.id ? '⏳ Claiming…' : '✅ Accept Order'}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'active' && (
          <div style={s.cardGrid}>
            {myDeliveries.length === 0 ? (
              <EmptyState icon="😴" text="No active deliveries. Accept an order to start!" />
            ) : myDeliveries.map(delivery => {
              const order = delivery.orders;
              const statusCfg = STATUS_STYLE[delivery.status] || STATUS_STYLE['Preparing'];
              const nextStatus = STATUS_FLOW[delivery.status];
              return (
                <div key={delivery.id} style={{ ...s.orderCard, borderLeft: `4px solid ${statusCfg.color}` }}>
                  <div style={s.cardTop}>
                    <div style={{ ...s.statusDot, background: statusCfg.bg, color: statusCfg.color }}>
                      {statusCfg.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={s.restName}>{order?.restaurants?.name}</p>
                      <span style={{ ...s.statusPill, background: statusCfg.bg, color: statusCfg.color }}>
                        {delivery.status}
                      </span>
                    </div>
                    <span style={s.amountBadge}>${Number(order?.total_amount).toFixed(2)}</span>
                  </div>
                  <p style={s.deliveryAddrFull}>📍 {order?.delivery_address}</p>
                  
                  {/* Map Integration */}
                  <div style={{ height: '200px', width: '100%', borderRadius: '12px', overflow: 'hidden', margin: '10px 0' }}>
                    <MapContainer center={currentLocation} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                      />
                      <Recenter lat={currentLocation[0]} lng={currentLocation[1]} />
                      <Marker position={currentLocation}>
                        <Popup>Your Location</Popup>
                      </Marker>
                    </MapContainer>
                  </div>

                  <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                    <button
                      style={s.detailBtn}
                      onClick={() => navigate(`/order/${order?.id}`)}
                    >
                      View Details
                    </button>
                    {nextStatus && (
                      <button
                        style={{
                          ...s.updateBtn,
                          background: nextStatus === 'Delivered'
                            ? 'var(--success)'
                            : 'var(--purple)',
                          opacity: updatingId === delivery.id ? 0.7 : 1,
                        }}
                        onClick={() => handleUpdateStatus(delivery)}
                        disabled={updatingId === delivery.id}
                      >
                        {updatingId === delivery.id ? '⏳ Updating…'
                          : nextStatus === 'Delivered' ? '✅ Mark Delivered'
                          : '🛵 Mark Picked Up'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'history' && (
          <div style={s.cardGrid}>
            {completedToday.length === 0 ? (
              <EmptyState icon="📊" text="No completed deliveries today yet." />
            ) : completedToday.map(delivery => (
              <div key={delivery.id} style={{ ...s.orderCard, opacity: 0.85 }}>
                <div style={s.cardTop}>
                  <div style={{ ...s.statusDot, background: 'var(--success-light)', color: 'var(--success)' }}>✅</div>
                  <div style={{ flex: 1 }}>
                    <p style={s.restName}>{delivery.orders?.restaurants?.name}</p>
                    <p style={{ ...s.restAddr, color: 'var(--success)' }}>Delivered</p>
                  </div>
                  <span style={{ ...s.amountBadge, background: 'var(--success-light)', color: 'var(--success)' }}>
                    +${(Number(delivery.orders?.total_amount) * 0.15).toFixed(2)}
                  </span>
                </div>
                <p style={s.restAddr}>
                  Completed {new Date(delivery.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}

            {/* Daily earnings summary */}
            {completedToday.length > 0 && (
              <div style={s.earningsSummary}>
                <span style={{ fontWeight: '700', color: 'var(--success)', fontSize: '1.1rem' }}>
                  🎉 Today's Earnings: ${todayEarnings.toFixed(2)}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{completedToday.length} deliveries completed</span>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ ...s.statCard, borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: '1.6rem' }}>{icon}</div>
      <div>
        <p style={{ ...s.statValue, color }}>{value}</p>
        <p style={s.statLabel}>{label}</p>
      </div>
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div style={s.emptyState}>
      <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>{icon}</div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{text}</p>
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function Recenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

const s = {
  page: { fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: 'var(--background)' },
  loadWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  spinner: { width: '40px', height: '40px', border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },

  header: { background: 'var(--surface)', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' },
  headerTitle: { margin: '0 0 4px 0', color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: '800' },
  headerSub: { margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' },
  refreshBtn: { background: 'var(--background)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },

  main: { padding: '1.5rem', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' },
  statCard: { background: 'var(--surface)', borderRadius: '14px', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', boxShadow: 'var(--shadow-sm)' },
  statValue: { margin: '0 0 2px 0', fontSize: '1.4rem', fontWeight: '800' },
  statLabel: { margin: 0, color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' },

  tab: { flex: 1, padding: '0.7rem 0.5rem', border: 'none', borderRadius: '8px', background: 'transparent', color: 'var(--text-muted)', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  tabActive: { background: 'var(--primary)', color: 'white', boxShadow: 'var(--shadow-primary)' },

  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' },
  orderCard: { background: 'var(--surface)', borderRadius: '16px', padding: '1.2rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '0.5rem', transition: 'transform 0.15s', cursor: 'default' },

  cardTop: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  restImg: { width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 },
  restName: { margin: '0 0 3px 0', fontWeight: '700', color: 'var(--text-main)', fontSize: '0.95rem' },
  restAddr: { margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' },
  amountBadge: { background: 'var(--success-light)', color: 'var(--success)', fontWeight: '800', fontSize: '0.9rem', padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap' },
  deliveryAddr: { display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', padding: '0.5rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' },
  deliveryAddrFull: { margin: '0.3rem 0', color: 'var(--text-main)', fontSize: '0.85rem', lineHeight: '1.4' },
  cardMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  timeAgo: { fontSize: '0.8rem', color: 'var(--text-muted)' },
  estimateBadge: { fontSize: '0.8rem', color: 'var(--warning)', fontWeight: '700', background: 'var(--warning-light)', padding: '3px 8px', borderRadius: '10px' },

  acceptBtn: { width: '100%', padding: '0.8rem', background: 'var(--info)', color: 'var(--text-on-primary)', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', marginTop: '0.3rem', transition: 'opacity 0.2s' },

  statusDot: { width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 },
  statusPill: { display: 'inline-block', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' },
  detailBtn: { flex: 1, padding: '0.65rem', background: 'var(--background)', color: 'var(--text-main)', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' },
  updateBtn: { flex: 2, padding: '0.65rem', color: 'var(--text-on-primary)', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', transition: 'opacity 0.2s', boxShadow: 'var(--shadow-sm)' },

  emptyState: { gridColumn: '1/-1', textAlign: 'center', padding: '3rem 1rem', background: 'var(--surface)', borderRadius: '16px' },
  earningsSummary: { gridColumn: '1/-1', background: 'linear-gradient(135deg, var(--success-light), var(--surface))', borderRadius: '14px', padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--success)' },
};
