require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

const app = express();
app.use(cors());
app.use(express.json());

/* ─── Health Check ────────────────────────────────────────── */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ─── Create Payment Intent ───────────────────────────────── */
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount provided.' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects cents
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error) {
    console.error('Stripe error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/* ─── Retrieve Payment Intent ─────────────────────────────── */
app.get('/payment-intent/:id', async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(req.params.id);
    res.json({ status: paymentIntent.status, amount: paymentIntent.amount / 100 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ─── Refund Payment (for cancellations) ─────────────────── */
app.post('/refund', async (req, res) => {
  try {
    const { paymentIntentId, amount } = req.body;
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // full refund if no amount
    });
    res.json({ refundId: refund.id, status: refund.status });
  } catch (error) {
    console.error('Refund error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/* ─── Order Summary (for receipts) ───────────────────────── */
app.post('/order-receipt', async (req, res) => {
  try {
    const { orderId, customerEmail, items, total, restaurantName, deliveryAddress } = req.body;
    
    const receipt = {
      orderId,
      customerEmail,
      restaurantName,
      deliveryAddress,
      items,
      subtotal: total,
      deliveryFee: 2.99,
      grandTotal: parseFloat(total) + 2.99,
      issuedAt: new Date().toISOString(),
    };

    if (process.env.RESEND_API_KEY && customerEmail) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev', // Use a verified domain in production
        to: customerEmail,
        subject: `Your Receipt from ${restaurantName} (Order #${orderId.slice(0, 8).toUpperCase()})`,
        html: `<h2>Thanks for your order!</h2>
               <p>Your order from <strong>${restaurantName}</strong> has been received.</p>
               <p><strong>Total Paid:</strong> $${receipt.grandTotal.toFixed(2)}</p>
               <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
               <br/>
               <p>Track your order status live in your dashboard.</p>`,
      });
      console.log(`[Receipt] Email sent to ${customerEmail}`);
    } else {
      console.log(`[Receipt] Mock Email sent to ${customerEmail}. Add RESEND_API_KEY to send real emails.`);
    }

    res.json({ success: true, receipt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ─── Order Status Update Notification ─────────────────────── */
app.post('/order-status-update', async (req, res) => {
  try {
    const { orderId, customerEmail, status, restaurantName } = req.body;
    
    if (process.env.RESEND_API_KEY && customerEmail) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev', 
        to: customerEmail,
        subject: `Order Update: ${status}`,
        html: `<h2>Your Order Status Updated!</h2>
               <p>Your order from <strong>${restaurantName}</strong> is now: <strong>${status}</strong>.</p>
               <p>Order ID: #${orderId.slice(0, 8).toUpperCase()}</p>`,
      });
      console.log(`[Status] Notification sent to ${customerEmail}`);
    } else {
      console.log(`[Status] Mock Notification sent to ${customerEmail} for status ${status}`);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ─── Estimate Delivery Time ──────────────────────────────── */
app.get('/estimate-delivery', (req, res) => {
  // Mock estimate – in production integrate with a Maps API
  const base = 25;
  const variance = Math.floor(Math.random() * 20);
  res.json({ estimatedMinutes: base + variance, label: `${base}–${base + variance} mins` });
});

/* ─── Start Server ────────────────────────────────────────── */
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`✅ Order Management Server running on port ${PORT}`));
