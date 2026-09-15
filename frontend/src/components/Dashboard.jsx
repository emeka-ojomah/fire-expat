import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Wallet, TrendingUp, LineChart as LineChartIcon } from 'lucide-react';
import api from '../api';
import AppShell from './layout/AppShell';
import HeroCard from './dashboard/HeroCard';
import MetricCard from './dashboard/MetricCard';
import NetWorthChart from './dashboard/NetWorthChart';
import AllocationDonut from './dashboard/AllocationDonut';
import QuickActions from './dashboard/QuickActions';
import {
  calculateYearsToFire,
  generateProjection,
  realRateFromNominal,
  calculateAge,
} from '../utils/fireMath';

export default function Dashboard({ setIsAuthenticated }) {
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [fireTarget, setFireTarget] = useState(0);
  const [yearsToFire, setYearsToFire] = useState(null);
  const [avgMonthlySavings, setAvgMonthlySavings] = useState(0);
  const [projectionData, setProjectionData] = useState([]);
  const [currencyAllocation, setCurrencyAllocation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const loadData = useCallback(async (isRecalculate = false) => {
    if (isRecalculate) setRecalculating(true);
    try {
      const [profileRes, txRes] = await Promise.all([
        api.get('/profile'),
        api.get('/transactions'),
      ]);
      const profileData = profileRes.data;
      const txData = txRes.data || [];
      setProfile(profileData);
      setTransactions(txData);

      // Total savings = net of all income/expense entries, converted to base currency.
      const total = txData.reduce(
        (sum, tx) => sum + (tx.entry_type === 'income' ? tx.base_amount : -tx.base_amount),
        0
      );
      setTotalSavings(total);

      // FIRE target = annual expenses * 25 (the "4% rule").
      const target = (profileData.monthly_expenses || 0) * 12 * 25;
      setFireTarget(target);

      // BUG FIX: the old calculation summed every transaction ever recorded
      // and multiplied it by 12, treating all-time totals as if they were a
      // single month. That wildly overstates "annual savings" for anyone
      // with more than a few weeks of history. This instead averages the
      // *net per calendar month* across however many distinct months of
      // data actually exist.
      const monthlyNet = {};
      txData.forEach((tx) => {
        const monthKey = (tx.entry_date || '').slice(0, 7); // "YYYY-MM"
        if (!monthKey) return;
        const signedAmount = tx.entry_type === 'income' ? tx.base_amount : -tx.base_amount;
        monthlyNet[monthKey] = (monthlyNet[monthKey] || 0) + signedAmount;
      });
      const monthKeys = Object.keys(monthlyNet);
      const avgMonthly =
        monthKeys.length > 0
          ? monthKeys.reduce((sum, k) => sum + monthlyNet[k], 0) / monthKeys.length
          : 0;
      setAvgMonthlySavings(avgMonthly);
      const annualSavings = avgMonthly * 12;

      // The FIRE target is in today's dollars, so growth is projected using
      // the *real* (inflation-adjusted) return rather than the raw nominal
      // expected_return — otherwise inflation would silently erode the
      // target's meaning over a multi-decade projection.
      const realRate = realRateFromNominal(profileData.expected_return, profileData.inflation_rate);

      const years = target > 0 ? calculateYearsToFire(total, annualSavings, realRate, target) : null;
      setYearsToFire(years);

      const projection = generateProjection(total, annualSavings, realRate, target);
      setProjectionData(projection);

      // Currency allocation: net position per currency, in that currency's
      // own amount (not the base-currency conversion) — this is real data
      // the backend already tracks.
      const byCurrency = {};
      txData.forEach((tx) => {
        const signedAmount = tx.entry_type === 'income' ? tx.amount : -tx.amount;
        byCurrency[tx.currency] = (byCurrency[tx.currency] || 0) + signedAmount;
      });
      const allocation = Object.entries(byCurrency)
        .filter(([, value]) => value > 0)
        .map(([name, value]) => ({ name, value }));
      setCurrencyAllocation(allocation);

      if (isRecalculate) toast.success('Projections recalculated');
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      if (isRecalculate) toast.error('Recalculation failed');
    } finally {
      setLoading(false);
      setRecalculating(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center text-slate-400 text-sm">
        Loading dashboard...
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center text-slate-400 text-sm">
        Please complete your profile setup.
      </div>
    );
  }

  // BUG FIX: no longer divides by a possibly-zero fireTarget without a
  // guard, and clamps to a sane 0-100+ range before display.
  const progressPercent = fireTarget > 0 ? (totalSavings / fireTarget) * 100 : 0;
  const currency = profile.base_currency;
  const currentAge = calculateAge(profile.date_of_birth);
  const projectedFireAge = currentAge !== null && yearsToFire !== null ? currentAge + yearsToFire : null;
  const realRatePct = realRateFromNominal(profile.expected_return, profile.inflation_rate) * 100;

  return (
    <AppShell setIsAuthenticated={setIsAuthenticated} profile={profile} title="Dashboard">
      <div className="space-y-6">
        {/* Top metric row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <HeroCard
            currency={currency}
            totalSavings={totalSavings}
            fireTarget={fireTarget}
            progressPercent={progressPercent}
          />
          <MetricCard
            icon={Wallet}
            label="Avg. Monthly Savings"
            value={`${currency} ${avgMonthlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            badge={avgMonthlySavings >= 0 ? 'Positive' : 'Negative'}
            badgeTone={avgMonthlySavings >= 0 ? 'emerald' : 'red'}
          />
          <MetricCard
            icon={TrendingUp}
            label="Projected FIRE Age"
            value={projectedFireAge !== null ? projectedFireAge : (yearsToFire !== null ? `${yearsToFire} yrs` : 'N/A')}
            badge={
              projectedFireAge !== null
                ? `in ${yearsToFire} yrs`
                : currentAge === null
                  ? 'Add birthday in Settings'
                  : 'Add income data'
            }
            badgeTone="slate"
          />
          <MetricCard
            icon={LineChartIcon}
            label="Assumed CAGR"
            value={`${(profile.expected_return ?? 0).toFixed(1)}%`}
            badge={`Real: ${realRatePct.toFixed(1)}%`}
            badgeTone="slate"
          />
        </div>

        {/* Main analytics row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
          <div className="xl:col-span-2">
            <NetWorthChart data={projectionData} currency={currency} />
          </div>
          <div className="space-y-4">
            <AllocationDonut data={currencyAllocation} currency={currency} />
            <QuickActions onRecalculate={() => loadData(true)} recalculating={recalculating} />
          </div>
        </div>

        {/* Recent transactions */}
        <div className="bg-[#151E31] border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-100 mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-slate-800">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Category</th>
                  <th className="py-2 pr-4 font-medium text-right">Amount</th>
                  <th className="py-2 font-medium text-right">Base ({currency})</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 10).map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-800/60">
                    <td className="py-2.5 pr-4 text-slate-300">
                      {new Date(tx.entry_date).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 pr-4 capitalize text-slate-300">{tx.entry_type}</td>
                    <td className="py-2.5 pr-4 text-slate-400">{tx.category || '-'}</td>
                    <td className="py-2.5 pr-4 text-right text-slate-300 tabular-nums">
                      {tx.amount} {tx.currency}
                    </td>
                    <td className="py-2.5 text-right text-slate-300 tabular-nums">
                      {tx.base_amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500">
                      No transactions yet. Add some in Savings Tracker.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
        }
