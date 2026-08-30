import { useState, useEffect } from 'react';
import { Search, Plus, Copy, Edit2, Trash2, ListPlus, Eye, EyeOff } from 'lucide-react';
import { storage } from '../../services/storage';
import AdminLinkModal from './AdminLinkModal';
import AdminBulkLinkModal from './AdminBulkLinkModal';
import { useConfirm } from '../../contexts/ConfirmContext';
import { supabase } from '../../lib/supabase';

interface Link {
  id: string;
  title: string;
  url?: string;
  urls?: string[];
  status?: string;
  description: string;
  price?: string;
  category: { id: string; name: string; slug: string };
  category_id: string;
  is_referral_reward?: boolean;
  is_active?: boolean;
}

const AdminLinks = () => {
  const { confirm } = useConfirm();
  const [links, setLinks] = useState<Link[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | undefined>(undefined);
  const [fetchError, setFetchError] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchLinks = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const allLinks = await storage.getLinks(true); // admin gets secrets
      const allCats = await storage.getCategories();
      
      let filtered = allLinks;
      if (search) {
        filtered = filtered.filter(l => l.title.toLowerCase().includes(search.toLowerCase()));
      }
      
      const formatted = filtered.map(link => {
        const cat = allCats.find(c => String(c.id) === String(link.category_id));
        return {
          ...link,
          category: { id: cat?.id || '', name: cat?.name || 'Unknown', slug: cat?.slug || '' }
        };
      });
      
      setLinks(formatted);
      setSelectedIds(new Set());
    } catch (err: any) {
      console.error('Error fetching admin links:', err);
      setFetchError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLinks();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const copyToClipboard = (link: Link) => {
    const urlsToCopy = link.urls?.length ? link.urls.join('\n') : (link.url || '');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(urlsToCopy).then(() => {
        showToast(link.urls?.length && link.urls.length > 1 ? `${link.urls.length} URL berhasil disalin!` : 'URL berhasil disalin!');
      });
    } else {
      showToast('Gagal menyalin URL.');
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleToggleActive = async (link: Link) => {
    try {
      const { error } = await supabase
        .from('links')
        .update({ is_active: !link.is_active })
        .eq('id', link.id);
        
      if (error) throw error;
      
      setLinks(links.map(l => l.id === link.id ? { ...l, is_active: !link.is_active } : l));
      setToast(`Link ${!link.is_active ? 'diaktifkan' : 'dinonaktifkan'}.`);
      setTimeout(() => setToast(''), 3000);
    } catch (err: any) {
      alert('Gagal mengubah status: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm('Apakah Anda yakin ingin menghapus link ini?', {
      title: 'Hapus Link',
      type: 'danger',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal'
    });

    if (isConfirmed) {
      try {
        await storage.deleteLink(id);
        showToast('Link berhasil dihapus.');
        fetchLinks();
      } catch (err: any) {
        showToast(`Gagal menghapus: ${err.message}`);
      }
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(links.map(l => l.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) newSet.add(id);
    else newSet.delete(id);
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    const isConfirmed = await confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.size} link terpilih?`, {
      title: 'Hapus Link Masal',
      type: 'danger',
      confirmText: 'Ya, Hapus Semua',
      cancelText: 'Batal'
    });

    if (isConfirmed) {
      try {
        await storage.deleteLinks(Array.from(selectedIds));
        showToast(`${selectedIds.size} link berhasil dihapus.`);
        setSelectedIds(new Set());
        fetchLinks();
      } catch (err: any) {
        showToast(`Gagal menghapus massal: ${err.message}`);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Semua Link</h1>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="btn bg-red-600 hover:bg-red-700 text-white flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus Terpilih ({selectedIds.size})
            </button>
          )}
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="btn btn-secondary flex items-center"
          >
            <ListPlus className="w-4 h-4 mr-2" />
            Tambah Massal
          </button>
          <button 
            onClick={() => { setEditingLink(undefined); setIsModalOpen(true); }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Link
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-6 p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
            placeholder="Cari judul game..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-blue-600 focus:ring-blue-500"
                    onChange={handleSelectAll}
                    checked={links.length > 0 && selectedIds.size === links.length}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Judul</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Harga</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">URL / Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : links.map((link) => (
                <tr key={link.id} className={selectedIds.has(link.id) ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-blue-600 focus:ring-blue-500"
                      checked={selectedIds.has(link.id)}
                      onChange={(e) => handleSelectOne(link.id, e.target.checked)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    <div className="flex flex-col">
                      <span>{link.title}</span>
                      {link.is_referral_reward && (
                        <span className="mt-1 w-fit bg-purple-100 text-purple-800 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Referral Reward
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800">
                      {link.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-semibold">
                    {link.price || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    {link.category.slug === 'gta-v-mod-nusantara' ? (
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{link.status}</span>
                    ) : (
                      link.urls && link.urls.length > 1 
                        ? <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">{link.urls.length} Links</span>
                        : (link.urls?.[0] || link.url)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {link.category.slug !== 'gta-v-mod-nusantara' && (
                      <button onClick={() => copyToClipboard(link)} className="text-blue-600 hover:text-blue-900 mr-3" title="Copy URL">
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleToggleActive(link)}
                      className={`${link.is_active === false ? 'text-gray-400 hover:text-gray-600' : 'text-green-600 hover:text-green-900'} mr-3`} 
                      title={link.is_active === false ? "Aktifkan" : "Nonaktifkan"}
                    >
                      {link.is_active === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => { setEditingLink({ ...link, category_id: link.category?.id }); setIsModalOpen(true); }}
                      className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(link.id)} className="text-red-600 hover:text-red-900" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && !fetchError && links.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Data tidak ditemukan.</td></tr>
              )}
              {!loading && fetchError && (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-red-500 font-bold">Error: {fetchError}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      {isModalOpen && (
        <AdminLinkModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSaved={() => {
            fetchLinks();
            showToast('Data berhasil disimpan.');
          }}
          link={editingLink} 
        />
      )}

      {isBulkModalOpen && (
        <AdminBulkLinkModal 
          isOpen={isBulkModalOpen} 
          onClose={() => setIsBulkModalOpen(false)} 
          onSaved={() => {
            fetchLinks();
            showToast('Semua judul berhasil disimpan.');
          }}
        />
      )}
    </div>
  );
};

export default AdminLinks;
