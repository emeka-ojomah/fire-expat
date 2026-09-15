import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { PieChart, Save } from 'lucide-react';
import api from '../../api';
import AppShell from '../layout/AppShell';
import AllocationDonut from '../dashboard/AllocationDonut';

const ASSET_CLASSES = [
  { key: 'stocks', label: 'Stocks' },
  { key: 'real_estate', label: 'Real Estate' },
  { key: 'cash', label: 'Cash' },
  { key: 'bonds', label: 'Bonds' },
  { key: 'other', label: 'Other' },
];

const inputClass =
  'bg-[#0B1220] border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 w-full tabular-nums';

export default function AllocationsPage({ setIsAuthenticated }) {
  const [profile, setProfile] = useState(null);
  const [amounts, setAmounts] = useState(() =>
    Object.fromEntries(ASSET_CLASSES.map((c) => [c.key, '']))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/profile'), api.get('/allocations')])
      .then(([profileRes, allocRes]) => {
        setProfile(profileRes.data);
        const byClass = {};
        (allocRes.data || []).forEach((row) => {
          byClass[row.asset_class] = row.amount?.toString() ?? '';
        });
        setAmounts((prev) => ({ ...prev, ...byClass }));
      })
      .catch((err) => console.error('Failed to load allocations', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const allocations = ASSET_CLASSES.map((c) => ({
        asset_class: c.key,
        amount: parseFloat(amounts[c.key]) || 0,
        currency: profile?.base_currency || 'USD',
      }));
      await api.put('/allocations', { allocations });
      toast.success('Allocations saved');
    } catch (err) {
      toast.error('Failed to save allocations');
    }
    setSaving(false);
  };

  const donutData = ASSET_CLASSES
    .map((c) => ({ name: c.label, value: parseFloat(amounts[c.key]) || 0 }))
    .filter((d) => d.value > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center text-slate-400 text-sm">
        Loading allocations...
      </div>
    );
  }

  return (
    <AppShell setIsAuthenticated={setIsAuthenticated} profile={profile} title="Asset Allocations">
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <form onSubmit={handleSave} className="bg-[#151E31] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-100">
              Current holdings ({profile?.base_currency})
            </h2>
          </div>

          <div className="space-y-3">
            {ASSET_CLASSES.map((c) => (
              <label key={c.key} className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-400 w-28 shrink-0">{c.label}</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0"
                  className={inputClass}
                  value={amounts[c.key]}
                  onChange={(e) => setAmounts((prev) => ({ ...prev, [c.key]: e.target.value }))}
                />
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors disabled:opacity-60"
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Allocations'}
          </button>
        </form>

        <AllocationDonut
          data={donutData}
          currency={profile?.base_currency}
          title="Asset Allocation"
          subtitle="Breakdown of your current holdings"
          emptyMessage="Enter your holdings on the left to see the breakdown."
        />
      </div>
    </AppShell>
  );
}
