import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Compass,
  Bot,
  Layers,
  MessageSquare,
  DollarSign,
  UserCheck,
  Settings,
  RefreshCw,
  MapPin,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  FileCheck,
  Send,
  Crown,
  Award,
  Zap,
  ChevronRight,
  X
} from 'lucide-react';
import { Instagram } from '../components/icons/InstagramIcon';
import { InstagramIntegrationView } from '../components/instagram/InstagramIntegrationView';
import { AICreatorAnalysisCard } from '../components/analytics/AICreatorAnalysisCard';
import { InstagramPerformanceCard } from '../components/analytics/InstagramPerformanceCard';
import { InstagramAnalyticsPage } from '../components/analytics/InstagramAnalyticsPage';
import { CreatorSubscriptionModal } from '../components/CreatorSubscriptionModal';
import { ThemeToggle } from '../components/ThemeToggle';
import { CreatorSubscriptionStatus } from '../types';

export const CreatorDashboard: React.FC = () => {
  const { user, refreshSessionUser, showToast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'instagram-analytics' | 'instagram' | 'ai' | 'collaborations' | 'earnings' | 'messages' | 'profile' | 'membership'>('overview');
  const [loading, setLoading] = useState(true);
  const [syncingInstagram, setSyncingInstagram] = useState(false);

  // Loaded Data
  const [instagramData, setInstagramData] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<CreatorSubscriptionStatus | null>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [oauthFeedback, setOauthFeedback] = useState<{ message: string; isError?: boolean } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Deliverables submission state
  const [selectedCollab, setSelectedCollab] = useState<any>(null);
  const [liveUrl, setLiveUrl] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofError, setProofError] = useState('');
  const [proofSuccess, setProofSuccess] = useState(false);

  const profile = (user?.profile as any) || {};

  const handleAcceptApplication = async (appId: string) => {
    setActionLoadingId(appId);
    try {
      const res = await api.acceptApplication(appId);
      if (res.success) {
        showToast('🤝 Offer accepted! Collaboration and Escrow are now active.');
        await loadAllData();
        setActiveTab('collaborations');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to accept offer.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeclineApplication = async (appId: string) => {
    setActionLoadingId(appId);
    try {
      const res = await api.declineApplication(appId);
      if (res.success) {
        showToast('Offer declined.');
        await loadAllData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to decline offer.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [igRes, appsRes, colRes, earnRes, subRes, convRes] = await Promise.allSettled([
        api.getInstagramAnalytics(),
        api.getApplications(),
        api.getCollaborations(),
        api.getCreatorEarnings(),
        api.getSubscriptionStatus(),
        api.getConversations()
      ]);

      if (igRes.status === 'fulfilled' && igRes.value.success) {
        setInstagramData(igRes.value);
      }
      if (appsRes.status === 'fulfilled' && appsRes.value.success) {
        setApplications(appsRes.value.applications || []);
      }
      if (colRes.status === 'fulfilled' && colRes.value.success) {
        setCollaborations(colRes.value.collaborations || []);
      }
      if (earnRes.status === 'fulfilled' && earnRes.value.success) {
        setEarnings(earnRes.value);
      }
      if (subRes.status === 'fulfilled' && subRes.value.success) {
        setSubscriptionData(subRes.value);
      }
      if (convRes.status === 'fulfilled' && convRes.value.success) {
        setConversations(convRes.value.conversations || []);
      }

      // Check if creator already has stored AI analysis
      if (profile.id) {
        try {
          const aiRes = await api.getCreatorAIAnalysis(profile.id);
          if (aiRes.success && aiRes.analysis) {
            setAiAnalysis(aiRes.analysis);
          }
        } catch {
          // Stored analysis doesn't exist yet
        }
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin/dashboard');
      return;
    }
    loadAllData();
  }, [user, navigate]);

  // Sync route and query params with active tab
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'applications', 'collaborations', 'earnings', 'messages', 'instagram-analytics', 'instagram', 'ai', 'profile', 'membership'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    } else if (location.pathname === '/creator/instagram-analytics') {
      setActiveTab('instagram-analytics');
    } else if (location.pathname === '/creator/collaborations' || location.pathname === '/creator/deliverables') {
      setActiveTab('collaborations');
    } else if (location.pathname === '/creator/applications') {
      setActiveTab('applications');
    } else if (location.pathname === '/creator/earnings') {
      setActiveTab('earnings');
    }

    const submitId = searchParams.get('submit_id') || searchParams.get('submit_collab_id');
    if (submitId) {
      const found = collaborations.find(c => c.id === submitId || c.application_id === submitId) ||
                    applications.find(a => a.id === submitId || a.collaboration_id === submitId);
      if (found) {
        setSelectedCollab({
          id: found.collaboration_id || found.id,
          campaign_title: found.campaign_title || 'Direct Brand Collaboration',
          brand_name: found.brand_name || 'Brand Partner',
          reward_per_creator: found.reward_per_creator || found.proposed_budget || 5000
        });
      }
    }
  }, [location.pathname, location.search, collaborations, applications]);

  // Handle Meta OAuth redirect parameters (?code=...&state=... or ?ig_code=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code') || params.get('ig_code');
    const state = params.get('state') || params.get('ig_state');
    const err = params.get('error') || params.get('ig_error');
    const errDesc = params.get('error_description');

    if (err || errDesc) {
      setOauthFeedback({
        message: errDesc || "Your Instagram account cannot currently be connected through Meta's Instagram API. Please make sure you are using an eligible professional Instagram account.",
        isError: true
      });
      setActiveTab('instagram');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      setActiveTab('instagram');
      setSyncingInstagram(true);
      api.handleInstagramCallback(code, state || undefined)
        .then(res => {
          if (res.success) {
            setOauthFeedback({ message: 'Instagram account connected and synchronized successfully via Meta Graph API!' });
            loadAllData();
          } else {
            setOauthFeedback({
              message: res.error || "Your Instagram account cannot currently be connected through Meta's Instagram API. Please make sure you are using an eligible professional Instagram account.",
              isError: true
            });
          }
        })
        .catch(error => {
          setOauthFeedback({
            message: error.message || "Your Instagram account cannot currently be connected through Meta's Instagram API. Please make sure you are using an eligible professional Instagram account.",
            isError: true
          });
        })
        .finally(() => {
          setSyncingInstagram(false);
        });
    }
  }, []);

  const handleRefreshInstagram = async () => {
    setSyncingInstagram(true);
    try {
      try {
        await api.syncInstagramAnalytics();
      } catch (syncErr: any) {
        console.warn('Instagram sync warning:', syncErr.message);
      }
      const igRes = await api.getInstagramAnalytics();
      if (igRes && igRes.success) {
        setInstagramData(igRes);
      }
    } catch (err) {
      console.error('Failed to reload Instagram data:', err);
    } finally {
      setSyncingInstagram(false);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollab || !liveUrl.trim()) return;

    setSubmittingProof(true);
    setProofError('');
    try {
      const res = await api.submitDeliverableProof(selectedCollab.id, {
        live_post_url: liveUrl.trim(),
        notes: proofNotes.trim()
      });

      if (res.success) {
        setProofSuccess(true);
        showToast('🚀 Deliverable proof submitted! Brand has been notified to verify & release escrow.');
        setTimeout(() => {
          setSelectedCollab(null);
          setProofSuccess(false);
          setLiveUrl('');
          setProofNotes('');
          loadAllData();
        }, 1600);
      } else {
        setProofError(res.error || 'Failed to submit proof.');
      }
    } catch (err: any) {
      setProofError(err.message || 'Failed to submit proof.');
    } finally {
      setSubmittingProof(false);
    }
  };

  const isDirectPitch = (a: any) =>
    a.status === 'SHORTLISTED' ||
    a.status === 'OFFERED' ||
    Boolean(
      a.pitch &&
      (a.pitch.startsWith('Direct Brand Pitch:') ||
       a.pitch.startsWith('Direct Brand Offer:') ||
       a.pitch.startsWith('Direct Pitch:') ||
       a.pitch.toLowerCase().includes('direct'))
    );

  const isIgConnected = Boolean(instagramData && instagramData.is_connected);
  const currentTier = subscriptionData?.tier || (profile.subscription_tier as any) || 'free';
  const unreadPitchCount = conversations.reduce((acc, c) => acc + Number(c.unread_count || 0), 0);
  const incomingPitches = conversations.filter(c => c.last_message && (c.last_message.toLowerCase().includes('pitch') || c.last_message.toLowerCase().includes('offer') || c.last_message.toLowerCase().includes('campaign') || Number(c.unread_count || 0) > 0));

  const getTierBadgeInfo = (tier: string) => {
    switch (tier) {
      case 'diamond':
        return {
          label: 'Diamond Elite',
          color: 'from-cyan-500 to-blue-500',
          textColor: 'text-cyan-400',
          borderColor: 'border-cyan-500/30',
          bgColor: 'bg-cyan-500/10',
          icon: Crown
        };
      case 'gold':
        return {
          label: 'Gold VIP',
          color: 'from-amber-400 to-yellow-500',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/30',
          bgColor: 'bg-amber-500/10',
          icon: Award
        };
      case 'silver':
        return {
          label: 'Silver Pro',
          color: 'from-slate-300 to-slate-400',
          textColor: 'text-slate-300',
          borderColor: 'border-slate-400/30',
          bgColor: 'bg-slate-400/10',
          icon: Zap
        };
      default:
        return {
          label: 'Free Plan',
          color: 'from-slate-500 to-slate-600',
          textColor: 'text-slate-400',
          borderColor: 'border-slate-700',
          bgColor: 'bg-slate-800/40',
          icon: Zap
        };
    }
  };

  const tierInfo = getTierBadgeInfo(currentTier);
  const TierIcon = tierInfo.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900/60 border-r border-slate-800/80 p-6 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-purple-500/25">
              C
            </div>
            <span className="font-black text-white text-xl tracking-tight">CreaterHub</span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'overview'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" /> Overview
            </button>

            <Link
              to="/creator/feed"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
            >
              <Sparkles className="w-4 h-4 text-purple-400" /> Discover Briefs
            </Link>

            <button
              onClick={() => setActiveTab('applications')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'applications'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-3">
                <FileCheck className="w-4 h-4" /> Applications
              </span>
              {applications.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-purple-300">
                  {applications.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('collaborations')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'collaborations'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-3">
                <Layers className="w-4 h-4" /> Deliverables
              </span>
              {collaborations.filter(c => c.status === 'ACTIVE').length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
                  {collaborations.filter(c => c.status === 'ACTIVE').length} active
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('instagram-analytics');
                navigate('/creator/instagram-analytics');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'instagram-analytics'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-pink-400" /> Instagram Analytics
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-pink-500/20 text-pink-300 border border-pink-500/30">
                DEMO
              </span>
            </button>

            <button
              onClick={() => setActiveTab('instagram')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'instagram'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-3">
                <Instagram className="w-4 h-4 text-slate-400" /> Meta API Sync
              </span>
              {isIgConnected && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'ai'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Bot className="w-4 h-4 text-purple-400" /> AI Analysis
            </button>

            <Link
              to="/creator/messages"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
            >
              <span className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-blue-400" /> Messages & Pitches
              </span>
              {unreadPitchCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-600 text-white animate-pulse">
                  {unreadPitchCount} new
                </span>
              )}
            </Link>

            <button
              onClick={() => setActiveTab('earnings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'earnings'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Escrow & Earnings
              </span>
              {Number(earnings?.total_earned || 0) > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ₹{Number(earnings.total_earned).toLocaleString()}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('membership')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'membership'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-3">
                <Crown className="w-4 h-4 text-amber-400" /> Pro Membership
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tierInfo.bgColor} ${tierInfo.textColor} border ${tierInfo.borderColor}`}>
                {tierInfo.label.split(' ')[0]}
              </span>
            </button>

            <Link
              to={`/creators/${profile.id || ''}`}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
            >
              <UserCheck className="w-4 h-4" /> Public Profile
            </Link>
          </nav>
        </div>

        {/* User Mini Profile & Theme Toggle */}
        <div className="pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={profile.full_name || 'Creator'}
                className="w-9 h-9 rounded-xl object-cover border border-slate-700"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">{profile.full_name || 'Creator'}</div>
                <div className="text-[11px] text-slate-500 truncate">@{profile.username}</div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-6xl mx-auto w-full">
        {/* OAuth Return Notification */}
        {oauthFeedback && (
          <div className={`mb-6 p-4 rounded-2xl border text-xs flex items-center justify-between shadow-lg ${
            oauthFeedback.isError
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
          }`}>
            <div className="flex items-center gap-3">
              <span className="font-bold">{oauthFeedback.message}</span>
            </div>
            <button
              onClick={() => setOauthFeedback(null)}
              className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Top Profile Header (Section 9) - Hidden on dedicated Instagram Analytics tab to avoid duplicate headers */}
        {activeTab !== 'instagram-analytics' && (
          <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 shadow-xl">
            <div className="flex items-center gap-4">
              <img
                src={
                  instagramData?.account?.profile_picture_url ||
                  profile.avatar_url ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                }
                alt={profile.full_name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/30 shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white">{profile.full_name || 'Creator'}</h1>
                  {profile.verified && (
                    <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white">
                      ✓
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>@{profile.username}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-purple-400 font-semibold">
                    <MapPin className="w-3.5 h-3.5" /> {profile.area || profile.city || 'Bengaluru'}
                  </span>
                  <span>•</span>
                  <span className="text-slate-300">
                    Min: ₹{Number(profile.min_budget || 3000).toLocaleString()}
                  </span>
                  {Number(earnings?.total_earned || 0) > 0 && (
                    <>
                      <span>•</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Approved & Escrow Released: ₹{Number(earnings.total_earned).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Status Badges & Subscription */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Membership Tier Pill */}
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${tierInfo.bgColor} ${tierInfo.borderColor} ${tierInfo.textColor}`}>
                <TierIcon className="w-3.5 h-3.5" />
                <span>{tierInfo.label}</span>
              </div>

              <button
                onClick={() => setIsSubscriptionModalOpen(true)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                  currentTier === 'free'
                    ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white hover:from-amber-400 hover:to-purple-500 shadow-amber-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {currentTier === 'free' ? 'Upgrade to Pro' : 'Manage Tier'}
              </button>

              {isIgConnected ? (
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Instagram Connected ✓
                </div>
              ) : (
                <button
                  onClick={() => setActiveTab('instagram')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-pink-600/20"
                >
                  <Instagram className="w-4 h-4" /> Connect Instagram
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Incoming Brand Pitches Banner */}
            {incomingPitches.length > 0 && (
              <div className="bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-slate-900 border-2 border-purple-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 animate-in fade-in duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 text-2xl shadow-inner">
                    🎯
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                        Direct Brand Collaboration Offers
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                        {incomingPitches.length} Offer{incomingPitches.length > 1 ? 's' : ''} Received
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                      Brands have pitched paid collaboration proposals with guaranteed reward budgets to your inbox.
                    </p>
                    <div className="mt-2.5 flex items-center gap-2 text-xs text-purple-200 font-semibold bg-purple-900/30 px-3 py-1.5 rounded-xl border border-purple-500/20 w-fit">
                      <span>Latest from {incomingPitches[0].other_name || incomingPitches[0].other_party_name || 'Brand Partner'}:</span>
                      <span className="text-purple-300 font-normal truncate max-w-sm">"{incomingPitches[0].last_message}"</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const matchedApp = applications.find(isDirectPitch);
                      const matchedCollab = collaborations.find(c => c.status === 'ACTIVE' || c.status === 'SUBMITTED');
                      if (matchedCollab) {
                        setSelectedCollab(matchedCollab);
                      } else if (matchedApp) {
                        setSelectedCollab({
                          id: matchedApp.collaboration_id || matchedApp.id,
                          campaign_title: matchedApp.campaign_title || 'Direct Brand Collaboration',
                          brand_name: matchedApp.brand_name || 'Brand Partner',
                          reward_per_creator: matchedApp.proposed_budget || matchedApp.reward_per_creator || 5000
                        });
                      } else {
                        setActiveTab('applications');
                      }
                    }}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 text-white text-xs font-black flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <Send className="w-4 h-4" /> Submit Content Proof
                  </button>
                  <Link
                    to="/creator/messages"
                    className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-purple-400" /> Chat in Messages
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Total Released Earnings */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-6 rounded-2xl border border-emerald-500/40 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Total Released Earnings
                  </div>
                  {Number(earnings?.total_earned || 0) > 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <div className="text-3xl font-black text-emerald-300">
                  ₹{Number(earnings?.total_earned || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-400/90 font-semibold mt-1">
                  Approved & Escrow Released ✓
                </div>
              </div>

              {/* Funds In Escrow */}
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                <div className="text-xs font-bold text-slate-400 mb-1">Funds in Escrow</div>
                <div className="text-3xl font-black text-white">
                  ₹{Number(earnings?.held_in_escrow || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Awaiting brand review & release
                </div>
              </div>

              {/* Active Deliverables */}
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                <div className="text-xs font-bold text-slate-400 mb-1">Active Deliverables</div>
                <div className="text-3xl font-black text-white">
                  {collaborations.filter(c => c.status === 'ACTIVE' || c.status === 'SUBMITTED').length}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Campaigns in progress</div>
              </div>

              {/* Applications Submitted */}
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                <div className="text-xs font-bold text-slate-400 mb-1">Applications Submitted</div>
                <div className="text-3xl font-black text-purple-400">
                  {applications.length}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {applications.filter(a => a.status === 'ACCEPTED').length} accepted
                </div>
              </div>
            </div>

            {/* Active Deliverables & Proof Submissions on Overview */}
            {(collaborations.filter(c => c.status !== 'COMPLETED').length > 0 || applications.filter(isDirectPitch).length > 0) && (
              <div className="bg-slate-900/80 p-6 rounded-3xl border border-purple-500/30 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider block mb-0.5">
                      Deliverable Action Required
                    </span>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-purple-400" /> Active Deliverables & Content Proof Submissions
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('collaborations')}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                  >
                    View in Deliverables tab →
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {/* From active collaborations */}
                  {collaborations.filter(c => c.status !== 'COMPLETED').map(col => (
                    <div
                      key={col.id}
                      className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 font-black text-lg">
                          🎯
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-purple-400 font-bold">{col.brand_name || 'Brand Partner'}</span>
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {col.status === 'SUBMITTED' ? 'Proof in Review' : 'Deliverable Active'}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-0.5">{col.campaign_title || 'Direct Brand Collaboration'}</h4>
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>Escrow Payout: <strong className="text-emerald-400">₹{Number(col.reward_per_creator || 5000).toLocaleString()}</strong></span>
                            <span>•</span>
                            <span className="text-slate-500">Step {col.current_step || 1} of 4</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setSelectedCollab(col)}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {col.status === 'SUBMITTED' ? 'Update Proof' : 'Submit Proof'}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* From direct pitch applications that may not yet have a matching col in state */}
                  {applications.filter(isDirectPitch).filter(a => !collaborations.some(c => c.application_id === a.id || c.campaign_id === a.campaign_id)).map(app => (
                    <div
                      key={app.id}
                      className="p-4 bg-slate-950/70 rounded-2xl border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-purple-500/50 transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={app.brand_logo || 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=150'}
                          alt={app.brand_name || 'Brand'}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-purple-400 font-bold">{app.brand_name || 'Brand Partner'}</span>
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Direct Offer
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-0.5">{app.campaign_title || 'Direct Collaboration Offer'}</h4>
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>Guaranteed Escrow: <strong className="text-emerald-400">₹{Number(app.proposed_budget || app.reward_per_creator || 5000).toLocaleString()}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCollab({
                              id: app.collaboration_id || app.id,
                              campaign_title: app.campaign_title || 'Direct Collaboration Offer',
                              brand_name: app.brand_name || 'Brand Partner',
                              reward_per_creator: app.proposed_budget || app.reward_per_creator || 5000
                            });
                          }}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" /> Submit Proof
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instagram Performance Compact Card (Demo AI Analytics) */}
            <InstagramPerformanceCard
              onViewFullAnalytics={() => {
                setActiveTab('instagram-analytics');
                navigate('/creator/instagram-analytics');
              }}
            />

            {/* Membership & Application Quota Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-purple-950/40 p-6 rounded-3xl border border-slate-800 relative overflow-hidden shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl bg-gradient-to-tr ${tierInfo.color} text-slate-950 shadow-md`}>
                      <TierIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400">Current Membership</div>
                      <div className="text-lg font-black text-white flex items-center gap-2">
                        {tierInfo.label}
                        <span className="text-[11px] font-semibold text-slate-400">
                          {subscriptionData?.expires_at ? `(Active until ${new Date(subscriptionData.expires_at).toLocaleDateString()})` : '(Lifetime Starter)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
                    {currentTier === 'free'
                      ? 'Free creators can submit up to 3 applications/month for briefs up to ₹5,000. Upgrade to Silver, Gold, or Diamond to apply to higher-paying briefs!'
                      : currentTier === 'silver'
                      ? 'Silver Pro unlocked: 15 applications/month and briefs up to ₹15,000 with Early Brief Access.'
                      : currentTier === 'gold'
                      ? 'Gold VIP unlocked: 40 applications/month, brief payouts up to ₹50,000, AI Pitch Assistant & Brand Match boost!'
                      : 'Diamond Elite unlocked: Unlimited applications, mega payouts (₹50k+), 0% platform fee & top matchmaking priority!'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-purple-300 font-semibold">
                    <span>Brief Payout Limit:</span>
                    <span className="text-emerald-400 font-bold">
                      {subscriptionData?.max_campaign_reward === 'unlimited'
                        ? 'Unlimited Reward Briefs'
                        : `Up to ₹${(subscriptionData?.max_campaign_reward || 5000).toLocaleString()} per Brief`}
                    </span>
                  </div>
                </div>

                {/* Quota Gauge & Upgrade CTA */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
                  <div className="min-w-[170px]">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-400">Monthly Applications</span>
                      <span className="text-white">
                        {subscriptionData?.applications_used_this_month ?? 0} / {subscriptionData?.applications_limit === 'unlimited' ? '∞' : (subscriptionData?.applications_limit ?? 3)}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                        style={{
                          width: subscriptionData?.applications_limit === 'unlimited'
                            ? '15%'
                            : `${Math.min(100, (((subscriptionData?.applications_used_this_month ?? 0) / (subscriptionData?.applications_limit || 3)) * 100))}%`
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {subscriptionData?.applications_remaining === 'unlimited'
                        ? 'Unlimited applications available'
                        : `${subscriptionData?.applications_remaining ?? 3} applications remaining this month`}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsSubscriptionModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 whitespace-nowrap transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    {currentTier === 'diamond' ? 'View Perks' : 'Upgrade Plan'}
                  </button>
                </div>
              </div>
            </div>

            {/* Campaign Discovery CTA Banner */}
            <div className="bg-gradient-to-r from-purple-950/50 via-slate-900 to-slate-900 p-8 rounded-3xl border border-purple-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-1">
                  Local Matchmaker
                </span>
                <h3 className="text-xl font-black text-white mb-2">Explore Nearby Campaign Feed</h3>
                <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
                  Discover briefs within 1km - 25km radius from your current location and apply with custom pitches.
                </p>
              </div>
              <Link
                to="/creator/feed"
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 self-start sm:self-auto"
              >
                <Compass className="w-4 h-4" /> Open Campaign Feed
              </Link>
            </div>

            {/* Active Collaborations Quick List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Current Collaborations</h3>
                <button onClick={() => setActiveTab('collaborations')} className="text-xs text-purple-400 font-bold hover:underline">
                  View All ({collaborations.length})
                </button>
              </div>

              {collaborations.length === 0 ? (
                <div className="text-center py-10 bg-slate-900/30 rounded-2xl border border-slate-800 text-xs text-slate-400">
                  No active collaborations yet. Apply to campaigns on the feed to get hired!
                </div>
              ) : (
                <div className="space-y-3">
                  {collaborations.slice(0, 3).map(col => (
                    <div
                      key={col.id}
                      className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img src={col.brand_logo} alt={col.brand_name} className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <h4 className="text-xs font-bold text-white">{col.campaign_title}</h4>
                          <span className="text-[11px] text-slate-400">{col.brand_name} • ₹{col.reward_per_creator?.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {col.status === 'COMPLETED' ? (
                          <div className="flex flex-col sm:items-end">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Approved & Escrow Released ✓
                            </span>
                            <span className="text-[11px] font-black text-emerald-400 mt-0.5">
                              +₹{Number(col.reward_per_creator || 5000).toLocaleString()} Paid
                            </span>
                          </div>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            col.status === 'SUBMITTED'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}>
                            {col.status}
                          </span>
                        )}
                        <button
                          onClick={() => { setSelectedCollab(col); setActiveTab('collaborations'); }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
                        >
                          Details & Proof
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Instagram AI Analytics (Demo Analytics Suite) */}
        {activeTab === 'instagram-analytics' && (
          <InstagramAnalyticsPage />
        )}

        {/* Tab 2: Instagram Analytics (Strict Zero Fake Data) */}
        {activeTab === 'instagram' && (
          <InstagramIntegrationView
            data={instagramData}
            onRefresh={handleRefreshInstagram}
            syncing={syncingInstagram}
          />
        )}

        {/* Tab 3: AI Creator Analysis */}
        {activeTab === 'ai' && (
          <AICreatorAnalysisCard
            analysis={aiAnalysis}
            isInstagramConnected={isIgConnected}
            onAnalysisUpdated={newAnalysis => setAiAnalysis(newAnalysis)}
          />
        )}

        {/* Tab: Applications & Direct Collaboration Offers */}
        {activeTab === 'applications' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">Applications & Collaboration Offers</h2>
                <p className="text-xs text-slate-400">
                  Review direct pitches sent exclusively to you by brands, track your campaign proposals, and accept offers to start escrow.
                </p>
              </div>
              <button
                onClick={loadAllData}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {/* Section 1: Direct Pitches & Exclusive Brand Offers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-extrabold text-lg text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" /> Direct Brand Pitches & Collaboration Offers
                  {applications.filter(isDirectPitch).length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-600 text-white animate-pulse">
                      {applications.filter(isDirectPitch).length} Offer{applications.filter(isDirectPitch).length > 1 ? 's' : ''}
                    </span>
                  )}
                </h3>
              </div>

              {applications.filter(isDirectPitch).length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-2 text-xl">
                    🎯
                  </div>
                  <h4 className="text-sm font-bold text-slate-300">No Pending Direct Brand Pitches</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    When brands discover your profile and send custom pitch offers with locked budget payouts, they will appear here for your immediate acceptance.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {applications
                    .filter(isDirectPitch)
                    .map(app => (
                      <div
                        key={app.id}
                        className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/30 p-6 rounded-3xl border-2 border-purple-500/40 shadow-xl space-y-4 relative"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={app.brand_logo || 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=150'}
                              alt={app.brand_name || 'Brand'}
                              className="w-12 h-12 rounded-2xl object-cover border border-slate-700"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                                  {app.brand_name || 'Brand Partner'}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  Direct Offer
                                </span>
                              </div>
                              <h4 className="text-base font-black text-white">{app.campaign_title || 'Direct Collaboration Offer'}</h4>
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Offered Reward</div>
                            <div className="font-heading text-2xl font-black text-emerald-400">
                              ₹{Number(app.proposed_budget || app.reward_per_creator || 5000).toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center sm:justify-end gap-1 mt-0.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Escrow Protected
                            </div>
                          </div>
                        </div>

                        {/* Brand Pitch Message */}
                        <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80 text-xs space-y-1.5">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Message from Brand:</div>
                          <p className="text-slate-200 leading-relaxed italic">
                            "{app.pitch}"
                          </p>
                          {app.proposed_deliverables && (
                            <div className="text-[11px] text-purple-300 font-semibold pt-1 border-t border-slate-800/60 mt-2">
                              Deliverables requested: {app.proposed_deliverables}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <div className="text-[11px] text-slate-500">
                            Received {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recently'}
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5">
                            {app.status === 'REJECTED' ? (
                              <span className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold">
                                Offer Declined
                              </span>
                            ) : app.collaboration_step === 3 ? (
                              <div className="flex items-center gap-2">
                                <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Proof Submitted • In Review
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const matchedCollab = collaborations.find(c => c.application_id === app.id || c.campaign_id === app.campaign_id);
                                    setSelectedCollab(matchedCollab || {
                                      id: app.collaboration_id || app.id,
                                      campaign_title: app.campaign_title || 'Direct Collaboration Offer',
                                      brand_name: app.brand_name || 'Brand Partner',
                                      reward_per_creator: app.proposed_budget || app.reward_per_creator
                                    });
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                                >
                                  Update Proof
                                </button>
                              </div>
                            ) : app.collaboration_status === 'COMPLETED' ? (
                              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Deliverable Approved & Paid Out ✓
                              </span>
                            ) : (
                              <>
                                <Link
                                  to="/creator/messages"
                                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" /> Chat with Brand
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const matchedCollab = collaborations.find(c => c.application_id === app.id || c.campaign_id === app.campaign_id);
                                    setSelectedCollab(matchedCollab || {
                                      id: app.collaboration_id || app.id,
                                      campaign_title: app.campaign_title || 'Direct Collaboration Offer',
                                      brand_name: app.brand_name || 'Brand Partner',
                                      reward_per_creator: app.proposed_budget || app.reward_per_creator
                                    });
                                  }}
                                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                                >
                                  <Send className="w-3.5 h-3.5" /> Submit Proof
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Section 2: Submitted Campaign Applications */}
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <h3 className="font-heading font-extrabold text-lg text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-400" /> Submitted Campaign Applications ({applications.filter(a => !isDirectPitch(a)).length})
              </h3>

              {applications.filter(a => !isDirectPitch(a)).length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-3">
                  <p className="text-xs text-slate-400">You haven't submitted any campaign applications yet.</p>
                  <Link
                    to="/creator/feed"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/25"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Explore Open Briefs
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {applications
                    .filter(a => !isDirectPitch(a))
                    .map(app => (
                      <div
                        key={app.id}
                        className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center gap-3.5">
                          <img
                            src={app.brand_logo || app.campaign_image || 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=150'}
                            alt={app.brand_name || 'Brand'}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-700"
                          />
                          <div>
                            <div className="text-[11px] font-semibold text-slate-400">{app.brand_name || 'Brand'}</div>
                            <h4 className="text-sm font-bold text-white">{app.campaign_title || 'Campaign Application'}</h4>
                            <div className="text-xs text-slate-400 mt-0.5">
                              Reward: <span className="text-emerald-400 font-bold">₹{Number(app.proposed_budget || app.reward_per_creator || 0).toLocaleString()}</span> • Applied {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recently'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          {app.status === 'ACCEPTED' ? (
                            <button
                              onClick={() => setActiveTab('collaborations')}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-emerald-500/25 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Accepted • Deliverables Active →
                            </button>
                          ) : app.status === 'REJECTED' ? (
                            <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold">
                              Not Selected
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" /> Pending Review
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Collaborations & Deliverable Submissions */}
        {activeTab === 'collaborations' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white mb-1">Collaboration Deliverables</h2>
              <p className="text-xs text-slate-400">
                Track deliverables, submit live links and screenshots, and verify approvals.
              </p>
            </div>

            {collaborations.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800 text-xs text-slate-400">
                No collaborations recorded yet. Explore briefs to begin collaborating.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {collaborations.map(col => (
                  <div key={col.id} className="bg-slate-900/70 p-6 rounded-3xl border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                          Campaign Brief
                        </span>
                        <h3 className="text-lg font-black text-white">{col.campaign_title}</h3>
                        <div className="text-xs text-slate-400">{col.brand_name} • Reward: ₹{col.reward_per_creator?.toLocaleString()}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {col.status === 'COMPLETED' ? (
                          <div className="flex flex-col items-end">
                            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              Approved & Escrow Released ✓
                            </span>
                            <span className="text-xs font-bold text-emerald-400 mt-1">
                              +₹{Number(col.reward_per_creator || 5000).toLocaleString()} Credited
                            </span>
                          </div>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            Status: {col.status}
                          </span>
                        )}
                        {col.status !== 'COMPLETED' && (
                          <button
                            onClick={() => setSelectedCollab(col)}
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md"
                          >
                            Submit Proof
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Step Progression Bar */}
                    <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-800 text-center">
                      {[
                        { step: 1, label: 'Accepted' },
                        { step: 2, label: 'Content Creation' },
                        { step: 3, label: 'Proof Submitted' },
                        { step: 4, label: col.status === 'COMPLETED' ? 'Approved & Escrow Released ✓' : 'Approved & Paid' }
                      ].map(s => (
                        <div
                          key={s.step}
                          className={`p-2.5 rounded-xl border text-[11px] font-bold ${
                            col.status === 'COMPLETED' && s.step === 4
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                              : (col.current_step || 1) >= s.step
                              ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                              : 'bg-slate-950/40 text-slate-500 border-slate-800'
                          }`}
                        >
                          Step {s.step}: {s.label}
                        </div>
                      ))}
                    </div>

                    {/* Submitted Deliverables if any */}
                    {col.submissions?.length > 0 && (
                      <div className="pt-2">
                        <span className="text-xs font-bold text-slate-400 block mb-2">Submitted Proof History:</span>
                        {col.submissions.map((sub: any) => (
                          <div key={sub.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                            <a
                              href={sub.live_post_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-purple-400 font-semibold hover:underline flex items-center gap-1"
                            >
                              {sub.live_post_url} <ExternalLink className="w-3 h-3" />
                            </a>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                              {sub.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Earnings & Simulated Escrow */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">Escrow & Payout Ledger</h2>
                <p className="text-xs text-slate-400">
                  Transparent escrow fund management. Funds are held upon application acceptance and automatically released upon deliverable approval.
                </p>
              </div>

              <button
                onClick={loadAllData}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Balance
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-6 rounded-3xl border border-emerald-500/40 shadow-xl">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Total Released Earnings
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Paid Out
                  </span>
                </div>
                <div className="text-4xl font-black text-emerald-300">
                  ₹{Number(earnings?.total_earned || 0).toLocaleString()}
                </div>
                <div className="text-xs text-emerald-400/90 font-semibold mt-1">
                  Approved & Escrow Released ✓
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  Total earnings deposited directly from approved deliverables
                </div>
              </div>

              <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-purple-400" /> Currently Held in Escrow
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    In Escrow
                  </span>
                </div>
                <div className="text-4xl font-black text-purple-400">
                  ₹{Number(earnings?.held_in_escrow || 0).toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 font-semibold mt-1">
                  Locked for active collaborations
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  Will be released immediately once brand verifies content proof
                </div>
              </div>
            </div>

            {/* Payment Ledger Notice */}
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Payment Mode: <strong className="text-purple-300">{earnings?.mode_notice || 'Development Escrow Simulator'}</strong></span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>

            {/* Transaction & Escrow Release History */}
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" /> Escrow Payout Transactions
                  </h3>
                  <p className="text-xs text-slate-400">
                    Full history of brand approvals and released escrow amounts.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {earnings?.payments?.length || 0} Transactions
                </span>
              </div>

              {(!earnings?.payments || earnings.payments.length === 0) ? (
                <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800/80 text-xs text-slate-400">
                  <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold text-slate-300">No escrow transactions recorded yet</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    When brands accept your applications and approve your deliverables, releases will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {earnings.payments.map((txn: any) => (
                    <div
                      key={txn.id}
                      className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`p-2.5 rounded-xl border mt-0.5 ${
                          txn.status === 'RELEASED'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                        }`}>
                          {txn.status === 'RELEASED' ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">
                              {txn.campaign_title || 'Direct Collaboration Brief'}
                            </h4>
                            <span className="text-xs text-slate-400">• {txn.brand_name || 'Brand Partner'}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                            <span className="font-mono text-[11px] text-slate-500">
                              Ref: {txn.transaction_ref || txn.id}
                            </span>
                            <span>•</span>
                            <span className="text-slate-400 text-[11px]">
                              {txn.created_at ? new Date(txn.created_at).toLocaleString() : 'Recent'}
                            </span>
                            {txn.is_simulated ? (
                              <>
                                <span>•</span>
                                <span className="text-[10px] text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded">
                                  Escrow Simulated
                                </span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/60">
                        <span className={`text-base font-black ${
                          txn.status === 'RELEASED' ? 'text-emerald-400' : 'text-purple-300'
                        }`}>
                          {txn.status === 'RELEASED' ? '+' : ''}₹{Number(txn.amount || 0).toLocaleString()}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black mt-1 inline-flex items-center gap-1 ${
                          txn.status === 'RELEASED'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                        }`}>
                          {txn.status === 'RELEASED' ? 'Approved & Escrow Released ✓' : 'Held in Escrow'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 7: Pro Membership & Tiers */}
        {activeTab === 'membership' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  <Crown className="w-4 h-4" /> Creator Monetization Plans
                </div>
                <h2 className="text-2xl font-black text-white">Creator Pro Membership</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Take subscriptions based on Silver, Gold, or Diamond to unlock high-budget campaigns, increase monthly applications, and get prioritized by top brands.
                </p>
              </div>

              <button
                onClick={() => setIsSubscriptionModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/25 self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5" /> Change / Upgrade Tier
              </button>
            </div>

            {/* Current Active Plan Card */}
            <div className="bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 p-6 rounded-3xl border border-purple-500/30 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Your Active Subscription
                  </span>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-xl text-sm font-black flex items-center gap-1.5 ${tierInfo.bgColor} ${tierInfo.textColor} border ${tierInfo.borderColor}`}>
                      <TierIcon className="w-4 h-4" /> {tierInfo.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {subscriptionData?.expires_at
                        ? `Valid until ${new Date(subscriptionData.expires_at).toLocaleDateString()}`
                        : 'Free Forever Tier'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Apps Used</div>
                    <div className="text-lg font-black text-white mt-0.5">
                      {subscriptionData?.applications_used_this_month ?? 0}
                    </div>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Monthly Limit</div>
                    <div className="text-lg font-black text-purple-400 mt-0.5">
                      {subscriptionData?.applications_limit === 'unlimited' ? 'Unlimited' : (subscriptionData?.applications_limit ?? 3)}
                    </div>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Max Brief Payout</div>
                    <div className="text-lg font-black text-emerald-400 mt-0.5">
                      {subscriptionData?.max_campaign_reward === 'unlimited' ? 'No Limit' : `₹${(subscriptionData?.max_campaign_reward || 5000).toLocaleString()}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plans Showcase Cards */}
            <div>
              <h3 className="text-base font-bold text-white mb-4">Available Tiers & Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Silver */}
                <div className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                  currentTier === 'silver'
                    ? 'bg-slate-900 border-slate-400/50 ring-2 ring-slate-400/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-300 border border-slate-500/20">
                        Silver Pro
                      </span>
                      {currentTier === 'silver' && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Active Plan
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-black text-white mt-2">₹1 <span className="text-xs text-slate-400 font-normal">/mo</span></div>
                    <p className="text-xs text-slate-400 mt-1 mb-4">Great for rising creators seeking regular local brand collaborations.</p>

                    <ul className="space-y-2.5 text-xs text-slate-300 pt-3 border-t border-slate-800">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span><strong>15</strong> Campaign Applications / month</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span>Apply to briefs up to <strong>₹15,000</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span>Early Brief Access (12 hrs before Free)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span>Silver Pro Verified Badge</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setIsSubscriptionModalOpen(true)}
                    className="w-full mt-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
                  >
                    {currentTier === 'silver' ? 'Manage Plan' : 'Select Silver (₹1)'}
                  </button>
                </div>

                {/* Gold */}
                <div className={`p-6 rounded-3xl border flex flex-col justify-between relative transition-all shadow-xl ${
                  currentTier === 'gold'
                    ? 'bg-slate-900 border-amber-500/50 ring-2 ring-amber-500/30'
                    : 'bg-slate-900/80 border-amber-500/30 hover:border-amber-500/50'
                }`}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                    Most Popular
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        Gold VIP
                      </span>
                      {currentTier === 'gold' && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Active Plan
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-black text-white mt-2">₹1 <span className="text-xs text-slate-400 font-normal">/mo</span></div>
                    <p className="text-xs text-slate-400 mt-1 mb-4">For full-time influencers and high-engagement content creators.</p>

                    <ul className="space-y-2.5 text-xs text-slate-300 pt-3 border-t border-slate-800">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span><strong>40</strong> Campaign Applications / month</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Apply to briefs up to <strong>₹50,000</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>AI Pitch Assistant (Generates high-converting pitches)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>2x Ranking Boost in Brand Matchmaker</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Gold VIP Verified Badge</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setIsSubscriptionModalOpen(true)}
                    className="w-full mt-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs hover:opacity-95 shadow-md shadow-amber-500/20 transition-all"
                  >
                    {currentTier === 'gold' ? 'Manage Plan' : 'Select Gold VIP (₹1)'}
                  </button>
                </div>

                {/* Diamond */}
                <div className={`p-6 rounded-3xl border flex flex-col justify-between relative transition-all shadow-xl ${
                  currentTier === 'diamond'
                    ? 'bg-slate-900 border-cyan-500/50 ring-2 ring-cyan-500/30'
                    : 'bg-slate-900/60 border-cyan-500/30 hover:border-cyan-500/50'
                }`}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                    Top Tier
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        Diamond Elite
                      </span>
                      {currentTier === 'diamond' && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Active Plan
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-black text-white mt-2">₹1 <span className="text-xs text-slate-400 font-normal">/mo</span></div>
                    <p className="text-xs text-slate-400 mt-1 mb-4">Elite creators, agencies, and top-tier influencers desiring VIP privileges.</p>

                    <ul className="space-y-2.5 text-xs text-slate-300 pt-3 border-t border-slate-800">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span><strong>Unlimited</strong> Campaign Applications</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span><strong>No Payout Cap</strong> (₹50,000+ mega briefs)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span><strong>0% Platform Escrow Fee</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>Featured at Top of Brand Discovery</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>Diamond Elite Verified Badge</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setIsSubscriptionModalOpen(true)}
                    className="w-full mt-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs hover:opacity-95 shadow-md shadow-cyan-500/20 transition-all"
                  >
                    {currentTier === 'diamond' ? 'Manage Plan' : 'Select Diamond Elite'}
                  </button>
                </div>
              </div>
            </div>

            {/* Membership Invoices & Transactions History */}
            {subscriptionData?.history && subscriptionData.history.length > 0 && (
              <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-3">Subscription Billing History</h3>
                <div className="space-y-2">
                  {subscriptionData.history.map(item => (
                    <div key={item.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white capitalize">{item.tier} Plan</span>
                        <div className="text-[11px] text-slate-500">
                          {new Date(item.created_at).toLocaleDateString()} • {item.billing_cycle}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-400">₹{item.amount?.toLocaleString()}</div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">{item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Deliverable Proof Modal - Globally Accessible Across All Tabs */}
        {selectedCollab && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-purple-950/50 relative overflow-hidden">
              {/* Background gradient glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

              {proofSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">🎉 Deliverable Proof Submitted!</h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                      Your post link has been forwarded to <strong className="text-white">{selectedCollab.brand_name || 'the brand'}</strong> for review.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950/70 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 font-semibold inline-block">
                    Escrow payout of ₹{Number(selectedCollab.reward_per_creator || selectedCollab.payment_amount || 5000).toLocaleString()} will be automatically released upon brand approval.
                  </div>
                  <div className="text-[11px] text-slate-500 animate-pulse">
                    Refreshing dashboard data...
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitProof} className="space-y-4">
                  {/* Modal Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                          Deliverable Verification
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Escrow Protected
                        </span>
                      </div>
                      <h3 className="text-base font-black text-white">
                        {selectedCollab.campaign_title || 'Direct Brand Collaboration'}
                      </h3>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Brand: <strong className="text-slate-200">{selectedCollab.brand_name || 'Brand Partner'}</strong></span>
                        <span>•</span>
                        <span className="text-emerald-400 font-extrabold">
                          ₹{Number(selectedCollab.reward_per_creator || selectedCollab.payment_amount || 5000).toLocaleString()} Payout
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCollab(null);
                        setProofError('');
                      }}
                      className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Collaboration Progress Pipeline */}
                  <div className="grid grid-cols-4 gap-1.5 py-1 text-center">
                    {[
                      { step: 1, label: 'Offer Accepted', done: true },
                      { step: 2, label: 'Content Created', done: true },
                      { step: 3, label: 'Submit Proof', active: true },
                      { step: 4, label: 'Escrow Released' }
                    ].map(s => (
                      <div
                        key={s.step}
                        className={`p-1.5 rounded-xl border text-[9px] font-bold ${
                          s.done
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : s.active
                            ? 'bg-purple-600/30 text-purple-200 border-purple-500 ring-1 ring-purple-500/50'
                            : 'bg-slate-950/40 text-slate-500 border-slate-800'
                        }`}
                      >
                        {s.step}. {s.label}
                      </div>
                    ))}
                  </div>

                  {proofError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{proofError}</span>
                    </div>
                  )}

                  {/* Post URL Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Live Instagram Post / Reel URL <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={liveUrl}
                      onChange={e => setLiveUrl(e.target.value)}
                      placeholder="https://www.instagram.com/reel/... or https://www.instagram.com/p/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Provide the live public link to your published Reel, Feed Post, or Story.
                    </p>
                  </div>

                  {/* Deliverable Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Collaboration Remarks / Performance Highlights (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={proofNotes}
                      onChange={e => setProofNotes(e.target.value)}
                      placeholder="E.g. Reel achieved 15k views in first 6 hours, tagged brand official handle and used campaign hashtags..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Escrow Guarantee Callout */}
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-slate-300 leading-relaxed">
                      <strong className="text-emerald-400 font-bold block">100% Escrow Protected:</strong>
                      Brand funds (₹{Number(selectedCollab.reward_per_creator || selectedCollab.payment_amount || 5000).toLocaleString()}) are held safely in escrow. As soon as the brand confirms your deliverable, payment will be released instantly into your wallet ledger.
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCollab(null);
                        setProofError('');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingProof || !liveUrl.trim()}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {submittingProof ? 'Submitting Deliverable...' : 'Submit Deliverable for Review'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Subscription Upgrade Modal */}
        <CreatorSubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          currentTier={currentTier}
          onUpgradeSuccess={() => {
            loadAllData();
            refreshSessionUser();
          }}
        />
      </main>
    </div>
  );
};
