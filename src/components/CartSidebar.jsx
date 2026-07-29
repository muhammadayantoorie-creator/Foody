import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { ShoppingBag, X, Trash2, Plus, Minus, ArrowRight, Tag, ShieldCheck, Clock } from 'lucide-react';

export default function CartSidebar() {
  const { cartItems, isSidebarOpen, toggleSidebar, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  if (!isSidebarOpen) return null;

  const subtotal = getCartTotal();
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const deliveryFee = subtotal > 0 ? 3.50 : 0;
  const taxes = subtotal > 0 ? (subtotal - discount) * 0.05 : 0;
  const grandTotal = subtotal - discount + deliveryFee + taxes;
  const restaurantName = cartItems.length > 0 ? cartItems[0].restaurant_name : '';

  const handleCheckout = () => { toggleSidebar(); navigate('/checkout'); };

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'FOODDASH10') setCouponApplied(true);
  };

  return (
    <div style={S.overlay}>
      <div style={S.backdrop} onClick={toggleSidebar} />
      <div style={S.sidebar}>

        {/* ── Header ── */}
        <div style={S.header}>
          <div style={S.headerLeft}>
            <div style={S.headerIconWrap}>
              <ShoppingBag size={20} color="white" />
            </div>
            <div>
              <h2 style={S.headerTitle}>Your Cart</h2>
              {restaurantName && (
                <span style={S.restaurantSub}>
                  From <strong style={{ color: 'var(--primary)' }}>{restaurantName}</strong>
                </span>
              )}
            </div>
          </div>
          <button style={S.closeBtn} onClick={toggleSidebar} aria-label="Close cart">
            <X size={16} />
          </button>
        </div>

        {/* ── Item count badge ── */}
        {cartItems.length > 0 && (
          <div style={S.countBar}>
            <span style={S.countText}>{cartItems.length} item{cartItems.length > 1 ? 's' : ''} in cart</span>
            <div style={S.trustRow}>
              <ShieldCheck size={13} color="#1BA672" />
              <span style={{ fontSize: '0.72rem', color: '#1BA672', fontWeight: 600 }}>Safe & secure checkout</span>
            </div>
          </div>
        )}

        {/* ── Content ── */}
        <div style={S.content}>
          {cartItems.length === 0 ? (
            <div style={S.empty}>
              <div style={S.emptyIconWrap}>
                <ShoppingBag size={48} color="#cbd5e1" />
              </div>
              <h3 style={S.emptyTitle}>Your cart is empty</h3>
              <p style={S.emptyText}>Add some delicious food from your favourite restaurant to start your feast!</p>
              <button style={S.browseBtn} onClick={toggleSidebar}>
                Browse Restaurants
              </button>
            </div>
          ) : (
            <>
              <div style={S.itemsList}>
                {cartItems.map((item) => (
                  <div key={item.id} style={S.cartItem} className="cart-item-row">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} style={S.itemImage} />
                    ) : (
                      <div style={S.itemImagePlaceholder}>🍽️</div>
                    )}

                    <div style={S.itemDetails}>
                      <div style={S.itemHeader}>
                        <h4 style={S.itemName}>{item.name}</h4>
                        <button style={S.removeBtn} onClick={() => removeFromCart(item.id)} title="Remove item">
                          <Trash2 size={13} color="#e23744" />
                        </button>
                      </div>

                      <span style={S.priceUnit}>${Number(item.price).toFixed(2)} each</span>

                      <div style={S.qtyRow}>
                        <div style={S.quantityControls}>
                          <button style={S.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus size={12} />
                          </button>
                          <span style={S.qtyVal}>{item.quantity}</span>
                          <button style={{ ...S.qtyBtn, ...S.qtyBtnPlus }} onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus size={12} />
                          </button>
                        </div>
                        <span style={S.lineTotal}>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div style={S.couponWrap}>
                <Tag size={16} color={couponApplied ? '#1BA672' : '#94a3b8'} />
                {couponApplied ? (
                  <div style={S.couponApplied}>
                    <span style={{ color: '#1BA672', fontWeight: 700, fontSize: '0.85rem' }}>🎉 FOODDASH10 applied — 10% off!</span>
                    <button style={S.couponRemove} onClick={() => { setCouponApplied(false); setCoupon(''); }}>Remove</button>
                  </div>
                ) : (
                  <div style={S.couponInputRow}>
                    <input
                      value={coupon} onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Enter coupon code" style={S.couponInput}
                      onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                    />
                    <button style={S.couponApplyBtn} onClick={applyCoupon}>Apply</button>
                  </div>
                )}
              </div>

              {/* Bill breakdown */}
              <div style={S.footer}>
                <div style={S.billSection}>
                  <h4 style={S.billTitle}>Bill Details</h4>

                  {[
                    { label: 'Item Subtotal', value: `$${subtotal.toFixed(2)}` },
                    ...(couponApplied ? [{ label: 'Coupon Discount (10%)', value: `-$${discount.toFixed(2)}`, green: true }] : []),
                    { label: 'Delivery Partner Fee', value: `$${deliveryFee.toFixed(2)}` },
                    { label: 'GST & Charges (5%)', value: `$${taxes.toFixed(2)}` },
                  ].map((row, i) => (
                    <div key={i} style={S.billRow}>
                      <span style={S.billLabel}>{row.label}</span>
                      <span style={{ ...S.billValue, ...(row.green ? { color: '#1BA672' } : {}) }}>{row.value}</span>
                    </div>
                  ))}

                  <div style={S.divider} />

                  <div style={S.totalRow}>
                    <span style={S.totalLabel}>Grand Total</span>
                    <span style={S.totalValue}>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Delivery estimate */}
                <div style={S.deliveryEstimate}>
                  <Clock size={14} color="#ff6b35" />
                  <span style={S.deliveryEstimateText}>Estimated delivery: <strong>20–30 min</strong></span>
                </div>

                <button style={S.checkoutBtn} onClick={handleCheckout} className="animate-pulse-glow">
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .cart-item-row { transition: background 0.2s; border-radius: 14px; }
        .cart-item-row:hover { background: rgba(226,55,68,0.03); }
        @keyframes slideInFromRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const S = {
  overlay: { position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', justifyContent: 'flex-end' },
  backdrop: {
    position: 'absolute', inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    backdropFilter: 'blur(8px)',
    animation: 'fadeIn 0.25s ease',
  },
  sidebar: {
    position: 'relative', width: '430px', maxWidth: '100%',
    backgroundColor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column',
    boxShadow: '-16px 0 64px rgba(0,0,0,0.18)',
    animation: 'slideInFromRight 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    borderLeft: '1px solid #e2e8f0',
  },

  /* Header */
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1.4rem 1.5rem', borderBottom: '1px solid #f1f5f9',
    background: '#ffffff',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  headerIconWrap: {
    width: '42px', height: '42px',
    background: 'linear-gradient(135deg, #e23744, #ff6b35)',
    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 6px 16px rgba(226,55,68,0.35)',
  },
  headerTitle: { fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' },
  restaurantSub: { fontSize: '0.78rem', color: '#64748b', fontWeight: 500 },
  closeBtn: {
    background: '#f1f5f9', border: 'none', width: '34px', height: '34px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#64748b', transition: 'all 0.2s',
  },

  countBar: {
    padding: '0.6rem 1.5rem', background: '#fafafa', borderBottom: '1px solid #f1f5f9',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  countText: { fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' },
  trustRow: { display: 'flex', alignItems: 'center', gap: '4px' },

  /* Content */
  content: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  empty: {
    padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', flex: 1, gap: '0.8rem',
  },
  emptyIconWrap: {
    width: '90px', height: '90px', background: '#f8fafc', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '0.5rem', border: '1.5px dashed #e2e8f0',
  },
  emptyTitle: { fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' },
  emptyText: { color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: '240px', margin: 0 },
  browseBtn: {
    padding: '0.8rem 1.8rem', background: 'linear-gradient(135deg, #e23744, #CB202D)',
    color: 'white', border: 'none', borderRadius: '12px',
    fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 20px rgba(226,55,68,0.3)', fontSize: '0.88rem',
  },

  /* Item list */
  itemsList: { flex: 1, padding: '1.2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem', overflowY: 'auto' },
  cartItem: { display: 'flex', gap: '1rem', paddingBottom: '1.1rem', borderBottom: '1px solid #f1f5f9' },
  itemImage: { width: '76px', height: '76px', borderRadius: '14px', objectFit: 'cover', border: '1px solid #f1f5f9', flexShrink: 0 },
  itemImagePlaceholder: {
    width: '76px', height: '76px', borderRadius: '14px', background: '#f8fafc',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
    border: '1px solid #f1f5f9', flexShrink: 0,
  },
  itemDetails: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' },
  itemName: { fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.3 },
  removeBtn: {
    background: '#fef2f2', border: 'none', cursor: 'pointer', padding: '5px',
    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  priceUnit: { color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 },
  qtyRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' },
  quantityControls: {
    display: 'inline-flex', alignItems: 'center', borderRadius: '10px',
    border: '1.5px solid #e2e8f0', overflow: 'hidden', background: '#ffffff',
  },
  qtyBtn: {
    background: '#f8fafc', border: 'none', cursor: 'pointer', color: '#64748b',
    width: '30px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.15s',
  },
  qtyBtnPlus: { background: '#fef2f2', color: '#e23744' },
  qtyVal: { fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', minWidth: '24px', textAlign: 'center' },
  lineTotal: { fontSize: '1rem', fontWeight: 800, color: '#0f172a' },

  /* Coupon */
  couponWrap: {
    margin: '0 1.5rem 0.5rem', padding: '0.9rem 1rem',
    background: '#fafafa', borderRadius: '14px', border: '1.5px dashed #e2e8f0',
    display: 'flex', alignItems: 'center', gap: '0.6rem',
  },
  couponApplied: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 },
  couponRemove: { background: 'none', border: 'none', color: '#e23744', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' },
  couponInputRow: { display: 'flex', flex: 1, gap: '0.5rem' },
  couponInput: {
    flex: 1, border: 'none', background: 'transparent', outline: 'none',
    fontSize: '0.88rem', fontFamily: 'var(--font-body)', color: '#0f172a',
    fontWeight: 600, letterSpacing: '0.05em',
  },
  couponApplyBtn: {
    background: 'linear-gradient(135deg, #e23744, #CB202D)', color: 'white',
    border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '0.8rem',
    fontWeight: 700, cursor: 'pointer',
  },

  /* Footer */
  footer: {
    padding: '1.3rem 1.5rem', borderTop: '1px solid #f1f5f9',
    background: '#ffffff', boxShadow: '0 -8px 24px rgba(0,0,0,0.04)',
  },
  billSection: { marginBottom: '1rem' },
  billTitle: {
    fontSize: '0.75rem', fontWeight: 800, color: '#334155',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.7rem', fontFamily: 'var(--font-heading)',
  },
  billRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#64748b', marginBottom: '0.4rem' },
  billLabel: { fontWeight: 500 },
  billValue: { fontWeight: 600, color: '#334155' },
  divider: { height: '1px', background: '#f1f5f9', margin: '0.7rem 0' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  totalLabel: { fontSize: '1rem', fontWeight: 800, color: '#0f172a' },
  totalValue: { fontSize: '1.3rem', fontWeight: 900, color: '#e23744', fontFamily: 'var(--font-heading)' },
  deliveryEstimate: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: '#fff7ed', borderRadius: '10px', padding: '8px 12px',
    marginBottom: '0.9rem', border: '1px solid #fed7aa',
  },
  deliveryEstimateText: { fontSize: '0.8rem', color: '#92400e' },
  checkoutBtn: {
    width: '100%', padding: '1.05rem',
    background: 'linear-gradient(135deg, #E23744, #CB202D)',
    color: 'white', border: 'none', borderRadius: '14px',
    fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(226,55,68,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    transition: 'all 0.25s',
    letterSpacing: '0.01em',
  },
};
