import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Package, Clock, CheckCircle2, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { formatRupiah } from '../../lib/checkout';

interface Order {
  id: string;
  order_number: string;
  total_items: number;
  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
  status: string;
  checkout_method: string;
  created_at: string;
}

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F0F5FA]">Memuat profil...</div>;
  if (!user) return <Navigate to="/" />;

  const totalOrders = orders.length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const totalSavings = orders.reduce((sum, o) => sum + Number(o.discount_amount), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-md">Menunggu</span>;
      case 'processing': return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-md">Diproses</span>;
      case 'completed': return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-md">Selesai</span>;
      case 'cancelled': return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-md">Dibatalkan</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-md">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F5FA] font-sans pb-12">
      {/* Header */}
      <header className="bg-[#00439C] text-white pt-12 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/" className="text-white/80 hover:text-white font-medium text-sm transition-colors">
              &larr; Kembali ke Beranda
            </Link>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-24 h-24 rounded-full border-4 border-white/20 shadow-xl" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border-4 border-white/20 shadow-xl">
                <span className="text-4xl font-bold">{user.email.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-extrabold mb-1">{user.full_name || 'Member'}</h1>
              <p className="text-blue-200">{user.email}</p>
              
              <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider shadow-sm">
                  MEMBER
                </span>
                {user.role === 'admin' && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 -mt-12 relative z-20 space-y-6">
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1 font-medium">
              <ShoppingBag className="w-4 h-4 text-primary" /> Total Pesanan
            </div>
            <div className="text-2xl font-black text-gray-900">{totalOrders}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1 font-medium">
              <Clock className="w-4 h-4 text-blue-500" /> Diproses
            </div>
            <div className="text-2xl font-black text-gray-900">{processingOrders}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1 font-medium">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Selesai
            </div>
            <div className="text-2xl font-black text-gray-900">{completedOrders}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-2xl shadow-sm border border-green-200">
            <div className="flex items-center gap-2 text-green-800 text-sm mb-1 font-medium">
              <Package className="w-4 h-4" /> Total Penghematan
            </div>
            <div className="text-2xl font-black text-green-700">{formatRupiah(totalSavings)}</div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-extrabold text-gray-900">Riwayat Pesanan</h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-400 animate-pulse">Memuat pesanan...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium text-lg">Belum ada pesanan.</p>
                <p className="text-sm mt-1">Mulai belanja untuk menikmati Member Discount!</p>
                <Link to="/" className="inline-block mt-6 btn btn-primary">Belanja Sekarang</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-100 rounded-2xl p-4 md:p-5 hover:border-blue-100 hover:shadow-md transition-all group">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-extrabold text-lg text-gray-900">{order.order_number}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-sm text-gray-500 mb-1">{order.total_items} Produk</p>
                        <p className="font-black text-xl text-primary">{formatRupiah(order.total_amount)}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 text-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border border-gray-100">
                      <div>
                        <p className="text-gray-500 mb-1">Subtotal: <span className="text-gray-900 font-medium">{formatRupiah(order.subtotal_amount)}</span></p>
                        {order.discount_amount > 0 && (
                          <p className="text-green-600 font-medium">Diskon Member: -{formatRupiah(order.discount_amount)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Checkout via</span>
                        <span className="font-bold text-gray-700 capitalize px-3 py-1 bg-white rounded-md shadow-sm border border-gray-200">
                          {order.checkout_method}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default ProfilePage;
