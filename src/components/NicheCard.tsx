import { TrendingUp, TrendingDown, Minus, Heart, Eye, Zap, DollarSign } from 'lucide-react';
import type { Niche } from '../types';
import { useYouTube } from '../context/YouTubeContext';

interface Props {
  niche: Niche;
  rank?: number;
  compact?: boolean;
}

function formatCount(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

export default function NicheCard({ niche, rank, compact = false }: Props) {
  const { toggleFavorite, isFavorite } = useYouTube();
  const fav = isFavorite(niche.id);

  const TrendIcon =
    niche.trendDirection === 'up'
      ? TrendingUp
      : niche.trendDirection === 'down'
      ? TrendingDown
      : Minus;
  const trendColor =
    niche.trendDirection === 'up'
      ? 'text-green-400'
      : niche.trendDirection === 'down'
      ? 'text-red-400'
      : 'text-gray-400';

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors">
        <span className="text-2xl">{niche.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white truncate">{niche.name}</p>
            <div className={`flex items-center gap-0.5 text-xs ${trendColor}`}>
              <TrendIcon size={11} />
              <span>{Math.abs(niche.trendPercent).toFixed(0)}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">{formatCount(niche.totalViews)} views · {niche.videoCount} vídeos</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-green-400">{niche.growthScore.toFixed(0)}</p>
          <p className="text-xs text-gray-500">score</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all duration-200 hover:shadow-lg hover:shadow-black/20">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {rank && (
            <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-500">
              #{rank}
            </span>
          )}
          <span className="text-3xl">{niche.emoji}</span>
          <div>
            <h3 className="text-white font-bold">{niche.name}</h3>
            <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
              <TrendIcon size={12} />
              <span>
                {niche.trendDirection === 'up' ? '+' : ''}
                {niche.trendPercent.toFixed(1)}% nas últimas 48h
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => toggleFavorite(niche.id)}
          className={`p-1.5 rounded-lg transition-colors ${
            fav ? 'text-red-400 bg-red-600/10' : 'text-gray-600 hover:text-gray-400'
          }`}
        >
          <Heart size={16} className={fav ? 'fill-current' : ''} />
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-800/50 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Eye size={11} className="text-gray-500" />
            <span className="text-xs text-gray-500">Total Views</span>
          </div>
          <p className="text-white font-bold text-sm">{formatCount(niche.totalViews)}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Zap size={11} className="text-gray-500" />
            <span className="text-xs text-gray-500">Views/Hora</span>
          </div>
          <p className="text-white font-bold text-sm">{formatCount(Math.floor(niche.avgViewsPerHour))}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <DollarSign size={11} className="text-gray-500" />
            <span className="text-xs text-gray-500">CPM est.</span>
          </div>
          <p className="text-white font-bold text-sm">~${niche.cpmEstimate}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2.5">
          <span className="text-xs text-gray-500">Engajamento</span>
          <p className="text-white font-bold text-sm">{niche.avgEngagement.toFixed(1)}%</p>
        </div>
      </div>

      {/* Score bars */}
      <div className="space-y-2.5">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Crescimento</span>
            <span className="text-green-400 font-medium">{niche.growthScore.toFixed(0)}/100</span>
          </div>
          <ScoreBar value={niche.growthScore} color="bg-green-500" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Monetização</span>
            <span className="text-yellow-400 font-medium">{niche.monetizationScore.toFixed(0)}/100</span>
          </div>
          <ScoreBar value={niche.monetizationScore} color="bg-yellow-500" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Potencial Viral</span>
            <span className="text-purple-400 font-medium">{niche.viralPotential.toFixed(0)}/100</span>
          </div>
          <ScoreBar value={niche.viralPotential} color="bg-purple-500" />
        </div>
      </div>

      {/* Format distribution */}
      <div className="mt-4 flex gap-2 text-xs">
        <span className="px-2 py-1 bg-purple-600/15 text-purple-400 rounded-lg border border-purple-600/20">
          {niche.shortCount} Shorts
        </span>
        <span className="px-2 py-1 bg-blue-600/15 text-blue-400 rounded-lg border border-blue-600/20">
          {niche.longCount} Longos
        </span>
        <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded-lg">
          {niche.videoCount} total
        </span>
      </div>
    </div>
  );
}
