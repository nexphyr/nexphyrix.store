import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { storage } from '../../services/storage';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface LinkData {
  id?: string;
  title: string;
  url?: string;
  urls?: string[];
  status?: string;
  description: string;
  price?: string;
  category_id: string;
  is_referral_reward?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  link?: LinkData;
}

const AdminLinkModal = ({ isOpen, onClose, onSaved, link }: Props) => {
  const [title, setTitle] = useState(link?.title || '');
  const [urls, setUrls] = useState<string[]>(link?.urls?.length ? link.urls : (link?.url ? [link.url] : ['']));
  const [status, setStatus] = useState(link?.status || '');
  const [description, setDescription] = useState(link?.description || '');
  const [price, setPrice] = useState(link?.price || '');
  const [categoryId, setCategoryId] = useState<string>(link?.category_id || '');
  const [isReferralReward, setIsReferralReward] = useState(link?.is_referral_reward || false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await storage.getCategories();
      setCategories(cats);
      if (!link && cats.length > 0) {
        setCategoryId(cats[0].id);
      }
    };
    fetchCategories();
  }, [link]);

  if (!isOpen) return null;

  const isGta = categories.find(c => c.id === categoryId)?.slug === 'gta-v-mod-nusantara';

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      setPrice('');
      return;
    }
    
    // Extract only digits
    const digits = val.replace(/[^0-9]/g, '');
    if (digits.length > 0) {
      const num = parseInt(digits, 10);
      // Format to Rp XX.XXX
      setPrice('Rp ' + num.toLocaleString('id-ID'));
    } else {
      // If user types letters like 'Gratis'
      setPrice(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!categoryId) {
      setError('Silakan pilih kategori terlebih dahulu. Jika kosong, tambahkan kategori di menu Kategori.');
      setLoading(false);
      return;
    }

    const payload = {
      title,
      description,
      price,
      category_id: categoryId,
      is_referral_reward: isReferralReward,
      ...(isGta ? { status } : { urls })
    };

    try {
      if (link?.id) {
        await storage.updateLink(link.id, payload);
      } else {
        await storage.addLink(payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">{link ? 'Edit Link' : 'Tambah Link Baru'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 text-sm rounded">
              {error}
            </div>
          )}
          
          <div>
            <label className="label">Judul</label>
            <input 
              type="text" 
              required 
              className="input" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Contoh: Resident Evil 4 Remake"
            />
          </div>

          <div>
            <label className="label">Kategori</label>
            <select 
              required 
              className="input" 
              value={categoryId} 
              onChange={e => setCategoryId(e.target.value)}
            >
              <option value="" disabled>Pilih Kategori</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {isGta ? (
            <div>
              <label className="label">Status Ketersediaan Mod</label>
              <input 
                type="text" 
                required 
                className="input" 
                value={status} 
                onChange={e => setStatus(e.target.value)} 
                placeholder="Contoh: Tersedia, WIP, Segera Rilis"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="label mb-0">URL Download</label>
                <button 
                  type="button" 
                  onClick={() => setUrls([...urls, ''])}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold hover:bg-blue-200 transition-colors"
                >
                  + Tambah URL
                </button>
              </div>
              
              {urls.map((u, index) => (
                <div key={index} className="flex gap-2">
                  <input 
                    type="url" 
                    required 
                    className="input flex-1" 
                    value={u} 
                    onChange={e => {
                      const newUrls = [...urls];
                      newUrls[index] = e.target.value;
                      setUrls(newUrls);
                    }} 
                    placeholder={`https://example.com/link/part${index + 1}`}
                  />
                  {urls.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => {
                        const newUrls = urls.filter((_, i) => i !== index);
                        setUrls(newUrls);
                      }}
                      className="btn btn-secondary px-3"
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="label">Deskripsi</label>
            <input 
              type="text" 
              className="input" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Sub Indo PS4"
            />
          </div>

          <div>
            <label className="label">Harga</label>
            <input 
              type="text" 
              className="input" 
              value={price} 
              onChange={handlePriceChange} 
              placeholder="Contoh: 50000 (Otomatis jadi Rp 50.000) atau Gratis"
            />
          </div>

          <div className="flex items-center gap-2 pt-2 pb-2">
            <input 
              type="checkbox" 
              id="is_referral_reward"
              checked={isReferralReward} 
              onChange={e => setIsReferralReward(e.target.checked)}
              className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300"
            />
            <label htmlFor="is_referral_reward" className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Bisa Diklaim Gratis via Fitur Referral
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">Batal</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Menyimpan...' : 'SIMPAN LINK'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLinkModal;
