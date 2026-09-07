/**
 * Instagram AI Analytics Types & Data Models
 * Designed for modularity, supporting both DemoInstagramProvider and future Meta Graph API providers.
 */

export interface DemoInstagramProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  profileUrl: string;
  category: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  reelsCount: number;
  isVerified: boolean;
  isConnected: boolean;
  isDemoMode: boolean;
  lastSyncedAt: string;
}

export interface InstagramOverviewMetrics {
  followers: number;
  followerGrowthRate: number; // e.g. +14.2%
  followerGrowthNet: number;  // e.g. +184,200
  engagementRate: number;     // e.g. 4.85%
  engagementTrend: number;    // e.g. +0.6%
  reach: number;              // e.g. 142,500,000
  impressions: number;        // e.g. 310,000,000
  profileVisits: number;      // e.g. 8,450,000
  avgReelViews: number;       // e.g. 18,500,000
  avgLikes: number;           // e.g. 1,420,000
  avgComments: number;        // e.g. 28,400
  avgShares: number;          // e.g. 95,000
  avgSaves: number;           // e.g. 112,000
}

export interface FollowerGrowthPoint {
  date: string;
  label: string;
  followers: number;
  netGrowth: number;
  reelsCount?: number;
}

export interface EngagementBreakdown {
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;
  engagementRate: number;
  benchmarkRate: number; // industry benchmark e.g. 2.1%
  likeToCommentRatio: number;
  saveRate: number;
  shareRate: number;
}

export type ContentType = 'all' | 'reel' | 'post' | 'carousel';

export interface TopContentItem {
  id: string;
  type: 'reel' | 'post' | 'carousel';
  caption: string;
  thumbnailUrl: string;
  postedDate: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagementRate: number;
  permalink: string;
  durationSeconds?: number;
  aspectRatio?: string;
}

export interface AgeBracket {
  bracket: string;
  percentage: number;
}

export interface GenderDistribution {
  male: number;
  female: number;
  other: number;
}

export interface GeographicItem {
  name: string;
  percentage: number;
  flag?: string;
  count?: number;
}

export interface ActiveHourItem {
  hour: string;
  weekdayActivity: number; // 0-100 scale
  weekendActivity: number; // 0-100 scale
}

export interface AudienceDemographics {
  ageDistribution: AgeBracket[];
  genderDistribution: GenderDistribution;
  topCountries: GeographicItem[];
  topCities: GeographicItem[];
  activeHours: ActiveHourItem[];
  topLanguages: GeographicItem[];
}

export interface BestPostingTime {
  dayOfWeek: string;
  peakHourRange: string;
  confidenceScore: number;
  reasoning: string;
  expectedEngagementMultiplier: string;
}

export interface ContentTypeMetric {
  type: 'Reels' | 'Carousels' | 'Static Posts' | 'Stories';
  count: number;
  avgEngagementRate: number;
  avgViews: number;
  avgSaves: number;
  shareRate: number;
  viralityIndex: number; // 1-100
  recommendation: string;
}

export interface CreatorHubAIScore {
  overallScore: number; // 0-100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  breakdown: {
    engagement: { score: number; max: 100; label: string; status: string; note: string };
    growth: { score: number; max: 100; label: string; status: string; note: string };
    contentQuality: { score: number; max: 100; label: string; status: string; note: string };
    audienceQuality: { score: number; max: 100; label: string; status: string; note: string };
    consistency: { score: number; max: 100; label: string; status: string; note: string };
  };
  summaryVerdict: string;
  disclaimer: string;
}

export interface AIInsight {
  id: string;
  category: 'performance' | 'growth' | 'audience' | 'content' | 'timing';
  type: 'positive' | 'opportunity' | 'alert';
  title: string;
  description: string;
  metricHighlight: string;
  actionableRecommendation: string;
}

export interface BrandCollaborationReadiness {
  tier: 'Elite Marketplace Tier' | 'High Impact Partner' | 'Emerging Creator';
  readinessScore: number; // 0-100
  badgeLabel: string;
  engagementQuality: {
    rating: 'Exceptional' | 'Strong' | 'Average';
    percentile: number;
    description: string;
  };
  audienceAuthenticity: {
    score: number; // e.g. 96%
    description: string;
  };
  contentBrandSafety: {
    rating: 'G-Rated / Family Friendly' | 'Standard' | 'Restricted';
    score: number;
  };
  recommendedCampaignCategories: string[];
  estimatedMarketPricing: {
    reelPlacement: string;
    carouselEndorsement: string;
    storySeries: string;
    multiPostPackage: string;
  };
}

export interface CompleteInstagramAnalyticsPayload {
  profile: DemoInstagramProfile;
  overview: InstagramOverviewMetrics;
  growth: {
    '7d': FollowerGrowthPoint[];
    '30d': FollowerGrowthPoint[];
    '90d': FollowerGrowthPoint[];
    '1y': FollowerGrowthPoint[];
  };
  engagement: EngagementBreakdown;
  topContent: TopContentItem[];
  audience: AudienceDemographics;
  bestPostingTimes: BestPostingTime[];
  contentTypeComparison: ContentTypeMetric[];
  aiScore: CreatorHubAIScore;
  aiInsights: AIInsight[];
  brandReadiness: BrandCollaborationReadiness;
  isDemoData: boolean;
}
