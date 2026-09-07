import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  MapPin,
  Compass,
  Filter,
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  Users,
  DollarSign,
  Layers,
  Map as MapIcon,
  Grid,
  CheckCircle2,
  X,
  Send,
  Building2,
  AlertCircle,
  Crown,
  Zap,
  Award
} from 'lucide-react';
import { Instagram } from '../components/icons/InstagramIcon';
import { CreatorSubscriptionModal } from '../components/CreatorSubscriptionModal';
import { CreatorSubscriptionStatus } from '../types';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const creatorMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const brandMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const CreatorCampaignFeedPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRadius, setSelectedRadius] = useState<string>('15');
  const [customRadius, setCustomRadius] = useState<number>(15);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'feed' | 'map'>('feed');

  // Quick Apply Modal State
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [briefCampaign, setBriefCampaign] = useState<any | null>(null);
  const [pitchText, setPitchText] = useState('');
  const [experienceText, setExperienceText] = useState('');
  const [availabilityText, setAvailabilityText] = useState('Immediate / This Weekend');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');

  const getDeliverablesList = (c: any): string[] => {
    if (Array.isArray(c.deliverables)) return c.deliverables;
    if (typeof c.deliverables === 'string') {
      try { const parsed = JSON.parse(c.deliverables); if (Array.isArray(parsed)) return parsed; } catch {}
      return [c.deliverables];
    }
    if (c.deliverables_json) {
      try { const parsed = JSON.parse(c.deliverables_json); if (Array.isArray(parsed)) return parsed; } catch {}
    }
    return ['1 Instagram Reel / Video', '1 Story Mention with link'];
  };

  // Subscription State
  const [subscriptionData, setSubscriptionData] = useState<CreatorSubscriptionStatus | null>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Instagram Connection State
  const [isInstagramConnected, setIsInstagramConnected] = useState<boolean>(
    Boolean(user?.instagram && (user.instagram.is_connected === 1 || user.instagram.is_connected === true))
  );
  const [isInstagramPromptOpen, setIsInstagramPromptOpen] = useState(false);

  const creatorProfile = (user?.profile as any) || {};
  const creatorLat = Number(creatorProfile.lat) || 12.9716;
  const creatorLng = Number(creatorProfile.lng) || 77.5946;

  const currentTier = subscriptionData?.tier || (creatorProfile.subscription_tier as any) || 'free';

  const loadSubscription = async () => {
    try {
      const res = await api.getSubscriptionStatus();
      if (res.success) {
        setSubscriptionData(res);
      }
    } catch (e) {
      console.warn('Failed to load subscription status:', e);
    }
  };

  const checkInstagramStatus = async () => {
    if (user?.role !== 'creator') return;
    if (user?.instagram && (user.instagram.is_connected === 1 || user.instagram.is_connected === true)) {
      setIsInstagramConnected(true);
      return;
    }
    try {
      const igRes = await api.getInstagramAnalytics();
      if (igRes && igRes.success && (igRes.is_connected === 1 || igRes.is_connected === true)) {
        setIsInstagramConnected(true);
      } else {
        setIsInstagramConnected(false);
      }
    } catch {
      setIsInstagramConnected(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'creator') {
      loadSubscription();
      checkInstagramStatus();
    }
  }, [user]);

  const getRequiredTierForCampaign = (reward: number) => {
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

  const handleOpenApply = (camp: any) => {
    if (user?.role === 'creator' && !isInstagramConnected) {
      setSelectedCampaign(camp);
      setIsInstagramPromptOpen(true);
      return;
    }
    const reqTier = getRequiredTierForCampaign(camp.reward_per_creator || 0);
    if (getTierOrder(currentTier) < getTierOrder(reqTier)) {
      setSelectedCampaign(camp);
      setIsSubscriptionModalOpen(true);
      return;
    }
    if (subscriptionData && subscriptionData.applications_remaining === 0) {
      setSelectedCampaign(camp);
      setIsSubscriptionModalOpen(true);
      return;
    }
    setSelectedCampaign(camp);
  };

  const radiusOptions = ['1', '5', '10', '25', 'custom', 'all'];
  const categories = ['All', 'Food & Beverage', 'Fitness & Wellness', 'Beauty & Skincare', 'Dining & Nightlife', 'Fashion', 'Lifestyle'];

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const radiusParam = selectedRadius === 'custom' ? String(customRadius) : selectedRadius;
      const params: Record<string, string> = {
        lat: String(creatorLat),
        lng: String(creatorLng),
        radius: radiusParam,
        status: 'PUBLISHED'
      };
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.getCampaigns(params);
      if (res.success && res.campaigns) {
        setCampaigns(res.campaigns);
      }
    } catch (err) {
      console.error('Error loading campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [selectedRadius, customRadius, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCampaigns();
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || !pitchText.trim()) return;

    if (!isInstagramConnected) {
      setApplyError('You must connect your Instagram account before applying to campaigns.');
      setIsInstagramPromptOpen(true);
      return;
    }

    setApplying(true);
    setApplyError('');
    try {
      const res = await api.applyCampaign({
        campaign_id: selectedCampaign.id,
        pitch: pitchText.trim(),
        relevant_experience: experienceText.trim(),
        availability: availabilityText
      });

      if (res.success) {
        setApplySuccess(true);
        setTimeout(() => {
          setSelectedCampaign(null);
          setApplySuccess(false);
          setPitchText('');
          setExperienceText('');
        }, 1800);
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to submit application.';
      setApplyError(msg);
      if (msg.toLowerCase().includes('instagram') || err.code === 'INSTAGRAM_REQUIRED') {
        setIsInstagramConnected(false);
      }
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4 text-zinc-700" /> Live Neighborhood Feed
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              Campaign Discovery
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
              Exploring brand briefs near{' '}
              <span className="text-zinc-900 font-semibold">{creatorProfile.area || creatorProfile.city || 'your location'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Membership Status Pill */}
            {user?.role === 'creator' && (
              <button
                onClick={() => setIsSubscriptionModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-zinc-50 border border-zinc-200 hover:border-zinc-300 text-xs transition-all shadow-sm group cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="font-black text-zinc-900 capitalize">{currentTier} Plan</span>
                <span className="text-[11px] text-zinc-500">
                  • {subscriptionData?.applications_remaining === 'unlimited' ? 'Unlimited' : `${subscriptionData?.applications_remaining ?? 3} apps left`}
                </span>
                <span className="text-[10px] font-bold text-zinc-700 ml-1">Upgrade ↗</span>
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="inline-flex p-1 bg-zinc-100 rounded-2xl border border-zinc-200">
              <button
                onClick={() => setViewMode('feed')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'feed'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Grid className="w-3.5 h-3.5" /> Feed View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" /> Map View
              </button>
            </div>

            <Link
              to="/creator/dashboard"
              className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold border border-zinc-200 shadow-sm transition-all"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="space-y-4 mb-8 bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
          {/* Radius Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-zinc-500 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-zinc-600" /> Radius:
            </span>
            {radiusOptions.map(r => (
              <button
                key={r}
                onClick={() => setSelectedRadius(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRadius === r
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'bg-zinc-50 text-zinc-600 hover:text-zinc-900 border border-zinc-200'
                }`}
              >
                {r === 'all' ? 'All Pan-India' : r === 'custom' ? 'Custom' : `${r} km`}
              </button>
            ))}

            {selectedRadius === 'custom' && (
              <div className="flex items-center gap-2 ml-2">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={customRadius}
                  onChange={e => setCustomRadius(Number(e.target.value))}
                  className="w-24 accent-zinc-900"
                />
                <span className="text-xs font-bold text-zinc-900">{customRadius} km</span>
              </div>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100">
            <span className="text-xs font-bold text-zinc-500 mr-2">Category:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-zinc-900 text-white font-bold shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Keyword Search Input */}
          <form onSubmit={handleSearchSubmit} className="pt-2 border-t border-zinc-100 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search campaigns by keyword, outlet, or brand name..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Instagram Required Banner for Creators */}
        {!isInstagramConnected && user?.role === 'creator' && (
          <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-amber-500/10 border border-pink-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-600 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-pink-500/20">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-zinc-900">Instagram Connection Required to Apply</h4>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Brands require verified audience insights & engagement analytics before accepting proposals. Connect your Instagram account to unlock campaign applications.
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

        {/* View Mode 1: Interactive Map View */}
        {viewMode === 'map' ? (
          <div className="h-[550px] w-full rounded-3xl overflow-hidden border border-zinc-200 shadow-sm relative">
            <MapContainer
              center={[creatorLat, creatorLng]}
              zoom={13}
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Creator Center Location Marker */}
              <Marker position={[creatorLat, creatorLng]} icon={creatorMarkerIcon}>
                <Popup>
                  <div className="text-xs font-bold text-zinc-900">
                    📍 Your Profile Location
                    <div className="text-[10px] text-zinc-600 font-normal mt-0.5">{creatorProfile.area || 'Current Spot'}</div>
                  </div>
                </Popup>
              </Marker>

              {/* Selected Radius Circle */}
              {selectedRadius !== 'all' && (
                <Circle
                  center={[creatorLat, creatorLng]}
                  radius={(selectedRadius === 'custom' ? customRadius : Number(selectedRadius)) * 1000}
                  pathOptions={{ color: '#18181b', fillColor: '#18181b', fillOpacity: 0.08, weight: 1.5 }}
                />
              )}

              {/* Campaign Markers */}
              {campaigns.map(c => {
                const lat = Number(c.lat) || creatorLat;
                const lng = Number(c.lng) || creatorLng;
                return (
                  <Marker key={c.id} position={[lat, lng]} icon={brandMarkerIcon}>
                    <Popup>
                      <div className="text-xs max-w-[220px] p-1 text-zinc-900">
                        <strong className="block text-zinc-900 font-bold mb-1">{c.title}</strong>
                        <div className="text-[11px] text-zinc-600 mb-1">{c.brand_name}</div>
                        <div className="font-bold text-emerald-600 mb-2">Reward: ₹{c.reward_per_creator?.toLocaleString()}</div>
                        {c.distance_km !== null && (
                          <div className="text-[10px] text-zinc-700 font-semibold mb-2">📍 {c.distance_km} km away</div>
                        )}
                        <button
                          onClick={() => handleOpenApply(c)}
                          className={`w-full py-1.5 rounded font-bold text-[11px] cursor-pointer transition-all flex items-center justify-center gap-1 ${
                            !isInstagramConnected && user?.role === 'creator'
                              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm'
                              : 'bg-zinc-900 text-white hover:bg-zinc-800'
                          }`}
                        >
                          {!isInstagramConnected && user?.role === 'creator' ? (
                            <>
                              <Instagram className="w-3 h-3" /> Connect to Apply
                            </>
                          ) : (
                            'Quick Apply'
                          )}
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 rounded-3xl bg-zinc-100 animate-pulse border border-zinc-200" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200 shadow-sm">
            <Compass className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-zinc-900 mb-1">No campaigns found within this radius</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-6">
              Try increasing your search radius or clearing category filters to discover more opportunities.
            </p>
            <button
              onClick={() => { setSelectedRadius('25'); setSelectedCategory('All'); setSearchQuery(''); }}
              className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Expand to 25 km
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map(camp => {
              const reward = camp.reward_per_creator || 0;
              const reqTier = getRequiredTierForCampaign(reward);
              const isTierLocked = user?.role === 'creator' && getTierOrder(currentTier) < getTierOrder(reqTier);

              return (
                <div
                  key={camp.id}
                  className="bg-white rounded-3xl border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group shadow-sm"
                >
                  <div>
                    <div className="relative h-48 overflow-hidden bg-zinc-100">
                      <img
                        src={camp.image_url}
                        alt={camp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-zinc-800 border border-zinc-200 shadow-sm">
                        {camp.category}
                      </div>

                      {isTierLocked && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm border border-amber-300/40 backdrop-blur-md">
                          <Crown className="w-3 h-3 text-zinc-950" />
                          {reqTier === 'diamond' ? 'Diamond Brief' : reqTier === 'gold' ? 'Gold+ Brief' : 'Silver+ Brief'}
                        </div>
                      )}

                      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-sm font-black text-emerald-700 border border-emerald-200 shadow-sm">
                        ₹{camp.reward_per_creator?.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <img
                          src={camp.brand_logo}
                          alt={camp.brand_name}
                          className="w-6 h-6 rounded-full object-cover border border-zinc-200"
                        />
                        <span className="text-xs font-bold text-zinc-600">{camp.brand_name}</span>
                      </div>

                      <h3 className="text-lg font-black text-zinc-900 mb-2 group-hover:text-zinc-700 transition-colors line-clamp-1">
                        {camp.title}
                      </h3>

                      <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed mb-4">
                        {camp.description}
                      </p>

                      {/* Metadata Badges */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100 mb-4">
                        <div className="flex items-center gap-1.5 text-zinc-700 font-semibold">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-zinc-400" />
                          <span className="truncate">
                            {camp.distance_km !== null ? `${camp.distance_km} km away` : camp.city}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-700 font-semibold">
                          <Users className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                          <span>{camp.creators_required} creators</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setBriefCampaign(camp)}
                      className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold text-center border border-zinc-200 transition-all cursor-pointer"
                    >
                      View Brief
                    </button>
                    <button
                      onClick={() => handleOpenApply(camp)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-center shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        !isInstagramConnected && user?.role === 'creator'
                          ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:opacity-95 text-white'
                          : isTierLocked
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black shadow-amber-500/20'
                          : 'bg-zinc-950 hover:bg-zinc-800 text-white'
                      }`}
                    >
                      {!isInstagramConnected && user?.role === 'creator' ? (
                        <>
                          <Instagram className="w-3.5 h-3.5" /> Connect to Apply
                        </>
                      ) : isTierLocked ? (
                        <>
                          <Crown className="w-3.5 h-3.5" /> Upgrade to Apply
                        </>
                      ) : (
                        'Quick Apply'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Apply Modal */}
        {selectedCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-zinc-900">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {applySuccess ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">Application Submitted!</h3>
                  <p className="text-xs text-zinc-500">
                    The brand has been notified and will review your proposal shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleApply}>
                  <div className="mb-6">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                      Apply to Campaign
                    </span>
                    <h2 className="text-xl font-black text-zinc-900 mb-1">{selectedCampaign.title}</h2>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>{selectedCampaign.brand_name}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-bold">₹{selectedCampaign.reward_per_creator?.toLocaleString()}</span>
                    </div>
                  </div>

                  {applyError && (
                    <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                        <span className="font-semibold">{applyError}</span>
                      </div>
                      {(applyError.toLowerCase().includes('instagram') ||
                        applyError.toLowerCase().includes('connect')) && (
                        <Link
                          to="/creator/dashboard?tab=instagram"
                          className="w-full mt-1.5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Instagram className="w-3.5 h-3.5" /> Connect Instagram on Dashboard
                        </Link>
                      )}
                      {(applyError.toLowerCase().includes('subscription') ||
                        applyError.toLowerCase().includes('quota') ||
                        applyError.toLowerCase().includes('tier') ||
                        applyError.toLowerCase().includes('limit')) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCampaign(null);
                            setIsSubscriptionModalOpen(true);
                          }}
                          className="w-full mt-1.5 py-2 rounded-xl bg-zinc-900 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Crown className="w-3.5 h-3.5 text-amber-400" /> Upgrade Subscription Tier
                        </button>
                      )}
                    </div>
                  )}

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                        Your Pitch / Content Idea *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={pitchText}
                        onChange={e => setPitchText(e.target.value)}
                        placeholder="Describe how you plan to showcase this brand (e.g. 30s 4K Reel with tasting notes and ambiance)..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs focus:outline-none focus:border-zinc-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                        Relevant Experience or Past Brands (Optional)
                      </label>
                      <input
                        type="text"
                        value={experienceText}
                        onChange={e => setExperienceText(e.target.value)}
                        placeholder="e.g. Created reels for local cafes reaching 25k+ views"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs focus:outline-none focus:border-zinc-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                        Availability
                      </label>
                      <input
                        type="text"
                        value={availabilityText}
                        onChange={e => setAvailabilityText(e.target.value)}
                        placeholder="e.g. This Saturday afternoon"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs focus:outline-none focus:border-zinc-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={applying}
                    className="w-full py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    {applying ? 'Submitting...' : 'Send Application to Brand'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* View Campaign Brief Modal */}
        {briefCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto text-zinc-900">
              <button
                type="button"
                onClick={() => setBriefCampaign(null)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3.5 mb-5 pb-5 border-b border-zinc-100">
                <img
                  src={briefCampaign.brand_logo || 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=150'}
                  alt={briefCampaign.brand_name || 'Brand'}
                  className="w-12 h-12 rounded-2xl object-cover border border-zinc-200"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
                    <span>{briefCampaign.brand_name || 'Brand Partner'}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-700" />
                    <span>• {briefCampaign.category || 'General'}</span>
                  </div>
                  <h2 className="text-xl font-black text-zinc-900">{briefCampaign.title}</h2>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Campaign Brief & Objectives</h4>
                  <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                    {briefCampaign.description || 'Collaborate with the brand to create authentic, engaging content for audiences.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Reward Payout</div>
                    <div className="font-heading text-lg font-extrabold text-emerald-600">
                      ₹{(briefCampaign.reward_per_creator || 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Escrow Protected
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Requirements</div>
                    <div className="font-bold text-zinc-800">
                      {(briefCampaign.min_followers || 0).toLocaleString()}+ Followers
                    </div>
                    <div className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                      {briefCampaign.platform || 'Instagram'}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Required Deliverables</h4>
                  <div className="space-y-2">
                    {getDeliverablesList(briefCampaign).map((del, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-xs text-zinc-800 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{del}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {(briefCampaign.hashtags || briefCampaign.mentions) && (
                  <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-1 text-xs">
                    {briefCampaign.hashtags && (
                      <div className="text-zinc-600 font-mono text-[11px]">{briefCampaign.hashtags}</div>
                    )}
                    {briefCampaign.mentions && (
                      <div className="text-zinc-600 font-mono text-[11px]">{briefCampaign.mentions}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link
                  to={`/campaigns/${briefCampaign.id}`}
                  className="flex-1 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold text-center border border-zinc-200 transition-all"
                >
                  Open Full Page
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const c = briefCampaign;
                    setBriefCampaign(null);
                    handleOpenApply(c);
                  }}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold text-center shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    !isInstagramConnected && user?.role === 'creator'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white'
                      : 'bg-zinc-950 hover:bg-zinc-800 text-white'
                  }`}
                >
                  {!isInstagramConnected && user?.role === 'creator' ? (
                    <>
                      <Instagram className="w-3.5 h-3.5" /> Connect Instagram to Apply
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Apply Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Creator Subscription Upgrade Modal */}
        <CreatorSubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          currentTier={currentTier}
          onUpgradeSuccess={() => {
            loadSubscription();
            loadCampaigns();
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
                Instagram Connection Required
              </span>

              <h3 className="text-xl font-black text-zinc-900 mb-2">Connect Instagram to Apply</h3>
              
              <p className="text-xs text-zinc-500 leading-relaxed mb-6">
                Brands on CreatorHub require verified Instagram analytics (followers, engagement rate, and verified reach) before reviewing campaign applications. Connect your account in 30 seconds on your creator dashboard to unlock applications.
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
