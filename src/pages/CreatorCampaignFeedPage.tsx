import React, { useEffect, useState, useRef } from 'react';
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
import { geocodeClientLocation, POPULAR_NEIGHBORHOODS, LocationPoint } from '../utils/geocoding';
import { resolveBrandLogo } from '../utils/brandLogos';
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

// Quick suggestion chips for creators
const SUGGESTION_CHIPS = [
  { label: '📍 Vijaynagar', query: 'Vijaynagar' },
  { label: '✨ Myntra', query: 'Myntra' },
  { label: '☕ Third Wave Coffee', query: 'Third Wave' },
  { label: '🏋️ Cult.fit', query: 'Cult.fit' },
  { label: '💄 Lakmé', query: 'Lakme' },
  { label: '🎧 boAt', query: 'boAt' },
  { label: '👕 The Souled Store', query: 'Souled Store' },
  { label: '👟 Decathlon', query: 'Decathlon' }
];

export const CreatorCampaignFeedPage: React.FC = () => {
  const { user, refreshSessionUser, showToast } = useAuth();
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRadius, setSelectedRadius] = useState<string>('15');
  const [customRadius, setCustomRadius] = useState<number>(15);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'feed' | 'map'>('feed');

  // Location Switcher State
  const creatorProfile = (user?.profile as any) || {};
  const [activeLocationName, setActiveLocationName] = useState<string>(
    creatorProfile.area || creatorProfile.city || 'Bengaluru'
  );
  const [activeLat, setActiveLat] = useState<number>(Number(creatorProfile.lat) || 12.9719);
  const [activeLng, setActiveLng] = useState<number>(Number(creatorProfile.lng) || 77.5305);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [customLocationQuery, setCustomLocationQuery] = useState('');
  const [savingDefaultLocation, setSavingDefaultLocation] = useState(false);

  // Autocomplete Suggestions State
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    if (!c) return ['1x Instagram Reel / Video', '1x Story Mention with link'];
    let rawList: any[] = [];
    if (Array.isArray(c.deliverables)) {
      rawList = c.deliverables;
    } else if (typeof c.deliverables === 'string') {
      try {
        const parsed = JSON.parse(c.deliverables);
        rawList = Array.isArray(parsed) ? parsed : [c.deliverables];
      } catch {
        rawList = [c.deliverables];
      }
    } else if (c.deliverables_json) {
      try {
        const parsed = JSON.parse(c.deliverables_json);
        rawList = Array.isArray(parsed) ? parsed : [c.deliverables_json];
      } catch {
        rawList = [c.deliverables_json];
      }
    }

    if (!rawList || rawList.length === 0) {
      return ['1x Instagram Reel / Video', '1x Story Mention with link'];
    }

    return rawList.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        if (item.requirement) {
          return item.requirement;
        }
        const count = item.count ? `${item.count}x ` : '1x ';
        const type = item.type || item.platform || 'Deliverable';
        const platform = item.platform && item.platform !== item.type ? ` (${item.platform})` : '';
        return `${count}${type}${platform}`;
      }
      return String(item);
    });
  };

  const getCategoryFallbackImage = (category?: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('food') || cat.includes('beverage') || cat.includes('coffee') || cat.includes('brew') || cat.includes('cafe')) {
      return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=500&auto=format&fit=crop&q=80';
    }
    if (cat.includes('fitness') || cat.includes('gym') || cat.includes('sport') || cat.includes('wellness') || cat.includes('workout')) {
      return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&h=500&auto=format&fit=crop&q=80';
    }
    if (cat.includes('beauty') || cat.includes('skin') || cat.includes('cosmetic') || cat.includes('makeup')) {
      return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=500&auto=format&fit=crop&q=80';
    }
    if (cat.includes('dining') || cat.includes('nightlife') || cat.includes('bar') || cat.includes('lounge') || cat.includes('cocktail')) {
      return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&auto=format&fit=crop&q=80';
    }
    if (cat.includes('fashion') || cat.includes('apparel') || cat.includes('clothing') || cat.includes('style')) {
      return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=500&auto=format&fit=crop&q=80';
    }
    if (cat.includes('lifestyle') || cat.includes('travel') || cat.includes('living') || cat.includes('vlog')) {
      return 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&h=500&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=500&auto=format&fit=crop&q=80';
  };

  const getBrandInitials = (name?: string) => {
    if (!name || name === 'Brand Partner') return 'CH';
    const clean = name.trim();
    const parts = clean.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return clean.slice(0, 2).toUpperCase();
  };

  const checkIsInstagramConnected = (u: any): boolean => {
    if (!u) return false;
    if (u.instagram && (u.instagram.is_connected === 1 || u.instagram.is_connected === true || u.instagram.connected === true)) {
      return true;
    }
    if (u.profile && (u.profile.social_link || u.profile.instagram_handle)) {
      return true;
    }
    return false;
  };

  // Subscription State
  const [subscriptionData, setSubscriptionData] = useState<CreatorSubscriptionStatus | null>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Instagram Connection State
  const [isInstagramConnected, setIsInstagramConnected] = useState<boolean>(checkIsInstagramConnected(user));
  const [isInstagramPromptOpen, setIsInstagramPromptOpen] = useState(false);

  const currentTier = subscriptionData?.tier || (creatorProfile.subscription_tier as any) || 'free';

  // Sync profile location when user context is ready
  useEffect(() => {
    if (user?.profile) {
      const p = user.profile as any;
      const initialLoc = p.area || p.city || 'Bengaluru';
      const initialLat = Number(p.lat) || 12.9719;
      const initialLng = Number(p.lng) || 77.5305;
      setActiveLocationName(initialLoc);
      setActiveLat(initialLat);
      setActiveLng(initialLng);
    }
  }, [user]);

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
    if (checkIsInstagramConnected(user)) {
      setIsInstagramConnected(true);
      return;
    }
    try {
      const igRes = await api.getInstagramStatus();
      if (igRes && igRes.success && (igRes.is_connected || igRes.connected)) {
        setIsInstagramConnected(true);
      } else {
        setIsInstagramConnected(false);
      }
    } catch {
      setIsInstagramConnected(checkIsInstagramConnected(user));
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

  const radiusOptions = ['1', '5', '10', '15', '25', 'custom', 'all'];
  const categories = ['All', 'Food & Beverage', 'Fitness & Wellness', 'Beauty & Skincare', 'Dining & Nightlife', 'Fashion', 'Lifestyle'];

  const loadCampaigns = async (
    overrideSearch?: string,
    overrideCategory?: string,
    overrideLat?: number,
    overrideLng?: number,
    overrideRadius?: string
  ) => {
    setLoading(true);
    try {
      const rad = overrideRadius !== undefined ? overrideRadius : selectedRadius;
      const radiusParam = rad === 'custom' ? String(customRadius) : rad;
      const query = overrideSearch !== undefined ? overrideSearch : searchQuery;
      const cat = overrideCategory !== undefined ? overrideCategory : selectedCategory;
      const currentLat = overrideLat !== undefined ? overrideLat : activeLat;
      const currentLng = overrideLng !== undefined ? overrideLng : activeLng;

      const params: Record<string, string> = {
        lat: String(currentLat),
        lng: String(currentLng),
        radius: radiusParam,
        status: 'PUBLISHED'
      };

      if (cat !== 'All' && !query.trim()) {
        params.category = cat;
      }
      if (query.trim()) {
        params.search = query.trim();
      }

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
    const timer = setTimeout(() => {
      loadCampaigns();
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedRadius, customRadius, selectedCategory, searchQuery, activeLat, activeLng]);

  const handleSelectNewLocation = async (locName: string, makeDefault = false) => {
    const geo = geocodeClientLocation(locName);
    let lat = 12.9719;
    let lng = 77.5305;
    let displayName = locName;

    if (geo) {
      lat = geo.lat;
      lng = geo.lng;
      displayName = geo.name;
    }

    setActiveLocationName(displayName);
    setActiveLat(lat);
    setActiveLng(lng);
    setIsLocationModalOpen(false);
    setCustomLocationQuery('');

    if (makeDefault && user?.role === 'creator') {
      setSavingDefaultLocation(true);
      try {
        await api.updateProfile({
          area: displayName,
          lat,
          lng
        });
        if (refreshSessionUser) await refreshSessionUser();
        showToast(`📍 Default profile location updated to ${displayName}!`);
      } catch (err) {
        console.warn('Could not save default location:', err);
      } finally {
        setSavingDefaultLocation(false);
      }
    }

    loadCampaigns(searchQuery, selectedCategory, lat, lng);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    loadCampaigns();
  };

  const handleSelectSuggestion = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory('All');
    setShowSuggestions(false);
    loadCampaigns(query, 'All');
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
    <div className="min-h-screen bg-[#071012] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0c1416] p-6 rounded-3xl border border-[#1c292c] shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-pink uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4 text-pink" /> Live Neighborhood Feed
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Campaign Discovery
            </h1>
            <div className="text-xs sm:text-sm text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              <span>Exploring brand briefs near:</span>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#080f11] hover:bg-[#131d20] border border-pink/30 hover:border-pink text-pink text-xs font-bold transition-all shadow-sm cursor-pointer group"
              >
                <MapPin className="w-3.5 h-3.5 text-pink group-hover:animate-bounce" />
                <span>{activeLocationName}</span>
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-300 ml-1 underline decoration-pink">
                  Switch Area
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Membership Status Pill */}
            {user?.role === 'creator' && (
              <button
                onClick={() => setIsSubscriptionModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#080f11] border border-[#1c292c] hover:border-pink/40 text-xs transition-all shadow-sm group cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="font-black text-white capitalize">{currentTier} Plan</span>
                <span className="text-[11px] text-slate-400">
                  • {subscriptionData?.applications_remaining === 'unlimited' ? 'Unlimited' : `${subscriptionData?.applications_remaining ?? 3} apps left`}
                </span>
                <span className="text-[10px] font-bold text-pink ml-1">Upgrade ↗</span>
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="inline-flex p-1 bg-[#080f11] rounded-2xl border border-[#1c292c]">
              <button
                onClick={() => setViewMode('feed')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'feed'
                    ? 'bg-pink text-[#071012] font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" /> Feed View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-pink text-[#071012] font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" /> Map View
              </button>
            </div>

            <Link
              to="/creator/dashboard"
              className="px-4 py-2 rounded-xl bg-[#080f11] hover:bg-[#131d20] text-slate-200 text-xs font-bold border border-[#1c292c] shadow-sm transition-all"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Filter & Live Search Controls */}
        <div className="space-y-4 bg-[#0c1416] p-5 rounded-2xl border border-[#1c292c] shadow-sm">
          {/* Radius Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-pink" /> Search Radius from {activeLocationName}:
            </span>
            {radiusOptions.map(r => (
              <button
                key={r}
                onClick={() => {
                  setSelectedRadius(r);
                  loadCampaigns(searchQuery, selectedCategory, activeLat, activeLng, r);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRadius === r
                    ? 'bg-pink text-[#071012] font-black shadow-sm'
                    : 'bg-[#080f11] text-slate-300 hover:text-white border border-[#1c292c]'
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
                  onChange={e => {
                    const val = Number(e.target.value);
                    setCustomRadius(val);
                    loadCampaigns(searchQuery, selectedCategory, activeLat, activeLng, String(val));
                  }}
                  className="w-24 accent-pink"
                />
                <span className="text-xs font-bold text-pink">{customRadius} km</span>
              </div>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1c292c]">
            <span className="text-xs font-bold text-slate-400 mr-2">Category:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  loadCampaigns(searchQuery, cat);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-pink text-[#071012] font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#131d20]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Keyword Search Input with Live Suggestions */}
          <div className="pt-2 border-t border-[#1c292c] space-y-3 relative">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={e => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    setShowSuggestions(true);
                    if (val.trim() && selectedCategory !== 'All') {
                      setSelectedCategory('All');
                    }
                  }}
                  placeholder="Search campaigns by brand (e.g. Myntra, Cult.fit), location (e.g. Vijaynagar), or keywords..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#080f11] border border-[#1c292c] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      loadCampaigns('', selectedCategory);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-pink hover:bg-pink-hover text-[#071012] text-xs font-bold transition-all shadow-sm shadow-pink/20 cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
              <span className="text-[11px] font-bold text-slate-500 mr-1">Suggestions:</span>
              {SUGGESTION_CHIPS.map(chip => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleSelectSuggestion(chip.query)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    searchQuery.toLowerCase() === chip.query.toLowerCase()
                      ? 'bg-pink/20 text-pink border-pink/40'
                      : 'bg-[#080f11] text-slate-300 border-[#1c292c] hover:border-pink/40 hover:text-white'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Instagram Required Banner for Creators */}
        {!isInstagramConnected && user?.role === 'creator' && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-pink/10 via-rose-500/10 to-amber-500/10 border border-pink/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-pink/20">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Instagram Connection Required to Apply</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Brands require verified audience insights & engagement analytics before accepting proposals. Connect your Instagram account to unlock campaign applications.
                </p>
              </div>
            </div>
            <Link
              to="/creator/dashboard?tab=instagram"
              className="px-4 py-2.5 rounded-xl bg-pink hover:bg-pink-hover text-[#071012] text-xs font-bold whitespace-nowrap shadow-sm shadow-pink/20 transition-all flex items-center gap-2 cursor-pointer self-stretch sm:self-auto justify-center"
            >
              <Instagram className="w-3.5 h-3.5" /> Connect Instagram
            </Link>
          </div>
        )}

        {/* View Mode 1: Interactive Map View */}
        {viewMode === 'map' ? (
          <div className="h-[550px] w-full rounded-3xl overflow-hidden border border-[#1c292c] shadow-sm relative">
            <MapContainer
              key={`${activeLat}-${activeLng}-${selectedRadius}`}
              center={[activeLat, activeLng]}
              zoom={13}
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Creator Center Location Marker */}
              <Marker position={[activeLat, activeLng]} icon={creatorMarkerIcon}>
                <Popup>
                  <div className="text-xs font-bold text-zinc-900">
                    📍 Active Search Center
                    <div className="text-[10px] text-zinc-600 font-normal mt-0.5">{activeLocationName}</div>
                  </div>
                </Popup>
              </Marker>

              {/* Selected Radius Circle */}
              {selectedRadius !== 'all' && (
                <Circle
                  center={[activeLat, activeLng]}
                  radius={(selectedRadius === 'custom' ? customRadius : Number(selectedRadius)) * 1000}
                  pathOptions={{ color: '#ff3366', fillColor: '#ff3366', fillOpacity: 0.12, weight: 1.5 }}
                />
              )}

              {/* Campaign Markers */}
              {campaigns.map(c => {
                const lat = Number(c.lat) || activeLat;
                const lng = Number(c.lng) || activeLng;
                return (
                  <Marker key={c.id} position={[lat, lng]} icon={brandMarkerIcon}>
                    <Popup>
                      <div className="text-xs max-w-[220px] p-1 text-zinc-900">
                        <strong className="block text-zinc-900 font-bold mb-1">{c.title}</strong>
                        <div className="text-[11px] text-zinc-600 mb-1">{c.brand_name}</div>
                        <div className="font-bold text-emerald-600 mb-2">Reward: ₹{c.reward_per_creator?.toLocaleString()}</div>
                        {typeof c.distance_km === 'number' && !isNaN(c.distance_km) && (
                          <div className="text-[10px] text-zinc-700 font-semibold mb-2">📍 {c.distance_km} km away</div>
                        )}
                        <button
                          onClick={() => handleOpenApply(c)}
                          className="w-full py-1.5 rounded font-bold text-[11px] cursor-pointer transition-all flex items-center justify-center gap-1 bg-pink text-[#071012]"
                        >
                          Quick Apply
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
              <div key={i} className="h-80 rounded-3xl bg-[#0c1416] animate-pulse border border-[#1c292c]" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16 bg-[#0c1416] rounded-3xl border border-[#1c292c] shadow-sm px-6">
            <div className="w-16 h-16 rounded-3xl bg-[#080f11] border border-[#1c292c] flex items-center justify-center text-pink mx-auto mb-4">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">
              No campaigns found within {selectedRadius === 'all' ? 'current filters' : `${selectedRadius === 'custom' ? customRadius : selectedRadius} km`} of {activeLocationName}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              {searchQuery
                ? `No briefs match "${searchQuery}" with the current filters. Expand your radius or try searching for brands like "Myntra" or "Third Wave".`
                : `We didn't find active brand campaigns in the immediate ${selectedRadius === 'custom' ? customRadius : selectedRadius} km radius. Try expanding to 5 km, 10 km, or 25 km to discover nearby briefs across the city.`}
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-3">
              {selectedRadius !== 'all' && (
                <>
                  <button
                    onClick={() => {
                      setSelectedRadius('10');
                      loadCampaigns(searchQuery, selectedCategory, activeLat, activeLng, '10');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-pink text-[#071012] font-black text-xs shadow-md shadow-pink/20 transition-all cursor-pointer"
                  >
                    📍 Expand to 10 km Radius
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRadius('25');
                      loadCampaigns(searchQuery, selectedCategory, activeLat, activeLng, '25');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#080f11] hover:bg-[#131d20] text-slate-200 font-bold text-xs border border-[#1c292c] transition-all cursor-pointer"
                  >
                    Expand to 25 km
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRadius('all');
                      loadCampaigns(searchQuery, selectedCategory, activeLat, activeLng, 'all');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#080f11] hover:bg-[#131d20] text-slate-200 font-bold text-xs border border-[#1c292c] transition-all cursor-pointer"
                  >
                    Show All Pan-India
                  </button>
                </>
              )}
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#080f11] hover:bg-[#131d20] text-pink font-bold text-xs border border-pink/30 transition-all cursor-pointer"
              >
                🗺️ Switch Search Location
              </button>
            </div>
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
                  className="bg-[#0c1416] rounded-3xl border border-[#1c292c] hover:border-slate-700 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group shadow-sm"
                >
                  <div>
                    <div className="relative h-48 sm:h-52 overflow-hidden bg-[#04080a] flex items-center justify-center">
                      <img
                        src={camp.image_url || getCategoryFallbackImage(camp.category)}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
                      />
                      <img
                        src={camp.image_url || getCategoryFallbackImage(camp.category)}
                        alt={camp.title}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          const fallback = getCategoryFallbackImage(camp.category);
                          if (target.src !== fallback) {
                            target.src = fallback;
                          }
                        }}
                        className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-500 p-1"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c1416]/80 via-transparent to-transparent pointer-events-none z-10" />
                      <div className="absolute top-3 left-3 z-20 bg-[#080f11]/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-[#1c292c] shadow-sm">
                        {camp.category}
                      </div>

                      {isTierLocked && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm border border-amber-300/40 backdrop-blur-md">
                          <Crown className="w-3 h-3 text-zinc-950" />
                          {reqTier === 'diamond' ? 'Diamond Brief' : reqTier === 'gold' ? 'Gold+ Brief' : 'Silver+ Brief'}
                        </div>
                      )}

                      <div className="absolute bottom-3 right-3 bg-[#080f11]/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-sm font-black text-emerald-400 border border-emerald-500/30 shadow-sm font-mono">
                        ₹{camp.reward_per_creator?.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Brand Header: [Brand Logo] Brand Name ✓ Verified */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-[#1c292c] flex items-center justify-center p-0.5 shadow-sm">
                            <img
                              src={resolveBrandLogo(camp.brand_name, camp.category, '', camp.brand_logo)}
                              alt={camp.brand_name || 'Brand Logo'}
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                const fallback = resolveBrandLogo(camp.brand_name, camp.category);
                                if (target.src !== fallback) {
                                  target.src = fallback;
                                }
                              }}
                              className="w-full h-full object-contain rounded-full"
                            />
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-white truncate">
                            {camp.brand_name || 'Verified Brand'}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex-shrink-0">
                          <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400" />
                          Verified
                        </span>
                      </div>

                      {/* Campaign Title */}
                      <h3 className="text-base sm:text-lg font-black text-white mb-2 group-hover:text-pink transition-colors line-clamp-1 tracking-tight">
                        {camp.title}
                      </h3>

                      {/* Short Campaign Description */}
                      <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">
                        {camp.description}
                      </p>

                      {/* Metadata Badges: Location & Creators Needed */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 bg-[#080f11] p-3 rounded-xl border border-[#1c292c] mb-4">
                        <div className="flex items-center gap-1.5 text-slate-200 font-semibold truncate">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-pink" />
                          <span className="truncate">
                            {typeof camp.distance_km === 'number' && !isNaN(camp.distance_km)
                              ? `${camp.distance_km} km away`
                              : (camp.location_name || camp.city || 'Local')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                          <Users className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                          <span>{camp.creators_required || 1} creators needed</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setBriefCampaign(camp)}
                      className="flex-1 py-2.5 rounded-xl bg-[#080f11] hover:bg-[#131d20] text-slate-200 text-xs font-bold text-center border border-[#1c292c] transition-all cursor-pointer"
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
                          : 'bg-pink hover:bg-pink-hover text-[#071012] font-black shadow-md shadow-pink/20'
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#091214] border border-[#1c292c] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-white">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-[#131d20] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {applySuccess ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Application Submitted!</h3>
                  <p className="text-xs text-slate-400">
                    The brand has been notified and will review your proposal shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleApply}>
                  <div className="mb-6">
                    <span className="text-[11px] font-bold text-pink uppercase tracking-wider block mb-1">
                      Apply to Campaign
                    </span>
                    <h2 className="text-xl font-black text-white mb-1">{selectedCampaign.title}</h2>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{selectedCampaign.brand_name || 'Brand Partner'}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold font-mono">₹{selectedCampaign.reward_per_creator?.toLocaleString()}</span>
                    </div>
                  </div>

                  {applyError && (
                    <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                        <span className="font-semibold">{applyError}</span>
                      </div>
                      {(applyError.toLowerCase().includes('instagram') ||
                        applyError.toLowerCase().includes('connect')) && (
                        <Link
                          to="/creator/dashboard?tab=instagram"
                          className="w-full mt-1.5 py-2.5 rounded-xl bg-pink hover:bg-pink-hover text-[#071012] font-bold text-xs shadow-md shadow-pink/20 flex items-center justify-center gap-2 cursor-pointer"
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
                          className="w-full mt-1.5 py-2 rounded-xl bg-pink text-[#071012] font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Crown className="w-3.5 h-3.5 text-[#071012]" /> Upgrade Subscription Tier
                        </button>
                      )}
                    </div>
                  )}

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Your Pitch / Content Idea *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={pitchText}
                        onChange={e => setPitchText(e.target.value)}
                        placeholder="Describe how you plan to showcase this brand (e.g. 30s 4K Reel with tasting notes and ambiance)..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080f11] border border-[#1c292c] text-white text-xs focus:outline-none focus:border-pink"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Relevant Experience or Past Brands (Optional)
                      </label>
                      <input
                        type="text"
                        value={experienceText}
                        onChange={e => setExperienceText(e.target.value)}
                        placeholder="e.g. Created reels for local cafes reaching 25k+ views"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080f11] border border-[#1c292c] text-white text-xs focus:outline-none focus:border-pink"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Availability
                      </label>
                      <input
                        type="text"
                        value={availabilityText}
                        onChange={e => setAvailabilityText(e.target.value)}
                        placeholder="e.g. This Saturday afternoon"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080f11] border border-[#1c292c] text-white text-xs focus:outline-none focus:border-pink"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={applying}
                    className="w-full py-3 rounded-xl bg-pink hover:bg-pink-hover text-[#071012] text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-pink/20 transition-all disabled:opacity-50 cursor-pointer"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#091214] border border-[#1c292c] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto text-white">
              <button
                type="button"
                onClick={() => setBriefCampaign(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-[#131d20] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3.5 mb-5 pb-5 border-b border-[#1c292c]">
                <img
                  src={briefCampaign.brand_logo || 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=150'}
                  alt={briefCampaign.brand_name || 'Brand'}
                  className="w-12 h-12 rounded-2xl object-cover border border-[#1c292c]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                    <span>{briefCampaign.brand_name || 'Brand Partner'}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>• {briefCampaign.category || 'General'}</span>
                  </div>
                  <h2 className="text-xl font-black text-white">{briefCampaign.title}</h2>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="text-xs font-bold text-pink uppercase tracking-wider mb-1.5">Campaign Brief & Objectives</h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#080f11] p-4 rounded-2xl border border-[#1c292c]">
                    {briefCampaign.description || 'Collaborate with the brand to create authentic, engaging content for audiences.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[#080f11] border border-[#1c292c]">
                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Reward Payout</div>
                    <div className="font-heading text-lg font-extrabold text-emerald-400 font-mono">
                      ₹{(briefCampaign.reward_per_creator || 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-400/80 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Escrow Protected
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#080f11] border border-[#1c292c]">
                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Requirements</div>
                    <div className="font-bold text-white">
                      {(briefCampaign.min_followers || 0).toLocaleString()}+ Followers
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {briefCampaign.platform || 'Instagram'}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-pink uppercase tracking-wider mb-2">Required Deliverables</h4>
                  <div className="space-y-2">
                    {getDeliverablesList(briefCampaign).map((del, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#080f11] border border-[#1c292c] text-xs text-slate-200 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{typeof del === 'string' ? del : (del?.requirement || `${del?.count ? `${del.count}x ` : ''}${del?.type || 'Deliverable'}`)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {(briefCampaign.hashtags || briefCampaign.mentions) && (
                  <div className="p-3 bg-[#080f11] border border-[#1c292c] rounded-2xl space-y-1 text-xs">
                    {briefCampaign.hashtags && (
                      <div className="text-slate-400 font-mono text-[11px]">{typeof briefCampaign.hashtags === 'string' ? briefCampaign.hashtags : JSON.stringify(briefCampaign.hashtags)}</div>
                    )}
                    {briefCampaign.mentions && (
                      <div className="text-slate-400 font-mono text-[11px]">{typeof briefCampaign.mentions === 'string' ? briefCampaign.mentions : JSON.stringify(briefCampaign.mentions)}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link
                  to={`/campaigns/${briefCampaign.id}`}
                  className="flex-1 py-3 rounded-xl bg-[#080f11] hover:bg-[#131d20] text-slate-200 text-xs font-bold text-center border border-[#1c292c] transition-all"
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
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-center shadow-md shadow-pink/20 transition-all flex items-center justify-center gap-2 cursor-pointer bg-pink hover:bg-pink-hover text-[#071012] font-black"
                >
                  <Send className="w-3.5 h-3.5" /> Apply Now
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#091214] border border-[#1c292c] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-white text-center">
              <button
                type="button"
                onClick={() => setIsInstagramPromptOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-[#131d20] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-pink/20 border border-pink/30 flex items-center justify-center text-pink mx-auto mb-4 shadow-lg shadow-pink/25">
                <Instagram className="w-8 h-8" />
              </div>

              <span className="text-[11px] font-black uppercase tracking-wider text-pink bg-pink/10 border border-pink/30 px-3 py-1 rounded-full inline-block mb-3">
                Instagram Connection Required
              </span>

              <h3 className="text-xl font-black text-white mb-2">Connect Instagram to Apply</h3>
              
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Brands on CreatorHub require verified Instagram analytics (followers, engagement rate, and verified reach) before reviewing campaign applications. Connect your account in 30 seconds on your creator dashboard to unlock applications.
              </p>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => navigate('/creator/dashboard?tab=instagram')}
                  className="w-full py-3 px-4 rounded-xl bg-pink hover:bg-pink-hover text-[#071012] font-black text-xs shadow-md shadow-pink/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Instagram className="w-4 h-4" /> Go to Connect Instagram
                </button>
                <button
                  type="button"
                  onClick={() => setIsInstagramPromptOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#080f11] hover:bg-[#131d20] text-slate-300 font-bold text-xs border border-[#1c292c] transition-all cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Location Switcher Modal */}
        {isLocationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#0c1416] border border-[#1c292c] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-[#080f11] hover:bg-[#131d20] border border-[#1c292c] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-pink/15 border border-pink/30 flex items-center justify-center text-pink">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg sm:text-xl font-black text-white">
                    Select Your Search Location
                  </h3>
                  <p className="text-xs text-slate-400">
                    Discover campaigns and calculated distances tailored to any neighborhood.
                  </p>
                </div>
              </div>

              {/* Custom Area Search Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customLocationQuery.trim()) {
                    handleSelectNewLocation(customLocationQuery.trim(), false);
                  }
                }}
                className="my-5"
              >
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Search Any Neighborhood or City in India:
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customLocationQuery}
                      onChange={(e) => setCustomLocationQuery(e.target.value)}
                      placeholder="e.g. Vijaynagar, Indiranagar, Whitefield, Bandra, Cyber Hub..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080f11] border border-[#1c292c] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-pink hover:bg-pink-hover text-[#071012] font-black text-xs transition-all shadow-md shadow-pink/20 cursor-pointer"
                  >
                    Set Location
                  </button>
                </div>
              </form>

              {/* Popular Bengaluru Areas */}
              <div className="space-y-3 mb-5">
                <div className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink" /> Popular Bengaluru Neighborhoods
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Vijaynagar',
                    'Indiranagar',
                    'Koramangala',
                    'HSR Layout',
                    'Whitefield',
                    'Jayanagar',
                    'JP Nagar',
                    'Malleshwaram',
                    'Rajajinagar',
                    'MG Road',
                    'BTM Layout',
                    'Electronic City',
                    'Banashankari',
                    'Hebbal',
                    'Yelahanka'
                  ].map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => handleSelectNewLocation(area, false)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        activeLocationName.toLowerCase().includes(area.toLowerCase())
                          ? 'bg-pink text-[#071012] border-pink font-black shadow-sm'
                          : 'bg-[#080f11] text-slate-300 border-[#1c292c] hover:border-pink/50 hover:text-white'
                      }`}
                    >
                      📍 {area}
                    </button>
                  ))}
                </div>
              </div>

              {/* Other Major Indian Metros */}
              <div className="space-y-3 mb-6 pt-4 border-t border-[#1c292c]">
                <div className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Other Major Indian Hubs
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Mumbai (Bandra)', query: 'Bandra' },
                    { label: 'Mumbai (Andheri)', query: 'Andheri' },
                    { label: 'Delhi (Cyber Hub)', query: 'Cyber Hub' },
                    { label: 'Delhi (Connaught Place)', query: 'Connaught Place' },
                    { label: 'Hyderabad (HITEC City)', query: 'HITEC City' },
                    { label: 'Hyderabad (Banjara Hills)', query: 'Banjara Hills' },
                    { label: 'Pune (Koregaon Park)', query: 'Koregaon Park' },
                    { label: 'Pune (Hinjewadi)', query: 'Hinjewadi' },
                    { label: 'Chennai (T. Nagar)', query: 'T Nagar' },
                    { label: 'Kolkata', query: 'Kolkata' },
                    { label: 'Ahmedabad', query: 'Ahmedabad' },
                    { label: 'Goa', query: 'Goa' },
                    { label: 'Kochi', query: 'Kochi' }
                  ].map((city) => (
                    <button
                      key={city.label}
                      type="button"
                      onClick={() => handleSelectNewLocation(city.query, false)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        activeLocationName.toLowerCase().includes(city.query.toLowerCase())
                          ? 'bg-pink text-[#071012] border-pink font-black shadow-sm'
                          : 'bg-[#080f11] text-slate-300 border-[#1c292c] hover:border-pink/50 hover:text-white'
                      }`}
                    >
                      {city.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions: Save Default & Reset */}
              <div className="pt-4 border-t border-[#1c292c] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                {creatorProfile.area && (
                  <button
                    type="button"
                    onClick={() => {
                      const p = creatorProfile;
                      handleSelectNewLocation(p.area || p.city || 'Bengaluru', false);
                    }}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Reset to Profile Location ({creatorProfile.area || creatorProfile.city})
                  </button>
                )}
                <button
                  type="button"
                  disabled={savingDefaultLocation}
                  onClick={() => handleSelectNewLocation(activeLocationName, true)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-pink/15 hover:bg-pink/25 border border-pink/40 text-pink font-bold transition-all cursor-pointer"
                >
                  {savingDefaultLocation ? 'Saving to Profile...' : `💾 Save "${activeLocationName}" as My Profile Default`}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
