import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const PromoCarousel = () => {
  const { user, signInWithGoogle } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const minSwipeDistance = 50;

  const onDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    setTouchEnd(null);
    if ('targetTouches' in e) {
      setTouchStart((e as React.TouchEvent).targetTouches[0].clientX);
    } else {
      setTouchStart((e as React.MouseEvent).clientX);
    }
  };

  const onDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    if ('targetTouches' in e) {
      setTouchEnd((e as React.TouchEvent).targetTouches[0].clientX);
    } else {
      setTouchEnd((e as React.MouseEvent).clientX);
    }
  };

  const onDragEnd = () => {
    setIsDragging(false);
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  // The banners array
  const banners = [];

  // Banner 1: Promo Member
  if (!user) {
    banners.push(
      <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-blue-900 via-[#00439C] to-indigo-900 group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 opacity-20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400 opacity-10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2 group-hover:scale-110 transition-transform duration-700"></div>
        
        <div className="relative z-10 px-6 py-8 md:px-12 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6 h-full">
          <div className="flex-1 text-center md:text-left text-white flex flex-col justify-center h-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 text-xs font-black uppercase tracking-wider rounded-full mb-3 md:mb-5 shadow-lg shadow-yellow-500/20 w-fit mx-auto md:mx-0">
              <span className="w-2 h-2 rounded-full bg-yellow-900 animate-pulse"></span>
              Keuntungan Eksklusif Member
            </div>
            <h2 className="text-2xl md:text-4xl font-black mb-2 md:mb-3 leading-tight">
              Beli 10 Game,<br className="hidden md:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">Gratis 1 Game!</span> 🎉
            </h2>
            <p className="text-blue-100 text-[10px] md:text-base font-medium max-w-xl leading-relaxed">
              Nikmati potongan otomatis sebesar <strong className="text-yellow-400 text-sm md:text-lg">Rp 10.000</strong> untuk setiap kelipatan 11 item di keranjang belanja Anda. 
            </p>
          </div>
          
          <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center">
            <button 
              onClick={signInWithGoogle}
              className="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 font-black text-sm md:text-lg rounded-xl md:rounded-2xl hover:from-yellow-300 hover:to-yellow-400 hover:-translate-y-1 transition-all shadow-[0_0_30px_rgba(250,204,21,0.3)] active:scale-95"
            >
              Daftar Member Sekarang
            </button>
            <p className="text-center text-blue-200/70 text-[10px] md:text-xs font-medium mt-2 md:mt-3">
              Pendaftaran gratis 100% via Google
            </p>
          </div>
        </div>
      </div>
    );
  } else {
    banners.push(
      <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 opacity-20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="relative z-10 px-6 py-8 md:px-12 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6 h-full">
          <div className="flex-1 text-center md:text-left text-white flex flex-col justify-center h-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 text-white text-xs font-black uppercase tracking-wider rounded-full mb-3 md:mb-5 backdrop-blur-sm w-fit mx-auto md:mx-0">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Member Aktif
            </div>
            <h2 className="text-2xl md:text-4xl font-black mb-2 md:mb-3 leading-tight">
              Diskon Otomatis <br className="hidden md:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">Tersedia!</span> 🛍️
            </h2>
            <p className="text-purple-100 text-[10px] md:text-base font-medium max-w-xl leading-relaxed">
              Sebagai member, Anda mendapatkan potongan Rp 10.000 setiap pembelian kelipatan 11 item. Selamat berbelanja!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Banner 2: Promo Aplikasi Android
  banners.push(
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-r from-green-900 to-emerald-900 group">
      <div className="absolute top-0 left-0 w-64 h-64 bg-green-500 opacity-20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-700"></div>
      <div className="relative z-10 px-6 py-8 md:px-12 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6 h-full">
        <div className="flex-1 text-center md:text-left text-white flex flex-col justify-center h-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-green-200 text-xs font-black uppercase tracking-wider rounded-full backdrop-blur-sm border border-green-400/30 mb-3 md:mb-5 w-fit mx-auto md:mx-0">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Baru Rilis!
          </div>
          <h2 className="text-2xl md:text-4xl font-black leading-tight text-white mb-2 md:mb-3">
            Kini Hadir di <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-200">Android 📱</span>
          </h2>
          <p className="text-green-50 text-[10px] md:text-base font-medium max-w-xl leading-relaxed">
            Unduh aplikasi resmi Nexphyrix Store sekarang juga. Nikmati pengalaman berbelanja game yang jauh lebih cepat, mulus, dan ringan langsung dari HP Anda!
          </p>
        </div>
        <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center">
          <a 
            href="/Nexphyrix-Store-v1.0.0.apk"
            download="Nexphyrix-Store-v1.0.0.apk"
            className="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-white text-green-900 font-black text-sm md:text-lg rounded-xl md:rounded-2xl hover:bg-green-50 hover:-translate-y-1 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95"
          >
            Unduh APK Sekarang
          </a>
        </div>
      </div>
    </div>
  );

  // Banner 3: Koleksi Terlengkap
  banners.push(
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-r from-teal-900 to-emerald-950 group">
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500 opacity-20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
      <div className="relative z-10 px-6 py-8 md:px-12 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6 h-full">
        <div className="flex-1 text-center md:text-left text-white flex flex-col justify-center h-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-emerald-100 text-xs font-black uppercase tracking-wider rounded-full mb-3 md:mb-5 backdrop-blur-sm border border-emerald-400/30 w-fit mx-auto md:mx-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Koleksi Terlengkap
          </div>
          <h2 className="text-2xl md:text-4xl font-black mb-2 md:mb-3 leading-tight">
            Ratusan Game PS4 <br className="hidden md:block" /> Sub Indo Pilihan!
          </h2>
          <p className="text-emerald-50 text-[10px] md:text-base font-medium max-w-xl leading-relaxed mt-1 md:mt-0">
            Dari Action RPG hingga petualangan AAA, jelajahi berbagai mahakarya dunia yang kini bisa Anda nikmati sepenuhnya dalam bahasa ibu kita.
          </p>
        </div>
        <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center">
          <button 
            onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-white text-emerald-900 font-black text-sm md:text-lg rounded-xl md:rounded-2xl hover:bg-emerald-50 hover:-translate-y-1 transition-all shadow-xl active:scale-95"
          >
            Lihat Koleksi Game
          </button>
        </div>
      </div>
    </div>
  );

  // Banner 3: Akses Instan Member
  banners.push(
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-950 group">
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600 via-indigo-900 to-transparent"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      
      <div className="relative z-10 px-6 py-8 md:px-12 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6 h-full">
        <div className="flex-1 text-center md:text-left text-white flex flex-col justify-center h-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-blue-200 text-xs font-black uppercase tracking-wider rounded-full backdrop-blur-sm border border-blue-400/30 mb-3 md:mb-5 w-fit mx-auto md:mx-0">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Fitur Baru Khusus Member
          </div>
          <h2 className="text-2xl md:text-4xl font-black leading-tight text-white mb-2 md:mb-3">
            Akses Link Game <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">Secara Instan ⚡</span>
          </h2>
          <p className="text-blue-100 text-[10px] md:text-base font-medium max-w-xl leading-relaxed">
            Tidak perlu lagi menunggu balasan chat Admin! Cukup login, dan link download game Anda akan otomatis muncul di halaman <b>Profil</b> saat pesanan selesai. Lebih cepat, lebih praktis!
          </p>
        </div>
        
        {!user && (
          <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center">
            <button 
              onClick={signInWithGoogle}
              className="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-white text-blue-900 font-black text-sm md:text-lg rounded-xl md:rounded-2xl hover:bg-blue-50 hover:-translate-y-1 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95"
            >
              Login Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Banner 4: Jaminan Keamanan
  banners.push(
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-r from-orange-900 to-red-950 group">
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-orange-500 opacity-20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
      <div className="relative z-10 px-6 py-8 md:px-12 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6 h-full">
        <div className="flex-1 text-center md:text-left text-white flex flex-col justify-center h-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-orange-200 text-xs font-black uppercase tracking-wider rounded-full backdrop-blur-sm border border-orange-400/30 mb-3 md:mb-5 w-fit mx-auto md:mx-0">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
            100% Aman & Terpercaya
          </div>
          <h2 className="text-2xl md:text-4xl font-black leading-tight text-white mb-2 md:mb-3">
            Bebas Virus & <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-yellow-300">File Corrupt 🛡️</span>
          </h2>
          <p className="text-orange-50 text-[10px] md:text-base font-medium max-w-xl leading-relaxed">
            Semua file mod dan game kami telah melewati proses pemindaian ketat dan diuji coba secara langsung. Sangat aman dimainkan di konsol PS4 kesayangan Anda tanpa resiko rusak!
          </p>
        </div>
      </div>
    </div>
  );

  // Banner 5: Layanan Support
  banners.push(
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-fuchsia-900 to-violet-950 group">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,_rgba(168,85,247,0.1)_0%,_transparent_70%)] opacity-50 group-hover:rotate-12 transition-transform duration-[2000ms]"></div>
      
      <div className="relative z-10 px-6 py-8 md:px-12 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6 h-full">
        <div className="flex-1 text-center md:text-left text-white flex flex-col justify-center h-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-fuchsia-200 text-xs font-black uppercase tracking-wider rounded-full backdrop-blur-sm border border-fuchsia-400/30 mb-3 md:mb-5 w-fit mx-auto md:mx-0">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse"></span>
            Dukungan Penuh
          </div>
          <h2 className="text-2xl md:text-4xl font-black leading-tight text-white mb-2 md:mb-3">
            Bingung Cara <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-pink-300">Install Game? 🎮</span>
          </h2>
          <p className="text-fuchsia-100 text-[10px] md:text-base font-medium max-w-xl leading-relaxed">
            Jangan khawatir! Tim Admin kami yang ramah siap memandu Anda dari proses pengunduhan hingga game sukses berjalan lancar di konsol PS4 Anda. Kepuasan Anda adalah jaminan kami.
          </p>
        </div>
      </div>
    </div>
  );

  // Auto slide logic
  useEffect(() => {
    if (isHovered || isDragging) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length, isHovered, isDragging]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div 
      className="relative w-full rounded-3xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] mb-12 border border-gray-200/50 bg-gray-100 group select-none cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); onDragEnd(); }}
      onTouchStart={onDragStart}
      onTouchMove={onDragMove}
      onTouchEnd={onDragEnd}
      onMouseDown={onDragStart}
      onMouseMove={onDragMove}
      onMouseUp={onDragEnd}
    >
      {/* Slider track */}
      <div 
        className="w-full h-[280px] md:h-[260px] flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div key={index} className="w-full h-full flex-shrink-0">
            {banner}
          </div>
        ))}
      </div>

      {/* Indicators (Dots) */}
      <div className="absolute bottom-4 left-6 z-20 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full ${index === currentIndex ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default PromoCarousel;
