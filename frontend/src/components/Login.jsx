import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import api from '../api';

const inputClass =
  'w-full bg-[#0B1220] border border-slate-800 rounded-lg pl-10 pr-3 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50';

export default function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data.session?.access_token;

      if (!token) {
        toast.error('Login failed: no session returned.');
        return;
      }

      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px] bg-[#151E31] border border-slate-800 rounded-2xl p-7 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" stroke="#6366F1" strokeWidth="1.5" fill="none" />
              <circle cx="14" cy="14" r="3" fill="#6366F1" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 leading-none">
              fire<span className="text-indigo-400">-expat</span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">
              Financial Independence · Retire Early
            </p>
          </div>
        </div>

        <div className="h-px bg-slate-800 mb-6" />

        <h2 className="text-2xl font-semibold text-slate-100 mb-1">Sign In</h2>
        <p className="text-sm text-slate-500 mb-6">Access your financial command center</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                className={inputClass}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                className={inputClass}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg py-3 mt-2 transition-colors disabled:opacity-60"
          >
            {loading ? 'Authenticating...' : (
              <>Sign In <ArrowRight size={15} /></>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          No account?{' '}
          <Link to="/register" className="text-indigo-400 font-semibold hover:text-indigo-300">
            Create one free
          </Link>
        </p>

        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {['Multi-currency', 'FIRE Calculator', 'Expat-focused'].map((b) => (
            <span key={b} className="text-[10px] text-slate-500 border border-slate-800 rounded-full px-2.5 py-1">
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
