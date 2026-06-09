import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const STATUS_STEPS = ['Pending', 'Preparing', 'Picked Up', 'Delivered'];
const STATUS_CONFIG = {
  Pending:    { color: 'var(--warning)', bg: 'var(--warning-light)', icon: '📋', label: 'Order Received' },
  Preparing:  { color: 'var(--info)', bg: 'var(--info-light)', icon: '👨‍🍳', label: 'Being Prepared' },
  'Picked Up':{ color: 'var(--purple)', bg: 'var(--purple-light)', icon: '🛵', label: 'Out for Delivery' },
  Delivered:  { color: 'var(--success)', bg: 'var(--success-light)', icon: '✅', label: 'Delivered' },
  Cancelled:  { color: 'var(--danger)', bg: 'var(--danger-light)', icon: '✕', label: 'Cancelled' },
};

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    fetchOrder();

    // Real-time status subscription
    const channel = supabase
      .channel(`order-detail-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      }, (payload) => {
        setOrder(prev => ({ ...prev, ...payload.new }));
        const cfg = STATUS_CONFIG[payload.new.status];
        if (cfg) toast(cfg.icon + ' ' + cfg.label, { duration: 4000 });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        restaurants(name, image_url, address, phone),
        order_items(quantity, price, food_items(name, image_url))
      `)
      .eq('id', orderId)
      .single();

    if (error) { console.error(error); toast.error('Order not found.'); }
    else setOrder(data);
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order? This cannot be undone.')) return;
    setCancelling(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: 'Cancelled' })
      .eq('id', orderId)
      .eq('status', 'Pending');

    if (error) { toast.error('Failed to cancel. Try again.'); }
    else { setOrder(prev => ({ ...prev, status: 'Cancelled' })); toast.success('Order cancelled.'); }
    setCancelling(false);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('receipt-content');
    if (!element) return;
    
    const toastId = toast.loading('Generating receipt...');
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt_Order_${order.id.slice(0, 8).toUpperCase()}.pdf`);
      toast.success('Receipt downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate receipt.', { id: toastId });
    }
  };

  if (loading) return (
    <div style={s.page}>
      <div style={s.loadWrap}>
        <div style={s.spinner} />
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontWeight: 600 }}>Loading order details…</p>
      </div>
    </div>
  );

  if (!order) return (
    <div style={s.page}>
      <div style={s.notFound}>
        <div style={{ fontSize: '4rem', display: 'block', marginBottom: '1.25rem', animation: 'float 3s infinite' }}>🔍</div>
        <h2 style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Order not found</h2>
        <button style={s.btnPrimary} onClick={() => navigate('/my-orders')}>← My Orders</button>
      </div>
    </div>
  );

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pending'];
  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled';
  const canCancel = order.status === 'Pending';
  const subtotal = order.order_items?.reduce((s, i) => s + i.price * i.quantity, 0) || order.total_amount;
  const deliveryFee = 2.99;
  const gst = subtotal * 0.05;
  const grandTotal = subtotal + deliveryFee + gst;

  return (
    <div style={s.page}>
      {/* Header */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <button style={s.backBtn} onClick={() => navigate('/my-orders')}>
            <span style={{ marginRight: '0.4rem' }}>←</span> My Orders
          </button>
          <div style={s.navBrand} onClick={() => navigate('/dashboard')} className="cursor-pointer">
            <span style={{ fontSize:'1.4rem' }}>🍕</span>
            <span style={s.brandTxt}>FoodDash</span>
          </div>
          <div style={{ width: '90px' }} />
        </div>
      </nav>

      <main style={s.main}>
        {/* Printable Area Wrapper */}
        <div id="receipt-content" style={s.receiptWrapper}>
          
          {/* Status Hero Card */}
          <div style={{ ...s.heroCard, background: cfg.bg, border: `1.5px solid ${cfg.color}18` }} className="animate-fade-up">
            <div style={{ fontSize: '3.5rem', animation: 'float 3s infinite' }}>{cfg.icon}</div>
            <div>
              <p style={{ ...s.heroStatus, color: cfg.color }}>{order.status}</p>
              <p style={s.heroSub}>{cfg.label}</p>
              <p style={s.heroId}>Order ID: #{order.id?.slice(0, 8).toUpperCase()}</p>
            </div>
            <div style={s.heroTime}>
              <span style={{ fontWeight: 800, fontSize: '0.98rem' }}>
                {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <br />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Progress Tracker */}
          {!isCancelled && (
            <div style={s.card} className="animate-fade-up stagger-1">
              <h3 style={s.cardTitle}>📦 Order Progress</h3>
              <div style={s.stepTrack}>
                {/* Connecting track line */}
                <div style={s.stepTrackLine}>
                  <div style={{ ...s.stepTrackLineFill, width: `${(Math.max(0, stepIndex) / (STATUS_STEPS.length - 1)) * 100}%`, background: cfg.color }} />
                </div>
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx <= stepIndex;
                  const active = idx === stepIndex;
                  const stepCfg = STATUS_CONFIG[step];
                  return (
                    <div key={step} style={s.stepCol}>
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{
                          ...s.stepDot,
                          background: done ? cfg.color : 'var(--surface-solid)',
                          border: `2px solid ${done ? cfg.color : 'var(--border-strong)'}`,
                          color: done ? 'white' : 'var(--text-muted)',
                          boxShadow: active ? `0 0 0 6px ${cfg.color}22` : 'none',
                          transform: active ? 'scale(1.15)' : 'scale(1)',
                        }}>
                          {done ? '✓' : idx + 1}
                        </div>
                      </div>
                      <p style={{ ...s.stepLabel, color: done ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: active ? '800' : '600' }}>
                        <span style={{ display: 'block', fontSize: '1rem', marginBottom: '0.15rem' }}>{stepCfg.icon}</span>
                        {step}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Two-column layout */}
          <div style={s.twoCol}>

            {/* Left: Items + Restaurant */}
            <div style={s.leftCol}>

              {/* Restaurant Info */}
              {order.restaurants && (
                <div style={s.card} className="animate-fade-up stagger-2">
                  <h3 style={s.cardTitle}>🍽️ Restaurant</h3>
                  <div style={s.restRow}>
                    {order.restaurants.image_url ? (
                      <img src={order.restaurants.image_url} alt={order.restaurants.name} style={s.restImg} />
                    ) : (
                      <div style={{ ...s.restImg, background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', border: '1px solid var(--border)' }}>🍴</div>
                    )}
                    <div>
                      <p style={s.restName}>{order.restaurants.name}</p>
                      {order.restaurants.address && <p style={s.restMeta}>📍 {order.restaurants.address}</p>}
                      {order.restaurants.phone && <p style={s.restMeta}>📞 {order.restaurants.phone}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div style={s.card} className="animate-fade-up stagger-3">
                <h3 style={s.cardTitle}>🧾 Items Ordered</h3>
                <div style={s.itemList}>
                  {order.order_items?.map((item, idx) => (
                    <div key={idx} style={s.itemRow}>
                      {item.food_items?.image_url ? (
                        <img src={item.food_items.image_url} alt={item.food_items?.name} style={s.itemImg} />
                      ) : (
                        <div style={{ ...s.itemImg, background: 'var(--surface-solid)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-light)' }}>🍲</div>
                      )}
                      <div style={{ flex: 1 }}>
                        <p style={s.itemName}>{item.food_items?.name || 'Item'}</p>
                        <p style={s.itemQty}>Qty: <strong style={{ color: 'var(--text-secondary)' }}>{item.quantity}</strong></p>
                      </div>
                      <p style={s.itemPrice}>${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Summary + Address + Actions */}
            <div style={s.rightCol}>

              {/* Price Breakdown */}
              <div style={s.card} className="animate-fade-up stagger-2">
                <h3 style={s.cardTitle}>💳 Payment Summary</h3>
                <div style={s.priceRow}><span style={s.priceLabel}>Items Subtotal</span><span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span></div>
                <div style={s.priceRow}><span style={s.priceLabel}>Delivery Partner Fee</span><span style={{ fontWeight: 600 }}>${deliveryFee.toFixed(2)}</span></div>
                <div style={s.priceRow}><span style={s.priceLabel}>GST & Restaurant Charges (5%)</span><span style={{ fontWeight: 600 }}>${gst.toFixed(2)}</span></div>
                <div style={s.divider} />
                <div style={{ ...s.priceRow, ...s.priceTotalRow }}>
                  <span>Grand Total</span>
                  <span style={{ color: 'var(--primary)' }}>${grandTotal.toFixed(2)}</span>
                </div>
                <div style={s.payBadge}>
                  <span style={{ fontSize: '1.1rem' }}>💳</span> 
                  <span style={{ fontWeight: 700 }}>Card Payment via Stripe (Secured)</span>
                </div>
              </div>

              {/* Delivery Address */}
              <div style={s.card} className="animate-fade-up stagger-3">
                <h3 style={s.cardTitle}>📍 Delivery Location</h3>
                <p style={s.addressText}>{order.delivery_address || 'No address recorded.'}</p>
                <p style={{ ...s.restMeta, marginTop: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>⏱ Delivery estimate: 30–45 mins</p>
              </div>

            </div>
          </div>
        </div>

        {/* Actions (Not rendered on the downloaded PDF receipt) */}
        <div style={s.card} data-html2canvas-ignore="true" className="animate-fade-up stagger-4">
          <h3 style={s.cardTitle}>⚙️ Order Actions</h3>
          <div style={s.actionGrid}>
            <button style={s.btnOutline} onClick={handleDownloadPDF}>
              📄 Download Receipt (PDF)
            </button>
            {canCancel && (
              <button
                style={{ ...s.btnDanger, opacity: cancelling ? 0.7 : 1 }}
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? '⏳ Cancelling…' : '✕ Cancel Order'}
              </button>
            )}
            <button style={s.btnSecondary} onClick={() => navigate('/my-orders')}>
              ← Back to All Orders
            </button>
            <button style={s.btnPrimary} onClick={() => navigate('/dashboard')} className="animate-pulse-glow">
              🍕 Order Something Else
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'var(--background)', fontFamily: 'var(--font-body)', paddingBottom: '5rem' },
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

  main: { padding: '2.5rem 1.5rem', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  receiptWrapper: { display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'transparent' },

  // Status Hero
  heroCard: { display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.8rem 2.2rem', borderRadius: 'var(--radius-xl)', flexWrap: 'wrap', boxShadow: 'var(--shadow-sm)' },
  heroStatus: { fontSize: '1.6rem', fontWeight: 900, margin: '0 0 4px 0', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' },
  heroSub: { margin: '0 0 6px 0', color: 'var(--text-muted)', fontSize: '0.98rem', fontWeight: 600 },
  heroId: { margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 600, fontFamily: 'monospace' },
  heroTime: { marginLeft: 'auto', textAlign: 'right', color: 'var(--text-main)', fontSize: '0.92rem' },

  // Progress
  card: { background: 'var(--surface-solid)', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' },
  cardTitle: { margin: '0 0 1.25rem 0', fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em' },
  stepTrack: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', paddingBottom: '0.5rem' },
  stepTrackLine: { position: 'absolute', top: '18px', left: '10%', right: '10%', height: '3px', background: 'var(--border)', zIndex: 0 },
  stepTrackLineFill: { height: '100%', transition: 'width 0.4s ease-in-out' },
  stepCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1, background: 'var(--surface-solid)', padding: '0 4px' },
  stepDot: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.82rem', transition: 'all 0.3s' },
  stepLabel: { fontSize: '0.75rem', textAlign: 'center', marginTop: '10px', lineHeight: '1.4', transition: 'color 0.3s' },

  // Two-col layout
  twoCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },

  // Restaurant
  restRow: { display: 'flex', gap: '1.2rem', alignItems: 'center' },
  restImg: { width: '64px', height: '64px', borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-light)' },
  restName: { margin: '0 0 4px 0', fontWeight: '800', color: 'var(--text-main)', fontSize: '1.15rem', fontFamily: 'var(--font-heading)' },
  restMeta: { margin: '2px 0', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 },

  // Items
  itemList: { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' },
  itemImg: { width: '48px', height: '48px', borderRadius: 'var(--radius-xs)', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-light)' },
  itemName: { margin: '0 0 2px 0', fontWeight: '700', color: 'var(--text-main)', fontSize: '0.95rem' },
  itemQty: { margin: 0, color: 'var(--text-muted)', fontSize: '0.82rem' },
  itemPrice: { fontWeight: '800', color: 'var(--text-main)', margin: 0, fontSize: '0.95rem' },

  // Pricing
  priceRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.92rem', color: 'var(--text-main)' },
  priceLabel: { color: 'var(--text-muted)', fontWeight: 500 },
  divider: { height: '1px', background: 'var(--border)', margin: '0.8rem 0' },
  priceTotalRow: { fontWeight: '800', fontSize: '1.15rem', color: 'var(--text-main)' },
  payBadge: { display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.8rem', padding: '0.7rem 1rem', background: 'var(--success-light)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--success-dark)', fontWeight: '700', border: '1px solid rgba(27, 166, 114, 0.15)' },

  // Address
  addressText: { margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.5', fontWeight: 500 },

  // Actions
  actionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
  btnPrimary: { padding: '0.85rem 1.25rem', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '800', cursor: 'pointer', fontSize: '0.9rem', boxShadow: 'var(--shadow-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  btnSecondary: { padding: '0.85rem 1.25rem', background: '#F3F4F6', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  btnDanger: { padding: '0.85rem 1.25rem', background: 'var(--danger-bg)', color: 'var(--danger)', border: '1.5px solid var(--danger)', borderRadius: 'var(--radius-md)', fontWeight: '800', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  btnOutline: { padding: '0.85rem 1.25rem', background: 'var(--info-light)', color: 'var(--info)', border: '1.5px solid var(--info)', borderRadius: 'var(--radius-md)', fontWeight: '800', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  // Loading/error
  loadWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  spinner: { width: '40px', height: '40px', border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  notFound: { textAlign: 'center', padding: '5rem 1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center' },
};
