import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Sparkles,
  ArrowRight,
  MapPin,
  ShieldCheck,
  ChevronDown,
  Search,
  CheckCircle2,
  Lock,
  Layers,
  Users,
  Building2,
  Instagram
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [featuredCampaigns, setFeaturedCampaigns] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await api.getCampaigns({ limit: '3' });
        if (res.success && res.campaigns && res.campaigns.length > 0) {
          setFeaturedCampaigns(res.campaigns.slice(0, 3));
        }
      } catch (err) {
        console.warn('Could not load live campaigns:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const fallbackCampaigns = [
    {
      id: 1,
      title: 'Glow Naturally',
      business_name: 'Skincare Brand',
      category: 'Beauty',
      budget: 25000,
      deliverables_summary: '3–5 Posts',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=85'
    },
    {
      id: 2,
      title: 'Move Better',
      business_name: 'Fitness Brand',
      category: 'Fitness',
      budget: 15000,
      deliverables_summary: '1–3 Reels',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=700&q=85'
    },
    {
      id: 3,
      title: 'Explore More',
      business_name: 'Travel Brand',
      category: 'Travel',
      budget: 40000,
      deliverables_summary: '1–2 Videos',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=700&q=85'
    }
  ];

  const displayCampaigns = featuredCampaigns.length > 0 ? featuredCampaigns : fallbackCampaigns;

  const faqs = [
    {
      q: 'How does CreatorHub work for brands and creators?',
      a: 'CreatorHub connects local brands with verified neighborhood creators based on precise geographic coordinates (Haversine formula), content categories, and real Meta Graph API metrics. Brands create campaign briefs or direct pitches, lock funds in escrow, and creators submit proof before payout.'
    },
    {
      q: 'How do I verify a creator on CreatorHub?',
      a: 'All creators connect via official Meta Graph API OAuth. We verify real follower counts, average reach, and engagement rates directly from Instagram with zero synthetic or scraped data.'
    },
    {
      q: 'What types of campaigns are available?',
      a: 'Brands can launch hyperlocal outlet briefs, product seeding campaigns, event visits, and custom content deliverables (Instagram Reels, Carousels, and Stories) tailored for 1 km to 25 km target radii.'
    },
    {
      q: 'How is payment handled on the platform?',
      a: 'Payments are backed by an automated Escrow Guard. When a brand approves a pitch or application, the budget is held securely in escrow and released to the creator immediately upon proof validation and approval.'
    },
    {
      q: 'Can I work with creators outside my city?',
      a: 'Yes! While CreatorHub excels at hyperlocal radius discovery for neighborhood businesses, brands can also run city-wide or nationwide digital influencer campaigns.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#071012] text-white selection:bg-pink selection:text-[#181012] overflow-x-hidden font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-0 lg:pb-24 lg:pt-16">
        <div>
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-pink">
            Connect · Collaborate · Grow
          </p>
          <h1 className="max-w-xl text-balance font-heading text-5xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl text-white">
            Where Local Brands Meet Neighborhood <span className="text-pink">Creators.</span>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-6 text-muted">
            CreatorHub connects ambitious brands with creators who can bring their stories to life.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/creator/feed"
              className="rounded-full bg-pink px-6 py-3 text-[11px] font-semibold text-[#181012] hover:bg-[#ff4d79] transition flex items-center shadow-lg"
            >
              Explore Creators
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
            <Link
              to="/brand/register"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-[11px] font-semibold transition hover:border-pink hover:text-pink"
            >
              Work With Brands
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Hero Right: Layered Creator Photos & Floating Badges */}
        <div className="relative min-h-[380px] sm:min-h-[420px] select-none">
          {/* Layer 1: Left Rotated */}
          <div className="absolute left-[14%] top-4 h-52 w-36 rotate-[-4deg] overflow-hidden rounded-md border-4 border-[#071012] shadow-2xl sm:h-64 sm:w-44 transition-transform hover:rotate-0 duration-300">
            <img
              alt="Creator portrait"
              className="object-cover h-full w-full"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=85"
            />
          </div>

          {/* Layer 2: Main Center Photo */}
          <div className="absolute left-[28%] top-8 h-72 w-56 overflow-hidden rounded-md border-4 border-[#071012] shadow-2xl sm:h-80 sm:w-64 z-10 transition-transform hover:scale-105 duration-300">
            <img
              alt="Fashion creator"
              className="object-cover h-full w-full"
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85"
            />
          </div>

          {/* Layer 3: Top Right Coffee */}
          <div className="absolute right-[4%] top-0 h-40 w-28 overflow-hidden rounded-md border-4 border-[#071012] shadow-xl sm:h-48 sm:w-36">
            <img
              alt="Coffee campaign"
              className="object-cover h-full w-full"
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=85"
            />
          </div>

          {/* Layer 4: Bottom Left Shoes */}
          <div className="absolute bottom-6 left-[2%] h-28 w-32 overflow-hidden rounded-md border-4 border-[#071012] shadow-xl sm:h-32 sm:w-40 z-20">
            <img
              alt="Travel shoes"
              className="object-cover h-full w-full"
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=700&q=85"
            />
          </div>

          {/* Layer 5: Bottom Right Lifestyle */}
          <div className="absolute bottom-10 right-[4%] h-44 w-36 overflow-hidden rounded-md border-4 border-[#071012] shadow-xl sm:h-52 sm:w-44 z-20">
            <img
              alt="Lifestyle creator"
              className="object-cover h-full w-full"
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=85"
            />
          </div>

          {/* Floating Metric Badge 1 */}
          <div className="absolute right-0 top-24 rounded-md border border-white/20 bg-[#10191a]/95 backdrop-blur-md px-4 py-3 text-[10px] shadow-2xl z-30 animate-in fade-in slide-in-from-right-4 duration-500">
            <span className="text-muted font-medium">Brand Campaign</span>
            <b className="mt-1.5 flex items-center justify-between text-white text-xs font-bold">
              <span>Skincare</span>
              <span className="text-pink ml-6 font-mono">₹ 25,000</span>
            </b>
          </div>

          {/* Floating Metric Badge 2 */}
          <div className="absolute bottom-20 left-10 rounded-md border border-white/20 bg-[#10191a]/95 backdrop-blur-md px-3.5 py-2.5 text-[11px] shadow-2xl z-30 flex items-center gap-2">
            <span className="text-pink font-bold text-xs">12.4%</span>
            <span className="text-muted text-[10px]">Avg. Engagement</span>
          </div>
        </div>
      </section>

      {/* 2. THE CREATORHUB EXPERIENCE / ABOUT MOSAIC */}
      <section id="about" className="border-y border-white/10 bg-[#071012]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_1fr_170px] lg:px-0 items-center">
          {/* 6-Photo Mosaic Grid */}
          <div className="grid grid-cols-3 gap-1.5 rounded-lg overflow-hidden border border-white/10">
            <img alt="Creator" className="object-cover h-40 sm:h-48 w-full hover:scale-105 transition duration-300" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=85" />
            <img alt="Coffee" className="object-cover h-40 sm:h-48 w-full hover:scale-105 transition duration-300" src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=85" />
            <img alt="Fitness" className="object-cover h-40 sm:h-48 w-full hover:scale-105 transition duration-300" src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=700&q=85" />
            <img alt="Beauty" className="object-cover h-40 sm:h-48 w-full hover:scale-105 transition duration-300" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=85" />
            <img alt="Fashion" className="object-cover h-40 sm:h-48 w-full hover:scale-105 transition duration-300" src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85" />
            <img alt="Travel" className="object-cover h-40 sm:h-48 w-full hover:scale-105 transition duration-300" src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=700&q=85" />
          </div>

          {/* Experience Copy */}
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-pink">
              The CreatorHub Experience
            </p>
            <h2 className="font-heading text-3xl font-semibold leading-tight text-white">
              Meet the people behind the influence.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted">
              From emerging local voices to established creators, discover people who connect with your audience in meaningful ways.
            </p>
            <Link to="/creator/feed" className="mt-6 text-xs font-semibold text-pink hover:text-[#ff4d79] transition flex items-center">
              Explore Creators <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Vertical Pillar List */}
          <div className="hidden border-l border-pink/40 pl-7 lg:block">
            <div className="space-y-6 text-[11px] text-muted">
              <p>
                <span className="text-pink">◉</span> <span className="ml-1 text-white font-semibold">Fashion</span><br />
                <span className="ml-4 text-muted">Creators</span>
              </p>
              <p>
                <span className="text-pink">◉</span> <span className="ml-1 text-white font-semibold">Food</span><br />
                <span className="ml-4 text-muted">Creators</span>
              </p>
              <p>
                <span className="text-pink">◉</span> <span className="ml-1 text-white font-semibold">Fitness</span><br />
                <span className="ml-4 text-muted">Creators</span>
              </p>
              <p>
                <span className="text-pink">◉</span> <span className="ml-1 text-white font-semibold">Lifestyle</span><br />
                <span className="ml-4 text-muted">Creators</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOR BRANDS / FEATURED CREATORS */}
      <section id="creators" className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.7fr_1.7fr] lg:px-0">
        <div>
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-pink">
            For Brands
          </p>
          <h2 className="font-heading text-3xl font-semibold leading-tight text-white">
            Find the right voice for your brand.
          </h2>
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted">
            CreatorHub helps brands discover creators based on your goals, audience, location, and content category.
          </p>
          <Link to="/creator/feed" className="mt-6 inline-flex items-center text-xs font-semibold text-pink hover:text-[#ff4d79] transition">
            View All Creators <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 3 Creator Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Creator 1 */}
          <article className="overflow-hidden rounded-md border border-white/15 bg-[#0c1416] card-hover">
            <div className="relative h-44">
              <img
                alt="Riya Sharma"
                className="object-cover h-full w-full"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=85"
              />
              <span className="absolute right-2.5 top-2.5 rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-black shadow-sm">
                Lifestyle
              </span>
            </div>
            <div className="p-4">
              <h3 className="text-xs font-bold text-white">Riya Sharma</h3>
              <p className="mt-0.5 text-[10px] text-muted">Bengaluru, India</p>
              <div className="mt-3.5 flex gap-8 text-[9px] text-muted border-t border-white/10 pt-3">
                <span><b className="block text-white text-xs font-bold">48K</b>Followers</span>
                <span><b className="block text-pink text-xs font-bold">6.8%</b>Engagement</span>
              </div>
              <Link
                to="/creator/feed"
                className="mt-3.5 block text-center rounded-full border border-white/25 py-1.5 text-[10px] font-semibold text-white hover:border-pink hover:text-pink transition"
              >
                View Profile <ArrowRight className="ml-1 inline h-2.5 w-2.5" />
              </Link>
            </div>
          </article>

          {/* Creator 2 */}
          <article className="overflow-hidden rounded-md border border-white/15 bg-[#0c1416] card-hover">
            <div className="relative h-44">
              <img
                alt="Arjun Mehta"
                className="object-cover h-full w-full"
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=700&q=85"
              />
              <span className="absolute right-2.5 top-2.5 rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-black shadow-sm">
                Fitness
              </span>
            </div>
            <div className="p-4">
              <h3 className="text-xs font-bold text-white">Arjun Mehta</h3>
              <p className="mt-0.5 text-[10px] text-muted">Mumbai, India</p>
              <div className="mt-3.5 flex gap-8 text-[9px] text-muted border-t border-white/10 pt-3">
                <span><b className="block text-white text-xs font-bold">120K</b>Followers</span>
                <span><b className="block text-pink text-xs font-bold">5.2%</b>Engagement</span>
              </div>
              <Link
                to="/creator/feed"
                className="mt-3.5 block text-center rounded-full border border-white/25 py-1.5 text-[10px] font-semibold text-white hover:border-pink hover:text-pink transition"
              >
                View Profile <ArrowRight className="ml-1 inline h-2.5 w-2.5" />
              </Link>
            </div>
          </article>

          {/* Creator 3 */}
          <article className="overflow-hidden rounded-md border border-white/15 bg-[#0c1416] card-hover">
            <div className="relative h-44">
              <img
                alt="Neha Kapoor"
                className="object-cover h-full w-full"
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=85"
              />
              <span className="absolute right-2.5 top-2.5 rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-black shadow-sm">
                Beauty
              </span>
            </div>
            <div className="p-4">
              <h3 className="text-xs font-bold text-white">Neha Kapoor</h3>
              <p className="mt-0.5 text-[10px] text-muted">Delhi, India</p>
              <div className="mt-3.5 flex gap-8 text-[9px] text-muted border-t border-white/10 pt-3">
                <span><b className="block text-white text-xs font-bold">92K</b>Followers</span>
                <span><b className="block text-pink text-xs font-bold">7.1%</b>Engagement</span>
              </div>
              <Link
                to="/creator/feed"
                className="mt-3.5 block text-center rounded-full border border-white/25 py-1.5 text-[10px] font-semibold text-white hover:border-pink hover:text-pink transition"
              >
                View Profile <ArrowRight className="ml-1 inline h-2.5 w-2.5" />
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* 4. FEATURED CAMPAIGNS */}
      <section id="campaigns" className="border-y border-white/10 bg-[#071012]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.7fr_1.7fr] lg:px-0">
          <div>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-pink">
              Featured Campaigns
            </p>
            <h2 className="font-heading text-3xl font-semibold leading-tight text-white">
              Opportunities worth creating for.
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted">
              Explore active campaigns from leading brands and find the perfect match for your content and audience.
            </p>
            <Link to="/creator/feed" className="mt-6 inline-flex items-center text-xs font-semibold text-pink hover:text-[#ff4d79] transition">
              View All Campaigns <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </div>

          {/* 3 Campaign Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            {displayCampaigns.map((c, idx) => (
              <article key={c.id || idx} className="overflow-hidden rounded-md border border-white/15 bg-[#0c1416] card-hover">
                <div className="relative h-36">
                  <img
                    alt={c.title}
                    className="object-cover h-full w-full"
                    src={c.image || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=85'}
                  />
                  <span className="absolute right-2.5 top-2.5 rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-black shadow-sm">
                    {c.category || 'Retail'}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-xs font-bold text-white truncate">{c.title}</h3>
                  <p className="mt-0.5 text-[10px] text-muted truncate">{c.business_name || c.brand_name || 'Verified Outlet'}</p>
                  <div className="mt-3 flex gap-6 text-[9px] text-muted border-t border-white/10 pt-3">
                    <span>
                      <b className="block text-pink text-xs font-bold">₹{Number(c.budget || 15000).toLocaleString('en-IN')}</b>
                      Budget
                    </span>
                    <span>
                      <b className="block text-white text-xs font-bold">{c.deliverables_summary || '1–3 Deliverables'}</b>
                      Deliverables
                    </span>
                  </div>
                  <Link
                    to="/creator/feed"
                    className="mt-3.5 block text-center rounded-full border border-white/25 py-1.5 text-[10px] font-semibold text-white hover:border-pink hover:text-pink transition"
                  >
                    Apply Now <ArrowRight className="ml-1 inline h-2.5 w-2.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS / SOCIAL PROOF */}
      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-0">
        <div className="grid gap-8 border-b border-white/10 pb-16 md:grid-cols-2">
          {/* Creator Testimonial */}
          <div className="rounded-xl border border-white/10 bg-[#0c1416] p-6">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-pink">
              Creator Story
            </p>
            <div className="flex items-start gap-4">
              <img
                alt="Riya Sharma"
                className="h-12 w-12 rounded-full object-cover border border-white/20 shrink-0"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=85"
              />
              <div>
                <p className="text-sm leading-6 text-white/90 italic">
                  “CreatorHub made it so easy to find brands that actually align with my content. The escrow payout process is super smooth, transparent and fast.”
                </p>
                <p className="mt-3 text-[11px] text-muted font-medium">
                  <span className="text-white font-semibold">Riya Sharma</span> · Lifestyle Creator · 52K followers
                </p>
              </div>
            </div>
          </div>

          {/* Brand Testimonial */}
          <div className="rounded-xl border border-white/10 bg-[#0c1416] p-6">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-pink">
              Brand Story
            </p>
            <div className="flex items-start gap-4">
              <img
                alt="Arjun Nair"
                className="h-12 w-12 rounded-full object-cover border border-white/20 shrink-0"
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=85"
              />
              <div>
                <p className="text-sm leading-6 text-white/90 italic">
                  “We’ve worked with multiple creators through CreatorHub and the foot-traffic results have been amazing. Haversine radius filtering is a game changer for local retail.”
                </p>
                <p className="mt-3 text-[11px] text-muted font-medium">
                  <span className="text-white font-semibold">Arjun Nair</span> · Marketing Manager · Third Wave Coffee
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MID-PAGE CTA BANNER */}
      <section className="relative overflow-hidden border-y border-white/10">
        <img
          alt="Woman wearing sunglasses"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85"
        />
        <div className="absolute inset-0 bg-[#071012]/80 backdrop-blur-xs" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-0">
          <div>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-pink">
              Join CreatorHub
            </p>
            <h2 className="max-w-md font-heading text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Your next collaboration could start here.
            </h2>
            <p className="mt-3 text-sm text-muted max-w-lg">
              Join thousands of creators and local brands building something amazing together with verified metrics and guaranteed escrow payments.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/choose-role"
              className="rounded-full bg-pink px-6 py-3 text-[11px] font-semibold text-[#181012] hover:bg-[#ff4d79] transition flex items-center shadow-lg"
            >
              Get Started <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
            <Link
              to="/creator/feed"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-[11px] font-semibold transition hover:border-pink hover:text-pink"
            >
              Learn More <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. HOW CREATORHUB WORKS */}
      <section className="mx-auto max-w-6xl px-6 py-18 lg:px-0">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-pink">
          How CreatorHub Works
        </p>
        <h2 className="font-heading text-3xl font-semibold text-white">
          Simple steps. Big opportunities.
        </h2>
        <p className="mt-3 max-w-md text-sm text-muted">
          From discovering the right creators to getting paid securely, we make collaborations easy for everyone.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-white/15 bg-[#0c1416] p-6 card-hover">
            <div className="font-heading text-3xl font-bold text-pink font-mono">01</div>
            <h3 className="mt-6 text-sm font-bold text-white">Discover Creators</h3>
            <p className="mt-2 text-xs leading-5 text-muted">
              Find verified creators based on location radius, target audience, and engagement rate.
            </p>
          </div>

          <div className="rounded-xl border border-white/15 bg-[#0c1416] p-6 card-hover">
            <div className="font-heading text-3xl font-bold text-pink font-mono">02</div>
            <h3 className="mt-6 text-sm font-bold text-white">Launch a Campaign</h3>
            <p className="mt-2 text-xs leading-5 text-muted">
              Post your campaign brief or direct pitch with escrow budget and exact deliverable goals.
            </p>
          </div>

          <div className="rounded-xl border border-white/15 bg-[#0c1416] p-6 card-hover">
            <div className="font-heading text-3xl font-bold text-pink font-mono">03</div>
            <h3 className="mt-6 text-sm font-bold text-white">Collaborate</h3>
            <p className="mt-2 text-xs leading-5 text-muted">
              Manage briefs, direct messages, track live progress, and communicate seamlessly in one place.
            </p>
          </div>

          <div className="rounded-xl border border-white/15 bg-[#0c1416] p-6 card-hover">
            <div className="font-heading text-3xl font-bold text-pink font-mono">04</div>
            <h3 className="mt-6 text-sm font-bold text-white">Get Paid Securely</h3>
            <p className="mt-2 text-xs leading-5 text-muted">
              Funds are held safely in escrow and released instantly upon proof review and approval.
            </p>
          </div>
        </div>
      </section>

      {/* 8. TRUST & SECURITY BANNER */}
      <section className="border-y border-white/10 bg-[#0c1416]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-0">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-pink">
              Trust &amp; Security
            </p>
            <h2 className="font-heading text-2xl font-semibold text-white">
              Creative work. Built on trust.
            </h2>
          </div>
          <div className="grid gap-6 text-[11px] text-muted sm:grid-cols-3">
            <div className="flex items-start gap-2.5">
              <span className="text-pink text-base">◉</span>
              <span>
                <b className="text-white block font-semibold">Verified Creator</b>
                <span className="text-muted">Meta OAuth Connected</span>
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-pink text-base">◉</span>
              <span>
                <b className="text-white block font-semibold">Transparent</b>
                <span className="text-muted">Campaign Briefs &amp; Terms</span>
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-pink text-base">◉</span>
              <span>
                <b className="text-white block font-semibold">Secure</b>
                <span className="text-muted">100% Escrow Protection</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section id="faq" className="mx-auto grid max-w-6xl gap-10 px-6 py-18 lg:grid-cols-[0.7fr_1.3fr] lg:px-0">
        <div>
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-pink">
            Frequently Asked Questions
          </p>
          <h2 className="font-heading text-3xl font-semibold text-white">
            Clear Answers, Zero Guesswork
          </h2>
          <p className="mt-3 text-sm text-muted">
            Everything you need to know about CreatorHub, creators, brands, payments, and verified metrics.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="rounded-xl border border-white/10 bg-[#0c1416] overflow-hidden transition-colors">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-4 text-left text-xs font-semibold text-white hover:text-pink transition cursor-pointer"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-pink' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs leading-relaxed text-muted border-t border-white/5 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. FINAL CALL TO ACTION BANNER */}
      <section className="relative overflow-hidden bg-[#10191a] border-t border-white/10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-15" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-0">
          <div>
            <h2 className="font-heading text-3xl font-semibold text-white sm:text-4xl">
              Ready to Build Local Partnerships?
            </h2>
            <p className="mt-3 text-sm text-muted max-w-md">
              Join verified local businesses and creators driving growth through authentic, high-impact collaborations.
            </p>
          </div>
          <div>
            <p className="mb-3 text-[10px] text-muted font-medium">Where is CreatorHub going?</p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/creator/register"
                className="rounded-full bg-pink px-6 py-3 text-[11px] font-semibold text-[#181012] hover:bg-[#ff4d79] transition flex items-center shadow-lg"
              >
                Join as Creator <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
              <Link
                to="/brand/register"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-[11px] font-semibold transition hover:border-pink hover:text-pink"
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

export default LandingPage;
