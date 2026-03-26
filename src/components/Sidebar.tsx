import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, BarChart3, Heart, FileDown, Youtube, RefreshCw, Settings } from 'lucide-react';
import { useYouTube } from '../context/YouTubeContext';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/trending', icon: TrendingUp, label: 'Em Alta' },
  { to: '/niches', icon: BarChart3, label: 'Análise de Nichos' },
  { to: '/favorites', icon: Heart, label: 'Favoritos' },
  { to: '/reports', icon: FileDown, label: 'Exportar' },
];

export default function Sidebar() {
  const { isRefreshing, refresh, lastUpdated, stats } = useYouTube();

  const timeAgo = lastUpdated
    ? Math.floor((Date.now() - lastUpdated.getTime()) / 60000)
    : null;

  function clearKey() {
    localStorage.removeItem('yt_api_key');
    window.location.reload();
  }

  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
            <Youtube size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">TrendScope</p>
            <p className="text-gray-500 text-xs">YouTube Analytics</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-red-600/15 text-red-400 border border-red-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 space-y-3">
        <div className="bg-gray-900 rounded-lg p-3 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Vídeos rastreados</span>
            <span className="text-white font-semibold">{stats.totalVideosTracked}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Atualizado</span>
            <span className="text-gray-400">
              {timeAgo === null ? '—' : timeAgo === 0 ? 'Agora' : `${timeAgo}m atrás`}
            </span>
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={isRefreshing}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Atualizando...' : 'Atualizar dados'}
        </button>
        <button
          onClick={clearKey}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-600 hover:text-gray-400 text-xs transition-colors border border-gray-800"
        >
          <Settings size={12} />
          Trocar API Key
        </button>
      </div>
    </aside>
  );
}
