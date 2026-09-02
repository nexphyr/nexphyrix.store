import { useState, useEffect } from 'react';
import { SearchX, ShoppingCart, ImageOff, Filter, Smartphone } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { storage } from '../../services/storage';
import FloatingCart from '../../components/Cart/FloatingCart';
import CartDrawer from '../../components/Cart/CartDrawer';
import CheckoutModal from '../../components/Cart/CheckoutModal';
import ToastContainer from '../../components/Cart/ToastContainer';
import AuthMenu from '../../components/AuthMenu';
import PromoCarousel from '../../components/PromoCarousel';
import { useCart } from '../../contexts/CartContext';
import logoImage from '../../assets/nexphyrix.png';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Link {
  id: string;
  title: string;
  description: string;
  category: {
    name: string;
    slug: string;
  };
  status?: string;
  price?: string;
  is_active?: boolean;
  image_url?: string;
  created_at: string;
}

const HomePage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchLinks();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, activeCategory, sortBy]);

  const fetchCategories = async () => {
    const cats = await storage.getCategories();
    setCategories(cats);
  };

  const fetchLinks = async () => {
    setLoading(true);
    // Fetch public links and categories
    const allLinks = await storage.getLinks(false);
    const allCats = categories.length ? categories : await storage.getCategories();

    // Filter
    let filtered = allLinks;

    if (search) {
      filtered = filtered.filter(l => l.title.toLowerCase().includes(search.toLowerCase()));
    }

    if (activeCategory) {
      const cat = allCats.find(c => c.slug === activeCategory);
      if (cat) {
        filtered = filtered.filter(l => l.category_id === cat.id);
      }
    }

    const parsePriceStr = (priceStr?: string) => {
      if (!priceStr || priceStr.toLowerCase() === 'gratis' || priceStr.toLowerCase() === 'free') return 0;
      return parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
    };

    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => parsePriceStr(a.price) - parsePriceStr(b.price));
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => parsePriceStr(b.price) - parsePriceStr(a.price));
    } else if (sortBy === 'alpha_asc') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'alpha_desc') {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else {
      // Default: newest first
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // Map category name onto links for the public view (and omit URL explicitly here even though we fetch it)
    const formattedLinks = filtered.map(link => {
      const cat = allCats.find(c => String(c.id) === String(link.category_id));
      return {
        id: link.id,
        title: link.title,
        description: link.description,
        status: link.status,
        price: link.price,
        is_active: link.is_active,
        image_url: link.image_url,
        created_at: link.created_at,
        category: { name: cat?.name || 'Unknown', slug: cat?.slug || '' }
      };
    });

    setLinks(formattedLinks);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F0F5FA] dark:bg-gray-950 font-sans transition-colors duration-300">
      {/* Hero Section with Custom Banner */}
      <header className="relative w-full overflow-hidden shadow-2xl bg-[#00439C]">
        {/* Full Edge-to-Edge Background Image */}
        <div
          className="absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-center"
          style={{ backgroundImage: "url('./banner.png')" }}
        ></div>

        {/* Semi-transparent overlay to ensure text is readable if the banner is bright */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Top Navbar */}
        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 z-50 flex items-center justify-between w-full">
          <RouterLink to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logoImage} alt="Nexphyrix Logo" className="h-12 md:h-16 object-contain" />
          </RouterLink>
          <AuthMenu />
        </div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-[clamp(1.5rem,4vw,3rem)] relative z-10 py-[clamp(2rem,6vw,6rem)] px-4 md:py-24 pt-20 md:pt-24">

          {/* Left Column: Text & Search */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full mb-4 md:mb-6 backdrop-blur-sm shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-sm font-semibold tracking-wide text-white">NEXPHYRIX STORE</span>
            </div>

            <h1 className="text-[clamp(2.4rem,7vw,4rem)] leading-[1.1] md:text-6xl md:leading-tight font-extrabold mb-4 md:mb-6 drop-shadow-xl text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100">Selamat Datang di</span> <br />
              Nexphyrix Store
            </h1>

            <p className="text-[clamp(1rem,3vw,1.5rem)] md:text-2xl text-blue-50 mb-6 md:mb-10 max-w-xl mx-auto md:mx-0 drop-shadow-lg font-medium">
              Temukan koleksi berbagai judul Sub Indo PS4 atau game PS4.
            </p>

            {/* Search Bar & App Download */}
            <div className="flex flex-row items-center gap-2 md:gap-4 max-w-2xl mx-auto md:mx-0 group w-full">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 md:pl-5 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                  <SearchX className="h-5 w-5 md:h-6 md:w-6 text-primary hidden" />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 rounded-full text-sm md:text-lg text-gray-900 dark:text-white border-2 border-transparent shadow-[0_0_20px_rgba(255,255,255,0.2)] focus:border-white focus:ring-4 focus:ring-white/30 transition-all outline-none bg-white/95 backdrop-blur-md hover:bg-white dark:bg-gray-900"
                  placeholder="Ketik judul game..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <a 
                href="/Nexphyrix-Store-v1.0.0.apk" 
                download="Nexphyrix-Store-v1.0.0.apk"
                title="Unduh Aplikasi Android"
                className="flex-shrink-0 flex items-center justify-center gap-2 p-3 md:px-6 md:py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-full shadow-lg hover:shadow-green-500/50 transition-all transform hover:-translate-y-1 border border-green-400/50 whitespace-nowrap"
              >
                <Smartphone className="w-5 h-5 md:w-6 md:h-6 animate-bounce" />
                <span className="hidden md:block">Unduh Aplikasi</span>
              </a>
            </div>
          </div>

          {/* Right Column: Floating Astrobot */}
          <div className="flex-1 hidden md:flex justify-center relative">
            <div className="absolute w-64 h-64 bg-accent/40 rounded-full blur-3xl animate-pulse-glow z-0"></div>
            <img
              src="./astrobot.png"
              alt="Astrobot"
              className="w-full max-w-[200px] md:max-w-md object-contain animate-float drop-shadow-2xl relative z-10 opacity-90 md:opacity-100"
              style={{ filter: 'drop-shadow(0px 20px 30px rgba(0, 0, 0, 0.4))' }}
            />
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12">

        <PromoCarousel />

        {/* Filter and Sort Container */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-10 gap-4 bg-white/50 dark:bg-gray-900/50 p-3 md:p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
          
          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start flex-1">
            <button
              onClick={() => setActiveCategory('')}
              className={`px-4 py-2 text-sm md:text-base rounded-xl font-bold transition-all ${activeCategory === ''
                ? 'bg-primary text-white shadow-md shadow-primary/40'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-primary border border-gray-200 dark:border-gray-700'
                }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-4 py-2 text-sm md:text-base rounded-xl font-bold transition-all ${activeCategory === cat.slug
                  ? 'bg-primary text-white shadow-md shadow-primary/40'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-primary border border-gray-200 dark:border-gray-700'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto md:min-w-[220px] pt-3 md:pt-0 border-t md:border-t-0 border-gray-200 dark:border-gray-700">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400 hidden md:block" />
            <select 
              className="w-full input py-2.5 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer transition-all hover:border-gray-300 dark:hover:border-gray-600 appearance-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
            >
              <option value="default">Urutan Terbaru</option>
              <option value="price_asc">Harga: Rendah ke Tinggi</option>
              <option value="price_desc">Harga: Tinggi ke Rendah</option>
              <option value="alpha_asc">Nama: A - Z</option>
              <option value="alpha_desc">Nama: Z - A</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {loading ? (
            <div className="col-span-full p-12 text-center text-primary font-bold animate-pulse">Memuat Data...</div>
          ) : links.length > 0 ? (
            links.map((link) => (
              <div key={link.id} className="glass-card rounded-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group border border-white dark:border-gray-800 relative overflow-hidden flex flex-col bg-white dark:bg-gray-900">
                
                {/* Image Container */}
                <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 relative">
                  {link.image_url ? (
                    <img src={link.image_url} alt={link.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                      <ImageOff className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs font-semibold uppercase tracking-wider">No Picture</span>
                    </div>
                  )}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-secondary to-transparent rounded-bl-full opacity-50 transition-opacity group-hover:opacity-100 mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 flex flex-col flex-grow p-4 md:p-6">
                  <div className="flex justify-between items-start mb-3 md:mb-4 gap-2">
                    <span className={`inline-block px-2 py-1 md:px-3 md:py-1 text-[10px] md:text-xs font-black tracking-wider uppercase rounded-full shadow-sm ${link.category.slug === 'gta-v-mod-nusantara' ? 'bg-amber-100 text-amber-800' : 'bg-primary/10 text-primary'
                      }`}>
                      {link.category.name}
                    </span>

                    {link.price && (
                      <span className="inline-block px-2 py-1 md:px-3 md:py-1 text-[10px] md:text-xs font-extrabold tracking-wide rounded-full shadow-sm bg-green-100 text-green-700 whitespace-nowrap">
                        {link.price}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white mb-1 md:mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">{link.title}</h3>

                  {link.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">{link.description}</p>
                  )}

                  {link.category.slug === 'gta-v-mod-nusantara' && link.status && (
                    <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-800">
                      <span className="flex items-center gap-2 text-[10px] md:text-sm font-bold">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500"></span>
                        <span className="text-green-700 uppercase tracking-wide">{link.status}</span>
                      </span>
                    </div>
                  )}

                  <div className="mt-auto pt-4 md:pt-6">
                    {link.is_active === false ? (
                      <button
                        disabled
                        className="w-full btn bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed flex items-center justify-center gap-2 py-2.5 md:py-3 text-sm md:text-base font-bold rounded-lg shadow-sm"
                      >
                        Belum Tersedia
                      </button>
                    ) : (
                      <button
                        onClick={() => addToCart({
                          id: link.id,
                          title: link.title,
                          price: link.price || 'Rp 0'
                        })}
                        className="w-full btn btn-primary flex items-center justify-center gap-2 py-2.5 md:py-3 text-sm md:text-base"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Tambah ke Keranjang
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-16 text-center text-gray-400 dark:text-gray-600 dark:text-gray-400 flex flex-col items-center glass-card rounded-2xl bg-white dark:bg-gray-900">
              <SearchX className="w-16 h-16 mb-6 text-gray-300 dark:text-gray-700 dark:text-gray-300" />
              <p className="text-xl font-bold text-gray-500 dark:text-gray-400">Tidak ada data yang ditemukan.</p>
              <p className="text-sm mt-2">Coba kata kunci lain atau ubah kategori.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} NEXPHYRIX STORE. All rights reserved.
        <div className="mt-2">
          <RouterLink to="/login" className="text-blue-600 hover:underline">Admin Login</RouterLink>
        </div>
      </footer>

      {/* Cart Components */}
      <FloatingCart />
      <CartDrawer />
      <CheckoutModal />
      <ToastContainer />
    </div>
  );
};

export default HomePage;
