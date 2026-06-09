import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

/* ─── Restaurant Switch Confirmation Modal ──────────────────── */
function RestaurantSwitchModal({ onConfirm, onCancel, fromName, toName }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      padding: '1rem',
      animation: 'fadeIn 0.15s ease',
    }}>
      <div style={{
        background: 'white', borderRadius: '20px',
        padding: '2rem', maxWidth: '400px', width: '100%',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        border: '1px solid var(--border-light)',
        animation: 'scaleIn 0.2s ease',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>🔄</span>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
            Switch Restaurant?
          </h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Your cart has items from <strong style={{ color: 'var(--primary)' }}>{fromName}</strong>.
            Starting a new order from <strong style={{ color: 'var(--text-main)' }}>{toName}</strong> will clear your current cart.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '0.85rem', background: '#F5F5F7',
              border: '1.5px solid var(--border)', borderRadius: '12px',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            Keep Current
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '0.85rem',
              background: 'linear-gradient(135deg, #E23744, #CB202D)',
              border: 'none', borderRadius: '12px', color: 'white',
              fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(226,55,68,0.3)',
            }}
          >
            Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Restaurant switch modal state
  const [switchModal, setSwitchModal] = useState(null); // { item, restaurantId, pendingResolve }

  // Fetch cart from Supabase on mount or user change
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      const saved = localStorage.getItem('food_delivery_cart_guest');
      if (saved) setCartItems(JSON.parse(saved));
      else setCartItems([]);
    }
  }, [user]);

  // Save guest cart to local storage if no user
  useEffect(() => {
    if (!user) {
      localStorage.setItem('food_delivery_cart_guest', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart')
        .select(`
          id,
          quantity,
          food_item_id,
          food_items (*, restaurants(id, name))
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      const formattedItems = data.map(item => ({
        id: item.food_items.id,
        name: item.food_items.name,
        price: item.food_items.price,
        image_url: item.food_items.image_url,
        restaurant_id: item.food_items.restaurant_id,
        restaurant_name: item.food_items.restaurants?.name,
        quantity: item.quantity,
        cart_row_id: item.id
      }));
      
      setCartItems(formattedItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show a nice modal and wait for user decision
  const confirmRestaurantSwitch = (fromName, toName) => {
    return new Promise((resolve) => {
      setSwitchModal({ fromName, toName, resolve });
    });
  };

  const handleSwitchConfirm = () => {
    if (switchModal?.resolve) switchModal.resolve(true);
    setSwitchModal(null);
  };

  const handleSwitchCancel = () => {
    if (switchModal?.resolve) switchModal.resolve(false);
    setSwitchModal(null);
  };

  const addToCart = async (item, restaurantId) => {
    // Check if item is from a different restaurant
    if (cartItems.length > 0 && cartItems[0].restaurant_id !== restaurantId) {
      const fromName = cartItems[0].restaurant_name || 'current restaurant';
      const toName = item.restaurant_name || 'new restaurant';
      const confirmed = await confirmRestaurantSwitch(fromName, toName);
      if (!confirmed) return;
      await clearCart();
    }

    const existingItem = cartItems.find(i => i.id === item.id);
    const isNewItem = !existingItem;
    
    if (user) {
      if (existingItem) {
        const { error } = await supabase
          .from('cart')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.cart_row_id);
          
        if (!error) {
          setCartItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
          toast(`${item.name} qty: ${existingItem.quantity + 1}`, { icon: '🛒', duration: 800 });
        } else {
          toast.error("Failed to update cart");
        }
      } else {
        const { data, error } = await supabase
          .from('cart')
          .insert({
            user_id: user.id,
            food_item_id: item.id,
            quantity: 1
          })
          .select()
          .single();
          
        if (!error) {
          setCartItems(prev => [...prev, { ...item, quantity: 1, restaurant_id: restaurantId, cart_row_id: data.id }]);
          toast.success(`Added ${item.name}! 🎉`);
        } else {
          toast.error("Failed to add to cart");
        }
      }
    } else {
      // Guest logic
      if (existingItem) {
        setCartItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
        toast(`${item.name} qty: ${existingItem.quantity + 1}`, { icon: '🛒', duration: 800 });
      } else {
        setCartItems(prev => [...prev, { ...item, quantity: 1, restaurant_id: restaurantId }]);
        toast.success(`Added ${item.name}! 🎉`);
      }
    }
    
    // Only auto-open sidebar when a brand new item is added
    if (isNewItem) setIsSidebarOpen(true);
  };

  const removeFromCart = async (itemId) => {
    const existingItem = cartItems.find(i => i.id === itemId);
    if (!existingItem) return;

    if (user && existingItem.cart_row_id) {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', existingItem.cart_row_id);
        
      if (!error) {
        setCartItems(prev => prev.filter(i => i.id !== itemId));
        toast('Item removed', { icon: '🗑️', duration: 1200 });
      }
    } else {
      setCartItems(prev => prev.filter(i => i.id !== itemId));
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    
    const existingItem = cartItems.find(i => i.id === itemId);
    
    if (user && existingItem?.cart_row_id) {
      const { error } = await supabase
        .from('cart')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.cart_row_id);
        
      if (!error) {
        setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQuantity } : i));
      }
    } else {
      setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQuantity } : i));
    }
  };

  const clearCart = async () => {
    if (user) {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);
        
      if (!error) setCartItems([]);
    } else {
      setCartItems([]);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Convenience: decrease qty by 1 (or remove if qty becomes 0)
  const decreaseCartItem = async (itemId) => {
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;
    if (item.quantity <= 1) {
      await removeFromCart(itemId);
    } else {
      await updateQuantity(itemId, item.quantity - 1);
    }
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    decreaseCartItem,
    clearCart,
    getCartTotal,
    getCartCount,
    isSidebarOpen,
    toggleSidebar,
    setIsSidebarOpen,
    loading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Restaurant switch confirmation modal (replaces window.confirm) */}
      {switchModal && (
        <RestaurantSwitchModal
          fromName={switchModal.fromName}
          toName={switchModal.toName}
          onConfirm={handleSwitchConfirm}
          onCancel={handleSwitchCancel}
        />
      )}
    </CartContext.Provider>
  );
}
