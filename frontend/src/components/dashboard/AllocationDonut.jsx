import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#4F46E5', '#0EA5E9', '#F5C542', '#10B981', '#EC4899', '#8B5CF6'];

export default function AllocationDonut({
  data = [],
  currency,
  title = 'Currency Allocation',
  subtitle = 'Net savings by transaction currency',
  emptyMessage = 'No transactions yet — add some in Savings Tracker.',
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-[#151E31] border border-slate-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-slate-100 mb-0.5">{title}</h3>
      <p className="text-xs text-slate-500 mb-4">{subtitle}</p>

      {total === 0 ? (
        <p className="text-xs text-slate-500 py-10 text-center">{emptyMessage}</p>
      ) : (
        <>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={3}
                  stroke="none"
                >
                  {data.map((entry, i) => (
                    <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${currency} ${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                    name,
                  ]}
                  contentStyle={{
                    background: '#0B1220',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2">
            {data.map((entry, i) => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {entry.name}
                </span>
                <span className="text-slate-300 tabular-nums">
                  {((entry.value / total) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
