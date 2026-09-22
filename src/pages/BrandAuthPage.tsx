import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { Building2, Mail, Lock, Phone, MapPin, Globe, ArrowRight, CheckCircle2, Sparkles, Image as ImageIcon, Check, Eye, EyeOff } from 'lucide-react';
import { resolveBrandLogo, generateBrandMonogramLogo, PRESET_BRAND_SAMPLES } from '../utils/brandLogos';

export const BrandAuthPage: React.FC = () => {
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(location.pathname.includes('register'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Beauty & Skincare');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [description, setDescription] = useState('');
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [showCustomLogoInput, setShowCustomLogoInput] = useState(false);
  const [error, setError] = useState('');

  const { user, login, registerUser, logout } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    setIsRegister(location.pathname.includes('register'));
    setError('');
  }, [location.pathname]);

  // Auto-suggest category if brand name matches known keywords
  useEffect(() => {
    if (!isRegister) return;
    const lower = companyName.toLowerCase();
    if (lower.includes('himalaya') || lower.includes('mamaearth') || lower.includes('plum') || lower.includes('sugar') || lower.includes('nykaa') || lower.includes('lakme') || lower.includes('derma')) {
      setCategory('Beauty & Skincare');
    } else if (lower.includes('blue tokai') || lower.includes('third wave') || lower.includes('starbucks') || lower.includes('coffee') || lower.includes('chai') || lower.includes('cafe') || lower.includes('zomato') || lower.includes('swiggy')) {
      setCategory('Food & Beverage');
    } else if (lower.includes('cult') || lower.includes('decathlon') || lower.includes('gym') || lower.includes('fitness')) {
      setCategory('Fitness & Sports');
    } else if (lower.includes('boat') || lower.includes('noise') || lower.includes('apple') || lower.includes('tech') || lower.includes('saas')) {
      setCategory('Technology');
    } else if (lower.includes('myntra') || lower.includes('souled') || lower.includes('zara') || lower.includes('clothing') || lower.includes('fashion')) {
      setCategory('Fashion & Apparel');
    }
  }, [companyName, isRegister]);

  const activeLogo = resolveBrandLogo(companyName, category, email, customLogoUrl);

  if (user) {
    return (
      <div className="min-h-screen bg-[#fafafa] py-12 px-4 flex items-center justify-center text-zinc-900">
        <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-8 text-center space-y-5 shadow-xl">
          <div className="w-14 h-14 bg-zinc-100 border border-zinc-200 rounded-2xl flex items-center justify-center mx-auto text-zinc-800">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-2xl text-zinc-950">
              Already Signed In
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              You are currently logged in as <strong className="text-zinc-900">{(user.profile as any)?.company_name || (user.profile as any)?.full_name || user.email}</strong> ({user.email}).
            </p>
          </div>
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => navigate(user.role === 'brand' ? '/brand/dashboard' : '/creator/dashboard')}
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              Go to {user.role === 'brand' ? 'Brand' : 'Creator'} Dashboard <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => logout()}
              className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl cursor-pointer transition-all"
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
    try {
      if (isRegister) {
        await registerUser({
          role: 'brand',
          email,
          password,
          company_name: companyName,
          phone,
          category,
          city,
          state,
          description,
          logo_url: customLogoUrl.trim() || activeLogo
        });
      } else {
        const loggedUser = await login(email, password);
        if (loggedUser.role === 'admin') {
          navigate('/admin/dashboard');
          return;
        }
      }
      navigate('/brand/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 flex items-center justify-center text-zinc-900">
      <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center justify-center mb-4">
            <Logo size="lg" />
          </Link>

          <h2 className="font-heading font-extrabold text-2xl text-zinc-950">
            {isRegister ? 'Register Brand Account' : 'Brand Login Portal'}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            {isRegister ? 'Post briefs & discover local creators near your business' : 'Access your active campaigns & creator applications'}
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Company / Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Himalaya, Mamaearth, Cult.fit, boAt"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-xs font-medium focus:outline-none focus:border-zinc-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Business Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-xs font-medium focus:outline-none focus:border-zinc-900 focus:bg-white cursor-pointer"
                  >
                    <option value="Beauty & Skincare">Beauty & Skincare</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Fitness & Sports">Fitness & Sports</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Technology">Technology</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Bengaluru"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-xs font-medium focus:outline-none focus:border-zinc-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Dynamic Brand Logo & Visual Card */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                    <span className="text-[11px] font-bold text-zinc-800">
                      Brand Visual & Logo Preview
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCustomLogoInput(!showCustomLogoInput)}
                    className="text-[10px] text-pink-600 hover:text-pink-700 font-bold hover:underline cursor-pointer"
                  >
                    {showCustomLogoInput ? 'Hide URL input' : 'Custom Image URL'}
                  </button>
                </div>

                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-zinc-200">
                  <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center p-1 shrink-0 shadow-xs overflow-hidden">
                    <img
                      src={activeLogo}
                      alt={companyName || 'Brand Visual'}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = generateBrandMonogramLogo(companyName, category);
                      }}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-zinc-900 truncate">
                      {companyName ? companyName : 'Your Brand Name'}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {companyName.toLowerCase().includes('himalaya')
                        ? 'Official Himalaya Brand Logo'
                        : companyName.trim()
                        ? `Official Logo / Badge for ${companyName}`
                        : `Category Brand Badge`}
                    </div>
                  </div>
                </div>

                {showCustomLogoInput && (
                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder="Paste direct logo URL (https://...)"
                      value={customLogoUrl}
                      onChange={e => setCustomLogoUrl(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                )}
              </div>
            </>
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
                  setEmail('himalayacare@gmail.com');
                  setPassword('Brand@123');
                  setError('');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 hover:border-pink-500 text-left text-[11px] font-medium text-zinc-800 hover:text-pink-600 transition-colors shadow-2xs cursor-pointer truncate"
                title="Fill himalayacare@gmail.com / Brand@123"
              >
                <strong>Himalaya</strong>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('brand@creatorhub.com');
                  setPassword('Brand@123');
                  setError('');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 hover:border-pink-500 text-left text-[11px] font-medium text-zinc-800 hover:text-pink-600 transition-colors shadow-2xs cursor-pointer truncate"
                title="Fill brand@creatorhub.com / Brand@123"
              >
                <strong>Demo Brand</strong>
              </button>
            </div>
          </div>
        )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Business Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="contact@himalaya.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-xs font-medium focus:outline-none focus:border-zinc-900 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-700">Password</label>
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
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-xs font-medium focus:outline-none focus:border-zinc-900 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
          >
            <span>{isRegister ? 'Complete Brand Registration' : 'Log In to Brand Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-col gap-2">
          <button
            onClick={() => {
              const nextMode = !isRegister;
              setIsRegister(nextMode);
              setError('');
              navigate(nextMode ? '/brand/register' : '/brand/login');
            }}
            className="text-xs text-zinc-900 font-bold text-center hover:underline cursor-pointer"
          >
            {isRegister ? 'Already have a brand account? Log in' : "Don't have a brand account? Register here"}
          </button>
        </div>
      </div>
    </div>
  );
};
