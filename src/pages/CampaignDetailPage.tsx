import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
      showToast(err.message || 'Failed to submit application', 'error');
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
              {deliverablesList.map((del, idx) => (
                <li key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{del}</span>
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

        {/* Action Button */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-extrabold text-sm text-zinc-900">Interested in this collaboration?</div>
            <div className="text-xs text-zinc-500 mt-0.5">
              {isTierLocked
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
            isTierLocked || isQuotaExceeded ? (
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
      </div>
    </div>
  );
};
