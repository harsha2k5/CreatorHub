import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { Users, Mail, Lock, User, AtSign, MapPin, ArrowRight, Phone, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const CreatorAuthPage: React.FC = () => {
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(location.pathname.includes('register'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [area, setArea] = useState('Indiranagar');
  const [niche, setNiche] = useState('Food & Beverage');
  const [bio, setBio] = useState('');
  const [minBudget, setMinBudget] = useState('4000');
  const [radiusKm, setRadiusKm] = useState('15');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, login, registerUser, logout } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    setIsRegister(location.pathname.includes('register'));
    setError('');
  }, [location.pathname]);

  if (user) {
    return (
      <div className="min-h-screen bg-[#fafafa] py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-8 text-center space-y-5 shadow-xl text-zinc-900">
          <div className="w-14 h-14 bg-zinc-100 border border-zinc-200 rounded-2xl flex items-center justify-center mx-auto text-zinc-800">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-extrabold text-2xl text-zinc-950">Already Signed In</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Logged in as <strong className="text-zinc-900">{user.email}</strong> ({user.role})
            </p>
          </div>
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => navigate(user.role === 'admin' ? '/admin/dashboard' : user.role === 'brand' ? '/brand/dashboard' : '/creator/dashboard')}
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              Go to {user.role === 'admin' ? 'Admin Console' : user.role === 'brand' ? 'Brand Studio' : 'Creator Studio'} <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => logout()}
              className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Log Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await registerUser({
          role: 'creator',
          email,
          password,
          full_name: fullName,
          username: username || fullName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          social_link: socialLink,
          phone,
          city,
          area,
          categories: [niche],
          bio,
          min_budget: Number(minBudget),
          radius_km: Number(radiusKm)
        });
        navigate('/creator/dashboard');
      } else {
        const loggedUser = await login(email, password);
        if (loggedUser.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (loggedUser.role === 'brand') {
          navigate('/brand/dashboard');
        } else {
          navigate('/creator/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 flex items-center justify-center relative overflow-hidden text-zinc-900">
      <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-8 shadow-xl relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-4">
            <Logo size="lg" />
          </Link>

          <h2 className="text-2xl font-black text-zinc-950">
            {isRegister ? 'Creator Registration' : 'Creator Portal Login'}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            {isRegister
              ? 'Discover paid brand briefs near your neighborhood'
              : 'Access your campaign feed, Instagram analytics & earnings'}
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Credentials Card for Easy Testing */}
        {!isRegister && (
          <div className="mb-5 p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" /> Quick Autofill Credentials
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setEmail('chandanap234@gmail.com');
                  setPassword('Creator@123');
                  setError('');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 hover:border-pink-500 text-left text-[11px] font-medium text-zinc-800 hover:text-pink-600 transition-colors shadow-2xs cursor-pointer truncate"
                title="Fill chandanap234@gmail.com / Creator@123"
              >
                <strong>Chandana</strong> (chandanap234)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('creator@creatorhub.com');
                  setPassword('Creator@123');
                  setError('');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 hover:border-pink-500 text-left text-[11px] font-medium text-zinc-800 hover:text-pink-600 transition-colors shadow-2xs cursor-pointer truncate"
                title="Fill creator@creatorhub.com / Creator@123"
              >
                <strong>Demo Creator</strong>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <>
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Rao"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="ananya_bites"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="Bengaluru"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Neighborhood / Area *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Indiranagar"
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Primary Niche *</label>
                  <select
                    value={niche}
                    onChange={e => setNiche(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  >
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Fitness & Wellness">Fitness & Wellness</option>
                    <option value="Beauty & Skincare">Beauty & Skincare</option>
                    <option value="Dining & Nightlife">Dining & Nightlife</option>
                    <option value="Fashion & Lifestyle">Fashion & Lifestyle</option>
                    <option value="Tech & Gadgets">Tech & Gadgets</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Min Budget (₹)</label>
                  <input
                    type="number"
                    value={minBudget}
                    onChange={e => setMinBudget(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Bio / Profile Summary</label>
                <textarea
                  rows={2}
                  placeholder="Tell local businesses about your content style and audience..."
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Instagram Profile Link</label>
                <input
                  type="text"
                  placeholder="https://instagram.com/your_handle"
                  value={socialLink}
                  onChange={e => setSocialLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                />
              </div>
            </>
          )}

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="ananya@creatorhub.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
            />
          </div>

          <div className={isRegister ? 'grid grid-cols-2 gap-3' : ''}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-zinc-700">Password *</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-zinc-500 hover:text-zinc-900 flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="e.g. Creator@123"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Confirm Password *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold shadow-sm flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50 cursor-pointer"
          >
            <span>{isRegister ? 'Create Profile & Discover Briefs' : 'Log In to Creator Studio'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-zinc-100 text-center">
          <button
            onClick={() => {
              const nextMode = !isRegister;
              setIsRegister(nextMode);
              setError('');
              navigate(nextMode ? '/creator/register' : '/creator/login');
            }}
            className="text-xs text-zinc-900 font-bold hover:underline cursor-pointer"
          >
            {isRegister ? 'Already have an account? Sign in here' : "New to CreatorHub? Create creator profile"}
          </button>
        </div>
      </div>
    </div>
  );
};
