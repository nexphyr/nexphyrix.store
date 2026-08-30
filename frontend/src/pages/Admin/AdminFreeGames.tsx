import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { storage, Link } from '../../services/storage';
import { Package, Search, CheckCircle, XCircle } from 'lucide-react';

const AdminFreeGames = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('title', { ascending: true });
        
      if (error) throw error;
      setLinks(data || []);
    } catch (err) {
      console.error('Error fetching links:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setUpdating(id);
    try {
      await storage.toggleFreeClaim(id, !currentStatus);
      setLinks(links.map(link => link.id === id ? { ...link, is_free_claim: !currentStatus } : link));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const filteredLinks = links.filter(link => 
    link.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" />
          Game Gratisan (Klaim)
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Pilih game mana saja yang tersedia untuk diklaim secara gratis oleh pengguna melalui tiket referral.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50 dark:bg-gray-800/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama game..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-primary dark:text-white"
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Total Game Aktif: {links.filter(l => l.is_free_claim).length}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Memuat data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Game</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status Gratis</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredLinks.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada game ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredLinks.map((link) => (
                    <tr key={link.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-white">{link.title}</div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">{link.description}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {link.is_free_claim ? (
                          <span className="inline-flex items-center justify-center px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded-full gap-1">
                            <CheckCircle className="w-3 h-3" /> Tersedia
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center px-3 py-1 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 text-xs font-bold rounded-full gap-1">
                            <XCircle className="w-3 h-3" /> Tidak Tersedia
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggle(link.id, !!link.is_free_claim)}
                          disabled={updating === link.id}
                          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors shadow-sm ${
                            link.is_free_claim
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50'
                              : 'bg-primary text-white hover:bg-primary/90'
                          } disabled:opacity-50`}
                        >
                          {updating === link.id ? 'Loading...' : link.is_free_claim ? 'Matikan' : 'Jadikan Gratis'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFreeGames;
