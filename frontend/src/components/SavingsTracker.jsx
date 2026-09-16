import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import api from '../api';
import AppShell from './layout/AppShell';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'AED', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'];

const inputClass =
  'bg-[#0B1220] border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 w-full';

export default function SavingsTracker({ setIsAuthenticated }) {
  const [entries, setEntries] = useState([]);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    entry_type: 'income',
    amount: '',
    currency: 'USD',
    category: '',
    notes: '',
    entry_date: new Date().toISOString().slice(0, 10),
  });
  const [exchangeRate, setExchangeRate] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfileAndEntries();
  }, []);

  useEffect(() => {
    if (form.amount && form.currency && profile?.base_currency && form.currency !== profile.base_currency) {
      fetchExchangeRate();
    } else if (form.currency === profile?.base_currency) {
      setConvertedAmount(parseFloat(form.amount || 0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.amount, form.currency, profile]);

  async function loadProfileAndEntries() {
    try {
      const [profileRes, entriesRes] = await Promise.all([
        api.get('/profile'),
        api.get('/transactions'),
      ]);
      setProfile(profileRes.data);
      setEntries(entriesRes.data || []);
    } catch (err) {
      console.error('Failed to load data', err);
    }
  }

  async function fetchExchangeRate() {
    try {
      const res = await api.get(`/exchange/rate/${form.currency}/${profile.base_currency}`);
      const rate = res.data.rate;
      setExchangeRate(rate);
      setConvertedAmount(parseFloat(form.amount || 0) * rate);
    } catch (err) {
      console.error('Exchange rate fetch failed');
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const baseAmount = convertedAmount !== null ? convertedAmount : parseFloat(form.amount);
    const rateUsed = exchangeRate || 1;

    const newEntry = {
      entry_type: form.entry_type,
      amount: parseFloat(form.amount),
      currency: form.currency,
      base_amount: baseAmount,
      exchange_rate: rateUsed,
      category: form.category,
      notes: form.notes,
      entry_date: form.entry_date,
    };

    try {
      await api.post('/transactions', newEntry);
      setForm({ ...form, amount: '', category: '', notes: '' });
      toast.success('Transaction added');
      loadProfileAndEntries();
    } catch (err) {
      toast.error('Failed to add transaction');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Transaction deleted');
      loadProfileAndEntries();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center text-slate-400 text-sm">
        Loading profile...
      </div>
    );
  }

  return (
    <AppShell setIsAuthenticated={setIsAuthenticated} profile={profile} title="Savings Tracker">
      <div className="space-y-6">
        <div className="bg-[#151E31] border border-slate-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-100 mb-4">Add New Transaction</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              className={inputClass}
              value={form.entry_type}
              onChange={(e) => setForm({ ...form, entry_type: e.target.value })}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input
              type="number"
              step="any"
              placeholder="Amount"
              className={inputClass}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
            <select
              className={inputClass}
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Category (e.g., Salary, Rent)"
              className={inputClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <input
              type="date"
              className={inputClass}
              value={form.entry_date}
              onChange={(e) => setForm({ ...form, entry_date: e.target.value })}
            />
            <input
              type="text"
              placeholder="Notes (optional)"
              className={inputClass}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <div className="md:col-span-3">
              {convertedAmount !== null && form.amount && form.currency !== profile.base_currency && (
                <p className="text-xs text-slate-400 mb-3 tabular-nums">
                  Converted to {profile.base_currency}: {convertedAmount.toFixed(2)} (Rate: {exchangeRate?.toFixed(4)})
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg px-6 py-2.5 w-full md:w-auto transition-colors disabled:opacity-60"
              >
                {loading ? 'Saving...' : 'Add Transaction'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-[#151E31] border border-slate-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-100 mb-4">Transaction History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-slate-800">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Category</th>
                  <th className="py-2 pr-4 font-medium text-right">Amount</th>
                  <th className="py-2 pr-4 font-medium text-right">Base ({profile.base_currency})</th>
                  <th className="py-2 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-800/60">
                    <td className="py-2.5 pr-4 text-slate-300">
                      {new Date(entry.entry_date).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 pr-4 capitalize text-slate-300">{entry.entry_type}</td>
                    <td className="py-2.5 pr-4 text-slate-400">{entry.category || '-'}</td>
                    <td className="py-2.5 pr-4 text-right text-slate-300 tabular-nums">
                      {entry.amount} {entry.currency}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-slate-300 tabular-nums">
                      {/* BUG FIX: base_amount can be null for legacy rows —
                          calling .toFixed on null crashed this cell. */}
                      {entry.base_amount != null ? entry.base_amount.toFixed(2) : '-'}
                    </td>
                    <td className="py-2.5 text-center">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        aria-label="Delete transaction"
                      >
                        <Trash2 size={15} className="inline" />
                      </button>
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">
                      No transactions yet. Add your first one above.
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
