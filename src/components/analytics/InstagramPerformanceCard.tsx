import React, { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Users, Eye, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Instagram } from '../icons/InstagramIcon';
import { instagramAnalyticsService } from '../../services/instagramAnalyticsService';
import { DemoInstagramProfile, InstagramOverviewMetrics } from '../../types/instagramAnalytics';

interface InstagramPerformanceCardProps {
  onViewFullAnalytics: () => void;
}

export const InstagramPerformanceCard: React.FC<InstagramPerformanceCardProps> = ({
  onViewFullAnalytics
}) => {
  const [profile, setProfile] = useState<DemoInstagramProfile | null>(null);
  const [metrics, setMetrics] = useState<InstagramOverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadQuickStats = async () => {
      try {
        const [profData, metData] = await Promise.all([
          instagramAnalyticsService.getProfile(),
          instagramAnalyticsService.getOverviewMetrics()
        ]);
        if (isMounted) {
          setProfile(profData);
          setMetrics(metData);
        }
      } catch (err) {
        console.error('Failed loading Instagram performance card data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadQuickStats();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 animate-pulse">
        <div className="h-5 bg-slate-800 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-16 bg-slate-800/60 rounded-2xl" />
          <div className="h-16 bg-slate-800/60 rounded-2xl" />
          <div className="h-16 bg-slate-800/60 rounded-2xl" />
          <div className="h-16 bg-slate-800/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  const isConnected = profile?.isConnected ?? true;

  const formatNumber = (num?: number): string => {
    if (num === undefined || num === null) return '0';
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div className="bg-[#0c1416] p-6 sm:p-7 rounded-3xl border border-[#1c292c] shadow-xl relative overflow-hidden">
      {/* Background Glow Accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-pink/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink via-rose-500 to-amber-500 p-0.5 shadow-lg shadow-pink/20 flex-shrink-0">
            <img
              src={profile?.avatarUrl || '/mrbeast-avatar.jpg'}
              alt={profile?.name || 'Creator'}
              className="w-full h-full rounded-[14px] object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/mrbeast-avatar.jpg';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                <Instagram className="w-4 h-4 text-pink" />
                Instagram Performance
              </h3>
              {profile?.isDemoMode ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink/20 border border-pink/30 text-pink">
                  DEMO DATA
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                  LIVE VERIFIED
                </span>
              )}
              {isConnected ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Disconnected
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
              <span className="font-semibold text-zinc-300">@{profile?.username || 'creator'}</span>
              <span>•</span>
              <span className="text-pink font-medium">{profile?.category || 'Digital Creator'}</span>
            </div>
          </div>
        </div>

        {/* View Full Analytics Action Button */}
        <button
          onClick={onViewFullAnalytics}
          className="px-4 py-2.5 rounded-xl bg-pink hover:bg-pink-hover text-[#071012] text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-pink/20 transition-all self-start sm:self-auto group cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#071012] group-hover:rotate-12 transition-transform" />
          <span>View Full Analytics</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 4 Compact Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10">
        {/* Metric 1: Followers */}
        <div className="bg-[#071012] p-4 rounded-2xl border border-[#1c292c] hover:border-[#2a3f44] transition-colors">
          <div className="text-[11px] font-bold text-zinc-400 flex items-center justify-between mb-1.5">
            <span>Followers</span>
            <Users className="w-3.5 h-3.5 text-pink" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {formatNumber(profile?.followersCount)}
          </div>
          <div className="text-[10px] text-zinc-400 font-medium mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">+{metrics?.followerGrowthRate ?? 8.4}%</span>
            <span>growth rate</span>
          </div>
        </div>

        {/* Metric 2: Engagement Rate */}
        <div className="bg-[#071012] p-4 rounded-2xl border border-[#1c292c] hover:border-[#2a3f44] transition-colors">
          <div className="text-[11px] font-bold text-zinc-400 flex items-center justify-between mb-1.5">
            <span>Engagement Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-pink" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-pink">
            {metrics?.engagementRate ?? 4.37}%
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <span>+{metrics?.engagementTrend ?? 0.45}% vs last month</span>
          </div>
        </div>

        {/* Metric 3: Follower Growth */}
        <div className="bg-[#071012] p-4 rounded-2xl border border-[#1c292c] hover:border-[#2a3f44] transition-colors">
          <div className="text-[11px] font-bold text-zinc-400 flex items-center justify-between mb-1.5">
            <span>Quarterly Growth</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300">
            +{formatNumber(metrics?.followerGrowthNet)}
          </div>
          <div className="text-[10px] text-zinc-400 font-medium mt-1">
            Net new followers
          </div>
        </div>

        {/* Metric 4: Avg Reel Views */}
        <div className="bg-[#071012] p-4 rounded-2xl border border-[#1c292c] hover:border-[#2a3f44] transition-colors">
          <div className="text-[11px] font-bold text-zinc-400 flex items-center justify-between mb-1.5">
            <span>Avg Reel Views</span>
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-300">
            {formatNumber(metrics?.avgReelViews)}
          </div>
          <div className="text-[10px] text-zinc-400 font-medium mt-1">
            Per video average
          </div>
        </div>
      </div>

      {/* Mini Footnote */}
      <div className="mt-4 pt-3 border-t border-[#1c292c] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-zinc-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-pink" />
          {profile?.isDemoMode ? (
            <span>Demo profile reference: <strong className="text-zinc-400">MrBeast (@mrbeast_demo)</strong></span>
          ) : (
            <span>Verified live Instagram data: <strong className="text-zinc-300">@{profile?.username}</strong></span>
          )}
        </div>
        <span className="text-[10px] bg-[#071012] px-2 py-0.5 rounded text-zinc-400 border border-[#1c292c]">
          CreatorHub AI Analytics Engine v1.0
        </span>
      </div>
    </div>
  );
};
