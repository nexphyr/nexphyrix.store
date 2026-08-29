import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { storage } from '../../services/storage';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  
  // Quick inline add/edit state for simplicity
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    const cats = await storage.getCategories();
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await storage.addCategory(newName);
    setNewName('');
    setIsAdding(false);
    showToast('Kategori berhasil ditambahkan.');
    fetchCategories();
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    await storage.updateCategory(id, editName);
    setEditingId(null);
    showToast('Kategori berhasil diubah.');
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini? (Pastikan tidak ada link di dalamnya)')) {
      const links = await storage.getLinks(true);
      if (links.some(l => String(l.category_id) === String(id))) {
        showToast('Gagal menghapus kategori: Masih ada link di dalamnya.');
        return;
      }
      await storage.deleteCategory(id);
      showToast('Kategori berhasil dihapus.');
      fetchCategories();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Kategori</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kategori
        </button>
      </div>
      <div className="glass-card rounded-2xl overflow-hidden max-w-3xl mt-6">
        <ul className="divide-y divide-gray-100">
          
          {isAdding && (
            <li className="p-5 bg-white/50 flex flex-col sm:flex-row gap-3 items-center border-b border-primary/20">
              <input 
                type="text" 
                autoFocus
                className="input flex-1 w-full" 
                placeholder="Nama Kategori Baru"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={handleAdd} className="btn btn-primary flex-1 sm:flex-none">Simpan</button>
                <button onClick={() => setIsAdding(false)} className="btn btn-secondary flex-1 sm:flex-none">Batal</button>
              </div>
            </li>
          )}

          {loading ? (
            <li className="p-8 text-center text-primary font-bold animate-pulse">Loading...</li>
          ) : categories.map((cat) => (
            <li key={cat.id} className="p-5 flex flex-col sm:flex-row items-center justify-between hover:bg-white/60 transition-colors group">
              {editingId === cat.id ? (
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <input 
                    type="text" 
                    autoFocus
                    className="input flex-1" 
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(cat.id)} className="btn btn-primary px-4">Simpan</button>
                    <button onClick={() => setEditingId(null)} className="btn btn-secondary px-4">Batal</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 mb-3 sm:mb-0 w-full">
                    <span className="font-extrabold text-gray-900 block sm:inline">{cat.name}</span>
                    <span className="sm:ml-4 text-xs font-semibold text-primary/60 bg-primary/10 px-2 py-1 rounded-full uppercase tracking-wider">slug: {cat.slug}</span>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto justify-end opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingId(cat.id); setEditName(cat.name); }} 
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-colors" title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)} 
                      className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
          {!loading && categories.length === 0 && !isAdding && (
            <li className="p-8 text-center text-gray-500 font-medium">Kategori belum ada.</li>
          )}
        </ul>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
