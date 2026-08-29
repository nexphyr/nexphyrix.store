import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { generateCheckoutMessage, copyToClipboardFallback, createOrderInDatabase } from '../../lib/checkout';

const MessengerIcon = () => (
  <svg viewBox="0 0 36 36" fill="url(#messenger-grad)" className="w-8 h-8 md:w-12 md:h-12">
    <defs>
      <linearGradient id="messenger-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#00B2FF" />
        <stop offset="50%" stopColor="#006AFF" />
      </linearGradient>
    </defs>
    <path d="M18 0C8.06 0 0 7.42 0 16.57c0 5.2 2.65 9.77 6.74 12.75v6.33c0 .59.66.94 1.15.63l5.52-3.41c1.47.41 3.01.63 4.59.63 9.94 0 18-7.42 18-16.57S27.94 0 18 0zm1.75 22.37l-4.52-4.83-8.83 4.83 9.7-10.29 4.63 4.83 8.71-4.83-9.69 10.29z" />
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8 md:w-12 md:h-12">
    <circle cx="12" cy="12" r="12" fill="#2AABEE" />
    <path fill="#FFF" d="M5.435 11.63l12.44-4.795c.575-.22 1.07.135.88.945l-2.115 9.95c-.15.695-.565.865-1.145.54l-3.165-2.33-1.525 1.47c-.17.17-.31.31-.635.31l.225-3.235 5.89-5.32c.255-.23-.055-.355-.4-.125L7.6 13.62l-3.13-.98c-.68-.21-.695-.68.14-1.01z" />
  </svg>
);

const CheckoutModal = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, cart, addToast, clearCart } = useCart();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isCheckoutOpen) return null;

  const handleCheckout = async (platform: 'messenger' | 'telegram') => {
    setIsLoading(true);
    try {
      const orderData = await createOrderInDatabase(cart, platform);
      
      const msg = generateCheckoutMessage(cart, orderData, platform);
      setGeneratedMessage(msg);

      const success = await copyToClipboardFallback(msg);
      
      if (success) {
        setCopyStatus('success');
        addToast('Detail pesanan berhasil disalin');
        
        // Clear cart after successful order creation
        clearCart();
        
        // Delay before opening the app so user reads the feedback
        setTimeout(() => {
          const url = platform === 'messenger' ? 'https://m.me/zephyrus.yan' : 'https://t.me/nexphyrix';
          window.open(url, '_blank');
          setIsCheckoutOpen(false);
          setCopyStatus('idle');
        }, 1500);
      } else {
        setCopyStatus('failed');
        addToast('Gagal menyalin. Silakan copy manual.');
      }
    } catch (error: any) {
      addToast(error.message || 'Terjadi kesalahan saat memproses pesanan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
        {copyStatus === 'success' ? (
          <div className="p-8 text-center flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Berhasil Disalin!</h2>
            <p className="text-gray-600 text-sm mb-6">
              Membuka aplikasi chat...<br/>Silakan <b>Paste</b> pesan tersebut untuk mengirim pesanan.
            </p>
          </div>
        ) : copyStatus === 'failed' ? (
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Copy Manual</h2>
            <p className="text-sm text-gray-600 mb-4">Browser Anda tidak mendukung copy otomatis. Silakan copy teks di bawah ini lalu buka aplikasi chat.</p>
            <textarea 
              className="w-full h-48 p-3 text-sm border border-gray-200 rounded-lg bg-gray-50 mb-4" 
              readOnly 
              value={generatedMessage} 
            />
            <div className="flex gap-2">
              <button onClick={() => setIsCheckoutOpen(false)} className="btn btn-secondary flex-1">Tutup</button>
              <a href="https://m.me/zephyrus.yan" target="_blank" rel="noreferrer" className="btn bg-[#006AFF] text-white flex-1 hover:bg-[#005AE0]">Messenger</a>
              <a href="https://t.me/nexphyrix" target="_blank" rel="noreferrer" className="btn bg-[#2AABEE] text-white flex-1 hover:bg-[#2299D6]">Telegram</a>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-extrabold text-gray-900">Pilih Metode Checkout</h2>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 md:p-6">
              <p className="text-center text-gray-500 text-xs md:text-sm mb-4 md:mb-6">
                Detail pesanan akan otomatis disalin ke clipboard Anda.
              </p>
              
              <div className="flex justify-center gap-4 md:gap-6">
                <button 
                  onClick={() => handleCheckout('messenger')}
                  disabled={isLoading}
                  className="flex flex-col items-center gap-2 md:gap-3 p-3 md:p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 group disabled:opacity-50 disabled:hover:scale-100"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_8px_30px_rgba(0,106,255,0.3)] flex items-center justify-center transition-shadow">
                    <MessengerIcon />
                  </div>
                  <span className="font-bold text-sm md:text-base text-gray-700 group-hover:text-[#006AFF]">Messenger</span>
                </button>

                <button 
                  onClick={() => handleCheckout('telegram')}
                  disabled={isLoading}
                  className="flex flex-col items-center gap-2 md:gap-3 p-3 md:p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 group disabled:opacity-50 disabled:hover:scale-100"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_8px_30px_rgba(42,171,238,0.3)] flex items-center justify-center transition-shadow">
                    <TelegramIcon />
                  </div>
                  <span className="font-bold text-sm md:text-base text-gray-700 group-hover:text-[#2AABEE]">Telegram</span>
                </button>
              </div>
              
              {isLoading && (
                <div className="mt-6 text-center text-primary font-bold animate-pulse">
                  Memproses pesanan...
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
