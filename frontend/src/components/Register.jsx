import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import api from '../api';
import AuthShell from './ui/AuthShell';
import Card from './ui/Card';
import BrandMark from './ui/BrandMark';
import Input from './ui/Input';
import Button from './ui/Button';

export default function Register({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { email, password, full_name: fullName });
      const token = res.data.session?.access_token;

      if (!token) {
        toast.success('Check your email to confirm your account, then log in.');
        navigate('/login');
        return;
      }

      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      toast.success('Account created! Complete your profile to get started.');
      navigate('/profile-setup');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Try another email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <Card className="p-6 sm:p-8">
        <div className="mb-6">
          <BrandMark size="lg" withTagline />
        </div>
        <div className="h-px bg-slate-800 mb-6" />

        <h2 className="text-2xl font-semibold text-slate-100 mb-1">Create Account</h2>
        <p className="text-sm text-slate-500 mb-6">Start tracking your FIRE journey</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            icon={User}
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
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
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={password.length > 0 && password.length < 6 ? 'Password must be at least 6 characters' : undefined}
            required
          />
          <Button type="submit" loading={loading}>
            {loading ? 'Creating Account...' : <>Create Account <ArrowRight size={15} /></>}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already a member?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300">
            Sign In
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
