import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { YouTubeVideo, Niche, FilterOptions, FavoriteNiche, AIRecommendation, DashboardStats } from '../types';
import { fetchTrendingVideos } from '../services/youtubeApi';
import { buildNiches, generateAIRecommendation } from '../services/aiAnalysis';

interface YouTubeContextType {
  videos: YouTubeVideo[];
  filteredVideos: YouTubeVideo[];
  niches: Niche[];
  recommendation: AIRecommendation | null;
  stats: DashboardStats;
  filters: FilterOptions;
  favorites: FavoriteNiche[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  apiKey: string;
  setApiKey: (key: string) => void;
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
  if (filters.type !== 'all') result = result.filter((v) => v.type === filters.type);
  if (filters.category !== 'all') result = result.filter((v) => v.category === filters.category);
  if (filters.minViews > 0) result = result.filter((v) => v.viewCount >= filters.minViews);
  result.sort((a, b) => {
    const diff = a[filters.sortBy] - b[filters.sortBy];
    return filters.sortOrder === 'desc' ? -diff : diff;
  });
  return result;
}

function loadApiKey(): string {
  return localStorage.getItem('yt_api_key') ?? import.meta.env.VITE_YOUTUBE_API_KEY ?? '';
}

export function YouTubeProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [filters, setFiltersState] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [apiKey, setApiKeyState] = useState<string>(loadApiKey);
  const [favorites, setFavorites] = useState<FavoriteNiche[]>(() => {
    try { return JSON.parse(localStorage.getItem('yt_favorites') ?? '[]'); }
    catch { return []; }
  });

  const setApiKey = useCallback((key: string) => {
    const trimmed = key.trim();
    localStorage.setItem('yt_api_key', trimmed);
    setApiKeyState(trimmed);
  }, []);

  const load = useCallback(async (showRefreshing = false) => {
    if (!apiKey) return;
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTrendingVideos(apiKey);
      setVideos(data);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao buscar dados do YouTube');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [apiKey]);

  // Load when API key is set/changed
  useEffect(() => {
    if (apiKey) load(false);
  }, [apiKey, load]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    if (!apiKey) return;
    const id = setInterval(() => load(true), 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [apiKey, load]);

  const filteredVideos = applyFilters(videos, filters);
  const niches = buildNiches(videos);
  const recommendation = niches.length > 0 ? generateAIRecommendation(niches, videos) : null;

  const stats: DashboardStats = {
    totalVideosTracked: videos.length,
    totalViewsLast48h: videos.reduce((s, v) => s + v.viewCount, 0),
    avgEngagementRate: videos.length
      ? parseFloat((videos.reduce((s, v) => s + v.engagementRate, 0) / videos.length).toFixed(2))
      : 0,
    topGrowthNiche: niches[0]?.name ?? '',
    lastUpdated: lastUpdated ?? new Date(),
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

  const refresh = useCallback(() => load(true), [load]);

  const exportCSV = useCallback(() => {
    const headers = ['Título', 'Canal', 'Categoria', 'Tipo', 'Visualizações', 'Likes', 'Comentários', 'Engajamento%', 'Views/Hora', 'Score'];
    const rows = filteredVideos.map((v) => [
      `"${v.title.replace(/"/g, '""')}"`,
      `"${v.channelName.replace(/"/g, '""')}"`,
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

  return (
    <YouTubeContext.Provider
      value={{
        videos, filteredVideos, niches, recommendation, stats, filters, favorites,
        isLoading, isRefreshing, error, lastUpdated, apiKey,
        setApiKey, setFilters, toggleFavorite, isFavorite, refresh, exportCSV,
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
