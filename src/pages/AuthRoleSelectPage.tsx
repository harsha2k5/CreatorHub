import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Building2, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

export const AuthRoleSelectPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white font-black text-xl shadow-xs group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-zinc-200" />
          </div>
          <span className="text-2xl font-black tracking-tight text-zinc-950">CreaterHub</span>
        </Link>

        <h2 className="text-3xl font-black text-zinc-950 tracking-tight mb-2">
          How do you want to use CreaterHub?
        </h2>
        <p className="text-sm text-zinc-600 max-w-sm mx-auto">
          Choose your account type to get started with tailored collaboration tools.
        </p>
      </div>

      <div className="mt-10 max-w-3xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Creator Card */}
        <div
          onClick={() => navigate('/creator/register')}
          className="bg-white hover:bg-zinc-50/60 border-2 border-zinc-200 hover:border-zinc-400 rounded-3xl p-8 cursor-pointer transition-all duration-300 group shadow-xs hover:shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800 mb-6 group-hover:scale-105 transition-transform">
              <Users className="w-7 h-7 text-zinc-700" />
            </div>

            <span className="inline-block px-3 py-1 bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              For Influencers & Creators
            </span>

            <h3 className="text-2xl font-black text-zinc-950 mb-2 transition-colors">
              I'm a Creator
            </h3>

            <p className="text-zinc-600 text-sm leading-relaxed mb-6">
              Find local brands and collaboration opportunities near your neighborhood. Connect Instagram for verified metrics and unlock paid briefs.
            </p>

            <ul className="space-y-2.5 text-xs text-zinc-600 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-zinc-700 flex-shrink-0" />
                <span>Geospatial local discovery (1km - 25km radius)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-zinc-700 flex-shrink-0" />
                <span>Zero fake data — official Meta Graph API sync</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Protected Escrow payouts upon approved deliverables</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-sm font-bold text-zinc-900 group-hover:text-zinc-950">
            <span>Continue as Creator</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>

        {/* Brand Card */}
        <div
          onClick={() => navigate('/brand/register')}
          className="bg-white hover:bg-zinc-50/60 border-2 border-zinc-200 hover:border-zinc-400 rounded-3xl p-8 cursor-pointer transition-all duration-300 group shadow-xs hover:shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800 mb-6 group-hover:scale-105 transition-transform">
              <Building2 className="w-7 h-7 text-zinc-700" />
            </div>

            <span className="inline-block px-3 py-1 bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              For Local Businesses
            </span>

            <h3 className="text-2xl font-black text-zinc-950 mb-2 transition-colors">
              I'm a Brand
            </h3>

            <p className="text-zinc-600 text-sm leading-relaxed mb-6">
              Find local creators and grow your business. Launch campaigns, review verified engagement scores, and scale authentic word-of-mouth.
            </p>

            <ul className="space-y-2.5 text-xs text-zinc-600 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-zinc-700 flex-shrink-0" />
                <span>Targeted outlet radius & store geo-fencing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-zinc-700 flex-shrink-0" />
                <span>Multi-factor AI creator matching (0-100% Score)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Step-by-step deliverable review & escrow controls</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-sm font-bold text-zinc-900 group-hover:text-zinc-950">
            <span>Continue as Brand</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-zinc-500 relative z-10 flex items-center justify-center gap-4">
        <span>
          Already have an account?{' '}
          <Link to="/creator/login" className="text-zinc-900 font-bold hover:underline">
            Sign In
          </Link>
        </span>
        <span>•</span>
        <Link to="/admin/login" className="text-zinc-500 hover:text-zinc-800 font-semibold flex items-center gap-1 transition-colors">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" /> Admin Portal
        </Link>
      </div>
    </div>
  );
};
