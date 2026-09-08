import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Clock,
  MapPin,
  Globe,
  Award,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Film,
  Image as ImageIcon,
  Layers,
  BarChart3,
  RefreshCw,
  Zap,
  DollarSign,
  Briefcase,
  HelpCircle,
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Instagram } from '../icons/InstagramIcon';
import { api } from '../../services/api';
import { instagramAnalyticsService } from '../../services/instagramAnalyticsService';
import {
  CompleteInstagramAnalyticsPayload,
  ContentType,
  FollowerGrowthPoint,
  TopContentItem
} from '../../types/instagramAnalytics';

export const InstagramAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<CompleteInstagramAnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Filter States
  const [growthTimeframe, setGrowthTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [contentFilter, setContentFilter] = useState<ContentType>('all');
  const [growthPoints, setGrowthPoints] = useState<FollowerGrowthPoint[]>([]);
  const [topContent, setTopContent] = useState<TopContentItem[]>([]);

  // Disconnect Simulation
  const [isTogglingConnection, setIsTogglingConnection] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await instagramAnalyticsService.getCompleteAnalytics();
      setData(payload);
      setGrowthPoints(payload.growth[growthTimeframe]);
      setTopContent(payload.topContent);
    } catch (err: any) {
      setError(err.message || 'Failed to load Instagram analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update growth points when timeframe changes
  const handleTimeframeChange = async (tf: '7d' | '30d' | '90d' | '1y') => {
    setGrowthTimeframe(tf);
    try {
      const points = await instagramAnalyticsService.getFollowerGrowth(tf);
      setGrowthPoints(points);
    } catch (err) {
      console.error(err);
    }
  };

  // Update top content when filter changes
  const handleContentFilterChange = async (filter: ContentType) => {
    setContentFilter(filter);
    try {
      const items = await instagramAnalyticsService.getTopContent(filter);
      setTopContent(items);
    } catch (err) {
      console.error(err);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setSyncing(true);
    try {
      try {
        await api.syncInstagramAnalytics();
      } catch (syncErr) {
        console.warn('Sync notice:', syncErr);
      }
      await loadData();
    } finally {
      setSyncing(false);
    }
  };

  // Toggle connection state
  const handleToggleConnection = async () => {
    if (!data) return;
    setIsTogglingConnection(true);
    try {
      const newStatus = !data.profile.isConnected;
      await instagramAnalyticsService.toggleConnection(newStatus);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsTogglingConnection(false);
    }
  };

  // 1. Loading Skeleton State
  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row gap-6 items-center">
          <div className="w-24 h-24 rounded-3xl bg-slate-800" />
          <div className="space-y-3 flex-1 w-full">
            <div className="h-6 bg-slate-800 rounded w-1/4" />
            <div className="h-4 bg-slate-800/60 rounded w-1/2" />
            <div className="h-4 bg-slate-800/40 rounded w-1/3" />
          </div>
        </div>

        {/* Metrics Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-28 bg-slate-900/60 rounded-2xl border border-slate-800 p-4 space-y-2">
              <div className="h-4 bg-slate-800 rounded w-1/2" />
              <div className="h-8 bg-slate-800/80 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error || !data) {
    return (
      <div className="bg-slate-900/70 p-12 rounded-3xl border border-rose-500/30 text-center space-y-4 max-w-xl mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">Analytics Unavailable</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          {error || 'Unable to retrieve Instagram analytics dataset. Please try again.'}
        </p>
        <button
          onClick={loadData}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { profile, overview, engagement, audience, bestPostingTimes, contentTypeComparison, aiScore, aiInsights, brandReadiness } = data;
  const isConnected = profile.isConnected;

  // 3. Disconnected State
  if (!isConnected) {
    return (
      <div className="space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-slate-900 border border-amber-500/30 rounded-3xl p-8 sm:p-10 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-xl">
            <Instagram className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30">
              <AlertCircle className="w-3.5 h-3.5" />
              Instagram Account Disconnected
            </div>
            <h2 className="text-2xl font-black text-white">Connect Instagram Account</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Experience the complete CreatorHub AI Instagram Analytics suite with your verified creator stats or demo profile.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleToggleConnection}
              disabled={isTogglingConnection}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-black flex items-center justify-center gap-2.5 mx-auto shadow-xl shadow-purple-600/30 transition-all hover:scale-105 disabled:opacity-50"
            >
              <Instagram className="w-4 h-4" />
              <span>{isTogglingConnection ? 'Connecting...' : 'Connect Instagram'}</span>
            </button>
            <span className="block text-[11px] text-slate-500 mt-2.5">
              Instant connection • Live data synchronization enabled
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Format Large Numbers
  const formatNumber = (num: number): string => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div className="space-y-8">
      {/* 1. Global Notice: Live / Demo Data Banner */}
      <div className="bg-gradient-to-r from-purple-950/90 via-slate-900 to-pink-950/70 border border-purple-500/30 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-white">Instagram AI Analytics Suite</span>
              {profile.isDemoMode ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-pink-500 text-slate-950 tracking-wider shadow-sm uppercase">
                  DEMO MODE ONLY
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 tracking-wider shadow-sm uppercase">
                  LIVE VERIFIED ACCOUNT
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              {profile.isDemoMode
                ? `Displaying simulated performance metrics for demo creator @mrbeast_demo.`
                : `Connected to verified live profile @${profile.username}. Metrics synchronized with verified creator activity.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={syncing}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-purple-400' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Refresh'}</span>
          </button>
          <button
            onClick={handleToggleConnection}
            disabled={isTogglingConnection}
            className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all disabled:opacity-50"
          >
            {isTogglingConnection ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      </div>

      {/* 2. Instagram Profile Header Card */}
      <div className="bg-slate-900/80 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Profile Identity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-1 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-xl shadow-purple-500/20">
                <img
                  src={profile.avatarUrl || '/mrbeast-avatar.jpg'}
                  alt={profile.name}
                  className="w-full h-full rounded-[20px] object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/mrbeast-avatar.jpg';
                  }}
                />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-pink-400 shadow">
                <Instagram className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{profile.name}</h1>
                {profile.isVerified && (
                  <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[11px] font-black shadow-sm" title="Verified Creator">
                    ✓
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {profile.isDemoMode ? 'Instagram Connected — Demo Mode' : 'Instagram Connected — Verified Live'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                <span className="text-purple-300 font-bold">@{profile.username}</span>
                <span>•</span>
                <span className="text-slate-300">{profile.category}</span>
                <span>•</span>
                <a
                  href={profile.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1 hover:underline"
                >
                  instagram.com/{profile.username} <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed pt-1">
                {profile.bio}
              </p>
            </div>
          </div>

          {/* Key Stats Counter Pills */}
          <div className="flex items-center gap-3 sm:gap-4 bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800/80 self-stretch sm:self-auto justify-around sm:justify-start">
            <div className="text-center px-2">
              <div className="text-lg sm:text-xl font-black text-white">
                {formatNumber(profile.followersCount)}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Followers</div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center px-2">
              <div className="text-lg sm:text-xl font-black text-slate-200">
                {profile.followingCount.toLocaleString()}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Following</div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center px-2">
              <div className="text-lg sm:text-xl font-black text-slate-200">
                {profile.postsCount}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Posts</div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center px-2">
              <div className="text-lg sm:text-xl font-black text-purple-400">
                {profile.reelsCount}
              </div>
              <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Reels</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Overview Metric Cards (7 Cards) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" /> Performance Overview
          </h2>
          <span className="text-[11px] text-slate-400">Last 30 days verified aggregated data</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Followers */}
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
              <span>Followers</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {formatNumber(overview.followers)}
            </div>
            <div className="text-[11px] font-semibold text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +{overview.followerGrowthRate}% growth
            </div>
          </div>

          {/* Card 2: Follower Growth Net */}
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
              <span>Follower Growth (Net)</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300">
              +{formatNumber(overview.followerGrowthNet)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Net new subscribers
            </div>
          </div>

          {/* Card 3: Engagement Rate */}
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
              <span>Engagement Rate</span>
              <TrendingUp className="w-4 h-4 text-pink-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-pink-400">
              {overview.engagementRate}%
            </div>
            <div className="text-[11px] font-semibold text-emerald-400 mt-1 flex items-center gap-1">
              <span>+{overview.engagementTrend}% vs category benchmark</span>
            </div>
          </div>

          {/* Card 4: Reach */}
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
              <span>Total Reach</span>
              <Globe className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-300">
              {formatNumber(overview.reach)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Unique accounts reached
            </div>
          </div>

          {/* Card 5: Impressions */}
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
              <span>Impressions</span>
              <Eye className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-300">
              {formatNumber(overview.impressions)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Total content views
            </div>
          </div>

          {/* Card 6: Profile Visits */}
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
              <span>Profile Visits</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300">
              {formatNumber(overview.profileVisits)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Direct profile inspections
            </div>
          </div>

          {/* Card 7: Average Reel Views */}
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-purple-500/30 col-span-2 md:col-span-1 lg:col-span-2 bg-gradient-to-r from-slate-900 to-purple-950/40">
            <div className="flex items-center justify-between text-xs font-bold text-purple-300 mb-2">
              <span>Average Reel Views</span>
              <Film className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-200">
              {formatNumber(overview.avgReelViews)}
            </div>
            <div className="text-[11px] text-purple-300/80 mt-1 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3 h-3 text-amber-300" /> Top viral multiplier in Digital Creator category
            </div>
          </div>
        </div>
      </div>

      {/* 4. Follower Growth Line Chart Section */}
      <div className="bg-slate-900/70 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">Follower Growth Trajectory</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                Time-Series
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Track historical growth curves, net gain velocity, and subscriber retention
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            {(['7d', '30d', '90d', '1y'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  growthTimeframe === tf
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : tf === '90d' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => formatNumber(v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff'
                }}
                formatter={(value: any) => [formatNumber(Number(value)) + ' Followers', 'Audience Size']}
              />
              <Area
                type="monotone"
                dataKey="followers"
                stroke="#c084fc"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#growthGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
          <div className="text-slate-400">
            Current Tier: <strong className="text-white">Mega Creator (60M+)</strong>
          </div>
          <div className="text-slate-400">
            Net Monthly Velocity: <strong className="text-emerald-400">+{formatNumber(overview.followerGrowthNet)}</strong>
          </div>
          <div className="text-slate-400">
            Daily Inflow Average: <strong className="text-purple-300">~45,000 / day</strong>
          </div>
          <div className="text-slate-400">
            Retention Integrity: <strong className="text-cyan-300">99.2% Organic</strong>
          </div>
        </div>
      </div>

      {/* 5. Engagement Analytics Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Summary Breakdown */}
        <div className="lg:col-span-2 bg-slate-900/70 p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400" /> Engagement Deep Dive
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Interaction volume, shares, bookmarks, and benchmarks</p>
            </div>
            <div className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
              Rate: {engagement.engagementRate}%
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Likes */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1">
                <Heart className="w-3.5 h-3.5 text-rose-400" /> Total Likes
              </div>
              <div className="text-xl font-black text-white">{formatNumber(engagement.totalLikes)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">~{formatNumber(overview.avgLikes)} / post</div>
            </div>

            {/* Total Comments */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1">
                <MessageCircle className="w-3.5 h-3.5 text-blue-400" /> Total Comments
              </div>
              <div className="text-xl font-black text-white">{formatNumber(engagement.totalComments)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">~{formatNumber(overview.avgComments)} / post</div>
            </div>

            {/* Total Shares */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1">
                <Share2 className="w-3.5 h-3.5 text-cyan-400" /> Total Shares
              </div>
              <div className="text-xl font-black text-white">{formatNumber(engagement.totalShares)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">~{formatNumber(overview.avgShares)} / post</div>
            </div>

            {/* Total Saves */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1">
                <Bookmark className="w-3.5 h-3.5 text-amber-400" /> Total Saves
              </div>
              <div className="text-xl font-black text-white">{formatNumber(engagement.totalSaves)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">~{formatNumber(overview.avgSaves)} / post</div>
            </div>
          </div>

          {/* Industry Benchmark Gauge */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Engagement Benchmark Comparison</span>
              <span className="text-emerald-400 font-extrabold">2.2x Industry Standard</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden relative">
              {/* Benchmark Line */}
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400 rounded-full"
                style={{ width: `${Math.min(100, (engagement.engagementRate / 6.0) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Category Benchmark (2.15%)</span>
              <span className="text-pink-400 font-bold">Creator Score ({engagement.engagementRate}%)</span>
              <span>Top 0.1% Ceiling (6.0%)</span>
            </div>
          </div>
        </div>

        {/* CreatorHub AI Score Widget */}
        <div className="bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-900 p-6 sm:p-7 rounded-3xl border border-purple-500/30 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black tracking-wider text-purple-400 uppercase bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                AI Diagnostic
              </span>
              <span className="text-[10px] text-slate-400">CreatorHub Score</span>
            </div>
            <h3 className="text-lg font-black text-white">CreatorHub AI Score</h3>
            <p className="text-xs text-slate-400 mt-1">Multi-signal algorithm grading</p>

            {/* Big Radial/Grade Display */}
            <div className="my-5 flex items-center justify-center gap-4">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-400 p-1 shadow-2xl flex items-center justify-center">
                <div className="w-full h-full rounded-[22px] bg-slate-950 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text">
                    {aiScore.overallScore}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">/ 100</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-400">Grade {aiScore.grade}</div>
                <div className="text-xs font-bold text-slate-300">Elite Impact Profile</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Top 0.1% Brand Value</div>
              </div>
            </div>

            {/* Score Factors */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Engagement</span>
                <span className="text-purple-300 font-bold">{aiScore.breakdown.engagement.score}/100</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Growth Velocity</span>
                <span className="text-pink-300 font-bold">{aiScore.breakdown.growth.score}/100</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Content Quality</span>
                <span className="text-cyan-300 font-bold">{aiScore.breakdown.contentQuality.score}/100</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Audience Authenticity</span>
                <span className="text-emerald-300 font-bold">{aiScore.breakdown.audienceQuality.score}/100</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Consistency</span>
                <span className="text-amber-300 font-bold">{aiScore.breakdown.consistency.score}/100</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 leading-tight">
            * {aiScore.disclaimer}
          </div>
        </div>
      </div>

      {/* 6. Content Type Analysis & Best Posting Time */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Type Comparison (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/70 p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-5">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" /> Content Format Performance
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparing average metrics and virality index across Reels, Carousels, Posts, and Stories
            </p>
          </div>

          <div className="space-y-3.5">
            {contentTypeComparison.map(fmt => (
              <div key={fmt.type} className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-white text-sm">{fmt.type}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      {fmt.count} published
                    </span>
                    <span className="text-xs text-purple-400 font-bold">
                      {fmt.avgEngagementRate}% ER
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400">Avg Views: <strong className="text-slate-200">{formatNumber(fmt.avgViews)}</strong></span>
                    <span className="text-slate-400">Virality: <strong className="text-emerald-400">{fmt.viralityIndex}/100</strong></span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  💡 {fmt.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Best Posting Time Recommendation (1 Col) */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 p-6 sm:p-7 rounded-3xl border border-indigo-500/20 space-y-5">
          <div>
            <span className="text-[10px] font-black tracking-wider text-indigo-400 uppercase bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              AI Recommendation
            </span>
            <h3 className="text-lg font-black text-white mt-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" /> Best Posting Times
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Optimized for global reach & algorithm favorability</p>
          </div>

          <div className="space-y-3">
            {bestPostingTimes.map((bpt, idx) => (
              <div key={idx} className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">{bpt.dayOfWeek}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    {bpt.expectedEngagementMultiplier} Boost
                  </span>
                </div>
                <div className="text-sm font-extrabold text-purple-400">
                  {bpt.peakHourRange}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {bpt.reasoning}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Top Content Section */}
      <div className="bg-slate-900/70 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-pink-400" /> Top Performing Content
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked by views, engagement depth, and community bookmarking
            </p>
          </div>

          {/* Format Filter Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            {(['all', 'reel', 'post', 'carousel'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => handleContentFilterChange(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                  contentFilter === tab
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'all' ? 'All Content' : tab + 's'}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {topContent.map(item => (
            <div
              key={item.id}
              className="bg-slate-950/80 rounded-2xl border border-slate-800/90 overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail Header */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-slate-700/50">
                    {item.type === 'reel' ? (
                      <Film className="w-3 h-3 text-pink-400" />
                    ) : item.type === 'carousel' ? (
                      <Layers className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <ImageIcon className="w-3 h-3 text-amber-400" />
                    )}
                    <span>{item.type}</span>
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-emerald-400 text-[10px] font-bold">
                    {item.engagementRate}% ER
                  </div>
                </div>

                {/* Caption Snippet */}
                <div className="p-4">
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-medium">
                    {item.caption}
                  </p>
                  <span className="text-[10px] text-slate-500 mt-1.5 block">
                    Posted {item.postedDate}
                  </span>
                </div>
              </div>

              {/* Metrics Footer */}
              <div className="px-4 py-3 bg-slate-900/50 border-t border-slate-800/80 grid grid-cols-4 gap-2 text-center text-[10px]">
                <div>
                  <div className="font-bold text-slate-300 flex items-center justify-center gap-0.5">
                    <Eye className="w-3 h-3 text-slate-500" /> {formatNumber(item.views)}
                  </div>
                  <span className="text-[9px] text-slate-500">Views</span>
                </div>
                <div>
                  <div className="font-bold text-rose-400 flex items-center justify-center gap-0.5">
                    <Heart className="w-3 h-3" /> {formatNumber(item.likes)}
                  </div>
                  <span className="text-[9px] text-slate-500">Likes</span>
                </div>
                <div>
                  <div className="font-bold text-blue-400 flex items-center justify-center gap-0.5">
                    <MessageCircle className="w-3 h-3" /> {formatNumber(item.comments)}
                  </div>
                  <span className="text-[9px] text-slate-500">Comments</span>
                </div>
                <div>
                  <div className="font-bold text-amber-400 flex items-center justify-center gap-0.5">
                    <Bookmark className="w-3 h-3" /> {formatNumber(item.saves)}
                  </div>
                  <span className="text-[9px] text-slate-500">Saves</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Audience Analytics Section */}
      <div className="bg-slate-900/70 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        <div>
          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" /> Audience Demographics & Geography
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified follower distribution across age cohorts, gender identities, and geographic hubs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Age Distribution (Bar Chart) */}
          <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span>Age Cohort Distribution</span>
              <span className="text-purple-400">Primary: 18–24 (48%)</span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={audience.ageDistribution} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="bracket" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(v: any) => [`${v}%`, 'Audience Share']}
                  />
                  <Bar dataKey="percentage" fill="#a855f7" radius={[6, 6, 0, 0]}>
                    {audience.ageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 1 ? '#ec4899' : '#a855f7'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gender Distribution */}
          <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span>Gender Distribution</span>
              <span className="text-cyan-400">High Male Skew</span>
            </div>
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-400">Male</span>
                  <span className="text-white font-bold">{audience.genderDistribution.male}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${audience.genderDistribution.male}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-400">Female</span>
                  <span className="text-white font-bold">{audience.genderDistribution.female}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-pink-500 rounded-full" style={{ width: `${audience.genderDistribution.female}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-400">Non-Binary / Custom</span>
                  <span className="text-white font-bold">{audience.genderDistribution.other}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${audience.genderDistribution.other}%` }} />
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
              Optimal matching for gaming, tech, sports, and youth lifestyle brand campaigns.
            </p>
          </div>

          {/* Top Countries & Cities */}
          <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span>Top Geographic Markets</span>
              <span className="text-slate-400">Global Reach</span>
            </div>
            <div className="space-y-2 text-xs">
              {audience.topCountries.slice(0, 4).map(country => (
                <div key={country.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="flex items-center gap-2 font-medium text-slate-200">
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </span>
                  <span className="font-bold text-purple-300">{country.percentage}%</span>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
              <span>Top Cities:</span>
              <span className="text-slate-300 font-semibold truncate max-w-[200px]">
                {audience.topCities.map(c => c.name.split(',')[0]).join(' • ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 9. CreatorHub AI Insights Section (Dynamic & Actionable) */}
      <div className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl border border-purple-500/30 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h3 className="text-base sm:text-lg font-black text-white">CreatorHub AI Strategy Insights</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated heuristics analyzing verified engagement patterns, timing, and brand fit
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {aiInsights.length} Live Insights
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiInsights.map(insight => (
            <div
              key={insight.id}
              className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-purple-500/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-xs font-black text-white leading-snug">
                  {insight.title}
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-500/20 text-purple-300 shrink-0">
                  {insight.metricHighlight}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {insight.description}
              </p>
              <div className="p-3 rounded-xl bg-purple-900/20 border border-purple-500/20 text-[11px] text-purple-200">
                <strong className="text-amber-300 block mb-0.5">Actionable Recommendation:</strong>
                {insight.actionableRecommendation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 10. Brand Collaboration Readiness & Marketplace Fit */}
      <div className="bg-slate-900/80 p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black tracking-wider text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Marketplace Readiness
            </span>
            <h3 className="text-lg font-black text-white mt-1.5 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-400" /> Brand Collaboration Readiness
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Creator qualification score for local & national Brand brief matching
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-black flex items-center gap-2 shadow-sm self-start sm:self-auto">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>{brandReadiness.tier} ({brandReadiness.readinessScore}/100)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quality Item 1 */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400">Engagement Quality</div>
            <div className="text-base font-black text-emerald-400">{brandReadiness.engagementQuality.rating}</div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {brandReadiness.engagementQuality.description}
            </p>
          </div>

          {/* Quality Item 2 */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400">Audience Authenticity</div>
            <div className="text-base font-black text-cyan-400">{brandReadiness.audienceAuthenticity.score}% Human Retention</div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {brandReadiness.audienceAuthenticity.description}
            </p>
          </div>

          {/* Quality Item 3 */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400">Content Brand Safety</div>
            <div className="text-base font-black text-purple-400">{brandReadiness.contentBrandSafety.rating}</div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Safety Score: {brandReadiness.contentBrandSafety.score}/100. Suitable for all commercial sponsors.
            </p>
          </div>
        </div>

        {/* Recommended Campaign Categories & Estimated Market Pricing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          {/* Categories */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-300">Recommended Campaign Verticals:</h4>
            <div className="flex flex-wrap gap-2">
              {brandReadiness.recommendedCampaignCategories.map(cat => (
                <span
                  key={cat}
                  className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold"
                >
                  ✓ {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Estimated Market Pricing */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-300">Suggested CreatorHub Escrow Pricing:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Reel Deliverable</span>
                <strong className="text-emerald-400">{brandReadiness.estimatedMarketPricing.reelPlacement}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Carousel Feature</span>
                <strong className="text-purple-300">{brandReadiness.estimatedMarketPricing.carouselEndorsement}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
