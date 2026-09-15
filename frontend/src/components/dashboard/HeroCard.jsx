import { Target } from 'lucide-react';

export default function HeroCard({ currency, totalSavings, fireTarget, progressPercent }) {
  const clamped = Math.min(100, Math.max(0, progressPercent));
  const fmt = (n) =>
    n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-5 flex flex-col gap-4 text-white relative overflow-hidden">
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
      <div className="flex items-center justify-between relative">
        <span className="text-xs font-medium text-indigo-100">Net Worth Progress</span>
        <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
          <Target size={15} />
        </div>
      </div>

      <div className="relative">
        <div className="text-2xl font-semibold tabular-nums leading-none">
          {currency} {fmt(totalSavings)}
        </div>
        <div className="text-xs text-indigo-200 mt-1.5 tabular-nums">
          of {currency} {fmt(fireTarget)} target
        </div>
      </div>

      <div className="relative">
        <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{ width: `${clamped}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-white/15 text-white">
            {clamped.toFixed(1)}% funded
          </span>
        </div>
      </div>
    </div>
  );
}
