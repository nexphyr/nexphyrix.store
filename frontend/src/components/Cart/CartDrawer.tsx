import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatRupiah, createOrderInDatabase } from '../../lib/checkout';
import { useState } from 'react';

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, totalAmount, memberDiscount, finalTotal, totalItems, clearCart, setIsCheckoutOpen, setPendingOrderData, addToast } = useCart();
  const { user, signInWithGoogle } = useAuth();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const handleCheckoutClick = async () => {
    if (!user) {
      addToast("Silakan masuk dengan Google terlebih dahulu untuk checkout.");
      return;
    }
    
    setIsCreatingOrder(true);
    try {
      // Buat order dengan metode 'pending' terlebih dahulu
      const orderData = await createOrderInDatabase(cart, 'pending');
      setPendingOrderData(orderData);
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
    } catch (error: any) {
      addToast(error.message || "Gagal membuat pesanan");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[400px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Keranjang Belanja</h2>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
              <p className="font-medium text-gray-600 dark:text-gray-400">Keranjang kamu masih kosong.</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="mt-4 text-primary font-bold hover:underline"
              >
                Lihat Produk
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex flex-col p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 relative group">
                <div className="pr-8">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-primary font-extrabold text-sm">{formatRupiah(item.priceValue)}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                  title="Hapus produk"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{cart.length} Produk</span>
              <button 
                onClick={clearCart}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Kosongkan Keranjang
              </button>
            </div>
            
            <div className="flex justify-between items-end mb-2">
              <span className="text-gray-600 dark:text-gray-400 font-bold">Subtotal ({totalItems} Item)</span>
              <span className="text-lg font-bold text-gray-700 dark:text-gray-300">{formatRupiah(totalAmount)}</span>
            </div>

            {user ? (
              // MEMBER UI
              <>
                {memberDiscount > 0 && (
                  <div className="flex justify-between items-end mb-2 text-green-600">
                    <span className="font-bold flex flex-col">
                      <span>Diskon Member Aktif</span>
                      <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded w-fit mt-1 uppercase tracking-wider">
                        {user.has_used_new_user_promo === false ? 'Promo Pengguna Baru' : 'Promo Reguler'}
                      </span>
                    </span>
                    <span className="font-bold">- {formatRupiah(memberDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-end mb-6 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-gray-900 dark:text-white font-black text-lg">Total Pembayaran</span>
                  <span className="text-2xl font-black text-gray-900 dark:text-white">{formatRupiah(finalTotal)}</span>
                </div>
              </>
            ) : (
              // GUEST UI
              <>
                <div className="flex justify-between items-end mb-6 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-gray-900 dark:text-white font-black text-lg">Total Pembayaran</span>
                  <span className="text-2xl font-black text-gray-900 dark:text-white">{formatRupiah(totalAmount)}</span>
                </div>
                
                {totalItems >= 6 && (
                  <div className="mb-4 bg-blue-50 border border-blue-100 rounded-xl p-3 flex flex-col items-center text-center gap-2">
                    <p className="text-sm text-blue-800 font-medium">
                      Login dengan Google sekarang untuk mendapatkan promo pengguna baru (Beli 5 Gratis 1) dan hemat <b>Rp 10.000</b>!
                    </p>
                    <button 
                      onClick={signInWithGoogle}
                      className="text-xs bg-white dark:bg-gray-900 text-blue-600 font-bold px-4 py-1.5 rounded-full border border-blue-200 shadow-sm hover:shadow transition-shadow"
                    >
                      Masuk dengan Google
                    </button>
                  </div>
                )}
              </>
            )}

            <button
              onClick={handleCheckoutClick}
              disabled={isCreatingOrder}
              className="w-full btn btn-primary py-3 text-lg rounded-xl shadow-primary/30 disabled:opacity-50"
            >
              {isCreatingOrder ? 'MEMPROSES...' : 'CHECKOUT'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
