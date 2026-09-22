import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { ShieldCheck, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export const AdminAuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Admin authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#071012] py-12 px-4 flex items-center justify-center text-slate-100">
      <div className="max-w-md w-full bg-[#0c1416] border border-[#1c292c] rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-4">
            <Logo size="lg" />
          </Link>

          <h2 className="font-heading font-extrabold text-2xl text-white">Admin Control Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Platform moderation, verification & financial analytics</p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-300">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#1c292c] bg-[#080f11] text-xs font-semibold text-white focus:outline-none focus:border-pink"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-300">Admin Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#1c292c] bg-[#080f11] text-xs font-semibold text-white focus:outline-none focus:border-pink"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-pink hover:bg-pink-hover text-[#071012] font-bold text-xs shadow-lg shadow-pink/20 flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
          >
            <span>Authenticate Admin Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-[#1c292c] text-center">
          <button
            type="button"
            onClick={() => {
              setEmail('admin@creatorhub.com');
              setPassword('Admin@123');
            }}
            className="text-xs text-pink hover:text-pink-hover font-semibold hover:underline cursor-pointer"
          >
            Click here to auto-fill default admin credentials
          </button>
        </div>
      </div>
    </div>
  );
};
