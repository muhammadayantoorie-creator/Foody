import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const DELIVERY_FEE = 2.99;
const STEPS = ['Cart', 'Delivery', 'Payment', 'Confirmation'];

/* ─── Step Indicator ──────────────────────────────────────── */
function StepIndicator({ current }) {
  const percent = (current / (STEPS.length - 1)) * 100;
  
  return (
    <div style={ui.stepContainer}>
      <div style={ui.progressTrack}>
        <div style={{ ...ui.progressBar, width: `${percent}%` }} />
      </div>
      <div style={ui.stepRow}>
        {STEPS.map((label, idx) => {
          const done = idx < current;
          const active = idx === current;
          return (
            <div key={label} style={ui.stepItem}>
              <div style={{
                ...ui.stepCircle,
                background: done ? 'var(--success)' : active ? 'var(--primary)' : 'var(--surface-solid)',
                border: `2px solid ${done ? 'var(--success)' : active ? 'var(--primary)' : 'var(--border-strong)'}`,
                color: done ? 'white' : active ? 'white' : 'var(--text-muted)',
                boxShadow: active ? '0 0 0 4px var(--primary-glow)' : 'none',
              }}>
                {done ? '✓' : idx + 1}
              </div>
              <span style={{ 
                ...ui.stepLabel, 
                color: active ? 'var(--primary)' : done ? 'var(--success)' : 'var(--text-muted)', 
                fontWeight: active ? '700' : '600' 
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Step 1: Cart Review ─────────────────────────────────── */
function CartStep({ cartItems, updateQuantity, removeFromCart, subtotal, onNext }) {
  if (cartItems.length === 0) return (
    <div style={ui.emptyBox} className="animate-fade-up">
      <div style={{ fontSize: '4.5rem', marginBottom: '1.2rem', animation: 'float 3s infinite' }}>🛒</div>
      <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: 800 }}>Your cart is empty</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Add some delicious items to get started!</p>
    </div>
  );

  const restaurantName = cartItems[0]?.restaurant_name || cartItems[0]?.food_items?.restaurants?.name || 'Restaurant';

  return (
    <div className="animate-fade-up">
      <div style={ui.fromBadge} className="glass-panel">
        <span style={{ fontSize: '1.2rem' }}>🍽️</span>
        <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>Ordering from <strong style={{ color: 'var(--primary)' }}>{restaurantName}</strong></span>
      </div>

      <div style={ui.itemList}>
        {cartItems.map(item => (
          <div key={item.id} style={ui.cartRow}>
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} style={ui.itemImg} />
            ) : (
              <div style={{ ...ui.itemImg, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🍲</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={ui.itemName}>{item.name}</p>
              <p style={ui.itemUnit}>${Number(item.price).toFixed(2)} each</p>
            </div>
            
            <div style={ui.qtyBlock}>
              <button style={ui.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
              <span style={ui.qtyNum}>{item.quantity}</span>
              <button style={ui.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
            </div>
            
            <div style={ui.itemLineTotal}>${(item.price * item.quantity).toFixed(2)}</div>
            <button style={ui.removeBtn} onClick={() => removeFromCart(item.id)} title="Remove">✕</button>
          </div>
        ))}
      </div>

      <div style={ui.subtotalBar}>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
        <span style={{ fontWeight: '800', fontSize: '1.35rem', color: 'var(--text-main)' }}>${subtotal.toFixed(2)}</span>
      </div>

      <button style={ui.nextBtn} onClick={onNext} className="animate-pulse-glow">
        Continue to Delivery Details <span style={{ marginLeft: '0.4rem' }}>→</span>
      </button>
    </div>
  );
}

/* ─── Step 2: Delivery Address ────────────────────────────── */
function DeliveryStep({ address, setAddress, phone, setPhone, note, setNote, onBack, onNext }) {
  const saved = [
    '123 Main Street, New York, NY 10001',
    '456 Oak Avenue, Chicago, IL 60614',
  ];

  const handleNext = () => {
    if (!address.trim()) { toast.error('Please enter a delivery address.'); return; }
    onNext();
  };

  return (
    <div className="animate-fade-up">
      <h3 style={ui.subHeading}>📍 Delivery Address</h3>

      {/* Quick select */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={ui.fieldLabel}>Saved addresses</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {saved.map(a => (
            <button 
              key={a} 
              type="button"
              onClick={() => setAddress(a)} 
              style={{
                ...ui.savedAddr,
                borderColor: address === a ? 'var(--primary)' : 'var(--border)',
                color: address === a ? 'var(--primary)' : 'var(--text-secondary)',
                background: address === a ? 'var(--primary-light)' : 'var(--surface-solid)',
                fontWeight: address === a ? 700 : 500,
              }}
            >
              <span style={{ marginRight: '0.5rem' }}>📌</span> {a}
            </button>
          ))}
        </div>
      </div>

      <div style={ui.fieldGroup}>
        <label style={ui.fieldLabel}>Full Delivery Address *</label>
        <textarea
          rows={3}
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Enter your complete delivery address…"
          style={ui.textarea}
        />
      </div>

      <div style={ui.fieldGroup}>
        <label style={ui.fieldLabel}>Phone Number (for rider)</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="+1 (555) 000-0000"
          style={ui.input}
        />
      </div>

      <div style={ui.fieldGroup}>
        <label style={ui.fieldLabel}>Delivery Note (optional)</label>
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="e.g. Ring bell, leave at door…"
          style={ui.input}
        />
      </div>

      <div style={ui.btnRow}>
        <button type="button" style={ui.backBtn} onClick={onBack}>← Back</button>
        <button type="button" style={ui.nextBtn} onClick={handleNext}>Continue to Payment →</button>
      </div>
    </div>
  );
}

/* ─── Step 3: Payment (Stripe inner form) ─────────────────── */
function PaymentStep({ subtotal, address, phone, note, cartItems, user, clearCart, onBack, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [payError, setPayError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [mobileNumber, setMobileNumber] = useState('');
  const grandTotal = subtotal + DELIVERY_FEE;

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPayError(null);

    let transactionId = null;

    try {
      if (paymentMethod === 'Card') {
        if (!stripe || !elements) return;
        const cardElement = elements.getElement(CardElement);
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4242'}/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: grandTotal }),
        });
        const { clientSecret, error: serverError } = await res.json();
        if (serverError) throw new Error(serverError);

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement, billing_details: { name: user?.email } },
        });
        if (stripeError) { setPayError(stripeError.message); setLoading(false); return; }
        
        if (paymentIntent.status !== 'succeeded') throw new Error("Payment failed");
        transactionId = paymentIntent.id;
      } else if (paymentMethod === 'JazzCash' || paymentMethod === 'EasyPaisa') {
        if (!mobileNumber.trim()) throw new Error("Mobile number is required");
        
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4242'}/mobile-wallet-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: grandTotal, mobileNumber, provider: paymentMethod }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        if (data.status !== 'success') throw new Error("Payment failed");
        
        transactionId = data.transactionId;
      } else if (paymentMethod === 'Cash on Delivery') {
        transactionId = 'COD_PENDING';
      }

      // 3. Write order to Supabase
      const restaurantId = cartItems[0]?.restaurant_id;
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          restaurant_id: restaurantId,
          total_amount: subtotal,
          delivery_address: address + (phone ? ` | Tel: ${phone}` : '') + (note ? ` | Note: ${note}` : ''),
          status: 'Pending',
        })
        .select()
        .single();
      if (orderErr) throw orderErr;

      // 4. Write order items
      const { error: itemsErr } = await supabase.from('order_items').insert(
        cartItems.map(i => ({ order_id: order.id, food_item_id: i.id, quantity: i.quantity, price: i.price }))
      );
      if (itemsErr) throw itemsErr;

      // 5. Write payment record
      await supabase.from('payments').insert({
        order_id: order.id,
        amount: grandTotal,
        payment_method: paymentMethod,
        status: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Completed',
        transaction_id: transactionId,
      });

      // 6. Send Receipt Email
      try {
        const restaurantName = cartItems[0]?.restaurant_name || cartItems[0]?.food_items?.restaurants?.name || 'Restaurant';
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4242'}/order-receipt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            customerEmail: user?.email,
            items: cartItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
            total: subtotal,
            restaurantName,
            deliveryAddress: address,
          }),
        });
      } catch (emailErr) {
        console.error("Failed to send receipt email:", emailErr);
      }

      clearCart();
      onSuccess(order);
    } catch (err) {
      console.error(err);
      setPayError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'Card', label: 'Credit / Debit Card', icon: '💳', desc: 'Secure payment via Stripe' },
    { id: 'Cash on Delivery', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your food arrives' },
    { id: 'JazzCash', label: 'JazzCash Mobile Wallet', icon: '📱', desc: 'Direct mobile wallet transfer' },
    { id: 'EasyPaisa', label: 'EasyPaisa Mobile Wallet', icon: '💸', desc: 'Direct mobile wallet transfer' }
  ];

  return (
    <form onSubmit={handlePay} className="animate-fade-up">
      {/* Order summary mini */}
      <div style={ui.miniSummary} className="glass-panel">
        <h4 style={ui.miniTitle}>Order Summary</h4>
        <div style={ui.miniRow}>
          <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
          <span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
        </div>
        <div style={ui.miniRow}>
          <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee</span>
          <span style={{ fontWeight: 600 }}>${DELIVERY_FEE.toFixed(2)}</span>
        </div>
        <div style={{ ...ui.miniRow, ...ui.miniTotal }}>
          <span style={{ fontWeight: 800 }}>Total Amount</span>
          <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.2rem' }}>${grandTotal.toFixed(2)}</span>
        </div>
        <div style={ui.deliveryTo}>
          <span style={{ fontSize: '0.9rem' }}>📍</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', wordBreak: 'break-word', fontWeight: 500 }}>{address}</span>
        </div>
      </div>

      {/* Payment Selection */}
      <h3 style={ui.subHeading}>💳 Payment Details</h3>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={ui.fieldLabel}>Select Payment Method</label>
        <div style={ui.paymentGrid}>
          {paymentMethods.map(m => {
            const isSelected = paymentMethod === m.id;
            return (
              <div 
                key={m.id}
                onClick={() => setPaymentMethod(m.id)}
                style={{
                  ...ui.paymentCard,
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                  background: isSelected ? 'var(--primary-light)' : 'var(--surface-solid)',
                  boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <div style={ui.paymentCardHeader}>
                  <span style={{ fontSize: '1.6rem' }}>{m.icon}</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>{m.label}</span>
                </div>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.desc}</p>
                {isSelected && <div style={ui.checkBadge}>✓</div>}
              </div>
            );
          })}
        </div>
      </div>

      {paymentMethod === 'Card' && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={ui.fieldGroup}>
            <label style={ui.fieldLabel}>Card Details</label>
            <div style={ui.cardBox}>
              <CardElement options={{
                style: {
                  base: { fontSize: '16px', color: 'var(--text-main)', fontFamily: 'Inter, sans-serif', '::placeholder': { color: 'var(--text-muted)' } },
                  invalid: { color: 'var(--danger)' },
                }
              }} />
            </div>
          </div>
          <div style={ui.secureBadge}>
            🔒 Secured by Stripe · Test card: 4242 4242 4242 4242
          </div>
        </div>
      )}

      {(paymentMethod === 'JazzCash' || paymentMethod === 'EasyPaisa') && (
        <div style={ui.fieldGroup} className="animate-fade-up">
          <label style={ui.fieldLabel}>{paymentMethod} Mobile Number</label>
          <input 
            type="text" 
            placeholder="03XX-XXXXXXX" 
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            style={ui.input} 
            required
          />
        </div>
      )}

      {paymentMethod === 'Cash on Delivery' && (
        <div style={ui.codWarning} className="animate-fade-up">
          <span>💵</span> You will pay <strong>${grandTotal.toFixed(2)}</strong> when your order is delivered.
        </div>
      )}

      {payError && <p style={ui.errorMsg}>{payError}</p>}

      <div style={ui.btnRow}>
        <button type="button" style={ui.backBtn} onClick={onBack} disabled={loading}>← Back</button>
        <button type="submit" style={{ ...ui.nextBtn, opacity: loading ? 0.7 : 1 }} disabled={loading} className="animate-pulse-glow">
          {loading ? '⏳ Processing…' : `Pay & Place Order · $${grandTotal.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}

/* ─── Step 4: Confirmation ────────────────────────────────── */
function ConfirmationStep({ order, navigate }) {
  return (
    <div style={ui.confirmBox} className="animate-fade-up">
      <div style={ui.confirmIcon}>🎉</div>
      <h2 style={ui.confirmTitle}>Order Placed Successfully!</h2>
      <p style={ui.confirmSub}>Thank you for your order! It has been received and is being prepared.</p>

      <div style={ui.confirmCard} className="glass-panel">
        <div style={ui.confirmRow}>
          <span style={ui.confirmKey}>Order ID</span>
          <span style={ui.confirmVal}>#{order?.id?.slice(0, 8).toUpperCase() || 'N/A'}</span>
        </div>
        <div style={ui.confirmRow}>
          <span style={ui.confirmKey}>Status</span>
          <span style={{ ...ui.confirmVal, color: 'var(--warning)', fontWeight: '800' }}>📋 Pending</span>
        </div>
        <div style={ui.confirmRow}>
          <span style={ui.confirmKey}>Est. Delivery</span>
          <span style={ui.confirmVal}>30–45 minutes</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '2.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button style={ui.nextBtn} onClick={() => navigate('/my-orders')} className="animate-pulse-glow">
          📦 Track My Order
        </button>
        <button style={ui.backBtn} onClick={() => navigate('/dashboard')}>
          🏠 Back to Home
        </button>
      </div>
    </div>
  );
}

/* ─── Main Checkout Page ──────────────────────────────────── */
export default function Checkout() {
  const { cartItems, getCartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  const subtotal = getCartTotal();

  // Empty cart & not yet confirmed
  if (cartItems.length === 0 && step < 3) {
    return (
      <div style={ui.page}>
        <Header navigate={navigate} step={step} />
        <main style={ui.main}>
          <div style={ui.card}>
            <StepIndicator current={step} />
            <CartStep cartItems={[]} updateQuantity={updateQuantity} removeFromCart={removeFromCart} subtotal={0} onNext={() => {}} />
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button style={ui.nextBtn} onClick={() => navigate('/dashboard')}>Find a Restaurant</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={ui.page}>
      <Header navigate={navigate} step={step} />
      <main style={ui.main}>
        <div style={ui.card}>
          <StepIndicator current={step} />
          <div style={{ marginTop: '2.5rem' }}>
            {step === 0 && (
              <CartStep
                cartItems={cartItems}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                subtotal={subtotal}
                onNext={() => setStep(1)}
              />
            )}
            {step === 1 && (
              <DeliveryStep
                address={address} setAddress={setAddress}
                phone={phone} setPhone={setPhone}
                note={note} setNote={setNote}
                onBack={() => setStep(0)}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <Elements stripe={stripePromise}>
                <PaymentStep
                  subtotal={subtotal}
                  address={address}
                  phone={phone}
                  note={note}
                  cartItems={cartItems}
                  user={user}
                  clearCart={clearCart}
                  onBack={() => setStep(1)}
                  onSuccess={(order) => { setPlacedOrder(order); setStep(3); }}
                />
              </Elements>
            )}
            {step === 3 && <ConfirmationStep order={placedOrder} navigate={navigate} />}
          </div>
        </div>
      </main>
    </div>
  );
}

function Header({ navigate, step }) {
  return (
    <header style={ui.header}>
      <div style={ui.headerInner}>
        <button style={ui.headerBack} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div style={ui.headerLogo} onClick={() => navigate('/dashboard')} className="cursor-pointer">
          <span style={{ fontSize: '1.4rem' }}>🍕</span>
          <span style={ui.brandTxt}>FoodDash</span>
        </div>
        <div style={ui.headerTitle}>
          <span style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '1.1rem' }}>Secure Checkout</span>
        </div>
      </div>
    </header>
  );
}

/* ─── Styles ──────────────────────────────────────────────── */
const ui = {
  page: { minHeight: '100vh', background: 'var(--background)', fontFamily: 'var(--font-body)' },
  header: { 
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
    height: '72px'
  },
  headerInner: {
    maxWidth: '1200px', margin: '0 auto',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.8rem 1.5rem', height: '100%',
  },
  headerBack: { 
    background: 'transparent', border: '1px solid var(--border-strong)', 
    padding: '0.5rem 1.1rem', borderRadius: 'var(--radius-md)',
    fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600' 
  },
  headerLogo: { display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' },
  brandTxt: { fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--primary)', fontSize: '1.35rem', letterSpacing: '-0.03em' },
  headerTitle: { fontWeight: '700', color: 'var(--text-secondary)', fontSize: '0.95rem' },
  
  main: { padding: '3rem 1.5rem', maxWidth: '820px', margin: '0 auto' },
  card: { background: 'var(--surface-solid)', borderRadius: 'var(--radius-2xl)', padding: '3rem 2.5rem', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' },

  // Steps
  stepContainer: { position: 'relative', width: '100%', marginBottom: '1rem' },
  progressTrack: { position: 'absolute', top: '19px', left: '30px', right: '30px', height: '4px', background: 'var(--border-strong)', borderRadius: '2px', zIndex: 1 },
  progressBar: { height: '100%', background: 'var(--success)', borderRadius: '2px', transition: 'width 0.4s ease-in-out' },
  stepRow: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '70px', background: 'var(--surface-solid)', padding: '0 8px' },
  stepCircle: { width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.88rem', transition: 'all 0.3s' },
  stepLabel: { fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', fontWeight: '700' },

  // Cart items
  fromBadge: { display: 'flex', gap: '0.8rem', alignItems: 'center', padding: '1rem 1.25rem', background: 'var(--success-light)', borderRadius: 'var(--radius-md)', marginBottom: '2rem', border: '1px solid rgba(27, 166, 114, 0.15)' },
  itemList: { display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' },
  cartRow: { display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xs)' },
  itemImg: { width: '70px', height: '70px', borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-light)' },
  itemName: { margin: '0 0 6px 0', fontWeight: '800', color: 'var(--text-main)', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-heading)' },
  itemUnit: { margin: 0, color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 500 },
  qtyBlock: { display: 'flex', alignItems: 'center', gap: '8px', background: '#F3F4F6', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '3px 8px' },
  qtyBtn: { background: 'none', border: 'none', fontSize: '1rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: '800', padding: '0 4px' },
  qtyNum: { fontWeight: '800', minWidth: '18px', textAlign: 'center', color: 'var(--text-main)', fontSize: '0.85rem' },
  itemLineTotal: { fontWeight: '800', color: 'var(--text-main)', minWidth: '64px', textAlign: 'right', fontSize: '1rem' },
  removeBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', padding: '6px', opacity: 0.6, transition: 'opacity 0.2s' },
  subtotalBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 1.5rem', background: 'var(--background)', borderRadius: 'var(--radius-lg)', marginBottom: '2.5rem', border: '1px solid var(--border)' },
  emptyBox: { textAlign: 'center', padding: '4rem 1rem' },

  // Delivery
  subHeading: { margin: '0 0 1.5rem 0', fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' },
  savedAddr: { border: '1.5px solid', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'left', fontSize: '0.88rem', display: 'flex', alignItems: 'center', transition: 'all 0.2s' },
  fieldGroup: { marginBottom: '1.5rem' },
  fieldLabel: { display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' },
  input: { width: '100%', padding: '1rem 1.25rem', border: '1.5px solid var(--border-strong)', borderRadius: 'var(--radius-md)', fontSize: '0.95rem', fontFamily: 'var(--font-body)', outline: 'none', background: 'var(--surface-solid)', boxShadow: 'var(--shadow-inset)' },
  textarea: { width: '100%', padding: '1rem 1.25rem', border: '1.5px solid var(--border-strong)', borderRadius: 'var(--radius-md)', fontSize: '0.95rem', fontFamily: 'var(--font-body)', resize: 'vertical', outline: 'none', background: 'var(--surface-solid)', boxShadow: 'var(--shadow-inset)' },

  // Payment
  miniSummary: { background: 'var(--background)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--border)' },
  miniTitle: { margin: '0 0 1rem 0', fontWeight: '800', color: 'var(--text-main)', fontSize: '1.05rem', fontFamily: 'var(--font-heading)' },
  miniRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.88rem' },
  miniTotal: { borderTop: '1px solid var(--border-strong)', paddingTop: '0.8rem', marginTop: '0.8rem' },
  deliveryTo: { display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginTop: '1rem', padding: '0.8rem 0 0 0', borderTop: '1px dashed var(--border-strong)' },
  cardBox: { padding: '1rem 1.25rem', border: '1.5px solid var(--border-strong)', borderRadius: 'var(--radius-md)', background: 'var(--surface-solid)', boxShadow: 'var(--shadow-inset)' },
  errorMsg: { color: 'var(--danger)', fontSize: '0.88rem', fontWeight: 600, margin: '1rem 0 0 0', textAlign: 'center' },
  secureBadge: { textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', margin: '1rem 0 1.5rem 0' },
  
  paymentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.5rem' },
  paymentCard: { border: '1.5px solid', borderRadius: 'var(--radius-md)', padding: '1.25rem', cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.2rem', transition: 'all 0.25s' },
  paymentCardHeader: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  checkBadge: { position: 'absolute', top: '10px', right: '10px', background: 'var(--primary)', color: 'white', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 },
  codWarning: { padding: '1.2rem 1.5rem', background: 'var(--success-bg)', color: 'var(--success-dark)', border: '1px solid rgba(27, 166, 114, 0.15)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: '600', display: 'flex', gap: '0.6rem', alignItems: 'center', fontSize: '0.92rem' },

  // Nav buttons
  btnRow: { display: 'flex', gap: '1.25rem', marginTop: '1rem' },
  backBtn: { flex: 1, padding: '1rem', background: '#F3F4F6', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' },
  nextBtn: { flex: 2, padding: '1.1rem', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: 'var(--shadow-primary)' },

  // Confirmation
  confirmBox: { textAlign: 'center', padding: '1.5rem 0' },
  confirmIcon: { fontSize: '5.5rem', marginBottom: '1rem', display: 'inline-block', animation: 'float 3s infinite' },
  confirmTitle: { fontSize: '2.2rem', fontWeight: '950', color: 'var(--text-main)', margin: '0 0 0.6rem 0', fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' },
  confirmSub: { color: 'var(--text-muted)', margin: '0 0 2.5rem 0', fontSize: '1.05rem', lineHeight: '1.5', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' },
  confirmCard: { background: 'var(--background)', borderRadius: 'var(--radius-lg)', padding: '1.5rem 2rem', display: 'inline-block', minWidth: '340px', border: '1px solid var(--border)', textAlign: 'left', boxShadow: 'var(--shadow-sm)' },
  confirmRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border-strong)' },
  confirmKey: { color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: '600' },
  confirmVal: { color: 'var(--text-main)', fontWeight: '700', fontSize: '0.98rem' },
};
