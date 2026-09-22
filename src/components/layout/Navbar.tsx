import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';
import { Logo } from '../common/Logo';
import { resolveBrandLogo, resolveBrandDisplayName } from '../../utils/brandLogos';
import {
  Sparkles,
  Compass,
  Briefcase,
  FolderCheck,
  MessageSquare,
  Bell,
  Search,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Check,
  Send,
  Crown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, unreadNotifications, activeRole, showToast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const isBrand = activeRole === 'brand';

  const fetchNotifications = async () => {
    if (!user) return;
    setLoadingNotifs(true);
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    if (showNotifMenu) {
      fetchNotifications();
    }
  }, [showNotifMenu]);

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read_status: 1 })));
      showToast('All notifications marked as read.');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#071012]/90 backdrop-blur-md border-b border-white/10 text-white transition-all">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center">
          <Logo size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-medium text-muted">
          {user ? (
            <>
              <Link
                to="/creator/feed"
                className={`transition hover:text-white flex items-center gap-1.5 ${
                  location.pathname === '/creator/feed' ? 'text-pink font-semibold' : ''
                }`}
              >
                <Compass className="w-3.5 h-3.5" /> Discovery Feed
              </Link>

              <Link
                to={user?.role === 'admin' ? '/admin/dashboard' : isBrand ? '/brand/dashboard' : '/creator/dashboard'}
                className={`transition hover:text-white flex items-center gap-1.5 ${
                  location.pathname.includes('dashboard') ? 'text-pink font-semibold' : ''
                }`}
              >
                {user?.role === 'admin' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-pink" /> Admin Console
                  </>
                ) : (
                  <>
                    <Briefcase className="w-3.5 h-3.5" /> Dashboard
                  </>
                )}
              </Link>

              {isBrand && (
                <Link
                  to="/pitch-creators"
                  className={`transition hover:text-white flex items-center gap-1.5 ${
                    location.pathname === '/pitch-creators' ? 'text-pink font-semibold' : ''
                  }`}
                >
                  <Send className="w-3.5 h-3.5" /> Direct Pitch
                </Link>
              )}

              <Link
                to="/creator/messages"
                className={`transition hover:text-white flex items-center gap-1.5 ${
                  location.pathname.includes('messages') ? 'text-pink font-semibold' : ''
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> Messages
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/creator/login"
                className={`transition hover:text-white ${
                  location.pathname === '/creator/login' || location.pathname === '/creator/register' ? 'text-pink font-semibold' : ''
                }`}
              >
                Creators
              </Link>
              <Link
                to="/brand/login"
                className={`transition hover:text-white ${
                  location.pathname === '/brand/login' || location.pathname === '/brand/register' ? 'text-pink font-semibold' : ''
                }`}
              >
                Brands
              </Link>
              <Link
                to="/creator/feed"
                className={`transition hover:text-white ${location.pathname === '/creator/feed' ? 'text-pink font-semibold' : ''}`}
              >
                Campaigns
              </Link>
              <Link
                to="/about"
                className={`transition hover:text-white ${location.pathname === '/about' ? 'text-pink font-semibold' : ''}`}
              >
                About
              </Link>
            </>
          )}
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-4 text-[11px]">
          {/* Quick Search Link */}
          <Link
            to="/creator/feed"
            className="text-muted hover:text-white transition p-1.5 rounded-full hover:bg-white/5"
            title="Explore Discovery Feed"
          >
            <Search className="w-4 h-4" />
          </Link>

          {user ? (
            <div className="relative flex items-center gap-2">
              {/* Notifications Button */}
              <button
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setShowProfileMenu(false);
                }}
                className="relative p-2 rounded-full text-muted hover:bg-white/5 hover:text-white transition cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-pink text-[#181012] text-[9px] font-extrabold rounded-full flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifMenu && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl border border-white/15 bg-[#0c1416] shadow-2xl p-4 z-50 text-white animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Notifications</span>
                      {unreadNotifications > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-pink/20 text-pink border border-pink/40">
                          {unreadNotifications} new
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-semibold text-muted hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2">
                    {loadingNotifs ? (
                      <div className="p-4 text-center text-xs text-muted">Loading alerts...</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-muted">No alerts yet.</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setShowNotifMenu(false);
                            if (n.link) navigate(n.link);
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            n.read_status === 0
                              ? 'bg-[#10191a] border-white/20 hover:border-pink/50'
                              : 'bg-transparent border-white/10 text-muted hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-bold text-white flex items-center gap-1.5 truncate">
                              {n.read_status === 0 && (
                                <span className="w-2 h-2 rounded-full bg-pink shrink-0" />
                              )}
                              <span className="truncate">{n.title}</span>
                            </div>
                            <span className="text-[9px] text-muted shrink-0 ml-2">
                              {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted leading-relaxed line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Profile Trigger */}
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifMenu(false);
                }}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-white/20 bg-[#0c1416] hover:border-pink transition cursor-pointer"
              >
                <img
                  src={(() => {
                    const prof: any = user.profile || {};
                    if (user.role === 'brand') {
                      return resolveBrandLogo(prof.company_name, prof.category, user.email, prof.logo_url);
                    }
                    return prof.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                  })()}
                  alt="Avatar"
                  className="w-5 h-5 rounded-full object-cover border border-white/20"
                />
                <span className="text-[11px] font-semibold text-white hidden sm:inline max-w-[100px] truncate">
                  {(() => {
                    const prof: any = user.profile || {};
                    if (user.role === 'brand') {
                      return resolveBrandDisplayName(prof, user.email);
                    }
                    return prof.full_name || user.email.split('@')[0];
                  })()}
                </span>
                <ChevronDown className="w-3 h-3 text-muted" />
              </button>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-56 rounded-2xl border border-white/15 bg-[#0c1416] shadow-2xl p-2 z-50 text-xs font-medium text-white">
                  {user.role === 'admin' ? (
                    <div className="p-2 mb-1.5 rounded-xl bg-pink/10 border border-pink/30 text-pink font-bold flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-pink" /> System Administrator
                    </div>
                  ) : !isBrand && (
                    <Link
                      to="/creator/dashboard"
                      onClick={() => setShowProfileMenu(false)}
                      className="p-2 mb-1.5 rounded-xl bg-[#10191a] border border-white/10 hover:border-pink/40 flex items-center justify-between text-white transition"
                    >
                      <span className="flex items-center gap-1.5 text-xs">
                        <Crown className="w-3.5 h-3.5 text-pink" />
                        <span className="capitalize font-bold">{(user.profile as any)?.subscription_tier || 'Free'} Member</span>
                      </span>
                      <span className="text-[9px] text-pink font-bold">Manage ↗</span>
                    </Link>
                  )}

                  <Link
                    to={user.role === 'admin' ? '/admin/dashboard' : isBrand ? '/brand/dashboard' : '/creator/dashboard'}
                    onClick={() => setShowProfileMenu(false)}
                    className="p-2 rounded-xl text-muted hover:text-white hover:bg-white/5 flex items-center gap-2 transition"
                  >
                    <Briefcase className="w-4 h-4 text-muted" /> Dashboard
                  </Link>

                  {isBrand && (
                    <Link
                      to="/pitch-creators"
                      onClick={() => setShowProfileMenu(false)}
                      className="p-2 rounded-xl text-muted hover:text-white hover:bg-white/5 flex items-center gap-2 transition"
                    >
                      <Send className="w-4 h-4 text-muted" /> Direct Pitch Creators
                    </Link>
                  )}

                  <hr className="my-1 border-white/10" />

                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                      navigate('/');
                    }}
                    className="w-full p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 text-left cursor-pointer transition"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/choose-role"
                className="hidden sm:inline-block text-muted hover:text-white font-medium transition"
              >
                Log in
              </Link>
              <Link
                to="/choose-role"
                className="rounded-full bg-pink px-5 py-2.5 font-semibold text-[#181012] hover:bg-[#ff4d79] transition shadow-md"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/5"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-white/10 bg-[#071012] px-6 py-4 space-y-3 text-xs">
          <Link
            to="/creator/feed"
            onClick={() => setShowMobileMenu(false)}
            className="block py-2 text-muted hover:text-white"
          >
            Explore Creators & Campaigns
          </Link>
          <Link
            to="/creator/login"
            onClick={() => setShowMobileMenu(false)}
            className="block py-2 text-muted hover:text-white"
          >
            Creators (Login Portal)
          </Link>
          <Link
            to="/brand/login"
            onClick={() => setShowMobileMenu(false)}
            className="block py-2 text-muted hover:text-white"
          >
            Brands (Login Portal)
          </Link>
          <Link
            to="/about"
            onClick={() => setShowMobileMenu(false)}
            className="block py-2 text-muted hover:text-white"
          >
            About CreatorHub
          </Link>
          <div className="pt-2 border-t border-white/10 flex gap-2">
            <Link
              to="/choose-role"
              onClick={() => setShowMobileMenu(false)}
              className="flex-1 text-center py-2.5 rounded-full border border-white/20 text-white font-semibold"
            >
              Log In
            </Link>
            <Link
              to="/choose-role"
              onClick={() => setShowMobileMenu(false)}
              className="flex-1 text-center py-2.5 rounded-full bg-pink text-[#181012] font-semibold"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
