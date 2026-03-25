import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { YouTubeVideo, Niche, FilterOptions, FavoriteNiche, AIRecommendation, DashboardStats } from '../types';
import { MOCK_VIDEOS } from '../utils/mockData';
import { buildNiches, generateAIRecommendation } from '../services/aiAnalysis';

interface YouTubeContextType {
  videos: YouTubeVideo[];
  filteredVideos: YouTubeVideo[];
  niches: Niche[];
  recommendation: AIRecommendation | null;
  stats: DashboardStats;
  filters: FilterOptions;
  favorites: FavoriteNiche[];
  isRefreshing: boolean;
  lastUpdated: Date;
  setFilters: (f: Partial<FilterOptions>) => void;
  toggleFavorite: (nicheId: string) => void;
  isFavorite: (nicheId: string) => boolean;
  refresh: () => void;
  exportCSV: () => void;
}

const YouTubeContext = createContext<YouTubeContextType | null>(null);

const DEFAULT_FILTERS: FilterOptions = {
  type: 'all',
  category: 'all',
  sortBy: 'growthScore',
  sortOrder: 'desc',
  minViews: 0,
};

function applyFilters(videos: YouTubeVideo[], filters: FilterOptions): YouTubeVideo[] {
  let result = [...videos];

  if (filters.type !== 'all') {
    result = result.filter((v) => v.type === filters.type);
  }
  if (filters.category !== 'all') {
    result = result.filter((v) => v.category === filters.category);
  }
  if (filters.minViews > 0) {
    result = result.filter((v) => v.viewCount >= filters.minViews);
  }

  result.sort((a, b) => {
    const field = filters.sortBy;
    const diff = a[field] - b[field];
    return filters.sortOrder === 'desc' ? -diff : diff;
  });

  return result;
}

export function YouTubeProvider({ children }: { children: ReactNode }) {
  const [videos] = useState<YouTubeVideo[]>(MOCK_VIDEOS);
  const [filters, setFiltersState] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [favorites, setFavorites] = useState<FavoriteNiche[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('yt_favorites') ?? '[]');
    } catch {
      return [];
    }
  });

  const filteredVideos = applyFilters(videos, filters);
  const niches = buildNiches(videos);
  const recommendation = niches.length > 0 ? generateAIRecommendation(niches, videos) : null;

  const stats: DashboardStats = {
    totalVideosTracked: videos.length,
    totalViewsLast48h: videos.reduce((s, v) => s + v.viewCount, 0),
    avgEngagementRate: parseFloat(
      (videos.reduce((s, v) => s + v.engagementRate, 0) / videos.length).toFixed(2)
    ),
    topGrowthNiche: niches[0]?.name ?? '',
    lastUpdated,
  };

  const setFilters = useCallback((partial: Partial<FilterOptions>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const toggleFavorite = useCallback((nicheId: string) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.nicheId === nicheId);
      const next = exists
        ? prev.filter((f) => f.nicheId !== nicheId)
        : [...prev, { nicheId, savedAt: new Date(), notes: '' }];
      localStorage.setItem('yt_favorites', JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (nicheId: string) => favorites.some((f) => f.nicheId === nicheId),
    [favorites]
  );

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1800);
  }, []);

  const exportCSV = useCallback(() => {
    const headers = ['Título', 'Canal', 'Categoria', 'Tipo', 'Visualizações', 'Likes', 'Comentários', 'Engajamento%', 'Views/Hora', 'Score'];
    const rows = filteredVideos.map((v) => [
      `"${v.title}"`,
      `"${v.channelName}"`,
      v.category,
      v.type,
      v.viewCount,
      v.likeCount,
      v.commentCount,
      v.engagementRate,
      v.viewsPerHour,
      v.growthScore,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-trends-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredVideos]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const id = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <YouTubeContext.Provider
      value={{
        videos,
        filteredVideos,
        niches,
        recommendation,
        stats,
        filters,
        favorites,
        isRefreshing,
        lastUpdated,
        setFilters,
        toggleFavorite,
        isFavorite,
        refresh,
        exportCSV,
      }}
    >
      {children}
    </YouTubeContext.Provider>
  );
}

export function useYouTube() {
  const ctx = useContext(YouTubeContext);
  if (!ctx) throw new Error('useYouTube must be used inside YouTubeProvider');
  return ctx;
}
