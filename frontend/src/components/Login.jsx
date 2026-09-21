import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import api from '../api';
import AuthShell from './ui/AuthShell';
import Card from './ui/Card';
import BrandMark from './ui/BrandMark';
import Input from './ui/Input';
import Button from './ui/Button';

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
    <AuthShell>
      <Card className="p-7 sm:p-8">
        <div className="mb-6">
          <BrandMark size="lg" withTagline />
        </div>
        <div className="h-px bg-slate-800 mb-6" />

        <h2 className="text-2xl font-semibold text-slate-100 mb-1">Sign In</h2>
        <p className="text-sm text-slate-500 mb-6">Access your financial command center</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            icon={Mail}
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            icon={Lock}
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" loading={loading}>
            {loading ? 'Authenticating...' : <>Sign In <ArrowRight size={15} /></>}
          </Button>
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
      </Card>
    </AuthShell>
  );
}
