import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ShoppingBag, Search, Filter } from 'lucide-react';
import { formatRupiah } from '../../lib/checkout';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_items: number;
  total_amount: number;
  status: string;
  checkout_method: string;
  is_member_order: boolean;
  created_at: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customer_email && order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pesanan</h1>
          <p className="text-gray-500 mt-1">Kelola semua transaksi masuk dari pelanggan.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari ID, nama, atau email..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              className="w-full sm:w-auto bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="processing">Diproses</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">ID Pesanan</th>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Via</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">Memuat data...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    Tidak ada pesanan ditemukan.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{order.order_number}</td>
                    <td className="px-6 py-4">
                      {order.customer_name ? (
                        <div>
                          <p className="font-medium text-gray-900">{order.customer_name}</p>
                          <p className="text-xs text-gray-500">{order.customer_email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Guest</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {order.is_member_order ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-yellow-100 text-yellow-800">
                          Member
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600">
                          Guest
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-gray-900">{formatRupiah(order.total_amount)}</p>
                      <p className="text-xs text-gray-500">{order.total_items} item</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-gray-700 font-medium">{order.checkout_method}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${getStatusColor(order.status)}`}>
                        {order.status === 'pending' ? 'Menunggu' :
                         order.status === 'processing' ? 'Diproses' :
                         order.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select 
                        className="bg-white border border-gray-200 rounded px-2 py-1 text-xs font-medium text-gray-700 focus:outline-none"
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      >
                        <option value="pending">Set Menunggu</option>
                        <option value="processing">Set Diproses</option>
                        <option value="completed">Set Selesai</option>
                        <option value="cancelled">Batalkan</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
