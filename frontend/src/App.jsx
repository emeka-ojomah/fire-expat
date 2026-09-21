import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Register from './components/Register';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import SavingsTracker from './components/SavingsTracker';
import ForecastPage from './components/pages/ForecastPage';
import AllocationsPage from './components/pages/AllocationsPage';
import SettingsPage from './components/pages/SettingsPage';
import BrandMark from './components/ui/BrandMark';
import api from './api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        await api.get('/auth/me');
        setIsAuthenticated(true);

        try {
          const res = await api.get('/profile');
          const p = res.data;
          const isComplete = !!(
            p?.full_name &&
            p?.base_currency &&
            p?.monthly_expenses != null &&
            p?.current_savings != null
          );
          setProfileComplete(isComplete);
        } catch {
          setProfileComplete(false);
        }
      } catch {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setProfileComplete(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) setProfileComplete(false);
  }, [isAuthenticated]);

  const onProfileComplete = () => setProfileComplete(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandMark size="lg" withTagline />
          <p className="text-xs text-slate-500 mt-2">Loading your financial workspace…</p>
          <div className="w-40 h-0.5 bg-white/5 rounded-full overflow-hidden mt-2">
            <div className="h-full w-3/5 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#151E31',
            color: '#f0f0f0',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#6366F1', secondary: '#151E31' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#151E31' } },
        }}
      />

      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated
              ? <Login setIsAuthenticated={setIsAuthenticated} />
              : <Navigate to={profileComplete ? '/dashboard' : '/profile-setup'} />
          }
        />
        <Route
          path="/register"
          element={
            !isAuthenticated
              ? <Register setIsAuthenticated={setIsAuthenticated} />
              : <Navigate to="/profile-setup" />
          }
        />
        <Route
          path="/profile-setup"
          element={
            isAuthenticated
              ? <ProfileSetup onProfileComplete={onProfileComplete} />
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/dashboard"
          element={<Protected isAuthenticated={isAuthenticated} profileComplete={profileComplete}>
            <Dashboard setIsAuthenticated={setIsAuthenticated} />
          </Protected>}
        />
        <Route
          path="/savings"
          element={<Protected isAuthenticated={isAuthenticated} profileComplete={profileComplete}>
            <SavingsTracker setIsAuthenticated={setIsAuthenticated} />
          </Protected>}
        />
        <Route
          path="/forecast"
          element={<Protected isAuthenticated={isAuthenticated} profileComplete={profileComplete}>
            <ForecastPage setIsAuthenticated={setIsAuthenticated} />
          </Protected>}
        />
        <Route
          path="/allocations"
          element={<Protected isAuthenticated={isAuthenticated} profileComplete={profileComplete}>
            <AllocationsPage setIsAuthenticated={setIsAuthenticated} />
          </Protected>}
        />
        <Route
          path="/settings"
          element={<Protected isAuthenticated={isAuthenticated} profileComplete={profileComplete}>
            <SettingsPage setIsAuthenticated={setIsAuthenticated} />
          </Protected>}
        />

        <Route
          path="/"
          element={
            <Navigate to={
              !isAuthenticated ? '/login' : !profileComplete ? '/profile-setup' : '/dashboard'
            } />
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

function Protected({ isAuthenticated, profileComplete, children }) {
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!profileComplete) return <Navigate to="/profile-setup" />;
  return children;
}

export default App;
