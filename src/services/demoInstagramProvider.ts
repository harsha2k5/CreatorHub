/**
 * DemoInstagramProvider
 * Complete Mock Provider for Instagram AI Analytics.
 * In production / stage 2, this provider is seamlessly replaced with MetaGraphApiProvider
 * without requiring changes to UI components.
 */

import {
  CompleteInstagramAnalyticsPayload,
  DemoInstagramProfile,
  InstagramOverviewMetrics,
  FollowerGrowthPoint,
  EngagementBreakdown,
  TopContentItem,
  AudienceDemographics,
  BestPostingTime,
  ContentTypeMetric,
  CreatorHubAIScore,
  AIInsight,
  BrandCollaborationReadiness
} from '../types/instagramAnalytics';

export interface IInstagramAnalyticsProvider {
  getCompleteAnalytics(): Promise<CompleteInstagramAnalyticsPayload>;
  getProfile(): Promise<DemoInstagramProfile>;
  getOverviewMetrics(): Promise<InstagramOverviewMetrics>;
  getFollowerGrowth(timeframe: '7d' | '30d' | '90d' | '1y'): Promise<FollowerGrowthPoint[]>;
  getEngagementBreakdown(): Promise<EngagementBreakdown>;
  getTopContent(filter?: 'all' | 'reel' | 'post' | 'carousel'): Promise<TopContentItem[]>;
  getAudienceDemographics(): Promise<AudienceDemographics>;
  getBestPostingTimes(): Promise<BestPostingTime[]>;
  getContentTypeComparison(): Promise<ContentTypeMetric[]>;
  getAIScore(): Promise<CreatorHubAIScore>;
  getAIInsights(): Promise<AIInsight[]>;
  getBrandCollaborationReadiness(): Promise<BrandCollaborationReadiness>;
  setConnectionStatus(connected: boolean): Promise<boolean>;
  isCurrentlyConnected(): boolean;
}

class DemoInstagramProviderImpl implements IInstagramAnalyticsProvider {
  private connected: boolean = true;
  private profileState: DemoInstagramProfile = {
    id: 'ig_demo_mrbeast_001',
    name: 'MrBeast',
    username: 'mrbeast_demo',
    avatarUrl: '/mrbeast-avatar.jpg',
    bio: 'I want to make the world a better place before I die 🌍 | Founder of Feastables & Beast Philanthropy 🍫 | DEMO ACCOUNT',
    profileUrl: 'https://www.instagram.com/mrbeast/',
    category: 'Digital Creator • Entertainment & Philanthropy',
    followersCount: 62450000,
    followingCount: 624,
    postsCount: 432,
    reelsCount: 280,
    isVerified: true,
    isConnected: true,
    isDemoMode: true,
    lastSyncedAt: new Date().toISOString()
  };

  public isCurrentlyConnected(): boolean {
    return this.connected;
  }

  public async setConnectionStatus(connected: boolean): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 350));
    this.connected = connected;
    this.profileState.isConnected = connected;
    this.profileState.lastSyncedAt = new Date().toISOString();
    return this.connected;
  }

  public async getProfile(): Promise<DemoInstagramProfile> {
    await new Promise(resolve => setTimeout(resolve, 150));
    return { ...this.profileState, isConnected: this.connected };
  }

  public async getOverviewMetrics(): Promise<InstagramOverviewMetrics> {
    await new Promise(resolve => setTimeout(resolve, 150));
    return {
      followers: 62450000,
      followerGrowthRate: 14.2,
      followerGrowthNet: 7750000,
      engagementRate: 4.85,
      engagementTrend: 0.62,
      reach: 142500000,
      impressions: 310000000,
      profileVisits: 8450000,
      avgReelViews: 18500000,
      avgLikes: 1420000,
      avgComments: 28400,
      avgShares: 95000,
      avgSaves: 112000
    };
  }

  public async getFollowerGrowth(timeframe: '7d' | '30d' | '90d' | '1y'): Promise<FollowerGrowthPoint[]> {
    await new Promise(resolve => setTimeout(resolve, 150));
    const growthData: Record<'7d' | '30d' | '90d' | '1y', FollowerGrowthPoint[]> = {
      '7d': [
        { date: '2026-03-01', label: 'Mon', followers: 62150000, netGrowth: 42000, reelsCount: 1 },
        { date: '2026-03-02', label: 'Tue', followers: 62205000, netGrowth: 55000, reelsCount: 0 },
        { date: '2026-03-03', label: 'Wed', followers: 62270000, netGrowth: 65000, reelsCount: 2 },
        { date: '2026-03-04', label: 'Thu', followers: 62315000, netGrowth: 45000, reelsCount: 1 },
        { date: '2026-03-05', label: 'Fri', followers: 62380000, netGrowth: 65000, reelsCount: 1 },
        { date: '2026-03-06', label: 'Sat', followers: 62410000, netGrowth: 30000, reelsCount: 3 },
        { date: '2026-03-07', label: 'Sun (Today)', followers: 62450000, netGrowth: 40000, reelsCount: 2 }
      ],
      '30d': [
        { date: '2026-02-06', label: 'Week 1', followers: 60800000, netGrowth: 320000, reelsCount: 6 },
        { date: '2026-02-13', label: 'Week 2', followers: 61250000, netGrowth: 450000, reelsCount: 8 },
        { date: '2026-02-20', label: 'Week 3', followers: 61780000, netGrowth: 530000, reelsCount: 9 },
        { date: '2026-02-27', label: 'Week 4', followers: 62180000, netGrowth: 400000, reelsCount: 7 },
        { date: '2026-03-07', label: 'Current', followers: 62450000, netGrowth: 270000, reelsCount: 5 }
      ],
      '90d': [
        { date: '2025-12-07', label: 'Dec 2025', followers: 56900000, netGrowth: 1800000, reelsCount: 22 },
        { date: '2026-01-07', label: 'Jan 2026', followers: 58800000, netGrowth: 1900000, reelsCount: 26 },
        { date: '2026-02-07', label: 'Feb 2026', followers: 60800000, netGrowth: 2000000, reelsCount: 24 },
        { date: '2026-03-07', label: 'Mar 2026', followers: 62450000, netGrowth: 1650000, reelsCount: 18 }
      ],
      '1y': [
        { date: '2025-04', label: 'Q2 2025', followers: 48500000, netGrowth: 3200000, reelsCount: 65 },
        { date: '2025-07', label: 'Q3 2025', followers: 52100000, netGrowth: 3600000, reelsCount: 72 },
        { date: '2025-10', label: 'Q4 2025', followers: 56200000, netGrowth: 4100000, reelsCount: 80 },
        { date: '2026-01', label: 'Q1 2026', followers: 60100000, netGrowth: 3900000, reelsCount: 75 },
        { date: '2026-03', label: 'Present', followers: 62450000, netGrowth: 2350000, reelsCount: 30 }
      ]
    };
    return growthData[timeframe];
  }

  public async getEngagementBreakdown(): Promise<EngagementBreakdown> {
    await new Promise(resolve => setTimeout(resolve, 150));
    return {
      totalLikes: 42600000,
      totalComments: 852000,
      totalShares: 2850000,
      totalSaves: 3360000,
      engagementRate: 4.85,
      benchmarkRate: 2.15,
      likeToCommentRatio: 50.0,
      saveRate: 1.82,
      shareRate: 1.54
    };
  }

  public async getTopContent(filter?: 'all' | 'reel' | 'post' | 'carousel'): Promise<TopContentItem[]> {
    await new Promise(resolve => setTimeout(resolve, 150));
    const allContent: TopContentItem[] = [
      {
        id: 'cnt_01',
        type: 'reel',
        caption: 'Giving away a real chocolate factory to our lucky subscriber! 🍫 The golden ticket winner is...',
        thumbnailUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&h=750&fit=crop',
        postedDate: '2 days ago',
        views: 34200000,
        likes: 2950000,
        comments: 64200,
        shares: 240000,
        saves: 195000,
        engagementRate: 8.62,
        permalink: 'https://www.instagram.com/mrbeast/',
        durationSeconds: 58
      },
      {
        id: 'cnt_02',
        type: 'reel',
        caption: 'Surviving 7 days in the world\'s largest deserted mall! 🏬 Day 4 was intense...',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&h=750&fit=crop',
        postedDate: '5 days ago',
        views: 28400000,
        likes: 2180000,
        comments: 41200,
        shares: 185000,
        saves: 142000,
        engagementRate: 7.58,
        permalink: 'https://www.instagram.com/mrbeast/',
        durationSeconds: 45
      },
      {
        id: 'cnt_03',
        type: 'carousel',
        caption: 'Behind the scenes: 100 people competing for $1,000,000 in glass cubes. Swipe to see the set engineering 🛠️',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=600&fit=crop',
        postedDate: '1 week ago',
        views: 14500000,
        likes: 1640000,
        comments: 29500,
        shares: 88000,
        saves: 210000,
        engagementRate: 5.48,
        permalink: 'https://www.instagram.com/mrbeast/'
      },
      {
        id: 'cnt_04',
        type: 'reel',
        caption: 'Can this heavy-duty safe survive a direct blast? 💥 Testing physics at max scale!',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&h=750&fit=crop',
        postedDate: '2 weeks ago',
        views: 22100000,
        likes: 1890000,
        comments: 33400,
        shares: 142000,
        saves: 98000,
        engagementRate: 6.24,
        permalink: 'https://www.instagram.com/mrbeast/',
        durationSeconds: 32
      },
      {
        id: 'cnt_05',
        type: 'post',
        caption: 'We just funded clean water wells for 500,000 people across 3 continents. Thank you to everyone who supports Feastables ❤️',
        thumbnailUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=600&fit=crop',
        postedDate: '3 weeks ago',
        views: 19800000,
        likes: 2450000,
        comments: 58200,
        shares: 210000,
        saves: 340000,
        engagementRate: 7.82,
        permalink: 'https://www.instagram.com/mrbeast/'
      },
      {
        id: 'cnt_06',
        type: 'carousel',
        caption: 'Brand new Feastables dark chocolate formula is out! 100% organic vanilla & simple ingredients. Rate your favorite bar 🍫👇',
        thumbnailUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&h=600&fit=crop',
        postedDate: '1 month ago',
        views: 16200000,
        likes: 1420000,
        comments: 38700,
        shares: 64000,
        saves: 182000,
        engagementRate: 4.95,
        permalink: 'https://www.instagram.com/mrbeast/'
      }
    ];

    if (!filter || filter === 'all') {
      return allContent;
    }
    return allContent.filter(c => c.type === filter);
  }

  public async getAudienceDemographics(): Promise<AudienceDemographics> {
    await new Promise(resolve => setTimeout(resolve, 150));
    return {
      ageDistribution: [
        { bracket: '13-17', percentage: 14 },
        { bracket: '18-24', percentage: 48 },
        { bracket: '25-34', percentage: 26 },
        { bracket: '35-44', percentage: 8 },
        { bracket: '45+', percentage: 4 }
      ],
      genderDistribution: {
        male: 68,
        female: 29,
        other: 3
      },
      topCountries: [
        { name: 'United States', percentage: 38.5, flag: '🇺🇸', count: 24043000 },
        { name: 'India', percentage: 21.4, flag: '🇮🇳', count: 13364000 },
        { name: 'United Kingdom', percentage: 11.2, flag: '🇬🇧', count: 6994000 },
        { name: 'Brazil', percentage: 8.6, flag: '🇧🇷', count: 5370000 },
        { name: 'Germany', percentage: 5.8, flag: '🇩🇪', count: 3622000 }
      ],
      topCities: [
        { name: 'Los Angeles, CA', percentage: 8.2 },
        { name: 'New York, NY', percentage: 7.4 },
        { name: 'Bengaluru, IN', percentage: 5.6 },
        { name: 'London, UK', percentage: 4.9 },
        { name: 'São Paulo, BR', percentage: 4.1 }
      ],
      activeHours: [
        { hour: '12 AM', weekdayActivity: 18, weekendActivity: 25 },
        { hour: '3 AM', weekdayActivity: 8, weekendActivity: 12 },
        { hour: '6 AM', weekdayActivity: 22, weekendActivity: 18 },
        { hour: '9 AM', weekdayActivity: 52, weekendActivity: 45 },
        { hour: '12 PM', weekdayActivity: 78, weekendActivity: 82 },
        { hour: '3 PM', weekdayActivity: 84, weekendActivity: 89 },
        { hour: '6 PM', weekdayActivity: 98, weekendActivity: 96 },
        { hour: '9 PM', weekdayActivity: 91, weekendActivity: 94 }
      ],
      topLanguages: [
        { name: 'English', percentage: 72.4 },
        { name: 'Spanish', percentage: 14.1 },
        { name: 'Hindi', percentage: 8.5 },
        { name: 'Portuguese', percentage: 5.0 }
      ]
    };
  }

  public async getBestPostingTimes(): Promise<BestPostingTime[]> {
    await new Promise(resolve => setTimeout(resolve, 150));
    return [
      {
        dayOfWeek: 'Wednesday',
        peakHourRange: '6:00 PM – 8:30 PM (Local)',
        confidenceScore: 97,
        reasoning: 'Mid-week evening slot captures peak global viewer overlap across US Pacific, Eastern, and European evening streams.',
        expectedEngagementMultiplier: '1.45x'
      },
      {
        dayOfWeek: 'Saturday',
        peakHourRange: '12:00 PM – 3:30 PM (Local)',
        confidenceScore: 94,
        reasoning: 'Weekend afternoon browsing coincides with highest short-form video watch times and viral share spikes.',
        expectedEngagementMultiplier: '1.38x'
      },
      {
        dayOfWeek: 'Sunday',
        peakHourRange: '5:00 PM – 8:00 PM (Local)',
        confidenceScore: 91,
        reasoning: 'Sunday evening pre-week wind-down delivers highest comment response rates and saves per impression.',
        expectedEngagementMultiplier: '1.32x'
      }
    ];
  }

  public async getContentTypeComparison(): Promise<ContentTypeMetric[]> {
    await new Promise(resolve => setTimeout(resolve, 150));
    return [
      {
        type: 'Reels',
        count: 280,
        avgEngagementRate: 6.84,
        avgViews: 18500000,
        avgSaves: 145000,
        shareRate: 2.8,
        viralityIndex: 98,
        recommendation: 'Top growth engine. Pacing and immediate visual hooks produce 3.2x higher viral reach than photo posts.'
      },
      {
        type: 'Carousels',
        count: 88,
        avgEngagementRate: 5.12,
        avgViews: 11200000,
        avgSaves: 198000,
        shareRate: 1.4,
        viralityIndex: 82,
        recommendation: 'Highest bookmark and save rate. Ideal for behind-the-scenes breakdowns and brand feature showcases.'
      },
      {
        type: 'Static Posts',
        count: 64,
        avgEngagementRate: 3.45,
        avgViews: 8400000,
        avgSaves: 84000,
        shareRate: 0.9,
        viralityIndex: 68,
        recommendation: 'Best for major announcements, charity milestones, and direct portrait call-to-actions.'
      },
      {
        type: 'Stories',
        count: 420,
        avgEngagementRate: 4.10,
        avgViews: 9200000,
        avgSaves: 12000,
        shareRate: 1.1,
        viralityIndex: 74,
        recommendation: 'Great for real-time polls, flash merchandise drops, and link sticker click-throughs.'
      }
    ];
  }

  public async getAIScore(): Promise<CreatorHubAIScore> {
    await new Promise(resolve => setTimeout(resolve, 150));
    return {
      overallScore: 96,
      grade: 'A+',
      breakdown: {
        engagement: {
          score: 95,
          max: 100,
          label: 'Engagement Score',
          status: 'Top 1% Tier',
          note: '4.85% engagement rate significantly exceeds mega-creator benchmark (2.1%).'
        },
        growth: {
          score: 98,
          max: 100,
          label: 'Growth Momentum',
          status: 'Hyper-Growth',
          note: '+14.2% quarterly net follower expansion driven by high-frequency high-production Reels.'
        },
        contentQuality: {
          score: 96,
          max: 100,
          label: 'Content Retention',
          status: 'Exceptional',
          note: 'Reel completion rate averages 74% with 18.5M average views per video.'
        },
        audienceQuality: {
          score: 97,
          max: 100,
          label: 'Audience Authenticity',
          status: 'Pristine Clean',
          note: '96.2% organic verified audience integrity with zero bot activity detected.'
        },
        consistency: {
          score: 94,
          max: 100,
          label: 'Publishing Cadence',
          status: 'Optimal',
          note: 'Consistent 4–5 flagship posts per week aligned with global algorithmic peak times.'
        }
      },
      summaryVerdict: 'CreatorHub AI classifies this profile in the top 0.1% tier for brand ROI, viral consistency, and genuine viewer loyalty.',
      disclaimer: 'This score is generated by CreatorHub AI algorithms based on verified engagement signals and is not an official Meta/Instagram metric.'
    };
  }

  public async getAIInsights(): Promise<AIInsight[]> {
    await new Promise(resolve => setTimeout(resolve, 150));
    return [
      {
        id: 'ins_01',
        category: 'performance',
        type: 'positive',
        title: 'Reels Virality Multiplier is 3.8x Above Category Average',
        description: 'Your short-form video content generates an average of 18.5M views per reel, producing 3.8x greater discovery than static image posts.',
        metricHighlight: '+280% Reach Discovery',
        actionableRecommendation: 'Prioritize 30-45s vertical Reels with rapid narrative hooks in the first 2.5 seconds to maximize Instagram Explore placement.'
      },
      {
        id: 'ins_02',
        category: 'growth',
        type: 'positive',
        title: 'High-Velocity Follower Inflow from Philanthropy & Challenges',
        description: 'Milestone and giveaway carousels consistently convert 2.4x more non-followers into permanent account followers.',
        metricHighlight: '+7.75M Followers (Net)',
        actionableRecommendation: 'Pair major brand campaigns with a community giveback element to sustain post-campaign subscriber retention.'
      },
      {
        id: 'ins_03',
        category: 'timing',
        type: 'opportunity',
        title: 'Wednesday & Saturday Evenings Yield Maximum Global Overlap',
        description: 'Publishing between 6:00 PM and 8:30 PM captures the intersection of North American evening prime time and Asian morning commutes.',
        metricHighlight: '+45% Expected Boost',
        actionableRecommendation: 'Schedule priority collaboration deliverables specifically during the Wednesday 6:00 PM window for instantaneous velocity.'
      },
      {
        id: 'ins_04',
        category: 'content',
        type: 'opportunity',
        title: 'Carousels Generate Exceptional Save & Bookmark Ratios',
        description: 'Behind-the-scenes carousels produce 198,000 average saves (1.82% save rate), signalling high commercial reference value.',
        metricHighlight: '198k Avg Saves',
        actionableRecommendation: 'Pitch multi-slide breakdown carousels to retail, technology, and food brands who value long shelf-life intent.'
      },
      {
        id: 'ins_05',
        category: 'audience',
        type: 'positive',
        title: '74% Concentrated Demographic in Prime 18–34 Age Bracket',
        description: 'Your largest audience sector is digitally native young adults with direct purchasing power and high ecommerce responsiveness.',
        metricHighlight: '74% Core (18-34)',
        actionableRecommendation: 'Position your profile to prospective Brand Partners in consumer electronics, beverage/food, gaming, and lifestyle.'
      }
    ];
  }

  public async getBrandCollaborationReadiness(): Promise<BrandCollaborationReadiness> {
    await new Promise(resolve => setTimeout(resolve, 150));
    return {
      tier: 'Elite Marketplace Tier',
      readinessScore: 98,
      badgeLabel: 'CreatorHub Top Tier Verified',
      engagementQuality: {
        rating: 'Exceptional',
        percentile: 99.4,
        description: 'Engagement rate of 4.85% places this creator in the 99th percentile among international mega-creators.'
      },
      audienceAuthenticity: {
        score: 96.8,
        description: 'High active comment density and verified viewer location distribution confirm authentic human viewership.'
      },
      contentBrandSafety: {
        rating: 'G-Rated / Family Friendly',
        score: 99.2
      },
      recommendedCampaignCategories: [
        'Food & Beverage (FMCG)',
        'Consumer Technology & Apps',
        'Gaming & Entertainment',
        'Retail & E-commerce',
        'Youth Lifestyle & Apparel'
      ],
      estimatedMarketPricing: {
        reelPlacement: '₹12,50,000 – ₹25,00,000 / Reel',
        carouselEndorsement: '₹8,00,000 – ₹15,00,000 / Post',
        storySeries: '₹4,50,000 – ₹7,50,000 / 3-Story Arc',
        multiPostPackage: '₹35,00,000+ / 360° Campaign'
      }
    };
  }

  public async getCompleteAnalytics(): Promise<CompleteInstagramAnalyticsPayload> {
    const [
      profile,
      overview,
      g7d,
      g30d,
      g90d,
      g1y,
      engagement,
      topContent,
      audience,
      bestPostingTimes,
      contentTypeComparison,
      aiScore,
      aiInsights,
      brandReadiness
    ] = await Promise.all([
      this.getProfile(),
      this.getOverviewMetrics(),
      this.getFollowerGrowth('7d'),
      this.getFollowerGrowth('30d'),
      this.getFollowerGrowth('90d'),
      this.getFollowerGrowth('1y'),
      this.getEngagementBreakdown(),
      this.getTopContent('all'),
      this.getAudienceDemographics(),
      this.getBestPostingTimes(),
      this.getContentTypeComparison(),
      this.getAIScore(),
      this.getAIInsights(),
      this.getBrandCollaborationReadiness()
    ]);

    return {
      profile,
      overview,
      growth: {
        '7d': g7d,
        '30d': g30d,
        '90d': g90d,
        '1y': g1y
      },
      engagement,
      topContent,
      audience,
      bestPostingTimes,
      contentTypeComparison,
      aiScore,
      aiInsights,
      brandReadiness,
      isDemoData: true
    };
  }
}

export const DemoInstagramProvider = new DemoInstagramProviderImpl();
