import { useState } from 'react';
import { ExternalLink, Eye, ThumbsUp, MessageCircle, Clock, TrendingUp } from 'lucide-react';
import type { YouTubeVideo } from '../types';

interface Props {
  video: YouTubeVideo;
  rank?: number;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function formatDuration(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m < 60) return `${m}:${String(sec).padStart(2, '0')}`;
  const h = Math.floor(m / 60);
  return `${h}:${String(m % 60).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function scoreColor(score: number): string {
  if (score >= 75) return 'text-green-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-orange-400';
}

export default function VideoCard({ video, rank }: Props) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-all duration-200 hover:shadow-lg hover:shadow-black/30">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-800 overflow-hidden">
        {!imgError ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center">
              <div className="text-4xl mb-2">🎬</div>
              <p className="text-gray-500 text-xs">Thumbnail indisponível</p>
            </div>
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {rank && (
          <div className="absolute top-2 left-2 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
            {rank}
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-1.5">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              video.type === 'short'
                ? 'bg-purple-600/90 text-white'
                : 'bg-blue-600/90 text-white'
            }`}
          >
            {video.type === 'short' ? 'Short' : 'Longo'}
          </span>
        </div>

        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-mono">
          {formatDuration(video.durationSeconds)}
        </div>

        <div className="absolute bottom-2 left-2">
          <span className="text-xs text-gray-300 bg-black/60 px-1.5 py-0.5 rounded">
            {video.hoursAgo}h atrás
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-red-400 transition-colors">
            {video.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{video.channelName}</p>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Eye size={11} className="text-gray-500" />
            <span>{formatCount(video.viewCount)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <ThumbsUp size={11} className="text-gray-500" />
            <span>{formatCount(video.likeCount)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MessageCircle size={11} className="text-gray-500" />
            <span>{formatCount(video.commentCount)}</span>
          </div>
        </div>

        {/* Growth metrics */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-800">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={12} className="text-green-400" />
            <span className="text-xs text-gray-400">
              <span className="text-white font-medium">{formatCount(Math.floor(video.viewsPerHour))}</span>
              /h
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-gray-500" />
            <span className="text-xs text-gray-500">{video.engagementRate}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">Score</span>
            <span className={`text-xs font-bold ${scoreColor(video.growthScore)}`}>
              {video.growthScore}
            </span>
          </div>
        </div>

        {/* CTA */}
        <a
          href={video.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-red-600/10 hover:bg-red-600 border border-red-600/30 hover:border-red-600 text-red-400 hover:text-white text-xs font-medium transition-all duration-200"
        >
          <ExternalLink size={12} />
          Ver no YouTube
        </a>
      </div>
    </div>
  );
}
