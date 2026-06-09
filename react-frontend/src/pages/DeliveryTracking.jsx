import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const DeliveryTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  
  // Stages of delivery
  const baseStages = [
    { id: 'Pending', label: 'Order Placed', icon: '📝' },
    { id: 'Preparing', label: 'Preparing', icon: '🍳' },
    { id: 'Picked Up', label: 'Out for Delivery', icon: '🛵' },
    { id: 'Delivered', label: 'Delivered', icon: '✅' },
  ];

  useEffect(() => {
    fetchOrder();

    const channel = supabase
      .channel(`tracking-${orderId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, (payload) => {
        setOrder(prev => ({ ...prev, ...payload.new }));
        toast.success(`Order status updated to: ${payload.new.status}`);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`*, restaurants(name)`)
        .eq('id', orderId)
        .single();
        
      if (error) throw error;
      setOrder(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
        
      if (error) throw error;
    } catch (err) {
      console.error(err);
      toast.error('Failed to update order status');
    }
  };

  const getStageIndex = (status) => {
    if (status === 'Pending') return 0;
    if (status === 'Preparing') return 1;
    if (status === 'Picked Up') return 2;
    if (status === 'Delivered') return 3;
    return 0;
  };

  const currentStageIndex = order ? getStageIndex(order.status) : 0;
  const isCancelled = order?.status === 'Cancelled';
  
  // Generate dynamic stages with completed status
  const stages = baseStages.map((stage, idx) => ({
    ...stage,
    completed: idx <= currentStageIndex && !isCancelled
  }));

  const currentStage = isCancelled 
    ? { label: 'Cancelled', icon: '❌' }
    : stages[currentStageIndex];

  // Animate progress bar
  useEffect(() => {
    if (isCancelled) {
      setProgress(100);
    } else {
      setTimeout(() => {
        setProgress((currentStageIndex / (stages.length - 1)) * 100);
      }, 300);
    }
  }, [currentStageIndex, stages.length, isCancelled]);

  if (loading) return <div style={ui.container}><div style={{padding: '3rem 2rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)'}}>Loading tracking info...</div></div>;
  if (!order) return <div style={ui.container}><div style={{padding: '3rem 2rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)'}}>Order not found.</div></div>;

  return (
    <div style={ui.container}>
      <style>{keyframes}</style>
      
      {/* Header */}
      <header style={ui.header}>
        <button style={ui.backBtn} onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 style={ui.headerTitle}>Track Your Order</h1>
        <div style={{ width: 40 }}></div>
      </header>

      <main style={ui.main}>
        {/* Map / Hero Graphic Area */}
        <div style={ui.mapSection}>
          <div style={ui.mapOverlay}>
            {!isCancelled && order.status !== 'Delivered' && (
              <div style={ui.pulseMarker}>
                <div style={ui.pulseRing}></div>
                <div style={ui.pulseDot}>{currentStage.icon}</div>
              </div>
            )}
            <svg style={ui.routePath} viewBox="0 0 200 100">
              <path d="M20,80 Q50,20 100,50 T180,20" fill="none" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="4" strokeDasharray="8 8" />
            </svg>
          </div>
          
          {/* Estimated Time Card (Floating) */}
          {!isCancelled && order.status !== 'Delivered' && (
            <div style={ui.etaCard} className="glass-panel">
              <p style={ui.etaLabel}>Estimated Delivery</p>
              <h2 style={ui.etaTime}>
                {new Date(Date.now() + 20 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </h2>
              <p style={ui.etaRange}>Arriving in 15 - 20 mins</p>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div style={ui.detailsSection}>
          
          {/* Order Status & ID */}
          <div style={ui.statusHeader}>
            <div>
              <h2 style={{...ui.statusTitle, color: isCancelled ? 'var(--danger)' : 'var(--text-main)'}}>
                {currentStage.label}
              </h2>
              <p style={ui.orderId}>Order ID: #{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            {!isCancelled && order.status !== 'Delivered' && (
              <div style={ui.liveBadge} className="animate-pulse-glow">
                <div style={ui.liveDot}></div>
                Live Status
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div style={ui.progressContainer}>
            <div style={ui.progressBarBg}>
              <div style={{ 
                ...ui.progressBarFill, 
                width: `${progress}%`,
                background: isCancelled ? 'var(--danger)' : 'linear-gradient(90deg, var(--primary) 0%, var(--primary-dark) 100%)' 
              }}></div>
            </div>
            <div style={ui.stagesWrapper}>
              {stages.map((stage, idx) => (
                <div key={stage.id} style={ui.stageIndicator}>
                  <div style={{
                    ...ui.stageDot,
                    background: isCancelled ? 'var(--danger-bg)' : stage.completed ? 'var(--primary)' : '#F3F4F6',
                    color: isCancelled ? 'var(--danger)' : stage.completed ? 'white' : 'var(--text-muted)',
                    border: stage.completed || isCancelled ? 'none' : '2.5px solid var(--border-strong)',
                    transform: idx === currentStageIndex && !isCancelled ? 'scale(1.2)' : 'scale(1)',
                    boxShadow: idx === currentStageIndex && !isCancelled ? '0 0 0 6px var(--primary-glow)' : 'none'
                  }}>
                    {isCancelled ? '❌' : idx === currentStageIndex ? stage.icon : (stage.completed ? '✓' : idx + 1)}
                  </div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: stage.completed ? '800' : '600', 
                    color: stage.completed ? 'var(--text-main)' : 'var(--text-muted)', 
                    marginTop: '0.4rem' 
                  }}>{stage.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rider Info Card */}
          {!isCancelled && (
            <div style={ui.riderCard}>
              <div style={ui.riderInfo}>
                <div style={ui.riderAvatar}>
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80" alt="Rider" style={ui.riderImg} />
                  <div style={ui.riderRating}>★ 4.9</div>
                </div>
                <div>
                  <h3 style={ui.riderName}>Alex Johnson</h3>
                  <p style={ui.riderVehicle}>Honda CG 125 • ABC-1234</p>
                </div>
              </div>
              <div style={ui.riderActions}>
                <button style={ui.actionBtn} onClick={() => toast.success("Calling rider...")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </button>
                <button style={{ ...ui.actionBtn, background: 'var(--primary)' }} onClick={() => toast.success("Messaging rider...")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </button>
              </div>
            </div>
          )}

          {/* Delivery Details */}
          <div style={ui.deliveryDetails}>
            <div style={ui.detailRow}>
              <div style={ui.detailIcon}>🏠</div>
              <div style={ui.detailText}>
                <span style={ui.detailLabel}>Delivery Address</span>
                <span style={ui.detailValue}>{order.delivery_address || 'Address not provided'}</span>
              </div>
            </div>
            <div style={ui.detailDivider}></div>
            <div style={ui.detailRow}>
              <div style={ui.detailIcon}>🍽️</div>
              <div style={ui.detailText}>
                <span style={ui.detailLabel}>Restaurant</span>
                <span style={ui.detailValue}>{order.restaurants?.name || 'Restaurant'}</span>
              </div>
            </div>
          </div>
          
          {/* Status Update Simulator / Admin Testing Controls */}
          <div style={ui.simulatorSection}>
            <h4 style={ui.simulatorTitle}>Test Status Updates (Simulate Delivery Flow)</h4>
            <div style={ui.simulatorButtons}>
              <button 
                onClick={() => updateOrderStatus('Preparing')}
                style={{ ...ui.simBtn, background: 'var(--info)' }}
              >
                🍳 Preparing
              </button>
              <button 
                onClick={() => updateOrderStatus('Picked Up')}
                style={{ ...ui.simBtn, background: 'var(--purple)' }}
              >
                🛵 Out for Delivery
              </button>
              <button 
                onClick={() => updateOrderStatus('Delivered')}
                style={{ ...ui.simBtn, background: 'var(--success)' }}
              >
                ✅ Delivered
              </button>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

/* ─── Styles ──────────────────────────────────────────────── */
const ui = {
  container: {
    fontFamily: "var(--font-body)",
    minHeight: '100vh',
    background: 'var(--background)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.2rem 1.5rem',
    zIndex: 10,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)',
    color: 'white'
  },
  backBtn: {
    background: 'rgba(255,255,255,0.18)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: 'var(--radius-md)',
    width: 38, height: 38,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.25s',
  },
  headerTitle: {
    fontFamily: "var(--font-heading)",
    fontSize: '1.25rem',
    fontWeight: '900',
    margin: 0,
    letterSpacing: '-0.02em',
    textShadow: '0 2px 10px rgba(0,0,0,0.3)'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  mapSection: {
    height: '42vh',
    minHeight: '340px',
    background: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80") center/cover no-repeat',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: '3.5rem'
  },
  mapOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(135deg, rgba(28, 28, 46, 0.72) 0%, rgba(28, 28, 46, 0.88) 100%)',
    overflow: 'hidden'
  },
  routePath: {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    height: '100%',
    opacity: 0.65
  },
  pulseMarker: {
    position: 'absolute',
    top: '40%',
    left: '60%',
    transform: 'translate(-50%, -50%)',
    zIndex: 5,
  },
  pulseRing: {
    width: 60, height: 60,
    background: 'var(--primary-glow)',
    borderRadius: '50%',
    position: 'absolute',
    top: -15, left: -15,
  },
  pulseDot: {
    width: 32, height: 32,
    background: 'var(--primary)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: 'var(--shadow-primary)',
    fontSize: '16px'
  },
  etaCard: {
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(20px)',
    padding: '1.25rem 2.2rem',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 10,
    textAlign: 'center',
    transform: 'translateY(2.2rem)',
    border: '1px solid var(--border)',
  },
  etaLabel: {
    fontFamily: "var(--font-heading)",
    margin: '0 0 0.2rem 0',
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
  },
  etaTime: {
    fontFamily: "var(--font-heading)",
    margin: 0,
    fontSize: '2.4rem',
    fontWeight: '900',
    color: 'var(--text-main)',
    letterSpacing: '-0.02em',
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: '0.3rem'
  },
  etaRange: {
    margin: '0.2rem 0 0 0',
    color: 'var(--primary)',
    fontWeight: '800',
    fontSize: '0.88rem'
  },
  detailsSection: {
    flex: 1,
    background: 'var(--surface-solid)',
    borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0',
    padding: '3rem 1.8rem 2.5rem',
    position: 'relative',
    boxShadow: 'var(--shadow-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.8rem',
    maxWidth: '780px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
    borderLeft: '1px solid var(--border-light)',
    borderRight: '1px solid var(--border-light)'
  },
  statusHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusTitle: {
    fontFamily: "var(--font-heading)",
    fontSize: '1.5rem',
    fontWeight: '900',
    color: 'var(--text-main)',
    margin: '0 0 0.25rem 0',
    letterSpacing: '-0.02em'
  },
  orderId: {
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
    margin: 0,
    fontWeight: '600',
    fontFamily: 'monospace'
  },
  liveBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--danger-bg)',
    color: 'var(--primary)',
    padding: '6px 12px',
    borderRadius: '20px',
    fontWeight: '800',
    fontSize: '0.82rem',
    border: '1px solid rgba(226, 55, 68, 0.15)'
  },
  liveDot: {
    width: 8, height: 8,
    borderRadius: '50%',
    background: 'var(--primary)',
  },
  progressContainer: {
    position: 'relative',
    padding: '0.8rem 0',
    marginBottom: '0.2rem'
  },
  progressBarBg: {
    position: 'absolute',
    top: '22px',
    left: '8%',
    right: '8%',
    height: '4px',
    background: 'var(--border)',
    borderRadius: '2px',
    zIndex: 1
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
    position: 'relative'
  },
  stagesWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 2
  },
  stageIndicator: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'var(--surface-solid)',
    padding: '0 6px'
  },
  stageDot: {
    width: 28, height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '800',
    transition: 'all 0.4s ease',
  },
  riderCard: {
    background: 'var(--background)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: '1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: 'var(--shadow-xs)'
  },
  riderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  riderAvatar: {
    position: 'relative',
    width: 56, height: 56
  },
  riderImg: {
    width: '100%', height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2.5px solid var(--surface-solid)',
    boxShadow: 'var(--shadow-sm)'
  },
  riderRating: {
    position: 'absolute',
    bottom: -6, left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--surface-solid)',
    padding: '2px 7px',
    borderRadius: '10px',
    fontSize: '0.72rem',
    fontWeight: '800',
    boxShadow: 'var(--shadow-sm)',
    whiteSpace: 'nowrap',
    color: 'var(--text-main)',
    border: '1px solid var(--border-light)'
  },
  riderName: {
    fontFamily: "var(--font-heading)",
    margin: '0 0 0.2rem 0',
    fontSize: '1.1rem',
    fontWeight: '800',
    color: 'var(--text-main)'
  },
  riderVehicle: {
    margin: 0,
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: '600'
  },
  riderActions: {
    display: 'flex',
    gap: '0.75rem'
  },
  actionBtn: {
    width: 42, height: 42,
    borderRadius: '50%',
    border: 'none',
    background: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-xs)'
  },
  deliveryDetails: {
    background: 'var(--surface-solid)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-xs)'
  },
  detailRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem'
  },
  detailIcon: {
    background: 'var(--background)',
    width: 40, height: 40,
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-light)'
  },
  detailText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    flex: 1
  },
  detailLabel: {
    fontFamily: "var(--font-heading)",
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  detailValue: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    lineHeight: '1.45'
  },
  detailDivider: {
    height: '1px',
    background: 'var(--border-light)',
    margin: '1.1rem 0 1.1rem 3.5rem'
  },
  simulatorSection: {
    marginTop: '0.8rem',
    padding: '1.5rem',
    background: 'var(--background)',
    borderRadius: 'var(--radius-xl)',
    border: '2px dashed var(--border-strong)'
  },
  simulatorTitle: {
    fontFamily: "var(--font-heading)",
    margin: '0 0 1rem 0',
    color: 'var(--text-secondary)',
    fontSize: '0.82rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
  },
  simulatorButtons: {
    display: 'flex',
    gap: '0.8rem',
    flexWrap: 'wrap'
  },
  simBtn: {
    fontFamily: "var(--font-heading)",
    padding: '0.8rem 1.4rem',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.92rem',
    flex: '1 1 auto',
    minWidth: '120px',
  }
};

const keyframes = `
@keyframes pulse {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.8); opacity: 0; }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
@keyframes float {
  0%, 100% { transform: translateY(2.2rem); }
  50% { transform: translateY(1.7rem); }
}
`;

export default DeliveryTracking;
