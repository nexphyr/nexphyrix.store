import { Settings as SettingsIcon, ShieldCheck, Clock, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { storage } from '../../services/storage';

const Settings = () => {
  const { user } = useAuth();
  const [expiryMinutes, setExpiryMinutes] = useState<number>(15);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    storage.getOrderExpiryMinutes().then(setExpiryMinutes);
  }, []);

  const handleSaveExpiry = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await storage.updateOrderExpiryMinutes(expiryMinutes);
      setMessage({ type: 'success', text: 'Berhasil menyimpan pengaturan waktu pemesanan.' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Gagal menyimpan pengaturan.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6" />
          Settings
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden max-w-2xl p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
          <ShieldCheck className="w-5 h-5 text-primary" />
          Kredensial Admin (Supabase)
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          Aplikasi ini sekarang menggunakan otentikasi Supabase untuk mengamankan data Anda. 
          Manajemen kredensial, pemulihan sandi, dan pengelolaan pengguna sekarang diatur terpusat di dashboard Supabase Anda.
        </p>

        <div className="space-y-4 max-w-md bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div>
            <label className="label text-gray-500">Email Admin Terdaftar</label>
            <div className="font-semibold text-gray-800 text-lg">
              {user?.email || 'Memuat...'}
            </div>
          </div>
          <div className="pt-2 text-sm text-gray-500 border-t border-gray-200">
            * Untuk mengubah sandi atau menambah pengguna admin lain, silakan akses panel <strong>Authentication</strong> di dalam Dashboard Supabase Anda.
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden max-w-2xl p-6 mt-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
          <Clock className="w-5 h-5 text-primary" />
          Pengaturan Waktu Pesanan
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          Atur durasi waktu maksimum bagi pelanggan untuk menyelesaikan pembayaran sebelum pesanan dibatalkan otomatis.
        </p>

        <div className="space-y-4 max-w-md bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div>
            <label className="label text-gray-700 font-bold mb-2">Durasi Kedaluwarsa Pesanan (Menit)</label>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                min="1"
                className="input max-w-[150px] bg-white border-gray-300 font-bold text-lg"
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(parseInt(e.target.value) || 15)}
              />
              <span className="text-gray-500 font-medium">Menit</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Default: 15 menit. Waktu akan berjalan saat pelanggan melakukan checkout.
            </p>
          </div>
          
          {message && (
            <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}
          
          <div className="pt-4 border-t border-gray-200">
            <button 
              onClick={handleSaveExpiry}
              disabled={isSaving}
              className="btn btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
