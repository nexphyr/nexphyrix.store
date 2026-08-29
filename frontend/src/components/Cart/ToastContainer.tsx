import { useCart } from '../../contexts/CartContext';

const ToastContainer = () => {
  const { toasts } = useCart();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium animate-fade-in-up flex items-center pointer-events-auto"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
