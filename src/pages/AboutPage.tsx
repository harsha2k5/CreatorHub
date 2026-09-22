import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  MapPin,
  Camera,
  Lock,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  Zap,
  Target,
  Award,
  ChevronDown,
  HelpCircle,
  BarChart3,
  Search,
  Send,
  Cpu
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stats = [
    { label: 'Active Creators', value: '10,000+', icon: Users, desc: 'Verified local influencers across India' },
    { label: 'Registered Brands', value: '650+', icon: Building2, desc: 'From local cafes to D2C giants' },
    { label: 'Escrow Protected', value: '₹2.8 Cr+', icon: Lock, desc: '100% secure milestone payouts' },
    { label: 'Campaign Success', value: '99.4%', icon: Award, desc: 'Completed deliverables on time' }
  ];

  const pillars = [
    {
      icon: MapPin,
      title: 'Hyper-Local Radius Match',
      desc: 'Powered by precision Haversine spherical geometry. Brands can filter creators within 1km to 50km of any physical storefront, pop-up outlet, or city hotspot.',
      color: 'from-pink to-rose-500',
      badge: 'Geo-Intelligence'
    },
    {
      icon: Camera,
      title: 'Meta Graph API Real-Time Analytics',
      desc: 'Zero fake numbers. We connect directly with Instagram Graph APIs to extract live follower metrics, authentic engagement rates, impressions, and audience demographics.',
      color: 'from-purple-500 to-indigo-500',
      badge: '100% Verified'
    },
    {
      icon: ShieldCheck,
      title: 'Automated Escrow Guard',
      desc: 'Peace of mind for both parties. Brand budgets are safely locked in escrow when a pitch or application is accepted, and released only upon validated proof approval.',
      color: 'from-emerald-500 to-teal-500',
      badge: 'Zero Risk'
    },
    {
      icon: Cpu,
      title: 'AI Smart Matchmaker & Briefs',
      desc: 'Smart algorithms match campaign briefs with optimal creator archetypes, generate compelling pitch helper drafts, and project campaign ROI metrics.',
      color: 'from-amber-500 to-orange-500',
      badge: 'AI Powered'
    }
  ];

  const faqs = [
    {
      q: 'What makes CreatorHub different from traditional agency models?',
      a: 'Traditional influencer marketing is fragmented, expensive, and plagued by fake follower metrics and payment disputes. CreatorHub offers a self-serve platform backed by real Meta Graph API verification, hyper-local radius discovery, direct in-app pitching, and an automated Escrow Guard that guarantees timely creator payment upon milestone submission.'
    },
    {
      q: 'How does the Haversine radius search work?',
      a: 'When a brand launches a local store campaign, they set a latitude/longitude and kilometer radius (e.g. 5km around Indiranagar, Bengaluru). CreatorHub calculates spherical distances in real-time to surface verified creators living or frequently creating content in that exact neighborhood.'
    },
    {
      q: 'How does the Escrow Payment system protect brands and creators?',
      a: 'When a brand hires a creator or sends a direct pitch, the agreed budget is held securely in escrow. The creator creates content knowing the funds are guaranteed. Once deliverables (e.g. Reel, Story, post link) are submitted and approved, funds are automatically released to the creator.'
    },
    {
      q: 'Are creator metrics authentic?',
      a: 'Yes! Creators connect their Instagram Professional/Creator account via Meta OAuth or link validation. We ingest live insights directly from Meta Graph APIs, giving brands genuine engagement rates, follower counts, and reach metrics.'
    },
    {
      q: 'Can brands send direct pitches to specific creators?',
      a: 'Absolutely. Brands can browse the verified creator directory and send Direct Pitches with custom project briefs, specific deliverables, and proposed budgets. Pitches instantly start a dedicated message conversation and notification flow.'
    }
  ];

  return (
    <div className="bg-[#071012] text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/10 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-pink/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink/10 border border-pink/30 text-pink text-xs font-bold mb-6 animate-in fade-in duration-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Modern Creator Economy Platform</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Bridging Local Brands & Verified Creators with <span className="text-pink">Trust & Escrow</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            CreatorHub is the marketplace where neighborhood outlets, national brands, and verified content creators collaborate seamlessly with hyper-local geo-discovery, real Meta analytics, and automated escrow security.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/choose-role"
              className="px-6 py-3.5 rounded-full bg-pink text-[#181012] font-bold text-xs hover:bg-[#ff4d79] transition shadow-lg shadow-pink/20 flex items-center gap-2"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/creator/feed"
              className="px-6 py-3.5 rounded-full border border-white/20 bg-white/5 text-white font-bold text-xs hover:bg-white/10 transition"
            >
              Explore Discovery Feed
            </Link>
          </div>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <section className="py-12 border-b border-white/10 bg-[#0a1417]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="p-6 rounded-2xl border border-white/10 bg-[#0d1a1d]/60 backdrop-blur-sm hover:border-pink/40 transition">
                  <div className="w-10 h-10 rounded-xl bg-pink/10 border border-pink/20 flex items-center justify-center text-pink mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-heading text-2xl sm:text-3xl font-extrabold text-white">{stat.value}</div>
                  <div className="text-xs font-bold text-white mt-1">{stat.label}</div>
                  <div className="text-[11px] text-muted mt-1 leading-snug">{stat.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-pink">Our Mission</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mt-2 leading-tight">
              Eliminating friction from creator collaborations.
            </h2>
            <p className="mt-4 text-sm text-muted leading-relaxed">
              Every day, thousands of local brands struggle to find genuine influencers near their stores, while creators spend hours chasing unpaid invoices and vague project briefs.
            </p>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              We built CreatorHub to solve both sides of the equation. By integrating live Meta Graph API verification, automated escrow security, and hyper-local radius matching, we turn chaotic influencer outreach into a predictable, transparent growth engine.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero upfront commission — creators keep 100% of their base payout</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Escrow Guard locks campaign budgets before creative work starts</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Direct in-app messaging and milestone deliverable submission</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-[#0e1c20] to-[#081214] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-pink" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-muted ml-2">CreatorHub Lifecycle Architecture</span>
                </div>
                <span className="text-[10px] font-bold text-pink bg-pink/10 px-2 py-0.5 rounded-full border border-pink/30">Active</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="text-[10px] font-bold text-pink uppercase">Step 1 • Discovery</div>
                  <div className="text-xs font-bold text-white">Geo-Radius & Niche Filtering</div>
                  <div className="text-[10px] text-muted">Find creators near Bangalore, Mumbai, Delhi, etc.</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="text-[10px] font-bold text-pink uppercase">Step 2 • Direct Pitch</div>
                  <div className="text-xs font-bold text-white">Targeted Collaboration Offer</div>
                  <div className="text-[10px] text-muted">1-click pitch with custom deliverables & budget</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase">Step 3 • Escrow Lock</div>
                  <div className="text-xs font-bold text-white">100% Protected Funds</div>
                  <div className="text-[10px] text-muted">Secured via automated escrow order verification</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="text-[10px] font-bold text-amber-400 uppercase">Step 4 • Instant Payout</div>
                  <div className="text-xs font-bold text-white">Live Proof Approval</div>
                  <div className="text-[10px] text-muted">Post validation unlocks funds directly to creator</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section className="py-20 border-b border-white/10 bg-[#091316]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[10px] font-bold uppercase tracking-widest text-pink">Core Architecture</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Engineered for Speed, Scale & Authenticity
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-muted">
              Explore the core technologies that make CreatorHub the top choice for modern brands and creators.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-3xl border border-white/10 bg-[#0c181b] hover:border-pink/50 transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center text-pink">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/15 text-slate-300">
                        {pillar.badge}
                      </span>
                    </div>
                    <h3 className="font-heading text-base font-extrabold text-white mb-2">{pillar.title}</h3>
                    <p className="text-xs text-muted leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section id="faq" className="py-20 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[10px] font-bold uppercase tracking-widest text-pink">Got Questions?</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-muted">
              Everything you need to know about navigating the CreatorHub ecosystem.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-[#0c1719] overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between text-sm font-extrabold text-white hover:text-pink transition cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-pink shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-pink' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-xs text-muted leading-relaxed border-t border-white/5 pt-3 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative overflow-hidden bg-[#10191a] border-t border-white/10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-15 pointer-events-none" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-0">
          <div>
            <h2 className="font-heading text-3xl font-semibold text-white sm:text-4xl">
              Ready to experience the future of creator marketing?
            </h2>
            <p className="mt-3 text-sm text-muted max-w-md leading-relaxed">
              Join verified local businesses and creators driving growth through authentic, high-impact collaborations with guaranteed escrow payouts.
            </p>
          </div>
          <div>
            <p className="mb-3 text-[10px] text-muted font-medium">Get started with CreatorHub</p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/creator/register"
                className="rounded-full bg-pink px-6 py-3 text-[11px] font-semibold text-[#181012] hover:bg-[#ff4d79] transition flex items-center shadow-lg cursor-pointer"
              >
                Join as Creator <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
              <Link
                to="/brand/register"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-[11px] font-semibold text-white transition hover:border-pink hover:text-pink hover:bg-white/5 cursor-pointer"
              >
                Join as Brand <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
