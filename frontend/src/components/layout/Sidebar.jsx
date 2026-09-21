import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { LayoutDashboard, Wallet, TrendingUp, PieChart, Settings, LogOut } from 'lucide-react';
import BrandMark from '../ui/BrandMark';

const NAV_ITEMS = [
  { to: '/dashboard',   label: 'Dashboard',           mobileLabel: 'Home',     icon: LayoutDashboard },
  { to: '/savings',     label: 'Savings Tracker',     mobileLabel: 'Savings',  icon: Wallet },
  { to: '/forecast',    label: 'Retirement Forecast', mobileLabel: 'Forecast', icon: TrendingUp },
  { to: '/allocations', label: 'Asset Allocations',   mobileLabel: 'Assets',   icon: PieChart },
  { to: '/settings',    label: 'Settings',            mobileLabel: 'Settings', icon: Settings },
];

export default function Sidebar({ setIsAuthenticated }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <>
      <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 md:sticky md:top-0 md:h-[100dvh] bg-[#0B1220] border-r border-slate-800">
        <div className="flex items-center px-6 h-16 border-b border-slate-800">
          <BrandMark size="sm" />
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              aria-current={isActive(to) ? 'page' : undefined}
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

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0B1220]/95 backdrop-blur-lg border-t border-slate-800 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch">
          {NAV_ITEMS.map(({ to, mobileLabel, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              aria-current={isActive(to) ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] min-w-0 ${
                isActive(to) ? 'text-indigo-400' : 'text-slate-500'
              }`}
            >
              <Icon size={19} strokeWidth={2} />
              <span className="truncate">{mobileLabel}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
