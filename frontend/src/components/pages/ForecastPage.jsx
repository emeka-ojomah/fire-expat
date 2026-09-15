import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Calendar } from 'lucide-react';
import api from '../../api';
import AppShell from '../layout/AppShell';
import MetricCard from '../dashboard/MetricCard';
import {
  calculateYearsToFire,
  realRateFromNominal,
  calculateAge,
} from '../../utils/fireMath';

export default function ForecastPage({ setIsAuthenticated }) {
  const [profile, setProfile] = useState(null);
  const [totals, setTotals] = useState({ totalSavings: 0, annualSavings: 0, fireTarget: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/profile'), api.get('/transactions')])
      .then(([profileRes, txRes]) => {
        const profileData = profileRes.data;
        const txData = txRes.data || [];
        setProfile(profileData);

        const totalSavings = txData.reduce(
          (sum, tx) => sum + (tx.entry_type === 'income' ? tx.base_amount : -tx.base_amount),
          0
        );

        const monthlyNet = {};
        txData.forEach((tx) => {
          const monthKey = (tx.entry_date || '').slice(0, 7);
          if (!monthKey) return;
          const signed = tx.entry_type === 'income' ? tx.base_amount : -tx.base_amount;
          monthlyNet[monthKey] = (monthlyNet[monthKey] || 0) + signed;
        });
        const monthKeys = Object.keys(monthlyNet);
        const avgMonthly =
          monthKeys.length > 0
            ? monthKeys.reduce((sum, k) => sum + monthlyNet[k], 0) / monthKeys.length
            : 0;

        const fireTarget = (profileData.monthly_expenses || 0) * 12 * 25;

        setTotals({ totalSavings, annualSavings: avgMonthly * 12, fireTarget });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center text-slate-400 text-sm">
        Loading forecast...
      </div>
    );
  }

  const currentAge = calculateAge(profile?.date_of_birth);
  const nominalRate = (profile?.expected_return || 0) / 100;
  const realRate = realRateFromNominal(profile?.expected_return, profile?.inflation_rate);

  const yearsNominal = totals.fireTarget > 0
    ? calculateYearsToFire(totals.totalSavings, totals.annualSavings, nominalRate, totals.fireTarget)
    : null;
  const yearsReal = totals.fireTarget > 0
    ? calculateYearsToFire(totals.totalSavings, totals.annualSavings, realRate, totals.fireTarget)
    : null;

  const ageAt = (years) => (currentAge !== null && years !== null ? currentAge + years : null);

  return (
    <AppShell setIsAuthenticated={setIsAuthenticated} profile={profile} title="Retirement Forecast">
      <div className="max-w-3xl mx-auto space-y-4">
        {currentAge === null && (
          <div className="bg-[#151E31] border border-slate-800 rounded-2xl p-4 flex items-center gap-3 text-sm text-slate-400">
            <Calendar size={16} className="text-indigo-400 shrink-0" />
            Add your date of birth in{' '}
            <Link to="/settings" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Settings
            </Link>{' '}
            to see a projected FIRE age instead of just a year count.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#151E31] border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={15} className="text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-100">Best case (nominal return)</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Assumes your {profile?.expected_return}% expected return holds with no inflation drag.
            </p>
            <MetricCard
              label="Years to FIRE"
              value={yearsNominal !== null ? `${yearsNominal} yrs` : 'N/A'}
              badge={ageAt(yearsNominal) !== null ? `Age ${ageAt(yearsNominal)}` : undefined}
              badgeTone="emerald"
            />
          </div>

          <div className="bg-[#151E31] border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={15} className="text-sky-400" />
              <h3 className="text-sm font-semibold text-slate-100">Realistic case (inflation-adjusted)</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Nets your return against a {profile?.inflation_rate ?? 3}% assumed inflation rate — the figure the
              Dashboard chart uses.
            </p>
            <MetricCard
              label="Years to FIRE"
              value={yearsReal !== null ? `${yearsReal} yrs` : 'N/A'}
              badge={ageAt(yearsReal) !== null ? `Age ${ageAt(yearsReal)}` : undefined}
              badgeTone="slate"
            />
          </div>
        </div>

        <div className="bg-[#151E31] border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">How this is calculated</h3>
          <ul className="text-xs text-slate-500 space-y-2 leading-relaxed list-disc pl-4">
            <li>FIRE target = monthly expenses × 12 × 25 (the 4% rule), in today's {profile?.base_currency}.</li>
            <li>Annual savings = your average net monthly income minus expenses × 12, from actual transaction history.</li>
            <li>
              Real return = (1 + {profile?.expected_return}% nominal) ÷ (1 + {profile?.inflation_rate ?? 3}% inflation) − 1,
              which keeps growth comparable to a target expressed in today's money.
            </li>
            <li>Both scenarios stop projecting at 60 years if the target isn't reached by then.</li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
    }
