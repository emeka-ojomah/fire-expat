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
import api from './api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(() => {
          setIsAuthenticated(true);
          // Check if profile is complete
          return api.get('/profile');
        })
        .then((res) => {
          const p = res.data;
          // Profile is complete only if required fields are filled
          const isComplete = !!(
            p?.full_name &&
            p?.base_currency &&
            p?.monthly_expenses != null &&
            p?.current_savings != null
          );
          setProfileComplete(isComplete);
        })
        .catch(() => {
          // If /auth/me fails → bad token, log out
          // If /profile fails → authenticated but no profile yet
          const token = localStorage.getItem('token');
          if (token) {
            // Token is valid but profile doesn't exist
            setIsAuthenticated(true);
            setProfileComplete(false);
          } else {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setProfileComplete(false);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Call this after profile is saved to unlock the dashboard
  const onProfileComplete = () => {
    setProfileComplete(true);
  };

  if (loading) {
    return (
      <div style={loadingStyles.page}>
        <div style={loadingStyles.inner}>
          <div style={loadingStyles.hexWrapper}>
            <svg width="52" height="52" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" stroke="#6366F1" strokeWidth="1.5" fill="none"/>
              <path d="M14 7L20 10.5V17.5L14 21L8 17.5V10.5L14 7Z" fill="#6366F1" fillOpacity="0.15" stroke="#6366F1" strokeWidth="1"/>
              <circle cx="14" cy="14" r="3" fill="#6366F1"/>
            </svg>
          </div>
          <h1 style={loadingStyles.logo}>fire<span style={{ color: '#6366F1' }}>-expat</span></h1>
          <p style={loadingStyles.sub}>Loading your financial workspace...</p>
          <div style={loadingStyles.bar}>
            <div style={loadingStyles.barFill} />
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
            fontFamily: "'Inter', sans-serif",
          },
          success: {
            iconTheme: { primary: '#6366F1', secondary: '#151E31' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#151E31' },
          },
        }}
      />

      <Routes>
        {/* Public routes */}
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

        {/* Profile setup — authenticated but forced before dashboard */}
        <Route
          path="/profile-setup"
          element={
            isAuthenticated
              ? <ProfileSetup onProfileComplete={onProfileComplete} />
              : <Navigate to="/login" />
          }
        />

        {/* Protected routes — require auth AND complete profile */}
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

        {/* Default redirect */}
        <Route
          path="/"
          element={
            <Navigate to={
              !isAuthenticated
                ? '/login'
                : !profileComplete
                  ? '/profile-setup'
                  : '/dashboard'
            } />
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

// Small guard wrapper so each protected route doesn't repeat the same
// three-way ternary (auth -> profile-complete -> render).
function Protected({ isAuthenticated, profileComplete, children }) {
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!profileComplete) return <Navigate to="/profile-setup" />;
  return children;
}

const loadingStyles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0B1220',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  inner: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  hexWrapper: {
    width: 72,
    height: 72,
    borderRadius: 18,
    background: 'rgba(99,102,241,0.08)',
    border: '1px solid rgba(99,102,241,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  logo: {
    fontSize: 26,
    fontWeight: 800,
    color: '#f0f0f0',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  sub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
    margin: 0,
  },
  bar: {
    width: 160,
    height: 2,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  barFill: {
    height: '100%',
    width: '60%',
    background: 'linear-gradient(90deg, #6366F1, #4F46E5)',
    borderRadius: 2,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
};

export default App;
