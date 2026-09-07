import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Sparkles,
  ArrowRight,
  MapPin,
  ShieldCheck,
  Zap,
  Users,
  Building2,
  CheckCircle2,
  TrendingUp,
  Award,
  Clock,
  BarChart3,
  Bot,
  Compass,
  DollarSign,
  HeartHandshake,
  Check,
  ChevronDown,
  Star,
  Layers,
  Send,
  ExternalLink
} from 'lucide-react';
import { Instagram } from '../components/icons/InstagramIcon';

export const LandingPage: React.FC = () => {
  const [featuredCampaigns, setFeaturedCampaigns] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'creator' | 'brand'>('creator');
  const [heroPreviewTab, setHeroPreviewTab] = useState<'creator' | 'brand'>('creator');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await api.getCampaigns({ limit: '3' });
        if (res.success && res.campaigns) {
          setFeaturedCampaigns(res.campaigns.slice(0, 3));
        }
      } catch (err) {
        console.warn('Could not load featured briefs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const stats = [
    { value: '₹2.4M+', label: 'Escrow Volume Protected', sub: 'Zero payout risk' },
    { value: '< 3.5 km', label: 'Average Proximity Radius', sub: 'Real foot traffic' },
    { value: '100%', label: 'Meta API Provenance', sub: 'No scraped vanity stats' },
    { value: '94%', label: 'Deliverable Approval Rate', sub: 'Verified completion' }
  ];

  const faqs = [
    {
      q: 'How does Escrow Protection work for brands and creators?',
      a: 'When a brand initiates a direct pitch or approves a creator application, the agreed campaign budget is immediately held in simulated escrow. Funds are securely locked before any content creation begins and released instantly to the creator once deliverable proof is submitted and reviewed.'
    },
    {
      q: 'How is hyperlocal proximity calculated?',
      a: 'CreatorHub computes real-time geospatial coordinates using the Haversine spherical algorithm. Brands define exact radius zones (1km to 25km), and creators within that precise footprint receive discovery priority, ensuring genuine neighborhood influence.'
    },
    {
      q: 'Why does CreatorHub use official Meta Graph API instead of web scraping?',
      a: 'Scraping is inaccurate, prone to breaking, and exposes accounts to security bans. We connect directly through official Meta OAuth, pulling real-time followers, reach, impression benchmarks, and verified engagement rates without ever storing creator passwords.'
    },
    {
      q: 'How do creators submit content proof for brand review?',
      a: 'Once content goes live on Instagram, creators paste the verified post or Reel URL along with reach metrics into CreatorHub. Brands inspect the live deliverable directly in-app and can approve with a single click to trigger automated escrow payout.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-zinc-700 selection:text-white relative overflow-hidden font-sans">
      {/* Architectural Background Grid & Ambient Lighting */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a12_1px,transparent_1px),linear-gradient(to_bottom,#27272a12_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[380px] bg-zinc-700/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute top-96 right-1/4 w-[500px] h-[300px] bg-zinc-800/15 blur-[140px] rounded-full pointer-events-none" />

      {/* Top Announcement Bar */}
      <div className="relative z-10 bg-zinc-900/70 backdrop-blur-md border-b border-zinc-800/80 px-4 py-2 text-center text-xs font-medium text-zinc-400">
        <div className="inline-flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-zinc-300 font-semibold">Real Data Provenance</span>
          <span className="text-zinc-600">·</span>
          <span>Official Meta Graph API</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-300">Escrow Protected Payouts</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300 font-medium text-xs mb-8 shadow-sm hover:border-zinc-700 transition-colors">
              <Compass className="w-3.5 h-3.5 text-zinc-400" />
              <span>Hyperlocal Influencer Collaboration Platform</span>
              <span className="text-zinc-600">|</span>
              <span className="text-emerald-400 font-semibold">100% Escrow Guard</span>
            </div>

            {/* Headline with High-End Silvery Titanium Gradient */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-6">
              Where Local Brands Meet{' '}
              <span className="bg-gradient-to-b from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Neighborhood Creators
              </span>.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
              Connect nearby cafes, gyms, and retail brands with authentic local influencers.
              Powered by verified Instagram metrics, Haversine radius precision, and guaranteed escrow payments.
            </p>

            {/* High-Contrast Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <Link
                to="/creator/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-sm shadow-[0_0_25px_rgba(255,255,255,0.12)] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Users className="w-4 h-4 text-zinc-900" /> Join as Creator
                <ArrowRight className="w-4 h-4 text-zinc-900" />
              </Link>
              <Link
                to="/brand/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all hover:text-white"
              >
                <Building2 className="w-4 h-4 text-zinc-400" /> Launch Brand Brief
                <ArrowRight className="w-4 h-4 text-zinc-400" />
              </Link>
            </div>

            {/* Trust Markers Bar */}
            <div className="pt-6 border-t border-zinc-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-zinc-400">
              <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Escrow Fund Protection
              </div>
              <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
                <MapPin className="w-4 h-4 text-zinc-300" /> Haversine Radius Match
              </div>
              <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
                <Instagram className="w-4 h-4 text-zinc-300" /> Meta Graph API Synced
              </div>
              <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
                <Bot className="w-4 h-4 text-zinc-300" /> AI Collaboration Score
              </div>
            </div>
          </div>

          {/* Interactive Live Product Showcase (App Mockup) */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-2xl p-4 sm:p-7 backdrop-blur-xl relative overflow-hidden">
              {/* Window Controls Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <span className="ml-2 text-xs font-mono text-zinc-400 font-semibold tracking-wide uppercase">
                    Live Collaboration Engine
                  </span>
                </div>

                {/* Interactive Toggle */}
                <div className="inline-flex p-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
                  <button
                    onClick={() => setHeroPreviewTab('creator')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      heroPreviewTab === 'creator'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Creator Experience
                  </button>
                  <button
                    onClick={() => setHeroPreviewTab('brand')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      heroPreviewTab === 'brand'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Brand Experience
                  </button>
                </div>
              </div>

              {/* Showcase Content: Creator View */}
              {heroPreviewTab === 'creator' ? (
                <div className="pt-6">
                  <div className="bg-zinc-950 rounded-xl p-5 border border-zinc-800/80">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Direct Pitch Received
                          </span>
                          <span className="text-xs text-zinc-500">24 mins ago</span>
                        </div>
                        <h3 className="text-lg font-bold text-white">Artisan Roast & Brew · Weekend Specialty Launch</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">Indiranagar 100ft Road · 1.4 km from your home neighborhood</p>
                      </div>
                      <div className="text-right sm:border-l sm:border-zinc-800 sm:pl-6">
                        <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Guaranteed Reward</div>
                        <div className="text-2xl font-black text-white font-mono">₹8,500</div>
                        <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 justify-end">
                          <ShieldCheck className="w-3.5 h-3.5" /> Held in Escrow
                        </div>
                      </div>
                    </div>

                    {/* Step Progress Visual */}
                    <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 mb-4">
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="border-b-2 border-emerald-400 pb-1.5 font-semibold text-emerald-300">
                          1. Offer Accepted
                        </div>
                        <div className="border-b-2 border-zinc-400 pb-1.5 font-semibold text-zinc-200">
                          2. Creating Content
                        </div>
                        <div className="border-b-2 border-zinc-700 pb-1.5 font-medium text-zinc-500">
                          3. Submit Proof
                        </div>
                        <div className="border-b-2 border-zinc-700 pb-1.5 font-medium text-zinc-500">
                          4. Escrow Released
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-zinc-400">
                        Deliverables: <span className="text-zinc-200 font-medium">1x 60s Reel, 2x Stories with Geotag</span>
                      </div>
                      <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <span className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 font-medium text-xs">
                          Chat in Messages
                        </span>
                        <span className="px-4 py-1.5 rounded-lg bg-white text-zinc-950 font-semibold text-xs flex items-center gap-1.5 shadow-sm">
                          Submit Content Proof <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Showcase Content: Brand View */
                <div className="pt-6">
                  <div className="bg-zinc-950 rounded-xl p-5 border border-zinc-800/80">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold text-lg">
                          AS
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white">Aarav Sharma</h3>
                            <span className="text-xs text-zinc-400 font-mono">@aarav.eats</span>
                            <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300 font-semibold">
                              Meta Verified
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">Food, Cafe Culture & Bengaluru Lifestyle</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                          <div className="text-[10px] text-zinc-500 uppercase font-semibold">Proximity</div>
                          <div className="text-xs font-bold text-zinc-200">1.8 km away</div>
                        </div>
                        <div className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                          <div className="text-[10px] text-zinc-500 uppercase font-semibold">AI Match Score</div>
                          <div className="text-xs font-bold text-emerald-400">94% High Fit</div>
                        </div>
                      </div>
                    </div>

                    {/* Verified Instagram Metrics Strip */}
                    <div className="grid grid-cols-3 gap-3 p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 mb-4 text-center">
                      <div>
                        <div className="text-xs text-zinc-500">Instagram Followers</div>
                        <div className="text-lg font-black text-white font-mono">48.2K</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Engagement Rate</div>
                        <div className="text-lg font-black text-emerald-400 font-mono">4.9%</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Avg Reel Reach</div>
                        <div className="text-lg font-black text-white font-mono">82.5K</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Audience verified: 78% resides within 10km of Bengaluru Central
                      </div>
                      <span className="px-4 py-1.5 rounded-lg bg-white text-zinc-950 font-semibold text-xs flex items-center gap-1.5 shadow-sm">
                        <Send className="w-3.5 h-3.5 text-zinc-900" /> Direct Pitch Creator
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Metrics & Impact Strip */}
      <section className="py-12 border-y border-zinc-800/80 bg-zinc-950/70 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-center hover:border-zinc-700 transition-colors">
                <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight mb-1">
                  {s.value}
                </div>
                <div className="text-xs font-semibold text-zinc-300 mb-1">{s.label}</div>
                <div className="text-[11px] text-zinc-500">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The 3-Pillar Hyperlocal Collaboration Engine */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
            The Engine
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Hyperlocal Collaboration Architecture
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Eliminating guesswork with physical location verification, transparent escrow locking, and direct creator communication.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Brand Briefs */}
          <div className="p-7 rounded-2xl bg-zinc-900/50 border border-zinc-800/90 hover:border-zinc-700 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 mb-5">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Local Brand Briefs</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Define exact geographic radius filters, deliverable specs, and guaranteed escrow rewards. No vague expectations.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-zinc-300">100% Escrow Guarded</span>
              <span className="font-mono text-zinc-500">01</span>
            </div>
          </div>

          {/* Card 2: Haversine Radar Match */}
          <div className="p-7 rounded-2xl bg-zinc-900/50 border border-zinc-800/90 hover:border-zinc-700 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 mb-5">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Haversine Distance Radar</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Calculates precise kilometer distances between brand storefronts and creator home turf to drive genuine neighborhood foot traffic.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-zinc-300">1km – 25km Precision</span>
              <span className="font-mono text-zinc-500">02</span>
            </div>
          </div>

          {/* Card 3: Meta-Verified Creators */}
          <div className="p-7 rounded-2xl bg-zinc-900/50 border border-zinc-800/90 hover:border-zinc-700 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 mb-5">
                <Instagram className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Meta-Verified Analytics</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Real engagement, audience geography, and reach benchmarks ingested via official Meta Graph APIs with zero web scraping.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-zinc-300">OAuth Provenance</span>
              <span className="font-mono text-zinc-500">03</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Active Campaigns (Neighborhood Opportunities) */}
      <section className="py-20 border-t border-zinc-800/80 bg-zinc-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
                Live Brand Briefs
              </div>
              <h2 className="text-3xl font-black text-white">Active Neighborhood Opportunities</h2>
            </div>
            <Link
              to="/creator/register"
              className="mt-4 sm:mt-0 font-semibold text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 group"
            >
              Explore All Briefs <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 rounded-2xl bg-zinc-900/60 animate-pulse border border-zinc-800" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCampaigns.map(camp => (
                <div
                  key={camp.id}
                  className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 overflow-hidden bg-zinc-800">
                      <img
                        src={camp.image_url}
                        alt={camp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-medium text-zinc-300 border border-zinc-800">
                        {camp.category}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-zinc-950/90 backdrop-blur-md px-3 py-1 rounded-xl text-sm font-black text-white font-mono border border-zinc-800">
                        ₹{camp.reward_per_creator?.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <img src={camp.brand_logo} alt={camp.brand_name} className="w-5 h-5 rounded-full object-cover" />
                        <span className="text-xs font-semibold text-zinc-300">{camp.brand_name}</span>
                      </div>
                      <h3 className="font-bold text-white text-base mb-2 group-hover:text-zinc-200 transition-colors line-clamp-1">
                        {camp.title}
                      </h3>
                      <p className="text-zinc-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                        {camp.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-zinc-800/70 flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{camp.location_name || camp.city}</span>
                    </div>
                    <Link
                      to="/creator/register"
                      className="font-semibold text-white hover:text-zinc-200 flex items-center gap-1"
                    >
                      Apply <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works (Minimalist Numbered Flow) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
            Workflow Transparency
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-6">
            How CreaterHub Works
          </h2>

          {/* Toggle Switch */}
          <div className="inline-flex p-1 bg-zinc-900 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('creator')}
              className={`px-6 py-2 rounded-lg font-semibold text-xs transition-all ${
                activeTab === 'creator'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              For Creators
            </button>
            <button
              onClick={() => setActiveTab('brand')}
              className={`px-6 py-2 rounded-lg font-semibold text-xs transition-all ${
                activeTab === 'brand'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              For Brands
            </button>
          </div>
        </div>

        {activeTab === 'creator' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Create Creator Profile', desc: 'Sign up with bio, content categories, minimum rate card, and home neighborhood coordinates.' },
              { step: '02', title: 'Connect Instagram Profile', desc: 'Securely authenticate via official Meta OAuth. Real engagement metrics, zero passwords stored.' },
              { step: '03', title: 'Discover Nearby Briefs', desc: 'Browse neighborhood brand campaigns filtered by physical radius (1km to 25km) and niche fit.' },
              { step: '04', title: 'Receive Direct Pitches', desc: 'Accept direct collaboration offers from local business owners with guaranteed escrow budgets.' },
              { step: '05', title: 'Submit Live Content Proof', desc: 'Publish your Instagram Reel or Story, then upload the live URL directly in-app for brand review.' },
              { step: '06', title: 'Instant Escrow Release', desc: 'Receive your payout immediately into your balance upon approval, build reviews, and level up.' }
            ].map(s => (
              <div key={s.step} className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 hover:border-zinc-700 transition-all">
                <div className="text-xl font-black text-zinc-500 mb-3 font-mono">{s.step}</div>
                <h3 className="font-bold text-white text-base mb-1.5">{s.title}</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Register Local Store', desc: 'Set up your retail outlet, cafe, salon, or fitness gym with exact map coordinates.' },
              { step: '02', title: 'Publish Campaign Brief', desc: 'Specify deliverable requirements, budget, timeline, and maximum proximity radius.' },
              { step: '03', title: 'Discover Verified Creators', desc: 'Browse nearby creators ranked by distance, verified engagement rate, and AI Match Score.' },
              { step: '04', title: 'Direct Pitch or Review Applications', desc: 'Send direct collaboration offers with escrow funds locked immediately upon initiation.' },
              { step: '05', title: 'Inspect Submitted Proof', desc: 'Review the live Instagram deliverable submitted by the creator with reach metrics.' },
              { step: '06', title: 'Approve & Release Funds', desc: 'Approve deliverable with one click to release payment, post verified reviews, and track ROI.' }
            ].map(s => (
              <div key={s.step} className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 hover:border-zinc-700 transition-all">
                <div className="text-xl font-black text-zinc-500 mb-3 font-mono">{s.step}</div>
                <h3 className="font-bold text-white text-base mb-1.5">{s.title}</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Verified Local Testimonials / Social Proof */}
      <section className="py-20 border-y border-zinc-800/80 bg-zinc-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
              Social Proof
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Trusted by Local Brands & Creators
            </h2>
            <p className="text-zinc-400 text-sm">
              Real partnerships creating tangible neighborhood customer reach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: 'Being able to pitch creators who live within 2km of our cafe brought authentic foot traffic on launch weekend. The escrow feature made it zero risk.',
                author: 'Rohan Mehta',
                role: 'Founder, Third Wave Artisans',
                location: 'Indiranagar, Bengaluru'
              },
              {
                quote: 'I love that brand budgets are held in escrow before I even start recording. I submit my live Reel link in-app and get paid right after approval.',
                author: 'Priya Kulkarni',
                role: 'Lifestyle Creator (48k Followers)',
                location: 'Koramangala, Bengaluru'
              },
              {
                quote: 'Official Meta stats eliminated influencers with purchased vanity followings. We saw a 3.4x return on our promotional spend across 5 local creators.',
                author: 'Vikram Sen',
                role: 'Marketing Lead, Peak Fitness',
                location: 'HSR Layout, Bengaluru'
              }
            ].map((t, idx) => (
              <div key={idx} className="p-7 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-zinc-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-zinc-300 text-zinc-300" />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed italic mb-6">
                    "{t.quote}"
                  </p>
                </div>
                <div className="pt-4 border-t border-zinc-800/80">
                  <div className="font-bold text-sm text-white">{t.author}</div>
                  <div className="text-xs text-zinc-400">{t.role}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">{t.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Architecture & FAQ Accordion */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">
            Clear Answers, Zero Guesswork
          </h2>
          <p className="text-zinc-400 text-sm">
            Everything you need to know about safety, verification, and payments.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-white hover:text-zinc-200"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-zinc-900/90 p-10 sm:p-16 rounded-3xl border border-zinc-800 text-center relative overflow-hidden shadow-2xl">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
                Ready to Build Local Partnerships?
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-8">
                Join verified local businesses and creators driving genuine neighborhood influence with full escrow safety.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/creator/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  Join as Creator <ArrowRight className="w-4 h-4 text-zinc-950" />
                </Link>
                <Link
                  to="/brand/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all hover:text-white"
                >
                  Join as Brand <ArrowRight className="w-4 h-4 text-zinc-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
