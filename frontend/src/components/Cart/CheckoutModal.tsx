import { useState, useEffect } from 'react';
import { X, CheckCircle2, QrCode, Download } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { generateCheckoutMessage, copyToClipboardFallback, updateCheckoutMethod } from '../../lib/checkout';
import qrisImage from '../../assets/qris.png';

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
  const { isCheckoutOpen, setIsCheckoutOpen, cart, addToast, clearCart, pendingOrderData } = useCart();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'payment' | 'platform'>('payment');

  useEffect(() => {
    if (isCheckoutOpen) {
      setCheckoutStep('payment');
      setCopyStatus('idle');
    }
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const handleCheckout = async (platform: 'messenger' | 'telegram') => {
    if (!pendingOrderData) {
      addToast('Pesanan belum dibuat. Silakan ulangi proses checkout.');
      setIsCheckoutOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      await updateCheckoutMethod(pendingOrderData.order_id, platform);
      
      const msg = generateCheckoutMessage(cart, pendingOrderData, platform);
      setGeneratedMessage(msg);

      const success = await copyToClipboardFallback(msg);
      
      if (success) {
        setCopyStatus('success');
        addToast('Detail pesanan berhasil disalin');
        
        clearCart();
        
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
        {copyStatus === 'success' ? (
          <div className="p-8 text-center flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Berhasil Disalin!</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Membuka aplikasi chat...<br/>Silakan <b>Paste</b> pesan tersebut untuk mengirim pesanan.
            </p>
          </div>
        ) : copyStatus === 'failed' ? (
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Copy Manual</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Browser Anda tidak mendukung copy otomatis. Silakan copy teks di bawah ini lalu buka aplikasi chat.</p>
            <textarea 
              className="w-full h-48 p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 mb-4" 
              readOnly 
              value={generatedMessage} 
            />
            <div className="flex gap-2">
              <button onClick={() => setIsCheckoutOpen(false)} className="btn btn-secondary flex-1">Tutup</button>
              <a href="https://m.me/zephyrus.yan" target="_blank" rel="noreferrer" className="btn bg-[#006AFF] text-white flex-1 hover:bg-[#005AE0]">Messenger</a>
              <a href="https://t.me/nexphyrix" target="_blank" rel="noreferrer" className="btn bg-[#2AABEE] text-white flex-1 hover:bg-[#2299D6]">Telegram</a>
            </div>
          </div>
        ) : checkoutStep === 'payment' ? (
          <>
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" /> Pembayaran QRIS
              </h2>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 md:p-6 text-center">
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total yang harus dibayar:</p>
                <p className="text-2xl font-black text-primary">{formatRupiah(displayTotal || 0)}</p>
              </div>
              
              <div className="mb-4">
                <img src={qrisImage} alt="QRIS Barcode" className="w-full max-w-[200px] mx-auto rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 mb-3" />
                <a 
                  href={qrisImage} 
                  download="QRIS-Nexphyrix.png"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                >
                  <Download className="w-4 h-4" /> Unduh QRIS
                </a>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6">
                <p className="text-xs text-blue-800 font-medium leading-relaxed">
                  Silakan lakukan pembayaran melalui QRIS di atas sesuai dengan total pesanan Anda. 
                  <br/><br/>
                  <b className="text-blue-900">PENTING:</b> Simpan (*screenshot*) bukti transfer Anda karena nantinya wajib dikirimkan ke Admin melalui Messenger atau Telegram untuk proses verifikasi!
                </p>
              </div>

              <button 
                onClick={() => setCheckoutStep('platform')}
                className="w-full btn btn-primary py-3 text-sm rounded-xl font-bold shadow-sm"
              >
                Sudah Bayar? Lanjutkan
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Pilih Metode Checkout</h2>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 md:p-6">
              <p className="text-center text-gray-500 dark:text-gray-400 text-xs md:text-sm mb-4 md:mb-6">
                Pilih platform chat untuk mengirim bukti pembayaran. Detail pesanan akan otomatis disalin ke clipboard Anda.
              </p>
              
              <div className="flex justify-center gap-4 md:gap-6">
                <button 
                  onClick={() => handleCheckout('messenger')}
                  disabled={isLoading}
                  className="flex flex-col items-center gap-2 md:gap-3 p-3 md:p-4 rounded-2xl hover:bg-gray-50 dark:bg-gray-800 transition-all duration-300 transform hover:scale-105 group disabled:opacity-50 disabled:hover:scale-100"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white dark:bg-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_8px_30px_rgba(0,106,255,0.3)] flex items-center justify-center transition-shadow">
                    <MessengerIcon />
                  </div>
                  <span className="font-bold text-sm md:text-base text-gray-700 dark:text-gray-300 group-hover:text-[#006AFF]">Messenger</span>
                </button>

                <button 
                  onClick={() => handleCheckout('telegram')}
                  disabled={isLoading}
                  className="flex flex-col items-center gap-2 md:gap-3 p-3 md:p-4 rounded-2xl hover:bg-gray-50 dark:bg-gray-800 transition-all duration-300 transform hover:scale-105 group disabled:opacity-50 disabled:hover:scale-100"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white dark:bg-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_8px_30px_rgba(42,171,238,0.3)] flex items-center justify-center transition-shadow">
                    <TelegramIcon />
                  </div>
                  <span className="font-bold text-sm md:text-base text-gray-700 dark:text-gray-300 group-hover:text-[#2AABEE]">Telegram</span>
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
