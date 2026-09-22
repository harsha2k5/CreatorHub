import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { Users, Building2, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export const AuthRoleSelectPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#071012] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-pink/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center justify-center mb-6">
          <Logo size="lg" />
        </Link>

        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-pink mb-2">
          Choose Account Type
        </p>
        <h2 className="text-3xl font-heading font-semibold text-white tracking-tight mb-2">
          How do you want to use CreatorHub?
        </h2>
        <p className="text-xs text-muted max-w-sm mx-auto">
          Select your portal to connect with verified creators or local brands.
        </p>
      </div>

      <div className="mt-10 max-w-3xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Creator Card */}
        <div
          onClick={() => navigate('/creator/register')}
          className="bg-[#0c1416] hover:border-pink/50 border border-white/15 rounded-2xl p-8 cursor-pointer transition-all duration-300 group shadow-xl flex flex-col justify-between card-hover"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#10191a] border border-white/15 flex items-center justify-center text-pink mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-pink" />
            </div>

            <span className="inline-block px-3 py-1 bg-pink/10 text-pink border border-pink/30 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
              For Influencers & Creators
            </span>

            <h3 className="text-xl font-heading font-semibold text-white mb-2">
              I'm a Creator
            </h3>

            <p className="text-muted text-xs leading-relaxed mb-6">
              Find local brand collaborations near your neighborhood. Connect Instagram for verified metrics and unlock instant escrow payouts.
            </p>

            <ul className="space-y-2.5 text-xs text-muted mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pink flex-shrink-0" />
                <span>Geospatial local discovery (1km - 25km radius)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pink flex-shrink-0" />
                <span>Zero fake data — official Meta Graph API sync</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pink flex-shrink-0" />
                <span>100% Escrow protected payouts on deliverables</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-white group-hover:text-pink transition">
            <span>Continue as Creator</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>

        {/* Brand Card */}
        <div
          onClick={() => navigate('/brand/register')}
          className="bg-[#0c1416] hover:border-pink/50 border border-white/15 rounded-2xl p-8 cursor-pointer transition-all duration-300 group shadow-xl flex flex-col justify-between card-hover"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#10191a] border border-white/15 flex items-center justify-center text-pink mb-6 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6 text-pink" />
            </div>

            <span className="inline-block px-3 py-1 bg-pink/10 text-pink border border-pink/30 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
              For Local Businesses
            </span>

            <h3 className="text-xl font-heading font-semibold text-white mb-2">
              I'm a Brand
            </h3>

            <p className="text-muted text-xs leading-relaxed mb-6">
              Find neighborhood creators and grow your business. Launch campaigns, review verified engagement scores, and scale authentic reach.
            </p>

            <ul className="space-y-2.5 text-xs text-muted mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pink flex-shrink-0" />
                <span>Targeted outlet radius & store geo-fencing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pink flex-shrink-0" />
                <span>Multi-factor AI creator matching (0-100% Score)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pink flex-shrink-0" />
                <span>Direct deliverable review & escrow controls</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-white group-hover:text-pink transition">
            <span>Continue as Brand</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-muted relative z-10 flex items-center justify-center gap-4">
        <span>
          Already have an account?{' '}
          <Link to="/creator/login" className="text-white font-bold hover:text-pink transition">
            Sign In
          </Link>
        </span>
        <span>•</span>
        <Link to="/admin/login" className="text-muted hover:text-pink font-semibold flex items-center gap-1 transition">
          <ShieldCheck className="w-3.5 h-3.5 text-pink" /> Admin Portal
        </Link>
      </div>
    </div>
  );
};

export default AuthRoleSelectPage;
