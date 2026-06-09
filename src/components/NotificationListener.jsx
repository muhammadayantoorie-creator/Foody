import React, { useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const STATUS_TOASTS = {
  Preparing:  { msg: "👨‍🍳 Your order is now being prepared!",     opts: { icon: '👨‍🍳', style: { background: 'var(--info-light)', color: 'var(--info)' } } },
  'Picked Up':{ msg: "🛵 Your order is on the way!",              opts: { icon: '🛵', style: { background: 'var(--purple-light)', color: 'var(--purple)' } } },
  Delivered:  { msg: "✅ Your order has been delivered! Enjoy! 🍔", opts: { icon: '✅', style: { background: 'var(--success-bg)', color: 'var(--success)' } } },
  Cancelled:  { msg: "❌ Your order has been cancelled.",           opts: { icon: '❌', style: { background: 'var(--danger-light)', color: 'var(--danger)' } } },
};

export default function NotificationListener() {
  const { user, role } = useAuth();

  useEffect(() => {
    if (!user) return;

    let customerSub, riderSub;

    // ── Customer: watch their own orders ──────────────────────
    if (role === 'Customer') {
      customerSub = supabase
        .channel(`customer-orders-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `customer_id=eq.${user.id}`,   // ✅ Fixed: was user_id
          },
          (payload) => {
            const { new: newOrder, old: oldOrder } = payload;
            if (newOrder.status !== oldOrder.status) {
              const t = STATUS_TOASTS[newOrder.status];
              if (t) {
                toast(t.msg, { duration: 5000, ...t.opts });
              } else {
                toast(`Order status: ${newOrder.status}`, { duration: 4000 });
              }
            }
          }
        )
        .subscribe();
    }

    // ── Rider: watch for new Pending orders ───────────────────
    if (role === 'Delivery Rider') {
      riderSub = supabase
        .channel('rider-new-orders')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'orders' },
          (payload) => {
            if (payload.new.status === 'Pending') {
              toast('🚨 New order available for pickup!', {
                duration: 6000,
                icon: '📦',
                style: { background: 'var(--warning-bg)', color: 'var(--warning)', fontWeight: '700' },
              });
            }
          }
        )
        .subscribe();
    }

    // ── Admin: watch all order updates ────────────────────────
    if (role === 'Admin') {
      riderSub = supabase
        .channel('admin-orders-watch')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'orders' },
          () => {
            toast('📬 New order received!', {
              duration: 5000,
              style: { background: 'var(--warning-bg)', color: 'var(--warning)' },
            });
          }
        )
        .subscribe();
    }

    return () => {
      if (customerSub) supabase.removeChannel(customerSub);
      if (riderSub) supabase.removeChannel(riderSub);
    };
  }, [user, role]);

  return null;
}
