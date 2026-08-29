import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, User, ShoppingBag, LogOut, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import profileImage from '../assets/profile.png';

const AuthMenu = () => {
  const { user, signInWithGoogle, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button 
        onClick={signInWithGoogle}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md text-sm font-bold"
      >
        <LogIn className="w-4 h-4" />
        <span className="hidden sm:inline">Masuk dengan Google</span>
        <span className="sm:hidden">Masuk</span>
      </button>
    );
  }

  return (
    <div className="relative z-50" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white p-1 pr-3 rounded-full transition-all shadow-sm hover:shadow-md"
      >
        {user.role === 'admin' ? (
          <img src={profileImage} alt="Admin" className="w-8 h-8 rounded-full border border-white/40" />
        ) : user.avatar_url ? (
          <img src={user.avatar_url} alt={user.full_name || 'User avatar'} className="w-8 h-8 rounded-full border border-white/40" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border border-white/40">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
        <span className="text-sm font-bold hidden sm:block max-w-[100px] truncate">{user.role === 'admin' ? 'Admin' : (user.full_name || user.email?.split('@')[0])}</span>
        
        {/* Badge */}
        {user.role === 'admin' ? (
          <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider hidden sm:block">
            SUPER ADMIN
          </span>
        ) : (
          <span className="bg-yellow-400 text-yellow-900 text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider hidden sm:block">
            MEMBER
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transform origin-top-right animate-fade-in">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50">
            <p className="font-bold text-gray-900 dark:text-white truncate">{user.full_name || 'Member'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            {user.role === 'admin' && (
               <span className="mt-2 inline-flex items-center gap-1 bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                 <ShieldCheck className="w-3 h-3" /> Admin
               </span>
            )}
          </div>
          
          <div className="py-2">
            <Link 
              to="/profile" 
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 hover:text-primary transition-colors"
            >
              <User className="w-4 h-4" />
              Profil Saya
            </Link>
            
            <Link 
              to="/profile" 
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 hover:text-primary transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Pesanan Saya
            </Link>

            {user.role === 'admin' && (
               <Link 
                 to="/admin" 
                 className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 hover:text-primary transition-colors"
               >
                 <ShieldCheck className="w-4 h-4" />
                 Admin Panel
               </Link>
            )}
          </div>
          
          <div className="border-t border-gray-50 py-2">
            <button 
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthMenu;
