export function AuthShell({ children }) {
  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px]">{children}</div>
    </div>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#151E31] border border-slate-800 rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
        <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
          <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" stroke="#6366F1" strokeWidth="1.5" fill="none" />
          <circle cx="14" cy="14" r="3" fill="#6366F1" />
        </svg>
      </div>
      <div>
        <h1 className="text-lg font-bold text-slate-100 leading-none">
          fire<span className="text-indigo-400">-expat</span>
        </h1>
        <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">
          Financial Independence · Retire Early
        </p>
      </div>
    </div>
  );
}
