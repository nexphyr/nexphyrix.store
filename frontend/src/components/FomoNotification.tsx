import React, { useState, useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { storage } from '../services/storage';

const NAMES = [
  'Budi', 'Andi', 'Siti', 'Rizky', 'Agus', 'Putra', 'Dewi', 'Ayu', 'Reza', 
  'Fajar', 'Diki', 'Hendra', 'Wahyu', 'Nia', 'Dimas', 'Aditya', 'Rina', 'Yudi',
  'Fadhil', 'Rangga', 'Iqbal', 'Arief', 'Dian', 'Sari', 'Indra', 'Gilang'
];

const CITIES = [
  'Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Semarang', 'Makassar', 
  'Yogyakarta', 'Malang', 'Bali', 'Palembang', 'Balikpapan', 'Samarinda',
  'Pontianak', 'Banjarmasin', 'Manado', 'Padang', 'Pekanbaru', 'Bogor'
];

interface NotificationData {
  name: string;
  city: string;
  game: string;
  timeAgo: number;
}

const FomoNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState<NotificationData | null>(null);
  const [games, setGames] = useState<string[]>([]);

  useEffect(() => {
    // Fetch all public links to use their titles
    const fetchGames = async () => {
      try {
        const links = await storage.getLinks(false);
        if (links.length > 0) {
          setGames(links.map(l => l.title));
        } else {
          setGames(['GTA V Mod Nusantara', 'eFootball 2024 Patch', 'God of War Sub Indo']);
        }
      } catch (e) {
        setGames(['GTA V Mod Nusantara', 'eFootball 2024 Patch', 'God of War Sub Indo']);
      }
    };
    
    fetchGames();
  }, []);

  useEffect(() => {
    if (games.length === 0) return;

    const triggerNotification = () => {
      // Generate random data
      const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
      const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
      const randomGame = games[Math.floor(Math.random() * games.length)];
      const randomTime = Math.floor(Math.random() * 58) + 1; // 1 to 59 minutes

      setData({
        name: randomName,
        city: randomCity,
        game: randomGame,
        timeAgo: randomTime,
      });

      setIsVisible(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    // Initial delay before first popup (10 seconds)
    const initialTimer = setTimeout(() => {
      triggerNotification();

      // Set recurring timer every 25 to 45 seconds
      const interval = setInterval(() => {
        triggerNotification();
      }, Math.floor(Math.random() * 20000) + 25000);

      return () => clearInterval(interval);
    }, 10000);

    return () => clearTimeout(initialTimer);
  }, [games]);

  if (!data) return null;

  return (
    <div 
      className={`fixed bottom-4 left-4 z-50 transition-all duration-700 ease-in-out transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl rounded-2xl p-4 pr-10 flex items-center gap-4 max-w-sm relative overflow-hidden group">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center relative">
          <ShoppingBag className="w-6 h-6 text-green-600 dark:text-green-400" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full animate-ping"></span>
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
            <span className="font-bold text-gray-900 dark:text-gray-100">{data.name}</span> dari <span className="font-semibold">{data.city}</span>
          </p>
          <p className="text-sm font-bold text-primary truncate">
            Baru saja membeli
          </p>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate mt-0.5" title={data.game}>
            {data.game}
          </p>
          <p className="text-[10px] text-gray-400 mt-1 font-medium">
            {data.timeAgo} menit yang lalu
          </p>
        </div>
      </div>
    </div>
  );
};

export default FomoNotification;
