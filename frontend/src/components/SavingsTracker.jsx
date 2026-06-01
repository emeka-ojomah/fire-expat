import { useState, useEffect } from 'react';
import api from '../api';

export default function SavingsTracker() {
  const [entries, setEntries] = useState([]);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    entry_type: 'income',
    amount: '',
    currency: 'USD',
    category: '',
    notes: '',
    entry_date: new Date().toISOString().slice(0,10)
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
  }, [form.amount, form.currency, profile]);

  async function loadProfileAndEntries() {
    try {
      const [profileRes, entriesRes] = await Promise.all([
        api.get('/profile'),
        api.get('/transactions')
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
      entry_date: form.entry_date
    };

    try {
      await api.post('/transactions', newEntry);
      setForm({ ...form, amount: '', category: '', notes: '' });
      loadProfileAndEntries();
    } catch (err) {
      alert('Failed to add transaction');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        loadProfileAndEntries();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  if (!profile) return <div className="text-center mt-10">Loading profile...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Savings Tracker</h1>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Add New Transaction</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select className="p-2 border rounded" value={form.entry_type} onChange={e => setForm({...form, entry_type: e.target.value})}>
            <option value="income">Income</option><option value="expense">Expense</option>
          </select>
          <input type="number" step="any" placeholder="Amount" className="p-2 border rounded" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
          <select className="p-2 border rounded" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
            <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option>
            <option value="NGN">NGN</option><option value="AED">AED</option><option value="CAD">CAD</option>
            <option value="AUD">AUD</option><option value="JPY">JPY</option><option value="CNY">CNY</option><option value="INR">INR</option>
          </select>
          <input type="text" placeholder="Category (e.g., Salary, Rent)" className="p-2 border rounded" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
          <input type="date" className="p-2 border rounded" value={form.entry_date} onChange={e => setForm({...form, entry_date: e.target.value})} />
          <input type="text" placeholder="Notes (optional)" className="p-2 border rounded" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          <div className="md:col-span-3">
            {convertedAmount !== null && form.amount && form.currency !== profile.base_currency && (
              <p className="text-sm text-gray-600 mb-2">Converted to {profile.base_currency}: {convertedAmount.toFixed(2)} (Rate: {exchangeRate?.toFixed(4)})</p>
            )}
            <button type="submit" disabled={loading} className="bg-blue-500 text-white p-2 rounded w-full md:w-auto px-6">{loading ? 'Saving...' : 'Add Transaction'}</button>
          </div>
        </form>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr><th className="p-2 text-left">Date</th><th className="p-2 text-left">Type</th><th className="p-2 text-left">Category</th><th className="p-2 text-right">Amount</th><th className="p-2 text-right">Base ({profile.base_currency})</th><th className="p-2 text-center">Actions</th></tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id} className="border-b">
                  <td className="p-2">{new Date(entry.entry_date).toLocaleDateString()}</td>
                  <td className="p-2 capitalize">{entry.entry_type}</td>
                  <td className="p-2">{entry.category || '-'}</td>
                  <td className="p-2 text-right">{entry.amount} {entry.currency}</td>
                  <td className="p-2 text-right">{entry.base_amount.toFixed(2)}</td>
                  <td className="p-2 text-center"><button onClick={() => handleDelete(entry.id)} className="text-red-500 hover:underline">Delete</button></td>
                </tr>
              ))}
              {entries.length === 0 && <tr><td colSpan="6" className="p-4 text-center text-gray-500">No transactions yet. Add your first one above.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}