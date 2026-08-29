import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/Public/HomePage';
import ProfilePage from './pages/Public/ProfilePage';
import LoginPage from './pages/Auth/LoginPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminLinks from './pages/Admin/AdminLinks';
import AdminCategories from './pages/Admin/AdminCategories';
import Settings from './pages/Admin/Settings';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
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
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="links" element={<AdminLinks />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
