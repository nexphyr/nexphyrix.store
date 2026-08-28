import { useState, useEffect } from 'react';
import { Link2, Folder, Gamepad2, Clock } from 'lucide-react';
import { storage } from '../../services/storage';

interface Stats {
  totalLinks: number;
  totalCategories: number;
  ps4LinksCount: number;
  recentLinks: Array<{ id: number; title: string; category: { name: string } }>;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const allLinks = await storage.getLinks(true);
      const allCats = await storage.getCategories();
      
      const ps4Cat = allCats.find(c => c.slug === 'ps4-sub-indo');
      const ps4LinksCount = ps4Cat ? allLinks.filter(l => l.category_id === ps4Cat.id).length : 0;
      
      // Get 5 most recent links
      const sortedLinks = [...allLinks].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 5);

      const recentLinks = sortedLinks.map(link => ({
        id: link.id,
        title: link.title,
        category: { name: allCats.find(c => c.id === link.category_id)?.name || 'Unknown' }
      }));

      setStats({
        totalLinks: allLinks.length,
        totalCategories: allCats.length,
        ps4LinksCount,
        recentLinks
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!stats) return <div>Error loading stats.</div>;

  const statCards = [
    { name: 'Total Link', value: stats.totalLinks, icon: Link2, color: 'bg-primary' },
    { name: 'Total Kategori', value: stats.totalCategories, icon: Folder, color: 'bg-indigo-500' },
    { name: 'Link PS4', value: stats.ps4LinksCount, icon: Gamepad2, color: 'bg-blue-400' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="glass-card rounded-2xl p-6 flex items-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.color} opacity-10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150`}></div>
            <div className={`p-4 rounded-xl ${stat.color} text-white mr-5 shadow-lg relative z-10`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{stat.name}</p>
              <p className="text-4xl font-extrabold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden mt-10">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center bg-white/50">
          <Clock className="w-5 h-5 text-primary mr-3" />
          <h2 className="text-lg font-bold text-gray-900">Link Terbaru</h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {stats.recentLinks.map((link) => (
            <li key={link.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{link.title}</p>
                <p className="text-sm text-gray-500">{link.category.name}</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Baru
              </span>
            </li>
          ))}
          {stats.recentLinks.length === 0 && (
            <li className="px-6 py-4 text-sm text-gray-500">Belum ada link.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
