import type { YouTubeVideo, VideoCategory } from '../types';

const BASE = 'https://www.googleapis.com/youtube/v3';

// YouTube category ID → our VideoCategory
const CATEGORY_MAP: Record<string, VideoCategory> = {
  '1': 'Entertainment',
  '2': 'Lifestyle',
  '10': 'Music',
  '15': 'Lifestyle',
  '17': 'Sports',
  '19': 'Travel',
  '20': 'Gaming',
  '22': 'Lifestyle',
  '23': 'Comedy',
  '24': 'Entertainment',
  '25': 'News',
  '26': 'Beauty',
  '27': 'Education',
  '28': 'Technology',
  '29': 'Lifestyle',
};

// IDs of YouTube categories we want to include in multi-fetch
const CATEGORY_IDS_TO_FETCH = ['20', '10', '28', '17', '24', '25', '23', '26', '27'];

function parseDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] ?? '0') * 3600) + (parseInt(m[2] ?? '0') * 60) + parseInt(m[3] ?? '0');
}

function isShort(duration: number, tags: string[], description: string): boolean {
  if (duration > 0 && duration <= 60) return true;
  const combined = (tags.join(' ') + ' ' + description).toLowerCase();
  return combined.includes('#shorts') || combined.includes('#short');
}

function calcEngagement(views: number, likes: number, comments: number): number {
  if (views === 0) return 0;
  return parseFloat((((likes + comments) / views) * 100).toFixed(2));
}

function calcGrowthScore(viewsPerHour: number, engagement: number, hoursAgo: number): number {
  const recencyBoost = Math.max(0, 1 - hoursAgo / 48);
  const raw = (viewsPerHour / 10_000) * 25 + engagement * 3 + recencyBoost * 20;
  return Math.min(100, parseFloat(raw.toFixed(1)));
}

interface RawItem {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    channelId: string;
    publishedAt: string;
    categoryId: string;
    thumbnails: { maxres?: { url: string }; high?: { url: string }; medium?: { url: string }; default?: { url: string } };
    tags?: string[];
    description?: string;
  };
  contentDetails: { duration: string };
  statistics: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

function mapItem(item: RawItem): YouTubeVideo {
  const now = Date.now();
  const publishedAt = new Date(item.snippet.publishedAt);
  const hoursAgo = Math.max(0.5, (now - publishedAt.getTime()) / 3_600_000);

  const views = parseInt(item.statistics.viewCount ?? '0');
  const likes = parseInt(item.statistics.likeCount ?? '0');
  const comments = parseInt(item.statistics.commentCount ?? '0');

  const duration = parseDuration(item.contentDetails.duration);
  const tags = item.snippet.tags ?? [];
  const description = item.snippet.description ?? '';
  const type = isShort(duration, tags, description) ? 'short' : 'long';

  const thumbs = item.snippet.thumbnails;
  const thumbnailUrl =
    thumbs.maxres?.url ?? thumbs.high?.url ?? thumbs.medium?.url ?? thumbs.default?.url ?? '';

  const category: VideoCategory = CATEGORY_MAP[item.snippet.categoryId] ?? 'Entertainment';
  const viewsPerHour = parseFloat((views / hoursAgo).toFixed(0));
  const engagement = calcEngagement(views, likes, comments);
  const growthScore = calcGrowthScore(viewsPerHour, engagement, hoursAgo);

  return {
    id: item.id,
    title: item.snippet.title,
    channelName: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    thumbnailUrl,
    videoUrl: `https://www.youtube.com/watch?v=${item.id}`,
    category,
    type,
    durationSeconds: duration,
    viewCount: views,
    likeCount: likes,
    commentCount: comments,
    publishedAt,
    hoursAgo: parseFloat(hoursAgo.toFixed(1)),
    viewsPerHour,
    engagementRate: engagement,
    growthScore,
    tags: tags.slice(0, 8),
  };
}

async function fetchPage(apiKey: string, videoCategoryId?: string, pageToken?: string): Promise<{ items: RawItem[]; nextPageToken?: string }> {
  const params = new URLSearchParams({
    part: 'snippet,contentDetails,statistics',
    chart: 'mostPopular',
    regionCode: 'BR',
    maxResults: '50',
    key: apiKey,
  });
  if (videoCategoryId) params.set('videoCategoryId', videoCategoryId);
  if (pageToken) params.set('pageToken', pageToken);

  const res = await fetch(`${BASE}/videos?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}

export async function fetchTrendingVideos(apiKey: string): Promise<YouTubeVideo[]> {
  const seen = new Set<string>();
  const all: YouTubeVideo[] = [];

  // Fetch general trending (Brazil, 50 videos)
  const general = await fetchPage(apiKey);
  for (const item of general.items ?? []) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      all.push(mapItem(item));
    }
  }

  // Fetch top trending by specific categories to ensure variety
  const catFetches = CATEGORY_IDS_TO_FETCH.map((catId) =>
    fetchPage(apiKey, catId).catch(() => ({ items: [] as RawItem[] }))
  );
  const catResults = await Promise.all(catFetches);

  for (const result of catResults) {
    for (const item of result.items ?? []) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        all.push(mapItem(item));
      }
    }
  }

  // Filter to last 48 hours only
  const cutoff = Date.now() - 48 * 3_600_000;
  const recent = all.filter((v) => v.publishedAt.getTime() >= cutoff);

  // If fewer than 20 in last 48h, include older ones too (trending can be older)
  const final = recent.length >= 20 ? recent : all;

  return final.sort((a, b) => b.growthScore - a.growthScore);
}
