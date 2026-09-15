import { Search, Bell } from 'lucide-react';

export default function Header({ profile, title }) {
  const initials = (profile?.full_name || profile?.email || '?')
    .trim()
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 h-16 px-4 md:px-8 bg-[#0B1220]/90 backdrop-blur-lg border-b border-slate-800">
      <h1 className="text-lg font-semibold text-slate-100 shrink-0 hidden sm:block">
        {title}
      </h1>

      <div className="flex-1 flex items-center gap-3 max-w-md ml-auto">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-[#151E31] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50"
          />
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-[#151E31] border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </button>

        <div className="shrink-0 w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-semibold text-indigo-300">
          {initials}
        </div>
      </div>
    </header>
  );
}
