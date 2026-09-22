import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Campaign } from '../types';
import { api } from '../services/api';
import {
  Compass,
  MapPin,
  Search,
  SlidersHorizontal,
  Map as MapIcon,
  List,
  Clock,
  CheckCircle2,
  ArrowRight,
  Flame
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet default marker icon fix
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export const ExploreCampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Filters State
  const [search, setSearch] = useState('');
  const [radius, setRadius] = useState('10');
  const [category, setCategory] = useState('All');
  const [platform, setPlatform] = useState('All');

  const categoriesList = ['All', 'Food & Beverage', 'Fitness & Sports', 'Fashion & Apparel', 'Tech & Lifestyle', 'Beauty & Skincare'];

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.getCampaigns({
        lat: '12.9716',
        lng: '77.5946',
        radius,
        category,
        platform,
        search
      });
      if (res.success) {
        setCampaigns(res.campaigns || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [radius, category, platform]);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-extrabold flex items-center gap-2">
              <Compass className="w-7 h-7 text-blue-600" /> Explore Local Campaigns
            </h1>
            <p className="text-xs text-slate-500 mt-1">Discover brand briefs near your location & apply for sponsored rewards</p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl flex gap-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <List className="w-4 h-4" /> List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'map' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <MapIcon className="w-4 h-4" /> Map View
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by brand name, campaign title, outlet, or location..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchCampaigns()}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Radius Selector */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-xs font-bold whitespace-nowrap">Location Radius:</span>
              <select
                value={radius}
                onChange={e => setRadius(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
              >
                <option value="1">1 km radius</option>
                <option value="5">5 km radius</option>
                <option value="10">10 km radius</option>
                <option value="25">25 km radius</option>
                <option value="50">50 km radius</option>
              </select>
            </div>
          </div>

          {/* Category Chips & Proximity Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Category:
              </span>
              {categoriesList.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    category === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-extrabold border border-blue-200 dark:border-blue-900 shrink-0 flex items-center gap-1 self-start sm:self-auto">
              <MapPin className="w-3 h-3 text-blue-500" />
              {campaigns.length} campaigns within {radius} km
            </span>
          </div>
        </div>

        {/* View Content: List vs Map */}
        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {campaigns.length === 0 ? (
              <div className="col-span-3 text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
                <Compass className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <div className="font-bold text-sm">No campaigns found matching your criteria.</div>
                <div className="text-xs mt-1">Try expanding your location radius or clearing filters.</div>
              </div>
            ) : (
              campaigns.map(camp => (
                <div
                  key={camp.id}
                  onClick={() => navigate(`/campaigns/${camp.id}`)}
                  className="group bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Hero Cover Image */}
                    <div className="relative h-44 overflow-hidden bg-zinc-950 flex items-center justify-center">
                      <img
                        src={camp.image_url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&fit=crop'}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
                      />
                      <img
                        src={camp.image_url || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&fit=crop'}
                        alt={camp.title}
                        className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-500 p-1"
                      />
                      <div className="absolute top-3 left-3 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                        {camp.category}
                      </div>
                      <div className="absolute bottom-3 right-3 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-sm font-black text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
                        ₹{camp.reward_per_creator?.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-5">
                      {/* Brand Header: [Brand Logo] Brand Name ✓ Verified */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={camp.brand_logo || 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=300&auto=format&fit=crop&q=80'}
                            alt={camp.brand_name}
                            className="w-7 h-7 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                          />
                          <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                            {camp.brand_name || 'Verified Brand'}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 flex-shrink-0">
                          <CheckCircle2 className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                          Verified
                        </span>
                      </div>

                      {/* Campaign Title */}
                      <h3 className="font-black text-base text-zinc-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {camp.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
                        {camp.description}
                      </p>

                      {/* Metadata Badges */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-200 font-semibold truncate">
                          <MapPin className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                          <span className="truncate">{camp.location_name || 'Bengaluru'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-200 font-semibold">
                          <Clock className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                          <span>{camp.creators_required || 3} creators needed</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs mt-2">
                    <span className="font-bold text-zinc-500">
                      Escrow Guaranteed
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      View Campaign <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Leaflet Interactive Map View */
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200 dark:border-slate-800 h-[600px] overflow-hidden shadow-lg">
            <MapContainer
              center={[12.9784, 77.6408]}
              zoom={13}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%', borderRadius: '1.25rem' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {campaigns.map(camp => (
                <Marker
                  key={camp.id}
                  position={[camp.lat, camp.lng]}
                  icon={defaultIcon}
                >
                  <Popup>
                    <div className="p-1 min-w-[200px]">
                      <div className="font-bold text-xs text-blue-600 mb-1">{camp.brand_name}</div>
                      <div className="font-extrabold text-sm mb-1">{camp.title}</div>
                      <div className="text-xs font-extrabold text-emerald-600 mb-2">₹{camp.reward_per_creator.toLocaleString()} Reward</div>
                      <button
                        onClick={() => navigate(`/campaigns/${camp.id}`)}
                        className="w-full py-1 bg-blue-600 text-white rounded-lg font-bold text-xs"
                      >
                        Apply Campaign
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
};
