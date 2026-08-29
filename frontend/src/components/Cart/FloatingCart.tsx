import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const FloatingCart = () => {
  const { totalItems, setIsCartOpen } = useCart();

  if (totalItems === 0) return null;

  return (
    <button
      onClick={() => setIsCartOpen(true)}
      className="fixed bottom-6 right-6 z-40 bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
    >
      <ShoppingCart className="w-6 h-6" />
      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
        {totalItems}
      </div>
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-full bg-primary opacity-0 group-hover:opacity-40 blur-lg transition-opacity duration-300 -z-10"></div>
    </button>
  );
};

export default FloatingCart;
