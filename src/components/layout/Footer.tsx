import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Zap, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#09090b] text-zinc-400 border-t border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-white font-bold shadow-sm">
                <Sparkles className="w-4 h-4 text-zinc-200" />
              </div>
              <span className="font-heading font-black text-lg text-white tracking-tight">CreatorHub</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Connecting local businesses with verified creators for geospatial campaigns backed by automated escrow protection.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> Escrow Fund Protection Guard
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-semibold mb-4">For Brands</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/brand/register" className="text-zinc-400 hover:text-white transition-colors">Create Brand Account</Link></li>
              <li><Link to="/explore" className="text-zinc-400 hover:text-white transition-colors">Discover Local Creators</Link></li>
              <li><Link to="/brand/dashboard" className="text-zinc-400 hover:text-white transition-colors">Campaign Analytics</Link></li>
              <li><Link to="/collaborations" className="text-zinc-400 hover:text-white transition-colors">Escrow Payout Protection</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-semibold mb-4">For Creators</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/creator/register" className="text-zinc-400 hover:text-white transition-colors">Create Creator Profile</Link></li>
              <li><Link to="/explore" className="text-zinc-400 hover:text-white transition-colors">Explore Nearby Briefs</Link></li>
              <li><Link to="/creator/dashboard" className="text-zinc-400 hover:text-white transition-colors">Earnings & Match Score</Link></li>
              <li><Link to="/collaborations" className="text-zinc-400 hover:text-white transition-colors">Submit Content Proof</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-semibold mb-4">HQ & Architecture</h4>
            <div className="text-xs space-y-2.5 leading-relaxed text-zinc-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <span>100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Haversine Radius & Meta Graph Engine</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-500 gap-4">
          <div>© 2026 CreatorHub Platform Inc. All rights reserved.</div>
          <div className="flex gap-6 font-medium">
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">Terms of Service</span>
            <Link to="/admin/login" className="hover:text-zinc-300 transition-colors">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
