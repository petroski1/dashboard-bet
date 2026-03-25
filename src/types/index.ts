export type VideoType = 'short' | 'long' | 'all';

export type VideoCategory =
  | 'Gaming'
  | 'Music'
  | 'Technology'
  | 'Finance'
  | 'Fitness'
  | 'Lifestyle'
  | 'Education'
  | 'Entertainment'
  | 'News'
  | 'Food'
  | 'Travel'
  | 'Beauty'
  | 'Sports'
  | 'Science'
  | 'Comedy';

export interface YouTubeVideo {
  id: string;
  title: string;
  channelName: string;
  channelId: string;
  thumbnailUrl: string;
  videoUrl: string;
  category: VideoCategory;
  type: 'short' | 'long';
  durationSeconds: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: Date;
  hoursAgo: number;
  viewsPerHour: number;
  engagementRate: number;
  growthScore: number;
  tags: string[];
}

export interface Niche {
  id: string;
  name: VideoCategory;
  emoji: string;
  totalViews: number;
  avgEngagement: number;
  videoCount: number;
  shortCount: number;
  longCount: number;
  growthScore: number;
  monetizationScore: number;
  viralPotential: number;
  avgViewsPerHour: number;
  topVideo: YouTubeVideo;
  cpmEstimate: number;
  trendDirection: 'up' | 'down' | 'stable';
  trendPercent: number;
  description: string;
  tags: string[];
}

export interface FilterOptions {
  type: VideoType;
  category: VideoCategory | 'all';
  sortBy: 'growthScore' | 'viewCount' | 'engagementRate' | 'viewsPerHour';
  sortOrder: 'desc' | 'asc';
  minViews: number;
}

export interface FavoriteNiche {
  nicheId: string;
  savedAt: Date;
  notes: string;
}

export interface DashboardStats {
  totalVideosTracked: number;
  totalViewsLast48h: number;
  avgEngagementRate: number;
  topGrowthNiche: string;
  lastUpdated: Date;
}

export interface AIRecommendation {
  niche: Niche;
  reason: string;
  confidence: number;
  estimatedMonthlyEarnings: { min: number; max: number };
  bestVideoType: 'short' | 'long' | 'both';
  contentIdeas: string[];
  competitionLevel: 'low' | 'medium' | 'high';
  timeToMonetize: string;
}
