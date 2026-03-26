import { Youtube } from 'lucide-react';

interface Props {
  error?: string | null;
  onRetry?: () => void;
}

export default function LoadingScreen({ error, onRetry }: Props) {
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-red-600/20 border border-red-600/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-white font-bold text-lg mb-2">Erro ao buscar dados</h2>
          <p className="text-gray-400 text-sm mb-5 leading-relaxed">{error}</p>
          <div className="flex gap-3 justify-center">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors"
              >
                Tentar novamente
              </button>
            )}
            <button
              onClick={() => { localStorage.removeItem('yt_api_key'); window.location.reload(); }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
            >
              Trocar API Key
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-600/30 animate-pulse">
          <Youtube size={30} className="text-white" />
        </div>
        <h2 className="text-white font-semibold mb-2">Buscando tendências do YouTube</h2>
        <p className="text-gray-500 text-sm mb-6">Analisando vídeos em alta nas últimas 48h...</p>
        <div className="flex gap-1.5 justify-center">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1.5 h-6 bg-red-600 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
