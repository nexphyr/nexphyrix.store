import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/Public/HomePage';
import ProfilePage from './pages/Public/ProfilePage';
import LoginPage from './pages/Auth/LoginPage';
import AdminLayout from './components/AdminLayout';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminLinks from './pages/Admin/AdminLinks';
import AdminCategories from './pages/Admin/AdminCategories';
import Settings from './pages/Admin/Settings';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import ThemeToggle from './components/ThemeToggle';

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/profile" />;
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected User Routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/admin/orders" replace />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="links" element={<AdminLinks />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
            <ThemeToggle />
          </Router>
        </CartProvider>
      </ConfirmProvider>
    </AuthProvider>
  );
}

export default App;
