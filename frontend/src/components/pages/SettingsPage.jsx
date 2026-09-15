import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings as SettingsIcon } from 'lucide-react';
import api from '../../api';
import AppShell from '../layout/AppShell';
import { calculateAge } from '../../utils/fireMath';

export default function SettingsPage({ setIsAuthenticated }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/profile').then((res) => setProfile(res.data)).catch(() => {});
  }, []);

  const age = calculateAge(profile?.date_of_birth);

  const rows = profile
    ? [
        ['Full name', profile.full_name],
        ['Base currency', profile.base_currency],
        ['Monthly expenses', `${profile.base_currency} ${profile.monthly_expenses}`],
        ['Expected annual return', `${profile.expected_return}%`],
        ['Assumed inflation rate', `${profile.inflation_rate ?? 3}%`],
        ['Target retirement age', profile.target_retirement_age],
        ['Date of birth', profile.date_of_birth ? `${profile.date_of_birth} (age ${age})` : 'Not set'],
      ]
    : [];

  return (
    <AppShell setIsAuthenticated={setIsAuthenticated} profile={profile} title="Settings">
      <div className="max-w-lg mx-auto mt-6 space-y-4">
        <div className="bg-[#151E31] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-100">Account</h2>
          </div>
          <dl className="divide-y divide-slate-800">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-2.5 text-sm">
                <dt className="text-slate-500">{label}</dt>
                <dd className="text-slate-200 tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <Link
            to="/profile-setup"
            className="mt-4 inline-block text-sm font-medium text-indigo-400 hover:text-indigo-300"
          >
            Edit profile →
          </Link>
        </div>

        <div className="bg-[#151E31] border border-slate-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-100 mb-2">How these are used</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your date of birth powers the "Projected FIRE Age" on the Dashboard and Forecast page.
            Your assumed inflation rate is netted against your expected return so net-worth
            projections are shown in today's {profile?.base_currency || 'currency'} rather than
            inflated future dollars. Update either on the{' '}
            <Link to="/profile-setup" className="text-indigo-400 hover:text-indigo-300">
              profile edit page
            </Link>.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
