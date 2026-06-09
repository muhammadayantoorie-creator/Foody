import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const ORDER_STEPS = [
  { key: 'Pending', label: 'Order Placed', icon: '📋', desc: 'Your order has been received' },
  { key: 'Preparing', label: 'Preparing', icon: '👨‍🍳', desc: 'The restaurant is preparing your food' },
  { key: 'Picked Up', label: 'On the Way', icon: '🛵', desc: 'Your rider has picked up the order' },
  { key: 'Delivered', label: 'Delivered', icon: '✅', desc: 'Enjoy your meal!' },
];

function getStepIndex(status) {
  const idx = ORDER_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

export default function OrderTracking({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, restaurants(name, image_url), order_items(quantity, price, food_items(name, image_url))')
      .eq('id', orderId)
      .single();
    if (!error && data) setOrder(data);
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    fetchOrder();

    // Real-time subscription
    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          setOrder((prev) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchOrder, orderId]);

  if (loading) return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>Loading order details...</p>
      </div>
    </div>
  );

  if (!order) return null;

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'Cancelled';

  return (
    <div style={styles.overlay}>
      <div style={styles.backdrop} onClick={onClose} />
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitle}>Order Tracking</h2>
            <p style={styles.modalSub}>Order #{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Restaurant info */}
        <div style={styles.restaurantBanner}>
          {order.restaurants?.image_url && (
            <img src={order.restaurants.image_url} alt="" style={styles.restImg} />
          )}
          <div>
            <p style={styles.restLabel}>From</p>
            <h3 style={styles.restName}>{order.restaurants?.name}</h3>
          </div>
        </div>

        {/* Status Progress */}
        {isCancelled ? (
          <div style={styles.cancelledBanner}>
            <span style={{ fontSize: '2rem' }}>❌</span>
            <div>
              <strong>Order Cancelled</strong>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>This order has been cancelled.</p>
            </div>
          </div>
        ) : (
          <div style={styles.stepsContainer}>
            {ORDER_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={step.key} style={styles.stepWrapper}>
                  <div style={styles.stepRow}>
                    <div style={{
                      ...styles.stepIcon,
                      background: isCompleted ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--border)',
                      color: (isCompleted || isCurrent) ? 'var(--text-on-primary)' : 'var(--text-light)',
                      transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: isCurrent ? '0 0 0 4px var(--primary-glow)' : 'none',
                    }}>
                      {isCompleted ? '✓' : step.icon}
                    </div>
                    <div style={styles.stepText}>
                      <span style={{
                        ...styles.stepLabel,
                        color: isCompleted ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--text-light)',
                        fontWeight: isCurrent ? '800' : '600',
                      }}>
                        {step.label}
                      </span>
                      {isCurrent && (
                        <span style={styles.stepDesc}>{step.desc}</span>
                      )}
                    </div>
                    {isCurrent && (
                      <div style={styles.pulsingDot} />
                    )}
                  </div>
                  {idx < ORDER_STEPS.length - 1 && (
                    <div style={{
                      ...styles.connector,
                      background: isCompleted
                        ? 'linear-gradient(to bottom, var(--success), var(--primary))'
                        : 'var(--border)',
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Order Items */}
        <div style={styles.itemsSection}>
          <h4 style={styles.sectionTitle}>Order Items</h4>
          <div style={styles.itemsList}>
            {order.order_items?.map((item, idx) => (
              <div key={idx} style={styles.itemRow}>
                {item.food_items?.image_url && (
                  <img src={item.food_items.image_url} alt="" style={styles.itemThumb} />
                )}
                <span style={styles.itemName}>{item.food_items?.name}</span>
                <span style={styles.itemQty}>×{item.quantity}</span>
                <span style={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer total */}
        <div style={styles.totalSection}>
          <span style={{ color: 'var(--text-muted)' }}>Total Paid</span>
          <span style={styles.totalAmount}>${Number(order.total_amount).toFixed(2)}</span>
        </div>

        {order.delivery_address && (
          <div style={styles.addressSection}>
            <span style={{ fontSize: '1rem' }}>📍</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{order.delivery_address}</span>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  backdrop: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' },
  modal: {
    position: 'relative',
    background: 'var(--surface-solid)',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '520px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: 'var(--shadow-lg)',
    animation: 'fadeInUp 0.3s ease-out',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '1.5rem 1.5rem 1rem 1.5rem',
    borderBottom: '1px solid var(--border)',
  },
  modalTitle: { margin: 0, fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' },
  modalSub: { margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-light)', padding: '0.3rem' },
  restaurantBanner: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    padding: '1rem 1.5rem', background: 'var(--background-warm)', borderBottom: '1px solid var(--border)',
  },
  restImg: { width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' },
  restLabel: { margin: 0, fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  restName: { margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-secondary)' },
  cancelledBanner: {
    display: 'flex', gap: '1rem', alignItems: 'center',
    margin: '1.5rem',
    padding: '1rem 1.5rem',
    background: 'var(--danger-bg)',
    border: '1px solid var(--danger)',
    borderRadius: '12px',
    color: 'var(--danger)',
  },
  stepsContainer: { padding: '1.5rem' },
  stepWrapper: { display: 'flex', flexDirection: 'column' },
  stepRow: { display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' },
  stepIcon: {
    width: '44px', height: '44px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.2rem', fontWeight: 'bold', flexShrink: 0,
    transition: 'all 0.3s ease',
  },
  stepText: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  stepLabel: { fontSize: '1rem', transition: 'color 0.3s' },
  stepDesc: { fontSize: '0.8rem', color: 'var(--text-muted)' },
  pulsingDot: {
    width: '10px', height: '10px', borderRadius: '50%',
    background: 'var(--primary)',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  connector: {
    width: '3px', height: '36px', borderRadius: '2px',
    margin: '4px 0 4px 20px',
    transition: 'background 0.5s',
  },
  itemsSection: { padding: '0 1.5rem 1rem 1.5rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem' },
  sectionTitle: { margin: '1rem 0 0.8rem 0', color: 'var(--text-secondary)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  itemsList: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem 0', borderBottom: '1px solid var(--background)' },
  itemThumb: { width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' },
  itemName: { flex: 1, fontSize: '0.9rem', color: 'var(--text-secondary)' },
  itemQty: { fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--border)', padding: '2px 8px', borderRadius: '10px' },
  itemTotal: { fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)' },
  totalSection: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 1.5rem',
    background: 'var(--background)',
    borderTop: '1px solid var(--border)',
    fontWeight: '700',
    fontSize: '1.1rem',
  },
  totalAmount: { color: 'var(--primary)', fontSize: '1.3rem' },
  addressSection: {
    display: 'flex', gap: '0.5rem', alignItems: 'center',
    padding: '0.8rem 1.5rem 1.5rem 1.5rem',
  },
};
