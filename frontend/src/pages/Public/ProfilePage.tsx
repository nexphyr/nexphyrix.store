import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Package, Clock, CheckCircle2, ShoppingBag, ShieldCheck, Users, Activity, Eye } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { formatRupiah } from '../../lib/checkout';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_items: number;
  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
  status: string;
  checkout_method: string;
  is_member_order: boolean;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  role: string;
  full_name: string;
  created_at: string;
}

const ProfilePage = () => {
  const { user, loading: authLoading, onlineUsers } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab state for Admin
  const [activeTab, setActiveTab] = useState<'pesanan' | 'member'>('pesanan');

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        fetchAllAdminData();
      } else {
        fetchUserOrders();
      }
    }
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (!error && data) setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAdminData = async () => {
    try {
      // Fetch all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!ordersError && ordersData) setOrders(ordersData);

      // Fetch all members (profiles)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (!profilesError && profilesData) setAllProfiles(profilesData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        alert('Gagal mengubah status pesanan.');
      } else {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F0F5FA]">Memuat profil...</div>;
  if (!user) return <Navigate to="/" />;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-md">Menunggu</span>;
      case 'processing': return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-md">Diproses</span>;
      case 'completed': return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-md">Selesai</span>;
      case 'cancelled': return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-md">Dibatalkan</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-md">{status}</span>;
    }
  };

  // -------------------------------------------------------------
  // ADMIN VIEW
  // -------------------------------------------------------------
  if (user.role === 'admin') {
    // Process Realtime Data
    const onlineList = Object.values(onlineUsers).flat();
    const onlineGuests = onlineList.filter(u => u.role === 'guest').length;
    const onlineMembers = onlineList.filter(u => u.role !== 'guest');

    const totalOrders = orders.length;
    const processingOrders = orders.filter(o => o.status === 'processing').length;
    const totalMembers = allProfiles.length;

    return (
      <div className="min-h-screen bg-[#F0F5FA] font-sans pb-12">
        <header className="bg-gradient-to-r from-red-700 to-red-900 text-white pt-12 pb-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <Link to="/" className="text-white/80 hover:text-white font-medium text-sm transition-colors">
                &larr; Kembali ke Beranda
              </Link>
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <img src={`${import.meta.env.BASE_URL}profile.png`} alt="Super Admin" className="w-24 h-24 rounded-full border-4 border-white/20 shadow-xl bg-white" />
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-extrabold mb-1">Super Admin Dashboard</h1>
                <p className="text-red-200">{user.email}</p>
                <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> SUPER ADMIN
                  </span>
                  <span className="bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider shadow-sm flex items-center gap-1 animate-pulse">
                    <Activity className="w-3 h-3" /> LIVE MONITORING
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 -mt-12 relative z-20 space-y-6">
          {/* Admin Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute right-0 top-0 opacity-5 group-hover:scale-110 transition-transform"><Users className="w-24 h-24" /></div>
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1 font-medium">Total Member</div>
              <div className="text-3xl font-black text-gray-900">{totalMembers}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute right-0 top-0 opacity-5 group-hover:scale-110 transition-transform"><Eye className="w-24 h-24" /></div>
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1 font-medium">Tamu Online (Guest)</div>
              <div className="text-3xl font-black text-blue-600 flex items-baseline gap-2">
                {onlineGuests} <span className="text-xs font-normal text-gray-400">orang melihat</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute right-0 top-0 opacity-5 group-hover:scale-110 transition-transform"><Activity className="w-24 h-24" /></div>
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1 font-medium">Member Aktif (Online)</div>
              <div className="text-3xl font-black text-green-600">{onlineMembers.length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute right-0 top-0 opacity-5 group-hover:scale-110 transition-transform"><ShoppingBag className="w-24 h-24" /></div>
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1 font-medium">Pesanan Masuk</div>
              <div className="text-3xl font-black text-amber-600 flex items-baseline gap-2">
                {processingOrders} <span className="text-xs font-normal text-gray-400">/ {totalOrders}</span>
              </div>
            </div>
          </div>

          {/* Active Members Detailed List (Only show if > 0) */}
          {onlineMembers.length > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-green-800 font-bold mb-3 flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Member Sedang Online
              </h3>
              <div className="flex flex-wrap gap-2">
                {onlineMembers.map((m, idx) => (
                  <span key={idx} className="bg-white px-3 py-1.5 rounded-lg border border-green-200 text-xs font-medium text-green-900 shadow-sm flex items-center gap-2">
                    {m.full_name || m.email?.split('@')[0]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('pesanan')}
              className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'pesanan' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
            >
              <ShoppingBag className="w-4 h-4" /> Manajemen Pesanan
            </button>
            <button 
              onClick={() => setActiveTab('member')}
              className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'member' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
            >
              <Users className="w-4 h-4" /> Daftar Semua Member
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            
            {activeTab === 'pesanan' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs tracking-wider">
                    <tr>
                      <th className="px-6 py-4">ID Pesanan</th>
                      <th className="px-6 py-4">Pelanggan</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Via</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Memuat data...</td></tr>
                    ) : orders.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Tidak ada pesanan masuk.</td></tr>
                    ) : (
                      orders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-900">{order.order_number}</td>
                          <td className="px-6 py-4">
                            {order.customer_name ? (
                              <div>
                                <p className="font-bold text-gray-900">{order.customer_name}</p>
                                <p className="text-xs text-gray-500">{order.customer_email}</p>
                                {order.is_member_order ? (
                                  <span className="inline-block mt-1 bg-yellow-100 text-yellow-800 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Member</span>
                                ) : (
                                  <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Guest</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Guest (Tidak diketahui)</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-black text-gray-900">{formatRupiah(order.total_amount)}</p>
                            <p className="text-xs text-gray-500">{order.total_items} item</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="capitalize text-gray-700 font-medium px-2 py-1 bg-gray-100 rounded border border-gray-200 text-xs">{order.checkout_method}</span>
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                          <td className="px-6 py-4 text-right">
                            <select 
                              className="bg-white border border-gray-200 rounded px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-primary shadow-sm cursor-pointer"
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            >
                              <option value="pending">⏳ Menunggu</option>
                              <option value="processing">⚙️ Diproses</option>
                              <option value="completed">✅ Selesai</option>
                              <option value="cancelled">❌ Batalkan</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'member' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Email Member</th>
                      <th className="px-6 py-4">Nama Lengkap</th>
                      <th className="px-6 py-4">Tipe Akun</th>
                      <th className="px-6 py-4">Bergabung Pada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Memuat data...</td></tr>
                    ) : allProfiles.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Belum ada member terdaftar.</td></tr>
                    ) : (
                      allProfiles.map(profile => (
                        <tr key={profile.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-900">{profile.email}</td>
                          <td className="px-6 py-4 text-gray-700">{profile.full_name || '-'}</td>
                          <td className="px-6 py-4">
                            {profile.role === 'admin' ? (
                              <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Admin</span>
                            ) : (
                              <span className="bg-yellow-100 text-yellow-800 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Member</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </main>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MEMBER VIEW
  // -------------------------------------------------------------
  const totalOrdersMember = orders.length;
  const processingOrdersMember = orders.filter(o => o.status === 'processing').length;
  const completedOrdersMember = orders.filter(o => o.status === 'completed').length;
  const totalSavingsMember = orders.reduce((sum, o) => sum + Number(o.discount_amount), 0);

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
            <div className="text-2xl font-black text-gray-900">{totalOrdersMember}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1 font-medium">
              <Clock className="w-4 h-4 text-blue-500" /> Diproses
            </div>
            <div className="text-2xl font-black text-gray-900">{processingOrdersMember}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1 font-medium">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Selesai
            </div>
            <div className="text-2xl font-black text-gray-900">{completedOrdersMember}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-2xl shadow-sm border border-green-200">
            <div className="flex items-center gap-2 text-green-800 text-sm mb-1 font-medium">
              <Package className="w-4 h-4" /> Total Penghematan
            </div>
            <div className="text-2xl font-black text-green-700">{formatRupiah(totalSavingsMember)}</div>
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
