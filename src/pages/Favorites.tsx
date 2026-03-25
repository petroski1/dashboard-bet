import { Heart, Trash2, Clock } from 'lucide-react';
import { useYouTube } from '../context/YouTubeContext';
import NicheCard from '../components/NicheCard';
import VideoCard from '../components/VideoCard';

export default function Favorites() {
  const { niches, favorites, toggleFavorite, videos } = useYouTube();

  const favoriteNiches = niches.filter((n) => favorites.some((f) => f.nicheId === n.id));

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Heart size={22} className="text-red-400 fill-red-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Nichos Favoritos</h1>
          <p className="text-gray-500 text-sm">{favoriteNiches.length} nicho(s) salvo(s)</p>
        </div>
      </div>

      {favoriteNiches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Heart size={52} className="text-gray-700 mb-4" />
          <h2 className="text-gray-400 text-lg font-semibold mb-2">Nenhum favorito ainda</h2>
          <p className="text-gray-600 text-sm max-w-sm">
            Clique no ícone de coração em qualquer nicho para salvá-lo aqui.
            Acesse <a href="/niches" className="text-red-400 hover:text-red-300 underline">Análise de Nichos</a> para explorar.
          </p>
        </div>
      ) : (
        <>
          {/* Favorite niches grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favoriteNiches.map((n) => {
              const saved = favorites.find((f) => f.nicheId === n.id);
              return (
                <div key={n.id} className="relative">
                  <NicheCard niche={n} />
                  <div className="mt-2 flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Clock size={11} />
                      <span>
                        Salvo {saved ? new Date(saved.savedAt).toLocaleDateString('pt-BR') : '—'}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleFavorite(n.id)}
                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />
                      Remover
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top videos from favorite niches */}
          <div>
            <h2 className="text-white font-semibold mb-4">Vídeos dos seus Nichos Favoritos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos
                .filter((v) => favoriteNiches.some((n) => n.name === v.category))
                .sort((a, b) => b.growthScore - a.growthScore)
                .slice(0, 8)
                .map((v) => (
                  <VideoCard key={v.id} video={v} />
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
