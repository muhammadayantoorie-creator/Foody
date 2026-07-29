import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { LanguageCurrencyProvider, useLanguageCurrency } from './contexts/LanguageCurrencyContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import RestaurantMenu from './pages/RestaurantMenu';
import Checkout from './pages/Checkout';
import CustomerOrders from './pages/CustomerOrders';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationListener from './components/NotificationListener';
import CartSidebar from './components/CartSidebar';
import OrderDetail from './pages/OrderDetail';
import DeliveryTracking from './pages/DeliveryTracking';
import AdminDashboard from './components/AdminDashboard';
import RiderDashboard from './components/RiderDashboard';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import NotFound from './pages/NotFound';
import DesktopTitlebar from './components/DesktopTitlebar';
import DesktopStatusBar from './components/DesktopStatusBar';
import BrandSplashScreen from './components/BrandSplashScreen';
import CommandPaletteModal from './components/CommandPaletteModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import SettingsModal from './components/SettingsModal';

// Component to handle redirecting already logged-in users away from auth pages
const PublicRoute = ({ children }) => {
  const { user, role, loading } = useAuth();
  
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🍕</div>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Loading FoodDash Enterprise…</p>
      </div>
    </div>
  );
  if (user) {
    if (role === 'Admin') return <Navigate to="/admin" replace />;
    if (role === 'Delivery Rider') return <Navigate to="/rider" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <>
      <NotificationListener />
      <PWAInstallPrompt />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />
        
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/restaurant/:id" element={
          <ProtectedRoute>
            <RestaurantMenu />
          </ProtectedRoute>
        } />

        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />

        <Route path="/my-orders" element={
          <ProtectedRoute>
            <CustomerOrders />
          </ProtectedRoute>
        } />

        <Route path="/order/:orderId" element={
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        } />
        
        <Route path="/track/:orderId" element={
          <ProtectedRoute>
            <DeliveryTracking />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/rider" element={
          <ProtectedRoute allowedRoles={['Delivery Rider']}>
            <RiderDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

// Main Global App Wrapper with Keyboard Shortcuts & Modals
function MainAppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { toggleLanguage, toggleCurrency } = useLanguageCurrency();

  // Desktop Global Hotkeys (Ctrl+K, Ctrl+S, ?, Ctrl+Shift+U, Ctrl+Shift+C)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 's' && !e.shiftKey) {
        e.preventDefault();
        setShowSettings(prev => !prev);
      } else if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        toggleLanguage();
      } else if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        toggleCurrency();
      } else if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleLanguage, toggleCurrency]);

  return (
    <>
      {showSplash && <BrandSplashScreen onComplete={() => setShowSplash(false)} />}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <DesktopTitlebar onOpenSettings={() => setShowSettings(true)} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Router>
            <Toaster position="top-right" />
            <CartSidebar />
            <AppRoutes />
          </Router>
        </div>
        <DesktopStatusBar
          onOpenCommand={() => setShowCommandPalette(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenShortcuts={() => setShowShortcuts(true)}
        />
      </div>

      {/* Global Modals */}
      <CommandPaletteModal
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenShortcuts={() => setShowShortcuts(true)}
      />

      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageCurrencyProvider>
        <CartProvider>
          <MainAppContent />
        </CartProvider>
      </LanguageCurrencyProvider>
    </AuthProvider>
  );
}

export default App;
