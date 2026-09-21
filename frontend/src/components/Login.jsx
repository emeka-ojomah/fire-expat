export default function Input({ icon: Icon, label, ...props }) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        )}
        <input
          {...props}
          className="w-full bg-[#0B1220] border border-slate-800 rounded-lg pl-10 pr-3 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50"
        />
      </div>
    </div>
  );
}
