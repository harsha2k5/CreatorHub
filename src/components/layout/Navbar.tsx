import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';
import {
  Sparkles,
  Compass,
  Briefcase,
  FolderCheck,
  MessageSquare,
  Bell,
  Sun,
  Moon,
  UserCheck,
  Building2,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Check,
  ExternalLink,
  Users,
  Send,
  Crown
} from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { user, logout, unreadNotifications, activeRole, showToast } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200 text-zinc-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-zinc-200" />
          </div>
          <div>
            <span className="font-heading font-black text-xl text-zinc-950 tracking-tight">
              CreaterHub
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 font-semibold text-xs">
          {user ? (
            <>
              <Link
                to="/creator/feed"
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
                  location.pathname === '/creator/feed'
                    ? 'bg-zinc-100 text-zinc-950 font-bold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <Compass className="w-3.5 h-3.5" /> Discovery Feed
              </Link>

              <Link
                to={user?.role === 'admin' ? '/admin/dashboard' : isBrand ? '/brand/dashboard' : '/creator/dashboard'}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
                  location.pathname.includes('dashboard')
                    ? user?.role === 'admin'
                      ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                      : 'bg-zinc-100 text-zinc-950 font-bold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                {user?.role === 'admin' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-600" /> Admin Console
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
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
                    location.pathname === '/pitch-creators'
                      ? 'bg-zinc-100 text-zinc-950 font-bold'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" /> Direct Pitch
                </Link>
              )}

              <Link
                to="/creator/messages"
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
                  location.pathname.includes('messages')
                    ? 'bg-zinc-100 text-zinc-950 font-bold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> Messages
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                className="px-3.5 py-2 rounded-xl text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/creator/register"
                className="px-3.5 py-2 rounded-xl text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
              >
                For Creators
              </Link>
              <Link
                to="/brand/register"
                className="px-3.5 py-2 rounded-xl text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
              >
                For Brands
              </Link>
              <Link
                to="/creator/feed"
                className="px-3.5 py-2 rounded-xl text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
              >
                Campaigns
              </Link>
            </>
          )}
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {user ? (
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setShowProfileMenu(false);
                }}
                className="relative p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifMenu && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl border border-zinc-200 bg-white shadow-xl p-4 z-50 text-zinc-900">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-950">Notifications</span>
                      {unreadNotifications > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200">
                          {unreadNotifications} new
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-zinc-600 hover:text-zinc-950 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2">
                    {loadingNotifs ? (
                      <div className="p-4 text-center text-xs text-zinc-400">Loading alerts...</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-zinc-400">No alerts yet.</div>
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
                              ? 'bg-zinc-50 border-zinc-300 hover:bg-zinc-100 shadow-xs'
                              : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-bold text-zinc-900 flex items-center gap-1.5 truncate">
                              {n.read_status === 0 && (
                                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                              )}
                              <span className="truncate">{n.title}</span>
                            </div>
                            <span className="text-[10px] text-zinc-400 shrink-0 ml-2">
                              {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-600 leading-relaxed line-clamp-2">{n.message}</p>
                          {n.link && (
                            <div className="mt-2 text-[10px] font-semibold text-zinc-900 flex items-center gap-1">
                              View pitch in Messages →
                            </div>
                          )}
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
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors shadow-xs"
              >
                <img
                  src={
                    (user.profile as any)?.avatar_url ||
                    (user.profile as any)?.logo_url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                  }
                  alt="Avatar"
                  className="w-6 h-6 rounded-full object-cover border border-zinc-200"
                />
                <span className="text-xs font-bold text-zinc-800 hidden sm:inline max-w-[100px] truncate">
                  {(user.profile as any)?.full_name || (user.profile as any)?.company_name || user.email.split('@')[0]}
                </span>
                {user.role === 'admin' ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                    Admin
                  </span>
                ) : !isBrand && (user.profile as any)?.subscription_tier && (user.profile as any)?.subscription_tier !== 'free' ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200">
                    {(user.profile as any)?.subscription_tier}
                  </span>
                ) : null}
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-56 rounded-2xl border border-zinc-200 bg-white shadow-xl p-2 z-50 text-xs font-semibold text-zinc-900">
                  {user.role === 'admin' ? (
                    <div className="p-2 mb-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-rose-600" /> System Administrator
                    </div>
                  ) : !isBrand && (
                    <Link
                      to="/creator/dashboard"
                      onClick={() => setShowProfileMenu(false)}
                      className="p-2 mb-1.5 rounded-xl bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 flex items-center justify-between text-zinc-800 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                        <span className="capitalize font-bold">{(user.profile as any)?.subscription_tier || 'Free'} Member</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 font-bold">Manage ↗</span>
                    </Link>
                  )}

                  <Link
                    to={user.role === 'admin' ? '/admin/dashboard' : isBrand ? '/brand/dashboard' : '/creator/dashboard'}
                    onClick={() => setShowProfileMenu(false)}
                    className="p-2 rounded-xl text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 flex items-center gap-2 transition-colors"
                  >
                    {user.role === 'admin' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-rose-600" /> Admin Portal
                      </>
                    ) : (
                      <>
                        <Briefcase className="w-4 h-4 text-zinc-600" /> Dashboard
                      </>
                    )}
                  </Link>

                  {isBrand && (
                    <Link
                      to="/pitch-creators"
                      onClick={() => setShowProfileMenu(false)}
                      className="p-2 rounded-xl text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 flex items-center gap-2 font-bold transition-colors"
                    >
                      <Send className="w-4 h-4 text-zinc-600" /> Direct Pitch Creators
                    </Link>
                  )}

                  {user.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setShowProfileMenu(false)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" /> Admin Portal
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="w-full p-2 rounded-xl text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-zinc-600" />}
                      <span>Appearance</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      {theme}
                    </span>
                  </button>

                  <hr className="my-1 border-zinc-200" />

                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                      navigate('/');
                    }}
                    className="w-full p-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2 text-left cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/creator/login"
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-950 rounded-xl hover:bg-zinc-100 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/choose-role"
                className="px-4 py-2 text-xs font-semibold text-white rounded-xl bg-zinc-900 hover:bg-zinc-800 shadow-sm transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
