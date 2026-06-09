import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function CartSidebar() {
  const { 
    cartItems, 
    isSidebarOpen, 
    toggleSidebar, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal 
  } = useCart();
  const navigate = useNavigate();

  if (!isSidebarOpen) return null;

  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 0 ? 3.50 : 0;
  const taxes = subtotal > 0 ? subtotal * 0.05 : 0; // 5% GST
  const grandTotal = subtotal + deliveryFee + taxes;

  const handleCheckout = () => {
    toggleSidebar();
    navigate('/checkout');
  };

  const restaurantName = cartItems.length > 0 ? cartItems[0].restaurant_name : '';

  return (
    <div style={styles.overlay}>
      <div style={styles.backdrop} onClick={toggleSidebar} />
      <div style={styles.sidebar}>
        <div style={styles.header}>
          <div style={styles.headerTitleCol}>
            <h2 style={styles.headerTitle}>Your Cart</h2>
            {restaurantName && (
              <span style={styles.restaurantSub}>Ordering from <strong style={{ color: 'var(--primary)' }}>{restaurantName}</strong></span>
            )}
          </div>
          <button style={styles.closeBtn} onClick={toggleSidebar}>✕</button>
        </div>

        <div style={styles.content}>
          {cartItems.length === 0 ? (
            <div style={styles.empty}>
              <span style={{ fontSize: '4.5rem', display: 'block', marginBottom: '1.2rem', animation: 'float 3s ease-in-out infinite' }}>🛒</span>
              <h3 style={styles.emptyTitle}>Your cart is empty</h3>
              <p style={styles.emptyText}>Add some delicious food from your favorite restaurant to start your feast!</p>
              <button style={styles.browseBtn} onClick={toggleSidebar}>
                Browse Restaurants
              </button>
            </div>
          ) : (
            <>
              <div style={styles.itemsList}>
                {cartItems.map((item) => (
                  <div key={item.id} style={styles.cartItem}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} style={styles.itemImage} />
                    ) : (
                      <div style={styles.itemImagePlaceholder}>🍽️</div>
                    )}
                    
                    <div style={styles.itemDetails}>
                      <div style={styles.itemHeader}>
                        <h4 style={styles.itemName}>{item.name}</h4>
                        <button style={styles.removeBtn} onClick={() => removeFromCart(item.id)} title="Remove item">
                          🗑️
                        </button>
                      </div>
                      
                      <div style={styles.itemMetaRow}>
                        <span style={styles.price}>${Number(item.price).toFixed(2)}</span>
                        <span style={styles.lineTotal}>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                      </div>

                      <div style={styles.quantityControls}>
                        <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span style={styles.qtyVal}>{item.quantity}</span>
                        <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill Breakdown */}
              <div style={styles.footer}>
                <div style={styles.billSection}>
                  <h4 style={styles.billTitle}>Bill Details</h4>
                  
                  <div style={styles.billRow}>
                    <span style={styles.billLabel}>Item Subtotal</span>
                    <span style={styles.billValue}>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div style={styles.billRow}>
                    <span style={styles.billLabel}>Delivery Partner Fee</span>
                    <span style={styles.billValue}>${deliveryFee.toFixed(2)}</span>
                  </div>
                  
                  <div style={styles.billRow}>
                    <span style={styles.billLabel}>GST & Restaurant Charges (5%)</span>
                    <span style={styles.billValue}>${taxes.toFixed(2)}</span>
                  </div>
                  
                  <div style={styles.divider} />
                  
                  <div style={styles.totalRow}>
                    <span style={styles.totalLabel}>Grand Total</span>
                    <span style={styles.totalValue}>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button style={styles.checkoutBtn} onClick={handleCheckout} className="animate-pulse-glow">
                  Proceed to Checkout <span style={{ marginLeft: '0.5rem', fontWeight: 900 }}>→</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(28, 28, 46, 0.45)',
    backdropFilter: 'blur(8px)',
    animation: 'fadeIn 0.3s ease-in-out',
  },
  sidebar: {
    position: 'relative',
    width: '420px',
    maxWidth: '100%',
    backgroundColor: 'var(--surface-solid)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-xl)',
    animation: 'slideInFromRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    borderLeft: '1px solid var(--border)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface-solid)',
  },
  headerTitleCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  headerTitle: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    margin: 0,
    letterSpacing: '-0.02em',
    fontFamily: 'var(--font-heading)',
  },
  restaurantSub: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  closeBtn: {
    background: '#F4F4F5',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    transition: 'background-color 0.2s',
    outline: 'none',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  empty: {
    padding: '4rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    marginBottom: '0.5rem',
    fontFamily: 'var(--font-heading)',
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '0.88rem',
    lineHeight: '1.5',
    maxWidth: '260px',
    margin: '0 0 1.5rem',
  },
  browseBtn: {
    padding: '0.8rem 1.8rem',
    background: 'var(--primary)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: 'var(--shadow-primary)',
    fontSize: '0.88rem',
  },
  itemsList: {
    flex: 1,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    overflowY: 'auto',
  },
  cartItem: {
    display: 'flex',
    gap: '1rem',
    paddingBottom: '1.25rem',
    borderBottom: '1px solid var(--border-light)',
  },
  itemImage: {
    width: '80px',
    height: '80px',
    borderRadius: 'var(--radius-md)',
    objectFit: 'cover',
    boxShadow: 'var(--shadow-xs)',
    border: '1px solid var(--border-light)',
  },
  itemImagePlaceholder: {
    width: '80px',
    height: '80px',
    borderRadius: 'var(--radius-md)',
    background: '#F3F4F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    border: '1px solid var(--border-light)',
  },
  itemDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  itemName: {
    fontSize: '0.98rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    margin: 0,
    lineHeight: '1.3',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '0.1rem',
    opacity: 0.6,
    transition: 'opacity 0.2s',
  },
  itemMetaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    margin: '0.2rem 0 0.5rem 0',
  },
  price: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  lineTotal: {
    color: 'var(--text-secondary)',
    fontSize: '0.92rem',
    fontWeight: '700',
  },
  quantityControls: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    width: 'fit-content',
    overflow: 'hidden',
  },
  qtyBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 800,
    fontSize: '1rem',
    color: 'var(--primary)',
    width: '28px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
  qtyVal: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    minWidth: '20px',
    textAlign: 'center',
  },
  footer: {
    padding: '1.5rem',
    borderTop: '1px solid var(--border)',
    backgroundColor: 'var(--surface-solid)',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.03)',
  },
  billSection: {
    marginBottom: '1.5rem',
  },
  billTitle: {
    fontSize: '0.88rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem',
    fontFamily: 'var(--font-heading)',
  },
  billRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.5rem',
  },
  billLabel: {
    fontWeight: 500,
  },
  billValue: {
    fontWeight: 600,
  },
  divider: {
    height: '1px',
    background: 'var(--border)',
    margin: '0.75rem 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: '0.5rem',
  },
  totalLabel: {
    fontSize: '1.05rem',
    fontWeight: 800,
    color: 'var(--text-main)',
  },
  totalValue: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--primary)',
  },
  checkoutBtn: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '1.05rem',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: 'var(--shadow-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  }
};
