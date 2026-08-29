import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { storage } from '../../services/storage';
import { Package, Clock, CheckCircle2, ShoppingBag, ShieldCheck, Users, Activity, Eye, X, Home } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { formatRupiah } from '../../lib/checkout';
import profileImage from '../../assets/profile.png';
import logoImage from '../../assets/nexphyrix.png';

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
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  product_title: string;
  unit_price: number;
  quantity: number;
}

interface Profile {
  id: string;
  email: string;
  role: string;
  full_name: string;
  phone_number?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  gender?: string;
  birth_date?: string;
  bio?: string;
  created_at: string;
}

const ProfilePage = () => {
  const { user, loading: authLoading, onlineUsers } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal State
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    full_name: '',
    phone_number: '',
    address: '',
    latitude: 0,
    longitude: 0,
    gender: '',
    birth_date: '',
    bio: ''
  });

  // Tab state for Admin
  const [activeTab, setActiveTab] = useState<'pesanan' | 'member'>('pesanan');

  // Member links modal state
  const [selectedOrderLinks, setSelectedOrderLinks] = useState<{product_title: string, urls: string}[] | null>(null);
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
  const [loadingLinks, setLoadingLinks] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        fetchAllAdminData();
      } else {
        fetchUserData();
      }
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [ordersRes, profileRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .single()
      ]);

      if (!ordersRes.error && ordersRes.data) setOrders(ordersRes.data);
      if (!profileRes.error && profileRes.data) setUserProfile(profileRes.data);
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
        .select('*, order_items(*)')
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

  const handleViewLinks = async (orderId: string) => {
    setLoadingLinks(true);
    setIsLinksModalOpen(true);
    try {
      const data = await storage.getPurchasedLinks(orderId);
      setSelectedOrderLinks(data);
    } catch (err: any) {
      alert(err.message || 'Gagal mengambil link');
      setIsLinksModalOpen(false);
    } finally {
      setLoadingLinks(false);
    }
  };

  const handleOpenEditProfile = () => {
    if (userProfile) {
      setEditProfileForm({
        full_name: userProfile.full_name || '',
        phone_number: userProfile.phone_number || '',
        address: userProfile.address || '',
        latitude: userProfile.latitude || 0,
        longitude: userProfile.longitude || 0,
        gender: userProfile.gender || '',
        birth_date: userProfile.birth_date || '',
        bio: userProfile.bio || ''
      });
    }
    setIsEditProfileModalOpen(true);
  };

  const getLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung di browser ini.");
      setIsLocating(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      setEditProfileForm(prev => ({ ...prev, latitude: lat, longitude: lon }));
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await res.json();
        if (data && data.display_name) {
          setEditProfileForm(prev => ({ ...prev, address: data.display_name }));
        }
      } catch (error) {
        console.error("Gagal reverse geocode:", error);
      } finally {
        setIsLocating(false);
      }
    }, () => {
      alert("Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.");
      setIsLocating(false);
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingProfile(true);
    try {
      const payload: any = { ...editProfileForm };
      if (!payload.birth_date) {
        payload.birth_date = null;
      }

      const res = await storage.updateProfile(user.id, payload);
      if (res.error) throw res.error;
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...payload } : null);
      setIsEditProfileModalOpen(false);
    } catch (err: any) {
      alert("Gagal menyimpan profil: " + err.message);
    } finally {
      setIsSavingProfile(false);
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
          
          {/* Top Navbar */}
          <div className="absolute top-0 left-0 right-0 p-4 md:p-6 z-50 flex items-center justify-between w-full">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={logoImage} alt="Nexphyrix Logo" className="h-12 md:h-16 object-contain" />
            </Link>
            <Link to="/" className="flex items-center gap-3 text-white/90 hover:text-white group transition-all">
              <div className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center group-hover:-translate-x-1 transition-all group-hover:bg-white/20 shadow-inner border border-white/10 group-hover:border-white/30 backdrop-blur-sm">
                <Home className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm tracking-wide hidden sm:inline-block">Beranda</span>
            </Link>
          </div>

          <div className="max-w-5xl mx-auto relative z-10 pt-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <img src={profileImage} alt="Super Admin" className="w-24 h-24 rounded-full border-4 border-white/20 shadow-xl bg-white" />
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
                            <div className="text-xs text-gray-500 mt-1 max-w-[200px]">
                              {order.order_items?.map((item, idx) => (
                                <div key={idx} className="truncate" title={item.product_title}>
                                  {item.quantity}x {item.product_title}
                                </div>
                              ))}
                            </div>
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
                      <th className="px-6 py-4">Info Tambahan</th>
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
                          <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                            <p className="font-bold">{profile.full_name || '-'}</p>
                            {profile.gender && <p className="text-xs text-gray-500">Gender: {profile.gender}</p>}
                            {profile.birth_date && <p className="text-xs text-gray-500">TTL: {new Date(profile.birth_date).toLocaleDateString('id-ID')}</p>}
                          </td>
                          <td className="px-6 py-4 text-gray-700 min-w-[250px] max-w-[350px] whitespace-normal">
                            {profile.phone_number && <p className="text-xs mb-1"><span className="font-bold text-gray-900">HP:</span> {profile.phone_number}</p>}
                            {profile.address && <p className="text-xs mb-1 text-gray-600 line-clamp-2" title={profile.address}><span className="font-bold text-gray-900">Alamat:</span> {profile.address}</p>}
                            {profile.latitude !== undefined && profile.latitude !== 0 && (
                              <p className="text-[10px] text-gray-400 mb-1">Maps: {profile.latitude}, {profile.longitude}</p>
                            )}
                            {profile.bio && <p className="text-xs italic text-gray-500 mt-1 line-clamp-2" title={profile.bio}>"{profile.bio}"</p>}
                            {!profile.phone_number && !profile.address && !profile.bio && <span className="text-gray-400 text-xs italic">Belum melengkapi profil</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {profile.role === 'admin' ? (
                              <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Admin</span>
                            ) : (
                              <span className="bg-yellow-100 text-yellow-800 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Member</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
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

        {/* Top Navbar */}
        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 z-50 flex items-center justify-between w-full">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logoImage} alt="Nexphyrix Logo" className="h-12 md:h-16 object-contain" />
          </Link>
          <Link to="/" className="flex items-center gap-3 text-white/90 hover:text-white group transition-all">
            <div className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center group-hover:-translate-x-1 transition-all group-hover:bg-white/20 shadow-inner border border-white/10 group-hover:border-white/30 backdrop-blur-sm">
              <Home className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm tracking-wide hidden sm:inline-block">Beranda</span>
          </Link>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10 pt-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-24 h-24 rounded-full border-4 border-white/20 shadow-xl" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border-4 border-white/20 shadow-xl">
                <span className="text-4xl font-bold">{user.email.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-extrabold mb-1">{userProfile?.full_name || user.full_name || 'Member'}</h1>
              <p className="text-blue-200">{user.email}</p>
              
              <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start items-center">
                <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider shadow-sm">
                  MEMBER
                </span>
                <button 
                  onClick={handleOpenEditProfile}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg transition-colors border border-white/30"
                >
                  Edit Profil
                </button>
              </div>
              
              {userProfile?.bio && (
                <p className="mt-4 text-sm text-blue-100 max-w-lg italic">"{userProfile.bio}"</p>
              )}
              
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-blue-100">
                {userProfile?.phone_number && (
                  <div className="flex items-center gap-2">
                    <span className="opacity-70">📱</span> {userProfile.phone_number}
                  </div>
                )}
                {userProfile?.address && (
                  <div className="flex items-center gap-2">
                    <span className="opacity-70">📍</span> {userProfile.address}
                  </div>
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
                      <div className="w-full sm:w-auto flex-1">
                        <div className="mb-3 space-y-1">
                          {order.order_items?.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-gray-700 text-xs sm:text-sm">
                              <span className="truncate pr-4 flex-1">{item.quantity}x {item.product_title}</span>
                              <span className="font-medium whitespace-nowrap">{formatRupiah(item.unit_price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-gray-500 mb-1 flex justify-between">
                            <span>Subtotal:</span>
                            <span className="text-gray-900 font-medium">{formatRupiah(order.subtotal_amount)}</span>
                          </p>
                          {order.discount_amount > 0 && (
                            <p className="text-green-600 font-medium flex justify-between">
                              <span>Diskon Member:</span>
                              <span>-{formatRupiah(order.discount_amount)}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start pt-3 sm:pt-0 border-t sm:border-0 border-gray-200 sm:border-l sm:pl-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 whitespace-nowrap">Checkout via</span>
                          <span className="font-bold text-gray-700 capitalize px-3 py-1 bg-white rounded-md shadow-sm border border-gray-200">
                            {order.checkout_method}
                          </span>
                        </div>
                        {order.status === 'completed' && (
                          <button 
                            onClick={() => handleViewLinks(order.id)}
                            className="w-full sm:w-auto px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                          >
                            <Package className="w-4 h-4" /> Lihat Link Game
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Purchased Links Modal */}
      {isLinksModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-green-50">
              <h2 className="text-lg font-extrabold text-green-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" /> Link Download Tersedia
              </h2>
              <button onClick={() => { setIsLinksModalOpen(false); setSelectedOrderLinks(null); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {loadingLinks ? (
                <div className="text-center py-12 text-gray-400 animate-pulse">
                  Memuat link pesanan Anda...
                </div>
              ) : selectedOrderLinks && selectedOrderLinks.length > 0 ? (
                <div className="space-y-6">
                  {selectedOrderLinks.map((item, idx) => {
                    let parsedUrls: string[] = [];
                    try {
                      parsedUrls = JSON.parse(item.urls);
                    } catch (e) {
                      if (item.urls) parsedUrls = [item.urls];
                    }

                    return (
                      <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">{item.product_title}</h3>
                        {parsedUrls.length > 0 ? (
                          <div className="space-y-2">
                            {parsedUrls.map((url, i) => (
                              <div key={i} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between bg-white p-3 border border-gray-100 rounded-lg shadow-sm">
                                <span className="text-sm font-medium text-gray-600 break-all line-clamp-1">{url}</span>
                                <div className="flex gap-2 w-full sm:w-auto">
                                  <a href={url} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none text-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap">
                                    Buka Link
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">Link belum tersedia untuk produk ini.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Tidak ada link yang ditemukan untuk pesanan ini.</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
              <button onClick={() => { setIsLinksModalOpen(false); setSelectedOrderLinks(null); }} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Profile Modal */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden my-8 transform transition-all">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                Edit Profil
              </h2>
              <button onClick={() => setIsEditProfileModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={editProfileForm.full_name} 
                  onChange={e => setEditProfileForm({...editProfileForm, full_name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  placeholder="Nama Lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nomor HP</label>
                <input 
                  type="text" 
                  value={editProfileForm.phone_number} 
                  onChange={e => setEditProfileForm({...editProfileForm, phone_number: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  placeholder="08123456789"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Jenis Kelamin</label>
                  <select 
                    value={editProfileForm.gender} 
                    onChange={e => setEditProfileForm({...editProfileForm, gender: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  >
                    <option value="">Pilih</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal Lahir</label>
                  <input 
                    type="date" 
                    value={editProfileForm.birth_date} 
                    onChange={e => setEditProfileForm({...editProfileForm, birth_date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Alamat (Otomatis)</label>
                <div className="flex gap-2">
                  <textarea 
                    value={editProfileForm.address} 
                    onChange={e => setEditProfileForm({...editProfileForm, address: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm h-20"
                    placeholder="Alamat lengkap"
                  />
                  <button 
                    type="button" 
                    onClick={getLocation} 
                    disabled={isLocating}
                    className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold transition-colors whitespace-nowrap self-start"
                  >
                    {isLocating ? 'Mencari...' : '📍 Deteksi Lokasi'}
                  </button>
                </div>
                {editProfileForm.latitude !== 0 && (
                  <p className="text-xs text-gray-400 mt-1">Koordinat: {editProfileForm.latitude}, {editProfileForm.longitude}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Bio</label>
                <textarea 
                  value={editProfileForm.bio} 
                  onChange={e => setEditProfileForm({...editProfileForm, bio: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm h-16"
                  placeholder="Tulis sedikit tentang diri Anda..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)} 
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-sm"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all text-sm disabled:opacity-50"
                >
                  {isSavingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
