import { useNavigate } from 'react-router-dom';
import { PlusCircle, RefreshCw, Percent } from 'lucide-react';

export default function QuickActions({ onRecalculate, recalculating }) {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Update Savings',
      icon: PlusCircle,
      onClick: () => navigate('/savings'),
    },
    {
      label: recalculating ? 'Recalculating...' : 'Recalculate Projections',
      icon: RefreshCw,
      onClick: onRecalculate,
      spinning: recalculating,
    },
    {
      label: 'Adjust Inflation Rate',
      icon: Percent,
      onClick: () => navigate('/settings'),
    },
  ];

  return (
    <div className="bg-[#151E31] border border-slate-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-slate-100 mb-4">Quick Actions</h3>
      <div className="space-y-2">
        {actions.map(({ label, icon: Icon, onClick, spinning }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            disabled={spinning}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-sm transition-colors disabled:opacity-60"
          >
            <Icon size={16} className={spinning ? 'animate-spin' : ''} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
