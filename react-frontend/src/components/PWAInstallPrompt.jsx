import React, { useState, useEffect } from 'react';

/**
 * PWAInstallPrompt
 * Shows a stylish bottom-sheet banner on mobile when the browser
 * fires the `beforeinstallprompt` event, letting users add FoodDash
 * to their home screen with one tap.
 */
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem('pwa-prompt-dismissed')) return;

    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Small delay so it doesn't pop up immediately on page load
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    sessionStorage.setItem('pwa-prompt-dismissed', '1');
  };

  if (isInstalled || dismissed || !showBanner) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.banner}>
        {/* Drag indicator */}
        <div style={styles.dragBar} />

        <div style={styles.content}>
          {/* App icon */}
          <img src="/icon-192.png" alt="FoodDash" style={styles.icon} />

          {/* Text */}
          <div style={styles.textBlock}>
            <h3 style={styles.title}>Add FoodDash to Home Screen</h3>
            <p style={styles.subtitle}>
              Get the full app experience — faster, offline-ready, and no browser bar!
            </p>
          </div>
        </div>

        {/* Badges */}
        <div style={styles.badges}>
          <span style={styles.badge}>⚡ Instant load</span>
          <span style={styles.badge}>🔔 Push notifications</span>
          <span style={styles.badge}>📡 Works offline</span>
        </div>

        {/* Buttons */}
        <div style={styles.actions}>
          <button style={styles.dismissBtn} onClick={handleDismiss}>
            Not now
          </button>
          <button style={styles.installBtn} onClick={handleInstall}>
            📲 Install App
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
    padding: '1rem',
    paddingBottom: 'env(safe-area-inset-bottom, 1rem)',
    animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  banner: {
    background: 'var(--surface)',
    borderRadius: '24px 24px 16px 16px',
    padding: '1.25rem 1.5rem 1.5rem',
    width: '100%',
    maxWidth: '480px',
    boxShadow: 'var(--shadow-xl)',
    border: '1px solid var(--border)',
  },
  dragBar: {
    width: '40px',
    height: '4px',
    background: 'var(--border)',
    borderRadius: '2px',
    margin: '0 auto 1.25rem',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  icon: {
    width: '60px',
    height: '60px',
    borderRadius: '14px',
    boxShadow: '0 4px 12px rgba(226, 55, 68, 0.3)',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    margin: '0 0 0.3rem',
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    fontFamily: 'var(--font-heading)',
  },
  subtitle: {
    margin: 0,
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  badges: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginBottom: '1.25rem',
  },
  badge: {
    background: 'var(--background)',
    color: 'var(--text-muted)',
    fontSize: '0.72rem',
    fontWeight: '600',
    padding: '0.25rem 0.6rem',
    borderRadius: '20px',
    border: '1px solid var(--border)',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
  },
  dismissBtn: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    background: 'var(--background)',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  installBtn: {
    flex: 2,
    padding: '0.75rem',
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
    color: 'var(--text-on-primary)',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'var(--font-heading)',
    boxShadow: '0 4px 12px rgba(226, 55, 68, 0.35)',
  },
};
