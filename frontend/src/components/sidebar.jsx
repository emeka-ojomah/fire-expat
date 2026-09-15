import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  PieChart,
  Settings,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/savings', label: 'Savings Tracker', icon: Wallet },
  { to: '/forecast', label: 'Retirement Forecast', icon: TrendingUp },
  { to: '/allocations', label: 'Asset Allocations', icon: PieChart },
  { to: '/settings', label: 'Settings', icon: Settings },
];

/**
 * Desktop: fixed vertical sidebar (>= md).
 * Mobile: fixed bottom tab bar (< md) — rendered by the same component so
 * active-state logic lives in one place.
 */
export default function Sidebar({ setIsAuthenticated }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 md:h-screen md:sticky md:top-0 bg-[#0B1220] border-r border-slate-800">
        <div className="flex items-center gap-2.5 px-6 h-16 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" stroke="#6366F1" strokeWidth="1.5" fill="none" />
              <circle cx="14" cy="14" r="3" fill="#6366F1" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-slate-100 tracking-tight">
            fire<span className="text-indigo-400">-expat</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(to)
                  ? 'bg-indigo-500/10 text-indigo-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <LogOut size={17} strokeWidth={2} />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0B1220]/95 backdrop-blur-lg border-t border-slate-800 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between px-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] ${
                isActive(to) ? 'text-indigo-400' : 'text-slate-500'
              }`}
            >
              <Icon size={19} strokeWidth={2} />
              <span className="truncate max-w-[56px]">{label.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
      }
