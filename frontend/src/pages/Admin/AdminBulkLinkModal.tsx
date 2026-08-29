import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { storage } from '../../services/storage';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const AdminBulkLinkModal = ({ isOpen, onClose, onSaved }: Props) => {
  const [titlesText, setTitlesText] = useState('');
  const [description, setDescription] = useState('SUB INDO PS4');
  const [price, setPrice] = useState('Rp 10.000');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const isCancelled = useRef(false);

  const handleCancel = () => {
    isCancelled.current = true;
    onClose();
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await storage.getCategories();
      setCategories(cats);
      if (cats.length > 0) {
        setCategoryId(cats[0].id);
      }
    };
    fetchCategories();
  }, []);

  if (!isOpen) return null;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      setPrice('');
      return;
    }
    const digits = val.replace(/[^0-9]/g, '');
    if (digits.length > 0) {
      const num = parseInt(digits, 10);
      setPrice('Rp ' + num.toLocaleString('id-ID'));
    } else {
      setPrice(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!categoryId) {
      setError('Silakan pilih kategori terlebih dahulu.');
      return;
    }

    isCancelled.current = false;

    const lines = titlesText.split('\n');
    const parsedTitles = lines
      .map(line => line.trim().replace(/^\d+[\.\)]\s*/, '')) // Remove leading "1. " or "1) "
      .filter(line => line.length > 0);

    if (parsedTitles.length === 0) {
      setError('Harap masukkan minimal 1 judul game.');
      return;
    }

    setLoading(true);
    setProgress({ current: 0, total: parsedTitles.length });

    try {
      let successCount = 0;
      for (const title of parsedTitles) {
        if (isCancelled.current) {
          break;
        }
        
        const payload = {
          title,
          description,
          price,
          category_id: Number(categoryId),
          urls: []
        };
        
        await storage.addLink(payload);
        successCount++;
        setProgress({ current: successCount, total: parsedTitles.length });
      }
      
      if (!isCancelled.current) {
        onSaved();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data. Proses terhenti.');
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">Tambah Judul Massal (Bulk Add)</h2>
          <button type="button" onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 flex-1 overflow-y-auto space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 text-sm rounded">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Daftar Judul (Copy Paste di sini)</label>
              <textarea 
                required 
                className="input h-64 resize-none" 
                value={titlesText} 
                onChange={e => setTitlesText(e.target.value)} 
                placeholder="1. A Plague Tale: Innocence\n2. A Way Out\n3. Afterimage"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Satu judul per baris. Angka urutan (contoh "1. ") akan dihapus otomatis.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Kategori (Untuk Semua Judul)</label>
                <select 
                  required 
                  className="input" 
                  value={categoryId} 
                  onChange={e => setCategoryId(Number(e.target.value))}
                  disabled={loading}
                >
                  <option value="" disabled>Pilih Kategori</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Deskripsi Default</label>
                <input 
                  type="text" 
                  className="input" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Sub Indo PS4"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label">Harga Default</label>
                <input 
                  type="text" 
                  className="input" 
                  value={price} 
                  onChange={handlePriceChange} 
                  placeholder="Contoh: 10000"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center border-t mt-4">
            <div className="text-sm font-bold text-blue-600">
              {progress ? `Memproses: ${progress.current} / ${progress.total}` : ''}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={handleCancel} className="btn btn-secondary">Batal</button>
              <button type="submit" disabled={loading || !titlesText.trim()} className="btn btn-primary">
                {loading ? 'Menyimpan...' : 'SIMPAN SEMUA'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminBulkLinkModal;
