import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [fireTarget, setFireTarget] = useState(0);
  const [yearsToFire, setYearsToFire] = useState(null);
  const [projectionData, setProjectionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [profileRes, txRes] = await Promise.all([
        api.get('/profile'),
        api.get('/transactions')
      ]);
      const profileData = profileRes.data;
      const txData = txRes.data || [];
      setProfile(profileData);
      setTransactions(txData);

      // Calculate total savings (income - expense in base_amount)
      let total = 0;
      txData.forEach(tx => {
        if (tx.entry_type === 'income') total += tx.base_amount;
        else total -= tx.base_amount;
      });
      setTotalSavings(total);

      // FIRE target = monthly expenses * 12 * 25
      const target = profileData.monthly_expenses * 12 * 25;
      setFireTarget(target);

      // Annual savings rate
      let annualIncome = 0, annualExpenses = 0;
      txData.forEach(tx => {
        if (tx.entry_type === 'income') annualIncome += tx.base_amount;
        else annualExpenses += tx.base_amount;
      });
      const annualSavings = (annualIncome - annualExpenses) * 12;

      // Years to FIRE
      const years = calculateYearsToFire(total, annualSavings, profileData.expected_return / 100, target);
      setYearsToFire(years);

      // Projection for 30 years
      const projection = generateProjection(total, annualSavings, profileData.expected_return / 100, target);
      setProjectionData(projection);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  }

  function calculateYearsToFire(current, annualSavings, rate, target) {
    if (annualSavings <= 0) return null;
    let years = 0;
    let balance = current;
    while (balance < target && years < 60) {
      balance = balance * (1 + rate) + annualSavings;
      years++;
    }
    return years;
  }

  function generateProjection(current, annualSavings, rate, target) {
    let balance = current;
    const data = [];
    for (let year = 0; year <= 30; year++) {
      data.push({ year, savings: balance, target });
      balance = balance * (1 + rate) + annualSavings;
    }
    return data;
  }

  if (loading) return <div className="text-center mt-10">Loading dashboard...</div>;
  if (!profile) return <div className="text-center mt-10">Please complete your profile setup.</div>;

  const progressPercent = totalSavings / fireTarget * 100;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Financial Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-100 p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Total Savings</h3>
          <p className="text-2xl">{profile.base_currency} {totalSavings.toLocaleString(undefined, {minimumFractionDigits:2})}</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow">
          <h3 className="text-lg font-semibold">FIRE Target</h3>
          <p className="text-2xl">{profile.base_currency} {fireTarget.toLocaleString(undefined, {minimumFractionDigits:0})}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Progress</h3>
          <p className="text-2xl">{progressPercent.toFixed(1)}%</p>
        </div>
        <div className="bg-purple-100 p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Years to FIRE</h3>
          <p className="text-2xl">{yearsToFire !== null ? yearsToFire : 'N/A'}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-xl font-semibold mb-4">30-Year Projection to FIRE</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={projectionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: `Amount (${profile.base_currency})`, angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `${profile.base_currency} ${value.toLocaleString(undefined, {minimumFractionDigits:0})}`} />
            <Line type="monotone" dataKey="savings" stroke="#3b82f6" name="Projected Savings" strokeWidth={2} />
            <Line type="monotone" dataKey="target" stroke="#ef4444" name="FIRE Target" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr><th className="p-2 text-left">Date</th><th className="p-2 text-left">Type</th><th className="p-2 text-left">Category</th><th className="p-2 text-right">Amount</th><th className="p-2 text-right">Base ({profile.base_currency})</th></tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map(tx => (
                <tr key={tx.id} className="border-b">
                  <td className="p-2">{new Date(tx.entry_date).toLocaleDateString()}</td>
                  <td className="p-2 capitalize">{tx.entry_type}</td>
                  <td className="p-2">{tx.category || '-'}</td>
                  <td className="p-2 text-right">{tx.amount} {tx.currency}</td>
                  <td className="p-2 text-right">{tx.base_amount.toFixed(2)}</td>
                </tr>
              ))}
              {transactions.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-500">No transactions yet. Add some in Savings Tracker.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}