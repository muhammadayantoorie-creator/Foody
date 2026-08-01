import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../contexts/CartContext';
import { useLanguageCurrency } from '../contexts/LanguageCurrencyContext';
import toast from 'react-hot-toast';
import { Bot, Sparkles, Send, X, ShoppingBag, Flame, ThumbsUp, RefreshCw, Zap } from 'lucide-react';

export default function AIChatAssistantModal({ isOpen, onClose }) {
  const { addToCart, toggleSidebar } = useCart();
  const { formatPrice, isRTL } = useLanguageCurrency();
  const messagesEndRef = useRef(null);

  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: isRTL
        ? 'سلام! میں فوڈ ڈیش AI اسسٹنٹ ہوں۔ آج آپ پاکستان کا کون سا پسندیدہ کھانا یا ریسٹورنٹ چننا چاہیں گے؟'
        : "Hello! I'm FoodDash AI Assistant 🤖. What Pakistani brand or dish are you craving today? Tell me your taste, budget, or favorite hotel!",
      recommendations: [
        { id: 'f-1', name: 'Cheezious Crown Crust Pizza', price: 6.50, image_url: '/images/pizza.png', tag: '🔥 #1 Trending' },
        { id: 'f-2', name: 'Student Biryani Special Platter', price: 2.50, image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80', tag: '👑 Legendary Taste' }
      ]
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  if (!isOpen) return null;

  // AI Logic Simulation
  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputMsg;
    if (!query.trim()) return;

    const userMessage = { id: Date.now(), sender: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setInputMsg('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponseText = '';
      let recs = [];
      const q = query.toLowerCase();

      if (q.includes('cheez') || q.includes('pizza') || q.includes('crown')) {
        aiResponseText = "Great choice! Here is Cheezious signature Crown Crust Pizza with molten cheese & tender chicken tikka:";
        recs = [
          { id: 'f-1', name: 'Cheezious Crown Crust Pizza', price: 6.50, image_url: '/images/pizza.png', tag: '⭐ 4.9 Rating' },
          { id: 'f-8', name: 'OPTP Garlic Mayo Gourmet Fries', price: 1.80, image_url: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=800&q=80', tag: '✨ Perfect Side' }
        ];
      } else if (q.includes('biryani') || q.includes('pulao') || q.includes('student') || q.includes('savour')) {
        aiResponseText = "Authentic Pakistani Biryani & Pulao from legendary kitchens:";
        recs = [
          { id: 'f-2', name: 'Student Biryani Special Platter', price: 2.50, image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80', tag: '👑 Karachi Style' },
          { id: 'f-4', name: 'Savour Foods Special Pulao Kabab', price: 2.00, image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80', tag: '⚡ Pindi & Islamabad Icon' }
        ];
      } else if (q.includes('karahi') || q.includes('butt') || q.includes('monal') || q.includes('desi')) {
        aiResponseText = "Sizzling organic Desi Ghee Mutton & Chicken Karahi straight from Lakshmi Chowk & Margalla Hills:";
        recs = [
          { id: 'f-3', name: 'Butt Karahi Desi Ghee Mutton Karahi', price: 8.99, image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80', tag: '🔥 Desi Ghee Classic' },
          { id: 'f-6', name: 'Monal Shinwari Mutton Karahi', price: 9.99, image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', tag: '⛰️ Margalla Hilltop Special' }
        ];
      } else if (q.includes('bbq') || q.includes('kolachi') || q.includes('kababjee') || q.includes('malai')) {
        aiResponseText = "Melt-in-mouth Pakistani BBQ Malai Boti & charcoal platters:";
        recs = [
          { id: 'f-5', name: 'Kolachi Secret Recipe BBQ Malai Boti', price: 4.50, image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80', tag: '🌊 Do Darya Famous' }
        ];
      } else {
        aiResponseText = `I analyzed your query for "${query}". Based on live top orders across Lahore, Karachi & Islamabad tonight:`;
        recs = [
          { id: 'f-1', name: 'Cheezious Crown Crust Pizza', price: 6.50, image_url: '/images/pizza.png', tag: '🔥 #1 Trending' },
          { id: 'f-3', name: 'Butt Karahi Desi Ghee Mutton Karahi', price: 8.99, image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80', tag: '⭐ Top Seller' }
        ];
      }

      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', text: aiResponseText, recommendations: recs }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div
        style={{ ...styles.modal, direction: isRTL ? 'rtl' : 'ltr' }}
        onClick={e => e.stopPropagation()}
        className="animate-scale-in"
      >
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={styles.aiBadgeIcon}>
              <Bot size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={styles.title}>FoodDash AI Assistant</h3>
                <span style={styles.aiPill}>PRO AI</span>
              </div>
              <p style={styles.subtitle}>Smart recommendations for Pakistani hotels & brands</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Close (Esc)">
            <X size={18} color="#94A3B8" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div style={styles.suggestionChips}>
          {['🍕 Cheezious Crown Crust', '👑 Student Biryani', '🍲 Butt Karahi', '⚡ Savour Pulao', '🌊 Kolachi BBQ'].map(chip => (
            <button
              key={chip}
              onClick={() => handleSendMessage(chip)}
              style={styles.chipBtn}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div style={styles.chatBody}>
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                ...styles.msgRow,
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.sender === 'ai' && (
                <div style={styles.aiAvatar}>
                  <Bot size={14} color="#FF6B35" />
                </div>
              )}

              <div
                style={{
                  ...styles.msgBubble,
                  background: msg.sender === 'user' ? 'linear-gradient(135deg, #FF6B35, #FF8C42)' : '#F8FAFC',
                  color: msg.sender === 'user' ? '#FFFFFF' : '#0F172A',
                  border: msg.sender === 'user' ? 'none' : '1px solid #E2E8F0',
                  borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                }}
              >
                <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{msg.text}</div>

                {/* Recommendation cards attached to AI messages */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div style={styles.recsGrid}>
                    {msg.recommendations.map(rec => (
                      <div key={rec.id} style={styles.recCard}>
                        <img src={rec.image_url} alt={rec.name} style={styles.recImg} />
                        <div style={{ flex: 1 }}>
                          <span style={styles.recTag}>{rec.tag}</span>
                          <div style={styles.recName}>{rec.name}</div>
                          <div style={styles.recPrice}>{formatPrice(rec.price)}</div>
                        </div>
                        <button
                          onClick={() => {
                            addToCart({
                              id: rec.id,
                              name: rec.name,
                              price: rec.price,
                              image_url: rec.image_url,
                              restaurant_id: 'rest-1',
                              restaurant_name: 'FoodDash AI Kitchen'
                            });
                            toast.success(`Added "${rec.name}" to cart! 🛒`);
                          }}
                          style={styles.addBtn}
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 0' }}>
              <div style={styles.aiAvatar}><Bot size={14} color="#FF6B35" /></div>
              <div style={styles.typingBubble}>
                <span className="loading-dot" />
                <span className="loading-dot" />
                <span className="loading-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={styles.inputBar}>
          <input
            type="text"
            placeholder={isRTL ? 'اپنی خواہش لکھیں… (مثلاً: پزا، برگر، بریانی)' : 'Ask AI for food suggestions, diet preferences, or cravings…'}
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            style={styles.chatInput}
          />
          <button onClick={() => handleSendMessage()} style={styles.sendBtn}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(11, 15, 25, 0.75)',
    backdropFilter: 'blur(12px)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  },
  modal: {
    width: '100%',
    maxWidth: '680px',
    height: '620px',
    background: '#FFFFFF',
    borderRadius: '28px',
    boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    border: '1.5px solid #F1F5F9',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.1rem 1.5rem',
    borderBottom: '1.5px solid #F1F5F9',
    background: '#FAFAFA',
  },
  aiBadgeIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(255,107,53,0.35)',
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 800,
    color: '#0F172A',
    fontFamily: 'var(--font-heading)',
  },
  aiPill: {
    fontSize: '0.62rem',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
    color: '#FFFFFF',
    padding: '2px 6px',
    borderRadius: '4px',
    letterSpacing: '0.06em',
  },
  subtitle: {
    margin: '2px 0 0',
    fontSize: '0.76rem',
    color: '#64748B',
    fontWeight: 600,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
  },
  suggestionChips: {
    display: 'flex',
    gap: '6px',
    padding: '0.6rem 1.25rem',
    background: '#F1F5F9',
    overflowX: 'auto',
  },
  chipBtn: {
    padding: '0.4rem 0.8rem',
    borderRadius: '50px',
    background: '#FFFFFF',
    border: '1px solid #CBD5E1',
    color: '#334155',
    fontSize: '0.76rem',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  },
  chatBody: {
    flex: 1,
    padding: '1.25rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  msgRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
  },
  aiAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#FFF7F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #FFE0D1',
    flexShrink: 0,
    marginTop: '4px',
  },
  msgBubble: {
    maxWidth: '85%',
    padding: '0.9rem 1.1rem',
    fontSize: '0.9rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  },
  recsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    marginTop: '0.85rem',
  },
  recCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '14px',
    padding: '0.6rem 0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
  },
  recImg: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    objectFit: 'cover',
  },
  recTag: {
    fontSize: '0.65rem',
    fontWeight: 800,
    color: '#FF6B35',
  },
  recName: {
    fontSize: '0.85rem',
    fontWeight: 800,
    color: '#0F172A',
  },
  recPrice: {
    fontSize: '0.78rem',
    color: '#64748B',
    fontWeight: 700,
  },
  addBtn: {
    padding: '0.4rem 0.8rem',
    background: '#FFF7F0',
    color: '#FF6B35',
    border: '1px solid #FFE0D1',
    borderRadius: '10px',
    fontWeight: 800,
    fontSize: '0.78rem',
    cursor: 'pointer',
  },
  typingBubble: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '14px',
    padding: '0.6rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  inputBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '1rem 1.25rem',
    background: '#FAFAFA',
    borderTop: '1.5px solid #F1F5F9',
  },
  chatInput: {
    flex: 1,
    padding: '0.8rem 1rem',
    borderRadius: '14px',
    border: '1.5px solid #E2E8F0',
    outline: 'none',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    color: '#0F172A',
    background: '#FFFFFF',
  },
  sendBtn: {
    padding: '0.8rem 1.1rem',
    background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '14px',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(255,107,53,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};
