import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Logo } from '../components/common/Logo';
import { DirectPitchModal } from '../components/DirectPitchModal';
import { EscrowPaymentModal } from '../components/EscrowPaymentModal';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  Building2,
  PlusCircle,
  Users,
  Layers,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  XCircle,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  Send,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  Search,
  Star,
  Lock,
  Tag,
  Eye,
  Edit3,
  Image as ImageIcon,
  Camera,
  RefreshCw,
  X
} from 'lucide-react';
import { resolveBrandLogo, resolveBrandDisplayName, PRESET_BRAND_SAMPLES } from '../utils/brandLogos';

const getBrandLogo = (brandProfile: any, email?: string) => {
  return resolveBrandLogo(brandProfile?.company_name, brandProfile?.category, email, brandProfile?.logo_url);
};

const getBrandName = (brandProfile: any, email?: string) => {
  return resolveBrandDisplayName(brandProfile, email);
};

export const BrandDashboard: React.FC = () => {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'create' | 'applications' | 'creators' | 'collaborations' | 'pitch'>('overview');
  const [loading, setLoading] = useState(true);

  // Direct Pitch Modal state
  const [pitchModalCreator, setPitchModalCreator] = useState<any | null>(null);
  const [isDirectPitchModalOpen, setIsDirectPitchModalOpen] = useState(false);
  const [pitchTabSearch, setPitchTabSearch] = useState('');
  const [pitchTabCategory, setPitchTabCategory] = useState('All');

  // Escrow Payment Modal State
  const [escrowModalCollab, setEscrowModalCollab] = useState<any | null>(null);
  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);

  // Brand data states
  const [analytics, setAnalytics] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [matchedCreators, setMatchedCreators] = useState<any[]>([]);

  // Create Campaign Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('Fashion & Apparel');
  const [formLocation, setFormLocation] = useState('');
  const [formCity, setFormCity] = useState('Bengaluru');
  const [formReward, setFormReward] = useState('5000');
  const [formCreatorsReq, setFormCreatorsReq] = useState('3');
  const [formRadius, setFormRadius] = useState('10');
  const [formImage, setFormImage] = useState('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800');
  const [formPreviewFit, setFormPreviewFit] = useState<'contain' | 'cover'>('contain');
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Deliverable Review State
  const [reviewingCollab, setReviewingCollab] = useState<any>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REVISION'>('APPROVE');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [processingReview, setProcessingReview] = useState(false);

  // Direct Pitch State
  const [pitchingCreator, setPitchingCreator] = useState<any>(null);
  const [pitchBudget, setPitchBudget] = useState('5000');
  const [pitchMessage, setPitchMessage] = useState('');
  const [pitchDeliverables, setPitchDeliverables] = useState('1x Reel + 2x Stories');
  const [sendingPitch, setSendingPitch] = useState(false);
  const [pitchSuccess, setPitchSuccess] = useState(false);

  // Brand Profile & Logo Edit Modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [editCategory, setEditCategory] = useState('Fashion & Apparel');
  const [editWebsite, setEditWebsite] = useState('');
  const [editBio, setEditBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Edit Single Campaign Image Modal
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);
  const [newCampaignImageUrl, setNewCampaignImageUrl] = useState('');
  const [savingCampaignImage, setSavingCampaignImage] = useState(false);

  const brandProfile = (user?.profile as any) || {};
  const [currentBrandName, setCurrentBrandName] = useState(() => getBrandName(brandProfile, user?.email));
  const [currentBrandLogo, setCurrentBrandLogo] = useState(() => getBrandLogo(brandProfile, user?.email));
  const currentCategory = brandProfile.category || 'Fashion & Apparel';

  const loadData = async () => {
    setLoading(true);
    try {
      const [anaRes, campRes, appRes, colRes] = await Promise.allSettled([
        api.getBrandAnalytics(),
        api.getCampaigns({ brand_id: brandProfile.id, status: 'ALL' }),
        api.getApplications(),
        api.getCollaborations()
      ]);

      if (anaRes.status === 'fulfilled' && anaRes.value?.success) {
        setAnalytics(anaRes.value.analytics);
      }
      if (campRes.status === 'fulfilled' && campRes.value?.success) {
        setCampaigns(campRes.value.campaigns || []);
      }
      if (appRes.status === 'fulfilled' && appRes.value?.success) {
        setApplications(appRes.value.applications || []);
      }
      if (colRes.status === 'fulfilled' && colRes.value?.success) {
        setCollaborations(colRes.value.collaborations || []);
      }

      // Load creators for matcher
      const creatorsRes = await api.getCreators({ limit: '12' });
      if (creatorsRes.success && creatorsRes.creators) {
        setMatchedCreators(creatorsRes.creators);
      }
    } catch (err) {
      console.error('Error loading brand dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin/dashboard');
      return;
    }
    const resolvedName = resolveBrandDisplayName(brandProfile, user?.email);
    const resolvedLogo = resolveBrandLogo(brandProfile.company_name, brandProfile.category, user?.email, brandProfile.logo_url);
    setCurrentBrandName(resolvedName);
    setCurrentBrandLogo(resolvedLogo);

    // Auto-heal in background if profile has wrong/outdated placeholder
    if (brandProfile && brandProfile.id && (brandProfile.logo_url !== resolvedLogo || !brandProfile.logo_url)) {
      api.updateBrandProfile({ logo_url: resolvedLogo }).catch(() => {});
      brandProfile.logo_url = resolvedLogo;
    }

    loadData();
  }, [user, navigate]);

  const openProfileModal = () => {
    setEditCompanyName(currentBrandName);
    setEditLogoUrl(currentBrandLogo);
    setEditCategory(brandProfile.category || 'Fashion & Apparel');
    setEditWebsite(brandProfile.website || '');
    setEditBio(brandProfile.description || '');
    setIsProfileModalOpen(true);
  };

  const handleSaveBrandProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {
        company_name: editCompanyName.trim(),
        logo_url: editLogoUrl.trim(),
        category: editCategory,
        website: editWebsite.trim(),
        description: editBio.trim()
      };

      const res = await api.updateBrandProfile(payload);
      if (res.success) {
        setCurrentBrandName(editCompanyName.trim());
        setCurrentBrandLogo(editLogoUrl.trim());
        if (brandProfile) {
          brandProfile.company_name = editCompanyName.trim();
          brandProfile.logo_url = editLogoUrl.trim();
          brandProfile.category = editCategory;
        }
        setIsProfileModalOpen(false);
        showToast('Brand profile & logo updated successfully!');
        loadData();
      } else {
        showToast(res.error || 'Failed to update brand profile', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating brand profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const openEditCampaignImage = (camp: any) => {
    setEditingCampaign(camp);
    setNewCampaignImageUrl(camp.image_url || '');
  };

  const handleSaveCampaignImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;
    setSavingCampaignImage(true);
    try {
      const res = await api.updateCampaign(editingCampaign.id, {
        image_url: newCampaignImageUrl.trim()
      });
      if (res.success) {
        showToast('Campaign cover image updated!');
        setEditingCampaign(null);
        loadData();
      } else {
        showToast(res.error || 'Failed to update image', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating image', 'error');
    } finally {
      setSavingCampaignImage(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCampaign(true);
    try {
      const payload = {
        title: formTitle.trim(),
        description: formDesc.trim(),
        category: formCategory,
        location_name: formLocation.trim() || brandProfile.location_name || `${currentBrandName} Store`,
        city: formCity.trim(),
        radius_km: Number(formRadius),
        reward_per_creator: Number(formReward),
        creators_required: Number(formCreatorsReq),
        budget_total: Number(formReward) * Number(formCreatorsReq),
        image_url: formImage.trim()
      };

      const res = await api.createCampaign(payload);
      if (res.success) {
        setCreateSuccess(true);
        setTimeout(() => {
          setCreateSuccess(false);
          setActiveTab('campaigns');
          loadData();
        }, 1200);
      }
    } catch (err: any) {
      console.error('Error creating campaign:', err);
      showToast(err.message || 'Error creating campaign', 'error');
    } finally {
      setCreatingCampaign(false);
    }
  };

  const handleUpdateAppStatus = async (appId: string, status: 'ACCEPTED' | 'SHORTLISTED' | 'REJECTED') => {
    try {
      const res = await api.updateApplicationStatus(appId, status);
      if (status === 'ACCEPTED') {
        const app = applications.find(a => a.id === appId);
        const collabId = (res as any)?.collaboration_id || (res as any)?.id;
        const stubCollab = {
          id: collabId,
          campaign_title: app?.campaign_title || 'Campaign Collaboration',
          brand_name: currentBrandName,
          creator_name: app?.creator_name || 'Creator Partner',
          reward_per_creator: app?.proposed_budget || app?.reward_per_creator || 5000,
          payment_amount: app?.proposed_budget || app?.reward_per_creator || 5000
        };
        setEscrowModalCollab(stubCollab);
        setIsEscrowModalOpen(true);
      }
      loadData();
    } catch (err) {
      console.error('Error updating application status:', err);
    }
  };

  const handleReviewDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingCollab) return;

    const isEscrowPaid =
      reviewingCollab.status === 'ESCROW_LOCKED' ||
      reviewingCollab.status === 'escrow_locked' ||
      reviewingCollab.payment_status === 'VERIFIED' ||
      reviewingCollab.payment_status === 'HELD_IN_ESCROW';

    if (reviewAction === 'APPROVE' && !isEscrowPaid) {
      setEscrowModalCollab(reviewingCollab);
      setIsEscrowModalOpen(true);
      return;
    }

    setProcessingReview(true);
    try {
      const res = await api.reviewDeliverableProof(reviewingCollab.id, {
        action: reviewAction,
        feedback: reviewFeedback
      });
      if ((res as any)?.code === 'PAYMENT_REQUIRED' || (!res.success && (res as any)?.error?.includes('Payment required'))) {
        setEscrowModalCollab(reviewingCollab);
        setIsEscrowModalOpen(true);
        return;
      }
      setReviewingCollab(null);
      setReviewFeedback('');
      loadData();
    } catch (err: any) {
      console.error('Error reviewing deliverable:', err);
      if (err.message?.includes('Payment') || err.message?.includes('PAYMENT_REQUIRED')) {
        setEscrowModalCollab(reviewingCollab);
        setIsEscrowModalOpen(true);
      }
    } finally {
      setProcessingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071012] text-slate-100 flex flex-col md:flex-row">
      {/* Brand Sidebar */}
      <aside className="w-full md:w-64 bg-[#0c1416] border-r border-[#1c292c] p-6 flex flex-col justify-between flex-shrink-0">
        <div>
          <Link to="/" className="inline-flex items-center mb-8">
            <Logo size="md" />
          </Link>

          <nav className="space-y-1.5 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-pink text-[#071012] font-bold shadow-sm shadow-pink/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#131d20]'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Overview
            </button>

            <button
              onClick={() => setActiveTab('campaigns')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'campaigns'
                  ? 'bg-pink text-[#071012] font-bold shadow-sm shadow-pink/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#131d20]'
              }`}
            >
              <span className="flex items-center gap-3">
                <Layers className="w-4 h-4" /> Campaigns
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'campaigns' ? 'bg-[#071012]/30 text-[#071012]' : 'bg-[#1c292c] text-slate-300'
              }`}>
                {campaigns.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-pink text-[#071012] font-bold shadow-sm shadow-pink/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#131d20]'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" /> Create Campaign
            </button>

            <button
              onClick={() => setActiveTab('pitch')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'pitch'
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 text-white shadow-md shadow-pink-600/20'
                  : 'text-purple-400 hover:text-purple-300 hover:bg-purple-950/30'
              }`}
            >
              <span className="flex items-center gap-3">
                <Send className="w-4 h-4 text-purple-400" /> Direct Pitch
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                Direct Deal
              </span>
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'applications'
                  ? 'bg-pink text-[#071012] font-bold shadow-sm shadow-pink/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#131d20]'
              }`}
            >
              <span className="flex items-center gap-3">
                <Users className="w-4 h-4" /> Applications
              </span>
              {applications.filter(a => a.status === 'PENDING').length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-pink/20 text-pink font-bold">
                  {applications.filter(a => a.status === 'PENDING').length} new
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('collaborations')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'collaborations'
                  ? 'bg-pink text-[#071012] font-bold shadow-sm shadow-pink/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#131d20]'
              }`}
            >
              <span className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Deliverables Proof
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'collaborations' ? 'bg-[#071012]/30 text-[#071012]' : 'bg-[#1c292c] text-slate-300'
              }`}>
                {collaborations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('creators')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'creators'
                  ? 'bg-pink text-[#071012] font-bold shadow-sm shadow-pink/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#131d20]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" /> Discover Creators
            </button>

            <Link
              to="/creator/messages"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#131d20] transition-all"
            >
              <MessageSquare className="w-4 h-4 text-pink" /> Messages
            </Link>
          </nav>
        </div>

        {/* Brand Mini Card & Theme Toggle */}
        <div className="pt-6 border-t border-[#1c292c] flex items-center justify-between">
          <div
            onClick={openProfileModal}
            className="flex items-center gap-3 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            title="Click to edit Brand Logo / Info"
          >
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-900 border border-[#1c292c] flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-xs">
              <img
                src={currentBrandLogo}
                alt={currentBrandName}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = resolveBrandLogo(currentBrandName, currentCategory);
                }}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div className="overflow-hidden min-w-0">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                <span>{currentBrandName}</span>
                <Edit3 className="w-2.5 h-2.5 text-slate-500" />
              </div>
              <div className="text-[11px] text-slate-500 truncate">{currentCategory}</div>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-6xl mx-auto w-full">
        {/* Header Bar */}
        <div className="bg-[#0c1416] p-6 rounded-2xl border border-[#1c292c] flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-pink/40 shadow-md flex items-center justify-center p-1.5 overflow-hidden shrink-0" onClick={openProfileModal} title="Change Brand Logo">
              <img
                src={currentBrandLogo}
                alt={currentBrandName}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = resolveBrandLogo(currentBrandName, currentCategory);
                }}
                className="w-full h-full object-contain rounded-xl group-hover:opacity-75 transition-opacity"
              />
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{currentBrandName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink/15 text-pink border border-pink/30">
                  Verified Brand ✓
                </span>
                <button
                  onClick={openProfileModal}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#131d20] border border-[#1c292c] text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  title="Edit Brand Name & Logo"
                >
                  <Edit3 className="w-3.5 h-3.5 text-pink" />
                  <span className="text-[11px] font-medium hidden sm:inline">Edit Brand</span>
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <span>{currentCategory}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-pink" /> {brandProfile.location_name || brandProfile.city || 'Bengaluru'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => setActiveTab('pitch')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 hover:opacity-90 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" /> Direct Pitch Creators
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className="px-4 py-2.5 rounded-xl bg-pink hover:bg-pink-hover text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-pink/25 transition-all self-start sm:self-auto cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Launch Campaign
            </button>
          </div>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Dashboard 6 KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div className="bg-[#0c1416] p-5 rounded-xl border border-[#1c292c]">
                <div className="text-xs font-bold text-slate-400 mb-1">Active Campaigns</div>
                <div className="text-3xl font-black text-white">{analytics?.active_campaigns ?? campaigns.length}</div>
                <div className="text-[11px] text-slate-500 mt-1">Live in marketplace</div>
              </div>

              <div className="bg-[#0c1416] p-5 rounded-xl border border-[#1c292c]">
                <div className="text-xs font-bold text-slate-400 mb-1">Creator Applications</div>
                <div className="text-3xl font-black text-purple-400">{analytics?.total_applications ?? applications.length}</div>
                <div className="text-[11px] text-slate-500 mt-1">Total submitted pitches</div>
              </div>

              <div className="bg-[#0c1416] p-5 rounded-xl border border-[#1c292c]">
                <div className="text-xs font-bold text-slate-400 mb-1">Selected Creators</div>
                <div className="text-3xl font-black text-pink">{analytics?.selected_creators ?? collaborations.length}</div>
                <div className="text-[11px] text-slate-500 mt-1">Hired for content briefs</div>
              </div>

              <div className="bg-[#0c1416] p-5 rounded-xl border border-[#1c292c]">
                <div className="text-xs font-bold text-slate-400 mb-1">Completed Campaigns</div>
                <div className="text-3xl font-black text-emerald-400">{analytics?.completed_campaigns ?? 0}</div>
                <div className="text-[11px] text-slate-500 mt-1">Deliverables verified & paid</div>
              </div>

              <div className="bg-[#0c1416] p-5 rounded-xl border border-[#1c292c]">
                <div className="text-xs font-bold text-slate-400 mb-1">Total Committed Spend</div>
                <div className="text-3xl font-black text-white">₹{Number(analytics?.total_spend || 0).toLocaleString()}</div>
                <div className="text-[11px] text-slate-500 mt-1">Escrow locked & released</div>
              </div>

              <div className="bg-[#0c1416] p-5 rounded-xl border border-[#1c292c]">
                <div className="text-xs font-bold text-slate-400 mb-1">Estimated Local Reach</div>
                <div className="text-3xl font-black text-pink">{Number(analytics?.estimated_reach || 0).toLocaleString()}</div>
                <div className="text-[11px] text-slate-500 mt-1">Verified audience impressions</div>
              </div>
            </div>

            {/* Direct Pitch Fast-Track Banner */}
            <div className="bg-gradient-to-r from-purple-950/40 via-[#0c1416] to-[#0c1416] p-6 sm:p-7 rounded-2xl border border-purple-800/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-pink/5 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-2 max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-extrabold text-[11px] border border-purple-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Direct Deals Without Waiting
                </div>
                <h3 className="text-xl font-black text-white">Direct Pitch to Top Local Creators</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Want immediate brand coverage? Skip waiting for applications. Directly pitch verified local creators with your custom offer, set deliverables, and start working today.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 relative z-10 flex-wrap">
                <button
                  onClick={() => setActiveTab('pitch')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Direct Pitch Creators
                </button>
                <Link
                  to="/pitch-creators"
                  className="px-4 py-2.5 rounded-xl bg-[#131d20] hover:bg-[#1a282c] text-slate-200 font-bold text-xs border border-[#1c292c] transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Match Studio
                </Link>
              </div>
            </div>

            {/* Recent Applications Quick Glance */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Recent Creator Applications</h3>
                <button onClick={() => setActiveTab('applications')} className="text-xs text-pink font-bold hover:underline cursor-pointer">
                  View All ({applications.length})
                </button>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-10 bg-[#0c1416] rounded-xl border border-[#1c292c] text-xs text-slate-400">
                  No applications received yet. Your active campaigns are currently discoverable by nearby creators.
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 3).map(app => (
                    <div
                      key={app.id}
                      className="bg-[#0c1416] p-4 rounded-xl border border-[#1c292c] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={app.creator_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={app.creator_name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#1c292c]"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-white">{app.creator_name}</h4>
                          <span className="text-[11px] text-slate-400">@{app.creator_username} • Applied for {app.campaign_title}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {app.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, 'ACCEPTED')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, 'REJECTED')}
                              className="px-3 py-1.5 rounded-lg bg-[#131d20] hover:bg-[#1a282c] text-rose-400 text-xs font-bold border border-rose-900/40 cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#131d20] text-slate-300 border border-[#1c292c]">
                            {app.status}
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

        {/* Tab 2: Campaigns List */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">Your Brand Campaigns</h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage live briefs, applicant slots, cover images, and budgets.</p>
              </div>
              <button
                onClick={() => setActiveTab('create')}
                className="px-4 py-2 rounded-xl bg-pink hover:bg-pink-hover text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-pink/20 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> New Campaign
              </button>
            </div>

            {campaigns.length === 0 ? (
              <div className="text-center py-16 bg-[#0c1416] rounded-2xl border border-[#1c292c] text-xs text-slate-400 space-y-3">
                <p>No campaigns created yet under this brand account.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 rounded-xl bg-pink text-white font-bold text-xs cursor-pointer"
                >
                  Create Your First Campaign
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns.map(camp => (
                  <div key={camp.id} className="bg-[#0c1416] rounded-2xl border border-[#1c292c] overflow-hidden flex flex-col justify-between group">
                    <div className="relative h-48 bg-[#04080a] overflow-hidden flex items-center justify-center">
                      <img
                        src={camp.image_url || resolveBrandLogo(camp.title, camp.category)}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-110 pointer-events-none"
                      />
                      <img
                        src={camp.image_url || resolveBrandLogo(camp.title, camp.category)}
                        alt={camp.title}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = resolveBrandLogo(currentBrandName, currentCategory);
                        }}
                        className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-500 p-1"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c1416] via-transparent to-transparent pointer-events-none z-10" />
                      <span className="absolute top-3 right-3 z-20 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink/20 text-pink border border-pink/40 backdrop-blur-md">
                        {camp.category || currentCategory}
                      </span>
                      <button
                        onClick={() => openEditCampaignImage(camp)}
                        className="absolute top-3 left-3 z-20 px-2 py-1 rounded-lg bg-[#071012]/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/20 hover:border-pink hover:text-pink flex items-center gap-1 transition-colors cursor-pointer"
                        title="Change Cover Image"
                      >
                        <ImageIcon className="w-3 h-3" /> Change Image
                      </button>
                    </div>

                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white">{camp.title}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">{camp.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-[#080f11] p-3 rounded-xl border border-[#1c292c]">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Reward per Creator:</span>
                          <strong className="text-pink font-bold">₹{Number(camp.reward_per_creator || 0).toLocaleString()}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Slots Required:</span>
                          <strong className="text-white font-bold">{camp.creators_required || 3} creators</strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#1c292c]">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-pink" /> {camp.city || 'Bengaluru'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditCampaignImage(camp)}
                            className="text-xs text-slate-400 hover:text-pink flex items-center gap-1 cursor-pointer font-medium"
                          >
                            <Edit3 className="w-3 h-3" /> Edit Image
                          </button>
                          <Link
                            to={`/campaigns/${camp.id}`}
                            className="text-xs text-pink font-bold hover:underline flex items-center gap-1"
                          >
                            View Brief →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Create Campaign Wizard */}
        {activeTab === 'create' && (
          <div className="bg-[#0c1416] p-6 sm:p-8 rounded-2xl border border-[#1c292c] max-w-2xl mx-auto shadow-sm">
            <div className="mb-6">
              <span className="text-xs font-bold text-pink uppercase tracking-wider block mb-1">
                Step-by-Step Brief Builder
              </span>
              <h2 className="text-2xl font-black text-white">Create New Campaign</h2>
              <p className="text-xs text-slate-400 mt-1">
                Paste any brand cover image URL, target neighborhood, budget, and creator requirements.
              </p>
            </div>

            {createSuccess ? (
              <div className="text-center py-10">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-white mb-1">Campaign Published!</h3>
                <p className="text-xs text-slate-400">Your campaign with exact pasted image is live in the creator feed.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder={`e.g. ${currentBrandName} Seasonal Collection Promo`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080f11] border border-[#1c292c] text-white text-xs focus:outline-none focus:border-pink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Campaign Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={formDesc}
                    onChange={e => setFormDesc(e.target.value)}
                    placeholder="Describe collaboration goals, guidelines, styling atmosphere, and what creators will showcase..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080f11] border border-[#1c292c] text-white text-xs focus:outline-none focus:border-pink"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080f11] border border-[#1c292c] text-white text-xs focus:outline-none focus:border-pink cursor-pointer"
                    >
                      <option value="Fashion & Apparel">Fashion & Apparel</option>
                      <option value="Beauty & Skincare">Beauty & Skincare</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Fitness & Wellness">Fitness & Wellness</option>
                      <option value="Technology">Technology</option>
                      <option value="Lifestyle">Lifestyle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Target Area / Outlet Location</label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={e => setFormLocation(e.target.value)}
                      placeholder="e.g. Indiranagar 100ft Road"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080f11] border border-[#1c292c] text-white text-xs focus:outline-none focus:border-pink"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Reward/Creator (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formReward}
                      onChange={e => setFormReward(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080f11] border border-[#1c292c] text-white text-xs focus:outline-none focus:border-pink"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Creators Needed *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formCreatorsReq}
                      onChange={e => setFormCreatorsReq(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080f11] border border-[#1c292c] text-white text-xs focus:outline-none focus:border-pink"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Radius (km)</label>
                    <input
                      type="number"
                      value={formRadius}
                      onChange={e => setFormRadius(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080f11] border border-[#1c292c] text-white text-xs focus:outline-none focus:border-pink"
                    />
                  </div>
                </div>

                {/* Campaign Image URL & Instant Preview */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-300">Campaign Cover Image URL</label>
                    <span className="text-[10px] text-slate-400">Direct image link (JPEG, PNG, WebP)</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formImage}
                      onChange={e => setFormImage(e.target.value.trim())}
                      placeholder="Paste image link: https://images.unsplash.com/photo-..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#080f11] border border-[#1c292c] text-white text-xs focus:outline-none focus:border-pink"
                    />
                    {formImage && (
                      <button
                        type="button"
                        onClick={() => setFormImage('')}
                        className="px-3 py-2 rounded-xl bg-[#131d20] hover:bg-[#1a282c] text-slate-400 hover:text-white border border-[#1c292c] text-xs cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {formImage.trim() ? (
                    <div className="mt-3 relative min-h-[240px] max-h-[380px] h-64 sm:h-72 rounded-2xl overflow-hidden border border-[#1c292c] bg-[#04080a] flex items-center justify-center group shadow-inner">
                      {/* Ambient blurred backdrop for atmosphere and color harmony */}
                      <img
                        src={formImage.trim()}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-110 pointer-events-none transition-all duration-300"
                      />

                      {/* Full unclipped crisp foreground image */}
                      <img
                        src={formImage.trim()}
                        alt="Campaign Cover Live Preview"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = resolveBrandLogo(currentBrandName, formCategory || currentCategory);
                        }}
                        className={`relative z-10 max-h-full max-w-full ${
                          formPreviewFit === 'cover' ? 'w-full h-full object-cover' : 'w-auto h-auto object-contain'
                        } rounded-xl shadow-2xl p-1.5 transition-all duration-300`}
                      />

                      {/* Live Status Badge */}
                      <div className="absolute bottom-3 left-3 z-20 bg-[#071012]/90 backdrop-blur-md text-[10px] font-bold text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/30 flex items-center gap-1.5 shadow-lg">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Image URL Live &amp; Ready
                      </div>

                      {/* Full Display Mode Switcher */}
                      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-[#071012]/90 backdrop-blur-md p-1 rounded-xl border border-[#1c292c] shadow-md">
                        <button
                          type="button"
                          onClick={() => setFormPreviewFit('contain')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            formPreviewFit === 'contain' ? 'bg-pink text-[#071012]' : 'text-slate-400 hover:text-white'
                          }`}
                          title="Display entire image without cropping"
                        >
                          Fit Full (Uncropped)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormPreviewFit('cover')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            formPreviewFit === 'cover' ? 'bg-pink text-[#071012]' : 'text-slate-400 hover:text-white'
                          }`}
                          title="Fill container"
                        >
                          Fill Card
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 p-5 rounded-xl border border-dashed border-[#1c292c] text-center text-xs text-slate-500 bg-[#080f11]">
                      Paste any brand or product image URL above to preview the full uncropped image here.
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={creatingCampaign}
                  className="w-full py-3.5 rounded-xl bg-pink hover:bg-pink-hover text-white font-bold text-xs shadow-lg shadow-pink/25 transition-all disabled:opacity-50 mt-4 cursor-pointer"
                >
                  {creatingCampaign ? 'Publishing...' : 'Publish Campaign to Local Feed'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 4: Applications Review */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white mb-1">Creator Applications</h2>
            {applications.length === 0 ? (
              <div className="text-center py-16 bg-[#0c1416] rounded-2xl border border-[#1c292c] text-xs text-slate-400">
                No applications submitted yet.
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map(app => (
                  <div key={app.id} className="bg-[#0c1416] p-6 rounded-2xl border border-[#1c292c] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={app.creator_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={app.creator_name}
                          className="w-14 h-14 rounded-xl object-cover border border-[#1c292c]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-white">{app.creator_name}</h3>
                            <span className="text-xs text-slate-400">@{app.creator_username}</span>
                            {app.match_score && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink/15 text-pink border border-pink/30">
                                {app.match_score}% Match
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            Applied to: <strong className="text-white">{app.campaign_title}</strong>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Verified Followers: <strong className="text-purple-300">{app.ig_followers ? app.ig_followers.toLocaleString() : '15,400+'}</strong> • Proposed Fee: ₹{app.proposed_budget || app.reward_per_creator}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {app.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, 'ACCEPTED')}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
                            >
                              Accept & Lock Escrow
                            </button>
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, 'REJECTED')}
                              className="px-4 py-2 rounded-xl bg-[#131d20] hover:bg-[#1a282c] text-rose-400 text-xs font-bold border border-rose-900/40 cursor-pointer"
                            >
                              Decline
                            </button>
                          </>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            app.status === 'ACCEPTED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-[#131d20] text-slate-400 border border-[#1c292c]'
                          }`}>
                            {app.status}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#080f11] border border-[#1c292c] text-xs text-slate-300">
                      <strong className="block text-slate-400 text-[10px] uppercase mb-1">Creator Pitch & Strategy</strong>
                      "{app.pitch || 'Excited to showcase this collection and drive verified engagement from local followers!'}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Deliverables Verification */}
        {activeTab === 'collaborations' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white mb-1">Deliverables & Content Verification</h2>
            {collaborations.length === 0 ? (
              <div className="text-center py-16 bg-[#0c1416] rounded-2xl border border-[#1c292c] text-xs text-slate-400">
                No active collaborations yet.
              </div>
            ) : (
              <div className="space-y-4">
                {collaborations.map(col => (
                  <div key={col.id} className="bg-[#0c1416] p-6 rounded-2xl border border-[#1c292c] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-pink uppercase tracking-wider block">
                        {col.campaign_title}
                      </span>
                      <h3 className="text-base font-black text-white">Creator: {col.creator_name}</h3>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Status: <strong className="text-purple-300">{col.status}</strong> • Escrow: ₹{col.reward_per_creator?.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {col.submissions?.length > 0 && col.status !== 'COMPLETED' ? (
                        <button
                          onClick={() => setReviewingCollab(col)}
                          className="px-4 py-2 rounded-xl bg-pink hover:bg-pink-hover text-white text-xs font-bold cursor-pointer shadow-md shadow-pink/20"
                        >
                          Review Proof & Release Escrow
                        </button>
                      ) : col.status === 'COMPLETED' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Approved & Escrow Released ✓
                        </span>
                      ) : col.status === 'ESCROW_LOCKED' || col.status === 'escrow_locked' || col.payment_status === 'VERIFIED' || col.payment_status === 'HELD_IN_ESCROW' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Payment secured in escrow
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setEscrowModalCollab(col);
                            setIsEscrowModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Lock className="w-3.5 h-3.5" /> Pay &amp; Lock Escrow
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Review Modal */}
            {reviewingCollab && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071012]/80 backdrop-blur-md">
                <div className="bg-[#0c1416] border border-[#1c292c] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
                  <h3 className="text-lg font-black text-white mb-2">Review Deliverable Proof</h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Inspect submitted live post URL. Approving will automatically release locked escrow funds.
                  </p>

                  <div className="mb-4 p-3 rounded-xl bg-[#080f11] border border-[#1c292c] text-xs">
                    <span className="text-slate-500 block mb-1">Live Instagram Link:</span>
                    <a
                      href={reviewingCollab.submissions?.[0]?.live_post_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-pink font-bold hover:underline flex items-center gap-1"
                    >
                      {reviewingCollab.submissions?.[0]?.live_post_url} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <form onSubmit={handleReviewDeliverable} className="space-y-4">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setReviewAction('APPROVE')}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border cursor-pointer ${
                          reviewAction === 'APPROVE'
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-[#080f11] text-slate-400 border-[#1c292c]'
                        }`}
                      >
                        Approve & Release
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewAction('REVISION')}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border cursor-pointer ${
                          reviewAction === 'REVISION'
                            ? 'bg-amber-600 text-white border-amber-500'
                            : 'bg-[#080f11] text-slate-400 border-[#1c292c]'
                        }`}
                      >
                        Request Revision
                      </button>
                    </div>

                    {reviewAction === 'APPROVE' && reviewingCollab && !(
                      reviewingCollab.status === 'ESCROW_LOCKED' ||
                      reviewingCollab.status === 'escrow_locked' ||
                      reviewingCollab.payment_status === 'VERIFIED' ||
                      reviewingCollab.payment_status === 'HELD_IN_ESCROW'
                    ) && (
                      <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-800/80 text-xs text-purple-200 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-purple-300">
                          <Lock className="w-3.5 h-3.5 text-purple-400" /> Razorpay Escrow Deposit Required
                        </div>
                        <p className="text-[11px] text-slate-300">
                          Escrow payment (₹{(reviewingCollab.reward_per_creator || 5000).toLocaleString()}) has not been funded yet. You must complete Razorpay payment before deliverables can be approved and escrow released.
                        </p>
                      </div>
                    )}

                    {reviewAction === 'REVISION' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Revision Instructions</label>
                        <textarea
                          rows={2}
                          required
                          value={reviewFeedback}
                          onChange={e => setReviewFeedback(e.target.value)}
                          placeholder="State what needs adjustment (e.g. tag @myntra in caption, showcase product tag)..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#080f11] border border-[#1c292c] text-white text-xs focus:outline-none focus:border-pink"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setReviewingCollab(null)}
                        className="flex-1 py-2.5 rounded-xl bg-[#131d20] text-slate-300 text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={processingReview}
                        className="flex-1 py-2.5 rounded-xl bg-pink hover:bg-pink-hover text-white text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-pink/20"
                      >
                        {processingReview ? 'Processing...' : 'Confirm Action'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Discover Creators */}
        {activeTab === 'creators' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">Discover Local Creators</h2>
                <p className="text-xs text-slate-400">Browse verified creators and send direct collaboration offers.</p>
              </div>
              <button
                onClick={() => setActiveTab('pitch')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Switch to Direct Pitch Studio
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {matchedCreators.map(cr => (
                <div key={cr.id} className="bg-[#0c1416] p-5 rounded-2xl border border-[#1c292c] hover:border-pink/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={cr.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                        alt={cr.full_name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#1c292c]"
                      />
                      <div>
                        <h4 className="text-sm font-black text-white">{cr.full_name}</h4>
                        <span className="text-xs text-pink">@{cr.username}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">{cr.bio || 'Fashion & lifestyle creator ready for brand collaborations.'}</p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#080f11] p-2.5 rounded-xl border border-[#1c292c] mb-4">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Followers</span>
                        <strong className="text-white">{cr.instagram?.followers_count ? cr.instagram.followers_count.toLocaleString() : (cr.followers ? cr.followers.toLocaleString() : '18,500+')}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Engagement</span>
                        <strong className="text-emerald-400">{cr.instagram?.engagement_rate ? `${cr.instagram.engagement_rate}%` : (cr.engagement_rate ? `${cr.engagement_rate}%` : '4.8%')}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/creators/${cr.id}`}
                      className="px-3 py-2 rounded-xl bg-[#131d20] hover:bg-[#1a282c] text-slate-300 font-bold text-xs text-center border border-[#1c292c]"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setPitchModalCreator(cr);
                        setIsDirectPitchModalOpen(true);
                      }}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Direct Pitch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Dedicated Direct Pitch Studio */}
        {activeTab === 'pitch' && (
          <div className="space-y-6">
            {/* Direct Pitch Hero Banner */}
            <div className="bg-gradient-to-r from-purple-950/40 via-[#0c1416] to-[#0c1416] p-8 rounded-2xl border border-purple-800/30 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-pink/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-extrabold text-xs border border-purple-500/30">
                  <Send className="w-3.5 h-3.5 text-purple-400" /> Direct Creator Outreach
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight">Direct Pitch Studio</h2>
                <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
                  Directly pitch creators with your collaboration proposals from {currentBrandName}. Send tailored briefs and custom compensation packages. Pitches immediately appear in the creator's Messages inbox.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <Link
                    to="/pitch-creators"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-pink-600/20 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> AI Matchmaker & Directory →
                  </Link>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-[#0c1416] p-4 sm:p-5 rounded-2xl border border-[#1c292c] flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search creators by name, city, handle..."
                  value={pitchTabSearch}
                  onChange={e => setPitchTabSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#080f11] border border-[#1c292c] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                {['All', 'Fashion', 'Beauty', 'Lifestyle', 'Food', 'Tech', 'Fitness'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setPitchTabCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                      pitchTabCategory === cat
                        ? 'bg-pink text-[#071012] font-bold shadow-sm shadow-pink/20'
                        : 'bg-[#131d20] text-slate-400 hover:text-white hover:bg-[#1a282c]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Creator Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {matchedCreators
                .filter(cr => {
                  const matchesSearch = !pitchTabSearch ||
                    cr.full_name?.toLowerCase().includes(pitchTabSearch.toLowerCase()) ||
                    cr.username?.toLowerCase().includes(pitchTabSearch.toLowerCase()) ||
                    cr.city?.toLowerCase().includes(pitchTabSearch.toLowerCase());
                  const matchesCat = pitchTabCategory === 'All' ||
                    (cr.categories_json && cr.categories_json.toLowerCase().includes(pitchTabCategory.toLowerCase())) ||
                    (cr.bio && cr.bio.toLowerCase().includes(pitchTabCategory.toLowerCase()));
                  return matchesSearch && matchesCat;
                })
                .map(cr => (
                  <div key={cr.id} className="bg-[#0c1416] p-5 rounded-2xl border border-[#1c292c] hover:border-pink/40 transition-all flex flex-col justify-between space-y-4 shadow-sm group">
                    <div>
                      <div className="flex items-center gap-3.5 mb-3">
                        <img
                          src={cr.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={cr.full_name}
                          className="w-12 h-12 rounded-xl object-cover border border-[#1c292c] group-hover:border-pink/40 transition-colors shadow-sm"
                        />
                        <div className="overflow-hidden">
                          <h4 className="text-sm font-black text-white truncate flex items-center gap-1.5">
                            {cr.full_name}
                            {(cr.verified === 1 || cr.verification_status === 'verified') && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-pink shrink-0" />
                            )}
                          </h4>
                          <div className="text-xs text-pink font-bold">@{cr.username}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-500" /> {cr.city || 'Bengaluru'}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">{cr.bio || 'Content creator ready for brand collaborations.'}</p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#080f11] p-3 rounded-xl border border-[#1c292c] mb-2">
                        <div>
                          <span className="text-slate-500 block text-[10px] font-bold uppercase">Followers</span>
                          <strong className="text-white text-xs font-black">
                            {(cr.instagram?.followers_count || cr.followers || 16200).toLocaleString()}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] font-bold uppercase">Engagement</span>
                          <strong className="text-emerald-400 text-xs font-black">
                            {cr.instagram?.engagement_rate ? `${cr.instagram.engagement_rate}%` : `${cr.engagement_rate || 4.2}%`}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-[#1c292c]">
                      <Link
                        to={`/creators/${cr.id}`}
                        className="px-3.5 py-2.5 rounded-xl bg-[#131d20] hover:bg-[#1a282c] text-slate-300 font-bold text-xs transition-colors text-center border border-[#1c292c]"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          setPitchModalCreator(cr);
                          setIsDirectPitchModalOpen(true);
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-pink-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" /> Direct Pitch
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      {/* Edit Brand Profile / Logo Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071012]/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0c1416] border border-[#1c292c] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-pink" /> Edit Brand Profile &amp; Logo
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update your official brand name, logo image URL, and category.
                </p>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#131d20]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBrandProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Brand / Company Name</label>
                <input
                  type="text"
                  required
                  value={editCompanyName}
                  onChange={e => setEditCompanyName(e.target.value)}
                  placeholder="e.g. Myntra, Nykaa, Lakmé, boAt"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080f11] border border-[#1c292c] text-white text-xs focus:outline-none focus:border-pink"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">Brand Logo Image URL</label>
                  <button
                    type="button"
                    onClick={() => {
                      const auto = resolveBrandLogo(editCompanyName, editCategory, user?.email);
                      setEditLogoUrl(auto);
                    }}
                    className="text-[10px] text-pink hover:underline font-bold cursor-pointer"
                  >
                    ✨ Auto-Detect Photo
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={editLogoUrl}
                  onChange={e => setEditLogoUrl(e.target.value.trim())}
                  placeholder="https://images.unsplash.com/... or direct logo URL"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080f11] border border-[#1c292c] text-white text-xs focus:outline-none focus:border-pink"
                />

                {/* Preset sample buttons */}
                <div className="mt-2 space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold block">Quick Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_BRAND_SAMPLES.map(preset => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setEditLogoUrl(preset.url);
                          setEditCategory(preset.category);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          editLogoUrl === preset.url
                            ? 'bg-pink/20 text-pink border-pink/50'
                            : 'bg-[#131d20] hover:bg-[#1a282c] text-slate-300 border-[#1c292c]'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {editLogoUrl.trim() && (
                  <div className="mt-2.5 flex items-center gap-3 p-2.5 rounded-xl bg-[#080f11] border border-[#1c292c]">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 border border-[#1c292c] flex items-center justify-center p-1 shrink-0 shadow-sm overflow-hidden">
                      <img
                        src={editLogoUrl.trim()}
                        alt="Logo Preview"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = resolveBrandLogo(editCompanyName || currentBrandName, editCategory);
                        }}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                    <div className="text-[11px] text-slate-300 truncate">
                      <span className="font-bold text-emerald-400 block">✓ Live Official Logo Preview</span>
                      <span className="text-slate-500 font-mono text-[10px] truncate max-w-xs block">{editLogoUrl.substring(0, 45)}...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080f11] border border-[#1c292c] text-white text-xs focus:outline-none focus:border-pink cursor-pointer"
                  >
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Beauty & Skincare">Beauty & Skincare</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Fitness & Wellness">Fitness & Wellness</option>
                    <option value="Technology">Technology</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Website URL</label>
                  <input
                    type="text"
                    value={editWebsite}
                    onChange={e => setEditWebsite(e.target.value)}
                    placeholder="https://myntra.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080f11] border border-[#1c292c] text-white text-xs focus:outline-none focus:border-pink"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#1c292c]">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#131d20] hover:bg-[#1a282c] text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex-1 py-2.5 rounded-xl bg-pink hover:bg-pink-hover text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-pink/20 cursor-pointer disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save & Update Logo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Single Campaign Image Modal */}
      {editingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071012]/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0c1416] border border-[#1c292c] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-pink" /> Update Campaign Cover Image
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-sm">
                  {editingCampaign.title}
                </p>
              </div>
              <button
                onClick={() => setEditingCampaign(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#131d20]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCampaignImage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">New Cover Image URL</label>
                <input
                  type="text"
                  required
                  value={newCampaignImageUrl}
                  onChange={e => setNewCampaignImageUrl(e.target.value.trim())}
                  placeholder="Paste direct image link: https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080f11] border border-[#1c292c] text-white text-xs focus:outline-none focus:border-pink"
                />
              </div>

              {newCampaignImageUrl.trim() && (
                <div className="relative h-60 rounded-2xl overflow-hidden border border-[#1c292c] bg-[#04080a] flex items-center justify-center">
                  <img
                    src={newCampaignImageUrl.trim()}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-110 pointer-events-none"
                  />
                  <img
                    src={newCampaignImageUrl.trim()}
                    alt="Preview"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = resolveBrandLogo(currentBrandName, currentCategory);
                    }}
                    className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain rounded-lg shadow-2xl p-1"
                  />
                  <span className="absolute bottom-2.5 left-2.5 z-20 bg-[#071012]/90 backdrop-blur-md text-[10px] font-bold text-emerald-400 px-3 py-1 rounded-md border border-emerald-500/30 flex items-center gap-1.5 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Full Image Preview Ready
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-[#1c292c]">
                <button
                  type="button"
                  onClick={() => setEditingCampaign(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#131d20] text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCampaignImage}
                  className="flex-1 py-2.5 rounded-xl bg-pink hover:bg-pink-hover text-white text-xs font-bold shadow-md shadow-pink/20 cursor-pointer disabled:opacity-50"
                >
                  {savingCampaignImage ? 'Updating...' : 'Update Cover Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Unified Direct Pitch Modal */}
      {pitchModalCreator && (
        <DirectPitchModal
          creator={pitchModalCreator}
          isOpen={isDirectPitchModalOpen}
          onClose={() => {
            setIsDirectPitchModalOpen(false);
            setPitchModalCreator(null);
          }}
          onSuccess={() => {
            loadData();
          }}
        />
      )}

      {/* Razorpay Escrow Checkout Modal */}
      {isEscrowModalOpen && escrowModalCollab && (
        <EscrowPaymentModal
          isOpen={isEscrowModalOpen}
          onClose={() => setIsEscrowModalOpen(false)}
          collaboration={escrowModalCollab}
          autoPromptApprove={Boolean(reviewingCollab && reviewingCollab.id === escrowModalCollab.id)}
          onApproveAfterPayment={async () => {
            if (reviewingCollab) {
              await api.reviewDeliverableProof(reviewingCollab.id, {
                action: 'APPROVE',
                feedback: reviewFeedback
              });
              setReviewingCollab(null);
              loadData();
            }
          }}
          onPaymentSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};
