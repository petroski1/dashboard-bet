import { Filter, ArrowUpDown } from 'lucide-react';
import type { VideoCategory } from '../types';
import { useYouTube } from '../context/YouTubeContext';

const CATEGORIES: (VideoCategory | 'all')[] = [
  'all', 'Gaming', 'Music', 'Technology', 'Finance', 'Fitness',
  'Lifestyle', 'Education', 'Entertainment', 'News', 'Food',
  'Travel', 'Beauty', 'Sports', 'Science', 'Comedy',
];

const CATEGORY_LABELS: Record<string, string> = {
  all: 'Todas',
  Gaming: 'Games',
  Music: 'Música',
  Technology: 'Tecnologia',
  Finance: 'Finanças',
  Fitness: 'Fitness',
  Lifestyle: 'Lifestyle',
  Education: 'Educação',
  Entertainment: 'Entretenimento',
  News: 'Notícias',
  Food: 'Comida',
  Travel: 'Viagem',
  Beauty: 'Beleza',
  Sports: 'Esportes',
  Science: 'Ciência',
  Comedy: 'Comédia',
};

const SORT_OPTIONS = [
  { value: 'growthScore', label: 'Score' },
  { value: 'viewCount', label: 'Views' },
  { value: 'engagementRate', label: 'Engajamento' },
  { value: 'viewsPerHour', label: 'Views/Hora' },
] as const;

export default function FilterBar() {
  const { filters, setFilters, filteredVideos } = useYouTube();

  return (
    <div className="bg-gray-900/60 border-b border-gray-800 px-6 py-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Type filter */}
        <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
          {(['all', 'short', 'long'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilters({ type: t })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filters.type === t
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t === 'all' ? 'Todos' : t === 'short' ? '▶ Shorts' : '🎬 Longos'}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-gray-500" />
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilters({ category: cat })}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  filters.category === cat
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2">
          <ArrowUpDown size={13} className="text-gray-500" />
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ sortBy: e.target.value as typeof filters.sortBy })}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-600"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setFilters({ sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc' })}
            className="px-2.5 py-1.5 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white text-xs rounded-lg transition-colors"
          >
            {filters.sortOrder === 'desc' ? '↓ Maior' : '↑ Menor'}
          </button>
          <span className="text-xs text-gray-600 ml-2">{filteredVideos.length} vídeos</span>
        </div>
      </div>
    </div>
  );
}
