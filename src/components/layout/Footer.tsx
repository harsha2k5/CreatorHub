import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { ShieldCheck, MapPin, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-[#071012] text-muted text-xs transition-colors">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Logo size="sm" />
        </div>

        {/* Links */}
        <nav className="flex flex-wrap gap-6 text-[11px]">
          <Link to="/creator/login" className="hover:text-white transition">Creators</Link>
          <Link to="/brand/login" className="hover:text-white transition">Brands</Link>
          <Link to="/creator/feed" className="hover:text-white transition">Campaigns</Link>
          <Link to="/about" className="hover:text-white transition">About</Link>
          <Link to="/about#faq" className="hover:text-white transition">FAQ</Link>
          <Link to="/admin/login" className="hover:text-pink transition">Admin Portal</Link>
        </nav>

        {/* Social / Legal */}
        <div className="flex items-center gap-5 text-muted text-[11px]">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-pink transition uppercase text-[10px] font-bold">ig</a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-pink transition uppercase text-[10px] font-bold">in</a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-pink transition uppercase text-[10px] font-bold">yt</a>
          <span className="text-[10px] text-zinc-500">© 2026 CreatorHub. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
