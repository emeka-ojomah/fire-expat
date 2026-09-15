export default function MetricCard({ icon: Icon, label, value, badge, badgeTone = 'emerald' }) {
  const badgeTones = {
    emerald: 'bg-emerald-500/10 text-emerald-400',
    red: 'bg-red-500/10 text-red-400',
    slate: 'bg-slate-500/10 text-slate-400',
  };

  return (
    <div className="bg-[#151E31] border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
            <Icon size={15} />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-semibold text-slate-100 tabular-nums leading-none">
          {value}
        </span>
        {badge && (
          <span className={`text-[11px] font-medium px-2 py-1 rounded-full whitespace-nowrap ${badgeTones[badgeTone]}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
