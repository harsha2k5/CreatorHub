import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 flex items-center justify-center text-zinc-900">
      <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center font-black text-white text-base shadow-xs">
              <Sparkles className="w-4 h-4 text-zinc-200" />
            </div>
            <span className="text-lg font-black text-zinc-950 tracking-tight">CreaterHub</span>
          </Link>

          <h2 className="font-heading font-extrabold text-2xl text-zinc-950">Admin Control Portal</h2>
          <p className="text-xs text-zinc-500 mt-1">Platform moderation, verification & financial analytics</p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-zinc-700">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-zinc-700">Admin Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
          >
            <span>Authenticate Admin Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-zinc-100 text-center">
          <button
            type="button"
            onClick={() => {
              setEmail('admin@creatorhub.com');
              setPassword('Admin@123');
            }}
            className="text-xs text-zinc-900 hover:text-zinc-700 font-bold hover:underline cursor-pointer"
          >
            Click here to auto-fill default admin credentials
          </button>
        </div>
      </div>
    </div>
  );
};
