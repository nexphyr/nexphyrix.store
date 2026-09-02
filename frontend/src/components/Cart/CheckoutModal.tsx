import { X, QrCode, Download } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { formatRupiah } from '../../lib/checkout';
import qrisImage from '../../assets/qris.png';
import OrderTimer from '../OrderTimer';

const CheckoutModal = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, pendingOrderData, orderExpiryMinutes } = useCart();

  if (!isCheckoutOpen) return null;

  const displayTotal = pendingOrderData?.total || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" /> Pembayaran QRIS
          </h2>
          <button onClick={() => setIsCheckoutOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {pendingOrderData?.created_at && (
          <div className="bg-amber-50 dark:bg-amber-900/20 px-5 py-2.5 flex justify-center border-b border-amber-100 dark:border-amber-800">
            <OrderTimer 
              createdAt={pendingOrderData.created_at} 
              expiryMinutes={orderExpiryMinutes}
              className="text-lg"
            />
          </div>
        )}

        <div className="p-4 md:p-6 text-center">
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Tagihan:</p>
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
              <b className="text-blue-900">PENTING:</b> Simpan (*screenshot*) bukti transfer Anda karena nantinya wajib dikirimkan ke Admin untuk proses verifikasi.
            </p>
          </div>

          <button 
            onClick={() => setIsCheckoutOpen(false)}
            className="w-full btn btn-primary py-3 text-sm rounded-xl font-bold shadow-sm"
          >
            Tutup & Cek Pesanan
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
