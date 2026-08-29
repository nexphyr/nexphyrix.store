import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const FloatingCart = () => {
  const { totalItems, setIsCartOpen } = useCart();

  if (totalItems === 0) return null;

  return (
    <button
      onClick={() => setIsCartOpen(true)}
      className="fixed bottom-[clamp(16px,3vw,32px)] right-[clamp(16px,3vw,32px)] z-40 bg-primary text-white p-3 md:p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
    >
      <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
      <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white text-[10px] md:text-xs font-bold w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
        {totalItems}
      </div>
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-full bg-primary opacity-0 group-hover:opacity-40 blur-lg transition-opacity duration-300 -z-10"></div>
    </button>
  );
};

export default FloatingCart;
