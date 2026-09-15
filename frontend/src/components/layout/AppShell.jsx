import Sidebar from './Sidebar';
import Header from './Header';

export default function AppShell({ setIsAuthenticated, profile, title, children }) {
  return (
    <div className="min-h-screen bg-[#0B1220] md:flex">
      <Sidebar setIsAuthenticated={setIsAuthenticated} />
      <div className="flex-1 min-w-0">
        <Header profile={profile} title={title} />
        <main className="px-4 md:px-8 py-6 pb-24 md:pb-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
