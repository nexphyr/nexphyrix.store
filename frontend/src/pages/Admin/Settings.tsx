import { Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Settings = () => {
  const { user } = useAuth();

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
    </div>
  );
};

export default Settings;
