import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Campaign } from '../types';
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle2,
  Users,
  ShieldCheck,
  Tag,
  Send,
  X,
  ArrowLeft,
  Share2,
  Hash,
  AlertCircle,
  Crown,
  Zap,
  Award
} from 'lucide-react';
import { Instagram } from '../components/icons/InstagramIcon';
import { CreatorSubscriptionModal } from '../components/CreatorSubscriptionModal';
import { CreatorSubscriptionStatus } from '../types';

export const CampaignDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, showToast } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<CreatorSubscriptionStatus | null>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Instagram Connection State
  const [isInstagramConnected, setIsInstagramConnected] = useState<boolean>(
    Boolean(user?.instagram && (user.instagram.is_connected === 1 || user.instagram.is_connected === true))
  );
  const [isInstagramPromptOpen, setIsInstagramPromptOpen] = useState(false);

  const [hasApplied, setHasApplied] = useState(false);
  const [matchedApp, setMatchedApp] = useState<any>(null);

  // Application Form State
  const [pitch, setPitch] = useState('');
  const [contentIdea, setContentIdea] = useState('');
  const [relevantExperience, setRelevantExperience] = useState('');

  const fetchDetail = async () => {
    if (!id) return;
    try {
      const res = await api.getCampaignById(id);
      if (res.success) {
        setCampaign(res.campaign);
      }
      if (user?.role === 'creator') {
        const [appRes, subRes] = await Promise.allSettled([
          api.getApplications(),
          api.getSubscriptionStatus()
        ]);
        if (appRes.status === 'fulfilled' && appRes.value.success) {
          const app = (appRes.value.applications || []).find((a: any) => a.campaign_id === id);
          setHasApplied(Boolean(app));
          setMatchedApp(app || null);
        }
        if (subRes.status === 'fulfilled' && subRes.value.success) {
          setSubscriptionData(subRes.value);
        }

        if (user?.instagram && (user.instagram.is_connected === 1 || user.instagram.is_connected === true)) {
          setIsInstagramConnected(true);
        } else {
          api.getInstagramAnalytics().then(igRes => {
            if (igRes && igRes.success && (igRes.is_connected === 1 || igRes.is_connected === true)) {
              setIsInstagramConnected(true);
            } else {
              setIsInstagramConnected(false);
            }
          }).catch(() => {
            setIsInstagramConnected(false);
          });
        }
      }
    } catch (e) {
      showToast('Failed to load campaign details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id, user]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!isInstagramConnected) {
      showToast('You must connect your Instagram account before applying to campaigns.', 'error');
      setIsApplyModalOpen(false);
      setIsInstagramPromptOpen(true);
      return;
    }

    try {
      await api.applyCampaign(id, {
        pitch,
        content_idea: contentIdea,
        relevant_experience: relevantExperience,
        expected_date: 'In 5 Days'
      });
      showToast('🎉 Application submitted to brand successfully!');
      setHasApplied(true);
      setIsApplyModalOpen(false);
    } catch (err: any) {
      const msg = err.message || 'Failed to submit application';
      showToast(msg, 'error');
      if (msg.toLowerCase().includes('instagram') || err.code === 'INSTAGRAM_REQUIRED') {
        setIsInstagramConnected(false);
        setIsApplyModalOpen(false);
        setIsInstagramPromptOpen(true);
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xs font-bold text-slate-400">Loading campaign details...</div>;
  }

  if (!campaign) {
    return <div className="min-h-screen flex items-center justify-center text-xs font-bold text-slate-400">Campaign not found.</div>;
  }

  const isCreator = user?.role === 'creator';
  const currentTier = subscriptionData?.tier || (user?.profile as any)?.subscription_tier || 'free';

  const getRequiredTier = (reward: number) => {
    if (reward > 50000) return 'diamond';
    if (reward > 15000) return 'gold';
    if (reward > 5000) return 'silver';
    return 'free';
  };

  const getTierOrder = (tier: string) => {
    switch (tier) {
      case 'diamond': return 4;
      case 'gold': return 3;
      case 'silver': return 2;
      default: return 1;
    }
  };

  const reqTier = campaign ? getRequiredTier(campaign.reward_per_creator || 0) : 'free';
  const isTierLocked = isCreator && getTierOrder(currentTier) < getTierOrder(reqTier);
  const isQuotaExceeded = isCreator && subscriptionData && subscriptionData.applications_remaining === 0;

  const deliverablesList: string[] = Array.isArray(campaign.deliverables)
    ? campaign.deliverables
    : (typeof campaign.deliverables === 'string'
        ? (() => { try { const p = JSON.parse(campaign.deliverables); return Array.isArray(p) ? p : [campaign.deliverables]; } catch { return [campaign.deliverables]; } })()
        : ['1 Instagram Reel / Post', '1 Story Mention']);

  const brandName = campaign.brand_name || campaign.brand?.company_name || 'Brand Partner';
  const brandLogo = campaign.brand_logo || campaign.brand?.logo_url || 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=300&auto=format&fit=crop&q=80';
  const rewardPayout = campaign.reward_per_creator || 0;

  return (
    <div className="min-h-screen bg-[#fafafa] py-8 px-4 sm:px-6 lg:px-8 text-zinc-900">
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to Campaigns
        </button>

        {/* Brand & Brief Header */}
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <img
                src={brandLogo}
                alt={brandName}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">{brandName}</h2>
                  <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {campaign.location_name || campaign.city || 'India'} {campaign.outlet_name ? `• ${campaign.outlet_name}` : ''}
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xs text-slate-400 font-bold uppercase">Creator Reward Payout</div>
              <div className="font-heading text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                ₹{rewardPayout.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Escrow Protected Payout
              </div>
              {reqTier !== 'free' && (
                <div className="text-[11px] font-bold text-amber-500 dark:text-amber-400 flex items-center justify-end gap-1 mt-1">
                  <Crown className="w-3.5 h-3.5" />
                  {reqTier === 'diamond' ? 'Diamond Elite Brief' : reqTier === 'gold' ? 'Gold VIP Brief' : 'Silver Pro Brief'}
                </div>
              )}
            </div>
          </div>

          <h1 className="font-heading text-2xl font-extrabold mb-4">{campaign.title}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            {campaign.description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
            <div>
              <div className="text-slate-400 font-semibold mb-0.5">Category</div>
              <div className="font-bold text-slate-900 dark:text-slate-100">{campaign.category || 'General'}</div>
            </div>
            <div>
              <div className="text-slate-400 font-semibold mb-0.5">Platform</div>
              <div className="font-bold text-slate-900 dark:text-slate-100">{campaign.platform || 'Instagram'}</div>
            </div>
            <div>
              <div className="text-slate-400 font-semibold mb-0.5">Min Followers</div>
              <div className="font-bold text-slate-900 dark:text-slate-100">{(campaign.min_followers || 0).toLocaleString()}+</div>
            </div>
            <div>
              <div className="text-slate-400 font-semibold mb-0.5">Slots Available</div>
              <div className="font-bold text-blue-600 dark:text-blue-400">
                {Math.max(0, (campaign.creators_required || 1) - (campaign.creators_hired || 0))} / {campaign.creators_required || 1} Slots
              </div>
            </div>
          </div>
        </div>

        {/* Requirements & Guidelines Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            <h3 className="font-heading font-extrabold text-base flex items-center gap-2 text-zinc-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Campaign Deliverables
            </h3>
            <ul className="space-y-2 text-xs font-semibold text-zinc-700">
              {deliverablesList.map((del: any, idx) => (
                <li key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{typeof del === 'string' ? del : (del?.requirement || `${del?.count ? `${del.count}x ` : ''}${del?.type || 'Deliverable'}${del?.platform ? ` (${del.platform})` : ''}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            <h3 className="font-heading font-extrabold text-base flex items-center gap-2 text-zinc-900">
              <Hash className="w-4 h-4 text-zinc-700" /> Hashtags & Mentions
            </h3>
            <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-mono text-zinc-800">
              {campaign.hashtags || '#CreatorHub #BrandCollab'}
            </div>
            <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-mono text-zinc-700">
              {campaign.mentions || '@creatorhub'}
            </div>
          </div>
        </div>

        {/* Instagram Connection Warning Banner */}
        {isCreator && !isInstagramConnected && (
          <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-amber-500/10 border border-pink-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-600 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-pink-500/20">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-zinc-900">Instagram Connection Required</h4>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Brands require verified Instagram analytics before accepting applications. Connect your account to apply for this ₹{rewardPayout.toLocaleString()} brief.
                </p>
              </div>
            </div>
            <Link
              to="/creator/dashboard?tab=instagram"
              className="px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold whitespace-nowrap shadow-sm transition-all flex items-center gap-2 cursor-pointer self-stretch sm:self-auto justify-center"
            >
              <Instagram className="w-3.5 h-3.5" /> Connect Instagram
            </Link>
          </div>
        )}

        {/* Action Button */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-extrabold text-sm text-zinc-900">Interested in this collaboration?</div>
            <div className="text-xs text-zinc-500 mt-0.5">
              {isCreator && !isInstagramConnected
                ? `Connect your Instagram account to unlock applications and verify your audience reach.`
                : isTierLocked
                ? `This brief offers ₹${rewardPayout.toLocaleString()} and requires a ${reqTier.toUpperCase()} subscription tier.`
                : isQuotaExceeded
                ? `You have reached your monthly application limit for your current plan.`
                : `Submit your pitch idea directly to the brand for review.`}
            </div>
          </div>

          {hasApplied ? (
            matchedApp?.status === 'ACCEPTED' ? (
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Offer Accepted & Collaboration Active
                </div>
                <button
                  onClick={() => navigate(`/creator/dashboard?tab=applications&submit_id=${matchedApp.collaboration_id || matchedApp.id}`)}
                  className="px-5 py-2.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Content Proof
                </button>
              </div>
            ) : (
              <div className="px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Application Submitted & Under Review
              </div>
            )
          ) : isCreator ? (
            !isInstagramConnected ? (
              <button
                onClick={() => setIsInstagramPromptOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:opacity-95 text-white font-extrabold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Instagram className="w-4 h-4" /> Connect Instagram to Apply
              </button>
            ) : isTierLocked || isQuotaExceeded ? (
              <button
                onClick={() => setIsSubscriptionModalOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                {isTierLocked ? `Upgrade to ${reqTier.toUpperCase()} to Apply` : 'Upgrade Plan for More Applications'}
              </button>
            ) : (
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" /> Apply for Campaign
              </button>
            )
          ) : (
            <button
              onClick={() => navigate('/creator/login')}
              className="px-6 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs cursor-pointer"
            >
              Log in as Creator to Apply
            </button>
          )}
        </div>

        {/* Application Form Modal */}
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-zinc-900">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-heading font-extrabold text-xl text-zinc-900">Apply for Campaign</h2>
                  <p className="text-xs text-zinc-500">{campaign.title}</p>
                </div>
                <button onClick={() => setIsApplyModalOpen(false)} className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-zinc-700">Why should the brand select you?</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. As an Indiranagar local with 128k followers, I specialize in food & lifestyle Reels..."
                    value={pitch}
                    onChange={e => setPitch(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-xs font-semibold focus:outline-none focus:border-zinc-400"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-zinc-700">Proposed Content Concept / Hook</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Describe your 3s opening hook, video pacing, and call to action..."
                    value={contentIdea}
                    onChange={e => setContentIdea(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-xs font-semibold focus:outline-none focus:border-zinc-400"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-zinc-700">Relevant Experience / Previous Work Links</label>
                  <input
                    type="text"
                    placeholder="https://instagram.com/p/sample_reel"
                    value={relevantExperience}
                    onChange={e => setRelevantExperience(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-xs font-semibold focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 mt-2 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" /> Submit Application to Brand
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Creator Subscription Upgrade Modal */}
        <CreatorSubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          currentTier={currentTier}
          onUpgradeSuccess={() => {
            fetchDetail();
          }}
        />

        {/* Instagram Required Modal */}
        {isInstagramPromptOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-zinc-900 text-center">
              <button
                type="button"
                onClick={() => setIsInstagramPromptOpen(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-xl hover:bg-zinc-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-pink-500/25">
                <Instagram className="w-8 h-8" />
              </div>

              <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full inline-block mb-3">
                Instagram Verification Required
              </span>

              <h3 className="text-xl font-black text-zinc-900 mb-2">Connect Instagram to Apply</h3>
              
              <p className="text-xs text-zinc-500 leading-relaxed mb-6">
                Brands require verified Instagram analytics before reviewing applications. Connect your account in 30 seconds on your creator dashboard to unlock applications for this campaign.
              </p>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => navigate('/creator/dashboard?tab=instagram')}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-pink-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Instagram className="w-4 h-4" /> Go to Connect Instagram
                </button>
                <button
                  type="button"
                  onClick={() => setIsInstagramPromptOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition-all cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
