import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { storage, Notification } from '../services/storage';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    const notifs = await storage.getNotifications(user.id);
    setNotifications(notifs);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s polling
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await storage.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    for (const notif of unread) {
      await storage.markNotificationAsRead(notif.id);
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleToggle = () => {
    if (!isOpen && notifications.some(n => !n.is_read)) {
      markAllAsRead();
    }
    setIsOpen(!isOpen);
  };

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className="relative p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0B1120]"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 animate-fade-in origin-top-right">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notifikasi</h3>
            {notifications.length > 0 && (
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {notifications.length}
              </span>
            )}
          </div>
          
          <div className="max-h-[350px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center h-48">
                <Bell className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-xs font-medium">Belum ada notifikasi.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`relative p-4 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group ${!notif.is_read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 pr-6">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1">{notif.title}</h4>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">{notif.message}</p>
                        <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-2 font-medium">
                          {new Date(notif.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(notif.id, e)}
                      className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                      title="Hapus"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
