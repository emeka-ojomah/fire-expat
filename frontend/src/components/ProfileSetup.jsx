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
                      ? 'bg-indigo-500/15 border border-indigo-500/50 text-indigo-300'
                      : 'bg-white/5 border border-white/10 text-slate-500'
                }`}
              >
                {step > s.id ? '✓' : s.id}
              </div>
              <span className={`text-xs ${step === s.id ? 'text-indigo-300 font-semibold' : 'text-slate-500'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <Card className="p-6 sm:p-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-100 mb-1">{STEPS[step - 1].title}</h2>
            <p className="text-sm text-slate-500">{STEPS[step - 1].sub}</p>
          </div>
          <div className="h-px bg-slate-800 mb-6" />

          <div className="flex flex-col gap-5">
            {step === 1 && (
              <>
                <Field label="Full Name" hint="As you'd like to be addressed">
                  <input className={inputCls} type="text" placeholder="e.g. Kuro Adeleke"
                    value={profile.full_name} onChange={e => update('full_name', e.target.value)} />
                </Field>
                <Field label="Base Currency" hint="All values will be converted to this currency">
                  <select className={inputCls} value={profile.base_currency}
                    onChange={e => update('base_currency', e.target.value)}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <div className="flex gap-2.5 bg-indigo-500/5 border border-indigo-500/15 rounded-lg px-3.5 py-3">
                  <span className="text-sm shrink-0">💡</span>
                  <span className="text-xs text-slate-400 leading-relaxed">
                    Your base currency unifies all multi-currency transactions into one consistent view.
                  </span>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <Field label={`Current Savings (${profile.base_currency})`} hint="Total savings you have right now">
                  <input className={inputCls} type="number" step="any" placeholder="e.g. 5000"
                    value={profile.current_savings} onChange={e => update('current_savings', e.target.value)} />
                </Field>
                <Field label={`Monthly Expenses (${profile.base_currency})`} hint="Average total monthly spending">
                  <input className={inputCls} type="number" step="any" placeholder="e.g. 1500"
                    value={profile.monthly_expenses} onChange={e => update('monthly_expenses', e.target.value)} />
                </Field>
                {fireTarget && (
                  <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 rounded-xl px-4 py-4 text-center">
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2">Your FIRE Target (25x Rule)</div>
                    <div className="text-2xl font-extrabold text-indigo-300">{profile.base_currency} {fireTarget}</div>
                    <div className="text-[11px] text-slate-500 mt-1.5">Based on monthly expenses × 12 × 25</div>
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <Field label="Expected Annual Return (%)" hint="Typical market average is 7% (nominal)">
                  <div className="flex gap-2.5 items-center">
                    <input className={inputCls} type="number" step="0.1" min="1" max="20"
                      value={profile.expected_return} onChange={e => update('expected_return', e.target.value)} />
                    <div className="shrink-0 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
                      {profile.expected_return}% p.a.
                    </div>
                  </div>
                </Field>
                <Field label="Target Retirement Age" hint="The age you want to reach financial independence">
                  <div className="flex gap-2.5 items-center">
                    <input className={inputCls} type="number" min="30" max="80"
                      value={profile.target_retirement_age} onChange={e => update('target_retirement_age', e.target.value)} />
                    <div className="shrink-0 bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
                      Age {profile.target_retirement_age}
                    </div>
                  </div>
                </Field>
                <Field label="Date of Birth (optional)" hint="Lets the dashboard show a projected FIRE age">
                  <input className={inputCls} type="date" value={profile.date_of_birth}
                    onChange={e => update('date_of_birth', e.target.value)} />
                </Field>
                <Field label="Assumed Inflation Rate (%)" hint="2–3% is a common assumption">
                  <input className={inputCls} type="number" step="0.1" min="0" max="20"
                    value={profile.inflation_rate} onChange={e => update('inflation_rate', e.target.value)} />
                </Field>

                <div className="bg-white/[0.03] border border-slate-800 rounded-xl p-4">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3.5">
                    Profile Summary
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {[
                      ['Name', profile.full_name || '—'],
                      ['Currency', profile.base_currency],
                      ['Savings', `${profile.base_currency} ${parseFloat(profile.current_savings || 0).toLocaleString()}`],
                      ['Monthly Expenses', `${profile.base_currency} ${parseFloat(profile.monthly_expenses || 0).toLocaleString()}`],
                      ['FIRE Target', `${profile.base_currency} ${fireTarget || '—'}`],
                      ['Retire at', `Age ${profile.target_retirement_age}`],
                      ['Inflation', `${profile.inflation_rate || '3.0'}%`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center">
                        <span className="text-[13px] text-slate-500">{k}</span>
                        <span className="text-[13px] font-semibold text-slate-100">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 mt-7">
            {step > 1 && (
              <button onClick={prevStep}
                className="px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 transition-colors">
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={nextStep}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg py-3 transition-colors">
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg py-3 transition-colors disabled:opacity-60">
                {loading ? 'Saving...' : '🚀 Launch My Dashboard'}
              </button>
            )}
          </div>
        </Card>

        <p className="text-center text-xs text-slate-500">
          You can update these settings anytime from Settings.
        </p>
      </div>
    </AuthShell>
  );
}
