import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Mail, Lock, Phone, MapPin, Globe, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export const BrandAuthPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Food & Beverage');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const { user, login, registerUser, logout } = useAuth();
  const navigate = useNavigate();

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
          description
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
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center font-black text-white text-base shadow-xs">
              <Sparkles className="w-4 h-4 text-zinc-200" />
            </div>
            <span className="text-lg font-black text-zinc-950 tracking-tight">CreaterHub</span>
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
                  placeholder="e.g. CCD Indiranagar"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-xs font-medium focus:outline-none focus:border-zinc-900 focus:bg-white"
                  >
                    <option>Food & Beverage</option>
                    <option>Fitness & Sports</option>
                    <option>Fashion & Apparel</option>
                    <option>Beauty & Skincare</option>
                    <option>Software & SaaS</option>
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
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Business Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="marketing@ccd.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-xs font-medium focus:outline-none focus:border-zinc-900 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="password"
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
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-zinc-900 font-bold text-center hover:underline cursor-pointer"
          >
            {isRegister ? 'Already have a brand account? Log in' : "Don't have a brand account? Register here"}
          </button>
        </div>
      </div>
    </div>
  );
};
