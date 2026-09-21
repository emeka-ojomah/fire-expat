import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api';
import AuthShell from './ui/AuthShell';
import Card from './ui/Card';
import BrandMark from './ui/BrandMark';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'AED', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'];

const STEPS = [
  { id: 1, label: 'Identity', title: 'Who are you?', sub: 'Tell us your name and preferred currency' },
  { id: 2, label: 'Finances', title: 'Your finances', sub: 'Current savings and monthly expenses' },
  { id: 3, label: 'FIRE Goal', title: 'Retirement goal', sub: 'Set your FIRE targets and return expectations' },
];

const inputCls =
  'w-full bg-[#0B1220] border border-slate-800 rounded-lg px-3.5 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 box-border';

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      {children}
      {hint && <span className="text-[11px] text-slate-500">{hint}</span>}
    </div>
  );
}

export default function ProfileSetup({ onProfileComplete }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    full_name: '',
    base_currency: 'USD',
    monthly_expenses: '',
    current_savings: '',
    expected_return: '7.0',
    target_retirement_age: '60',
    date_of_birth: '',
    inflation_rate: '3.0',
  });
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/profile');
        if (res.data && res.data.full_name) {
          setProfile({
            full_name: res.data.full_name || '',
            base_currency: res.data.base_currency || 'USD',
            monthly_expenses: res.data.monthly_expenses?.toString() || '',
            current_savings: res.data.current_savings?.toString() || '',
            expected_return: res.data.expected_return?.toString() || '7.0',
            target_retirement_age: res.data.target_retirement_age?.toString() || '60',
            date_of_birth: res.data.date_of_birth || '',
            inflation_rate: res.data.inflation_rate?.toString() || '3.0',
          });
        }
      } catch {
        // no existing profile
      } finally {
        setCheckingProfile(false);
      }
    })();
  }, []);

  const update = (key, value) => setProfile(prev => ({ ...prev, [key]: value }));

  const validateStep = () => {
    if (step === 1) {
      if (!profile.full_name.trim()) { toast.error('Please enter your full name'); return false; }
      if (!profile.base_currency) { toast.error('Please select a currency'); return false; }
    }
    if (step === 2) {
      if (!profile.monthly_expenses || isNaN(profile.monthly_expenses)) { toast.error('Enter valid monthly expenses'); return false; }
      if (!profile.current_savings || isNaN(profile.current_savings)) { toast.error('Enter valid current savings'); return false; }
    }
    if (step === 3) {
      if (!profile.expected_return || isNaN(profile.expected_return)) { toast.error('Enter valid expected return'); return false; }
      if (!profile.target_retirement_age || isNaN(profile.target_retirement_age)) { toast.error('Enter valid retirement age'); return false; }
      if (profile.inflation_rate !== '' && isNaN(profile.inflation_rate)) { toast.error('Enter a valid inflation rate'); return false; }
    }
    return true;
  };

  const nextStep = () => { if (validateStep()) setStep(s => Math.min(s + 1, 3)); };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      await api.put('/profile', {
        full_name: profile.full_name,
        base_currency: profile.base_currency,
        monthly_expenses: parseFloat(profile.monthly_expenses),
        current_savings: parseFloat(profile.current_savings),
        expected_return: parseFloat(profile.expected_return),
        target_retirement_age: parseInt(profile.target_retirement_age),
        date_of_birth: profile.date_of_birth || null,
        inflation_rate: profile.inflation_rate ? parseFloat(profile.inflation_rate) : 3.0,
      });
      toast.success('Profile saved! Welcome to fire-expat.');
      if (onProfileComplete) onProfileComplete();
      navigate('/dashboard');
    } catch {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fireTarget = profile.monthly_expenses
    ? (parseFloat(profile.monthly_expenses) * 12 * 25).toLocaleString(undefined, { maximumFractionDigits: 0 })
    : null;

  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center text-slate-400 text-sm">
        Loading your profile...
      </div>
    );
  }

  return (
    <AuthShell>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <BrandMark size="lg" />
          <p className="text-xs text-slate-500">Step {step} of 3</p>
        </div>

        <div className="h-[3px] bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="flex justify-between">
          {STEPS.map(s => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > s.id
                    ? 'bg-indigo-500 border border-indigo-500 text-white'
                    : step === s.id
                      ? 'bg-indigo-500/15 border border-indigo
