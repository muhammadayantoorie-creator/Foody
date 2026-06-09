import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
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

// Component to handle redirecting already logged-in users away from auth pages
const PublicRoute = ({ children }) => {
  const { user, role, loading } = useAuth();
  
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🍕</div>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Loading FoodDash…</p>
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

        {/* Admin route - STRICTLY protected, only Admin role */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Rider route - STRICTLY protected, only Delivery Rider role */}
        <Route path="/rider" element={
          <ProtectedRoute allowedRoles={['Delivery Rider']}>
            <RiderDashboard />
          </ProtectedRoute>
        } />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Toaster position="top-right" />
          <CartSidebar />
          <AppRoutes />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
