import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Link as LinkIcon, Folder, Settings, LogOut, Menu, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

const AdminLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Pesanan', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Semua Link', href: '/admin/links', icon: LinkIcon },
    { name: 'Kategori', href: '/admin/categories', icon: Folder },
    { name: 'Pengaturan', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-primary border-b border-primary/20 p-4 z-20 flex justify-between items-center shadow-md">
        <span className="font-extrabold text-xl text-white tracking-wide">Admin Panel</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-white/10 text-white rounded hover:bg-white/20 transition-colors">
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-10 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto shadow-xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col pt-16 lg:pt-0">
          <div className="flex items-center justify-center h-20 border-b border-gray-100 hidden lg:flex bg-gradient-to-r from-primary to-accent">
            <span className="text-2xl font-extrabold text-white tracking-wider">Admin Panel</span>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all font-semibold ${
                    isActive ? 'bg-primary text-white shadow-lg shadow-primary/30 transform scale-[1.02]' : 'text-gray-600 hover:bg-secondary hover:text-primary'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t">
            <button
              onClick={() => {
                logout();
                setSidebarOpen(false);
              }}
              className="flex w-full items-center px-4 py-3 text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-colors font-bold"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden pt-16 lg:pt-0">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F0F5FA] p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-0 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
