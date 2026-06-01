import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaChartLine, FaWallet, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function Navbar({ setIsAuthenticated }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <FaChartLine style={{ fontSize: 13 }} /> },
    { to: '/savings', label: 'Savings', icon: <FaWallet style={{ fontSize: 13 }} /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav style={styles.nav}>
        {/* Logo */}
        <Link to="/dashboard" style={styles.brand}>
          <div style={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L24 8V20L14 26L4 20V8L14 2Z" stroke="#F5C542" strokeWidth="1.5" fill="none"/>
              <circle cx="14" cy="14" r="3" fill="#F5C542"/>
            </svg>
          </div>
          <span style={styles.logoText}>
            fire<span style={styles.logoAccent}>-expat</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div style={styles.links}>
          {navLinks.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              style={{
                ...styles.link,
                ...(isActive(to) ? styles.linkActive : {}),
              }}
            >
              {icon}
              {label}
              {isActive(to) && <span style={styles.activeDot} />}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={styles.right}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <FaSignOutAlt style={{ fontSize: 13 }} />
            <span>Logout</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={styles.hamburger}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          {navLinks.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              style={{
                ...styles.mobileLink,
                ...(isActive(to) ? styles.mobileLinkActive : {}),
              }}
              onClick={() => setMenuOpen(false)}
            >
              {icon} {label}
            </Link>
          ))}
          <button onClick={handleLogout} style={styles.mobileLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      )}
    </>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(10,13,20,0.95)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '0 24px',
    height: 60,
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(20px)',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    background: 'rgba(245,197,66,0.08)',
    border: '1px solid rgba(245,197,66,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 17,
    fontWeight: 800,
    color: '#f0f0f0',
    letterSpacing: '-0.4px',
  },
  logoAccent: { color: '#F5C542' },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '7px 14px',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.45)',
    transition: 'color 0.2s, background 0.2s',
    position: 'relative',
  },
  linkActive: {
    color: '#F5C542',
    background: 'rgba(245,197,66,0.08)',
    fontWeight: 600,
  },
  activeDot: {
    position: 'absolute',
    bottom: -1,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: '#F5C542',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: '7px 14px',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    cursor: 'pointer',
    transition: 'color 0.2s, border-color 0.2s',
    fontFamily: "'DM Sans', sans-serif",
  },
  hamburger: {
    display: 'none',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 18,
    cursor: 'pointer',
    padding: '6px',
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    background: '#0f1420',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '12px 16px',
    fontFamily: "'DM Sans', sans-serif",
  },
  mobileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 14px',
    borderRadius: 10,
    textDecoration: 'none',
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  mobileLinkActive: {
    color: '#F5C542',
    background: 'rgba(245,197,66,0.08)',
  },
  mobileLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 14px',
    borderRadius: 10,
    background: 'transparent',
    border: 'none',
    fontSize: 14,
    color: 'rgba(255,80,80,0.7)',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: "'DM Sans', sans-serif",
  },
};
