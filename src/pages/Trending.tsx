import FilterBar from '../components/FilterBar';
import VideoCard from '../components/VideoCard';
import { useYouTube } from '../context/YouTubeContext';
import { TrendingUp, Video } from 'lucide-react';

export default function Trending() {
  const { filteredVideos, videos } = useYouTube();

  const shortsCount = videos.filter((v) => v.type === 'short').length;
  const longsCount = videos.filter((v) => v.type === 'long').length;

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-1">
          <TrendingUp size={22} className="text-red-400" />
          <h1 className="text-xl font-bold text-white">Vídeos em Alta</h1>
        </div>
        <p className="text-gray-500 text-sm">
          {videos.length} vídeos rastreados nas últimas 48 horas ·{' '}
          <span className="text-purple-400">{shortsCount} Shorts</span> ·{' '}
          <span className="text-blue-400">{longsCount} Longos</span>
        </p>
      </div>

      {/* Filters */}
      <FilterBar />

      {/* Grid */}
      <div className="flex-1 overflow-auto p-6">
        {filteredVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Video size={48} className="text-gray-700 mb-4" />
            <p className="text-gray-500 font-medium">Nenhum vídeo encontrado</p>
            <p className="text-gray-600 text-sm mt-1">Tente alterar os filtros aplicados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredVideos.map((v, i) => (
              <VideoCard key={v.id} video={v} rank={i + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
