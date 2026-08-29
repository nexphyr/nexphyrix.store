import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PromoCarousel = () => {
  const { user, signInWithGoogle } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

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
            <p className="text-blue-100 text-xs md:text-base font-medium max-w-xl leading-relaxed hidden sm:block">
              Nikmati potongan otomatis sebesar <strong className="text-yellow-400 text-lg">Rp 10.000</strong> untuk setiap kelipatan 11 item di keranjang belanja Anda. 
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
            <p className="text-purple-100 text-xs md:text-base font-medium max-w-xl leading-relaxed hidden sm:block">
              Sebagai member, Anda mendapatkan potongan Rp 10.000 setiap pembelian kelipatan 11 item. Selamat berbelanja!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Banner 2: Akses Instan
  banners.push(
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-r from-teal-900 to-emerald-950 group">
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500 opacity-20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
      <div className="relative z-10 px-6 py-8 md:px-12 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6 h-full">
        <div className="flex-1 text-center md:text-left text-white flex flex-col justify-center h-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-emerald-100 text-xs font-black uppercase tracking-wider rounded-full mb-3 md:mb-5 backdrop-blur-sm border border-emerald-400/30 w-fit mx-auto md:mx-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Akses Instan 24/7
          </div>
          <h2 className="text-2xl md:text-4xl font-black mb-2 md:mb-3 leading-tight">
            Checkout Cepat, <br className="hidden md:block" /> Mainkan Langsung!
          </h2>
          <p className="text-emerald-50 text-xs md:text-base font-medium max-w-xl leading-relaxed hidden sm:block">
            Semua link download otomatis tersedia sesaat setelah pesanan Anda selesai. Tanpa perlu menunggu balasan admin, kapan pun Anda mau main.
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

  // Banner 3: Kualitas Terjamin
  banners.push(
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-slate-900 to-black group">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black"></div>
      <div className="relative z-10 px-6 py-8 md:px-12 md:py-10 flex flex-col items-center justify-center text-center gap-4 h-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-gray-300 text-xs font-black uppercase tracking-wider rounded-full backdrop-blur-sm border border-gray-600">
          💯 Kualitas Premium
        </div>
        <h2 className="text-2xl md:text-4xl font-black leading-tight text-white">
          Terjemahan Bahasa Indonesia <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-white">Terbaik & Akurat</span>
        </h2>
        <p className="text-gray-400 text-xs md:text-base font-medium max-w-2xl leading-relaxed hidden sm:block">
          Dikerjakan oleh profesional untuk memastikan Anda memahami setiap alur cerita dan fitur game tanpa merusak esensi aslinya.
        </p>
      </div>
    </div>
  );

  // Auto slide logic
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length, isHovered]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div 
      className="relative w-full rounded-3xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] mb-12 border border-gray-200/50 bg-gray-100 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

      {/* Navigation Buttons (hidden on mobile, visible on hover on desktop) */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 hover:bg-white rounded-full hidden md:flex items-center justify-center text-gray-800 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 border border-gray-200"
      >
        <ChevronLeft className="w-6 h-6 ml-[-2px]" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 hover:bg-white rounded-full hidden md:flex items-center justify-center text-gray-800 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 border border-gray-200"
      >
        <ChevronRight className="w-6 h-6 mr-[-2px]" />
      </button>

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
